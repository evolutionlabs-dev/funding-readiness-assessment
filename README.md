# Funding Readiness Assessment — Early Pre-Seed Edition

A free, self-contained web tool for early pre-seed founders to evaluate their startup's readiness to raise first institutional capital. Built by [Evolution Accelerator](https://evolutionacceleration.com).

**[Try it live →](https://evolutionlabs-dev.github.io/funding-readiness-assessment/)**

## What It Does

The FRA walks founders through four steps:

1. **Company Profile & Deal Terms** — Capture your company details, choose your investment instrument (SAFE, Convertible Note, or Priced Round), and get real-time validation against early pre-seed benchmarks (Carta Q3 2025).

2. **Business Readiness** — Rate 14 items across three pillars (Team & Leadership, Business & Market, Corporate & Fundraising) with expandable tips explaining what investors actually look for.

3. **Materials Readiness** — Check off 17 deliverables investors expect, from pitch decks to cap tables, with stage-aware guidance based on your Step 1 answers.

4. **Your Report** — Get an overall readiness score, pillar breakdown, prioritized action plan, and a personalized 30/60/90 day roadmap with concrete next steps.

## Features

- **Single HTML file** — no build system, no dependencies, no server required. Open it in any browser.
- **Tunable weights** — open the methodology section to customize how each item is weighted. Drag sliders to see how different investor priorities change your score.
- **Benchmark validation** — raise amounts and SAFE/CN caps are checked against real early pre-seed market data with visual range comparisons.
- **Save & resume** — progress auto-saves to localStorage with 7-day expiry. Come back later and pick up where you left off.
- **Accessibility** — colorblind mode (Okabe-Ito palette), high contrast, large text, reduced motion, full keyboard navigation, ARIA roles.
- **Export options** — print/save as PDF, download text report, or email results directly.
- **Mobile responsive** — works on phones, tablets, and desktops.

## Scoring Methodology

No black boxes. The assessment uses transparent weighted scoring:

- **Business Readiness (60% of overall)** — 14 items scored Strong (3) / Developing (2) / Early (1) / Not Started (0), weighted by investor priority
- **Materials Readiness (40% of overall)** — 17 items scored Done (3) / Started (1) / Not Started (0)
- Weights derived from: Angel Capital Association Scorecard Method, Precursor Ventures, Hustle Fund, YC application criteria, and Evolution Accelerator's investment philosophy

Open the "How This Assessment Works" section in the app to see every weight and customize them.

## Benchmarks

Early pre-seed benchmarks (F&F + first angel checks, distinct from institutional pre-seed):

| Metric | Range | Median |
|--------|-------|--------|
| Raise size | $25K – $500K | $150K |
| SAFE cap (under $100K raise) | $2M – $6M | $4M |
| SAFE cap ($100K–$250K raise) | $3M – $8M | $5M |
| SAFE cap ($250K–$500K raise) | $4M – $10M | $6M |
| Dilution | 5% – 15% | 10% |
| SAFE usage | 92% of rounds | — |

Sources: Carta State of Pre-Seed Q3 2025, SEC investor type guidelines, Arc 2025, Zeni 2026.

## Running Locally

```bash
# Just open the HTML file
open "20260225 Evolution Accelerator Funding Readiness Assessment v2.html"

# Or serve it
python3 -m http.server 8000
# Then visit http://localhost:8000
```

## Testing

A 200-test math verification suite validates all scoring, weighting, benchmarks, dilution calculations (post-money SAFE, pre-money SAFE, convertible note, uncapped/MFN), and roadmap logic:

```bash
node test_fra_math.js
```

## Investment Frameworks

The assessment is built around Evolution Accelerator's core investment frameworks:

- **Trinity of Management** (Ernesto Sirolli) — every team needs Product, Market, and Finance capabilities
- **Run to Revenue** — customers before fundraising
- **Innovation over Invention** — market timing and positioning matter as much as the technology
- **"Don't prepay your hostage taker"** — founders shouldn't raise money to outsource core product to non-equity engineers

## License

MIT License — see [LICENSE](LICENSE).

## Credits

Built by [Evolution Accelerator](https://evolutionacceleration.com) · [EVFM](https://evfm.co)

Created with Claude (Anthropic) as an AI copilot experiment.

