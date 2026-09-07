# Click The Cookie — on Cookie Chain

A Cookie Clicker game, fully on-chain. Every click is a real Cookie Chain transaction: it burns a tiny amount of COOK to the treasury and writes a memo that encodes the click number and a "golden" flag. Sub-second finality + sub-cent fees make it perfect for a clicker.

Built as a cApp submission for the [Cookie Chain](https://www.cookiechain.wtf) cApp program.

## Live demo

http://localhost:3000 (when dev server is running locally)

Public URL: TBD (Vercel deploy pending)

## How to play (end user)

1. Install [Nightly](https://nightly.app) — the only wallet that works on Cookie Chain.
2. Bridge a tiny amount of COOK from Solana to your Nightly wallet via [bridge.cookiescan.io](https://bridge.cookiescan.io) (Hyperlane warp route). Even $0.50 is enough for thousands of clicks.
3. Open the app, click "Connect Nightly", click the cookie.
4. Every click burns 0.000001 COOK to the treasury and logs a memo on-chain.
5. ~0.5% of clicks hit a Golden Cookie (off-chain counter boost, visual flash).
6. Buy upgrades with cookies you earn — Cursor, Grandma, Farm, Mine, Factory, Bank, Temple, Wizard Tower.

## Architecture (lean, no custom Anchor program)

| Component | What it does |
|---|---|
| **Click tx** | `SystemProgram.transfer` (burns native COOK to treasury) + `Memo program` (encodes click #, golden flag). One tx, ~$0.0001 fee. |
| **Wallet** | Custom `NightlyWalletAdapter` (wraps `window.nightly.solana`). No first-party package exists. |
| **State** | Off-chain, in `localStorage`, scoped to connected wallet. No custom program, no PDA, no on-chain state. |
| **Leaderboard** | Future: off-chain indexer that reads cookiescan tx history and decodes `click-the-cookie:v1 click=N golden=G` memos. |

## Setup (developer)

```bash
cd app
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:3000.

If you're on Windows and get Turbopack errors, ensure you're using Webpack:

```bash
node_modules\.bin\next.cmd dev --webpack -p 3000
```

## Treasury

The treasury wallet receives click burns. Its public key is hardcoded in `app/lib/cookiechain.ts` (see `TREASURY_PUBKEY`).

The matching private key is in `app/scripts/treasury.json` (gitignored). **Back it up somewhere safe** — 1Password, encrypted USB, etc.

To regenerate the treasury (will require re-funding):

```bash
node app/scripts/generate-treasury.mjs
```

## Funding the app (for live demo)

The user needs ~0.01–0.05 COOK in their own Nightly wallet to pay tx fees. The treasury should also have a small balance to collect burns.

1. Get SOL in a Solana wallet (e.g., Phantom on mainnet)
2. Buy SPL COOK on a Solana DEX (Jupiter, Raydium)
3. Bridge COOK to Cookie Chain at https://bridge.cookiescan.io (Hyperlane). Bridge a small amount to:
   - **Your own Nightly wallet** (for tx fees)
   - **The treasury** (for collecting burns)
4. Open the app, connect, click.

The app will work as soon as the wallet has any positive balance, since the click burn (0.000001 COOK = 1000 lamports) is far smaller than typical tx fees.

## Tech stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript 5**
- **Tailwind CSS 4**
- **@solana/web3.js** + **@solana/wallet-adapter-react**
- **@solana/spl-memo** for the on-chain memo instruction
- **Custom Nightly wallet adapter** (200 lines, no first-party package)
- **No Anchor / Rust** — see THESIS.md for the rationale

## Why "Path A" (no custom Anchor program)?

We considered writing a real Anchor program (with PDAs, click counter, upgrade state, golden cookie randomness). The trade-off: Anchor requires the Rust toolchain (~2 GB install, ~10 min). Since the brief doesn't require a custom program address, we ship Path A — every click is a real on-chain tx using System Program + Memo program, both genesis-embedded on Cookie Chain. The on-chain depth is preserved (real burns, real memos) without the build cost.

## What's in the X thread

> 1/ I built Cookie Clicker on the actual Cookie Chain.
>
> 2/ Every click is a real on-chain transaction. Sub-second finality + sub-cent fees = perfect for this.
>
> 3/ Every click burns COOK to the treasury and writes a memo on-chain.
>
> 4/ ~0.5% of clicks hit a Golden Cookie.
>
> 5/ Live now: [link]. Click the cookie. 🍪
>
> 6/ Bridge COOK at the Cookie Chain Bridge and start clicking. Built on @TheCookieChain.

## Files

```
app/
├── app/                       # Next.js pages
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx               # Main clicker
├── components/                # UI components
│   ├── Cookie.tsx
│   ├── Stats.tsx
│   ├── UpgradeShop.tsx
│   ├── WalletButton.tsx
│   └── WalletContextProvider.tsx
├── lib/                       # On-chain / config
│   ├── clicker.ts             # Tx builder (transfer + memo)
│   ├── cookiechain.ts         # RPC, treasury, burn amounts
│   └── nightly-adapter.ts     # Custom wallet adapter
├── scripts/
│   └── generate-treasury.mjs  # Treasury keypair generator
├── treasury.json              # ⚠️ gitignored — treasury secret key
├── public/                    # Static assets
├── package.json
└── next.config.ts
```

## License

MIT
