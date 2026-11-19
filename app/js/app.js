(function () {
    "use strict";

    // ---------------------------------------------------------------
    // Ayarlar
    // ---------------------------------------------------------------
    var CONFIG = {
        repo: "cematil/otoradyokodlari",
        branch: "main",
        whatsapp: "905074377818",
        // AdMob reklam ayarları. Yayınlamadan önce kendi AdMob kimliklerinizi yazın ve testing: false yapın.
        // (Uygulama kimliği ayrıca android/app/src/main/AndroidManifest.xml içine yazılır.)
        admob: {
            enabled: true,
            testing: false, // true iken Google test reklamları gösterilir
            bannerId: "ca-app-pub-2830351264097967/2520077819",       // GERÇEK — Banner Alt
            interstitialId: "ca-app-pub-2830351264097967/6267751134", // GERÇEK — Gecis Kod Bulma
            interstitialEvery: 1,        // her kod sorgusunda geçiş reklamı (1 = her sorgu)
            interstitialMinGapSec: 30,   // art arda sorgularda iki reklam arasında en az 30 sn (AdMob politikası)
            whatsappMinGapSec: 10,       // WhatsApp'a her dokunuşta reklam; iki reklam arası en az 10 sn (üst üste binmesin)
            whatsappWaitMs: 3000,        // reklam henüz yüklenmediyse WhatsApp'ı açmadan önce en fazla 3 sn bekle
        },
    };

    var GUIDE_IMAGES = { renault: "img/renault-precode.jpg", dacia: "img/dacia-precode.jpg" };

    var isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

    // Veri GitHub'dan okunur. Site GitHub Pages / githack üzerinden açıldığında
    // aynı depodaki ../data/ klasörü, mobil uygulamada ise doğrudan GitHub kullanılır.
    var DATA_BASES = (function () {
        var remote = [
            "https://raw.githubusercontent.com/" + CONFIG.repo + "/" + CONFIG.branch + "/data/",
            "https://cdn.jsdelivr.net/gh/" + CONFIG.repo + "@" + CONFIG.branch + "/data/",
        ];
        if (!isNative && /^https?:$/.test(location.protocol)) {
            return [new URL("../data/", location.href).href].concat(remote);
        }
        return remote;
    })();

    var CACHE_NAME = "rc-data-v1";

    // ---------------------------------------------------------------
    // Durum
    // ---------------------------------------------------------------
    var state = {
        lang: "tr",
        catalog: null,
        brandById: {},
        modelById: {},
        shards: {},
        search: "",
    };

    var view = document.getElementById("view");

    // ---------------------------------------------------------------
    // Yardımcılar
    // ---------------------------------------------------------------
    function store(key, value) {
        try {
            if (value === undefined) return JSON.parse(localStorage.getItem(key));
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            return null;
        }
    }

    var LANGS = window.I18N_LANGS || [{ code: "tr", name: "Türkçe", locale: "tr-TR", dir: "ltr" }, { code: "en", name: "English", locale: "en-GB", dir: "ltr" }];

    function langInfo(code) {
        for (var i = 0; i < LANGS.length; i++) if (LANGS[i].code === code) return LANGS[i];
        return null;
    }

    function locale() {
        var li = langInfo(state.lang);
        return li ? li.locale : "en-GB";
    }

    function t(key, vars) {
        var dict = window.I18N[state.lang] || window.I18N.tr;
        var s = dict[key] != null ? dict[key] : (window.I18N.en[key] != null ? window.I18N.en[key] : window.I18N.tr[key] || key);
        if (vars) {
            Object.keys(vars).forEach(function (k) {
                s = s.split("{" + k + "}").join(vars[k]);
            });
        }
        return s;
    }

    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function loc(v) {
        // Katalogda yalnızca tr/en metni varsa, Türkçe dışındaki dillerde İngilizcesi gösterilir
        if (v && typeof v === "object") return v[state.lang] || (state.lang === "tr" ? v.tr || v.en : v.en || v.tr) || "";
        return v || "";
    }

    function num(n) {
        return Number(n).toLocaleString(locale());
    }

    function waLink(text) {
        return "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(text);
    }

    function toast(msg) {
        var el = document.getElementById("toast");
        el.textContent = msg;
        el.classList.add("show");
        clearTimeout(toast._t);
        toast._t = setTimeout(function () {
            el.classList.remove("show");
        }, 2200);
    }

    function mono(brand) {
        return '<div class="mono" style="--h:' + Number(brand.hue || 220) + '" aria-hidden="true">' + esc(brand.mono) + "</div>";
    }

    var ICONS = {
        chev: '<svg class="chev" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
        search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
        key: '<svg viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="M10.8 12.2L20 3M16 7l3 3M14 9l2 2"/></svg>',
        info: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>',
        tag: '<svg viewBox="0 0 24 24"><path d="M3 12V4a1 1 0 011-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
        car: '<svg viewBox="0 0 24 24"><path d="M5 16l1.5-5A2 2 0 018.4 9.5h7.2a2 2 0 011.9 1.5L19 16M4 16h16v3H4zM7 19v1.5M17 19v1.5"/></svg>',
        copy: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a1 1 0 011-1h10"/></svg>',
        save: '<svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z"/></svg>',
        wa: '<svg viewBox="0 0 24 24"><path d="M4 20l1.3-4A8 8 0 1112 20a8 8 0 01-4-1z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 1c-1-.5-2-1.5-2.5-2.5l1-1-1-2z"/></svg>',
        chip: '<svg viewBox="0 0 24 24"><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/><rect x="6" y="6" width="12" height="12" rx="2"/></svg>',
        tool: '<svg viewBox="0 0 24 24"><path d="M14.7 6.3a4 4 0 00-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 005.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/></svg>',
        empty: '<svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z"/></svg>',
        trash: '<svg viewBox="0 0 24 24"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    };

    // ---------------------------------------------------------------
    // Veri erişimi (ağ öncelikli, önbellek yedekli)
    // ---------------------------------------------------------------
    function fetchFromBases(path, i) {
        i = i || 0;
        if (i >= DATA_BASES.length) return Promise.reject(new Error("network"));
        return fetch(DATA_BASES[i] + path, { cache: "no-cache" })
            .then(function (res) {
                if (!res.ok) throw new Error("HTTP " + res.status);
                return res.clone().json().then(function (json) {
                    if (window.caches) {
                        caches.open(CACHE_NAME).then(function (c) {
                            c.put("https://cache.local/data/" + path, res);
                        }).catch(function () {});
                    }
                    return json;
                });
            })
            .catch(function (err) {
                if (i + 1 < DATA_BASES.length) return fetchFromBases(path, i + 1);
                throw err;
            });
    }

    function fetchData(path) {
        return fetchFromBases(path).catch(function (err) {
            if (!window.caches) throw err;
            return caches.match("https://cache.local/data/" + path).then(function (res) {
                if (!res) throw err;
                return res.json();
            });
        });
    }

    function setCatalog(cat) {
        if (!cat || !cat.models) return false;
        state.catalog = cat;
        state.brandById = {};
        state.modelById = {};
        cat.brands.forEach(function (b) {
            b.models = [];
            state.brandById[b.id] = b;
        });
        cat.models.forEach(function (m) {
            state.modelById[m.id] = m;
            m.brands.forEach(function (bid) {
                if (state.brandById[bid]) state.brandById[bid].models.push(m);
            });
        });
        return true;
    }

    function loadCatalog() {
        // Uygulamaya gömülü katalog ile son indirilen katalogtan yeni olanı kullanılır
        var cached = store("rc.catalog");
        var ready = fetch("catalog.json")
            .then(function (r) { return r.json(); })
            .catch(function () { return null; })
            .then(function (bundled) {
                var best = bundled;
                if (cached && cached.models && (!best || String(cached.version) > String(best.version))) best = cached;
                setCatalog(best);
            });

        // GitHub'daki güncel katalog arka planda kontrol edilir
        var remote = fetchFromBases("catalog.json").then(function (cat) {
            return cat && cat.models ? cat : null;
        }, function () {
            return null;
        });

        return ready.then(function () {
            if (!state.catalog) {
                // Gömülü katalog yoksa GitHub'dakini bekle
                return remote.then(function (cat) {
                    if (cat) { store("rc.catalog", cat); setCatalog(cat); }
                });
            }
            remote.then(function (cat) {
                if (cat && cat.version !== state.catalog.version) {
                    store("rc.catalog", cat);
                    setCatalog(cat);
                    // Kullanıcı arama yaparken ekranı yeniden çizme
                    if (document.activeElement && document.activeElement.tagName === "INPUT") return;
                    render();
                }
            });
        });
    }

    function getShard(model, shard) {
        var key = model.id + "/" + shard;
        if (state.shards[key]) return Promise.resolve(state.shards[key]);
        return fetchData(model.id + "/" + shard + ".json").then(function (data) {
            state.shards[key] = data;
            return data;
        });
    }

    // Renault / Dacia precode algoritması
    function precodeToCode(precode) {
        var p = precode.toUpperCase();
        if (!/^[A-Z]\d{3}$/.test(p) || p.indexOf("A0") === 0) return null;
        var x = p.charCodeAt(1) + p.charCodeAt(0) * 10 - 698;
        var y = p.charCodeAt(3) + p.charCodeAt(2) * 10 + x - 528;
        var z = (y * 7) % 100;
        var code = Math.floor(z / 10) + (z % 10) * 10 + ((259 % x) % 100) * 100;
        return String(code).padStart(4, "0");
    }

    // Maske: 9 = rakam, A = harf, * = harf/rakam, diğer karakterler sabit (ör. Ford "M999999")
    function isSlot(c) {
        return c === "9" || c === "A" || c === "*";
    }

    function fits(ch, slot) {
        if (slot === "9") return /[0-9]/.test(ch);
        if (slot === "A") return /[A-Z]/.test(ch);
        return /[A-Z0-9]/.test(ch);
    }

    function applyMask(raw, mask) {
        var src = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (!mask) return src;
        var out = "";
        var i = 0;
        for (var p = 0; p < mask.length && i < src.length; p++) {
            var slot = mask.charAt(p);
            if (isSlot(slot)) {
                while (i < src.length && !fits(src.charAt(i), slot)) i++;
                if (i >= src.length) break;
                out += src.charAt(i++);
            } else {
                out += slot;
                if (src.charAt(i) === slot) i++;
            }
        }
        return out;
    }

    // "A999" -> "1 harf + 3 rakam", "M999999" -> "M + 6 rakam"
    function describeMask(mask) {
        if (mask.indexOf("*") !== -1) return t("fmtMixed", { n: mask.length });
        var parts = [];
        var re = /(9+|A+|[^9A*]+)/g;
        var mt;
        while ((mt = re.exec(mask))) {
            var run = mt[1];
            if (run.charAt(0) === "9") parts.push(t(run.length === 1 ? "fmtDigit1" : "fmtDigits", { n: run.length }));
            else if (run.charAt(0) === "A") parts.push(t(run.length === 1 ? "fmtLetter1" : "fmtLetters", { n: run.length }));
            else parts.push(run);
        }
        return parts.join(" + ");
    }

    function lookup(model, rawInput) {
        var input = rawInput.replace(/[\s-]/g, "").toUpperCase();

        if (model.type === "renault") {
            if (input.length !== 4) return Promise.resolve({ error: t("errPrecode") });
            var c = precodeToCode(input);
            return Promise.resolve(c ? { code: c, serial: input } : { error: t("errPrecode") });
        }

        var keyLen = model.keyLen || model.maxLen;
        var mask = model.mask || "";
        if (mask && input.length !== mask.length) {
            return Promise.resolve({ error: t("errFormat", { fmt: describeMask(mask), n: mask.length }) });
        }

        var key = input.slice(-keyLen);
        var shard = key.slice(-(state.catalog.shardLen || 2));
        return getShard(model, shard).then(
            function (data) {
                return data[key] ? { code: data[key], serial: input } : { error: t("errNotFound"), notFound: true };
            },
            function () {
                return { error: t("errNetwork") };
            }
        );
    }

    // ---------------------------------------------------------------
    // Kayıtlı kodlar
    // ---------------------------------------------------------------
    function savedList() {
        return store("rc.saved") || [];
    }

    function saveCode(model, serial, code) {
        var list = savedList().filter(function (s) {
            return !(s.modelId === model.id && s.serial === serial);
        });
        list.unshift({ modelId: model.id, serial: serial, code: code, ts: Date.now() });
        store("rc.saved", list.slice(0, 200));
    }

    function copyText(text) {
        var done = function () { toast(t("copied")); };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done, fallback);
        } else {
            fallback();
        }
        function fallback() {
            var ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand("copy"); done(); } catch (e) {}
            document.body.removeChild(ta);
        }
    }

    // ---------------------------------------------------------------
    // Görünümler
    // ---------------------------------------------------------------
    function modelMeta(m) {
        if (m.type === "renault") return '<span class="badge">' + esc(t("algo")) + "</span>";
        if (m.type === "support") return '<span class="badge wa">' + esc(t("supportOnly")) + "</span>";
        return '<span class="badge">' + esc(t("modelCount", { n: num(m.count) })) + "</span>";
    }

    function modelItem(m) {
        var brand = state.brandById[m.brands[0]];
        return (
            '<a class="list-item" href="#/model/' + encodeURIComponent(m.id) + '">' +
            mono(brand) +
            '<div class="body"><div class="title">' + esc(loc(m.name)) + modelMeta(m) + "</div>" +
            '<div class="meta">' + esc(m.units || m.cars || "") + "</div></div>" +
            ICONS.chev + "</a>"
        );
    }

    function brandTile(b) {
        return (
            '<a class="brand-tile" href="#/brand/' + encodeURIComponent(b.id) + '">' +
            mono(b) +
            '<div><div class="name">' + esc(b.name) + '</div><div class="sub">' + esc(b.models.length === 1 ? t("model1") : t("models", { n: b.models.length })) + "</div></div></a>"
        );
    }

    function renderHome() {
        var cat = state.catalog;
        var dbModels = cat.models.filter(function (m) { return m.type !== "support"; }).length;
        view.innerHTML =
            '<section class="hero">' +
            "<h1>" + esc(t("heroTitle")) + "</h1>" +
            "<p>" + esc(t("heroText")) + "</p>" +
            '<label class="search">' + ICONS.search +
            '<input id="q" type="search" autocomplete="off" placeholder="' + esc(t("searchPh")) + '" value="' + esc(state.search) + '"></label>' +
            '<div class="stats"><span>' + esc(t("statCodes", { n: num(cat.totalCodes) })) + "</span><span>" +
            esc(t("statModels", { n: dbModels })) + "</span><span>" + esc(t("statLang")) + "</span></div>" +
            "</section>" +
            '<div id="homeBody"></div>' +
            '<p class="footer-note">' + esc(t("legalText")) + "</p>";

        var q = document.getElementById("q");
        q.addEventListener("input", function () {
            state.search = q.value;
            renderHomeBody();
        });
        renderHomeBody();
    }

    function renderHomeBody() {
        var body = document.getElementById("homeBody");
        var cat = state.catalog;
        var q = state.search.trim().toLocaleLowerCase(state.lang);

        if (!q) {
            body.innerHTML =
                '<div class="section-title">' + esc(t("brands")) + "<small>" + esc(t("brandsHint", { n: cat.brands.length })) + "</small></div>" +
                '<div class="brand-grid">' + cat.brands.map(brandTile).join("") + "</div>";
            return;
        }

        var brands = cat.brands.filter(function (b) {
            return (b.name + " " + (b.tags || "")).toLocaleLowerCase(state.lang).indexOf(q) !== -1;
        });
        var models = cat.models.filter(function (m) {
            if (m.type === "support") return false;
            var hay = [loc(m.name), m.units, m.cars].join(" ").toLocaleLowerCase(state.lang);
            return hay.indexOf(q) !== -1;
        });

        var html = "";
        if (brands.length) html += '<div class="section-title">' + esc(t("brands")) + '</div><div class="brand-grid">' + brands.map(brandTile).join("") + "</div>";
        if (models.length) html += '<div class="section-title">' + esc(t("results")) + '</div><div class="list">' + models.map(modelItem).join("") + "</div>";
        if (!html) {
            html = '<div class="card empty">' + ICONS.search + "<p>" + esc(t("noResults")) + '</p><a class="btn wa" target="_blank" rel="noopener" href="' +
                esc(waLink(t("waGeneral"))) + '">' + ICONS.wa + esc(t("whatsapp")) + "</a></div>";
        }
        body.innerHTML = html;
    }

    function renderBrand(id) {
        var b = state.brandById[id];
        if (!b) return go("#/");
        view.innerHTML =
            '<div class="page-head">' + mono(b) + "<div><h1>" + esc(b.name) + "</h1><p>" + esc(t("chooseModel")) + "</p></div></div>" +
            '<div class="list">' + b.models.map(modelItem).join("") + "</div>";
    }

    // Her model için özgün, çizimli 3 adımlı rehber (SVG)
    function guideSteps(m) {
        var example = m.example || m.placeholder || "";
        var keyLen = m.type === "renault" ? example.length : (m.keyLen || example.length);
        var head = example.slice(0, Math.max(0, example.length - keyLen));
        var tail = example.slice(-keyLen);
        var isPre = m.type === "renault";
        var fs = example.length > 11 ? 13 : 16;

        var svg1 =
            '<svg viewBox="0 0 240 140" class="ill" aria-hidden="true">' +
            '<rect x="20" y="22" width="200" height="96" rx="14" class="ill-dash"/>' +
            '<rect x="44" y="40" width="152" height="60" rx="8" class="ill-slot"/>' +
            '<g class="ill-slide"><rect x="62" y="50" width="152" height="60" rx="8" class="ill-unit"/>' +
            '<rect x="76" y="60" width="70" height="18" rx="4" class="ill-screen"/>' +
            '<circle cx="186" cy="70" r="10" class="ill-knob"/>' +
            '<g class="ill-btn"><rect x="76" y="86" width="14" height="12" rx="3"/><rect x="94" y="86" width="14" height="12" rx="3"/><rect x="112" y="86" width="14" height="12" rx="3"/><rect x="130" y="86" width="14" height="12" rx="3"/></g></g>' +
            '<path d="M150 36 h56 M198 30 l8 6 l-8 6" class="ill-arrow"/>' +
            '<path d="M20 128 h34 v-14 M20 134 h34" class="ill-key"/><path d="M186 128 h34 v-14 M186 134 h34" class="ill-key"/>' +
            "</svg>";

        var svg2 =
            '<svg viewBox="0 0 240 140" class="ill" aria-hidden="true">' +
            '<path d="M30 40 L120 18 L210 40 L210 104 L120 126 L30 104 Z" class="ill-unit"/>' +
            '<path d="M30 40 L120 62 L210 40 M120 62 V126" class="ill-edge"/>' +
            '<rect x="36" y="50" width="168" height="66" rx="8" class="ill-label"/>' +
            '<g class="ill-bars">' + [0, 4, 6, 10, 13, 17, 19, 23, 27, 29, 33, 36, 40].map(function (x) {
                return '<rect x="' + (48 + x) + '" y="58" width="2" height="16"/>';
            }).join("") + "</g>" +
            '<text x="102" y="70" class="ill-small">' + (isPre ? "PRE CODE" : "S/N") + "</text>" +
            '<text x="120" y="100" text-anchor="middle" class="ill-serial" style="font-size:' + fs + 'px">' +
            '<tspan class="ill-dim">' + esc(head) + '</tspan><tspan class="ill-hl">' + esc(tail) + "</tspan></text>" +
            '<circle cx="196" cy="108" r="20" class="ill-lens"/><path d="M210 122 l14 14" class="ill-lens-h"/>' +
            "</svg>";

        var nBtn = 6;
        var btns = "";
        for (var i = 0; i < nBtn; i++) {
            var x = 40 + i * 28;
            btns += '<g class="' + (i < 4 ? "ill-btn-on" : "ill-btn-off") + '"><rect x="' + x + '" y="88" width="22" height="20" rx="5"/>' +
                '<text x="' + (x + 11) + '" y="102" text-anchor="middle">' + (i + 1) + "</text></g>";
        }
        var svg3 =
            '<svg viewBox="0 0 240 140" class="ill" aria-hidden="true">' +
            '<rect x="20" y="26" width="200" height="96" rx="14" class="ill-unit"/>' +
            '<rect x="40" y="40" width="120" height="36" rx="6" class="ill-screen"/>' +
            '<text x="100" y="65" text-anchor="middle" class="ill-lcd">CODE - - - -</text>' +
            '<circle cx="190" cy="58" r="16" class="ill-knob"/>' + btns +
            "</svg>";

        var step2Text = isPre
            ? t("stepLabelPre", { ex: example })
            : (head ? t("stepLabelTail", { n: keyLen, ex: tail }) : t("stepLabelFull", { ex: example }));

        function step(n, svg, title, text) {
            return '<div class="step"><div class="step-art">' + svg + '<span class="step-n">' + n + '</span></div><div class="step-body"><div class="step-title">' +
                esc(title) + '</div><div class="step-text">' + esc(text) + "</div></div></div>";
        }

        return '<div class="card info-card steps-card"><h3>' + ICONS.info + esc(t("guideTitle")) + '</h3><div class="steps">' +
            step(1, svg1, t("stepRemove"), t("stepRemoveText")) +
            step(2, svg2, t("stepLabel"), step2Text) +
            step(3, svg3, t("stepEnter"), loc(m.guide) || t("stepEnterText")) +
            "</div></div>";
    }

    function infoCards(m) {
        var html = "";
        var img = GUIDE_IMAGES[m.id];
        html += '<div class="card info-card"><h3>' + ICONS.tag + esc(t("whereSerial")) + "</h3><p>" + esc(loc(m.where) || t("whereSerialText")) + "</p>" +
            (img ? '<img class="guide-img" src="' + img + '" alt="" loading="lazy">' : "") + "</div>";
        if (m.cars || m.units) {
            html += '<div class="card info-card"><h3>' + ICONS.car + esc(t("compatible")) + "</h3><dl>" +
                (m.cars ? "<dt>" + esc(t("cars")) + "</dt><dd>" + esc(m.cars) + "</dd>" : "") +
                (m.units ? "<dt>" + esc(t("units")) + "</dt><dd>" + esc(m.units) + "</dd>" : "") + "</dl></div>";
        }
        return html;
    }

    function renderModel(id) {
        var m = state.modelById[id];
        if (!m) return go("#/");
        var brand = state.brandById[m.brands[0]];
        var head = '<div class="page-head">' + mono(brand) + "<div><h1>" + esc(loc(m.name)) + "</h1><p>" + esc(brand.name) + "</p></div></div>";

        if (m.type === "support") {
            view.innerHTML = head + '<div class="layout-2"><div class="card info-card"><h3>' + ICONS.wa + esc(t("supportTitle")) + "</h3><p>" +
                esc(t("supportText")) + '</p><a class="btn wa" target="_blank" rel="noopener" href="' +
                esc(waLink(t("waModel", { model: brand.name + " " + loc(m.name), serial: "" }))) + '">' + ICONS.wa + esc(t("whatsapp")) + "</a></div>" +
                "<div>" + infoCards(m) + "</div></div>";
            return;
        }

        var mask = m.mask || "";
        var numeric = !!mask && !/[A*]/.test(mask);

        view.innerHTML = head +
            '<div class="layout-2"><div>' +
            '<div class="card"><form id="lookupForm" class="field" autocomplete="off" novalidate>' +
            '<label for="serial">' + esc(loc(m.label) || t("serialLabel")) + "</label>" +
            '<input id="serial" name="serial" inputmode="' + (numeric ? "numeric" : "text") + '" autocapitalize="characters" spellcheck="false" maxlength="' +
            mask.length + '" placeholder="' + esc(m.placeholder || "") + '">' +
            '<div class="hint"><span>' + esc(t("format")) + ": <strong>" + esc(describeMask(mask)) + '</strong></span><span id="count">0 / ' + mask.length + "</span></div>" +
            '<button class="btn" id="findBtn" type="submit">' + ICONS.key + "<span>" + esc(t("find")) + "</span></button>" +
            '</form><div id="out"></div></div>' +
            '<div class="alert info" style="margin-top:14px">' + esc(t("warnTries")) + "</div>" +
            guideSteps(m) +
            "</div><div>" + infoCards(m) + "</div></div>";

        var form = document.getElementById("lookupForm");
        var input = document.getElementById("serial");
        var out = document.getElementById("out");
        var btn = document.getElementById("findBtn");

        input.addEventListener("input", function () {
            var v = applyMask(input.value, mask);
            if (v !== input.value) input.value = v;
            document.getElementById("count").textContent = v.length + " / " + mask.length;
        });

        // Tam seri no yapıştırılırsa ve model yalnızca son haneleri istiyorsa son haneleri al
        input.addEventListener("paste", function (e) {
            var text = (e.clipboardData || window.clipboardData).getData("text") || "";
            var clean = text.toUpperCase().replace(/[^A-Z0-9]/g, "");
            var tailOnly = (m.example || "").length > mask.length;
            if (tailOnly && clean.length > mask.length) {
                e.preventDefault();
                input.value = applyMask(clean.slice(-mask.length), mask);
                input.dispatchEvent(new Event("input"));
            }
        });

        form.addEventListener("submit", function (e) {
            e.preventDefault();
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span><span>' + esc(t("searching")) + "</span>";
            lookup(m, input.value).then(function (r) {
                // Kod bulunduğunda ya da veritabanında arandığında (bulunamadı) reklam gösterilir;
                // yalnızca hatalı biçimde girilen seri numaralarında gösterilmez.
                return (r.code || r.notFound) ? Ads.beforeResult().then(function () { return r; }) : r;
            }).then(function (r) {
                btn.disabled = false;
                btn.innerHTML = ICONS.key + "<span>" + esc(t("find")) + "</span>";
                if (r.code) {
                    out.innerHTML =
                        '<div class="result"><div class="label">' + esc(t("yourCode")) + '</div><div class="code">' + esc(r.code) + "</div>" +
                        '<div class="btn-row"><button class="btn secondary" id="copyBtn" type="button">' + ICONS.copy + esc(t("copy")) + "</button>" +
                        '<button class="btn secondary" id="saveBtn" type="button">' + ICONS.save + esc(t("save")) + "</button></div></div>" +
                        '<a class="btn secondary" style="height:44px;font-size:13.5px" target="_blank" rel="noopener" href="' +
                        esc(waLink(t("waModel", { model: brand.name + " " + loc(m.name), serial: r.serial }))) + '">' + esc(t("needHelp")) + "</a>";
                    document.getElementById("copyBtn").onclick = function () { copyText(r.code); };
                    document.getElementById("saveBtn").onclick = function () {
                        saveCode(m, r.serial, r.code);
                        toast(t("saved"));
                    };
                } else {
                    out.innerHTML = '<div class="alert">⚠️ ' + esc(r.error) + "</div>" +
                        (r.notFound ? '<a class="btn wa" target="_blank" rel="noopener" href="' +
                            esc(waLink(t("waModel", { model: brand.name + " " + loc(m.name), serial: input.value.trim().toUpperCase() }))) +
                            '">' + ICONS.wa + esc(t("whatsapp")) + "</a>" : "");
                }
            });
        });
    }

    function renderCodes() {
        var list = savedList();
        var html = '<div class="page-head"><div><h1>' + esc(t("myCodes")) + "</h1></div></div>";
        if (!list.length) {
            html += '<div class="card empty">' + ICONS.empty + "<p>" + esc(t("noSaved")) + "</p></div>";
        } else {
            html += '<div class="list">' + list.map(function (s, i) {
                var m = state.modelById[s.modelId];
                var brand = m ? state.brandById[m.brands[0]] : { mono: "?", hue: 220 };
                return '<div class="list-item saved-item">' + mono(brand) +
                    '<div class="body"><div class="title">' + esc(m ? loc(m.name) : s.modelId) + '</div><div class="meta">' + esc(s.serial) +
                    " · " + esc(new Date(s.ts).toLocaleDateString(locale())) + "</div></div>" +
                    '<button class="icon-btn" data-copy="' + esc(s.code) + '" aria-label="' + esc(t("copy")) + '"><span class="code" style="font-size:15px;padding:0 4px">' +
                    esc(s.code) + "</span></button>" +
                    '<button class="icon-btn del" data-del="' + i + '" aria-label="' + esc(t("remove")) + '">' + ICONS.trash + "</button></div>";
            }).join("") + "</div>";
        }
        view.innerHTML = html;
        view.querySelectorAll("[data-copy]").forEach(function (b) {
            b.style.width = "auto";
            b.onclick = function () { copyText(b.getAttribute("data-copy")); };
        });
        view.querySelectorAll("[data-del]").forEach(function (b) {
            b.onclick = function () {
                var l = savedList();
                l.splice(Number(b.getAttribute("data-del")), 1);
                store("rc.saved", l);
                toast(t("removed"));
                renderCodes();
            };
        });
    }

    function serviceCard(icon, title, text, wa) {
        return '<div class="card service"><div class="service-icon">' + icon + '</div><div class="service-body"><h3>' + esc(title) + "</h3><p>" + esc(text) +
            '</p></div><a class="btn wa" target="_blank" rel="noopener" href="' + esc(waLink(wa)) + '">' + ICONS.wa + esc(t("whatsapp")) + "</a></div>";
    }

    // Program dosyası listelenmez; yalnızca uzman desteğiyle çözülebilen teyp türleri
    var EXPERT_RADIOS = [
        "Blaupunkt", "Grundig", "Philips", "Clarion PU-9317 / 9318 / 9654", "Volvo CR / SC", "Honda",
        "Hyundai / Kia", "Kenwood", "Pioneer", "JVC", "Mercedes Audio 10", "Fiat / Alfa / Peugeot (Blaupunkt)",
        "Ford L / C", "Opel SC303D",
    ];

    function servicesTabs(active) {
        var tabs = [["", t("tabSvcMain")], ["radios", t("tabSvcRadios")], ["calcs", t("tabSvcCalcs")]];
        return '<div class="seg" role="tablist">' + tabs.map(function (tb) {
            return '<a role="tab" href="#/services' + (tb[0] ? "/" + tb[0] : "") + '" class="' + (tb[0] === active ? "active" : "") + '">' + esc(tb[1]) + "</a>";
        }).join("") + "</div>";
    }

    function renderServices(sub) {
        var head = '<div class="page-head"><div><h1>' + esc(t("servicesTitle")) + "</h1><p>" + esc(t("servicesText")) + "</p></div></div>";
        sub = sub === "radios" || sub === "calcs" ? sub : "";

        if (sub === "radios") return renderRadios(head);
        if (sub === "calcs") return renderCalcs(head);

        view.innerHTML = head + servicesTabs("") +
            '<div class="stack">' +
            serviceCard(ICONS.chip, t("svcEeprom"), t("svcEepromText"), t("waEeprom")) +
            serviceCard(ICONS.search, t("svcSerial"), t("svcSerialText"), t("waSerial")) +
            serviceCard(ICONS.tool, t("svcPro"), t("svcProText"), t("waPro")) +
            "</div>";
    }

    function renderRadios(head) {
        var groups = state.catalog.radios || [];
        var total = groups.reduce(function (n, g) { return n + g.items.length; }, 0);
        view.innerHTML = head + servicesTabs("radios") +
            '<div class="alert info" style="margin:0 0 14px">' + esc(t("radiosText", { n: total })) + "</div>" +
            '<label class="search search-plain">' + ICONS.search + '<input id="rq" type="search" autocomplete="off" placeholder="' + esc(t("radiosSearch")) + '"></label>' +
            '<div id="radioList"></div>';

        var q = document.getElementById("rq");
        function draw() {
            var term = q.value.trim().toLocaleLowerCase(state.lang);
            var html = "";
            groups.forEach(function (g) {
                var items = g.items.filter(function (it) {
                    return !term || (g.name + " " + it).toLocaleLowerCase(state.lang).indexOf(term) !== -1;
                });
                if (!items.length) return;
                var gname = g.name === "Diğer" ? t("otherGroup") : g.name;
                html += '<div class="section-title">' + esc(gname) + "<small>" + items.length + "</small></div>" +
                    '<div class="chips">' + items.map(function (it) {
                        return '<a class="chip" target="_blank" rel="noopener" href="' + esc(waLink(t("waRadio", { radio: it }))) + '">' + esc(it) + "</a>";
                    }).join("") + "</div>";
            });
            document.getElementById("radioList").innerHTML = html ||
                '<div class="card empty"><p>' + esc(t("radiosNone")) + '</p><a class="btn wa" target="_blank" rel="noopener" href="' +
                esc(waLink(t("waRadio", { radio: q.value.trim() }))) + '">' + ICONS.wa + esc(t("whatsapp")) + "</a></div>";
        }
        q.addEventListener("input", draw);
        draw();
    }

    function renderCalcs(head) {
        var models = state.catalog.models.filter(function (m) { return m.type !== "support"; });
        view.innerHTML = head + servicesTabs("calcs") +
            '<div class="alert info" style="margin:0 0 14px">' + esc(t("calcsText", { n: models.length })) + "</div>" +
            '<div class="section-title">' + esc(t("calcsInApp")) + "<small>" + models.length + "</small></div>" +
            '<div class="list">' + models.map(modelItem).join("") + "</div>" +
            '<div class="section-title">' + esc(t("calcsExpert")) + "<small>" + EXPERT_RADIOS.length + "</small></div>" +
            '<div class="chips">' + EXPERT_RADIOS.map(function (r) {
                return '<a class="chip" target="_blank" rel="noopener" href="' + esc(waLink(t("waModel", { model: r, serial: "" }))) + '">' + esc(r) + "</a>";
            }).join("") + "</div>";
    }

    function renderAbout() {
        view.innerHTML = '<div class="page-head"><div><h1>' + esc(t("aboutTitle")) + "</h1></div></div>" +
            '<div class="card prose"><p>' + esc(t("aboutText")) + "</p>" +
            "<h2>" + esc(t("legalTitle")) + "</h2><p>" + esc(t("legalText")) + "</p><p>" + esc(t("legalUse")) + "</p>" +
            "<h2>" + esc(t("version")) + '</h2><p id="versionTap">' + esc(state.catalog.version) + "</p>" +
            '<pre id="adDiag" style="display:none;white-space:pre-wrap;font-size:11px;max-height:50vh;overflow:auto"></pre>' +
            '<div class="btn-row"><a class="btn secondary" href="privacy.html' + (state.lang === "tr" ? "" : "#en") + '">' + esc(t("privacy")) + "</a>" +
            (Ads.privacyRequired ? '<button class="btn secondary" id="adPrivacyBtn" type="button">' + esc(t("adPrivacy")) + "</button>" : "") +
            "</div></div>";
        var ap = document.getElementById("adPrivacyBtn");
        if (ap) ap.onclick = function () { Ads.showPrivacyOptions(); };
        // Gizli reklam teşhis paneli: sürüm numarasına 7 kez dokun
        var vt = document.getElementById("versionTap"), taps = 0;
        if (vt) vt.onclick = function () {
            if (++taps < 7) return;
            taps = 0;
            var d = document.getElementById("adDiag");
            d.textContent = "AdMob teşhis\nready=" + Ads.ready + " interstitialReady=" + Ads.interstitialReady + "\n\n" +
                (Ads.logs.join("\n") || "(kayıt yok)");
            d.style.display = "block";
        };
    }

    // ---------------------------------------------------------------
    // Yönlendirme
    // ---------------------------------------------------------------
    function go(hash) {
        location.hash = hash;
    }

    function render() {
        if (!state.catalog) return;
        var parts = (location.hash.replace(/^#\/?/, "") || "").split("/").map(decodeURIComponent);
        var page = parts[0] || "";
        var tab = { "": "home", brand: "home", model: "home", codes: "codes", services: "services", about: "about" }[page] || "home";

        document.querySelectorAll(".tabbar a").forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("data-tab") === tab);
        });
        document.getElementById("backBtn").hidden = page === "" || page === "codes" || page === "services" || page === "about";

        if (page === "brand") renderBrand(parts[1]);
        else if (page === "model") renderModel(parts[1]);
        else if (page === "codes") renderCodes();
        else if (page === "services") renderServices(parts[1]);
        else if (page === "about") renderAbout();
        else renderHome();
    }

    function onRoute() {
        render();
        window.scrollTo(0, 0);
    }

    // ---------------------------------------------------------------
    // Dil ve tema
    // ---------------------------------------------------------------
    function applyLang(lang) {
        state.lang = langInfo(lang) && window.I18N[lang] ? lang : "en";
        store("rc.lang", state.lang);
        document.documentElement.lang = state.lang;
        document.documentElement.dir = langInfo(state.lang).dir || "ltr";
        document.title = t("appName");
        document.getElementById("langBtn").textContent = state.lang.toUpperCase();
        document.getElementById("langBtn").setAttribute("aria-label", t("language"));
        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            el.textContent = t(el.getAttribute("data-i18n"));
        });
        document.getElementById("backBtn").setAttribute("aria-label", t("back"));
        document.getElementById("themeBtn").setAttribute("aria-label", t("theme"));
    }

    // Dil seçim menüsü
    function closeLangMenu() {
        var menu = document.getElementById("langMenu");
        if (menu) menu.parentNode.removeChild(menu);
        document.getElementById("langBtn").setAttribute("aria-expanded", "false");
    }

    function openLangMenu() {
        if (document.getElementById("langMenu")) return closeLangMenu();
        var menu = document.createElement("div");
        menu.id = "langMenu";
        menu.className = "lang-menu";
        menu.setAttribute("role", "menu");
        menu.setAttribute("aria-label", t("selectLanguage"));
        menu.innerHTML = '<div class="lang-menu-title">' + esc(t("selectLanguage")) + "</div>" + LANGS.map(function (l) {
            return '<button type="button" role="menuitemradio" aria-checked="' + (l.code === state.lang) + '" data-lang="' + l.code + '" dir="' + l.dir + '" class="' +
                (l.code === state.lang ? "active" : "") + '"><span>' + esc(l.name) + '</span><small>' + l.code.toUpperCase() + "</small></button>";
        }).join("");
        document.body.appendChild(menu);
        document.getElementById("langBtn").setAttribute("aria-expanded", "true");
        menu.querySelectorAll("[data-lang]").forEach(function (b) {
            b.onclick = function (e) {
                e.stopPropagation();
                closeLangMenu();
                if (b.getAttribute("data-lang") !== state.lang) {
                    applyLang(b.getAttribute("data-lang"));
                    render();
                }
            };
        });
    }

    function detectLang() {
        var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
        for (var i = 0; i < list.length; i++) {
            var code = String(list[i] || "").toLowerCase().split("-")[0];
            if (langInfo(code) && window.I18N[code]) return code;
        }
        return "en";
    }

    // ---------------------------------------------------------------
    // AdMob reklamları (yalnızca Android uygulamasında çalışır; web'de hiçbir şey yapmaz)
    // ---------------------------------------------------------------
    var Ads = {
        ready: false,
        privacyRequired: false,
        interstitialReady: false,
        interstitialLoading: false,
        queryCount: 0,
        lastInterstitial: 0,
        afterAd: [], // reklam kapanınca çalışacak işler (ör. WhatsApp'ı açmak)
        plugin: function () {
            return isNative && CONFIG.admob.enabled && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob;
        },
        // Teşhis kaydı: Hakkında sayfasında sürüm numarasına 7 kez dokununca görünür.
        logs: [],
        log: function (msg, data) {
            var line = new Date().toTimeString().slice(0, 8) + " " + msg;
            if (data !== undefined) {
                try { line += " " + (typeof data === "string" ? data : JSON.stringify(data)); } catch (e) {}
            }
            Ads.logs.push(line);
            if (Ads.logs.length > 100) Ads.logs.shift();
        },
        errText: function (e) {
            if (!e) return "";
            if (e.code !== undefined || e.message) return "code=" + e.code + " " + (e.message || "");
            return String(e);
        },
        init: function () {
            Ads.log("native=" + isNative + " enabled=" + CONFIG.admob.enabled + " testing=" + !!CONFIG.admob.testing +
                " plugin=" + !!(window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.AdMob));
            var A = Ads.plugin();
            if (!A) return;
            A.initialize({ initializeForTesting: !!CONFIG.admob.testing })
                .then(function () {
                    Ads.log("initialize OK");
                    // Onay (UMP) adımındaki bir hata reklamları tamamen durdurmasın
                    return A.requestConsentInfo().catch(function (e) {
                        Ads.log("requestConsentInfo HATA", Ads.errText(e));
                        return null;
                    });
                })
                .then(function (info) {
                    Ads.log("consent", info);
                    if (info && info.isConsentFormAvailable && info.status === "REQUIRED") {
                        return A.showConsentForm().catch(function (e) {
                            Ads.log("showConsentForm HATA", Ads.errText(e));
                            return info;
                        });
                    }
                    return info;
                })
                .then(function (info) {
                    Ads.privacyRequired = !!(info && info.privacyOptionsRequirementStatus === "REQUIRED");
                    if (info && info.canRequestAds === false) {
                        Ads.log("canRequestAds=false, reklam istenmiyor");
                        return;
                    }
                    Ads.ready = true;
                    Ads.showBanner();
                    Ads.prepareInterstitial();
                })
                .catch(function (e) { Ads.log("initialize HATA", Ads.errText(e)); });

            A.addListener("bannerAdLoaded", function () {
                Ads.log("banner yüklendi");
                Ads.bannerRetries = 0;
            });
            A.addListener("bannerAdSizeChanged", function (size) {
                var h = size && size.height ? Number(size.height) : 0;
                document.documentElement.style.setProperty("--ad-h", h + "px");
            });
            A.addListener("bannerAdFailedToLoad", function (e) {
                Ads.log("banner HATA", Ads.errText(e));
                document.documentElement.style.setProperty("--ad-h", "0px");
                Ads.retryBanner();
            });
            A.addListener("interstitialAdLoaded", function () { Ads.log("geçiş reklamı yüklendi"); });
            A.addListener("interstitialAdFailedToLoad", function (e) { Ads.log("geçiş reklamı HATA", Ads.errText(e)); });
            // Geçiş reklamı kapandığında ya da gösterilemediğinde bir sonraki sorgu için yenisini hazırla
            A.addListener("interstitialAdDismissed", function () { Ads.flushAfterAd(); Ads.prepareInterstitial(); });
            A.addListener("interstitialAdFailedToShow", function () { Ads.flushAfterAd(); Ads.prepareInterstitial(); });
        },
        showBanner: function () {
            var A = Ads.plugin();
            if (!A || !Ads.ready) return;
            A.showBanner({
                adId: CONFIG.admob.bannerId,
                adSize: "ADAPTIVE_BANNER",
                position: "BOTTOM_CENTER",
                margin: 0,
                isTesting: !!CONFIG.admob.testing,
            }).catch(function (e) { Ads.log("showBanner HATA", Ads.errText(e)); });
        },
        // Banner yüklenemezse (ör. "No fill") artan aralıklarla yeniden dene: 1, 2, 4 dk ... en fazla 5 dk
        bannerRetries: 0,
        bannerRetryTimer: null,
        retryBanner: function () {
            if (Ads.bannerRetryTimer) return;
            var delay = Math.min(60000 * Math.pow(2, Ads.bannerRetries), 300000);
            Ads.bannerRetries++;
            Ads.log("banner " + Math.round(delay / 1000) + " sn sonra yeniden denenecek");
            Ads.bannerRetryTimer = setTimeout(function () {
                Ads.bannerRetryTimer = null;
                var A = Ads.plugin();
                if (!A) return;
                A.removeBanner().catch(function () {}).then(function () { Ads.showBanner(); });
            }, delay);
        },
        prepareInterstitial: function () {
            var A = Ads.plugin();
            if (!A || !Ads.ready) return;
            if (Ads.interstitialLoading) return;
            Ads.interstitialReady = false;
            Ads.interstitialLoading = true;
            A.prepareInterstitial({ adId: CONFIG.admob.interstitialId, isTesting: !!CONFIG.admob.testing })
                .then(function () { Ads.interstitialReady = true; })
                .catch(function (e) { Ads.log("prepareInterstitial HATA", Ads.errText(e)); })
                .then(function () { Ads.interstitialLoading = false; });
        },
        flushAfterAd: function () {
            var list = Ads.afterAd;
            Ads.afterAd = [];
            list.forEach(function (fn) { try { fn(); } catch (e) {} });
        },
        // Geçiş reklamı şu an gösterilebilir mi (yüklü + iki reklam arası en az interstitialMinGapSec)
        canShowInterstitial: function () {
            var A = Ads.plugin();
            if (A && Ads.ready && !Ads.interstitialReady) Ads.prepareInterstitial(); // önceki yükleme başarısızsa tekrar dene
            return !!(A && Ads.ready && Ads.interstitialReady &&
                Date.now() - Ads.lastInterstitial >= CONFIG.admob.interstitialMinGapSec * 1000);
        },
        // Tam ekran geçiş reklamını açar; done() reklam kapandıktan sonra çağrılır.
        // Sonraki reklam bu reklam kapandıktan sonra hazırlanır (interstitialAdDismissed);
        // gösterim sırasında hazırlanırsa eklenti kapanışta yeni hazırlanan reklamı da siler.
        showInterstitial: function (done) {
            var A = Ads.plugin();
            Ads.lastInterstitial = Date.now();
            Ads.interstitialReady = false;
            if (done) Ads.afterAd.push(done);
            return A.showInterstitial().catch(function () {
                Ads.flushAfterAd();
                Ads.prepareInterstitial();
            });
        },
        // Her kod sorgusunda, sonuç gösterilmeden önce çağrılır; sıklık sınırına göre tam ekran geçiş
        // reklamı açar, sonuç reklamın arkasında hazırlanır ve reklam kapanınca görünür.
        // Reklam henüz yüklenmediyse sonuç beklemeden gösterilir.
        beforeResult: function () {
            Ads.queryCount++;
            if (Ads.queryCount % CONFIG.admob.interstitialEvery !== 0 || !Ads.canShowInterstitial()) {
                return Promise.resolve();
            }
            return Ads.showInterstitial();
        },
        // WhatsApp'a yönlendirmeden önce reklam gösterir; reklam kapanınca WhatsApp açılır.
        // Reklam yoksa (yüklenmedi / az önce reklam gösterildi) WhatsApp hemen açılır.
        // WhatsApp'a her dokunuşta reklam: kod sorgusundaki 30 sn sınırı yerine yalnızca
        // whatsappMinGapSec (art arda dokunmada iki reklam üst üste binmesin). Reklam henüz
        // yüklenmediyse en fazla whatsappWaitMs bekler, yine yoksa WhatsApp'ı reklamsız açar.
        waBusy: false,
        beforeWhatsApp: function (open) {
            if (Ads.waBusy) return; // reklam açılırken ikinci dokunuşu yok say
            var A = Ads.plugin();
            var gapOk = function () {
                return Date.now() - Ads.lastInterstitial >= CONFIG.admob.whatsappMinGapSec * 1000;
            };
            if (!A || !Ads.ready || !gapOk()) return open();
            if (!Ads.interstitialReady) Ads.prepareInterstitial();
            Ads.waBusy = true;
            var started = Date.now();
            var finish = function () { Ads.waBusy = false; open(); };
            (function tryShow() {
                if (Ads.interstitialReady) {
                    Ads.showInterstitial(finish);
                } else if (Date.now() - started < CONFIG.admob.whatsappWaitMs && Ads.interstitialLoading) {
                    setTimeout(tryShow, 200);
                } else {
                    finish();
                }
            })();
        },
        showPrivacyOptions: function () {
            var A = Ads.plugin();
            if (A && A.showPrivacyOptionsForm) A.showPrivacyOptionsForm().catch(function () {});
        },
    };

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        store("rc.theme", theme);
        var meta = document.querySelectorAll('meta[name="theme-color"]');
        meta.forEach(function (m) {
            m.setAttribute("content", theme === "dark" ? "#0b1020" : "#f4f6fb");
        });
    }

    function init() {
        var lang = store("rc.lang") || detectLang();
        applyLang(lang);

        var theme = store("rc.theme") ||
            (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
        applyTheme(theme);

        document.getElementById("langBtn").onclick = function (e) {
            e.stopPropagation();
            openLangMenu();
        };
        document.addEventListener("click", function (e) {
            var menu = document.getElementById("langMenu");
            if (menu && !menu.contains(e.target)) closeLangMenu();
        });
        document.getElementById("themeBtn").onclick = function () {
            applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
        };
        document.getElementById("backBtn").onclick = function () {
            if (history.length > 1) history.back();
            else go("#/");
        };

        window.addEventListener("hashchange", onRoute);

        // Android geri tuşu: ana sayfa dışındaysa ana sayfaya dön, ana sayfadaysa uygulamadan çık
        var AppPlugin = window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App;
        if (isNative && AppPlugin) {
            AppPlugin.addListener("backButton", function () {
                if (document.getElementById("langMenu")) return closeLangMenu();
                var page = location.hash.replace(/^#\/?/, "");
                if (!page) {
                    AppPlugin.exitApp();
                } else {
                    location.replace("#/");
                }
            });
        }
        window.addEventListener("offline", function () { toast(t("offline")); });

        Ads.init();

        // Uygulamadaki tüm WhatsApp bağlantıları: önce reklam, reklam kapanınca WhatsApp.
        // (Yalnızca Android uygulamasında; web sitesinde bağlantı normal açılır.)
        document.addEventListener("click", function (e) {
            if (!Ads.plugin() || e.defaultPrevented) return;
            var a = e.target && e.target.closest ? e.target.closest('a[href^="https://wa.me/"]') : null;
            if (!a) return;
            e.preventDefault();
            var href = a.href;
            Ads.beforeWhatsApp(function () {
                // Capacitor, uygulama dışı adresleri WhatsApp / tarayıcıda açar
                location.href = href;
            });
        });

        loadCatalog().then(function () {
            if (state.catalog) {
                render();
            } else {
                view.innerHTML = '<div class="card empty"><p>' + esc(t("errNetwork")) + "</p></div>";
            }
        });

        if ("serviceWorker" in navigator && !isNative && location.protocol === "https:") {
            navigator.serviceWorker.register("sw.js").catch(function () {});
        }
    }

    init();
})();
