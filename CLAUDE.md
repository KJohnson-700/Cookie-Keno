# CLAUDE.md — Click The Cookie

> Project memory for Claude Code (or any AI coding agent) working on this repo. Read this first.

## What this project is

**Click The Cookie** — a Cookie Clicker game, fully on-chain, deployed to Cookie Chain.

- The chain is named after the cookie metaphor. We're leaning all the way in.
- The full thesis, architecture, and build plan are in [THESIS.md](./THESIS.md). **Read that first if you haven't.**

## Status

- [x] Thesis greenlit
- [x] Folder created on Desktop (`C:\Users\AbuBa\Desktop\cookie-clicker\`)
- [x] THESIS.md and CLAUDE.md written
- [x] Repo initialized (git init) and first commit (2bec2ba)
- [x] Next.js 16 + React 19 app scaffolded in `app/`
- [x] Solana wallet stack installed (`@solana/web3.js`, wallet-adapter-react, spl-token, spl-memo, lucide-react)
- [x] Custom Nightly wallet adapter (no first-party adapter exists; wraps `window.nightly.solana`)
- [x] Clicker transaction builder (SystemProgram.transfer + Memo program)
- [x] Wallet connect UI, cookie SVG, stats grid, upgrade shop (8 buildings)
- [x] Dev server running on http://localhost:3000 — page returns 200
- [x] **Treasury keypair generated** (pubkey `5Nhcsv4ip2dF5fyN6of3NR98pv3wq75tWdPgqi9iDf29`, secret in `app/scripts/treasury.json` gitignored)
- [x] **Clicker logic simplified** — uniform burn per click; golden cookie is off-chain visual + counter boost (no double-burn)
- [x] README with full bridge instructions
- [ ] User bridges ~$1-2 of COOK from Solana → treasury + personal Nightly wallet
- [ ] First real on-chain click on Cookie Chain mainnet
- [ ] Real-time leaderboard via cookiescan API
- [ ] .cook name multiplier read
- [ ] Vercel deploy
- [ ] X thread posted
- [ ] Telegram share

## Dev commands

```bash
cd "C:\Users\AbuBa\Desktop\cookie-clicker\app"
.\node_modules\.bin\next.cmd dev --webpack -p 3000
```

Open http://localhost:3000 to test. Install Nightly from https://nightly.app and use the in-app Connect button.

## Treasury (locked in)

- **Public key**: `5Nhcsv4ip2dF5fyN6of3NR98pv3wq75tWdPgqi9iDf29`
- **Private key**: `app/scripts/treasury.json` (gitignored) — user must back this up
- **Funding path**: bridge SPL COOK from Solana via https://bridge.cookiescan.io to this address

## Key TODOs in code

- After deploy, optionally add the **starter-pack sponsor** feature (treasury → new user airdrop, requires backend/Vercel function)
- After deploy, optionally add the **real golden cookie airdrop** (treasury signs separate tx to user on golden hit, requires backend)

## Architectural decision: Path A (Lean)

We chose **no custom Anchor program** — every click is a SystemProgram.transfer (burning COOK) + Memo program write. PDAs and on-chain state are derived off-chain from the tx history. Saves us the Rust toolchain install (Rust/Cargo/Anchor are NOT on this machine) and ships faster. If the judges want a real program address, we can add it on Day 2-3.

## Tech stack (locked — don't substitute)

- **Chain**: Cookie Chain (SVM, Solana-compatible)
- **RPC**: `https://rpc.cookiescan.io`
- **Wallet**: Nightly (required by the brief; the only wallet on Cookie Chain)
- **Program framework**: Anchor (latest stable for Solana)
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind
- **Wallet adapter**: `@solana/wallet-adapter-react` + `@solana/wallet-adapter-nightly` (verify package name)
- **On-chain programs (genesis-embedded on Cookie Chain)**:
  - SPL Token: `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`
  - Token-2022: `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb`
  - Metaplex: `metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s`
  - Bubblegum (cNFTs): `BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY`
  - Name Service (.cook): `namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX`
  - Jupiter v6: `JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4`
- **Hosting**: Vercel (frontend)
- **Repo**: GitHub public
- **License**: MIT

## File structure (target)

```
cookie-clicker/
├── programs/clicker/          # Anchor program (Rust)
│   ├── src/
│   │   ├── lib.rs
│   │   ├── state.rs
│   │   ├── instructions/
│   │   │   ├── mod.rs
│   │   │   ├── click.rs
│   │   │   ├── buy_upgrade.rs
│   │   │   └── claim_golden.rs
│   │   └── errors.rs
│   ├── Cargo.toml
│   └── Anchor.toml
├── app/                       # Next.js frontend
│   ├── app/
│   │   ├── page.tsx           # main clicker page
│   │   ├── leaderboard/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Cookie.tsx
│   │   ├── UpgradeShop.tsx
│   │   ├── GoldenCookie.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── Dashboard.tsx
│   │   └── WalletButton.tsx
│   ├── lib/
│   │   ├── anchor.ts          # Anchor client setup
│   │   ├── cookiechain.ts     # RPC + connection
│   │   ├── cook-mcp.ts        # cookie-mcp client (if useful)
│   │   └── cookiescan.ts      # cookiescan API
│   └── public/
├── scripts/                   # Deploy + init + indexer
│   ├── init-treasury.ts
│   └── index-leaderboard.ts
├── THESIS.md                  # full spec (read first)
├── CLAUDE.md                  # this file
├── AGENTS.md                  # Mavis / multi-tool project memory
└── README.md                  # public setup instructions
```

## Build order (locked)

1. **Anchor program first** (the hard part):
   - `click` instruction (burn COOK, increment counter, mint crumb cNFT)
   - `buy_upgrade` instruction (spend crumbs, increment upgrade state)
   - `claim_golden` instruction (verify pseudo-random, airdrop COOK from treasury)
   - PDAs: player state, upgrades, golden cookie treasury
2. **Frontend second**:
   - Next.js + wallet adapter + Nightly
   - Click handler with tx toasts
   - Upgrade shop
   - Golden cookie popup
   - Leaderboard + analytics dashboard
3. **Deploy**:
   - Anchor: Cookie Chain mainnet
   - Frontend: Vercel
4. **Submit**:
   - GitHub public repo
   - Vercel URL
   - X thread (5-7 tweets)
   - Telegram share in `t.me/TheCookieNetChain`

## Key constraints

- **Every click = a real tx.** Sub-cent fees make this viable. Don't batch clicks client-side.
- **Sub-second finality** means clicks feel snappy. Don't add artificial latency.
- **COOK is the burn + earn token.** Need to find the COOK mint address on Cookie Chain (look on cookiescan.io or check the bridge page).
- **Nightly wallet is required** (the only wallet that works on Cookie Chain currently).
- **Programs deploy for ~$0.05.** Iterate cheaply.
- **Open source, MIT license, GitHub public.**

## Decisions made (don't re-litigate unless I tell you to)

- ✅ Game design: **Cookie Clicker** (not keno, crash, copy-trader, launchpad)
- ✅ Each click **burns COOK** (drives chain value)
- ✅ Each click **mints a crumb cNFT** (Bubblegum)
- ✅ Each upgrade **is a PDA**
- ✅ Golden Cookie = **lottery** (provably-fair, on-chain)
- ✅ .cook name = **click multiplier**
- ✅ Frontend: **Next.js** (not Vite/CRA)
- ✅ Wallet: **Solana wallet adapter + Nightly**
- ✅ No AI/LLM (deterministic logic only)
- ✅ No mobile native (web responsive only)

## Open questions to resolve (Day 1)

- [ ] COOK token mint address on Cookie Chain (search cookiescan.io or token list)
- [ ] .cook name service: account layout (PDA derivation pattern)
- [ ] Bubblegum merkle tree config
- [ ] Anchor version that works with Cookie Chain (likely 0.30+)
- [ ] Cookie Chain devnet availability (use mainnet if no devnet)
- [ ] cookiescan.io API endpoints (check for a `/api/...` route)
- [ ] cookie-mcp endpoints and capabilities (if it exists as a public MCP server)
- [ ] Nightly wallet adapter package name on npm

## Commands to remember

```bash
# Anchor (after installing: cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked)
anchor --version
anchor init programs/clicker --no-git
anchor build
anchor deploy --provider.cluster https://rpc.cookiescan.io
anchor test

# Frontend
cd app
npx create-next-app@14 . --typescript --tailwind --app
npm install
npm run dev
npm run build

# Wallet: Nightly (download from nightly.app; the cookie chain docs recommend it as the first supported wallet)

# Solana CLI
solana config set --url https://rpc.cookiescan.io
solana balance
solana airdrop 0.1  # may not work on Cookie Chain — check
```

## Style guide

- **Anchor program**: use the latest Anchor conventions (declare_id, Account<'info, T>, Context, etc.). Add `#[account]` macros. Use Anchor's `init` for PDAs.
- **TypeScript**: strict mode, no `any`, prefer `as const` for literals, use `zod` for runtime validation if needed.
- **React**: functional components, hooks, no class components. Use `useMemo`/`useCallback` for expensive ops.
- **Tailwind**: utility classes only, no custom CSS files unless absolutely needed. Theme: dark mode, cookie/blue accent matching Cookie Chain docs.
- **Comments**: minimal. Code should be self-explanatory. Comment only "why", not "what".
- **No emojis in code** (only in user-facing UI strings).

## Communication style with the user

The user (K Slim) is direct, asks sharp questions, and pushes back when something doesn't make sense. Don't oversell. Don't pad. Lead with the answer, then evidence. If a tradeoff is real, name it.

User profile (from memory):
- Building an automated trading portfolio as a personal hobby, eventual financial gain
- Cares about practical edge / live-readiness over research novelty
- Cares about not making silly mistakes (e.g. percent units in backtest output)
- Wants fast, clear execution; will ask follow-ups if confused

## The X thread is the deliverable

Beyond the app, the X thread is what wins the submission. Keep it tight, build a visual, ship a demo video. The 5-7 tweet draft is in THESIS.md.

## When in doubt

- Read THESIS.md.
- Read the Cookie Chain docs: https://docs.cookiechain.wtf
- Read the developer guide specifically: https://docs.cookiechain.wtf/developer-guide
- Check cookiescan.io for live program addresses.
- Ask the user.
