import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function removeConsoleStatements(content) {
  // Remove entire console.* statements including multi-line ones
  let result = content;
  
  // Pattern 1: console.log/warn/error with simple arguments
  result = result.replace(/\s*console\.(log|warn|error)\([^)]*\);\s*\n/g, '\n');
  
  // Pattern 2: console.log/warn/error with complex multi-line arguments
  result = result.replace(/\s*console\.(log|warn|error)\(\s*"[^"]*",\s*\{[\s\S]*?\}\s*\);\s*\n/g, '\n');
  result = result.replace(/\s*console\.(log|warn|error)\(\s*'[^']*',\s*\{[\s\S]*?\}\s*\);\s*\n/g, '\n');
  
  // Remove excessive blank lines
  result = result.replace(/\n\n\n+/g, '\n\n');
  
  return result;
}

const filesToClean = [
  'app/oauth/callback.tsx',
  'lib/auth.ts',
  'lib/api.ts',
  'hooks/use-auth.ts',
  'hooks/useCalculationHistory.ts',
  'hooks/usePrintService.ts',
  'lib/manus-runtime.ts'
];

let totalRemoved = 0;

filesToClean.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    const originalLength = content.length;
    content = removeConsoleStatements(content);
    const newLength = content.length;
    const charsRemoved = originalLength - newLength;
    totalRemoved += charsRemoved;
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ ${file}: removed ${charsRemoved} characters`);
  }
});

console.log(`\n✅ Total: ${totalRemoved} characters removed`);
