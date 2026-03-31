# Teen Trading App — Project Notes

## Concept
A trading education app built *for* teenagers, with teen input baked in from day one.
Not Robinhood with a skin. Not condescending. Real signal, no noise.

## Origin
- Joe Bell (developer/trader) + Wylder Burton (15yo, snowboard phenom, BTC-curious)
- Started: 2026-03-31
- Newsie is logging all research, insights, and frameworks as they develop

## The Gap We're Filling
Existing teen finance apps either:
1. Talk down to kids
2. Clone adult apps without addressing attention/learning differences
3. Lack real teen input in UX/design

**Our edge:** Wylder is a real user AND a contributor. That's a genuine differentiator.

---

## Wylder's Learning Arc (User Research)

### Profile
- Age: 15
- Background: Snowboard phenom, wicked smart, quick learner
- Already briefed on basics
- Primary interest: BTC / crypto
- Secondary interest: Long-horizon dividend stocks

### Recommended Path
1. **Price action fundamentals** — candlesticks, S/R, volume (TradingView, free)
2. **BTC deep dive** — halving cycles, macro correlation, market psychology
3. **Dividend compounders** — $SCHD, $O, $JNJ type names. Watch compounding in real time
4. **Risk management** — position sizing, stop losses. Before strategy, always.
5. **Economic calendar discipline** — know the data drops (CPI, Fed, jobs)

### Why BTC + Dividends combo works for a teen
- BTC teaches volatility, psychology, cycle awareness
- Dividends teach patience, compounding, fundamental value
- The contrast builds both sides of the risk spectrum — rare for any age

---

## Signal Sources (vetted)
- TradingView — charting (free tier solid)
- CME Group free futures education
- *Market Wizards* by Jack Schwager

## Noise to Filter (for teen audience)
- Reddit hype / influencer picks
- Hot tips / social sentiment tools
- Low-liquidity altcoins

---

## UX Language / Metaphor System (APPROVED ✅)
Map all trading concepts to slopestyle snowboarding language:
- "Read the Line" = analyze the chart
- "Stack your run" = build a position methodically
- "Bail point" = stop loss
- "The landing" = target/exit price
- Wylder is slopestyle — fast-twitch, reads terrain, stacks tricks in sequence. That's a trader.

## App Name — DECIDED ✅
**SlopeFlow** (chosen by Wylder, 2026-03-31)
- Runner up: TradeShred
- App icon: Pollinations gen #1 (mountain + candlestick, cyan glow) — saved as `slopeflow_icon.png`
- Splash screen candidate: TradeShred Image 1 (board/chart cinematic) — held for reference
- Bundle ID: com.bellistics.slopeflow

## Supabase Config
- Project URL: https://fraiwczymmclehzswblf.supabase.co
- Keys stored in: `.env` (gitignored) and `app/api/supabase.js`
- Schema file: `supabase_schema.sql` — **run this in Supabase SQL Editor to create tables**
- Tables: profiles, watchlist, journal_entries, challenge_results
- RLS enabled — users see only their own data
- Auto profile creation trigger on signup

## Tech Stack (CONFIRMED)
- **Backend/DB:** Supabase (free tier — auth, database, real-time)
- **Crypto data:** CoinGecko API (free, reliable)
- **Stock data:** Yahoo Finance API (free)
- **Charts:** Victory Native or Gifted Charts
- **Submission path:** Expo → Xcode → App Store (needs Mac + Apple Dev account $99/yr)

## MVP Feature List

### Core (must have)
- [ ] Onboarding — age, experience level, interests
- [ ] BTC live dashboard — price, 24h change, chart (1D/1W/1M)
- [ ] Dividend watchlist — tickers, price, yield
- [ ] Price alerts — set level, get notified
- [ ] Signal feed — curated news, noise filtered

### Learning Layer
- [ ] "Read the Line" — daily chart challenge, predict direction, see result
- [ ] Concept cards — 30-second bite-sized lessons
- [ ] Streak tracker — daily engagement, gamified

### Profile
- [ ] XP / level system (beginner → intermediate → sharp)
- [ ] Trade journal — paper trading only for MVP

### Deliberately OUT of MVP
- Real money / brokerage integration
- Social features
- Alt coins beyond BTC
- Complex screeners

## Build Order
1. Auth + onboarding
2. BTC dashboard
3. Signal feed
4. Learn module (Read the Line chart challenge)
5. Watchlist
6. Alerts

---

## Session Log
- **2026-03-31** — FULL BUILD DAY. Concept → named SlopeFlow → icons → MVP features → codebase → live charts → range switcher (15M–1Y) → onboarding → Supabase DB → auth → GitHub repo → **running live on Joe's iPhone**. First user: ShreddySnipes (Wylder, age 15). BTC showing $68,189, ▲2.60%, live chart, all three tabs functional. 🏔
