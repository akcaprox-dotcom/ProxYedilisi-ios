// ABONELİK — #/subscribe
import { html, raw, toStr, $, esc, fmtDate } from '../core/util.js';
import { t, getLang, errText } from '../core/i18n.js';
import { state } from '../core/state.js';
import { icon, toast, loader, setBusy } from '../core/ui.js';
import { go } from '../core/router.js';
import { shell, crumbs } from './layout.js';
import { access, canPurchase, loadPackage, purchase, restore, manageUrl, msService, msLoadItem, msPurchase, msSync, msManageUrl } from '../core/subscription.js';
import { refresh } from '../core/state.js';
import { isNative, platform } from '../core/native.js';
import { storeButtons, bindStores } from './stores.js';
import { CONFIG } from '../config.js';

const STORE_NAME = { app_store: 'App Store', mac_app_store: 'App Store', play_store: 'Google Play', microsoft: 'Microsoft Store', admin: 'Analiz ProX' };
const storeName = (s) => STORE_NAME[s] || s || '';
const canManageOrg = () => ['owner', 'admin'].includes(state.org?.role) || state.isSuper;

// Durum satırı (panel ana sayfasında ve abonelik sayfasında kullanılır)
export function accessBanner() {
  const a = access();
  const lang = getLang();
  if (a.kind === 'trial') {
    const urgent = a.daysLeft <= 7;
    return html`<a class="alert ${urgent ? 'warn' : 'info'} sub-banner" href="#/subscribe">${raw(icon('clock'))}<span><b>${t('Ücretsiz deneme', 'Free trial')}: ${t(`${a.daysLeft} gün kaldı`, `${a.daysLeft} day(s) left`)}</b> · ${t(`${fmtDate(a.until, lang)} tarihine kadar tüm paneller açık.`, `All panels are open until ${fmtDate(a.until, lang)}.`)} <u>${t('Abonelik', 'Subscription')} →</u></span></a>`;
  }
  if (a.kind === 'sub' && a.status === 'billing_issue') {
    return html`<a class="alert warn sub-banner" href="#/subscribe">${raw(icon('info'))}<span><b>${t('Ödeme alınamadı.', 'Payment failed.')}</b> ${t('Erişiminizin kesilmemesi için mağaza hesabınızdaki ödeme yöntemini güncelleyin.', 'Update the payment method in your store account to keep access.')}</span></a>`;
  }
  if (!a.has) {
    return html`<a class="alert err sub-banner" href="#/subscribe">${raw(icon('lock'))}<span><b>${a.subEnded ? t('Aboneliğiniz sona erdi.', 'Your subscription has ended.') : t('Ücretsiz deneme süreniz doldu.', 'Your free trial has ended.')}</b> ${t('Verileriniz duruyor ve açık anketleriniz yanıt toplamaya devam ediyor. Yeni değerlendirme açmak ve raporları görmek için abone olun.', 'Your data is kept and open surveys keep collecting answers. Subscribe to create assessments and view reports.')} <u>${t('Abone ol', 'Subscribe')} →</u></span></a>`;
  }
  return '';
}

// Kilitli içerik yerine gösterilen kart (rapor, değerlendirme sayfası)
export function paywallCard() {
  return html`<div class="card paywall">
    <span class="pw-ic">${raw(icon('lock'))}</span>
    <h3>${t('Bu bölüm abonelik gerektirir', 'This section requires a subscription')}</h3>
    <p class="muted">${t('Ücretsiz deneme süreniz doldu. Verileriniz silinmedi; açık anketleriniz yanıt toplamaya devam ediyor. Abone olduğunuz anda raporlar yeniden açılır.', 'Your free trial has ended. Nothing was deleted and open surveys keep collecting answers. Reports reopen as soon as you subscribe.')}</p>
    <a class="btn primary" href="#/subscribe">${raw(icon('key'))} ${t('Aboneliği görüntüle', 'View subscription')}</a>
  </div>`;
}

export async function renderSubscribe() {
  if (!state.session) return go('/login?next=%2Fsubscribe');
  if (!state.org) return go('/onboarding');
  const root = shell(loader(), renderSubscribe);
  const lang = getLang();
  const org = state.org;
  const isAdmin = state.isSuper || org.viaAdmin;
  const a = access(org, { ignoreAdmin: true }); // kurumun gerçek durumu (süper admin olsanız da)

  let statusHtml;
  if (a.kind === 'trial') statusHtml = html`<span class="badge open">${t('Deneme', 'Trial')}</span> ${t(`${a.daysLeft} gün kaldı · bitiş ${fmtDate(a.until, lang)}`, `${a.daysLeft} day(s) left · ends ${fmtDate(a.until, lang)}`)}`;
  else if (a.kind === 'sub' && a.store === 'microsoft') statusHtml = html`<span class="badge open">${t('Aktif', 'Active')}</span> Microsoft Store · ${t(`erişim ${fmtDate(a.until, lang)} tarihine kadar; abonelik yenilendikçe Windows uygulaması açıldığında otomatik uzar`, `access until ${fmtDate(a.until, lang)}; extends automatically when the Windows app is opened while the subscription renews`)}`;
  else if (a.kind === 'sub') statusHtml = html`<span class="badge open">${t('Aktif', 'Active')}</span> ${a.willRenew === false || a.status === 'cancelled' ? t(`Yenilenmeyecek · ${fmtDate(a.until, lang)} tarihine kadar geçerli`, `Won't renew · valid until ${fmtDate(a.until, lang)}`) : t(`${storeName(a.store)} · bir sonraki yenileme ${fmtDate(a.until, lang)}`, `${storeName(a.store)} · renews on ${fmtDate(a.until, lang)}`)}${a.status === 'billing_issue' ? html` · <b style="color:var(--c-risk)">${t('ödeme sorunu', 'billing issue')}</b>` : ''}`;
  else if (a.kind === 'granted') statusHtml = html`<span class="badge open">${t('Tanımlı erişim', 'Granted access')}</span> ${t(`${fmtDate(a.until, lang)} tarihine kadar`, `until ${fmtDate(a.until, lang)}`)}`;
  else statusHtml = html`<span class="badge closed">${t('Erişim yok', 'No access')}</span> ${a.subEnded ? t('Abonelik sona erdi.', 'Subscription ended.') : t('Ücretsiz deneme sona erdi.', 'Free trial ended.')}`;

  const features = [
    t('7 panelin tamamı: İşletme, Güven, İK, Vizyon, Senaryo, Stres, Toplantı', 'All 7 panels: Business, Trust, HR, Vision, Scenario, Stress, Meetings'),
    t('Sınırsız değerlendirme ve aday', 'Unlimited assessments and candidates'),
    t('Tüm raporlar, Kurum Röntgeni, PDF ve CSV dışa aktarma', 'All reports, Organization X-Ray, PDF and CSV export'),
    t('Claude yapay zekâ ile Derin Analiz: Kurum Röntgeni ayda 2, İK aday analizi ve mülakat rehberi ayda 50', 'Deep Analysis with Claude AI: Organization X-Ray 2/month, HR candidate analysis & interview guide 50/month'),
    t('Web, Windows, Android ve iOS\'ta aynı hesap', 'Same account on web, Windows, Android and iOS'),
  ];

  root.innerHTML = toStr(html`
    ${crumbs([{ label: t('Panel', 'Dashboard'), href: '#/app' }, { label: t('Abonelik', 'Subscription') }])}
    <div class="wrap narrow" style="width:100%;margin:0">
      <div class="eyebrow">${org.name}</div>
      <h1 style="margin-top:8px">${t('Abonelik', 'Subscription')}</h1>
      <p class="sub-status">${statusHtml}</p>
      ${isAdmin ? html`<div class="alert info">${raw(icon('key'))} ${t('Süper admin olarak tüm kurumlara her zaman tam erişiminiz var; deneme veya abonelik sizin için kısıt oluşturmaz. Yukarıdaki durum, bu kurumun normal bir kullanıcı için durumudur.', 'As super admin you always have full access; trial and subscription never limit you. The status above is what a normal user of this organization sees.')}</div>` : ''}
      <div class="card sub-card">
        <div class="sub-head"><div><div class="eyebrow">Analiz ProX</div><h2>ProX Yedilisi</h2><p class="muted">${t('Aylık abonelik · tek plan, tüm özellikler', 'Monthly subscription · one plan, everything included')}</p></div>
          <div class="price" id="price">${canPurchase() ? loader() : ''}</div></div>
        <ul class="checks">${features.map((f) => html`<li>${raw(icon('check'))} ${f}</li>`)}</ul>
        <div id="buy"></div>
        <div class="form-err"></div>
        <p class="legal-note">${t('Gösterilen fiyat ve ürün bilgisi uygulama mağazasından alınır. Her zaman mağazadaki güncel abonelik fiyatı geçerlidir.', 'Price and product details are provided by the app store. The current subscription price in the store always applies.')}</p>
        ${isNative() ? html`<p class="legal-note">${t('Abonelik aylık olarak otomatik yenilenir ve ödeme ' + (platform() === 'ios' ? 'Apple Kimliğiniz' : 'Google Play hesabınız') + ' üzerinden alınır. Dönem bitiminden en az 24 saat önce iptal edilmezse yenilenir. Aboneliği mağaza hesap ayarlarından istediğiniz zaman yönetebilir veya iptal edebilirsiniz. Abonelik kuruma bağlıdır; aynı hesapla tüm cihazlarda geçerlidir.', 'The subscription renews monthly and is charged to your ' + (platform() === 'ios' ? 'Apple ID' : 'Google Play account') + '. It renews unless cancelled at least 24 hours before the end of the period. Manage or cancel any time in your store account settings. The subscription belongs to the organization and works on all devices with the same account.')}</p>` : ''}
        <p class="legal-note"><a href="#/legal/terms">${t('Kullanım Koşulları (EULA)', 'Terms of Use (EULA)')}</a> · <a href="#/legal/privacy">${t('Gizlilik Politikası', 'Privacy Policy')}</a></p>
      </div>
    </div>`);

  const buy = $('#buy', root), price = $('#price', root);
  if (!canManageOrg()) {
    buy.innerHTML = toStr(html`<div class="alert info">${t('Aboneliği kurum sahibi veya yöneticisi başlatabilir.', 'Only the organization owner or an admin can subscribe.')}</div>`);
    return;
  }
  // Başka bir mağazadan alınmış etkin abonelik: yönetimi orada
  const myStore = isNative() ? (platform() === 'ios' ? 'app_store' : 'play_store') : (await msService()) ? 'microsoft' : null;
  if (a.kind === 'sub' && a.store && a.store !== 'admin' && a.store.replace('mac_', '') !== myStore) {
    buy.innerHTML = toStr(html`<div class="alert ok">${raw(icon('check'))} ${t(`Aboneliğiniz ${storeName(a.store)} üzerinden etkin ve bu cihazda da geçerli. Yönetim ve iptal için ${storeName(a.store)} hesabınızı kullanın.`, `Your subscription is active via ${storeName(a.store)} and works on this device too. Manage or cancel it in your ${storeName(a.store)} account.`)}</div>`);
    return;
  }
  if (!isNative()) {
    if (await msService()) return renderMs();
    buy.innerHTML = toStr(html`<div class="alert info">${raw(icon('phone'))} ${t('Abonelik, Analiz ProX\'in Android, iOS veya Windows (Microsoft Store) uygulamasından başlatılır. Uygulamada aynı numara ve şifreyle giriş yapıp Hesap menüsünden "Abonelik"i açın. Aboneliğiniz tüm cihazlarda ve web\'de hemen geçerli olur.', 'Subscriptions are started in the Analiz ProX Android, iOS or Windows (Microsoft Store) app. Sign in with the same number and password and open "Subscription". It then applies on every device and on the web.')}</div>${storeButtons()}`);
    bindStores(buy);
    return;
  }
  if (!canPurchase()) {
    buy.innerHTML = toStr(html`<div class="alert info">${t('Abonelik satın alma çok yakında bu ekranda olacak.', 'In-app subscription is coming soon.')}</div>`);
    return;
  }

  // ---- Windows (Microsoft Store) akışı
  async function renderMs() {
    let item = null;
    try {
      item = await msLoadItem();
    } catch (e) {
      $('.form-err', root).innerHTML = `<div class="alert err">${esc(e?.message || errText(e))}</div>`;
    }
    price.innerHTML = item ? toStr(html`<b>${item.priceString}</b><span>/ ${t('ay', 'month')}</span>`) : '';
    if (!item && !$('.form-err', root).innerHTML) $('.form-err', root).innerHTML = `<div class="alert info">${esc(t('Abonelik ürünü Microsoft Store\'dan alınamadı. Lütfen daha sonra tekrar deneyin.', 'The subscription could not be loaded from the Microsoft Store. Please try again later.'))}</div>`;
    const subMs = a.kind === 'sub' && a.store === 'microsoft';
    buy.innerHTML = toStr(html`<div class="row" style="flex-direction:column;align-items:stretch;gap:10px">
      ${subMs ? html`<a class="btn primary" href="${msManageUrl}" target="_blank" rel="noopener">${t('Aboneliği yönet (Microsoft hesabı)', 'Manage subscription (Microsoft account)')}</a>`
        : item ? html`<button class="btn primary lg" id="go">${raw(icon('key'))} ${t('Abone ol', 'Subscribe')} · ${item.priceString} / ${t('ay', 'month')}</button>` : ''}
      <button class="btn ghost" id="rs">${t('Satın alımları geri yükle', 'Restore purchases')}</button></div>
      <p class="legal-note">${t('Abonelik aylık olarak otomatik yenilenir ve ödeme Microsoft hesabınızdan alınır. Aboneliği account.microsoft.com → Hizmetler ve abonelikler bölümünden istediğiniz zaman yönetebilir veya iptal edebilirsiniz. Abonelik kuruma bağlıdır; aynı hesapla tüm cihazlarda geçerlidir.', 'The subscription renews monthly and is charged to your Microsoft account. Manage or cancel any time at account.microsoft.com → Services & subscriptions. The subscription belongs to the organization and works on all devices with the same account.')}</p>`);
    const go1 = $('#go', root);
    if (go1) go1.onclick = async () => {
      setBusy(go1, true);
      try {
        const r = await msPurchase(org.id);
        if (r.ok) {
          toast(t('Aboneliğiniz başladı. Teşekkürler!', 'Your subscription is active. Thank you!'), 'ok');
          renderSubscribe();
        }
      } catch (e) {
        $('.form-err', root).innerHTML = `<div class="alert err">${esc(e?.message || errText(e))}</div>`;
      } finally {
        setBusy(go1, false);
      }
    };
    $('#rs', root).onclick = async (ev) => {
      const b = ev.currentTarget;
      setBusy(b, true);
      try {
        const ok = await msSync(org.id);
        await refresh();
        toast(ok ? t('Aboneliğiniz geri yüklendi.', 'Subscription restored.') : t('Bu Microsoft hesabında etkin abonelik bulunamadı.', 'No active subscription found for this Microsoft account.'), ok ? 'ok' : '');
        renderSubscribe();
      } catch (e) {
        toast(e?.message || errText(e), 'err');
      } finally {
        setBusy(b, false);
      }
    };
  }

  const showButtons = (pkg) => {
    buy.innerHTML = toStr(html`<div class="row" style="flex-direction:column;align-items:stretch;gap:10px">
      ${a.kind === 'sub' && a.store !== 'admin'
        ? html`<a class="btn primary" href="${manageUrl()}" target="_blank">${t('Aboneliği yönet', 'Manage subscription')}</a>`
        : pkg ? html`<button class="btn primary lg" id="go">${raw(icon('key'))} ${t('Abone ol', 'Subscribe')} · ${pkg.product.priceString} / ${t('ay', 'month')}</button>` : ''}
      <button class="btn ghost" id="rs">${t('Satın alımları geri yükle', 'Restore purchases')}</button></div>`);
    const go1 = $('#go', root);
    if (go1) go1.onclick = async () => {
      setBusy(go1, true);
      try {
        const r = await purchase(org.id, pkg);
        if (r.ok) {
          toast(t('Aboneliğiniz başladı. Teşekkürler!', 'Your subscription is active. Thank you!'), 'ok');
          renderSubscribe();
        }
      } catch (e) {
        $('.form-err', root).innerHTML = `<div class="alert err">${esc(e?.message || errText(e))}</div>`;
      } finally {
        setBusy(go1, false);
      }
    };
    $('#rs', root).onclick = async (ev) => {
      const b = ev.currentTarget;
      setBusy(b, true);
      try {
        const st = await restore(org.id);
        toast(st?.has && st.kind === 'sub' ? t('Aboneliğiniz geri yüklendi.', 'Subscription restored.') : t('Bu mağaza hesabında etkin abonelik bulunamadı.', 'No active subscription found for this store account.'), st?.kind === 'sub' ? 'ok' : '');
        renderSubscribe();
      } catch (e) {
        toast(e?.message || errText(e), 'err');
      } finally {
        setBusy(b, false);
      }
    };
  };

  try {
    const pkg = await loadPackage(org.id);
    price.innerHTML = pkg
      ? toStr(html`<b>${pkg.product.priceString}</b><span>/ ${t('ay', 'month')}</span>`)
      : '';
    if (!pkg) $('.form-err', root).innerHTML = `<div class="alert info">${esc(t('Abonelik ürünü mağazadan alınamadı. Lütfen daha sonra tekrar deneyin.', 'The subscription product could not be loaded from the store. Please try again later.'))}</div>`;
    showButtons(pkg);
  } catch (e) {
    price.innerHTML = '';
    $('.form-err', root).innerHTML = `<div class="alert err">${esc(e?.message || errText(e))}</div>`;
    showButtons(null);
  }
}
