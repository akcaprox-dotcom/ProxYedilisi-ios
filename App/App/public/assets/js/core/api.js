// Veri katmanı: Supabase (canlı) veya yerel demo adaptörü — arayüz ikisinde de aynı
import { CONFIG, DEMO_MODE } from '../config.js';
import { store, uid, normalizePhone, isEmail } from './util.js';

const authListeners = new Set();
const emitAuth = (s) => authListeners.forEach((f) => f(s));

// =================================================================
//  SUPABASE ADAPTÖRÜ
// =================================================================
function supabaseAdapter() {
  const sb = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false, storageKey: 'apx.auth' },
  });
  const chk = ({ data, error }) => {
    if (error) throw error;
    return data;
  };
  sb.auth.onAuthStateChange((_e, session) => emitAuth(session));

  return {
    mode: 'supabase',
    // ---------- auth ----------
    async session() {
      return chk(await sb.auth.getSession()).session;
    },
    async signUp({ email, phone, password, full_name, lang, contact_email }) {
      const options = { data: { full_name, lang, contact_email: contact_email || null } };
      if (phone) return chk(await sb.auth.signUp({ phone: normalizePhone(phone), password, options }));
      return chk(await sb.auth.signUp({ email: email.trim().toLowerCase(), password, options }));
    },
    async verifySignup({ email, phone, token }) {
      if (email) return chk(await sb.auth.verifyOtp({ email: email.trim().toLowerCase(), token, type: 'email' }));
      return chk(await sb.auth.verifyOtp({ phone: normalizePhone(phone), token, type: 'sms' }));
    },
    async resendSignup({ email, phone }) {
      if (email) return chk(await sb.auth.resend({ type: 'signup', email: email.trim().toLowerCase() }));
      return chk(await sb.auth.resend({ type: 'sms', phone: normalizePhone(phone) }));
    },
    async signIn(identifier, password) {
      const cred = isEmail(identifier)
        ? { email: identifier.trim().toLowerCase(), password }
        : { phone: normalizePhone(identifier), password };
      return chk(await sb.auth.signInWithPassword(cred));
    },
    async signOut() {
      await sb.auth.signOut();
    },
    async sendReset(identifier) {
      if (isEmail(identifier)) return chk(await sb.auth.resetPasswordForEmail(identifier.trim().toLowerCase()));
      return chk(await sb.auth.signInWithOtp({ phone: normalizePhone(identifier), options: { shouldCreateUser: false } }));
    },
    async resetAvailableAt(phone) {
      try {
        return chk(await sb.rpc('reset_available_at', { p_phone: normalizePhone(phone) }));
      } catch {
        return null;
      }
    },
    async verifyReset(identifier, token) {
      if (isEmail(identifier))
        return chk(await sb.auth.verifyOtp({ email: identifier.trim().toLowerCase(), token, type: 'recovery' }));
      return chk(await sb.auth.verifyOtp({ phone: normalizePhone(identifier), token, type: 'sms' }));
    },
    async updatePassword(password) {
      return chk(await sb.auth.updateUser({ password }));
    },
    async deleteAccount() {
      chk(await sb.rpc('delete_my_account'));
      await sb.auth.signOut();
    },
    // ---------- profil ----------
    async profile() {
      const s = await this.session();
      if (!s) return null;
      return chk(await sb.from('profiles').select('*').eq('id', s.user.id).maybeSingle());
    },
    async updateProfile(patch) {
      const s = await this.session();
      return chk(await sb.from('profiles').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', s.user.id).select().single());
    },
    async isSuperAdmin() {
      try {
        return !!chk(await sb.rpc('is_super_admin'));
      } catch {
        return false;
      }
    },
    async adminOverview() {
      return chk(await sb.rpc('admin_overview'));
    },
    // ---------- kurum ----------
    async myOrgs() {
      return chk(await sb.rpc('my_orgs')) || [];
    },
    async myMessages() {
      try {
        return chk(await sb.rpc('my_messages')) || [];
      } catch {
        return [];
      }
    },
    async markMessageRead(id) {
      const s = await this.session();
      await sb.from('admin_message_reads').upsert({ message_id: id, user_id: s.user.id }, { onConflict: 'message_id,user_id', ignoreDuplicates: true });
    },
    async adminSetOrgStatus(orgId, status, reason) {
      chk(await sb.rpc('admin_set_org_status', { p_org: orgId, p_status: status, p_reason: reason || null }));
    },
    async adminDeleteOrg(orgId, deleteOwner) {
      chk(await sb.rpc('admin_delete_org', { p_org: orgId, p_delete_owner: !!deleteOwner }));
    },
    async adminSendMessage(orgId, title, body) {
      return chk(await sb.rpc('admin_send_message', { p_org: orgId || null, p_title: title, p_body: body }));
    },
    async adminSentMessages() {
      return chk(await sb.rpc('admin_sent_messages')) || [];
    },
    async adminDeleteMessage(id) {
      chk(await sb.from('admin_messages').delete().eq('id', id));
    },
    async orgById(id) {
      return chk(await sb.from('organizations').select('*').eq('id', id).maybeSingle());
    },
    async createOrg({ name, sector, size }) {
      return chk(await sb.rpc('create_organization', { p_name: name, p_sector: sector, p_size: size }));
    },
    async orgAllowance() {
      return chk(await sb.rpc('my_org_allowance'));
    },
    async updateOrg(id, patch) {
      return chk(await sb.from('organizations').update(patch).eq('id', id).select().single());
    },
    // ---------- değerlendirmeler ----------
    async listAssessments(orgId, module) {
      let q = sb.from('assessments').select('*').eq('org_id', orgId).order('created_at', { ascending: false });
      if (module) q = q.eq('module', module);
      const [rows, counts] = await Promise.all([q.then(chk), sb.rpc('assessment_counts', { p_org: orgId }).then(chk)]);
      const n = Object.fromEntries((counts || []).map((c) => [c.assessment_id, Number(c.n)]));
      return rows.map((r) => ({ ...r, response_count: n[r.id] ?? 0 }));
    },
    // Satın alma / geri yükleme sonrası: sunucu aboneliği RevenueCat'ten okuyup kuruma yazar
    async syncSubscription(orgId) {
      const { data, error } = await sb.functions.invoke('revenuecat', { body: { org: orgId } });
      if (error) throw error;
      return data;
    },
    async adminSetAccess(orgId, until, note) {
      chk(await sb.rpc('admin_set_access', { p_org: orgId, p_until: until, p_note: note || null }));
    },
    // Microsoft Store (Windows uygulaması)
    async msRecordPurchase(orgId, sku, token) {
      return chk(await sb.rpc('ms_record_purchase', { p_org: orgId, p_sku: sku, p_token: token }));
    },
    async adminMsPurchases() {
      return chk(await sb.rpc('admin_ms_purchases')) || [];
    },
    async adminMsRevoke(id, note) {
      chk(await sb.rpc('admin_ms_revoke', { p_id: id, p_note: note || null }));
    },
    // ---- Kurum Röntgeni + Derin Analiz (Claude)
    async aiUsage(orgId) {
      return chk(await sb.rpc('ai_usage', { p_org: orgId }));
    },
    async aiConsent(orgId) {
      chk(await sb.rpc('ai_give_consent', { p_org: orgId }));
    },
    async listDeepAnalyses(orgId, { kind, assessmentId } = {}) {
      let q = sb.from('deep_analyses').select('id,kind,assessment_id,created_at,created_by,content,model,meta').eq('org_id', orgId).order('created_at', { ascending: false }).limit(50);
      if (kind) q = q.eq('kind', kind);
      if (assessmentId) q = q.eq('assessment_id', assessmentId);
      return chk(await q) || [];
    },
    async runDeepAnalysis({ org, kind, assessment_id, lang, data, sources }) {
      const { data: res, error } = await sb.functions.invoke('deep-analysis', { body: { org, kind, assessment_id, lang, data, sources } });
      if (error) {
        let code = 'provider_failed';
        try { code = (await error.context?.json())?.error || code; } catch {}
        throw new Error(code);
      }
      if (res?.error) throw new Error(res.error);
      return res;
    },
    async listXray(orgId) {
      return chk(await sb.from('xray_snapshots').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(24)) || [];
    },
    async saveXray(orgId, overall, data) {
      const u = (await sb.auth.getUser()).data?.user;
      return chk(await sb.from('xray_snapshots').insert({ org_id: orgId, created_by: u?.id, overall, data }).select().single());
    },
    async deleteXray(id) {
      chk(await sb.from('xray_snapshots').delete().eq('id', id));
    },
    async adminAiUsage() {
      return chk(await sb.rpc('admin_ai_usage')) || [];
    },
    async adminSetAiLimits(orgId, xray, ik) {
      chk(await sb.rpc('admin_set_ai_limits', { p_org: orgId, p_xray: xray, p_ik: ik }));
    },
    async getAssessment(id) {
      return chk(await sb.from('assessments').select('*').eq('id', id).maybeSingle());
    },
    async createAssessment(a) {
      return chk(await sb.from('assessments').insert(a).select().single());
    },
    async updateAssessment(id, patch) {
      return chk(await sb.from('assessments').update(patch).eq('id', id).select().single());
    },
    async deleteAssessment(id) {
      chk(await sb.from('assessments').delete().eq('id', id));
    },
    async listResponses(assessmentIds) {
      const ids = [].concat(assessmentIds);
      const out = [];
      const page = 1000;
      for (let from = 0; ; from += page) {
        const rows = chk(
          await sb.from('responses').select('*').in('assessment_id', ids).order('created_at').range(from, from + page - 1)
        );
        out.push(...rows);
        if (rows.length < page) break;
      }
      return out;
    },
    async deleteResponse(id) {
      chk(await sb.from('responses').delete().eq('id', id));
    },
    // ---------- katılımcı (giriş gerektirmez) ----------
    async getPublic(code) {
      return chk(await sb.rpc('get_public_assessment', { p_code: code }));
    },
    async submit(code, { answers, meta, timings, duration, device }) {
      return chk(
        await sb.rpc('submit_response', {
          p_code: code, p_answers: answers, p_meta: meta, p_timings: timings, p_duration: duration, p_device: device,
        })
      );
    },
  };
}

// =================================================================
//  YEREL DEMO ADAPTÖRÜ — Supabase kurulmadan önce önizleme/test için
// =================================================================
function localAdapter() {
  const KEY = 'apx.localdb';
  const SKEY = 'apx.localsession';
  const OTP = '123456';
  const db = () => {
    const d = store.get(KEY) || { users: [], profiles: [], orgs: [], members: [], assessments: [], responses: [], supers: [] };
    d.messages ||= [];
    d.reads ||= [];
    return d;
  };
  const save = (d) => store.set(KEY, d);
  const hash = async (s) => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('apx:' + s));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  };
  const err = (m) => {
    throw new Error(m);
  };
  const sess = () => store.get(SKEY);
  const me = () => {
    const s = sess();
    return s ? db().users.find((u) => u.id === s.user.id) : null;
  };
  const mkSession = (u) => ({ user: { id: u.id, email: u.email, phone: u.phone } });
  const findUser = (d, idf) => {
    if (isEmail(idf)) return d.users.find((u) => u.email === idf.trim().toLowerCase());
    return d.users.find((u) => u.phone === normalizePhone(idf));
  };
  const gen = () => {
    const a = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 10 }, () => a[Math.floor(Math.random() * a.length)]).join('');
  };
  const role = (d, orgId) => {
    const u = me();
    if (!u) return null;
    if (d.supers.includes(u.id)) return 'owner';
    if ((d.orgs.find((o) => o.id === orgId)?.status || 'active') !== 'active') return null;
    return d.members.find((m) => m.org_id === orgId && m.user_id === u.id)?.role || null;
  };
  const localAccess = (d, orgId) => {
    if (isSuper()) return true;
    const o = d.orgs.find((x) => x.id === orgId) || {};
    const fut = (x) => !!x && new Date(x).getTime() > Date.now();
    return o.trial_ends_at === undefined || fut(o.trial_ends_at) || fut(o.sub_expires_at);
  };
  const isSuper = () => {
    const u = me();
    return !!u && db().supers.includes(u.id);
  };
  let pendingReset = null;

  return {
    mode: 'local',
    async session() {
      return sess();
    },
    async signUp({ email, phone, password, full_name, lang, contact_email }) {
      const d = db();
      if (phone) email = null;
      const idf = phone || email;
      if (findUser(d, idf)) err('User already registered');
      if (!password || password.length < 8) err('Password should be at least 8 characters');
      const u = {
        id: uid(), email: email ? email.trim().toLowerCase() : null, phone: phone ? normalizePhone(phone) : null,
        pw: await hash(password), confirmed: false,
      };
      d.users.push(u);
      d.profiles.push({ id: u.id, full_name, email: u.email || contact_email || null, phone: u.phone, lang: lang || 'tr', title: '', created_at: new Date().toISOString() });
      save(d);
      return { user: { id: u.id }, demoCode: OTP };
    },
    async verifySignup({ email, phone, token }) {
      if (token !== OTP) err('Invalid OTP');
      const d = db();
      const u = findUser(d, email || phone);
      if (!u) err('Invalid OTP');
      u.confirmed = true;
      save(d);
      store.set(SKEY, mkSession(u));
      emitAuth(sess());
      return { session: sess() };
    },
    async resendSignup() {
      return { demoCode: OTP };
    },
    async signIn(identifier, password) {
      const d = db();
      const u = findUser(d, identifier);
      if (!u || u.pw !== (await hash(password))) err('Invalid login credentials');
      if (!u.confirmed) err(u.email ? 'Email not confirmed' : 'Phone not confirmed');
      store.set(SKEY, mkSession(u));
      emitAuth(sess());
      return { session: sess() };
    },
    async signOut() {
      store.del(SKEY);
      emitAuth(null);
    },
    async sendReset(identifier) {
      const d = db();
      const u = findUser(d, identifier);
      if (u) {
        const last = u.lastReset ? new Date(u.lastReset).getTime() : 0;
        if (Date.now() - last < 7 * 864e5) err('reset_weekly_limit');
        u.lastReset = new Date().toISOString();
        save(d);
      }
      pendingReset = identifier;
      return { demoCode: OTP };
    },
    async resetAvailableAt(phone) {
      const u = findUser(db(), phone);
      if (!u?.lastReset) return null;
      const next = new Date(new Date(u.lastReset).getTime() + 7 * 864e5);
      return next > new Date() ? next.toISOString() : null;
    },
    async verifyReset(identifier, token) {
      if (token !== OTP) err('Invalid OTP');
      const u = findUser(db(), identifier);
      if (!u) err('Invalid OTP');
      store.set(SKEY, mkSession(u));
      emitAuth(sess());
      return { session: sess() };
    },
    async updatePassword(password) {
      if (!password || password.length < 8) err('Password should be at least 8 characters');
      const d = db();
      const u = d.users.find((x) => x.id === sess()?.user.id);
      if (!u) err('auth_required');
      u.pw = await hash(password);
      save(d);
      return { user: u };
    },
    async deleteAccount() {
      const d = db();
      const u = me();
      if (!u) err('auth_required');
      const ownedOrgs = d.members.filter((m) => m.user_id === u.id && m.role === 'owner').map((m) => m.org_id);
      const aIds = d.assessments.filter((a) => ownedOrgs.includes(a.org_id)).map((a) => a.id);
      d.responses = d.responses.filter((r) => !aIds.includes(r.assessment_id));
      d.assessments = d.assessments.filter((a) => !ownedOrgs.includes(a.org_id));
      d.orgs = d.orgs.filter((o) => !ownedOrgs.includes(o.id));
      d.members = d.members.filter((m) => m.user_id !== u.id && !ownedOrgs.includes(m.org_id));
      d.profiles = d.profiles.filter((p) => p.id !== u.id);
      d.users = d.users.filter((x) => x.id !== u.id);
      save(d);
      await this.signOut();
    },
    async profile() {
      const s = sess();
      return s ? db().profiles.find((p) => p.id === s.user.id) || null : null;
    },
    async updateProfile(patch) {
      const d = db();
      const p = d.profiles.find((x) => x.id === sess()?.user.id);
      Object.assign(p, patch);
      save(d);
      return p;
    },
    async isSuperAdmin() {
      const u = me();
      return !!u && db().supers.includes(u.id);
    },
    async adminOverview() {
      if (!isSuper()) err('forbidden');
      const d = db();
      return d.orgs.map((o) => {
        const owner = d.members.find((m) => m.org_id === o.id && m.role === 'owner');
        const p = d.profiles.find((x) => x.id === owner?.user_id);
        const aIds = d.assessments.filter((a) => a.org_id === o.id).map((a) => a.id);
        return {
          org_id: o.id, org_name: o.name, status: o.status || 'active', frozen_reason: o.frozen_reason || null,
          owner_id: p?.id, owner_name: p?.full_name, owner_email: p?.email, owner_phone: p?.phone, created_at: o.created_at,
          assessments: aIds.length, responses: d.responses.filter((r) => aIds.includes(r.assessment_id)).length, last_activity: o.created_at,
          trial_ends_at: o.trial_ends_at || null, sub_expires_at: o.sub_expires_at || null, sub_status: o.sub_status || 'none', sub_store: o.sub_store || null,
        };
      });
    },
    async adminSetOrgStatus(orgId, status, reason) {
      if (!isSuper()) err('forbidden');
      const d = db();
      const o = d.orgs.find((x) => x.id === orgId);
      o.status = status;
      o.frozen_reason = status === 'frozen' ? reason || null : null;
      save(d);
    },
    async adminDeleteOrg(orgId, deleteOwner) {
      if (!isSuper()) err('forbidden');
      const d = db();
      const owners = d.members.filter((m) => m.org_id === orgId && m.role === 'owner').map((m) => m.user_id);
      const aIds = d.assessments.filter((a) => a.org_id === orgId).map((a) => a.id);
      d.responses = d.responses.filter((r) => !aIds.includes(r.assessment_id));
      d.assessments = d.assessments.filter((a) => a.org_id !== orgId);
      d.orgs = d.orgs.filter((o) => o.id !== orgId);
      d.members = d.members.filter((m) => m.org_id !== orgId);
      d.messages = d.messages.filter((m) => m.org_id !== orgId);
      if (deleteOwner) {
        const del = owners.filter((u) => u !== me()?.id && !d.supers.includes(u) && !d.members.some((m) => m.user_id === u));
        d.users = d.users.filter((u) => !del.includes(u.id));
        d.profiles = d.profiles.filter((p) => !del.includes(p.id));
      }
      save(d);
    },
    async adminSendMessage(orgId, title, body) {
      if (!isSuper()) err('forbidden');
      const d = db();
      const m = { id: uid(), org_id: orgId || null, title, body, created_at: new Date().toISOString() };
      d.messages.push(m);
      save(d);
      return m.id;
    },
    async adminSentMessages() {
      const d = db();
      return [...d.messages].reverse().map((m) => ({ ...m, org_name: d.orgs.find((o) => o.id === m.org_id)?.name || null, reads: d.reads.filter((r) => r.message_id === m.id).length }));
    },
    async adminDeleteMessage(id) {
      const d = db();
      d.messages = d.messages.filter((m) => m.id !== id);
      save(d);
    },
    async myMessages() {
      const d = db();
      const u = me();
      if (!u) return [];
      const orgIds = d.members.filter((m) => m.user_id === u.id).map((m) => m.org_id);
      return [...d.messages].reverse().filter((m) => m.org_id === null || orgIds.includes(m.org_id))
        .map((m) => ({ ...m, org_name: d.orgs.find((o) => o.id === m.org_id)?.name || null, is_read: d.reads.some((r) => r.message_id === m.id && r.user_id === u.id) }));
    },
    async markMessageRead(id) {
      const d = db();
      const u = me();
      if (!d.reads.some((r) => r.message_id === id && r.user_id === u.id)) d.reads.push({ message_id: id, user_id: u.id });
      save(d);
    },
    async myOrgs() {
      const d = db();
      const u = me();
      if (!u) return [];
      return d.members
        .filter((m) => m.user_id === u.id)
        .map((m) => ({ status: 'active', ...d.orgs.find((o) => o.id === m.org_id), role: m.role }))
        .filter((o) => o.id);
    },
    async orgById(id) {
      return db().orgs.find((o) => o.id === id) || null;
    },
    async createOrg({ name, sector, size }) {
      const d = db();
      const u = me();
      if (!u) err('auth_required');
      const owned = d.members.filter((m) => m.user_id === u.id && m.role === 'owner').length;
      if (!isSuper() && owned >= 1) err('org_limit');
      const o = { id: uid(), name: name.trim(), sector, size_band: size, created_by: u.id, created_at: new Date().toISOString(), trial_ends_at: new Date(Date.now() + 30 * 864e5).toISOString(), sub_status: 'none' };
      d.orgs.push(o);
      d.members.push({ org_id: o.id, user_id: u.id, role: 'owner' });
      save(d);
      return o.id;
    },
    async orgAllowance() {
      const d = db(), u = me();
      return { owned: d.members.filter((m) => m.user_id === u?.id && m.role === 'owner').length, max: isSuper() ? 999 : 1 };
    },
    async updateOrg(id, patch) {
      const d = db();
      const o = d.orgs.find((x) => x.id === id);
      if (!['owner', 'admin'].includes(role(d, id))) err('forbidden');
      Object.assign(o, patch);
      save(d);
      return o;
    },
    async listAssessments(orgId, module) {
      const d = db();
      if (!role(d, orgId)) return [];
      return d.assessments
        .filter((a) => a.org_id === orgId && (!module || a.module === module))
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((a) => ({ ...a, response_count: d.responses.filter((r) => r.assessment_id === a.id).length }));
    },
    async getAssessment(id) {
      const d = db();
      const a = d.assessments.find((x) => x.id === id);
      return a && role(d, a.org_id) ? a : null;
    },
    async syncSubscription() {
      return { ok: true };
    },
    async msRecordPurchase(orgId, sku, token) {
      const d = db();
      const o = d.orgs.find((x) => x.id === orgId);
      if (!o || !['owner', 'admin'].includes(role(d, orgId))) err('forbidden');
      Object.assign(o, { sub_expires_at: new Date(Date.now() + 32 * 864e5).toISOString(), sub_status: 'active', sub_store: 'microsoft', sub_product: sku, sub_will_renew: true });
      (d.ms ||= []).push({ id: uid(), org_id: orgId, org_name: o.name, sku, token_tail: String(token).slice(-10), status: 'active', first_seen_at: new Date().toISOString(), last_seen_at: new Date().toISOString(), seen_count: 1 });
      save(d);
      return { ok: true, until: o.sub_expires_at };
    },
    async adminMsPurchases() {
      if (!isSuper()) err('forbidden');
      return db().ms || [];
    },
    // ---- Kurum Röntgeni + Derin Analiz (demo: Claude çağrılmaz, örnek metin üretilir)
    async aiUsage(orgId) {
      const d = db();
      const o = d.orgs.find((x) => x.id === orgId) || {};
      const m = new Date(); m.setDate(1); m.setHours(0, 0, 0, 0);
      const mine = (d.deep || []).filter((x) => x.org_id === orgId && new Date(x.created_at) >= m);
      const fut = (x) => !!x && new Date(x).getTime() > Date.now();
      const nx = new Date(m); nx.setMonth(nx.getMonth() + 1);
      return { paid: isSuper() || fut(o.sub_expires_at), consent: !!o.ai_consent_at, xray_used: mine.filter((x) => x.kind === 'xray').length, ik_used: mine.filter((x) => x.kind === 'ik').length,
        xray_limit: o.ai_xray_limit ?? 2, ik_limit: o.ai_ik_limit ?? 50, renews_at: nx.toISOString() };
    },
    async aiConsent(orgId) {
      const d = db();
      if (!['owner', 'admin'].includes(role(d, orgId))) err('forbidden');
      const o = d.orgs.find((x) => x.id === orgId);
      o.ai_consent_at = new Date().toISOString();
      save(d);
    },
    async listDeepAnalyses(orgId, { kind, assessmentId } = {}) {
      return (db().deep || []).filter((x) => x.org_id === orgId && (!kind || x.kind === kind) && (!assessmentId || x.assessment_id === assessmentId))
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    async runDeepAnalysis({ org, kind, assessment_id, lang, data }) {
      const u = await this.aiUsage(org);
      if (!['owner', 'admin'].includes(role(db(), org))) err('forbidden');
      if (!u.paid) err('paid_required');
      if (!u.consent) err('consent_required');
      if ((kind === 'xray' ? u.xray_used >= u.xray_limit : u.ik_used >= u.ik_limit)) err('limit_reached');
      await new Promise((r) => setTimeout(r, 600));
      const en = lang === 'en';
      const content = kind === 'xray'
        ? (en ? '## Overall Picture\n(DEMO MODE — in the live version this text is written by Claude from your data.)\n\n## Priority Moves\n- Example move [1]\n\n## References\n[1] Edmondson, A. (1999). Psychological safety and learning behavior in work teams. Administrative Science Quarterly, 44(2), 350–383.'
              : '## Genel Durum\n(DEMO MODU — canlı sürümde bu metni verilerinizden Claude yazar.)\n\nVeride ' + Object.values(data?.alanlar || {}).filter((x) => typeof x === 'object').length + ' ölçülmüş alan var.\n\n## Öncelikli 3 Hamle\n- **Örnek hamle**: güven ve iletişim [1]\n\n## Kaynakça\n[1] Edmondson, A. (1999). Psychological safety and learning behavior in work teams. Administrative Science Quarterly, 44(2), 350–383.')
        : (en ? '## Overall Assessment\n(DEMO MODE)\n\n## Interview Guide\n### Question 1\n- Why we ask: example\n- Strong answer: example\n- Warning sign: example'
              : '## Genel Değerlendirme\n(DEMO MODU — canlı sürümde bu metni Claude yazar.)\n\n## Mülakat Rehberi\n### Soru 1\n- Neden soruyoruz: örnek\n- Güçlü bir cevap: örnek\n- Dikkat işareti: örnek\n\n## Kaynakça\n[1] Schmidt, F. L., & Hunter, J. E. (1998). Psychological Bulletin, 124(2), 262–274.');
      const d = db();
      const row = { id: uid(), org_id: org, kind, assessment_id: kind === 'ik' ? assessment_id : null, created_at: new Date().toISOString(), created_by: me().id, content, model: 'demo', meta: { lang } };
      (d.deep ||= []).push(row);
      save(d);
      return { ok: true, ...row };
    },
    async listXray(orgId) {
      return (db().xray || []).filter((x) => x.org_id === orgId).sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    async saveXray(orgId, overall, data) {
      const d = db();
      if (!['owner', 'admin'].includes(role(d, orgId))) err('forbidden');
      const row = { id: uid(), org_id: orgId, created_by: me().id, created_at: new Date().toISOString(), overall, data };
      (d.xray ||= []).push(row);
      save(d);
      return row;
    },
    async deleteXray(id) {
      const d = db();
      d.xray = (d.xray || []).filter((x) => x.id !== id);
      save(d);
    },
    async adminAiUsage() {
      if (!isSuper()) err('forbidden');
      const d = db();
      return d.orgs.map((o) => {
        const mine = (d.deep || []).filter((x) => x.org_id === o.id);
        return { org_id: o.id, org_name: o.name, paid: !!o.sub_expires_at && new Date(o.sub_expires_at) > new Date(), consent: !!o.ai_consent_at,
          xray_used: mine.filter((x) => x.kind === 'xray').length, xray_limit: o.ai_xray_limit ?? 2, ik_used: mine.filter((x) => x.kind === 'ik').length, ik_limit: o.ai_ik_limit ?? 50,
          month_cost: 0, total_cost: 0, last_at: mine.at(-1)?.created_at || null };
      });
    },
    async adminSetAiLimits(orgId, xray, ik) {
      if (!isSuper()) err('forbidden');
      const d = db();
      const o = d.orgs.find((x) => x.id === orgId);
      Object.assign(o, { ai_xray_limit: xray == null || xray < 0 ? null : xray, ai_ik_limit: ik == null || ik < 0 ? null : ik });
      save(d);
    },
    async adminMsRevoke(id) {
      if (!isSuper()) err('forbidden');
      const d = db();
      const m = (d.ms || []).find((x) => x.id === id);
      if (m) {
        m.status = 'revoked';
        const o = d.orgs.find((x) => x.id === m.org_id);
        if (o && o.sub_store === 'microsoft') Object.assign(o, { sub_expires_at: new Date().toISOString(), sub_status: 'expired' });
      }
      save(d);
    },
    async adminSetAccess(orgId, until, note) {
      const d = db();
      if (!isSuper()) err('forbidden');
      Object.assign(d.orgs.find((o) => o.id === orgId) || {}, { sub_expires_at: until, sub_status: until ? 'granted' : 'none', sub_store: until ? 'admin' : null, sub_note: note || null });
      save(d);
    },
    async createAssessment(a) {
      const d = db();
      if (!['owner', 'admin'].includes(role(d, a.org_id))) err('forbidden');
      if (!localAccess(d, a.org_id)) err('subscription_required');
      let code;
      do code = gen();
      while (d.assessments.some((x) => x.code === code));
      const row = { id: uid(), status: 'open', settings: {}, ...a, code, created_by: me().id, created_at: new Date().toISOString() };
      d.assessments.push(row);
      save(d);
      return row;
    },
    async updateAssessment(id, patch) {
      const d = db();
      const a = d.assessments.find((x) => x.id === id);
      if (!a || !['owner', 'admin'].includes(role(d, a.org_id))) err('forbidden');
      Object.assign(a, patch);
      save(d);
      return a;
    },
    async deleteAssessment(id) {
      const d = db();
      const a = d.assessments.find((x) => x.id === id);
      if (!a || !['owner', 'admin'].includes(role(d, a.org_id))) err('forbidden');
      d.assessments = d.assessments.filter((x) => x.id !== id);
      d.responses = d.responses.filter((r) => r.assessment_id !== id);
      save(d);
    },
    async listResponses(ids) {
      const d = db();
      const set = new Set([].concat(ids).filter((id) => {
        const a = d.assessments.find((x) => x.id === id);
        return a && role(d, a.org_id) && localAccess(d, a.org_id);
      }));
      return d.responses.filter((r) => set.has(r.assessment_id)).sort((a, b) => a.created_at.localeCompare(b.created_at));
    },
    async deleteResponse(id) {
      const d = db();
      d.responses = d.responses.filter((r) => r.id !== id);
      save(d);
    },
    async getPublic(code) {
      const d = db();
      const a = d.assessments.find((x) => x.code === String(code).trim().toUpperCase());
      if (!a) return { ok: false, error: 'not_found' };
      const org = d.orgs.find((o) => o.id === a.org_id);
      if ((org?.status || 'active') !== 'active' || a.status !== 'open' || (a.closes_at && new Date(a.closes_at) < new Date()))
        return { ok: false, error: 'closed', title: a.title, org: org?.name };
      if (a.module === 'ik' && d.responses.some((r) => r.assessment_id === a.id))
        return { ok: false, error: 'completed', title: a.title, org: org?.name };
      return { ok: true, module: a.module, title: a.title, org: org?.name, settings: a.settings?.public || {} };
    },
    async submit(code, { answers, meta, timings, duration, device }) {
      const d = db();
      const a = d.assessments.find((x) => x.code === String(code).trim().toUpperCase());
      if (!a) err('not_found');
      if (a.status !== 'open' || (d.orgs.find((o) => o.id === a.org_id)?.status || 'active') !== 'active') err('closed');
      if (a.module === 'ik' && d.responses.some((r) => r.assessment_id === a.id)) err('completed');
      if (device && d.responses.some((r) => r.assessment_id === a.id && r.device_token === device)) err('duplicate');
      let server_scores = null;
      if (a.module === 'ik' && window.APX_DEV_KEYS) server_scores = scoreIkLocally(answers, window.APX_DEV_KEYS);
      const row = {
        id: uid(), assessment_id: a.id, answers, meta: meta || {}, timings: timings || {}, duration_sec: duration,
        device_token: device || null, server_scores, created_at: new Date().toISOString(),
      };
      d.responses.push(row);
      save(d);
      return { ok: true, id: row.id };
    },
    // test/demo yardımcıları
    _db: db,
    _save: save,
  };
}

// Sunucudaki submit_response puanlamasının birebir JS karşılığı (yalnız geliştirme/test)
export function scoreIkLocally(answers, keys) {
  const cog = {};
  const byDom = {};
  let sjtGot = 0, sjtMax = 0;
  for (const k of keys) {
    const v = answers[k.item_id];
    const n = /^\d+$/.test(String(v ?? '')) ? Number(v) : null;
    if (k.kind === 'cog') {
      (byDom[k.domain] ||= { c: 0, n: 0 }).n++;
      if (n !== null && n === k.correct) byDom[k.domain].c++;
    } else {
      sjtMax += Math.max(...k.weights);
      if (n !== null) sjtGot += k.weights[n] ?? 0;
    }
  }
  for (const [dom, o] of Object.entries(byDom)) cog[dom] = Math.round((100 * o.c) / o.n);
  return { cog, sjt: sjtMax ? Math.round((100 * sjtGot) / sjtMax) : null };
}

export const api = DEMO_MODE || !window.supabase ? localAdapter() : supabaseAdapter();
export const onAuth = (f) => (authListeners.add(f), () => authListeners.delete(f));
