"""Unit tests for the 20% swing rule. No network calls - synthetic price series only."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from stock_picker.swings import (  # noqa: E402
    compute_zigzag,
    completed_pullbacks,
    max_drawdown,
    typical_move,
    current_pullback_pct,
)


def series(prices: list[float], start="2020-01-01") -> pd.Series:
    idx = pd.date_range(start=start, periods=len(prices), freq="D")
    return pd.Series(prices, index=idx)


class TestZigzag(unittest.TestCase):
    def test_one_decline_survives_a_sub_threshold_bounce(self):
        # 100 -> up 20% to 120 (confirms 100 as a low, sets up the rise) ->
        # up further to 200 (the eventual swing high) -> falls to 100 (50%
        # off the high) -> bounces 10% to 110 (NOT a 20% recovery) -> falls
        # further to 60 -> finally recovers 20% from 60 to 72+.
        prices = series([100, 120, 200, 150, 100, 110, 80, 60, 61, 62, 73])
        result = compute_zigzag(prices, threshold=0.20)
        pullbacks = completed_pullbacks(result.pivots)

        # Exactly one completed decline from the 200 high down to the 60 low,
        # not two separate declines split at the 10% bounce.
        self.assertEqual(len(pullbacks), 1)
        pb = pullbacks[0]
        self.assertAlmostEqual(pb.high_price, 200)
        self.assertAlmostEqual(pb.low_price, 60)
        self.assertAlmostEqual(pb.pullback_pct, (200 - 60) / 200)

    def test_20_percent_bounce_does_end_the_decline(self):
        # 200 -> falls to 100 (50% down) -> recovers 20% to 120 -> that's a
        # confirmed low at 100, and a new rising leg starts.
        prices = series([200, 180, 150, 100, 110, 120])
        result = compute_zigzag(prices, threshold=0.20)
        pullbacks = completed_pullbacks(result.pivots)
        self.assertEqual(len(pullbacks), 1)
        self.assertAlmostEqual(pullbacks[0].high_price, 200)
        self.assertAlmostEqual(pullbacks[0].low_price, 100)
        # We should now be in a rising leg with the 100 low behind us.
        self.assertEqual(result.mode, "rising")

    def test_peak_on_a_smaller_rise_does_not_count(self):
        # From a low of 100, price only rises 10% to 110 before turning back
        # down - that peak must NOT be confirmed as a swing high.
        prices = series([100, 105, 110, 105, 100, 95])
        result = compute_zigzag(prices, threshold=0.20)
        # No confirmed pivots at all - the whole move is inside the 20% band.
        self.assertEqual(result.pivots, [])
        self.assertEqual(result.mode, "rising")
        # Highest point seen (110) is still tracked as the running extreme.
        self.assertAlmostEqual(result.current_extreme.price, 110)

    def test_current_pullback_uses_live_price_not_the_lows_low(self):
        # In the middle of a decline that hasn't recovered 20% yet, the
        # "current pullback" should reflect where price sits *now*, not the
        # lowest point the decline has reached so far.
        prices = series([100, 120, 200, 150, 100, 105])
        result = compute_zigzag(prices, threshold=0.20)
        pct, high = current_pullback_pct(result, last_price=105)
        self.assertAlmostEqual(high.price, 200)
        self.assertAlmostEqual(pct, (200 - 105) / 200)

    def test_a_long_unbroken_decline_is_the_max_drawdown_even_unfinished(self):
        prices = series([100, 130, 300, 250, 200, 150, 100, 90])
        result = compute_zigzag(prices, threshold=0.20)
        dd = max_drawdown(result)
        self.assertIsNotNone(dd)
        self.assertTrue(dd.ongoing)
        self.assertAlmostEqual(dd.high_price, 300)
        self.assertAlmostEqual(dd.low_price, 90)

    def test_typical_move_excludes_the_ongoing_decline(self):
        # One completed 40% decline well within the window, plus a live,
        # unfinished decline that should not be folded into the median.
        prices = series(
            [100, 125, 200, 190, 180, 170, 160, 150, 140, 130, 120, 150, 200, 150, 120]
        )
        result = compute_zigzag(prices, threshold=0.20)
        pbs = completed_pullbacks(result.pivots)
        as_of = prices.index[-1]
        stats = typical_move(pbs, as_of=as_of, window_years=5)
        self.assertEqual(stats["n"], len(pbs))
        for pb in pbs:
            self.assertFalse(pb.ongoing)

    def test_low_mover_series_has_small_typical_move(self):
        # A stock that only ever wiggles a few percent should produce no
        # confirmed pivots at all under a 20% threshold.
        prices = series([100 + (i % 3) for i in range(300)])
        result = compute_zigzag(prices, threshold=0.20)
        self.assertEqual(result.pivots, [])


if __name__ == "__main__":
    unittest.main()
