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
- [x] Onboarding — age, experience level, interests
- [x] BTC live dashboard — price, 24h change, chart (1D/1W/1M)
- [x] Price alerts — set level, integrated into BTC dashboard
- [x] Signal feed — curated news, noise filtered
- [x] Dividend watchlist — tickers, price, yield (Supabase-backed)

### Learning Layer
- [x] "Read the Line" — daily chart challenge, predict direction, see result
- [x] Streak tracker — daily engagement, Supabase-backed

### Profile
- [x] Auth + profile system (Supabase)
- [ ] XP / level system (v2)
- [ ] Trade journal — paper trading (v2)

### Deliberately OUT of MVP (v2)
- Real money / brokerage integration
- Social features
- Alt coins beyond BTC
- Complex screeners
- XP/allowance system
- Parent dashboard

## Build Order
1. Auth + onboarding
2. BTC dashboard
3. Signal feed
4. Learn module (Read the Line chart challenge)
5. Watchlist
6. Alerts

---

## XP → Allowance System ("Earn Your Line") — CONCEPT

### Core Model
- Teen starts at 0 XP each month
- XP goes positive OR negative based on performance
- **Going negative:** chores/recovery tasks available to earn back to zero ("getting to even")
- **Going positive:** unlocks bi-monthly payouts (mid-month + end of month)

### Escrow Mechanic
- Parents fund escrow account (example: $100/month)
- Hit XP threshold → full release
- Fall short → partial release, remainder held
- Unearned funds roll into next period incentive

### Dual Track
- **Behavior track** — chores, tasks, responsibilities
- **Education track** — SlopeFlow learning modules, chart challenges, streaks
- Losing XP tied to BOTH: skipping chores AND skipping learning objectives

### Wylder's take: "That could be a really good idea" ✅

### Key Questions (Telly)
1. What specific actions earn/lose XP? (behavior, chores, grades, learning modules?)
2. Is escrow parent-funded only, or can teens contribute?
3. What's minimum payout threshold? (e.g., +50 XP to unlock any release)
4. App, web platform, or both?

### Core Loop — APPROVED NAME ✅
**DROP IN → SEND IT → ??? (Wylder decides)**
- Drop In = Learn (daily concept + quiz, gates XP)
- Send It = Perform (deploy XP, paper trade, wins/losses)
- ??? = Recovery — contenders: **Lap It** vs **Reset** (Wylder's vote pending)



**⚡ XP EARN (Learn)**
- Daily concept presented to user
- 3-5 questions asked
- Once 3 answered correctly → daily XP (Trading Power) unlocked
- Gates the day's XP behind actual comprehension — not just showing up

**📈 XP PERFORM (Play)**
- User deploys earned XP to play the market (paper trading)
- Wins and losses accumulate against XP balance
- Real stakes, no real money — but XP has real monetary value via escrow
- Creates genuine risk/reward psychology

**🔄 XP REBUY (Recovery)**
- If XP depleted: two paths back
  1. Next Day Learn — come back tomorrow, pass the quiz, rebuild
  2. Chore/Task Completion — earn XP back same day through parent-assigned tasks

**Why this is brilliant:**
- Learn → Perform → Recover mirrors real trading psychology
- You can't play without learning first (gated)
- Losing has a recovery path (not punishing, just real)
- Chores tie real-world responsibility to financial education
- Parents see the full loop — learn, play, recover


- **Option A:** Cash released via Venmo/Cash App
- **Option B:** Investment credits — XP unlocks real BTC purchases (small amounts)
- **Option C:** Parent chooses A or B
- Wylder's answer pending — shapes build direction

### Monetization
- Free tier: XP tracking only
- Premium family plan ($4.99/mo): parent dashboard + escrow + allowance system

### Why this is a big deal
- Pays kids for *demonstrated knowledge* not just time
- Full transparency for parents — they see exactly what was learned
- No app does this
- Headline: *"The app that pays your kid to learn trading"*
- Potential: TechCrunch, parenting blogs, financial education press

### Next steps
- [ ] Answer Telly's 4 key questions
- [ ] Wylder answers A/B/C payout preference
- [ ] Product spec document
- [ ] Build parent dashboard wireframe

## X (Twitter) Account — Setup Checklist
**Status: Pending — execute next session**

1. **Create account**
   - x.com → Sign up
   - Username: @SlopeFlowApp (check @SlopeFlow availability first)
   - Dedicated email: create slopeflowapp@gmail.com or similar

2. **Profile assets (Ideogram)**
   - Profile pic: SlopeFlow icon prompt (already built) — 1024×1024, crops to circle
   - Banner: TradeShred cinematic prompt, swap name to SlopeFlow — 1500×500px

3. **X Developer App**
   - developer.twitter.com → New Project + App
   - Upgrade to Production access (required for posting)
   - Generate: Consumer Key, Consumer Secret, Access Token, Access Secret, Bearer Token
   - Save all to credentials.json

4. **Install library (in slopeflow project)**
   ```
   cd ~/Desktop/slopeflow && npm install twitter-api-v2
   ```

5. **Content strategy**
   - Audience: teens + young traders, snowboard/action sports culture, **parents with kids interested in trading/investing**
   - Parent angle: "teach your kid to read markets, not just follow hype" — safety, education, no real money
   - Post types: daily BTC signal, Read the Line chart challenge, app features, Wylder clips, parent-facing education posts
   - Newsie builds 30-day content calendar once account is live

## Articles to Consider

### "The Claw native app studio | Scale apps to $20k/mo with agents"
- Source: @ernestosoftware on X (2026-03-26)
- Tweet: https://x.com/ernestosoftware/status/2037187494530208029
- Relevance: AI agent-driven app studio model — potential framework for scaling SlopeFlow and future apps
- Flag: Review when planning v2 / monetization strategy
- **2026-03-31** — FULL BUILD DAY. Concept → named SlopeFlow → icons → MVP features → codebase → live charts → range switcher (15M–1Y) → onboarding → Supabase DB → auth → GitHub repo → **running live on Joe's iPhone**. First user: ShreddySnipes (Wylder, age 15). BTC showing $68,189, ▲2.60%, live chart, all three tabs functional. 🏔
- **2026-04-01** — v1 complete. Signal feed (RSS), watchlist + streak Supabase-backed, price alerts in BTC dashboard, privacy policy live. App Store metadata drafted. X Developer API live (@Slope_Flow). Apple Developer enrolled + paid. Build Directive PDF created. **Build blocker:** Mac mini Monterey max Xcode 14.2, Expo 54 + RN 0.81.5 requires Xcode 16.1+. Resolution pending: EAS cloud build OR new Mac (M4 mini ~$599).

## Build Submission — Status & Options
- **App Store Connect:** listing created, Bundle ID registered (com.bellistics.slopeflow)
- **Privacy policy:** https://slopeflow.github.io/slopeflow/privacy.html
- **Blocker:** Local build impossible on Monterey. Two paths:
  - **EAS Build (recommended now):** `npm install -g eas-cli` → `eas login` → `eas build --platform ios` — builds on Expo cloud, no Xcode needed locally
  - **New Mac M4 mini (~$599):** permanent fix, future-proof for all future apps
