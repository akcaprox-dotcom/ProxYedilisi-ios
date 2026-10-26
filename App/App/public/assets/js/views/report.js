// RAPOR — tüm Likert modülleri için ortak, modüle özel bölümlerle genişleyen profesyonel analiz raporu
import { html, raw, toStr, $, esc, fmtDate, fmtNum, mean, round } from '../core/util.js';
import { t, T, L, getLang, errText } from '../core/i18n.js';
import { api } from '../core/api.js';
import { state } from '../core/state.js';
import { icon, toast, loader } from '../core/ui.js';
import { go } from '../core/router.js';
import { getModule, effective } from '../modules/index.js';
import { META } from '../modules/common.js';
import { aggregate, band, perceptionGap, QUAD, QUALITY_TEXT, QUALITY_LEVEL, to100 } from '../core/engine.js';
import { gauge, radar, barList, favStack, heatmap, quadrant, histogram, npsBar, riskMatrix, trend as trendChart, f0, bandColor, num } from '../core/charts.js';
import { shell, crumbs, app } from './layout.js';
import { reportNotice } from './report-notice.js';
import { printPage } from '../core/native.js';
import { access } from '../core/subscription.js';
import { paywallCard } from './subscribe.js';
import { demoAssessment, demoResponses } from '../modules/demo.js';
import { renderIkReport } from './report-ik.js';
import { CONFIG } from '../config.js';

const B = (v) => band(v);
const badge = (v) => (v == null ? '' : html`<span class="badge b-${B(v).key}">${L(B(v))}</span>`);
const pct = (v) => (v == null ? '—' : getLang() === 'en' ? Math.round(v) + '%' : '%' + Math.round(v));
const sec = (n, title, lead = '') => html`<div class="rp-sec"><span class="n">${String(n).padStart(2, '0')}</span><h2>${title}</h2></div>${lead ? html`<p class="lead">${lead}</p>` : ''}`;
const dimName = (d) => L(d.def?.name || d.name);
const dimShort = (d) => L(d.def?.short || d.short || d.def?.name || d.name);

// ------------------------------------------------------------ GİRİŞ NOKTALARI
export async function renderReport({ id }) {
  if (!state.session) return go('/login?next=' + encodeURIComponent('/a/' + id + '/report'));
  const root = shell(loader(), () => renderReport({ id }));
  if (!access().has) {
    root.innerHTML = toStr(html`${crumbs([{ label: T('panels'), href: '#/app' }, { label: T('report') }])}${paywallCard()}`);
    return;
  }
  try {
    const a = await api.getAssessment(id);
    if (!a) throw new Error('not_found');
    const resps = await api.listResponses(a.id);
    let siblings = null;
    if (a.module === 'toplanti') {
      const list = await api.listAssessments(a.org_id, 'toplanti');
      siblings = { list, resps: await api.listResponses(list.map((x) => x.id)) };
    }
    draw(root, a, resps, { org: state.org?.name, siblings });
  } catch (err) {
    root.innerHTML = `<div class="empty">${esc(errText(err))}</div>`;
  }
}

export function renderDemo({ key }) {
  const m = getModule(key);
  if (!m) return go('/');
  const a = demoAssessment(key, key === 'senaryo' ? 14 : key === 'toplanti' ? 9 : 86);
  const resps = demoResponses(key, key === 'senaryo' ? 14 : key === 'toplanti' ? 9 : 86, a);
  const root = shell('', () => renderDemo({ key }));
  draw(root, a, resps, { org: t('Örnek Kurum A.Ş.', 'Sample Company Ltd.'), demo: true });
}

// Rapor için gereken en az yanıt: beklenen katılımcı 1–2 ise o sayı, aksi hâlde 3
export const minReportN = (a) => (a.target_n && a.target_n < 3 ? a.target_n : 3);

function draw(root, a, resps, ctx) {
  const m = getModule(a.module);
  if (a.module === 'ik') return renderIkReport(root, a, resps, ctx);
  // Rapor her zaman dolu açılır: geçerli yanıt eşiğe yetmiyorsa şüpheli yanıtlar otomatik dahil edilir
  const em = effective(m, a.settings);
  const strict = aggregate(em, resps, { includeSuspect: false });
  let includeSuspect = strict.excluded > 0 && strict.n < minReportN(a);
  const auto = includeSuspect;
  const paint = () => {
    root.innerHTML = toStr(build(m, a, resps, { ...ctx, includeSuspect, auto })) + toStr(reportNotice(m.key));
    const tg = $('#inc', root);
    if (tg) tg.onclick = (e) => {
      e.preventDefault();
      includeSuspect = !includeSuspect;
      paint();
    };
    const pr = $('#print', root);
    if (pr) pr.onclick = () => printPage(a.title);
  };
  paint();
}

// ------------------------------------------------------------ RAPOR GÖVDESİ
function build(base, a, resps, ctx) {
  const mod = effective(base, a.settings);
  const lang = getLang();
  const g = aggregate(mod, resps, { includeSuspect: ctx.includeSuspect });
  const head = header(base, a, g, ctx);
  const minN = minReportN(a);
  if (!g.total) return html`${head}<div class="empty">${t('Henüz yanıt yok. Bağlantıyı paylaştıkça yanıtlar burada rapora dönüşür.', 'No responses yet. As you share the link, responses turn into a report here.')}</div>`;
  if (g.n < minN) return html`${head}${glow('lock', t('Rapor için daha fazla yanıt gerekiyor', 'More responses needed for the report'),
    t(`Katılımcıların anonimliğini korumak için rapor en az ${minN} yanıtla oluşturulur. Şu an ${g.n} yanıt var; ${minN - g.n} yanıt daha gelince rapor kendiliğinden açılır. Daha sağlıklı sonuç için en az 5, ideal olarak 10 ve üzeri yanıt önerilir.`, `To protect respondents' anonymity, the report needs at least ${minN} responses. There are ${g.n} now; it opens automatically after ${minN - g.n} more. At least 5, ideally 10+, responses are recommended for reliable results.`)
    + (a.module === 'toplanti' ? ' ' + t('Not: Her cihazdan yalnızca bir yanıt kabul edilir. Toplantıyı tek cihazdan birden fazla kişi yanıtlayacaksa değerlendirmeyi "Ortak cihaz (kiosk) modu" açık olarak oluşturun.', 'Note: only one response per device is accepted. If several people answer on one device, create the assessment with "Shared device (kiosk) mode" on.') : ''))}`;

  const gap = base.gap ? perceptionGap(mod, g, base.gap.field, base.gap.mgmt) : null;
  const dimsSorted = [...g.dims].filter((d) => d.mean != null && !d.def.noIndex).sort((x, y) => y.mean - x.mean);
  let n = 0;
  const out = [];

  if (minN < 3) out.push(glow('alert', t('Az katılımcılı değerlendirme', 'Very small assessment'), t(`Bu değerlendirme ${a.target_n} katılımcı için oluşturuldu. Sonuçlar anonim değildir ve istatistiksel olarak genellenemez; kişinin kendi görüşü olarak okuyun.`, `This assessment was created for ${a.target_n} respondent(s). Results are not anonymous and cannot be generalised statistically; read them as personal views.`)));
  if (g.n >= minN && g.n < 5 && minN >= 3) out.push(glow('info', t('Sınırlı veri', 'Limited data'), t(`Rapor ${g.n} yanıtla oluşturuldu. Sonuçlar yön gösterir ama güven aralıkları geniştir; daha sağlıklı sonuç için en az 5, ideal olarak 10 ve üzeri yanıt toplayın.`, `This report is based on ${g.n} responses. It is indicative but confidence intervals are wide; collect at least 5, ideally 10+, responses for reliable results.`)));

  // 01 — YÖNETİCİ ÖZETİ
  out.push(sec(++n, t('Yönetici özeti', 'Executive summary')));
  out.push(kpis(base, mod, a, g));
  out.push(html`<div class="insight" style="margin-top:14px">${insights(base, mod, a, g, dimsSorted, gap)}</div>`);

  // 02 — BOYUT PROFİLİ
  out.push(sec(++n, t('Boyut profili', 'Dimension profile'), t('Her boyut 0–100 ölçeğinde. Çubuk üzerindeki ince çizgi %95 güven aralığıdır; aralık ne kadar darsa sonuç o kadar kesindir. Dikey çizgiler 40 / 55 / 70 / 85 bant sınırlarını gösterir.', 'Each dimension on a 0–100 scale. The thin line on each bar is the 95% confidence interval; the narrower it is, the more precise the result. Vertical ticks mark band limits at 40 / 55 / 70 / 85.')));
  const allDims = g.dims.filter((d) => d.mean != null);
  const series = [{ name: t('Tüm katılımcılar', 'All respondents'), color: 'var(--cyan)', values: allDims.map((d) => d.mean) }];
  if (gap) {
    series.push({ name: t('Yönetim', 'Management'), color: 'var(--gold)', dash: true, values: allDims.map((d) => gap.find((x) => x.key === d.key)?.mgmt) });
  }
  out.push(html`<div class="grid g2">
    <div class="card">${raw(radar(allDims.map(dimShort), series))}</div>
    <div class="card">${raw(barList(allDims.map((d) => ({ label: dimName(d), sub: d.def.desc ? L(d.def.desc) : d.alpha != null ? `α ${num(d.alpha, 2)}` : '', value: d.mean, ci: d.ci }))))}</div>
  </div>`);

  // 03 — OLUMLU / OLUMSUZ
  out.push(sec(++n, t('Yanıt dağılımı', 'Response distribution'), t('Her boyutta olumlu (4–5), kararsız (3) ve olumsuz (1–2) yanıtların payı. Ters ifadeli sorular çevrilerek hesaplanmıştır.', 'Share of favourable (4–5), neutral (3) and unfavourable (1–2) answers per dimension. Reverse-worded items are recoded.')));
  out.push(html`<div class="card">${raw(favStack(allDims.map((d) => ({ label: dimName(d), fav: d.fav, neu: d.neu, unf: d.unf })), { labels: [t('Olumsuz', 'Unfavourable'), t('Kararsız', 'Neutral'), t('Olumlu', 'Favourable')] }))}</div>`);

  // 04 — ETKİ ANALİZİ
  if (g.drivers) {
    const pri = g.drivers.list.filter((x) => x.quad === 'priority').sort((x, y) => y.importance - x.importance);
    out.push(sec(++n, t('Etki analizi: neye öncelik verilmeli?', 'Driver analysis: what to prioritise?'),
      t(`Yatay eksen boyutun puanı, dikey eksen "${L(base.outcome.name)}" sonucuyla ilişkisidir (Pearson r). Sol üst bölgedeki boyutlar sonucu en çok etkileyen ama zayıf kalan alanlardır; iyileştirme yatırımı en yüksek getiriyi burada sağlar.`,
        `The horizontal axis is the dimension score; the vertical axis is its correlation (Pearson r) with "${L(base.outcome.name)}". Dimensions in the top-left are high-impact but weak: improvement pays off most there.`)));
    out.push(html`<div class="grid split" style="--a:1.5fr;--b:1fr">
      <div class="card">${raw(quadrant(g.drivers.list.map((x) => ({ x: x.score, y: x.importance, label: dimName(x), short: dimShort(x) })), {
        xLabel: t('Puan', 'Score'), yLabel: t('Etki (r)', 'Impact (r)'), medY: g.drivers.medR,
        names: { priority: L(QUAD.priority), protect: L(QUAD.protect), monitor: L(QUAD.monitor), maintain: L(QUAD.maintain) } }))}</div>
      <div class="card"><h3>${t('Öncelik sırası', 'Priority order')}</h3>
        ${[...g.drivers.list].sort((x, y) => y.importance - x.importance).map((x) => html`<div class="qi"><span>${dimName(x)} <small style="color:${x.quad === 'priority' ? 'var(--c-critical)' : 'var(--ink-3)'}">· ${L(QUAD[x.quad])}</small></span><span class="v">r ${num(x.r, 2)}</span></div>`)}
        ${pri.length ? '' : html`<p class="dim" style="font-size:13px;margin-top:10px">${t('Kritik öncelik bölgesinde boyut yok.', 'No dimension falls in the critical priority zone.')}</p>`}
      </div></div>`);
  }

  // 05 — KÖR NOKTA
  if (gap) {
    const big = [...gap].sort((x, y) => Math.abs(y.gap) - Math.abs(x.gap));
    out.push(sec(++n, t('Kör noktalar: yönetim ve çalışan algısı', 'Blind spots: management vs. employee perception'),
      t('Yöneticilerin verdiği puan ile diğer çalışanların puanı arasındaki fark. 10 puanı aşan farklar, yönetimin sahadaki gerçeği olduğundan iyi (veya kötü) gördüğü kör noktalardır.', 'Difference between scores given by managers and by other employees. Gaps above 10 points are blind spots where management sees reality as better (or worse) than it is.')));
    out.push(html`<div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>${t('Boyut', 'Dimension')}</th><th class="num">${t('Yönetim', 'Mgmt')}</th><th class="num">${t('Çalışanlar', 'Employees')}</th><th class="num">${t('Fark', 'Gap')}</th><th></th></tr></thead>
      <tbody>${big.map((x) => html`<tr><td>${dimName(x)}</td><td class="num">${f0(x.mgmt)}</td><td class="num">${f0(x.staff)}</td>
        <td class="num" style="color:${Math.abs(x.gap) >= 10 ? 'var(--c-critical)' : 'var(--ink-2)'}"><b>${x.gap > 0 ? '+' : ''}${f0(x.gap)}</b></td>
        <td>${Math.abs(x.gap) >= 10 ? html`<span class="badge b-critical">${t('Kör nokta', 'Blind spot')}</span>` : Math.abs(x.gap) >= 5 ? html`<span class="badge b-develop">${t('İzle', 'Watch')}</span>` : html`<span class="badge b-excellent">${t('Uyumlu', 'Aligned')}</span>`}</td></tr>`)}</tbody></table></div></div>`);
  }

  // MODÜLE ÖZEL
  if (a.module === 'toplanti') out.push(...meetingSections(++n, base, a, g, ctx));
  if (a.module === 'senaryo') out.push(...scenarioSections(++n, mod, a, g)), n++;
  if (a.module === 'vizyon') {
    const s = visionAlignment(++n, a, g);
    if (s) out.push(s);
    else n--;
  }
  if (a.module === 'stres') out.push(...stressSections(++n, mod, g));

  // GRUP KIRILIMLARI
  const groupFields = (base.meta || []).filter((f) => g.groups[f.key]?.length > 1);
  if (groupFields.length) {
    const gmin = mod.minGroupN ?? CONFIG.MIN_GROUP_N;
    out.push(sec(++n, a.module === 'toplanti' ? t('Rol karşılaştırması: üç bakış açısı', 'Role comparison: three perspectives') : t('Grup karşılaştırması', 'Group comparison'), a.module === 'toplanti'
      ? t('Aynı toplantıyı düzenleyen, sunum yapan ve katılımcıların nasıl gördüğü. Farklar, toplantıyı yönetenin fark etmediği sorunları gösterir.', 'How the organizer, presenters and participants saw the same meeting. Gaps reveal issues the chair may not notice.')
      : t('Birim ve gruplara göre boyut puanları.', 'Dimension scores by unit and group.')));
    out.push(glow('shield', t('Anonimlik eşiği', 'Anonymity threshold'), a.module === 'toplanti'
      ? t(`Her rolden en az ${gmin} yanıt gelmeden o rol ayrı gösterilmez. Rol karşılaştırması için her rolden en az ${gmin} kişinin yanıt vermesini sağlayın.`, `A role is shown only after at least ${gmin} responses from it. Make sure at least ${gmin} people per role respond.`)
      : t(`Kimin ne cevap verdiğinin tahmin edilmemesi için ${gmin}'ten az yanıt alan birim ve gruplar raporda ayrı gösterilmez ("Anonimlik eşiğinin altında").`, `So that no one can infer who answered what, units and groups with fewer than ${gmin} responses are not shown separately ("Below anonymity threshold").`)));
    for (const f of groupFields) {
      const rows = g.groups[f.key];
      const label = (v) => (f.options ? L(f.options.find((o) => o.v === v)) || v : v);
      out.push(html`<div class="card" style="margin-bottom:14px"><h3>${L(f.label).replace(/^(Your |Bu |Biriminiz|Pozisyon grubunuz)/, (s) => s)}</h3>
        ${raw(heatmap(rows.map((r) => label(r.value)), [t('Endeks', 'Index'), ...allDims.map(dimShort)],
          rows.map((r) => (r.hidden ? null : [r.index, ...allDims.map((d) => r.dims[d.key])])),
          { rowNotes: rows.map((r) => `n=${r.hidden ? '<' + (mod.minGroupN ?? CONFIG.MIN_GROUP_N) : r.n}`), hiddenText: t('Anonimlik eşiğinin altında', 'Below anonymity threshold') }))}</div>`);
    }
  }

  // MADDE ANALİZİ
  const its = g.items.filter((x) => x.mean != null && mod.dims.some((d) => d.key === x.def.dim && !d.noIndex));
  if (its.length >= 6) {
    const top = [...its].sort((x, y) => y.mean - x.mean).slice(0, 5);
    const low = [...its].sort((x, y) => x.mean - y.mean).slice(0, 5);
    const row = (x) => html`<div class="qi"><span>${L(x.def)}${x.def.rev ? html` <small>(${t('ters', 'reversed')})</small>` : ''}<br><small>${L(mod.dims.find((d) => d.key === x.def.dim)?.name)} · ${t('olumlu', 'fav.')} ${pct(x.fav)}</small></span><span class="v" style="color:${bandColor(x.mean)}">${f0(x.mean)}</span></div>`;
    out.push(sec(++n, t('Madde analizi', 'Item analysis'), t('En yüksek ve en düşük puan alan ifadeler. Ters ifadeli maddelerde puan, olumlu yöne çevrilmiştir.', 'Highest and lowest scoring statements. Reverse-worded items are recoded so that higher is better.')));
    out.push(html`<div class="grid g2"><div class="card"><h3 style="color:var(--c-excellent)">${t('Güçlü yanlar', 'Strengths')}</h3>${top.map(row)}</div>
      <div class="card"><h3 style="color:var(--c-critical)">${t('Gelişim alanları', 'Development areas')}</h3>${low.map(row)}</div></div>`);
  }

  // DAĞILIM
  out.push(sec(++n, t('Bireysel endeks dağılımı', 'Distribution of individual scores'), t('Her katılımcının kendi endeks puanına göre dağılım. Tek tepeli dar bir dağılım ortak bir algıya, geniş veya iki tepeli dağılım kurum içinde bölünmüş deneyimlere işaret eder.', "Distribution of each respondent's own index. A narrow single peak signals a shared perception; a wide or two-peaked shape points to divided experiences.")));
  out.push(html`<div class="grid split" style="--a:1.6fr;--b:1fr"><div class="card">${raw(histogram(g.hist, { xLabel: L(mod.indexName || { tr: 'Endeks', en: 'Index' }) }))}</div>
    <div class="card"><div class="stat"><b style="color:${g.riskShare >= 30 ? 'var(--c-critical)' : 'var(--ink)'}">${pct(g.riskShare)}</b><span>${t('55 altında puan veren katılımcı', 'Respondents scoring below 55')}</span></div>
      <div class="stat" style="margin-top:16px"><b>${num(g.index.sd, 1)}</b><span>${t('standart sapma', 'standard deviation')}</span></div>
      <div class="stat" style="margin-top:16px"><b>${pct(g.consensus)}</b><span>${t('görüş birliği', 'consensus')}</span></div></div></div>`);

  // AKSİYON PLANI
  out.push(sec(++n, t('Önerilen aksiyon planı', 'Recommended action plan'), t('En düşük puanlı ve (varsa) etki analizinde öncelikli çıkan boyutlar için 90 günlük somut adımlar.', 'Concrete 90-day steps for the lowest-scoring dimensions and those flagged as priorities by the driver analysis.')));
  out.push(actionPlan(mod, g, dimsSorted));

  // AÇIK UÇLU
  const texts = (mod.extras || []).filter((e) => e.type === 'text');
  const comments = texts.map((e) => ({ e, list: g.scored.map((s) => s.r.answers?.[e.id]).filter((x) => typeof x === 'string' && x.trim()) })).filter((x) => x.list.length);
  if (comments.length) {
    out.push(sec(++n, t('Katılımcı görüşleri', 'Respondent comments'), t('Açık uçlu yanıtlar, en sık yazılandan başlayarak sıralanmıştır. Aynı görüşü yazan kişi sayısı ve oranı yanında gösterilir; tam liste en alttadır. Yanıtlar olduğu gibi, düzenlenmeden aktarılmıştır.', 'Open-ended answers ranked from most frequent. The number and share of people who wrote the same view is shown; the full list is at the bottom. Answers are shown verbatim.')));
    out.push(html`${comments.map((c) => commentBlock(c, g.n))}`);
  }

  // KALİTE & METODOLOJİ
  out.push(sec(++n, t('Veri kalitesi ve metodoloji', 'Data quality and methodology')));
  out.push(qualityAndMethod(mod, g, ctx));

  return html`${head}${out}`;
}

// ------------------------------------------------------------ BAŞLIK
function header(base, a, g, ctx) {
  const lang = getLang();
  const dates = g.all?.map((s) => s.r.created_at).sort() || [];
  const rate = a.target_n ? Math.min(100, (100 * g.total) / a.target_n) : null;
  return html`
    ${ctx.demo ? html`<div class="alert info no-print">${t('Bu bir örnek rapordur; sentetik verilerle üretilmiştir. Kendi raporunuz için ücretsiz hesap oluşturup değerlendirme başlatın.', 'This is a sample report generated from synthetic data. Create a free account and start an assessment for your own report.')} ${state.session ? '' : html`<a href="#/register">${T('register')} →</a>`}</div>` : ''}
    ${!ctx.demo ? crumbs([{ label: T('panels'), href: '#/app' }, { label: L(base.short), href: '#/m/' + base.key }, { label: a.title, href: '#/a/' + a.id }, { label: T('report') }]) : ''}
    <div class="rp-head">
      <div><div class="eyebrow">Analiz Pro<span class="gold">X</span> · ${L(base.name)}</div>
        <h1>${a.title}</h1>
        <div class="facts"><span><b>${ctx.org || ''}</b></span>
          <span>${t('Gelen yanıt', 'Responses')}: <b>${g.total}</b></span>
          <span>${t('Rapora dahil', 'In report')}: <b>${g.n}</b></span>
          ${rate != null ? html`<span>${t('Yanıt oranı', 'Response rate')}: <b>${pct(rate)}</b></span>` : ''}
          ${dates.length ? html`<span>${t('Veri', 'Data')}: <b>${fmtDate(dates[0], lang)} – ${fmtDate(dates[dates.length - 1], lang)}</b></span>` : ''}
          <span>${t('Rapor', 'Report')}: <b>${fmtDate(new Date().toISOString(), lang)}</b></span></div></div>
      <div class="toolbar">
        <a class="btn sm no-print" href="#/guide/${base.key}">${raw(icon('info'))} ${t('Bu rapor nasıl okunur?', 'How to read this report')}</a>
        <button class="btn sm" id="print">${raw(icon('print'))} ${T('print')}</button>
      </div>
    </div>
    ${suspectLine(g, ctx)}`;
}

const flagShort = (k) => ({ attention: t('dikkat sorusu yanlış', 'failed attention check'), straight: t('tek düze işaretleme', 'straight-lining'), pattern: t('tek düze örüntü', 'monotonous pattern'),
  speed: t('çok hızlı yanıt', 'too fast'), fast: t('hızlı yanıt', 'fast'), inconsistent: t('çelişkili yanıtlar', 'contradictory answers'), mixed: t('kısmi tutarsızlık', 'partial inconsistency'), empty: t('eksik yanıt', 'incomplete') })[k] || k;

// Şüpheli yanıt bilgisi: raporu engellemez, küçük bir bilgi satırı olarak durur
function suspectLine(g, ctx) {
  const sus = (g.all || []).filter((s) => !(s.q.level === 'reliable' || s.q.level === 'caution'));
  if (!sus.length || ctx.demo) return '';
  const flags = {};
  sus.forEach((s) => s.q.flags.forEach((f) => (flags[f.k] = (flags[f.k] || 0) + 1)));
  const why = Object.entries(flags).sort((x, y) => y[1] - x[1]).slice(0, 3).map(([k]) => flagShort(k)).join(', ');
  const n = sus.length;
  const msg = ctx.includeSuspect
    ? (ctx.auto
      ? t(`Geçerli yanıt az olduğu için şüpheli işaretlenen ${n} yanıt da rapora dahil edildi (${why}).`, `Because valid responses are few, ${n} flagged response(s) were also included (${why}).`)
      : t(`Şüpheli işaretlenen ${n} yanıt rapora dahil (${why}).`, `${n} flagged response(s) are included (${why}).`))
    : t(`${n} yanıt şüpheli işaretlendi (${why}) ve rapor dışında tutuldu.`, `${n} response(s) were flagged (${why}) and excluded.`);
  return html`<div class="suspect-line no-print">${raw(icon('info'))}<span>${msg}</span>
    <a href="#" id="inc">${ctx.includeSuspect ? t('Hariç tut', 'Exclude them') : t('Dahil et', 'Include them')}</a></div>`;
}

// Göze çarpan bilgi kutusu (anonimlik / veri yeterliliği)
function glow(ic, title, body) {
  return html`<div class="glow-note"><span class="gi">${raw(icon(ic))}</span><div><b>${title}</b><p>${body}</p></div></div>`;
}

// ------------------------------------------------------------ KPI
function kpis(base, mod, a, g) {
  const idx = g.index;
  const ciTxt = idx.ci ? `${t('%95 GA', '95% CI')} ${f0(idx.ci[0])}–${f0(idx.ci[1])}` : '';
  const cards = [];
  cards.push(html`<div class="kpi main">${raw(gauge(idx.mean, { label: L(mod.indexName || { tr: 'Genel endeks', en: 'Overall index' }), sub: `${L(B(idx.mean))} · ${ciTxt}` }))}</div>`);
  cards.push(html`<div class="kpi"><span class="k">${t('Olumlu yanıt oranı', 'Favourability')}</span><span class="v">${pct(g.fav)}</span><span class="s">${t('Olumsuz', 'Unfavourable')}: ${pct(g.unf)}</span></div>`);
  if (g.enps) {
    cards.push(html`<div class="kpi"><span class="k">eNPS</span><span class="v" style="color:${g.enps.score >= 10 ? 'var(--c-excellent)' : g.enps.score >= -10 ? 'var(--c-develop)' : 'var(--c-critical)'}">${g.enps.score > 0 ? '+' : ''}${g.enps.score}</span>
      ${raw(npsBar(g.enps, { labels: [t('Kötüleyen', 'Detractors'), t('Pasif', 'Passives'), t('Destekçi', 'Promoters')] }))}</div>`);
  } else if (a.module === 'stres') {
    const st = g.dims.find((d) => d.key === 'strain');
    const hi = g.scored.filter((s) => s.dims.strain != null && s.dims.strain < 40).length;
    cards.push(html`<div class="kpi"><span class="k">${t('Yüksek tükenmişlik riski', 'High burnout risk')}</span><span class="v" style="color:${hi / g.n >= 0.25 ? 'var(--c-critical)' : 'var(--c-develop)'}">${pct((100 * hi) / g.n)}</span><span class="s">${t('Belirti puanı 40 altında olanlar', 'Symptom score below 40')} · ${t('ortalama', 'mean')} ${f0(st?.mean)}</span></div>`);
  } else if (a.module === 'toplanti') {
    const w = g.scored.map((s) => s.r.answers?.worth).filter((x) => x != null);
    cards.push(html`<div class="kpi"><span class="k">${t('Zamana değdi mi?', 'Worth the time?')}</span><span class="v">${w.length ? num(mean(w), 1) : '—'}<small style="font-size:16px">/10</small></span><span class="s">${t('Katılımcıların ortalama değerlendirmesi', 'Average participant rating')}</span></div>`);
  } else if (a.module === 'senaryo') {
    const ex = scenarioExposure(mod, g);
    const worst = ex.sort((x, y) => y.exposure - x.exposure)[0];
    cards.push(html`<div class="kpi"><span class="k">${t('En yüksek risk maruziyeti', 'Highest risk exposure')}</span><span class="v" style="color:${bandColor(100 - worst.exposure)}">${f0(worst.exposure)}</span><span class="s">${L(worst.s.name)}</span></div>`);
  } else if (a.module === 'vizyon') {
    const al = alignment(a, g);
    cards.push(html`<div class="kpi"><span class="k">${t('Strateji uyum oranı', 'Strategy alignment')}</span><span class="v" style="color:${al ? bandColor(al.rate) : 'var(--ink-3)'}">${al ? pct(al.rate) : '—'}</span><span class="s">${t('Resmî önceliklerle örtüşme', 'Overlap with official priorities')}</span></div>`);
  } else {
    const o = mod.outcome ? g.items.find((x) => x.id === mod.outcome.id) : null;
    cards.push(html`<div class="kpi"><span class="k">${o ? L(mod.outcome.name) : t('Risk altındaki katılımcı', 'Respondents at risk')}</span><span class="v">${o ? f0(o.mean) : pct(g.riskShare)}</span><span class="s">${o ? `${t('olumlu', 'favourable')} ${pct(o.fav)}` : t('Endeks 55 altında', 'Index below 55')}</span></div>`);
  }
  cards.push(html`<div class="kpi"><span class="k">${t('Görüş birliği', 'Consensus')}</span><span class="v">${pct(g.consensus)}</span><span class="s">${g.consensus >= 70 ? t('Algı büyük ölçüde ortak', 'Largely shared perception') : g.consensus >= 55 ? t('Algılar kısmen ayrışıyor', 'Perceptions partly diverge') : t('Algılar belirgin biçimde bölünmüş', 'Perceptions clearly divided')}</span></div>`);
  return html`<div class="kpis">${cards}</div>`;
}

// ------------------------------------------------------------ OTOMATİK BULGULAR
function insights(base, mod, a, g, sorted, gap) {
  const out = [];
  const hi = sorted[0], lo = sorted[sorted.length - 1];
  const idx = g.index.mean;
  out.push(html`<div class="ins" style="--ic:${bandColor(idx)}"><div><h4>${t('Genel tablo', 'Overall picture')}: ${f0(idx)} — ${L(B(idx))}</h4>
    <p>${t(`${g.n} geçerli yanıta göre ${L(mod.indexName || base.name).toLocaleLowerCase('tr')} ${f0(idx)} puan. Gerçek değer %95 olasılıkla ${f0(g.index.ci?.[0])}–${f0(g.index.ci?.[1])} aralığındadır. Yanıtların ${pct(g.fav)}'i olumlu, ${pct(g.unf)}'i olumsuz.`,
      `Based on ${g.n} valid responses the ${L(mod.indexName || base.name).toLowerCase()} is ${f0(idx)}. The true value lies between ${f0(g.index.ci?.[0])} and ${f0(g.index.ci?.[1])} with 95% probability. ${pct(g.fav)} of answers are favourable, ${pct(g.unf)} unfavourable.`)}</p></div></div>`);
  if (hi && lo && hi !== lo)
    out.push(html`<div class="ins" style="--ic:var(--c-excellent)"><div><h4>${t('En güçlü ve en zayıf alan', 'Strongest and weakest area')}</h4>
      <p>${t(`En güçlü boyut ${dimName(hi)} (${f0(hi.mean)}), en zayıf boyut ${dimName(lo)} (${f0(lo.mean)}). Aradaki ${f0(hi.mean - lo.mean)} puanlık fark, iyileştirme kaynaklarının nereye yönlendirilmesi gerektiğini gösteriyor.`,
        `The strongest dimension is ${dimName(hi)} (${f0(hi.mean)}), the weakest is ${dimName(lo)} (${f0(lo.mean)}). The ${f0(hi.mean - lo.mean)}-point gap shows where improvement resources should go.`)}</p></div></div>`);
  const pri = g.drivers?.list.filter((x) => x.quad === 'priority').sort((x, y) => y.importance - x.importance)[0];
  if (pri)
    out.push(html`<div class="ins" style="--ic:var(--c-critical)"><div><h4>${t('Kaldıraç noktası', 'Leverage point')}: ${dimName(pri)}</h4>
      <p>${t(`${dimName(pri)}, "${L(base.outcome.name)}" ile en güçlü ilişkiye sahip zayıf boyut (r = ${num(pri.r, 2)}). Bu alandaki iyileşmenin genel sonuca en büyük katkıyı yapması beklenir.`,
        `${dimName(pri)} is the weak dimension most strongly linked to "${L(base.outcome.name)}" (r = ${num(pri.r, 2)}). Improvement here is expected to lift the overall outcome most.`)}</p></div></div>`);
  const bg = gap?.filter((x) => Math.abs(x.gap) >= 10).sort((x, y) => Math.abs(y.gap) - Math.abs(x.gap))[0];
  if (bg)
    out.push(html`<div class="ins" style="--ic:var(--gold)"><div><h4>${t('Kör nokta', 'Blind spot')}: ${dimName(bg)}</h4>
      <p>${t(`Yöneticiler bu alanı çalışanlardan ${f0(Math.abs(bg.gap))} puan ${bg.gap > 0 ? 'daha olumlu' : 'daha olumsuz'} değerlendiriyor. Sahadaki deneyimi yerinde gözlem ve odak gruplarla doğrulamak önerilir.`,
        `Managers rate this area ${f0(Math.abs(bg.gap))} points ${bg.gap > 0 ? 'higher' : 'lower'} than employees. Validate the frontline experience through site visits and focus groups.`)}</p></div></div>`);
  if (g.excluded)
    out.push(html`<div class="ins" style="--ic:var(--ink-3)"><div><h4>${t('Veri kalitesi', 'Data quality')}</h4>
      <p>${t(`${g.total} yanıttan ${g.excluded} tanesi düşük güvenilirlik (dikkat kontrolü, tekdüze yanıt, aşırı hız veya çelişkili yanıt) nedeniyle analiz dışı bırakıldı.`, `${g.excluded} of ${g.total} responses were excluded for low reliability (attention check, straight-lining, speeding or contradictory answers).`)}</p></div></div>`);
  return out;
}

// ------------------------------------------------------------ AKSİYON PLANI
function actionPlan(mod, g, sorted) {
  const pri = new Set((g.drivers?.list || []).filter((x) => x.quad === 'priority').map((x) => x.key));
  const pick = [...sorted].reverse().filter((d) => d.mean < 70 || pri.has(d.key));
  const strain = g.dims.find((d) => d.def.noIndex && d.mean != null && d.mean < 55);
  if (strain) pick.unshift(strain);
  const chosen = [...new Map(pick.map((d) => [d.key, d])).values()].slice(0, 4);
  if (!chosen.length)
    return html`<div class="ins" style="--ic:var(--c-excellent)"><div><h4>${t('Tüm boyutlar güçlü bantta', 'All dimensions in the strong band')}</h4><p>${t('Mevcut uygulamaları koruyun ve 6–12 ay sonra yeniden ölçün.', 'Maintain current practices and re-measure in 6–12 months.')}</p></div></div>`;
  return html`<div class="insight">${chosen.map((d, i) => html`<div class="ins" style="--ic:${bandColor(d.mean)}"><div>
    <h4>${i + 1}. ${dimName(d)} <small>· ${f0(d.mean)} ${pri.has(d.key) ? '· ' + L(QUAD.priority) : ''}</small></h4>
    <ul>${(d.def.actions?.[getLang()] || d.def.actions?.tr || []).map((x) => html`<li>${x}</li>`)}</ul>
    <p style="margin-top:8px;font-size:12.5px"><b>${t('Başarı göstergesi', 'Success measure')}:</b> ${t(`Yeniden ölçümde ${dimName(d)} puanının en az ${Math.min(100, Math.ceil(d.mean / 5) * 5 + 10)}'a çıkması.`, `${dimName(d)} reaching at least ${Math.min(100, Math.ceil(d.mean / 5) * 5 + 10)} at re-measurement.`)}</p>
  </div></div>`)}</div>`;
}

// ------------------------------------------------------------ KALİTE & METODOLOJİ
function qualityAndMethod(mod, g, ctx) {
  const q = g.quality;
  const flags = {};
  g.all.forEach((s) => s.q.flags.forEach((f) => (flags[f.k] = (flags[f.k] || 0) + 1)));
  const alphas = g.dims.filter((d) => d.alpha != null);
  return html`<div class="grid g2">
    <div class="card"><h3>${t('Yanıt güven endeksi', 'Response reliability')}</h3>
      <div class="row" style="gap:22px;margin-bottom:12px">
        <div class="stat"><b style="color:var(--c-excellent)">${q.reliable}</b><span>${L(QUALITY_LEVEL.reliable)}</span></div>
        <div class="stat"><b style="color:var(--c-develop)">${q.caution}</b><span>${L(QUALITY_LEVEL.caution)}</span></div>
        <div class="stat"><b style="color:var(--c-critical)">${q.suspect + q.invalid}</b><span>${L(QUALITY_LEVEL.suspect)}</span></div>
      </div>
      ${Object.entries(flags).map(([k, c]) => html`<div class="qi"><span>${flagShort(k).replace(/^./, (x) => x.toLocaleUpperCase(getLang() === 'en' ? 'en' : 'tr'))}</span><span class="v">${c}</span></div>`)}
      ${alphas.length ? html`<h3 style="margin-top:18px">${t('Ölçek güvenilirliği (Cronbach α)', 'Scale reliability (Cronbach α)')}</h3>
        ${alphas.map((d) => html`<div class="qi"><span>${dimName(d)}</span><span class="v" style="color:${d.alpha >= 0.7 ? 'var(--c-excellent)' : d.alpha >= 0.6 ? 'var(--c-develop)' : 'var(--c-critical)'}">${num(d.alpha, 2)}</span></div>`)}` : ''}
    </div>
    <div class="card method">
      <p><b>${t('Puanlama.', 'Scoring.')}</b> ${t('Her madde 1–5 arasında puanlanır; ters ifadeli maddeler 6 − x ile çevrilir ve (x − 1) / 4 × 100 formülüyle 0–100 ölçeğine taşınır. Boyut puanı, katılımcının o boyuttaki maddelerinin ortalamasıdır (en az yarısı yanıtlanmış olmalı). Endeks, boyutların ağırlıklı ortalamasıdır.', 'Each item is scored 1–5; reverse-worded items are recoded as 6 − x and mapped to 0–100 via (x − 1) / 4 × 100. A dimension score is the mean of the respondent\'s items in it (at least half answered). The index is the weighted mean of dimensions.')}</p>
      <p><b>${t('Bantlar.', 'Bands.')}</b> 85+ ${t('Mükemmel', 'Excellent')} · 70–84 ${t('Güçlü', 'Strong')} · 55–69 ${t('Gelişime açık', 'Developing')} · 40–54 ${t('Riskli', 'At risk')} · &lt;40 ${t('Kritik', 'Critical')}.</p>
      <p><b>${t('İstatistik.', 'Statistics.')}</b> ${t('Güven aralıkları t-dağılımıyla (%95) hesaplanır. Görüş birliği = 1 − s / 50. Etki analizi, boyut puanları ile sonuç değişkeni arasındaki Pearson korelasyonudur ve en az 8 yanıtla raporlanır; nedensellik değil ilişki gösterir. Cronbach α en az 20 tam yanıtla hesaplanır; 0,70 üzeri iyi kabul edilir.', 'Confidence intervals use the t-distribution (95%). Consensus = 1 − s / 50. Driver analysis is the Pearson correlation between dimension scores and the outcome, reported from 8 responses; it shows association, not causation. Cronbach α requires 20 complete responses; above 0.70 is considered good.')}</p>
      <p><b>${t('Yanıt güveni.', 'Response reliability.')}</b> ${t('Her yanıt dikkat kontrolü, tekdüze işaretleme, soru başına süre ve zıt ifadeler arası tutarlılık açısından 0–100 arasında puanlanır. 40 altındaki yanıtlar varsayılan olarak analiz dışıdır.', 'Each response is scored 0–100 on attention check, straight-lining, time per item and consistency across reversed items. Responses below 40 are excluded by default.')}</p>
      <p><b>${t('Anonimlik.', 'Anonymity.')}</b> ${t(`Katılımcılardan kimlik bilgisi alınmaz. ${mod.minGroupN ?? CONFIG.MIN_GROUP_N}'ten az yanıtlı alt gruplar raporda gösterilmez.`, `No identifying data is collected. Sub-groups with fewer than ${mod.minGroupN ?? CONFIG.MIN_GROUP_N} responses are not shown.`)}</p>
      ${mod.disclaimer ? html`<p><b>${t('Not.', 'Note.')}</b> ${L(mod.disclaimer)}</p>` : ''}
    </div></div>`;
}

// ------------------------------------------------------------ TOPLANTI
function meetingSections(n, base, a, g, ctx) {
  const mt = a.settings?.public?.meeting || {};
  const out = [];
  const lang = getLang();
  const cost = mt.minutes && mt.attendees && mt.hourly ? (mt.minutes / 60) * mt.attendees * mt.hourly : null;
  const waste = cost != null ? cost * (1 - g.index.mean / 100) : null;
  const personHours = mt.minutes && mt.attendees ? (mt.minutes / 60) * mt.attendees : null;
  const need = {};
  g.scored.forEach((s) => s.r.answers?.need && (need[s.r.answers.need] = (need[s.r.answers.need] || 0) + 1));
  const needOpts = base.extras.find((e) => e.id === 'need').options;
  const totalNeed = Object.values(need).reduce((x, y) => x + y, 0) || 1;
  const money = (v) => (v == null ? '—' : '₺' + fmtNum(v, lang));
  out.push(sec(n, t('Toplantının maliyeti ve gerekliliği', 'Meeting cost and necessity'), t('Maliyet = süre × katılımcı sayısı × saatlik maliyet. Verimsizlik kaybı, maliyetin verimlilik skorunda karşılığı olmayan kısmıdır.', 'Cost = duration × attendees × hourly cost. Inefficiency loss is the share of cost not matched by the effectiveness score.')));
  out.push(html`<div class="grid g2"><div class="card"><div class="grid g3">
      <div class="stat"><b>${personHours != null ? fmtNum(personHours, lang, 1) : '—'}</b><span>${t('kişi-saat', 'person-hours')}</span></div>
      <div class="stat"><b>${money(cost)}</b><span>${t('toplam maliyet', 'total cost')}</span></div>
      <div class="stat"><b style="color:var(--c-critical)">${money(waste)}</b><span>${t('verimsizlik kaybı', 'inefficiency loss')}</span></div></div>
      ${cost != null ? html`<p class="dim" style="font-size:13px;margin-top:14px">${t(`Bu toplantı haftalık tekrarlanıyorsa yıllık verimsizlik kaybı yaklaşık ${money(waste * 48)} olur.`, `If held weekly, the annual inefficiency loss is about ${money(waste * 48)}.`)}</p>` : html`<p class="dim" style="font-size:13px;margin-top:14px">${t('Maliyet hesabı için toplantı oluştururken saatlik maliyet girin.', 'Enter an hourly cost when creating the meeting to see cost figures.')}</p>`}</div>
    <div class="card"><h3>${t('Bu toplantı gerekli miydi?', 'Was this meeting necessary?')}</h3>
      ${raw(barList(needOpts.map((o) => ({ label: L(o), value: (100 * (need[o.v] || 0)) / totalNeed, color: o.v === 'needed' ? 'var(--c-excellent)' : o.v === 'email' ? 'var(--c-critical)' : 'var(--c-develop)' })), { showCi: false, unit: '%' }))}</div></div>`);
  if (ctx.siblings) {
    const pts = ctx.siblings.list.map((x) => {
      const rs = ctx.siblings.resps.filter((r) => r.assessment_id === x.id);
      if (rs.length < 2) return null;
      const gg = aggregate(effective(base, x.settings), rs);
      return gg.index ? { label: x.settings?.public?.meeting?.date ? fmtDate(x.settings.public.meeting.date, lang) : x.title, value: gg.index.mean, at: x.settings?.public?.meeting?.date || x.created_at, me: x.id === a.id } : null;
    }).filter(Boolean).sort((p, q) => String(p.at).localeCompare(String(q.at)));
    if (pts.length >= 2) out.push(html`<div class="card" style="margin-top:14px"><h3>${t('Toplantı serisinde gelişim', 'Trend across meetings')}</h3>${raw(trendChart(pts))}</div>`);
  }
  return out;
}

// ------------------------------------------------------------ SENARYO
function scenarioExposure(mod, g) {
  return (mod.scenarios || []).map((s) => {
    const lik = mean(g.scored.map((x) => x.r.answers?.['lik_' + s.key]).filter((v) => v != null).map(Number));
    const imp = mean(g.scored.map((x) => x.r.answers?.['imp_' + s.key]).filter((v) => v != null).map(Number));
    const ids = mod.items.filter((it) => it.scen === s.key).map((it) => it.id);
    const ready = mean(g.scored.map((x) => mean(ids.map((id) => x.rec[id]).filter((v) => v != null))).filter((v) => v != null).map(to100));
    const risk = lik && imp ? lik * imp : null; // 1–25
    const exposure = risk != null && ready != null ? ((risk / 25) * 100 * (100 - ready)) / 100 : null;
    return { s, lik, imp, ready, risk, exposure };
  });
}
function scenarioSections(n, mod, a, g) {
  const out = [];
  const ex = scenarioExposure(mod, g);
  out.push(sec(n, t('Senaryo × alan hazırlık matrisi', 'Scenario × area readiness matrix'), t('Her hücre, ilgili senaryoda ilgili alanın olgunluk puanıdır (0–100). Kırmızı hücreler kriz anında ilk kırılacak noktalardır.', 'Each cell is the maturity score of an area under a scenario (0–100). Red cells are where the organization would break first in a crisis.')));
  const matrix = mod.scenarios.map((s) => mod.areas.map((ar) => {
    const ids = mod.items.filter((it) => it.scen === s.key && it.dim === ar).map((it) => it.id);
    const v = g.scored.map((x) => mean(ids.map((id) => x.rec[id]).filter((v) => v != null))).filter((v) => v != null);
    return v.length ? to100(mean(v)) : null;
  }));
  out.push(html`<div class="card">${raw(heatmap(mod.scenarios.map((s) => L(s.name)), mod.areas.map((ar) => L(mod.dims.find((d) => d.key === ar).short)), matrix))}</div>`);
  out.push(sec(n + 1, t('Risk maruziyeti', 'Risk exposure'), t('Olasılık ve etki, yöneticilerin ortalama tahminidir (1–5). Maruziyet = (olasılık × etki / 25) × (100 − hazırlık). Yüksek olasılık ve etkiye karşı düşük hazırlık, en yüksek maruziyeti üretir.', 'Likelihood and impact are leaders\' average estimates (1–5). Exposure = (likelihood × impact / 25) × (100 − readiness). Low readiness against high likelihood and impact yields the highest exposure.')));
  const colors = ['var(--c-critical)', 'var(--violet)', 'var(--gold)'];
  out.push(html`<div class="grid g2">
    <div class="card">${raw(riskMatrix(ex.filter((x) => x.lik && x.imp).map((x, i) => ({ x: x.lik, y: x.imp, size: (100 - (x.ready ?? 50)) / 100, color: colors[i % 3], label: L(x.s.name), short: L(x.s.short) })), { xLabel: t('Olasılık', 'Likelihood'), yLabel: t('Etki', 'Impact') }))}</div>
    <div class="card"><div class="tbl-wrap"><table class="tbl"><thead><tr><th>${t('Senaryo', 'Scenario')}</th><th class="num">${t('Olasılık', 'Lik.')}</th><th class="num">${t('Etki', 'Impact')}</th><th class="num">${t('Hazırlık', 'Ready')}</th><th class="num">${t('Maruziyet', 'Exposure')}</th></tr></thead>
      <tbody>${[...ex].sort((x, y) => (y.exposure ?? 0) - (x.exposure ?? 0)).map((x) => html`<tr><td>${L(x.s.name)}</td><td class="num">${num(x.lik, 1)}</td><td class="num">${num(x.imp, 1)}</td><td class="num" style="color:${bandColor(x.ready)}">${f0(x.ready)}</td><td class="num"><b style="color:${x.exposure >= 40 ? 'var(--c-critical)' : x.exposure >= 25 ? 'var(--c-develop)' : 'var(--c-excellent)'}">${f0(x.exposure)}</b></td></tr>`)}</tbody></table></div>
      <p class="dim" style="font-size:12.5px;margin-top:12px">${t('Maruziyet 40 ve üzeri: acil eylem planı · 25–39: 6 ay içinde planlama · 25 altı: izleme.', 'Exposure 40+: urgent action plan · 25–39: plan within 6 months · below 25: monitor.')}</p></div></div>`);
  return out;
}

// ------------------------------------------------------------ VİZYON — STRATEJİ UYUMU
function alignment(a, g) {
  const pr = a.settings?.public?.priorities || [];
  const off = a.settings?.private?.official || [];
  if (!pr.length || off.length !== 3) return null;
  const picks = g.scored.map((s) => s.r.answers?.prio).filter(Array.isArray);
  if (!picks.length) return null;
  const rate = mean(picks.map((p) => (100 * p.filter((x) => off.includes(x)).length) / 3));
  const counts = pr.map((_, i) => (100 * picks.filter((p) => p.includes(i)).length) / picks.length);
  const full = (100 * picks.filter((p) => p.filter((x) => off.includes(x)).length === 3).length) / picks.length;
  return { rate, counts, full, pr, off, n: picks.length };
}
function visionAlignment(n, a, g) {
  const al = alignment(a, g);
  if (!al) return null;
  return html`${sec(n, t('Strateji uyum oranı', 'Strategy alignment rate'), t('Katılımcıların "en önemli üç öncelik" seçimlerinin, yönetimin belirlediği resmî öncelikleriyle örtüşme oranı. Resmî öncelikler katılımcılara gösterilmemiştir.', "How far respondents' top-three priority picks overlap with management's official priorities, which were not shown to respondents."))}
    <div class="grid split" style="--a:1fr;--b:1.6fr">
      <div class="card"><div class="stat"><b style="color:${bandColor(al.rate)};font-size:40px">${pct(al.rate)}</b><span>${t('ortalama örtüşme', 'average overlap')}</span></div>
        <div class="stat" style="margin-top:16px"><b>${pct(al.full)}</b><span>${t('üç önceliği de doğru bilen', 'named all three correctly')}</span></div>
        <p class="dim" style="font-size:12.5px;margin-top:14px">${t('Rastgele seçimde beklenen örtüşme', 'Expected overlap by chance')}: ${pct((100 * 3) / al.pr.length)}</p></div>
      <div class="card"><h3>${t('Önceliklerin seçilme oranı', 'How often each priority was picked')}</h3>
        ${raw(barList(al.pr.map((p, i) => ({ label: p, sub: al.off.includes(i) ? t('★ Resmî öncelik', '★ Official priority') : '', value: al.counts[i], color: al.off.includes(i) ? 'var(--gold)' : 'var(--ink-3)' })), { showCi: false, unit: '%' }))}</div></div>`;
}

// ------------------------------------------------------------ STRES
function stressSections(n, mod, g) {
  const st = g.dims.find((d) => d.key === 'strain');
  if (!st) return [];
  const levels = [
    { k: 'low', tr: 'Düşük risk (70+)', en: 'Low risk (70+)', f: (v) => v >= 70, c: 'var(--c-excellent)' },
    { k: 'mid', tr: 'Orta risk (40–69)', en: 'Moderate risk (40–69)', f: (v) => v >= 40 && v < 70, c: 'var(--c-develop)' },
    { k: 'high', tr: 'Yüksek risk (<40)', en: 'High risk (<40)', f: (v) => v < 40, c: 'var(--c-critical)' },
  ];
  const vals = g.scored.map((s) => s.dims.strain).filter((v) => v != null);
  return [html`${sec(n, t('Tükenmişlik belirtileri', 'Burnout symptoms'), t('Son bir aydaki yorgunluk, uyku, isteksizlik ve bedensel belirtilerin sıklığı. Puan yükseldikçe belirtiler azalır. Bu bölüm endekse dahil edilmez; stres etkenlerinin sonucunu gösteren ayrı bir göstergedir.', 'Frequency of exhaustion, sleep problems, disengagement and physical symptoms over the past month. Higher scores mean fewer symptoms. This section is not part of the index; it is the outcome that stressors drive.'))}
    <div class="grid g2"><div class="card">${raw(barList(levels.map((l) => ({ label: L(l), value: (100 * vals.filter(l.f).length) / vals.length, color: l.c })), { showCi: false, unit: '%' }))}</div>
      <div class="card"><div class="stat"><b style="color:${bandColor(st.mean)}">${f0(st.mean)}</b><span>${t('belirti puanı (yüksek = iyi)', 'symptom score (higher = better)')}</span></div>
        <p class="dim" style="font-size:13px;margin-top:12px">${L(mod.disclaimer)}</p></div></div>`];
}

// Aynı/benzer yorumları birleştir (büyük-küçük harf ve noktalama farkını yok say), en sık olan önce
// Türkçe/İngilizce dolgu kelimeleri — "en sık geçen kelimeler"de sayılmaz
const STOP = new Set(('ve veya ile ama fakat ancak çünkü için gibi kadar daha çok az en bir bu şu o da de ki mi mı mu mü ne neden nasıl her hiç olan olarak olması olsun oldu olur var yok değil ise ya yani hem de biz siz onlar ben sen bizim sizin onların benim kendi tüm bütün bazı şey şeyler zaman sonra önce artık hep sadece bile hala hâlâ gerek lazım daha the and or but for to of in on at is are was be it this that with as by from an a we you they our your not no yes very more most can should would will have has').split(' '));
function topWords(list) {
  const m = new Map();
  list.forEach((q) => {
    const seen = new Set();
    q.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N} ]/gu, ' ').split(/\s+/).forEach((w) => {
      if (w.length < 3 || STOP.has(w) || /^\d+$/.test(w)) return;
      const st = stem(w);
      if (seen.has(st)) return;
      seen.add(st);
      const e = m.get(st) || { n: 0, forms: {} };
      e.n++;
      e.forms[w] = (e.forms[w] || 0) + 1;
      m.set(st, e);
    });
  });
  // en sık yazılan biçimi göster ("maaş", "maaşlar" → "maaş")
  return [...m.entries()].filter(([, e]) => e.n > 1).sort((a, b) => b[1].n - a[1].n).slice(0, 10)
    .map(([st, e]) => [Object.entries(e.forms).sort((a, b) => b[1] - a[1] || a[0].length - b[0].length)[0][0], e.n]);
}
// Hafif Türkçe ek ayıklama (çoğul, iyelik, hâl ekleri) — yalnızca kelime sayımı için
const SUFFIX = ['larının', 'lerinin', 'ların', 'lerin', 'ları', 'leri', 'lara', 'lere', 'larda', 'lerde', 'lardan', 'lerden', 'lar', 'ler', 'nın', 'nin', 'nun', 'nün', 'dan', 'den', 'tan', 'ten', 'da', 'de', 'ta', 'te', 'ın', 'in', 'un', 'ün', 'ya', 'ye', 'yı', 'yi', 'yu', 'yü', 'sı', 'si', 'su', 'sü', 'ı', 'i', 'u', 'ü', 'a', 'e'];
function stem(w) {
  if (!/[çğıöşü]|lar|ler/.test(w) && /^[a-z]+$/.test(w)) return w.replace(/(ies|es|s)$/, '') || w;   // İngilizce: çoğul eki
  for (const sfx of SUFFIX) if (w.endsWith(sfx) && w.length - sfx.length >= 3) return w.slice(0, -sfx.length);
  return w;
}
function commentBlock(c, nResp) {
  const groups = groupQuotes(c.list);
  const total = c.list.length;
  const share = (k) => pct((100 * k) / total);
  const top = groups.slice(0, 3);
  const words = topWords(c.list);
  const maxW = words[0]?.[1] || 1;
  return html`<div class="card cm-card" style="margin-bottom:16px">
    <div class="card-head"><h3>${L(c.e)}</h3><small>${total} ${t('yorum', 'comments')} · ${t('yorum yazan', 'commented')} ${pct((100 * total) / Math.max(1, nResp))}</small></div>
    <div class="cm-top">${top.map(([q, k], i) => html`<div class="cm-rank ${i === 0 ? 'first' : ''}"><span class="rk">${i + 1}</span>
      <div><p>${q}</p><div class="cm-bar"><i style="width:${(100 * k) / total}%"></i></div><small>${k} ${t('kişi', 'people')} · ${share(k)}</small></div></div>`)}</div>
    ${words.length ? html`<h4 style="margin:18px 0 8px">${t('En sık geçen kelimeler', 'Most frequent words')}</h4>
      <div class="cm-words">${words.map(([w, k]) => html`<span style="--w:${0.75 + (0.5 * k) / maxW}">${w} <b>${k}</b></span>`)}</div>
      <p class="dim" style="font-size:12px;margin-top:6px">${t('Farklı cümlelerle aynı konuya değinen yorumları yakalamak için kelimelerin kaç yorumda geçtiği sayılır.', 'Counts how many comments mention each word, to catch the same topic written differently.')}</p>` : ''}
    ${groups.length > 3 ? html`<details style="margin-top:14px"><summary>${t('Tüm yorumlar', 'All comments')} (${groups.length})</summary>
      <div class="quotes" style="margin-top:10px">${groups.map(([q, k], i) => html`<div class="quote"><span class="mono dim">${i + 1}.</span> ${q}${k > 1 ? html` <b class="mono" style="color:var(--gold)">×${k}</b>` : ''}</div>`)}</div></details>` : ''}
  </div>`;
}

function groupQuotes(list) {
  const m = new Map();
  for (const q of list) {
    const k = q.toLocaleLowerCase('tr').replace(/[^\p{L}\p{N} ]/gu, '').replace(/\s+/g, ' ').trim();
    const e = m.get(k);
    if (e) e[1]++;
    else m.set(k, [q.trim(), 1]);
  }
  return [...m.values()].sort((a, b) => b[1] - a[1]);
}
