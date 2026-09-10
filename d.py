import json

# Tüm JSON Veritabanları Yapılandırması
json_files_data = {
    "becker_4button.json": {
        "title": "Becker 4 Tuşlu Radyo Kodu Çözücü",
        "brand_name": "Becker 4-Button",
        "html_name": "becker_4button.html",
        "accent": "#004080",
        "hover": "#0059b3",
        "glow": "rgba(0, 64, 128, 0.5)",
        "label": "Becker 4 Haneli / Tuşlu Seri No",
        "placeholder": "1234",
        "required_len": 4,
        "models": "Mercedes-Benz, Porsche, BMW, Ferrari (Klasik Becker Üniteler)",
        "units": "Becker Europa, Grand Prix, Mexico 4-Button",
        "input_guide": "<strong>1-4</strong> tuşlarına basarak rakamları seçin. Onaylamak için <strong>> / BAND</strong> veya sağ tuşa basılı tutun.",
        "svg_logo": '<svg viewBox="0 0 120 60" width="60" height="30"><rect x="5" y="5" width="110" height="50" rx="8" fill="none" stroke="#004080" stroke-width="5"/><text x="60" y="38" font-family="Arial" font-weight="bold" font-size="18" fill="#004080" text-anchor="middle">BECKER</text></svg>',
    },
    "becker_4digit.json": {
        "title": "Becker 4 Haneli Radyo Kodu Çözücü",
        "brand_name": "Becker 4-Digit",
        "html_name": "becker_4digit.html",
        "accent": "#4682B4",
        "hover": "#5c9cce",
        "glow": "rgba(70, 130, 180, 0.5)",
        "label": "4 Haneli Becker Seri Numarası",
        "placeholder": "1234",
        "required_len": 4,
        "models": "Mercedes, Porsche, Ferrari, Audi, Rover",
        "units": "Becker Traffic Pro, Monza, Mexico",
        "input_guide": "Ayar kadranını çevirerek doğru rakama gelin ve tuşa basın. 4 rakam girildiğinde teyp otomatik açılır.",
        "svg_logo": '<svg viewBox="0 0 120 60" width="60" height="30"><rect x="5" y="5" width="110" height="50" rx="8" fill="none" stroke="#4682B4" stroke-width="5"/><text x="60" y="38" font-family="Arial" font-weight="bold" font-size="18" fill="#4682B4" text-anchor="middle">BECKER</text></svg>',
    },
    "becker_6buttons.json": {
        "title": "Becker 6 Tuşlu Radyo Kodu Çözücü",
        "brand_name": "Becker 6-Buttons",
        "html_name": "becker_6buttons.html",
        "accent": "#3B5998",
        "hover": "#4c70ba",
        "glow": "rgba(59, 89, 152, 0.5)",
        "label": "Becker 6 Tuş Seri No",
        "placeholder": "1234",
        "required_len": 4,
        "models": "Mercedes-Benz W210, W208 CLK, W163 ML, Porsche Boxster",
        "units": "6 Tuşlu Becker Europa 2000, Grand Prix CD",
        "input_guide": "<strong>1, 2, 3, 4</strong> tuşlarıyla her bir haneyi girin. Onaylamak için <strong>SC / RDS</strong> tuşuna basılı tutun.",
        "svg_logo": '<svg viewBox="0 0 120 60" width="60" height="30"><rect x="5" y="5" width="110" height="50" rx="8" fill="none" stroke="#3B5998" stroke-width="5"/><text x="60" y="38" font-family="Arial" font-weight="bold" font-size="18" fill="#3B5998" text-anchor="middle">BECKER</text></svg>',
    },
    "becker_8button.json": {
        "title": "Becker 8 Tuşlu Radyo Kodu Çözücü",
        "brand_name": "Becker 8-Button",
        "html_name": "becker_8button.html",
        "accent": "#2B4C7E",
        "hover": "#3b63a0",
        "glow": "rgba(43, 76, 126, 0.5)",
        "label": "Becker 8 Tuş Seri No",
        "placeholder": "1234",
        "required_len": 4,
        "models": "Mercedes C-Class, E-Class, SLK, Porsche",
        "units": "8 Tuşlu Özel Becker Teyp Üniteleri",
        "input_guide": "1-8 arası tuş takımı ile ekrandaki şifreyi yazıp OK / MUTE tuşuna basılı tutarak teybi açın.",
        "svg_logo": '<svg viewBox="0 0 120 60" width="60" height="30"><rect x="5" y="5" width="110" height="50" rx="8" fill="none" stroke="#2B4C7E" stroke-width="5"/><text x="60" y="38" font-family="Arial" font-weight="bold" font-size="18" fill="#2B4C7E" text-anchor="middle">BECKER</text></svg>',
    },
    "chrysler_4digits_aa_alpine_sonuclari.json": {
        "title": "Chrysler Alpine 4 Haneli Radyo Kodu",
        "brand_name": "Chrysler Alpine",
        "html_name": "chrysler_4digits_aa_alpine.html",
        "accent": "#C0C0C0",
        "hover": "#d9d9d9",
        "glow": "rgba(192, 192, 192, 0.5)",
        "label": "Chrysler AA / Alpine Seri Kodu",
        "placeholder": "1234",
        "required_len": 4,
        "models": "Chrysler 300C, Grand Cherokee, Voyager, PT Cruiser",
        "units": "Alpine Üretimi Chrysler Teypleri",
        "input_guide": "Radyo düğmelerini kullanarak 4 haneli kodu yazın. Kod doğru girildiğinde teyp anında aktif olacaktır.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><polygon points="50,10 90,90 10,90" fill="none" stroke="#C0C0C0" stroke-width="6"/><text x="50" y="70" font-size="16" font-weight="bold" fill="#C0C0C0" text-anchor="middle">CHRYSLER</text></svg>',
    },
    "chrysler_4digits_t00be_beker_sonuclari.json": {
        "title": "Chrysler Becker (T00BE) Radyo Kodu",
        "brand_name": "Chrysler Becker T00BE",
        "html_name": "chrysler_4digits_t00be_becker.html",
        "accent": "#A9A9A9",
        "hover": "#c0c0c0",
        "glow": "rgba(169, 169, 169, 0.5)",
        "label": "T00BE ile Başlayan Seri No",
        "placeholder": "T00BE123456789",
        "required_len": 14,
        "models": "Chrysler 300C, Crossfire, Voyager, Jeep Cherokee",
        "units": "Becker T00BE Teyp & Navigasyon Sistemleri",
        "input_guide": "Sol döner düğmeyi çevirerek her rakamı seçin ve üzerine basarak onaylayın.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><circle cx="50" cy="50" r="40" fill="none" stroke="#A9A9A9" stroke-width="6"/><text x="50" y="58" font-size="14" font-weight="bold" fill="#A9A9A9" text-anchor="middle">T00BE</text></svg>',
    },
    "chrysler_5digits_preset5_sonuclari.json": {
        "title": "Chrysler 5 Haneli (Preset 5) Radyo Kodu",
        "brand_name": "Chrysler Preset 5",
        "html_name": "chrysler_5digits_preset5.html",
        "accent": "#808080",
        "hover": "#999999",
        "glow": "rgba(128, 128, 128, 0.5)",
        "label": "5 Haneli Preset 5 Kodu / Seri No",
        "placeholder": "12345",
        "required_len": 5,
        "models": "Chrysler Voyager, Neon, Stratus, Jeep Wrangler",
        "units": "5 Tuş Hafızalı Orijinal Chrysler Radyoları",
        "input_guide": "<strong>1-5</strong> tuşlarını kullanarak 5 haneli şifrenizi tuşlayın.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><polygon points="50,10 90,90 10,90" fill="none" stroke="#808080" stroke-width="6"/><text x="50" y="70" font-size="14" font-weight="bold" fill="#808080" text-anchor="middle">PRESET5</text></svg>',
    },
    "chrysler_5digits_preset6_sonuclari.json": {
        "title": "Chrysler 5 Haneli (Preset 6) Radyo Kodu",
        "brand_name": "Chrysler Preset 6",
        "html_name": "chrysler_5digits_preset6.html",
        "accent": "#696969",
        "hover": "#808080",
        "glow": "rgba(105, 105, 105, 0.5)",
        "label": "5 Haneli Preset 6 Kodu / Seri No",
        "placeholder": "12345",
        "required_len": 5,
        "models": "Chrysler Sebring, Town & Country, Dodge Caravan",
        "units": "6 Tuş Hafızalı Chrysler Radyo Sistemleri",
        "input_guide": "<strong>1-6</strong> arası tuşlardan ilgili rakamları seçerek 5 haneli şifreyi girin.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><polygon points="50,10 90,90 10,90" fill="none" stroke="#696969" stroke-width="6"/><text x="50" y="70" font-size="14" font-weight="bold" fill="#696969" text-anchor="middle">PRESET6</text></svg>',
    },
    "chrysler_last4digit_tm9_sonuclari.json": {
        "title": "Chrysler TM9 (Son 4 Haneli) Radyo Kodu",
        "brand_name": "Chrysler TM9",
        "html_name": "chrysler_last4digit_tm9.html",
        "accent": "#708090",
        "hover": "#8799a5",
        "glow": "rgba(112, 128, 144, 0.5)",
        "label": "TM9 Seri No (Son 4 Hane)",
        "placeholder": "1234",
        "required_len": 4,
        "models": "Chrysler, Dodge, Jeep TM9 Serisi Üniteler",
        "units": "TM9 Üretimi Chrysler Teypleri",
        "input_guide": "Tuş takımından 4 haneli açılış kodunu arka arkaya girin.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><rect x="10" y="10" width="80" height="80" rx="10" fill="none" stroke="#708090" stroke-width="6"/><text x="50" y="60" font-size="18" font-weight="bold" fill="#708090" text-anchor="middle">TM9</text></svg>',
    },
    "database_alpine_jaguar.json": {
        "title": "Alpine & Jaguar Radyo Kodu Çözücü",
        "brand_name": "Alpine / Jaguar",
        "html_name": "database_alpine_jaguar.html",
        "accent": "#4B0082",
        "hover": "#6a00b8",
        "glow": "rgba(75, 0, 130, 0.5)",
        "label": "Jaguar / Alpine Seri No",
        "placeholder": "JA12345678",
        "required_len": 10,
        "models": "Jaguar XJ, X-Type, S-Type, Land Rover, BMW, Honda",
        "units": "Alpine Premium Orijinal Ses Sistemleri",
        "input_guide": "Numara tuşları ile 4 haneli kodu girip <strong>MODE / P.SCAN</strong> tuşu ile onaylayın.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><polygon points="10,80 50,15 90,80" fill="none" stroke="#4B0082" stroke-width="6"/><text x="50" y="70" font-size="12" font-weight="bold" fill="#4B0082" text-anchor="middle">JAGUAR</text></svg>',
    },
    "database_becker_4digit.json": {
        "title": "Becker Veritabanı 4 Haneli Şifre Çözücü",
        "brand_name": "Becker DB 4-Digit",
        "html_name": "database_becker_4digit.html",
        "accent": "#1E90FF",
        "hover": "#46a3ff",
        "glow": "rgba(30, 144, 255, 0.5)",
        "label": "Becker 4 Haneli Seri No",
        "placeholder": "1234",
        "required_len": 4,
        "models": "Mercedes-Benz, Porsche, Ferrari, Maserati",
        "units": "Becker Online / Kaset / CD Çalarlar",
        "input_guide": "Sağ kadrandan her rakamı seçip tıklayarak şifreyi onaylayın.",
        "svg_logo": '<svg viewBox="0 0 120 60" width="60" height="30"><rect x="5" y="5" width="110" height="50" rx="8" fill="none" stroke="#1E90FF" stroke-width="5"/><text x="60" y="38" font-family="Arial" font-weight="bold" font-size="18" fill="#1E90FF" text-anchor="middle">BECKER</text></svg>',
    },
    "database_becker_4presets.json": {
        "title": "Becker 4 Presets Radyo Kodu Çözücü",
        "brand_name": "Becker 4 Presets",
        "html_name": "database_becker_4presets.html",
        "accent": "#008080",
        "hover": "#00a3a3",
        "glow": "rgba(0, 128, 128, 0.5)",
        "label": "Becker 4 Preset Seri No",
        "placeholder": "1234",
        "required_len": 4,
        "models": "Mercedes-Benz W124, W201, Classic Porsche",
        "units": "4 Kanal Hafızalı Becker Teypler",
        "input_guide": "<strong>1, 2, 3, 4</strong> preset tuşları ile doğru rakamı ekrana getirip onaylayın.",
        "svg_logo": '<svg viewBox="0 0 120 60" width="60" height="30"><rect x="5" y="5" width="110" height="50" rx="8" fill="none" stroke="#008080" stroke-width="5"/><text x="60" y="38" font-family="Arial" font-weight="bold" font-size="16" fill="#008080" text-anchor="middle">PRESETS 4</text></svg>',
    },
    "database_becker_5presets.json": {
        "title": "Becker 5 Presets Radyo Kodu Çözücü",
        "brand_name": "Becker 5 Presets",
        "html_name": "database_becker_5presets.html",
        "accent": "#008B8B",
        "hover": "#00a8a8",
        "glow": "rgba(0, 139, 139, 0.5)",
        "label": "Becker 5 Preset Seri No",
        "placeholder": "12345",
        "required_len": 5,
        "models": "Mercedes Classic W126, R129 SL",
        "units": "5 Kanal Hafızalı Becker Teypler",
        "input_guide": "<strong>1-5</strong> arası tuşlarla her rakamı seçin.",
        "svg_logo": '<svg viewBox="0 0 120 60" width="60" height="30"><rect x="5" y="5" width="110" height="50" rx="8" fill="none" stroke="#008B8B" stroke-width="5"/><text x="60" y="38" font-family="Arial" font-weight="bold" font-size="16" fill="#008B8B" text-anchor="middle">PRESETS 5</text></svg>',
    },
    "database_becker_6presets.json": {
        "title": "Becker 6 Presets Radyo Kodu Çözücü",
        "brand_name": "Becker 6 Presets",
        "html_name": "database_becker_6presets.html",
        "accent": "#20B2AA",
        "hover": "#2bcbc2",
        "glow": "rgba(32, 178, 170, 0.5)",
        "label": "Becker 6 Preset Seri No",
        "placeholder": "1234",
        "required_len": 4,
        "models": "Mercedes-Benz W202, W210, R170 SLK",
        "units": "6 Kanal Hafızalı Becker Teypler",
        "input_guide": "<strong>1-6</strong> arası tuşlarla her haneyi ayrı ayrı girip onaylayın.",
        "svg_logo": '<svg viewBox="0 0 120 60" width="60" height="30"><rect x="5" y="5" width="110" height="50" rx="8" fill="none" stroke="#20B2AA" stroke-width="5"/><text x="60" y="38" font-family="Arial" font-weight="bold" font-size="16" fill="#20B2AA" text-anchor="middle">PRESETS 6</text></svg>',
    },
    "database_becker_7presets.json": {
        "title": "Becker 7 Presets Radyo Kodu Çözücü",
        "brand_name": "Becker 7 Presets",
        "html_name": "database_becker_7presets.html",
        "accent": "#3CB371",
        "hover": "#4ecdc4",
        "glow": "rgba(60, 179, 113, 0.5)",
        "label": "Becker 7 Preset Seri No",
        "placeholder": "1234",
        "required_len": 4,
        "models": "Mercedes-Benz, BMW E36/E34 (Becker Üniteler)",
        "units": "7 Tuş Fonksiyonlu Becker Sistemleri",
        "input_guide": "<strong>1-7</strong> tuşlarından şifrenizi tuşlayıp basılı tutarak teybi açın.",
        "svg_logo": '<svg viewBox="0 0 120 60" width="60" height="30"><rect x="5" y="5" width="110" height="50" rx="8" fill="none" stroke="#3CB371" stroke-width="5"/><text x="60" y="38" font-family="Arial" font-weight="bold" font-size="16" fill="#3CB371" text-anchor="middle">PRESETS 7</text></svg>',
    },
    "database_becker_8presets.json": {
        "title": "Becker 8 Presets Radyo Kodu Çözücü",
        "brand_name": "Becker 8 Presets",
        "html_name": "database_becker_8presets.html",
        "accent": "#2E8B57",
        "hover": "#38a768",
        "glow": "rgba(46, 139, 87, 0.5)",
        "label": "Becker 8 Preset Seri No",
        "placeholder": "1234",
        "required_len": 4,
        "models": "Mercedes-Benz, Porsche 911/996",
        "units": "8 Preset Becker Sound Sistemleri",
        "input_guide": "<strong>1-8</strong> tuş takımı ile kodu ekrana girin.",
        "svg_logo": '<svg viewBox="0 0 120 60" width="60" height="30"><rect x="5" y="5" width="110" height="50" rx="8" fill="none" stroke="#2E8B57" stroke-width="5"/><text x="60" y="38" font-family="Arial" font-weight="bold" font-size="16" fill="#2E8B57" text-anchor="middle">PRESETS 8</text></svg>',
    },
    "database_becker_9presets.json": {
        "title": "Becker 9 Presets Radyo Kodu Çözücü",
        "brand_name": "Becker 9 Presets",
        "html_name": "database_becker_9presets.html",
        "accent": "#1E5631",
        "hover": "#287242",
        "glow": "rgba(30, 86, 49, 0.5)",
        "label": "Becker 9 Preset Seri No",
        "placeholder": "1234",
        "required_len": 4,
        "models": "Mercedes S-Class, CL-Class Özel Becker Üniteleri",
        "units": "9 Tuş Panelli Becker Sistemleri",
        "input_guide": "<strong>1-9</strong> rakam tuşlarından şifreyi girerek onay tuşuna basın.",
        "svg_logo": '<svg viewBox="0 0 120 60" width="60" height="30"><rect x="5" y="5" width="110" height="50" rx="8" fill="none" stroke="#1E5631" stroke-width="5"/><text x="60" y="38" font-family="Arial" font-weight="bold" font-size="16" fill="#1E5631" text-anchor="middle">PRESETS 9</text></svg>',
    },
    "database_chrysler_5presets.json": {
        "title": "Chrysler 5 Presets Veritabanı Kodu",
        "brand_name": "Chrysler DB 5-Presets",
        "html_name": "database_chrysler_5presets.html",
        "accent": "#A9A9A9",
        "hover": "#bfbfbf",
        "glow": "rgba(169, 169, 169, 0.5)",
        "label": "Chrysler 5-Preset Seri No",
        "placeholder": "12345",
        "required_len": 5,
        "models": "Chrysler Voyager, Neon, Jeep Cherokee",
        "units": "5 Tuş Hafızalı Veritabanı Sistemleri",
        "input_guide": "<strong>1-5</strong> tuşlarıyla şifrenizi sırasıyla tuşlayın.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><polygon points="50,10 90,90 10,90" fill="none" stroke="#A9A9A9" stroke-width="6"/><text x="50" y="70" font-size="14" font-weight="bold" fill="#A9A9A9" text-anchor="middle">DB 5-P</text></svg>',
    },
    "database_chrysler_6presets.json": {
        "title": "Chrysler 6 Presets Veritabanı Kodu",
        "brand_name": "Chrysler DB 6-Presets",
        "html_name": "database_chrysler_6presets.html",
        "accent": "#808080",
        "hover": "#999999",
        "glow": "rgba(128, 128, 128, 0.5)",
        "label": "Chrysler 6-Preset Seri No",
        "placeholder": "12345",
        "required_len": 5,
        "models": "Chrysler 300M, Concorde, Dodge Durango",
        "units": "6 Tuş Hafızalı Veritabanı Sistemleri",
        "input_guide": "<strong>1-6</strong> tuşlarını kullanarak 5 haneli şifreyi girin.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><polygon points="50,10 90,90 10,90" fill="none" stroke="#808080" stroke-width="6"/><text x="50" y="70" font-size="14" font-weight="bold" fill="#808080" text-anchor="middle">DB 6-P</text></svg>',
    },
    "database_chrysler_alpine.json": {
        "title": "Chrysler Alpine Veritabanı Kodu Çözücü",
        "brand_name": "Chrysler DB Alpine",
        "html_name": "database_chrysler_alpine.html",
        "accent": "#2F4F4F",
        "hover": "#3d6767",
        "glow": "rgba(47, 79, 79, 0.5)",
        "label": "Alpine Üretimi Chrysler Seri No",
        "placeholder": "1234",
        "required_len": 4,
        "models": "Chrysler PT Cruiser, Grand Cherokee, Sebring",
        "units": "Alpine Tarafından Üretilen Chrysler Teypleri",
        "input_guide": "Radyo düğmelerinden 4 haneli şifreyi onaylayın.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><polygon points="10,80 50,15 90,80" fill="none" stroke="#2F4F4F" stroke-width="6"/><text x="50" y="70" font-size="12" font-weight="bold" fill="#2F4F4F" text-anchor="middle">CHRYSLER</text></svg>',
    },
    "database_chrysler_becker.json": {
        "title": "Chrysler Becker Veritabanı Kodu Çözücü",
        "brand_name": "Chrysler DB Becker",
        "html_name": "database_chrysler_becker.html",
        "accent": "#4A607A",
        "hover": "#5c7797",
        "glow": "rgba(74, 96, 122, 0.5)",
        "label": "Becker Üretimi Chrysler Seri No",
        "placeholder": "T00BE123456789",
        "required_len": 14,
        "models": "Chrysler Crossfire, 300C, Jeep Commander",
        "units": "Becker Tarafından Üretilen Chrysler Navigasyon & Teypleri",
        "input_guide": "Döner düğmeyi kullanarak şifrenizi onaylayın.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><circle cx="50" cy="50" r="40" fill="none" stroke="#4A607A" stroke-width="6"/><text x="50" y="58" font-size="12" font-weight="bold" fill="#4A607A" text-anchor="middle">BECKER</text></svg>',
    },
    "database_chrysler_tm9.json": {
        "title": "Chrysler TM9 Veritabanı Kodu Çözücü",
        "brand_name": "Chrysler DB TM9",
        "html_name": "database_chrysler_tm9.html",
        "accent": "#36454F",
        "hover": "#4a5d6a",
        "glow": "rgba(54, 69, 79, 0.5)",
        "label": "TM9 Seri Numarası",
        "placeholder": "1234",
        "required_len": 4,
        "models": "Chrysler, Dodge, RAM, Jeep TM9 Sistemleri",
        "units": "TM9 Tabanlı Teyp Üniteleri",
        "input_guide": "4 haneli şifreyi tuş takımı ile yazıp teybi çalıştırın.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><rect x="10" y="10" width="80" height="80" rx="10" fill="none" stroke="#36454F" stroke-width="6"/><text x="50" y="60" font-size="16" font-weight="bold" fill="#36454F" text-anchor="middle">TM9 DB</text></svg>',
    },
    "database_clarion_c7.json": {
        "title": "Clarion C7 Seri Radyo Kodu Çözücü",
        "brand_name": "Clarion C7",
        "html_name": "database_clarion_c7.html",
        "accent": "#008080",
        "hover": "#00a3a3",
        "glow": "rgba(0, 128, 128, 0.5)",
        "label": "C7 Numarası / Seri No",
        "placeholder": "C70000001234",
        "required_len": 12,
        "models": "Peugeot, Citroen, Nissan, Suzuki, Subaru, Honda",
        "units": "Clarion C7 Üretimi CD / Kaset Çalarlar",
        "input_guide": "<strong>1-4</strong> tuşları ile haneleri yazıp <strong>BAND / BND</strong> tuşuna basılı tutun.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><rect x="10" y="20" width="80" height="60" rx="10" fill="none" stroke="#008080" stroke-width="6"/><text x="50" y="56" font-size="15" font-weight="bold" fill="#008080" text-anchor="middle">CLARION</text></svg>',
    },
    "database_delphi_famar.json": {
        "title": "Delphi & Famar Radyo Kodu Çözücü",
        "brand_name": "Delphi / Famar",
        "html_name": "database_delphi_famar.html",
        "accent": "#20B2AA",
        "hover": "#28d1c8",
        "glow": "rgba(32, 178, 170, 0.5)",
        "label": "Delphi / Famar Seri No",
        "placeholder": "12345678901234",
        "required_len": 14,
        "models": "Fiat, Opel, Chevrolet, Peugeot, Citroen",
        "units": "Delphi Grundig, Famar Fueguina Orijinal Teypleri",
        "input_guide": "Ayar tuşları ile kodu ekrana tuşlayıp OK tuşuna basarak onaylayın.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><circle cx="50" cy="50" r="42" fill="none" stroke="#20B2AA" stroke-width="6"/><text x="50" y="58" font-size="18" font-weight="bold" fill="#20B2AA" text-anchor="middle">DELPHI</text></svg>',
    },
    "database_fiat_daiichi.json": {
        "title": "Fiat Daiichi Radyo Kodu Çözücü",
        "brand_name": "Fiat Daiichi",
        "html_name": "fiat_daiichi.html",
        "accent": "#990000",
        "hover": "#cc0000",
        "glow": "rgba(153, 0, 0, 0.5)",
        "label": "Fiat Daiichi Seri Numarası",
        "placeholder": "M123456",
        "required_len": 7,
        "models": "Fiat Egea, Fiorino, Doblo, Linea, Punto",
        "units": "Daiichi Dokunmatik ve Tuşlu Radyo Sistemleri",
        "input_guide": "Ekranda çıkan sanal klavyeden 4 haneli şifreyi tuşlayın.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><rect x="10" y="10" width="80" height="80" rx="15" fill="none" stroke="#990000" stroke-width="8"/><text x="50" y="60" font-family="Arial" font-weight="900" font-size="28" fill="#990000" text-anchor="middle">FIAT</text></svg>',
    },
    "database_fiat_visteon.json": {
        "title": "Fiat Visteon Radyo Kodu Çözücü",
        "brand_name": "Fiat Visteon",
        "html_name": "fiat_visteon.html",
        "accent": "#800000",
        "hover": "#a00000",
        "glow": "rgba(128, 0, 0, 0.5)",
        "label": "M ile Başlayan Seri No",
        "placeholder": "M012345",
        "required_len": 7,
        "models": "Fiat Stilo, Punto, Bravo, Doblo",
        "units": "Visteon CD / MP3 Orijinal Radyo Sistemleri",
        "input_guide": "<strong>1-4</strong> tuşlarına basarak rakamları girin, onay için <strong>EXPERT / OK</strong> tuşuna basılı tutun.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><rect x="10" y="10" width="80" height="80" rx="15" fill="none" stroke="#800000" stroke-width="8"/><text x="50" y="60" font-family="Arial" font-weight="900" font-size="28" fill="#800000" text-anchor="middle">FIAT</text></svg>',
    },
    "database_ford_m.json": {
        "title": "Ford M Serisi Radyo Kodu Çözücü",
        "brand_name": "Ford M-Series",
        "html_name": "ford_m.html",
        "accent": "#003399",
        "hover": "#0044cc",
        "glow": "rgba(0, 51, 153, 0.5)",
        "label": "7 Haneli M Seri No",
        "placeholder": "M123456",
        "required_len": 7,
        "models": "Ford Focus, Fiesta, Mondeo, Transit, Courier, Kuga, Ka",
        "units": "6000 CD, 4500 RDS, Sony CD, Traffic 3000/4000",
        "input_guide": "<strong>1, 2, 3, 4</strong> tuşlarına basarak rakamları seçin. Onaylamak için <strong>5</strong> veya <strong>6</strong> nolu tuşa basılı tutun.",
        "svg_logo": '<svg viewBox="0 0 120 60" width="60" height="30"><ellipse cx="60" cy="30" rx="55" ry="25" fill="none" stroke="#003399" stroke-width="5"/><text x="60" y="38" font-family="Arial" font-weight="bold" font-style="italic" font-size="24" fill="#003399" text-anchor="middle">Ford</text></svg>',
    },
    "database_ford_v.json": {
        "title": "Ford V Serisi Radyo Kodu Çözücü",
        "brand_name": "Ford V-Series",
        "html_name": "ford_v.html",
        "accent": "#002266",
        "hover": "#003399",
        "glow": "rgba(0, 34, 102, 0.5)",
        "label": "7 Haneli V Seri No",
        "placeholder": "V123456",
        "required_len": 7,
        "models": "Ford Focus 2, Fiesta, Mondeo 4, Transit Custom, C-Max, S-Max",
        "units": "Sony DAB, 6000CD V-Series, TravelPilot FX/NX",
        "input_guide": "<strong>1-4</strong> tuşlarını kullanarak rakamları girin. Kodu onaylamak için <strong>*</strong> veya <strong>OK / 5</strong> tuşuna basın.",
        "svg_logo": '<svg viewBox="0 0 120 60" width="60" height="30"><ellipse cx="60" cy="30" rx="55" ry="25" fill="none" stroke="#002266" stroke-width="5"/><text x="60" y="38" font-family="Arial" font-weight="bold" font-style="italic" font-size="24" fill="#002266" text-anchor="middle">Ford</text></svg>',
    },
    "database_mercedes_citan.json": {
        "title": "Mercedes Citan Radyo Kodu Çözücü",
        "brand_name": "Mercedes-Benz Citan",
        "html_name": "database_mercedes_citan.html",
        "accent": "#00A3E0",
        "hover": "#00c4ff",
        "glow": "rgba(0, 163, 224, 0.5)",
        "label": "Citan Seri / Precode No",
        "placeholder": "A123",
        "required_len": 4,
        "models": "Mercedes-Benz Citan, Vito, Sprinter",
        "units": "Orijinal Mercedes Citan / Renault Tabanlı Radyolar",
        "input_guide": "Sağ arama düğmesini çevirerek rakamları seçin ve tıklayarak onaylayın.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><circle cx="50" cy="50" r="42" fill="none" stroke="#00A3E0" stroke-width="6"/><path d="M 50 10 L 50 50 L 15 70 M 50 50 L 85 70" stroke="#00A3E0" stroke-width="6" stroke-linecap="round"/></svg>',
    },
    "database_opel_delco.json": {
        "title": "Opel Delco Radyo Kodu Çözücü",
        "brand_name": "Opel Delco",
        "html_name": "database_opel_delco.html",
        "accent": "#E5A100",
        "hover": "#ffb700",
        "glow": "rgba(229, 161, 0, 0.5)",
        "label": "GM Delco Seri No (Örn: GM0...)",
        "placeholder": "GM050012345678",
        "required_len": 14,
        "models": "Opel Astra G, Corsa B/C, Vectra B, Omega, Zafira A",
        "units": "CDR 500, CDR 2005, Delco Electronics",
        "input_guide": "Kontak açıkken <strong>AS</strong> tuşuna basılı tutarak teybi açın. <strong>1-4</strong> tuşlarıyla şifreyi girip tekrar <strong>AS</strong> tuşuna bip sesi gelene kadar basın.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><circle cx="50" cy="50" r="42" fill="none" stroke="#E5A100" stroke-width="6"/><polygon points="10,50 60,35 40,65 90,50" fill="#E5A100"/></svg>',
    },
    "database_opel_vivaro_movano.json": {
        "title": "Opel Vivaro & Movano Radyo Kodu",
        "brand_name": "Opel Vivaro / Movano",
        "html_name": "database_opel_vivaro_movano.html",
        "accent": "#D48800",
        "hover": "#f59e00",
        "glow": "rgba(212, 136, 0, 0.5)",
        "label": "Precode / Seri No",
        "placeholder": "A123",
        "required_len": 4,
        "models": "Opel Vivaro A/B, Opel Movano A/B",
        "units": "CD18, CD20, CD30, Navi 50 / 80",
        "input_guide": "Direksiyon altındaki kumandadan veya <strong>1-4</strong> tuşlarıyla rakamları seçip <strong>6</strong> tuşuna basılı tutun.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><circle cx="50" cy="50" r="42" fill="none" stroke="#D48800" stroke-width="6"/><polygon points="10,50 60,35 40,65 90,50" fill="#D48800"/></svg>',
    },
    "fiat_daiichi_alfa_radio_sonuclari.json": {
        "title": "Alfa Romeo & Fiat Daiichi Kodu",
        "brand_name": "Alfa Romeo / Fiat",
        "html_name": "fiat_daiichi_alfa_radio.html",
        "accent": "#8B0000",
        "hover": "#b30000",
        "glow": "rgba(139, 0, 0, 0.5)",
        "label": "Alfa / Fiat Seri No",
        "placeholder": "12345",
        "required_len": 5,
        "models": "Alfa Romeo 147, 156, 159, Mito, Giulietta, Fiat Egea",
        "units": "Daiichi / Bosch Alfa Radio Sistemleri",
        "input_guide": "Ekrana gelen 4 haneli şifre girme alanına dokunarak onay verin.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><circle cx="50" cy="50" r="42" fill="none" stroke="#8B0000" stroke-width="7"/><path d="M 50 15 L 50 85 M 25 50 L 75 50" stroke="#8B0000" stroke-width="6"/></svg>',
    },
    "fiat_daiichi_alfa_radio_vp1_vp2.json": {
        "title": "Fiat & Alfa VP1 / VP2 Radyo Kodu",
        "brand_name": "Fiat Alfa VP1/VP2",
        "html_name": "fiat_daiichi_alfa_vp1_vp2.html",
        "accent": "#990000",
        "hover": "#cc0000",
        "glow": "rgba(153, 0, 0, 0.5)",
        "label": "VP1 / VP2 Seri Numarası",
        "placeholder": "A1234",
        "required_len": 5,
        "models": "Fiat 500L, 500X, Egea, Alfa Giulietta",
        "units": "VP1, VP2, Uconnect 5 Dokunmatik Radyolar",
        "input_guide": "Dokunmatik ekrandaki tuş takımını kullanarak kodu girin.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="50" height="50"><rect x="10" y="10" width="80" height="80" rx="15" fill="none" stroke="#990000" stroke-width="8"/><text x="50" y="60" font-family="Arial" font-weight="900" font-size="22" fill="#990000" text-anchor="middle">VP1/2</text></svg>',
    },
    "vw.json": {
        "title": "Volkswagen Radyo Kodu Çözücü",
        "brand_name": "Volkswagen",
        "html_name": "volkswagen.html",
        "accent": "#001E50",
        "hover": "#003380",
        "glow": "rgba(0, 30, 80, 0.6)",
        "label": "14 Haneli Seri No (VWZ...)",
        "placeholder": "VWZ2Z2V4000004",
        "required_len": 14,
        "models": "Golf, Passat, Polo, Jetta, Tiguan, Caddy, Transporter, Amarok, Scirocco",
        "units": "RCD 210, RCD 310, RCD 510, MFD2, Delta 6, Gamma",
        "input_guide": "1. Tuşa 1. rakam görünene kadar basın. 2, 3 ve 4. tuşlarla şifreyi tamamlayıp <strong>> / SEEK</strong> tuşuna basılı tutun.",
        "svg_logo": '<svg viewBox="0 0 100 100" width="55" height="55"><circle cx="50" cy="50" r="42" fill="none" stroke="#001E50" stroke-width="7"/><path d="M 28 32 L 40 68 L 50 45 L 60 68 L 72 32 M 20 32 L 50 82 L 80 32" fill="none" stroke="#001E50" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    },
}

HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>{title}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@600;800;900&family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
    <style>
        :root {{
            --brand-color: {accent};
            --brand-hover: {hover};
            --bg-dark: #0B0E11;
            --card-bg: #161B22;
            --input-bg: #0D1117;
            --text-main: #FFFFFF;
            --text-muted: #8B949E;
            --accent-glow: {glow};
            --border-color: #30363D;
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: 'Poppins', sans-serif;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
            -webkit-touch-callout: none;
            -webkit-tap-highlight-color: transparent;
        }}

        input {{
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
        }}

        body {{
            background-color: var(--bg-dark);
            color: var(--text-main);
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px 15px 100px 15px;
            background-image: 
                radial-gradient(circle at 50% 0%, var(--accent-glow) 0%, transparent 60%),
                radial-gradient(circle at 80% 100%, var(--accent-glow) 0%, transparent 40%);
            overflow-x: hidden;
        }}

        .container {{ width: 100%; max-width: 520px; }}

        .brand-header {{
            text-align: center;
            margin-bottom: 25px;
            perspective: 1000px;
        }}

        .custom-logo {{
            width: 80px;
            height: 80px;
            margin: 0 auto 15px auto;
            display: flex;
            justify-content: center;
            align-items: center;
            background: rgba(255, 255, 255, 0.04);
            border-radius: 50%;
            border: 2px solid var(--brand-color);
            box-shadow: 0 0 30px var(--accent-glow);
            animation: logoPulse 2.5s infinite alternate ease-in-out;
        }}

        @keyframes logoPulse {{
            0% {{ box-shadow: 0 0 15px var(--accent-glow); transform: scale(1); }}
            100% {{ box-shadow: 0 0 40px var(--accent-glow), 0 0 20px var(--brand-color); transform: scale(1.08); }}
        }}

        .brand-header h1 {{
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: var(--text-main);
        }}

        .brand-header h1 span {{
            color: var(--brand-color);
            display: inline-block;
            text-shadow: 0 0 12px var(--accent-glow);
            animation: glowText 2s infinite alternate;
        }}

        @keyframes glowText {{
            from {{ text-shadow: 0 0 5px var(--accent-glow); }}
            to {{ text-shadow: 0 0 18px var(--brand-color); }}
        }}

        .card {{
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 32px 24px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
            position: relative;
            overflow: hidden;
            margin-bottom: 25px;
        }}

        .card::before {{
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: linear-gradient(90deg, transparent, var(--brand-color), transparent);
        }}

        p.desc {{
            color: var(--text-muted);
            font-size: 13.5px;
            text-align: center;
            margin-bottom: 25px;
            line-height: 1.5;
        }}

        .form-group {{ margin-bottom: 20px; }}

        label {{
            display: block;
            margin-bottom: 8px;
            color: var(--text-muted);
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }}

        input {{
            width: 100%;
            padding: 16px;
            background: var(--input-bg);
            border: 2px solid var(--border-color);
            border-radius: 12px;
            color: #fff;
            font-size: 20px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 3px;
            text-align: center;
            outline: none;
            transition: all 0.3s ease;
        }}

        input:focus {{
            border-color: var(--brand-color);
            box-shadow: 0 0 20px var(--accent-glow);
        }}

        button {{
            width: 100%;
            padding: 18px;
            background: var(--brand-color);
            color: #fff;
            border: none;
            border-radius: 12px;
            font-size: 16px;
            font-weight: 800;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            cursor: pointer;
            position: relative;
            overflow: hidden;
            transition: all 0.3s ease;
            box-shadow: 0 6px 20px var(--accent-glow);
        }}

        button:hover {{
            background: var(--brand-hover);
            transform: translateY(-2px);
        }}

        .result-box {{
            margin-top: 25px;
            padding: 22px;
            background: #050709;
            border: 2px solid var(--brand-color);
            border-radius: 14px;
            text-align: center;
            display: none;
            animation: fadeIn 0.4s ease-in-out forwards;
        }}

        .result-box.active {{ display: block; }}

        .code-title {{
            font-size: 12px;
            font-weight: 700;
            color: var(--text-muted);
            letter-spacing: 2px;
            text-transform: uppercase;
            margin-bottom: 8px;
        }}

        .code-value {{
            font-family: 'Orbitron', sans-serif;
            font-size: 42px;
            font-weight: 900;
            color: var(--brand-color);
            letter-spacing: 8px;
            text-shadow: 0 0 15px var(--accent-glow);
        }}

        .error {{
            color: #FF4D4D;
            background: rgba(255, 77, 77, 0.12);
            border: 1px solid rgba(255, 77, 77, 0.3);
            padding: 14px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 600;
            margin-top: 15px;
            text-align: center;
            display: none;
        }}

        .guide-card, .compatibility-card, .input-instruction-card {{
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 25px;
        }}

        .guide-title, .compatibility-card h3, .input-instruction-card h3 {{
            font-size: 15px;
            font-weight: 700;
            color: var(--brand-color);
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }}

        .steps-list {{ list-style: none; }}
        .steps-list li {{
            position: relative;
            padding-left: 28px;
            font-size: 13px;
            color: var(--text-muted);
            margin-bottom: 12px;
            line-height: 1.5;
        }}

        .steps-list li::before {{
            content: "✓";
            position: absolute;
            left: 0;
            top: 0;
            color: var(--brand-color);
            font-weight: bold;
        }}

        .instruction-box {{
            background: #0D1117;
            border-left: 4px solid var(--brand-color);
            padding: 14px;
            border-radius: 8px;
            font-size: 12.5px;
            color: var(--text-muted);
            line-height: 1.6;
        }}

        .whatsapp-float {{
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #25D366, #128C7E);
            color: #FFF;
            border-radius: 50px;
            padding: 10px 18px 10px 12px;
            display: flex;
            align-items: center;
            gap: 12px;
            box-shadow: 0 10px 25px rgba(37, 211, 102, 0.5);
            text-decoration: none;
            z-index: 1000;
            animation: floatBounce 3s infinite ease-in-out;
            transition: all 0.3s ease;
        }}

        .whatsapp-float:hover {{
            transform: scale(1.05);
            box-shadow: 0 15px 30px rgba(37, 211, 102, 0.7);
        }}

        .wa-avatar {{
            width: 38px;
            height: 38px;
            background: #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
        }}

        .wa-avatar svg {{ width: 22px; height: 22px; fill: #25D366; }}

        .wa-online-dot {{
            position: absolute;
            top: -1px;
            right: -1px;
            width: 11px;
            height: 11px;
            background: #00FF66;
            border: 2px solid #128C7E;
            border-radius: 50%;
            animation: pulseDot 1.5s infinite;
        }}

        .wa-text {{ display: flex; flex-direction: column; }}
        .wa-text .title {{ font-size: 9px; text-transform: uppercase; opacity: 0.9; font-weight: 600; letter-spacing: 0.5px; }}
        .wa-text .action {{ font-size: 12.5px; font-weight: 800; }}

        @keyframes floatBounce {{
            0%, 100% {{ transform: translateY(0); }}
            50% {{ transform: translateY(-7px); }}
        }}

        @keyframes pulseDot {{
            0% {{ transform: scale(0.9); opacity: 0.8; }}
            50% {{ transform: scale(1.2); opacity: 1; }}
            100% {{ transform: scale(0.9); opacity: 0.8; }}
        }}

        @keyframes fadeIn {{
            from {{ opacity: 0; transform: translateY(8px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}

        .footer-text {{ text-align: center; margin-top: 20px; font-size: 11px; color: var(--text-muted); }}
    </style>
</head>
<body oncontextmenu="return false;">

<div class="container">
    <div class="brand-header">
        <div class="custom-logo">{svg_logo}</div>
        <h1>{brand_name} <span>Radyo Kodu</span></h1>
    </div>

    <div class="card">
        <p class="desc">Teyp etiketinde yer alan seri numarasını girerek şifrenizi anında sorgulayın.</p>
        
        <div class="form-group">
            <label for="serialInput">{label}</label>
            <div class="input-wrapper">
                <input type="text" id="serialInput" placeholder="Örn: {placeholder}" maxlength="{required_len}" autocomplete="off">
            </div>
        </div>

        <button onclick="findCode()">Kodu Çöz</button>

        <div class="error" id="errorMsg"></div>

        <div class="result-box" id="resultBox">
            <div class="code-title">Açılış Şifreniz</div>
            <div class="code-value" id="codeDisplay">----</div>
        </div>
    </div>

    <div class="input-instruction-card">
        <h3>📻 Kod Teybe Nasıl Girilir?</h3>
        <div class="instruction-box">
            {input_guide}
        </div>
    </div>

    <div class="guide-card">
        <div class="guide-title">💡 Seri Numarası Nerede Bulunur?</div>
        <ul class="steps-list">
            <li><span style="color:#fff; font-weight:600;">Adım 1:</span> Teybinizi sökme aparatlarıyla kasasından çıkarın.</li>
            <li><span style="color:#fff; font-weight:600;">Adım 2:</span> Üstteki beyaz etiketi bulun.</li>
            <li><span style="color:#fff; font-weight:600;">Adım 3:</span> Seri numarasını yukarıdaki kutuya tam yazın.</li>
        </ul>
    </div>

    <div class="compatibility-card">
        <h3>🚗 Uyumlu Araç & Sistemler</h3>
        <p style="font-size:12px; color:var(--text-muted); margin-bottom:8px;"><strong style="color:#fff;">Modeller:</strong> {models}</p>
        <p style="font-size:12px; color:var(--text-muted);"><strong style="color:#fff;">Desteklenen Teypler:</strong> {units}</p>
    </div>

    <div class="footer-text">© {brand_name} Şifre Çözme Servisi</div>
</div>

<a href="https://wa.me/905000000000?text=Merhaba,%20{brand_name}%20teypsifresi%20hakkinda%20destek%20almak%20istiyorum." class="whatsapp-float" target="_blank">
    <div class="wa-avatar">
        <div class="wa-online-dot"></div>
        <svg viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
    </div>
    <div class="wa-text">
        <span class="title">7/24 Canlı Destek</span>
        <span class="action">WhatsApp'tan Ulaşın</span>
    </div>
</a>

<script>
    let database = {{}};
    const REQUIRED_LEN = {required_len};

    fetch('{json_file}')
        .then(res => res.json())
        .then(data => {{ database = data; }})
        .catch(err => console.error("JSON Yükleme Hatası:", err));

    function findCode() {{
        const input = document.getElementById('serialInput').value.trim().toUpperCase();
        const resultBox = document.getElementById('resultBox');
        const errorMsg = document.getElementById('errorMsg');
        const codeDisplay = document.getElementById('codeDisplay');

        if (input.length !== REQUIRED_LEN) {{
            resultBox.classList.remove('active');
            errorMsg.innerHTML = `⚠️ Eksik veya fazla karakter girdiniz!<br>Bu model için seri numarası tam olarak <strong>${{REQUIRED_LEN}}</strong> karakter olmalıdır. (Siz ${{input.length}} karakter girdiniz)`;
            errorMsg.style.display = 'block';
            return;
        }}

        if (database[input]) {{
            errorMsg.style.display = 'none';
            codeDisplay.innerText = database[input];
            resultBox.classList.add('active');
        }} else {{
            resultBox.classList.remove('active');
            errorMsg.innerHTML = '⚠️ Girilen seri numarası veritabanında bulunamadı! Lütfen seri numarasını kontrol edip tekrar deneyin.';
            errorMsg.style.display = 'block';
        }}
    }}

    document.getElementById('serialInput').addEventListener('keypress', function(e) {{
        if (e.key === 'Enter') findCode();
    }});

    document.addEventListener('keydown', function(e) {{
        if (e.keyCode === 123 || (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || (e.ctrlKey && e.keyCode === 85)) {{
            e.preventDefault();
            return false;
        }}
    }});
</script>
</body>
</html>
"""


def generate_all():
    created = 0
    for json_file, cfg in json_files_data.items():
        html_code = HTML_TEMPLATE.format(
            json_file=json_file,
            title=cfg["title"],
            brand_name=cfg["brand_name"],
            accent=cfg["accent"],
            hover=cfg["hover"],
            glow=cfg["glow"],
            label=cfg["label"],
            placeholder=cfg["placeholder"],
            required_len=cfg["required_len"],
            models=cfg["models"],
            units=cfg["units"],
            input_guide=cfg["input_guide"],
            svg_logo=cfg["svg_logo"],
        )
        with open(cfg["html_name"], "w", encoding="utf-8") as f:
            f.write(html_code)
        created += 1
        print(f"[OK] {cfg['html_name']} oluşturuldu ({json_file}).")


if __name__ == "__main__":
    generate_all()