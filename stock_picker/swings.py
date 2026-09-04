"""
The 20% swing rule, in one place.

Definitions this module implements exactly (see the project brief):

- Swing high: a local peak reached after the price first rose at least 20%
  from its preceding low. Peaks reached on smaller rises don't count.
- A decline stays "live" until price rises 20% or more from a low reached
  during that decline. Smaller bounces don't end it and don't create a new
  high - a 50% fall, a 10% bounce, then a further fall is ONE decline, from
  the original high to the lowest low of the whole move.
- Pullback: the percentage decline from a swing high to the lowest low of
  that decline, under the rule above.

This is a standard 20%-reversal zigzag: a "high" pivot is confirmed the
moment price falls 20% from the running peak since the last confirmed low,
and a "low" pivot is confirmed the moment price rises 20% from the running
trough since the last confirmed high. Both confirmations use the same 20%
threshold, so "a peak only counts if it rose 20% from its preceding low"
and "a decline only ends on a 20% recovery" fall out of the same rule
automatically: the running peak of a rising leg always starts at a price
already >=20% above the leg's anchor low, so any peak that ever gets
confirmed necessarily satisfies the swing-high definition.

The very first price in the series has no known predecessor, so it is
treated as the anchor low for the first leg - the best any analysis of a
finite price history can do.
"""

from __future__ import annotations

import statistics
from dataclasses import dataclass
from typing import Literal

import pandas as pd

PivotKind = Literal["high", "low"]


@dataclass(frozen=True)
class Pivot:
    kind: PivotKind
    date: pd.Timestamp
    price: float


@dataclass(frozen=True)
class Pullback:
    high_date: pd.Timestamp
    high_price: float
    low_date: pd.Timestamp
    low_price: float
    pullback_pct: float
    ongoing: bool = False  # True if this decline hasn't recovered 20% yet


@dataclass(frozen=True)
class ZigzagResult:
    pivots: list[Pivot]
    mode: Literal["rising", "falling"]
    current_extreme: Pivot


def compute_zigzag(prices: pd.Series, threshold: float) -> ZigzagResult:
    """Run the 20%-reversal zigzag over a chronologically-ascending price series.

    Args:
        prices: daily close prices indexed by date, ascending, no gaps needed.
        threshold: reversal fraction, e.g. 0.20 for 20%.

    Returns:
        ZigzagResult with all confirmed pivots (alternating high, low, high,
        ...) plus the still-unconfirmed extreme of the trailing leg.
    """
    if len(prices) == 0:
        raise ValueError("compute_zigzag received an empty price series")

    dates = prices.index
    values = prices.to_numpy(dtype=float)
    n = len(values)

    mode: Literal["rising", "falling"] = "rising"
    extreme_price = values[0]
    extreme_date = dates[0]
    pivots: list[Pivot] = []

    for i in range(1, n):
        p = values[i]
        d = dates[i]
        if mode == "rising":
            if p > extreme_price:
                extreme_price = p
                extreme_date = d
            elif p <= extreme_price * (1 - threshold):
                pivots.append(Pivot("high", extreme_date, extreme_price))
                mode = "falling"
                extreme_price = p
                extreme_date = d
        else:  # falling
            if p < extreme_price:
                extreme_price = p
                extreme_date = d
            elif p >= extreme_price * (1 + threshold):
                pivots.append(Pivot("low", extreme_date, extreme_price))
                mode = "rising"
                extreme_price = p
                extreme_date = d

    current_extreme = Pivot(
        "high" if mode == "rising" else "low", extreme_date, extreme_price
    )
    return ZigzagResult(pivots=pivots, mode=mode, current_extreme=current_extreme)


def completed_pullbacks(pivots: list[Pivot]) -> list[Pullback]:
    """Pair each confirmed high with the low that ended its decline.

    Confirmed pivots always alternate starting with "high" (the zigzag can
    only ever confirm a high first), so pivots[i]/pivots[i+1] pairs cleanly.
    """
    out: list[Pullback] = []
    for i in range(len(pivots) - 1):
        high, low = pivots[i], pivots[i + 1]
        if high.kind == "high" and low.kind == "low":
            pct = (high.price - low.price) / high.price
            out.append(
                Pullback(
                    high_date=high.date,
                    high_price=high.price,
                    low_date=low.date,
                    low_price=low.price,
                    pullback_pct=pct,
                )
            )
    return out


def all_pullbacks(result: ZigzagResult) -> list[Pullback]:
    """Completed pullbacks plus the current decline, if one is still live."""
    pullbacks = completed_pullbacks(result.pivots)
    if result.mode == "falling" and result.pivots and result.pivots[-1].kind == "high":
        high = result.pivots[-1]
        low = result.current_extreme
        pct = (high.price - low.price) / high.price
        pullbacks = pullbacks + [
            Pullback(
                high_date=high.date,
                high_price=high.price,
                low_date=low.date,
                low_price=low.price,
                pullback_pct=pct,
                ongoing=True,
            )
        ]
    return pullbacks


def max_drawdown(result: ZigzagResult) -> Pullback | None:
    """The single largest decline in the series, completed or still live."""
    candidates = all_pullbacks(result)
    if not candidates:
        return None
    return max(candidates, key=lambda p: p.pullback_pct)


def typical_move(
    pullbacks: list[Pullback],
    as_of: pd.Timestamp,
    window_years: int,
) -> dict:
    """Median/min/max of completed pullbacks whose swing high fell within
    the trailing `window_years` years of `as_of`.

    The still-live decline (if any) is deliberately excluded: its final size
    is unknown, so folding it into "typical move" would understate or
    overstate the stock's usual behaviour depending on where it happens to
    be measured. It's reported separately as "current pullback" instead.
    """
    cutoff = as_of - pd.DateOffset(years=window_years)
    window = [p for p in pullbacks if not p.ongoing and p.high_date >= cutoff]
    if not window:
        return {"median_pct": None, "min_pct": None, "max_pct": None, "n": 0}
    pcts = [p.pullback_pct for p in window]
    return {
        "median_pct": statistics.median(pcts),
        "min_pct": min(pcts),
        "max_pct": max(pcts),
        "n": len(pcts),
    }


def most_recent_swing_high(result: ZigzagResult) -> Pivot:
    """The swing high that today's price should be measured against.

    If a decline is currently live, that's the high it started from
    (`result.pivots[-1]`), however long ago that was. If the stock is
    currently in a rising leg, it's the running peak of that leg - which by
    construction has already risen >=20% from its own preceding low, so it
    qualifies as a swing high even before a future decline confirms it.
    """
    if result.mode == "falling" and result.pivots:
        return result.pivots[-1]
    return result.current_extreme


def current_pullback_pct(result: ZigzagResult, last_price: float) -> tuple[float, Pivot]:
    """Percentage today's price sits below the most recent swing high."""
    high = most_recent_swing_high(result)
    pct = (high.price - last_price) / high.price
    return max(pct, 0.0), high
