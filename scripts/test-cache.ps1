# Cache management for test results
# Stores a hash of the code state (ignoring whitespace) when tests pass

param(
    [Parameter(Position=0)]
    [ValidateSet("save", "check", "clear", "hash")]
    [string]$Command = "check",

    [Parameter(Position=1)]
    [string]$RemoteBranch = ""
)

$CACHE_FILE = ".pre-push-test-cache"

function Get-CodeHash {
    param([string]$Branch)

    $currentBranch = git branch --show-current

    if ([string]::IsNullOrEmpty($Branch)) {
        $Branch = "origin/$currentBranch"
    }

    # Check if remote branch exists
    $branchExists = git rev-parse --verify $Branch 2>$null
    if (-not $branchExists) {
        # New branch - use empty tree as base
        $Branch = git hash-object -t tree $null 2>$null
        if ([string]::IsNullOrEmpty($Branch)) {
            $Branch = "4b825dc642cb6eb9a060e54bf8d69288fbee4904"  # Empty tree SHA
        }
    }

    # Get diff ignoring whitespace and hash it
    $diff = git diff --ignore-all-space --ignore-blank-lines --ignore-space-change $Branch 2>$null
    if ([string]::IsNullOrEmpty($diff)) {
        return "empty"
    }

    $bytes = [System.Text.Encoding]::UTF8.GetBytes($diff)
    $hash = [System.Security.Cryptography.MD5]::Create().ComputeHash($bytes)
    return [System.BitConverter]::ToString($hash).Replace("-", "").ToLower()
}

function Save-Cache {
    param([string]$Branch)

    $codeHash = Get-CodeHash -Branch $Branch
    $timestamp = Get-Date -UFormat %s
    "$codeHash $timestamp" | Out-File -FilePath $CACHE_FILE -Encoding utf8 -NoNewline
    Write-Host "Test cache saved: $codeHash"
}

function Test-Cache {
    param([string]$Branch)

    if (-not (Test-Path $CACHE_FILE)) {
        # No cache exists
        return $false
    }

    $cacheContent = Get-Content $CACHE_FILE -Raw
    $cachedHash = ($cacheContent -split ' ')[0]
    $currentHash = Get-CodeHash -Branch $Branch

    if ($cachedHash -eq $currentHash) {
        Write-Host "Code state matches cache - tests already passed for this code"
        return $true
    } else {
        Write-Host "Code state changed - tests need to run"
        return $false
    }
}

function Clear-TestCache {
    if (Test-Path $CACHE_FILE) {
        Remove-Item $CACHE_FILE -Force
    }
    Write-Host "Test cache cleared"
}

# Main command handler
switch ($Command) {
    "save" {
        Save-Cache -Branch $RemoteBranch
    }
    "check" {
        $result = Test-Cache -Branch $RemoteBranch
        if ($result) { exit 0 } else { exit 1 }
    }
    "clear" {
        Clear-TestCache
    }
    "hash" {
        $hash = Get-CodeHash -Branch $RemoteBranch
        Write-Host $hash
    }
}
