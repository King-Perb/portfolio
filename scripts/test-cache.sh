#!/bin/bash
# Cache management for test results
# Stores a hash of the code state (ignoring whitespace) when tests pass

CACHE_FILE=".pre-push-test-cache"

# Get a hash of the current code state, ignoring whitespace
# This hashes the actual file contents, not the diff
get_code_hash() {
  # Get all tracked files, cat their contents (ignoring whitespace), and hash
  # This gives us a stable hash that doesn't change based on what's on remote
  git ls-files -z | xargs -0 cat 2>/dev/null | tr -d '[:space:]' | md5sum | awk '{print $1}'
  return 0
}

# Save the current code hash to cache
save_cache() {
  local code_hash=$(get_code_hash)
  local timestamp=$(date +%s)
  echo "$code_hash $timestamp" > "$CACHE_FILE"
  echo "Test cache saved: $code_hash"
  return 0
}

# Check if current code state matches cache
check_cache() {
  if [[ ! -f "$CACHE_FILE" ]]; then
    # No cache exists
    return 1
  fi

  local cached_hash=$(awk '{print $1}' "$CACHE_FILE")
  local current_hash=$(get_code_hash)

  if [[ "$cached_hash" = "$current_hash" ]]; then
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
  return 0
}

# Main command handler
case "$1" in
  save)
    save_cache
    ;;
  check)
    check_cache
    ;;
  clear)
    clear_cache
    ;;
  hash)
    get_code_hash
    ;;
  *)
    echo "Usage: $0 {save|check|clear|hash}"
    exit 1
    ;;
esac
