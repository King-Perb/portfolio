# PowerShell script to check if the diff contains any non-whitespace code changes
# Returns 0 (success) if code changes detected, 1 (failure) if only formatting

param(
    [string]$RemoteBranch = ""
)

# Check if RemoteBranch is a commit range (contains "..")
$isCommitRange = $RemoteBranch -match "\.\."

if (-not $isCommitRange) {
    # Get current branch name
    $currentBranch = git branch --show-current
    
    # If no remote branch specified, use origin/current-branch
    if ([string]::IsNullOrEmpty($RemoteBranch)) {
        $RemoteBranch = "origin/$currentBranch"
    }
}

# Get the actual diff content ignoring whitespace changes
# If this is empty, there are no code changes (only formatting)
$diffContent = git diff --ignore-all-space --ignore-blank-lines --ignore-space-change $RemoteBranch 2>$null

# Check if diff content is empty (only formatting changes)
if ([string]::IsNullOrWhiteSpace($diffContent)) {
    # No code changes detected - only formatting
    Write-Host "Only formatting changes detected, skipping tests"
    exit 1
}

# If diff content exists, check if it's only removing trailing newlines
# by checking if there are any additions or content modifications
$diffStats = git diff --numstat $RemoteBranch 2>$null

# Check if we have any additions (new code) or if deletions are actual content changes
$hasCodeChanges = $false
foreach ($line in $diffStats -split "`n") {
    if (-not [string]::IsNullOrWhiteSpace($line)) {
        # Extract added and deleted counts (first two numbers)
        $parts = $line -split '\s+'
        if ($parts.Count -ge 3) {
            $added = [int]$parts[0]
            $deleted = [int]$parts[1]
            $file = $parts[2]
            
            # If we have additions, it's definitely code changes
            if ($added -ne 0) {
                $hasCodeChanges = $true
                break
            }
            
            # If we only have deletions, check if it's actual content or just trailing newlines
            # by checking the whitespace-ignored diff for that specific file
            if ($deleted -ne 0 -and $added -eq 0 -and -not [string]::IsNullOrWhiteSpace($file)) {
                $fileDiffIgnored = git diff --ignore-all-space --ignore-blank-lines --ignore-space-change $RemoteBranch -- $file 2>$null
                if (-not [string]::IsNullOrWhiteSpace($fileDiffIgnored)) {
                    # There's actual content change in the file, not just formatting
                    $hasCodeChanges = $true
                    break
                }
            }
        }
    }
}

if ($hasCodeChanges) {
    # Code changes detected
    Write-Host "Code changes detected, running tests"
    exit 0
} else {
    # Only whitespace/formatting changes (including trailing newline removals)
    Write-Host "Only formatting changes detected, skipping tests"
    exit 1
}
