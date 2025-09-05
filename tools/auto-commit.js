#!/usr/bin/env node
import { execSync } from 'node:child_process';

function hasGit() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function insideRepo() {
  try {
    execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function hasChanges() {
  try {
    // unstaged changes
    execSync('git diff --quiet');
  } catch {
    return true;
  }
  try {
    // staged changes
    execSync('git diff --cached --quiet');
  } catch {
    return true;
  }
  return false;
}

if (!hasGit() || !insideRepo() || !hasChanges()) {
  process.exit(0);
}

const args = process.argv.slice(2);
const shouldPush = args.includes('--push');

const ts = new Date().toISOString().replace('T', ' ').replace(/\..+/, '');
const msg = `chore(auto): save ${ts}`;

try {
  execSync('git add -A', { stdio: 'ignore' });
  execSync(`git commit -m "${msg}"`, { stdio: 'ignore' });
  console.log(`Auto-committed: ${msg}`);

  if (shouldPush) {
    const getBranch = () => execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
    const hasUpstream = () => {
      try {
        execSync('git rev-parse --abbrev-ref --symbolic-full-name @{u}', { stdio: 'ignore' });
        return true;
      } catch { return false; }
    };
    const hasOrigin = () => {
      try { execSync('git remote get-url origin', { stdio: 'ignore' }); return true; } catch { return false; }
    };

    try {
      if (hasUpstream()) {
        execSync('git push', { stdio: 'ignore' });
        console.log('Auto-pushed to upstream');
      } else if (hasOrigin()) {
        const branch = getBranch();
        try {
          execSync(`git push -u origin ${branch}`, { stdio: 'ignore' });
          console.log(`Auto-pushed to origin/${branch} (set upstream)`);
        } catch {
          console.log('Auto-push skipped: upstream not set and initial push failed');
        }
      } else {
        console.log('Auto-push skipped: no upstream configured');
      }
    } catch (e) {
      console.log('Auto-push error:', e?.message || e);
    }
  }
} catch (e) {
  console.log('Auto-commit skipped:', e?.message || e);
}
