// Generate a treasury keypair for the Cookie Clicker app.
// Run: `node app/scripts/generate-treasury.mjs`
//
// Output:
//   - Saves the keypair JSON to `app/scripts/treasury.json` (gitignored)
//   - Prints the public key (so you can bridge COOK to it)
//   - Prints instructions for the user

import { Keypair } from '@solana/web3.js';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const kp = Keypair.generate();
const outPath = join(__dirname, 'treasury.json');
writeFileSync(outPath, JSON.stringify(Array.from(kp.secretKey)));

console.log('\n=== Cookie Clicker Treasury Keypair ===\n');
console.log('Public key (base58):');
console.log('  ' + kp.publicKey.toBase58());
console.log('\nSecret key saved to:');
console.log('  ' + outPath);
console.log('\nPublic key (hex, for the codebase):');
console.log('  ' + Buffer.from(kp.publicKey.toBytes()).toString('hex'));
console.log('\n=== NEXT STEPS ===');
console.log('1. Back up treasury.json somewhere safe (1Password, encrypted USB, etc).');
console.log('2. Bridge ~$1-2 of COOK from Solana to this treasury address:');
console.log('     ' + kp.publicKey.toBase58());
console.log('   Use https://bridge.cookiescan.io (Hyperlane).');
console.log('3. Also bridge a small amount (~0.05 COOK) to your OWN Nightly wallet');
console.log('   so you can pay tx fees for clicking.');
console.log('4. Update the codebase:');
console.log('     app/lib/cookiechain.ts: TREASURY_PUBKEY = "' + kp.publicKey.toBase58() + '"');
console.log('     app/app/page.tsx:        TREASURY_PK     = new PublicKey("' + kp.publicKey.toBase58() + '")');
console.log('\nOnce both are set, every click is a real on-chain tx that burns COOK to the treasury.');
