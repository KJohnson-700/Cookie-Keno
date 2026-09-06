# Click The Cookie — Cookie Clicker on Cookie Chain

> A cApp submission for the Cookie Chain cApp program. Cookie Clicker, fully on-chain.

---

## The pitch (the X-thread hook)

> I built Cookie Clicker on the actual Cookie Chain.
> Every click is a real on-chain transaction.
> Every upgrade lives in a PDA.
> Every Golden Cookie is a real COOK airdrop.
> If you hold a .cook name, you get a click multiplier.
> Welcome to the most memetic use of an SVM.

---

## The brief (paraphrased)

Build a Cookie App (cApp) on Cookie Chain — a community-driven SVM ecosystem.
- Connect a wallet (Nightly required)
- Real on-chain interaction on Cookie Chain
- Real-time tx feedback
- Application-specific data + analytics
- Use existing CookieChain programs (CookieBox, CookieSwap, Cookie DAS, cookie-mcp)
- Live + open source + documented

---

## Why this app wins (vs the alternatives we considered)

| Dimension | Cookie Clicker | Keno / Crash / Coinflip | Copy-trader | Launchpad |
|---|---|---|---|---|
| Cookie-specificity | **100%** (chain is named after the concept) | 20-30% (skin) | 10% | 30% |
| On-chain depth | **100+ tx per active user** | 1 tx per bet | Reads-heavy | 1 tx per trade |
| Viral / X-thread hook | **"Cookie Clicker on Cookie Chain"** | "I built keno" | "copy trader" | crowded category |
| "Epic" factor | **High (Cookie Clicker is iconic)** | Low | Low | Medium |
| Useful | **Yes — drives COOK burns, cNFT minting, .cook utility** | Medium | Low | Medium |
| Provably-fair RNG | **Yes — built-in Golden Cookie lottery** | Yes (whole game is RNG) | No | No |
| Regulatory risk | **None** | Medium-high (gambling) | None | None |
| Buildable in a week | Yes | Yes | Yes | 2-3 weeks (agent variant) |
| Already saturated? | No (Cookie + on-chain is novel) | Yes (every chain has them) | Yes (Bullx, Padre, GMGN) | Yes (Virtuals just launched on Solana Aug 24 2026) |

**Verdict**: Clicker is the only one that's (a) uniquely Cookie Chain, (b) high on-chain depth by default, (c) viral by default, and (d) defensible against "this is generic." The chain's whole memetic identity is the cookie metaphor — the answer was right there.

---

## Core game loop

1. User connects **Nightly wallet** → cookie unlocks
2. User clicks the cookie → **1 real tx** to the clicker program on Cookie Chain
3. Each click:
   - **Burns** a tiny amount of COOK (e.g., 0.0001 COOK)
   - **Increments** on-chain "click count" PDA
   - **Mints** a "crumb" cNFT (Bubblegum) as a receipt
4. User spends crumbs to buy upgrades — each upgrade is an on-chain PDA
5. Upgrades auto-multiply earnings (computed on-chain from upgrade state)
6. **Golden Cookie** (~0.5% per click):
   - Triggered by on-chain pseudo-randomness
   - **Airdrops real COOK** from a treasury PDA
   - Big XP boost, mints a special "Golden Crumb" cNFT
7. **.cook name holders** get a click multiplier (read from name service on-chain)
8. Real-time leaderboard from on-chain state (indexed off-chain for speed)

---

## Architecture

```
cookie-clicker/
├── programs/clicker/          # Anchor program (Rust) — deployed to Cookie Chain
│   ├── src/
│   │   ├── lib.rs             # entry point
│   │   ├── state.rs           # PDA accounts
│   │   ├── instructions/      # click, buy_upgrade, claim_golden
│   │   └── errors.rs
│   ├── Cargo.toml
│   └── Anchor.toml
├── app/                       # Next.js frontend (TypeScript, Tailwind)
│   ├── app/                   # pages (App Router)
│   ├── components/            # Cookie, UpgradeShop, Leaderboard, Dashboard, etc.
│   ├── lib/                   # wallet, anchor client, cookie-mcp
│   └── public/                # assets
├── scripts/                   # deploy, init, leaderboard indexer
├── THESIS.md                  # this file
├── CLAUDE.md                  # Claude Code project memory
├── AGENTS.md                  # Mavis / multi-tool project memory
└── README.md                  # public setup instructions
```

---

## Tech stack (locked)

- **Smart contract**: Anchor 0.x (Rust), deployed to Cookie Chain
- **Frontend**: Next.js 14 (App Router), Tailwind, TypeScript
- **Wallet**: Solana wallet adapter + Nightly (the only wallet on Cookie Chain)
- **On-chain reads**: cookiescan.io API + cookie-mcp
- **Tokens**: COOK (SPL), Metaplex (NFTs), Bubblegum (cNFTs)
- **Names**: .cook name service (read-only)
- **Hosting**: Vercel (frontend)
- **Repo**: GitHub (public)

---

## Cookie Chain specifics (verified)

- **RPC**: `https://rpc.cookiescan.io`
- **Wallet**: Nightly (cookie chain's first supported wallet)
- **Native token**: COOK
- **Sub-second finality** (~1s slots)
- **Sub-cent fees** (gas paid in COOK)
- **Genesis-embedded programs**:
  - SPL Token (`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`)
  - Token-2022 (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`)
  - Metaplex (`metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`)
  - Bubblegum cNFTs (`BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY`)
  - Squads v4 — Cookie Quads (`SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf`)
  - Name Service (.cook) (`namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX`)
  - Jupiter v6 (`JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4`)
  - Raydium AMM v4 + CLMM
  - Orca Whirlpool
  - Meteora CookieBox (DBC, DAMM v2, CLMM)
  - DefiLlama tracker (live)

---

## Build phases (5–7 days)

### Day 1 — Anchor program + devnet
- Scaffold Anchor program
- Implement: `click` instruction, click counter PDA, COOK burn transfer
- Build, test, deploy to Cookie Chain devnet
- Init a treasury PDA funded with COOK

### Day 2 — Frontend skeleton + wallet
- Next.js scaffold, Tailwind, wallet adapter
- Nightly wallet integration
- "Click the cookie" button → real tx → toast + counter update
- Cookie animation (squish on click)

### Day 3 — Upgrades + golden cookies
- Upgrade PDAs (cursor, grandma, farm, mine, factory, bank, temple, wizard — 8 buildings, like the original)
- `buy_upgrade` instruction (spend crumbs, increment multiplier)
- Golden cookie pseudo-random + `claim_golden` airdrop instruction
- Upgrade shop UI

### Day 4 — Real-time dashboard
- Live leaderboard (off-chain indexer → cookiescan polling → real-time UI)
- Charts: clicks/sec, COOK burned, top players, golden cookies minted
- .cook name multiplier (read from name service, display in profile)
- Analytics page

### Day 5 — Mainnet + polish
- Deploy to Cookie Chain mainnet
- Vercel deploy frontend
- README + setup instructions
- X thread draft (final polish)

### Day 6–7 — Buffer
- Cookie Chain mainnet quirks
- Bug fixes
- Demo recording (Loom / screen capture for X thread)
- Bridge to community (Telegram, X)

---

## What's in scope (MVP)

- [x] Click → tx → counter update
- [x] COOK burn per click
- [x] Crumb cNFT receipt per click (Bubblegum)
- [x] 8 upgrades (cursor, grandma, farm, mine, factory, bank, temple, wizard)
- [x] Golden Cookie airdrop
- [x] .cook name multiplier
- [x] Real-time leaderboard
- [x] Live analytics dashboard
- [x] Nightly wallet
- [x] CookieChain mainnet deploy
- [x] Vercel deploy
- [x] GitHub repo
- [x] README
- [x] X thread

---

## What's out of scope (deferred)

- Mobile native (web responsive only)
- Real AI / LLM integration
- Cross-chain bridges
- Token launches or DeFi features
- Login / accounts (wallet = identity)
- PvP / multiplayer (single-player game)
- Light/dark theme toggle (just one theme that fits CookieChain aesthetic)

---

## Submission requirements

- [ ] Live application URL (Vercel)
- [ ] GitHub repository (public)
- [ ] Program address (Anchor program deployed to Cookie Chain)
- [ ] COOK token mint address
- [ ] Crumb cNFT collection address
- [ ] Comprehensive README with setup
- [ ] X thread explaining the app (5-7 tweets)
- [ ] X thread shared in Cookie Chain Telegram (`t.me/TheCookieNetChain`)

---

## X thread (draft — final polish on Day 5)

> **1/** I built Cookie Clicker on the actual Cookie Chain. 🍪
>
> **2/** Every click is a real on-chain transaction. Sub-second finality + sub-cent fees = perfect for a clicker.
>
> **3/** Every upgrade lives in a PDA. Every Golden Cookie is a real COOK airdrop. Every crumb is a cNFT on Bubblegum.
>
> **4/** If you hold a .cook name, you get a click multiplier. Your wallet IS your save file.
>
> **5/** Live now: [link]. Click the cookie. 🍪
>
> **6/** Bridge COOK over at the Cookie Chain Bridge and start clicking. Welcome to the most memetic use of an SVM. Built on @TheCookieChain.

---

## Open questions to resolve (Day 1)

- [ ] COOK token mint address on Cookie Chain (look on cookiescan.io)
- [ ] .cook name service: program ID + account layout (verified at `namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX`)
- [ ] Bubblegum tree config (use Metaplex standard)
- [ ] Anchor version that works with Cookie Chain (probably latest Solana-compatible)
- [ ] Cookie Chain devnet availability for testing
- [ ] cookiescan.io API endpoints for live data
- [ ] cookie-mcp endpoints and capabilities

---

## References

- Cookie Chain docs: https://docs.cookiechain.wtf
- Cookie Chain ecosystem: https://www.cookiechain.wtf/ecosystem
- CookieScan: https://cookiescan.io
- Cookie Chain RPC: https://rpc.cookiescan.io
- Nightly wallet: nightly.app
- Bubblegum (Metaplex): https://developers.metaplex.com/bubblegum
- Anchor: https://www.anchor-lang.com
- Original Cookie Clicker (for design reference): https://orteil.dashnet.org/cookieclicker/

---

## License

MIT (open source, as required by the brief).
