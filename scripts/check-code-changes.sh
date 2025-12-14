#!/bin/bash
# Check if the diff contains any non-whitespace code changes
# Returns 0 (success) if code changes detected, 1 (failure) if only formatting

# Get the diff between local branch and remote
# For pre-push, we compare against the remote branch we're pushing to
remote_branch="${1:-origin/$(git branch --show-current)}"

# Get diff stats ignoring whitespace changes
# This will show 0 0 if only whitespace changed
diff_stats=$(git diff --numstat --ignore-all-space --ignore-blank-lines --ignore-space-change "$remote_branch")

# Check if there are any actual changes (non-zero stats)
if [ -z "$diff_stats" ]; then
  # No diff at all - only formatting changes
  echo "Only formatting changes detected, skipping tests"
  exit 1
fi

# Check if all lines show 0 0 (only whitespace changes)
# If any line has non-zero numbers, there are code changes
has_code_changes=false
while IFS= read -r line; do
  if [ -n "$line" ]; then
    # Extract added and deleted counts (first two numbers)
    added=$(echo "$line" | awk '{print $1}')
    deleted=$(echo "$line" | awk '{print $2}')
    # If either is non-zero, we have code changes
    if [ "$added" != "0" ] || [ "$deleted" != "0" ]; then
      has_code_changes=true
      break
    fi
  fi
done <<< "$diff_stats"

if [ "$has_code_changes" = true ]; then
  # Code changes detected
  echo "Code changes detected, running tests"
  exit 0
else
  # Only whitespace/formatting changes
  echo "Only formatting changes detected, skipping tests"
  exit 1
fi

