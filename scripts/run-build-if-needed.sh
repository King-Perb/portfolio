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

# Get the commits being pushed (commits in local but not in remote)
commits_being_pushed=$(git rev-list "$upstream_branch"..HEAD 2>/dev/null)

if [ -z "$commits_being_pushed" ]; then
  # No commits being pushed (shouldn't happen, but handle it)
  echo "No commits to push, skipping build"
  exit 0
fi

# Check if any of the commits being pushed contain code changes
# We'll check the diff of all commits being pushed together
has_code_changes=false
for commit in $commits_being_pushed; do
  # Check diff of this commit against its parent
  if scripts/check-code-changes.sh "$commit^..$commit" 2>/dev/null; then
    has_code_changes=true
    break
  fi
done

# If no individual commit check worked, fall back to comparing against remote
if [ "$has_code_changes" = false ]; then
  if scripts/check-code-changes.sh "$upstream_branch"; then
    has_code_changes=true
  fi
fi

if [ "$has_code_changes" = true ]; then
  # Code changes detected, run build
  GITHUB_TOKEN="test-token-dummy-value" npm run build
  exit $?
else
  # Only formatting changes, skip build
  echo "Skipping build (only formatting changes detected)"
  exit 0
fi
