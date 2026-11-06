/* Google AdMob reklamları (yalnızca Android uygulamasında çalışır; web sitesinde reklam yok).
 *
 * Gerçek reklam kimliklerini AdMob panelinden (https://admob.google.com) alıp aşağıya yazın:
 *   - bannerId / interstitialId: "Reklam birimi kimliği" (ca-app-pub-XXXX/YYYY)
 *   - Uygulama kimliği (ca-app-pub-XXXX~YYYY) ise android/app/src/main/res/values/strings.xml
 *     içindeki admob_app_id alanına yazılır.
 * Google'ın test kimlikleri "ca-app-pub-3940256099942544" ile başlar; bunlarla gelir elde edilmez.
 */
(function () {
    "use strict";

    var ADS = {
        bannerId: "ca-app-pub-2830351264097967/2520077819", // AdMob: "Banner Alt"
        interstitialId: "ca-app-pub-2830351264097967/6267751134", // AdMob: "Gecis Kod Bulma"
        // İki geçiş reklamı arasında en az bu kadar saniye geçer
        interstitialMinIntervalSec: 60,
    };

    var TEST_PUBLISHER = "ca-app-pub-3940256099942544";
    var noop = {
        beforeResult: function () { return Promise.resolve(); },
        privacyOptionsRequired: function () { return false; },
        showPrivacyOptions: function () { return Promise.resolve(); },
    };

    var C = window.Capacitor;
    var AdMob = C && C.Plugins && C.Plugins.AdMob;
    if (!(C && C.isNativePlatform && C.isNativePlatform()) || !AdMob) {
        window.Ads = noop;
        return;
    }

    function isTest(id) {
        return id.indexOf(TEST_PUBLISHER) === 0;
    }

    var canRequestAds = false;
    var privacyRequired = false;
    var interstitialReady = false;
    var lastInterstitial = 0;
    var pendingResolve = null;

    function setAdHeight(px) {
        document.documentElement.style.setProperty("--ad-h", (px || 0) + "px");
    }

    function showBanner() {
        AdMob.addListener("bannerAdSizeChanged", function (size) {
            setAdHeight(size && size.height);
        });
        AdMob.addListener("bannerAdFailedToLoad", function () {
            setAdHeight(0);
        });
        return AdMob.showBanner({
            adId: ADS.bannerId,
            adSize: "ADAPTIVE_BANNER",
            position: "BOTTOM_CENTER",
            margin: 0,
            isTesting: isTest(ADS.bannerId),
        }).catch(function () {
            setAdHeight(0);
        });
    }

    function prepareInterstitial() {
        interstitialReady = false;
        return AdMob.prepareInterstitial({
            adId: ADS.interstitialId,
            isTesting: isTest(ADS.interstitialId),
        }).then(function () {
            interstitialReady = true;
        }).catch(function () {
            interstitialReady = false;
        });
    }

    function finishInterstitial() {
        if (pendingResolve) {
            var r = pendingResolve;
            pendingResolve = null;
            r();
        }
        // Bir sonraki sorgu için yenisini hazırla
        prepareInterstitial();
    }

    AdMob.addListener("interstitialAdDismissed", finishInterstitial);
    AdMob.addListener("interstitialAdFailedToShow", finishInterstitial);

    function startAds() {
        showBanner();
        prepareInterstitial();
    }

    // Avrupa (GDPR) gibi izin gereken bölgelerde Google'ın onay formu gösterilir
    AdMob.initialize({})
        .then(function () {
            return AdMob.requestConsentInfo();
        })
        .then(function (info) {
            if (info && info.isConsentFormAvailable && info.status === "REQUIRED") {
                return AdMob.showConsentForm();
            }
            return info;
        })
        .then(function (info) {
            privacyRequired = !!(info && info.privacyOptionsRequirementStatus === "REQUIRED");
            canRequestAds = !info || info.canRequestAds !== false;
            if (canRequestAds) startAds();
        })
        .catch(function () {
            // Onay bilgisi alınamadıysa (ör. ağ hatası) reklamları yine de dene;
            // SDK, kullanıcının daha önce verdiği tercihi kendisi uygular.
            canRequestAds = true;
            startAds();
        });

    window.Ads = {
        // Kod bulunduğunda sonuç gösterilmeden önce geçiş reklamı (sıklık sınırlı)
        beforeResult: function () {
            var now = Date.now();
            if (!canRequestAds || !interstitialReady || now - lastInterstitial < ADS.interstitialMinIntervalSec * 1000) {
                return Promise.resolve();
            }
            lastInterstitial = now;
            interstitialReady = false;
            return new Promise(function (resolve) {
                pendingResolve = resolve;
                // Güvenlik: reklam olayı hiç gelmezse sonucu en geç 45 sn sonra göster
                setTimeout(finishInterstitialTimeout, 45000);
                AdMob.showInterstitial().catch(finishInterstitial);
            });
        },
        privacyOptionsRequired: function () {
            return privacyRequired;
        },
        showPrivacyOptions: function () {
            return AdMob.showPrivacyOptionsForm().catch(function () {});
        },
    };

    function finishInterstitialTimeout() {
        if (pendingResolve) finishInterstitial();
    }
})();
