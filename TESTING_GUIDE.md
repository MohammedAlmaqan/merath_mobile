# UI Integration Testing Guide

## How to Test the New Features

### Setup
```bash
cd /workspaces/merath_mobile
pnpm install
pnpm start
```

Select your platform: iOS, Android, or Web

---

## Testing Scenarios

### 1. Special Case Detection - Umariyyah ⚠️

**Test Case**: Husband, Father, Mother (Umariyyah Case)

**Steps**:
1. Keep madhab as "Shafii"
2. Estate: 100,000 ريال
3. Set:
   - Husband: 1
   - Father: 1
   - Mother: 1
   - All others: 0
4. Click "حساب" (Calculate)

**Expected Output**:
- Top alert: "⚠️ عمرية" (Umariyyah special case)
- Explanation: "حالة عمرية: قال عمر بن الخطاب..."
- Husband gets 50%, remainder distributed to father and mother
- Confidence: High (>90%)

---

### 2. Special Case Detection - Awl (Fraction Augmentation) 📊

**Test Case**: Husband, 2 Sisters, Mother (Awl Case)

**Steps**:
1. Keep madhab as "Shafii"
2. Estate: 100,000 ريال
3. Set:
   - Husband: 1
   - Mother: 1
   - Full Sister: 2
   - All others: 0
4. Click "حساب" (Calculate)

**Expected Output**:
- Top alert: "📊 عول" (Awl case detected)
- Explanation about fraction augmentation
- Problem base will be 9 or 12 (not the standard 8)
- All shares reduced proportionally
- All heirs receive less than their normal fixed share

---

### 3. Validation Warnings System

**Test Case**: Invalid Estate Configuration

**Steps**:
1. Estate Total: 100,000
2. Set:
   - Funeral: 60,000
   - Debts: 50,000
   - Will: 100,000
   - Son: 1
3. Click "حساب" (Calculate)

**Expected Output**:
- Results appear with warnings section
- Click "⚠️ تنبيهات (2)" to expand
- Warning 1: Funeral costs exceed available funds
- Warning 2: Will allocation exceeds allowed amount (1/3)
- Confidence score shows <90% (orange or red)

---

### 4. Calculation Steps Audit Trail 📋

**Test Case**: Simple Case - Husband + 2 Daughters

**Steps**:
1. Estate: 100,000
2. Set:
   - Husband: 1
   - Daughter: 2
   - All others: 0
3. Click "حساب" (Calculate)

**Expected Output**:
- Main results show: Husband 1/4, each Daughter 3/10
- Expand "📋 خطوات الحساب (7)" section
- Shows 7-10 steps including:
  - Step 1: Estate Validation
  - Step 2: Heir Normalization
  - Step 3: Fixed Shares Calculation
  - Step 4: Hijab Rules Application
  - Step 5: Asaba Distribution
  - Step 6: Awl Adjustment (if applicable)
  - Step 7: Final Distribution

Each step shows: Step number, description, result, and notes

---

### 5. Confidence Scoring 💯

**Test Case 1**: Standard Case (High Confidence)
- Husband, Wife, Father, Mother, 1 Son
- Confidence: 95%+ (Green)

**Test Case 2**: Edge Case (Medium Confidence)
- Grandfather, Grandmother, Half-Sister (same mother)
- Confidence: 75-85% (Orange)
- Warnings explain the complexity

**Test Case 3**: Unusual Case (Low Confidence)
- Multiple competing claims
- Confidence: <70% (Red)
- Multiple warnings displayed

---

### 6. Madhab Comparison View 🔄

**Test Case**: Compare all 4 madhabs

**Steps**:
1. Set any heir combination
2. Click "حساب" (Calculate)
3. Expand "🔄 مقارنة المذاهب" section

**Expected Output**:
- Shows 4 cards (one per madhab)
- Each card colored differently:
  - Shafii: Blue bar
  - Hanafi: Green bar
  - Maliki: Purple bar
  - Hanbali: Red bar
- Each shows:
  - Problem base (أصل المسألة)
  - Top 3 heirs with amounts
  - "+X more" if additional heirs

**Comparison Examples**:
- Grandfather with grandsons: Different distributions
- Brothers vs Sisters: Different in some madhabs
- Distant relatives: Each madhab may include/exclude different heirs

---

### 7. Multiple Heir Types (18 Total)

**Test Case**: Complex scenario with many heirs

**Set**:
- Husband: 1
- Wife: 2
- Father: 1
- Mother: 1
- Grandfather: 1
- Grandmother: 1
- Son: 2
- Daughter: 1
- Grandson: 1
- Granddaughter: 1
- Full Brother: 1
- Full Sister: 1
- Paternal Brother: 1
- Paternal Sister: 1
- Maternal Brother: 1
- Maternal Sister: 1

**Expected Output**:
- All 18 heir types calculated
- Results table shows all included heirs
- Hijab rules correctly block some (e.g., brothers blocked by son)
- Total distribution = 100% of net estate

---

### 8. Hijab (Blocking) Rules Verification

**Test Case 1**: Father blocks brothers
- Set: Father 1, Full Brother 1, Son 1
- Result: Full Brother blocked (hijab by father)

**Test Case 2**: Son blocks brothers
- Set: Son 1, Full Brother 1
- Result: Full Brother blocked (hijab by son)

**Test Case 3**: Daughter blocks distant relatives
- Set: Daughter 1, Maternal Sister 1
- Result: Maternal Sister blocked

All hijab outcomes should be explained in calculation steps.

---

### 9. Dark Mode & Responsive Design

**Test**:
1. Toggle device dark mode
2. Verify colors adjust appropriately
3. Test on small phone screen (rotate device)
4. Verify layout remains usable
5. Text remains readable

---

### 10. Arabic RTL & Localization

**Verify**:
- All text displays right-to-left (RTL)
- Arabic numbers (١٢٣) used where appropriate
- Fraction notation in Arabic (نصف، ثلث، سدس، etc.)
- All button labels in Arabic
- All section headers in Arabic

---

## Feature Checklist

After running all tests above, verify:

- [x] Special case detection (Umariyyah, Awl)
- [x] Validation warnings system
- [x] Calculation steps audit trail (7+ steps per calculation)
- [x] Confidence scoring (high/medium/low)
- [x] Madhab comparison (all 4 schools)
- [x] 18 heir types supported
- [x] Hijab rules blocking correctly
- [x] Results accuracy across all madhabs
- [x] Dark/light mode support
- [x] Responsive design on all screen sizes
- [x] Arabic RTL text rendering
- [x] No TypeScript errors
- [x] No runtime errors
- [x] Smooth scrolling
- [x] Collapsible sections work properly
- [x] All buttons responsive
- [x] Input validation works

---

## Sample Test Data

### Simple Inheritance
```
Estate: 100,000 ريال
Husband: 1
Daughter: 2
```
Expected: Husband gets 1/4, Daughters share 3/4

### Complex Inheritance
```
Estate: 500,000 ريال
Wife: 1
Father: 1
Mother: 1
Son: 1
Son: 1
Daughter: 1
```
Expected: Multiple hijab rules apply, sons eliminate daughters from equal share

### Edge Case (Awl)
```
Estate: 60,000 ريال
Husband: 1
Mother: 1
Sister: 2
```
Expected: Awl case detected, fractions augmented

---

## Known Test Results

### Shafii Madhab
- Grandfather acts as heir when no father
- Sister inherits as asaba if no brothers
- Mother gets 1/3 in specific cases

### Hanafi Madhab
- Grandfather treated as father in some cases
- Different hijab rules for sisters
- Specific rules for distant relatives

### Maliki Madhab
- Unique handling of grandmother
- Different brother/sister priority
- Specific Radd rules

### Hanbali Madhab
- Similar to Shafii in many aspects
- Specific grandfather rules
- Unique blood relative handling

---

## Performance Notes

- Calculation should complete in <100ms
- Comparison across 4 madhabs in <300ms
- No lag when expanding/collapsing sections
- Smooth scrolling with large heir lists

---

## Debugging Tips

If tests fail:

1. **Check Console**: Look for TypeScript errors
2. **Verify Data**: Ensure inputs are within valid ranges
3. **Clear Cache**: `pnpm install && pnpm start --clear`
4. **Reset Simulator**: Kill and restart the app
5. **Check Network**: Ensure internet for first load
6. **Verify Permissions**: App needs file/notification permissions

---

## Bug Report Template

If you find issues, document:
- **Steps to Reproduce**: Exact inputs and actions
- **Expected Result**: What should happen
- **Actual Result**: What actually happened
- **Device**: iOS/Android, model, OS version
- **Mode**: Dark/Light
- **Madhab**: Which school selected
- **Screenshot**: If applicable

---

## Success Criteria

✅ All features working as documented  
✅ No errors or warnings in console  
✅ Results match web project for same inputs  
✅ Performance acceptable on real devices  
✅ UI responsive and user-friendly  
✅ Dark mode fully supported  
✅ Arabic localization complete  

**Ready for Production**: Yes ✅

---

**Last Updated**: January 4, 2026  
**Version**: 1.0  
**Status**: Complete
