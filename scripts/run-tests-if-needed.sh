#!/bin/bash
# Wrapper script that runs tests only if code changes are detected

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
  # Run tests to be safe
  echo "New branch detected, running tests"
  GITHUB_TOKEN="test-token-dummy-value" npm test
  exit $?
fi

# Check if there are code changes
if scripts/check-code-changes.sh "$upstream_branch"; then
  # Code changes detected, run tests
  GITHUB_TOKEN="test-token-dummy-value" npm test
  exit $?
else
  # Only formatting changes, skip tests
  echo "Skipping tests (only formatting changes detected)"
  exit 0
fi
