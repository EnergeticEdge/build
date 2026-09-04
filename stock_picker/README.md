# US Stock Picker

A command-line tool that screens US stocks on fundamentals, analyses their
price history for real swings and pullbacks, and tells you which ones are
sitting at a big enough discount from their last high to be worth a look
today.

Three stages, run in order:

1. **Fundamental screen** — PEG, market cap, net income, ROA/ROE/ROI, debt
   and liquidity ratios, and EPS growth (this year, next year, next 5
   years). All must pass.
2. **Volatility analysis** — for every stock that passes Stage 1, at least 5
   years of daily price history, run through a 20% swing rule to find its
   typical pullback size and its worst-ever drawdown.
3. **Investability today** — how far below its most recent swing high the
   stock sits right now, and whether that counts as WATCH, INVESTABLE, or
   INVESTABLE - STRONG.

## Setup

```
cd stock_picker
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Only needed if you want the FMP fallback instead of Finviz: copy
`.env.example` to `.env` and add an `FMP_API_KEY` (free tier works), then
`export $(cat .env | xargs)` before running, or set it in your shell profile.

## Running it

From the repo root:

```
python -m stock_picker.cli
```

That runs all three stages and writes, into `stock_picker/output/`:

- `stock_picks_YYYY-MM-DD.csv` — every stock that made it through all three
  stages, full detail, sorted INVESTABLE - STRONG first.
- `excluded_YYYY-MM-DD.csv` — everything Stage 1 or Stage 2 dropped, and
  why (failed a threshold, or the data point was missing).

A condensed table prints to the console as it goes; the CSV has the full
20-column detail (all the fundamentals plus the pullback range and dated
max drawdown).

Useful flags:

```
python -m stock_picker.cli --ticker AAPL              # Stage 2+3 only, skips the screen
python -m stock_picker.cli --ticker AAPL,MSFT,NVDA     # same, for a few tickers at once
python -m stock_picker.cli --provider fmp              # force the FMP fallback
python -m stock_picker.cli --limit 300                 # cap the Stage 1 universe pulled from Finviz
python -m stock_picker.cli --max-stocks 20              # cap how many Stage 1 passers get Stage 2/3 run on them
python -m stock_picker.cli --out-dir output/2026-09-04 # write CSVs somewhere else
python -m stock_picker.cli --no-csv                     # console only
python -m stock_picker.cli -v                           # verbose logging (progress per ticker)
```

`--ticker` mode skips Stage 1 entirely, so the fundamentals columns in its
output are blank ("-") — it's for checking the price/pullback picture on a
stock you already have in mind, not for re-screening it.

**Short trading histories** don't get dropped — a recent IPO still shows up
in the results table with whatever the numbers are, plus a `*` next to its
ticker on the console and a note in the CSV's `Notes` column explaining the
history is thin. Only a ticker with no price data at all (nothing yfinance
can return) gets logged to the exclusion file instead.

## Changing the thresholds

Every number in the brief lives in `stock_picker/config.py`, grouped by
stage — PEG cap, market cap floor, the 20% swing rule, the 15% LOW MOVER
cutoff, the 20%/30% investability bands, all of it. Change a number there
and re-run; nothing else needs touching.

## The 20% swing rule, in practice

This is the part worth understanding before you trust the numbers:

- A **swing high** only counts if price first rose at least 20% from the
  low before it. Smaller wiggles don't create a swing high.
- A **decline stays live** until price rises 20% or more from *some* low
  point reached during that decline. A 50% fall, a 10% bounce, then a
  further fall is measured as **one** decline, from the original high all
  the way to the lowest point of the whole move — the 10% bounce doesn't
  split it into two.
- **Typical move** is the median of every *completed* decline (high fully
  resolved by a later 20% recovery) whose swing high fell in the last 5
  years. A decline that's still going — hasn't recovered 20% yet — isn't
  included in this median, because its final size isn't known yet. It's
  what "current pullback" is for.
- **Max drawdown** looks at the stock's *entire* available history (not
  just 5 years), and does count a decline that's still going if it's the
  biggest one on record — if a stock is down 80% and has never recovered,
  that's the max drawdown, full stop, dates included.
- **Current pullback** is today's price against the most recent qualifying
  swing high, however long ago that high was.

`stock_picker/swings.py` has the full implementation with the reasoning
inline, and `stock_picker/tests/test_swings.py` has unit tests built
directly from the examples in the brief (including the "50% fall, 10%
bounce, further fall = one decline" case) — run them with:

```
python -m unittest stock_picker.tests.test_swings -v
```

## Assumptions worth knowing about (flag if you want any of these changed)

- **Price series**: daily *close*, split/dividend-adjusted (yfinance's
  `auto_adjust=True`). Adjusting for splits avoids phantom 90%+ "drawdowns"
  on a day a stock does a 10-for-1 split; adjusting for dividends means the
  price series isn't literally what was on the ticker tape, which is the
  standard trade-off for this kind of analysis.
- **"US-listed"** is read as *US-domiciled* (Finviz/FMP `Country = USA`),
  not just "trades on a US exchange" — so it excludes foreign companies
  that list via ADR on NYSE/NASDAQ (e.g. a Taiwan Semi or an Alibaba).
  Change `COUNTRY_FILTER` in `config.py` to `None` to include those too.
- **Net income** uses Finviz's "Income" column, which is trailing twelve
  months. On the FMP fallback it's the sum of the last four quarterly
  income statements — should be the same number, calculated a different
  way.
- **"ROI"** on the FMP fallback is FMP's Return on Capital Employed
  (ROCE), the closest thing FMP publishes to Finviz's own "Return on
  Investment" metric. They're not defined identically — worth a spot check
  if you end up relying on the FMP path regularly.
- **EPS growth next 5 years** is the field most likely to come back missing
  for any given stock (it's an analyst-estimate figure that a lot of
  covered stocks simply don't have) — that's expected, and those stocks
  will show up in the excluded log rather than silently disappearing from
  the results, per the brief.
- The Finviz path was built and unit-tested against the `finvizfinance`
  library's own filter/column definitions, but **not exercised against a
  live Finviz screen in this session** — this sandbox has no outbound
  network route to finviz.com or Yahoo Finance. Same goes for the FMP
  fallback. Run it for real once, sanity-check the first output against a
  couple of stocks you know well (PEG, D/E, and a swing high/low you can
  eyeball on a chart), and flag anything that looks off.

## Rate limiting

Finviz screener pages are fetched with a ~1 second gap between pages
(`FINVIZ_PAGE_SLEEP_SECONDS`), and every yfinance price-history call has a
~0.75 second gap before the next one (`YFINANCE_REQUEST_DELAY_SECONDS`) —
both configurable in `config.py`. With the "10 to 40 stocks" pass-rate the
brief expects, Stage 2/3 should take a few minutes end to end, not run into
either provider's rate limits.

## Project layout

```
stock_picker/
  config.py          all thresholds - the only file you should need to edit
  models.py           shared dataclasses (FundamentalRow, StockResult, ExclusionRecord)
  screener.py          Stage 1 via Finviz, with exact-threshold refinement + exclusion logging
  fmp_screener.py       Stage 1 fallback via Financial Modeling Prep
  swings.py             the 20% swing rule - pivots, pullbacks, typical move, max drawdown
  prices.py              yfinance price history fetch + short-history handling
  investability.py        Stage 2 + 3 orchestration per ticker
  output.py                console table (rich) + CSV writers
  cli.py                     argument parsing, wires the stages together
  tests/test_swings.py        unit tests for the swing rule, no network needed
```
