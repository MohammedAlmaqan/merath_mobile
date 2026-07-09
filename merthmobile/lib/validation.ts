import { EstateData, HeirsData } from './inheritance-calculator';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export function validateEstateData(estate: EstateData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (estate.total <= 0) {
    errors.push({
      field: 'total',
      message: 'يجب أن تكون التركة أكبر من صفر',
      severity: 'error',
    });
  }

  if (estate.total > 1000000000) {
    errors.push({
      field: 'total',
      message: 'المبلغ المدخل كبير جداً (أكثر من مليار ريال)',
      severity: 'warning',
    });
  }

  if (estate.funeral < 0) {
    errors.push({
      field: 'funeral',
      message: 'تكاليف الدفن لا يمكن أن تكون سالبة',
      severity: 'error',
    });
  }

  if (estate.funeral > estate.total) {
    errors.push({
      field: 'funeral',
      message: 'تكاليف الدفن لا يمكن أن تكون أكبر من التركة',
      severity: 'error',
    });
  }

  if (estate.debts < 0) {
    errors.push({
      field: 'debts',
      message: 'الديون لا يمكن أن تكون سالبة',
      severity: 'error',
    });
  }

  if (estate.debts > estate.total) {
    errors.push({
      field: 'debts',
      message: 'الديون لا يمكن أن تكون أكبر من التركة',
      severity: 'warning',
    });
  }

  if (estate.will < 0) {
    errors.push({
      field: 'will',
      message: 'الوصية لا يمكن أن تكون سالبة',
      severity: 'error',
    });
  }

  if (estate.will > estate.total * 0.33) {
    errors.push({
      field: 'will',
      message: 'الوصية لا يمكن أن تتجاوز ثلث التركة',
      severity: 'warning',
    });
  }

  return errors;
}

export function validateHeirs(heirs: HeirsData): ValidationError[] {
  const errors: ValidationError[] = [];

  const totalHeirs = Object.values(heirs).reduce((sum, count) => sum + count, 0);

  if (totalHeirs === 0) {
    errors.push({
      field: 'heirs',
      message: 'يجب تحديد وارث واحد على الأقل',
      severity: 'error',
    });
  }

  // Check for invalid combinations
  if (heirs.husband && heirs.wife) {
    // Valid combination
  }

  if (heirs.husband && heirs.husband > 1) {
    errors.push({
      field: 'husband',
      message: 'لا يمكن أن يكون هناك أكثر من زوج واحد',
      severity: 'error',
    });
  }

  if (heirs.wife && heirs.wife > 4) {
    errors.push({
      field: 'wife',
      message: 'عدد الزوجات لا يمكن أن يتجاوز 4',
      severity: 'error',
    });
  }

  if (heirs.father && heirs.father > 1) {
    errors.push({
      field: 'father',
      message: 'لا يمكن أن يكون هناك أكثر من أب واحد',
      severity: 'error',
    });
  }

  if (heirs.mother && heirs.mother > 1) {
    errors.push({
      field: 'mother',
      message: 'لا يمكن أن يكون هناك أكثر من أم واحدة',
      severity: 'error',
    });
  }

  if (heirs.grandfather && heirs.grandfather > 1) {
    errors.push({
      field: 'grandfather',
      message: 'لا يمكن أن يكون هناك أكثر من جد واحد',
      severity: 'error',
    });
  }

  if (heirs.grandmother && heirs.grandmother > 2) {
    errors.push({
      field: 'grandmother',
      message: 'عدد الجدات لا يمكن أن يتجاوز 2',
      severity: 'error',
    });
  }

  // Check for negative values
  Object.entries(heirs).forEach(([key, count]) => {
    if (count < 0) {
      errors.push({
        field: key,
        message: 'العدد لا يمكن أن يكون سالباً',
        severity: 'error',
      });
    }
  });

  return errors;
}

export function validateCalculationInputs(
  estate: EstateData,
  heirs: HeirsData
): ValidationResult {
  const estateErrors = validateEstateData(estate);
  const heirsErrors = validateHeirs(heirs);

  const allErrors = [...estateErrors, ...heirsErrors];
  const errors = allErrors.filter(e => e.severity === 'error');
  const warnings = allErrors.filter(e => e.severity === 'warning');

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function getValidationMessage(error: ValidationError): string {
  return error.message;
}

export function getAllValidationMessages(errors: ValidationError[]): string {
  return errors.map(e => `• ${e.message}`).join('\n');
}
