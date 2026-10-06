"""Mobil uygulama için veri üretici.

Kök dizindeki kod veritabanlarını (.json) okur, kodu olmayan kayıtları ayıklar ve
uygulamanın yalnızca ihtiyaç duyduğu küçük parçayı indirebilmesi için her modeli
anahtarın son 2 karakterine göre parçalara (shard) böler.

Çıktı:
    data/catalog.json            -> markalar + modeller (uygulama GitHub'dan okur)
    data/<model_id>/<xx>.json    -> kod parçaları
    app/catalog.json             -> çevrimdışı ilk açılış için gömülü katalog kopyası

Kullanım:
    python3 tools/build_app_data.py
"""

import json
import os
import shutil
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(ROOT, "data")
APP_DIR = os.path.join(ROOT, "app")

SHARD_LEN = 2
PLACEHOLDER_CODES = {"", "NO DATA", "NONE", "XXXX", "NULL"}

# Marka listesi. Telif / marka hakkı sorunu yaşamamak için uygulamada marka
# logoları KULLANILMAZ; her marka kendi tasarımımız olan harf rozeti ve kendi
# renk paletimizle gösterilir. Marka adları yalnızca uyumluluğu belirtmek için
# metin olarak geçer.
BRANDS = [
    {"id": "volkswagen", "name": "Volkswagen", "mono": "VW", "hue": 215, "tags": "vw golf passat polo skoda seat audi"},
    {"id": "ford", "name": "Ford", "mono": "Fo", "hue": 225, "tags": "focus fiesta transit mondeo"},
    {"id": "renault", "name": "Renault", "mono": "Re", "hue": 45, "tags": "clio megane precode"},
    {"id": "dacia", "name": "Dacia", "mono": "Da", "hue": 10, "tags": "duster logan sandero precode"},
    {"id": "fiat", "name": "Fiat", "mono": "Fi", "hue": 350, "tags": "egea doblo punto linea daiichi visteon"},
    {"id": "alfaromeo", "name": "Alfa Romeo", "mono": "AR", "hue": 0, "tags": "alfa giulietta mito 147 156 159"},
    {"id": "opel", "name": "Opel", "mono": "Op", "hue": 50, "tags": "astra corsa vectra vivaro movano delco"},
    {"id": "mercedes", "name": "Mercedes-Benz", "mono": "MB", "hue": 200, "tags": "mercedes citan becker"},
    {"id": "becker", "name": "Becker", "mono": "Be", "hue": 230, "tags": "becker europa mexico traffic pro"},
    {"id": "chrysler", "name": "Chrysler / Jeep / Dodge", "mono": "CJ", "hue": 260, "tags": "chrysler jeep dodge ram voyager"},
    {"id": "jaguar", "name": "Jaguar / Land Rover", "mono": "JL", "hue": 150, "tags": "jaguar land rover alpine"},
    {"id": "peugeot", "name": "Peugeot / Citroën", "mono": "PC", "hue": 190, "tags": "peugeot citroen clarion delphi"},
    {"id": "nissan", "name": "Nissan", "mono": "Ni", "hue": 330, "tags": "nissan clarion"},
    {"id": "honda", "name": "Honda", "mono": "Ho", "hue": 5, "tags": "honda clarion alpine"},
    {"id": "toyota", "name": "Toyota", "mono": "To", "hue": 355, "tags": "toyota"},
    {"id": "hyundai", "name": "Hyundai / Kia", "mono": "HK", "hue": 205, "tags": "hyundai kia"},
    {"id": "bmw", "name": "BMW / Mini", "mono": "BM", "hue": 210, "tags": "bmw mini alpine"},
]

# Modeller. type:
#   "db"        -> kodlar data/<id>/ altındaki parçalardan okunur
#   "renault"   -> precode algoritması ile cihazda hesaplanır (veri gerekmez)
#   "support"   -> çevrimiçi veri yok, WhatsApp desteğine yönlendirilir
MODELS = [
    {
        "id": "vw", "src": "vw.json", "brands": ["volkswagen"],
        "name": {"tr": "VW RCD / MFD / Gamma", "en": "VW RCD / MFD / Gamma"},
        "placeholder": "VWZ2Z2V4000004", "maxLen": 14,
        "units": "RCD 210, RCD 310, RCD 510, MFD2, Delta 6, Gamma",
        "cars": "Golf, Passat, Polo, Jetta, Tiguan, Caddy, Transporter, Amarok, Scirocco",
        "label": {"tr": "14 haneli seri no (VWZ...)", "en": "14-character serial (VWZ...)"},
        "guide": {
            "tr": "1. tuşa 1. rakam görünene kadar basın. 2, 3 ve 4. tuşlarla şifreyi tamamlayıp > / SEEK tuşuna basılı tutun.",
            "en": "Press button 1 until the first digit appears. Complete the code with buttons 2, 3 and 4, then hold > / SEEK.",
        },
    },
    {
        "id": "ford_m", "src": "database_ford_m.json", "brands": ["ford"],
        "name": {"tr": "Ford M Serisi", "en": "Ford M-Series"},
        "placeholder": "M123456", "maxLen": 7,
        "units": "6000 CD, 4500 RDS, Sony CD, Traffic 3000/4000",
        "cars": "Focus, Fiesta, Mondeo, Transit, Courier, Kuga, Ka",
        "label": {"tr": "M ile başlayan 7 haneli seri no", "en": "7-character serial starting with M"},
        "guide": {
            "tr": "1, 2, 3, 4 tuşlarına basarak rakamları seçin. Onaylamak için 5 veya 6 nolu tuşa basılı tutun.",
            "en": "Select each digit with buttons 1, 2, 3, 4. Hold button 5 or 6 to confirm.",
        },
    },
    {
        "id": "ford_v", "src": "database_ford_v.json", "brands": ["ford"],
        "name": {"tr": "Ford V Serisi", "en": "Ford V-Series"},
        "placeholder": "V123456", "maxLen": 7,
        "units": "Sony DAB, 6000CD V-Series, TravelPilot FX/NX",
        "cars": "Focus 2, Fiesta, Mondeo 4, Transit Custom, C-Max, S-Max",
        "label": {"tr": "V ile başlayan 7 haneli seri no", "en": "7-character serial starting with V"},
        "guide": {
            "tr": "1-4 tuşlarını kullanarak rakamları girin. Onaylamak için * veya OK / 5 tuşuna basın.",
            "en": "Enter the digits with buttons 1-4. Press * or OK / 5 to confirm.",
        },
    },
    {
        "id": "renault", "type": "renault", "brands": ["renault"],
        "name": {"tr": "Renault Precode", "en": "Renault Precode"},
        "placeholder": "B564", "maxLen": 4, "mask": "A999",
        "units": "Tuner List, Update List, Plug & Radio, CD Player",
        "cars": "Clio, Megane, Scenic, Kangoo, Laguna, Master, Trafic",
        "label": {"tr": "Precode (1 harf + 3 rakam)", "en": "Precode (1 letter + 3 digits)"},
        "guide": {
            "tr": "Ön tuşlardaki 1-4 tuşlarıyla her haneyi seçin, ardından 6 nolu tuşa bip sesi gelene kadar basılı tutun.",
            "en": "Use preset buttons 1-4 to set each digit, then hold button 6 until you hear a beep.",
        },
        "where": {
            "tr": "Precode, teybin üst veya yan etiketinde 'PRE CODE' yazısının yanında bulunur. Teyp kapalıyken 1 ve 6 tuşlarına birlikte basılı tutarak ekranda da görebilirsiniz.",
            "en": "The precode is printed next to 'PRE CODE' on the radio label. On many units you can also hold buttons 1 and 6 while the radio is off to show it on screen.",
        },
    },
    {
        "id": "dacia", "type": "renault", "brands": ["dacia"],
        "name": {"tr": "Dacia Precode", "en": "Dacia Precode"},
        "placeholder": "A123", "maxLen": 4, "mask": "A999",
        "units": "Plug & Radio, CD Player, Tuner List",
        "cars": "Duster, Logan, Sandero, Dokker, Lodgy",
        "label": {"tr": "Precode (1 harf + 3 rakam)", "en": "Precode (1 letter + 3 digits)"},
        "guide": {
            "tr": "Ön tuşlardaki 1-4 tuşlarıyla her haneyi seçin, ardından 6 nolu tuşa bip sesi gelene kadar basılı tutun.",
            "en": "Use preset buttons 1-4 to set each digit, then hold button 6 until you hear a beep.",
        },
        "where": {
            "tr": "Precode, teybin üst veya yan etiketinde 'PRE CODE' yazısının yanında bulunur. Teyp kapalıyken 1 ve 6 tuşlarına birlikte basılı tutarak ekranda da görebilirsiniz.",
            "en": "The precode is printed next to 'PRE CODE' on the radio label. On many units you can also hold buttons 1 and 6 while the radio is off to show it on screen.",
        },
    },
    {
        "id": "fiat_daiichi", "src": "database_fiat_daiichi.json", "brands": ["fiat"],
        "name": {"tr": "Fiat Daiichi", "en": "Fiat Daiichi"},
        "placeholder": "M123456", "maxLen": 7,
        "units": "Daiichi",
        "cars": "Egea, Fiorino, Doblo, Linea, Punto",
        "label": {"tr": "Seri no veya son 4 hanesi", "en": "Serial or its last 4 digits"},
        "guide": {
            "tr": "Ekranda çıkan sanal klavyeden 4 haneli şifreyi tuşlayın.",
            "en": "Type the 4-digit code on the on-screen keypad.",
        },
    },
    {
        "id": "fiat_visteon", "src": "database_fiat_visteon.json", "brands": ["fiat"],
        "name": {"tr": "Fiat Visteon", "en": "Fiat Visteon"},
        "placeholder": "M012345", "maxLen": 7, "mask": "M999999",
        "units": "Visteon CD / MP3",
        "cars": "Stilo, Punto, Bravo, Doblo",
        "label": {"tr": "M ile başlayan seri no", "en": "Serial starting with M"},
        "guide": {
            "tr": "1-4 tuşlarına basarak rakamları girin, onay için EXPERT / OK tuşuna basılı tutun.",
            "en": "Enter the digits with buttons 1-4 and hold EXPERT / OK to confirm.",
        },
    },
    {
        "id": "delphi_famar", "src": "database_delphi_famar.json", "brands": ["fiat", "opel", "peugeot"],
        "name": {"tr": "Delphi / Famar", "en": "Delphi / Famar"},
        "placeholder": "12345678901234", "maxLen": 14,
        "units": "Delphi Grundig, Famar Fueguina",
        "cars": "Fiat, Opel, Chevrolet, Peugeot, Citroën",
        "label": {"tr": "Seri no veya son 4 hanesi", "en": "Serial or its last 4 digits"},
        "guide": {
            "tr": "Ayar tuşları ile kodu ekrana tuşlayıp OK tuşuna basarak onaylayın.",
            "en": "Enter the code with the tuning buttons and press OK to confirm.",
        },
    },
    {
        "id": "alfa_radio", "src": "fiat_daiichi_alfa_radio_sonuclari.json", "brands": ["alfaromeo", "fiat"],
        "name": {"tr": "Alfa Romeo / Fiat Radio", "en": "Alfa Romeo / Fiat Radio"},
        "placeholder": "12345", "maxLen": 5,
        "units": "Daiichi / Bosch Alfa Radio",
        "cars": "Alfa Romeo 147, 156, 159, MiTo, Giulietta",
        "label": {"tr": "Seri no veya son 4 hanesi", "en": "Serial or its last 4 digits"},
        "guide": {
            "tr": "Ekrandaki 4 haneli şifre alanına kodu girip onaylayın.",
            "en": "Enter the code in the 4-digit field on screen and confirm.",
        },
    },
    {
        "id": "alfa_vp", "src": "fiat_daiichi_alfa_radio_vp1_vp2.json", "brands": ["fiat", "alfaromeo"],
        "name": {"tr": "VP1 / VP2 (Uconnect)", "en": "VP1 / VP2 (Uconnect)"},
        "placeholder": "A1234", "maxLen": 5,
        "units": "VP1, VP2, Uconnect 5",
        "cars": "Fiat 500L, 500X, Egea, Alfa Romeo Giulietta",
        "label": {"tr": "Seri no veya son 4 hanesi", "en": "Serial or its last 4 digits"},
        "guide": {
            "tr": "Dokunmatik ekrandaki tuş takımını kullanarak kodu girin.",
            "en": "Enter the code using the touchscreen keypad.",
        },
    },
    {
        "id": "opel_vivaro_movano", "src": "database_opel_vivaro_movano.json", "brands": ["opel"],
        "name": {"tr": "Opel Vivaro / Movano", "en": "Opel Vivaro / Movano"},
        "placeholder": "A123", "maxLen": 4,
        "units": "CD18, CD20, CD30, Navi 50 / 80",
        "cars": "Vivaro A/B, Movano A/B",
        "label": {"tr": "Precode / seri no", "en": "Precode / serial"},
        "guide": {
            "tr": "1-4 tuşlarıyla rakamları seçip 6 nolu tuşa basılı tutun.",
            "en": "Set the digits with buttons 1-4 and hold button 6.",
        },
    },
    {
        "id": "opel_delco", "type": "support", "brands": ["opel"],
        "name": {"tr": "Opel Delco (CDR 500 / 2005)", "en": "Opel Delco (CDR 500 / 2005)"},
        "units": "CDR 500, CDR 2005, Delco Electronics",
        "cars": "Astra G, Corsa B/C, Vectra B, Omega, Zafira A",
    },
    {
        "id": "mercedes_citan", "src": "database_mercedes_citan.json", "brands": ["mercedes"],
        "name": {"tr": "Mercedes-Benz Citan", "en": "Mercedes-Benz Citan"},
        "placeholder": "A123", "maxLen": 4,
        "units": "Citan (Renault tabanlı)",
        "cars": "Citan",
        "label": {"tr": "Precode / seri no", "en": "Precode / serial"},
        "guide": {
            "tr": "Sağ arama düğmesini çevirerek rakamları seçin ve tıklayarak onaylayın.",
            "en": "Turn the right-hand knob to choose each digit and press it to confirm.",
        },
    },
]

BECKER_GUIDE = {
    "tr": "Preset tuşlarıyla her haneyi seçin ve onay tuşuna basılı tutarak teybi açın.",
    "en": "Set each digit with the preset buttons and hold the confirm button to unlock.",
}
for mid, src, tr, en, max_len, cars in [
    ("becker_4digit", "becker_4digit.json", "Becker 4 Haneli", "Becker 4-Digit", 4, "Mercedes-Benz, Porsche, Ferrari, Audi, Rover"),
    ("becker_db_4digit", "database_becker_4digit.json", "Becker 4 Haneli (Veritabanı 2)", "Becker 4-Digit (Database 2)", 4, "Mercedes-Benz, Porsche, Ferrari, Maserati"),
    ("becker_4button", "becker_4button.json", "Becker 4 Tuşlu", "Becker 4-Button", 4, "Mercedes-Benz, Porsche, BMW, Ferrari"),
    ("becker_6buttons", "becker_6buttons.json", "Becker 6 Tuşlu", "Becker 6-Button", 4, "Mercedes-Benz W210, W208 CLK, W163 ML, Porsche Boxster"),
    ("becker_8button", "becker_8button.json", "Becker 8 Tuşlu", "Becker 8-Button", 4, "Mercedes C/E-Class, SLK, Porsche"),
    ("becker_4presets", "database_becker_4presets.json", "Becker 4 Preset", "Becker 4 Presets", 4, "Mercedes-Benz W124, W201, Porsche"),
    ("becker_5presets", "database_becker_5presets.json", "Becker 5 Preset", "Becker 5 Presets", 5, "Mercedes W126, R129 SL"),
    ("becker_6presets", "database_becker_6presets.json", "Becker 6 Preset", "Becker 6 Presets", 4, "Mercedes-Benz W202, W210, R170 SLK"),
    ("becker_7presets", "database_becker_7presets.json", "Becker 7 Preset", "Becker 7 Presets", 4, "Mercedes-Benz, BMW E36/E34"),
    ("becker_8presets", "database_becker_8presets.json", "Becker 8 Preset", "Becker 8 Presets", 4, "Mercedes-Benz, Porsche 911/996"),
    ("becker_9presets", "database_becker_9presets.json", "Becker 9 Preset", "Becker 9 Presets", 4, "Mercedes S-Class, CL-Class"),
]:
    MODELS.append({
        "id": mid, "src": src, "brands": ["becker", "mercedes"],
        "name": {"tr": tr, "en": en},
        "placeholder": "1234"[:max_len] if max_len <= 4 else "12345", "maxLen": max_len,
        "units": "Becker Europa, Grand Prix, Mexico, Traffic Pro", "cars": cars,
        "label": {"tr": "Becker seri no (son 4 hane)", "en": "Becker serial (last 4 digits)"},
        "guide": BECKER_GUIDE,
    })

CHRYSLER_GUIDE = {
    "tr": "Radyo tuşlarıyla kodu sırayla girin; kod doğruysa teyp hemen açılır.",
    "en": "Enter the code in order with the radio buttons; the radio unlocks right away if it is correct.",
}
for mid, src, tr, en, ph, max_len, label_tr, label_en in [
    ("chrysler_alpine_aa", "chrysler_4digits_aa_alpine_sonuclari.json", "Alpine (AA)", "Alpine (AA)", "1234", 4, "Seri no son 4 hane", "Last 4 digits of serial"),
    ("chrysler_t00be", "chrysler_4digits_t00be_beker_sonuclari.json", "Becker T00BE", "Becker T00BE", "T00BE123456789", 14, "T00BE ile başlayan seri no", "Serial starting with T00BE"),
    ("chrysler_preset5", "chrysler_5digits_preset5_sonuclari.json", "Preset 5", "Preset 5", "12345", 5, "5 haneli seri no", "5-digit serial"),
    ("chrysler_preset6", "chrysler_5digits_preset6_sonuclari.json", "Preset 6", "Preset 6", "12345", 5, "5 haneli seri no", "5-digit serial"),
    ("chrysler_tm9", "chrysler_last4digit_tm9_sonuclari.json", "TM9", "TM9", "1234", 4, "TM9 seri no son 4 hane", "Last 4 digits of TM9 serial"),
    ("chrysler_db_5presets", "database_chrysler_5presets.json", "5 Preset (Veritabanı 2)", "5 Presets (Database 2)", "12345", 5, "5 haneli seri no", "5-digit serial"),
    ("chrysler_db_6presets", "database_chrysler_6presets.json", "6 Preset (Veritabanı 2)", "6 Presets (Database 2)", "12345", 5, "5 haneli seri no", "5-digit serial"),
    ("chrysler_db_alpine", "database_chrysler_alpine.json", "Alpine (Veritabanı 2)", "Alpine (Database 2)", "1234", 4, "Seri no son 4 hane", "Last 4 digits of serial"),
    ("chrysler_db_becker", "database_chrysler_becker.json", "Becker (Veritabanı 2)", "Becker (Database 2)", "T00BE123456789", 14, "T00BE ile başlayan seri no", "Serial starting with T00BE"),
    ("chrysler_db_tm9", "database_chrysler_tm9.json", "TM9 (Veritabanı 2)", "TM9 (Database 2)", "1234", 4, "TM9 seri no son 4 hane", "Last 4 digits of TM9 serial"),
]:
    MODELS.append({
        "id": mid, "src": src, "brands": ["chrysler"],
        "name": {"tr": "Chrysler " + tr, "en": "Chrysler " + en},
        "placeholder": ph, "maxLen": max_len,
        "units": "Chrysler / Jeep / Dodge", "cars": "300C, Voyager, PT Cruiser, Grand Cherokee, Wrangler, Caravan",
        "label": {"tr": label_tr, "en": label_en},
        "guide": CHRYSLER_GUIDE,
    })

MODELS += [
    {
        "id": "alpine_jaguar", "src": "database_alpine_jaguar.json", "brands": ["jaguar", "honda", "bmw"],
        "name": {"tr": "Alpine (Jaguar / Land Rover)", "en": "Alpine (Jaguar / Land Rover)"},
        "placeholder": "JA12345678", "maxLen": 10,
        "units": "Alpine", "cars": "Jaguar XJ, X-Type, S-Type, Land Rover",
        "label": {"tr": "Seri no veya son 5 hanesi", "en": "Serial or its last 5 digits"},
        "guide": {
            "tr": "Numara tuşları ile 4 haneli kodu girip MODE / P.SCAN tuşu ile onaylayın.",
            "en": "Enter the 4-digit code with the number buttons and confirm with MODE / P.SCAN.",
        },
    },
    {
        "id": "clarion_c7", "src": "database_clarion_c7.json", "brands": ["peugeot", "nissan", "honda"],
        "name": {"tr": "Clarion C7", "en": "Clarion C7"},
        "placeholder": "C70000001234", "maxLen": 12,
        "units": "Clarion C7 CD / Kaset", "cars": "Peugeot, Citroën, Nissan, Suzuki, Subaru, Honda",
        "label": {"tr": "C7 numarası veya son 4 hanesi", "en": "C7 number or its last 4 digits"},
        "guide": {
            "tr": "1-4 tuşları ile haneleri yazıp BAND / BND tuşuna basılı tutun.",
            "en": "Enter the digits with buttons 1-4 and hold BAND / BND.",
        },
    },
]

# Çevrimiçi verisi olmayan markalar için destek kartı
for brand in ("nissan", "honda", "toyota", "hyundai", "bmw", "peugeot"):
    MODELS.append({"id": f"support_{brand}", "type": "support", "brands": [brand],
                   "name": {"tr": "Diğer modeller (uzman desteği)", "en": "Other models (expert support)"}})


def derive_mask(keys):
    """Anahtarlardan karakter maskesi üretir.

    9 = rakam, A = harf, * = harf veya rakam; tüm anahtarlarda aynı olan
    harfler sabit karakter olarak bırakılır (ör. Ford "M999999").
    """
    length = len(keys[0])
    mask = []
    for i in range(length):
        chars = {k[i] for k in keys}
        if len(chars) == 1 and next(iter(chars)).isalpha():
            mask.append(next(iter(chars)))
        elif all(c.isdigit() for c in chars):
            mask.append("9")
        elif all(c.isalpha() for c in chars):
            mask.append("A")
        else:
            mask.append("*")
    return "".join(mask)


def example_for_mask(mask, example):
    """Örnek seri numarasından maskeye uyan giriş örneği üretir."""
    tail = example[-len(mask):] if len(example) >= len(mask) else ""
    out = []
    for i, c in enumerate(mask):
        e = tail[i] if i < len(tail) else ""
        if c == "9":
            out.append(e if e.isdigit() else str((i + 1) % 10))
        elif c == "A":
            out.append(e if e.isalpha() else "A")
        elif c == "*":
            out.append(e if e.isalnum() else "A")
        else:
            out.append(c)
    return "".join(out)


def load_codes(path):
    with open(path, encoding="utf-8") as f:
        raw = json.load(f)
    if isinstance(raw, list):
        raw = {i["radio_serial"]: i["code"] for i in raw if "radio_serial" in i and "code" in i}
    return {
        str(k).strip().upper(): str(v).strip()
        for k, v in raw.items()
        if v is not None and str(v).strip().upper() not in PLACEHOLDER_CODES
    }


def build():
    if os.path.isdir(DATA_DIR):
        shutil.rmtree(DATA_DIR)
    os.makedirs(DATA_DIR)

    models_out = []
    total = 0
    for m in MODELS:
        m = dict(m)
        m.setdefault("type", "db")
        src = m.pop("src", None)
        if m["type"] == "db":
            codes = load_codes(os.path.join(ROOT, src))
            if not codes:
                m["type"] = "support"
            else:
                key_len = len(next(iter(codes)))
                shards = {}
                for k, v in codes.items():
                    shards.setdefault(k[-SHARD_LEN:], {})[k] = v
                out_dir = os.path.join(DATA_DIR, m["id"])
                os.makedirs(out_dir)
                for shard, items in shards.items():
                    with open(os.path.join(out_dir, f"{shard}.json"), "w", encoding="utf-8") as f:
                        json.dump(items, f, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
                m["keyLen"] = key_len
                m["count"] = len(codes)
                if "mask" not in m:
                    m["mask"] = derive_mask(list(codes))
                    if key_len < m["maxLen"]:
                        # Veritabanı seri numarasının yalnızca son hanelerini tutuyor:
                        # kullanıcıdan tam olarak bu haneler istenir.
                        m["label"] = {
                            "tr": f"Seri numarasının son {key_len} rakamı",
                            "en": f"Last {key_len} digits of the serial number",
                        }
                m["example"] = m.get("placeholder", "")
                m["placeholder"] = example_for_mask(m["mask"], m["example"])
                m["maxLen"] = len(m["mask"])
                total += len(codes)
                print(f"[OK] {m['id']:<22} {len(codes):>7} kod, {len(shards):>4} parça")
        if m["type"] == "renault":
            m["example"] = m["placeholder"]
        models_out.append(m)

    used = {b for m in models_out for b in m["brands"]}
    catalog = {
        "version": datetime.now(timezone.utc).strftime("%Y%m%d%H%M"),
        "shardLen": SHARD_LEN,
        "totalCodes": total,
        "brands": [b for b in BRANDS if b["id"] in used],
        "models": models_out,
    }
    for path in (os.path.join(DATA_DIR, "catalog.json"), os.path.join(APP_DIR, "catalog.json")):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(catalog, f, ensure_ascii=False, indent=1)
    print(f"Toplam {total} kod, {len(models_out)} model, {len(catalog['brands'])} marka.")


if __name__ == "__main__":
    build()
