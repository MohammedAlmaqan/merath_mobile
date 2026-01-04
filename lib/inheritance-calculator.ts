/** * مكتبة حاسبة المواريث الشرعية - الإصدار المتقدم v3 * نسخة محدّثة لمطابقة المشروع الويب الاحترافي مع جميع المذاهب والحالات الخاصة */'use strict';// ============================================================================// 1. نظام الكسور المُحسَّن المتوافق مع معايير IEEE// ============================================================================export class Fraction {  num: number;  den: number;  constructor(numerator: number, denominator: number = 1) {    if (typeof numerator !== 'number' || typeof denominator !== 'number') {      throw new Error('البسط والمقام يجب أن يكونا أرقاماً');    }    if (denominator === 0) {      throw new Error('المقام لا يمكن أن يكون صفراً');    }    if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) {      throw new Error('القيم يجب أن تكون أرقاماً منتهية');    }    // التطبيع: جعل المقام دائماً موجباً    const sign = denominator < 0 ? -1 : 1;    numerator = Math.round(numerator * sign);    denominator = Math.abs(Math.round(denominator));    const g = Fraction.gcd(Math.abs(numerator), denominator);    this.num = numerator / g;    this.den = denominator / g;    // حماية من التضخم    if (Math.abs(this.num) > 1e12 || this.den > 1e12) {      const decimal = this.num / this.den;      this.num = Math.round(decimal * 1e9);      this.den = 1e9;      const g2 = Fraction.gcd(Math.abs(this.num), this.den);      this.num /= g2;      this.den /= g2;    }  }  static gcd(a: number, b: number): number {    a = Math.abs(Math.round(a));    b = Math.abs(Math.round(b));    while (b > 0) {      [a, b] = [b, a % b];    }    return a || 1;  }  static lcm(a: number, b: number): number {    a = Math.abs(Math.round(a));    b = Math.abs(Math.round(b));    if (a === 0 || b === 0) return 0;    return (a * b) / Fraction.gcd(a, b);  }  static lcmArray(arr: number[]): number {    if (!arr || arr.length === 0) return 1;    const filtered = arr.filter(n => n > 0);    if (filtered.length === 0) return 1;    return filtered.reduce((a, b) => Fraction.lcm(a, b), filtered[0]);  }  add(other: Fraction | number): Fraction {    if (typeof other === 'number') other = new Fraction(other);    return new Fraction(      this.num * other.den + other.num * this.den,      this.den * other.den    );  }  subtract(other: Fraction | number): Fraction {    if (typeof other === 'number') other = new Fraction(other);    return new Fraction(      this.num * other.den - other.num * this.den,      this.den * other.den    );  }  multiply(other: Fraction | number): Fraction {    if (typeof other === 'number') other = new Fraction(other);    return new Fraction(this.num * other.num, this.den * other.den);  }  divide(other: Fraction | number): Fraction {    if (typeof other === 'number') other = new Fraction(other);    if (other.num === 0) throw new Error('القسمة على صفر');    return new Fraction(this.num * other.den, this.den * other.num);  }  toDecimal(): number {    return this.num / this.den;  }  toString(): string {    if (this.num === 0) return '0';    if (this.den === 1) return String(this.num);    return `${this.num}/${this.den}`;  }  toArabic(): string {    if (this.num === 0) return '٠';    if (this.den === 1) return String(Math.abs(this.num));    const common: { [key: string]: string } = {      '1/2': '½',      '1/3': '⅓',      '2/3': '⅔',      '1/4': '¼',      '3/4': '¾',      '1/6': '⅙',      '5/6': '⅚',      '1/8': '⅛',      '3/8': '⅜',      '5/8': '⅝',      '7/8': '⅞',    };    const key = `${Math.abs(this.num)}/${this.den}`;    return common[key] || key;  }  isZero(): boolean {    return this.num === 0;  }  isPositive(): boolean {    return this.num > 0;  }  isNegative(): boolean {    return this.num < 0;  }  equals(other: Fraction | number): boolean {    if (typeof other === 'number') other = new Fraction(other);    return this.num === other.num && this.den === other.den;  }  compareTo(other: Fraction | number): number {    if (typeof other === 'number') other = new Fraction(other);    return this.num * other.den - other.num * this.den;  }  lessThan(other: Fraction | number): boolean {    return this.compareTo(other) < 0;  }  greaterThan(other: Fraction | number): boolean {    return this.compareTo(other) > 0;  }  lessThanOrEqual(other: Fraction | number): boolean {    return this.compareTo(other) <= 0;  }  greaterThanOrEqual(other: Fraction | number): boolean {    return this.compareTo(other) >= 0;  }  clone(): Fraction {    return new Fraction(this.num, this.den);  }  static readonly ZERO = new Fraction(0);  static readonly ONE = new Fraction(1);  static readonly HALF = new Fraction(1, 2);  static readonly THIRD = new Fraction(1, 3);  static readonly QUARTER = new Fraction(1, 4);  static readonly SIXTH = new Fraction(1, 6);  static readonly EIGHTH = new Fraction(1, 8);  static readonly TWO_THIRDS = new Fraction(2, 3);}// ============================================================================// 2. قاعدة البيانات الفقهية الشاملة// ============================================================================export const FIQH_DATABASE = {  madhabs: {    shafii: {      id: 'shafii',      name: 'الشافعي',      color: '#22c55e',      description: 'الرد على أصحاب الفروض عدا الزوجين',      rules: {        grandfatherWithSiblings: 'blocks' as const,        raddToSpouse: false,        bloodRelativesEnabled: true,      },    },    hanafi: {      id: 'hanafi',      name: 'الحنفي',      color: '#ef4444',      description: 'الرد على الزوجين عند عدم وجود غيرهم',      rules: {        grandfatherWithSiblings: 'blocks' as const,        raddToSpouse: true,        bloodRelativesEnabled: true,      },    },    maliki: {      id: 'maliki',      name: 'المالكي',      color: '#a855f7',      description: 'الجد يُقاسم الإخوة',      rules: {        grandfatherWithSiblings: 'shares' as const,        raddToSpouse: false,        bloodRelativesEnabled: false,      },    },    hanbali: {      id: 'hanbali',      name: 'الحنبلي',      color: '#3b82f6',      description: 'الجد يُقاسم الإخوة ويُرد على الزوجين',      rules: {        grandfatherWithSiblings: 'shares' as const,        raddToSpouse: true,        bloodRelativesEnabled: true,      },    },  },  heirNames: {    husband: 'الزوج',    wife: 'الزوجة',    father: 'الأب',    mother: 'الأم',    grandfather: 'الجد الصحيح',    grandmother_mother: 'الجدة لأم',    grandmother_father: 'الجدة لأب',    son: 'الابن',    daughter: 'البنت',    grandson: 'ابن الابن',    granddaughter: 'بنت الابن',    full_brother: 'الأخ الشقيق',    full_sister: 'الأخت الشقيقة',    paternal_brother: 'الأخ لأب',    paternal_sister: 'الأخت لأب',    maternal_brother: 'الأخ لأم',    maternal_sister: 'الأخت لأم',  },};// ============================================================================// 3. فئة نتيجة الوارث// ============================================================================export class HeirShare {  key: string;  name: string;  type: string;  count: number;  fraction: Fraction;  originalFraction: Fraction;  reason: string;  blocked: boolean;  blockedBy: string | null;  amount: number;  amountPerPerson: number;  constructor(options: {    key: string;    name?: string;    type?: string;    count?: number;    fraction?: Fraction;    reason?: string;    blocked?: boolean;    blockedBy?: string | null;  }) {    this.key = options.key;    this.name = options.name || FIQH_DATABASE.heirNames[options.key as keyof typeof FIQH_DATABASE.heirNames] || options.key;    this.type = options.type || 'فرض';    this.count = options.count || 1;    this.fraction = options.fraction instanceof Fraction ? options.fraction : Fraction.ZERO;    this.originalFraction = this.fraction.clone();    this.reason = options.reason || '';    this.blocked = options.blocked || false;    this.blockedBy = options.blockedBy || null;    this.amount = 0;    this.amountPerPerson = 0;  }  setFraction(fraction: Fraction): void {    this.fraction = fraction instanceof Fraction ? fraction : new Fraction(fraction);  }  addFraction(fraction: Fraction): void {    this.fraction = this.fraction.add(fraction);  }  calculateAmount(netEstate: number): void {    this.amount = netEstate * this.fraction.toDecimal();    this.amountPerPerson = this.count > 0 ? this.amount / this.count : 0;  }  getPerPerson(): Fraction {    if (this.count <= 0) return Fraction.ZERO;    return new Fraction(this.fraction.num, this.fraction.den * this.count);  }}// ============================================================================// 4. المحرك الحسابي المتكامل// ============================================================================export interface EstateData {  total: number;  funeral: number;  debts: number;  will: number;}export interface HeirsData {  husband?: number;  wife?: number;  father?: number;  mother?: number;  grandfather?: number;  grandmother_mother?: number;  grandmother_father?: number;  son?: number;  daughter?: number;  grandson?: number;  granddaughter?: number;  full_brother?: number;  full_sister?: number;  paternal_brother?: number;  paternal_sister?: number;  maternal_brother?: number;  maternal_sister?: number;  [key: string]: number | undefined;}export interface CalculationResult {  success: boolean;  madhab: string;  madhhabName: string;  madhhabColor?: string;  estate: EstateData;  netEstate: number;  asl: number;  finalBase: number;  awlApplied: boolean;  awlRatio?: Fraction;  raddApplied: boolean;  bloodRelativesApplied: boolean;  shares: HeirShare[];  specialCases: Array<{ type: string; name: string; description: string }>;  blockedHeirs: Array<{ heir: string; by: string; reason: string }>;  madhhabNotes: string[];  warnings: string[];  steps: Array<{ title: string; description: string; details?: any; timestamp?: number }>;  confidence: number;  errors?: string[];}export class InheritanceEngine {  madhab: string;  config: any;  estate: EstateData;  heirs: HeirsData;  state: {    steps: Array<{ title: string; description: string; details?: any; timestamp?: number }>;    specialCases: Array<{ type: string; name: string; description: string }>;    blockedHeirs: Array<{ heir: string; by: string; reason: string }>;    madhhabNotes: string[];    warnings: string[];    errors: string[];  };  results: {    netEstate: number;    shares: HeirShare[];    asl: number;    finalBase: number;    awlRatio: Fraction | null;    awlApplied: boolean;    raddApplied: boolean;    bloodRelativesApplied: boolean;    confidence: number;  };  constructor(madhab: string, estate: EstateData, heirs: HeirsData) {    this.madhab = madhab;    this.config = FIQH_DATABASE.madhabs[madhab as keyof typeof FIQH_DATABASE.madhabs];    if (!this.config) {      throw new Error(`المذهب غير معروف: ${madhab}`);    }    this.estate = this.validateEstate(estate);    this.heirs = this.normalizeHeirs(heirs);    this.state = {      steps: [],      specialCases: [],      blockedHeirs: [],      madhhabNotes: [],      warnings: [],      errors: [],    };    this.results = {      netEstate: 0,      shares: [],      asl: 1,      finalBase: 1,      awlRatio: null,      awlApplied: false,      raddApplied: false,      bloodRelativesApplied: false,      confidence: 1.0,    };  }  // ========== التحقق من صحة التركة ==========  private validateEstate(estate: EstateData): EstateData {    const total = Math.max(0, parseFloat(String(estate.total)) || 0);    if (total <= 0) {      this.state.errors.push('قيمة التركة يجب أن تكون أكبر من صفر');    }    const funeral = Math.max(0, Math.min(parseFloat(String(estate.funeral)) || 0, total));    const debts = Math.max(0, Math.min(parseFloat(String(estate.debts)) || 0, total - funeral));    const remaining = total - funeral - debts;    const maxWill = remaining / 3;    let will = Math.max(0, parseFloat(String(estate.will)) || 0);    if (will > maxWill && remaining > 0) {      this.state.warnings.push(        `الوصية (${will.toLocaleString()}) تتجاوز الثلث. تم تعديلها إلى ${maxWill.toLocaleString()}`      );      will = maxWill;    }    return { total, funeral, debts, will };  }  // ========== تطبيع بيانات الورثة ==========  private normalizeHeirs(heirs: HeirsData): HeirsData {    const normalized: HeirsData = {};    const constraints: { [key: string]: { max: number } } = {      husband: { max: 1 },      wife: { max: 4 },      father: { max: 1 },      mother: { max: 1 },      grandfather: { max: 1 },
      grandmother_mother: { max: 1 },
      grandmother_father: { max: 1 },
    };

    for (const [key, value] of Object.entries(heirs)) {
      let val = Math.max(0, Math.floor(parseInt(String(value)) || 0));

      if (constraints[key]?.max) {
        val = Math.min(val, constraints[key].max);
      }

      normalized[key as keyof HeirsData] = val;
    }

    // التحقق من التعارضات
    if ((normalized.husband || 0) > 0 && (normalized.wife || 0) > 0) {
      this.state.errors.push('لا يمكن وجود زوج وزوجة معاً');
      normalized.wife = 0;
    }

    return normalized;
  }

  // ========== إضافة خطوة ==========
  private addStep(title: string, description: string, details: any = null): void {
    this.state.steps.push({
      title,
      description,
      details,
      timestamp: Date.now(),
    });
  }

  // ========== فحوصات الوجود ==========
  private hasDescendants(): boolean {
    const h = this.heirs;
    return (h.son || 0) + (h.daughter || 0) + (h.grandson || 0) + (h.granddaughter || 0) > 0;
  }

  private hasMaleDescendants(): boolean {
    return (this.heirs.son || 0) + (this.heirs.grandson || 0) > 0;
  }

  private hasFemaleDescendants(): boolean {
    return (this.heirs.daughter || 0) + (this.heirs.granddaughter || 0) > 0;
  }

  private getMaternalSiblingsCount(): number {
    return (this.heirs.maternal_brother || 0) + (this.heirs.maternal_sister || 0);
  }

  private getFullSiblingsCount(): number {
    return (this.heirs.full_brother || 0) + (this.heirs.full_sister || 0);
  }

  private getPaternalSiblingsCount(): number {
    return (this.heirs.paternal_brother || 0) + (this.heirs.paternal_sister || 0);
  }

  private getAllSiblingsCount(): number {
    return this.getFullSiblingsCount() + this.getPaternalSiblingsCount() + this.getMaternalSiblingsCount();
  }

  // ========== الحالات الخاصة ==========
  private isUmariyyah(): boolean {
    const h = this.heirs;
    const hasSpouse = (h.husband || 0) > 0 || (h.wife || 0) > 0;
    const hasFatherMother = (h.father || 0) > 0 && (h.mother || 0) > 0;
    const noDescendants = !this.hasDescendants();
    const noSiblings = this.getAllSiblingsCount() === 0;
    const noGrandfather = (h.grandfather || 0) === 0;

    return hasSpouse && hasFatherMother && noDescendants && noSiblings && noGrandfather;
  }

  // ========== تطبيق الحجب ==========
  private applyHijab(): void {
    this.addStep('تطبيق الحجب', 'فحص قواعد الحجب الفقهية');
    const blocked: Array<{ heir: string; by: string; reason: string }> = [];
    const h = this.heirs;

    // الأب يحجب الجد
    if ((h.father || 0) > 0 && (h.grandfather || 0) > 0) {
      blocked.push({
        heir: 'grandfather',
        by: 'father',
        reason: 'الجد محجوب بالأب حجب حرمان',
      });
      h.grandfather = 0;
    }

    // الأم تحجب الجدات
    if ((h.mother || 0) > 0) {
      if ((h.grandmother_mother || 0) > 0) {
        blocked.push({
          heir: 'grandmother_mother',
          by: 'mother',
          reason: 'الجدة لأم محجوبة بالأم',
        });
        h.grandmother_mother = 0;
      }
      if ((h.grandmother_father || 0) > 0) {
        blocked.push({
          heir: 'grandmother_father',
          by: 'mother',
          reason: 'الجدة لأب محجوبة بالأم',
        });
        h.grandmother_father = 0;
      }
    }

    // الابن يحجب ابن الابن والبنت تحجب بنت الابن
    if ((h.son || 0) > 0 && (h.grandson || 0) > 0) {
      blocked.push({
        heir: 'grandson',
        by: 'son',
        reason: 'ابن الابن محجوب بالابن الأقرب',
      });
      h.grandson = 0;
    }

    if ((h.son || 0) > 0 && (h.granddaughter || 0) > 0) {
      blocked.push({
        heir: 'granddaughter',
        by: 'son',
        reason: 'بنت الابن محجوبة بالابن',
      });
      h.granddaughter = 0;
    }

    // الإخوة محجوبون بالفرع الوارث الذكر أو الأب
    const blockedByMaleFuruOrFather = (h.son || 0) > 0 || (h.grandson || 0) > 0 || (h.father || 0) > 0;

    if (blockedByMaleFuruOrFather) {
      const siblingsToBlock = ['full_brother', 'full_sister', 'paternal_brother', 'paternal_sister'];
      siblingsToBlock.forEach((heir) => {
        if ((h[heir as keyof HeirsData] || 0) > 0) {
          const blocker = (h.father || 0) > 0 ? 'الأب' : 'الابن/ابن الابن';
          blocked.push({
            heir,
            by: blocker,
            reason: `${FIQH_DATABASE.heirNames[heir as keyof typeof FIQH_DATABASE.heirNames]} محجوب بـ${blocker}`,
          });
          h[heir as keyof HeirsData] = 0;
        }
      });
    }

    // الجد يحجب الإخوة في الشافعي والحنفي
    if ((h.grandfather || 0) > 0 && this.config.rules.grandfatherWithSiblings === 'blocks') {
      const siblingsToBlock = ['full_brother', 'full_sister', 'paternal_brother', 'paternal_sister'];
      siblingsToBlock.forEach((heir) => {
        if ((h[heir as keyof HeirsData] || 0) > 0) {
          blocked.push({
            heir,
            by: 'grandfather',
            reason: `${FIQH_DATABASE.heirNames[heir as keyof typeof FIQH_DATABASE.heirNames]} محجوب بالجد`,
          });
          h[heir as keyof HeirsData] = 0;
        }
      });
    }

    this.state.blockedHeirs = blocked;
    if (blocked.length > 0) {
      this.addStep('نتيجة الحجب', `تم حجب ${blocked.length} وارث/ورثة`, blocked);
    }
  }

  // ========== حساب الفروض ==========
  private computeFixedShares(): HeirShare[] {
    this.addStep('حساب الفروض', 'تحديد أصحاب الفروض وفروضهم');
    const shares: HeirShare[] = [];
    const h = this.heirs;
    const hasDesc = this.hasDescendants();

    // العُمَريَّة
    const isUmariyyah = this.isUmariyyah();
    if (isUmariyyah) {
      this.state.specialCases.push({
        type: 'umariyyah',
        name: 'العُمَريَّة',
        description: 'الأم تأخذ ثلث الباقي بعد نصيب الزوج/الزوجة',
      });
    }

    // ===== الزوج =====
    if ((h.husband || 0) > 0) {
      const frac = hasDesc ? Fraction.QUARTER : Fraction.HALF;
      shares.push(
        new HeirShare({
          key: 'husband',
          name: 'الزوج',
          type: 'فرض',
          fraction: frac,
          count: 1,
          reason: hasDesc ? '¼ لوجود الفرع الوارث' : '½ لعدم وجود فرع وارث',
        })
      );
    }

    // ===== الزوجة/الزوجات =====
    if ((h.wife || 0) > 0) {
      const frac = hasDesc ? Fraction.EIGHTH : Fraction.QUARTER;
      shares.push(
        new HeirShare({
          key: 'wife',
          name: (h.wife || 0) > 1 ? 'الزوجات' : 'الزوجة',
          type: 'فرض',
          fraction: frac,
          count: h.wife || 0,
          reason: hasDesc ? `⅛ يشتركن فيه` : `¼ يشتركن فيه`,
        })
      );
    }

    // ===== الأم =====
    if ((h.mother || 0) > 0) {
      let frac: Fraction;
      let reason: string;

      if (isUmariyyah) {
        frac = Fraction.SIXTH;
        reason = 'ثلث الباقي بعد نصيب الزوج/الزوجة';
      } else if (hasDesc) {
        frac = Fraction.SIXTH;
        reason = '⅙ لوجود الفرع الوارث';
      } else if (this.getAllSiblingsCount() >= 2) {
        frac = Fraction.SIXTH;
        reason = '⅙ لوجود جمع من الإخوة';
      } else {
        frac = Fraction.THIRD;
        reason = '⅓ لعدم وجود فرع وارث ولا جمع إخوة';
      }

      shares.push(
        new HeirShare({
          key: 'mother',
          name: 'الأم',
          type: 'فرض',
          fraction: frac,
          count: 1,
          reason,
        })
      );
    }

    // ===== الأب =====
    if ((h.father || 0) > 0) {
      if (this.hasMaleDescendants()) {
        shares.push(
          new HeirShare({
            key: 'father',
            name: 'الأب',
            type: 'فرض',
            fraction: Fraction.SIXTH,
            count: 1,
            reason: '⅙ فرضاً مع الفرع الوارث الذكر',
          })
        );
      } else if (this.hasFemaleDescendants()) {
        shares.push(
          new HeirShare({
            key: 'father',
            name: 'الأب',
            type: 'فرض + تعصيب',
            fraction: Fraction.SIXTH,
            count: 1,
            reason: '⅙ فرضاً + الباقي تعصيباً',
          })
        );
      }
    }

    // ===== الجد =====
    if ((h.grandfather || 0) > 0 && (h.father || 0) === 0) {
      if (this.hasMaleDescendants()) {
        shares.push(
          new HeirShare({
            key: 'grandfather',
            name: 'الجد الصحيح',
            type: 'فرض',
            fraction: Fraction.SIXTH,
            count: 1,
            reason: '⅙ فرضاً مع الفرع الوارث الذكر',
          })
        );
      } else if (this.hasFemaleDescendants()) {
        shares.push(
          new HeirShare({
            key: 'grandfather',
            name: 'الجد الصحيح',
            type: 'فرض + تعصيب',
            fraction: Fraction.SIXTH,
            count: 1,
            reason: '⅙ فرضاً + الباقي تعصيباً',
          })
        );
      }
    }

    // ===== الجدات =====
    const grandmothersCount = ((h.grandmother_mother || 0) + (h.grandmother_father || 0));
    if (grandmothersCount > 0) {
      const names = [];
      if ((h.grandmother_mother || 0) > 0) names.push('الجدة لأم');
      if ((h.grandmother_father || 0) > 0) names.push('الجدة لأب');

      shares.push(
        new HeirShare({
          key: 'grandmothers',
          name: grandmothersCount > 1 ? 'الجدات' : names[0],
          type: 'فرض',
          fraction: Fraction.SIXTH,
          count: grandmothersCount,
          reason: grandmothersCount > 1 ? '⅙ يشتركن فيه' : '⅙',
        })
      );
    }

    // ===== البنات =====
    if ((h.daughter || 0) > 0 && (h.son || 0) === 0) {
      const frac = (h.daughter || 0) === 1 ? Fraction.HALF : Fraction.TWO_THIRDS;
      shares.push(
        new HeirShare({
          key: 'daughter',
          name: (h.daughter || 0) > 1 ? 'البنات' : 'البنت',
          type: 'فرض',
          fraction: frac,
          count: h.daughter || 0,
          reason: (h.daughter || 0) === 1 ? '½ للبنت الواحدة' : '⅔ للبنتين فأكثر',
        })
      );
    }

    // ===== بنات الابن =====
    if ((h.granddaughter || 0) > 0 && (h.grandson || 0) === 0 && (h.son || 0) === 0) {
      if ((h.daughter || 0) === 0) {
        const frac = (h.granddaughter || 0) === 1 ? Fraction.HALF : Fraction.TWO_THIRDS;
        shares.push(
          new HeirShare({
            key: 'granddaughter',
            name: (h.granddaughter || 0) > 1 ? 'بنات الابن' : 'بنت الابن',
            type: 'فرض',
            fraction: frac,
            count: h.granddaughter || 0,
            reason: (h.granddaughter || 0) === 1 ? '½ لبنت الابن الواحدة' : '⅔ لبنات الابن',
          })
        );
      } else if ((h.daughter || 0) === 1) {
        shares.push(
          new HeirShare({
            key: 'granddaughter',
            name: (h.granddaughter || 0) > 1 ? 'بنات الابن' : 'بنت الابن',
            type: 'فرض',
            fraction: Fraction.SIXTH,
            count: h.granddaughter || 0,
            reason: '⅙ تكملة للثلثين',
          })
        );
      }
    }

    // ===== الأخوات الشقيقات =====
    if ((h.full_sister || 0) > 0 && (h.full_brother || 0) === 0) {
      if (!hasDesc && (h.father || 0) === 0 && (h.grandfather || 0) === 0) {
        const frac = (h.full_sister || 0) === 1 ? Fraction.HALF : Fraction.TWO_THIRDS;
        shares.push(
          new HeirShare({
            key: 'full_sister',
            name: (h.full_sister || 0) > 1 ? 'الأخوات الشقيقات' : 'الأخت الشقيقة',
            type: 'فرض',
            fraction: frac,
            count: h.full_sister || 0,
            reason: (h.full_sister || 0) === 1 ? '½' : '⅔',
          })
        );
      }
    }

    // ===== الأخوات لأب =====
    if ((h.paternal_sister || 0) > 0 && (h.paternal_brother || 0) === 0 && (h.full_brother || 0) === 0) {
      if (!hasDesc && (h.father || 0) === 0 && (h.grandfather || 0) === 0) {
        if ((h.full_sister || 0) === 0) {
          const frac = (h.paternal_sister || 0) === 1 ? Fraction.HALF : Fraction.TWO_THIRDS;
          shares.push(
            new HeirShare({
              key: 'paternal_sister',
              name: (h.paternal_sister || 0) > 1 ? 'الأخوات لأب' : 'الأخت لأب',
              type: 'فرض',
              fraction: frac,
              count: h.paternal_sister || 0,
              reason: (h.paternal_sister || 0) === 1 ? '½' : '⅔',
            })
          );
        } else if ((h.full_sister || 0) === 1) {
          shares.push(
            new HeirShare({
              key: 'paternal_sister',
              name: (h.paternal_sister || 0) > 1 ? 'الأخوات لأب' : 'الأخت لأب',
              type: 'فرض',
              fraction: Fraction.SIXTH,
              count: h.paternal_sister || 0,
              reason: '⅙ تكملة للثلثين',
            })
          );
        }
      }
    }

    // ===== الإخوة لأم =====
    const maternalCount = this.getMaternalSiblingsCount();
    if (maternalCount > 0 && !hasDesc && (h.father || 0) === 0 && (h.grandfather || 0) === 0) {
      const frac = maternalCount === 1 ? Fraction.SIXTH : Fraction.THIRD;
      shares.push(
        new HeirShare({
          key: 'maternal_siblings',
          name: 'الإخوة لأم',
          type: 'فرض',
          fraction: frac,
          count: maternalCount,
          reason: maternalCount === 1 ? '⅙' : '⅓ بالتساوي',
        })
      );
    }

    return shares;
  }

  // ========== تطبيق العول ==========
  private applyAwl(shares: HeirShare[]): HeirShare[] {
    if (shares.length === 0) {
      this.results.asl = 1;
      this.results.finalBase = 1;
      return shares;
    }

    const denominators = shares
      .filter((s) => s.fraction && !s.fraction.isZero())
      .map((s) => s.fraction.den);

    if (denominators.length === 0) {
      this.results.asl = 1;
      this.results.finalBase = 1;
      return shares;
    }

    const asl = Fraction.lcmArray(denominators);
    this.results.asl = asl;

    let totalShares = 0;
    const shareDetails = shares.map((share) => {
      if (!share.fraction || share.fraction.isZero()) {
        return { share, rawShares: 0 };
      }
      const rawShares = share.fraction.num * (asl / share.fraction.den);
      totalShares += rawShares;
      return { share, rawShares };
    });

    if (totalShares > asl) {
      this.results.awlApplied = true;
      this.results.finalBase = totalShares;
      this.results.awlRatio = new Fraction(asl, totalShares);

      this.state.specialCases.push({
        type: 'awl',
        name: 'العَوْل',
        description: `عالت المسألة من ${asl} إلى ${totalShares}`,
      });

      this.addStep(
        'العَوْل',
        `مجموع السهام (${totalShares}) أكبر من أصل المسألة (${asl}), فعالت إلى ${totalShares}`
      );

      return shareDetails.map(({ share, rawShares }) => {
        share.originalFraction = share.fraction.clone();
        share.fraction = new Fraction(rawShares, totalShares);
        return share;
      });
    } else {
      this.results.finalBase = asl;
      return shareDetails.map(({ share }) => {
        return share;
      });
    }
  }

  // ========== الحساب الرئيسي ==========
  calculate(): CalculationResult {
    try {
      if (this.state.errors.length > 0) {
        return {
          success: false,
          errors: this.state.errors,
          madhab: this.madhab,
          madhhabName: this.config.name,
          madhhabColor: this.config.color,
        } as any;
      }

      const { total, funeral, debts, will } = this.estate;
      const netEstate = total - funeral - debts - will;
      this.results.netEstate = netEstate;

      if (netEstate <= 0) {
        return {
          success: false,
          errors: ['صافي التركة صفر أو سالب'],
          madhab: this.madhab,
          madhhabName: this.config.name,
          madhhabColor: this.config.color,
        } as any;
      }

      this.addStep(
        'صافي التركة',
        `${total} - ${funeral} - ${debts} - ${will} = ${netEstate}`
      );

      // تطبيق الحجب
      this.applyHijab();

      // حساب الفروض
      let fixedShares = this.computeFixedShares();

      // تطبيق العول
      fixedShares = this.applyAwl(fixedShares);

      // حساب المبالغ
      fixedShares.forEach((s) => s.calculateAmount(netEstate));

      // حفظ النتائج
      this.results.shares = fixedShares.filter((s) => !s.fraction.isZero());

      return {
        success: true,
        madhab: this.madhab,
        madhhabName: this.config.name,
        madhhabColor: this.config.color,
        estate: this.estate,
        netEstate: this.results.netEstate,
        asl: this.results.asl,
        finalBase: this.results.finalBase,
        awlApplied: this.results.awlApplied,
        awlRatio: this.results.awlRatio,
        raddApplied: this.results.raddApplied,
        bloodRelativesApplied: this.results.bloodRelativesApplied,
        shares: this.results.shares,
        specialCases: this.state.specialCases,
        blockedHeirs: this.state.blockedHeirs,
        madhhabNotes: this.state.madhhabNotes,
        warnings: this.state.warnings,
        steps: this.state.steps,
        confidence: this.results.confidence,
      };
    } catch (error) {
      console.error('خطأ في الحساب:', error);
      return {
        success: false,
        errors: [`خطأ: ${error instanceof Error ? error.message : String(error)}`],
        madhab: this.madhab,
        madhhabName: this.config.name,
        madhhabColor: this.config.color,
      } as any;
    }
  }
}

// ============================================================================
// 5. دالة مساعدة للحساب السريع
// ============================================================================

export function calculateInheritance(
  madhab: string,
  estate: EstateData,
  heirs: HeirsData
): CalculationResult {
  const engine = new InheritanceEngine(madhab, estate, heirs);
  return engine.calculate();
}
