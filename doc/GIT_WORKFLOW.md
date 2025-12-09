# Git Workflow & Branching Strategy

This document defines the Git workflow and branching strategy for this portfolio project.

## Branch Strategy

### Primary Branches

- **`main`**: Production-ready code. Always deployable. Protected by branch protection rules.
- **`develop`**: (Optional) Integration branch for features. Use if working on multiple features simultaneously.

### Feature Branches

All new work should be done on feature branches:

- **`feature/<description>`**: New features (e.g., `feature/github-api-integration`)
- **`fix/<description>`**: Bug fixes (e.g., `fix/metrics-formatting`)
- **`refactor/<description>`**: Code refactoring (e.g., `refactor/project-service`)
- **`docs/<description>`**: Documentation updates (e.g., `docs/git-workflow`)
- **`test/<description>`**: Test additions/improvements (e.g., `test/projects-service`)

### Branch Naming Convention

- Use lowercase
- Separate words with hyphens (`-`)
- Be descriptive but concise
- Match commit message scope when possible

**Examples:**
- ✅ `feature/dashboard-metrics`
- ✅ `fix/stars-trend-logic`
- ✅ `refactor/github-api-client`
- ❌ `new-feature`
- ❌ `fix`
- ❌ `my_branch`

## Workflow

### Starting New Work

1. **Ensure you're on `main` and up to date:**
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes and commit:**
   ```bash
   git add .
   git commit -m "feat(scope): your commit message"
   ```

4. **Push the branch:**
   ```bash
   git push -u origin feature/your-feature-name
   ```

### Completing Work

1. **Ensure all changes are committed:**
   ```bash
   git status  # Should show "nothing to commit"
   ```

2. **Push any remaining commits:**
   ```bash
   git push
   ```

3. **Create a Pull Request on GitHub:**
   - Go to your repository on GitHub
   - Click "New Pull Request"
   - Select your feature branch → `main`
   - Fill out the PR description
   - Wait for CI checks to pass
   - Request review (if required)

4. **After PR is merged:**
   ```bash
   git checkout main
   git pull origin main
   git branch -d feature/your-feature-name  # Delete local branch
   ```

## Current Situation: Moving Changes from Main

If you've been working directly on `main`, here's how to move your changes to a feature branch:

### Option 1: Uncommitted Changes

```bash
# Create a new branch (this moves your uncommitted changes)
git checkout -b feature/your-feature-name

# Commit your changes
git add .
git commit -m "feat(scope): your commit message"

# Push the branch
git push -u origin feature/your-feature-name

# Switch back to main and reset it to match remote
git checkout main
git reset --hard origin/main
```

### Option 2: Committed Changes on Main

```bash
# Create a new branch from current state (includes your commits)
git checkout -b feature/your-feature-name

# Push the branch
git push -u origin feature/your-feature-name

# Switch back to main
git checkout main

# Reset main to match remote (removes your local commits)
git reset --hard origin/main

# Note: Your commits are safe on the feature branch
```

## Best Practices

1. **Never commit directly to `main`** - Always use feature branches
2. **Keep branches focused** - One feature/fix per branch
3. **Keep branches up to date** - Regularly rebase/merge from `main`
4. **Delete merged branches** - Clean up after PRs are merged
5. **Write clear commit messages** - Follow Conventional Commits format
6. **Small, frequent commits** - Easier to review and debug

## Branch Protection

The `main` branch is protected with the following rules:

- ✅ Pull requests required before merging
- ✅ CI checks must pass (lint, type-check, test, build)
- ✅ Gitleaks scan must pass
- ✅ At least 1 approval required
- ✅ No force pushes allowed

This means you **cannot** push directly to `main` - all changes must go through a PR.

## Updating Your Feature Branch

If `main` has moved ahead while you're working:

```bash
# On your feature branch
git checkout feature/your-feature-name

# Option 1: Merge main into your branch
git merge main

# Option 2: Rebase your branch on main (cleaner history)
git rebase main

# Resolve any conflicts, then push
git push
# If you rebased, you may need: git push --force-with-lease
```

## Emergency Hotfixes

For critical production bugs:

1. Create a hotfix branch from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-bug-fix
   ```

2. Make the fix, commit, and push
3. Create PR and merge immediately after review
4. Tag the release if needed

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Branching Best Practices](https://www.atlassian.com/git/tutorials/comparing-workflows)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
