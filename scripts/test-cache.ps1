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

function Save-Cache {
    $codeHash = Get-CodeHash
    $timestamp = Get-Date -UFormat %s
    "$codeHash $timestamp" | Out-File -FilePath $CACHE_FILE -Encoding utf8 -NoNewline
    Write-Host "Test cache saved: $codeHash"
}

function Test-Cache {
    if (-not (Test-Path $CACHE_FILE)) {
        # No cache exists
        return $false
    }

    $cacheContent = Get-Content $CACHE_FILE -Raw
    $cachedHash = ($cacheContent -split ' ')[0]
    $currentHash = Get-CodeHash

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
        Save-Cache
    }
    "check" {
        $result = Test-Cache
        if ($result) { exit 0 } else { exit 1 }
    }
    "clear" {
        Clear-TestCache
    }
    "hash" {
        $hash = Get-CodeHash
        Write-Host $hash
    }
}
