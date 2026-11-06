# Oto Radyo Kodlari - Google Play surumu olusturucu (Windows)
#
# Ne yapar:
#   1. Imza anahtarinizin (radyokodlari) yedegini alir
#   2. Eski proje klasorunu yedek adiyla saklar
#   3. GitHub'daki guncel projeyi indirir ve hazirlar
#   4. Anahtarinizla imzali .aab dosyasini olusturur ve Masaustune koyar
#
# Kullanim: Android Studio'yu kapatin, PowerShell'e su satiri yapistirin:
#   irm https://raw.githubusercontent.com/cematil/otoradyokodlari/claude/loving-brahmagupta-kihkgi/tools/windows_build_release.ps1 -OutFile $HOME\Downloads\radyo.ps1; powershell -ExecutionPolicy Bypass -File $HOME\Downloads\radyo.ps1

param(
    [string]$Keystore = "$HOME\radyokodlari",
    [string]$Branch = "claude/loving-brahmagupta-kihkgi",
    [string]$ProjectDir = "$HOME\otoradyokodlari"
)

$ErrorActionPreference = "Stop"
Set-Location $HOME
$stamp = Get-Date -Format "yyyyMMdd-HHmm"

function Step($msg) { Write-Host ""; Write-Host "==> $msg" -ForegroundColor Cyan }
function Fail($msg) { Write-Host ""; Write-Host "HATA: $msg" -ForegroundColor Red; exit 1 }
function Run($exe, [string[]]$argList) {
    & $exe @argList
    if ($LASTEXITCODE -ne 0) { Fail "'$exe $($argList -join ' ')' basarisiz oldu (kod $LASTEXITCODE)." }
}

# --- Gerekli araclar ---------------------------------------------------------
Step "Gerekli programlar kontrol ediliyor"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { Fail "Git bulunamadi. https://git-scm.com adresinden kurun." }
if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) { Fail "Node.js bulunamadi. https://nodejs.org adresinden LTS surumunu kurun." }

$jbr = "C:\Program Files\Android\Android Studio\jbr"
if (-not (Test-Path "$jbr\bin\java.exe")) { Fail "Android Studio Java'si bulunamadi: $jbr" }
$env:JAVA_HOME = $jbr
$keytool = "$jbr\bin\keytool.exe"

$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" }
if (-not (Test-Path $sdk)) { Fail "Android SDK bulunamadi: $sdk (Android Studio > SDK Manager ile kurun)" }

if (-not (Test-Path $Keystore)) { Fail "Imza anahtari bulunamadi: $Keystore" }

# --- 1. Anahtar yedegi -------------------------------------------------------
Step "Imza anahtari yedekleniyor"
$keyBackup = "$HOME\radyokodlari-yedek-$stamp"
Copy-Item $Keystore $keyBackup
Write-Host "Yedek: $keyBackup  (bunu ayrica USB bellege de kopyalayin)"

# --- 2. Sifre ve anahtar kontrolu --------------------------------------------
Step "Anahtar sifresi"
$sec = Read-Host "Anahtar deposu (keystore) sifresi" -AsSecureString
$storePass = [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
$sec2 = Read-Host "Anahtar sifresi (ayniysa sadece Enter)" -AsSecureString
$keyPass = [Runtime.InteropServices.Marshal]::PtrToStringBSTR([Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec2))
if (-not $keyPass) { $keyPass = $storePass }

# keytool uyarilarini stderr'e yazar; PowerShell 5.1'de bunlar hata sayilmasin
$ErrorActionPreference = "Continue"
$list = & $keytool -list -keystore $Keystore -storepass $storePass 2>&1 | ForEach-Object { "$_" }
$listCode = $LASTEXITCODE
$ErrorActionPreference = "Stop"
if ($listCode -ne 0) { Fail "Anahtar acilamadi. Sifre yanlis olabilir.`n$($list -join "`n")" }
$aliasLine = $list | Where-Object { $_ -match "PrivateKeyEntry" } | Select-Object -First 1
if (-not $aliasLine) { Fail "Anahtar deposunda imza anahtari bulunamadi.`n$list" }
$alias = ($aliasLine -split ",")[0].Trim()

$ErrorActionPreference = "Continue"
$verbose = & $keytool -list -v -keystore $Keystore -storepass $storePass -alias $alias 2>&1 | ForEach-Object { "$_" }
$ErrorActionPreference = "Stop"
$sha1 = ""
$m = $verbose | Select-String -Pattern "SHA1:\s*([0-9A-F:]+)" | Select-Object -First 1
if ($m) { $sha1 = $m.Matches[0].Groups[1].Value }
Write-Host "Anahtar adi (alias): $alias"
Write-Host "SHA1: $sha1"
Write-Host "(Play Console > Uygulama butunlugu > Uygulama imzalama > Yukleme anahtari sertifikasi SHA-1 ile ayni olmali)"

# --- 3. Eski klasoru sakla ---------------------------------------------------
if (Test-Path $ProjectDir) {
    if (Test-Path "$ProjectDir\.git") {
        Step "Mevcut proje guncelleniyor"
        Push-Location $ProjectDir
        Run git @("fetch", "origin", $Branch)
        Run git @("checkout", "-B", $Branch, "origin/$Branch")
        Pop-Location
    } else {
        Step "Eski proje klasoru yedek adiyla saklaniyor"
        $old = "${ProjectDir}_eski_$stamp"
        try { Rename-Item $ProjectDir $old }
        catch { Fail "Eski klasor yeniden adlandirilamadi. Android Studio'yu ve bu klasorde acik pencereleri kapatip tekrar deneyin." }
        Write-Host "Eski klasor: $old"
    }
}

# --- 4. Guncel projeyi indir -------------------------------------------------
if (-not (Test-Path $ProjectDir)) {
    Step "GitHub'dan guncel proje indiriliyor"
    Run git @("clone", "-b", $Branch, "https://github.com/cematil/otoradyokodlari.git", $ProjectDir)
}

Set-Location $ProjectDir

Step "Bagimliliklar kuruluyor (birkac dakika surebilir)"
Run npm.cmd @("install")
Run npx.cmd @("cap", "sync", "android")

"sdk.dir=$($sdk -replace '\\', '\\')" | Set-Content -Encoding ASCII "$ProjectDir\android\local.properties"

# --- 5. Imzali AAB -----------------------------------------------------------
Step "Imzali Google Play paketi (AAB) olusturuluyor"
$env:ANDROID_KEYSTORE_FILE = (Resolve-Path $Keystore).Path
$env:ANDROID_KEYSTORE_PASSWORD = $storePass
$env:ANDROID_KEY_ALIAS = $alias
$env:ANDROID_KEY_PASSWORD = $keyPass
Push-Location "$ProjectDir\android"
try {
    Run ".\gradlew.bat" @("bundleRelease", "--no-daemon")
} finally {
    Pop-Location
    Remove-Item Env:ANDROID_KEYSTORE_PASSWORD, Env:ANDROID_KEY_PASSWORD -ErrorAction SilentlyContinue
}

$aab = Get-ChildItem "$ProjectDir\android\app\build\outputs\bundle\release\*.aab" | Select-Object -First 1
if (-not $aab) { Fail "AAB dosyasi olusmadi." }
$desktop = [Environment]::GetFolderPath("Desktop")
$dest = Join-Path $desktop "OtoRadyoKodlari-1.2.0.aab"
Copy-Item $aab.FullName $dest -Force

Step "TAMAM"
Write-Host "Google Play'e yuklenecek dosya: $dest" -ForegroundColor Green
Write-Host "Play Console > Test ve yayin > Uretim > Yeni surum olustur > bu dosyayi yukleyin."
explorer.exe "/select,`"$dest`""
