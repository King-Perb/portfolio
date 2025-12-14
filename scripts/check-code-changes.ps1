# PowerShell script to check if the diff contains any non-whitespace code changes
# Returns 0 (success) if code changes detected, 1 (failure) if only formatting

param(
    [string]$RemoteBranch = ""
)

# Get current branch name
$currentBranch = git branch --show-current

# If no remote branch specified, use origin/current-branch
if ([string]::IsNullOrEmpty($RemoteBranch)) {
    $RemoteBranch = "origin/$currentBranch"
}

# Get diff stats ignoring whitespace changes
# This will show 0 0 if only whitespace changed
$diffStats = git diff --numstat --ignore-all-space --ignore-blank-lines --ignore-space-change $RemoteBranch

# Check if there are any actual changes
if ([string]::IsNullOrWhiteSpace($diffStats)) {
    # No diff at all - only formatting changes
    Write-Host "Only formatting changes detected, skipping tests"
    exit 1
}

# Check if all lines show 0 0 (only whitespace changes)
# If any line has non-zero numbers, there are code changes
$hasCodeChanges = $false
foreach ($line in $diffStats -split "`n") {
    if (-not [string]::IsNullOrWhiteSpace($line)) {
        # Extract added and deleted counts (first two numbers)
        $parts = $line -split '\s+'
        if ($parts.Count -ge 2) {
            $added = [int]$parts[0]
            $deleted = [int]$parts[1]
            # If either is non-zero, we have code changes
            if ($added -ne 0 -or $deleted -ne 0) {
                $hasCodeChanges = $true
                break
            }
        }
    }
}

if ($hasCodeChanges) {
    # Code changes detected
    Write-Host "Code changes detected, running tests"
    exit 0
} else {
    # Only whitespace/formatting changes
    Write-Host "Only formatting changes detected, skipping tests"
    exit 1
}
