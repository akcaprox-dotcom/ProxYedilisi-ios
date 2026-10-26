import { esc, html, toStr, $ } from './util.js';
import { t, T } from './i18n.js';

// ------------------------------------------------------------ ICONS (24×24, stroke)
const P = {
  shield: '<path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z"/>',
  clipboard: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4.5h6V3H9z"/><path d="M9 13l2 2 4-4"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  fork: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M6 7v2a3 3 0 003 3h6a3 3 0 003-3V7M12 12v5"/>',
  pulse: '<path d="M3 12h4l2-5 4 10 2-5h6"/>',
  chat: '<path d="M5 5h14a1 1 0 011 1v10a1 1 0 01-1 1H10l-5 4v-4H5a1 1 0 01-1-1V6a1 1 0 011-1z"/>',
  orbit: '<path d="M20 12a8 8 0 01-14 5.3M4 12a8 8 0 0114-5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  logout: '<path d="M15 4h3a2 2 0 012 2v12a2 2 0 01-2 2h-3M10 17l5-5-5-5M15 12H4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>',
  download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  print: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  next: '<path d="M9 6l6 6-6 6"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  building: '<path d="M4 21V5a1 1 0 011-1h9a1 1 0 011 1v16M15 9h4a1 1 0 011 1v11M3 21h18M8 8h3M8 12h3M8 16h3"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
  link: '<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  play: '<path d="M8 5l11 7-11 7z"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14 9l2 2"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5M16 4.5a3.5 3.5 0 010 7M18 14.5c2 .7 3.2 2.6 3.7 5.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M6 18l2.5-2.5M15.5 8.5L18 6"/>',
};
export const icon = (name, cls = '') =>
  `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ''}</svg>`;

// ------------------------------------------------------------ TOAST
export function toast(msg, kind = '') {
  let box = $('.toasts');
  if (!box) {
    box = document.createElement('div');
    box.className = 'toasts';
    box.setAttribute('role', 'status');
    document.body.appendChild(box);
  }
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.textContent = msg;
  box.appendChild(el);
  setTimeout(() => el.remove(), kind === 'err' ? 5200 : 3400);
}

// ------------------------------------------------------------ SHEET (modal)
export function sheet(content, { onClose, wide = false } = {}) {
  const bg = document.createElement('div');
  bg.className = 'sheet-bg';
  bg.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" style="${wide ? 'width:min(860px,100%)' : ''}">
    <button class="btn ghost icon-btn x" aria-label="${esc(T('close'))}">${icon('x')}</button>
    <div class="sheet-body">${toStr(content)}</div></div>`;
  const close = () => {
    bg.remove();
    document.removeEventListener('keydown', onKey);
    onClose && onClose();
  };
  const onKey = (e) => e.key === 'Escape' && close();
  bg.addEventListener('click', (e) => e.target === bg && close());
  bg.querySelector('.x').onclick = close;
  document.addEventListener('keydown', onKey);
  document.body.appendChild(bg);
  return { el: bg.querySelector('.sheet-body'), close };
}

export function confirmBox(title, body, { okText = T('delete'), danger = true, requireText = null } = {}) {
  return new Promise((res) => {
    const s = sheet(html`<h3>${title}</h3><p class="muted">${body}</p>
      ${requireText ? html`<label class="field"><span>${t(`Onaylamak için "${requireText}" yazın`, `Type "${requireText}" to confirm`)}</span><input class="input" id="cf-txt" autocomplete="off"></label>` : ''}
      <div class="row end"><button class="btn" id="cf-no">${T('cancel')}</button><button class="btn ${danger ? 'danger' : 'primary'}" id="cf-ok" ${requireText ? 'disabled' : ''}>${okText}</button></div>`,
      { onClose: () => res(false) });
    const ok = s.el.querySelector('#cf-ok');
    if (requireText) s.el.querySelector('#cf-txt').oninput = (e) => (ok.disabled = e.target.value.trim() !== requireText);
    s.el.querySelector('#cf-no').onclick = () => { s.close(); };
    ok.onclick = () => { res(true); s.el.closest('.sheet-bg').remove(); };
  });
}

export const loader = () => '<div class="loader"><i></i></div>';

// ------------------------------------------------------------ QR
export function qrSvg(text) {
  if (!window.qrcode) return '';
  const q = window.qrcode(0, 'M');
  q.addData(text);
  q.make();
  return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true });
}

// ------------------------------------------------------------ PASSWORD UI
export function pwStrength(pw) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[a-zçğıöşü]/.test(pw) && /[A-ZÇĞİÖŞÜ]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^\w\sçğıöşüÇĞİÖŞÜ]/.test(pw)) s++;
  return Math.min(4, s);
}
export function bindPw(root) {
  root.querySelectorAll('.pw-wrap').forEach((w) => {
    const inp = w.querySelector('input');
    const b = w.querySelector('button');
    b.onclick = () => {
      inp.type = inp.type === 'password' ? 'text' : 'password';
      b.textContent = inp.type === 'password' ? t('göster', 'show') : t('gizle', 'hide');
    };
  });
  const meter = root.querySelector('.pw-meter i');
  const main = root.querySelector('input[data-meter]');
  if (meter && main)
    main.addEventListener('input', () => {
      const s = pwStrength(main.value);
      const cols = ['var(--c-critical)', 'var(--c-risk)', 'var(--c-develop)', 'var(--c-strong)', 'var(--c-excellent)'];
      meter.style.width = (s + 1) * 20 + '%';
      meter.style.background = cols[s];
    });
}
export const pwField = (id, label, { meter = false, auto = 'current-password' } = {}) => html`
  <label class="field"><span>${label}</span>
    <div class="pw-wrap"><input class="input" type="password" id="${id}" autocomplete="${auto}" ${meter ? 'data-meter' : ''} minlength="8" required><button type="button">${t('göster', 'show')}</button></div>
    ${meter ? html`<div class="pw-meter"><i></i></div><small>${t('En az 8 karakter; harf ve rakam karıştırın.', 'At least 8 characters; mix letters and numbers.')}</small>` : ''}
  </label>`;

// 6 haneli OTP kutuları
export const otpField = () => `<div class="otp">${Array.from({ length: 6 }, (_, i) => `<input inputmode="numeric" maxlength="1" aria-label="${i + 1}" autocomplete="${i === 0 ? 'one-time-code' : 'off'}">`).join('')}</div>`;
export function bindOtp(root, onDone) {
  const ins = [...root.querySelectorAll('.otp input')];
  const val = () => ins.map((i) => i.value).join('');
  ins.forEach((inp, i) => {
    inp.addEventListener('input', () => {
      const v = inp.value.replace(/\D/g, '');
      if (v.length > 1) {
        v.split('').slice(0, 6).forEach((c, k) => ins[k] && (ins[k].value = c));
        ins[Math.min(5, v.length - 1)].focus();
      } else {
        inp.value = v;
        if (v && ins[i + 1]) ins[i + 1].focus();
      }
      if (val().length === 6) onDone && onDone(val());
    });
    inp.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !inp.value && ins[i - 1]) ins[i - 1].focus();
    });
  });
  ins[0]?.focus();
  return val;
}

export function setBusy(btn, busy) {
  if (!btn) return;
  if (busy) {
    btn.dataset.txt = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="spin" style="width:16px;height:16px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;display:inline-block;animation:spin .7s linear infinite"></i>';
  } else {
    btn.disabled = false;
    if (btn.dataset.txt) btn.innerHTML = btn.dataset.txt;
  }
}

export function showErr(root, msg) {
  const b = root.querySelector('.form-err');
  if (!b) return toast(msg, 'err');
  b.innerHTML = msg ? `<div class="alert err">${esc(msg)}</div>` : '';
}

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
  }
  toast(T('copied'), 'ok');
}
