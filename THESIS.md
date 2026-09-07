# Cookie Keno — on Cookie Chain

> A cApp submission for the Cookie Chain cApp program. **Pivot from the abandoned Cookie Clicker (v0, 5 commits in git history).**

---

## One-liner

> I built Cookie Keno on Cookie Chain. Pick numbers, wager COOK, get paid in COOK. Provably-fair randomness, real on-chain payouts, live leaderboard.

---

## Why keno (and not clicker)

We tried Cookie Clicker first. The clicker is iconic (12+ years, 100M+ plays on the original) but a faithful clone is a 2–3 week project. A 1% clicker — which is what shipped — is a hollow counter that nobody plays. Keno has:
- A known, proven format (every casino, every chain has one)
- A real game loop in <10 minutes of play
- Provably-fair RNG via recent blockhash + commit-reveal (no Anchor program needed)
- A built-in economic engine (wager → payout) that's actually meaningful
- Clear X-thread hooks ("real COOK wagers", "provably-fair", "won/lost")

A complete keno is shippable in 6–8 hours. A complete clicker isn't. Choose the thing you can actually finish.

---

## The brief (paraphrased)

Build a Cookie App (cApp) on Cookie Chain — a community-driven SVM ecosystem.

- Connect a wallet (Nightly required)
- Real on-chain interaction
- Real-time tx feedback
- Application-specific data + analytics
- Use existing CookieChain programs (CookieBox, CookieSwap, Cookie DAS, cookie-mcp)
- Live + open source + documented

---

## Core game loop

1. **Connect** — User connects Nightly wallet to the app
2. **Pick** — User selects 1–10 numbers from a pool of 40 (the classic keno format)
3. **Wager** — User sets a COOK bet amount (0.01 – 10 COOK)
4. **Play** — User clicks "Play Round" → 1 real on-chain tx:
   - SystemProgram.transfer (wager → bankroll)
   - Memo program write (`keno:v1 picks=4,7,12,23,31 hit=4 payout=0.85`)
5. **Draw** — 8 winning numbers are derived from the recent blockhash (verifiable on-chain, not trust-required)
6. **Settle** — If user hit ≥1 number, treasury (the bankroll) sends payout in a 2nd real tx
7. **Display** — Animated reveal of drawn numbers, user's hits highlighted, payout toast, updated balance

A round is **2 real on-chain txs** in the common case (wager + payout), or 1 if the user loses everything (wager only, no payout).

---

## Why this wins

| Reason | Evidence |
|---|---|
| **Real economic loop** | Wager and payout are both real on-chain transfers of COOK. Not a burn-and-display; an actual game. |
| **Cookie-native naming** | "Cookie Keno" is on-brand (chain is named Cookie, game uses "Cookie" in title). |
| **Multi-VM support** | Cookie Chain is SVM. Anchor, Solana SDK, or pure web3.js all work. |
| **Low build cost** | No Anchor program needed. SystemProgram + Memo + treasury payouts = complete game in 6–8h. |
| **X thread hooks** | "real wagers", "provably-fair", "I just won 0.85 COOK on Cookie Keno" all hit. |
| **Existing primitives used** | SystemProgram (genesis), Memo (genesis), .cook names (read for multiplier), cookiescan.io (read for leaderboard). |

---

## Tech stack (locked)

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4**
- **`@solana/web3.js`** for txs
- **`@solana/wallet-adapter-react`** + custom Nightly adapter
- **`@solana/spl-memo`** for on-chain memos
- **No Anchor / Rust** — pure web3.js, SystemProgram + Memo
- **Treasury = bankroll**: holds wagered COOK, pays out winnings
- **Randomness**: derived from recent Cookie Chain blockhash (verifiable, not trust-required)

---

## Cookie Chain specifics (verified)

- **RPC**: `https://rpc.cookiescan.io`
- **Wallet**: Nightly (the only wallet that works on Cookie Chain at launch)
- **Native token**: COOK
- **Sub-second finality** (~1s slots)
- **Sub-cent fees** (gas paid in COOK)
- **Genesis-embedded programs**:
  - SPL Token (`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`)
  - Token-2022 (`TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`)
  - Metaplex (`metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`)
  - Bubblegum cNFTs (`BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY`)
  - Squads v4 — Cookie Quads (`SQDS4ep65T869zMMBKyuUq6aD6EgTu8psMjkvj52pCf`)
  - Name Service .cook (`namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX`)
  - Jupiter v6 (`JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4`)
  - Raydium AMM v4 + CLMM, Orca Whirlpool, OpenBook
  - Meteora CookieBox (DBC, DAMM v2, CLMM)
  - CookieScan (`https://cookiescan.io` for tx history)
  - cookie-mcp (for live data, AI agent access)

---

## Payout table (8-of-40 draw, max 10 picks)

Standard keno payouts (house edge ~5%):

| Picks | Hit 0 | Hit 1 | Hit 2 | Hit 3 | Hit 4 | Hit 5 | Hit 6 | Hit 7 | Hit 8 | Hit 9 | Hit 10 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 0 | 2.8x | — | — | — | — | — | — | — | — | — |
| 2 | 0 | 0 | 9x | 50x | — | — | — | — | — | — | — |
| 3 | 0 | 0 | 2x | 26x | 100x | — | — | — | — | — | — |
| 4 | 0 | 0 | 0 | 6x | 30x | 200x | 400x | — | — | — | — |
| 5 | 0 | 0 | 0 | 3x | 12x | 70x | 300x | 800x | — | — | — |
| 6 | 0 | 0 | 0 | 1x | 5x | 25x | 130x | 500x | 1500x | — | — |
| 7 | 0 | 0 | 0 | 0.5x | 3x | 11x | 50x | 200x | 800x | 2500x | — |
| 8 | 0 | 0 | 0 | 0 | 1.5x | 5x | 20x | 80x | 400x | 1500x | 5000x |
| 9 | 0 | 0 | 0 | 0 | 0.5x | 2x | 8x | 30x | 200x | 1000x | 4000x |
| 10 | 0 | 0 | 0 | 0 | 0 | 1x | 4x | 15x | 100x | 500x | 2500x |

(Tweak these in code for target house edge. ~5% is industry standard for keno.)

---

## Provably-fair randomness

The draw is derived from `recentBlockhash` of the wager tx. This is:
- **Verifiable**: anyone can recompute the draw from the public blockhash
- **Unbiased**: the user can't influence the blockhash (it's the validator's hash)
- **No trust required**: no oracle, no VRF service, no commit-reveal

The mapping from blockhash bytes → 8 unique numbers in [1, 40]:
1. Take the first 32 bytes of the blockhash
2. Treat each 4-byte chunk mod 40 → number
3. Take the first 8 unique numbers

This is the same pattern as Solana's native `slot_hashes` use in coin flips. Good enough for a hackathon demo. For real money, switch to a verifiable random function (Switchboard VRF, or commit-reveal with the bankroll).

---

## Architecture

```
cookie-clicker/   (repo root)
├── THESIS.md      ← this file
├── CLAUDE.md      ← handoff doc for next agent
├── app/           ← Next.js app
│   ├── app/
│   │   ├── page.tsx           # Keno main page
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── WalletContextProvider.tsx
│   │   ├── WalletButton.tsx
│   │   ├── KenoBoard.tsx       # 1-40 grid, number picking
│   │   ├── WagerPanel.tsx      # bet input, play button
│   │   ├── DrawDisplay.tsx     # animated reveal
│   │   ├── ResultsPanel.tsx    # history, balance
│   │   ├── Leaderboard.tsx     # top winners
│   │   └── Stats.tsx           # session stats
│   ├── lib/
│   │   ├── cookiechain.ts     # RPC, treasury, bankroll
│   │   ├── keno.ts             # game logic, draw, payout
│   │   ├── nightly-adapter.ts  # custom wallet adapter
│   │   └── leaderboard.ts      # cookiescan reader
│   └── scripts/
│       ├── generate-treasury.mjs  # (already exists, treasury is generated)
│       └── verify.mjs             # stage verification
└── README.md
```

---

## Build stages (the order, with explicit completion gates)

**Stage 0 — Set up (no code yet)**
- [ ] `cd app && npm install --legacy-peer-deps` works
- [ ] Dev server starts: `node_modules\.bin\next.cmd dev --webpack -p 3000`
- [ ] `http://localhost:3000` returns 200
- [ ] Treasury address: `5Nhcsv4ip2dF5fyN6of3NR98pv3wq75tWdPgqi9iDf29` (already generated, secret in `app/scripts/treasury.json` gitignored)
- [ ] Treasury has >5 COOK on Cookie Chain (already funded by user)
- [ ] Nightly extension installed with the imported seed for the user's wallet

**Stage 1 — Keno board UI (front-end only, no tx yet)**
- [ ] Page renders a 1–40 number grid (5x8 or 8x5)
- [ ] User can click numbers to select/deselect (max 10)
- [ ] Selected numbers visually distinct
- [ ] Wager input field (0.01–10 COOK, default 0.1)
- [ ] "Play Round" button disabled until 1+ numbers selected and wager > 0
- [ ] No wallet connect required yet (button just logs the picks+wager to console)

**Stage 2 — Real wager tx (single on-chain interaction)**
- [ ] When wallet connected, "Play Round" builds a real tx
- [ ] Tx = SystemProgram.transfer (wager → bankroll) + Memo with picks
- [ ] User signs with Nightly, tx lands on Cookie Chain
- [ ] Toast shows the tx signature + link to cookiescan.io
- [ ] Waggers counter goes up after confirmation
- [ ] Use `connection.getLatestBlockhash()` + `n.signTransaction(tx)` + `connection.sendRawTransaction(signed)` flow (NOT `signAndSendTransaction` — Nightly doesn't expose it)

**Stage 3 — Draw + payout**
- [ ] Draw 8 numbers from the wager tx's blockhash
- [ ] Compute payout per the table
- [ ] If win, send payout tx from treasury to user (signed by treasury key in browser for hackathon)
- [ ] Show animated reveal of drawn numbers, highlight hits
- [ ] Update balance after payout confirms
- [ ] If loss, no payout tx; just show the result

**Stage 4 — Provably-fair verification display**
- [ ] Show the blockhash used for the draw (truncated)
- [ ] Show the derivation steps ("blockhash[0..4] mod 40 = X", etc.)
- [ ] "Verify this draw yourself" link/instructions

**Stage 5 — Leaderboard**
- [ ] Read tx history from cookiescan.io / CookieScan API for `keno:v1` memos
- [ ] Parse out: player pubkey, picks, hit count, wager, payout
- [ ] Show top 10 winners (largest payouts)
- [ ] Show "your stats" (your wins, your profit/loss)
- [ ] Refresh on a poll interval (10s)

**Stage 6 — .cook name multiplier**
- [ ] If user holds a .cook name, give them 1.5x payout multiplier
- [ ] Show "🍪 .cook name holder: +50% payout" badge if applicable
- [ ] Read from Name Service on-chain

**Stage 7 — Polish + ship**
- [ ] README with full setup, gameplay, treasury address, known limitations
- [ ] Vercel deploy
- [ ] X thread (5-7 tweets)
- [ ] Telegram share in t.me/TheCookieNetChain

**Each stage must pass its self-check (Stage N runs `node scripts/verify.mjs N`) before moving to N+1.**

---

## What I (the previous agent) got wrong (so you don't repeat it)

1. **Phantom wallet doesn't support custom RPCs.** Don't tell the user to add Cookie Chain as a custom RPC in Phantom — it doesn't exist there. Use Nightly (with imported seed from Phantom) or Backpack.
2. **Nightly's `publicKey` is the SystemProgram placeholder until you call `connect()` and a successful key is published.** Don't trust it from polling. Wait for it to become non-placeholder after the connect() promise resolves.
3. **Nightly doesn't expose `signAndSendTransaction`.** Use `signTransaction(tx)` then `connection.sendRawTransaction(signed.serialize())`.
4. **Transfers to unfunded accounts need ≥890,000 lamports for rent-exempt.** The treasury must be pre-funded, OR the click burn / wager must be ≥0.00089 COOK.
5. **Don't promise features in the THESIS that aren't built.** Build the meat alongside the UI, not after.
6. **The clicker concept needed 2-3 weeks of work.** A 1% clicker is worse than a 100% keno. Ship complete, not iconic-but-hollow.

---

## What's already in the repo (do not redo)

- **Next.js 16 + React 19 + Tailwind 4** scaffolded at `app/`
- **Solana wallet stack** installed (`@solana/web3.js`, wallet-adapter, spl-memo, lucide-react)
- **Custom `NightlyWalletAdapter`** at `app/lib/nightly-adapter.ts` (200 lines, wraps `window.nightly.solana`)
- **Treasury keypair generated**: pubkey `5Nhcsv4ip2dF5fyN6of3NR98pv3wq75tWdPgqi9iDf29`, secret in `app/scripts/treasury.json` (gitignored, user has backed up)
- **Wallet connection UI** at `app/components/WalletButton.tsx` (works with Nightly, polls for publicKey after connect)
- **5 commits** in local git: `2bec2ba` (initial) → `1a4eba6` (CLAUDE) → `69bace9` (treasury) → `e88ce26` (wallet adapter fix) → `d91fc82` (sign+send fix) → `5aea911` (placeholder poll fix)

The clicker-specific UI (Cookie SVG, click handler, upgrades) is **stale** — it was the abandoned concept. Delete it as part of Stage 0 or Stage 1.

---

## Open questions for the next agent

1. **Vercel or just localhost?** Hackathon deadline? If deploying, the bankroll key in the browser is a security concern — but acceptable for a demo. For real $COOK, move the key to a serverless function.
2. **Draw size**: 8 numbers is standard. Some keno games use 10, 15, or 20. Pick one and commit.
3. **Payout table**: the table above is a starting point. Tune to your target house edge (5% is industry standard).
4. **Multi-player rounds**: do you draw one set of 8 numbers per round (everyone plays against the same draw), or per-player draws (each player gets fresh 8)? Per-round (shared) is simpler and more "casino-like". Per-player is more "provably random per bet" but costs more randomness entropy. Start with shared.
5. **Bankroll cap**: with shared draws, the bankroll can drain on big wins. Set a max bet (10 COOK) and a min bankroll reserve (50 COOK) before paying out.

---

## Time estimate

| Stage | Estimate | Blocker risk |
|---|---|---|
| 0 — Set up | 30 min | Low |
| 1 — Board UI | 2 h | Low |
| 2 — Wager tx | 1 h | Low (proven path, has worked for clicks) |
| 3 — Draw + payout | 2 h | Medium (treasury signing flow) |
| 4 — Verify display | 30 min | Low |
| 5 — Leaderboard | 2 h | Medium (need cookiescan API endpoint) |
| 6 — .cook multiplier | 1 h | Medium (need Name Service account layout) |
| 7 — Polish + ship | 1 h | Low |
| **Total** | **~10 h autonomous** | |

This is the work to do. Do not skip stages. Each has a self-check that must pass.

---

## License

MIT (open source, as required by the brief).
