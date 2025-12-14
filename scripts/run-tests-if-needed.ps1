# PowerShell wrapper script that runs tests only if code changes are detected
# Uses cache to skip tests if they already passed for the current code state

# Get the current branch
$currentBranch = git branch --show-current

# Try to get the upstream tracking branch
$upstreamBranchOutput = git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>$null
if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($upstreamBranchOutput)) {
    # If no upstream, try origin/current-branch
    $upstreamBranch = "origin/$currentBranch"
} else {
    $upstreamBranch = $upstreamBranchOutput.Trim()
}

$cacheScript = Join-Path $PSScriptRoot "test-cache.ps1"
$checkScript = Join-Path $PSScriptRoot "check-code-changes.ps1"

# Check if remote branch exists
$branchExists = git rev-parse --verify "$upstreamBranch" 2>$null
if (-not $branchExists) {
    # Remote branch doesn't exist yet, so we're pushing everything
    # Run tests to be safe
    Write-Host "New branch detected, running tests"
    $env:GITHUB_TOKEN = "test-token-dummy-value"
    npm test
    $testResult = $LASTEXITCODE
    if ($testResult -eq 0) {
        & $cacheScript -Command "save"
    }
    exit $testResult
}

# Check if cache matches current code state (ignoring whitespace)
# This handles the case where tests passed, hooks fixed formatting, and we're pushing again
& $cacheScript -Command "check" 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Skipping tests (cache hit - tests already passed for this code)"
    exit 0
}

# Get the commits being pushed (commits in local but not in remote)
$commitsBeingPushed = git rev-list "$upstreamBranch..HEAD" 2>$null

if ([string]::IsNullOrWhiteSpace($commitsBeingPushed)) {
    # No commits being pushed (shouldn't happen, but handle it)
    Write-Host "No commits to push, skipping tests"
    exit 0
}

# Check if any of the commits being pushed contain code changes
# We'll check each commit individually
$hasCodeChanges = $false

foreach ($commit in ($commitsBeingPushed -split "`n")) {
    if (-not [string]::IsNullOrWhiteSpace($commit)) {
        $commit = $commit.Trim()
        # Check diff of this commit against its parent
        $parentCommit = "$commit^"
        $commitRange = "$parentCommit..$commit"
        & $checkScript -RemoteBranch $commitRange 2>$null
        if ($LASTEXITCODE -eq 0) {
            $hasCodeChanges = $true
            break
        }
    }
}

# If no individual commit check worked, fall back to comparing against remote
if (-not $hasCodeChanges) {
    & $checkScript -RemoteBranch $upstreamBranch
    $hasCodeChanges = $LASTEXITCODE -eq 0
}

if ($hasCodeChanges) {
    # Code changes detected, run tests
    $env:GITHUB_TOKEN = "test-token-dummy-value"
    npm test
    $testResult = $LASTEXITCODE
    if ($testResult -eq 0) {
        # Tests passed, save cache
        & $cacheScript -Command "save"
    }
    exit $testResult
} else {
    # Only formatting changes, skip tests
    Write-Host "Skipping tests (only formatting changes detected)"
    exit 0
}
