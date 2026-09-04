"""Console table (rich) and CSV output, including the exclusion log."""

from __future__ import annotations

import csv
import datetime as dt
import logging
import os

from rich.console import Console
from rich.table import Table

from stock_picker import config
from stock_picker.models import ExclusionRecord, StockResult

logger = logging.getLogger(__name__)

CSV_COLUMNS = [
    "Ticker",
    "Company",
    "Sector",
    "Market Cap",
    "PEG",
    "Net Income",
    "ROA",
    "ROE",
    "ROI",
    "Debt/Eq",
    "Quick",
    "Current",
    "EPS This Yr",
    "EPS Next Yr",
    "EPS 5Yr",
    "Typical Move %",
    "Pullback Range",
    "Max Drawdown %",
    "Current Pullback %",
    "Status",
    "Notes",
]

# The console gets a shorter "at a glance" view - the full 20-column detail
# always goes to the CSV. Keeps the printed table readable regardless of
# terminal width (a real terminal can be much narrower than this table is
# wide once every fundamentals column is in it).
CONSOLE_COLUMNS = [
    "Ticker",
    "Company",
    "Sector",
    "Market Cap",
    "PEG",
    "Status",
    "Current Pullback %",
    "Typical Move %",
    "Max Drawdown %",
]


def _fmt_money(value: float | None) -> str:
    if value is None:
        return "-"
    abs_v = abs(value)
    if abs_v >= 1e9:
        return f"${value / 1e9:,.2f}B"
    if abs_v >= 1e6:
        return f"${value / 1e6:,.1f}M"
    return f"${value:,.0f}"


def _fmt_pct(value: float | None, decimals: int = 1) -> str:
    if value is None:
        return "-"
    return f"{value * 100:.{decimals}f}%"


def _fmt_ratio(value: float | None, decimals: int = 2) -> str:
    if value is None:
        return "-"
    return f"{value:.{decimals}f}"


def _fmt_date(d) -> str:
    if d is None:
        return "?"
    try:
        return d.strftime("%Y-%m-%d")
    except AttributeError:
        return str(d)


def _typical_move_cell(r: StockResult) -> str:
    if r.typical_move_pct is None:
        note = " (short history)" if r.short_history else ""
        return f"n/a - no completed pullback in window{note}"
    text = _fmt_pct(r.typical_move_pct)
    if r.low_mover:
        text += " [LOW MOVER]"
    return text


def _pullback_range_cell(r: StockResult) -> str:
    if r.typical_move_min_pct is None:
        return "-"
    return f"{_fmt_pct(r.typical_move_min_pct)} - {_fmt_pct(r.typical_move_max_pct)}"


def _max_drawdown_cell(r: StockResult) -> str:
    if r.max_drawdown_pct is None:
        return "-"
    return (
        f"-{_fmt_pct(r.max_drawdown_pct)} "
        f"({_fmt_date(r.max_drawdown_high_date)} to {_fmt_date(r.max_drawdown_low_date)})"
    )


def result_to_row(r: StockResult) -> dict:
    f = r.fundamentals
    return {
        "Ticker": f.ticker,
        "Company": f.company or "",
        "Sector": f.sector or "",
        "Market Cap": _fmt_money(f.market_cap),
        "PEG": _fmt_ratio(f.peg),
        "Net Income": _fmt_money(f.net_income),
        "ROA": _fmt_pct(f.roa),
        "ROE": _fmt_pct(f.roe),
        "ROI": _fmt_pct(f.roi),
        "Debt/Eq": _fmt_ratio(f.debt_equity),
        "Quick": _fmt_ratio(f.quick_ratio),
        "Current": _fmt_ratio(f.current_ratio),
        "EPS This Yr": _fmt_pct(f.eps_growth_this_year),
        "EPS Next Yr": _fmt_pct(f.eps_growth_next_year),
        "EPS 5Yr": _fmt_pct(f.eps_growth_next_5_years),
        "Typical Move %": _typical_move_cell(r),
        "Pullback Range": _pullback_range_cell(r),
        "Max Drawdown %": _max_drawdown_cell(r),
        "Current Pullback %": _fmt_pct(r.current_pullback_pct),
        "Status": r.status,
        "Notes": " | ".join(r.notes),
    }


def sort_results(results: list[StockResult]) -> list[StockResult]:
    return sorted(
        results,
        key=lambda r: (
            config.STATUS_SORT_ORDER.get(r.status, 99),
            -(r.current_pullback_pct or 0.0),
        ),
    )


def print_console_table(results: list[StockResult]) -> None:
    # Fall back to a generous fixed width when there's no real terminal to
    # measure (e.g. output piped to a file) - rich's own fallback of 80
    # columns is too narrow for this table even in its condensed form.
    console = Console(width=None if os.isatty(1) else 140)
    table = Table(title="Investable US Stocks - at a glance (full detail in the CSV)", show_lines=False)
    for col in CONSOLE_COLUMNS:
        table.add_column(col, overflow="fold")

    style_by_status = {
        config.STATUS_STRONG: "bold green",
        config.STATUS_INVESTABLE: "green",
        config.STATUS_WATCH: "dim",
    }

    for r in results:
        row = result_to_row(r)
        if r.notes:
            row["Ticker"] += " *"
        style = style_by_status.get(r.status)
        table.add_row(*[row[c] for c in CONSOLE_COLUMNS], style=style)

    if any(r.notes for r in results):
        table.caption = "* see Notes in the CSV - short/thin price history"

    console.print(table)

    strong = [r for r in results if r.status == config.STATUS_STRONG]
    if strong:
        console.print(
            f"\n[bold green]{len(strong)} stock(s) INVESTABLE - STRONG "
            f"(pullback >= {config.INVESTABLE_STRONG_PULLBACK:.0%}):[/bold green] "
            + ", ".join(r.fundamentals.ticker for r in strong)
        )

    low_movers = [r for r in results if r.low_mover]
    if low_movers:
        console.print(
            f"[yellow]{len(low_movers)} LOW MOVER stock(s) "
            f"(typical move < {config.LOW_MOVER_THRESHOLD:.0%}):[/yellow] "
            + ", ".join(r.fundamentals.ticker for r in low_movers)
        )


def _date_stamp() -> str:
    return dt.datetime.now().strftime(config.CSV_DATE_FORMAT)


def write_results_csv(
    results: list[StockResult], out_dir: str | None = None, suffix: str = ""
) -> str:
    out_dir = out_dir or config.OUTPUT_DIR
    os.makedirs(out_dir, exist_ok=True)
    filename = f"stock_picks_{_date_stamp()}{suffix}.csv"
    path = os.path.join(out_dir, filename)
    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
        writer.writeheader()
        for r in results:
            writer.writerow(result_to_row(r))
    logger.info("Wrote %d rows to %s", len(results), path)
    return path


def write_exclusions_csv(
    exclusions: list[ExclusionRecord], out_dir: str | None = None, suffix: str = ""
) -> str:
    out_dir = out_dir or config.OUTPUT_DIR
    os.makedirs(out_dir, exist_ok=True)
    filename = f"excluded_{_date_stamp()}{suffix}.csv"
    path = os.path.join(out_dir, filename)
    with open(path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["Ticker", "Company", "Stage", "Reason"])
        writer.writeheader()
        for e in exclusions:
            writer.writerow(
                {
                    "Ticker": e.ticker,
                    "Company": e.company or "",
                    "Stage": e.stage,
                    "Reason": e.reason,
                }
            )
    logger.info("Wrote %d exclusion rows to %s", len(exclusions), path)
    return path
