# Branch Protection Rules Setup Guide

This guide explains how to set up branch protection rules for the `main` branch to enforce code quality and prevent accidental merges.

## Overview

Branch protection rules ensure that:
- All code changes go through pull requests
- Required checks (CI, Gitleaks) must pass before merging
- Code is reviewed before being merged
- History cannot be force-pushed or deleted

## Setup Instructions

### 1. Navigate to Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** (top navigation bar)
3. Click on **Branches** (left sidebar)

### 2. Add Branch Protection Rule

1. Under **Branch protection rules**, click **Add rule**
2. In **Branch name pattern**, enter: `main`
3. Configure the following settings:

### 3. Required Settings

#### Require a pull request before merging
- ✅ **Require a pull request before merging**
  - ✅ **Require approvals**: 1 (or more, as needed)
  - ✅ **Dismiss stale pull request approvals when new commits are pushed**
  - ✅ **Require review from Code Owners** (if you have a CODEOWNERS file)

#### Require status checks to pass before merging
- ✅ **Require status checks to pass before merging**
  - ✅ **Require branches to be up to date before merging**
  - Select the following required checks:
    - ✅ **CI / lint** (from `.github/workflows/ci.yml`)
    - ✅ **CI / type-check** (from `.github/workflows/ci.yml`)
    - ✅ **CI / test** (from `.github/workflows/ci.yml`)
    - ✅ **CI / build** (from `.github/workflows/ci.yml`)
    - ✅ **Gitleaks Scan / gitleaks** (from `.github/workflows/gitleaks.yml`)

#### Additional Protection
- ✅ **Do not allow bypassing the above settings**
- ✅ **Restrict who can push to matching branches**: Only allow specific people/teams (optional but recommended)
- ✅ **Require conversation resolution before merging** (optional)
- ✅ **Require signed commits** (optional, for extra security)
- ✅ **Require linear history** (optional, prevents merge commits)

### 4. Save the Rule

Click **Create** or **Save changes** at the bottom of the page.

## What This Means

Once branch protection is enabled:

1. **Direct pushes to `main` are blocked** - All changes must go through pull requests
2. **CI checks must pass** - Lint, type-check, tests, and build must succeed
3. **Gitleaks must pass** - No secrets can be committed
4. **PR review required** - At least one approval is needed
5. **Force pushes are blocked** - Repository history is protected

## Testing the Setup

1. Create a test branch:
   ```bash
   git checkout -b test-branch-protection
   ```

2. Make a small change and commit:
   ```bash
   echo "# Test" >> test.md
   git add test.md
   git commit -m "Test branch protection"
   git push origin test-branch-protection
   ```

3. Create a pull request from your test branch to `main`

4. Verify that:
   - The CI workflow runs automatically
   - The Gitleaks workflow runs automatically
   - You cannot merge until checks pass
   - You cannot merge without a review (if required)

5. Clean up:
   ```bash
   git checkout main
   git branch -D test-branch-protection
   ```

## Troubleshooting

### Checks not showing up?

- Make sure the workflows have run at least once on a PR
- Check that the workflow files are in `.github/workflows/`
- Verify the workflow names match what you selected in branch protection

### Can't merge even though checks passed?

- Ensure "Require branches to be up to date" is enabled and your branch is rebased
- Check that all required checks are selected in branch protection settings
- Verify you have the required number of approvals

### Need to bypass for emergency fix?

- If "Do not allow bypassing" is enabled, you'll need to temporarily disable branch protection
- Consider creating an emergency procedure document for such cases

## Additional Resources

- [GitHub Docs: About protected branches](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Docs: Requiring status checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)


