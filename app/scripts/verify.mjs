# Cookie Keno — stage verification
#
# Runs explicit pass/fail checks for each stage of the build.
# After each stage, run: `node app/scripts/verify.mjs N`
# To verify everything: `node app/scripts/verify.mjs all`
#
# Exits 0 if all checks pass, 1 if any fail.
# Writes a report to `app/scripts/reports/stage-N.json`.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO = join(__dirname, '..', '..');
const APP = join(REPO, 'app');

const STAGE = process.argv[2] ?? 'all';
const CHECKS = {
  0: checkStage0,
  1: checkStage1,
  2: checkStage2,
  3: checkStage3,
  4: checkStage4,
  5: checkStage5,
  6: checkStage6,
  7: checkStage7,
};

const results = [];
let failed = 0;

function check(name, fn) {
  try {
    const r = fn();
    if (r === true || r === undefined) {
      results.push({ name, pass: true });
      console.log(`  PASS  ${name}`);
    } else {
      results.push({ name, pass: false, reason: typeof r === 'string' ? r : 'check failed' });
      failed++;
      console.log(`  FAIL  ${name}  —  ${typeof r === 'string' ? r : 'check failed'}`);
    }
  } catch (e) {
    results.push({ name, pass: false, reason: e.message });
    failed++;
    console.log(`  FAIL  ${name}  —  ${e.message}`);
  }
}

function fileExists(p) {
  return existsSync(p);
}

function fileContains(p, needle) {
  if (!existsSync(p)) return `${p} does not exist`;
  return readFileSync(p, 'utf8').includes(needle) || `expected to find "${needle}" in ${p}`;
}

// Stage 0: Setup
function checkStage0() {
  console.log('Stage 0 — Set up');
  check('app/node_modules exists', () => fileExists(join(APP, 'node_modules')));
  check('package.json has @solana/web3.js', () =>
    fileContains(join(APP, 'package.json'), '@solana/web3.js')
  );
  check('treasury.json exists', () => fileExists(join(APP, 'scripts', 'treasury.json')));
  check('THESIS.md updated to keno', () => fileContains(join(REPO, 'THESIS.md'), 'Cookie Keno'));
  check('stale clicker page.tsx removed', () => !fileExists(join(APP, 'app', 'page.tsx')) ? true : 'app/app/page.tsx still exists (delete stale clicker)');
  check('app/lib/clicker.ts removed', () => !fileExists(join(APP, 'lib', 'clicker.ts')) ? true : 'app/lib/clicker.ts still exists');
  check('app/lib/keno.ts created', () => fileExists(join(APP, 'lib', 'keno.ts')));
}

// Stage 1: Board UI
function checkStage1() {
  console.log('Stage 1 — Keno board UI');
  check('app/app/page.tsx exists', () => fileExists(join(APP, 'app', 'page.tsx')));
  check('app/components/KenoBoard.tsx exists', () => fileExists(join(APP, 'components', 'KenoBoard.tsx')));
  check('app/components/WagerPanel.tsx exists', () => fileExists(join(APP, 'components', 'WagerPanel.tsx')));
  check('keno numbers 1-40 referenced in code', () => {
    const candidates = [
      join(APP, 'app', 'page.tsx'),
      join(APP, 'components', 'KenoBoard.tsx'),
      join(APP, 'lib', 'keno.ts'),
    ].filter(fileExists);
    return candidates.some((p) => /40/.test(readFileSync(p, 'utf8')))
      || 'No file references the number 40 (the keno pool size)';
  });
  check('wager input field present', () =>
    fileContains(join(APP, 'components', 'WagerPanel.tsx'), 'input') ||
    fileContains(join(APP, 'app', 'page.tsx'), 'wager')
  );
}

// Stage 2: Wager tx
function checkStage2() {
  console.log('Stage 2 — Real wager tx');
  check('SystemProgram.transfer used in keno lib', () =>
    fileContains(join(APP, 'lib', 'keno.ts'), 'SystemProgram.transfer')
  );
  check('Memo program used for picks', () =>
    fileContains(join(APP, 'lib', 'keno.ts'), 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr') ||
    fileContains(join(APP, 'lib', 'keno.ts'), 'memo')
  );
  check('wager tx builder function exists', () => {
    const f = readFileSync(join(APP, 'lib', 'keno.ts'), 'utf8');
    return /buildWager|buildPlay|playRound|buildKenoTx/.test(f) || 'no wager tx builder found in keno.ts';
  });
  check('recentBlockhash is set (not empty)', () => {
    const f = readFileSync(join(APP, 'app', 'page.tsx'), 'utf8');
    if (!/recentBlockhash/.test(f)) return 'recentBlockhash not mentioned in page.tsx';
    if (/recentBlockhash\s*=\s*['"]\s*['"]/.test(f)) return 'recentBlockhash set to empty string — will be rejected';
    return true;
  });
}

// Stage 3: Draw + payout
function checkStage3() {
  console.log('Stage 3 — Draw + payout');
  check('draw function exists', () => {
    const f = readFileSync(join(APP, 'lib', 'keno.ts'), 'utf8');
    return /drawNumbers|generateDraw|computeDraw/.test(f) || 'no draw function in keno.ts';
  });
  check('payout function exists', () => {
    const f = readFileSync(join(APP, 'lib', 'keno.ts'), 'utf8');
    return /payout|calcPayout|computePayout/.test(f) || 'no payout function in keno.ts';
  });
  check('blockhash used for randomness', () => {
    const f = readFileSync(join(APP, 'lib', 'keno.ts'), 'utf8');
    return /blockhash/.test(f) || 'no blockhash reference in keno.ts';
  });
  check('treasury payout tx from client', () => {
    const f = readFileSync(join(APP, 'app', 'page.tsx'), 'utf8');
    return /treasury.*payout|signPayout|treasuryKeypair|treasury\.json/.test(f) || 'no treasury payout flow in page.tsx';
  });
  check('DrawDisplay component exists', () => fileExists(join(APP, 'components', 'DrawDisplay.tsx')));
}

// Stage 4: Provably-fair verify display
function checkStage4() {
  console.log('Stage 4 — Provably-fair verify display');
  check('verify display in DrawDisplay or page', () => {
    const candidates = [join(APP, 'components', 'DrawDisplay.tsx'), join(APP, 'app', 'page.tsx')];
    return candidates.some((p) => fileExists(p) && /verify|derivation|blockhash.*mod/.test(readFileSync(p, 'utf8')))
      || 'no verify display found';
  });
}

// Stage 5: Leaderboard
function checkStage5() {
  console.log('Stage 5 — Leaderboard');
  check('app/lib/leaderboard.ts exists', () => fileExists(join(APP, 'lib', 'leaderboard.ts')));
  check('Leaderboard component exists', () => fileExists(join(APP, 'components', 'Leaderboard.tsx')));
  check('reads from cookiescan or RPC', () => {
    const candidates = [join(APP, 'lib', 'leaderboard.ts'), join(APP, 'app', 'page.tsx')];
    return candidates.some((p) => fileExists(p) && /cookiescan|getSignaturesForAddress|getConfirmedSignatures/.test(readFileSync(p, 'utf8')))
      || 'no cookiescan/RPC read in leaderboard code';
  });
}

// Stage 6: .cook name multiplier
function checkStage6() {
  console.log('Stage 6 — .cook name multiplier');
  check('reads Name Service program ID', () =>
    fileContains(join(APP, 'lib', 'keno.ts'), 'namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX') ||
    fileContains(join(APP, 'app', 'page.tsx'), 'namesLPneVptA9Z5rqUDD9tMTWEJwofgaYwp8cawRkX')
  );
  check('multiplier value of 1.5x or similar', () => {
    const candidates = [join(APP, 'lib', 'keno.ts'), join(APP, 'app', 'page.tsx')];
    return candidates.some((p) => fileExists(p) && /1\.5|nameMultiplier|nameBonus|cook.*name/.test(readFileSync(p, 'utf8')))
      || 'no name-multiplier logic';
  });
}

// Stage 7: Polish + ship
function checkStage7() {
  console.log('Stage 7 — Polish + ship');
  check('README mentions keno', () => fileContains(join(REPO, 'README.md') || join(APP, 'README.md'), 'Keno') || fileContains(join(REPO, 'THESIS.md'), 'Cookie Keno'));
  check('treasury address in docs', () =>
    fileContains(join(REPO, 'THESIS.md'), '5Nhcsv4ip2dF5fyN6of3NR98pv3wq75tWdPgqi9iDf29')
  );
  check('all keno stages pass individually', () => 'see summary below');
}

const toRun = STAGE === 'all' ? Object.keys(CHECKS) : [STAGE];
for (const s of toRun) {
  const fn = CHECKS[s];
  if (!fn) {
    console.log(`Unknown stage: ${s}`);
    process.exit(1);
  }
  fn();
  console.log('');
}

// Write report
const dir = join(__dirname, 'reports');
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
const report = {
  stage: STAGE,
  timestamp: new Date().toISOString(),
  passed: results.length - failed,
  failed,
  checks: results,
};
const reportFile = STAGE === 'all' ? 'all.json' : `stage-${STAGE}.json`;
writeFileSync(join(dir, reportFile), JSON.stringify(report, null, 2));

console.log(`Summary: ${results.length - failed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
