// Küçük, bağımlılıksız yardımcılar
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ESC[c]);

// Basit şablon: html`...${x}...` → x otomatik kaçışlanır; raw() ile işaretlenenler kaçışlanmaz
const RAW = Symbol('raw');
export const raw = (s) => ({ [RAW]: true, s: String(s ?? '') });
export function html(strings, ...vals) {
  let out = '';
  strings.forEach((s, i) => {
    out += s;
    if (i < vals.length) out += fmtVal(vals[i]);
  });
  return raw(out);
}
function fmtVal(v) {
  if (v == null || v === false) return '';
  if (Array.isArray(v)) return v.map(fmtVal).join('');
  if (typeof v === 'object' && v[RAW]) return v.s;
  return esc(v);
}
export const toStr = (r) => (r && r[RAW] ? r.s : esc(r));

export function mount(el, content) {
  el.innerHTML = toStr(content);
  return el;
}

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const round = (v, d = 0) => {
  if (v == null || Number.isNaN(v)) return null;
  const p = 10 ** d;
  return Math.round(v * p) / p;
};
export const sum = (arr) => arr.reduce((a, b) => a + b, 0);
export const mean = (arr) => (arr.length ? sum(arr) / arr.length : null);
export function sd(arr) {
  if (arr.length < 2) return 0;
  const m = mean(arr);
  return Math.sqrt(sum(arr.map((x) => (x - m) ** 2)) / (arr.length - 1));
}
export function median(arr) {
  if (!arr.length) return null;
  const s = [...arr].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
export function pearson(x, y) {
  const n = Math.min(x.length, y.length);
  if (n < 3) return null;
  const mx = mean(x), my = mean(y);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - mx) * (y[i] - my);
    dx += (x[i] - mx) ** 2;
    dy += (y[i] - my) ** 2;
  }
  if (!dx || !dy) return null;
  return num / Math.sqrt(dx * dy);
}

export const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : 'x' + Math.random().toString(36).slice(2) + Date.now().toString(36));

export function debounce(fn, ms = 200) {
  let t;
  return (...a) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...a), ms);
  };
}

export const store = {
  get(k, d = null) {
    try {
      const v = localStorage.getItem(k);
      return v == null ? d : JSON.parse(v);
    } catch {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },
  del(k) {
    try {
      localStorage.removeItem(k);
    } catch {}
  },
};

// Deterministik sözde rastgele (örnek veri üretimi için)
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return (s >>> 0) / 4294967296;
  };
}

export function normalizePhone(input) {
  let d = String(input || '').replace(/[^\d+]/g, '');
  if (!d) return '';
  if (d.startsWith('+')) return d;
  if (d.startsWith('00')) return '+' + d.slice(2);
  if (d.startsWith('0')) d = d.slice(1);
  if (d.length === 10 && d.startsWith('5')) return '+90' + d;
  if (d.startsWith('90') && d.length === 12) return '+' + d;
  return '+' + d;
}
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim());
export const isPhone = (v) => /^\+\d{10,15}$/.test(normalizePhone(v));

export function fmtDate(iso, lang = 'tr') {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'tr-TR', { day: '2-digit', month: 'short', year: 'numeric' });
}
export function fmtNum(v, lang = 'tr', d = 0) {
  if (v == null || Number.isNaN(v)) return '—';
  return Number(v).toLocaleString(lang === 'en' ? 'en-US' : 'tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });
}
export function fmtDuration(sec, lang = 'tr') {
  if (sec == null) return '—';
  const m = Math.floor(sec / 60), s = Math.round(sec % 60);
  return lang === 'en' ? `${m}m ${s}s` : `${m} dk ${s} sn`;
}

export function downloadText(filename, text, type = 'text/csv;charset=utf-8') {
  const blob = new Blob(['﻿' + text], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 500);
}

export function deviceToken() {
  let t = store.get('apx.device');
  if (!t) {
    t = uid();
    store.set('apx.device', t);
  }
  return t;
}
