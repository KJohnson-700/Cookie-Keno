# Cookie Keno - Design Specification

## Project Overview
- **Name**: Cookie Keno
- **Type**: On-chain provably-fair keno gambling game
- **Chain**: Cookie Chain (Solana-compatible)
- **Live URL**: https://app-eight-dusky-61.vercel.app
- **Treasury**: 5Nhcsv4ip2dF5fyN6of3NR98pv3wq75tWdPgqi9iDf29

## Design Philosophy
- **Anti-AI Slop**: No generic emojis, no cookie-cutter UI
- **Casino Noir Theme**: Dark, premium, sophisticated
- **Typography**: Bebas Neue (headings), Space Mono (numbers/data)

---

## Color Palette

```css
--bg-deep: #0a0a0f          /* Deepest background */
--bg-card: #1a1a24          /* Card backgrounds */
--border-subtle: #252530     /* Subtle borders */
--text-primary: #e2e8f0      /* Primary text */
--text-secondary: #94a3b8   /* Secondary text */
--text-muted: #64748b       /* Muted/tertiary text */
--accent-gold: #d4a853      /* Primary accent - gold */
--accent-gold-dim: #a17c32  /* Dimmed gold */
--accent-gold-glow: rgba(212, 168, 83, 0.4) /* Gold glow effect */
```

---

## Typography

- **Headings**: `'Bebas Neue', sans-serif` - tracking-widest, uppercase
- **Body/Data**: `'Space Mono', monospace` - numbers, addresses, payouts

### Usage
- Logo/Title: Bebas Neue, 1.5rem, gold, tracking-widest
- Numbers (keno board): Space Mono, 0.875rem, bold
- Payouts/Addresses: Space Mono
- Buttons: Bebas Neue, tracking-widest, uppercase

---

## Layout Structure

### Header
- Left: Logo (128x128px) + "COOKIE KENO" title + "ON CHAIN • PROVABLY FAIR" subtitle
- Right: .cook holder badge (toggleable) + Wallet connect button

### Main Content (centered, max-width 768px)
1. **Jackpot Display Card**
   - "PROGRESSIVE JACKPOT" label (gold, uppercase)
   - Amount in COOK (large, gold, monospace)
   - Subtext: "1% of each wager goes to pool"

2. **Selection Info Bar**
   - "Selected: X / 10" + "Clear" button

3. **Keno Board**
   - 40 numbers in 8x5 grid
   - Number size: square aspect ratio
   - States:
     - Default: dark bg (#1a1a24), muted text
     - Selected: gold bg (#d4a853), black text
     - Drawn (not hit): dark red bg (#7f1d1d), light red text
     - Drawn + Hit: green bg (#22c55e), white text

4. **Wager Panel**
   - Preset buttons: 0.1, 0.5, 1, 5 COOK
   - Custom input field
   - "PLAY" button (gold bg, black text, disabled when invalid)

5. **Results Panel** (after play)
   - Your picks: X numbers shown
   - Drawn: 8 numbers shown
   - Hits: X / 8
   - Payout: X.XX COOK
   - Provably fair info: blockhash (truncated) + link to explorer

6. **Recent Rounds History**
   - Last 10 rounds, compact list

### Leaderboard Section
- Full width below main content
- Top 10 winners from chain
- Refresh button

### Footer
- "PICK 1-10 • 8 DRAWN" (gold, tracking-widest)
- Treasury address (truncated, gold)
- @Theecryptopimp link to X

---

## Animations

### Number Selection
- Instant color change on click
- No delay

### Draw Reveal (when results appear)
- Sequential reveal: 300ms delay between each number
- Numbers turn green (hit) or red (miss) one by one

### Win Celebration
- Trigger: payout > 0
- Effects:
  - Gold particle rain (40 particles)
  - Text overlay: "YOU WIN!" (Bebas Neue, 5-7rem, gold with glow)
  - Duration: 3 seconds, then fade

### Jackpot Celebration
- Trigger: jackpot won
- Effects:
  - Heavy gold particle rain (200 particles)
  - Screen shake (500ms, 2x)
  - Text: "JACKPOT!" (9rem) + "SUPER WIN" below
  - Duration: 3 seconds

### Result Popup
- Trigger: round complete
- Animation: scale-in (0 → 1.1 → 1) over 300ms
- Content:
  - "YOU WIN!" / "BIG WIN!" / "NO WIN"
  - Hits: "X / 8 HITS"
  - Payout: "X.XX COOK"
  - Profit (if win): "+X.XX profit"
  - "CONTINUE" button
- Colors:
  - Win: green gradient (bg), black text
  - Big Win (5x+): gold/amber gradient, black text
  - Lose: red gradient, white text

### Toast Notifications
- Position: bottom-right
- Slide in from right
- Auto-dismiss: 2.5-4 seconds
- Types:
  - Success (green tint)
  - Error (red tint)
  - Win (green tint + gold accent)

### Button States
- Hover: slight opacity change
- Disabled: reduced opacity, no pointer events

---

## Components List

| Component | File | Purpose |
|-----------|------|---------|
| WalletButton | components/WalletButton.tsx | Connect/disconnect Nightly wallet |
| KenoBoard | components/KenoBoard.tsx | 40-number selection grid |
| WagerPanel | components/WagerPanel.tsx | Bet input + play button |
| ResultsPanel | components/ResultsPanel.tsx | Show round results |
| Leaderboard | components/Leaderboard.tsx | Top winners from chain |
| JackpotDisplay | components/JackpotDisplay.tsx | Progressive jackpot UI |
| Celebration | components/Celebration.tsx | Particle effects + text overlay |
| ResultPopup | components/ResultPopup.tsx | Win/lose modal |
| MultiplierBadge | components/MultiplierBadge.tsx | .cook holder bonus indicator |

---

## Wallet Requirements
- **Required**: Nightly wallet (Solana-compatible)
- **RPC**: https://rpc.cookiescan.io
- **Token**: COOK (9 decimals)

---

## Game Rules
- Pick 1-10 numbers from 1-40
- 8 numbers drawn per round
- Payout based on hits (see keno.ts payout table)
- Provably fair: draw derived from transaction blockhash

---

## Progressive Jackpot
- Contribution: 1% of each wager
- Trigger chance: 0.1%
- Win condition: hit at least 1 number + trigger
- Payout: entire jackpot pool

---

## External Links
- Explorer: https://cookiescan.io/tx/{signature}
- Nightly Wallet: https://nightly.app
- Dev Credit: https://x.com/Theecryptopimp

---

## Files to Modify
- `app/app/page.tsx` - Main game logic
- `app/app/globals.css` - Theme variables
- `app/components/*.tsx` - Individual components
- `app/lib/keno.ts` - Game logic, payouts
- `app/lib/leaderboard.ts` - RPC reader
