// KİMLİK: giriş · kayıt · doğrulama · şifremi unuttum · kurum oluşturma · hesabım
import { html, raw, toStr, $, isEmail, isPhone, normalizePhone, fmtDate } from '../core/util.js';
import { t, T, errText, getLang, setLang } from '../core/i18n.js';
import { api } from '../core/api.js';
import { state, refresh } from '../core/state.js';
import { icon, toast, pwField, bindPw, otpField, bindOtp, setBusy, showErr, confirmBox } from '../core/ui.js';
import { go } from '../core/router.js';
import { app, brand, langToggle, bindLang, shell } from './layout.js';
import { CONFIG, DEMO_MODE } from '../config.js';

function authFrame(inner, rerender) {
  const el = app();
  el.innerHTML = toStr(html`<header class="topbar"><div class="wrap">${brand()}<span class="spacer"></span>${langToggle()}</div></header>
    <div class="auth"><div class="card">${inner}</div></div>`);
  bindLang(el, rerender);
  bindPw(el);
  return el.querySelector('.card');
}
const demoHint = () => (DEMO_MODE ? html`<div class="alert info">${t('Demo modu: doğrulama kodu', 'Demo mode: verification code is')} <b class="mono">123456</b></div>` : '');
const nextOf = (q) => (q?.next && q.next.startsWith('/') ? q.next : '/app');

// ------------------------------------------------------------ GİRİŞ (telefon + şifre)
export function renderLogin(_, q) {
  const card = authFrame(html`
    <div class="eyebrow">${t('Hoş geldiniz', 'Welcome back')}</div>
    <h2 style="margin-top:10px">${T('login')}</h2>
    <p class="lead">${t('Panellerinize erişmek için cep telefonunuz ve şifrenizle giriş yapın.', 'Sign in with your mobile number and password.')}</p>
    <form id="f" novalidate>
      <div class="form-err"></div>
      <label class="field"><span>${T('phone')}</span>
        <input class="input" id="idf" type="tel" autocomplete="username" inputmode="tel" required placeholder="05xx xxx xx xx"></label>
      ${pwField('pw', T('password'))}
      <div class="row between" style="margin:-4px 0 18px"><span></span><a href="#/forgot">${T('forgot')}</a></div>
      <button class="btn primary block" id="go">${T('login')}</button>
    </form>
    <div class="foot">${t('Hesabınız yok mu?', "Don't have an account?")} <a href="#/register${q?.next ? '?next=' + encodeURIComponent(q.next) : ''}">${T('register')}</a></div>`, () => renderLogin(_, q));
  $('#f', card).onsubmit = async (e) => {
    e.preventDefault();
    const idf = $('#idf', card).value.trim(), pw = $('#pw', card).value;
    if (!idf || !pw) return showErr(card, T('required'));
    if (idf.includes('@')) return showErr(card, t('Giriş e-posta ile değil, kayıtta doğruladığınız cep telefonu numarasıyla yapılır.', 'Sign in with the mobile number you verified at sign-up, not your email.'));
    if (!isPhone(idf)) return showErr(card, t('Geçerli bir cep telefonu girin.', 'Enter a valid mobile number.'));
    const b = $('#go', card);
    setBusy(b, true);
    try {
      await api.signIn(normalizePhone(idf), pw);
      await refresh();
      go(state.orgs.length ? nextOf(q) : '/onboarding');
    } catch (err) {
      const m = String(err.message || '').toLowerCase();
      if (m.includes('not confirmed')) {
        toast(t('Telefonunuzu doğrulayın; yeni kod gönderildi.', 'Verify your phone; a new code was sent.'));
        await api.resendSignup({ phone: normalizePhone(idf) }).catch(() => {});
        return renderVerify({ identifier: normalizePhone(idf), next: nextOf(q) });
      }
      showErr(card, errText(err));
    } finally {
      setBusy(b, false);
    }
  };
}

// ------------------------------------------------------------ KAYIT (telefon SMS ile doğrulanır, e-posta iletişim içindir)
export function renderRegister(_, q) {
  const card = authFrame(html`
    <div class="eyebrow">${t('Ücretsiz başlayın', 'Start free')}</div>
    <h2 style="margin-top:10px">${T('register')}</h2>
    <p class="lead">${t('Kurum hesabınızı oluşturun; telefonunuza gelen kodla doğrulayın.', 'Create your organization account and verify it with the code sent to your phone.')}</p>
    <form id="f" novalidate>
      <div class="form-err"></div>
      <label class="field"><span>${T('fullName')}</span><input class="input" id="nm" autocomplete="name" required></label>
      <label class="field"><span>${T('email')}</span><input class="input" id="em" type="email" autocomplete="email" inputmode="email" required placeholder="ornek@firma.com">
        <small>${t('İletişim ve bilgilendirme için.', 'For contact and notifications.')}</small></label>
      <label class="field"><span>${T('phone')}</span><input class="input" id="ph" type="tel" autocomplete="username" inputmode="tel" required placeholder="05xx xxx xx xx">
        <small>${t('Doğrulama kodu bu numaraya SMS ile gönderilir. Girişte bu numarayı kullanacaksınız.', 'A verification code will be sent to this number by SMS. You will sign in with it.')}</small></label>
      ${pwField('pw', T('password'), { meter: true, auto: 'new-password' })}
      ${pwField('pw2', T('password2'), { auto: 'new-password' })}
      <label class="check"><input type="checkbox" id="kvkk"> <span>${raw(t('<a href="#/legal/privacy" target="_blank">Gizlilik Politikası</a> ve <a href="#/legal/kvkk" target="_blank">KVKK Aydınlatma Metni</a>\'ni okudum; <a href="#/legal/terms" target="_blank">Kullanım Koşulları</a>\'nı kabul ediyorum. Değerlendirmelerin yürütülmesinden ve sonuçlara dayanılarak alınan kararlardan kurumumun sorumlu olduğunu biliyorum.', 'I have read the <a href="#/legal/privacy" target="_blank">Privacy Policy</a> and accept the <a href="#/legal/terms" target="_blank">Terms of Use</a>. I understand that my organization is responsible for running assessments and for decisions based on the results.'))}</span></label>
      <button class="btn primary block" id="go">${T('register')}</button>
    </form>
    <div class="foot">${t('Zaten hesabınız var mı?', 'Already have an account?')} <a href="#/login">${T('login')}</a></div>`, () => renderRegister(_, q));
  $('#f', card).onsubmit = async (e) => {
    e.preventDefault();
    const nm = $('#nm', card).value.trim(), ph = $('#ph', card).value.trim(), em = $('#em', card).value.trim();
    const pw = $('#pw', card).value, pw2 = $('#pw2', card).value;
    if (nm.length < 2) return showErr(card, t('Ad soyad girin.', 'Enter your full name.'));
    if (!isPhone(ph)) return showErr(card, t('Geçerli bir cep telefonu girin.', 'Enter a valid mobile number.'));
    if (!isEmail(em)) return showErr(card, t('Geçerli bir e-posta girin.', 'Enter a valid email.'));
    if (pw.length < 8 || !/\d/.test(pw) || !/[A-Za-zÇĞİÖŞÜçğıöşü]/.test(pw)) return showErr(card, t('Şifre en az 8 karakter olmalı ve harf ile rakam içermeli.', 'Password must be at least 8 characters and contain letters and numbers.'));
    if (pw !== pw2) return showErr(card, t('Şifreler eşleşmiyor.', 'Passwords do not match.'));
    if (!$('#kvkk', card).checked) return showErr(card, t('Devam etmek için aydınlatma metnini onaylayın.', 'Please accept the privacy notice to continue.'));
    const b = $('#go', card);
    setBusy(b, true);
    try {
      const phone = normalizePhone(ph);
      const res = await api.signUp({ phone, contact_email: em.toLowerCase(), full_name: nm, password: pw, lang: getLang() });
      if (res?.session) {
        await refresh();
        return go('/onboarding');
      }
      renderVerify({ identifier: phone, next: q?.next });
    } catch (err) {
      showErr(card, errText(err));
    } finally {
      setBusy(b, false);
    }
  };
}

// ------------------------------------------------------------ DOĞRULAMA KODU
export function renderVerify({ identifier, next }) {
  const viaEmail = isEmail(identifier);
  const card = authFrame(html`
    <div class="eyebrow">${t('Son adım', 'Last step')}</div>
    <h2 style="margin-top:10px">${t('Doğrulama kodu', 'Verification code')}</h2>
    <p class="lead">${viaEmail ? t('E-posta adresinize gönderilen 6 haneli kodu girin:', 'Enter the 6-digit code sent to your email:') : t('Telefonunuza SMS ile gönderilen 6 haneli kodu girin:', 'Enter the 6-digit code sent to your phone by SMS:')} <b>${identifier}</b></p>
    ${demoHint()}
    <div class="form-err"></div>
    ${raw(otpField())}
    <button class="btn primary block" id="go">${T('verify')}</button>
    <div class="foot"><button class="btn ghost sm" id="resend">${t('Kodu tekrar gönder', 'Resend code')}</button></div>`, () => renderVerify({ identifier, next }));
  const submit = async (code) => {
    const b = $('#go', card);
    setBusy(b, true);
    try {
      await api.verifySignup(viaEmail ? { email: identifier, token: code } : { phone: identifier, token: code });
      await refresh();
      toast(t('Hesabınız doğrulandı.', 'Your account is verified.'), 'ok');
      go(state.orgs.length ? next || '/app' : '/onboarding' + (next ? '?next=' + encodeURIComponent(next) : ''));
    } catch (err) {
      showErr(card, errText(err));
    } finally {
      setBusy(b, false);
    }
  };
  const val = bindOtp(card, submit);
  $('#go', card).onclick = () => (val().length === 6 ? submit(val()) : showErr(card, t('6 haneli kodu girin.', 'Enter the 6-digit code.')));
  let wait = 0;
  $('#resend', card).onclick = async (e) => {
    if (wait > Date.now()) return toast(t('Lütfen biraz bekleyin.', 'Please wait a moment.'));
    wait = Date.now() + 60000;
    try {
      await api.resendSignup(viaEmail ? { email: identifier } : { phone: identifier });
      toast(t('Yeni kod gönderildi.', 'A new code was sent.'), 'ok');
    } catch (err) {
      toast(errText(err), 'err');
    }
  };
}

// ------------------------------------------------------------ ŞİFREMİ UNUTTUM
export function renderForgot() {
  const card = authFrame(html`
    <div class="eyebrow">${t('Hesap kurtarma', 'Account recovery')}</div>
    <h2 style="margin-top:10px">${T('forgot')}</h2>
    <p class="lead">${t('Kayıtlı cep telefonunuzu girin; size SMS ile 6 haneli bir kod gönderelim.', 'Enter your registered mobile number and we will text you a 6-digit code.')}</p>
    <form id="f" novalidate>
      <div class="form-err"></div>
      <div class="alert info">${raw(t('<b>Önemli:</b> Şifremi unuttum talebi <b>haftada yalnızca bir kez</b> yapılabilir. Kod gönderildikten sonra 10 dakika içinde girmeniz gerekir; lütfen dikkatli ilerleyiniz.', '<b>Important:</b> A password reset can be requested <b>only once a week</b>. Enter the code within 10 minutes of receiving it; please proceed carefully.'))}</div>
      <label class="field"><span>${T('phone')}</span><input class="input" id="idf" type="tel" autocomplete="tel" inputmode="tel" required placeholder="05xx xxx xx xx"></label>
      <button class="btn primary block" id="go">${t('Kod gönder', 'Send code')}</button>
    </form>
    <div class="foot"><a href="#/login">${T('back')}</a></div>`, renderForgot);
  $('#f', card).onsubmit = async (e) => {
    e.preventDefault();
    const idf = $('#idf', card).value.trim();
    if (!isPhone(idf)) return showErr(card, t('Geçerli bir cep telefonu girin.', 'Enter a valid mobile number.'));
    const b = $('#go', card);
    setBusy(b, true);
    const weekly = (at) =>
      showErr(card, t(`Şifre sıfırlama talebi haftada yalnızca bir kez yapılabilir. Bir sonraki talep: ${new Date(at).toLocaleString('tr-TR', { dateStyle: 'long', timeStyle: 'short' })}`,
        `A password reset can only be requested once a week. Next request: ${new Date(at).toLocaleString('en-GB', { dateStyle: 'long', timeStyle: 'short' })}`));
    const nextAt = await api.resetAvailableAt(normalizePhone(idf));
    if (nextAt && new Date(nextAt) > new Date()) {
      setBusy(b, false);
      return weekly(nextAt);
    }
    try {
      await api.sendReset(normalizePhone(idf));
    } catch (err) {
      // hesap olup olmadığını sızdırmamak için genel hatalar gösterilmez (haftalık sınır ve oran sınırı hariç)
      const m = String(err.message).toLowerCase();
      if (m.includes('weekly') || m.includes('rate') || m.includes('429')) {
        setBusy(b, false);
        return showErr(card, errText(m.includes('rate') ? err : 'weekly_limit'));
      }
    }
    setBusy(b, false);
    renderResetCode(normalizePhone(idf));
  };
}

function renderResetCode(identifier) {
  const card = authFrame(html`
    <div class="eyebrow">${t('Hesap kurtarma', 'Account recovery')}</div>
    <h2 style="margin-top:10px">${t('Yeni şifre belirleyin', 'Set a new password')}</h2>
    <p class="lead">${t('Bu numarayla kayıtlı bir hesap varsa SMS ile kod gönderildi:', 'If an account exists, a code has been texted to:')} <b>${identifier}</b></p>
    ${demoHint()}
    <div class="form-err"></div>
    ${raw(otpField())}
    ${pwField('pw', t('Yeni şifre', 'New password'), { meter: true, auto: 'new-password' })}
    ${pwField('pw2', T('password2'), { auto: 'new-password' })}
    <button class="btn primary block" id="go">${t('Şifreyi güncelle', 'Update password')}</button>`, () => renderResetCode(identifier));
  const val = bindOtp(card);
  $('#go', card).onclick = async () => {
    const code = val(), pw = $('#pw', card).value, pw2 = $('#pw2', card).value;
    if (code.length !== 6) return showErr(card, t('6 haneli kodu girin.', 'Enter the 6-digit code.'));
    if (pw.length < 8 || !/\d/.test(pw)) return showErr(card, t('Şifre en az 8 karakter olmalı ve rakam içermeli.', 'Password must be at least 8 characters and contain a number.'));
    if (pw !== pw2) return showErr(card, t('Şifreler eşleşmiyor.', 'Passwords do not match.'));
    const b = $('#go', card);
    setBusy(b, true);
    try {
      await api.verifyReset(identifier, code);
      await api.updatePassword(pw);
      await refresh();
      toast(t('Şifreniz güncellendi.', 'Your password has been updated.'), 'ok');
      go(state.orgs.length ? '/app' : '/onboarding');
    } catch (err) {
      showErr(card, errText(err));
    } finally {
      setBusy(b, false);
    }
  };
}

// ------------------------------------------------------------ KURUM OLUŞTURMA
const SECTORS = [
  ['manufacturing', 'Üretim / sanayi', 'Manufacturing / industry'], ['automotive', 'Otomotiv & yan sanayi', 'Automotive & suppliers'],
  ['logistics', 'Lojistik & taşımacılık', 'Logistics & transport'], ['retail', 'Perakende & ticaret', 'Retail & trade'],
  ['services', 'Hizmet', 'Services'], ['health', 'Sağlık', 'Healthcare'], ['education', 'Eğitim', 'Education'],
  ['tech', 'Bilişim & teknoloji', 'IT & technology'], ['finance', 'Finans & sigorta', 'Finance & insurance'],
  ['construction', 'İnşaat & gayrimenkul', 'Construction & real estate'], ['food', 'Gıda & tarım', 'Food & agriculture'],
  ['public', 'Kamu & STK', 'Public sector & NGO'], ['other', 'Diğer', 'Other'],
];
const SIZES = ['1–9', '10–49', '50–249', '250–999', '1000+'];

export function renderOnboarding(_, q) {
  if (!state.session) return go('/login');
  const card = authFrame(html`
    <div class="eyebrow">${t('Kurum bilgileri', 'Organization')}</div>
    <h2 style="margin-top:10px">${t('Kurumunuzu tanımlayın', 'Set up your organization')}</h2>
    <p class="lead">${t('Raporlarda ve katılımcı ekranlarında bu ad görünür.', 'This name appears on reports and respondent screens.')}</p>
    <form id="f" novalidate>
      <div class="form-err"></div>
      <label class="field"><span>${t('Kurum adı', 'Organization name')}</span><input class="input" id="nm" required maxlength="120"></label>
      <label class="field"><span>${t('Sektör', 'Sector')}</span><select class="input" id="sec">${SECTORS.map(([k, tr, en]) => html`<option value="${k}">${t(tr, en)}</option>`)}</select></label>
      <label class="field"><span>${t('Çalışan sayısı', 'Employees')}</span><select class="input" id="sz">${SIZES.map((s) => html`<option>${s}</option>`)}</select></label>
      <button class="btn primary block" id="go">${T('continue')}</button>
    </form>`, () => renderOnboarding(_, q));
  $('#f', card).onsubmit = async (e) => {
    e.preventDefault();
    const nm = $('#nm', card).value.trim();
    if (nm.length < 2) return showErr(card, t('Kurum adını girin.', 'Enter the organization name.'));
    const b = $('#go', card);
    setBusy(b, true);
    try {
      await api.createOrg({ name: nm, sector: $('#sec', card).value, size: $('#sz', card).value });
      await refresh();
      go(q?.next || '/app');
    } catch (err) {
      showErr(card, errText(err));
    } finally {
      setBusy(b, false);
    }
  };
}

// ------------------------------------------------------------ HESABIM
export function renderAccount() {
  if (!state.session) return go('/login?next=/account');
  const p = state.profile || {};
  const word = t('SİL', 'DELETE');
  const root = shell(html`
    <div class="page-head"><div><div class="eyebrow">${T('account')}</div><h1 style="margin-top:8px">${p.full_name || ''}</h1><p>${p.email || p.phone || ''}</p></div></div>
    <div class="grid g2">
      <div class="card"><h3>${raw(icon('user'))} ${t('Profil', 'Profile')}</h3>
        <form id="pf"><div class="form-err"></div>
          <label class="field"><span>${T('fullName')}</span><input class="input" id="nm" value="${p.full_name || ''}"></label>
          <label class="field"><span>${t('Unvan', 'Title')}</span><input class="input" id="tt" value="${p.title || ''}" placeholder="${t('ör. İK Müdürü', 'e.g. HR Manager')}"></label>
          <label class="field"><span>${t('Dil', 'Language')}</span><select class="input" id="lg"><option value="tr" ${getLang() === 'tr' ? 'selected' : ''}>Türkçe</option><option value="en" ${getLang() === 'en' ? 'selected' : ''}>English</option></select></label>
          <button class="btn primary" id="ps">${T('save')}</button>
        </form></div>
      <div class="card"><h3>${raw(icon('lock'))} ${t('Şifre değiştir', 'Change password')}</h3>
        <form id="cf"><div class="form-err"></div>
          ${pwField('pw', t('Yeni şifre', 'New password'), { meter: true, auto: 'new-password' })}
          ${pwField('pw2', T('password2'), { auto: 'new-password' })}
          <button class="btn" id="cs">${t('Şifreyi güncelle', 'Update password')}</button>
        </form></div>
      <div class="card"><h3>${raw(icon('building'))} ${t('Kurumlarım', 'My organizations')}</h3>
        <div class="list">${state.orgs.map((o) => html`<div class="li"><div><h4>${o.name}</h4><div class="sub"><span>${o.size_band || ''}</span><span>${o.role}</span><span>${fmtDate(o.created_at, getLang())}</span></div></div></div>`)}</div>
        <div class="row" style="margin-top:12px"><a class="btn sm" href="#/onboarding">${raw(icon('plus'))} ${t('Yeni kurum ekle', 'Add organization')}</a></div></div>
      <div class="card" style="border-color:rgba(232,56,79,.35)"><h3>${raw(icon('trash'))} ${t('Hesabı sil', 'Delete account')}</h3>
        <p class="muted" style="font-size:14px">${t('Hesabınız, sahibi olduğunuz kurumlar ve bu kurumlara ait tüm değerlendirme ve yanıtlar kalıcı olarak silinir. Bu işlem geri alınamaz.', 'Your account, the organizations you own and all their assessments and responses will be permanently deleted. This cannot be undone.')}</p>
        <button class="btn danger" id="del">${t('Hesabımı kalıcı olarak sil', 'Permanently delete my account')}</button></div>
    </div>`, renderAccount);
  bindPw(root);
  $('#pf', root).onsubmit = async (e) => {
    e.preventDefault();
    const b = $('#ps', root);
    setBusy(b, true);
    try {
      const lang = $('#lg', root).value;
      await api.updateProfile({ full_name: $('#nm', root).value.trim(), title: $('#tt', root).value.trim(), lang });
      setLang(lang);
      await refresh();
      toast(t('Kaydedildi.', 'Saved.'), 'ok');
      renderAccount();
    } catch (err) {
      showErr($('#pf', root), errText(err));
    } finally {
      setBusy(b, false);
    }
  };
  $('#cf', root).onsubmit = async (e) => {
    e.preventDefault();
    const f = $('#cf', root), pw = $('#pw', root).value;
    if (pw.length < 8 || !/\d/.test(pw)) return showErr(f, t('Şifre en az 8 karakter olmalı ve rakam içermeli.', 'Password must be at least 8 characters and contain a number.'));
    if (pw !== $('#pw2', root).value) return showErr(f, t('Şifreler eşleşmiyor.', 'Passwords do not match.'));
    const b = $('#cs', root);
    setBusy(b, true);
    try {
      await api.updatePassword(pw);
      toast(t('Şifreniz güncellendi.', 'Password updated.'), 'ok');
      f.reset();
      showErr(f, '');
    } catch (err) {
      showErr(f, errText(err));
    } finally {
      setBusy(b, false);
    }
  };
  $('#del', root).onclick = async () => {
    const ok = await confirmBox(t('Hesap silinsin mi?', 'Delete account?'), t('Tüm kurum verileriniz kalıcı olarak silinecek.', 'All your organization data will be permanently deleted.'), { okText: t('Kalıcı olarak sil', 'Delete permanently'), requireText: word });
    if (!ok) return;
    try {
      await api.deleteAccount();
      await refresh();
      toast(t('Hesabınız silindi.', 'Your account has been deleted.'), 'ok');
      go('/');
    } catch (err) {
      toast(errText(err), 'err');
    }
  };
}
