// Mağaza butonları (yalnızca web'de; uygulamaların içinde gösterilmez)
import { html, raw, $$ } from '../core/util.js';
import { t } from '../core/i18n.js';
import { icon, sheet } from '../core/ui.js';
import { isNative } from '../core/native.js';
import { state } from '../core/state.js';
import { go } from '../core/router.js';
import { CONFIG } from '../config.js';

const STORES = [
  ['play', 'Google Play', 'Android'],
  ['apple', 'App Store', 'iPhone · iPad'],
  ['microsoft', 'Microsoft Store', 'Windows'],
];

const standalone = () => { try { return matchMedia('(display-mode: standalone)').matches; } catch { return false; } };
const show = () => !isNative() && !standalone();

export function storeButtons({ title = true } = {}) {
  if (!show()) return '';
  const L = CONFIG.STORE_LINKS || {};
  return html`<div class="stores">
    ${title ? html`<div class="stores-t">${t('Uygulamayı indirin', 'Get the app')}</div>` : ''}
    <div class="stores-row">${STORES.map(([k, name, sub]) => html`<a class="store-btn" data-store="${k}" href="${L[k] || '#'}" ${L[k] ? raw('target="_blank" rel="noopener"') : ''}>
      ${raw(icon(k === 'microsoft' ? 'grid' : 'phone'))}<span><small>${sub}</small><b>${name}</b></span></a>`)}</div>
  </div>`;
}

export function bindStores(root) {
  const L = CONFIG.STORE_LINKS || {};
  $$('.store-btn', root).forEach((a) => {
    if (L[a.dataset.store]) return; // gerçek bağlantı varsa mağazaya gider
    a.onclick = (e) => {
      e.preventDefault();
      const s = sheet(html`<div class="store-note">
        <div class="sn-ico">${raw(icon('clock'))}</div>
        <h3>${t('Mağaza indirmeleri yaklaşık bir ay sonra açılıyor', 'Store downloads open in about a month')}</h3>
        <p class="muted">${t('Android, iPhone ve Windows uygulamalarımız kısa süre içinde mağazalarda olacak. Şimdi Analiz ProX\'i web\'den ücretsiz kullanmaya başlayın: kayıt olun, 1 aylık ücretsiz denemeniz hemen başlasın. Kredi kartı gerekmez; aynı hesapla daha sonra uygulamalardan da giriş yaparsınız.', 'Our Android, iPhone and Windows apps will be in the stores shortly. Start using Analiz ProX free on the web now: sign up and your 1-month free trial begins immediately. No credit card needed; use the same account in the apps later.')}</p>
        <div class="row end"><button class="btn" id="sn-x">${t('Kapat', 'Close')}</button><button class="btn primary" id="sn-go">${state.session ? t('Panelime git', 'Go to my panels') : t('Ücretsiz başla', 'Start free')}</button></div>
      </div>`);
      s.el.querySelector('#sn-x').onclick = () => s.close();
      s.el.querySelector('#sn-go').onclick = () => { s.close(); go(state.session ? '/app' : '/register'); };
    };
  });
}
