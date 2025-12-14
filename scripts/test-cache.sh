#!/bin/bash
# Cache management for test results
# Stores a hash of the code state (ignoring whitespace) when tests pass

CACHE_FILE=".pre-push-test-cache"

# Get a hash of the code state, ignoring whitespace changes
get_code_hash() {
  local remote_branch="${1:-origin/$(git branch --show-current)}"

  # Check if remote branch exists
  if ! git rev-parse --verify "$remote_branch" >/dev/null 2>&1; then
    # New branch - use empty tree as base
    remote_branch="$(git hash-object -t tree /dev/null)"
  fi

  # Get diff ignoring whitespace and hash it
  git diff --ignore-all-space --ignore-blank-lines --ignore-space-change "$remote_branch" 2>/dev/null | md5sum | awk '{print $1}'
}

# Save the current code hash to cache
save_cache() {
  local code_hash=$(get_code_hash "$1")
  local timestamp=$(date +%s)
  echo "$code_hash $timestamp" > "$CACHE_FILE"
  echo "Test cache saved: $code_hash"
}

# Check if current code state matches cache
check_cache() {
  local remote_branch="${1:-origin/$(git branch --show-current)}"

  if [ ! -f "$CACHE_FILE" ]; then
    # No cache exists
    return 1
  fi

  local cached_hash=$(awk '{print $1}' "$CACHE_FILE")
  local current_hash=$(get_code_hash "$remote_branch")

  if [ "$cached_hash" = "$current_hash" ]; then
    echo "Code state matches cache - tests already passed for this code"
    return 0
  else
    echo "Code state changed - tests need to run"
    return 1
  fi
}

# Clear the cache
clear_cache() {
  rm -f "$CACHE_FILE"
  echo "Test cache cleared"
}

# Main command handler
case "$1" in
  save)
    save_cache "$2"
    ;;
  check)
    check_cache "$2"
    ;;
  clear)
    clear_cache
    ;;
  hash)
    get_code_hash "$2"
    ;;
  *)
    echo "Usage: $0 {save|check|clear|hash} [remote_branch]"
    exit 1
    ;;
esac

