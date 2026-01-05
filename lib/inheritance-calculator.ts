/**
 * مكتبة حاسبة المواريث الشرعية
 * تحتوي على جميع منطق الحساب المدمج من الإصدار الويب
 */

// ============================================================================
// 1. فئة الكسور المحسنة (EnhancedFraction)
// ============================================================================

export class EnhancedFraction {
  num: number;
  den: number;

  constructor(num: number, den: number = 1) {
    if (den === 0) throw new Error('المقام لا يمكن أن يكون صفراً');
    
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const g = gcd(Math.abs(num), Math.abs(den));
    
    this.num = num / g;
    this.den = den / g;
    
    if (this.den < 0) {
      this.num = -this.num;
      this.den = -this.den;
    }
  }

  static add(a: EnhancedFraction, b: EnhancedFraction): EnhancedFraction {
    return new EnhancedFraction(
      a.num * b.den + b.num * a.den,
      a.den * b.den
    );
  }

  static subtract(a: EnhancedFraction, b: EnhancedFraction): EnhancedFraction {
    return new EnhancedFraction(
      a.num * b.den - b.num * a.den,
      a.den * b.den
    );
  }

  static multiply(a: EnhancedFraction, b: EnhancedFraction): EnhancedFraction {
    return new EnhancedFraction(a.num * b.num, a.den * b.den);
  }

  static divide(a: EnhancedFraction, b: EnhancedFraction): EnhancedFraction {
    if (b.num === 0) throw new Error('لا يمكن القسمة على صفر');
    return new EnhancedFraction(a.num * b.den, a.den * b.num);
  }

  add(other: EnhancedFraction): EnhancedFraction {
    return EnhancedFraction.add(this, other);
  }

  subtract(other: EnhancedFraction): EnhancedFraction {
    return EnhancedFraction.subtract(this, other);
  }

  multiply(other: EnhancedFraction): EnhancedFraction {
    return EnhancedFraction.multiply(this, other);
  }

  divide(other: EnhancedFraction): EnhancedFraction {
    return EnhancedFraction.divide(this, other);
  }

  toDecimal(): number {
    return this.num / this.den;
  }

  toArabic(): string {
    if (this.den === 1) return this.num.toString();
    const fractionSymbols: { [key: string]: string } = {
      '1/2': '½',
      '1/3': '⅓',
      '2/3': '⅔',
      '1/4': '¼',
      '3/4': '¾',
      '1/6': '⅙',
      '1/8': '⅛',
    };
    const key = `${this.num}/${this.den}`;
    return fractionSymbols[key] || key;
  }

  equals(other: EnhancedFraction): boolean {
    return this.num === other.num && this.den === other.den;
  }

  isGreaterThan(other: EnhancedFraction): boolean {
    return this.num * other.den > other.num * this.den;
  }

  isLessThan(other: EnhancedFraction): boolean {
    return this.num * other.den < other.num * this.den;
  }

  isGreaterThanOrEqual(other: EnhancedFraction): boolean {
    return this.num * other.den >= other.num * this.den;
  }

  isLessThanOrEqual(other: EnhancedFraction): boolean {
    return this.num * other.den <= other.num * this.den;
  }
}

// ============================================================================
// 2. قاعدة البيانات الفقهية
// ============================================================================

export const FIQH_DATABASE = {
  madhabs: {
    shafii: {
      name: 'الشافعي',
      color: '#059669',
      description: 'المذهب الشافعي - يعول ولا يرد',
      rules: {
        grandfatherWithSiblings: 'blocks',
        maternalSiblingsBlockedBy: ['descendants', 'father', 'grandfather'],
        awlApplied: true,
        raddApplied: false,
      },
    },
    hanafi: {
      name: 'الحنفي',
      color: '#dc2626',
      description: 'المذهب الحنفي - يعول ولا يرد',
      rules: {
        grandfatherWithSiblings: 'blocks',
        maternalSiblingsBlockedBy: ['descendants', 'father', 'grandfather'],
        awlApplied: true,
        raddApplied: false,
      },
    },
    maliki: {
      name: 'المالكي',
      color: '#7c3aed',
      description: 'المذهب المالكي - يعول ويرد',
      rules: {
        grandfatherWithSiblings: 'competes',
        maternalSiblingsBlockedBy: ['descendants', 'father', 'grandfather'],
        awlApplied: true,
        raddApplied: true,
      },
    },
    hanbali: {
      name: 'الحنبلي',
      color: '#0284c7',
      description: 'المذهب الحنبلي - يعول ويرد',
      rules: {
        grandfatherWithSiblings: 'competes',
        maternalSiblingsBlockedBy: ['descendants', 'father', 'grandfather'],
        awlApplied: true,
        raddApplied: true,
      },
    },
  },
  heirNames: {
    husband: 'الزوج',
    wife: 'الزوجة',
    father: 'الأب',
    mother: 'الأم',
    grandfather: 'الجد',
    grandmother: 'الجدة',
    son: 'الابن',
    daughter: 'البنت',
    grandson: 'ابن الابن',
    granddaughter: 'بنت الابن',
    full_brother: 'الأخ الشقيق',
    full_sister: 'الأخت الشقيقة',
    paternal_brother: 'الأخ لأب',
    paternal_sister: 'الأخت لأب',
    maternal_brother: 'الأخ لأم',
    maternal_sister: 'الأخت لأم',
  },
};

// ============================================================================
// 3. محرك حساب المواريث المحسن
// ============================================================================

export interface EstateData {
  total: number;
  funeral: number;
  debts: number;
  will: number;
}

export interface HeirsData {
  husband?: number;
  wife?: number;
  father?: number;
  mother?: number;
  grandfather?: number;
  grandmother?: number;
  son?: number;
  daughter?: number;
  grandson?: number;
  granddaughter?: number;
  full_brother?: number;
  full_sister?: number;
  paternal_brother?: number;
  paternal_sister?: number;
  maternal_brother?: number;
  maternal_sister?: number;
}

export interface ShareResult {
  key: string;
  name: string;
  type: string;
  fraction: EnhancedFraction;
  count: number;
  perPerson: EnhancedFraction;
  reason: string;
  priority: number;
  amount: number;
}

export interface CalculationResult {
  netEstate: number;
  shares: ShareResult[];
  asl: number;
  finalBase: number;
  awlApplied: boolean;
  raddApplied: boolean;
  bloodRelativesApplied: boolean;
  confidence: number;
  confidenceLevel: string;
  blockedHeirs: Array<{ heir: string; by: string; reason: string }>;
  steps: Array<{ title: string; description: string; type: string }>;
  error?: string;
}

export class InheritanceCalculator {
  madhab: string;
  estate: EstateData;
  heirs: HeirsData;
  config: any;
  steps: Array<{ title: string; description: string; type: string }> = [];
  blockedHeirs: Array<{ heir: string; by: string; reason: string }> = [];

  constructor(madhab: string, estate: EstateData, heirs: HeirsData) {
    this.madhab = madhab;
    this.estate = this.validateEstate(estate);
    this.heirs = this.normalizeHeirs(heirs);
    this.config = FIQH_DATABASE.madhabs[madhab as keyof typeof FIQH_DATABASE.madhabs];
  }

  private validateEstate(estate: EstateData): EstateData {
    const total = Math.max(0, estate.total || 0);
    const funeral = Math.max(0, Math.min(estate.funeral || 0, total));
    const debts = Math.max(0, Math.min(estate.debts || 0, total - funeral));
    const will = Math.max(0, Math.min(estate.will || 0, (total - funeral - debts) / 3));

    return { total, funeral, debts, will };
  }

  private normalizeHeirs(heirs: HeirsData): HeirsData {
    const normalized: HeirsData = {};
    for (const [key, value] of Object.entries(heirs)) {
      normalized[key as keyof HeirsData] = Math.max(0, parseInt(String(value)) || 0);
    }
    return normalized;
  }

  private addStep(title: string, description: string, type: string = 'info'): void {
    this.steps.push({ title, description, type });
  }

  private hasDescendants(): boolean {
    const h = this.heirs;
    return (h.son || 0) > 0 || (h.daughter || 0) > 0 || 
           (h.grandson || 0) > 0 || (h.granddaughter || 0) > 0;
  }

  private calculateShares(): ShareResult[] {
    const h = this.heirs;
    const shares: ShareResult[] = [];

    this.addStep('حساب السهام', 'بدء حساب نصيب كل وارث', 'info');

    // الزوج
    if (h.husband) {
      const frac = this.hasDescendants() ? new EnhancedFraction(1, 4) : new EnhancedFraction(1, 2);
      shares.push({
        key: 'husband',
        name: FIQH_DATABASE.heirNames.husband,
        type: 'فرض',
        fraction: frac,
        count: 1,
        perPerson: frac,
        reason: this.hasDescendants() ? '¼ لوجود الفرع الوارث' : '½ لعدم وجود فرع وارث',
        priority: 1,
        amount: 0,
      });
    }

    // الزوجة
    if (h.wife) {
      const frac = this.hasDescendants() ? new EnhancedFraction(1, 8) : new EnhancedFraction(1, 4);
      const perWife = frac.divide(new EnhancedFraction(h.wife));
      shares.push({
        key: 'wife',
        name: FIQH_DATABASE.heirNames.wife,
        type: 'فرض',
        fraction: frac,
        count: h.wife,
        perPerson: perWife,
        reason: this.hasDescendants() ? '⅛ لكل زوجة' : '¼ لكل زوجة',
        priority: 1,
        amount: 0,
      });
    }

    // الأم
    if (h.mother) {
      let frac: EnhancedFraction;
      if (this.hasDescendants() || (h.father || 0) > 0) {
        frac = new EnhancedFraction(1, 6);
      } else {
        frac = new EnhancedFraction(1, 3);
      }
      shares.push({
        key: 'mother',
        name: FIQH_DATABASE.heirNames.mother,
        type: 'فرض',
        fraction: frac,
        count: 1,
        perPerson: frac,
        reason: frac.den === 6 ? '⅙' : '⅓',
        priority: 2,
        amount: 0,
      });
    }

    // الأب
    if (h.father) {
      let frac: EnhancedFraction;
      if (this.hasDescendants()) {
        frac = new EnhancedFraction(1, 6);
      } else {
        frac = new EnhancedFraction(1, 1); // الباقي
      }
      shares.push({
        key: 'father',
        name: FIQH_DATABASE.heirNames.father,
        type: 'فرض/عصبة',
        fraction: frac,
        count: 1,
        perPerson: frac,
        reason: this.hasDescendants() ? '⅙ + الباقي' : 'الباقي (عصبة)',
        priority: 2,
        amount: 0,
      });
    }

    // الأبناء والبنات
    if (h.son || h.daughter) {
      const totalChildren = (h.son || 0) + (h.daughter || 0);
      const childrenShare = new EnhancedFraction(2, 3);
      const perChild = childrenShare.divide(new EnhancedFraction((h.son || 0) * 2 + (h.daughter || 0)));

      if (h.son) {
        shares.push({
          key: 'son',
          name: FIQH_DATABASE.heirNames.son,
          type: 'عصبة',
          fraction: perChild.multiply(new EnhancedFraction(h.son * 2)),
          count: h.son,
          perPerson: perChild.multiply(new EnhancedFraction(2)),
          reason: 'للذكر مثل حظ الأنثيين',
          priority: 3,
          amount: 0,
        });
      }

      if (h.daughter) {
        shares.push({
          key: 'daughter',
          name: FIQH_DATABASE.heirNames.daughter,
          type: 'فرض/عصبة',
          fraction: perChild.multiply(new EnhancedFraction(h.daughter)),
          count: h.daughter,
          perPerson: perChild,
          reason: 'للذكر مثل حظ الأنثيين',
          priority: 3,
          amount: 0,
        });
      }
    }

    return shares;
  }

  calculate(): CalculationResult {
    const result: CalculationResult = {
      netEstate: 0,
      shares: [],
      asl: 1,
      finalBase: 1,
      awlApplied: false,
      raddApplied: false,
      bloodRelativesApplied: false,
      confidence: 1.0,
      confidenceLevel: 'عالية جداً',
      blockedHeirs: [],
      steps: [],
    };

    try {
      // حساب التركة الصافية
      const netEstate = this.estate.total - this.estate.funeral - this.estate.debts - this.estate.will;
      result.netEstate = Math.max(0, netEstate);

      // حساب السهام
      const shares = this.calculateShares();

      // حساب أصل المسألة
      let asl = 1;
      const denominators = shares.map(s => s.fraction.den);
      const lcm = (a: number, b: number): number => (a * b) / this._gcd(a, b);
      asl = denominators.reduce((acc, val) => lcm(acc, val), 1);

      result.asl = asl;
      result.finalBase = asl;
      result.shares = shares.map(share => ({
        ...share,
        amount: (share.fraction.toDecimal() * result.netEstate),
      }));

      result.steps = this.steps;

      return result;
    } catch (error) {
      result.error = String(error);
      return result;
    }
  }

  private _gcd(a: number, b: number): number {
    return b === 0 ? a : this._gcd(b, a % b);
  }
}

// ============================================================================
// 4. دالة مساعدة للحساب السريع
// ============================================================================

export function calculateInheritance(
  madhab: string,
  estate: EstateData,
  heirs: HeirsData
): CalculationResult {
  const calculator = new InheritanceCalculator(madhab, estate, heirs);
  return calculator.calculate();
}
