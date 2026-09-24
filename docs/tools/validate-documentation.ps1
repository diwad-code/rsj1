param(
    [string]$ProjectRoot = (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent),
    [switch]$CheckActiveHandoff
)

$ErrorActionPreference = 'Stop'
$sjRoot = (Resolve-Path -LiteralPath $ProjectRoot).Path
$sjErrors = [System.Collections.Generic.List[string]]::new()
$sjKnownGaps = [System.Collections.Generic.List[string]]::new()
$sjDocs = @((Get-Item -LiteralPath (Join-Path $sjRoot 'README.md'))) +
    @((Get-Item -LiteralPath (Join-Path $sjRoot 'AGENTS.md'))) +
    @(Get-ChildItem -LiteralPath (Join-Path $sjRoot 'docs') -Filter '*.md' -Recurse -File)
$sjLinkCount = 0

foreach ($sjFile in $sjDocs) {
    $sjBody = Get-Content -LiteralPath $sjFile.FullName -Raw
    if ($sjBody.Contains([char]0xFFFD)) { $sjErrors.Add("Invalid replacement character: $($sjFile.Name)") }
    if (([regex]::Matches($sjBody, '(?m)^```').Count % 2) -ne 0) {
        $sjErrors.Add("Unclosed code fence: $($sjFile.Name)")
    }
    foreach ($sjMatch in [regex]::Matches($sjBody, '!?\[[^\]]*\]\(([^)]+)\)')) {
        $sjLink = $sjMatch.Groups[1].Value
        if ($sjLink -match '^(https?://|#)') { continue }
        $sjLinkCount++
        $sjTarget = Join-Path $sjFile.DirectoryName ($sjLink -split '#')[0]
        if (Test-Path -LiteralPath $sjTarget) { continue }
        if ($sjFile.Name -eq 'AGENTS.md' -and $sjLink -eq '.github/skills/README.md') {
            $sjKnownGaps.Add('Original AGENTS catalog .github/skills/README.md is absent; documented .agents/skills fallback applies.')
        } else {
            $sjErrors.Add("Broken local link: $($sjFile.Name) -> $sjLink")
        }
    }
}

$sjPlan = Get-Content -LiteralPath (Join-Path $sjRoot 'docs/IMPLEMENTATION_PLAN.md') -Raw
$sjTasks = [regex]::Matches($sjPlan, '(?ms)^### (P\d{2}) —.*?(?=^### |\z)')
$sjDeps = @{}
foreach ($sjTask in $sjTasks) {
    $sjTaskId = $sjTask.Groups[1].Value
    if ($sjDeps.ContainsKey($sjTaskId)) { $sjErrors.Add("Duplicate task: $sjTaskId"); continue }
    foreach ($sjField in @('Zależności', 'Weryfikacja')) {
        if (-not $sjTask.Value.Contains($sjField)) { $sjErrors.Add("Missing task field: $sjTaskId / $sjField") }
    }
    if ($sjTask.Value -notmatch '- \[[ xX]\]') { $sjErrors.Add("Missing task checklist: $sjTaskId") }
    $sjDependencyText = [regex]::Match($sjTask.Value, '\*\*Zależności:\*\* ([^.\r\n]+)').Groups[1].Value
    $sjExpanded = [regex]::Replace($sjDependencyText, 'P(\d{2})[–-]P(\d{2})', {
        param($m)
        (([int]$m.Groups[1].Value)..([int]$m.Groups[2].Value) | ForEach-Object { 'P{0:D2}' -f $_ }) -join ', '
    })
    $sjDeps[$sjTaskId] = @([regex]::Matches($sjExpanded, '\bP\d{2}\b') | ForEach-Object { $_.Value } | Select-Object -Unique)
}
foreach ($sjN in 1..42) {
    $sjExpected = 'P{0:D2}' -f $sjN
    if (-not $sjDeps.ContainsKey($sjExpected)) { $sjErrors.Add("Missing task: $sjExpected") }
}
foreach ($sjTaskId in $sjDeps.Keys) {
    foreach ($sjDep in $sjDeps[$sjTaskId]) {
        if (-not $sjDeps.ContainsKey($sjDep)) { $sjErrors.Add("Unknown dependency: $sjTaskId -> $sjDep") }
    }
}
# Kahn's algorithm validates the complete expanded graph, not just numeric order.
$sjRemaining = @{} + $sjDeps
$sjResolved = [System.Collections.Generic.HashSet[string]]::new()
while ($sjRemaining.Count -gt 0) {
    $sjReady = @($sjRemaining.Keys | Where-Object {
        @($sjRemaining[$_] | Where-Object { -not $sjResolved.Contains($_) }).Count -eq 0
    })
    if ($sjReady.Count -eq 0) { $sjErrors.Add('Dependency cycle or unresolved dependency in task graph.'); break }
    foreach ($sjTaskId in $sjReady) { [void]$sjResolved.Add($sjTaskId); $sjRemaining.Remove($sjTaskId) }
}

$sjWorkflow = Get-Content -LiteralPath (Join-Path $sjRoot 'docs/PACKAGE_WORKFLOW.md') -Raw
$sjRows = [regex]::Matches($sjWorkflow, '(?m)^\| (PKG-\d{3}) \| ([^|]+) \| [^|]+ \| ([^|]+) \|\s*$')
$sjSelectors = @{}
$sjPackages = @{}
$sjPackageStatus = @{}
$sjTaskLastPackage = @{}
$sjScopePosition = @{}
$sjTaskLastPosition = @{}
$sjSequence = 0
foreach ($sjRow in $sjRows) {
    $sjPackage = $sjRow.Groups[1].Value
    $sjPackageNumber = [int]$sjPackage.Substring(4)
    if ($sjPackages.ContainsKey($sjPackage)) { $sjErrors.Add("Duplicate package: $sjPackage") }
    $sjPackageTasks = @([regex]::Matches($sjRow.Groups[2].Value, '\bP\d{2}(?:-H\d{2})?\b') | ForEach-Object { $_.Value })
    $sjPackages[$sjPackage] = $sjPackageTasks
    $sjPackageStatus[$sjPackage] = $sjRow.Groups[3].Value.Trim()
    foreach ($sjSelector in $sjPackageTasks) {
        $sjSequence++
        $sjScopePosition[$sjSelector] = $sjSequence
        if ($sjSelectors.ContainsKey($sjSelector)) { $sjErrors.Add("Duplicate coverage: $sjSelector") }
        $sjSelectors[$sjSelector] = $sjPackageNumber
        $sjParent = $sjSelector.Substring(0, 3)
        $sjTaskLastPosition[$sjParent] = $sjSequence
        if (-not $sjTaskLastPackage.ContainsKey($sjParent) -or $sjTaskLastPackage[$sjParent] -lt $sjPackageNumber) {
            $sjTaskLastPackage[$sjParent] = $sjPackageNumber
        }
    }
}
$sjExpectedSelectors = @((1..42 | Where-Object { $_ -notin @(21, 32) } | ForEach-Object { 'P{0:D2}' -f $_ })) +
    @(1..4 | ForEach-Object { 'P21-H{0:D2}' -f $_ }) +
    @(5..20 | ForEach-Object { 'P32-H{0:D2}' -f $_ })
foreach ($sjSelector in $sjExpectedSelectors) {
    if (-not $sjSelectors.ContainsKey($sjSelector)) { $sjErrors.Add("Unassigned scope: $sjSelector") }
}
foreach ($sjSelector in $sjSelectors.Keys) {
    if ($sjSelector -notin $sjExpectedSelectors) { $sjErrors.Add("Unexpected scope: $sjSelector") }
    $sjParent = $sjSelector.Substring(0, 3)
    foreach ($sjDep in $sjDeps[$sjParent]) {
        if ($sjTaskLastPackage[$sjDep] -gt $sjSelectors[$sjSelector]) {
            $sjErrors.Add("Package scheduled before dependency: $sjSelector -> $sjDep")
        }
        if ($sjTaskLastPosition[$sjDep] -ge $sjScopePosition[$sjSelector]) {
            $sjErrors.Add("Scope appears before dependency completion, including inside a package: $sjSelector -> $sjDep")
        }
    }
}
foreach ($sjN in 1..35) {
    if (-not $sjPackages.ContainsKey(('PKG-{0:D3}' -f $sjN))) { $sjErrors.Add("Missing package number: $sjN") }
}
if ($sjRows.Count -ne 35) { $sjErrors.Add('Expected exactly 35 package rows.') }

$sjHills = [regex]::Matches((Get-Content -LiteralPath (Join-Path $sjRoot 'docs/CONTENT_PLAN.md') -Raw), '(?m)^\| (H\d{2}) \|')
if ($sjHills.Count -ne 20 -or @($sjHills | ForEach-Object { $_.Groups[1].Value } | Select-Object -Unique).Count -ne 20) {
    $sjErrors.Add('Expected twenty distinct hill IDs.')
}
$sjManifest = Get-Content -LiteralPath (Join-Path $sjRoot 'docs/research/reference-images/README.md') -Raw
foreach ($sjGif in Get-ChildItem -LiteralPath (Join-Path $sjRoot 'docs/research/reference-images') -Filter '*.gif' -File) {
    if (-not $sjManifest.Contains((Get-FileHash -LiteralPath $sjGif.FullName -Algorithm SHA256).Hash)) {
        $sjErrors.Add("Reference hash mismatch: $($sjGif.Name)")
    }
}
$sjPdfManifest = Get-Content -LiteralPath (Join-Path $sjRoot 'docs/research/reference-pdf/README.md') -Raw
foreach ($sjPdf in Get-ChildItem -LiteralPath (Join-Path $sjRoot 'docs/research/reference-pdf') -Filter '*.pdf' -File) {
    if (-not $sjPdfManifest.Contains((Get-FileHash -LiteralPath $sjPdf.FullName -Algorithm SHA256).Hash)) {
        $sjErrors.Add("Reference hash mismatch: $($sjPdf.Name)")
    }
}

$sjActiveId = $null
if ($CheckActiveHandoff) {
    $sjActive = Get-Content -LiteralPath (Join-Path $sjRoot 'docs/NEXT_SESSION_PROMPT.md') -Raw
    $sjActiveId = [regex]::Match($sjActive, '(?m)^Pakiet docelowy: (PKG-\d{3})\s*$').Groups[1].Value
    $sjArchive = Join-Path $sjRoot "docs/handoffs/$sjActiveId.md"
    if (-not $sjPackages.ContainsKey($sjActiveId)) { $sjErrors.Add('Active handoff has an unknown or missing package ID.') }
    elseif ([int]$sjActiveId.Substring(4) -gt 1) {
        foreach ($sjPreviousNumber in 1..([int]$sjActiveId.Substring(4) - 1)) {
            $sjPreviousId = 'PKG-{0:D3}' -f $sjPreviousNumber
            if ($sjPackageStatus[$sjPreviousId] -ne 'COMPLETE') {
                $sjErrors.Add("Active handoff skips a package that is not COMPLETE: $sjPreviousId")
            }
        }
    }
    if (-not (Test-Path -LiteralPath $sjArchive)) { $sjErrors.Add('Missing archived active handoff.') }
    elseif ((Get-FileHash -LiteralPath $sjArchive).Hash -ne (Get-FileHash -LiteralPath (Join-Path $sjRoot 'docs/NEXT_SESSION_PROMPT.md')).Hash) {
        $sjErrors.Add('Active handoff differs from archived handoff.')
    }
    $sjScope = [regex]::Match($sjActive, '(?m)^Zakres: ([^\r\n]+)').Groups[1].Value
    $sjScopeIds = @([regex]::Matches($sjScope, '\bP\d{2}(?:-H\d{2})?\b') | ForEach-Object { $_.Value })
    if (($sjScopeIds -join ',') -ne ($sjPackages[$sjActiveId] -join ',')) { $sjErrors.Add('Active handoff scope differs from package map.') }
    foreach ($sjSection in @('Stan wejściowy', 'Wynik pakietu', 'Weryfikacja', 'Zamknięcie i następna sesja')) {
        if (-not $sjActive.Contains($sjSection)) { $sjErrors.Add("Missing handoff section: $sjSection") }
    }
}

[pscustomobject]@{
    result = $(if ($sjErrors.Count -eq 0) { 'PASS' } else { 'FAIL' })
    markdownFiles = $sjDocs.Count
    localLinksChecked = $sjLinkCount
    tasks = $sjTasks.Count
    acyclicTaskGraph = ($sjResolved.Count -eq 42)
    packages = $sjRows.Count
    assignedScopeUnits = $sjSelectors.Count
    hills = $sjHills.Count
    activeHandoff = $sjActiveId
    knownCatalogGaps = @($sjKnownGaps)
    errors = @($sjErrors)
} | ConvertTo-Json -Depth 5
if ($sjErrors.Count -gt 0) { exit 1 }
