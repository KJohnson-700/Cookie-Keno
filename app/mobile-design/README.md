# Handoff: Cookie Keno — responsive mobile + desktop app

## Overview
Cookie Keno is an on-chain, provably-fair keno game on Cookie Chain. The existing product is a
desktop-first Next.js web app. This handoff covers a **responsive rebuild**: a phone-first play
experience that automatically becomes the wide desktop layout at ≥1024px, using the same state and
the same components.

Core loop: connect wallet → pick 1–10 of 40 numbers → set a COOK wager → 8 numbers are drawn from
the transaction blockhash → hits are revealed one by one → result popup with payout, plus a
progressive-jackpot path.

## About the design files
`Cookie Keno Mobile.dc.html` in this bundle is a **design reference created in HTML** — a working
prototype of the intended look and behaviour, not production code to copy. The task is to recreate
it inside the existing Next.js/React app (`app/app/page.tsx`, `app/components/*.tsx`,
`app/lib/keno.ts`) using that codebase's established patterns, Tailwind config, and wallet/RPC
plumbing. Open the HTML file in a browser and resize the window to see both layouts.

`DESIGN.md` is the original product design spec this was built from; it remains the source of truth
for chain details, payout logic, and component file names.

## Fidelity
**High fidelity.** Colors, typography, spacing, radii, animation timings, and copy in this document
are exact and should be matched. Substitute the codebase's own tokens/utilities where equivalents
already exist (the palette below already matches `globals.css`).

---

## Responsive behaviour

One breakpoint, `1024px`, driven by viewport width. Everything below is the only difference between
the two layouts — state, game logic, and copy are identical.

| | Phone (<1024px) | Desktop (≥1024px) |
|---|---|---|
| Shell | Full-viewport app surface | Full-bleed, content column `max-width: 1120px`, centered |
| Content padding | `58px 18px 250px` | `44px 384px 64px 40px` (right padding reserves the rail) |
| Board grid | `repeat(5, 1fr)`, gap `7px` (5 cols × 8 rows) | `repeat(8, 1fr)`, gap `10px` (8 cols × 5 rows) |
| Wager panel | Bottom sheet, fixed to bottom, slides up | Sticky right rail: `position:absolute; top:112px; right:calc(50% - 528px); width:328px`, always expanded |
| Sheet visibility | Collapsed (`translateY(182px)`) until ≥1 number is picked; drag handle toggles it | Always open, no drag handle |
| Leaderboard / My rounds / How to play | Bottom sheets, `border-radius: 20px 20px 0 0`, slide up (`ck-rise`, 260ms) | Centered modals, `width:560px`, `max-height:72%`, `border-radius:18px`, scale-in (`ck-pop`, 240ms) |
| Result popup | Full-width minus 26px gutters | Same, capped at `max-width: 420px` |

The prototype wraps the phone layout in a device bezel (44px radius, status bar, home indicator) for
presentation only — **do not build the bezel**; the phone layout is the real browser viewport.

---

## Screens / views

### 1. Connect (first run)
Full-screen, centered, `background:#0a0a0f`, horizontal padding `34px`, text centered.
- Logo mark: 96×96 circle, `border:1px solid #3a2e15`, `background:radial-gradient(circle at 30% 25%, #2a2110, #0f0f16)`; inside "CK" in Bebas Neue 44px, `#d4a853`, letter-spacing `.06em`, pulsing glow (`ck-glow`, 3s ease-in-out infinite). Margin-bottom 26px.
- Title "COOKIE KENO": Bebas Neue 38px, letter-spacing `.2em`, `#e2e8f0`, line-height 1.
- Subtitle "ON CHAIN • PROVABLY FAIR": Space Mono 9px, letter-spacing `.24em`, `#64748b`, margin-top 10px.
- Body copy, margin-top 22px, Space Mono 11px/1.7, `#94a3b8`:
  "Connect a Nightly wallet to wager COOK. Every draw is derived from the transaction blockhash."
- Primary button "CONNECT NIGHTLY" (label becomes "CONNECTING…" while pending): full width, padding `15px 0`, radius 12px, `background:#d4a853`, text `#0a0a0f`, Bebas Neue 19px, letter-spacing `.2em`, `box-shadow:0 8px 30px rgba(212,168,83,.24)`. Margin-top 30px.
- Secondary text link "BROWSE WITHOUT WALLET": Space Mono 10px, letter-spacing `.12em`, `#64748b`, margin-top 14px.

On successful connect the app shows the Play screen with the **How to play** sheet auto-opened
(first run only). The prototype fakes a 900ms connect delay; wire this to the real Nightly adapter.

### 2. Play (main)
Vertical stack in the scroll column:

**Header** (flex, space-between, margin-bottom 18px)
- Left: 38px circle mark (same gradient/border as above) with "CK" Bebas Neue 19px `#d4a853`; then a
  2px-gap column — "COOKIE KENO" Bebas Neue 22px, letter-spacing `.18em`, `#d4a853`; "ON CHAIN •
  PROVABLY FAIR" 7.5px, letter-spacing `.22em`, `#64748b`.
- Right: balance chip — `padding:7px 10px`, `border:1px solid #252530`, radius 9px,
  `background:#12121a`; "BALANCE" 8px letter-spacing `.14em` `#64748b` above the amount, 11px bold
  `#d4a853`, formatted `250.00 COOK`. Tapping it raises a toast with the wallet name and balance.

**Jackpot card** — `border:1px solid #3a2e15`, radius 14px,
`background:linear-gradient(160deg,#1d1809 0%,#12121a 55%)`, `padding:16px 16px 14px`, margin-bottom 12px.
- Row: "PROGRESSIVE JACKPOT" Bebas Neue 12px, letter-spacing `.24em`, `#a17c32` | "1% OF EACH WAGER" 8px `#64748b`.
- Amount: Space Mono 30px bold, `#d4a853`, `text-shadow:0 0 24px rgba(212,168,83,.35)`, followed by
  "COOK" Bebas Neue 16px `#a17c32`. Ticks up continuously while idle (prototype: +0–4 every 2.2s; in
  production, poll the pool account).

**Pill row** (flex, gap 8px, margin-bottom 16px) — "LEADERBOARD", "MY ROUNDS", and a 42px "?" button.
Each: `padding:9px 0`, `border:1px solid #252530`, radius 9px, `background:#12121a`, Bebas Neue 13px,
letter-spacing `.16em`, `#94a3b8`; hover → border and text `#d4a853`.

**Selection bar** — "SELECTED 0 / 10" (10px, letter-spacing `.14em`, `#94a3b8`) and "CLEAR"
(Bebas Neue 13px, `#64748b`, hover `#d4a853`). Margin-bottom 9px.

**Board** — 40 cells, `aspect-ratio:1`, radius 9px, Space Mono 13px bold, `1px` border,
`transition: background .12s, color .12s, transform .12s`. States:

| State | Border | Background | Text | Extra |
|---|---|---|---|---|
| Default | `#1e1e28` | `#14141d` | `#64748b` | — |
| Selected | `#d4a853` | `#d4a853` | `#0a0a0f` | `box-shadow:0 0 14px rgba(212,168,83,.35)` |
| Drawn, miss | `#7f1d1d` | `#7f1d1d` | `#fca5a5` | — |
| Drawn, hit | `#22c55e` | `#22c55e` | `#04140a` | `transform:scale(1.06)`, `box-shadow:0 0 16px rgba(34,197,94,.45)` |

Cells are inert while `phase === 'drawing'`. Selecting past 10 is a no-op. Any selection change
resets the previous round's drawn/result state.

**Footer** — "PICK 1-10 • 8 DRAWN" Bebas Neue 12px, letter-spacing `.28em`, `#a17c32`; below it
"TREASURY 5Nhc…iDf29" 8px `#64748b`. Margin-top 22px, centered.

### 3. Wager panel (bottom sheet / right rail)
`background:#101018`, `border-top:1px solid #252530` (phone) or full `1px` border (desktop),
radius `20px 20px 0 0` / `16px`, `box-shadow:0 -18px 40px rgba(0,0,0,.6)`.
Slide transition: `transform .34s cubic-bezier(.32,.72,0,1)`.
- Drag handle (phone only): 38×4 pill, `#3a3a48`, tap toggles collapsed/expanded.
- Header row: title — "PICK YOUR NUMBERS" when collapsed, "PLACE WAGER" when expanded, "DRAWING…"
  during a draw (Bebas Neue 15px, letter-spacing `.18em`, `#e2e8f0`); right hint — "tap 1–10 numbers"
  or "3 picked" (10px `#64748b`).
- Presets `0.1 / 0.5 / 1 / 5`: flex 1 each, gap 7px, `padding:9px 0`, radius 9px, 12px bold.
  Inactive `border:1px solid #252530; background:#0e0e15; color:#94a3b8`;
  active `border:1px solid #d4a853; background:rgba(212,168,83,.14); color:#d4a853`.
- Custom input row: `border:1px solid #252530`, radius 10px, `background:#0e0e15`, `padding:10px 12px`.
  "WAGER" label 9px `#64748b`, right-aligned numeric input (Space Mono 15px bold `#e2e8f0`,
  `inputmode="decimal"`, strips non `[0-9.]`), "COOK" suffix Bebas Neue 14px `#a17c32`.
- PLAY button: `padding:15px 0`, radius 12px, Bebas Neue 19px, letter-spacing `.2em`.
  Enabled `background:#d4a853; color:#0a0a0f; box-shadow:0 8px 28px rgba(212,168,83,.22)`.
  Disabled `background:#1c1c26; color:#4b5563; pointer-events:none`. Label: `PLAY 1.00 COOK`, or
  "DRAWING…" mid-round.
- Hint line, 8.5px `#64748b`, centered: with picks → `MAX 250 COOK ON 3/3 HITS` (max multiplier ×
  wager); otherwise "PROVABLY FAIR · DRAW FROM BLOCKHASH".

### 4. Result popup
Centered over a `rgba(4,4,8,.78)` scrim with `backdrop-filter: blur(4px)`, gutters 26px.
Card: `padding:26px 22px 20px`, radius 20px, centered text, `animation: ck-pop .3s cubic-bezier(.2,1.3,.4,1)`.

| Outcome | Background | Ink | Title |
|---|---|---|---|
| Loss | `linear-gradient(160deg,#3a1414,#1a0d0d)` | `#fca5a5` | NO WIN |
| Win (<5×) | `linear-gradient(160deg,#4ade80,#16a34a)` | `#0a0a0f` | YOU WIN! |
| Big win (≥5×) | `linear-gradient(160deg,#f0d089,#d4a853)` | `#0a0a0f` | BIG WIN! |
| Jackpot | `linear-gradient(160deg,#f7dd9b,#d4a853)` | `#0a0a0f` | JACKPOT! (46px) |

Contents in order: title (Bebas Neue 40px, letter-spacing `.14em`); "3 / 8 HITS" (12px, letter-spacing
`.12em`, 75% opacity); payout "125.00 COOK" (26px bold, margin-top 12px); profit line
"+124.00 profit" or "−1.00 COOK" (11px, 70% opacity); 1px divider `rgba(0,0,0,.18)`;
"BLOCKHASH A4F2K1…9QX · VIEW ON COOKIESCAN" (8.5px, 65% opacity) linking to
`https://cookiescan.io/tx/{signature}`; CONTINUE button (full width, `padding:13px 0`, radius 11px,
Bebas Neue 17px, letter-spacing `.2em`) — on a win `background:rgba(10,10,15,.88); color:#f0d089`,
on a loss `background:#d4a853; color:#0a0a0f`.

### 5. Celebration overlay
Non-interactive layer (`pointer-events:none`, `z-index:95`) above everything except toasts.
- **Win**: 46 falling gold shards + 12 sparkles.
- **Jackpot**: 120 shards + 26 sparkles, plus `ck-shake .5s ease-in-out 2` on the whole layer, and a
  centered "JACKPOT!" (Bebas Neue 66px, `#d4a853`, `ck-glow 1s infinite`) over "SUPER WIN"
  (Bebas Neue 22px, letter-spacing `.4em`, `#fff3d0`).
- Shard: width `4–13px`, height `1×` or `2.2×` width, tones cycling `#d4a853 / #f0d089 / #a17c32 /
  #fff3d0`, radius `50%` or `1px`, `box-shadow:0 0 8px rgba(212,168,83,.55)`, random left, starts at
  `top:-6%`, `animation: ck-fall {1.5–3.3}s linear {0–1.4}s forwards` with per-shard CSS vars
  `--dx` (`-60…60px`) and `--rot` (`360–1080deg`).
- Sparkle: 12×12, `conic-gradient(from 0deg, transparent 0 20%, #fff3d0 25%, transparent 30% 70%,
  #d4a853 75%, transparent 80%)`, `border-radius:50%`, `animation: ck-spark {.9–1.9}s ease-out
  {0–2}s infinite`.
- Auto-clears after 3.2s (win) / 4.2s (jackpot).

### 6. Leaderboard
Ten rows, gap 7px. Row: `padding:10px 12px`, `border:1px solid #1e1e28`, radius 10px,
`background:#15151e`; rank `01…10` Bebas Neue 15px, width 22px, `#d4a853` for the top three else
`#475569`; truncated address (11px `#94a3b8`) flexing; amount `128,400.00 COOK` (12px bold `#d4a853`).
Populate from `app/lib/leaderboard.ts`; keep the refresh affordance from the desktop build.

### 7. My rounds (history)
Last 12 rounds, same row chrome. Left column: "3 / 8 hits · 5 picked" (11px `#e2e8f0`) over
"1.00 COOK · A4F2K1…9QX" (8.5px `#64748b`). Right: signed amount, 12px bold, `#22c55e` on a win,
`#7f1d1d` on a loss. Empty state, centered, `padding:34px 0`, 11px `#64748b`:
"No rounds yet. Pick numbers and play."

### 8. How to play
Four numbered steps, gap 14px. Index "01–04" Bebas Neue 17px `#a17c32`, min-width 20px; step title
Bebas Neue 15px, letter-spacing `.14em`, `#e2e8f0`; body 10.5px/1.6 `#94a3b8`. Copy verbatim:

1. **PICK 1–10 NUMBERS** — Tap anywhere on the 40-number board. More picks means more ways to hit, but a higher bar for the top payouts.
2. **SET YOUR WAGER** — Use a preset or type a custom amount in COOK. The sheet lifts once you have picks on the board.
3. **EIGHT ARE DRAWN** — The draw is derived from your transaction blockhash, so every round is verifiable on cookiescan.io.
4. **JACKPOT** — 1% of every wager feeds the progressive pool. Hit at least one number and the 0.1% trigger takes the whole pool.

Closes with a full-width "GOT IT" button (`background:#d4a853`, `#0a0a0f`, Bebas Neue 17px, radius 11px).

### 9. Toast
`position:absolute; left:18px; right:18px; bottom:26px; z-index:99`, `padding:12px 14px`, radius 11px,
`border:1px solid #2c2416`, `background:rgba(16,16,24,.96)`, `color:#e2e8f0`, 11px, letter-spacing
`.06em`, `animation: ck-rise .25s ease`, `box-shadow:0 10px 30px rgba(0,0,0,.5)`. Auto-dismiss 2.6s.
Used for "Enter a wager", "Insufficient COOK balance", and the wallet tap.

---

## Interactions & behaviour

**Round sequence**
1. Validate: ≥1 pick, wager > 0 (else toast "Enter a wager"), wager ≤ balance (else toast
   "Insufficient COOK balance"), not already drawing.
2. Debit the wager, add `wager * 0.01` to the jackpot pool, collapse the sheet, set `phase='drawing'`.
3. Draw 8 unique numbers from 1–40 — in production, derived from the transaction blockhash.
4. Reveal one number every **300ms** (8 steps). Drive the reveal from a counter held outside React
   state (a ref/local), not from inside a state updater, or StrictMode double-invocation stalls it.
5. 420ms after the last reveal, settle: `hits = picks ∩ drawn`, `multiplier = PAYTABLE[picks][hits]`,
   `payout = multiplier * wager`.
6. Jackpot check: `hits ≥ 1 && random < 0.001` → payout is the whole pool, pool resets to its floor.
7. Credit the payout, push a history entry, open the result popup, and fire the celebration when
   `payout > 0`.

**Other**
- Board taps are instant, no delay.
- Pill row and sheet interactions stay live during a draw except the board and PLAY.
- Hover states: pills → gold border/text; buttons → slight opacity change; disabled → dimmed,
  `pointer-events:none`.
- Resize across 1024px re-lays out immediately with no state loss.

**Payout table** (picks → hits → multiplier) as prototyped; reconcile against `app/lib/keno.ts`,
which is authoritative:

```
 1: {1:3.6}
 2: {2:9}
 3: {2:2, 3:26}
 4: {2:1, 3:5, 4:60}
 5: {3:2, 4:12, 5:250}
 6: {3:1, 4:4, 5:35, 6:800}
 7: {3:1, 4:2, 5:12, 6:120, 7:2000}
 8: {4:2, 5:8, 6:50, 7:400, 8:5000}
 9: {4:1, 5:4, 6:20, 7:100, 8:1000, 9:10000}
10: {4:1, 5:3, 6:12, 7:50, 8:300, 9:2500, 10:25000}
```

## State
| Key | Type | Notes |
|---|---|---|
| `screen` | `'connect' \| 'play'` | Gate on wallet connection |
| `connecting` | boolean | Connect button pending label |
| `picks` | number[] | Max 10, from 1–40 |
| `wager` | string | Raw input; parsed to float at play time |
| `balance` | number | COOK, 9 decimals on chain, displayed to 2 |
| `jackpot` | number | Pool total, polled |
| `drawn` | number[] | 8 numbers |
| `revealed` | number | 0–8, drives the staggered reveal |
| `phase` | `'idle' \| 'drawing' \| 'done'` | |
| `result` | `{hits, payout, wager, mult, jackpotHit, hash}` | |
| `popup` / `celebrate` / `overlay` / `toast` | UI flags | `overlay`: `'leaderboard' \| 'history' \| 'howto'` |
| `sheetOpen` | boolean | Phone only; forced true on desktop |
| viewport width | number | Resize listener → `<1024` = phone layout |

Data to fetch: COOK balance, jackpot pool, leaderboard (`app/lib/leaderboard.ts`), and per-round
transaction signature + blockhash. RPC `https://rpc.cookiescan.io`, treasury
`5Nhcsv4ip2dF5fyN6of3NR98pv3wq75tWdPgqi9iDf29`.

## Design tokens
```css
--bg-deep:#0a0a0f;  --bg-card:#12121a;  --bg-cell:#14141d;  --bg-input:#0e0e15;
--bg-sheet:#101018; --bg-row:#15151e;
--border-subtle:#252530; --border-hairline:#1e1e28; --border-gold-dim:#3a2e15; --border-gold-warm:#2c2416;
--text-primary:#e2e8f0; --text-secondary:#94a3b8; --text-muted:#64748b; --text-disabled:#4b5563;
--accent-gold:#d4a853; --accent-gold-dim:#a17c32; --accent-gold-light:#f0d089; --accent-gold-pale:#fff3d0;
--win:#22c55e; --win-ink:#04140a; --miss:#7f1d1d; --miss-ink:#fca5a5;
```
Spacing: 4 / 7 / 9 / 12 / 14 / 18 / 22 / 26 / 40px.
Radii: 9 (cells, pills) · 10 (rows, inputs) · 11–12 (buttons) · 14–16 (cards) · 18–20 (sheets/modals) · 99 (handles).
Type: Bebas Neue for headings/buttons/labels (uppercase, letter-spacing `.14–.28em`); Space Mono
400/700 for all numerals, addresses, and body. Scale: 7.5 / 8 / 8.5 / 9 / 10 / 10.5 / 11 / 12 / 13 /
15 / 17 / 19 / 22 / 26 / 30 / 38–46 / 66px.
Shadows: `0 0 14px rgba(212,168,83,.35)` (selected cell) · `0 0 16px rgba(34,197,94,.45)` (hit) ·
`0 8px 28px rgba(212,168,83,.22)` (primary button) · `0 -18px 40px rgba(0,0,0,.6)` (sheet) ·
`0 24px 60px rgba(0,0,0,.55)` (rail) · `0 30px 80px rgba(0,0,0,.6)` (modal).
Keyframes: `ck-fall`, `ck-spark`, `ck-pop`, `ck-shake`, `ck-glow`, `ck-rise` — full definitions in the
HTML file's `<style>` block; copy them verbatim.

## Assets
None. The "CK" logo mark is type in a gradient circle — swap in the real 128×128 logo from the
desktop build. Fonts load from Google Fonts (`Bebas Neue`, `Space Mono` 400/700); use `next/font` in
the app. No icon library is used; the phone status-bar glyphs in the prototype are presentation
chrome and should not be built.

## Files
- `Cookie Keno Mobile.dc.html` — the full interactive prototype (both layouts, all screens, all
  animations). Open in a browser; resize past 1024px to switch layouts.
- `DESIGN.md` — original product spec: chain details, component map, jackpot rules, external links.

Target files in the repo, per `DESIGN.md`: `app/app/page.tsx`, `app/app/globals.css`,
`app/components/{WalletButton,KenoBoard,WagerPanel,ResultsPanel,Leaderboard,JackpotDisplay,Celebration,ResultPopup,MultiplierBadge}.tsx`,
`app/lib/keno.ts`, `app/lib/leaderboard.ts`.
