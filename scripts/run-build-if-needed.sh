#!/bin/bash
# Wrapper script that runs build only if code changes are detected

# Get the current branch
current_branch=$(git branch --show-current)

# Try to get the upstream tracking branch
upstream_branch=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null)

# If no upstream, try origin/current-branch
if [ -z "$upstream_branch" ]; then
  upstream_branch="origin/$current_branch"
fi

# Check if remote branch exists
if ! git rev-parse --verify "$upstream_branch" >/dev/null 2>&1; then
  # Remote branch doesn't exist yet, so we're pushing everything
  # Run build to be safe
  echo "New branch detected, running build"
  GITHUB_TOKEN="test-token-dummy-value" npm run build
  exit $?
fi

# Check if there are code changes
if scripts/check-code-changes.sh "$upstream_branch"; then
  # Code changes detected, run build
  GITHUB_TOKEN="test-token-dummy-value" npm run build
  exit $?
else
  # Only formatting changes, skip build
  echo "Skipping build (only formatting changes detected)"
  exit 0
fi
