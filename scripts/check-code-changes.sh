#!/bin/bash
# Check if the diff contains any non-whitespace code changes
# Returns 0 (success) if code changes detected, 1 (failure) if only formatting

# Accept either a branch name or a commit range (e.g., "HEAD~1..HEAD")
# If it contains "..", treat it as a commit range
if [[ "$1" == *".."* ]]; then
  # Commit range provided
  commit_range="$1"
  # For commit ranges, we need to use git diff with the range
  diff_stats=$(git diff --numstat --ignore-all-space --ignore-blank-lines --ignore-space-change "$commit_range" 2>/dev/null)
else
  # Branch name provided (default behavior)
  remote_branch="${1:-origin/$(git branch --show-current)}"
  diff_stats=$(git diff --numstat --ignore-all-space --ignore-blank-lines --ignore-space-change "$remote_branch" 2>/dev/null)
fi

# Get the actual diff content ignoring whitespace changes
# If this is empty, there are no code changes (only formatting)
if [[ "$1" == *".."* ]]; then
  diff_content=$(git diff --ignore-all-space --ignore-blank-lines --ignore-space-change "$commit_range" 2>/dev/null)
else
  diff_content=$(git diff --ignore-all-space --ignore-blank-lines --ignore-space-change "$remote_branch" 2>/dev/null)
fi

# Check if diff content is empty (only formatting changes)
if [ -z "$diff_content" ]; then
  # No code changes detected - only formatting
  echo "Only formatting changes detected, skipping tests"
  exit 1
fi

# If diff content exists, check if it's only removing trailing newlines
# by checking if there are any additions or content modifications
if [[ "$1" == *".."* ]]; then
  diff_stats=$(git diff --numstat "$commit_range" 2>/dev/null)
else
  diff_stats=$(git diff --numstat "$remote_branch" 2>/dev/null)
fi

# Check if we have any additions (new code) or if deletions are actual content changes
has_code_changes=false
while IFS= read -r line; do
  if [ -n "$line" ]; then
    # Extract added and deleted counts (first two numbers)
    added=$(echo "$line" | awk '{print $1}')
    deleted=$(echo "$line" | awk '{print $2}')
    file=$(echo "$line" | awk '{print $3}')

    # If we have additions, it's definitely code changes
    if [ "$added" != "0" ]; then
      has_code_changes=true
      break
    fi

    # If we only have deletions, check if it's actual content or just trailing newlines
    # by checking the whitespace-ignored diff for that specific file
    if [ "$deleted" != "0" ] && [ "$added" = "0" ] && [ -n "$file" ]; then
      if [[ "$1" == *".."* ]]; then
        file_diff_ignored=$(git diff --ignore-all-space --ignore-blank-lines --ignore-space-change "$commit_range" -- "$file" 2>/dev/null)
      else
        file_diff_ignored=$(git diff --ignore-all-space --ignore-blank-lines --ignore-space-change "$remote_branch" -- "$file" 2>/dev/null)
      fi
      if [ -n "$file_diff_ignored" ]; then
        # There's actual content change in the file, not just formatting
        has_code_changes=true
        break
      fi
    fi
  fi
done <<< "$diff_stats"

if [ "$has_code_changes" = true ]; then
  # Code changes detected
  echo "Code changes detected, running tests"
  exit 0
else
  # Only whitespace/formatting changes (including trailing newline removals)
  echo "Only formatting changes detected, skipping tests"
  exit 1
fi
