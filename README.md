<div align="center">

  <!-- PROJE LOGOSU -->
  <img src="logo.png" alt="Oto Radyo Kodları Logo" width="200" height="200" style="border-radius: 50%;">

  # 🚗 Oto Radyo Kodları & Şifre Çözüm Merkezi

  **Ücretsiz • Hızlı • Güvenilir**

  [![GitHub Stars](https://img.shields.io/github/stars/cematil/otoradyokodlari?style=for-the-badge&color=00d2ff)](https://github.com/cematil/otoradyokodlari)
  [![Status](https://img.shields.io/badge/Status-Active-brightgreen?style=for-the-badge)](https://github.com/cematil/otoradyokodlari)

  Tüm otomobil markalarının fabrika çıkışlı oto teyp ve radyo açılış kodlarını seri numarası veya EEPROM / MCU döküm (dump) dosyaları üzerinden anında sorgulama ve çözme platformu.

</div>

---

## ⚡ Öne Çıkan Özellikler

- **🔥 1.300.000+ Hazır Veritabanı Kodu:** Volkswagen, Ford, Fiat, Renault, Dacia, Opel, Becker, Chrysler, Clarion ve daha fazla marka için devasa kod arşivi.
- **🔬 EEPROM & MCU Çip Döküm Servisi:** Seri numarası silinmiş veya veritabanında bulunmayan teypler için `24C64`, `95320`, `FIS dumps`, `HC11` vb. çip okuma desteği.
- **🖥️ Online Kod Hesaplayıcılar:** Program kurmadan tarayıcıda ve uygulamada çalışan, markaya özel kod hesaplama ve sorgulama sayfaları.
- **🎯 Akıllı Karakter ve Hata Denetimi:** Girilen seri numarası uzunluğunu modele göre otomatik doğrulayan akıllı uyarı sistemi.
- **📻 Teybe Kod Girme Rehberleri:** Her modelin tuş yapısına ve ekranına uygun adım adım kod girme talimatları.
- **📱 Canlı Destek Entegrasyonu:** Özel durumlar ve teknisyenler için doğrudan WhatsApp canlı sorgulama altyapısı.
- **🛡️ Gelişmiş İçerik Koruması:** Sağ tık, DevTools, kaynak kod kopyalama ve resim sürükleme korumalı güvenli mimari.
- **📱 Tam Mobil (Responsive) Uyumluluk:** Cep telefonu, tablet ve masaüstü cihazlarda kusursuz çalışan kullanıcı dostu arayüz.

---

## 🚘 Desteklenen Bazı Marka ve Teyp Sistemleri

| Marka / Sistem | Desteklenen Teyp & Seri Modelleri |
| :--- | :--- |
| **Volkswagen (VW)** | RCD 210, RCD 310, RCD 510, MFD2, Delta 6, Gamma (VWZ...) |
| **Ford** | 6000 CD, Sony CD, TravelPilot (M ve V Serisi) |
| **Fiat & Alfa Romeo** | Daiichi, Visteon, VP1 / VP2, Uconnect |
| **Renault & Dacia** | Tuner List, Update List, Precode Sistemleri |
| **Opel** | CDR 500, CDR 2005, Delco GM, Vivaro / Movano |
| **Becker** | Traffic Pro, Monza, Mexico, 4/6/8-Button & Presets |
| **Chrysler & Jeep** | Alpine AA, Becker T00BE, Preset 5/6, TM9 |
| **Diğer Markalar** | Clarion C7 (Citroen/Peugeot), Delphi/Famar, Alpine/Jaguar |

---

## 📱 Mobil Uygulama (Android / Google Play)

`app/` klasöründe Türkçe ve İngilizce, telefon ve tablet uyumlu bir mobil uygulama bulunur.
Kod veritabanını doğrudan bu GitHub deposundan (`data/` klasörü) okur; yeni kodlar için mağaza güncellemesi gerekmez.

- Tarayıcıda dene: `https://raw.githack.com/cematil/otoradyokodlari/main/app/index.html`
- Veriyi güncelle: `python3 tools/build_app_data.py`
- Android'e dönüştürme, imzalama ve Google Play adımları: [docs/GOOGLE_PLAY.md](docs/GOOGLE_PLAY.md)

---

## 📂 Proje Dosya Yapısı

```text
├── index.html              # Tüm platformu bağlayan ana sayfa
├── app/                    # Mobil uygulama (TR/EN, PWA + Capacitor)
├── data/                   # Uygulamanın GitHub'dan okuduğu parça parça kod verisi
├── android/                # Google Play için Android projesi
├── tools/build_app_data.py # data/ klasörünü üreten betik
├── logo.png                # Platform logosu ve açılış görseli
├── e.py                    # JSON veritabanlarını gömerek HTML sayfalarını üreten betik
├── d.py                    # Eski (fetch tabanlı) üretici, artık kullanılmıyor
├── volkswagen.html         # VW grubu radyo kod çözücü
├── ford_m.html             # Ford M serisi kod çözücü
├── ford_v.html             # Ford V serisi kod çözücü
├── renault.html            # Renault precode çözücü
├── dacia.html              # Dacia precode çözücü
├── fiat_daiichi.html       # Fiat Daiichi kod çözücü
├── becker_4digit.html      # Becker 4-digit kod çözücü
└── ... (34+ Marka HTML Sayfası ve JSON Veritabanı Dosyaları)
```

---

## 🛠️ Sayfaları Yeniden Oluşturma

Veritabanı (`.json`) dosyalarında bir değişiklik yaptıktan sonra kod çözücü sayfalarını yeniden üretmek için:

```bash
python3 e.py
```

> ⚠️ `d.py` sayfaları veritabanını `fetch()` ile yükleyen eski şablonla üretir; mevcut sayfaların üzerine yazacağı için kullanmayın.
