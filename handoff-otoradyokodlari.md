# active-memory handoff: Oto Radyo Kodları – web sitesi + Android uygulaması

**Handoff #1** · 2026-11-06 · Lineage: #1 (2026-11-06): site düzeltildi, TR/EN Android uygulaması (Capacitor) yapıldı, AdMob eklendi, Google Play güncellemesi için Windows derleme betiği hazırlandı

## 0. Instructions for Claude (read first)

You are continuing work from a previous chat. That chat is gone; this file is the complete context and the source of truth.

1. Read this whole file before replying.
2. Follow sections 3 (Style), 4 (Hard rules) and 5 (Corrections) in every reply, for the rest of this chat. They override your defaults.
3. Use the values in section 8 exactly. Never round, re-estimate, or "correct" them.
4. Do not suggest anything listed in section 7 (Changed / rejected) again unless the user brings it up.
5. Code word: None active. If the user types /amcodeword, start every reply with the phrase they choose (default "Yes Boss!").
6. Your first reply: at most 5 lines covering the goal, the current state, and the next step (section 11). Mention any files from section 13 that were not attached. Ask the questions in section 12 if there are any. End with "Ready to continue with <next step>?" Then wait for the user's go.

## 1. Mission
- **Goal:** Araç radyo/teyp açılış kodu bulan uygulamayı (TR/EN, telefon + tablet uyumlu, modern, üretici logosu olmayan) Google Play'de yayınlamak ve güncel tutmak; kod verisi GitHub'dan okunuyor.
- **Done looks like:** Google Play'deki uygulamanın yeni sürümünde banner + geçiş reklamı, geri tuşu davranışı, Hizmetler sekmeleri ve yeni tasarım çalışıyor.
- **Why it matters / context:** Kullanıcı Play'e yeni sürüm yükledi ama reklam çıkmadı; sebep, Play'e yüklenen sürümün GitHub'daki güncel projeden değil, bilgisayarındaki eski/ayrı klasörden derlenmiş olması.

## 2. About the user (as relevant to this work)
- GitHub: `cematil`, depo `cematil/otoradyokodlari`. Windows kullanıyor, kullanıcı klasörü `C:\Users\GaMeGaRaJ`.
- Android Studio, Node.js, Git kurulu (aynı klasörde `cepteradar`, `cepteuydu` gibi başka uygulamaları da var).
- Teknik değil; çok adımlı talimatlardan yoruluyor ("beynimi yaktın"). İşi onun yerine yapmanı / tek komuta indirmeni istiyor.
- PR'ları genelde kendisi birleştiriyor; #6'yı "Bu dal main'e birleştir" deyince Claude birleştirdi.

## 3. Style & communication
- **Language:** Türkçe yanıt. Kod yorumları ve commit mesajları da Türkçe.
- **Tone:** Sade, samimi, kısa; teknik jargon az.
- **Reply length:** Kısa. Adım sayısını en aza indir; mümkünse tek kopyala-yapıştır komut ver.
- **Formatting:** Kısa başlıklar, numaralı adımlar, gerekirse küçük tablo; komutlar kod bloğunda.
- **Working style:** Önce kontrol et, sonra yap; yasal/telif riski olan şeyde önce açıkla ("ilk önce onu söyle" istedi). PR'ı sadece istenince aç.
- **Avoid:** Uzun teknik açıklamalar, kullanıcıya çok sayıda manuel adım bırakmak, şifre/anahtarı sohbete yazdırmak.

## 4. Hard rules (word for word)
1. "telifle ilgili sorunlar yaşamak istemiyorum" → uygulamada üretici logosu YOK; markalar özgün harf rozetleriyle (VW, Fo, Re…) gösteriliyor; korsan/crack program listesi yok.
2. "türkçe ve ingilizce iki dilli" uygulama; "her telefon tablet cihazla tam uyumlu"; "bilgilerin githubtan kullanıldığı".
3. "dediğin gibi bizim için olumlu sonuç olacak şekilde yapalım kötü olan şeyleri kaldıralım" (dosya/program listeleri yerine desteklenen teyp modelleri).
4. Precode girişi: "1 harf 3 rakam diyor o şekilde yazılsın … diğer araçlar içinde kaç rakam kaç harf isteniyorsa ona göre yazılsın bazı özel araçlar kodları hariç".
5. Geri tuşu: "ana sayfada değilse … çıkmasın anasayfaya gelsin ama ana sayfada geriye basarsa uygulamadan çıksın".
6. Hizmetler başlıkları: "İlk Harfler Büyük Düzenli Ve Alt Alta"; Hakkında'dan veri kaynağı kaldırılacak.
7. Reklamlar: banner + "kod girildikten sonra" geçiş reklamı.

## 5. Corrections log
| # | Claude did | The user wanted |
|---|---|---|
| 1 | Hizmet kartları yan yana, küçük harfli başlıklar | Başlıklar büyük harfle başlasın, kartlar alt alta |
| 2 | Hakkında'da veri kaynağı (GitHub adresi) vardı | Kaldırılsın |
| 3 | Seri no alanına sınırsız karakter yazılabiliyordu (B5353535) | Modele göre harf/rakam maskesi (Renault: 1 harf + 3 rakam) |
| 4 | Telefonun geri tuşu uygulamadan çıkıyordu | Ana sayfa dışında ana sayfaya dön, ana sayfada çık |
| 5 | Uygulamada reklam kodu hiç yoktu | AdMob banner + geçiş reklamı |
| 6 | (Önceki tur) ana sayfada "geri" butonu görünüyordu, EN'de "1 models" yazıyordu | Düzeltildi |

## 6. Decisions
| Decision | Why |
|---|---|
| Uygulama = Capacitor 8 (webDir `app/`), Android projesi `android/` | Web kodunu Play'e taşımak, veri GitHub'dan |
| Kod verisi `data/<model>/<son2karakter>.json` parçaları, raw.githubusercontent.com → jsDelivr yedek | Küçük indirme, mağaza güncellemesi gerektirmeden veri güncelleme |
| Paket adı `com.otoradyokodlari.app` | Play'deki mevcut uygulamayla aynı |
| Geçiş reklamı kod gösterilmeden önce, en fazla 60 sn'de bir | Google politika + kullanıcı deneyimi |
| AdMob yalnızca Android'de; web sitesinde reklam yok | AdMob native |
| Desteklenen Teypler: 158 temiz model adı (`tools/supported_radios.json`) | Dosya/dump dağıtımı riskli |
| Kod Hesaplayıcılar sekmesi: uygulamanın kendi 35 hesaplayıcısı + uzman desteği listesi | Üçüncü taraf/crack program adları kaldırıldı |
| Sürüm kodu: bilgisayarda varsayılan 6 (1.2.0); GitHub Actions 100 + çalışma numarası | Play'deki son sürüm 5 |

## 7. Changed / rejected
- ❌ Program adlarını marka gizleyerek kısaltmak ("Ford" → "F.exe") (hukuki riski azaltmaz, gizleme gibi görünür; kullanıcı kabul etti)
- ❌ EEPROM dump dosya adlarını ve .exe/.rar program listesini (CalcGEN_2009_crk.exe dahil) göstermek (Play fikri mülkiyet politikası) → temiz model listesi + sitenin kendi hesaplayıcı linkleri
- `d.py` (fetch tabanlı eski üretici) → `e.py` kullanılıyor; d.py çalıştırılmamalı
- Uygulama sürüm kodu varsayılan 1 → 6
- Web sitesine reklam ❌

## 8. Data & facts (exact)
| Ad | Değer |
|---|---|
| WhatsApp | 905074377818 |
| AdMob uygulama kimliği | ca-app-pub-2830351264097967~8949754793 |
| Banner reklam birimi ("Banner Alt") | ca-app-pub-2830351264097967/2520077819 |
| Geçiş reklam birimi ("Gecis Kod Bulma") | ca-app-pub-2830351264097967/6267751134 |
| Geçiş reklamı aralığı | 60 sn (`interstitialMinIntervalSec`) |
| Paket adı | com.otoradyokodlari.app |
| Play'deki son sürüm | versionCode 5, versionName "1.1.2" |
| Yeni yerel sürüm | versionCode 6, versionName "1.2.0" |
| Capacitor | @capacitor/core/cli/android ^8.5.2, @capacitor/app ^8.1.2, @capacitor-community/admob ^8.3.0 |
| Android SDK | compile/target 36, min 24 |
| Veri | 1.213.386 kod, 42 model, 17 marka, 158 desteklenen teyp |
| İmza anahtarı (kullanıcının PC'si) | `C:\Users\GaMeGaRaJ\radyokodlari` (uzantısız; SHA1 henüz doğrulanmadı) |
| Kullanıcının eski proje klasörü | `C:\Users\GaMeGaRaJ\otoradyokodlari` (git DEĞİL, `app\js` yok, admob_app_id yok, `_yedek_v1.0` alt klasörü var) |
| GitHub Secrets adları | ANDROID_KEYSTORE_BASE64, ANDROID_KEYSTORE_PASSWORD, ANDROID_KEY_ALIAS, ANDROID_KEY_PASSWORD (kurulup kurulmadığı bilinmiyor) |
| Anahtar şifresi | [secret removed: re-enter it] (sohbete asla yazdırma) |

## 9. People, terms & names
- **People:** cematil (kullanıcı, depo sahibi)
- **Terms & nicknames:** "precode" = Renault/Dacia 1 harf + 3 rakam ön kod; "dump" = EEPROM çip dökümü; "Kodlarım" = kayıtlı kodlar sekmesi
- **Names in use:** dal `claude/loving-brahmagupta-kihkgi`; `app/js/app.js`, `app/js/ads.js`, `app/js/i18n.js`, `app/css/app.css`, `app/privacy.html`, `tools/build_app_data.py`, `tools/supported_radios.json`, `tools/windows_build_release.ps1`, `e.py`, `docs/GOOGLE_PLAY.md`, `.github/workflows/android.yml`

## 10. Work state
| Item | Status | Version / location | Notes |
|---|---|---|---|
| Web sitesi düzeltmeleri | final | main (PR #1) | |
| Android uygulaması (TR/EN, maske, rehber, Hizmetler 3 sekme, geri tuşu, AdMob) | final | main (PR #2–#6) | GitHub Actions derlemesi başarılı; gerçek cihazda denenmedi |
| Sürüm kodu düzeltmesi (6 / 1.2.0, CI 100+n) | dalda, main'e birleşmedi | commit 0022919 | |
| Windows tek komutluk derleme betiği | dalda, main'e birleşmedi, Windows'ta denenmedi | commit 43481d2, `tools/windows_build_release.ps1` | Anahtarı yedekler, eski klasörü `_eski_<tarih>` yapar, dalı klonlar, `npm install`, `cap sync`, imzalı AAB'yi Masaüstüne `OtoRadyoKodlari-1.2.0.aab` olarak koyar |
| Bu handoff dosyası | final | `handoff-otoradyokodlari.md` (depo kökü, dalda) | |

Kullanıcıya verilen tek komut (Android Studio kapalıyken PowerShell'de):
```
irm https://raw.githubusercontent.com/cematil/otoradyokodlari/claude/loving-brahmagupta-kihkgi/tools/windows_build_release.ps1 -OutFile $HOME\Downloads\radyo.ps1; powershell -ExecutionPolicy Bypass -File $HOME\Downloads\radyo.ps1
```

## 11. Next steps
1. **Next action:** Kullanıcı yukarıdaki PowerShell komutunu çalıştırsın; HATA çıkarsa çıktısını alıp betiği düzelt. Başarılıysa ekrandaki SHA1'in Play Console › Uygulama bütünlüğü › Uygulama imzalama › "Yükleme anahtarı sertifikası" ile eşleştiğini doğrulat.
2. `OtoRadyoKodlari-1.2.0.aab` dosyasını Play Console › Üretim › Yeni sürüm ile yüklet.
3. Play Console: "Reklam içeriyor: Evet", Reklam kimliği beyanı, Veri güvenliği (AdMob verileri) — ayrıntı `docs/GOOGLE_PLAY.md` bölüm 5–6.
4. AdMob: GDPR mesajı yayınla, kullanıcının telefonunu test cihazı ekle, app-ads.txt.
5. Kullanıcı isterse dalı (0022919, 43481d2) PR ile main'e birleştir.

## 12. Open questions ⚠️
- İmza anahtarı `radyokodlari` gerçekten Play'deki yükleme anahtarı mı? (SHA1 karşılaştırması yapılmadı; değilse Play Console'dan yükleme anahtarı sıfırlama)
- GitHub Secrets kuruldu mu? (kurulursa Actions imzalı AAB üretir; `google-play-aab` artifact)
- Kullanıcının eski yerel klasöründe kendi yaptığı, GitHub'da olmayan önemli değişiklik var mı? (bilinmiyor; klasör `_eski_` adıyla saklanıyor)
- "Desteklenen Teypler" içindeki "Diğer" grubundaki 24 modelin markası bilinmiyor (AKF-0816EY, EC 4200 RDS, Challenge 400 vb.)
- Claude masaüstü Remote Control ile klasör paylaşımı denendi, bulut oturumunda hiç klasör görünmedi.

## 13. Re-attach checklist
- [ ] Gerekirse betik çıktısının ekran görüntüsü/metni (hata olursa)
- Not: Proje dosyalarının hepsi GitHub'da (`cematil/otoradyokodlari`, dal `claude/loving-brahmagupta-kihkgi`); yeni oturumda bu depo ve dal açılmalı.

---
<sub>Audit: 13/13 sections · 7 rules · 6 corrections · 22 data points · secrets removed: yes · generated by active-memory</sub>
