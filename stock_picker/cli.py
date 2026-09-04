"""
US Stock Picker - command line entry point.

Usage:
    python -m stock_picker.cli                  # full 3-stage run
    python -m stock_picker.cli --ticker AAPL     # Stage 2+3 only, one stock
    python -m stock_picker.cli --ticker AAPL,MSFT,NVDA
    python -m stock_picker.cli --provider fmp    # force the FMP fallback
    python -m stock_picker.cli --limit 300 --out-dir output/2026-09-04
"""

from __future__ import annotations

import argparse
import logging
import sys

from stock_picker import config
from stock_picker.investability import analyse_ticker
from stock_picker.models import ExclusionRecord, FundamentalRow, StockResult
from stock_picker.output import (
    print_console_table,
    sort_results,
    write_exclusions_csv,
    write_results_csv,
)
from stock_picker.screener import run_screen

logger = logging.getLogger("stock_picker")


def build_arg_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Screen US stocks, analyse price behaviour, and flag what's investable today."
    )
    parser.add_argument(
        "--ticker",
        type=str,
        default=None,
        help=(
            "Comma-separated ticker(s) to run Stage 2/3 analysis on directly, "
            "skipping the Stage 1 fundamental screen entirely."
        ),
    )
    parser.add_argument(
        "--provider",
        choices=["finviz", "fmp"],
        default=None,
        help="Fundamentals provider for Stage 1 (default: config.FUNDAMENTAL_PROVIDER).",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=1000,
        help="Cap on how many Stage 1 candidates to pull from the fundamentals provider.",
    )
    parser.add_argument(
        "--max-stocks",
        type=int,
        default=None,
        help="Cap on how many Stage 1 passers go through Stage 2/3 (default: no cap).",
    )
    parser.add_argument(
        "--out-dir",
        type=str,
        default=None,
        help=f"Output directory for the CSVs (default: {config.OUTPUT_DIR}).",
    )
    parser.add_argument(
        "--no-csv", action="store_true", help="Skip writing CSV files; console only."
    )
    parser.add_argument(
        "-v", "--verbose", action="store_true", help="Verbose logging."
    )
    return parser


def _run_single_tickers(tickers: list[str]) -> tuple[list[StockResult], list[ExclusionRecord]]:
    results: list[StockResult] = []
    exclusions: list[ExclusionRecord] = []
    for ticker in tickers:
        ticker = ticker.strip().upper()
        if not ticker:
            continue
        outcome = analyse_ticker(FundamentalRow(ticker=ticker))
        if isinstance(outcome, ExclusionRecord):
            exclusions.append(outcome)
        else:
            results.append(outcome)
    return results, exclusions


def _run_full_screen(
    provider: str | None, limit: int, max_stocks: int | None
) -> tuple[list[StockResult], list[ExclusionRecord]]:
    logger.info("Running Stage 1 fundamental screen...")
    passed, stage1_exclusions = run_screen(provider=provider, limit=limit)
    logger.info(
        "Stage 1: %d passed, %d excluded.", len(passed), len(stage1_exclusions)
    )

    if max_stocks is not None:
        passed = passed[:max_stocks]

    results: list[StockResult] = []
    exclusions: list[ExclusionRecord] = list(stage1_exclusions)
    for i, fundamentals in enumerate(passed, start=1):
        logger.info(
            "Stage 2/3 [%d/%d]: analysing %s", i, len(passed), fundamentals.ticker
        )
        outcome = analyse_ticker(fundamentals)
        if isinstance(outcome, ExclusionRecord):
            exclusions.append(outcome)
        else:
            results.append(outcome)

    return results, exclusions


def main(argv: list[str] | None = None) -> int:
    args = build_arg_parser().parse_args(argv)
    logging.basicConfig(
        level=logging.INFO if args.verbose else logging.WARNING,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )

    if args.ticker:
        tickers = [t for t in args.ticker.split(",") if t.strip()]
        results, exclusions = _run_single_tickers(tickers)
        suffix = "_" + "-".join(t.strip().upper() for t in tickers)
    else:
        results, exclusions = _run_full_screen(
            provider=args.provider, limit=args.limit, max_stocks=args.max_stocks
        )
        suffix = ""

    results = sort_results(results)

    if not results:
        print("No stocks to show - see the exclusion log for why.", file=sys.stderr)
    else:
        print_console_table(results)

    if exclusions:
        print(f"\n{len(exclusions)} stock(s) excluded / dropped - see the exclusion log.")

    if not args.no_csv:
        if results:
            path = write_results_csv(results, out_dir=args.out_dir, suffix=suffix)
            print(f"Saved results to {path}")
        if exclusions:
            path = write_exclusions_csv(exclusions, out_dir=args.out_dir, suffix=suffix)
            print(f"Saved exclusion log to {path}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
