"""
Price history fetching via yfinance, with polite rate limiting and graceful
handling of short trading histories.
"""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass

import pandas as pd
import yfinance as yf

from stock_picker import config

logger = logging.getLogger(__name__)


@dataclass
class PriceHistory:
    ticker: str
    closes: pd.Series  # ascending date index, float close (split/dividend adjusted)
    trading_days: int
    years_available: float
    short_history: bool  # fewer trading days than a full 5y window
    insufficient: bool  # too little data to analyse at all


def fetch_price_history(ticker: str) -> PriceHistory | None:
    """Download full available daily history for one ticker.

    Returns None if the ticker has essentially no usable price data (a
    delisted or brand-new symbol yfinance can't return anything for).
    """
    try:
        raw = yf.download(
            ticker,
            period="max",
            interval="1d",
            auto_adjust=True,
            progress=False,
            threads=False,
        )
    except Exception as exc:  # network hiccups, bad ticker, etc.
        logger.warning("Price fetch failed for %s: %s", ticker, exc)
        return None
    finally:
        time.sleep(config.YFINANCE_REQUEST_DELAY_SECONDS)

    if raw is None or raw.empty or "Close" not in raw:
        return None

    closes = raw["Close"]
    # yfinance returns a DataFrame with a MultiIndex column for single
    # tickers in some versions - flatten to a plain Series either way.
    if isinstance(closes, pd.DataFrame):
        closes = closes.iloc[:, 0]
    closes = closes.dropna()
    closes.index = pd.to_datetime(closes.index)
    closes = closes.sort_index()

    if closes.empty:
        return None

    trading_days = len(closes)
    years_available = trading_days / 252.0
    short_history = trading_days < config.FULL_WINDOW_TRADING_DAYS
    insufficient = trading_days < config.MIN_TRADING_DAYS_FOR_ANALYSIS

    return PriceHistory(
        ticker=ticker,
        closes=closes,
        trading_days=trading_days,
        years_available=years_available,
        short_history=short_history,
        insufficient=insufficient,
    )
