"""
Stage 1 fallback: Financial Modeling Prep (FMP).

Only used if Finviz is unreachable or returns nothing (see screener.py), or
if STOCK_PICKER_PROVIDER=fmp / --provider fmp is set explicitly. Needs an
FMP_API_KEY (a free-tier key works for the endpoints used here, though free
tiers are rate-limited - keep FMP_REQUEST_DELAY_SECONDS conservative).

FMP doesn't expose every field 1:1 with Finviz's screener, so two of these
are approximations rather than exact equivalents - worth checking against
another source before you trust them:

- "ROI" is taken from FMP's returnOnCapitalEmployedTTM (ROCE), the closest
  analogue FMP publishes to Finviz's "Return on Investment". They are not
  defined identically.
- "Net income (TTM)" is summed from the last four reported quarterly income
  statements rather than pulled from a single pre-computed TTM field.

This path is untested against live data in this session (the sandbox has no
network route to FMP) - treat it as a documented best-effort fallback, and
sanity-check its first real run against a couple of tickers you know well.
"""

from __future__ import annotations

import logging
import time

import requests

from stock_picker import config
from stock_picker.models import FundamentalRow

logger = logging.getLogger(__name__)

BASE_URL = "https://financialmodelingprep.com/api/v3"


def _get(path: str, **params) -> object:
    if not config.FMP_API_KEY:
        raise RuntimeError(
            "FMP_API_KEY is not set. Export it, or add it to .env, to use "
            "the Financial Modeling Prep fallback."
        )
    params["apikey"] = config.FMP_API_KEY
    resp = requests.get(f"{BASE_URL}/{path}", params=params, timeout=20)
    resp.raise_for_status()
    time.sleep(config.FMP_REQUEST_DELAY_SECONDS)
    return resp.json()


def _screener_universe(limit: int) -> list[dict]:
    params = {
        "marketCapMoreThan": config.MARKET_CAP_MIN,
        "isEtf": "false",
        "isFund": "false",
        "isActivelyTrading": "true",
        "limit": limit,
    }
    if config.COUNTRY_FILTER:
        params["country"] = "US" if config.COUNTRY_FILTER == "USA" else config.COUNTRY_FILTER
    data = _get("stock-screener", **params)
    return data if isinstance(data, list) else []


def _first(data: object) -> dict | None:
    if isinstance(data, list) and data:
        return data[0]
    return None


def _ttm_net_income(symbol: str) -> float | None:
    data = _get("income-statement", symbol=symbol, period="quarter", limit=4)
    if not isinstance(data, list) or len(data) < 4:
        return None
    try:
        return sum(float(q["netIncome"]) for q in data[:4])
    except (KeyError, TypeError, ValueError):
        return None


def _eps_growth_estimates(symbol: str, current_eps: float | None) -> tuple[
    float | None, float | None
]:
    """Return (this_year_growth, next_year_growth) from analyst EPS estimates."""
    data = _get("analyst-estimates", symbol=symbol, period="annual", limit=3)
    if not isinstance(data, list) or len(data) < 2 or current_eps in (None, 0):
        return None, None
    # FMP returns most-recent-first.
    try:
        this_year_est = float(data[0]["estimatedEpsAvg"])
        next_year_est = float(data[1]["estimatedEpsAvg"])
    except (KeyError, TypeError, ValueError, IndexError):
        return None, None
    this_year_growth = (this_year_est - current_eps) / abs(current_eps)
    next_year_growth = (next_year_est - this_year_est) / abs(this_year_est) if this_year_est else None
    return this_year_growth, next_year_growth


def _fetch_one(symbol: str) -> FundamentalRow | None:
    profile = _first(_get("profile", symbol=symbol))
    ratios = _first(_get("ratios-ttm", symbol=symbol))
    key_metrics = _first(_get("key-metrics-ttm", symbol=symbol))
    if profile is None:
        return None

    current_eps = profile.get("eps")
    this_year_growth, next_year_growth = _eps_growth_estimates(symbol, current_eps)

    row = FundamentalRow(
        ticker=symbol,
        company=profile.get("companyName"),
        sector=profile.get("sector"),
        market_cap=profile.get("mktCap"),
        peg=(ratios or {}).get("pegRatioTTM"),
        net_income=_ttm_net_income(symbol),
        roa=(ratios or {}).get("returnOnAssetsTTM"),
        roe=(ratios or {}).get("returnOnEquityTTM"),
        roi=(ratios or {}).get("returnOnCapitalEmployedTTM")
        or (key_metrics or {}).get("roicTTM"),
        debt_equity=(ratios or {}).get("debtEquityRatioTTM"),
        quick_ratio=(ratios or {}).get("quickRatioTTM"),
        current_ratio=(ratios or {}).get("currentRatioTTM"),
        eps_growth_this_year=this_year_growth,
        eps_growth_next_year=next_year_growth,
        # FMP's free tier has no standard 5-year forward EPS growth estimate
        # equivalent to Finviz's; left None so it's excluded and logged as
        # missing, same as Finviz stocks that lack this field.
        eps_growth_next_5_years=None,
    )
    return row


def fetch_fmp_universe(limit: int = 1000) -> list[FundamentalRow]:
    candidates = _screener_universe(limit=limit)
    rows: list[FundamentalRow] = []
    for candidate in candidates:
        symbol = candidate.get("symbol")
        if not symbol:
            continue
        try:
            row = _fetch_one(symbol)
        except Exception as exc:
            logger.warning("FMP fetch failed for %s: %s", symbol, exc)
            continue
        if row is not None:
            rows.append(row)
    return rows
