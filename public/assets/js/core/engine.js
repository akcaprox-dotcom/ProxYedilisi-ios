// =====================================================================
//  ANALİZ PROX SKOR MOTORU
//  Tüm Likert tabanlı modüller aynı matematikle hesaplanır.
//
//  Madde puanı      : 1–5 (ters maddeler 6 − x ile çevrilir)
//  0–100 dönüşümü   : (x − 1) / 4 × 100
//  Boyut puanı      : katılımcının o boyuttaki maddelerinin ortalaması (en az %50 yanıt)
//  Endeks           : boyut puanlarının ağırlıklı ortalaması
//  Olumlu / Olumsuz : 4–5 / 1–2 yanıtların payı (çevrilmiş puana göre)
//  Güven aralığı    : ortalama ± t(n−1) × s / √n  (%95)
//  Görüş birliği    : 1 − s / 50  (endeks dağılımının ne kadar dar olduğu)
//  Cronbach α       : k/(k−1) × (1 − Σ s²ᵢ / s²ₜ)  (n ≥ 20)
//  Etki (driver)    : boyut puanı ile sonuç değişkeni arasındaki Pearson r (n ≥ 8)
//  eNPS             : %9–10 verenler − %0–6 verenler
// =====================================================================
import { mean, sd, sum, median, pearson, round, clamp } from './util.js';
import { CONFIG } from '../config.js';

export const BANDS = [
  { min: 85, key: 'excellent', tr: 'Mükemmel', en: 'Excellent', color: 'var(--c-excellent)' },
  { min: 70, key: 'strong', tr: 'Güçlü', en: 'Strong', color: 'var(--c-strong)' },
  { min: 55, key: 'develop', tr: 'Gelişime açık', en: 'Developing', color: 'var(--c-develop)' },
  { min: 40, key: 'risk', tr: 'Riskli', en: 'At risk', color: 'var(--c-risk)' },
  { min: -1, key: 'critical', tr: 'Kritik', en: 'Critical', color: 'var(--c-critical)' },
];
export const band = (v) => (v == null ? null : BANDS.find((b) => v >= b.min));

const T_CRIT = [0, 12.71, 4.30, 3.18, 2.78, 2.57, 2.45, 2.36, 2.31, 2.26, 2.23, 2.20, 2.18, 2.16, 2.14, 2.13,
  2.12, 2.11, 2.10, 2.09, 2.09, 2.08, 2.07, 2.07, 2.06, 2.06, 2.06, 2.05, 2.05, 2.05, 2.04];
const tcrit = (df) => (df < 1 ? null : df <= 30 ? T_CRIT[df] : df <= 60 ? 2.0 : 1.96);

export const to100 = (x) => ((x - 1) / 4) * 100;
export const recode = (raw, rev) => (raw == null ? null : rev ? 6 - raw : raw);

// ---------------------------------------------------------------------
//  YANIT GÜVEN ENDEKSİ (0–100) — tek bir yanıt formunun güvenilirliği
// ---------------------------------------------------------------------
export function quality(mod, resp) {
  const items = mod.items;
  const raws = items.map((it) => resp.answers?.[it.id]).filter((v) => v != null).map(Number);
  const flags = [];
  let score = 100;
  if (raws.length < 3) return { score: 0, level: 'invalid', flags: [{ k: 'empty' }] };

  // 1) Dikkat kontrol maddesi
  if (mod.attention) {
    const v = resp.answers?.[mod.attention.id];
    if (v != null && Number(v) !== mod.attention.expect) {
      score -= 45;
      flags.push({ k: 'attention' });
    }
  }
  // 2) Düz çizgi (aynı seçeneği işaretleme)
  const freq = {};
  raws.forEach((v) => (freq[v] = (freq[v] || 0) + 1));
  const maxShare = Math.max(...Object.values(freq)) / raws.length;
  let run = 1, best = 1;
  for (let i = 1; i < raws.length; i++) {
    run = raws[i] === raws[i - 1] ? run + 1 : 1;
    best = Math.max(best, run);
  }
  // Ters madde ve dikkat maddesi olmayan ölçeklerde (ör. olgunluk ölçeği) tekdüze yanıtı doğrulayacak
  // başka kanıt olmadığından ceza daha ağırdır.
  const unguarded = !mod.attention && !items.some((it) => it.rev);
  if (maxShare >= 0.95) {
    score -= unguarded ? 65 : 45;
    flags.push({ k: 'straight', v: Math.round(maxShare * 100) });
  } else if (maxShare >= 0.75 || best / raws.length >= 0.5) {
    score -= 20;
    flags.push({ k: 'pattern', v: Math.round(maxShare * 100) });
  }
  // 3) Hız — madde başına medyan süre (saniye)
  const times = Object.values(resp.timings || {}).map(Number).filter((x) => x > 0 && x < 600);
  const perItem = times.length >= 5 ? median(times) : resp.duration_sec ? resp.duration_sec / raws.length : null;
  if (perItem != null) {
    if (perItem < 1.6) {
      score -= 35;
      flags.push({ k: 'speed', v: round(perItem, 1) });
    } else if (perItem < 2.6) {
      score -= 15;
      flags.push({ k: 'fast', v: round(perItem, 1) });
    }
  }
  // 4) Ters madde tutarsızlığı — aynı boyutta düz ve ters maddelerin çevrilmiş ortalamaları arasındaki fark
  const gaps = [];
  for (const d of mod.dims) {
    const fw = [], rv = [];
    items.filter((it) => it.dim === d.key).forEach((it) => {
      const v = resp.answers?.[it.id];
      if (v == null) return;
      (it.rev ? rv : fw).push(recode(Number(v), it.rev));
    });
    if (fw.length && rv.length) gaps.push(Math.abs(mean(fw) - mean(rv)));
  }
  if (gaps.length >= 2) {
    const g = mean(gaps);
    if (g >= 2) {
      score -= 25;
      flags.push({ k: 'inconsistent', v: round(g, 1) });
    } else if (g >= 1.5) {
      score -= 10;
      flags.push({ k: 'mixed', v: round(g, 1) });
    }
  }
  score = clamp(Math.round(score), 0, 100);
  const level = score >= 70 ? 'reliable' : score >= 40 ? 'caution' : 'suspect';
  return { score, level, flags };
}

export const QUALITY_TEXT = {
  attention: { tr: 'Dikkat kontrol sorusu yanlış yanıtlandı', en: 'Attention-check item answered incorrectly' },
  straight: { tr: 'Neredeyse tüm sorularda aynı seçenek (%{v})', en: 'Same option on almost every item ({v}%)' },
  pattern: { tr: 'Tekdüze yanıt örüntüsü (%{v} aynı seçenek)', en: 'Monotonous response pattern ({v}% same option)' },
  speed: { tr: 'Çok hızlı: soru başına {v} sn', en: 'Too fast: {v}s per item' },
  fast: { tr: 'Hızlı: soru başına {v} sn', en: 'Fast: {v}s per item' },
  inconsistent: { tr: 'Zıt ifadelere çelişkili yanıtlar (fark {v})', en: 'Contradictory answers to reversed items (gap {v})' },
  mixed: { tr: 'Zıt ifadelerde kısmi tutarsızlık (fark {v})', en: 'Partial inconsistency on reversed items (gap {v})' },
  empty: { tr: 'Yetersiz yanıt', en: 'Insufficient answers' },
};
export const QUALITY_LEVEL = {
  reliable: { tr: 'Güvenilir', en: 'Reliable' },
  caution: { tr: 'Dikkat', en: 'Caution' },
  suspect: { tr: 'Şüpheli', en: 'Suspect' },
  invalid: { tr: 'Geçersiz', en: 'Invalid' },
};

// ---------------------------------------------------------------------
//  TEK YANIT PUANLAMA
// ---------------------------------------------------------------------
export function scoreResponse(mod, resp) {
  const dims = {};
  const rec = {};
  for (const it of mod.items) {
    const v = resp.answers?.[it.id];
    if (v != null) rec[it.id] = recode(Number(v), it.rev);
  }
  for (const d of mod.dims) {
    const its = mod.items.filter((it) => it.dim === d.key);
    const vals = its.map((it) => rec[it.id]).filter((v) => v != null);
    dims[d.key] = vals.length >= Math.ceil(its.length / 2) ? to100(mean(vals)) : null;
  }
  const idx = weighted(mod, dims);
  return { dims, index: idx, rec, q: quality(mod, resp) };
}

function weighted(mod, dims) {
  let w = 0, s = 0;
  for (const d of mod.dims) {
    if (d.noIndex) continue;
    const v = dims[d.key];
    if (v == null) continue;
    const wt = d.weight ?? 1;
    w += wt;
    s += v * wt;
  }
  return w ? s / w : null;
}

function cronbach(mod, scored, dimKey) {
  const its = mod.items.filter((it) => it.dim === dimKey);
  if (its.length < 2) return null;
  const rows = scored.map((s) => its.map((it) => s.rec[it.id])).filter((r) => r.every((v) => v != null));
  if (rows.length < 20) return null;
  const k = its.length;
  const itemVars = its.map((_, j) => sd(rows.map((r) => r[j])) ** 2);
  const totVar = sd(rows.map((r) => sum(r))) ** 2;
  if (!totVar) return null;
  const a = (k / (k - 1)) * (1 - sum(itemVars) / totVar);
  return a > 0 ? a : null;
}

function describe(vals) {
  const n = vals.length;
  const m = mean(vals);
  const s = sd(vals);
  const tc = tcrit(n - 1);
  const half = n > 1 && tc ? (tc * s) / Math.sqrt(n) : null;
  return { n, mean: m, sd: s, ci: half == null ? null : [clamp(m - half, 0, 100), clamp(m + half, 0, 100)] };
}

// ---------------------------------------------------------------------
//  TOPLU ANALİZ
//  opts.includeSuspect: şüpheli yanıtları dahil et (varsayılan: hariç)
// ---------------------------------------------------------------------
export function aggregate(mod, responses, opts = {}) {
  const all = responses.map((r) => ({ r, ...scoreResponse(mod, r) }));
  const used = all.filter((s) => s.index != null && (opts.includeSuspect || s.q.level === 'reliable' || s.q.level === 'caution'));
  const excluded = all.length - used.length;
  const n = used.length;
  const out = { n, total: all.length, excluded, scored: used, all };
  if (!n) return out;

  out.index = describe(used.map((s) => s.index));
  out.consensus = clamp(1 - out.index.sd / 50, 0, 1) * 100;

  // boyutlar
  out.dims = mod.dims.map((d) => {
    const vals = used.map((s) => s.dims[d.key]).filter((v) => v != null);
    const recs = [];
    used.forEach((s) => mod.items.filter((it) => it.dim === d.key).forEach((it) => s.rec[it.id] != null && recs.push(s.rec[it.id])));
    return {
      key: d.key, def: d, ...describe(vals),
      fav: recs.length ? (100 * recs.filter((v) => v >= 4).length) / recs.length : null,
      neu: recs.length ? (100 * recs.filter((v) => v === 3).length) / recs.length : null,
      unf: recs.length ? (100 * recs.filter((v) => v <= 2).length) / recs.length : null,
      alpha: cronbach(mod, used, d.key),
    };
  });
  const allRec = used.flatMap((s) => Object.values(s.rec));
  out.fav = (100 * allRec.filter((v) => v >= 4).length) / allRec.length;
  out.unf = (100 * allRec.filter((v) => v <= 2).length) / allRec.length;

  // maddeler
  out.items = mod.items.map((it) => {
    const vals = used.map((s) => s.rec[it.id]).filter((v) => v != null);
    return {
      id: it.id, def: it, n: vals.length,
      mean: vals.length ? to100(mean(vals)) : null,
      fav: vals.length ? (100 * vals.filter((v) => v >= 4).length) / vals.length : null,
      unf: vals.length ? (100 * vals.filter((v) => v <= 2).length) / vals.length : null,
    };
  });

  // dağılım (endeks histogramı, 10'luk dilimler)
  out.hist = Array.from({ length: 10 }, (_, i) => used.filter((s) => Math.min(9, Math.floor(s.index / 10)) === i).length);
  out.riskShare = (100 * used.filter((s) => s.index < 55).length) / n;

  // eNPS
  const npsItem = (mod.extras || []).find((e) => e.type === 'nps');
  if (npsItem) {
    const v = used.map((s) => s.r.answers?.[npsItem.id]).filter((x) => x != null).map(Number);
    if (v.length) {
      const pro = v.filter((x) => x >= 9).length, det = v.filter((x) => x <= 6).length;
      out.enps = { score: Math.round((100 * (pro - det)) / v.length), pro: (100 * pro) / v.length, det: (100 * det) / v.length, pas: (100 * (v.length - pro - det)) / v.length, n: v.length };
    }
  }

  // etki analizi (key driver)
  out.drivers = drivers(mod, used);

  // alt grup kırılımları
  out.groups = {};
  for (const f of mod.meta || []) {
    const vals = [...new Set(used.map((s) => s.r.meta?.[f.key]).filter(Boolean))];
    out.groups[f.key] = vals.map((v) => {
      const g = used.filter((s) => s.r.meta?.[f.key] === v);
      const hidden = g.length < (opts.minGroupN ?? mod.minGroupN ?? CONFIG.MIN_GROUP_N);
      return {
        value: v, n: g.length, hidden,
        index: hidden ? null : mean(g.map((s) => s.index)),
        dims: hidden ? {} : Object.fromEntries(mod.dims.map((d) => [d.key, mean(g.map((s) => s.dims[d.key]).filter((x) => x != null))])),
      };
    }).sort((a, b) => b.n - a.n);
  }

  // kalite özeti
  const ql = { reliable: 0, caution: 0, suspect: 0, invalid: 0 };
  all.forEach((s) => ql[s.q.level]++);
  out.quality = { ...ql, avg: mean(all.map((s) => s.q.score)) };
  return out;
}

export function outcomeOf(mod, s) {
  const o = mod.outcome;
  if (!o) return null;
  if (o.type === 'nps' || o.type === 'scale10') {
    const v = s.r.answers?.[o.id];
    return v == null ? null : Number(v) * 10;
  }
  if (o.type === 'dim') return s.dims[o.key];
  if (o.type === 'item') return s.rec[o.id] != null ? to100(s.rec[o.id]) : null;
  return null;
}

function drivers(mod, used) {
  if (!mod.outcome || used.length < 8) return null;
  const pairs = used.map((s) => ({ s, y: outcomeOf(mod, s) })).filter((p) => p.y != null);
  if (pairs.length < 8) return null;
  const list = mod.dims
    .filter((d) => !(mod.outcome.type === 'dim' && mod.outcome.key === d.key))
    .map((d) => {
      const pp = pairs.filter((p) => p.s.dims[d.key] != null);
      const r = pearson(pp.map((p) => p.s.dims[d.key]), pp.map((p) => p.y));
      return { key: d.key, def: d, r, score: mean(pp.map((p) => p.s.dims[d.key])) };
    })
    .filter((x) => x.r != null);
  if (!list.length) return null;
  const medR = median(list.map((x) => Math.max(0, x.r)));
  list.forEach((x) => {
    x.importance = Math.max(0, x.r);
    const hi = x.importance >= medR, good = x.score >= 70;
    x.quad = hi && !good ? 'priority' : hi && good ? 'protect' : !hi && !good ? 'monitor' : 'maintain';
  });
  return { list, medR };
}

export const QUAD = {
  priority: { tr: 'Öncelikli aksiyon', en: 'Act now', desc: { tr: 'Sonucu en çok etkileyen ama zayıf alanlar', en: 'High impact, low score' } },
  protect: { tr: 'Güçlü yanı koru', en: 'Protect', desc: { tr: 'Yüksek etki, yüksek puan', en: 'High impact, high score' } },
  monitor: { tr: 'İzle', en: 'Monitor', desc: { tr: 'Düşük etki, düşük puan', en: 'Low impact, low score' } },
  maintain: { tr: 'Sürdür', en: 'Maintain', desc: { tr: 'Düşük etki, yüksek puan', en: 'Low impact, high score' } },
};

// Yönetim ve çalışan algısı arasındaki fark (kör nokta)
export function perceptionGap(mod, agg, field, mgmtValue) {
  const groups = agg.groups?.[field];
  if (!groups) return null;
  const mg = agg.scored.filter((s) => s.r.meta?.[field] === mgmtValue);
  const st = agg.scored.filter((s) => s.r.meta?.[field] && s.r.meta[field] !== mgmtValue);
  if (mg.length < 3 || st.length < (CONFIG.MIN_GROUP_N || 5)) return null;
  return mod.dims.map((d) => {
    const a = mean(mg.map((s) => s.dims[d.key]).filter((v) => v != null));
    const b = mean(st.map((s) => s.dims[d.key]).filter((v) => v != null));
    return { key: d.key, def: d, mgmt: a, staff: b, gap: a - b };
  });
}
