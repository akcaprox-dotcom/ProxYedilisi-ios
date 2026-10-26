import { html, raw, toStr, esc, $ } from '../core/util.js';
import { t, T, L, getLang, setLang } from '../core/i18n.js';
import { state, setOrg } from '../core/state.js';
import { api } from '../core/api.js';
import { icon } from '../core/ui.js';
import { go } from '../core/router.js';
import { DEMO_MODE } from '../config.js';

export const app = () => document.getElementById('app');

export const brand = (cls = '') => html`<a class="brand ${cls}" href="#/"><img src="assets/img/logo.png" alt=""><b>Analiz Pro<i>X</i></b></a>`;

export function langToggle() {
  const l = getLang();
  return html`<div class="lang" role="group" aria-label="Language"><button data-lang="tr" class="${l === 'tr' ? 'on' : ''}">TR</button><button data-lang="en" class="${l === 'en' ? 'on' : ''}">EN</button></div>`;
}
export function bindLang(root, rerender) {
  root.querySelectorAll('[data-lang]').forEach((b) =>
    b.addEventListener('click', () => {
      setLang(b.dataset.lang);
      rerender && rerender();
    })
  );
}

const initials = (name) =>
  (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]).join('').toLocaleUpperCase('tr');

export function topbar() {
  const p = state.profile;
  const orgSel = state.orgs.length > 1
    ? html`<select class="input" id="org-sel" style="min-height:34px;padding:4px 10px;width:auto;font-size:13px">${state.orgs.map((o) => html`<option value="${o.id}" ${state.org?.id === o.id ? 'selected' : ''}>${o.name}</option>`)}</select>`
    : state.org?.viaAdmin
      ? html`<a class="btn sm" href="#/admin" title="${t('Süper admin görünümüne dön', 'Back to super admin')}" style="border-color:rgba(155,135,245,.5);color:var(--violet)">${raw(icon('eye'))} ${state.org.name} · ${t('admin görünümü', 'admin view')} ✕</a>`
      : html`<span class="org">${state.org?.name || ''}</span>`;
  const here = location.hash.replace(/^#/, '') || '/';
  const nav = state.session
    ? html`<nav class="topnav">
        <a href="#/" class="${here === '/' ? 'on' : ''}" title="${t('Ana panel', 'Home')}">${raw(icon('orbit'))}<span>${t('Ana panel', 'Home')}</span></a>
        <a href="#/app" class="${here === '/app' ? 'on' : ''}" title="${T('panels')}">${raw(icon('grid'))}<span>${T('panels')}</span></a>
        <a href="#/guide" class="${here.startsWith('/guide') ? 'on' : ''}" title="${t('Kullanım Kılavuzu', 'User Guide')}">${raw(icon('info'))}<span>${t('Kılavuz', 'Guide')}</span></a>
        <a href="#/messages" class="bell ${here === '/messages' ? 'on' : ''}" title="${t('Mesajlar', 'Messages')}">${raw(icon('mail'))}${state.unread ? html`<b class="dot-n">${state.unread > 9 ? '9+' : state.unread}</b>` : ''}</a>
      </nav>`
    : '';
  return html`<header class="topbar"><div class="wrap">
    ${brand()}
    ${nav}
    <span class="spacer"></span>
    ${state.session ? orgSel : ''}
    ${langToggle()}
    ${state.session
      ? html`<div class="menu"><button class="avatar" id="me-btn" aria-label="${T('account')}">${initials(p?.full_name)}</button>
        <div class="menu-pop hide" id="me-pop">
          <div style="padding:10px 12px 6px"><b>${p?.full_name || ''}</b><br><small>${p?.email || p?.phone || ''}</small></div><hr>
          <a href="#/">${raw(icon('orbit'))} ${t('Ana panel', 'Home')}</a>
          <a href="#/app">${raw(icon('grid'))} ${T('panels')}</a>
          <a href="#/messages">${raw(icon('mail'))} ${t('Mesajlar', 'Messages')}${state.unread ? ` (${state.unread})` : ''}</a>
          <a href="#/guide">${raw(icon('info'))} ${t('Kullanım Kılavuzu', 'User Guide')}</a>
          <a href="#/subscribe">${raw(icon('key'))} ${t('Abonelik', 'Subscription')}</a>
          <a href="#/account">${raw(icon('user'))} ${T('account')}</a>
          ${state.isSuper ? html`<a href="#/admin">${raw(icon('key'))} ${t('Süper admin', 'Super admin')}</a>` : ''}
          <hr><button id="logout">${raw(icon('logout'))} ${T('logout')}</button>
        </div></div>`
      : html`<a class="btn sm" href="#/login">${T('login')}</a>`}
  </div></header>`;
}

export function bindTopbar(root, rerender) {
  bindLang(root, rerender);
  const b = $('#me-btn', root), pop = $('#me-pop', root);
  if (b) {
    b.onclick = (e) => {
      e.stopPropagation();
      pop.classList.toggle('hide');
    };
    document.addEventListener('click', () => pop.classList.add('hide'), { once: true });
  }
  const lo = $('#logout', root);
  if (lo)
    lo.onclick = async () => {
      await api.signOut();
      go('/');
    };
  const os = $('#org-sel', root);
  if (os)
    os.onchange = () => {
      setOrg(os.value);
      rerender && rerender();
    };
}

// Oturum gerektiren sayfa çerçevesi
export function shell(body, rerender) {
  const el = app();
  el.innerHTML = toStr(topbar()) + `<main><div class="wrap">${toStr(body)}</div></main>` + (DEMO_MODE ? `<div class="demo-ribbon">${esc(t('DEMO MODU · yerel veri', 'DEMO MODE · local data'))}</div>` : '');
  bindTopbar(el, rerender);
  return el.querySelector('main .wrap');
}

// Üst konum zinciri + bir üst sayfaya dönen "Geri" düğmesi
export function crumbs(items) {
  const parent = [...items].slice(0, -1).reverse().find((it) => it.href)?.href || '#/app';
  return html`<div class="crumbs-row"><a class="btn sm back-btn" href="${parent}">${raw(icon('back'))} ${T('back')}</a>
    <div class="crumbs">${items.map((it, i) => html`${i ? ' / ' : ''}${it.href ? html`<a href="${it.href}">${it.label}</a>` : it.label}`)}</div></div>`;
}
