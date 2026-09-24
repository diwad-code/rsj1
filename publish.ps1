#Requires -Version 5.1
<#
.SYNOPSIS
Publikuje BIEŻĄCY folder na github.com. Windows PowerShell 5.1 / PowerShell 7.
.DESCRIPTION
Wersja 5.0: jawny cel publikacji, kontrola historii i indeksu, lokalna konfiguracja
LFS, brak force-push i automatycznego przepisywania historii. Log poza projektem.
DryRun nie zmienia projektu ani GitHuba; dla nowego folderu używa usuwanego
repozytorium technicznego w TEMP. Podgląd analizuje ISTNIEJĄCE reguły ignorowania.
UWAGA: publikowane są wszystkie nieignorowane zmiany (również usunięcia)
oraz historia bieżącej gałęzi. Częściowy staging zostanie zastąpiony.
.EXAMPLE
& C:\Narzedzia\publish-to-github-large-v5.ps1 -DryRun -Private
.EXAMPLE
& C:\Narzedzia\publish-to-github-large-v5.ps1 -Private -NonInteractive -GenerateReadme
.EXAMPLE
& C:\rsj1\publish.ps1 -Public -NonInteractive -GenerateReadme -LargeFilesOver100MB LFS
.PARAMETER Force
Zgodność z v4: pomija końcowe pytanie i zezwala na istniejące repo. NIE omija
kontroli origin, widoczności, sekretów, historii ani konfliktów. Nigdy force-push.
.PARAMETER AllowExistingRepo
Zezwala na istniejące repo bez zgodnego origin. Ponowienie z już zgodnym origin
nie wymaga tej opcji. Nie zmienia widoczności repo ani nie nadpisuje historii.
.PARAMETER ReplaceOrigin
Jawna zgoda na zmianę origin. Nie omija kontroli efektywnych URL po zmianie.
.PARAMETER NoLargeFileCheck
Pomija raport i wybór sposobu obsługi dużych plików. Obowiązkowa blokada obiektów
Git większych niż 100 MiB nadal działa.
.PARAMETER NoGitIgnore
Nie tworzy domyślnego .gitignore. Jawny wybór Ignore nadal dopisuje reguły.
.PARAMETER AllowSensitiveFiles
Omija TYLKO heurystykę nazw potencjalnych sekretów w aktualnych plikach/indeksie.
Nie ma skanowania zawartości ani pełnego skanowania sekretów w historii.
#>
[CmdletBinding()]
param(
    [switch]$Public,
    [switch]$Private,
    [string]$Description = '',
    [string]$Org = '',
    [string]$RepoName = '',
    [switch]$NoGitIgnore,
    [ValidateNotNullOrEmpty()][string]$CommitMessage = 'Pierwszy commit',
    [switch]$Force,
    [ValidateRange(1, 200)][int]$TopLargestFiles = 20,
    [switch]$NonInteractive,
    [ValidateSet('Git', 'LFS', 'Ignore', 'Abort')]
    [string]$LargeFiles50To100MB = 'Git',
    [ValidateSet('LFS', 'Ignore', 'Abort')]
    [string]$LargeFilesOver100MB = 'Abort',
    [string]$LogFile = '',
    [switch]$DryRun,
    [switch]$GenerateReadme,
    [switch]$NoLargeFileCheck,
    [switch]$AllowExistingRepo,
    [switch]$ReplaceOrigin,
    [switch]$AllowSensitiveFiles,
    [string]$Branch = '',
    [ValidateSet('Auto', 'Https', 'Ssh')][string]$GitProtocol = 'Auto',
    [ValidateRange(10, 86400)][int]$CommandTimeoutSeconds = 1800,
    [ValidateRange(1, 5)][int]$NetworkAttempts = 3
)

function Protect-LogText {
    param([AllowEmptyString()][string]$Text)
    $Text = $Text -replace '(?i)(https?://)[^/\s@]+@', '$1[REDACTED]@'
    $Text = $Text -replace '(?i)\b(?:gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+)\b', '[REDACTED]'
    $Text = $Text -replace '(?im)(authorization:\s*(?:bearer|token)\s+)\S+', '$1[REDACTED]'
    return $Text
}

function Write-PublishLog {
    param([string]$Level, [string]$Text, [switch]$FileOnly)
    $safe = Protect-LogText $Text
    if (-not $FileOnly) { Write-Host "[$Level] $safe" }
    if ($script:S.LogReady -and -not $script:S.Options.DryRun) {
        try {
            [IO.File]::AppendAllText($script:S.LogPath,
                ('[{0:yyyy-MM-dd HH:mm:ss}] [{1}] {2}{3}' -f (Get-Date), $Level, $safe, [Environment]::NewLine),
                $script:S.Utf8)
        } catch {
            # Awaria logowania nie może ukryć pierwotnego błędu ani przerwać push.
            $script:S.LogReady = $false
            Write-Warning "Zapis logu wyłączony: $($_.Exception.Message)"
        }
    }
}

function ConvertTo-NativeArgument {
    param([AllowEmptyString()][string]$Value)
    # Reguły CommandLineToArgvW/CRT. Działa także w .NET używanym przez PS 5.1.
    # Nie uruchamiamy cmd.exe ani Invoke-Expression. Cudzysłowy są danymi.
    if ($Value.IndexOf([char]0) -ge 0) { throw 'Argument zawiera znak NUL.' }
    $escaped = [regex]::Replace($Value, '(\\*)"', '$1$1\"')
    $escaped = [regex]::Replace($escaped, '(\\+)$', '$1$1')
    return '"' + $escaped + '"'
}

function Invoke-NativeProcess {
    param(
        [string]$Executable,
        [string[]]$Arguments = @(),
        [AllowEmptyString()][string]$InputText = '',
        [int]$TimeoutSeconds = 0,
        [hashtable]$EnvironmentOverrides = @{}
    )
    if ($TimeoutSeconds -eq 0) { $TimeoutSeconds = $script:S.Options.CommandTimeoutSeconds }
    $info = New-Object System.Diagnostics.ProcessStartInfo
    $info.FileName = $Executable
    $info.Arguments = (@($Arguments | ForEach-Object { ConvertTo-NativeArgument $_ }) -join ' ')
    $info.WorkingDirectory = $script:S.Root
    $info.UseShellExecute = $false
    $info.CreateNoWindow = $true
    $info.RedirectStandardOutput = $true
    $info.RedirectStandardError = $true
    $info.RedirectStandardInput = $true
    $info.StandardOutputEncoding = $script:S.Utf8
    $info.StandardErrorEncoding = $script:S.Utf8
    $info.EnvironmentVariables['LC_ALL'] = 'C'
    $info.EnvironmentVariables['LANG'] = 'C'
    $info.EnvironmentVariables['GH_HOST'] = 'github.com'
    $info.EnvironmentVariables['GH_PROMPT_DISABLED'] = '1'
    $info.EnvironmentVariables['GH_NO_UPDATE_NOTIFIER'] = '1'
    $info.EnvironmentVariables['GH_NO_EXTENSION_UPDATE_NOTIFIER'] = '1'
    $info.EnvironmentVariables['GIT_OPTIONAL_LOCKS'] = '0'
    $info.EnvironmentVariables['GIT_PAGER'] = 'cat'
    $info.EnvironmentVariables['GH_PAGER'] = 'cat'
    if ($script:S.Options.NonInteractive -or $script:S.Options.DryRun) {
        $info.EnvironmentVariables['GIT_TERMINAL_PROMPT'] = '0'
        $info.EnvironmentVariables['GCM_INTERACTIVE'] = 'Never'
        if (-not $info.EnvironmentVariables['GIT_SSH_COMMAND']) {
            $info.EnvironmentVariables['GIT_SSH_COMMAND'] = 'ssh -oBatchMode=yes'
        }
    }
    foreach ($key in $EnvironmentOverrides.Keys) {
        $info.EnvironmentVariables[$key] = [string]$EnvironmentOverrides[$key]
    }
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $info
    $started = $false
    $clock = [Diagnostics.Stopwatch]::StartNew()
    try {
        if (-not $process.Start()) { throw "Nie uruchomiono: $Executable" }
        $started = $true
        # Oba strumienie czytane jednocześnie: stderr nie jest błędem PowerShell,
        # a zapełniony bufor stderr nie blokuje czytania stdout.
        $outTask = $process.StandardOutput.ReadToEndAsync()
        $errTask = $process.StandardError.ReadToEndAsync()
        $writeFailure = ''
        if ($InputText.Length -gt 0) {
            $bytes = $script:S.Utf8.GetBytes($InputText)
            $writeTask = $process.StandardInput.BaseStream.WriteAsync($bytes, 0, $bytes.Length)
            try {
                $remaining = [int][Math]::Max(1, $TimeoutSeconds * 1000 - $clock.ElapsedMilliseconds)
                if (-not $writeTask.Wait($remaining)) {
                    Stop-NativeProcessTree $process
                    throw 'Przekroczono limit zapisu do stdin procesu.'
                }
                $writeTask.GetAwaiter().GetResult()
            } catch { $writeFailure = $_.Exception.Message }
        }
        try { $process.StandardInput.Close() } catch { $writeFailure = $_.Exception.Message }
        $remaining = [int][Math]::Max(1, $TimeoutSeconds * 1000 - $clock.ElapsedMilliseconds)
        if (-not $process.WaitForExit($remaining)) {
            Stop-NativeProcessTree $process
            throw "Przekroczono limit ${TimeoutSeconds}s: $([IO.Path]::GetFileName($Executable)). Stan operacji może być częściowy; sprawdź log przed ponowieniem."
        }
        $remaining = [int][Math]::Max(1, $TimeoutSeconds * 1000 - $clock.ElapsedMilliseconds)
        if (-not $outTask.Wait($remaining) -or -not $errTask.Wait($remaining)) {
            throw 'Nie zamknięto strumieni procesu (możliwy hook z procesem potomnym). Sprawdź stan operacji.'
        }
        if ($writeFailure -and $process.ExitCode -eq 0) { throw "Nie przekazano całych danych do procesu: $writeFailure" }
        return [pscustomobject]@{
            ExitCode = $process.ExitCode
            StdOut = $outTask.GetAwaiter().GetResult()
            StdErr = $errTask.GetAwaiter().GetResult()
        }
    } finally {
        if ($started -and -not $process.HasExited) { Stop-NativeProcessTree $process }
        $process.Dispose()
    }
}

function Stop-NativeProcessTree {
    param([System.Diagnostics.Process]$Process)
    try {
        if ($Process.HasExited) { return }
        $killTree = $Process.GetType().GetMethod('Kill', [type[]]@([bool]))
        if ($null -ne $killTree) {
            [void]$killTree.Invoke($Process, @($true))
        } elseif ($env:OS -eq 'Windows_NT') {
            $killer = New-Object System.Diagnostics.ProcessStartInfo
            $killer.FileName = Join-Path $env:SystemRoot 'System32\taskkill.exe'
            $killer.Arguments = '/PID ' + $Process.Id + ' /T /F'
            $killer.UseShellExecute = $false
            $killer.CreateNoWindow = $true
            $killer.RedirectStandardOutput = $true
            $killer.RedirectStandardError = $true
            $child = [Diagnostics.Process]::Start($killer)
            try {
                $null = $child.StandardOutput.ReadToEndAsync()
                $null = $child.StandardError.ReadToEndAsync()
                [void]$child.WaitForExit(5000)
            } finally { $child.Dispose() }
        } else { $Process.Kill() }
    } catch { try { $Process.Kill() } catch {} }
}

function Assert-ExitCode {
    param($Result, [string]$Operation, [int[]]$Allowed = @(0))
    if ($Allowed -notcontains $Result.ExitCode) {
        $detail = ($Result.StdErr + "`n" + $Result.StdOut).Trim()
        if ($detail.Length -gt 12000) { $detail = $detail.Substring(0, 12000) + ' ...' }
        throw ("{0} (exit {1}).`n{2}" -f $Operation, $Result.ExitCode, (Protect-LogText $detail))
    }
}

function Invoke-Git {
    param([string[]]$Arguments, [string]$InputText = '', [switch]$Network, [switch]$Mutating, [int[]]$Allowed = @(0))
    if ($Mutating -and $script:S.Options.DryRun) {
        throw 'Błąd wewnętrzny: zablokowano modyfikujące polecenie Git w DryRun.'
    }
    $all = @('-c', 'core.quotePath=false', '-c', 'core.fsmonitor=false') + $script:S.GitContext
    if ($Network -and $script:S.Protocol -eq 'Https') {
        # Poświadczenia TEGO SAMEGO gh, który tworzy repo. Bez zmian globalnego Git.
        $helperPath = $script:S.GhExe.Replace('\', '/')
        $shellQuoted = "'" + $helperPath.Replace("'", "'\''") + "'"
        $all += @('-c', 'credential.helper=', '-c', "credential.helper=!$shellQuoted auth git-credential")
    }
    $all += $Arguments
    Write-PublishLog 'CMD' ('git ' + ($Arguments -join ' ')) -FileOnly
    $result = Invoke-NativeProcess -Executable $script:S.GitExe -Arguments $all -InputText $InputText
    Assert-ExitCode $result ('git ' + ($Arguments -join ' ')) $Allowed
    if ($Mutating) {
        if ($result.StdOut.Trim()) { Write-PublishLog 'GIT' $result.StdOut.Trim() -FileOnly }
        if ($result.StdErr.Trim()) { Write-PublishLog 'GIT' $result.StdErr.Trim() -FileOnly }
    }
    return $result
}

function Get-NulRecords {
    param([AllowEmptyString()][string]$Text)
    if ($Text.Length -eq 0) { return }
    foreach ($part in $Text.Split([char]0)) { if ($part.Length -gt 0) { $part } }
}

function Get-AbsolutePath {
    param([string]$Path)
    if ([IO.Path]::IsPathRooted($Path)) { return [IO.Path]::GetFullPath($Path) }
    return [IO.Path]::GetFullPath((Join-Path $script:S.Root $Path))
}

function Test-PathInsideRoot {
    param([string]$Path)
    $rootPrefix = $script:S.Root.TrimEnd([char[]]'\/') + [IO.Path]::DirectorySeparatorChar
    $full = Get-AbsolutePath $Path
    return ($full.Equals($script:S.Root, $script:S.PathComparison) -or
        $full.StartsWith($rootPrefix, $script:S.PathComparison))
}

function Get-RepoIdentity {
    param([string]$Url)
    $candidate = $Url.Trim()
    if ($candidate -match '^https://github\.com/([^/\s]+)/([^/\s]+)/?$') {
        $ownerPart = $Matches[1]; $repoPart = $Matches[2]
    } elseif ($candidate -match '^git@github\.com:([^/\s]+)/([^/\s]+)/?$') {
        $ownerPart = $Matches[1]; $repoPart = $Matches[2]
    } elseif ($candidate -match '^ssh://git@github\.com(?::22)?/([^/\s]+)/([^/\s]+)/?$') {
        $ownerPart = $Matches[1]; $repoPart = $Matches[2]
    } else { return '' }
    $repoPart = $repoPart -replace '\.git$', ''
    if ($ownerPart -notmatch '^[A-Za-z0-9-]+$' -or $repoPart -notmatch '^[A-Za-z0-9_.-]+$') { return '' }
    return "$ownerPart/$repoPart".ToLowerInvariant()
}

function Get-ValidRepoName {
    param([string]$ExplicitName, [string]$FolderName)
    if ($ExplicitName) {
        $name = $ExplicitName
    } else {
        $name = $FolderName.Replace('ł', 'l').Replace('Ł', 'L').Normalize([Text.NormalizationForm]::FormD)
        $name = $name -replace '\p{Mn}', '' -replace '\s+', '-' -replace '[^A-Za-z0-9_.-]', ''
        $name = $name.Trim([char[]]'.-')
        if ($name.Length -gt 100) { $name = $name.Substring(0, 100).TrimEnd([char[]]'.-') }
        if ($name -cne $FolderName) { Write-PublishLog 'WARN' "Nazwa folderu -> nazwa repo: '$name'. Możesz ją ustawić przez -RepoName." }
    }
    if ($name.Length -lt 1 -or $name.Length -gt 100 -or $name -notmatch '^[A-Za-z0-9_.-]+$' -or
        $name -in @('.', '..', '.git')) {
        throw 'Nieprawidłowa nazwa repo. Podaj -RepoName: 1-100 znaków A-Z, a-z, 0-9, _, -, kropka.'
    }
    return $name
}

function Get-GitHubApi {
    param([string]$Endpoint, [switch]$Allow404)
    for ($attempt = 1; $attempt -le $script:S.Options.NetworkAttempts; $attempt++) {
        $result = Invoke-NativeProcess -Executable $script:S.GhExe -TimeoutSeconds 90 -Arguments @(
            'api', '--hostname', 'github.com', '--method', 'GET', '--include', $Endpoint)
        $httpMatches = [regex]::Matches($result.StdOut, '(?m)^HTTP/\S+\s+(\d{3})[^\r\n]*\r?$')
        $status = 0; $body = ''
        if ($httpMatches.Count -gt 0) {
            $last = $httpMatches[$httpMatches.Count - 1]
            $status = [int]$last.Groups[1].Value
            $tail = $result.StdOut.Substring($last.Index)
            $separator = [regex]::Match($tail, '\r?\n\r?\n')
            if ($separator.Success) { $body = $tail.Substring($separator.Index + $separator.Length).Trim() }
        }
        if ($status -eq 404 -and $Allow404) { return $null }
        if ($result.ExitCode -eq 0 -and $status -ge 200 -and $status -lt 300) {
            try { return ($body | ConvertFrom-Json -ErrorAction Stop) }
            catch { throw "Nieprawidłowy JSON odpowiedzi GitHub dla $Endpoint." }
        }
        $transient = ($status -in @(429, 500, 502, 503, 504)) -or
            ($status -eq 0 -and ($result.StdErr -match '(?i)timeout|timed out|connection reset|temporary failure|no such host|TLS handshake|EOF'))
        if ($transient -and $attempt -lt $script:S.Options.NetworkAttempts) {
            Write-PublishLog 'WARN' "Przejściowy błąd odczytu GitHub (HTTP $status). Ponawiam odczyt $($attempt + 1)/$($script:S.Options.NetworkAttempts)."
            Start-Sleep -Seconds ([Math]::Min(8, [Math]::Pow(2, $attempt - 1)))
            continue
        }
        $detail = Protect-LogText (($result.StdErr + "`n" + $body).Trim())
        throw "Nie udało się odczytać GitHub API ($Endpoint, HTTP $status, exit $($result.ExitCode)). Nie uznaję tego za brak repo.`n$detail`nSprawdź: gh auth status --hostname github.com; uprawnienia tokenu, SSO oraz sieć."
    }
}

function Assert-RepositoryMetadata {
    param($Metadata)
    if ($Metadata.full_name -ine $script:S.FullName) { throw "API wskazuje inne repo: $($Metadata.full_name). Podaj właściwe -Org/-RepoName." }
    if ($Metadata.archived -or $Metadata.disabled) { throw 'Repo jest zarchiwizowane albo wyłączone.' }
    if (($null -ne $Metadata.permissions) -and -not $Metadata.permissions.push) { throw 'Brak uprawnienia push do repozytorium.' }
    $actual = if ($Metadata.PSObject.Properties['visibility']) { [string]$Metadata.visibility } elseif ($Metadata.private) { 'private' } else { 'public' }
    if ($actual -ne $script:S.Visibility) {
        throw "Repo jest $actual, a wybrano $($script:S.Visibility). Skrypt nie zmienia widoczności. Podaj świadomie -$actual albo wybierz inne repo."
    }
}

function Get-OriginState {
    $remotes = (Invoke-Git @('remote')).StdOut -split '\r?\n'
    if ($remotes -notcontains 'origin') { return [pscustomobject]@{ Exists = $false; Matches = $false; FetchUrls = @(); PushUrls = @() } }
    $fetchUrls = @((Invoke-Git @('remote', 'get-url', '--all', 'origin')).StdOut.Trim() -split '\r?\n')
    $pushUrls = @((Invoke-Git @('remote', 'get-url', '--push', '--all', 'origin')).StdOut.Trim() -split '\r?\n')
    $same = ($fetchUrls.Count -eq 1 -and $pushUrls.Count -eq 1)
    foreach ($url in ($fetchUrls + $pushUrls)) {
        if ((Get-RepoIdentity $url) -ine $script:S.FullName) { $same = $false }
    }
    $mirror = Invoke-Git @('config', '--bool', '--get', 'remote.origin.mirror') -Allowed @(0, 1)
    if ($mirror.ExitCode -eq 0 -and $mirror.StdOut.Trim() -eq 'true') {
        throw 'origin ma mirror=true. Publikator nie obsługuje mirror; sprawdź konfigurację ręcznie.'
    }
    return [pscustomobject]@{ Exists = $true; Matches = $same; FetchUrls = $fetchUrls; PushUrls = $pushUrls }
}

function Assert-GitWorkTree {
    $check = Invoke-Git @('rev-parse', '--is-inside-work-tree') -Allowed @(0, 128)
    if ($check.ExitCode -ne 0) {
        if ($check.StdErr -notmatch 'not a git repository' -or (Test-Path -LiteralPath (Join-Path $script:S.Root '.git'))) {
            throw "Nie można bezpiecznie otworzyć repo Git.`n$($check.StdErr)"
        }
        return $false
    }
    if ($check.StdOut.Trim() -ne 'true') { throw 'To nie jest katalog roboczy Git (np. repo bare).' }
    $top = Get-AbsolutePath ((Invoke-Git @('rev-parse', '--show-toplevel')).StdOut.Trim())
    if (-not $top.TrimEnd([char[]]'\/').Equals($script:S.Root.TrimEnd([char[]]'\/'), $script:S.PathComparison)) {
        throw "Bieżący folder należy do nadrzędnego repo: $top. Uruchom skrypt w jego katalogu głównym albo przenieś projekt poza to repo."
    }
    if ((Invoke-Git @('rev-parse', '--is-shallow-repository')).StdOut.Trim() -eq 'true') {
        throw 'Repo shallow wymaga ręcznej obsługi; publikator sprawdza pełną historię gałęzi.'
    }
    $partial = Invoke-Git @('config', '--get', 'extensions.partialClone') -Allowed @(0, 1)
    $promisor = Invoke-Git @('config', '--get-regexp', '^remote\..*\.promisor$') -Allowed @(0, 1)
    if ($partial.ExitCode -eq 0 -or $promisor.StdOut -match '(?im)\s+(true|1|yes|on)\s*$') {
        throw 'Repo partial clone wymaga ręcznej obsługi. Odczyt brakujących obiektów mógłby pobierać dane i zmieniać repo także podczas DryRun.'
    }
    if ((Invoke-Git @('replace', '--list')).StdOut.Trim()) {
        throw 'Repo ma replacement refs. Nie oceniam automatycznie zmodyfikowanego widoku historii.'
    }
    $gitDir = (Invoke-Git @('rev-parse', '--absolute-git-dir')).StdOut.Trim()
    foreach ($marker in @('MERGE_HEAD', 'CHERRY_PICK_HEAD', 'REVERT_HEAD', 'rebase-merge', 'rebase-apply', 'sequencer', 'BISECT_LOG', 'index.lock')) {
        if (Test-Path -LiteralPath (Join-Path $gitDir $marker)) { throw "Niezakończona operacja Git lub blokada: $marker. Najpierw ją wyjaśnij; nie usuwam blokad." }
    }
    $unmerged = (Invoke-Git @('ls-files', '--unmerged', '-z')).StdOut
    if ($unmerged.Length -gt 0) { throw 'Indeks zawiera nierozwiązane konflikty.' }
    $flags = @(Get-NulRecords ((Invoke-Git @('ls-files', '-v', '-z')).StdOut))
    foreach ($entry in $flags) {
        if ($entry[0] -ceq 'S' -or [char]::IsLower($entry[0])) {
            throw 'Wykryto skip-worktree / assume-unchanged (np. sparse checkout). Skrypt nie obiecuje publikacji całego folderu w tym trybie.'
        }
    }
    return $true
}

function Get-HeadOid {
    $head = Invoke-Git @('rev-parse', '--verify', '--quiet', 'HEAD') -Allowed @(0, 1)
    if ($head.ExitCode -eq 0) { return $head.StdOut.Trim() }
    return ''
}

function Get-BlobMetadata {
    param([string[]]$ObjectIds)
    if ($ObjectIds.Count -eq 0) { return }
    $unique = @($ObjectIds | Select-Object -Unique)
    $text = (Invoke-Git @('cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)') -InputText (($unique -join "`n") + "`n")).StdOut
    foreach ($line in ($text -split '\r?\n')) {
        if (-not $line) { continue }
        if ($line -notmatch '^([0-9a-f]{40,64}) (blob|tree|commit|tag) ([0-9]+)$') { throw "Nie można odczytać obiektu Git: $line" }
        [pscustomobject]@{ Oid = $Matches[1]; Type = $Matches[2]; Size = [long]$Matches[3] }
    }
}

function Assert-HistorySize {
    param([string]$Head)
    if (-not $Head) { return }
    Write-PublishLog 'INFO' 'Sprawdzam obiekty w historii publikowanej gałęzi (nie tylko pliki na dysku).'
    $ids = @((Invoke-Git @('rev-list', '--objects', '--no-object-names', $Head)).StdOut -split '\r?\n' | Where-Object { $_ })
    $bad = @(Get-BlobMetadata $ids | Where-Object { $_.Type -eq 'blob' -and $_.Size -gt 100MB })
    if ($bad.Count -gt 0) {
        $sample = ($bad | Select-Object -First 5 | ForEach-Object { '{0} ({1:N2} MiB)' -f $_.Oid, ($_.Size / 1MB) }) -join '; '
        throw "Historia zawiera obiekty >100 MiB: $sample. Sam .gitignore lub git lfs track nie naprawi historii. Wykonaj kopię i świadomą migrację (git lfs migrate / git filter-repo). Nie przepisuję historii automatycznie. Identyfikacja: git log --all --find-object=<OID>"
    }
}

function Assert-SafeCandidatePath {
    param([string]$RelativePath)
    if ($RelativePath -match '[\r\n\x00]' -or [IO.Path]::IsPathRooted($RelativePath) -or $RelativePath -match '(^|/)\.\.(/|$)') {
        throw "Nieobsługiwana nazwa ścieżki: $RelativePath"
    }
    $full = Get-AbsolutePath $RelativePath
    if (-not (Test-PathInsideRoot $full)) { throw "Ścieżka wychodzi poza projekt: $RelativePath" }
    $cursor = $full
    while ($cursor -and -not $cursor.Equals($script:S.Root, $script:S.PathComparison)) {
        if ($script:S.CheckedPaths.Add($cursor) -and (Test-Path -LiteralPath $cursor)) {
            $item = Get-Item -LiteralPath $cursor -Force -ErrorAction Stop
            if (($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) {
                throw "Link symboliczny/junction wymaga ręcznej obsługi: $RelativePath. Nie podążam za linkami."
            }
            if ($item.PSIsContainer -and (Test-Path -LiteralPath (Join-Path $cursor '.git'))) {
                throw "Zagnieżdżone repo lub submodule: $RelativePath. Nie zamieniam go automatycznie w zwykłe pliki."
            }
        }
        $cursor = [IO.Path]::GetDirectoryName($cursor.TrimEnd([char[]]'\/'))
    }
}

function Get-CandidateFiles {
    $paths = @(Get-NulRecords ((Invoke-Git @('ls-files', '--cached', '--others', '--exclude-standard', '-z')).StdOut))
    $seen = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
    foreach ($path in $paths) {
        if (-not $seen.Add($path)) { continue }
        Assert-SafeCandidatePath $path
        $full = Get-AbsolutePath $path
        if (-not (Test-Path -LiteralPath $full)) { continue } # usunięcia obsłuży git add -A
        $item = Get-Item -LiteralPath $full -Force -ErrorAction Stop
        if ($item.PSIsContainer) { throw "Git zwrócił katalog zamiast pliku: $path. Sprawdź zagnieżdżone repo/submodule." }
        [pscustomobject]@{ Path = $path; FullPath = $full; Size = [long]$item.Length }
    }
}

function Assert-SensitiveNames {
    param([string[]]$Paths)
    $suspicious = @($Paths | Where-Object {
        $leaf = ($_ -split '/')[-1]
        ($leaf -match '^\.env($|\.)' -and $leaf -notmatch '^\.env\.(example|sample|template)$') -or
        $leaf -match '^(id_rsa|id_dsa|id_ecdsa|id_ed25519|\.netrc|\.npmrc|credentials\.json|publish-to-github\.log)$' -or
        $leaf -match '\.(pfx|p12)$'
    })
    if ($suspicious.Count -gt 0) {
        $list = ($suspicious | Select-Object -First 15) -join ', '
        if (-not $script:S.Options.AllowSensitiveFiles) {
            throw "Potencjalnie poufne pliki: $list. Sprawdź je i usuń z publikacji; .gitignore nie usuwa plików już śledzonych. Tylko po kontroli użyj -AllowSensitiveFiles. To heurystyka nazw, nie skaner sekretów."
        }
        Write-PublishLog 'WARN' "Świadomie dopuszczono potencjalnie poufne pliki: $list"
    }
}

function Get-LfsAttributePaths {
    param([string[]]$Paths, [switch]$Cached)
    if ($Paths.Count -eq 0) { return }
    $cmd = @('check-attr', '-z')
    if ($Cached) { $cmd += '--cached' }
    $cmd += @('--stdin', 'filter')
    $records = @(Get-NulRecords ((Invoke-Git $cmd -InputText (($Paths -join [char]0) + [char]0)).StdOut))
    if ($records.Count % 3 -ne 0) { throw 'Nieprawidłowa odpowiedź git check-attr.' }
    for ($i = 0; $i -lt $records.Count; $i += 3) {
        if ($records[$i + 2] -eq 'lfs') { $records[$i] }
    }
}

function Add-IgnorePaths {
    param([string[]]$Paths)
    $ignorePath = Join-Path $script:S.Root '.gitignore'
    $newLines = New-Object 'System.Collections.Generic.List[string]'
    $existing = if (Test-Path -LiteralPath $ignorePath) { [IO.File]::ReadAllText($ignorePath) -split '\r?\n' } else { @() }
    foreach ($path in $Paths) {
        # Kotwica / + escapowanie znaków glob; [1] nie oznacza klasy znaków.
        $pattern = '/' + [regex]::Replace($path, '([\\*?\[\]#! ])', '\$1')
        if ($existing -cnotcontains $pattern) { $newLines.Add($pattern) }
        # Bez -f: nie niszczymy odmiennej, częściowo zestage'owanej wersji pliku.
        $null = Invoke-Git @('--literal-pathspecs', 'rm', '--cached', '--ignore-unmatch', '--', $path) -Mutating
    }
    if ($newLines.Count -gt 0) {
        [IO.File]::AppendAllText($ignorePath, "`n# publish-to-github: jawnie wybrane pliki`n" + ($newLines -join "`n") + "`n", $script:S.Utf8)
    }
    $ignored = @(Get-NulRecords ((Invoke-Git @('check-ignore', '--no-index', '-z', '--stdin') -InputText (($Paths -join [char]0) + [char]0) -Allowed @(0, 1)).StdOut))
    foreach ($path in $Paths) {
        if ($ignored -cnotcontains $path) { throw "Reguła .gitignore nie wyklucza $path (np. wyjątek w podkatalogu). Popraw reguły ręcznie przed publikacją." }
    }
}

function Initialize-Lfs {
    if ($script:S.LfsReady) { return }
    $versionResult = Invoke-Git @('lfs', 'version') -Allowed @(0, 1)
    if ($versionResult.ExitCode -ne 0) { throw 'Wybrano lub wykryto Git LFS, ale git lfs nie jest dostępny. Zainstaluj Git LFS, sprawdź git lfs version i ponów.' }
    $null = Invoke-Git @('lfs', 'install', '--local') -Mutating
    $script:S.LfsReady = $true
    Write-PublishLog 'INFO' 'Git LFS skonfigurowany lokalnie. Istniejący kolidujący hook nie będzie nadpisany.'
}

function Select-LargeFilePolicy {
    param([string]$Label, [string]$Default, [string[]]$Choices, [bool]$Explicit)
    if ($script:S.Options.NonInteractive -or $script:S.Options.Force -or $script:S.Options.DryRun -or $Explicit) { return $Default }
    Write-Host "$Label -> $($Choices -join ' / ') [domyślnie: $Default]"
    do {
        $choice = (Read-Host 'Wybór').Trim()
        if (-not $choice) { return $Default }
    } while ($Choices -notcontains $choice)
    return $choice
}

function Resolve-LargeFiles {
    param([object[]]$Files)
    if ($script:S.Options.NoLargeFileCheck) {
        Write-PublishLog 'INFO' 'Pominięto raport i wybór polityki; blokada obiektów Git >100 MiB pozostaje aktywna.'
        return
    }
    [long]$total = 0
    foreach ($file in $Files) { $total += $file.Size }
    Write-PublishLog 'INFO' ('Pliki kandydujące: {0}; rozmiar roboczy: {1:N2} MiB (nie rozmiar push).' -f $Files.Count, ($total / 1MB))
    foreach ($file in @($Files | Sort-Object Size -Descending | Select-Object -First $script:S.Options.TopLargestFiles)) {
        Write-PublishLog 'FILE' ('{0:N2} MiB  {1}' -f ($file.Size / 1MB), $file.Path)
    }
    $large = @($Files | Where-Object { $_.Size -gt 50MB })
    $alreadyLfs = @(Get-LfsAttributePaths @($large | ForEach-Object { $_.Path }))
    foreach ($path in $alreadyLfs) { [void]$script:S.LfsPaths.Add($path) }
    $groups = @(
        @{ Label = '>100 MiB'; Items = @($large | Where-Object { $_.Size -gt 100MB -and $alreadyLfs -cnotcontains $_.Path }); Policy = $script:S.Options.LargeFilesOver100MB; Choices = @('LFS', 'Ignore', 'Abort'); Explicit = $script:S.Options.ExplicitOver100 },
        @{ Label = '50-100 MiB'; Items = @($large | Where-Object { $_.Size -le 100MB -and $alreadyLfs -cnotcontains $_.Path }); Policy = $script:S.Options.LargeFiles50To100MB; Choices = @('Git', 'LFS', 'Ignore', 'Abort'); Explicit = $script:S.Options.Explicit50To100 }
    )
    foreach ($group in $groups) {
        if ($group.Items.Count -eq 0) { continue }
        $policy = Select-LargeFilePolicy $group.Label $group.Policy $group.Choices $group.Explicit
        Write-PublishLog 'INFO' "$($group.Label): $($group.Items.Count) plików; decyzja: $policy."
        if ($policy -eq 'Abort') { throw "Wybrano Abort dla plików $($group.Label). Podaj świadomie -LargeFilesOver100MB LFS/Ignore lub odpowiednią opcję dla 50-100 MiB." }
        if ($script:S.Options.DryRun) { continue }
        $paths = @($group.Items | ForEach-Object { $_.Path })
        switch ($policy) {
            'Ignore' { Add-IgnorePaths $paths }
            'LFS' {
                Initialize-Lfs
                foreach ($path in $paths) {
                    $null = Invoke-Git @('lfs', 'track', '--filename', '--', $path) -Mutating
                    [void]$script:S.LfsPaths.Add($path)
                }
            }
        }
    }
}

function Get-IndexEntries {
    $records = @(Get-NulRecords ((Invoke-Git @('ls-files', '--stage', '-z')).StdOut))
    foreach ($record in $records) {
        if ($record -notmatch '(?s)^(\d{6}) ([0-9a-f]{40,64}) ([0-3])\t(.*)$') { throw 'Nieprawidłowa odpowiedź git ls-files --stage.' }
        if ($Matches[3] -ne '0') { throw 'Nierozwiązany konflikt w indeksie.' }
        if ($Matches[1] -eq '160000') { throw "Submodule/gitlink nie jest obsługiwany przez automatyczną publikację: $($Matches[4])" }
        if ($Matches[1] -eq '120000') { throw "Link symboliczny w indeksie wymaga ręcznej obsługi: $($Matches[4])" }
        [pscustomobject]@{ Mode = $Matches[1]; Oid = $Matches[2]; Path = $Matches[4] }
    }
}

function Assert-IndexReady {
    $entries = @(Get-IndexEntries)
    Assert-SensitiveNames @($entries | ForEach-Object { $_.Path })
    $metadata = @(Get-BlobMetadata @($entries | ForEach-Object { $_.Oid }))
    $sizes = @{}
    foreach ($meta in $metadata) { $sizes[$meta.Oid] = $meta.Size }
    foreach ($entry in $entries) {
        if ($sizes[$entry.Oid] -gt 100MB) { throw "Indeks nadal zawiera zwykły obiekt Git >100 MiB: $($entry.Path). Użyj LFS/Ignore; -NoLargeFileCheck nie wyłącza tej blokady." }
    }
    $lfsPaths = @(Get-LfsAttributePaths @($entries | ForEach-Object { $_.Path }) -Cached)
    $lfsSet = New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal)
    foreach ($path in $lfsPaths) { [void]$lfsSet.Add($path) }
    foreach ($entry in $entries) {
        if (-not $lfsSet.Contains($entry.Path)) { continue }
        if ($sizes[$entry.Oid] -gt 1024) { throw "Plik oznaczony LFS nie jest wskaźnikiem w indeksie: $($entry.Path). Sprawdź filtry LFS i wykonaj git add --renormalize." }
        $pointer = (Invoke-Git @('cat-file', 'blob', $entry.Oid)).StdOut
        if ($pointer -notmatch '\Aversion https://git-lfs.github.com/spec/v1\n(?:ext-[^\n]+\n)*oid sha256:[a-f0-9]{64}\nsize [0-9]+\n?\z') {
            throw "Nieprawidłowy wskaźnik LFS w indeksie: $($entry.Path). Nie wysyłam surowej zawartości zamiast wskaźnika."
        }
    }
    return $entries.Count
}

function Write-ProjectDefaults {
    if (-not $script:S.Options.NoGitIgnore -and -not (Test-Path -LiteralPath (Join-Path $script:S.Root '.gitignore'))) {
        $template = @'
# publish-to-github: dostosuj do projektu; nie usuwa plików już śledzonych
node_modules/
vendor/
dist/
build/
out/
bin/
obj/
.next/
.nuxt/
.gradle/
.vs/
.idea/
*.log
.env
.env.*
!.env.example
!.env.sample
!.env.template
__pycache__/
*.py[cod]
.venv/
venv/
coverage/
.coverage
*.user
*.suo
Thumbs.db
.DS_Store
tmp/
temp/
local.properties
'@
        [IO.File]::WriteAllText((Join-Path $script:S.Root '.gitignore'), $template + "`n", $script:S.Utf8)
        Write-PublishLog 'INFO' 'Utworzono domyślny .gitignore. Sprawdź wzorce bin/, vendor/, build/ pod kątem własnych źródeł.'
    }
    if ($script:S.Options.GenerateReadme -and -not (Test-Path -LiteralPath (Join-Path $script:S.Root 'README.md'))) {
        $desc = if ($script:S.Options.Description) { $script:S.Options.Description } else { 'Uzupełnij opis projektu.' }
        [IO.File]::WriteAllText((Join-Path $script:S.Root 'README.md'), "# $($script:S.Name)`n`n$desc`n`n## Uruchomienie`n`nUzupełnij instrukcję uruchomienia.`n", $script:S.Utf8)
    }
}

function Assert-GitIdentity {
    foreach ($key in @('user.name', 'user.email')) {
        $value = Invoke-Git @('config', '--get', $key) -Allowed @(0, 1)
        if ($value.ExitCode -eq 0 -and $value.StdOut.Trim()) { continue }
        if ($script:S.Options.NonInteractive -or $script:S.Options.DryRun) {
            throw "Brak git $key. Ustaw jawnie: git config --global $key `"wartość`" (albo lokalnie w istniejącym repo)."
        }
        $newValue = (Read-Host "Podaj $key (zapis tylko w tym repo)").Trim()
        if (-not $newValue) { throw "Nie podano $key." }
        $null = Invoke-Git @('config', '--local', $key, $newValue) -Mutating
    }
}

function Assert-RemoteAncestry {
    param([string]$Url, [string]$Head)
    $refs = (Invoke-Git @('ls-remote', '--heads', '--', $Url) -Network).StdOut
    if ($refs.Trim() -and -not $Head) { throw 'Repo zdalne ma już historię, a lokalne nie. Najpierw sklonuj repo i przenieś do niego pliki.' }
    $targetRef = 'refs/heads/' + $script:S.Branch
    $remoteHead = ''
    foreach ($line in ($refs -split '\r?\n')) {
        $parts = $line -split "`t", 2
        if ($parts.Count -eq 2 -and $parts[1] -ceq $targetRef) { $remoteHead = $parts[0] }
    }
    if (-not $remoteHead -or $remoteHead -eq $Head) { return }
    $known = Invoke-Git @('cat-file', '-e', "${remoteHead}^{commit}") -Allowed @(0, 1, 128)
    if ($known.ExitCode -ne 0) {
        if ($script:S.Options.DryRun) {
            Write-PublishLog 'DRY' 'Brak zdalnego commita lokalnie. Weryfikacja wspólnej historii wymaga fetch i odbędzie się dopiero przy właściwym uruchomieniu.'
            return
        }
        $null = Invoke-Git @('fetch', '--no-tags', '--no-recurse-submodules', '--', $Url, $targetRef) -Network -Mutating
        # Zdalna gałąź mogła się przesunąć między ls-remote a fetch.
        $remoteHead = (Invoke-Git @('rev-parse', '--verify', 'FETCH_HEAD')).StdOut.Trim()
    }
    $ancestor = Invoke-Git @('merge-base', '--is-ancestor', $remoteHead, $Head) -Allowed @(0, 1)
    if ($ancestor.ExitCode -ne 0) {
        throw 'Zdalna gałąź zawiera inną/nowszą historię (non-fast-forward). Najpierw świadomie wykonaj fetch i merge/rebase. Nie wykonuję automatycznego pull ani force-push.'
    }
}

function Set-VerifiedOrigin {
    $origin = Get-OriginState
    if (-not $origin.Exists) {
        $null = Invoke-Git @('remote', 'add', 'origin', $script:S.TargetUrl) -Mutating
    } elseif (-not $origin.Matches) {
        if (-not $script:S.Options.ReplaceOrigin) { throw 'origin nie wskazuje wybranego repo. Wymagana osobna zgoda -ReplaceOrigin.' }
        $null = Invoke-Git @('config', '--local', '--replace-all', 'remote.origin.url', $script:S.TargetUrl) -Mutating
        $null = Invoke-Git @('config', '--local', '--unset-all', 'remote.origin.pushurl') -Mutating -Allowed @(0, 5)
    }
    $verified = Get-OriginState
    if (-not $verified.Matches) {
        throw 'Efektywny fetch/push URL origin nadal wskazuje inne repo lub wiele adresów. Sprawdź pushurl i url.*.insteadOf/pushInsteadOf. Nie wysyłam danych.'
    }
}

function Initialize-PublishState {
    param([hashtable]$Options)
    $location = Get-Location
    if ($location.Provider.Name -ne 'FileSystem') { throw 'Uruchom skrypt w katalogu systemu plików.' }
    $root = [IO.Path]::GetFullPath($location.ProviderPath)
    $comparison = if ($env:OS -eq 'Windows_NT') { [StringComparison]::OrdinalIgnoreCase } else { [StringComparison]::Ordinal }
    $comparer = if ($env:OS -eq 'Windows_NT') { [StringComparer]::OrdinalIgnoreCase } else { [StringComparer]::Ordinal }
    $script:S = @{
        Options = $Options; Root = $root; PathComparison = $comparison
        Utf8 = (New-Object Text.UTF8Encoding($false)); LogReady = $false; LogPath = ''
        GitExe = ''; GhExe = ''; GitContext = @(); TempRepo = ''; Phase = 'kontrola wstępna'
        FullName = ''; Name = ''; Branch = ''; Visibility = ''; Protocol = ''; TargetUrl = ''
        LfsReady = $false; LfsPaths = (New-Object 'System.Collections.Generic.HashSet[string]' ([StringComparer]::Ordinal))
        CheckedPaths = (New-Object 'System.Collections.Generic.HashSet[string]' $comparer)
        CreatedRemote = $false; CreatedLocal = $false; CreatedCommit = $false
    }
}

function Invoke-PublishMain {
    $o = $script:S.Options
    if ($o.Public -and $o.Private) { throw 'Nie można jednocześnie podać -Public i -Private.' }
    if ($o.Org -and $o.Org -notmatch '^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$') { throw 'Nieprawidłowa wartość -Org.' }
    if ($script:S.Root.TrimEnd([char[]]'\/') -eq [IO.Path]::GetPathRoot($script:S.Root).TrimEnd([char[]]'\/')) { throw 'Nie publikuj katalogu głównego dysku.' }
    foreach ($key in @('GIT_DIR', 'GIT_WORK_TREE', 'GIT_INDEX_FILE', 'GIT_COMMON_DIR', 'GIT_OBJECT_DIRECTORY', 'GIT_ALTERNATE_OBJECT_DIRECTORIES')) {
        if ([Environment]::GetEnvironmentVariable($key)) { throw "Zmienna środowiskowa $key zmienia kontekst Git. Usuń ją z tej sesji przed publikacją." }
    }
    if (((Get-Item -LiteralPath $script:S.Root -Force).Attributes -band [IO.FileAttributes]::ReparsePoint) -ne 0) { throw 'Bieżący katalog jest linkiem/junction. Użyj rzeczywistego katalogu projektu.' }
    foreach ($exe in @('git', 'gh')) {
        $found = Get-Command $exe -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
        if (-not $found) { throw "Nie znaleziono $exe. Zainstaluj Git for Windows i GitHub CLI oraz otwórz nowy terminal." }
        if ($exe -eq 'git') { $script:S.GitExe = $found.Source } else { $script:S.GhExe = $found.Source }
    }
    $gitVersion = (Invoke-Git @('--version')).StdOut.Trim()
    if ($gitVersion -notmatch '(\d+)\.(\d+)\.(\d+)' -or [version]$Matches[0] -lt [version]'2.30.0') { throw 'Wymagany Git 2.30 lub nowszy.' }
    $script:S.Name = Get-ValidRepoName $o.RepoName (Split-Path -Leaf $script:S.Root)
    $script:S.Visibility = if ($o.Public) { 'public' } else { 'private' }
    if ($o.LogFile) {
        $script:S.LogPath = Get-AbsolutePath $o.LogFile
        if (Test-PathInsideRoot $script:S.LogPath) { throw 'Log musi leżeć poza projektem, aby nie trafił do commita. Pomiń -LogFile lub podaj zewnętrzną ścieżkę.' }
    } else {
        $logBase = [Environment]::GetFolderPath('LocalApplicationData')
        if (-not $logBase) { $logBase = [IO.Path]::GetTempPath() }
        $logDir = Join-Path $logBase 'GitHubPublisher/logs'
        $script:S.LogPath = Join-Path $logDir ('{0}-{1:yyyyMMdd-HHmmss}-{2}.log' -f $script:S.Name, (Get-Date), ([guid]::NewGuid().ToString('N').Substring(0, 8)))
    }
    if (Test-PathInsideRoot $script:S.LogPath) { throw 'Wybrana/domyslna lokalizacja logu jest wewnątrz projektu. Podaj -LogFile ze ścieżką poza projektem.' }
    if (-not $o.DryRun) {
        try {
            [void][IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($script:S.LogPath))
            [IO.File]::AppendAllText($script:S.LogPath, '', $script:S.Utf8)
            $script:S.LogReady = $true
        } catch { Write-Warning "Log niedostępny, kontynuuję z diagnostyką w konsoli: $($_.Exception.Message)" }
    }
    Write-PublishLog 'INFO' "publish-to-github v5.0 | $gitVersion | PowerShell $($PSVersionTable.PSVersion)"
    Write-PublishLog 'INFO' "Folder: $($script:S.Root)"
    if (-not $o.DryRun) { Write-PublishLog 'INFO' "Log: $($script:S.LogPath)" }
    $isRepo = Assert-GitWorkTree
    $head = ''
    $origin = [pscustomobject]@{ Exists = $false; Matches = $false; FetchUrls = @(); PushUrls = @() }
    if ($isRepo) {
        $head = Get-HeadOid
        $branchResult = Invoke-Git @('symbolic-ref', '--quiet', '--short', 'HEAD') -Allowed @(0, 1)
        if ($branchResult.ExitCode -ne 0) { throw 'Detached HEAD. Najpierw przełącz się świadomie na gałąź.' }
        $script:S.Branch = $branchResult.StdOut.Trim()
        if ($o.Branch -and $o.Branch -cne $script:S.Branch) { throw "Bieżąca gałąź: $($script:S.Branch), żądana: $($o.Branch). Skrypt nie zmienia ani nie nadpisuje gałęzi; przełącz ją ręcznie." }
        $null = @(Get-IndexEntries) # wykrywa gitlink jeszcze przed zapisem
        Assert-HistorySize $head
    } else { $script:S.Branch = if ($o.Branch) { $o.Branch } else { 'main' } }
    $null = Invoke-Git @('check-ref-format', '--branch', $script:S.Branch)
    $user = Get-GitHubApi 'user'
    if (-not $user.login) { throw 'GitHub API nie zwróciło loginu. Sprawdź gh auth status.' }
    $owner = if ($o.Org) { $o.Org } else { [string]$user.login }
    $script:S.FullName = "$owner/$($script:S.Name)"
    if ($isRepo) { $origin = Get-OriginState }
    if ($origin.Exists -and -not $origin.Matches -and -not $o.ReplaceOrigin) {
        throw "origin lub jego pushurl nie wskazuje $($script:S.FullName). Efektywny push: $($origin.PushUrls -join ', '). Zmień -Org/-RepoName albo świadomie podaj -ReplaceOrigin. -Force nie omija tej blokady."
    }
    if ($o.GitProtocol -ne 'Auto') { $script:S.Protocol = $o.GitProtocol }
    elseif ($origin.Matches -and $origin.PushUrls[0] -notmatch '^https://') { $script:S.Protocol = 'Ssh' }
    elseif ($origin.Matches) { $script:S.Protocol = 'Https' }
    else {
        $protocolResult = Invoke-NativeProcess -Executable $script:S.GhExe -Arguments @('config', 'get', 'git_protocol', '--host', 'github.com')
        $script:S.Protocol = if ($protocolResult.ExitCode -eq 0 -and $protocolResult.StdOut.Trim() -eq 'ssh') { 'Ssh' } else { 'Https' }
    }
    $script:S.TargetUrl = if ($script:S.Protocol -eq 'Ssh') { "git@github.com:$($script:S.FullName).git" } else { "https://github.com/$($script:S.FullName).git" }
    # Istniejący poprawny origin zachowuje swój protokół; jawna sprzeczność wymaga ręcznej zmiany.
    if ($origin.Matches) {
        $existingProtocol = if ($origin.PushUrls[0] -match '^https://') { 'Https' } else { 'Ssh' }
        if ($o.GitProtocol -ne 'Auto' -and $existingProtocol -ne $script:S.Protocol) { throw 'GitProtocol różni się od poprawnego origin. Zmień URL origin ręcznie albo użyj -GitProtocol Auto.' }
        $script:S.TargetUrl = $origin.PushUrls[0]
    }
    Write-PublishLog 'INFO' "Cel: $($script:S.FullName) | $($script:S.Visibility) | gałąź: $($script:S.Branch) | $($script:S.Protocol)"
    $repo = Get-GitHubApi "repos/$($script:S.FullName)" -Allow404
    if ($null -ne $repo) {
        Assert-RepositoryMetadata $repo
        if (-not $origin.Matches -and -not ($o.AllowExistingRepo -or $o.Force)) { throw 'Repo już istnieje. Do świadomego użycia podaj -AllowExistingRepo (lub zgodnościowe -Force).' }
        Assert-RemoteAncestry $script:S.TargetUrl $head
    } else {
        Write-PublishLog 'INFO' 'API zwróciło 404: repo nie istnieje lub token go nie widzi. Próba utworzenia będzie osobnym krokiem; inne błędy nie są traktowane jako brak repo.'
    }
    if ($o.DryRun) {
        if (-not $isRepo) {
            $script:S.TempRepo = Join-Path ([IO.Path]::GetTempPath()) ('gh-publisher-dry-' + [guid]::NewGuid().ToString('N'))
            if (Test-PathInsideRoot $script:S.TempRepo) {
                $script:S.TempRepo = ''
                throw 'Systemowy TEMP leży wewnątrz projektu. Zmień TEMP/TMP na lokalizację zewnętrzną przed DryRun.'
            }
            # Jedyny zapis DryRun: kontekst techniczny poza projektem, usuwany w finally.
            $init = Invoke-NativeProcess -Executable $script:S.GitExe -Arguments @('init', '--bare', '--quiet', $script:S.TempRepo)
            Assert-ExitCode $init 'Inicjalizacja tymczasowego kontekstu analizy'
            $script:S.GitContext = @('--git-dir', $script:S.TempRepo, '--work-tree', $script:S.Root)
        }
        Assert-GitIdentity
        Write-PublishLog 'DRY' 'Analiza według istniejących reguł ignorowania. Planowane .gitignore/README nie są zapisywane ani symulowane w liście plików.'
        $files = @(Get-CandidateFiles)
        Assert-SensitiveNames @($files | ForEach-Object { $_.Path })
        Resolve-LargeFiles $files
        Write-PublishLog 'DRY' "Plan: przygotować .gitignore/README według opcji, git add -A, commit w razie zmian (pusty tylko pierwszy), utworzyć/użyć repo i push gałęzi $($script:S.Branch)."
        Write-PublishLog 'DRY' 'Podgląd zakończony. Projekt, logi publikatora i GitHub nie zostały zmienione. Filtry, hooki, pełna kontrola indeksu i push nie były wykonywane.'
        return
    }
    Write-PublishLog 'WARN' 'Publikacja obejmie wszystkie nieignorowane zmiany, usunięcia i historię bieżącej gałęzi. To nie jest skan sekretów w historii.'
    if (-not ($o.NonInteractive -or $o.Force)) {
        $answer = Read-Host "Publikować do $($script:S.FullName) ($($script:S.Visibility))? [t/N]"
        if ($answer -notmatch '^(t|tak|y|yes)$') { throw 'Przerwano przez użytkownika.' }
    }
    $script:S.Phase = 'przygotowanie lokalne'
    if (-not $isRepo) {
        $null = Invoke-Git @('init', '--initial-branch', $script:S.Branch, '.') -Mutating
        $script:S.CreatedLocal = $true
        $null = Assert-GitWorkTree # ponowna kontrola po init, także wobec odziedziczonej konfiguracji
    }
    Assert-GitIdentity
    Write-ProjectDefaults
    $files = @(Get-CandidateFiles)
    Assert-SensitiveNames @($files | ForEach-Object { $_.Path })
    Resolve-LargeFiles $files
    # LFS działa także dla małych plików i przy -NoLargeFileCheck.
    $effectiveAfterPolicy = @(Get-CandidateFiles)
    foreach ($lfsPath in @(Get-LfsAttributePaths @($effectiveAfterPolicy | ForEach-Object { $_.Path }))) {
        [void]$script:S.LfsPaths.Add($lfsPath)
    }
    if ($script:S.LfsPaths.Count -gt 0) { Initialize-Lfs }
    $script:S.Phase = 'indeks i commit'
    $null = Invoke-Git @('add', '--all', '--', '.') -Mutating
    if ($script:S.LfsPaths.Count -gt 0) {
        $null = Invoke-Git @('--literal-pathspecs', 'add', '--renormalize', '--pathspec-from-file=-', '--pathspec-file-nul') -InputText ((@($script:S.LfsPaths) -join [char]0) + [char]0) -Mutating
    }
    $null = Assert-IndexReady
    $changes = Invoke-Git @('diff', '--cached', '--quiet', '--exit-code') -Allowed @(0, 1)
    if (-not $head -or $changes.ExitCode -eq 1) {
        $commitArgs = @('commit', '-m', $o.CommitMessage)
        if (-not $head) { $commitArgs += '--allow-empty' }
        $null = Invoke-Git $commitArgs -Mutating
        $script:S.CreatedCommit = $true
    } else { Write-PublishLog 'INFO' 'Brak zmian do commitowania; sprawdzam możliwość ponowienia push.' }
    $newHead = Get-HeadOid
    if (-not $newHead) { throw 'Brak commita po przygotowaniu repo.' }
    # Hook commit może zmienić indeks lub pozostawić nowe zmiany: nie udajemy pełnego sukcesu.
    $status = (Invoke-Git @('status', '--porcelain=v1', '-z', '--untracked-files=normal')).StdOut
    if ($status.Length -gt 0) { throw 'Po commit repo nie jest czyste (np. hook zmienił pliki). Sprawdź git status; nie wykonano push.' }
    $null = Assert-IndexReady
    Assert-HistorySize $newHead
    if ($script:S.LfsReady) { $null = Invoke-Git @('lfs', 'fsck', '--pointers', 'HEAD') }
    $script:S.Phase = 'utworzenie repo GitHub'
    if ($null -eq $repo) {
        $createArgs = @('repo', 'create', $script:S.FullName, ('--' + $script:S.Visibility))
        if ($o.Description) { $createArgs += @('--description', $o.Description) }
        # Nie ponawiamy operacji zapisu: timeout może oznaczać, że repo już utworzono.
        $create = Invoke-NativeProcess -Executable $script:S.GhExe -Arguments $createArgs
        if ($create.ExitCode -ne 0) {
            throw "Utworzenie repo nie zostało potwierdzone (exit $($create.ExitCode)). Repo mogło powstać. Sprawdź je; po weryfikacji ponów z -AllowExistingRepo.`n$($create.StdErr)"
        }
        $script:S.CreatedRemote = $true
        $repo = Get-GitHubApi "repos/$($script:S.FullName)"
        Assert-RepositoryMetadata $repo
    }
    $script:S.Phase = 'weryfikacja celu i push'
    Set-VerifiedOrigin
    $beforePushOrigin = Get-OriginState
    if (-not $beforePushOrigin.Matches) { throw 'origin zmienił się w trakcie pracy. Nie wykonano push.' }
    Assert-RemoteAncestry $beforePushOrigin.PushUrls[0] $newHead
    $currentBranch = (Invoke-Git @('symbolic-ref', '--quiet', '--short', 'HEAD')).StdOut.Trim()
    if ($currentBranch -cne $script:S.Branch -or (Get-HeadOid) -ne $newHead) {
        throw 'Gałąź lub HEAD zmieniły się w trakcie publikacji. Nie wykonano push.'
    }
    # Jawna referencja + wyłączone automatyczne tagi. Nigdy --force / --mirror.
    $null = Invoke-Git @('-c', 'push.followTags=false', 'push', '--no-follow-tags', '--recurse-submodules=no', '--set-upstream', 'origin', ("HEAD:refs/heads/" + $script:S.Branch)) -Network -Mutating
    Write-PublishLog 'OK' "Gotowe: https://github.com/$($script:S.FullName) (gałąź $($script:S.Branch))."
}

# Entry point. Funkcje są wydzielone, aby testy mogły je załadować przez AST bez uruchamiania publikacji.
$ErrorActionPreference = 'Stop'
$options = @{
    Public = $Public.IsPresent; Private = $Private.IsPresent; Description = $Description
    Org = $Org; RepoName = $RepoName; NoGitIgnore = $NoGitIgnore.IsPresent
    CommitMessage = $CommitMessage; Force = $Force.IsPresent; TopLargestFiles = $TopLargestFiles
    NonInteractive = $NonInteractive.IsPresent; LargeFiles50To100MB = $LargeFiles50To100MB
    LargeFilesOver100MB = $LargeFilesOver100MB; LogFile = $LogFile; DryRun = $DryRun.IsPresent
    GenerateReadme = $GenerateReadme.IsPresent; NoLargeFileCheck = $NoLargeFileCheck.IsPresent
    AllowExistingRepo = $AllowExistingRepo.IsPresent; ReplaceOrigin = $ReplaceOrigin.IsPresent
    AllowSensitiveFiles = $AllowSensitiveFiles.IsPresent; Branch = $Branch; GitProtocol = $GitProtocol
    CommandTimeoutSeconds = $CommandTimeoutSeconds; NetworkAttempts = $NetworkAttempts
    ExplicitOver100 = $PSBoundParameters.ContainsKey('LargeFilesOver100MB')
    Explicit50To100 = $PSBoundParameters.ContainsKey('LargeFiles50To100MB')
}
$exitCode = 0
try {
    Initialize-PublishState $options
    Invoke-PublishMain
} catch {
    $exitCode = 1
    $stateVariable = Get-Variable -Name S -Scope Script -ErrorAction SilentlyContinue
    if ($stateVariable -and $null -ne $stateVariable.Value) {
        Write-PublishLog 'ERR' ("Etap: $($script:S.Phase). " + $_.Exception.Message)
        Write-PublishLog 'ERR' $_.ScriptStackTrace -FileOnly
        if ($script:S.CreatedLocal -or $script:S.CreatedCommit -or $script:S.CreatedRemote) {
            Write-PublishLog 'WARN' "Pozostawiono wykonane kroki: git init=$($script:S.CreatedLocal), commit=$($script:S.CreatedCommit), repo GitHub=$($script:S.CreatedRemote). Nie usuwam danych i nie cofam historii."
        }
    } else { Write-Host ('[ERR] ' + $_.Exception.Message) }
} finally {
    $stateVariable = Get-Variable -Name S -Scope Script -ErrorAction SilentlyContinue
    if ($stateVariable -and $script:S.TempRepo -and (Test-Path -LiteralPath $script:S.TempRepo)) {
        try { Remove-Item -LiteralPath $script:S.TempRepo -Recurse -Force -ErrorAction Stop }
        catch { Write-Warning "Nie usunięto technicznego TEMP: $($script:S.TempRepo)" }
    }
}
exit $exitCode
