# SlopeFlow — App Store Metadata

---

## ⚠️ Next Build Tips & Lessons Learned (v1.0 → v1.0.1+)

### Build Process
- **Use EAS Build exclusively** — do NOT attempt local Xcode builds on Monterey or any Mac without Xcode 16.1+
- **EAS command:** `EAS_NO_VCS=1 EAS_SKIP_AUTO_FINGERPRINT=1 eas build --platform ios`
- **EAS submit command:** `EAS_NO_VCS=1 eas submit --platform ios --url <ipa_url>`
- **Apple ID for developer account:** JoeBell@kw.com (NOT lokeiangler@gmail.com)
- **Expo account login:** lokeiangler@gmail.com
- Fix npm permissions before running EAS: `sudo chown -R $(whoami) /usr/local/lib/node_modules`

### App Icon & Splash
- [ ] **Replace app icon** with Image 2 (snowboard + chart illustration, blue gradient) — 1024×1024 PNG
- Current icon is the AI-generated placeholder — update before v1.0.1
- Splash screen (Image 1 — cinematic dark/cyan) is correctly set in app.json

### Version Numbering
- v1.0 shipped as 0.1.0 in the build — **update version in app.json to 1.0.0** before next build
- Update `ios.buildNumber` to increment each submission

### Screenshots
- Real device/simulator screenshots preferred over generated ones for future updates
- Current screenshots are programmatically generated — good enough for v1, upgrade for v1.1
- Use iPhone 15 Pro Max simulator (6.7") for future shots — Apple now prefers 6.7" over 6.5"
- Also need **5.5" screenshots** (iPhone 8 Plus size) — skipped in v1.0, add in v1.0.1

### App Store Connect — Things to Pre-fill Next Time
- **Copyright field** — fill in before review submission (blocked us this time): `© 2026 Joe Bell`
- **Content Rights** — select third-party content option upfront
- **Age Rating** — complete questionnaire before submission: Simulated Gambling = None, Contests = Infrequent
- **Privacy Practices** — fill out App Privacy section before submit
- **Test account credentials** — create a test account in the app and add to App Review Notes

### For v1.0.1 (post-approval quick update)
- [ ] Update app icon to Image 2
- [ ] Fix version to 1.0.1
- [ ] Add 5.5" screenshots
- [ ] Add real simulator screenshots to replace generated ones
- [ ] Add test account credentials to App Review Notes

### For v1.1 (feature update)
- [ ] Onboarding flow for new users
- [ ] Push notification support for price alerts
- [ ] Android build via EAS (`eas build --platform android`)
- [ ] X/Twitter @Slope_Flow feed integration in Signal Feed

---

## App Name
SlopeFlow: Teen Trading Education

## Subtitle (30 chars max)
Learn Markets. Read the Line.

## Category
Primary: Finance
Secondary: Education

## Privacy Policy URL
https://slopeflow.github.io/slopeflow/privacy.html

## Age Rating
12+ (Infrequent/Mild Simulated Gambling — paper trading context)

---

## Description (4000 chars max)

SlopeFlow teaches teenagers how to read markets — not just follow hype.

Built with real teen input, SlopeFlow cuts through the noise and gives young traders the signal they actually need. No meme stocks. No influencer picks. No fake promises. Just real market education delivered in a language that hits different.

**READ THE LINE**
Our daily chart challenge puts a real BTC setup in front of you and asks one question: what happens next? Make your call, see the answer, learn why. Get it right and your streak grows. Miss it and learn something better — why you were off.

**SIGNAL FEED**
A curated news feed filtered for what actually matters — BTC moves, macro events, Fed decisions, institutional flows. We kill the noise so you can focus on the signal.

**BTC DASHBOARD**
Live Bitcoin price, 7 time ranges (15M to 1Y), halving context, market stats, and price alerts — all in one clean view. Set a target price and we'll flag it when BTC gets there.

**STACK YOUR RUN**
Build a dividend watchlist with real stocks. Track price, 24h change, and dividend yield. Add any ticker. Learn why compounding matters before you have real money on the line.

**THE SLOPE PHILOSOPHY**
Great snowboarders don't just drop in and wing it — they read the terrain, stack their tricks in sequence, and know exactly where their bail point is. Trading is the same. SlopeFlow teaches you to think like that.

- Read the Line = analyze the chart
- Stack your run = build positions methodically  
- Know your bail point = always have a stop loss

**FOR PARENTS**
SlopeFlow uses no real money. Ever. It's a pure education platform that teaches market literacy, risk awareness, and financial discipline. Everything a teen needs to be dangerous in the best possible way.

---

## Keywords (100 chars max)
bitcoin,trading,teens,stocks,finance,education,crypto,investing,learn,BTC,markets,dividend

---

## What's New (v1.0)
First release. Live BTC dashboard, daily chart challenges, curated signal feed, dividend watchlist, and streak tracking. Built for the next generation of traders.

---

## Support URL
https://github.com/SlopeFlow/slopeflow

## Marketing URL (optional)
https://slopeflow.github.io/slopeflow

---

## App Store Screenshots — Shot List

### iPhone 6.5" (required)
1. BTC Dashboard — live price + chart
2. Read the Line — daily challenge in progress
3. Signal Feed — filtered news cards
4. Watchlist — dividend stocks with yield
5. Onboarding — welcome/interest screen

### iPhone 5.5" (required)
Same 5 shots, same order

### iPad (optional for v1 — skip)

---

## Screenshot Captions
1. "Live BTC price, charts, and price alerts"
2. "Daily chart challenge — read the market, not the hype"
3. "Curated signal feed — noise filtered"
4. "Track dividend stocks and build long-term habits"
5. "Built for teens who want the real thing"

---

## App Review Notes (for Apple reviewer)
- No real money transactions of any kind
- No in-app purchases in v1
- Paper trading / education only
- Users must be 13+ to create an account
- Privacy policy: https://slopeflow.github.io/slopeflow/privacy.html
- Test account: (create before submission and add credentials here)
