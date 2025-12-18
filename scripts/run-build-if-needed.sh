#!/bin/bash
# Wrapper script that runs build only if code changes are detected
# Uses cache to skip build if it already passed for the current code state

CACHE_FILE=".pre-push-build-cache"

# Get a hash of the current code state, ignoring whitespace
# This hashes the actual file contents, not the diff
get_code_hash() {
  # Get all tracked files, cat their contents (ignoring whitespace), and hash
  # This gives us a stable hash that doesn't change based on what's on remote
  git ls-files -z | xargs -0 cat 2>/dev/null | tr -d '[:space:]' | md5sum | awk '{print $1}'
  return 0
}

# Check if cache matches
check_build_cache() {
  if [[ ! -f "$CACHE_FILE" ]]; then
    return 1
  fi
  local cached_hash=$(awk '{print $1}' "$CACHE_FILE")
  local current_hash=$(get_code_hash)
  if [[ "$cached_hash" = "$current_hash" ]]; then
    echo "Build cache hit - build already passed for this code"
    return 0
  fi
  return 1
}

# Save cache
save_build_cache() {
  local code_hash=$(get_code_hash)
  echo "$code_hash $(date +%s)" > "$CACHE_FILE"
  return 0
}

# Get the current branch
current_branch=$(git branch --show-current)

# Try to get the upstream tracking branch
upstream_branch=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null)

# If no upstream, try origin/current-branch
if [[ -z "$upstream_branch" ]]; then
  upstream_branch="origin/$current_branch"
fi

# Check if remote branch exists
if ! git rev-parse --verify "$upstream_branch" >/dev/null 2>&1; then
  # Remote branch doesn't exist yet, so we're pushing everything
  # Run build to be safe
  echo "New branch detected, running build"
  GITHUB_TOKEN="test-token-dummy-value" npm run build
  build_result=$?
  if [[ $build_result -eq 0 ]]; then
    save_build_cache
  fi
  exit $build_result
fi

# Check if cache matches current code state (ignoring whitespace)
if check_build_cache "$upstream_branch"; then
  echo "" >&2
  echo ">>> SKIPPING BUILD (cache hit - build already passed for this code) <<<" >&2
  echo "" >&2
  exit 0
fi

# Get the commits being pushed (commits in local but not in remote)
commits_being_pushed=$(git rev-list "$upstream_branch"..HEAD 2>/dev/null)

if [[ -z "$commits_being_pushed" ]]; then
  # No commits being pushed (shouldn't happen, but handle it)
  echo "" >&2
  echo ">>> SKIPPING BUILD (no commits to push) <<<" >&2
  echo "" >&2
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
if [[ "$has_code_changes" = false ]] && scripts/check-code-changes.sh "$upstream_branch"; then
  has_code_changes=true
fi

if [[ "$has_code_changes" = true ]]; then
  # Code changes detected, run build
  GITHUB_TOKEN="test-token-dummy-value" npm run build
  build_result=$?
  if [[ $build_result -eq 0 ]]; then
    # Build passed, save cache
    save_build_cache
  fi
  exit $build_result
else
  # Only formatting changes, skip build
  echo "" >&2
  echo ">>> SKIPPING BUILD (only formatting changes detected) <<<" >&2
  echo "" >&2
  exit 0
fi
