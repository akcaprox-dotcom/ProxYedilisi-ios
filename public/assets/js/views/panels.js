// YÖNETİCİ: panellerim · modül sayfası · yeni değerlendirme · değerlendirme detayı
import { html, raw, toStr, $, $$, fmtDate, fmtNum, mean, esc, downloadText, fmtDuration } from '../core/util.js';
import { t, T, L, getLang, errText } from '../core/i18n.js';
import { api } from '../core/api.js';
import { state } from '../core/state.js';
import { icon, toast, loader, qrSvg, copyText, confirmBox, setBusy, showErr, sheet } from '../core/ui.js';
import { go } from '../core/router.js';
import { MODULES, getModule, effective } from '../modules/index.js';
import { SCENARIOS } from '../modules/senaryo.js';
import { DEFAULT_PRIORITIES } from '../modules/vizyon.js';
import { FAMILIES, scoreCandidate } from '../modules/ik.js';
import { saveTextFile, canShare, shareText } from '../core/native.js';
import { access } from '../core/subscription.js';
import { accessBanner, paywallCard } from './subscribe.js';
import { aggregate, band, quality, QUALITY_LEVEL } from '../core/engine.js';
import { shell, crumbs } from './layout.js';
import { trend, f0, bandColor } from '../core/charts.js';
import { CONFIG } from '../config.js';
import { itemCount, moduleSheet } from './hub.js';

const guard = (next) => {
  if (!state.session) {
    go('/login?next=' + encodeURIComponent(next));
    return false;
  }
  if (!state.org) {
    go('/onboarding?next=' + encodeURIComponent(next));
    return false;
  }
  if (state.org.status === 'frozen' && !state.isSuper) {
    renderFrozen();
    return false;
  }
  return true;
};

// Kurum süper admin tarafından askıya alındığında gösterilir
function renderFrozen() {
  const o = state.org;
  shell(html`<div class="auth" style="min-height:60vh"><div class="card" style="width:min(560px,100%)">
    <div class="eyebrow" style="color:var(--violet)">${t('Hesap askıda', 'Account suspended')}</div>
    <h2 style="margin-top:10px">${o.name}</h2>
    <p class="muted">${t('Bu kurumun Analiz ProX hesabı geçici olarak askıya alınmıştır. Bu süre boyunca panellere, raporlara ve katılımcı bağlantılarına erişilemez.', "This organization's Analiz ProX account has been temporarily suspended. Panels, reports and respondent links are unavailable during this period.")}</p>
    ${o.frozen_reason ? html`<div class="alert info"><b>${t('Gerekçe', 'Reason')}:</b> ${o.frozen_reason}</div>` : ''}
    <p class="muted" style="font-size:14px">${t('Bilgi için', 'For details contact')} <a href="mailto:${CONFIG.SUPPORT_EMAIL}">${CONFIG.SUPPORT_EMAIL}</a></p>
    <div class="row"><a class="btn" href="#/messages">${raw(icon('mail'))} ${t('Mesajlarım', 'My messages')}</a><a class="btn" href="#/account">${raw(icon('user'))} ${T('account')}</a></div>
  </div></div>`, renderFrozen);
}
export const surveyUrl = (code) => `${CONFIG.PUBLIC_URL.replace(/\/$/, '')}/#/s/${code}`;
const canWrite = () => ['owner', 'admin'].includes(state.org?.role) || state.isSuper;

// ------------------------------------------------------------ PANELLERİM
export async function renderDashboard() {
  if (!guard('/app')) return;
  const root = shell(loader(), renderDashboard);
  let list = [];
  try {
    list = await api.listAssessments(state.org.id);
  } catch (err) {
    toast(errText(err), 'err');
  }
  const by = Object.fromEntries(MODULES.map((m) => [m.key, list.filter((a) => a.module === m.key)]));
  const total = list.reduce((s, a) => s + (a.response_count || 0), 0);
  const first = (state.profile?.full_name || '').split(' ')[0];
  const unread = (await api.myMessages().catch(() => [])).filter((m) => !m.is_read);
  root.innerHTML = toStr(html`
    ${accessBanner()}
    ${unread.length ? html`<a class="alert info" href="#/messages" style="display:flex;gap:10px;align-items:center;text-decoration:none">${raw(icon('mail'))}<span><b>${unread.length} ${t('okunmamış mesajınız var', 'unread message(s)')}:</b> ${unread[0].title}</span></a>` : ''}
    <div class="page-head">
      <div><div class="eyebrow">${state.org.name}</div><h1 style="margin-top:8px">${t('Merhaba', 'Hello')}${first ? ', ' + first : ''}</h1>
        <p>${t('Bir panel seçin, değerlendirme başlatın ve bağlantıyı katılımcılarınızla paylaşın.', 'Pick a panel, start an assessment and share the link with your respondents.')}</p></div>
      <div class="row">
        <div class="stat" style="text-align:right"><b>${list.length}</b><span>${t('değerlendirme', 'assessments')}</span></div>
        <div class="stat" style="text-align:right;margin-left:18px"><b>${fmtNum(total, getLang())}</b><span>${T('responses')}</span></div>
      </div>
    </div>
    <div class="tiles">${[...MODULES].sort((a, b) => a.order - b.order).map((m) => {
      const as = by[m.key];
      const n = as.reduce((s, a) => s + (a.response_count || 0), 0);
      const open = as.filter((a) => a.status === 'open').length;
      return html`<a class="tile" href="#/m/${m.key}">
        <div class="row between"><span class="ic">${raw(icon(m.icon))}</span>${open ? html`<span class="badge open">${open} ${T('open').toLowerCase()}</span>` : ''}</div>
        <h3>${L(m.name)}</h3><p>${L(m.tagline)}</p>
        <div class="meta"><span><b>${as.length}</b> ${m.key === 'ik' ? t('aday', 'candidates') : t('değerlendirme', 'assessments')}</span><span><b>${n}</b> ${T('responses')}</span></div>
      </a>`;
    })}</div>`);
}

// ------------------------------------------------------------ LİSTE: ARAMA / FİLTRE / SIRALAMA
const PAGE = 20;
const SORTS = [
  { k: 'new', l: { tr: 'En yeni', en: 'Newest' } },
  { k: 'old', l: { tr: 'En eski', en: 'Oldest' } },
  { k: 'resp', l: { tr: 'En çok yanıt', en: 'Most responses' } },
  { k: 'name', l: { tr: 'Ada göre (A–Z)', en: 'Name (A–Z)' } },
];
function sortList(rows, so) {
  const r = [...rows];
  const name = (a) => a.settings?.private?.candidate || a.title || '';
  if (so === 'old') r.sort((x, y) => String(x.created_at).localeCompare(String(y.created_at)));
  else if (so === 'resp') r.sort((x, y) => (y.response_count || 0) - (x.response_count || 0));
  else if (so === 'name') r.sort((x, y) => name(x).localeCompare(name(y), 'tr'));
  else r.sort((x, y) => String(y.created_at).localeCompare(String(x.created_at)));
  return r;
}

// ------------------------------------------------------------ MODÜL SAYFASI
export async function renderModule({ key }) {
  if (!guard('/m/' + key)) return;
  const m = getModule(key);
  if (!m) return go('/app');
  const root = shell(loader(), () => renderModule({ key }));
  let list = [];
  try {
    list = await api.listAssessments(state.org.id, key);
  } catch (err) {
    toast(errText(err), 'err');
  }
  const isIk = key === 'ik';
  const FKEY = 'apx-flt-' + key;
  let F = { q: '', st: 'all', so: 'new', lim: PAGE };
  try { F = { ...F, ...JSON.parse(sessionStorage.getItem(FKEY) || '{}'), lim: PAGE }; } catch {}
  const save = () => { try { sessionStorage.setItem(FKEY, JSON.stringify({ q: F.q, st: F.st, so: F.so })); } catch {} };
  let extra = '';
  if ((isIk || key === 'toplanti') && list.length) {
    const resps = await api.listResponses(list.map((a) => a.id)).catch(() => []);
    if (isIk) extra = ikRanking(list, resps);
    else extra = meetingTrend(m, list, resps);
  }
  root.innerHTML = toStr(html`
    ${crumbs([{ label: T('panels'), href: '#/app' }, { label: L(m.short) }])}
    <div class="page-head">
      <div><h1>${L(m.name)}</h1><p>${L(m.tagline)}</p></div>
      <div class="row">
        <button class="btn" id="info">${raw(icon('info'))} ${t('Panel hakkında', 'About')}</button>
        <a class="btn" href="#/guide/${key}">${raw(icon('clipboard'))} ${t('Kılavuz', 'Guide')}</a>
        <a class="btn" href="#/demo/${key}">${raw(icon('chart'))} ${T('sampleReport')}</a>
        ${canWrite() ? html`<a class="btn primary" href="${access().has ? `#/m/${key}/new` : '#/subscribe'}">${raw(icon(access().has ? 'plus' : 'lock'))} ${isIk ? t('Yeni aday', 'New candidate') : T('newAssessment')}</a>` : ''}
      </div>
    </div>
    ${access().has ? '' : accessBanner()}
    ${raw(extra)}
    ${list.length ? html`<div class="list-tools">
        <div class="search"><span>${raw(icon('search'))}</span><input class="input" id="q" type="search" placeholder="${isIk ? t('Aday, pozisyon veya kod ara…', 'Search candidate, position or code…') : t('Başlık, birim, tarih veya kod ara…', 'Search title, date or code…')}" value="${F.q}" autocomplete="off"></div>
        <div class="seg" id="st">${[['all', t('Tümü', 'All')], ['open', T('open')], ['closed', T('closed')]].map(([k, l]) => html`<button data-v="${k}" class="${F.st === k ? 'on' : ''}">${l} <b>${k === 'all' ? list.length : list.filter((a) => a.status === k).length}</b></button>`)}</div>
        <select class="input" id="so" aria-label="${t('Sırala', 'Sort')}">${SORTS.filter((x) => !x.ik || isIk).map((x) => html`<option value="${x.k}" ${F.so === x.k ? 'selected' : ''}>${L(x.l)}</option>`)}</select>
      </div>
      <div id="lst"></div>` : ''}
    ${list.length ? '' : html`<div class="empty">${raw(icon(m.icon))}<p>${isIk ? t('Henüz aday eklenmedi. Her aday için kişisel bir değerlendirme bağlantısı oluşturun.', 'No candidates yet. Create a personal assessment link for each candidate.') : t('Henüz değerlendirme yok. İlk değerlendirmeyi başlatın; bağlantıyı paylaşın, yanıtlar geldikçe rapor oluşsun.', 'No assessments yet. Start your first one, share the link and the report builds as responses arrive.')}</p>
          ${canWrite() ? html`<a class="btn primary" href="#/m/${key}/new">${raw(icon('plus'))} ${isIk ? t('Yeni aday', 'New candidate') : T('newAssessment')}</a>` : ''}</div>`}`);
  $('#info', root).onclick = () => moduleSheet(key);
  if (!list.length) return;

  const card = (a) => {
          const pv = a.settings?.private || {};
          const sub = isIk
            ? [pv.position, L(FAMILIES.find((f) => f.key === a.settings?.public?.family)?.name)].filter(Boolean).join(' · ')
            : a.module === 'toplanti' && a.settings?.public?.meeting?.date ? fmtDate(a.settings.public.meeting.date, getLang()) : '';
          return html`<div class="li">
            <div><h4>${a.title} <span class="badge ${a.status}">${a.status === 'open' ? T('open') : T('closed')}</span></h4>
              <div class="sub">${sub ? html`<span>${sub}</span>` : ''}<span>${fmtDate(a.created_at, getLang())}</span>
                <span><b class="mono">${a.response_count || 0}</b>${a.target_n ? ' / ' + a.target_n : ''} ${T('responses')}</span><span class="mono">${a.code}</span></div></div>
            <div class="row"><a class="btn sm" href="#/a/${a.id}">${raw(icon('link'))} ${t('Yönet', 'Manage')}</a>
              <a class="btn sm ${a.response_count ? 'cyan' : ''}" href="#/a/${a.id}/report" ${a.response_count ? '' : 'aria-disabled="true" style="opacity:.45;pointer-events:none"'}>${raw(icon('chart'))} ${T('report')}</a></div>
          </div>`;
};
  const hay = (a) => {
    const pv = a.settings?.private || {};
    return [a.title, a.code, pv.candidate, pv.position, pv.contact, a.settings?.public?.meeting?.date, fmtDate(a.created_at, getLang()), ...(a.settings?.public?.departments || [])]
      .filter(Boolean).join(' ').toLocaleLowerCase('tr');
  };
  const index = new Map(list.map((a) => [a.id, hay(a)]));
  const draw = () => {
    const words = F.q.trim().toLocaleLowerCase('tr').split(/\s+/).filter(Boolean);
    let rows = list.filter((a) => (F.st === 'all' || a.status === F.st) && words.every((w) => index.get(a.id).includes(w)));
    rows = sortList(rows, F.so);
    const shown = rows.slice(0, F.lim);
    $('#lst', root).innerHTML = rows.length
      ? toStr(html`<div class="list">${shown.map(card)}</div>
        <div class="list-foot"><span class="dim">${rows.length === list.length ? t(`${rows.length} kayıt`, `${rows.length} items`) : t(`${list.length} kayıttan ${rows.length} eşleşme`, `${rows.length} of ${list.length} match`)}</span>
        ${rows.length > shown.length ? html`<button class="btn sm" id="more">${t('Daha fazla göster', 'Show more')} (${rows.length - shown.length})</button>` : ''}</div>`)
      : toStr(html`<div class="empty sm"><p>${t('Aramanızla eşleşen kayıt yok.', 'No items match your search.')}</p><button class="btn sm" id="clr">${t('Filtreleri temizle', 'Clear filters')}</button></div>`);
    const more = $('#more', root);
    if (more) more.onclick = () => { F.lim += PAGE; save(); draw(); };
    const clr = $('#clr', root);
    if (clr) clr.onclick = () => { F.q = ''; F.st = 'all'; $('#q', root).value = ''; $$('#st button', root).forEach((b) => b.classList.toggle('on', b.dataset.v === 'all')); save(); draw(); };
  };
  let tm;
  $('#q', root).oninput = (e) => { clearTimeout(tm); tm = setTimeout(() => { F.q = e.target.value; F.lim = PAGE; save(); draw(); }, 120); };
  $$('#st button', root).forEach((b) => (b.onclick = () => { F.st = b.dataset.v; F.lim = PAGE; $$('#st button', root).forEach((x) => x.classList.toggle('on', x === b)); save(); draw(); }));
  $('#so', root).onchange = (e) => { F.so = e.target.value; save(); draw(); };
  draw();
}

function ikRanking(list, resps) {
  const rows = list.map((a) => {
    const r = resps.find((x) => x.assessment_id === a.id);
    const s = r ? scoreCandidate(r, a.settings) : null;
    return { a, r, s };
  }).sort((x, y) => (y.s?.fit ?? -1) - (x.s?.fit ?? -1));
  if (!rows.some((x) => x.s)) return '';
  const cell = (v) => (v == null ? '<td class="num dim">—</td>' : `<td class="num" style="color:${bandColor(v)}">${f0(v)}</td>`);
  return toStr(html`<div class="card ik-rank" style="margin-bottom:18px"><div class="card-head"><h3>${raw(icon('users'))} ${t('Aday karşılaştırma', 'Candidate comparison')}</h3><small>${t('İş uyum skoruna göre sıralı', 'Sorted by role fit')}</small></div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>${t('Aday', 'Candidate')}</th><th>${t('Pozisyon', 'Position')}</th><th class="num">${t('Uyum', 'Fit')}</th><th class="num">${t('Bilişsel', 'Cognitive')}</th><th class="num">SJT</th><th class="num">${t('Kişilik', 'Personality')}</th><th class="num">${t('Güven.', 'Reliab.')}</th></tr></thead>
    <tbody>${raw(rows.map((x, i) => `<tr><td class="mono">${i + 1}</td><td><a href="#/a/${x.a.id}/report">${esc(x.a.settings?.private?.candidate || x.a.title)}</a></td><td>${esc(x.a.settings?.private?.position || '')}</td>${
      x.s ? cell(x.s.fit) + cell(x.s.cog) + cell(x.s.sjt) + cell(x.s.persFit) + cell(x.s.rel) : `<td colspan="5" class="dim">${esc(t('Bekleniyor', 'Pending'))}</td>`}</tr>`).join(''))}</tbody></table></div></div>`);
}

function meetingTrend(m, list, resps) {
  const pts = list.map((a) => {
    const rs = resps.filter((r) => r.assessment_id === a.id);
    if (rs.length < 2) return null;
    const g = aggregate(effective(m, a.settings), rs);
    return g.index ? { label: a.settings?.public?.meeting?.date ? fmtDate(a.settings.public.meeting.date, getLang()) : a.title, value: g.index.mean, at: a.settings?.public?.meeting?.date || a.created_at } : null;
  }).filter(Boolean).sort((x, y) => String(x.at).localeCompare(String(y.at)));
  if (pts.length < 2) return '';
  return toStr(html`<div class="card" style="margin-bottom:18px"><div class="card-head"><h3>${raw(icon('chart'))} ${t('Toplantı verimliliği trendi', 'Meeting effectiveness trend')}</h3><small>${pts.length} ${t('toplantı', 'meetings')}</small></div>${raw(trend(pts))}</div>`);
}

// ------------------------------------------------------------ YENİ DEĞERLENDİRME
export function renderNew({ key }) {
  if (!guard(`/m/${key}/new`)) return;
  const m = getModule(key);
  if (!m) return go('/app');
  if (!canWrite()) return go('/m/' + key);
  if (!access().has) return go('/subscribe');
  const lang = getLang();
  const month = new Date().toLocaleDateString(lang === 'en' ? 'en-GB' : 'tr-TR', { month: 'long', year: 'numeric' });
  const has = (s) => (m.settings || []).includes(s);
  const defTitle = key === 'ik' ? '' : `${L(m.short)} — ${month}`;
  const root = shell(html`
    ${crumbs([{ label: T('panels'), href: '#/app' }, { label: L(m.short), href: '#/m/' + key }, { label: key === 'ik' ? t('Yeni aday', 'New candidate') : T('newAssessment') }])}
    <div class="page-head"><div><h1>${key === 'ik' ? t('Yeni aday değerlendirmesi', 'New candidate assessment') : T('newAssessment')}</h1><p>${L(m.name)} · ${itemCount(m)} ${T('questions')} · ~${m.minutes} ${T('minutes')}</p></div></div>
    <form id="f" class="card" style="max-width:760px" novalidate>
      <div class="form-err"></div>
      ${has('candidate') ? html`
        <div class="grid g2">
          <label class="field"><span>${t('Aday adı soyadı', 'Candidate name')}</span><input class="input" id="cand" required></label>
          <label class="field"><span>${t('Başvurduğu pozisyon', 'Position applied for')}</span><input class="input" id="pos" required></label>
        </div>
        <label class="field"><span>${t('Pozisyon ailesi', 'Job family')}</span><select class="input" id="fam">${FAMILIES.map((f) => html`<option value="${f.key}">${L(f.name)}</option>`)}</select>
          <small>${t('Kişilik hedef aralıkları ve modül ağırlıkları bu seçime göre belirlenir.', 'Personality target ranges and module weights depend on this choice.')}</small></label>
        <label class="field"><span>${t('Aday iletişim (isteğe bağlı)', 'Candidate contact (optional)')}</span><input class="input" id="contact" placeholder="e-posta / telefon"></label>
        <label class="field"><span>${t('Not (yalnızca siz görürsünüz)', 'Note (only you can see)')}</span><textarea class="input" id="note"></textarea></label>
      ` : html`
        <label class="field"><span>${t('Başlık', 'Title')}</span><input class="input" id="title" value="${defTitle}" required maxlength="160"></label>`}
      ${has('meeting') ? html`
        <div class="grid g2">
          <label class="field"><span>${t('Toplantı adı', 'Meeting name')}</span><input class="input" id="mname" placeholder="${t('ör. Haftalık üretim toplantısı', 'e.g. Weekly production meeting')}"></label>
          <label class="field"><span>${t('Tarih', 'Date')}</span><input class="input" type="date" id="mdate" value="${new Date().toISOString().slice(0, 10)}"></label>
          <label class="field"><span>${t('Süre (dakika)', 'Duration (minutes)')}</span><input class="input" type="number" id="mmin" min="5" max="600" value="60"></label>
          <label class="field"><span>${t('Katılımcı sayısı', 'Attendees')}</span><input class="input" type="number" id="matt" min="2" max="500" value="8"></label>
        </div>
        <label class="field"><span>${t('Katılımcı başına ortalama saatlik maliyet (₺, isteğe bağlı)', 'Average hourly cost per attendee (optional)')}</span><input class="input" type="number" id="mcost" min="0" placeholder="${t('ör. 600', 'e.g. 40')}">
          <small>${t('Toplantının toplam maliyetini ve verimsizlik kaybını hesaplamak için kullanılır.', 'Used to compute total meeting cost and the inefficiency loss.')}</small></label>` : ''}
      ${has('scenarios') ? html`
        <div class="field"><span>${t('Değerlendirilecek senaryolar', 'Scenarios to assess')}</span>
          ${SCENARIOS.map((s) => html`<label class="check"><input type="checkbox" name="scen" value="${s.key}" checked> <span>${L(s.name)}</span></label>`)}</div>` : ''}
      ${has('departments') ? html`
        <label class="field"><span>${t('Birimler (her satıra bir birim; isteğe bağlı)', 'Departments (one per line; optional)')}</span>
          <textarea class="input" id="depts" placeholder="${t('Üretim\nKalite\nSatış', 'Production\nQuality\nSales')}"></textarea>
          <small>${t(`Katılımcı birimini seçer. Gizliliği korumak için ${CONFIG.MIN_GROUP_N}'ten az yanıtlı birimler raporda ayrı gösterilmez.`, `Respondents pick their department. To protect anonymity, units with fewer than ${CONFIG.MIN_GROUP_N} responses are not shown separately.`)}</small></label>
        <label class="check"><input type="checkbox" id="kiosk"> <span><b>${t('Ortak cihaz (kiosk) modu', 'Shared device (kiosk) mode')}</b> — ${t('Sahada tek tablet/bilgisayar üzerinden birden fazla kişi yanıt verecekse açın. Kapalıyken her cihazdan yalnızca bir yanıt kabul edilir.', 'Enable if several people will respond on one shared tablet/PC. When off, only one response per device is accepted.')}</span></label>` : ''}
      ${has('priorities') ? html`
        <label class="field"><span>${t('Stratejik öncelik listesi (her satıra bir; 5–8 madde)', 'Strategic priority list (one per line; 5–8 items)')}</span>
          <textarea class="input" id="prios" style="min-height:170px">${DEFAULT_PRIORITIES[lang].join('\n')}</textarea></label>
        <div class="field"><span>${t('Yönetimin resmî ilk 3 önceliği (katılımcılar görmez)', "Management's official top 3 (hidden from respondents)")}</span><div id="offi" class="grid g2" style="gap:4px"></div></div>` : ''}
      ${key !== 'ik' ? html`
        <div class="grid g2">
          <label class="field"><span>${t('Beklenen katılımcı sayısı', 'Expected respondents')}</span><input class="input" type="number" id="target" min="1" placeholder="${t('ör. 120', 'e.g. 120')}"><small>${t('Yanıt oranı hesabı için', 'For response-rate calculation')}</small></label>
          <label class="field"><span>${t('Kapanış tarihi (isteğe bağlı)', 'Closing date (optional)')}</span><input class="input" type="date" id="closes"></label>
        </div>` : ''}
      <div class="row end"><a class="btn" href="#/m/${key}">${T('cancel')}</a><button class="btn primary" id="go">${t('Oluştur ve bağlantıyı al', 'Create and get link')}</button></div>
    </form>`);
  const f = $('#f', root);
  // öncelik listesi değiştikçe resmî ilk 3 seçeneklerini yenile
  const prios = $('#prios', root);
  const renderOff = () => {
    const box = $('#offi', root);
    const prev = $$('input[name=off]:checked', root).map((i) => i.value);
    const lines = prios.value.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 10);
    box.innerHTML = lines.map((l, i) => `<label class="check" style="margin:2px 0"><input type="checkbox" name="off" value="${i}" ${prev.includes(String(i)) || (!prev.length && i < 3 && lines.length) ? 'checked' : ''}> <span>${esc(l)}</span></label>`).join('');
    $$('input[name=off]', box).forEach((c) => (c.onchange = () => {
      const on = $$('input[name=off]:checked', box);
      if (on.length > 3) c.checked = false;
    }));
  };
  if (prios) {
    renderOff();
    prios.addEventListener('input', renderOff);
  }
  f.onsubmit = async (e) => {
    e.preventDefault();
    const v = (id) => $('#' + id, root)?.value?.trim();
    const settings = { public: {}, private: {} };
    let title = v('title');
    if (has('candidate')) {
      if (!v('cand') || !v('pos')) return showErr(f, t('Aday adı ve pozisyon zorunlu.', 'Candidate name and position are required.'));
      settings.public.family = v('fam');
      settings.private = { candidate: v('cand'), position: v('pos'), contact: v('contact'), note: v('note') };
      title = `${v('cand')} — ${v('pos')}`;
    }
    if (has('meeting')) {
      settings.public.meeting = { name: v('mname'), date: v('mdate'), minutes: +v('mmin') || null, attendees: +v('matt') || null, hourly: +v('mcost') || null };
      if (v('mname') && title === defTitle) title = v('mname');
    }
    if (has('scenarios')) {
      settings.public.scenarios = $$('input[name=scen]:checked', root).map((i) => i.value);
      if (!settings.public.scenarios.length) return showErr(f, t('En az bir senaryo seçin.', 'Select at least one scenario.'));
    }
    if (has('departments')) {
      settings.public.departments = (v('depts') || '').split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 40);
      if ($('#kiosk', root)?.checked) settings.public.kiosk = true;
    }
    if (has('priorities')) {
      const lines = prios.value.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 10);
      if (lines.length < 4) return showErr(f, t('En az 4 öncelik girin.', 'Enter at least 4 priorities.'));
      settings.public.priorities = lines;
      settings.private.official = $$('input[name=off]:checked', root).map((i) => +i.value);
      if (settings.private.official.length !== 3) return showErr(f, t('Resmî öncelik olarak tam 3 madde seçin.', 'Select exactly 3 official priorities.'));
    }
    if (!title || title.length < 2) return showErr(f, t('Başlık girin.', 'Enter a title.'));
    const b = $('#go', root);
    setBusy(b, true);
    try {
      const a = await api.createAssessment({
        org_id: state.org.id, module: key, title, settings,
        target_n: +v('target') || null,
        closes_at: v('closes') ? new Date(v('closes') + 'T23:59:59').toISOString() : null,
      });
      toast(t('Değerlendirme oluşturuldu.', 'Assessment created.'), 'ok');
      go('/a/' + a.id);
    } catch (err) {
      showErr(f, errText(err));
    } finally {
      setBusy(b, false);
    }
  };
}

// ------------------------------------------------------------ DEĞERLENDİRME DETAYI
export async function renderAssessment({ id }) {
  if (!guard('/a/' + id)) return;
  const root = shell(loader(), () => renderAssessment({ id }));
  const a = await api.getAssessment(id).catch(() => null);
  if (!a) {
    root.innerHTML = `<div class="empty">${esc(t('Değerlendirme bulunamadı.', 'Assessment not found.'))}</div>`;
    return;
  }
  const m = getModule(a.module);
  const em = effective(m, a.settings);
  const resps = await api.listResponses(a.id).catch(() => []);
  const url = surveyUrl(a.code);
  const isIk = a.module === 'ik';
  const lang = getLang();
  const cand = a.settings?.private?.candidate;
  const invite = isIk
    ? t(`Merhaba ${cand || ''},\n\n${state.org.name} bünyesindeki değerlendirme sürecinin bir parçası olarak sizi çevrim içi değerlendirmeye davet ediyoruz. Yaklaşık 35 dakika sürer; sessiz bir ortamda, tek oturumda tamamlamanızı öneririz.\n\nBağlantı: ${url}\n\nTeşekkürler.`,
        `Hello ${cand || ''},\n\nAs part of the selection process at ${state.org.name}, we invite you to complete an online assessment. It takes about 35 minutes; we recommend completing it in one sitting in a quiet place.\n\nLink: ${url}\n\nThank you.`)
    : t(`Değerli çalışma arkadaşlarımız,\n\n"${a.title}" çalışmasında görüşleriniz bizim için çok değerli. Anket tamamen anonimdir; adınız veya iletişim bilginiz sorulmaz. Yaklaşık ${m.minutes} dakika sürer.\n\nKatılmak için: ${url}\n\nTeşekkür ederiz.\n${state.org.name}`,
        `Dear colleagues,\n\nYour views on "${a.title}" matter to us. The survey is fully anonymous; your name or contact details are not collected. It takes about ${m.minutes} minutes.\n\nTo take part: ${url}\n\nThank you.\n${state.org.name}`);
  const rate = a.target_n ? Math.min(100, (100 * resps.length) / a.target_n) : null;
  const scored = isIk ? [] : resps.map((r) => ({ r, q: quality(em, r) }));
  root.innerHTML = toStr(html`
    ${crumbs([{ label: T('panels'), href: '#/app' }, { label: L(m.short), href: '#/m/' + m.key }, { label: a.title }])}
    <div class="page-head">
      <div><h1>${a.title} <span class="badge ${a.status}" style="vertical-align:middle">${a.status === 'open' ? T('open') : T('closed')}</span></h1>
        <p>${L(m.name)} · ${fmtDate(a.created_at, lang)}${a.closes_at ? ' → ' + fmtDate(a.closes_at, lang) : ''} · <span class="mono">${a.code}</span></p></div>
      <div class="row">
        ${resps.length ? html`<a class="btn primary" href="#/a/${a.id}/report">${raw(icon('chart'))} ${t('Raporu aç', 'Open report')}</a>` : ''}
        ${canWrite() ? html`<button class="btn" id="toggle">${raw(icon(a.status === 'open' ? 'stop' : 'play'))} ${a.status === 'open' ? t('Yanıtlara kapat', 'Close') : t('Yeniden aç', 'Reopen')}</button>
          <button class="btn" id="edit">${t('Düzenle', 'Edit')}</button>
          <button class="btn danger" id="del">${raw(icon('trash'))}</button>` : ''}
      </div>
    </div>
    <div class="grid split" style="--a:1.6fr;--b:1fr" id="grid">
      <div class="card">
        <h3>${raw(icon('link'))} ${isIk ? t('Aday bağlantısı', 'Candidate link') : t('Katılım bağlantısı', 'Participation link')}</h3>
        <p class="card-sub">${isIk ? t('Bu bağlantı yalnızca bu aday içindir ve tek kullanımlıktır.', 'This link is for this candidate only and can be used once.') : t('Bağlantıyı e-posta, WhatsApp veya pano/afiş üzerindeki QR kod ile paylaşın. Yanıtlar anonimdir.', 'Share via email, WhatsApp or a QR code on a notice board. Responses are anonymous.')}</p>
        <div class="share-box">
          <div><div class="link" id="lnk">${url}</div>
            <div class="row" style="margin-top:12px">
              <button class="btn sm" id="cp">${raw(icon('copy'))} ${T('copy')}</button>
              <a class="btn sm" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(invite)}">WhatsApp</a>
              <a class="btn sm" href="mailto:${esc(isIk ? a.settings?.private?.contact || '' : '')}?subject=${encodeURIComponent(a.title)}&body=${encodeURIComponent(invite)}">${raw(icon('mail'))} E-posta</a>
              <button class="btn sm" id="cpi">${t('Davet metnini kopyala', 'Copy invitation')}</button>
              ${canShare() ? html`<button class="btn sm cyan" id="shr">${raw(icon('next'))} ${t('Paylaş', 'Share')}</button>` : ''}
            </div></div>
          <div class="qr" title="QR">${raw(qrSvg(url))}</div>
        </div>
      </div>
      <div class="card">
        <h3>${raw(icon('users'))} ${t('Katılım', 'Participation')}</h3>
        <div class="row" style="gap:26px;margin:10px 0 14px">
          <div class="stat"><b>${resps.length}</b><span>${T('responses')}</span></div>
          ${a.target_n ? html`<div class="stat"><b>${getLang() === 'en' ? Math.round(rate) + '%' : '%' + Math.round(rate)}</b><span>${t('yanıt oranı', 'response rate')}</span></div>` : ''}
          ${!isIk && resps.length ? html`<div class="stat"><b>${scored.filter((s) => s.q.level === 'reliable' || s.q.level === 'caution').length}</b><span>${t('geçerli', 'valid')}</span></div>` : ''}
        </div>
        ${a.target_n ? html`<div class="progress" style="height:8px;border-radius:8px"><i style="width:${rate}%"></i></div>` : ''}
        ${!isIk && resps.length && resps.length < 5 ? html`<p class="dim" style="font-size:13px;margin-top:12px">${t('Anlamlı ve anonim bir rapor için en az 5 yanıt önerilir.', 'At least 5 responses are recommended for a meaningful, anonymous report.')}</p>` : ''}
        ${isIk && a.settings?.private?.note ? html`<p class="muted" style="font-size:13px;margin-top:12px"><b>${t('Not', 'Note')}:</b> ${a.settings.private.note}</p>` : ''}
      </div>
    </div>
    ${access().has ? '' : paywallCard()}
    ${resps.length ? html`<div class="card" style="margin-top:16px">
      <div class="card-head"><h3>${t('Yanıtlar', 'Responses')}</h3><button class="btn sm" id="csv">${raw(icon('download'))} ${T('exportCsv')}</button></div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>${t('Tarih', 'Date')}</th><th>${t('Süre', 'Time')}</th>${isIk ? '' : html`<th>${t('Yanıt güveni', 'Response quality')}</th>`}<th></th></tr></thead>
      <tbody>${resps.map((r, i) => {
        const q = scored[i]?.q;
        return html`<tr><td class="mono">${i + 1}</td><td>${new Date(r.created_at).toLocaleString(lang === 'en' ? 'en-GB' : 'tr-TR')}</td><td class="mono">${fmtDuration(r.duration_sec, lang)}</td>
          ${isIk ? '' : html`<td><span class="badge b-${q.level === 'reliable' ? 'excellent' : q.level === 'caution' ? 'develop' : 'critical'}">${L(QUALITY_LEVEL[q.level])} · ${q.score}</span></td>`}
          <td class="num">${canWrite() ? html`<button class="btn sm ghost" data-del="${r.id}" aria-label="${T('delete')}">${raw(icon('trash'))}</button>` : ''}</td></tr>`;
      })}</tbody></table></div></div>` : ''}`);
  $('#cp', root).onclick = () => copyText(url);
  $('#cpi', root).onclick = () => copyText(invite);
  const shr = $('#shr', root);
  if (shr) shr.onclick = () => shareText({ title: a.title, text: invite }).catch(() => {});
  const tg = $('#toggle', root);
  if (tg) tg.onclick = async () => {
    await api.updateAssessment(a.id, { status: a.status === 'open' ? 'closed' : 'open' }).catch((e) => toast(errText(e), 'err'));
    renderAssessment({ id });
  };
  const dl = $('#del', root);
  if (dl) dl.onclick = async () => {
    if (!(await confirmBox(t('Değerlendirme silinsin mi?', 'Delete assessment?'), t(`"${a.title}" ve ${resps.length} yanıt kalıcı olarak silinecek.`, `"${a.title}" and ${resps.length} responses will be permanently deleted.`)))) return;
    await api.deleteAssessment(a.id).catch((e) => toast(errText(e), 'err'));
    go('/m/' + a.module);
  };
  const ed = $('#edit', root);
  if (ed) ed.onclick = () => editSheet(a, () => renderAssessment({ id }));
  $$('[data-del]', root).forEach((b) => (b.onclick = async () => {
    if (!(await confirmBox(t('Yanıt silinsin mi?', 'Delete response?'), t('Bu yanıt rapordan kalıcı olarak çıkarılacak.', 'This response will be permanently removed from the report.')))) return;
    await api.deleteResponse(b.dataset.del).catch((e) => toast(errText(e), 'err'));
    renderAssessment({ id });
  }));
  const csv = $('#csv', root);
  if (csv) csv.onclick = () => exportCsv(a, em, resps);
}

function editSheet(a, done) {
  const s = sheet(html`<h3>${t('Değerlendirmeyi düzenle', 'Edit assessment')}</h3>
    <form id="ef"><div class="form-err"></div>
      <label class="field"><span>${t('Başlık', 'Title')}</span><input class="input" id="et" value="${a.title}"></label>
      ${a.module !== 'ik' ? html`<label class="field"><span>${t('Beklenen katılımcı sayısı', 'Expected respondents')}</span><input class="input" type="number" id="en" value="${a.target_n || ''}"></label>` : ''}
      <label class="field"><span>${t('Kapanış tarihi', 'Closing date')}</span><input class="input" type="date" id="ec" value="${a.closes_at ? a.closes_at.slice(0, 10) : ''}"></label>
      <div class="row end"><button class="btn primary" id="es">${T('save')}</button></div></form>`);
  $('#ef', s.el).onsubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updateAssessment(a.id, {
        title: $('#et', s.el).value.trim() || a.title,
        ...(a.module !== 'ik' ? { target_n: +$('#en', s.el).value || null } : {}),
        closes_at: $('#ec', s.el).value ? new Date($('#ec', s.el).value + 'T23:59:59').toISOString() : null,
      });
      s.close();
      done();
    } catch (err) {
      showErr($('#ef', s.el), errText(err));
    }
  };
}

async function exportCsv(a, mod, resps) {
  const cols = ['id', 'created_at', 'duration_sec', ...Object.keys(resps.reduce((o, r) => Object.assign(o, r.meta || {}), {})).map((k) => 'meta.' + k)];
  const itemIds = a.module === 'ik' ? Object.keys(resps[0]?.answers || {}) : [...mod.items.map((i) => i.id), ...(mod.attention ? [mod.attention.id] : []), ...(mod.extras || []).map((e) => e.id)];
  const head = [...cols, ...itemIds, 'quality'];
  const q = (v) => {
    const s = Array.isArray(v) ? v.join('|') : v == null ? '' : String(v);
    return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const lines = [head.join(';')];
  for (const r of resps) {
    const row = [r.id, r.created_at, r.duration_sec, ...cols.slice(3).map((c) => r.meta?.[c.slice(5)]), ...itemIds.map((k) => r.answers?.[k]), a.module === 'ik' ? '' : quality(mod, r).score];
    lines.push(row.map(q).join(';'));
  }
  if (!(await saveTextFile(`${a.module}-${a.code}.csv`, lines.join('\n')).catch(() => false))) downloadText(`${a.module}-${a.code}.csv`, lines.join('\n'));
}
