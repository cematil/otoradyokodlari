(function () {
    "use strict";

    // ---------------------------------------------------------------
    // Ayarlar
    // ---------------------------------------------------------------
    var CONFIG = {
        repo: "cematil/otoradyokodlari",
        branch: "main",
        whatsapp: "905074377818",
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

    function t(key, vars) {
        var dict = window.I18N[state.lang] || window.I18N.tr;
        var s = dict[key] != null ? dict[key] : window.I18N.tr[key] || key;
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
        if (v && typeof v === "object") return v[state.lang] || v.tr || v.en || "";
        return v || "";
    }

    function num(n) {
        return Number(n).toLocaleString(state.lang === "tr" ? "tr-TR" : "en-US");
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
                    " · " + esc(new Date(s.ts).toLocaleDateString(state.lang === "tr" ? "tr-TR" : "en-GB")) + "</div></div>" +
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

    function renderServices() {
        view.innerHTML = '<div class="page-head"><div><h1>' + esc(t("servicesTitle")) + "</h1><p>" + esc(t("servicesText")) + "</p></div></div>" +
            '<div class="stack">' +
            serviceCard(ICONS.chip, t("svcEeprom"), t("svcEepromText"), t("waEeprom")) +
            serviceCard(ICONS.search, t("svcSerial"), t("svcSerialText"), t("waSerial")) +
            serviceCard(ICONS.tool, t("svcPro"), t("svcProText"), t("waPro")) +
            "</div>";
    }

    function renderAbout() {
        view.innerHTML = '<div class="page-head"><div><h1>' + esc(t("aboutTitle")) + "</h1></div></div>" +
            '<div class="card prose"><p>' + esc(t("aboutText")) + "</p>" +
            "<h2>" + esc(t("legalTitle")) + "</h2><p>" + esc(t("legalText")) + "</p><p>" + esc(t("legalUse")) + "</p>" +
            "<h2>" + esc(t("version")) + "</h2><p>" + esc(state.catalog.version) + "</p>" +
            '<a class="btn secondary" href="privacy.html' + (state.lang === "en" ? "#en" : "") + '">' + esc(t("privacy")) + "</a></div>";
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
        else if (page === "services") renderServices();
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
        state.lang = lang === "en" ? "en" : "tr";
        store("rc.lang", state.lang);
        document.documentElement.lang = state.lang;
        document.title = t("appName");
        document.getElementById("langBtn").textContent = state.lang === "tr" ? "EN" : "TR";
        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            el.textContent = t(el.getAttribute("data-i18n"));
        });
        document.getElementById("backBtn").setAttribute("aria-label", t("back"));
        document.getElementById("themeBtn").setAttribute("aria-label", t("theme"));
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        store("rc.theme", theme);
        var meta = document.querySelectorAll('meta[name="theme-color"]');
        meta.forEach(function (m) {
            m.setAttribute("content", theme === "dark" ? "#0b1020" : "#f4f6fb");
        });
    }

    function init() {
        var lang = store("rc.lang") || ((navigator.language || "").toLowerCase().indexOf("tr") === 0 ? "tr" : "en");
        applyLang(lang);

        var theme = store("rc.theme") ||
            (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
        applyTheme(theme);

        document.getElementById("langBtn").onclick = function () {
            applyLang(state.lang === "tr" ? "en" : "tr");
            render();
        };
        document.getElementById("themeBtn").onclick = function () {
            applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
        };
        document.getElementById("backBtn").onclick = function () {
            if (history.length > 1) history.back();
            else go("#/");
        };

        window.addEventListener("hashchange", onRoute);
        window.addEventListener("offline", function () { toast(t("offline")); });

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
