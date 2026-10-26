import { store } from './util.js';

let lang = store.get('apx.lang') || ((navigator.language || 'tr').startsWith('tr') ? 'tr' : 'en');
const listeners = new Set();

export const getLang = () => lang;
export function setLang(l) {
  lang = l === 'en' ? 'en' : 'tr';
  store.set('apx.lang', lang);
  document.documentElement.lang = lang;
  listeners.forEach((f) => f(lang));
}
export const onLang = (f) => (listeners.add(f), () => listeners.delete(f));

// t('Türkçe', 'English')  |  L({tr:'..', en:'..'})
export const t = (tr, en) => (lang === 'en' ? en ?? tr : tr);
export const L = (o) => (o == null ? '' : typeof o === 'string' ? o : lang === 'en' ? o.en ?? o.tr : o.tr ?? o.en);

// Ortak arayüz metinleri
const D = {
  brandTag: { tr: 'Kurumların röntgenini çeken yedi analiz paneli', en: 'Seven analysis panels that X-ray your organization' },
  login: { tr: 'Giriş yap', en: 'Sign in' },
  logout: { tr: 'Çıkış', en: 'Sign out' },
  register: { tr: 'Hesap oluştur', en: 'Create account' },
  password: { tr: 'Şifre', en: 'Password' },
  password2: { tr: 'Şifre (tekrar)', en: 'Confirm password' },
  emailOrPhone: { tr: 'E-posta veya cep telefonu', en: 'Email or mobile phone' },
  email: { tr: 'E-posta', en: 'Email' },
  phone: { tr: 'Cep telefonu', en: 'Mobile phone' },
  fullName: { tr: 'Ad Soyad', en: 'Full name' },
  forgot: { tr: 'Şifremi unuttum', en: 'Forgot password' },
  back: { tr: 'Geri', en: 'Back' },
  next: { tr: 'İleri', en: 'Next' },
  save: { tr: 'Kaydet', en: 'Save' },
  cancel: { tr: 'Vazgeç', en: 'Cancel' },
  close: { tr: 'Kapat', en: 'Close' },
  delete: { tr: 'Sil', en: 'Delete' },
  continue: { tr: 'Devam', en: 'Continue' },
  verify: { tr: 'Doğrula', en: 'Verify' },
  code: { tr: '6 haneli kod', en: '6-digit code' },
  account: { tr: 'Hesabım', en: 'My account' },
  panels: { tr: 'Paneller', en: 'Panels' },
  newAssessment: { tr: 'Yeni değerlendirme', en: 'New assessment' },
  report: { tr: 'Rapor', en: 'Report' },
  sampleReport: { tr: 'Örnek rapor', en: 'Sample report' },
  enterPanel: { tr: 'Panele gir', en: 'Open panel' },
  minutes: { tr: 'dk', en: 'min' },
  questions: { tr: 'soru', en: 'questions' },
  dimensions: { tr: 'boyut', en: 'dimensions' },
  responses: { tr: 'yanıt', en: 'responses' },
  open: { tr: 'Açık', en: 'Open' },
  closed: { tr: 'Kapalı', en: 'Closed' },
  loading: { tr: 'Yükleniyor…', en: 'Loading…' },
  copy: { tr: 'Kopyala', en: 'Copy' },
  copied: { tr: 'Kopyalandı', en: 'Copied' },
  print: { tr: 'PDF olarak kaydet', en: 'Save as PDF' },
  exportCsv: { tr: 'CSV indir', en: 'Download CSV' },
  required: { tr: 'Bu alan zorunlu', en: 'This field is required' },
  genericError: { tr: 'Bir şeyler ters gitti. Lütfen tekrar deneyin.', en: 'Something went wrong. Please try again.' },
};
export const T = (k) => L(D[k]) || k;

// Supabase / uygulama hata kodlarını okunur mesaja çevir
export function errText(e) {
  const m = String(e?.message || e || '').toLowerCase();
  const map = [
    ['invalid login', t('E-posta/telefon veya şifre hatalı.', 'Incorrect email/phone or password.')],
    ['email not confirmed', t('E-posta adresiniz henüz doğrulanmadı.', 'Your email has not been verified yet.')],
    ['phone not confirmed', t('Telefon numaranız henüz doğrulanmadı.', 'Your phone number has not been verified yet.')],
    ['already registered', t('Bu e-posta/telefon ile zaten bir hesap var.', 'An account already exists with this email/phone.')],
    ['user already', t('Bu e-posta/telefon ile zaten bir hesap var.', 'An account already exists with this email/phone.')],
    ['token has expired', t('Kodun süresi dolmuş ya da kod hatalı.', 'The code has expired or is invalid.')],
    ['invalid otp', t('Kod hatalı.', 'Invalid code.')],
    ['otp', t('Kod hatalı ya da süresi dolmuş.', 'Invalid or expired code.')],
    ['password should be', t('Şifre en az 8 karakter olmalı.', 'Password must be at least 8 characters.')],
    ['weak', t('Şifre çok zayıf. Harf ve rakam karıştırın.', 'Password is too weak. Mix letters and numbers.')],
    ['weekly_limit', t('Şifre sıfırlama talebi haftada yalnızca bir kez yapılabilir.', 'A password reset can only be requested once a week.')],
    ['subscription_required', t('Deneme süreniz doldu. Yeni değerlendirme ve raporlar için abonelik gerekir.', 'Your trial has ended. A subscription is required for new assessments and reports.')],
    ['rate limit', t('Çok fazla deneme yapıldı. Biraz bekleyip tekrar deneyin.', 'Too many attempts. Please wait and try again.')],
    ['sms', t('SMS gönderilemedi. Sağlayıcı ayarlarını kontrol edin.', 'SMS could not be sent. Check provider settings.')],
    ['not_found', t('Bu bağlantıya ait değerlendirme bulunamadı.', 'No assessment found for this link.')],
    ['closed', t('Bu değerlendirme yanıta kapatılmış.', 'This assessment is closed for responses.')],
    ['completed', t('Bu değerlendirme zaten tamamlanmış.', 'This assessment has already been completed.')],
    ['duplicate', t('Bu cihazdan zaten yanıt gönderilmiş.', 'A response has already been submitted from this device.')],
    ['org_limit', t('Kurum sınırına ulaşıldı.', 'Organization limit reached.')],
    ['failed to fetch', t('Sunucuya ulaşılamıyor. İnternet bağlantınızı kontrol edin.', 'Cannot reach the server. Check your connection.')],
  ];
  for (const [k, v] of map) if (m.includes(k)) return v;
  return T('genericError');
}

if (typeof document !== 'undefined') document.documentElement.lang = lang;
