"""Shared data shapes passed between the screener, the volatility analysis,
and the output layer."""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass
class FundamentalRow:
    """One stock's Stage 1 fundamentals, in a provider-neutral shape."""

    ticker: str
    company: str | None = None
    sector: str | None = None
    market_cap: float | None = None
    peg: float | None = None
    net_income: float | None = None
    roa: float | None = None
    roe: float | None = None
    roi: float | None = None
    debt_equity: float | None = None
    quick_ratio: float | None = None
    current_ratio: float | None = None
    eps_growth_this_year: float | None = None
    eps_growth_next_year: float | None = None
    eps_growth_next_5_years: float | None = None


@dataclass
class ExclusionRecord:
    ticker: str
    stage: str  # "Stage 1", "Stage 2", "Stage 3"
    reason: str
    company: str | None = None


@dataclass
class StockResult:
    """A stock that passed Stage 1, with Stage 2/3 analysis attached."""

    fundamentals: FundamentalRow
    typical_move_pct: float | None
    typical_move_min_pct: float | None
    typical_move_max_pct: float | None
    typical_move_n: int
    low_mover: bool
    max_drawdown_pct: float | None
    max_drawdown_high_date: object = None
    max_drawdown_low_date: object = None
    current_pullback_pct: float | None = None
    current_high_date: object = None
    status: str = ""
    short_history: bool = False
    history_years: float = 0.0
    notes: list[str] = field(default_factory=list)
