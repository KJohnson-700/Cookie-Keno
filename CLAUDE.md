# CLAUDE.md — Cookie Keno handoff

> Project memory + autonomous build guide for the next agent (Claude Code or any other).
> Read this file top to bottom before doing anything. Then read THESIS.md.

---

## What this project is

**Cookie Keno** — a real-money keno game on Cookie Chain. Pick 1–10 numbers from 1–40, wager COOK, get paid in COOK. Provably-fair randomness from the recent blockhash. Live on-chain. Live leaderboard.

The previous agent (Mavis session `mvs_b2deecb8081c4af9b63ea866a309bd92`, user `K Slim`) attempted a Cookie Clicker first; that concept was abandoned because a faithful clone requires 2–3 weeks and a stripped-down version is a hollow counter. This handoff pivots to keno, which can be completed in 6–8 hours of focused autonomous work and ships as a real product.

The full pitch, payout table, and architecture live in [THESIS.md](./THESIS.md). **Read that file first.**

---

## What's already done (do not redo)

- ✅ Next.js 16 + React 19 + Tailwind 4 scaffolded at `app/`
- ✅ Solana wallet stack installed (`@solana/web3.js`, `@solana/wallet-adapter-react`, `@solana/wallet-adapter-react-ui`, `@solana/wallet-adapter-base`, `@solana/wallet-adapter-wallets`, `@solana/spl-memo`, `@solana/spl-token`, `clsx`, `lucide-react`)
- ✅ Custom `NightlyWalletAdapter` at `app/lib/nightly-adapter.ts` (wraps `window.nightly.solana`, polls for publicKey)
- ✅ Treasury keypair generated: pubkey `5Nhcsv4ip2dF5fyN6of3NR98pv3wq75tWdPgqi9iDf29`
- ✅ Treasury secret in `app/scripts/treasury.json` (gitignored, user has backed it up)
- ✅ Treasury funded with >1 COOK on Cookie Chain (rent-exempt)
- ✅ Wallet connection UI works with Nightly (after the placeholder-poll fix)
- ✅ 6 commits in local git (`2bec2ba` initial → `5aea911` last)
- ✅ Dev server starts on http://localhost:3000

The clicker-specific UI (Cookie SVG, click handler, upgrades, golden cookie) is **stale and should be deleted** as part of Stage 0.

---

## What's NOT done (the work)

The 8 build stages in [THESIS.md § Build stages](./THESIS.md#build-stages-the-order-with-explicit-completion-gates). Each stage has explicit pass/fail criteria. The verification loop is below.

**You (the next agent) are expected to:**
1. Work through Stages 0 → 7 in order
2. After each stage, run `node app/scripts/verify.mjs N` where N is the stage number
3. If the verify script reports failures, fix the code and re-run until pass
4. Do not advance to Stage N+1 until Stage N passes
5. After all 8 stages pass, write a handoff summary to `HANDOFF.md` (completion log)
6. The dev server should be running on http://localhost:3000 with the finished game

---

## Critical gotchas (the previous agent's mistakes — do not repeat)

1. **Phantom wallet doesn't support custom RPCs.** Don't tell the user to add Cookie Chain as a custom RPC in Phantom — it doesn't exist there. Use Nightly (with imported seed from Phantom) or Backpack. Phantom shows Phantom's own supported chains only.
2. **Nightly's `publicKey` is the SystemProgram placeholder (`1111...1111`) until you call `connect()` and a successful key is published.** Don't trust it from polling. Wait for it to become non-placeholder after the `connect()` promise resolves. The polling-with-timeout approach in `app/app/page.tsx` already handles this; reuse the pattern, don't reinvent.
3. **Nightly doesn't expose `signAndSendTransaction`.** Use `n.signTransaction(tx)` then `connection.sendRawTransaction(signed.serialize())`. The previous agent tried `signAndSendTransaction` and got "is not a function" on every click.
4. **Transfers to unfunded accounts need ≥890,000 lamports for rent-exempt.** The treasury is already funded (>1 COOK), so this is handled. Don't re-derive a fresh treasury or you'll need to re-fund it.
5. **The treasury secret key is in `app/scripts/treasury.json`, which is gitignored.** Treat it as load-bearing for the demo. If you ever need to send a payout tx from the treasury, you'll load this file in the browser. This is acceptable for a hackathon; for real money, move the key to a Vercel serverless function.
6. **Don't promise features in the THESIS that aren't built.** Build the meat alongside the UI, not after. The previous agent promised cNFTs, leaderboards, airdrops in the clicker and shipped only the cookie. Don't repeat that.
7. **Set a real `recentBlockhash` before signing.** Empty `recentBlockhash = ''` will be rejected. Always call `connection.getLatestBlockhash('confirmed')` first.

---

## Verification loop

After completing each stage, run:

```bash
node app/scripts/verify.mjs N
```

Where N is the stage number. The script:
- Runs the stage's specific checks
- Prints `PASS` or `FAIL` per check
- Exits 0 if all pass, 1 if any fail
- Writes a stage report to `app/scripts/reports/stage-N.json`

If any check fails, fix the code, re-run, repeat until all pass. **Do not advance to the next stage with failing checks.**

If the user (or another agent) wants to verify the whole project at once:

```bash
node app/scripts/verify.mjs all
```

This runs all 8 stage checks in order. Exits 0 only if all pass.

---

## Dev commands

```powershell
# from C:\Users\AbuBa\Desktop\cookie-clicker\app
cd "C:\Users\AbuBa\Desktop\cookie-clicker\app"
npm install --legacy-peer-deps   # only if node_modules missing
node_modules\.bin\next.cmd dev --webpack -p 3000
```

Open http://localhost:3000 to test.

The dev server uses Webpack (not Turbopack) because Turbopack requires native bindings that fail on this Windows box. Always pass `--webpack`.

---

## File map (current state — before you start)

```
cookie-clicker/
├── THESIS.md                                    ← READ FIRST
├── CLAUDE.md                                    ← this file
├── .gitignore
├── app/
│   ├── app/
│   │   ├── page.tsx                             ← STALE (clicker). Delete in Stage 0.
│   │   ├── layout.tsx                            ← Keep
│   │   └── globals.css                           ← Keep, restyle for keno
│   ├── components/
│   │   ├── WalletContextProvider.tsx             ← Keep
│   │   ├── WalletButton.tsx                      ← Keep
│   │   ├── Cookie.tsx                            ← STALE. Delete.
│   │   ├── Stats.tsx                             ← STALE. Repurpose or delete.
│   │   └── UpgradeShop.tsx                       ← STALE. Delete.
│   ├── lib/
│   │   ├── cookiechain.ts                        ← UPDATE: rename TREASURY_PUBKEY, add bankroll config, payout constants
│   │   ├── clicker.ts                            ← DELETE (was clicker-specific)
│   │   ├── keno.ts                               ← NEW: game logic, draw derivation, payout calc
│   │   ├── nightly-adapter.ts                    ← Keep (already works)
│   │   └── leaderboard.ts                        ← NEW: cookiescan reader
│   ├── scripts/
│   │   ├── generate-treasury.mjs                 ← Keep (already ran)
│   │   ├── treasury.json                         ← Keep, gitignored
│   │   └── verify.mjs                            ← NEW: stage verification
│   └── package.json                              ← Already correct
└── README.md                                     ← UPDATE in Stage 7
```

---

## Build order (the full plan)

For full details, payout table, and architecture, see [THESIS.md](./THESIS.md). The short version:

1. **Stage 0 — Set up** (30 min): verify dev server runs, delete stale clicker files, create `verify.mjs` skeleton
2. **Stage 1 — Keno board UI** (2 h): 1–40 number grid, picking, wager input, no tx yet
3. **Stage 2 — Real wager tx** (1 h): SystemProgram.transfer + Memo on click
4. **Stage 3 — Draw + payout** (2 h): derive 8 numbers from blockhash, send payout tx from treasury
5. **Stage 4 — Provably-fair verify display** (30 min): show the blockhash and derivation
6. **Stage 5 — Leaderboard** (2 h): read cookiescan tx history, show top 10
7. **Stage 6 — .cook name multiplier** (1 h): read Name Service, +50% if holding
8. **Stage 7 — Polish + ship** (1 h): README, Vercel, X thread, Telegram

Each stage has explicit pass/fail criteria. Run `node app/scripts/verify.mjs N` after each.

---

## How to spawn a verifier via Mavis CLI

If the next agent is also Mavis (or has access to the `mavis` CLI), it can spawn a fresh child agent as a verifier at the end of any stage:

```bash
mavis task --agent verifier --prompt "Run app/scripts/verify.mjs all and report pass/fail"
```

The verifier has read-only access to the repo and runs the verification script. The orchestrator (this agent) reads the report and decides whether to advance.

If `mavis` CLI is not available, the next agent self-verifies by running `verify.mjs` itself and reading the output.

---

## Communication style with the user (K Slim)

The user is direct, sharp, pushes back when something doesn't add up, and has been frustrated by previous agent mistakes. Lead with the answer, not the apology. Don't pad. Don't over-promise. Show your work.

User profile (from memory):
- Building an automated trading portfolio as a personal hobby, eventual financial gain
- Cares about practical edge / live-readiness over research novelty
- Cares about percent units in numeric output (use % not whole numbers)
- Wants fast, clear execution; will push back if confused

When you finish a stage and verify it passes, give a one-paragraph status. When you hit a problem, give the error and your fix in the same message. Don't ask permission to debug — just do it and report.

---

## When you're done

After all 8 stages pass `verify.mjs all`:

1. Write `HANDOFF.md` with:
   - Date completed
   - Git commit hash
   - Live URL (if deployed) or http://localhost:3000 (if not)
   - Treasury address: `5Nhcsv4ip2dF5fyN6of3NR98pv3wq75tWdPgqi9iDf29`
   - Number of test rounds played end-to-end
   - Any deviations from the plan
   - Known limitations

2. Commit everything: `git add -A && git commit -m "Cookie Keno v1: stages 0-7 complete"`

3. Hand back to the user with the HANDOFF.md contents and the public URL.

---

## License

MIT.
