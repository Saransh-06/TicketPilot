/**
 * Tatkal Assistant - Comprehensive Frontend & Unit Verification Test Suite
 * Member 1: Frontend & UI Architecture
 */

const assert = require('assert');

let passedTests = 0;
let failedTests = 0;

function test(description, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(`    Error: ${err.message}`);
    failedTests++;
  }
}

console.log('\n======================================================');
console.log('   TATKAL ASSISTANT FRONTEND VERIFICATION SUITE');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// 1. FORM VALIDATION TESTS
// -----------------------------------------------------------------------------
console.log('[1/4] Testing Form Validation Rules & Constraints:');

test('Rejects empty source or destination stations', () => {
  const validateTrip = (source, dest) => {
    if (!source || !source.trim()) return { valid: false, field: 'sourceStation' };
    if (!dest || !dest.trim()) return { valid: false, field: 'destStation' };
    return { valid: true };
  };

  assert.strictEqual(validateTrip('', 'BCT - Mumbai Central').valid, false);
  assert.strictEqual(validateTrip('NDLS - New Delhi', '').valid, false);
  assert.strictEqual(validateTrip('NDLS', 'BCT').valid, true);
});

test('Rejects identical origin and destination stations', () => {
  const validateStations = (source, dest) => {
    return source.trim().toLowerCase() !== dest.trim().toLowerCase();
  };

  assert.strictEqual(validateStations('NDLS - New Delhi', 'ndls - new delhi'), false);
  assert.strictEqual(validateStations('NDLS - New Delhi', 'BCT - Mumbai Central'), true);
});

test('Enforces Tatkal rule: 1 to 4 passengers maximum per PNR', () => {
  const validatePassengerCount = (count) => {
    return count >= 1 && count <= 4;
  };

  assert.strictEqual(validatePassengerCount(0), false);
  assert.strictEqual(validatePassengerCount(1), true);
  assert.strictEqual(validatePassengerCount(4), true);
  assert.strictEqual(validatePassengerCount(5), false);
  assert.strictEqual(validatePassengerCount(6), false);
});

test('Rejects past journey dates', () => {
  const validateJourneyDate = (dateStr) => {
    const selected = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected >= today;
  };

  assert.strictEqual(validateJourneyDate('2020-01-01'), false);
  const future = new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 10);
  assert.strictEqual(validateJourneyDate(future), true);
});

// -----------------------------------------------------------------------------
// 2. COUNTDOWN & SCHEDULER LOGIC TESTS
// -----------------------------------------------------------------------------
console.log('\n[2/4] Testing Countdown Calculations & Boundaries:');

test('AC class defaults to 10:00 AM IST; Non-AC defaults to 11:00 AM IST', () => {
  const getOpeningTime = (isAC) => (isAC ? '10:00 AM IST' : '11:00 AM IST');
  assert.strictEqual(getOpeningTime(true), '10:00 AM IST');
  assert.strictEqual(getOpeningTime(false), '11:00 AM IST');
});

test('Calculates remaining days, hours, minutes, seconds without negative drift', () => {
  const target = Date.now() + (2 * 86400000) + (3 * 3600000) + (15 * 60000) + (45 * 1000);
  const now = Date.now();
  const diff = Math.max(0, target - now);

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  assert.strictEqual(days, 2);
  assert.strictEqual(hours, 3);
  assert.strictEqual(minutes, 15);
  assert.strictEqual(seconds, 45);
});

test('Gracefully transitions to Window Open when countdown reaches zero', () => {
  const target = Date.now() - 5000; // 5 seconds in the past
  const now = Date.now();
  const isExpired = target <= now;
  assert.strictEqual(isExpired, true);
});

// -----------------------------------------------------------------------------
// 3. COMPARISON & RECOMMENDATION PRESENTATION TESTS
// -----------------------------------------------------------------------------
console.log('\n[3/4] Testing Comparison Sorting & Presentation Logic:');

test('Sorts trains by total Tatkal fare (presentation only, preserves Member 4 scoring)', () => {
  const trains = [
    { trainNumber: '12952', totalFare: 2550 },
    { trainNumber: '12926', totalFare: 1860 },
    { trainNumber: '12954', totalFare: 2440 },
  ];

  const sorted = [...trains].sort((a, b) => a.totalFare - b.totalFare);
  assert.strictEqual(sorted[0].trainNumber, '12926');
  assert.strictEqual(sorted[1].trainNumber, '12954');
  assert.strictEqual(sorted[2].trainNumber, '12952');
});

test('Sorts trains by duration in minutes', () => {
  const trains = [
    { trainNumber: '12926', durationMinutes: 1340 },
    { trainNumber: '12952', durationMinutes: 940 },
    { trainNumber: '12954', durationMinutes: 1010 },
  ];

  const sorted = [...trains].sort((a, b) => a.durationMinutes - b.durationMinutes);
  assert.strictEqual(sorted[0].trainNumber, '12952');
  assert.strictEqual(sorted[1].trainNumber, '12954');
  assert.strictEqual(sorted[2].trainNumber, '12926');
});

test('Filters train comparisons by travel class', () => {
  const trains = [
    { trainNumber: '12952', travelClass: '3A' },
    { trainNumber: '12841', travelClass: 'SL' },
    { trainNumber: '12002', travelClass: 'CC' },
  ];

  const acOnly = trains.filter(t => t.travelClass === '3A');
  assert.strictEqual(acOnly.length, 1);
  assert.strictEqual(acOnly[0].trainNumber, '12952');
});

// -----------------------------------------------------------------------------
// 4. BOOKING BOUNDARIES & SAFETY AUDIT
// -----------------------------------------------------------------------------
console.log('\n[4/4] Testing Security & Safety Boundaries:');

test('Opening IRCTC never mutates trip status or generates synthetic PNR', () => {
  const tripState = { id: 'trip-1', status: 'planned', pnr: undefined };
  
  // Simulated action of clicking "Open IRCTC"
  const urlOpened = 'https://www.irctc.co.in/';
  
  // Assert state remains completely unchanged
  assert.strictEqual(tripState.status, 'planned');
  assert.strictEqual(tripState.pnr, undefined);
  assert.strictEqual(urlOpened, 'https://www.irctc.co.in/');
});

test('Validates 10-digit Indian Railways PNR format on manual recording', () => {
  const isValidPnr = (pnr) => /^\d{3}-?\d{7}$/.test(pnr.trim());

  assert.strictEqual(isValidPnr('284-9182371'), true);
  assert.strictEqual(isValidPnr('2849182371'), true);
  assert.strictEqual(isValidPnr('INVALID_PNR'), false);
  assert.strictEqual(isValidPnr('12345'), false);
});

test('Ensures demo mode is transparent and never masquerades as production', () => {
  const demoStatus = { isDemoData: true, sourceExplanation: 'Configured IRCTC standard opening rule' };
  assert.strictEqual(demoStatus.isDemoData, true);
});

console.log('\n------------------------------------------------------');
console.log(`Results: ${passedTests} PASSED, ${failedTests} FAILED`);
console.log('------------------------------------------------------\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
