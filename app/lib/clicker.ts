// Clicker transaction builder.
// Every click = 1 transaction on Cookie Chain with 2 instructions:
//   1. SystemProgram.transfer (burns native COOK to treasury)
//   2. MemoProgram.writeMemo (encodes click number + golden flag)
//
// The memo serves two purposes:
//   - on-chain log the user can prove later
//   - future indexer (cookiescan / our own) can rebuild state from tx history

import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { COOKIE_CHAIN_COMMITMENT, COOKIE_CHAIN_RPC, MEMO_TAG } from './cookiechain';

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');

export type ClickResult = {
  signature: string;
  clickNumber: number;
  isGolden: boolean;
  burnedLamports: number;
};

export type BuildClickOptions = {
  wallet: PublicKey;
  treasury: PublicKey;
  clickNumber: number;
  burnLamports: number;
  isGolden: boolean;
};

export function buildClickTransaction(opts: BuildClickOptions): Transaction {
  const { wallet, treasury, burnLamports, isGolden, clickNumber } = opts;
  const tx = new Transaction();

  // Instruction 1: burn COOK (native transfer to treasury)
  // Same burn whether or not the click is golden — the on-chain truth is uniform.
  // The "golden" flag is encoded in the memo for off-chain indexing/visuals.
  tx.add(
    SystemProgram.transfer({
      fromPubkey: wallet,
      toPubkey: treasury,
      lamports: burnLamports,
    })
  );

  // Instruction 2: memo with the click number and a golden flag
  // Format: "<tag> click=<N> golden=<0|1>"
  const memo = `${MEMO_TAG} click=${clickNumber} golden=${isGolden ? 1 : 0}`;
  tx.add(
    new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [{ pubkey: wallet, isSigner: true, isWritable: false }],
      data: Buffer.from(memo, 'utf8'),
    })
  );

  tx.feePayer = wallet;
  tx.recentBlockhash = ''; // wallet adapter / provider fills this in
  return tx;
}

export function buildSplashTransaction(opts: {
  wallet: PublicKey;
  treasury: PublicKey;
  burnLamports: number;
  memo: string;
}): Transaction {
  const { wallet, treasury, burnLamports, memo } = opts;
  const tx = new Transaction();
  tx.add(
    SystemProgram.transfer({
      fromPubkey: wallet,
      toPubkey: treasury,
      lamports: burnLamports,
    })
  );
  tx.add(
    new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [{ pubkey: wallet, isSigner: true, isWritable: false }],
      data: Buffer.from(memo, 'utf8'),
    })
  );
  tx.feePayer = wallet;
  return tx;
}

export function makeConnection(): Connection {
  return new Connection(COOKIE_CHAIN_RPC, COOKIE_CHAIN_COMMITMENT);
}

export async function confirmSignature(
  signature: string,
  timeoutMs = 30_000
): Promise<{ confirmed: boolean; err: string | null }> {
  const conn = makeConnection();
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const status = await conn.getSignatureStatuses([signature], {
      searchTransactionHistory: true,
    });
    const v = status.value[0];
    if (v) {
      if (v.err) return { confirmed: false, err: JSON.stringify(v.err) };
      if (
        v.confirmationStatus === 'confirmed' ||
        v.confirmationStatus === 'finalized'
      ) {
        return { confirmed: true, err: null };
      }
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return { confirmed: false, err: 'Confirmation timeout' };
}

export { TOKEN_PROGRAM_ID, createTransferInstruction, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction };
