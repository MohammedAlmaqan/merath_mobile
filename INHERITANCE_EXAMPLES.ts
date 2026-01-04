/**
 * أمثلة عملية لاستخدام حاسبة المواريث المحدثة
 * Examples for using the updated inheritance calculator
 */

import { 
  calculateInheritance, 
  InheritanceEngine, 
  Fraction,
  FIQH_DATABASE,
  type EstateData,
  type HeirsData,
  type CalculationResult
} from '@/lib/inheritance-calculator';

// ============================================================================
// 1. مثال أساسي بسيط
// ============================================================================

export function basicExample() {
  const estate: EstateData = {
    total: 120000,      // إجمالي التركة
    funeral: 2000,      // تكاليف التجهيز
    debts: 5000,        // الديون
    will: 10000         // الوصية
  };

  const heirs: HeirsData = {
    husband: 1,
    son: 1,
    daughter: 2,
    father: 1,
    mother: 1
  };

  const result = calculateInheritance('shafii', estate, heirs);

  if (result.success) {
    console.log(`✅ المذهب: ${result.madhhabName}`);
    console.log(`صافي التركة: ${result.netEstate.toLocaleString()} ريال`);
    console.log(`أصل المسألة: ${result.finalBase}`);
    
    result.shares.forEach(share => {
      console.log(`- ${share.name}: ${share.fraction.toString()} = ${share.amount.toLocaleString()} ريال`);
      if (share.count > 1) {
        console.log(`  لكل فرد: ${share.amountPerPerson.toLocaleString()} ريال`);
      }
    });
  }
}

// ============================================================================
// 2. مقارنة بين المذاهب الأربعة
// ============================================================================

export function compareAllMadhabs() {
  const estate: EstateData = {
    total: 240000,
    funeral: 3000,
    debts: 12000,
    will: 15000
  };

  const heirs: HeirsData = {
    wife: 1,
    mother: 1,
    father: 1,
    son: 2,
    daughter: 1
  };

  const madhabs = ['shafii', 'hanafi', 'maliki', 'hanbali'];
  const results: { [key: string]: CalculationResult } = {};

  madhabs.forEach(madhab => {
    results[madhab] = calculateInheritance(madhab, estate, heirs);
  });

  console.log('📊 مقارنة النتائج بين المذاهب:\n');

  // رأس الجدول
  console.log(`${'الوارث':<20} | ${'الشافعي':<15} | ${'الحنفي':<15} | ${'المالكي':<15} | ${'الحنبلي':<15}`);
  console.log('-'.repeat(90));

  // جمع جميع الورثة
  const allHeirs = new Set<string>();
  madhabs.forEach(madhab => {
    if (results[madhab].success) {
      results[madhab].shares.forEach(s => allHeirs.add(s.key));
    }
  });

  // عرض كل وارث
  allHeirs.forEach(heirKey => {
    let row = `${(FIQH_DATABASE.heirNames as any)[heirKey] || heirKey}:<20} | `;
    
    madhabs.forEach(madhab => {
      const result = results[madhab];
      if (result.success) {
        const share = result.shares.find(s => s.key === heirKey);
        if (share) {
          row += `${share.fraction.toString()}:<15} | `;
        } else {
          row += `${'—':<15} | `;
        }
      }
    });

    console.log(row);
  });
}

// ============================================================================
// 3. حالة خاصة: العُمَريَّة
// ============================================================================

export function umariyyahExample() {
  const estate: EstateData = {
    total: 180000,
    funeral: 2000,
    debts: 8000,
    will: 5000
  };

  // العُمَريَّة: زوج + أب + أم بدون فرع وارث
  const heirs: HeirsData = {
    husband: 1,
    father: 1,
    mother: 1
  };

  const result = calculateInheritance('shafii', estate, heirs);

  if (result.success && result.specialCases.length > 0) {
    console.log('🔔 حالات خاصة مكتشفة:');
    result.specialCases.forEach(c => {
      console.log(`- ${c.name}: ${c.description}`);
    });

    console.log('\n📋 النتائج:');
    result.shares.forEach(s => {
      console.log(`- ${s.name}: ${s.fraction.toArabic()} = ${s.amount}`);
      console.log(`  السبب: ${s.reason}`);
    });
  }
}

// ============================================================================
// 4. حالة بها عول
// ============================================================================

export function awlExample() {
  const estate: EstateData = {
    total: 100000,
    funeral: 0,
    debts: 0,
    will: 0
  };

  // زوج + أختان شقيقتان + أم (تسبب عول)
  const heirs: HeirsData = {
    husband: 1,
    full_sister: 2,
    mother: 1
  };

  const result = calculateInheritance('shafii', estate, heirs);

  if (result.success) {
    if (result.awlApplied) {
      console.log('⚠️ تم اكتشاف عول في المسألة!');
      console.log(`أصل المسألة الأصلي: ${result.asl}`);
      console.log(`أصل المسألة بعد العول: ${result.finalBase}`);
      console.log(`نسبة العول: ${result.awlRatio?.toString()}`);
    }

    console.log('\n📊 التوزيع:');
    result.shares.forEach(s => {
      console.log(`- ${s.name}: ${s.fraction.toString()} (الأصلي: ${s.originalFraction.toString()})`);
    });
  }
}

// ============================================================================
// 5. عرض خطوات الحساب المفصلة
// ============================================================================

export function detailedStepsExample() {
  const estate: EstateData = {
    total: 300000,
    funeral: 5000,
    debts: 20000,
    will: 20000
  };

  const heirs: HeirsData = {
    wife: 1,
    son: 1,
    daughter: 1,
    mother: 1,
    father: 1
  };

  const result = calculateInheritance('maliki', estate, heirs);

  if (result.success) {
    console.log('📝 خطوات الحساب المفصلة:\n');

    result.steps.forEach((step, index) => {
      console.log(`\n${index + 1}️⃣ ${step.title}`);
      console.log(`   ${step.description}`);
      
      if (step.details) {
        if (Array.isArray(step.details)) {
          step.details.forEach(d => {
            console.log(`   • ${d.heir}: ${d.reason}`);
          });
        } else {
          console.log(`   📌 التفاصيل: ${JSON.stringify(step.details)}`);
        }
      }
    });

    console.log('\n\n🎯 النتيجة النهائية:');
    result.shares.forEach(s => {
      console.log(`✓ ${s.name}: ${s.amount.toLocaleString()} ريال`);
    });
  }
}

// ============================================================================
// 6. التحقق من الأخطاء والتحذيرات
// ============================================================================

export function errorHandlingExample() {
  const invalidCases = [
    {
      name: 'تركة بقيمة صفر',
      estate: { total: 0, funeral: 0, debts: 0, will: 0 },
      heirs: { son: 1 }
    },
    {
      name: 'زوج وزوجة معاً',
      estate: { total: 100000, funeral: 0, debts: 0, will: 0 },
      heirs: { husband: 1, wife: 1, son: 1 }
    },
    {
      name: 'وصية تتجاوز الثلث',
      estate: { total: 100000, funeral: 5000, debts: 5000, will: 50000 },
      heirs: { son: 1 }
    },
    {
      name: 'بدون ورثة',
      estate: { total: 100000, funeral: 0, debts: 0, will: 0 },
      heirs: {}
    }
  ];

  invalidCases.forEach(testCase => {
    console.log(`\n🔍 اختبار: ${testCase.name}`);
    
    const result = calculateInheritance('shafii', 
      testCase.estate as EstateData, 
      testCase.heirs as HeirsData
    );

    if (!result.success) {
      console.log(`❌ خطأ:`);
      result.errors?.forEach(error => {
        console.log(`   • ${error}`);
      });
    }
  });

  // حالة بها تحذير
  console.log(`\n\n⚠️ حالة بها تحذير (وصية قريبة من الثلث):`);
  const warningCase = calculateInheritance('shafii',
    { total: 300000, funeral: 5000, debts: 10000, will: 95000 },
    { son: 1, daughter: 1 }
  );

  if (warningCase.success && warningCase.warnings.length > 0) {
    console.log(`⚠️ التحذيرات:`);
    warningCase.warnings.forEach(w => {
      console.log(`   • ${w}`);
    });
  }
}

// ============================================================================
// 7. استخدام محرك الحساب مباشرة (للمزيد من التحكم)
// ============================================================================

export function advancedEngineUsage() {
  const estate: EstateData = {
    total: 500000,
    funeral: 10000,
    debts: 50000,
    will: 30000
  };

  const heirs: HeirsData = {
    wife: 1,
    father: 1,
    mother: 1,
    son: 2,
    daughter: 3,
    grandfather: 0  // سيتم حجبه بالأب
  };

  try {
    // إنشاء محرك الحساب
    const engine = new InheritanceEngine('hanafi', estate, heirs);
    
    // الحساب
    const result = engine.calculate();

    if (result.success) {
      console.log(`✅ نجح الحساب للمذهب ${result.madhhabName}`);
      console.log(`\nملخص المسألة:`);
      console.log(`- صافي التركة: ${result.netEstate.toLocaleString()}`);
      console.log(`- أصل المسألة: ${result.finalBase}`);
      console.log(`- عدد الورثة: ${result.shares.length}`);
      console.log(`- حالات خاصة: ${result.specialCases.length}`);
      console.log(`- ورثة محجوبون: ${result.blockedHeirs.length}`);

      // عرض الورثة المحجوبين
      if (result.blockedHeirs.length > 0) {
        console.log(`\n🚫 الورثة المحجوبون:`);
        result.blockedHeirs.forEach(b => {
          console.log(`- ${(FIQH_DATABASE.heirNames as any)[b.heir]}: ${b.reason}`);
        });
      }

      // درجة الثقة
      console.log(`\n📊 درجة الثقة: ${(result.confidence * 100).toFixed(1)}%`);
    } else {
      console.error('❌ فشل الحساب:', result.errors);
    }
  } catch (error) {
    console.error('💥 خطأ:', error);
  }
}

// ============================================================================
// 8. اختبار الكسور بشكل مباشر
// ============================================================================

export function fractionMathExample() {
  console.log('🧮 أمثلة على العمليات الحسابية على الكسور:\n');

  // إنشاء كسور
  const half = new Fraction(1, 2);
  const third = new Fraction(1, 3);
  const sixth = new Fraction(1, 6);

  console.log(`½ = ${half.toString()}`);
  console.log(`⅓ = ${third.toString()}`);
  console.log(`⅙ = ${sixth.toString()}`);

  // العمليات
  console.log(`\nالعمليات:`);
  console.log(`½ + ⅙ = ${half.add(sixth).toString()}`);
  console.log(`½ - ⅙ = ${half.subtract(sixth).toString()}`);
  console.log(`½ × ⅓ = ${half.multiply(third).toString()}`);
  console.log(`½ ÷ ⅙ = ${half.divide(sixth).toString()}`);

  // المقارنات
  console.log(`\nالمقارنات:`);
  console.log(`½ > ⅓? ${half.greaterThan(third)}`);
  console.log(`⅙ < ⅓? ${sixth.lessThan(third)}`);
  console.log(`½ = 3/6? ${half.equals(new Fraction(3, 6))}`);

  // التحويلات
  console.log(`\nالتحويلات:`);
  console.log(`⅙ عشري = ${sixth.toDecimal()}`);
  console.log(`⅙ رموز عربية = ${sixth.toArabic()}`);

  // GCD و LCM
  console.log(`\nالعمليات المتقدمة:`);
  console.log(`GCD(12, 18) = ${Fraction.gcd(12, 18)}`);
  console.log(`LCM(6, 9) = ${Fraction.lcm(6, 9)}`);
  console.log(`LCM([2, 3, 4, 6]) = ${Fraction.lcmArray([2, 3, 4, 6])}`);
}

// ============================================================================
// تشغيل جميع الأمثلة
// ============================================================================

export function runAllExamples() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('    أمثلة حاسبة المواريث الشرعية - الإصدار المتقدم v3');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('📘 مثال 1: الحساب الأساسي');
  console.log('═'.repeat(60));
  basicExample();

  console.log('\n\n📘 مثال 2: مقارنة المذاهب');
  console.log('═'.repeat(60));
  compareAllMadhabs();

  console.log('\n\n📘 مثال 3: العُمَريَّة (حالة خاصة)');
  console.log('═'.repeat(60));
  umariyyahExample();

  console.log('\n\n📘 مثال 4: العول');
  console.log('═'.repeat(60));
  awlExample();

  console.log('\n\n📘 مثال 5: خطوات الحساب المفصلة');
  console.log('═'.repeat(60));
  detailedStepsExample();

  console.log('\n\n📘 مثال 6: معالجة الأخطاء والتحذيرات');
  console.log('═'.repeat(60));
  errorHandlingExample();

  console.log('\n\n📘 مثال 7: استخدام محرك الحساب مباشرة');
  console.log('═'.repeat(60));
  advancedEngineUsage();

  console.log('\n\n📘 مثال 8: عمليات الكسور الرياضية');
  console.log('═'.repeat(60));
  fractionMathExample();
}
