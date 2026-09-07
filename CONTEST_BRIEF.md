# Cookie Chain cApp Contest — Full Brief (verbatim from user, 2026-09-06)

> This is the original contest brief the user pasted at the start of the project.
> Preserved verbatim so the next agent (Claude Code, Mavis, or the user) can
> verify compliance against the actual rules, not my paraphrase.

---

## Original brief (verbatim)

> Heres our next project. Gain scope then give me your best 3 options for what to build by doing research on whats trending rn or that has a good narritive **Build a cApp on Cookie Chain**
>
> Create an innovative cApp (Cookie App) on Cookie Chain and showcase the power of a fast, community-driven SVM ecosystem.
>
> Cookie Chain is built for experimentation, rapid iteration, and on-chain culture. With sub-second finality, minimal transaction fees, Solana compatibility, and program deployments costing only a few cents, builders can ship quickly without worrying about infrastructure costs.
>
> Your application should leverage Cookie Chain's infrastructure, wallet connectivity, and on-chain interactions. You can also integrate tools like Cookiebox, Cookieswap, api.cookiescan.io, and cookie-mcp for liquidity, trading, analytics, or market-related functionality.
>
> Projects can span virtually any category:
>
> DeFi
> Gaming
> Social platforms
> Creator tools
> Marketplaces
> Analytics dashboards
> AI-powered applications
> Bots & automation
> Public goods
> Developer tooling
>
> Build something useful.
> Build something fun.
> Build something degenerate.
> We want to see epic creations.
>
> 🎁 Why Build on Cookie Chain?
> Fast, Solana-compatible SVM infrastructure
> Sub-second transaction finality
> Extremely low transaction fees
> Program deployments costing approximately $0.05
> Builder-friendly environment for rapid experimentation
> Community-owned and community-operated ecosystem
> Support for SPL Tokens, Token-2022, Metaplex, and familiar Solana tooling
>
> 🎯 Objective
> Build a web application that demonstrates meaningful interaction with Cookie Chain.
>
> Your application must allow users to:
>
> Connect a wallet (Nightly support is required)
> Interact with on-chain functionality on Cookie Chain
> Execute transactions and receive real-time feedback
> View application-specific data and activity
> Access analytics, charts, or dashboards where relevant
> Utilize existing Cookie Chain programs for liquidity, swaps, trading, or tokenized assets (where applicable)
> Receive clear transaction status updates
>
> Required Features
> Wallet connection functionality
> Display connected wallet address
> Transaction execution
> Transaction confirmation handling
> Error handling and user feedback
>
> 🛠 Core Application Ideas
> Examples include:
>
> DeFi protocols
> Prediction markets
> Creator platforms
> On-chain games
> AI-powered dApps
> Trading platforms
> Analytics dashboards
> Social applications
> Bots and automation tools
> Public goods
> Developer tooling
>
> The key requirement is demonstrating meaningful on-chain interaction with Cookie Chain.
>
> 🍪 Optional Cookie Ecosystem Integrations
> Additional integrations are encouraged where relevant:
>
> Token launches
> Liquidity pool creation
> Swaps and trading functionality
> Market making
> Asset management
> Trading dashboards
> Cookiebox
> Cookieswap
> Cookie DAS API
> CookieScan
> cookie-mcp
>
> ⚙️ Technical Requirements
> Must be built on Cookie Chain (SVM)
> Use Cookie Chain SDKs and infrastructure where applicable
> Cookiebox, Cookieswap, Cookie DAS and cookie-mcp integrations are encouraged
> Application must be deployed and publicly accessible
> Source code must be open source
> Include a comprehensive README with setup instructions
>
> 📦 Submission Requirements
> Submit the following:
>
> Live application URL
> GitHub repository
> Relevant program, contract, token, or application addresses (if applicable)
> Comprehensive README with setup
> X thread
> Telegram share
>
> 🎥 Demo Requirements
> Create an X (Twitter) thread that:
>
> Explains what your application does
> Demonstrates how users can use it
> Includes a guide directing users to the Cookie Chain Bridge where relevant
>
> Final Step: Share your X thread in the Cookie Chain Telegram community.
>
> 📚 Resources
>
> Cookie Chain Homepage: https://www.cookiechain.wtf
> Cookie Chain documentation: https://docs.cookiechain.wtf
> Cookie Chain API Documentation: https://api.cookiescan.io
> Cookie Chain RPC Endpoint: https://rpc.cookiescan.io
> Telegram: https://t.me/TheCookieNetChain
> Discord: https://discord.gg/XqnStmWgNu
> X: https://x.com/TheCookieChain

---

## Required Features (parsed from brief)

These are the **required** features the app MUST have. Compliance is checked at submission:

- [ ] **Wallet connection functionality** — Nightly support specifically required
- [ ] **Display connected wallet address** — shown in the UI
- [ ] **Transaction execution** — real on-chain txs on Cookie Chain
- [ ] **Transaction confirmation handling** — show status updates in real-time
- [ ] **Error handling and user feedback** — toasts, alerts, etc.
- [ ] **Live application URL** — publicly accessible
- [ ] **GitHub repository** — public, open source
- [ ] **README** — comprehensive setup instructions
- [ ] **X thread** — explains what the app does, demos usage, directs to bridge
- [ ] **Telegram share** — in `t.me/TheCookieNetChain`

## Encouraged (but not required)

- [ ] Cookiebox integration (Meteora DBC, DAMM v2, CLMM on Cookie Chain)
- [ ] Cookieswap integration (the native DEX)
- [ ] Cookie DAS API (the `.cook` name service, account resolution)
- [ ] cookie-mcp (live data, AI agent access)
- [ ] Cookiescan (`https://cookiescan.io` for tx history / analytics)
- [ ] Application addresses recorded (program ID, treasury pubkey, token mints)

---

## Submission checklist (track these as you build)

| Item | Status | Notes |
|---|---|---|
| Wallet connection (Nightly) | ✅ Built | Custom adapter, see `app/lib/nightly-adapter.ts` |
| Display wallet address | ✅ Built | Truncated in `WalletButton.tsx` |
| Transaction execution | ✅ Built (clicker) / needs keno | Real on-chain txs confirmed working (1 click on clicker) |
| Transaction confirmation | ✅ Built | `confirmSignature()` in `app/lib/clicker.ts` (rename to `app/lib/keno.ts` in Stage 2) |
| Error handling + user feedback | ✅ Built | Red toasts in `app/app/page.tsx` |
| Nightly support specifically | ✅ Built | Custom adapter wraps `window.nightly.solana` |
| Live URL | ❌ **TODO** | Need Vercel deploy (Stage 7) |
| GitHub public repo | ❌ **TODO** | Local git exists, need to push to GitHub |
| README with setup | 🟡 Partial | `app/README.md` exists but covers clicker; needs keno rewrite |
| X thread | 🟡 Drafted in THESIS | Need to actually post |
| Telegram share | ❌ **TODO** | Share in `t.me/TheCookieNetChain` |

## Encouraged integrations (status)

| Integration | Used? | How |
|---|---|---|
| Cookiebox (Meteora DBC/DAMM/CLMM) | ❌ Not used | Could anchor the bankroll in a Meteora pool for yield |
| Cookieswap | ❌ Not used | Could let users swap other tokens → COOK to play |
| Cookie DAS API (`.cook` names) | 🟡 Stage 6 | Reading user's .cook name for multiplier |
| cookie-mcp | ❌ Not used | Could serve live leaderboard via AI agent interface |
| Cookiescan | 🟡 Stage 5 | Reading tx history for leaderboard |

---

## Demo requirements (X thread)

The X thread must:

1. **Explain** what the app does (Cookie Keno on Cookie Chain)
2. **Demonstrate** how users use it (pick numbers → place wager → see draw → get paid)
3. **Direct** users to the Cookie Chain Bridge (`https://bridge.cookiescan.io`) so they can fund their wallet

Draft lives in `THESIS.md` § "X thread (draft)" — needs to be posted.

---

## Final submission step

> Final Step: Share your X thread in the Cookie Chain Telegram community.

URL: `https://t.me/TheCookieNetChain`

---

## Where the next agent (Claude Code) needs to pick this up

1. Read `THESIS.md` first (full keno spec)
2. Read `CLAUDE.md` (handoff doc, stages, verification loop)
3. Read this file (`CONTEST_BRIEF.md`) to verify compliance
4. Build stages 0–7 per CLAUDE.md
5. **The submission checklist above is the final acceptance gate** — every box must be checked before the user submits
