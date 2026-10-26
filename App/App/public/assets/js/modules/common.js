// Modüllerin ortak yapı taşları: ölçekler, demografik alanlar, adım üretici
import { L } from '../core/i18n.js';

export const SCALES = {
  agree5: [
    { tr: 'Kesinlikle katılmıyorum', en: 'Strongly disagree' },
    { tr: 'Katılmıyorum', en: 'Disagree' },
    { tr: 'Kararsızım', en: 'Neutral' },
    { tr: 'Katılıyorum', en: 'Agree' },
    { tr: 'Kesinlikle katılıyorum', en: 'Strongly agree' },
  ],
  freq5: [
    { tr: 'Hiçbir zaman', en: 'Never' },
    { tr: 'Nadiren', en: 'Rarely' },
    { tr: 'Bazen', en: 'Sometimes' },
    { tr: 'Sık sık', en: 'Often' },
    { tr: 'Neredeyse her zaman', en: 'Almost always' },
  ],
  maturity5: [
    { tr: 'Yok — plan veya uygulama yok', en: 'None — no plan or practice' },
    { tr: 'Başlangıç — dağınık, kişilere bağlı', en: 'Initial — ad hoc, person-dependent' },
    { tr: 'Gelişiyor — kısmen tanımlı', en: 'Developing — partly defined' },
    { tr: 'Yerleşik — tanımlı ve uygulanıyor', en: 'Established — defined and practiced' },
    { tr: 'İleri — ölçülüyor, test ediliyor, iyileştiriliyor', en: 'Advanced — measured, tested, improved' },
  ],
  likelihood5: [
    { tr: 'Çok düşük', en: 'Very low' },
    { tr: 'Düşük', en: 'Low' },
    { tr: 'Orta', en: 'Moderate' },
    { tr: 'Yüksek', en: 'High' },
    { tr: 'Çok yüksek', en: 'Very high' },
  ],
  impact5: [
    { tr: 'Önemsiz', en: 'Negligible' },
    { tr: 'Sınırlı', en: 'Limited' },
    { tr: 'Ciddi', en: 'Serious' },
    { tr: 'Ağır', en: 'Severe' },
    { tr: 'Yıkıcı', en: 'Catastrophic' },
  ],
};

export const META = {
  group: {
    key: 'group',
    label: { tr: 'Pozisyon grubunuz', en: 'Your position group' },
    options: [
      { v: 'blue', tr: 'Mavi yaka (saha / üretim / operasyon)', en: 'Blue collar (field / production / operations)' },
      { v: 'white', tr: 'Beyaz yaka (ofis / uzman)', en: 'White collar (office / specialist)' },
      { v: 'mgmt', tr: 'Yönetici (ekip lideri ve üzeri)', en: 'Manager (team lead and above)' },
    ],
  },
  tenure: {
    key: 'tenure',
    label: { tr: 'Bu kurumdaki çalışma süreniz', en: 'Your tenure at this organization' },
    options: [
      { v: 't0', tr: '1 yıldan az', en: 'Less than 1 year' },
      { v: 't1', tr: '1–3 yıl', en: '1–3 years' },
      { v: 't3', tr: '3–5 yıl', en: '3–5 years' },
      { v: 't5', tr: '5–10 yıl', en: '5–10 years' },
      { v: 't10', tr: '10 yıldan fazla', en: 'More than 10 years' },
    ],
  },
  department: {
    key: 'department',
    label: { tr: 'Biriminiz', en: 'Your department' },
    fromSettings: 'departments',
  },
};

export const ATTENTION = {
  id: 'ATT',
  tr: 'Dikkat kontrolü: Lütfen bu soruda "Katılmıyorum" seçeneğini işaretleyin.',
  en: 'Attention check: Please select "Disagree" for this item.',
  expect: 2,
};

// Seçenek etiketini koda göre bul (raporlar için)
export function optLabel(field, v, settings) {
  if (!field) return v;
  if (field.options) return L(field.options.find((o) => o.v === v)) || v;
  return v;
}

// Genel Likert modülü adım listesi: demografi → maddeler (boyut sırasıyla, ortada dikkat maddesi) → ekler
export function likertSteps(mod, pub = {}) {
  const steps = [];
  const metas = (mod.meta || [])
    .map((m) => (m.fromSettings ? { ...m, options: (pub[m.fromSettings] || []).map((d) => ({ v: d, tr: d, en: d })) } : m))
    .filter((m) => m.options && m.options.length);
  if (metas.length) steps.push({ type: 'meta', fields: metas });
  const items = mod.items.filter((it) => !it.hidden);
  const mid = Math.floor(items.length * 0.55);
  items.forEach((it, i) => {
    if (mod.attention && i === mid) steps.push({ type: 'likert', item: { ...mod.attention, dim: null }, scale: 'agree5', attention: true });
    steps.push({ type: 'likert', item: it, scale: it.scale || mod.scale || 'agree5' });
  });
  for (const e of mod.extras || []) steps.push({ type: e.type, item: e });
  return steps;
}

// Modül tanımını sıkıştırılmış yazımdan açar:  ['S1', 'dim', 0|1, 'TR', 'EN']
export function items(rows) {
  return rows.map(([id, dim, rev, tr, en, extra]) => ({ id, dim, rev: !!rev, tr, en, ...(extra || {}) }));
}
