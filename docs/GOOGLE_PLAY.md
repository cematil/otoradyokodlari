# 📱 Uygulamayı Google Play'e Yükleme Rehberi

Bu depo iki parçadan oluşur:

| Parça | Klasör | Açıklama |
| :--- | :--- | :--- |
| Mobil uygulama (web kodu) | `app/` | Türkçe / İngilizce, telefon + tablet uyumlu arayüz |
| Kod veritabanı | `data/` | Uygulamanın GitHub'dan okuduğu parça parça kod dosyaları |
| Android projesi | `android/` | Capacitor ile `app/` klasörünü Android uygulamasına çevirir |
| Veri üretici | `tools/build_app_data.py` | Kökteki `.json` veritabanlarından `data/` klasörünü üretir |

Uygulama **kodları her açılışta GitHub'dan okur**. Yani yeni kod veya model eklemek için
Google Play'e yeni sürüm yüklemeniz gerekmez; GitHub'a göndermeniz yeterlidir.

---

## 1. Kod veritabanını güncelleme

1. Kök dizindeki ilgili `.json` dosyasını düzenleyin (ör. `vw.json`).
2. Yeni bir teyp modeli ekleyecekseniz `tools/build_app_data.py` içindeki `MODELS` listesine ekleyin.
3. Çalıştırın:

   ```bash
   python3 tools/build_app_data.py   # mobil uygulama verisi (data/)
   python3 e.py                      # web sitesi sayfaları (isteğe bağlı)
   ```

4. Değişiklikleri GitHub'a gönderin (`main` dalı). Uygulama birkaç dakika içinde yeni veriyi görür.

## 2. Uygulamayı tarayıcıda deneme

```bash
python3 -m http.server 8080
# Tarayıcıda: http://localhost:8080/app/
```

GitHub'a gönderdikten sonra şu adresten de açılabilir:
`https://raw.githack.com/cematil/otoradyokodlari/main/app/index.html`

## 3. Test APK'sı almak (bilgisayara Android Studio kurmadan)

`main` dalına her gönderimde GitHub Actions otomatik olarak bir **test APK'sı** üretir:

1. GitHub'da depo → **Actions** → **Android** → son çalışmayı açın.
2. Sayfanın altındaki **Artifacts** bölümünden `test-apk` dosyasını indirin.
3. Zip'i açıp `.apk` dosyasını telefonunuza kurun (bilinmeyen kaynaklara izin vermeniz gerekir).

## 4. Google Play için imza anahtarı oluşturma (bir kez)

> ⚠️ Bu anahtarı ve şifrelerini **kaybetmeyin ve asla GitHub'a yüklemeyin**.
> Google Play App Signing kullanacağınız için bu anahtar "yükleme anahtarı" olur.

Java yüklü bir bilgisayarda:

```bash
keytool -genkey -v -keystore upload.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000
base64 -w 0 upload.keystore > upload.keystore.txt   # macOS: base64 -i upload.keystore -o upload.keystore.txt
```

GitHub'da depo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret adı | Değer |
| :--- | :--- |
| `ANDROID_KEYSTORE_BASE64` | `upload.keystore.txt` dosyasının içeriği |
| `ANDROID_KEYSTORE_PASSWORD` | keystore şifresi |
| `ANDROID_KEY_ALIAS` | `upload` |
| `ANDROID_KEY_PASSWORD` | anahtar şifresi |

Bundan sonra Actions çalışmasında ayrıca **`google-play-aab`** dosyası oluşur. Google Play'e yüklenecek dosya budur.
Sürüm numarası (versionCode) her çalışmada otomatik artar.

## 5. Google Play Console adımları

1. <https://play.google.com/console> adresinden geliştirici hesabı açın (tek seferlik 25 $).
   - **Yeni kişisel hesaplar** için Google, yayından önce en az 12 test kullanıcısıyla 14 gün kapalı test şartı arar.
2. **Uygulama oluştur** → Varsayılan dil: Türkçe → Uygulama → Ücretsiz.
3. **Test ve yayın → Kapalı test** ile başlayıp `google-play-aab` içindeki `.aab` dosyasını yükleyin.
4. **Mağaza girişi** (Türkçe ve İngilizce iki dil ekleyin):
   - Kısa açıklama (80 karakter) ve tam açıklama — aşağıdaki örnekleri kullanabilirsiniz.
   - Uygulama simgesi: `app/img/icon-512.png`
   - Telefon ve tablet ekran görüntüleri (uygulamayı açıp ekran görüntüsü alın).
5. **Uygulama içeriği** bölümü:
   - Gizlilik politikası URL'si: GitHub Pages'i açtıktan sonra
     `https://cematil.github.io/otoradyokodlari/app/privacy.html`
     (Settings → Pages → Branch: `main` / root → Save)
   - Reklam: **Hayır**
   - Veri güvenliği: **Veri toplanmıyor / paylaşılmıyor** (uygulama yalnızca cihazda veri saklar)
   - Hedef kitle: 18+ (veya 13+)
   - İçerik derecelendirmesi anketini doldurun (Araçlar / Yardımcı programlar).
6. Kategori: **Otomobiller ve Araçlar**.

### Mağaza metni örnekleri

**TR kısa açıklama:**
Araç teyp ve radyo açılış kodunu seri numarasından bulun. Hızlı, ücretsiz.

**EN short description:**
Find your car radio unlock code from its serial number. Fast and free.

**TR tam açıklama (başlangıç):**
Akü değişimi veya teyp sökümünden sonra radyonuz "CODE" / "SAFE" mi yazıyor?
Oto Radyo Kodları ile markanızı seçin, teyp etiketindeki seri numarasını girin ve açılış kodunu anında öğrenin.
• 1,2 milyondan fazla kod • 17 marka, 40'tan fazla teyp modeli • Renault / Dacia precode hesaplama
• Kodlarınızı kaydetme • Türkçe ve İngilizce • Açık ve koyu tema • EEPROM / çip okuma için uzman desteği

Bu uygulama bağımsızdır; adı geçen otomobil ve teyp üreticileriyle bağlantılı değildir.

## 6. Telif ve marka hakkı – dikkat edilenler

Uygulama bu konuda güvenli olacak şekilde tasarlandı:

- **Hiçbir üretici logosu kullanılmaz.** Markalar, kendi tasarımımız olan harf rozetleri (VW, Fo, Re…) ve
  kendi renk paletimizle gösterilir. Uygulama ikonu da tamamen özgündür.
- Marka adları yalnızca **uyumluluğu belirtmek** için düz metin olarak geçer (hukukta "nominative use").
- Uygulamada ve mağaza açıklamasında "bağımsızdır, üreticilerle bağlantılı değildir" uyarısı bulunur.
- Uygulama adında, ikonunda ve ekran görüntülerinde **marka adı veya logo kullanmayın**
  (ör. "VW Radio Code" gibi bir ad Google tarafından reddedilebilir).
- Resimdeki gibi başka bir uygulamanın tasarımı, renkleri veya metinleri kopyalanmadı; arayüz sıfırdan tasarlandı.
- Kod veritabanlarının kaynağı size aittir; başkasının ücretli veritabanından kopyalanmış veri yayınlamayın.

## 7. İleride eklenebilecekler (öneriler)

- Seri numarasını **kamerayla okuma** (etiket fotoğrafından metin tanıma).
- Bildirimle "yeni marka / model eklendi" duyurusu.
- Uygulama içinde EEPROM döküm dosyası yükleyip WhatsApp yerine form ile gönderme.
- Daha fazla dil (Almanca, Arapça, Rusça) – metinler `app/js/i18n.js` içinde.
