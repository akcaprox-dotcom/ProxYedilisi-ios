// KULLANIM KILAVUZU — #/guide (genel) ve #/guide/:key (bölüm veya panel)
import { html, raw, toStr, $$ } from '../core/util.js';
import { t, L, getLang } from '../core/i18n.js';
import { icon } from '../core/ui.js';
import { shell } from './layout.js';
import { MODULES, getModule } from '../modules/index.js';
import { GENERAL, MODULE_GUIDES } from '../content/guide.js';
import { printPage } from '../core/native.js';

function moduleIntro(m) {
  const dims = m.key === 'ik' ? [] : m.dims.map((d) => L(d.name));
  return html`<div class="row" style="gap:8px;margin:4px 0 18px">
      <a class="btn sm" href="#/demo/${m.key}">${raw(icon('chart'))} ${t('Örnek raporu aç', 'Open sample report')}</a>
      <a class="btn sm" href="#/m/${m.key}">${raw(icon('next'))} ${t('Panele git', 'Go to panel')}</a>
    </div>
    ${dims.length ? html`<div class="dim-chips">${dims.map((d) => html`<span class="chip">${d}</span>`)}</div>` : ''}`;
}

export function renderGuide({ key } = {}) {
  const en = getLang() === 'en';
  const gen = GENERAL.find((g) => g.id === key);
  const mod = !gen && key ? getModule(key) : null;
  const cur = gen || (mod ? null : GENERAL[0]);
  const curKey = cur ? cur.id : mod.key;

  const nav = html`<nav class="guide-nav no-print">
    <div class="sep">${t('Genel', 'General')}</div>
    ${GENERAL.map((g) => html`<a href="#/guide/${g.id}" class="${g.id === curKey ? 'on' : ''}">${raw(icon(g.icon))} ${en ? g.title.en : g.title.tr}</a>`)}
    <div class="sep">${t('Panel kılavuzları', 'Panel guides')}</div>
    ${MODULES.map((m) => html`<a href="#/guide/${m.key}" class="${m.key === curKey ? 'on' : ''}">${raw(icon(m.icon || 'chart'))} ${L(m.short)}</a>`)}
    <div class="sep">${t('Yasal', 'Legal')}</div>
    <a href="#/legal/privacy">${raw(icon('lock'))} ${t('Gizlilik Politikası', 'Privacy Policy')}</a>
    <a href="#/legal/terms">${raw(icon('info'))} ${t('Kullanım Koşulları', 'Terms of Use')}</a>
  </nav>`;

  const opt = (k, label) => html`<option value="${k}" ${k === curKey ? 'selected' : ''}>${label}</option>`;
  const pick = html`<select class="input guide-pick no-print" id="gpick" aria-label="${t('Bölüm seçin', 'Choose a section')}">
    <optgroup label="${t('Genel', 'General')}">${GENERAL.map((g) => opt(g.id, en ? g.title.en : g.title.tr))}</optgroup>
    <optgroup label="${t('Panel kılavuzları', 'Panel guides')}">${MODULES.map((m) => opt(m.key, L(m.short)))}</optgroup>
    <optgroup label="${t('Yasal', 'Legal')}">${opt('legal:privacy', t('Gizlilik Politikası', 'Privacy Policy'))}${opt('legal:terms', t('Kullanım Koşulları', 'Terms of Use'))}</optgroup>
  </select>`;

  const title = cur ? (en ? cur.title.en : cur.title.tr) : L(mod.name);
  const body = cur ? (en ? cur.en : cur.tr) : (en ? MODULE_GUIDES[mod.key].en : MODULE_GUIDES[mod.key].tr);

  const root = shell(html`
    <div class="crumbs-row no-print"><button class="btn sm back-btn" id="gback">${raw(icon('back'))} ${t('Geri', 'Back')}</button>
      <div class="crumbs"><a href="#/guide">${t('Kullanım Kılavuzu', 'User Guide')}</a> / ${title}</div></div>
    <div class="guide-layout">
      ${nav}
      <article>
        ${pick}
        <div class="eyebrow">${mod ? t('Panel kılavuzu', 'Panel guide') + ' · 0' + mod.order : t('Kullanım Kılavuzu', 'User Guide')}</div>
        <h1 style="margin-top:8px">${title}</h1>
        ${mod ? moduleIntro(mod) : ''}
        <div class="toc no-print" id="toc"></div>
        <div class="card doc" id="gdoc">${raw(body)}</div>
        ${mod ? html`<div class="alert info" style="margin-top:16px">${raw(t('Raporun genel bölümleri (puan bantları, güven aralığı, etki analizi, ısı haritası, veri kalitesi) <a href="#/guide/reading">Raporlar nasıl okunur?</a> bölümünde; karar almadan önce <a href="#/guide/principles">Doğru yorumlama ilkeleri</a>ni okuyun.', 'Common report sections are explained in <a href="#/guide/reading">How to read reports</a>; read the <a href="#/guide/principles">principles of sound interpretation</a> before deciding.'))}</div>` : ''}
        <div class="row no-print" style="margin-top:14px"><button class="btn sm" id="gpr">${raw(icon('print'))} ${t('Yazdır / PDF', 'Print / PDF')}</button></div>
      </article>
    </div>`, () => renderGuide({ key }));

  // Sayfa içi içindekiler (h3 başlıkları)
  const hs = $$('#gdoc h3', root);
  if (hs.length > 2) {
    hs.forEach((h, i) => (h.id = 'g' + i));
    root.querySelector('#toc').innerHTML = toStr(html`<b>${t('Bu sayfada', 'On this page')}</b>${hs.map((h, i) => html`<a href="#/guide/${curKey}" data-g="g${i}">${h.textContent}</a>`)}`);
    $$('#toc a', root).forEach((a) => (a.onclick = (e) => { e.preventDefault(); document.getElementById(a.dataset.g)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
  }
  root.querySelector('#gback').onclick = () => (history.length > 1 ? history.back() : (location.hash = '#/'));
  root.querySelector('#gpick').onchange = (e) => {
    const v = e.target.value;
    location.hash = v.startsWith('legal:') ? '#/legal/' + v.slice(6) : '#/guide/' + v;
  };
  root.querySelector('#gpr').onclick = () => printPage(title);
  window.scrollTo(0, 0);
}
