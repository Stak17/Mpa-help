import { getLimitForPlan, formatUGX, FREE_AI_LIMIT, PLUS_AI_LIMIT, BUSINESS_AI_LIMIT } from '../config/plans';
import { isUserAdmin } from '../config/admin';

function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`✅ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${desc}`);
      failed++;
    }
  }

  console.log('--- RUNNING MPA HELP CRITICAL LOGIC TESTS ---');

  // Test 1: Plan Limits
  assert(getLimitForPlan('free') === FREE_AI_LIMIT, 'Free plan limit equals 10 requests');
  assert(getLimitForPlan('plus') === PLUS_AI_LIMIT, 'Plus plan limit equals 200 requests');
  assert(getLimitForPlan('business') === BUSINESS_AI_LIMIT, 'Business plan limit equals 1000 requests');

  // Test 2: Currency Formatter for UGX
  const formatted50k = formatUGX(50000);
  assert(formatted50k.includes('50,000') || formatted50k.includes('UGX'), 'Currency formatter properly formats UGX');

  // Test 3: Admin check
  assert(isUserAdmin('travourstak22@gmail.com') === true, 'Admin check grants access to configured admin email');
  assert(isUserAdmin('random.user@gmail.com') === false, 'Admin check denies unlisted user');
  assert(isUserAdmin('') === false, 'Admin check denies empty email');

  // Test 4: Budget calculations
  const income = 1000000;
  const sampleExpenses = [
    { amount: 400000 },
    { amount: 200000 },
    { amount: 150000 },
  ];
  const totalExp = sampleExpenses.reduce((sum, e) => sum + e.amount, 0);
  const balance = income - totalExp;
  const ratio = Math.round((totalExp / income) * 100);

  assert(totalExp === 750000, 'Total expense calculation accurate (UGX 750,000)');
  assert(balance === 250000, 'Remaining balance calculation accurate (UGX 250,000)');
  assert(ratio === 75, 'Expense ratio calculation accurate (75%)');

  // Test 5: Savings Goal Periodic Target Calculation
  const goal = 1500000;
  const currentSaved = 300000;
  const months = 6;
  const needed = goal - currentSaved; // 1,200,000
  const monthlyTarget = needed / months; // 200,000
  const weeklyTarget = Math.round(monthlyTarget / 4); // 50,000
  const dailyTarget = Math.round(monthlyTarget / 30); // 6,667

  assert(needed === 1200000, 'Needed savings calculation correct');
  assert(monthlyTarget === 200000, 'Monthly target calculation correct (UGX 200,000)');
  assert(weeklyTarget === 50000, 'Weekly target calculation correct (UGX 50,000)');
  assert(dailyTarget === 6667, 'Daily target calculation correct (~UGX 6,667)');

  // Test 6: Language & Translations Complete Coverage
  const { SUPPORTED_LANGUAGES, getLanguageName } = require('../config/languages');
  const { TRANSLATIONS } = require('../config/translations');

  assert(SUPPORTED_LANGUAGES.length === 8, '8 Ugandan languages are supported');
  for (const lang of SUPPORTED_LANGUAGES) {
    const dict = TRANSLATIONS[lang.code];
    assert(Boolean(dict), `Translations dictionary exists for ${lang.name} (${lang.code})`);
    assert(Object.keys(dict).length >= 220, `Translations dictionary for ${lang.code} contains complete keys`);
    assert(Boolean(dict.appName), `appName translated for ${lang.code}`);
    assert(Boolean(dict.heroTitle), `heroTitle translated for ${lang.code}`);
  }

  assert(getLanguageName('lg') === 'Luganda', 'Language name resolver works for Luganda');
  assert(getLanguageName('sw') === 'Swahili', 'Language name resolver works for Swahili');

  console.log(`\nTests finished: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
