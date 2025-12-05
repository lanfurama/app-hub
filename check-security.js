#!/usr/bin/env node
/**
 * Security Check Script
 * Checks if sensitive files are being tracked by git
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';

const sensitiveFiles = [
  '.env',
  'api/.env',
  '.env.local',
  'api/.env.local'
];

console.log('🔒 Security Check\n');

let hasIssues = false;

// Check if .env files are tracked by git
try {
  const trackedFiles = execSync('git ls-files', { encoding: 'utf-8' }).split('\n');
  
  sensitiveFiles.forEach(file => {
    if (trackedFiles.includes(file)) {
      console.error(`❌ ${file} is tracked by git! This is a security risk.`);
      console.error(`   Run: git rm --cached ${file}`);
      hasIssues = true;
    } else if (existsSync(file)) {
      console.log(`✅ ${file} exists but is NOT tracked (good)`);
    } else {
      console.log(`ℹ️  ${file} does not exist`);
    }
  });
  
  // Check .gitignore
  const gitignore = existsSync('.gitignore') 
    ? require('fs').readFileSync('.gitignore', 'utf-8')
    : '';
  
  if (!gitignore.includes('.env')) {
    console.error('❌ .env is not in .gitignore!');
    hasIssues = true;
  } else {
    console.log('✅ .env is in .gitignore');
  }
  
} catch (error) {
  console.log('ℹ️  Not a git repository or git not available');
}

if (!hasIssues) {
  console.log('\n✅ All security checks passed!');
} else {
  console.log('\n⚠️  Please fix the issues above before committing.');
  process.exit(1);
}

