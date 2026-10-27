// Mağaza butonları (yalnızca web'de; uygulamaların içinde gösterilmez)
import { html, raw, $$ } from '../core/util.js';
import { t } from '../core/i18n.js';
import { icon } from '../core/ui.js';
import { isNative } from '../core/native.js';
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
    <div class="stores-row">${STORES.map(([k, name, sub]) => L[k]
      ? html`<a class="store-btn" href="${L[k]}" target="_blank" rel="noopener">${raw(icon(k === 'microsoft' ? 'grid' : 'phone'))}<span><small>${sub}</small><b>${name}</b></span></a>`
      : html`<span class="store-btn soon" aria-disabled="true">${raw(icon(k === 'microsoft' ? 'grid' : 'phone'))}<span><small>${t('Çok yakında', 'Coming soon')}</small><b>${name}</b></span></span>`)}</div>
  </div>`;
}

// Eski sürümlerle uyum için bırakıldı; artık pencere açılmıyor
export function bindStores() {}
