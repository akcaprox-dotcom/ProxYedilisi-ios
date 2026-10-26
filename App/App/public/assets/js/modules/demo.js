// Örnek rapor verisi — gerçekçi, tekrar üretilebilir sentetik yanıtlar
import { rng, clamp, uid } from '../core/util.js';
import { getModule, effective } from './index.js';
import { COG, SJT, PERS, scoreCandidate } from './ik.js';
import { DEFAULT_PRIORITIES } from './vizyon.js';
import { getLang } from '../core/i18n.js';

// Modül başına "tipik kurum" profili: boyut bazında gizil düzey (1–5)
const PROFILES = {
  isletme: { safety: 3.9, process: 3.0, tech: 2.8, quality: 3.6, growth: 2.6, comms: 2.7, conditions: 2.9, workload: 2.6, leadership: 3.2, engagement: 3.4 },
  guven: { leader: 3.0, team: 3.9, psych: 2.9, justice: 2.6, _outcome: 3.2 },
  stres: { demands: 2.6, control: 3.2, mgr: 3.4, peer: 3.9, relations: 3.5, role: 3.8, change: 2.5, balance: 2.7, strain: 2.9 },
  toplanti: { purpose: 3.4, time: 2.7, participation: 3.5, decision: 2.6, facilitation: 3.3 },
  senaryo: { finance: 3.1, ops: 3.4, hr: 2.5, supply: 3.0, reputation: 2.7 },
  vizyon: { vision: 3.3, goals: 2.8, values: 3.2, comms: 2.6, role: 2.9, _outcome: 3.1 },
};
const SCEN_SHIFT = { eco: 0.25, tech: -0.35, reg: 0.0 };
const DEPTS = {
  tr: ['Üretim', 'Kalite', 'Satış', 'Lojistik', 'Finans', 'İnsan Kaynakları'],
  en: ['Production', 'Quality', 'Sales', 'Logistics', 'Finance', 'Human Resources'],
};

export function demoAssessment(moduleKey, n) {
  const lang = getLang();
  const mod = getModule(moduleKey);
  const settings = { public: {}, private: {} };
  if (mod.settings?.includes('departments')) settings.public.departments = DEPTS[lang];
  if (moduleKey === 'vizyon') {
    settings.public.priorities = DEFAULT_PRIORITIES[lang].slice(0, 7);
    settings.private.official = [0, 3, 4];
  }
  if (moduleKey === 'toplanti') {
    settings.public.meeting = { date: new Date().toISOString().slice(0, 10), minutes: 75, attendees: 9, hourly: 650 };
  }
  if (moduleKey === 'ik') {
    settings.public.family = 'manager';
    settings.private = { candidate: lang === 'en' ? 'Sample Candidate' : 'Örnek Aday', position: lang === 'en' ? 'Production Planning Lead' : 'Üretim Planlama Şefi' };
  }
  const title = lang === 'en' ? 'Sample report' : 'Örnek rapor';
  const a = { id: 'demo-' + moduleKey, module: moduleKey, title, code: 'DEMO000000', status: 'closed', settings, created_at: new Date(Date.now() - 12 * 864e5).toISOString(), target_n: moduleKey === 'ik' ? null : Math.round((n || 60) * 1.25) };
  return a;
}

export function demoResponses(moduleKey, n, assessment, seed = 7) {
  if (moduleKey === 'ik') return [demoCandidate(seed)];
  const r = rng(seed * 7919 + moduleKey.length);
  const mod = effective(getModule(moduleKey), assessment.settings);
  const prof = PROFILES[moduleKey] || {};
  const out = [];
  const gauss = () => {
    let s = 0;
    for (let i = 0; i < 6; i++) s += r();
    return (s - 3) / Math.sqrt(0.5);
  };
  const depts = assessment.settings.public.departments || [];
  const deptShift = depts.map(() => (r() - 0.5) * 0.9);
  for (let i = 0; i < n; i++) {
    const answers = {}, timings = {}, meta = {};
    const person = gauss() * 0.45; // kişinin genel tutumu
    const kind = r() < 0.06 ? 'straight' : r() < 0.05 ? 'speeder' : 'normal';
    // demografi
    for (const f of mod.meta || []) {
      if (f.key === 'group') meta.group = r() < 0.15 ? 'mgmt' : r() < 0.55 ? 'blue' : 'white';
      else if (f.key === 'department' && depts.length) meta.department = depts[Math.floor(r() ** 1.3 * depts.length)];
      else if (f.options) meta[f.key] = f.options[Math.floor(r() * f.options.length)].v;
    }
    const mgmtBoost = meta.group === 'mgmt' ? 0.32 : 0;
    const dIdx = depts.indexOf(meta.department);
    const dShift = dIdx >= 0 ? deptShift[dIdx] : 0;
    const fixed = 1 + Math.floor(r() * 5);
    for (const it of mod.items) {
      let lat = (prof[it.dim] ?? 3) + person + mgmtBoost + dShift + (it.scen ? SCEN_SHIFT[it.scen] || 0 : 0) + gauss() * 0.75;
      let raw = clamp(Math.round(lat), 1, 5);
      if (it.rev) raw = 6 - raw;
      if (kind === 'straight') raw = fixed;
      answers[it.id] = raw;
      timings[it.id] = kind === 'speeder' ? 0.8 + r() * 0.6 : 3 + r() * 9;
    }
    if (mod.attention) answers[mod.attention.id] = kind === 'normal' ? (r() < 0.97 ? 2 : 4) : kind === 'straight' ? fixed : 4;
    for (const e of mod.extras || []) {
      if (e.type === 'nps' || e.type === 'scale10') {
        const base = (prof.engagement ?? prof.purpose ?? 3.2) + person + mgmtBoost;
        answers[e.id] = clamp(Math.round((base - 1) * 2.4 + 1.3 + gauss() * 1.6), 0, 10);
      } else if (e.type === 'choice') {
        const w = [0.38, 0.32, 0.14, 0.16];
        let x = r(), k = 0;
        while (k < w.length - 1 && x > w[k]) x -= w[k++];
        answers[e.id] = e.options[k].v;
      } else if (e.type === 'rate5') {
        const base = e.id.startsWith('lik_') ? { eco: 3.9, tech: 3.2, reg: 3.6 }[e.scen] : { eco: 4.1, tech: 3.7, reg: 3.1 }[e.scen];
        answers[e.id] = clamp(Math.round(base + gauss() * 0.7), 1, 5);
      } else if (e.type === 'rank') {
        const pr = assessment.settings.public.priorities || [];
        const weights = pr.map((_, k) => (k === 1 ? 3.2 : k === 0 ? 2.4 : k === 2 ? 1.8 : k === 4 ? 1.4 : 1));
        const picks = new Set();
        while (picks.size < Math.min(3, pr.length)) {
          let x = r() * weights.reduce((s, v) => s + v, 0), k = 0;
          while (x > weights[k]) x -= weights[k++];
          picks.add(k);
        }
        answers[e.id] = [...picks];
      } else if (e.type === 'text' && r() < 0.22) {
        answers[e.id] = pickText(moduleKey, e.id, r);
      }
    }
    // gerçekte bölüm ortalamasına yakın durması için yönetici tavsiye skorunu yükselt
    const dur = Object.values(timings).reduce((s, v) => s + v, 0) + 40;
    out.push({ id: uid(), assessment_id: assessment.id, answers, meta, timings, duration_sec: Math.round(dur), created_at: new Date(Date.now() - (n - i) * 3.6e6 * (2 + r() * 6)).toISOString() });
  }
  return out;
}

const TEXTS = {
  tr: {
    isletme: { open_change: ['Departmanlar arası iletişim çok zayıf, bilgi geç geliyor.', 'Fazla mesai artık normal kabul ediliyor.', 'Eğitimler sadece kâğıt üzerinde kalıyor.', 'Makinelerin bakımı aksıyor, arızalar uzun sürüyor.', 'Kararların gerekçesi hiç anlatılmıyor.'], open_strength: ['Ekip arkadaşlarım birbirine destek oluyor.', 'İş güvenliğine gerçekten önem veriliyor.', 'Kalite konusunda iddialıyız.'] },
    guven: { open_trust: ['Verilen sözler tutulsun.', 'Terfi kriterleri açıkça yazılsın.', 'Hata yapınca suçlu aranmasın.', 'Kararlar bize son anda söylenmesin.'] },
    stres: { open_stress: ['Aynı anda gelen acil işler.', 'Mesai sonrası gelen mesajlar.', 'Habersiz yapılan değişiklikler.', 'Personel eksikliği yüzünden iş yükü.'] },
    toplanti: { open_next: ['Gündem en az bir gün önce paylaşılsın.', 'Karar ve aksiyonlar sonda özetlensin.', 'Süre 45 dakikayla sınırlansın.'] },
    vizyon: { open_msg: ['Önümüzdeki yılın gerçek öncelikleri neler?', 'Hedeflerin neden sık değiştiği.', 'Şirketin finansal durumu.'] },
    senaryo: {},
  },
  en: {
    isletme: { open_change: ['Cross-department communication is weak; information arrives late.', 'Overtime is now considered normal.', 'Training stays on paper.', 'Machine maintenance lags and breakdowns take long.', 'Decisions are never explained.'], open_strength: ['Colleagues support each other.', 'Safety genuinely matters here.', 'We are ambitious about quality.'] },
    guven: { open_trust: ['Keep the promises you make.', 'Write down promotion criteria clearly.', "Don't look for someone to blame after a mistake.", "Don't tell us about decisions at the last minute."] },
    stres: { open_stress: ['Urgent tasks arriving all at once.', 'Messages after working hours.', 'Changes made without notice.', 'Workload due to understaffing.'] },
    toplanti: { open_next: ['Share the agenda at least a day ahead.', 'Summarise decisions and actions at the end.', 'Cap the meeting at 45 minutes.'] },
    vizyon: { open_msg: ["What are next year's real priorities?", 'Why goals change so often.', "The company's financial situation."] },
    senaryo: {},
  },
};
function pickText(mk, id, r) {
  const arr = TEXTS[getLang()][mk]?.[id];
  return arr ? arr[Math.floor(r() * arr.length)] : undefined;
}

// Örnek İK adayı — cevap anahtarı olmadan sunucu puanları sentetik üretilir
function demoCandidate(seed) {
  const r = rng(seed * 104729);
  const answers = {};
  const target = { O: 3.9, C: 4.1, E: 3.3, A: 3.6, S: 3.4, H: 4.0 };
  for (const it of PERS) {
    let v = it.dim === '_sd' ? 2 + Math.round(r()) : clamp(Math.round(target[it.dim] + (r() - 0.5) * 1.6), 1, 5);
    if (it.rev) v = 6 - v;
    answers[it.id] = v;
  }
  COG.forEach((q) => (answers[q.id] = Math.floor(r() * 4)));
  SJT.forEach((q) => (answers[q.id] = Math.floor(r() * 4)));
  const resp = {
    id: uid(), assessment_id: 'demo-ik', answers, meta: { cog_seconds: 14 * 60 + 12 }, timings: {}, duration_sec: 31 * 60,
    server_scores: { cog: { num: 83, verbal: 67, logic: 83, pattern: 50 }, sjt: 78 },
    created_at: new Date(Date.now() - 2 * 864e5).toISOString(),
  };
  return resp;
}

// İK modül sayfası için örnek aday listesi
export function demoCandidates(n = 6) {
  const names = ['A. Yılmaz', 'B. Kaya', 'C. Demir', 'D. Şahin', 'E. Çelik', 'F. Aydın'];
  return names.slice(0, n).map((nm, i) => {
    const r = demoCandidate(i + 3);
    r.server_scores = { cog: { num: 40 + ((i * 17) % 55), verbal: 50 + ((i * 23) % 45), logic: 35 + ((i * 29) % 60), pattern: 45 + ((i * 13) % 50) }, sjt: 50 + ((i * 19) % 45) };
    return { name: nm, resp: r, score: scoreCandidate(r, { public: { family: 'manager' } }) };
  });
}
