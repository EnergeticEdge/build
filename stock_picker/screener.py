"""
Stage 1: the fundamental screen.

Primary path is Finviz (via `finvizfinance`), which natively supports
almost every filter we need. Finviz's own filter buckets are coarse
(discrete steps like "Over 1.5" / "Under 0.4"), so we use them only to pull
back a superset of candidates cheaply; every threshold in config.py is then
re-applied exactly, in code, against Finviz's own numeric columns. Net
income isn't a native Finviz filter at all, so it's applied the same way,
purely in code, using the "Income" column.

If Finviz is unreachable or returns nothing usable, `run_screen` falls back
to Financial Modeling Prep's screener + per-ticker ratios (see
`fmp_screener.py`), controlled by `config.FUNDAMENTAL_PROVIDER` or an
explicit `provider=` argument.
"""

from __future__ import annotations

import logging

import pandas as pd

from stock_picker import config
from stock_picker.models import ExclusionRecord, FundamentalRow

logger = logging.getLogger(__name__)

# Position-ordered canonical names for the Finviz custom-screener columns we
# request. Renaming by position (rather than trusting Finviz's on-page
# header text to match a hardcoded string) keeps this robust to Finviz
# wording differences between versions of the page.
_FINVIZ_COLUMN_IDS = [1, 2, 3, 6, 9, 17, 18, 20, 32, 33, 34, 35, 36, 38, 65, 78]
_FINVIZ_CANONICAL_NAMES = [
    "No.",
    "Ticker",
    "Company",
    "Sector",
    "MarketCap",
    "PEG",
    "EPSThisYear",
    "EPSNextYear",
    "EPSNext5Years",
    "ROA",
    "ROE",
    "ROI",
    "CurrentRatio",
    "QuickRatio",
    "DebtEquity",
    "Price",
    "Income",
]

# Coarse Finviz filters: loose supersets of the real thresholds in
# config.py, used only to keep the scrape small. The exact cutoffs are
# enforced afterwards in _apply_exact_thresholds.
_FINVIZ_FILTERS = {
    "PEG": "Under 2",
    "Market Cap.": "+Mid (over $2bln)",
    "Return on Assets": "Over +5%",
    "Return on Equity": "Over +5%",
    "Return on Investment": "Over +5%",
    "Current Ratio": "Over 1.5",
    "Quick Ratio": "Over 0.5",
    "Debt/Equity": "Under 0.5",
    "EPS growththis year": "Over 5%",
    "EPS growthnext year": "Over 5%",
    "EPS growthnext 5 years": "Over 5%",
}


def _fetch_finviz_universe(limit: int) -> pd.DataFrame:
    from finvizfinance.screener.custom import Custom

    filters = dict(_FINVIZ_FILTERS)
    if config.COUNTRY_FILTER:
        filters["Country"] = config.COUNTRY_FILTER

    screener = Custom()
    screener.set_filter(filters_dict=filters)
    df = screener.screener_view(
        columns=list(_FINVIZ_COLUMN_IDS),
        limit=limit,
        sleep_sec=config.FINVIZ_PAGE_SLEEP_SECONDS,
        verbose=0,
    )
    if df is None or df.empty:
        return pd.DataFrame(columns=_FINVIZ_CANONICAL_NAMES)

    df = df.copy()
    df.columns = _FINVIZ_CANONICAL_NAMES[: len(df.columns)]
    return df


def _income_to_float(value) -> float | None:
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip()
    if not text or text == "-":
        return None
    from finvizfinance.util import number_convert

    try:
        return number_convert(text)
    except (ValueError, IndexError):
        return None


def _row_to_fundamental(row: pd.Series) -> FundamentalRow:
    return FundamentalRow(
        ticker=str(row.get("Ticker", "")).strip(),
        company=row.get("Company"),
        sector=row.get("Sector"),
        market_cap=row.get("MarketCap"),
        peg=row.get("PEG"),
        net_income=_income_to_float(row.get("Income")),
        roa=row.get("ROA"),
        roe=row.get("ROE"),
        roi=row.get("ROI"),
        debt_equity=row.get("DebtEquity"),
        quick_ratio=row.get("QuickRatio"),
        current_ratio=row.get("CurrentRatio"),
        eps_growth_this_year=row.get("EPSThisYear"),
        eps_growth_next_year=row.get("EPSNextYear"),
        eps_growth_next_5_years=row.get("EPSNext5Years"),
    )


# Field name, human label, and the threshold check itself. Shared by every
# provider so the "why was this dropped" reasons read identically no matter
# where the data came from.
_THRESHOLD_CHECKS = [
    ("peg", "PEG ratio", lambda v: v < config.PEG_MAX, f"< {config.PEG_MAX}"),
    (
        "market_cap",
        "Market cap",
        lambda v: v > config.MARKET_CAP_MIN,
        f"> ${config.MARKET_CAP_MIN:,.0f}",
    ),
    (
        "net_income",
        "Net income (TTM)",
        lambda v: v > config.NET_INCOME_MIN,
        f"> ${config.NET_INCOME_MIN:,.0f}",
    ),
    ("roa", "ROA", lambda v: v >= config.ROA_MIN, f">= {config.ROA_MIN:.0%}"),
    ("roe", "ROE", lambda v: v >= config.ROE_MIN, f">= {config.ROE_MIN:.0%}"),
    ("roi", "ROI", lambda v: v >= config.ROI_MIN, f">= {config.ROI_MIN:.0%}"),
    (
        "debt_equity",
        "Debt/Equity",
        lambda v: v < config.DEBT_EQUITY_MAX,
        f"< {config.DEBT_EQUITY_MAX}",
    ),
    (
        "quick_ratio",
        "Quick ratio",
        lambda v: v > config.QUICK_RATIO_MIN,
        f"> {config.QUICK_RATIO_MIN}",
    ),
    (
        "current_ratio",
        "Current ratio",
        lambda v: v > config.CURRENT_RATIO_MIN,
        f"> {config.CURRENT_RATIO_MIN}",
    ),
    (
        "eps_growth_this_year",
        "EPS growth this year",
        lambda v: v >= config.EPS_GROWTH_THIS_YEAR_MIN,
        f">= {config.EPS_GROWTH_THIS_YEAR_MIN:.0%}",
    ),
    (
        "eps_growth_next_year",
        "EPS growth next year",
        lambda v: v >= config.EPS_GROWTH_NEXT_YEAR_MIN,
        f">= {config.EPS_GROWTH_NEXT_YEAR_MIN:.0%}",
    ),
    (
        "eps_growth_next_5_years",
        "EPS growth next 5yr (est.)",
        lambda v: v >= config.EPS_GROWTH_NEXT_5YEARS_MIN,
        f">= {config.EPS_GROWTH_NEXT_5YEARS_MIN:.0%}",
    ),
]


def apply_exact_thresholds(
    rows: list[FundamentalRow],
) -> tuple[list[FundamentalRow], list[ExclusionRecord]]:
    """The one place every Stage 1 pass/fail decision is made.

    A missing data point excludes the stock (never silently drops it) and
    logs exactly which field was missing. A present-but-failing value
    excludes it and logs the value against the threshold it missed.
    """
    passed: list[FundamentalRow] = []
    excluded: list[ExclusionRecord] = []

    for row in rows:
        failure_reason = None
        for field_name, label, check, threshold_desc in _THRESHOLD_CHECKS:
            value = getattr(row, field_name)
            if value is None or (isinstance(value, float) and pd.isna(value)):
                failure_reason = f"missing {label}"
                break
            if not check(value):
                failure_reason = f"{label} = {value:.4g} fails {threshold_desc}"
                break
        if failure_reason:
            excluded.append(
                ExclusionRecord(
                    ticker=row.ticker,
                    stage="Stage 1",
                    reason=failure_reason,
                    company=row.company,
                )
            )
        else:
            passed.append(row)

    return passed, excluded


def run_screen(
    provider: str | None = None, limit: int = 1000
) -> tuple[list[FundamentalRow], list[ExclusionRecord]]:
    """Run the Stage 1 fundamental screen end to end.

    Returns (passed, excluded). `excluded` covers both stocks that failed a
    threshold and stocks dropped for missing data, each tagged with why.
    """
    provider = provider or config.FUNDAMENTAL_PROVIDER

    if provider == "finviz":
        try:
            df = _fetch_finviz_universe(limit=limit)
        except Exception as exc:
            logger.warning(
                "Finviz screen failed (%s); falling back to Financial Modeling Prep.",
                exc,
            )
            provider = "fmp"
        else:
            if df.empty:
                logger.warning(
                    "Finviz screen returned no candidates; falling back to FMP."
                )
                provider = "fmp"
            else:
                rows = [_row_to_fundamental(r) for _, r in df.iterrows()]
                return apply_exact_thresholds(rows)

    if provider == "fmp":
        from stock_picker.fmp_screener import fetch_fmp_universe

        rows = fetch_fmp_universe(limit=limit)
        return apply_exact_thresholds(rows)

    raise ValueError(f"Unknown fundamentals provider: {provider!r}")
