# PowerShell wrapper script that runs tests only if code changes are detected

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

# Check if remote branch exists
$branchExists = git rev-parse --verify "$upstreamBranch" 2>$null
if (-not $branchExists) {
    # Remote branch doesn't exist yet, so we're pushing everything
    # Run tests to be safe
    Write-Host "New branch detected, running tests"
    $env:GITHUB_TOKEN = "test-token-dummy-value"
    npm test
    exit $LASTEXITCODE
}

# Check if there are code changes
$checkScript = Join-Path $PSScriptRoot "check-code-changes.ps1"
& $checkScript -RemoteBranch $upstreamBranch
$hasCodeChanges = $LASTEXITCODE -eq 0

if ($hasCodeChanges) {
    # Code changes detected, run tests
    $env:GITHUB_TOKEN = "test-token-dummy-value"
    npm test
    exit $LASTEXITCODE
} else {
    # Only formatting changes, skip tests
    Write-Host "Skipping tests (only formatting changes detected)"
    exit 0
}
