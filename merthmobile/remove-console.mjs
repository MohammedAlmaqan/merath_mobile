import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    const originalLines = content.split('\n').length;
    // Remove console.log, console.warn, console.error statements
    content = content.replace(/^\s*console\.(log|warn|error)\([^)]*\);\s*\n/gm, '');
    content = content.replace(/\s*console\.(log|warn|error)\([^)]*\);\s*/g, '');
    fs.writeFileSync(filePath, content, 'utf-8');
    const newLines = content.split('\n').length;
    console.log(`✅ Cleaned: ${file} (removed ${originalLines - newLines} lines)`);
  }
});

console.log('\n✅ All console statements removed from production code');
