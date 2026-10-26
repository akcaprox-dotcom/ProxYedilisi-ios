// =====================================================================
//  KURUM RÖNTGENİ — ProX Yedilisi'nin tüm panellerini tek bakışta birleştirir
//  • Radar (5 uç): Güven · Vizyon · Stres/Dayanıklılık · Senaryo/Kriz · Toplantı
//    Her alanın kendi ana endeksi (0–100, yüksek = iyi). Ortak soru olmadığı için "ortalama" değil, yan yana konum.
//  • 360° İşletme ve İK ayrı kutularda (radarda değil, yorumda kullanılır)
//  • Varsayılan: her alanın yeterli yanıtlı EN GÜNCEL değerlendirmesi; kullanıcı değiştirebilir
//  • Kurallı özet herkese açık (deneme dahil); Claude ile Derin Analiz yalnızca ücretli abonelikte
// =====================================================================
import { html, raw, toStr, $, $$, fmtDate, mean } from '../core/util.js';
import { t, T, L, getLang, errText } from '../core/i18n.js';
import { api } from '../core/api.js';
import { state } from '../core/state.js';
import { icon, toast, loader } from '../core/ui.js';
import { go } from '../core/router.js';
import { getModule, effective } from '../modules/index.js';
import { aggregate, band } from '../core/engine.js';
import { radar, f0, bandColor, trend } from '../core/charts.js';
import { scoreCandidate } from '../modules/ik.js';
import { shell, crumbs } from './layout.js';
import { printPage } from '../core/native.js';
import { access } from '../core/subscription.js';
import { paywallCard } from './subscribe.js';
import { deepCard } from './deep.js';
import { minReportN } from './report.js';

export const AREAS = ['guven', 'vizyon', 'stres', 'senaryo', 'toplanti'];
const STALE_DAYS = 180;
const canWrite = () => ['owner', 'admin'].includes(state.org?.role) || state.isSuper;
const badge = (v) => (v == null ? '' : html`<span class="badge b-${band(v).key}">${L(band(v))}</span>`);
const ageDays = (d) => (Date.now() - new Date(d).getTime()) / 864e5;

// Bir değerlendirmenin rapor özetini hesapla (rapor ekranıyla aynı kurallar)
export function summarize(a, resps) {
  const m = getModule(a.module);
  const em = effective(m, a.settings);
  const minN = minReportN(a);
  let g = aggregate(em, resps, { includeSuspect: false });
  let incl = false;
  if (g.excluded > 0 && g.n < minN) { g = aggregate(em, resps, { includeSuspect: true }); incl = true; }
  const last = resps.map((r) => r.created_at).sort().at(-1) || a.created_at;
  return { a, m, em, g, ok: g.n >= minN && !!g.index, incl, last, minN };
}

// Kurallı paneller arası bulgular (eşikler: <55 zayıf, ≥70 güçlü)
function crossInsights(S) {
  const v = (k) => S[k]?.g.index?.mean ?? null;
  const lo = (k) => v(k) != null && v(k) < 55;
  const hi = (k) => v(k) != null && v(k) >= 70;
  const out = [];
  const add = (cond, tr, en, sev = 'risk') => cond && out.push({ text: t(tr, en), sev });
  add(lo('guven') && lo('stres'), 'Güven düşük ve psikososyal sağlık zayıf: çalışanlar hem baskı altında hem de yönetime yaslanamıyor. Tükenmişlik ve işten ayrılma riski yükseliyor; önce yöneticilerle birebir görüşme ve iş yükü dengelemesi.', 'Low trust and weak psychosocial health: people are under pressure and cannot lean on management. Burnout and attrition risk rises; start with one-to-ones and workload balancing.');
  add(hi('guven') && lo('vizyon'), 'Güven yüksek ama vizyon uyumu düşük: çalışanlar yönetime inanıyor fakat stratejiyi bilmiyor. Sorun niyette değil iletişim kanalında; stratejiyi sade dille ve düzenli anlatmak hızlı sonuç verir.', 'High trust but low vision alignment: people believe management but do not know the strategy. The issue is the channel, not intent; communicating strategy simply and regularly pays off fast.', 'develop');
  add(lo('vizyon') && lo('toplanti'), 'Vizyon uyumu ve toplantı verimi birlikte düşük: kararlar toplantılarda netleşmiyor ve sahaya ulaşmıyor. Toplantı kapanışında karar–sorumlu–tarih disiplini önceliklendirilmeli.', 'Low vision alignment and meeting effectiveness together: decisions are not clarified in meetings and do not reach the floor. Prioritise decision–owner–date discipline at meeting close.');
  add(lo('stres') && lo('toplanti'), 'Psikososyal sağlık ve toplantı verimi düşük: verimsiz toplantılar zamanı tüketip iş yükünü artırıyor olabilir. Toplantı sayısı ve süresi azaltılarak hızlı rahatlama sağlanabilir.', 'Weak psychosocial health and meeting effectiveness: unproductive meetings may be eating time and adding load. Cutting meeting count and length can bring quick relief.');
  add(lo('guven') && lo('vizyon'), 'Güven ve vizyon birlikte zayıf: değişim projeleri dirençle karşılaşabilir. Büyük dönüşümlerden önce küçük, görünür sözler verip tutarak güveni yeniden inşa edin.', 'Weak trust and vision together: change initiatives may face resistance. Before big changes, rebuild trust by making and keeping small visible promises.');
  add(lo('senaryo'), 'Kriz hazırlığı zayıf: olası bir tedarik, nakit veya kilit personel krizinde tepki süresi uzun olabilir. En yüksek riskli senaryo için sorumlu ve tatbikat planı belirleyin.', 'Weak crisis readiness: response could be slow in a supply, cash or key-person crisis. Assign an owner and a drill plan for the highest-risk scenario.');
  add(hi('stres') && hi('guven'), 'Güven ve psikososyal sağlık birlikte güçlü: bu, kurumun değişimi taşıyabilecek sağlam bir zemine sahip olduğunu gösteriyor. Bu dönemi iyileştirme projeleri için kullanın.', 'Strong trust and psychosocial health together: a solid base that can carry change. Use this period for improvement initiatives.', 'excellent');
  if (S.isletme?.ok && v('isletme') != null && v('isletme') < 55) out.push({ text: t('360° İşletme Röntgeni genel puanı riskli bantta: sorunlar tek bir alana sıkışmamış, çalışan deneyiminin geneline yayılmış görünüyor.', 'The 360° Business X-Ray overall score is in the risk band: issues seem spread across the employee experience, not confined to one area.'), sev: 'risk' });
  return out;
}

// Zayıf alanlardan öncelikli 3 aksiyon: her alanın en düşük boyutunun ilk önerisi
function topActions(S, keys) {
  const weak = keys.filter((k) => S[k]?.ok).sort((x, y) => S[x].g.index.mean - S[y].g.index.mean).slice(0, 3);
  return weak.map((k) => {
    const s = S[k];
    const d = [...s.g.dims].filter((x) => x.mean != null && !x.def.noIndex).sort((x, y) => x.mean - y.mean)[0];
    const act = d?.def.actions?.[getLang()]?.[0] || d?.def.actions?.tr?.[0] || '';
    return { k, area: L(s.m.short), dim: d ? L(d.def.name) : '', score: d?.mean, act };
  }).filter((x) => x.act);
}

// Claude'a gidecek toplu veri (kişisel veri yok; açık uçlu yorumlar yazıldığı gibi)
function aiPayload(S, ik) {
  const area = (s) => {
    if (!s?.ok) return null;
    const g = s.g;
    const items = g.items.filter((x) => x.mean != null);
    const comments = {};
    (s.em.extras || []).filter((e) => e.type === 'text').forEach((e) => {
      const list = g.scored.map((x) => x.r.answers?.[e.id]).filter((x) => typeof x === 'string' && x.trim());
      if (!list.length) return;
      const m = new Map();
      list.forEach((q) => { const k = q.trim().toLocaleLowerCase('tr'); const v = m.get(k) || [q.trim(), 0]; v[1]++; m.set(k, v); });
      comments[L(e)] = [...m.values()].sort((x, y) => y[1] - x[1]).slice(0, 25).map(([q, n]) => (n > 1 ? `${q} (×${n})` : q));
    });
    const groups = {};
    for (const f of s.em.meta || []) {
      const rows = (g.groups[f.key] || []).filter((r) => !r.hidden);
      if (rows.length > 1) groups[L(f.label)] = rows.map((r) => ({ grup: f.options ? L(f.options.find((o) => o.v === r.value)) || r.value : r.value, n: r.n, endeks: Math.round(r.index) }));
    }
    return {
      panel: L(s.m.name), degerlendirme: s.a.title, tarih: fmtDate(s.last, 'tr'), yanit: g.n, gelen: g.total, eski_veri: ageDays(s.last) > STALE_DAYS,
      endeks: Math.round(g.index.mean), olumlu_yuzde: Math.round(g.fav), olumsuz_yuzde: Math.round(g.unf),
      enps: g.enps?.score ?? undefined,
      boyutlar: g.dims.filter((d) => d.mean != null).map((d) => ({ ad: L(d.def.name), puan: Math.round(d.mean), olumlu: Math.round(d.fav ?? 0), olumsuz: Math.round(d.unf ?? 0) })),
      en_dusuk_maddeler: [...items].sort((x, y) => x.mean - y.mean).slice(0, 6).map((x) => ({ ifade: L(x.def), puan: Math.round(x.mean) })),
      en_yuksek_maddeler: [...items].sort((x, y) => y.mean - x.mean).slice(0, 4).map((x) => ({ ifade: L(x.def), puan: Math.round(x.mean) })),
      etki_analizi: g.drivers ? g.drivers.list.map((x) => ({ boyut: L(x.def?.name || x.name), puan: Math.round(x.score), etki_r: Math.round(x.r * 100) / 100, bolge: x.quad })) : undefined,
      grup_kirilimlari: Object.keys(groups).length ? groups : undefined,
      yorumlar: Object.keys(comments).length ? comments : undefined,
      toplanti: s.a.module === 'toplanti' ? s.a.settings?.public?.meeting : undefined,
    };
  };
  const data = {
    kurum_sektoru: state.org?.sector || undefined,
    olcek: '0–100, yüksek = iyi. Bantlar: 85+ mükemmel, 70–84 güçlü, 55–69 gelişime açık, 40–54 riskli, <40 kritik.',
    alanlar: Object.fromEntries(AREAS.map((k) => [L(getModule(k).short), area(S[k]) || 'ölçülmedi'])),
    isletme_360: area(S.isletme) || 'ölçülmedi',
    ik_ozet: ik || 'aday değerlendirmesi yok',
  };
  const sources = [...AREAS, 'isletme'].filter((k) => S[k]?.ok).map((k) => ({ module: k, id: S[k].a.id, title: S[k].a.title, n: S[k].g.n }));
  return { data, sources };
}

export async function renderXray() {
  const root = shell(loader(), renderXray);
  if (!state.org) return go('/app');
  if (!access().has) {
    root.innerHTML = toStr(html`${crumbs([{ label: T('panels'), href: '#/app' }, { label: t('Kurum Röntgeni', 'Organization X-Ray') }])}${paywallCard()}`);
    return;
  }
  let list = [], resps = [], snaps = [];
  try {
    list = (await api.listAssessments(state.org.id)).filter((a) => [...AREAS, 'isletme', 'ik'].includes(a.module) && a.response_count > 0);
    [resps, snaps] = await Promise.all([list.length ? api.listResponses(list.map((a) => a.id)) : [], api.listXray(state.org.id).catch(() => [])]);
  } catch (e) {
    root.innerHTML = toStr(html`<div class="empty">${errText(e)}</div>`);
    return;
  }
  const byA = new Map();
  resps.forEach((r) => (byA.get(r.assessment_id) || byA.set(r.assessment_id, []).get(r.assessment_id)).push(r));
  // Her alan için seçenekler: yeterli yanıtlı, en güncel önce
  const options = {};
  for (const k of [...AREAS, 'isletme']) {
    options[k] = list.filter((a) => a.module === k).map((a) => summarize(a, byA.get(a.id) || [])).filter((s) => s.ok).sort((x, y) => String(y.last).localeCompare(String(x.last)));
  }
  let pick = {};
  try { pick = JSON.parse(sessionStorage.getItem('apx-xray-' + state.org.id) || '{}'); } catch {}
  const S = {};
  for (const k of Object.keys(options)) S[k] = options[k].find((s) => s.a.id === pick[k]) || options[k][0] || null;

  // İK özeti (son 90 gün)
  const ikList = list.filter((a) => a.module === 'ik').map((a) => ({ a, r: (byA.get(a.id) || [])[0] })).filter((x) => x.r && ageDays(x.r.created_at) <= 90);
  const ikScores = ikList.map((x) => scoreCandidate(x.r, x.a.settings)).filter((s) => s.fit != null);
  const ik = ikScores.length ? { aday_sayisi_90_gun: ikScores.length, ortalama_uyum: Math.round(mean(ikScores.map((s) => s.fit))), uyum_70_ustu_yuzde: Math.round((100 * ikScores.filter((s) => s.fit >= 70).length) / ikScores.length) } : null;

  let justSaved = false;
  const draw = () => {
    const measured = AREAS.filter((k) => S[k]?.ok);
    const vals = AREAS.map((k) => (S[k]?.ok ? S[k].g.index.mean : null));
    const overall = measured.length >= 3 ? mean(measured.map((k) => S[k].g.index.mean)) : null;
    const prev = justSaved ? snaps[1] : snaps[0];   // az önce kaydedilen çekim "önceki" sayılmaz
    const delta = (k, v) => {
      const p = prev?.data?.areas?.[k]?.score;
      if (p == null || v == null) return '';
      const d = Math.round(v - p);
      return d ? html`<span class="xr-delta ${d > 0 ? 'up' : 'down'}">${d > 0 ? '▲' : '▼'} ${Math.abs(d)}</span>` : '';
    };
    const sorted = [...measured].sort((x, y) => S[y].g.index.mean - S[x].g.index.mean);
    const ins = crossInsights(S);
    const acts = topActions(S, [...AREAS, 'isletme']);
    const labels = AREAS.map((k) => L(getModule(k).short));
    const trendPts = [...snaps].reverse().filter((x) => x.overall != null).map((x) => ({ label: fmtDate(x.created_at, getLang()), value: Number(x.overall) }));
    const areaCard = (k) => {
      const s = S[k];
      const m = getModule(k);
      const opts = options[k];
      return html`<div class="xr-area ${s ? '' : 'none'}">
        <div class="row between"><b>${L(m.short)}</b>${s ? badge(s.g.index.mean) : ''}</div>
        ${s ? html`<div><span class="sc" style="color:${bandColor(s.g.index.mean)}">${f0(s.g.index.mean)}</span>${delta(k, s.g.index.mean)}</div>
          <div class="src">${L(m.indexName || { tr: 'Endeks', en: 'Index' })} · ${s.g.n} ${T('responses')} · ${fmtDate(s.last, getLang())}</div>
          ${ageDays(s.last) > STALE_DAYS ? html`<div class="alert warn" style="margin:0;padding:6px 10px;font-size:12px">${t('Veri 6 aydan eski; yeniden ölçmeniz önerilir.', 'Data is older than 6 months; consider re-measuring.')}</div>` : ''}
          ${opts.length > 1 ? html`<select class="input" data-pick="${k}">${opts.map((o) => html`<option value="${o.a.id}" ${o.a.id === s.a.id ? 'selected' : ''}>${o.a.title} · ${fmtDate(o.last, getLang())} · n=${o.g.n}</option>`)}</select>` : html`<div class="src">${s.a.title}</div>`}
          <a class="btn sm" href="#/a/${s.a.id}/report">${raw(icon('chart'))} ${T('report')}</a>`
        : html`<p class="dim" style="margin:0;font-size:14px">${t('Henüz ölçülmedi', 'Not measured yet')}</p>
          ${canWrite() ? html`<a class="btn sm primary" href="#/m/${k}/new">${raw(icon('plus'))} ${t('Başlat', 'Start')}</a>` : ''}`}
      </div>`;
    };
    root.innerHTML = toStr(html`
      ${crumbs([{ label: T('panels'), href: '#/app' }, { label: t('Kurum Röntgeni', 'Organization X-Ray') }])}
      <div class="page-head">
        <div><div class="eyebrow">${state.org.name} · ProX ${t('Yedilisi', 'Seven')}</div><h1 style="margin-top:8px">${t('Kurum Röntgeni', 'Organization X-Ray')}</h1>
          <p>${t('Tüm panellerinizin sonuçları tek ekranda: hangi alanda güçlü, hangi alanda riskli olduğunuzu ve alanların birbirini nasıl etkilediğini görün.', 'All your panels on one screen: see where you are strong, where you are at risk and how areas affect each other.')}</p></div>
        <div class="row">
          ${canWrite() && measured.length ? html`<button class="btn" id="snap">${raw(icon('clock'))} ${t('Çekimi kaydet', 'Save snapshot')}</button>` : ''}
          <button class="btn" id="print">${raw(icon('print'))} ${T('print')}</button>
        </div>
      </div>
      <div class="glow-note"><span class="gi">${raw(icon('info'))}</span><div><b>${t('Nasıl okunur?', 'How to read')}</b>
        <p>${t('Her uç, o panelin kendi ana endeksidir (0–100, yüksek = iyi). Paneller farklı şeyleri ölçtüğü için bu bir ortalama değil, yan yana bir konumdur. Varsayılan olarak her alanın yeterli yanıtı olan en güncel değerlendirmesi kullanılır; kartlardan başka bir değerlendirme seçebilirsiniz. Genel endeks en az 3 alan ölçülünce hesaplanır.', 'Each axis is that panel\'s own index (0–100, higher is better). Panels measure different things, so this is a side-by-side position, not an average. By default the latest assessment with enough responses is used; you can pick another on each card. The overall index needs at least 3 measured areas.')}</p></div></div>
      <div class="xr-hero">
        <div class="card">${measured.length ? raw(radar(labels, [{ name: t('Bugün', 'Now'), color: 'var(--gold)', values: vals }, ...(prev?.data?.areas ? [{ name: t('Önceki çekim', 'Previous'), color: 'var(--cyan)', dash: true, values: AREAS.map((k) => prev.data.areas[k]?.score ?? null) }] : [])])) : html`<div class="empty sm">${raw(icon('radar'))}<p>${t('Röntgen için en az bir panelde rapor oluşacak kadar yanıt gerekiyor.', 'At least one panel needs enough responses for a report.')}</p></div>`}
          ${prev?.data?.areas && measured.length ? html`<p class="dim" style="font-size:12px;text-align:center">${t('Kesikli çizgi: önceki çekim', 'Dashed: previous snapshot')} (${fmtDate(prev.created_at, getLang())})</p>` : ''}</div>
        <div class="card">
          <div class="stat"><b style="font-size:46px;color:${overall != null ? bandColor(overall) : 'var(--ink-3)'}">${overall != null ? f0(overall) : '—'}</b><span>${t('Genel Kurum Endeksi', 'Overall Organization Index')} ${overall != null ? badge(overall) : ''}</span></div>
          ${overall == null ? html`<p class="dim" style="font-size:13px">${t(`Genel endeks için en az 3 alan ölçülmeli (şu an ${measured.length}).`, `At least 3 measured areas are needed (now ${measured.length}).`)}</p>` : ''}
          ${sorted.length ? html`<div class="qi" style="margin-top:14px"><span>${t('En güçlü alan', 'Strongest area')}</span><span class="v" style="color:${bandColor(S[sorted[0]].g.index.mean)}">${L(getModule(sorted[0]).short)} · ${f0(S[sorted[0]].g.index.mean)}</span></div>` : ''}
          ${sorted.length > 1 ? html`<div class="qi"><span>${t('En zayıf alan', 'Weakest area')}</span><span class="v" style="color:${bandColor(S[sorted.at(-1)].g.index.mean)}">${L(getModule(sorted.at(-1)).short)} · ${f0(S[sorted.at(-1)].g.index.mean)}</span></div>` : ''}
          <div class="qi"><span>${t('Ölçülen alan', 'Measured areas')}</span><span class="v">${measured.length} / ${AREAS.length}</span></div>
          ${trendPts.length >= 2 ? html`<h4 style="margin:16px 0 4px">${t('Genel endeks trendi', 'Overall index trend')}</h4>${raw(trend(trendPts))}` : ''}
        </div>
      </div>
      <div class="rp-sec"><span class="n">01</span><h2>${t('Alanlar', 'Areas')}</h2></div>
      <div class="xr-areas">${AREAS.map(areaCard)}</div>
      <div class="rp-sec"><span class="n">02</span><h2>${t('360° İşletme ve İK', '360° Business and HR')}</h2></div>
      <div class="grid g2">
        <div class="card">${(() => {
          const s = S.isletme;
          if (!s) return html`<h3>${L(getModule('isletme').short)}</h3><p class="dim">${t('Henüz ölçülmedi.', 'Not measured yet.')}</p>${canWrite() ? html`<a class="btn sm primary" href="#/m/isletme/new">${raw(icon('plus'))} ${t('Başlat', 'Start')}</a>` : ''}`;
          const ds = s.g.dims.filter((d) => d.mean != null).sort((x, y) => y.mean - x.mean);
          return html`<div class="row between"><h3 style="margin:0">${L(getModule('isletme').name)}</h3>${badge(s.g.index.mean)}</div>
            <div class="stat" style="margin:10px 0"><b style="color:${bandColor(s.g.index.mean)}">${f0(s.g.index.mean)}</b><span>${s.a.title} · n=${s.g.n}${s.g.enps ? ' · eNPS ' + (s.g.enps.score > 0 ? '+' : '') + s.g.enps.score : ''}</span></div>
            ${ds.slice(0, 2).map((d) => html`<div class="qi"><span>${t('Güçlü', 'Strong')}: ${L(d.def.name)}</span><span class="v" style="color:${bandColor(d.mean)}">${f0(d.mean)}</span></div>`)}
            ${ds.slice(-2).reverse().map((d) => html`<div class="qi"><span>${t('Zayıf', 'Weak')}: ${L(d.def.name)}</span><span class="v" style="color:${bandColor(d.mean)}">${f0(d.mean)}</span></div>`)}
            ${options.isletme.length > 1 ? html`<select class="input" data-pick="isletme" style="margin-top:10px">${options.isletme.map((o) => html`<option value="${o.a.id}" ${o.a.id === s.a.id ? 'selected' : ''}>${o.a.title} · ${fmtDate(o.last, getLang())}</option>`)}</select>` : ''}
            <a class="btn sm" href="#/a/${s.a.id}/report" style="margin-top:10px">${raw(icon('chart'))} ${T('report')}</a>`;
        })()}</div>
        <div class="card"><h3>${L(getModule('ik').name)}</h3>
          ${ik ? html`<div class="row" style="gap:24px;margin:10px 0">
              <div class="stat"><b>${ik.aday_sayisi_90_gun}</b><span>${t('aday (son 90 gün)', 'candidates (90 days)')}</span></div>
              <div class="stat"><b style="color:${bandColor(ik.ortalama_uyum)}">${ik.ortalama_uyum}</b><span>${t('ortalama uyum', 'average fit')}</span></div>
              <div class="stat"><b>${getLang() === 'en' ? ik.uyum_70_ustu_yuzde + '%' : '%' + ik.uyum_70_ustu_yuzde}</b><span>${t('uyum 70+', 'fit 70+')}</span></div></div>
              <p class="dim" style="font-size:13px">${t('İşe alım adayları kurumun sağlığını değil adayları ölçtüğü için radara katılmaz; Derin Analiz yorumunda kullanılır.', 'Candidates measure applicants, not the organization, so they are not on the radar; they are used in the Deep Analysis.')}</p>
              <a class="btn sm" href="#/m/ik">${t('Adaylar', 'Candidates')}</a>`
            : html`<p class="dim">${t('Son 90 günde tamamlanan aday değerlendirmesi yok.', 'No completed candidate assessments in the last 90 days.')}</p>`}
        </div>
      </div>
      <div class="rp-sec"><span class="n">03</span><h2>${t('Bütünleşik özet', 'Integrated summary')}</h2></div>
      ${measured.length || S.isletme ? html`<div class="insight">
          ${ins.length ? ins.map((x) => html`<div class="ins" style="--ic:var(--c-${x.sev === 'excellent' ? 'excellent' : x.sev === 'develop' ? 'develop' : 'critical'})"><div><p>${x.text}</p></div></div>`)
            : html`<div class="ins" style="--ic:var(--c-strong)"><div><p>${t('Alanlar arasında belirgin bir risk örüntüsü görünmüyor. Ölçülmeyen alanları da ölçtükçe bu bölüm zenginleşir.', 'No marked cross-area risk pattern. This section gets richer as you measure more areas.')}</p></div></div>`}
        </div>
        ${acts.length ? html`<h3 style="margin:18px 0 8px">${t('Öncelikli 3 aksiyon', 'Top 3 actions')}</h3><div class="insight">${acts.map((x, i) => html`<div class="ins" style="--ic:${bandColor(x.score)}"><div><h4>${i + 1}. ${x.area} · ${x.dim} <small>${f0(x.score)}</small></h4><p>${x.act}</p></div></div>`)}</div>` : ''}`
        : html`<div class="empty sm"><p>${t('Özet için önce panellerde değerlendirme yapın.', 'Run assessments in the panels first.')}</p></div>`}
      ${measured.length || S.isletme ? deep.html : ''}
      ${snaps.length ? html`<details style="margin-top:18px"><summary>${t('Kayıtlı çekimler', 'Saved snapshots')} (${snaps.length})</summary>
        <div class="list" style="margin-top:10px">${snaps.map((x) => html`<div class="li"><span>${fmtDate(x.created_at, getLang())}</span><span class="mono">${x.overall != null ? f0(x.overall) : '—'}</span>
          ${canWrite() ? html`<button class="btn sm ghost" data-delsnap="${x.id}" aria-label="${T('delete')}">${raw(icon('trash'))}</button>` : ''}</div>`)}</div></details>` : ''}`);
    $$('[data-pick]', root).forEach((sel) => (sel.onchange = () => {
      const k = sel.dataset.pick;
      S[k] = options[k].find((o) => o.a.id === sel.value) || S[k];
      pick[k] = sel.value;
      try { sessionStorage.setItem('apx-xray-' + state.org.id, JSON.stringify(pick)); } catch {}
      draw();
    }));
    $('#print', root).onclick = () => printPage(t('Kurum Röntgeni', 'Organization X-Ray'));
    const sn = $('#snap', root);
    if (sn) sn.onclick = async () => {
      const areas = Object.fromEntries([...AREAS, 'isletme'].filter((k) => S[k]?.ok).map((k) => [k, { score: Math.round(S[k].g.index.mean * 10) / 10, id: S[k].a.id, title: S[k].a.title, n: S[k].g.n }]));
      try {
        const row = await api.saveXray(state.org.id, overall != null ? Math.round(overall * 10) / 10 : null, { areas, ik });
        snaps.unshift(row);
        justSaved = true;
        toast(t('Çekim kaydedildi. Sonraki çekimde değişim gösterilir.', 'Snapshot saved. Changes will show next time.'), 'ok');
        draw();
      } catch (e) {
        toast(errText(e), 'err');
      }
    };
    $$('[data-delsnap]', root).forEach((b) => (b.onclick = async () => {
      await api.deleteXray(b.dataset.delsnap).catch((e) => toast(errText(e), 'err'));
      snaps = snaps.filter((x) => x.id !== b.dataset.delsnap);
      draw();
    }));
    if (measured.length || S.isletme) deep.mount(root);
  };
  const deep = deepCard({ kind: 'xray', buildData: async () => aiPayload(S, ik) });
  draw();
}
