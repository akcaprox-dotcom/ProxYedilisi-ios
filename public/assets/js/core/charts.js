// Bağımlılıksız SVG grafikler — koyu tema + baskı (açık) temasında renkleri CSS değişkenlerinden alır
import { esc, round, clamp } from './util.js';
import { band } from './engine.js';
import { getLang } from './i18n.js';

const f0 = (v) => (v == null ? '—' : Math.round(v));
const num = (v, d = 0) => (v == null ? '—' : Number(v).toLocaleString(getLang() === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: d, minimumFractionDigits: d }));
const P = (v) => (getLang() === 'en' ? Math.round(v) + '%' : '%' + Math.round(v));
const bandColor = (v) => band(v)?.color || 'var(--ink-3)';

// Uzun etiketleri satırlara böl
function wrap(text, max = 14) {
  const words = String(text).split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = (cur + ' ' + w).trim();
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

// ---------------------------------------------------------------- GAUGE
export function gauge(value, { label = '', sub = '', size = 220, invert = false } = {}) {
  const v = value == null ? 0 : clamp(value, 0, 100);
  const shown = invert ? 100 - v : v;
  const r = 84, cx = 110, cy = 104, sw = 14;
  const a0 = Math.PI, a = Math.PI * (1 - v / 100);
  const pt = (ang, rr = r) => [cx + rr * Math.cos(ang), cy - rr * Math.sin(ang)];
  const [x0, y0] = pt(a0), [x1, y1] = pt(0), [xv, yv] = pt(a);
  const ticks = [40, 55, 70, 85].map((t) => {
    const ang = Math.PI * (1 - t / 100);
    const [a1, b1] = pt(ang, r - sw / 2 - 3), [a2, b2] = pt(ang, r + sw / 2 + 3);
    return `<line x1="${a1}" y1="${b1}" x2="${a2}" y2="${b2}" stroke="var(--bg-0)" stroke-width="2"/>`;
  }).join('');
  const col = invert ? bandColor(100 - shown) : bandColor(v);
  return `<svg class="chart gauge" viewBox="0 0 220 150" style="max-width:${size}px" role="img" aria-label="${esc(label)} ${f0(shown)}">
    <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="var(--c-critical)"/><stop offset=".45" stop-color="var(--c-develop)"/><stop offset="1" stop-color="var(--c-excellent)"/></linearGradient></defs>
    <path d="M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}" fill="none" stroke="var(--line)" stroke-width="${sw}" stroke-linecap="round"/>
    <path d="M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}" fill="none" stroke="url(#gg)" stroke-opacity=".22" stroke-width="${sw}" stroke-linecap="round"/>
    ${value == null ? '' : `<path d="M${x0} ${y0} A${r} ${r} 0 0 1 ${xv} ${yv}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"/>`}
    ${ticks}
    ${value == null ? '' : `<circle cx="${xv}" cy="${yv}" r="6" fill="var(--bg-0)" stroke="${col}" stroke-width="3"/>`}
    <text x="110" y="98" text-anchor="middle" class="g-val" fill="var(--ink)">${f0(shown)}</text>
    <text x="110" y="122" text-anchor="middle" class="g-lbl" fill="var(--ink-2)">${esc(label)}</text>
    ${sub ? `<text x="110" y="140" text-anchor="middle" class="g-sub" fill="${col}">${esc(sub)}</text>` : ''}
  </svg>`;
}

// ---------------------------------------------------------------- RADAR
export function radar(labels, series, { size = 420, max = 100 } = {}) {
  const n = labels.length;
  if (n < 3) return '';
  const W = size, H = size, cx = W / 2, cy = H / 2, R = size * 0.32;
  const ang = (i) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const pt = (i, v) => [cx + R * (v / max) * Math.cos(ang(i)), cy + R * (v / max) * Math.sin(ang(i))];
  let g = '';
  [20, 40, 60, 80, 100].forEach((lv) => {
    const p = labels.map((_, i) => pt(i, lv).join(',')).join(' ');
    g += `<polygon points="${p}" fill="none" stroke="var(--line)" stroke-width="${lv === 100 ? 1.2 : 0.7}"/>`;
  });
  labels.forEach((_, i) => {
    const [x, y] = pt(i, 100);
    g += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="var(--line)" stroke-width=".7"/>`;
  });
  [40, 70].forEach((lv) => {
    const [x, y] = pt(0, lv);
    g += `<text x="${x + 4}" y="${y - 2}" class="ax" fill="var(--ink-3)">${lv}</text>`;
  });
  series.forEach((s, si) => {
    const p = s.values.map((v, i) => pt(i, v ?? 0).join(',')).join(' ');
    g += `<polygon points="${p}" fill="${s.color}" fill-opacity="${si === 0 ? 0.18 : 0.08}" stroke="${s.color}" stroke-width="2" ${s.dash ? 'stroke-dasharray="5 4"' : ''}/>`;
    s.values.forEach((v, i) => {
      if (v == null) return;
      const [x, y] = pt(i, v);
      g += `<circle cx="${x}" cy="${y}" r="3.2" fill="${s.color}"><title>${esc(labels[i])}: ${f0(v)}</title></circle>`;
    });
  });
  labels.forEach((l, i) => {
    const [x, y] = pt(i, 122);
    const c = Math.cos(ang(i));
    const anchor = Math.abs(c) < 0.25 ? 'middle' : c > 0 ? 'start' : 'end';
    const lines = wrap(l, 16);
    const dy = y - ((lines.length - 1) * 13) / 2 + 4;
    g += `<text x="${x}" y="${dy}" text-anchor="${anchor}" class="lbl" fill="var(--ink-2)">${lines.map((ln, k) => `<tspan x="${x}" dy="${k ? 13 : 0}">${esc(ln)}</tspan>`).join('')}</text>`;
    const v = series[0]?.values[i];
    if (v != null) {
      const [vx, vy] = pt(i, 108);
      g += `<text x="${vx}" y="${vy + 4}" text-anchor="middle" class="val" fill="${bandColor(v)}">${f0(v)}</text>`;
    }
  });
  const legend = series.length > 1
    ? `<div class="legend">${series.map((s) => `<span><i style="background:${s.color}"></i>${esc(s.name)}</span>`).join('')}</div>` : '';
  return `<svg class="chart radar" viewBox="-40 0 ${W + 80} ${H}" role="img">${g}</svg>${legend}`;
}

// ---------------------------------------------------------------- BAR LIST (bantlı yatay çubuklar)
export function barList(rows, { showCi = true, unit = '' } = {}) {
  return `<div class="barlist">${rows.map((r) => {
    const v = r.value;
    const col = r.color || bandColor(v);
    const ci = showCi && r.ci ? `<span class="ci" style="left:${r.ci[0]}%;width:${Math.max(0.5, r.ci[1] - r.ci[0])}%"></span>` : '';
    return `<div class="bl-row">
      <div class="bl-lbl">${esc(r.label)}${r.sub ? `<small>${esc(r.sub)}</small>` : ''}</div>
      <div class="bl-track">
        <span class="bl-band" style="left:40%"></span><span class="bl-band" style="left:55%"></span><span class="bl-band" style="left:70%"></span><span class="bl-band" style="left:85%"></span>
        ${v == null ? '' : `<span class="bl-fill" style="width:${clamp(v, 0, 100)}%;background:${col}"></span>`}${ci}
        ${r.marker != null ? `<span class="bl-mark" style="left:${clamp(r.marker, 0, 100)}%" title="${esc(r.markerLabel || '')}"></span>` : ''}
      </div>
      <div class="bl-val" style="color:${col}">${v == null ? '—' : num(v, 0) + unit}</div>
    </div>`;
  }).join('')}</div>`;
}

// ---------------------------------------------------------------- OLUMLU / NÖTR / OLUMSUZ
export function favStack(rows, { labels = ['Olumsuz', 'Nötr', 'Olumlu'] } = {}) {
  return `<div class="fav">
    <div class="fav-legend"><span><i class="u"></i>${esc(labels[0])}</span><span><i class="n"></i>${esc(labels[1])}</span><span><i class="f"></i>${esc(labels[2])}</span></div>
    ${rows.map((r) => `<div class="fav-row">
      <div class="fav-lbl">${esc(r.label)}</div>
      <div class="fav-bar">
        <span class="u" style="width:${r.unf}%">${r.unf >= 8 ? Math.round(r.unf) : ''}</span><span class="n" style="width:${r.neu}%">${r.neu >= 8 ? Math.round(r.neu) : ''}</span><span class="f" style="width:${r.fav}%">${r.fav >= 8 ? Math.round(r.fav) : ''}</span>
      </div></div>`).join('')}
  </div>`;
}

// ---------------------------------------------------------------- ISI HARİTASI
export function heatmap(rowLabels, colLabels, matrix, { rowNotes = [], hiddenText = '' } = {}) {
  return `<div class="heat-wrap"><table class="heat">
    <thead><tr><th></th>${colLabels.map((c) => `<th><span>${esc(c)}</span></th>`).join('')}</tr></thead>
    <tbody>${rowLabels.map((r, i) => `<tr><th>${esc(r)}${rowNotes[i] ? `<small>${esc(rowNotes[i])}</small>` : ''}</th>${
      matrix[i] == null
        ? `<td colspan="${colLabels.length}" class="hid">${esc(hiddenText)}</td>`
        : matrix[i].map((v) => `<td style="--h:${v == null ? 'transparent' : bandColor(v)}" class="${v == null ? 'na' : ''}"><b>${v == null ? '—' : f0(v)}</b></td>`).join('')
    }</tr>`).join('')}</tbody></table></div>`;
}

// ---------------------------------------------------------------- ETKİ MATRİSİ (önem × performans)
export function quadrant(points, { xLabel = 'Puan', yLabel = 'Etki', medY = 0.3, names = {} } = {}) {
  const W = 520, H = 360, pl = 48, pr = 20, pt = 20, pb = 44;
  const maxY = Math.max(0.6, ...points.map((p) => p.y)) * 1.1;
  const X = (v) => pl + ((clamp(v, 0, 100)) / 100) * (W - pl - pr);
  const Y = (v) => H - pb - (clamp(v, 0, maxY) / maxY) * (H - pt - pb);
  const xm = X(70), ym = Y(medY);
  let g = `
    <rect x="${pl}" y="${pt}" width="${xm - pl}" height="${ym - pt}" fill="var(--c-critical)" fill-opacity=".08"/>
    <rect x="${xm}" y="${pt}" width="${W - pr - xm}" height="${ym - pt}" fill="var(--c-excellent)" fill-opacity=".07"/>
    <line x1="${xm}" y1="${pt}" x2="${xm}" y2="${H - pb}" stroke="var(--line-2)" stroke-dasharray="4 4"/>
    <line x1="${pl}" y1="${ym}" x2="${W - pr}" y2="${ym}" stroke="var(--line-2)" stroke-dasharray="4 4"/>
    <line x1="${pl}" y1="${H - pb}" x2="${W - pr}" y2="${H - pb}" stroke="var(--line-2)"/>
    <line x1="${pl}" y1="${pt}" x2="${pl}" y2="${H - pb}" stroke="var(--line-2)"/>
    <text x="${pl + 8}" y="${pt + 16}" class="q-name" fill="var(--c-critical)">${esc(names.priority || '')}</text>
    <text x="${W - pr - 8}" y="${pt + 16}" text-anchor="end" class="q-name" fill="var(--c-excellent)">${esc(names.protect || '')}</text>
    <text x="${pl + 8}" y="${H - pb - 8}" class="q-name" fill="var(--ink-3)">${esc(names.monitor || '')}</text>
    <text x="${W - pr - 8}" y="${H - pb - 8}" text-anchor="end" class="q-name" fill="var(--ink-3)">${esc(names.maintain || '')}</text>
    <text x="${(W + pl) / 2}" y="${H - 8}" text-anchor="middle" class="ax" fill="var(--ink-3)">${esc(xLabel)} →</text>
    <text x="14" y="${(H - pb + pt) / 2}" text-anchor="middle" class="ax" fill="var(--ink-3)" transform="rotate(-90 14 ${(H - pb + pt) / 2})">${esc(yLabel)} →</text>`;
  [0, 25, 50, 75, 100].forEach((v) => (g += `<text x="${X(v)}" y="${H - pb + 16}" text-anchor="middle" class="ax" fill="var(--ink-3)">${v}</text>`));
  // etiket çakışmalarını basitçe azalt
  const placed = [];
  points.forEach((p) => {
    const x = X(p.x), y = Y(p.y);
    const right = x < W - 130;
    const lx = right ? x + 11 : x - 11;
    let ly = y + 4;
    let k = 0;
    while (placed.some((q) => q.right === right && Math.abs(q.x - lx) < 80 && Math.abs(q.y - ly) < 13) && k++ < 12) ly += k % 2 ? 13 * k : -13 * k;
    placed.push({ x: lx, y: ly, right });
    g += `<circle cx="${x}" cy="${y}" r="7" fill="${bandColor(p.x)}" stroke="var(--bg-0)" stroke-width="2"><title>${esc(p.label)} · ${f0(p.x)} · r=${round(p.y, 2)}</title></circle>
      <text x="${lx}" y="${ly}" text-anchor="${right ? 'start' : 'end'}" class="q-pt" fill="var(--ink)">${esc(p.short || p.label)}</text>`;
  });
  return `<svg class="chart quad" viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
}

// ---------------------------------------------------------------- HİSTOGRAM
export function histogram(bins, { xLabel = '' } = {}) {
  const W = 520, H = 200, pl = 30, pr = 10, pt = 14, pb = 34;
  const max = Math.max(1, ...bins);
  const bw = (W - pl - pr) / bins.length;
  let g = '';
  bins.forEach((c, i) => {
    const h = ((H - pt - pb) * c) / max;
    const x = pl + i * bw + 3, y = H - pb - h;
    g += `<rect x="${x}" y="${y}" width="${bw - 6}" height="${h}" rx="3" fill="${bandColor(i * 10 + 5)}" fill-opacity=".85"><title>${i * 10}–${i * 10 + 10}: ${c}</title></rect>`;
    if (c) g += `<text x="${x + (bw - 6) / 2}" y="${y - 4}" text-anchor="middle" class="ax" fill="var(--ink-2)">${c}</text>`;
    g += `<text x="${pl + i * bw}" y="${H - pb + 14}" text-anchor="middle" class="ax" fill="var(--ink-3)">${i * 10}</text>`;
  });
  g += `<text x="${W - pr}" y="${H - pb + 14}" text-anchor="end" class="ax" fill="var(--ink-3)">100</text>`;
  g += `<line x1="${pl}" y1="${H - pb}" x2="${W - pr}" y2="${H - pb}" stroke="var(--line-2)"/>`;
  if (xLabel) g += `<text x="${(W + pl) / 2}" y="${H - 4}" text-anchor="middle" class="ax" fill="var(--ink-3)">${esc(xLabel)}</text>`;
  return `<svg class="chart hist" viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
}

// ---------------------------------------------------------------- TREND
export function trend(points, { yLabel = '' } = {}) {
  if (points.length < 2) return '';
  const W = 560, H = 220, pl = 34, pr = 16, pt = 16, pb = 46;
  const X = (i) => pl + (i / (points.length - 1)) * (W - pl - pr);
  const Y = (v) => H - pb - (clamp(v, 0, 100) / 100) * (H - pt - pb);
  let g = '';
  [0, 40, 55, 70, 85, 100].forEach((v) => (g += `<line x1="${pl}" x2="${W - pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="var(--line)" stroke-width=".7"/><text x="${pl - 6}" y="${Y(v) + 3}" text-anchor="end" class="ax" fill="var(--ink-3)">${v}</text>`));
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${X(i)},${Y(p.value)}`).join(' ');
  g += `<path d="${d}" fill="none" stroke="var(--cyan)" stroke-width="2.5"/>`;
  points.forEach((p, i) => {
    g += `<circle cx="${X(i)}" cy="${Y(p.value)}" r="5" fill="${bandColor(p.value)}" stroke="var(--bg-0)" stroke-width="2"><title>${esc(p.label)}: ${f0(p.value)}</title></circle>
      <text x="${X(i)}" y="${Y(p.value) - 10}" text-anchor="middle" class="val" fill="var(--ink)">${f0(p.value)}</text>
      <text x="${X(i)}" y="${H - pb + 16}" text-anchor="middle" class="ax" fill="var(--ink-3)">${esc(String(p.label).slice(0, 14))}</text>`;
  });
  return `<svg class="chart trend" viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
}

// ---------------------------------------------------------------- eNPS ÇUBUĞU
export function npsBar(e, { labels = ['Kötüleyen', 'Pasif', 'Destekçi'] } = {}) {
  return `<div class="nps">
    <div class="nps-bar"><span class="d" style="width:${e.det}%"></span><span class="p" style="width:${e.pas}%"></span><span class="s" style="width:${e.pro}%"></span></div>
    <div class="nps-leg"><span><i class="d"></i>${esc(labels[0])} ${P(e.det)}</span><span><i class="p"></i>${esc(labels[1])} ${P(e.pas)}</span><span><i class="s"></i>${esc(labels[2])} ${P(e.pro)}</span></div>
  </div>`;
}

// ---------------------------------------------------------------- PROFİL (hedef aralıklı)
export function profileRanges(rows) {
  return `<div class="prof">${rows.map((r) => {
    const inRange = r.value >= r.range[0] && r.value <= r.range[1];
    return `<div class="prof-row">
      <div class="prof-lbl">${esc(r.label)}<small>${esc(r.low)} ↔ ${esc(r.high)}</small></div>
      <div class="prof-track">
        <span class="prof-range" style="left:${r.range[0]}%;width:${r.range[1] - r.range[0]}%"></span>
        <span class="prof-dot ${inRange ? 'in' : 'out'}" style="left:${clamp(r.value, 0, 100)}%"></span>
      </div>
      <div class="prof-val ${inRange ? 'in' : 'out'}">${f0(r.value)}</div>
    </div>`;
  }).join('')}</div>`;
}

// ---------------------------------------------------------------- RİSK MATRİSİ (olasılık × etki)
export function riskMatrix(points, { xLabel = 'Olasılık', yLabel = 'Etki' } = {}) {
  const W = 420, H = 360, pl = 50, pr = 16, pt = 16, pb = 48;
  const X = (v) => pl + ((v - 1) / 4) * (W - pl - pr);
  const Y = (v) => H - pb - ((v - 1) / 4) * (H - pt - pb);
  let g = '';
  const cw = (W - pl - pr) / 5, ch = (H - pt - pb) / 5;
  for (let i = 0; i < 5; i++)
    for (let j = 0; j < 5; j++) {
      const sev = (i + 1) * (j + 1);
      const c = sev >= 15 ? 'var(--c-critical)' : sev >= 8 ? 'var(--c-develop)' : 'var(--c-strong)';
      g += `<rect x="${pl + i * cw - cw / 2 + cw / 2}" y="${pt + (4 - j) * ch}" width="${cw}" height="${ch}" fill="${c}" fill-opacity=".10" stroke="var(--bg-0)"/>`;
    }
  for (let i = 1; i <= 5; i++) {
    g += `<text x="${pl + (i - 0.5) * cw}" y="${H - pb + 16}" text-anchor="middle" class="ax" fill="var(--ink-3)">${i}</text>`;
    g += `<text x="${pl - 8}" y="${pt + (5 - i + 0.5) * ch + 4}" text-anchor="end" class="ax" fill="var(--ink-3)">${i}</text>`;
  }
  g += `<text x="${(W + pl) / 2}" y="${H - 10}" text-anchor="middle" class="ax" fill="var(--ink-3)">${esc(xLabel)} →</text>
        <text x="14" y="${(H - pb + pt) / 2}" text-anchor="middle" class="ax" fill="var(--ink-3)" transform="rotate(-90 14 ${(H - pb + pt) / 2})">${esc(yLabel)} →</text>`;
  points.forEach((p) => {
    const x = pl + (p.x - 0.5) * cw, y = pt + (5 - p.y + 0.5) * ch;
    const r = 10 + (p.size ?? 0.5) * 22;
    g += `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.color}" fill-opacity=".35" stroke="${p.color}" stroke-width="2"><title>${esc(p.label)}</title></circle>
      <text x="${x}" y="${y + 4}" text-anchor="middle" class="q-pt" fill="var(--ink)">${esc(p.short)}</text>`;
  });
  return `<svg class="chart risk" viewBox="0 0 ${W} ${H}" role="img">${g}</svg>`;
}

// ---------------------------------------------------------------- KÜÇÜK ÇİZGİ (sparkline)
export function spark(values, { w = 90, h = 26 } = {}) {
  const v = values.filter((x) => x != null);
  if (v.length < 2) return '';
  const X = (i) => (i / (v.length - 1)) * (w - 4) + 2;
  const Y = (x) => h - 2 - (clamp(x, 0, 100) / 100) * (h - 4);
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><path d="${v.map((x, i) => `${i ? 'L' : 'M'}${X(i)},${Y(x)}`).join(' ')}" fill="none" stroke="var(--cyan)" stroke-width="1.6"/></svg>`;
}

export { bandColor, num, f0 };
