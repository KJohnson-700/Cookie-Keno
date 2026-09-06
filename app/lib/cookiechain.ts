// Cookie Chain configuration constants
// See THESIS.md and CLAUDE.md for context.

import { Commitment } from '@solana/web3.js';

/** Cookie Chain RPC endpoint. */
export const COOKIE_CHAIN_RPC = 'https://rpc.cookiescan.io';

/** Commitment level for tx confirmation. "confirmed" is the sweet spot for game UX. */
export const COOKIE_CHAIN_COMMITMENT: Commitment = 'confirmed';

/**
 * Treasury wallet that receives click burns and dispenses golden-cookie airdrops.
 * In production, store the keypair in an env var (TREASURY_KEYPAIR_JSON) and
 * generate the address from it. For now, a placeholder; we'll fill it in once
 * we deploy and run a one-shot init script.
 */
export const TREASURY_ADDRESS_PLACEHOLDER = '11111111111111111111111111111111';

/** Lamports burned per click (1 COOK = 1_000_000_000 lamports). 1000 = 0.000001 COOK. */
export const CLICK_BURN_LAMPORTS = 1000;

/** Lamports airdropped on a Golden Cookie hit. 100_000 = 0.0001 COOK. */
export const GOLDEN_COOKIE_LAMPORTS = 100_000;

/** Probability (0..1) of a Golden Cookie on any given click. */
export const GOLDEN_COOKIE_CHANCE = 0.005; // 0.5%

/** CookieScan API base (for future leaderboard/analytics indexing). */
export const COOKIE_SCAN_API = 'https://api.cookiescan.io';

/** Cookie Clicker version tag embedded in memos. */
export const MEMO_TAG = 'click-the-cookie:v1';
