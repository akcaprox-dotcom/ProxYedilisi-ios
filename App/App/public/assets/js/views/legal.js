// YASAL METİNLER — içerik: content/legal.js (yayından önce bir hukukçuya okutun)
import { html, raw } from '../core/util.js';
import { t, getLang } from '../core/i18n.js';
import { shell } from './layout.js';
import { DOCS, UPDATED } from '../content/legal.js';
import { printPage } from '../core/native.js';

const ORDER = ['privacy', 'terms', 'kvkk', 'kvkk-respondent'];

export function renderLegal({ doc }) {
  const key = DOCS[doc] ? doc : 'privacy';
  const d = DOCS[key];
  const en = getLang() === 'en';
  shell(html`<div class="wrap narrow" style="width:100%">
    <div class="crumbs-row"><a class="btn sm back-btn" href="#/">← ${t('Ana sayfa', 'Home')}</a></div>
    <div class="doc-tabs no-print">${ORDER.map((k) => html`<a href="#/legal/${k}" class="${k === key ? 'on' : ''}">${en ? DOCS[k].title.en : DOCS[k].title.tr}</a>`)}</div>
    <div class="eyebrow">Analiz ProX</div><h1 style="margin-top:8px">${en ? d.title.en : d.title.tr}</h1>
    <p class="dim mono" style="font-size:12px">${t('Son güncelleme', 'Last updated')}: ${UPDATED}</p>
    <div class="card doc">${raw(en ? d.en : d.tr)}</div>
    <div class="row no-print" style="margin-top:14px"><button class="btn sm" id="pr">${t('Yazdır / PDF', 'Print / PDF')}</button><a class="btn sm" href="#/guide">${t('Kullanım Kılavuzu', 'User Guide')}</a></div>
  </div>`, () => renderLegal({ doc }));
  document.getElementById('pr').onclick = () => printPage(en ? d.title.en : d.title.tr);
}
