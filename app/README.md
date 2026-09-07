# Cookie Keno — on Cookie Chain

> A provably-fair keno game on Cookie Chain. Pick numbers, wager COOK, get paid in COOK.

Built as a cApp submission for the [Cookie Chain](https://www.cookiechain.wtf) cApp program.

## Live Demo

http://localhost:3000 (when dev server is running locally)

## How to Play

1. Install [Nightly](https://nightly.app) — the only wallet that works on Cookie Chain.
2. Bridge COOK from Solana via [bridge.cookiescan.io](https://bridge.cookiescan.io).
3. Open the app, connect wallet.
4. Select 1-10 numbers from the 1-40 grid.
5. Set your wager (0.01 - 10 COOK).
6. Click "Play Round" — sends real on-chain tx.
7. 8 numbers are drawn from the blockhash (provably fair).
8. Hit 1+ numbers to win based on the payout table.

## Payout Table

| Picks | Hit 1 | Hit 2 | Hit 3 | Hit 4 | Hit 5 | Hit 6 | Hit 7 | Hit 8 |
|-------|-------|-------|-------|-------|-------|-------|-------|-------|
| 1     | 2.8x  | —     | —     | —     | —     | —     | —     | —     |
| 2     | —     | 9x    | 50x   | —     | —     | —     | —     | —     |
| 3     | —     | 2x    | 26x   | 100x  | —     | —     | —     | —     |
| 4     | —     | —     | 6x    | 30x   | 200x  | 400x  | —     | —     |
| 5     | —     | —     | 3x    | 12x   | 70x   | 300x  | 800x  | —     |
| 6     | —     | —     | 1x    | 5x    | 25x   | 130x  | 500x  | 1500x |
| 7     | —     | —     | 0.5x  | 3x    | 11x   | 50x   | 200x  | 800x  |
| 8     | —     | —     | —     | 1.5x  | 5x    | 20x   | 80x   | 400x  |
| 9     | —     | —     | —     | 0.5x  | 2x    | 8x    | 30x   | 200x  |
| 10    | —     | —     | —     | —     | 1x    | 4x    | 15x   | 100x  |

## Features

- 🎰 **Real on-chain** — Every round is a real transaction
- 🔒 **Provably fair** — Draw derived from blockhash, verifiable
- 📊 **Live leaderboard** — Top winners from on-chain data
- 🍪 **.cook bonus** — 50% payout boost for .cook name holders

## Setup

```bash
cd app
npm install --legacy-peer-deps
npm run dev
```

Open http://localhost:3000.

Windows (Webpack required):

```bash
node_modules\.bin\next.cmd dev --webpack -p 3000
```

## Treasury

```
5Nhcsv4ip2dF5fyN6of3NR98pv3wq75tWdPgqi9iDf29
```

Wagers go here. Payouts are calculated but not sent in demo mode (security).

## Tech Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4
- @solana/web3.js
- Nightly wallet (injected provider)
- Cookie Chain RPC: https://rpc.cookiescan.io

## License

MIT
