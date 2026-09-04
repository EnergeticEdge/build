"""
Stage 2 (volatility) and Stage 3 (investability today), tied together per
ticker. Takes a FundamentalRow (or a bare ticker, for --ticker mode) and
either a full StockResult or an ExclusionRecord explaining why it couldn't
be analysed.
"""

from __future__ import annotations

from stock_picker import config
from stock_picker.models import ExclusionRecord, FundamentalRow, StockResult
from stock_picker.prices import fetch_price_history
from stock_picker.swings import (
    completed_pullbacks,
    compute_zigzag,
    current_pullback_pct,
    max_drawdown,
    typical_move,
)


def _status_for_pullback(pullback_pct: float) -> str:
    if pullback_pct >= config.INVESTABLE_STRONG_PULLBACK:
        return config.STATUS_STRONG
    if pullback_pct >= config.INVESTABLE_PULLBACK:
        return config.STATUS_INVESTABLE
    return config.STATUS_WATCH


def analyse_ticker(
    fundamentals: FundamentalRow,
) -> StockResult | ExclusionRecord:
    """Run Stage 2 + 3 for one stock that has already passed Stage 1
    (or, for --ticker mode, a synthetic FundamentalRow with just a ticker)."""
    history = fetch_price_history(fundamentals.ticker)

    if history is None or len(history.closes) < 2:
        # The only case genuinely too thin to say anything at all: no data,
        # or a single price point (nothing to measure a swing against).
        return ExclusionRecord(
            ticker=fundamentals.ticker,
            stage="Stage 2",
            reason="no usable price history available",
            company=fundamentals.company,
        )

    result = compute_zigzag(history.closes, config.SWING_THRESHOLD)
    pullbacks = completed_pullbacks(result.pivots)
    as_of = history.closes.index[-1]
    stats = typical_move(
        pullbacks, as_of=as_of, window_years=config.TYPICAL_MOVE_WINDOW_YEARS
    )
    low_mover = (
        stats["median_pct"] is not None and stats["median_pct"] < config.LOW_MOVER_THRESHOLD
    )

    dd = max_drawdown(result)
    last_price = float(history.closes.iloc[-1])
    pct, high_pivot = current_pullback_pct(result, last_price)
    status = _status_for_pullback(pct)

    notes: list[str] = []
    if history.insufficient:
        notes.append(
            f"only {history.trading_days} trading days of price history - well "
            "short of a full year, so treat this stock's swing/pullback figures "
            "as low-confidence rather than reliable"
        )
    elif history.short_history:
        notes.append(
            f"only {history.years_available:.1f} years of price history available "
            f"(requested {config.TYPICAL_MOVE_WINDOW_YEARS}) - typical move and "
            "drawdown are based on what's available, not the full window"
        )
    if stats["n"] == 0:
        notes.append(
            f"no completed pullback within the last {config.TYPICAL_MOVE_WINDOW_YEARS} "
            "years - typical move can't be calculated"
        )

    return StockResult(
        fundamentals=fundamentals,
        typical_move_pct=stats["median_pct"],
        typical_move_min_pct=stats["min_pct"],
        typical_move_max_pct=stats["max_pct"],
        typical_move_n=stats["n"],
        low_mover=low_mover,
        max_drawdown_pct=dd.pullback_pct if dd else None,
        max_drawdown_high_date=dd.high_date if dd else None,
        max_drawdown_low_date=dd.low_date if dd else None,
        current_pullback_pct=pct,
        current_high_date=high_pivot.date,
        status=status,
        short_history=history.short_history,
        history_years=history.years_available,
        notes=notes,
    )
