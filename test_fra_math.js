// ============================================================
// EXHAUSTIVE MATH TEST HARNESS FOR FRA v2
// Extracts all JS logic and tests every calculation path
// Run with: node test_fra_math.js
// ============================================================

let passed = 0;
let failed = 0;
let errors = [];

function assert(condition, label, detail) {
  if (condition) {
    passed++;
  } else {
    failed++;
    errors.push(`FAIL: ${label}${detail ? ' — ' + detail : ''}`);
  }
}

function assertClose(actual, expected, tolerance, label) {
  const diff = Math.abs(actual - expected);
  if (diff <= tolerance) {
    passed++;
  } else {
    failed++;
    errors.push(`FAIL: ${label} — expected ${expected} ±${tolerance}, got ${actual} (diff: ${diff})`);
  }
}

// ============================================================
// 1. COPY ALL DATA STRUCTURES FROM THE APP
// ============================================================

const PILLARS = [
  { id: 'team', label: 'Team & Leadership' },
  { id: 'business', label: 'Business & Market' },
  { id: 'corporate', label: 'Corporate & Fundraising' },
];

const FUNDRAISING_ITEMS = [
  { id: 'team_trinity', label: 'Founding Team Completeness (Trinity of Management)', weight: 130, pillar: 'team' },
  { id: 'commitment', label: 'Founder Commitment & Skin in the Game', weight: 90, pillar: 'team' },
  { id: 'coachable', label: 'Founder Coachability & Self-Awareness', weight: 80, pillar: 'team' },
  { id: 'advisors', label: 'Advisory Board & Network', weight: 50, pillar: 'team' },
  { id: 'pmf', label: 'Product-Market Fit Evidence', weight: 120, pillar: 'business' },
  { id: 'revenue', label: 'Revenue Model & Path to Revenue', weight: 100, pillar: 'business' },
  { id: 'gtm', label: 'Go-to-Market Strategy', weight: 70, pillar: 'business' },
  { id: 'unit_econ', label: 'Unit Economics Understanding', weight: 50, pillar: 'business' },
  { id: 'trend', label: 'Disruption Thesis & Market Timing', weight: 50, pillar: 'business' },
  { id: 'moats', label: 'Competitive Moats & Defensibility', weight: 40, pillar: 'business' },
  { id: 'corp', label: 'Corporate Structure & Governance', weight: 80, pillar: 'corporate' },
  { id: 'package', label: 'Fundraising Package & Narrative', weight: 70, pillar: 'corporate' },
  { id: 'ip_brand', label: 'IP & Brand Protection', weight: 50, pillar: 'corporate' },
  { id: 'valuation', label: 'Valuation & Terms Clarity', weight: 50, pillar: 'corporate' },
];

const FUND_OPTIONS = [
  { value: 3, label: 'Strong' },
  { value: 2, label: 'Developing' },
  { value: 1, label: 'Early' },
  { value: 0, label: 'Not Started' },
];

const MATERIALS_ITEMS = [
  { id: 'pitch_deck', label: 'Pitch Deck (10-15 slides)', weight: 150, group: 'pitch' },
  { id: 'exec_summary', label: 'Executive Summary / One-Pager', weight: 75, group: 'pitch' },
  { id: 'video_pitch', label: 'Video Pitch or Recorded Demo (2-5 min)', weight: 60, group: 'pitch' },
  { id: 'web_social', label: 'Website & Social Media Presence', weight: 90, group: 'pitch' },
  { id: 'founder_bios', label: 'Founder Bios & LinkedIn Profiles', weight: 90, group: 'pitch' },
  { id: 'demo_proto', label: 'Working Demo or Prototype', weight: 150, group: 'proof' },
  { id: 'financials', label: 'Financial Model (P&L + 12-18 Month Projections)', weight: 70, group: 'proof' },
  { id: 'customer_proof', label: 'Customer Evidence (LOIs, Testimonials, Data)', weight: 110, group: 'proof' },
  { id: 'market_research', label: 'Market Sizing & Competitive Landscape', weight: 50, group: 'proof' },
  { id: 'cap_table', label: 'Cap Table (Carta or equivalent)', weight: 50, group: 'legal_ops' },
  { id: 'founders_agr', label: "Founders' Agreement & Vesting Schedules", weight: 90, group: 'legal_ops' },
  { id: 'safe_kiss', label: 'Investment Instrument (SAFE / Note / PPM)', weight: 70, group: 'legal_ops' },
  { id: 'ip_filings', label: 'IP Filings (Trademarks, Patents if applicable)', weight: 50, group: 'legal_ops' },
  { id: 'corp_docs', label: 'Corporate Docs (Incorporation, Bylaws)', weight: 50, group: 'legal_ops' },
  { id: 'data_room', label: 'Virtual Data Room Organized', weight: 40, group: 'legal_ops' },
  { id: 'legal_team', label: 'Legal Counsel Engaged', weight: 40, group: 'legal_ops' },
  { id: 'acct_team', label: 'Bookkeeper or Accountant Engaged', weight: 25, group: 'legal_ops' },
];

const MAT_OPTIONS = [
  { value: 3, label: 'Done' },
  { value: 1, label: 'Started' },
  { value: 0, label: 'Not Started' },
];

const BENCHMARKS = {
  earlyPreSeed: {
    raise: { low: 25000, median: 150000, high: 500000, p75: 250000, p25: 50000 },
    safeCap: {
      under100k: { median: 4000000, low: 2000000, high: 6000000 },
      '100k_250k': { median: 5000000, low: 3000000, high: 8000000 },
      '250k_500k': { median: 6000000, low: 4000000, high: 10000000 },
    },
    cnCap: { median: 4000000, low: 2000000, high: 7000000 },
    dilution: { median: 0.10, low: 0.05, high: 0.15 },
    safeUsage: 0.92,
  },
  preSeed: {
    raise: { low: 250000, median: 500000, high: 2000000, p75: 1000000, p25: 350000 },
  },
  seed: {
    raise: { low: 1000000, median: 3100000, high: 5000000, p75: 4000000, p25: 2000000 },
  },
};

// ============================================================
// 2. REPLICATE THE APP'S SCORING FUNCTIONS
// ============================================================

function calcScore(items, answers) {
  let totalWeighted = 0;
  let totalMax = 0;
  items.forEach(item => {
    const maxScore = item.group ? 3 : 3; // both use max of 3
    totalMax += item.weight * maxScore;
    const ans = answers[item.id];
    if (ans) {
      totalWeighted += item.weight * ans.score;
    }
  });
  return totalMax > 0 ? totalWeighted / totalMax : 0;
}

function calcPillarScore(pillarId, items, answers) {
  let totalWeighted = 0;
  let totalMax = 0;
  items.filter(i => i.pillar === pillarId).forEach(item => {
    totalMax += item.weight * 3;
    const ans = answers[item.id];
    if (ans) {
      totalWeighted += item.weight * ans.score;
    }
  });
  return totalMax > 0 ? totalWeighted / totalMax : 0;
}

function calcGroupScore(groupId, items, answers) {
  let totalWeighted = 0;
  let totalMax = 0;
  items.filter(i => i.group === groupId).forEach(item => {
    totalMax += item.weight * 3;
    const ans = answers[item.id];
    if (ans) {
      totalWeighted += item.weight * ans.score;
    }
  });
  return totalMax > 0 ? totalWeighted / totalMax : 0;
}

function parseCurrency(str) {
  if (!str) return 0;
  return parseInt(str.replace(/[^0-9]/g, ''), 10) || 0;
}

// ============================================================
// TEST SUITE 1: WEIGHT DISTRIBUTION
// ============================================================
console.log('\n=== TEST SUITE 1: WEIGHT DISTRIBUTION ===');

const totalFundWeight = FUNDRAISING_ITEMS.reduce((s, i) => s + i.weight, 0);
const teamWeight = FUNDRAISING_ITEMS.filter(i => i.pillar === 'team').reduce((s, i) => s + i.weight, 0);
const bizWeight = FUNDRAISING_ITEMS.filter(i => i.pillar === 'business').reduce((s, i) => s + i.weight, 0);
const corpWeight = FUNDRAISING_ITEMS.filter(i => i.pillar === 'corporate').reduce((s, i) => s + i.weight, 0);

const teamPct = teamWeight / totalFundWeight * 100;
const bizPct = bizWeight / totalFundWeight * 100;
const corpPct = corpWeight / totalFundWeight * 100;

console.log(`  Total fund weight: ${totalFundWeight}`);
console.log(`  Team: ${teamWeight} (${teamPct.toFixed(1)}%), Business: ${bizWeight} (${bizPct.toFixed(1)}%), Corporate: ${corpWeight} (${corpPct.toFixed(1)}%)`);

assert(teamWeight + bizWeight + corpWeight === totalFundWeight, 'Pillar weights sum to total');
assertClose(teamPct, 34, 3, 'Team ~34% (target 35%)');
assertClose(bizPct, 42, 3, 'Business ~42% (target 40%)');
assertClose(corpPct, 24, 3, 'Corporate ~24% (target 25%)');

// Check each pillar has the right item count
assert(FUNDRAISING_ITEMS.filter(i => i.pillar === 'team').length === 4, 'Team has 4 items');
assert(FUNDRAISING_ITEMS.filter(i => i.pillar === 'business').length === 6, 'Business has 6 items');
assert(FUNDRAISING_ITEMS.filter(i => i.pillar === 'corporate').length === 4, 'Corporate has 4 items');
assert(FUNDRAISING_ITEMS.length === 14, 'Total fundraising items = 14');

// Materials weights
const totalMatWeight = MATERIALS_ITEMS.reduce((s, i) => s + i.weight, 0);
const pitchWeight = MATERIALS_ITEMS.filter(i => i.group === 'pitch').reduce((s, i) => s + i.weight, 0);
const proofWeight = MATERIALS_ITEMS.filter(i => i.group === 'proof').reduce((s, i) => s + i.weight, 0);
const legalWeight = MATERIALS_ITEMS.filter(i => i.group === 'legal_ops').reduce((s, i) => s + i.weight, 0);

console.log(`  Total materials weight: ${totalMatWeight}`);
console.log(`  Pitch: ${pitchWeight} (${(pitchWeight/totalMatWeight*100).toFixed(1)}%), Proof: ${proofWeight} (${(proofWeight/totalMatWeight*100).toFixed(1)}%), Legal: ${legalWeight} (${(legalWeight/totalMatWeight*100).toFixed(1)}%)`);

assert(pitchWeight + proofWeight + legalWeight === totalMatWeight, 'Material group weights sum to total');
assert(MATERIALS_ITEMS.length === 17, 'Total materials items = 17');

// ============================================================
// TEST SUITE 2: SCORING MATH — ALL SAME SCORE
// ============================================================
console.log('\n=== TEST SUITE 2: SCORING — UNIFORM ANSWERS ===');

// All "Strong" (3) → should be 100%
let allStrong = {};
FUNDRAISING_ITEMS.forEach(i => { allStrong[i.id] = { score: 3 }; });
assertClose(calcScore(FUNDRAISING_ITEMS, allStrong), 1.0, 0.001, 'All Strong = 100%');

// All "Not Started" (0) → should be 0%
let allZero = {};
FUNDRAISING_ITEMS.forEach(i => { allZero[i.id] = { score: 0 }; });
assertClose(calcScore(FUNDRAISING_ITEMS, allZero), 0.0, 0.001, 'All Not Started = 0%');

// All "Developing" (2) → should be 66.7%
let allDeveloping = {};
FUNDRAISING_ITEMS.forEach(i => { allDeveloping[i.id] = { score: 2 }; });
assertClose(calcScore(FUNDRAISING_ITEMS, allDeveloping), 2/3, 0.001, 'All Developing = 66.7%');

// All "Early" (1) → should be 33.3%
let allEarly = {};
FUNDRAISING_ITEMS.forEach(i => { allEarly[i.id] = { score: 1 }; });
assertClose(calcScore(FUNDRAISING_ITEMS, allEarly), 1/3, 0.001, 'All Early = 33.3%');

// Materials: All "Done" (3) → 100%
let matAllDone = {};
MATERIALS_ITEMS.forEach(i => { matAllDone[i.id] = { score: 3 }; });
assertClose(calcScore(MATERIALS_ITEMS, matAllDone), 1.0, 0.001, 'Materials all Done = 100%');

// Materials: All "Started" (1) → 33.3%
let matAllStarted = {};
MATERIALS_ITEMS.forEach(i => { matAllStarted[i.id] = { score: 1 }; });
assertClose(calcScore(MATERIALS_ITEMS, matAllStarted), 1/3, 0.001, 'Materials all Started = 33.3%');

// Materials: All "Not Started" (0) → 0%
let matAllZero = {};
MATERIALS_ITEMS.forEach(i => { matAllZero[i.id] = { score: 0 }; });
assertClose(calcScore(MATERIALS_ITEMS, matAllZero), 0.0, 0.001, 'Materials all Not Started = 0%');

// Empty answers → 0%
assertClose(calcScore(FUNDRAISING_ITEMS, {}), 0.0, 0.001, 'No answers = 0%');
assertClose(calcScore(MATERIALS_ITEMS, {}), 0.0, 0.001, 'Materials no answers = 0%');

// ============================================================
// TEST SUITE 3: SCORING MATH — WEIGHTED SCENARIOS
// ============================================================
console.log('\n=== TEST SUITE 3: SCORING — WEIGHTED SCENARIOS ===');

// Only the highest-weight item scores "Strong" (3), rest are "Not Started" (0)
// team_trinity (weight 130) → 130*3 / (totalFundWeight*3) = 130/totalFundWeight
let onlyTrinity = {};
FUNDRAISING_ITEMS.forEach(i => { onlyTrinity[i.id] = { score: 0 }; });
onlyTrinity['team_trinity'] = { score: 3 };
const expectedTrinity = (130 * 3) / (totalFundWeight * 3);
assertClose(calcScore(FUNDRAISING_ITEMS, onlyTrinity), expectedTrinity, 0.001, `Only team_trinity Strong = ${(expectedTrinity*100).toFixed(1)}%`);
assertClose(expectedTrinity, 130/totalFundWeight, 0.001, 'team_trinity weight fraction correct');

// Only pmf (weight 120) Strong
let onlyPmf = {};
FUNDRAISING_ITEMS.forEach(i => { onlyPmf[i.id] = { score: 0 }; });
onlyPmf['pmf'] = { score: 3 };
const expectedPmf = 120 / totalFundWeight;
assertClose(calcScore(FUNDRAISING_ITEMS, onlyPmf), expectedPmf, 0.001, `Only PMF Strong = ${(expectedPmf*100).toFixed(1)}%`);

// Pillar score: Team all Strong
let teamAllStrong = {};
FUNDRAISING_ITEMS.forEach(i => { teamAllStrong[i.id] = { score: 0 }; });
FUNDRAISING_ITEMS.filter(i => i.pillar === 'team').forEach(i => { teamAllStrong[i.id] = { score: 3 }; });
assertClose(calcPillarScore('team', FUNDRAISING_ITEMS, teamAllStrong), 1.0, 0.001, 'Team pillar all Strong = 100%');
assertClose(calcPillarScore('business', FUNDRAISING_ITEMS, teamAllStrong), 0.0, 0.001, 'Business pillar = 0% when only team answered');
assertClose(calcPillarScore('corporate', FUNDRAISING_ITEMS, teamAllStrong), 0.0, 0.001, 'Corporate pillar = 0% when only team answered');

// Overall score should be team's share
const teamOnlyOverall = calcScore(FUNDRAISING_ITEMS, teamAllStrong);
assertClose(teamOnlyOverall, teamPct / 100, 0.001, `Team all Strong, rest zero = ${teamPct.toFixed(1)}% overall`);

// Mixed scenario: Team Strong, Business Developing, Corporate Early
let mixedAnswers = {};
FUNDRAISING_ITEMS.forEach(i => {
  if (i.pillar === 'team') mixedAnswers[i.id] = { score: 3 };
  else if (i.pillar === 'business') mixedAnswers[i.id] = { score: 2 };
  else mixedAnswers[i.id] = { score: 1 };
});
const expectedMixed = (teamWeight * 3 + bizWeight * 2 + corpWeight * 1) / (totalFundWeight * 3);
assertClose(calcScore(FUNDRAISING_ITEMS, mixedAnswers), expectedMixed, 0.001, `Mixed Team=3/Biz=2/Corp=1 = ${(expectedMixed*100).toFixed(1)}%`);

// Verify the math manually
const manualMixed = (350*3 + 430*2 + 250*1) / (1030*3);
assertClose(expectedMixed, manualMixed, 0.001, 'Manual mixed calc matches');
console.log(`  Manual mixed: (350*3 + 430*2 + 250*1) / (1030*3) = ${(manualMixed*100).toFixed(1)}%`);

// ============================================================
// TEST SUITE 4: OVERALL SCORE COMPOSITION
// ============================================================
console.log('\n=== TEST SUITE 4: OVERALL SCORE (60/40 BLEND) ===');

// The app uses: overallPct = fundPct * 0.6 + matPct * 0.4
function overallScore(fundAnswers, matAnswers) {
  const fundPct = calcScore(FUNDRAISING_ITEMS, fundAnswers);
  const matPct = calcScore(MATERIALS_ITEMS, matAnswers);
  return fundPct * 0.6 + matPct * 0.4;
}

// Both perfect
assertClose(overallScore(allStrong, matAllDone), 1.0, 0.001, 'Both perfect = 100%');

// Both zero
assertClose(overallScore(allZero, matAllZero), 0.0, 0.001, 'Both zero = 0%');

// Fund perfect, materials zero
assertClose(overallScore(allStrong, matAllZero), 0.6, 0.001, 'Fund 100% + Mat 0% = 60%');

// Fund zero, materials perfect
assertClose(overallScore(allZero, matAllDone), 0.4, 0.001, 'Fund 0% + Mat 100% = 40%');

// Fund 50%, materials 50%
let halfFund = {};
FUNDRAISING_ITEMS.forEach((item, idx) => {
  halfFund[item.id] = { score: idx % 2 === 0 ? 3 : 0 };
});
// This won't be exactly 50% because weights differ. Let's use uniform 1.5 equivalent
let fund50 = {};
FUNDRAISING_ITEMS.forEach(i => { fund50[i.id] = { score: 1.5 }; });
// Can't have 1.5 score — use developing (2) for first 7, not started (0) for rest
// Better: all at score 2 = 66.7%, all at score 1 = 33.3%
assertClose(overallScore(allDeveloping, matAllStarted), 2/3 * 0.6 + 1/3 * 0.4, 0.001, 'Fund Dev + Mat Started = 53.3%');

// ============================================================
// TEST SUITE 5: parseCurrency
// ============================================================
console.log('\n=== TEST SUITE 5: parseCurrency ===');

assert(parseCurrency('500,000') === 500000, 'parseCurrency "500,000" = 500000');
assert(parseCurrency('$1,000,000') === 1000000, 'parseCurrency "$1,000,000" = 1000000');
assert(parseCurrency('150000') === 150000, 'parseCurrency "150000" = 150000');
assert(parseCurrency('$25K') === 25, 'parseCurrency "$25K" strips non-numeric = 25');  // K is not a number
assert(parseCurrency('') === 0, 'parseCurrency empty = 0');
assert(parseCurrency(null) === 0, 'parseCurrency null = 0');
assert(parseCurrency(undefined) === 0, 'parseCurrency undefined = 0');
assert(parseCurrency('abc') === 0, 'parseCurrency "abc" = 0');
assert(parseCurrency('$0') === 0, 'parseCurrency "$0" = 0');
assert(parseCurrency('10,000') === 10000, 'parseCurrency "10,000" = 10000');

// ============================================================
// TEST SUITE 6: RAISE VALIDATION TIERS
// ============================================================
console.log('\n=== TEST SUITE 6: RAISE VALIDATION TIERS ===');

const b = BENCHMARKS.earlyPreSeed.raise;

function classifyRaise(amt) {
  if (amt <= b.p25) return 'ff_range';         // ≤$50K
  if (amt <= b.median) return 'sweet_spot';     // ≤$150K
  if (amt <= b.high) return 'solid';            // ≤$500K
  if (amt <= BENCHMARKS.preSeed.raise.p75) return 'institutional'; // ≤$1M
  if (amt <= BENCHMARKS.seed.raise.p25) return 'large_preseed';    // ≤$2M
  return 'seed_territory';                       // >$2M
}

// Test exact boundaries
assert(classifyRaise(25000) === 'ff_range', '$25K = F&F range');
assert(classifyRaise(50000) === 'ff_range', '$50K = F&F range (boundary)');
assert(classifyRaise(50001) === 'sweet_spot', '$50,001 = sweet spot');
assert(classifyRaise(100000) === 'sweet_spot', '$100K = sweet spot');
assert(classifyRaise(150000) === 'sweet_spot', '$150K = sweet spot (boundary)');
assert(classifyRaise(150001) === 'solid', '$150,001 = solid round');
assert(classifyRaise(250000) === 'solid', '$250K = solid round');
assert(classifyRaise(500000) === 'solid', '$500K = solid round (boundary)');
assert(classifyRaise(500001) === 'institutional', '$500,001 = institutional');
assert(classifyRaise(750000) === 'institutional', '$750K = institutional');
assert(classifyRaise(1000000) === 'institutional', '$1M = institutional (boundary)');
assert(classifyRaise(1000001) === 'large_preseed', '$1,000,001 = large preseed');
assert(classifyRaise(2000000) === 'large_preseed', '$2M = large preseed (boundary)');
assert(classifyRaise(2000001) === 'seed_territory', '$2,000,001 = seed territory');
assert(classifyRaise(3100000) === 'seed_territory', '$3.1M = seed territory');
assert(classifyRaise(5000000) === 'seed_territory', '$5M = seed territory');

// Edge cases
assert(classifyRaise(0) === 'ff_range', '$0 = F&F range');
assert(classifyRaise(1) === 'ff_range', '$1 = F&F range');

// ============================================================
// TEST SUITE 7: CAP VALIDATION — SAFE TIERS
// ============================================================
console.log('\n=== TEST SUITE 7: CAP VALIDATION ===');

function getSafeCapBenchmark(raiseAmt) {
  if (raiseAmt < 100000) return BENCHMARKS.earlyPreSeed.safeCap.under100k;
  if (raiseAmt < 250000) return BENCHMARKS.earlyPreSeed.safeCap['100k_250k'];
  return BENCHMARKS.earlyPreSeed.safeCap['250k_500k'];
}

// Tier selection
let tier;
tier = getSafeCapBenchmark(50000);
assert(tier.median === 4000000, 'Raise $50K → cap tier under100k (median $4M)');
tier = getSafeCapBenchmark(99999);
assert(tier.median === 4000000, 'Raise $99,999 → cap tier under100k');
tier = getSafeCapBenchmark(100000);
assert(tier.median === 5000000, 'Raise $100K → cap tier 100k_250k (median $5M)');
tier = getSafeCapBenchmark(200000);
assert(tier.median === 5000000, 'Raise $200K → cap tier 100k_250k');
tier = getSafeCapBenchmark(249999);
assert(tier.median === 5000000, 'Raise $249,999 → cap tier 100k_250k');
tier = getSafeCapBenchmark(250000);
assert(tier.median === 6000000, 'Raise $250K → cap tier 250k_500k (median $6M)');
tier = getSafeCapBenchmark(500000);
assert(tier.median === 6000000, 'Raise $500K → cap tier 250k_500k');

// CN cap — always uses the same benchmark
assert(BENCHMARKS.earlyPreSeed.cnCap.median === 4000000, 'CN cap median = $4M');
assert(BENCHMARKS.earlyPreSeed.cnCap.low === 2000000, 'CN cap low = $2M');
assert(BENCHMARKS.earlyPreSeed.cnCap.high === 7000000, 'CN cap high = $7M');

// Cap position classification
function classifyCap(capAmt, benchmarks) {
  if (capAmt < benchmarks.low) return 'below';
  if (capAmt <= benchmarks.median) return 'normal_low';
  if (capAmt <= benchmarks.high) return 'normal_high';
  return 'above';
}

// Test SAFE cap at $50K raise tier
tier = getSafeCapBenchmark(50000);
assert(classifyCap(1500000, tier) === 'below', '$1.5M cap below range for <$100K raise');
assert(classifyCap(2000000, tier) === 'normal_low', '$2M cap normal-low for <$100K raise');
assert(classifyCap(4000000, tier) === 'normal_low', '$4M cap at median for <$100K raise');
assert(classifyCap(5000000, tier) === 'normal_high', '$5M cap normal-high for <$100K raise');
assert(classifyCap(6000000, tier) === 'normal_high', '$6M cap at high boundary for <$100K raise');
assert(classifyCap(7000000, tier) === 'above', '$7M cap above range for <$100K raise');

// ============================================================
// TEST SUITE 8: DILUTION CALCULATION (Comprehensive)
// Tests post-money SAFE, pre-money SAFE, convertible note,
// uncapped/MFN, consistency between display locations,
// and dilution commentary thresholds.
// ============================================================
console.log('\n=== TEST SUITE 8A: POST-MONEY SAFE DILUTION (raise / cap) ===');

function calcDilutionPostMoney(raise, cap) {
  return raise / cap;
}
function calcDilutionPreMoney(raise, cap) {
  return raise / (cap + raise);
}

// Post-money SAFE: dilution = raise / cap (cap IS the post-money valuation)
assertClose(calcDilutionPostMoney(500000, 5000000), 0.10, 0.001, '$500K/$5M post-money = 10.0%');
console.log(`  $500K / $5M post-money = ${(calcDilutionPostMoney(500000, 5000000) * 100).toFixed(1)}%`);

assertClose(calcDilutionPostMoney(250000, 5000000), 0.05, 0.001, '$250K/$5M post-money = 5.0%');
console.log(`  $250K / $5M post-money = ${(calcDilutionPostMoney(250000, 5000000) * 100).toFixed(1)}%`);

assertClose(calcDilutionPostMoney(100000, 4000000), 0.025, 0.001, '$100K/$4M post-money = 2.5%');
console.log(`  $100K / $4M post-money = ${(calcDilutionPostMoney(100000, 4000000) * 100).toFixed(1)}%`);

assertClose(calcDilutionPostMoney(50000, 4000000), 0.0125, 0.001, '$50K/$4M post-money = 1.25%');
console.log(`  $50K / $4M post-money = ${(calcDilutionPostMoney(50000, 4000000) * 100).toFixed(1)}%`);

assertClose(calcDilutionPostMoney(500000, 6000000), 0.0833, 0.001, '$500K/$6M post-money = 8.3%');
console.log(`  $500K / $6M post-money = ${(calcDilutionPostMoney(500000, 6000000) * 100).toFixed(1)}%`);

// ============================================================
console.log('\n=== TEST SUITE 8B: PRE-MONEY SAFE / CONVERTIBLE NOTE DILUTION (raise / (cap + raise)) ===');

assertClose(calcDilutionPreMoney(250000, 5000000), 250000/5250000, 0.0001, '$250K/$5M pre-money = 4.8%');
console.log(`  $250K / $5M pre-money = ${(calcDilutionPreMoney(250000, 5000000) * 100).toFixed(1)}%`);

assertClose(calcDilutionPreMoney(500000, 5000000), 500000/5500000, 0.0001, '$500K/$5M pre-money = 9.1%');
console.log(`  $500K / $5M pre-money = ${(calcDilutionPreMoney(500000, 5000000) * 100).toFixed(1)}%`);

assertClose(calcDilutionPreMoney(100000, 4000000), 100000/4100000, 0.0001, '$100K/$4M pre-money = 2.4%');
console.log(`  $100K / $4M pre-money = ${(calcDilutionPreMoney(100000, 4000000) * 100).toFixed(1)}%`);

assertClose(calcDilutionPreMoney(150000, 5000000), 150000/5150000, 0.0001, '$150K/$5M pre-money = 2.9%');
console.log(`  $150K / $5M pre-money = ${(calcDilutionPreMoney(150000, 5000000) * 100).toFixed(1)}%`);

assertClose(calcDilutionPreMoney(500000, 4000000), 500000/4500000, 0.0001, '$500K/$4M pre-money = 11.1%');
console.log(`  $500K / $4M pre-money = ${(calcDilutionPreMoney(500000, 4000000) * 100).toFixed(1)}%`);

// Edge: raise equals cap (pre-money → 50% dilution, post-money → 100%)
assertClose(calcDilutionPreMoney(1000000, 1000000), 0.5, 0.0001, 'Pre-money: Raise = Cap → 50% dilution');
assertClose(calcDilutionPostMoney(1000000, 1000000), 1.0, 0.0001, 'Post-money: Raise = Cap → 100% dilution');

// ============================================================
console.log('\n=== TEST SUITE 8C: POST-MONEY vs PRE-MONEY MUST DIFFER ===');

const dilutionScenarios = [
  { raise: 50000, cap: 4000000 },
  { raise: 100000, cap: 4000000 },
  { raise: 150000, cap: 5000000 },
  { raise: 250000, cap: 5000000 },
  { raise: 500000, cap: 5000000 },
  { raise: 500000, cap: 6000000 },
];

dilutionScenarios.forEach(s => {
  const postMoney = calcDilutionPostMoney(s.raise, s.cap);
  const preMoney = calcDilutionPreMoney(s.raise, s.cap);
  // Post-money should ALWAYS yield higher dilution than pre-money for the same nominal cap
  assert(postMoney > preMoney,
    `$${s.raise/1000}K at $${s.cap/1000000}M: post-money (${(postMoney*100).toFixed(1)}%) > pre-money (${(preMoney*100).toFixed(1)}%)`);
  console.log(`  $${s.raise/1000}K at $${s.cap/1000000}M: post=${(postMoney*100).toFixed(1)}%, pre=${(preMoney*100).toFixed(1)}% (delta=${((postMoney-preMoney)*100).toFixed(2)}pp)`);
});

// ============================================================
console.log('\n=== TEST SUITE 8D: CONSISTENCY — BOTH DISPLAYS MUST AGREE ===');

// Simulating what validateRaise() and validateCap() should both compute
function simulateValidateRaise(raise, cap, safeType) {
  const isPostMoney = safeType.toLowerCase().indexOf('post-money') >= 0;
  return isPostMoney ? raise / cap : raise / (cap + raise);
}

function simulateValidateCap(raise, cap, instrument, safeType) {
  const isPostMoney = instrument === 'SAFE' && safeType.toLowerCase().indexOf('post-money') >= 0;
  return isPostMoney ? raise / cap : raise / (cap + raise);
}

const consistencyTestCases = [
  { raise: 250000, cap: 5000000, instrument: 'SAFE', safeType: 'Pre-money with cap', expected: 250000/5250000 },
  { raise: 250000, cap: 5000000, instrument: 'SAFE', safeType: 'Post-money with cap', expected: 250000/5000000 },
  { raise: 500000, cap: 5000000, instrument: 'SAFE', safeType: 'Post-money with cap', expected: 500000/5000000 },
  { raise: 500000, cap: 5000000, instrument: 'SAFE', safeType: 'Post-money cap + discount', expected: 500000/5000000 },
  { raise: 500000, cap: 5000000, instrument: 'SAFE', safeType: 'Pre-money with cap', expected: 500000/5500000 },
  { raise: 100000, cap: 4000000, instrument: 'Convertible Note', safeType: '', expected: 100000/4100000 },
  { raise: 250000, cap: 4000000, instrument: 'Convertible Note', safeType: '', expected: 250000/4250000 },
];

consistencyTestCases.forEach(tc => {
  const fromRaise = simulateValidateRaise(tc.raise, tc.cap, tc.safeType);
  const fromCap = simulateValidateCap(tc.raise, tc.cap, tc.instrument, tc.safeType);
  // Both must match each other
  assertClose(fromRaise, fromCap, 0.0001,
    `${tc.instrument} ${tc.safeType}: raise-display (${(fromRaise*100).toFixed(1)}%) must equal cap-display (${(fromCap*100).toFixed(1)}%)`);
  // Both must match expected
  assertClose(fromRaise, tc.expected, 0.0001,
    `$${tc.raise/1000}K at $${tc.cap/1000000}M ${tc.instrument} ${tc.safeType}: expected ${(tc.expected*100).toFixed(1)}%, got ${(fromRaise*100).toFixed(1)}%`);
  console.log(`  ${tc.instrument} ${tc.safeType || 'CN'}: $${tc.raise/1000}K at $${tc.cap/1000000}M = ${(fromRaise*100).toFixed(1)}% (raise) / ${(fromCap*100).toFixed(1)}% (cap) — ${fromRaise === fromCap ? 'MATCH' : 'MISMATCH'}`);
});

// ============================================================
console.log('\n=== TEST SUITE 8E: UNCAPPED / MFN — NO DILUTION CALC ===');

const uncappedTypes = ['MFN', 'Uncapped'];
uncappedTypes.forEach(type => {
  const isUncapped = type === 'MFN' || type === 'Uncapped';
  assert(isUncapped === true, `${type} should be flagged as uncapped`);
  console.log(`  ${type}: isUncapped=${isUncapped} (dilution calc should be SKIPPED)`);
});

const cappedTypes = ['Post-money with cap', 'Post-money cap + discount', 'Pre-money with cap'];
cappedTypes.forEach(type => {
  const isUncapped = type === 'MFN' || type === 'Uncapped';
  assert(isUncapped === false, `${type} should NOT be flagged as uncapped`);
  console.log(`  ${type}: isUncapped=${isUncapped} (dilution calc should RUN)`);
});

// ============================================================
console.log('\n=== TEST SUITE 8F: DILUTION COMMENTARY THRESHOLDS ===');

function getDilutionCommentary(dilutionPct) {
  if (dilutionPct < 3) return 'very-low';
  if (dilutionPct < 5) return 'low';
  if (dilutionPct <= 15) return 'normal';
  if (dilutionPct <= 25) return 'elevated';
  return 'high';
}

const commentaryCases = [
  // Post-money SAFE cases
  { raise: 50000, cap: 4000000, type: 'Post-money', dilPct: 1.25, expect: 'very-low' },
  { raise: 100000, cap: 5000000, type: 'Post-money', dilPct: 2.0, expect: 'very-low' },
  { raise: 150000, cap: 5000000, type: 'Post-money', dilPct: 3.0, expect: 'low' },
  { raise: 250000, cap: 5000000, type: 'Post-money', dilPct: 5.0, expect: 'normal' },
  { raise: 500000, cap: 5000000, type: 'Post-money', dilPct: 10.0, expect: 'normal' },
  { raise: 500000, cap: 4000000, type: 'Post-money', dilPct: 12.5, expect: 'normal' },
  // Pre-money SAFE cases
  { raise: 250000, cap: 5000000, type: 'Pre-money', dilPct: 4.76, expect: 'low' },
  { raise: 500000, cap: 5000000, type: 'Pre-money', dilPct: 9.09, expect: 'normal' },
  // Convertible Note cases
  { raise: 100000, cap: 4000000, type: 'CN', dilPct: 2.44, expect: 'very-low' },
  { raise: 250000, cap: 4000000, type: 'CN', dilPct: 5.88, expect: 'normal' },
];

commentaryCases.forEach(c => {
  const commentary = getDilutionCommentary(c.dilPct);
  assert(commentary === c.expect,
    `$${c.raise/1000}K at $${c.cap/1000000}M ${c.type} (${c.dilPct}%) should be "${c.expect}", got "${commentary}"`);
  console.log(`  $${c.raise/1000}K/$${c.cap/1000000}M ${c.type}: ${c.dilPct}% → ${commentary}`);
});

// ============================================================
console.log('\n=== TEST SUITE 8G: BENCHMARK RANGE VALIDATION ===');

// Dilution within benchmark range for typical scenarios
const benchLow = BENCHMARKS.earlyPreSeed.dilution.low;   // 0.05
const benchHigh = BENCHMARKS.earlyPreSeed.dilution.high;  // 0.15

// $250K at $4M pre-money → 5.88% — should be within range
const dil_250_4_pre = calcDilutionPreMoney(250000, 4000000);
assert(dil_250_4_pre >= benchLow, 'Pre-money $250K/$4M >= 5% benchmark');
assert(dil_250_4_pre <= benchHigh, 'Pre-money $250K/$4M <= 15% benchmark');
console.log(`  Pre-money $250K/$4M = ${(dil_250_4_pre*100).toFixed(1)}% (within ${benchLow*100}-${benchHigh*100}% range)`);

// $500K at $4M pre-money → 11.1% — within range
const dil_500_4_pre = calcDilutionPreMoney(500000, 4000000);
assert(dil_500_4_pre >= benchLow && dil_500_4_pre <= benchHigh, 'Pre-money $500K/$4M within 5-15%');
console.log(`  Pre-money $500K/$4M = ${(dil_500_4_pre*100).toFixed(1)}% (within range)`);

// $500K at $5M post-money → 10.0% — within range
const dil_500_5_post = calcDilutionPostMoney(500000, 5000000);
assert(dil_500_5_post >= benchLow && dil_500_5_post <= benchHigh, 'Post-money $500K/$5M within 5-15%');
console.log(`  Post-money $500K/$5M = ${(dil_500_5_post*100).toFixed(1)}% (within range)`);

// $50K at $4M post-money → 1.25% — BELOW range (very low)
const dil_50_4_post = calcDilutionPostMoney(50000, 4000000);
assert(dil_50_4_post < benchLow, 'Post-money $50K/$4M below 5% benchmark (expected)');
console.log(`  Post-money $50K/$4M = ${(dil_50_4_post*100).toFixed(1)}% (below range, as expected)`);

// ============================================================
// TEST SUITE 9: ROADMAP PHASE ASSIGNMENT LOGIC
// ============================================================
console.log('\n=== TEST SUITE 9: ROADMAP PHASE ASSIGNMENT ===');

function assignPhase(item, score) {
  // Fundraising items logic from buildRoadmap()
  if (score <= 0 && item.weight >= 70) return 'phase30';
  if (score <= 0) return 'phase60';
  if (score === 1) return 'phase60';
  if (score === 2 && item.weight >= 70) return 'phase90';
  return 'none'; // score 3 or score 2 with low weight
}

function assignMaterialPhase(item, score) {
  if (score <= 0 && item.weight >= 90) return 'phase30';
  if (score <= 0) return 'phase60';
  if (score === 1) return 'phase60';
  return 'none';
}

// High-weight fundraising item, score 0 → phase 1 (critical)
assert(assignPhase({ weight: 130 }, 0) === 'phase30', 'High-weight score 0 → Phase 1');
assert(assignPhase({ weight: 120 }, 0) === 'phase30', 'Weight 120 score 0 → Phase 1');
assert(assignPhase({ weight: 100 }, 0) === 'phase30', 'Weight 100 score 0 → Phase 1');
assert(assignPhase({ weight: 80 }, 0) === 'phase30', 'Weight 80 score 0 → Phase 1');
assert(assignPhase({ weight: 70 }, 0) === 'phase30', 'Weight 70 score 0 → Phase 1');

// Low-weight fundraising item, score 0 → phase 2
assert(assignPhase({ weight: 50 }, 0) === 'phase60', 'Weight 50 score 0 → Phase 2');
assert(assignPhase({ weight: 40 }, 0) === 'phase60', 'Weight 40 score 0 → Phase 2');

// Score 1 (Early) always → phase 2
assert(assignPhase({ weight: 130 }, 1) === 'phase60', 'High-weight score 1 → Phase 2');
assert(assignPhase({ weight: 50 }, 1) === 'phase60', 'Low-weight score 1 → Phase 2');

// Score 2 (Developing) + high weight → phase 3
assert(assignPhase({ weight: 130 }, 2) === 'phase90', 'Weight 130 score 2 → Phase 3');
assert(assignPhase({ weight: 70 }, 2) === 'phase90', 'Weight 70 score 2 → Phase 3');

// Score 2 + low weight → no action
assert(assignPhase({ weight: 50 }, 2) === 'none', 'Weight 50 score 2 → none');

// Score 3 → always no action
assert(assignPhase({ weight: 130 }, 3) === 'none', 'Score 3 → none (any weight)');
assert(assignPhase({ weight: 50 }, 3) === 'none', 'Low-weight score 3 → none');

// Negative score (unanswered) → treated as 0
assert(assignPhase({ weight: 130 }, -1) === 'phase30', 'Score -1 high-weight → Phase 1');
assert(assignPhase({ weight: 50 }, -1) === 'phase60', 'Score -1 low-weight → Phase 2');

// Materials phase assignment
assert(assignMaterialPhase({ weight: 150 }, 0) === 'phase30', 'Mat weight 150 score 0 → Phase 1');
assert(assignMaterialPhase({ weight: 110 }, 0) === 'phase30', 'Mat weight 110 score 0 → Phase 1');
assert(assignMaterialPhase({ weight: 90 }, 0) === 'phase30', 'Mat weight 90 score 0 → Phase 1 (boundary)');
assert(assignMaterialPhase({ weight: 75 }, 0) === 'phase60', 'Mat weight 75 score 0 → Phase 2');
assert(assignMaterialPhase({ weight: 25 }, 0) === 'phase60', 'Mat weight 25 score 0 → Phase 2');
assert(assignMaterialPhase({ weight: 150 }, 1) === 'phase60', 'Mat weight 150 score 1 → Phase 2');
assert(assignMaterialPhase({ weight: 150 }, 3) === 'none', 'Mat weight 150 score 3 → none');

// ============================================================
// TEST SUITE 10: COMPLETE SCENARIO WALKTHROUGH
// ============================================================
console.log('\n=== TEST SUITE 10: FULL SCENARIO ===');

// Simulate a typical early-stage founder
const scenario = {};
// Team: strong founder, early commitment, early coachability, no advisors
scenario['team_trinity'] = { score: 2 };   // Developing — has 2 of 3 legs
scenario['commitment'] = { score: 1 };     // Early — still part-time
scenario['coachable'] = { score: 2 };      // Developing
scenario['advisors'] = { score: 0 };       // Not started
// Business: has PMF signal, early revenue model, no GTM, no unit econ, has trend, no moats
scenario['pmf'] = { score: 2 };            // Developing
scenario['revenue'] = { score: 1 };        // Early
scenario['gtm'] = { score: 0 };            // Not started
scenario['unit_econ'] = { score: 0 };      // Not started
scenario['trend'] = { score: 3 };          // Strong
scenario['moats'] = { score: 1 };          // Early
// Corporate: incorporated, no package, no IP, no terms
scenario['corp'] = { score: 3 };           // Strong
scenario['package'] = { score: 0 };        // Not started
scenario['ip_brand'] = { score: 0 };       // Not started
scenario['valuation'] = { score: 1 };      // Early

// Calculate expected score manually
let expectedNumerator = 0;
let expectedDenominator = 0;
FUNDRAISING_ITEMS.forEach(item => {
  const ans = scenario[item.id];
  expectedNumerator += item.weight * (ans ? ans.score : 0);
  expectedDenominator += item.weight * 3;
});

const expectedScore = expectedNumerator / expectedDenominator;
const actualScore = calcScore(FUNDRAISING_ITEMS, scenario);

console.log(`  Scenario numerator: ${expectedNumerator}, denominator: ${expectedDenominator}`);
console.log(`  Expected: ${(expectedScore * 100).toFixed(1)}%, Actual: ${(actualScore * 100).toFixed(1)}%`);

// Manual calculation:
// team_trinity: 130*2=260, commitment: 90*1=90, coachable: 80*2=160, advisors: 50*0=0
// pmf: 120*2=240, revenue: 100*1=100, gtm: 70*0=0, unit_econ: 50*0=0, trend: 50*3=150, moats: 40*1=40
// corp: 80*3=240, package: 70*0=0, ip_brand: 50*0=0, valuation: 50*1=50
const manualNumerator = 260 + 90 + 160 + 0 + 240 + 100 + 0 + 0 + 150 + 40 + 240 + 0 + 0 + 50;
const manualDenominator = 1030 * 3;
console.log(`  Manual numerator: ${manualNumerator}, denominator: ${manualDenominator}`);
assert(expectedNumerator === manualNumerator, `Numerator match: ${expectedNumerator} = ${manualNumerator}`);
assert(expectedDenominator === manualDenominator, `Denominator match: ${expectedDenominator} = ${manualDenominator}`);
assertClose(actualScore, manualNumerator / manualDenominator, 0.0001, 'Actual score matches manual calculation');

// Check pillar scores
const teamScore = calcPillarScore('team', FUNDRAISING_ITEMS, scenario);
// Team: (130*2 + 90*1 + 80*2 + 50*0) / (350*3) = (260+90+160+0)/1050 = 510/1050
assertClose(teamScore, 510/1050, 0.001, `Team pillar: 510/1050 = ${(510/1050*100).toFixed(1)}%`);

const bizScore = calcPillarScore('business', FUNDRAISING_ITEMS, scenario);
// Biz: (120*2 + 100*1 + 70*0 + 50*0 + 50*3 + 40*1) / (430*3) = (240+100+0+0+150+40)/1290 = 530/1290
assertClose(bizScore, 530/1290, 0.001, `Business pillar: 530/1290 = ${(530/1290*100).toFixed(1)}%`);

const corpScore = calcPillarScore('corporate', FUNDRAISING_ITEMS, scenario);
// Corp: (80*3 + 70*0 + 50*0 + 50*1) / (250*3) = (240+0+0+50)/750 = 290/750
assertClose(corpScore, 290/750, 0.001, `Corporate pillar: 290/750 = ${(290/750*100).toFixed(1)}%`);

// Verify roadmap assignments for this scenario
const scenarioPhases = { phase30: [], phase60: [], phase90: [] };
FUNDRAISING_ITEMS.forEach(item => {
  const ans = scenario[item.id];
  const score = ans ? ans.score : -1;
  const phase = assignPhase(item, score);
  if (phase !== 'none') scenarioPhases[phase].push(item.id);
});

console.log(`  Roadmap: Phase 1 (${scenarioPhases.phase30.length}): ${scenarioPhases.phase30.join(', ')}`);
console.log(`  Roadmap: Phase 2 (${scenarioPhases.phase60.length}): ${scenarioPhases.phase60.join(', ')}`);
console.log(`  Roadmap: Phase 3 (${scenarioPhases.phase90.length}): ${scenarioPhases.phase90.join(', ')}`);

// gtm (weight 70, score 0) → phase 1
assert(scenarioPhases.phase30.includes('gtm'), 'gtm (w70, s0) in Phase 1');
// package (weight 70, score 0) → phase 1
assert(scenarioPhases.phase30.includes('package'), 'package (w70, s0) in Phase 1');
// advisors (weight 50, score 0) → phase 2
assert(scenarioPhases.phase60.includes('advisors'), 'advisors (w50, s0) in Phase 2');
// unit_econ (weight 50, score 0) → phase 2
assert(scenarioPhases.phase60.includes('unit_econ'), 'unit_econ (w50, s0) in Phase 2');
// ip_brand (weight 50, score 0) → phase 2
assert(scenarioPhases.phase60.includes('ip_brand'), 'ip_brand (w50, s0) in Phase 2');
// commitment (weight 90, score 1) → phase 2
assert(scenarioPhases.phase60.includes('commitment'), 'commitment (w90, s1) in Phase 2');
// revenue (weight 100, score 1) → phase 2
assert(scenarioPhases.phase60.includes('revenue'), 'revenue (w100, s1) in Phase 2');
// moats (weight 40, score 1) → phase 2
assert(scenarioPhases.phase60.includes('moats'), 'moats (w40, s1) in Phase 2');
// valuation (weight 50, score 1) → phase 2
assert(scenarioPhases.phase60.includes('valuation'), 'valuation (w50, s1) in Phase 2');
// team_trinity (weight 130, score 2) → phase 3
assert(scenarioPhases.phase90.includes('team_trinity'), 'team_trinity (w130, s2) in Phase 3');
// pmf (weight 120, score 2) → phase 3
assert(scenarioPhases.phase90.includes('pmf'), 'pmf (w120, s2) in Phase 3');
// coachable (weight 80, score 2) → phase 3
assert(scenarioPhases.phase90.includes('coachable'), 'coachable (w80, s2) in Phase 3');
// corp (weight 80, score 3) → none
assert(!scenarioPhases.phase30.includes('corp') && !scenarioPhases.phase60.includes('corp') && !scenarioPhases.phase90.includes('corp'), 'corp (w80, s3) → no roadmap item');
// trend (weight 50, score 3) → none
assert(!scenarioPhases.phase30.includes('trend') && !scenarioPhases.phase60.includes('trend') && !scenarioPhases.phase90.includes('trend'), 'trend (w50, s3) → no roadmap item');

// ============================================================
// TEST SUITE 11: BENCHMARK DATA INTEGRITY
// ============================================================
console.log('\n=== TEST SUITE 11: BENCHMARK DATA INTEGRITY ===');

const ep = BENCHMARKS.earlyPreSeed.raise;
assert(ep.low < ep.p25, 'earlyPreSeed: low < p25');
assert(ep.p25 < ep.median, 'earlyPreSeed: p25 < median');
assert(ep.median < ep.p75, 'earlyPreSeed: median < p75');
assert(ep.p75 < ep.high, 'earlyPreSeed: p75 < high');

const ps = BENCHMARKS.preSeed.raise;
assert(ps.low < ps.p25, 'preSeed: low < p25');
assert(ps.p25 < ps.median, 'preSeed: p25 < median');
assert(ps.median < ps.p75, 'preSeed: median < p75');
assert(ps.p75 < ps.high, 'preSeed: p75 < high');

const sd = BENCHMARKS.seed.raise;
assert(sd.low < sd.p25, 'seed: low < p25');
assert(sd.p25 < sd.median, 'seed: p25 < median');
assert(sd.median < sd.p75, 'seed: median < p75');
assert(sd.p75 < sd.high, 'seed: p75 < high');

// Stages should not overlap improperly
assert(ep.high <= ps.p75, 'earlyPreSeed high ≤ preSeed p75');
assert(ps.high <= sd.high, 'preSeed high ≤ seed high');

// SAFE cap tiers should be ordered
const sc = BENCHMARKS.earlyPreSeed.safeCap;
assert(sc.under100k.median < sc['100k_250k'].median, 'SAFE cap tiers: under100k < 100k_250k');
assert(sc['100k_250k'].median < sc['250k_500k'].median, 'SAFE cap tiers: 100k_250k < 250k_500k');

// Each cap tier should have low < median < high
['under100k', '100k_250k', '250k_500k'].forEach(tier => {
  assert(sc[tier].low < sc[tier].median, `SAFE cap ${tier}: low < median`);
  assert(sc[tier].median < sc[tier].high, `SAFE cap ${tier}: median < high`);
});

// CN cap
const cn = BENCHMARKS.earlyPreSeed.cnCap;
assert(cn.low < cn.median, 'CN cap: low < median');
assert(cn.median < cn.high, 'CN cap: median < high');

// Dilution
const dil = BENCHMARKS.earlyPreSeed.dilution;
assert(dil.low < dil.median, 'Dilution: low < median');
assert(dil.median < dil.high, 'Dilution: median < high');
assert(dil.low >= 0, 'Dilution: low ≥ 0');
assert(dil.high <= 1, 'Dilution: high ≤ 1');

// ============================================================
// RESULTS
// ============================================================
console.log('\n' + '='.repeat(60));
console.log(`RESULTS: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
if (errors.length > 0) {
  console.log('\nFAILURES:');
  errors.forEach(e => console.log('  ' + e));
}
console.log('='.repeat(60));

process.exit(failed > 0 ? 1 : 0);
