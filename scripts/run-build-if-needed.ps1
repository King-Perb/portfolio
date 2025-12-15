# PowerShell wrapper script that runs build only if code changes are detected
# Uses cache to skip build if it already passed for the current code state

$CACHE_FILE = ".pre-push-build-cache"

function Get-CodeHash {
    # Get all tracked files, cat their contents (ignoring whitespace), and hash
    # This gives us a stable hash that doesn't change based on what's on remote
    $files = git ls-files
    $allContent = ""
    foreach ($file in $files) {
        if (Test-Path $file) {
            $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
            if ($content) {
                # Remove all whitespace for comparison
                $allContent += ($content -replace '\s', '')
            }
        }
    }

    if ([string]::IsNullOrEmpty($allContent)) {
        return "empty"
    }

    $bytes = [System.Text.Encoding]::UTF8.GetBytes($allContent)
    $hash = [System.Security.Cryptography.MD5]::Create().ComputeHash($bytes)
    return [System.BitConverter]::ToString($hash).Replace("-", "").ToLower()
}

function Test-BuildCache {
    if (-not (Test-Path $CACHE_FILE)) {
        return $false
    }
    $cacheContent = Get-Content $CACHE_FILE -Raw
    $cachedHash = ($cacheContent -split ' ')[0]
    $currentHash = Get-CodeHash
    return $cachedHash -eq $currentHash
}

function Save-BuildCache {
    $codeHash = Get-CodeHash
    $timestamp = Get-Date -UFormat %s
    "$codeHash $timestamp" | Out-File -FilePath $CACHE_FILE -Encoding utf8 -NoNewline
}

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

$checkScript = Join-Path $PSScriptRoot "check-code-changes.ps1"

# Check if remote branch exists
$branchExists = git rev-parse --verify "$upstreamBranch" 2>$null
if (-not $branchExists) {
    # Remote branch doesn't exist yet, so we're pushing everything
    # Run build to be safe
    Write-Host "New branch detected, running build"
    $env:GITHUB_TOKEN = "test-token-dummy-value"
    npm run build
    $buildResult = $LASTEXITCODE
    if ($buildResult -eq 0) {
        Save-BuildCache
    }
    exit $buildResult
}

# Check if cache matches current code state (ignoring whitespace)
if (Test-BuildCache) {
    [Console]::Error.WriteLine("")
    [Console]::Error.WriteLine(">>> SKIPPING BUILD (cache hit - build already passed for this code) <<<")
    [Console]::Error.WriteLine("")
    exit 0
}

# Get the commits being pushed (commits in local but not in remote)
$commitsBeingPushed = git rev-list "$upstreamBranch..HEAD" 2>$null

if ([string]::IsNullOrWhiteSpace($commitsBeingPushed)) {
    # No commits being pushed (shouldn't happen, but handle it)
    [Console]::Error.WriteLine("")
    [Console]::Error.WriteLine(">>> SKIPPING BUILD (no commits to push) <<<")
    [Console]::Error.WriteLine("")
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
    # Code changes detected, run build
    $env:GITHUB_TOKEN = "test-token-dummy-value"
    npm run build
    $buildResult = $LASTEXITCODE
    if ($buildResult -eq 0) {
        # Build passed, save cache
        Save-BuildCache
    }
    exit $buildResult
} else {
    # Only formatting changes, skip build
    [Console]::Error.WriteLine("")
    [Console]::Error.WriteLine(">>> SKIPPING BUILD (only formatting changes detected) <<<")
    [Console]::Error.WriteLine("")
    exit 0
}
