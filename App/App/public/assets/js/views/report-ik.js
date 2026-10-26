// İK ADAY RAPORU
import { html, raw, toStr, $, fmtDate, fmtDuration } from '../core/util.js';
import { t, T, L, getLang } from '../core/i18n.js';
import { state } from '../core/state.js';
import { icon } from '../core/ui.js';
import { band } from '../core/engine.js';
import { gauge, barList, profileRanges, f0, bandColor } from '../core/charts.js';
import { crumbs } from './layout.js';
import { reportNotice } from './report-notice.js';
import { printPage } from '../core/native.js';
import ik, { DOMAINS, TRAITS, PROBES, FLAG_TEXT, scoreCandidate, COG_MINUTES } from '../modules/ik.js';
import { deepCard } from './deep.js';

// Claude'a gidecek aday verisi: ad, e-posta, not GÖNDERİLMEZ — yalnızca pozisyon ve puanlar
function candidatePayload(a, r, s) {
  const pv = a.settings?.private || {};
  const R = (v) => (v == null ? null : Math.round(v));
  return {
    data: {
      aday: 'Aday (kimlik bilgisi paylaşılmaz)',
      pozisyon: pv.position || '',
      pozisyon_ailesi: L(s.fam.name),
      uyum_agirliklari: s.fam.w,
      is_uyum_skoru: R(s.fit),
      bilissel: { genel: R(s.cog), alanlar: Object.fromEntries(DOMAINS.map((d) => [L(d.name), R(s.cogDomains?.[d.key])])), sure_sn: r.meta?.cog_seconds ?? null, sure_doldu: !!r.meta?.timeout, yanitlanan: s.cogAnswered + '/' + DOMAINS.length * 6 },
      durumsal_yargi: R(s.sjt),
      kisilik: Object.fromEntries(TRAITS.map((tr) => [L(tr.name), { puan: R(s.traits[tr.key]), hedef_aralik: s.fam.range[tr.key] }])),
      kisilik_uyumu: R(s.persFit),
      guvenilirlik: { puan: s.rel, bayraklar: s.flags.map((f) => L(FLAG_TEXT[f])) },
      toplam_sure_dk: r.duration_sec ? Math.round(r.duration_sec / 60) : null,
      olcek_notu: 'Puanlar 0–100. Bilişsel = doğru yüzdesi (norm yok). Kişilik 0–100 (yüksek = özelliğin yüksek olması; iyi/kötü değil, hedef aralıkla kıyaslanır).',
    },
    sources: [{ module: 'ik', id: a.id, title: pv.position || '', n: 1 }],
  };
}

const sec = (n, title, lead = '') => html`<div class="rp-sec"><span class="n">${String(n).padStart(2, '0')}</span><h2>${title}</h2></div>${lead ? html`<p class="lead">${lead}</p>` : ''}`;
const lvl = (v) => (v == null ? '' : v >= 70 ? t('yüksek', 'high') : v >= 40 ? t('orta', 'moderate') : t('düşük', 'low'));

const TRAIT_TEXT = {
  O: { hi: { tr: 'Yeni fikirlere ve yöntemlere açık, merakı yüksek; değişen ve belirsiz işlerde rahat.', en: 'Open to new ideas and methods, highly curious; comfortable with change and ambiguity.' },
       lo: { tr: 'Kanıtlanmış yöntemleri tercih eder, pratik ve somut düşünür; rutin ve standart işlerde istikrarlı.', en: 'Prefers proven methods, practical and concrete; steady in routine, standardised work.' } },
  C: { hi: { tr: 'Planlı, disiplinli ve ayrıntıya dikkatli; teslim tarihlerine ve sözlerine sadık.', en: 'Organised, disciplined and detail-oriented; keeps deadlines and promises.' },
       lo: { tr: 'Esnek ve kendiliğinden çalışır; yapılandırılmış takip ve net teslim tarihleriyle daha verimli olur.', en: 'Works flexibly and spontaneously; more effective with structured follow-up and clear deadlines.' } },
  E: { hi: { tr: 'Sosyal, enerjik ve girişken; insanlarla yoğun etkileşim gerektiren rollerde güçlü.', en: 'Sociable, energetic and assertive; strong in roles with intense people contact.' },
       lo: { tr: 'Sakin ve odaklı; bağımsız, derinlemesine çalışma gerektiren işlerde güçlü.', en: 'Calm and focused; strong in independent, deep-work roles.' } },
  A: { hi: { tr: 'İş birlikçi, empatik ve güvene dayalı ilişkiler kurar; ekip uyumuna katkı sağlar.', en: 'Cooperative, empathetic, builds trust-based relationships; adds to team cohesion.' },
       lo: { tr: 'Doğrudan ve rekabetçi; zor müzakerelerde etkili olabilir, ekip içinde üslubu gözlenmeli.', en: 'Direct and competitive; can be effective in tough negotiations, tone within teams should be observed.' } },
  H: { hi: { tr: 'Dürüst, kurallara ve adalete önem veren, statü ve gösteriş peşinde olmayan bir profil; güven gerektiren rollerde (finans, satın alma, kalite) olumlu.', en: 'Sincere, fair-minded and modest, not driven by status; a positive sign for trust-sensitive roles (finance, purchasing, quality).' },
       lo: { tr: 'Kişisel kazanç ve statüye daha çok önem verebilir; güven gerektiren rollerde mülakatta etik ikilem soruları ve referanslarla doğrulanmalıdır.', en: 'May place more weight on personal gain and status; for trust-sensitive roles, verify with ethical-dilemma questions and references.' } },
  S: { hi: { tr: 'Baskı altında sakin, aksiliklerden çabuk toparlanır; stresli rollerde dayanıklı.', en: 'Calm under pressure, recovers quickly from setbacks; resilient in stressful roles.' },
       lo: { tr: 'Duygusal olarak daha hassas; yoğun baskı dönemlerinde destek ve net önceliklendirmeden yararlanır.', en: 'More emotionally sensitive; benefits from support and clear priorities under heavy pressure.' } },
};

export function renderIkReport(root, a, resps, ctx) {
  const r = resps[0];
  const lang = getLang();
  const pv = a.settings?.private || {};
  const head = html`
    ${ctx.demo ? html`<div class="alert info no-print">${t('Bu bir örnek aday raporudur; sentetik verilerle üretilmiştir.', 'This is a sample candidate report generated from synthetic data.')}</div>` : crumbs([{ label: T('panels'), href: '#/app' }, { label: L(ik.short), href: '#/m/ik' }, { label: a.title, href: '#/a/' + a.id }, { label: T('report') }])}
    <div class="rp-head"><div><div class="eyebrow">Analiz Pro<span class="gold">X</span> · ${L(ik.name)}</div>
      <h1>${pv.candidate || a.title}</h1>
      <div class="facts"><span><b>${pv.position || ''}</b></span><span>${ctx.org || ''}</span>${r ? html`<span>${t('Tamamlanma', 'Completed')}: <b>${fmtDate(r.created_at, lang)}</b></span><span>${t('Toplam süre', 'Total time')}: <b>${fmtDuration(r.duration_sec, lang)}</b></span>` : ''}</div></div>
      <div class="toolbar"><a class="btn sm no-print" href="#/guide/ik">${raw(icon('info'))} ${t('Bu rapor nasıl okunur?', 'How to read this report')}</a><button class="btn sm" id="print">${raw(icon('print'))} ${T('print')}</button></div></div>`;
  if (!r) {
    root.innerHTML = toStr(html`${head}<div class="empty">${t('Aday henüz değerlendirmeyi tamamlamadı.', 'The candidate has not completed the assessment yet.')}</div>`);
    return;
  }
  const s = scoreCandidate(r, a.settings);
  const out = [];
  let n = 0;

  // 01 ÖZET
  out.push(sec(++n, t('Özet', 'Summary')));
  const pending = s.cog == null;
  out.push(html`<div class="kpis">
    <div class="kpi main">${raw(gauge(s.fit, { label: t('İş uyum skoru', 'Role fit score'), sub: s.fit != null ? L(band(s.fit)) : t('Puanlama bekleniyor', 'Scoring pending') }))}</div>
    <div class="kpi"><span class="k">${t('Bilişsel yetenek', 'Cognitive ability')}</span><span class="v" style="color:${bandColor(s.cog)}">${f0(s.cog)}</span><span class="s">${s.cogAnswered}/${DOMAINS.length * 6} ${t('soru yanıtlandı', 'answered')} · ${t('süre', 'time')} ${fmtDuration(r.meta?.cog_seconds, lang)}</span></div>
    <div class="kpi"><span class="k">${t('Durumsal yargı', 'Situational judgement')}</span><span class="v" style="color:${bandColor(s.sjt)}">${f0(s.sjt)}</span><span class="s">${t('İş hayatı senaryolarında etkili davranış', 'Effective behaviour in work scenarios')}</span></div>
    <div class="kpi"><span class="k">${t('Kişilik uyumu', 'Personality fit')}</span><span class="v" style="color:${bandColor(s.persFit)}">${f0(s.persFit)}</span><span class="s">${L(s.fam.name)}</span></div>
  </div>`);
  if (pending) out.push(html`<div class="alert info" style="margin-top:14px">${t('Bilişsel ve durumsal yargı puanları sunucuda hesaplanır. Bu yanıt için puan bulunamadı (yerel demo modunda cevap anahtarı yüklenmez).', 'Cognitive and situational scores are computed on the server. No scores were found for this response (answer keys are not loaded in local demo mode).')}</div>`);
  const w = s.fam.w;
  out.push(html`<p class="dim" style="font-size:12.5px;margin-top:10px">${t('İş uyum skoru', 'Role fit')} = ${Math.round(w.cog * 100)}% ${t('bilişsel', 'cognitive')} + ${Math.round(w.sjt * 100)}% ${t('durumsal yargı', 'situational')} + ${Math.round(w.pers * 100)}% ${t('kişilik uyumu', 'personality fit')} · ${t('Ağırlıklar pozisyon ailesine göredir', 'Weights depend on job family')}: ${L(s.fam.name)}</p>`);

  // CLAUDE İLE DERİN ANALİZ VE MÜLAKAT REHBERİ (yalnızca ücretli abonelik) — özetin hemen altında, göze çarpan
  const deep = !ctx.demo && state.org ? deepCard({ kind: 'ik', assessmentId: a.id, buildData: async () => candidatePayload(a, r, s) }) : null;
  if (deep) out.push(deep.html);

  // 02 BİLİŞSEL
  if (s.cogDomains) {
    out.push(sec(++n, t('Bilişsel yetenek alanları', 'Cognitive domains'), t(`Her alanda doğru yanıt yüzdesi. Bilişsel bölüm ${COG_MINUTES} dakikalık süreyle uygulanmıştır.`, `Percentage correct in each domain. The cognitive section was timed at ${COG_MINUTES} minutes.`)));
    out.push(html`<div class="card">${raw(barList(DOMAINS.map((d) => ({ label: L(d.name), value: s.cogDomains[d.key] })), { showCi: false }))}</div>`);
  }

  // 03 KİŞİLİK
  out.push(sec(++n, t('Kişilik profili', 'Personality profile'), t(`Noktalar adayın puanını, kesikli alanlar "${L(s.fam.name)}" için hedef aralığı gösterir. Kişilik özellikleri iyi/kötü değil; role uygunluk açısından yorumlanır.`, `Dots show the candidate's score; dashed areas show the target range for "${L(s.fam.name)}". Traits are not good or bad; they are read in terms of fit to the role.`)));
  out.push(html`<div class="grid split" style="--a:1.3fr;--b:1fr">
    <div class="card">${raw(profileRanges(TRAITS.map((tr) => ({ label: L(tr.name), low: L(tr.low), high: L(tr.high), value: s.traits[tr.key] ?? 0, range: s.fam.range[tr.key] }))))}</div>
    <div class="card"><div class="insight">${TRAITS.map((tr) => {
      const v = s.traits[tr.key];
      if (v == null) return '';
      const [lo, hi] = s.fam.range[tr.key];
      const inR = v >= lo && v <= hi;
      return html`<div class="ins" style="--ic:${inR ? 'var(--c-excellent)' : 'var(--c-develop)'}"><div><h4>${L(tr.name)} · ${lvl(v)} (${f0(v)})</h4><p>${L(v >= 55 ? TRAIT_TEXT[tr.key].hi : TRAIT_TEXT[tr.key].lo)}</p></div></div>`;
    })}</div></div></div>`);

  // 04 GÜÇLÜ YANLAR / GELİŞİM
  const areas = [
    ...DOMAINS.map((d) => ({ k: d.key, label: L(d.name), v: s.cogDomains?.[d.key] })),
    { k: 'sjt', label: t('Durumsal yargı', 'Situational judgement'), v: s.sjt },
    ...TRAITS.map((tr) => {
      const v = s.traits[tr.key];
      const [lo, hi] = s.fam.range[tr.key];
      return { k: tr.key, label: L(tr.name), v: v == null ? null : v < lo ? 100 - (lo - v) * 2 : v > hi ? 100 - (v - hi) * 2 : 72, trait: true };
    }),
  ].filter((x) => x.v != null);
  const strong = [...areas].sort((x, y) => y.v - x.v).slice(0, 3);
  const weak = [...areas].sort((x, y) => x.v - y.v).slice(0, 3);
  out.push(sec(++n, t('Güçlü yanlar ve mülakatta derinleştirilecek alanlar', 'Strengths and areas to probe in interview')));
  out.push(html`<div class="grid g2">
    <div class="card"><h3 style="color:var(--c-excellent)">${t('Güçlü yanlar', 'Strengths')}</h3>${strong.map((x) => html`<div class="qi"><span>${x.label}</span><span class="v">${x.trait ? t('hedefte', 'on target') : f0(x.v)}</span></div>`)}</div>
    <div class="card"><h3 style="color:var(--c-develop)">${t('Önerilen mülakat soruları', 'Suggested interview questions')}</h3>
      ${weak.map((x) => html`<div class="qi" style="grid-template-columns:1fr"><span><b>${x.label}</b><br><span class="muted">${L(PROBES[x.k])}</span></span></div>`)}</div></div>`);


  // 05 GÜVENİLİRLİK
  out.push(sec(++n, t('Yanıt güvenilirliği', 'Response reliability')));
  out.push(html`<div class="grid g2"><div class="card"><div class="stat"><b style="color:${bandColor(s.rel)}">${s.rel}</b><span>${t('güvenilirlik puanı (0–100)', 'reliability score (0–100)')}</span></div>
      ${s.flags.length ? html`<div class="insight" style="margin-top:14px">${s.flags.map((f) => html`<div class="ins" style="--ic:var(--c-develop)"><div><p>${L(FLAG_TEXT[f])}</p></div></div>`)}</div>` : html`<p class="muted" style="margin-top:12px">${t('Tutarsızlık, aşırı hız veya kendini olduğundan iyi gösterme belirtisi saptanmadı.', 'No signs of inconsistency, speeding or overly favourable self-presentation were detected.')}</p>`}</div>
    <div class="card method"><p><b>${t('Yöntem.', 'Method.')}</b> ${t('Bilişsel ve durumsal yargı bölümleri sunucuda, aday tarafından görülemeyen cevap anahtarıyla puanlanır. Kişilik, 30 maddelik Beş Faktör envanteri (her özellik için 6 madde, yarısı ters ifadeli) ve 6 maddelik HEXACO Dürüstlük–Alçakgönüllülük ölçeğiyle (IPIP kamu malı madde havuzundan uyarlanmıştır) ölçülür. Kişilik uyumu, her özelliğin pozisyon hedef aralığına uzaklığı (aralık dışındaki her puan için −2) üzerinden hesaplanır.', 'Cognitive and situational sections are scored on the server with an answer key the candidate cannot see. Personality is measured with a 30-item Big Five inventory (6 items per trait, half reversed) and a 6-item HEXACO Honesty–Humility scale (adapted from the public-domain IPIP item pool). Personality fit is based on each trait\'s distance from the role\'s target range (−2 per point outside the range).')}</p>
      <p><b>${t('Kullanım uyarısı.', 'Use notice.')}</b> ${t('Bu rapor bir karar destek aracıdır. İşe alım kararı yalnızca bu rapora dayandırılmamalı; yapılandırılmış mülakat, referans ve iş örneği gibi kaynaklarla birlikte değerlendirilmelidir.', 'This report is a decision-support tool. Hiring decisions should not rest on it alone; combine it with structured interviews, references and work samples.')}</p></div></div>`);

  root.innerHTML = toStr(html`${head}${out}`) + toStr(reportNotice('ik'));
  $('#print', root).onclick = () => printPage(pv.candidate || a.title);
  if (deep) deep.mount(root);
}
