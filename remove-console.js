const fs = require('fs');
const path = require('path');

const filesToClean = [
  'app/oauth/callback.tsx',
  'lib/auth.ts',
  'lib/api.ts',
  'hooks/use-auth.ts',
  'hooks/useCalculationHistory.ts',
  'hooks/usePrintService.ts',
  'lib/manus-runtime.ts'
];

filesToClean.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    // Remove console.log, console.warn, console.error statements (but keep logger calls)
    content = content.replace(/^\s*console\.(log|warn|error)\([^)]*\);\s*\n/gm, '');
    content = content.replace(/\s*console\.(log|warn|error)\([^)]*\);\s*/g, '');
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Cleaned: ${file}`);
  }
});

console.log('\n✅ All console statements removed from production code');
