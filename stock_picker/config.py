"""
All the tunable numbers for the stock picker live here. Change a threshold,
re-run the tool — nothing else in the codebase should need touching.
"""

from __future__ import annotations

import os

_PACKAGE_DIR = os.path.dirname(os.path.abspath(__file__))

# ---------------------------------------------------------------------------
# Stage 1: fundamental screen
# ---------------------------------------------------------------------------

PEG_MAX = 2.0
MARKET_CAP_MIN = 2_000_000_000  # $2bn
NET_INCOME_MIN = 75_000_000  # $75m, trailing twelve months
ROA_MIN = 0.10
ROE_MIN = 0.10
ROI_MIN = 0.10
DEBT_EQUITY_MAX = 0.35
QUICK_RATIO_MIN = 1.0
CURRENT_RATIO_MIN = 2.0
EPS_GROWTH_THIS_YEAR_MIN = 0.10
EPS_GROWTH_NEXT_YEAR_MIN = 0.10
EPS_GROWTH_NEXT_5YEARS_MIN = 0.10

# Which country Finviz/FMP should treat as "US-listed". "USA" restricts the
# screen to US-domiciled companies (excludes foreign ADRs that merely trade
# on a US exchange). Set to None to allow any exchange listing regardless of
# domicile.
COUNTRY_FILTER = "USA"

# ---------------------------------------------------------------------------
# Stage 2: volatility analysis (the 20% swing rule)
# ---------------------------------------------------------------------------

# A swing high/low is confirmed once price reverses by this much from the
# running extreme. Same threshold governs "when does a decline end" (a 20%
# rise from the low) and "what counts as a swing high" (a 20% rise from the
# preceding low). See stock_picker/swings.py for the full rule.
SWING_THRESHOLD = 0.20

# How many years of history "typical move" and its range are calculated
# over. Max drawdown always uses the full available history regardless of
# this setting.
TYPICAL_MOVE_WINDOW_YEARS = 5

# Minimum years of daily history to request from the price source.
MIN_HISTORY_YEARS_REQUESTED = 5

# Below this typical-move percentage, flag the stock LOW MOVER.
LOW_MOVER_THRESHOLD = 0.15

# Fewer trading days than this and the swing/pullback maths is low
# confidence (e.g. a recent IPO) - the stock still gets analysed and shown,
# just with a note flagging why the numbers might be thin. Nothing below
# this is ever silently dropped; only a stock with no price data at all is.
MIN_TRADING_DAYS_FOR_ANALYSIS = 60

# Fewer trading days than this (roughly one full window) and the stock still
# gets analysed, but "typical move" is marked as based on a shorter history
# than the window requested.
FULL_WINDOW_TRADING_DAYS = int(TYPICAL_MOVE_WINDOW_YEARS * 252)

# ---------------------------------------------------------------------------
# Stage 3: investability thresholds
# ---------------------------------------------------------------------------

INVESTABLE_STRONG_PULLBACK = 0.30  # pullback >= this -> INVESTABLE - STRONG
INVESTABLE_PULLBACK = 0.20  # pullback >= this -> INVESTABLE

STATUS_STRONG = "INVESTABLE - STRONG"
STATUS_INVESTABLE = "INVESTABLE"
STATUS_WATCH = "WATCH"

# Sort priority for the console/CSV output, lowest number first.
STATUS_SORT_ORDER = {
    STATUS_STRONG: 0,
    STATUS_INVESTABLE: 1,
    STATUS_WATCH: 2,
}

# ---------------------------------------------------------------------------
# Networking / rate limiting
# ---------------------------------------------------------------------------

FINVIZ_PAGE_SLEEP_SECONDS = 1.0
YFINANCE_REQUEST_DELAY_SECONDS = 0.75
FMP_REQUEST_DELAY_SECONDS = 0.5

# Fundamental data provider: "finviz" (default) or "fmp".
FUNDAMENTAL_PROVIDER = os.environ.get("STOCK_PICKER_PROVIDER", "finviz")

# Financial Modeling Prep API key, only needed for the FMP fallback path.
FMP_API_KEY = os.environ.get("FMP_API_KEY", "")

# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------


# Anchored to this package directory (not the current working directory) so
# output always lands in the same place - stock_picker/output/ - no matter
# where you run the tool from. Override with STOCK_PICKER_OUTPUT_DIR or
# --out-dir.
OUTPUT_DIR = os.environ.get(
    "STOCK_PICKER_OUTPUT_DIR", os.path.join(_PACKAGE_DIR, "output")
)
CSV_DATE_FORMAT = "%Y-%m-%d"
