# Smart Pre-Push Hooks

## Overview

The pre-push hooks are configured to intelligently skip tests and build when:
1. Only formatting changes (whitespace, trailing spaces, etc.) are detected
2. Tests/build already passed for the current code state (cache hit)

This significantly speeds up the workflow when fixing formatting issues.

## How It Works

1. **Formatting Checks** (always run - fast):
   - Trailing whitespace
   - End of file fixes
   - YAML validation
   - Large file checks

2. **Code Quality Checks** (always run - fast):
   - Lint
   - Type check

3. **Tests** (conditional - slow):
   - Checks cache first - if tests already passed for this code, skips
   - Otherwise, only runs if code changes are detected
   - Skips if only formatting changes detected
   - Saves cache when tests pass

4. **Build** (conditional - slow):
   - Checks cache first - if build already passed for this code, skips
   - Otherwise, only runs if code changes are detected
   - Skips if only formatting changes detected
   - Saves cache when build passes

## Cache System

The hooks use a cache to track when tests/build passed for a specific code state:

- **Cache files:** `.pre-push-test-cache`, `.pre-push-build-cache` (gitignored)
- **Cache key:** MD5 hash of the diff (ignoring whitespace)
- **Cache hit:** If the code hash matches, tests/build are skipped

### Scenario: Formatting Fixes After Passed Tests

1. Push attempt → tests/build **run and pass**
2. Hooks fix trailing whitespace → cache is saved
3. Commit the whitespace fixes
4. Push again → tests/build **skip** (cache hit!)

The cache ensures that if tests passed for your actual code, you don't need to run them again just because formatting was fixed.

## Detection Logic

The `check-code-changes.sh` script:
- Compares the current branch against the remote tracking branch
- Uses `git diff --numstat` with whitespace-ignoring flags
- If all diff stats show `0 0` (zero additions, zero deletions), it's formatting-only
- If any line shows non-zero stats, code changes are detected

## Scripts

- `check-code-changes.sh` / `check-code-changes.ps1`: Detects if changes are formatting-only
- `run-tests-if-needed.sh` / `run-tests-if-needed.ps1`: Conditionally runs tests
- `run-build-if-needed.sh` / `run-build-if-needed.ps1`: Conditionally runs build

## Safety Features

- **New branches**: Always runs tests/build (no remote to compare against)
- **Code changes**: Always runs tests/build (actual code modified)
- **Formatting only**: Skips tests/build (safe to skip)

## Example Scenarios

### Scenario 1: Only Formatting Changes
```bash
# Fix trailing whitespace
git add file.ts
git commit -m "fix: remove trailing whitespace"
git push
# ✅ Tests and build are skipped (fast!)
```

### Scenario 2: Code Changes
```bash
# Add new feature
git add new-feature.ts
git commit -m "feat: add new feature"
git push
# ✅ Tests and build run (necessary!)
```

### Scenario 3: Mixed Changes
```bash
# Fix formatting + add code
git add file1.ts file2.ts
git commit -m "fix: formatting and add feature"
git push
# ✅ Tests and build run (code changes detected)
```

## Configuration

The hooks are configured in `.pre-commit-config.yaml`:

```yaml
- id: test
  name: Test
  entry: bash scripts/run-tests-if-needed.sh
  stages: [pre-push]
  always_run: true

- id: build
  name: Build
  entry: bash scripts/run-build-if-needed.sh
  stages: [pre-push]
  always_run: true
```

## Troubleshooting

### Tests always run even for formatting-only changes
- Check that `check-code-changes.sh` is executable
- Verify the remote branch exists (new branches always run tests)
- Check git diff output manually: `git diff origin/branch-name --numstat --ignore-all-space`

### Tests skipped when they shouldn't be
- The detection might be too aggressive
- Check the diff manually to verify
- You can always run tests manually: `npm test`

## Platform Support

- **Unix/Linux/macOS**: Uses bash scripts (`.sh`)
- **Windows**: Uses PowerShell scripts (`.ps1`)
- Pre-commit framework automatically selects the appropriate script
