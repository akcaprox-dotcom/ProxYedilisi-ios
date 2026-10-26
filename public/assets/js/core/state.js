// Oturum durumu: kullanıcı, profil, kurumlar, etkin kurum
import { api, onAuth } from './api.js';
import { store } from './util.js';

export const state = { session: null, profile: null, orgs: [], org: null, isSuper: false, unread: 0, ready: false };
const subs = new Set();
export const onState = (f) => (subs.add(f), () => subs.delete(f));
const emit = () => subs.forEach((f) => f(state));

export async function refresh() {
  state.session = await api.session();
  if (state.session) {
    const [profile, orgs, isSuper, msgs] = await Promise.all([api.profile(), api.myOrgs(), api.isSuperAdmin(), api.myMessages()]);
    state.profile = profile;
    state.unread = (msgs || []).filter((m) => !m.is_read).length;
    state.orgs = orgs.filter(Boolean);
    state.isSuper = isSuper;
    const pref = store.get('apx.org');
    state.org = state.orgs.find((o) => o.id === pref) || state.orgs[0] || null;
  } else {
    Object.assign(state, { profile: null, orgs: [], org: null, isSuper: false, unread: 0 });
  }
  state.ready = true;
  emit();
  return state;
}

export function setOrg(id) {
  const o = state.orgs.find((x) => x.id === id);
  if (o) {
    state.org = o;
    store.set('apx.org', id);
    emit();
  }
}

// Süper admin başka bir kurumu "o kurumun gözünden" açabilir
export async function adminOpenOrg(id) {
  const o = await api.orgById(id);
  if (o) {
    state.org = { status: 'active', ...o, role: 'admin', viaAdmin: true };
    emit();
  }
}

let refreshing = null;
onAuth(() => {
  clearTimeout(refreshing);
  refreshing = setTimeout(refresh, 50);
});

export async function refreshUnread() {
  const msgs = await api.myMessages();
  state.unread = msgs.filter((m) => !m.is_read).length;
  return msgs;
}
