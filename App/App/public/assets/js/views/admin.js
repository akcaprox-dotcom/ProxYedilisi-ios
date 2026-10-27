// SÜPER ADMİN — yalnızca super_admins tablosundaki hesaplar görür (menüde de gizli)
// Kurumları listeler; incele · mesaj gönder · dondur/aktifleştir · sil · tüm kurumlara duyuru
import { html, raw, toStr, $, $$, fmtDate, esc } from '../core/util.js';
import { t, T, getLang, errText } from '../core/i18n.js';
import { api } from '../core/api.js';
import { state, adminOpenOrg, refresh, refreshUnread } from '../core/state.js';
import { loader, toast, icon, sheet, setBusy, showErr, confirmBox } from '../core/ui.js';
import { go } from '../core/router.js';
import { shell } from './layout.js';

let filter = '';
let limit = 10;      // ilk 10 kurum; "daha fazla" ile 10'ar artar
let cache = null;    // arama ve sayfalama sunucuya tekrar gitmez

// Sayfaya girişte ve bir işlemden sonra: veriyi sunucudan yeniden al
export async function renderAdmin() {
  cache = null;
  return draw();
}

async function draw() {
  if (!state.session) return go('/login?next=/admin');
  if (state.org?.viaAdmin) await refresh(); // başka kurumun gözünden çıkıp kendi hesabına dön
  if (!state.isSuper) return go('/app');
  const root = shell(cache ? '' : loader(), draw);
  if (!cache) {
    cache = { rows: [], sent: [], ms: [], ai: [] };
    try {
      const [rows, sent, ms, ai] = await Promise.all([api.adminOverview(), api.adminSentMessages(), api.adminMsPurchases().catch(() => []), api.adminAiUsage().catch(() => [])]);
      cache = { rows, sent, ms, ai };
    } catch (err) {
      toast(errText(err), 'err');
    }
  }
  const { rows, sent, ms, ai } = cache;
  const lang = getLang();
  const tot = rows.reduce((a, r) => ({ a: a.a + Number(r.assessments), r: a.r + Number(r.responses) }), { a: 0, r: 0 });
  const frozen = rows.filter((r) => r.status === 'frozen').length;
  const q = filter.toLocaleLowerCase('tr');
  const shown = rows.filter((r) => !q || [r.org_name, r.owner_name, r.owner_email, r.owner_phone].some((v) => String(v || '').toLocaleLowerCase('tr').includes(q)));

  root.innerHTML = toStr(html`
    <div class="page-head">
      <div><div class="eyebrow">${t('Süper admin', 'Super admin')}</div><h1 style="margin-top:8px">${t('Kurum yönetimi', 'Organization management')}</h1>
        <p>${t('Kurumları inceleyin, mesaj gönderin, askıya alın veya silin. Bu sayfa yalnızca size görünür.', 'Review, message, suspend or delete organizations. Only you can see this page.')}</p></div>
      <div class="row" style="gap:22px">
        <div class="stat"><b>${rows.length}</b><span>${t('kurum', 'orgs')}</span></div>
        <div class="stat"><b style="color:var(--violet)">${frozen}</b><span>${t('askıda', 'suspended')}</span></div>
        <div class="stat"><b>${tot.a}</b><span>${t('değerlendirme', 'assessments')}</span></div>
        <div class="stat"><b>${tot.r}</b><span>${T('responses')}</span></div>
      </div>
    </div>
    <div class="row between" style="margin-bottom:14px">
      <input class="input" id="flt" placeholder="${t('Kurum, kişi, telefon veya e-posta ara…', 'Search organization, person, phone or email…')}" value="${filter}" style="max-width:420px">
      <button class="btn primary" id="bcast">${raw(icon('mail'))} ${t('Tüm kurumlara duyuru', 'Announce to all')}</button>
    </div>
    ${shown.length ? html`<div class="list">${shown.slice(0, limit).map((r) => html`
      <div class="li">
        <div>
          <h4>${r.org_name} ${r.status === 'frozen' ? html`<span class="badge frozen">${t('Askıda', 'Suspended')}</span>` : html`<span class="badge open">${t('Aktif', 'Active')}</span>`} ${subBadge(r, lang)}</h4>
          <div class="sub">
            <span>${raw(icon('user'))} ${r.owner_name || '—'}</span>
            ${r.owner_phone ? html`<span class="mono">+${String(r.owner_phone).replace(/^\+/, '')}</span>` : ''}
            ${r.owner_email ? html`<span>${r.owner_email}</span>` : ''}
            <span>${t('Kayıt', 'Joined')}: ${fmtDate(r.created_at, lang)}</span>
            <span>${t('Son etkinlik', 'Last activity')}: ${fmtDate(r.last_activity || r.created_at, lang)}</span>
            <span><b class="mono">${r.assessments}</b> ${t('değ.', 'assess.')} · <b class="mono">${r.responses}</b> ${T('responses')}</span>
          </div>
          ${r.status === 'frozen' && r.frozen_reason ? html`<div class="sub" style="margin-top:6px;color:var(--violet)">${t('Gerekçe', 'Reason')}: ${r.frozen_reason}</div>` : ''}
        </div>
        <div class="row">
          <button class="btn sm" data-act="open" data-id="${r.org_id}">${raw(icon('eye'))} ${t('İncele', 'Inspect')}</button>
          <button class="btn sm" data-act="msg" data-id="${r.org_id}">${raw(icon('mail'))} ${t('Mesaj', 'Message')}</button>
          <button class="btn sm" data-act="access" data-id="${r.org_id}">${raw(icon('key'))} ${t('Süre', 'Access')}</button>
          <button class="btn sm" data-act="ai" data-id="${r.org_id}">${raw(icon('spark'))} ${t('Claude limiti', 'Claude limit')}</button>
          ${r.status === 'frozen'
            ? html`<button class="btn sm cyan" data-act="activate" data-id="${r.org_id}">${raw(icon('play'))} ${t('Aktifleştir', 'Reactivate')}</button>`
            : html`<button class="btn sm" data-act="freeze" data-id="${r.org_id}">${raw(icon('lock'))} ${t('Dondur', 'Suspend')}</button>`}
          <button class="btn sm danger" data-act="delete" data-id="${r.org_id}" aria-label="${T('delete')}">${raw(icon('trash'))} ${T('delete')}</button>
        </div>
      </div>`)}</div>
      <div class="row between" style="margin-top:10px"><small class="muted">${t(`${shown.length} kurumdan ${Math.min(limit, shown.length)} tanesi gösteriliyor`, `Showing ${Math.min(limit, shown.length)} of ${shown.length}`)}</small>
        ${shown.length > limit ? html`<button class="btn sm" id="more">${t(`10 daha göster (kalan ${shown.length - limit})`, `Show 10 more (${shown.length - limit} left)`)}</button>` : ''}</div>`
      : html`<div class="empty">${t('Kayıt bulunamadı.', 'No results.')}</div>`}

    <div class="rp-sec"><span class="n">⊞</span><h2>${t('Microsoft Store satın alımları', 'Microsoft Store purchases')}</h2></div>
    <p class="muted" style="font-size:13px;margin-top:-6px">${t('Windows uygulamasından gelen abonelikler sunucuda Microsoft\'a sorulmadan kaydedilir. Bu listeyi ara ara Partner Center → Analiz ProX → Analytics / Payouts ile karşılaştırın; karşılığı olmayan kaydı iptal edin (o kurumun Microsoft kaynaklı erişimi hemen kapanır).', 'Windows subscriptions are recorded without server-side Microsoft verification. Compare this list with Partner Center reports from time to time and revoke any record without a matching purchase (that organization\'s Microsoft-based access closes immediately).')}</p>
    ${ms.length ? html`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${t('Kurum', 'Organization')}</th><th>${t('Kişi', 'Person')}</th><th>${t('İlk görülme', 'First seen')}</th><th>${t('Son görülme', 'Last seen')}</th><th>${t('Erişim bitişi', 'Access until')}</th><th>${t('Jeton', 'Token')}</th><th></th></tr></thead>
      <tbody>${ms.map((m) => html`<tr><td>${m.org_name}</td><td>${m.user_name || ''}${m.user_phone ? html`<br><small class="mono">+${String(m.user_phone).replace(/^\+/, '')}</small>` : ''}</td>
        <td>${fmtDate(m.first_seen_at, lang)}</td><td>${fmtDate(m.last_seen_at, lang)} <small class="dim">×${m.seen_count}</small></td><td>${m.sub_expires_at ? fmtDate(m.sub_expires_at, lang) : '—'}</td>
        <td class="mono" style="font-size:11px">…${m.token_tail}</td>
        <td>${m.status === 'revoked' ? html`<span class="badge closed">${t('İptal', 'Revoked')}</span>` : html`<button class="btn sm danger" data-msrev="${m.id}">${t('İptal et', 'Revoke')}</button>`}</td></tr>`)}</tbody></table></div>`
      : html`<p class="dim">${t('Henüz Microsoft Store satın alımı yok.', 'No Microsoft Store purchases yet.')}</p>`}

    <div class="rp-sec"><span class="n">✦</span><h2>${t('Claude Derin Analiz kullanımı', 'Claude Deep Analysis usage')}</h2></div>
    <p class="muted" style="font-size:13px;margin-top:-6px">${t('Bu ayki kullanım ve tahmini maliyet (OpenRouter faturası esastır). Varsayılan limitler: Kurum Röntgeni ayda 2, İK aday ayda 50. "Limit" ile kurum bazında değiştirin; boş bırakılan alan varsayılana döner.', 'This month\'s usage and estimated cost (the OpenRouter invoice is authoritative). Defaults: X-Ray 2/month, HR candidate 50/month. Use "Limit" to change per organization; empty returns to default.')}</p>
    ${(() => {
      const used = ai.filter((x) => Number(x.xray_used) || Number(x.ik_used) || Number(x.total_cost) || x.xray_limit !== 2 || x.ik_limit !== 50);
      const mc = ai.reduce((s, x) => s + Number(x.month_cost || 0), 0);
      return html`<div class="row" style="gap:26px;margin:0 0 12px"><div class="stat"><b>$${mc.toFixed(2)}</b><span>${t('bu ay toplam', 'this month total')}</span></div>
        <div class="stat"><b>${ai.reduce((s, x) => s + Number(x.xray_used) + Number(x.ik_used), 0)}</b><span>${t('analiz (bu ay)', 'analyses (this month)')}</span></div></div>
      ${used.length ? html`<div class="tbl-wrap"><table class="tbl"><thead><tr><th>${t('Kurum', 'Organization')}</th><th>${t('Ücretli', 'Paid')}</th><th class="num">${t('Röntgen', 'X-Ray')}</th><th class="num">${t('İK aday', 'HR cand.')}</th><th class="num">${t('Bu ay $', 'Month $')}</th><th class="num">${t('Toplam $', 'Total $')}</th><th>${t('Son', 'Last')}</th><th></th></tr></thead>
        <tbody>${used.map((x) => html`<tr><td>${x.org_name}</td><td>${x.paid ? '✓' : '—'}</td><td class="num">${x.xray_used}/${x.xray_limit}</td><td class="num">${x.ik_used}/${x.ik_limit}</td>
          <td class="num">${Number(x.month_cost || 0).toFixed(3)}</td><td class="num">${Number(x.total_cost || 0).toFixed(3)}</td><td>${x.last_at ? fmtDate(x.last_at, lang) : '—'}</td>
          <td><button class="btn sm" data-ailim="${x.org_id}">${t('Limit', 'Limit')}</button></td></tr>`)}</tbody></table></div>`
        : html`<p class="dim">${t('Henüz Derin Analiz kullanılmadı. Bir kuruma özel limit vermek için kurum satırındaki "Claude limiti" düğmesini kullanın.', 'No Deep Analysis used yet. Use the "Claude limit" button on an organization row to set a custom limit.')}</p>`}`;
    })()}

    <div class="rp-sec"><span class="n">✉</span><h2>${t('Gönderilen mesajlar', 'Sent messages')}</h2></div>
    ${sent.length ? html`<div class="list">${sent.map((m) => html`<div class="msg">
        <h4>${m.title} <span class="badge ${m.org_id ? 'open' : 'b-develop'}">${m.org_id ? m.org_name || '—' : t('Tüm kurumlar', 'All organizations')}</span></h4>
        <div class="meta">${new Date(m.created_at).toLocaleString(lang === 'en' ? 'en-GB' : 'tr-TR')} · ${t('okunma', 'reads')}: ${m.reads}</div>
        <p>${m.body}</p>
        <div class="row end" style="margin-top:8px"><button class="btn sm ghost" data-delmsg="${m.id}">${raw(icon('trash'))} ${t('Geri çek', 'Withdraw')}</button></div>
      </div>`)}</div>` : html`<p class="dim">${t('Henüz mesaj gönderilmedi.', 'No messages sent yet.')}</p>`}
  `);

  const byId = (id) => rows.find((r) => r.org_id === id);
  const flt = $('#flt', root);
  const more = $('#more', root);
  if (more) more.onclick = () => { limit += 10; draw(); };
  flt.oninput = () => {
    filter = flt.value;
    limit = 10;
    clearTimeout(flt._t);
    flt._t = setTimeout(() => {
      draw().then(() => {
        const f = document.getElementById('flt');
        if (f) {
          f.focus();
          f.setSelectionRange(f.value.length, f.value.length);
        }
      });
    }, 250);
  };
  $('#bcast', root).onclick = () => messageSheet(null);
  $$('[data-act]', root).forEach((b) => (b.onclick = async () => {
    const r = byId(b.dataset.id);
    const act = b.dataset.act;
    if (act === 'open') {
      await adminOpenOrg(r.org_id);
      go('/app');
    } else if (act === 'msg') messageSheet(r);
    else if (act === 'freeze') freezeSheet(r);
    else if (act === 'access') accessSheet(r);
    else if (act === 'ai') aiLimitSheet(ai.find((x) => x.org_id === r.org_id) || { org_id: r.org_id, org_name: r.org_name, xray_limit: 2, ik_limit: 50 });
    else if (act === 'activate') {
      try {
        await api.adminSetOrgStatus(r.org_id, 'active');
        toast(t(`${r.org_name} yeniden aktif.`, `${r.org_name} reactivated.`), 'ok');
        renderAdmin();
      } catch (err) {
        toast(errText(err), 'err');
      }
    } else if (act === 'delete') deleteSheet(r);
  }));
  $$('[data-ailim]', root).forEach((b) => (b.onclick = () => aiLimitSheet(ai.find((x) => x.org_id === b.dataset.ailim))));
  $$('[data-msrev]', root).forEach((b) => (b.onclick = async () => {
    const ok = await confirmBox(t('Microsoft satın alımı iptal edilsin mi?', 'Revoke this Microsoft purchase?'),
      t('Bu kayıt artık erişim uzatmaz; kurumun başka etkin Microsoft kaydı yoksa Microsoft kaynaklı erişimi hemen kapanır. Yalnızca Partner Center\'da karşılığı olmayan kayıtlar için kullanın.', 'This record will no longer extend access; if the organization has no other active Microsoft record, its Microsoft-based access closes immediately. Use only for records without a matching Partner Center purchase.'),
      { okText: t('İptal et', 'Revoke') });
    if (!ok) return;
    try {
      await api.adminMsRevoke(b.dataset.msrev);
      toast(t('Kayıt iptal edildi.', 'Record revoked.'), 'ok');
      renderAdmin();
    } catch (err) {
      toast(errText(err), 'err');
    }
  }));
  $$('[data-delmsg]', root).forEach((b) => (b.onclick = async () => {
    try {
      await api.adminDeleteMessage(b.dataset.delmsg);
      renderAdmin();
    } catch (err) {
      toast(errText(err), 'err');
    }
  }));
}

function messageSheet(r) {
  const s = sheet(html`<h3>${raw(icon('mail'))} ${r ? t(`${r.org_name} kurumuna mesaj`, `Message to ${r.org_name}`) : t('Tüm kurumlara duyuru', 'Announcement to all organizations')}</h3>
    <p class="muted" style="font-size:14px">${t('Mesaj, kurum yöneticisinin panelinde ve üst çubuktaki mesaj simgesinde görünür.', "The message appears in the organization admin's panel and in the messages icon in the top bar.")}</p>
    <form id="mf"><div class="form-err"></div>
      <label class="field"><span>${t('Başlık', 'Title')}</span><input class="input" id="mt" maxlength="160" required></label>
      <label class="field"><span>${t('Mesaj', 'Message')}</span><textarea class="input" id="mb" maxlength="4000" style="min-height:150px" required></textarea></label>
      <div class="row end"><button type="button" class="btn" id="mc">${T('cancel')}</button><button class="btn primary" id="ms">${t('Gönder', 'Send')}</button></div>
    </form>`);
  $('#mc', s.el).onclick = s.close;
  $('#mf', s.el).onsubmit = async (e) => {
    e.preventDefault();
    const title = $('#mt', s.el).value.trim(), body = $('#mb', s.el).value.trim();
    if (!title || !body) return showErr($('#mf', s.el), T('required'));
    const b = $('#ms', s.el);
    setBusy(b, true);
    try {
      await api.adminSendMessage(r?.org_id || null, title, body);
      s.close();
      toast(t('Mesaj gönderildi.', 'Message sent.'), 'ok');
      renderAdmin();
    } catch (err) {
      showErr($('#mf', s.el), errText(err));
      setBusy(b, false);
    }
  };
}

// Abonelik / deneme durumu rozeti
function subBadge(r, lang) {
  const fut = (x) => !!x && new Date(x).getTime() > Date.now();
  if (fut(r.sub_expires_at)) {
    const lbl = r.sub_store === 'admin' ? t('Tanımlı', 'Granted') : r.sub_status === 'billing_issue' ? t('Ödeme sorunu', 'Billing issue') : r.sub_status === 'cancelled' ? t('İptal edildi', 'Cancelled') : t('Abone', 'Subscribed');
    return html`<span class="badge open" title="${r.sub_store || ''}">${lbl} · ${fmtDate(r.sub_expires_at, lang)}</span>`;
  }
  if (fut(r.trial_ends_at)) return html`<span class="badge">${t('Deneme', 'Trial')} · ${fmtDate(r.trial_ends_at, lang)}</span>`;
  return html`<span class="badge closed">${t('Erişim yok', 'No access')}</span>`;
}

// Elle erişim süresi tanımlama (hediye, kurumsal anlaşma, destek)
function accessSheet(r) {
  const lang = getLang();
  const def = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
  const s = sheet(html`<h3>${raw(icon('key'))} ${t(`${r.org_name} — erişim süresi`, `${r.org_name} — access period`)}</h3>
    <p class="muted" style="font-size:14px">${t('Kuruma, mağaza aboneliği olmadan belirlediğiniz tarihe kadar tam erişim tanımlar (ör. kurumsal anlaşma, destek telafisi). Mağaza aboneliği bu süreyi değiştirmez. Kaldırırsanız kurum deneme/abonelik durumuna döner.', 'Grants full access until the chosen date without a store subscription (e.g. corporate deal, support credit). Store purchases do not override it. Removing it returns the organization to its trial/subscription state.')}</p>
    ${r.sub_store === 'admin' && r.sub_expires_at ? html`<div class="alert info">${t('Mevcut tanım', 'Current grant')}: ${fmtDate(r.sub_expires_at, lang)}</div>` : ''}
    <form id="af"><div class="form-err"></div>
      <label class="field"><span>${t('Bitiş tarihi', 'Until')}</span><input class="input" type="date" id="ad" value="${def}" required></label>
      <label class="field"><span>${t('Not (yalnızca siz görürsünüz)', 'Note (only you see it)')}</span><input class="input" id="an" maxlength="200"></label>
      <div class="row end">
        ${r.sub_store === 'admin' ? html`<button type="button" class="btn danger" id="ax">${t('Tanımı kaldır', 'Remove grant')}</button>` : ''}
        <button type="button" class="btn" id="ac">${T('cancel')}</button><button class="btn primary" id="as">${t('Kaydet', 'Save')}</button></div>
    </form>`);
  $('#ac', s.el).onclick = s.close;
  const done = (msg) => { s.close(); toast(msg, 'ok'); renderAdmin(); };
  const x = $('#ax', s.el);
  if (x) x.onclick = async () => {
    try { await api.adminSetAccess(r.org_id, null, null); done(t('Tanım kaldırıldı.', 'Grant removed.')); } catch (err) { showErr($('#af', s.el), errText(err)); }
  };
  $('#af', s.el).onsubmit = async (e) => {
    e.preventDefault();
    const b = $('#as', s.el);
    setBusy(b, true);
    try {
      await api.adminSetAccess(r.org_id, new Date($('#ad', s.el).value + 'T23:59:59').toISOString(), $('#an', s.el).value);
      done(t('Erişim süresi kaydedildi.', 'Access period saved.'));
    } catch (err) {
      showErr($('#af', s.el), errText(err));
      setBusy(b, false);
    }
  };
}

function freezeSheet(r) {
  const s = sheet(html`<h3>${raw(icon('lock'))} ${t(`${r.org_name} askıya alınsın mı?`, `Suspend ${r.org_name}?`)}</h3>
    <p class="muted" style="font-size:14px">${t('Askıdaki kurumun yöneticisi giriş yapabilir ama panellere, raporlara ve değerlendirme oluşturmaya erişemez. Katılımcı bağlantıları kapanır. Veriler silinmez; istediğiniz an yeniden aktifleştirebilirsiniz.', 'The admin of a suspended organization can sign in but cannot access panels, reports or create assessments. Respondent links are closed. No data is deleted; you can reactivate at any time.')}</p>
    <form id="ff"><div class="form-err"></div>
      <label class="field"><span>${t('Gerekçe (kurum yöneticisi görür)', 'Reason (visible to the organization admin)')}</span>
        <textarea class="input" id="fr" maxlength="500" placeholder="${t('ör. Ödeme bekleniyor / Kullanım koşulları ihlali', 'e.g. Payment pending / Terms of use violation')}"></textarea></label>
      <label class="check"><input type="checkbox" id="fm" checked> <span>${t('Gerekçeyi ayrıca mesaj olarak da gönder', 'Also send the reason as a message')}</span></label>
      <div class="row end"><button type="button" class="btn" id="fc">${T('cancel')}</button><button class="btn danger" id="fs">${raw(icon('lock'))} ${t('Askıya al', 'Suspend')}</button></div>
    </form>`);
  $('#fc', s.el).onclick = s.close;
  $('#ff', s.el).onsubmit = async (e) => {
    e.preventDefault();
    const reason = $('#fr', s.el).value.trim();
    const b = $('#fs', s.el);
    setBusy(b, true);
    try {
      await api.adminSetOrgStatus(r.org_id, 'frozen', reason);
      if ($('#fm', s.el).checked)
        await api.adminSendMessage(r.org_id, t('Hesabınız askıya alındı', 'Your account has been suspended'),
          reason || t('Ayrıntılı bilgi için analizprox@gmail.com adresine yazabilirsiniz.', 'For details please contact analizprox@gmail.com.'));
      s.close();
      toast(t(`${r.org_name} askıya alındı.`, `${r.org_name} suspended.`), 'ok');
      renderAdmin();
    } catch (err) {
      showErr($('#ff', s.el), errText(err));
      setBusy(b, false);
    }
  };
}

function deleteSheet(r) {
  const word = t('SİL', 'DELETE');
  const s = sheet(html`<h3 style="color:var(--crimson-2)">${raw(icon('trash'))} ${t(`${r.org_name} kalıcı olarak silinsin mi?`, `Permanently delete ${r.org_name}?`)}</h3>
    <p class="muted" style="font-size:14px">${t(`Kurum, ${r.assessments} değerlendirme ve ${r.responses} yanıt kalıcı olarak silinir. Bu işlem geri alınamaz. Geçici bir önlem istiyorsanız "Dondur"u kullanın.`, `The organization, ${r.assessments} assessments and ${r.responses} responses will be permanently deleted. This cannot be undone. Use "Suspend" for a temporary measure.`)}</p>
    <form id="df"><div class="form-err"></div>
      <label class="check"><input type="checkbox" id="dow"> <span>${t(`Kurum sahibinin kullanıcı hesabını da sil (${r.owner_name || ''}${r.owner_phone ? ', +' + String(r.owner_phone).replace(/^\+/, '') : ''}). Başka kurumu yoksa ve süper admin değilse silinir.`, `Also delete the owner's user account (${r.owner_name || ''}). Deleted only if they have no other organization and are not a super admin.`)}</span></label>
      <label class="field"><span>${t(`Onaylamak için "${word}" yazın`, `Type "${word}" to confirm`)}</span><input class="input" id="dw" autocomplete="off"></label>
      <div class="row end"><button type="button" class="btn" id="dc">${T('cancel')}</button><button class="btn danger" id="ds" disabled>${raw(icon('trash'))} ${t('Kalıcı olarak sil', 'Delete permanently')}</button></div>
    </form>`);
  const ds = $('#ds', s.el);
  $('#dw', s.el).oninput = (e) => (ds.disabled = e.target.value.trim() !== word);
  $('#dc', s.el).onclick = s.close;
  $('#df', s.el).onsubmit = async (e) => {
    e.preventDefault();
    setBusy(ds, true);
    try {
      await api.adminDeleteOrg(r.org_id, $('#dow', s.el).checked);
      s.close();
      toast(t(`${r.org_name} silindi.`, `${r.org_name} deleted.`), 'ok');
      await refresh();
      renderAdmin();
    } catch (err) {
      showErr($('#df', s.el), errText(err));
      setBusy(ds, false);
    }
  };
}

// ------------------------------------------------------------ KURUM YÖNETİCİSİNİN MESAJ KUTUSU

export async function renderMessages() {
  if (!state.session) return go('/login?next=/messages');
  const root = shell(loader(), renderMessages);
  const msgs = await refreshUnread().catch(() => []);
  const lang = getLang();
  root.innerHTML = toStr(html`
    <div class="crumbs-row"><a class="btn sm back-btn" href="#/app">${raw(icon('back'))} ${T('back')}</a></div>
    <div class="page-head"><div><div class="eyebrow">Analiz ProX</div><h1 style="margin-top:8px">${t('Mesajlar', 'Messages')}</h1>
      <p>${t('Analiz ProX yönetiminden gelen bildirim ve duyurular.', 'Notices and announcements from Analiz ProX.')}</p></div></div>
    ${msgs.length ? html`<div class="list">${msgs.map((m) => html`<div class="msg ${m.is_read ? '' : 'unread'}">
        <h4>${m.is_read ? '' : html`<span class="badge b-develop">${t('Yeni', 'New')}</span>`} ${m.title}</h4>
        <div class="meta">${new Date(m.created_at).toLocaleString(lang === 'en' ? 'en-GB' : 'tr-TR')}${m.org_id ? ' · ' + (m.org_name || '') : ' · ' + t('Duyuru', 'Announcement')}</div>
        <p>${m.body}</p></div>`)}</div>`
      : html`<div class="empty">${raw(icon('mail'))}<p>${t('Henüz mesajınız yok.', 'You have no messages yet.')}</p></div>`}`);
  // açılan mesajları okundu işaretle
  const unread = msgs.filter((m) => !m.is_read);
  if (unread.length) {
    await Promise.all(unread.map((m) => api.markMessageRead(m.id).catch(() => {})));
    state.unread = 0;
    const dot = document.querySelector('.topnav .dot-n');
    if (dot) dot.remove();
  }
}

// Kuruma özel Derin Analiz limitleri (boş = varsayılan)
function aiLimitSheet(x) {
  if (!x) return;
  const s = sheet(html`<h3>${t('Derin Analiz limiti', 'Deep Analysis limit')} · ${x.org_name}</h3>
    <form id="alf"><div class="form-err"></div>
      <div class="grid g2">
        <label class="field"><span>${t('Kurum Röntgeni / ay', 'X-Ray / month')}</span><input class="input" type="number" min="0" id="al-x" value="${x.xray_limit === 2 ? '' : x.xray_limit}" placeholder="2"></label>
        <label class="field"><span>${t('İK aday / ay', 'HR candidate / month')}</span><input class="input" type="number" min="0" id="al-i" value="${x.ik_limit === 50 ? '' : x.ik_limit}" placeholder="50"></label>
      </div>
      <p class="dim" style="font-size:13px">${t('Boş bırakırsanız varsayılan limit (2 / 50) geçerli olur.', 'Leave empty for the default (2 / 50).')}</p>
      <div class="row end"><button class="btn primary">${T('save')}</button></div></form>`);
  $('#alf', s.el).onsubmit = async (e) => {
    e.preventDefault();
    const v = (id) => ($('#' + id, s.el).value === '' ? null : +$('#' + id, s.el).value);
    try {
      await api.adminSetAiLimits(x.org_id, v('al-x'), v('al-i'));
      s.close();
      toast(t('Limit kaydedildi.', 'Limit saved.'), 'ok');
      renderAdmin();
    } catch (err) {
      showErr($('#alf', s.el), errText(err));
    }
  };
}

