// İK ADAY DEĞERLENDİRME — Bilişsel yetenek + Durumsal yargı + Kişilik (Beş Faktör) + İş uyumu
import { COG, SJT } from './ik-items.js';
import { items } from './common.js';
import { mean, clamp } from '../core/util.js';
import { to100, recode } from '../core/engine.js';

export const DOMAINS = [
  { key: 'num', name: { tr: 'Sayısal akıl yürütme', en: 'Numerical reasoning' } },
  { key: 'verbal', name: { tr: 'Sözel akıl yürütme', en: 'Verbal reasoning' } },
  { key: 'logic', name: { tr: 'Mantıksal çıkarım', en: 'Logical inference' } },
  { key: 'pattern', name: { tr: 'Dikkat & örüntü', en: 'Attention & patterns' } },
];

export const TRAITS = [
  { key: 'O', name: { tr: 'Deneyime Açıklık', en: 'Openness' }, low: { tr: 'Geleneksel, pratik', en: 'Conventional, practical' }, high: { tr: 'Meraklı, yenilikçi', en: 'Curious, inventive' } },
  { key: 'C', name: { tr: 'Sorumluluk', en: 'Conscientiousness' }, low: { tr: 'Esnek, kendiliğinden', en: 'Flexible, spontaneous' }, high: { tr: 'Planlı, disiplinli', en: 'Organised, disciplined' } },
  { key: 'E', name: { tr: 'Dışadönüklük', en: 'Extraversion' }, low: { tr: 'Sakin, içe dönük', en: 'Reserved, reflective' }, high: { tr: 'Sosyal, enerjik', en: 'Sociable, energetic' } },
  { key: 'A', name: { tr: 'Uyumluluk', en: 'Agreeableness' }, low: { tr: 'Doğrudan, rekabetçi', en: 'Direct, competitive' }, high: { tr: 'İş birlikçi, empatik', en: 'Cooperative, empathetic' } },
  { key: 'S', name: { tr: 'Duygusal Denge', en: 'Emotional Stability' }, low: { tr: 'Hassas, tepkisel', en: 'Sensitive, reactive' }, high: { tr: 'Sakin, dayanıklı', en: 'Calm, resilient' } },
];

export const PERS = items([
  ['O1', 'O', 0, 'Yeni yöntemler denemekten keyif alırım.', 'I enjoy trying new methods.'],
  ['C1', 'C', 0, 'İşlerimi önceden planlar ve plana sadık kalırım.', 'I plan my work in advance and stick to the plan.'],
  ['E1', 'E', 0, 'Yeni insanlarla tanışmak bana enerji verir.', 'Meeting new people energises me.'],
  ['A1', 'A', 0, 'Başkalarının ne hissettiğini anlamaya çalışırım.', 'I try to understand how others feel.'],
  ['S1', 'S', 0, 'Baskı altında sakin kalabilirim.', 'I can stay calm under pressure.'],
  ['O2', 'O', 1, 'Alışık olduğum yöntemlerin dışına çıkmaktan hoşlanmam.', "I don't like stepping outside the methods I'm used to."],
  ['C2', 'C', 1, 'Teslim tarihlerini sık sık son ana bırakırım.', 'I often leave deadlines to the last minute.'],
  ['E2', 'E', 1, 'Kalabalık ortamlarda çabuk yorulurum.', 'Crowded settings tire me out quickly.'],
  ['A2', 'A', 1, 'Haklı olduğumu düşündüğümde karşımdakinin hislerini pek önemsemem.', "When I think I'm right, I don't care much about the other person's feelings."],
  ['S2', 'S', 1, 'Küçük sorunlar bile beni kolayca strese sokar.', 'Even small problems easily stress me out.'],
  ['O3', 'O', 0, 'Karmaşık fikirler üzerine düşünmek beni heyecanlandırır.', 'Thinking about complex ideas excites me.'],
  ['C3', 'C', 0, 'Ayrıntılara dikkat ederim.', 'I pay attention to details.'],
  ['E3', 'E', 0, 'Grup içinde söz almaktan çekinmem.', "I don't hesitate to speak up in a group."],
  ['A3', 'A', 0, 'İş birliği benim için rekabetten daha önemlidir.', 'Cooperation matters more to me than competition.'],
  ['S3', 'S', 0, 'Bir aksilikten sonra çabuk toparlanırım.', 'I recover quickly after a setback.'],
  ['SD1', '_sd', 0, 'Hayatımda hiç kimseye kızmadım.', 'I have never been angry at anyone in my life.'],
  ['O4', 'O', 1, 'Soyut ve kuramsal konular bana sıkıcı gelir.', 'Abstract and theoretical topics bore me.'],
  ['C4', 'C', 1, 'Eşyalarım ve dosyalarım genellikle dağınıktır.', 'My things and files are usually disorganised.'],
  ['E4', 'E', 1, 'Dikkatleri üzerime çekmekten kaçınırım.', 'I avoid drawing attention to myself.'],
  ['A4', 'A', 1, 'Başkalarının hatalarını kolay kolay affetmem.', "I don't easily forgive others' mistakes."],
  ['S4', 'S', 1, 'Sık sık işlerin kötü gideceğinden endişe ederim.', 'I often worry that things will go wrong.'],
  ['O5', 'O', 0, 'Farklı bakış açılarını merak ederim.', 'I am curious about different perspectives.'],
  ['C5', 'C', 0, 'Bir işi bitirmeden diğerine geçmem.', "I don't move on before finishing a task."],
  ['E5', 'E', 0, 'Ortamı canlandıran kişi genellikle benim.', "I'm usually the one who livens things up."],
  ['A5', 'A', 0, 'İnsanlara güvenmeye eğilimliyim.', 'I tend to trust people.'],
  ['S5', 'S', 0, 'Genellikle kendimden eminimdir.', 'I usually feel self-assured.'],
  ['O6', 'O', 1, 'Değişiklikleri çoğu zaman gereksiz bulurum.', 'I often find changes unnecessary.'],
  ['C6', 'C', 1, 'Verdiğim sözleri unuttuğum olur.', 'I sometimes forget promises I have made.'],
  ['E6', 'E', 1, 'Tek başıma çalışmayı ekip çalışmasına tercih ederim.', 'I prefer working alone to working in a team.'],
  ['A6', 'A', 1, 'Tartışmalarda sert bir dil kullandığım olur.', 'I sometimes use harsh language in arguments.'],
  ['S6', 'S', 1, 'Ruh hâlim gün içinde çok değişir.', 'My mood changes a lot during the day.'],
  ['SD2', '_sd', 0, 'Söz verdiğim bir işi hiçbir zaman geciktirmedim.', 'I have never once been late with something I promised.'],
]);

// Pozisyon aileleri: kişilik hedef aralıkları ve modül ağırlıkları
export const FAMILIES = [
  { key: 'sales', name: { tr: 'Satış & müşteri ilişkileri', en: 'Sales & account management' },
    w: { cog: 0.3, sjt: 0.35, pers: 0.35 }, range: { O: [40, 85], C: [55, 95], E: [65, 100], A: [50, 90], S: [55, 100] } },
  { key: 'production', name: { tr: 'Üretim & saha operasyonu', en: 'Production & field operations' },
    w: { cog: 0.35, sjt: 0.35, pers: 0.3 }, range: { O: [30, 75], C: [65, 100], E: [30, 80], A: [50, 90], S: [55, 100] } },
  { key: 'manager', name: { tr: 'Yönetici & ekip lideri', en: 'Manager & team lead' },
    w: { cog: 0.4, sjt: 0.35, pers: 0.25 }, range: { O: [55, 95], C: [65, 100], E: [55, 95], A: [45, 85], S: [65, 100] } },
  { key: 'office', name: { tr: 'Ofis & idari işler', en: 'Office & administration' },
    w: { cog: 0.4, sjt: 0.3, pers: 0.3 }, range: { O: [35, 80], C: [65, 100], E: [35, 80], A: [55, 95], S: [55, 100] } },
  { key: 'technical', name: { tr: 'Teknik & mühendislik', en: 'Technical & engineering' },
    w: { cog: 0.5, sjt: 0.25, pers: 0.25 }, range: { O: [60, 100], C: [60, 100], E: [25, 75], A: [40, 85], S: [55, 100] } },
  { key: 'service', name: { tr: 'Hizmet & ön büro', en: 'Service & front desk' },
    w: { cog: 0.3, sjt: 0.4, pers: 0.3 }, range: { O: [35, 80], C: [55, 95], E: [55, 95], A: [65, 100], S: [60, 100] } },
];
export const family = (k) => FAMILIES.find((f) => f.key === k) || FAMILIES[3];

export const COG_MINUTES = 18;

// Mülakat soruları — düşük alan/özelliklere göre önerilir
export const PROBES = {
  num: { tr: 'Son işinizde sayısal bir veriyle (bütçe, stok, hedef) karar verdiğiniz bir örneği adım adım anlatır mısınız?', en: 'Walk me through a time you used numbers (budget, stock, targets) to make a decision.' },
  verbal: { tr: 'Karmaşık bir konuyu teknik olmayan birine yazılı olarak açıklamanız gereken bir durumu anlatın.', en: 'Describe a time you had to explain a complex topic in writing to a non-expert.' },
  logic: { tr: 'Eksik bilgiyle karar vermek zorunda kaldığınız bir durumda hangi varsayımları yaptınız?', en: 'When you had to decide with incomplete information, what assumptions did you make?' },
  pattern: { tr: 'Hata yapılmaması gereken, ayrıntı yoğun bir işte doğruluğunuzu nasıl güvenceye aldınız?', en: 'In detail-heavy work where errors were not acceptable, how did you ensure accuracy?' },
  sjt: { tr: 'Bir yöneticiyle ya da müşteriyle görüş ayrılığına düştüğünüz bir durumu ve sonucunu anlatın.', en: 'Tell me about a disagreement with a manager or customer and how it ended.' },
  O: { tr: 'Alışık olduğunuz bir yöntemi değiştirmeniz gereken son durumu anlatın; neler hissettiniz, ne yaptınız?', en: 'Describe the last time you had to change a familiar method; how did you feel and act?' },
  C: { tr: 'Birden fazla teslim tarihini aynı anda yönettiğiniz bir dönemi ve kullandığınız sistemi anlatın.', en: 'Describe a period when you managed several deadlines at once and the system you used.' },
  E: { tr: 'Tanımadığınız bir grupla hızlıca ilişki kurmanız gereken bir örnek verir misiniz?', en: 'Give an example of having to build rapport quickly with people you did not know.' },
  A: { tr: 'Bir ekip arkadaşınızla anlaşmazlığa düştüğünüzde ilişkiyi nasıl korudunuz?', en: 'How did you protect the relationship when you disagreed with a teammate?' },
  S: { tr: 'Yoğun baskı altında çalıştığınız bir günü ve stresi nasıl yönettiğinizi anlatın.', en: 'Describe a day under heavy pressure and how you managed the stress.' },
};

// ---------------------------------------------------------------- PUANLAMA
export function scoreCandidate(resp, settings = {}) {
  const fam = family(settings.public?.family || settings.family);
  const a = resp.answers || {};
  // kişilik
  const traits = {};
  for (const tr of TRAITS) {
    const v = PERS.filter((it) => it.dim === tr.key).map((it) => (a[it.id] == null ? null : recode(Number(a[it.id]), it.rev))).filter((x) => x != null);
    traits[tr.key] = v.length >= 4 ? to100(mean(v)) : null;
  }
  // iş uyumu: hedef aralık dışına çıkan her puan, uzaklığı oranında uyumu düşürür
  const fitParts = TRAITS.map((tr) => {
    const v = traits[tr.key];
    if (v == null) return null;
    const [lo, hi] = fam.range[tr.key];
    const dist = v < lo ? lo - v : v > hi ? v - hi : 0;
    return clamp(100 - dist * 2, 0, 100);
  }).filter((x) => x != null);
  const persFit = fitParts.length ? mean(fitParts) : null;

  const ss = resp.server_scores || null;
  const cogDomains = ss?.cog || null;
  const cog = cogDomains ? mean(DOMAINS.map((d) => cogDomains[d.key]).filter((x) => x != null)) : null;
  const sjt = ss?.sjt ?? null;

  let fit = null;
  if (cog != null && sjt != null && persFit != null) fit = fam.w.cog * cog + fam.w.sjt * sjt + fam.w.pers * persFit;

  // güvenilirlik
  const flags = [];
  let rel = 100;
  const sd = ['SD1', 'SD2'].map((k) => Number(a[k])).filter((x) => x);
  if (sd.length === 2 && sd.every((x) => x >= 4)) {
    rel -= 25;
    flags.push('sd');
  }
  const pv = PERS.filter((it) => it.dim !== '_sd').map((it) => Number(a[it.id])).filter((x) => x);
  if (pv.length) {
    const f = {};
    pv.forEach((x) => (f[x] = (f[x] || 0) + 1));
    const share = Math.max(...Object.values(f)) / pv.length;
    if (share >= 0.8) {
      rel -= 35;
      flags.push('straight');
    }
  }
  const gaps = TRAITS.map((tr) => {
    const fw = PERS.filter((it) => it.dim === tr.key && !it.rev).map((it) => Number(a[it.id])).filter((x) => x);
    const rv = PERS.filter((it) => it.dim === tr.key && it.rev).map((it) => 6 - Number(a[it.id])).filter((x) => x < 6);
    return fw.length && rv.length ? Math.abs(mean(fw) - mean(rv)) : null;
  }).filter((x) => x != null);
  if (gaps.length && mean(gaps) >= 1.8) {
    rel -= 20;
    flags.push('inconsistent');
  }
  const cogSec = resp.meta?.cog_seconds;
  const cogAnswered = COG.filter((q) => a[q.id] != null).length;
  if (cogSec != null && cogAnswered >= 12 && cogSec / cogAnswered < 12) {
    rel -= 25;
    flags.push('cogfast');
  }
  if (resp.meta?.timeout) flags.push('timeout');
  return { fam, traits, persFit, cog, cogDomains, sjt, fit, rel: clamp(rel, 0, 100), flags, cogAnswered };
}

export const FLAG_TEXT = {
  sd: { tr: 'Sosyal beğenirlik yüksek: aday kendini olduğundan olumlu gösterme eğiliminde olabilir; kişilik sonuçlarını temkinli yorumlayın.', en: 'High social desirability: the candidate may present themselves too favourably; interpret personality results cautiously.' },
  straight: { tr: 'Kişilik bölümünde tekdüze yanıt örüntüsü.', en: 'Monotonous response pattern in the personality section.' },
  inconsistent: { tr: 'Zıt ifadelere çelişkili yanıtlar.', en: 'Contradictory answers to reversed statements.' },
  cogfast: { tr: 'Bilişsel bölüm olağan dışı hızlı yanıtlandı (soru başına 12 sn altı).', en: 'Cognitive section answered unusually fast (under 12 s per item).' },
  timeout: { tr: 'Bilişsel bölüm süre dolduğu için otomatik kapandı.', en: 'Cognitive section closed automatically when time ran out.' },
};



export default {
  key: 'ik',
  icon: 'clipboard',
  order: 7,
  name: { tr: 'İK Aday Değerlendirme', en: 'HR Candidate Assessment' },
  short: { tr: 'İK Değerlendirme', en: 'HR Assessment' },
  tagline: {
    tr: 'Bilişsel yetenek, durumsal yargı ve kişiliği tek raporda; pozisyona uyum skoru.',
    en: 'Cognitive ability, situational judgement and personality in one report, with a role-fit score.',
  },
  about: {
    tr: 'Her aday için ayrı bir davet bağlantısı oluşturulur. Aday üç bölümü tek oturumda tamamlar: süreli bilişsel yetenek testi (sayısal, sözel, mantıksal, dikkat), iş hayatından durumsal yargı senaryoları ve Beş Faktör kişilik envanteri. Bilişsel ve durumsal bölümlerin cevap anahtarı yalnızca sunucuda tutulur; aday tarafında görünmez. Rapor, seçilen pozisyon ailesine göre ağırlıklandırılmış bir İş Uyum Skoru, kişilik profilinin hedef aralıklarla karşılaştırması, yanıt güvenilirliği ve mülakat için önerilen sorular içerir.',
    en: 'A separate invitation link is created for each candidate, who completes three sections in one sitting: a timed cognitive ability test (numerical, verbal, logical, attention), workplace situational-judgement scenarios and a Big Five personality inventory. Answer keys for the cognitive and situational sections live only on the server and are never exposed to candidates. The report includes a Role Fit Score weighted for the selected job family, the personality profile against target ranges, response reliability and suggested interview questions.',
  },
  audience: 'candidate',
  minutes: 35,
  dims: TRAITS.map((t) => ({ key: t.key, name: t.name, short: t.name })),
  items: PERS,
  counts: { cog: COG.length, sjt: SJT.length, pers: PERS.length },
  settings: ['candidate'],
};

export { COG, SJT };
