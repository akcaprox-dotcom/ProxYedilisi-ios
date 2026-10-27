// ================================================================
//  Analiz ProX — ortam ayarları
//  Supabase Dashboard → Project Settings → API ekranındaki değerleri girin.
//  Anon (public) anahtarın tarayıcıda görünmesi normaldir; güvenlik
//  veritabanındaki RLS kurallarıyla sağlanır. service_role anahtarını
//  ASLA buraya koymayın.
// ================================================================
export const CONFIG = {
  SUPABASE_URL: 'https://emlcrtsdnwspuvjzsdfl.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_MFg61V3Ot18fsR1oBbAZGA_7534Ia_B',

  // Katılımcı davet bağlantılarının üretileceği adres.
  // Web'de otomatik olarak sitenin kendi adresi kullanılır; Android/iOS uygulamasında
  // (ve yerel testte) aşağıdaki yedek adres kullanılır. Alan adı alınınca burayı güncelleyin.
  PUBLIC_URL:
    typeof location !== 'undefined' && /^https?:$/.test(location.protocol) && !/^(localhost|127\.|192\.168\.)/.test(location.hostname)
      ? location.origin
      : 'https://analizprox.barisakca.com.tr',

  // Telefonla kayıt/giriş açık mı? (Supabase'de SMS sağlayıcısı tanımlanınca true yapın)
  PHONE_AUTH: true,

  // Raporlarda bir alt grubun gösterilmesi için gereken en az yanıt sayısı (anonimlik eşiği)
  MIN_GROUP_N: 5,

  SUPPORT_EMAIL: 'analizprox@gmail.com',

  // ---- Abonelik (RevenueCat) — yalnızca PUBLIC anahtarlar; secret (sk_) anahtar ASLA buraya yazılmaz
  REVENUECAT_IOS_KEY: 'appl_TFweGIfLYfwMoMJzFqyYSmeeXIy',
  REVENUECAT_ANDROID_KEY: 'goog_MgKAdSFWMXwFrHrqUzwUPnqGRyT',
  RC_ENTITLEMENT: 'prox_yedilisi',
  RC_PRODUCT: 'analizprox_aylik',
  MS_STORE_SKU: 'analizprox_aylik',   // Partner Center → Add-on → Product ID (aynı kimlik)
  TRIAL_DAYS: 30,

  // Mağaza sayfaları — uygulama herkese açık yayına girince adresi yazın.
  // Boş bırakılan buton tıklanınca "yakında, şimdi web'den ücretsiz kullanın" penceresi açar.
  STORE_LINKS: {
    play: '',       // https://play.google.com/store/apps/details?id=com.barisakca.analizprox
    apple: '',      // https://apps.apple.com/tr/app/analiz-prox/id..........
    microsoft: 'https://apps.microsoft.com/detail/9n0r7lrgb1hw',
  },
};

// Supabase bilgileri girilmemişse uygulama tarayıcı içi "demo modunda" çalışır:
// tüm veriler bu cihazın localStorage'ında tutulur, doğrulama kodu 123456'dır.
export const DEMO_MODE = !CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY;
