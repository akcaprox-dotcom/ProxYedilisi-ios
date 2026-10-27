// Deneme süresi hatırlatmaları — sade, nazik; kırmızı/ışıklı uyarı yok.
import { html, raw } from '../core/util.js';
import { t, getLang } from '../core/i18n.js';
import { state } from '../core/state.js';
import { icon, sheet } from '../core/ui.js';
import { access } from '../core/subscription.js';
import { go } from '../core/router.js';

const isManager = () => ['owner', 'admin'].includes(state.org?.role) && !state.isSuper && !state.org?.viaAdmin;
const STEPS = [7, 3, 1]; // bu günlerde (veya altına ilk inişte) bir kez sorulur

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* yok say */ } },
};

const endsToday = (d) => new Date(d).toDateString() === new Date().toDateString();
const fmt = (d) => { try { return new Date(d).toLocaleDateString(getLang() === 'en' ? 'en-GB' : 'tr-TR', { day: 'numeric', month: 'long' }); } catch { return ''; } };

// Üst çubuktaki sade sayaç (yalnızca deneme sürerken, yöneticilere)
export function trialChip() {
  if (!state.session || !isManager()) return '';
  const a = access();
  if (a.kind !== 'trial') return '';
  const label = endsToday(a.until) ? t('Deneme bugün bitiyor', 'Trial ends today') : t(`Deneme: ${a.daysLeft} gün`, `Trial: ${a.daysLeft} days`);
  return html`<a class="trial-chip" href="#/subscribe" title="${t(`Ücretsiz deneme ${fmt(a.until)} tarihinde sona eriyor`, `Free trial ends on ${fmt(a.until)}`)}">${raw(icon('clock'))}<span>${label}</span></a>`;
}

let shownThisLoad = false;

// Oturum sayfası her çizildiğinde çağrılır; gerekiyorsa bir kez nazik bir pencere açar.
export function maybeTrialNotice() {
  if (shownThisLoad || !state.session || !isManager()) return;
  const here = location.hash.replace(/^#/, '');
  if (here.startsWith('/subscribe') || here.startsWith('/s/') || here.startsWith('/login')) return;
  if (document.querySelector('.sheet-bg')) return; // başka bir pencere açıkken araya girme
  const org = state.org.id;
  const a = access();

  if (a.kind === 'trial') {
    const last = endsToday(a.until);
    const step = last ? 'today' : STEPS.filter((s) => a.daysLeft <= s).pop(); // 7→7, 5→7, 3→3, 1→1, son gün→today
    if (!step) return;
    const key = `apx.trialnag.${org}.${step}`;
    if (store.get(key)) return;
    store.set(key, new Date().toISOString());
    shownThisLoad = true;
    open(
      last ? t('Ücretsiz denemeniz bugün sona eriyor', 'Your free trial ends today') : t(`Ücretsiz denemenizin bitmesine ${a.daysLeft} gün kaldı`, `${a.daysLeft} days left in your free trial`),
      last
        ? t('Denemenin son günündesiniz. Süre dolduktan sonra yeni değerlendirme açmak ve raporları görmek için abonelik gerekir; tüm verileriniz saklanmaya devam eder. ProX Yedilisi aboneliğini başlatmak ister misiniz?', 'This is the last day of your trial. After it ends, a subscription is needed to start new assessments and view reports; all your data stays safe. Would you like to start a ProX Yedilisi subscription?')
        : t(`Denemeniz ${fmt(a.until)} tarihine kadar sürüyor. Kesintisiz devam etmek için ProX Yedilisi aboneliğini başlatmak ister misiniz?`, `Your trial runs until ${fmt(a.until)}. Would you like to start a ProX Yedilisi subscription to continue without interruption?`),
    );
    return;
  }

  if (a.kind === 'expired' && a.trialEnded && !a.subEnded) {
    const key = `apx.trialend.${org}`;
    if (store.get(key)) return;
    store.set(key, new Date().toISOString());
    shownThisLoad = true;
    open(
      t('Ücretsiz deneme süreniz sona erdi', 'Your free trial has ended'),
      t('ProX Yedilisi\'ni denediğiniz için teşekkür ederiz. Verileriniz ve geçmiş değerlendirmeleriniz saklanıyor; abonelik başlattığınızda kaldığınız yerden devam edebilirsiniz.', 'Thank you for trying ProX Yedilisi. Your data and past assessments are kept; start a subscription to pick up where you left off.'),
    );
  }
}

function open(title, body) {
  const s = sheet(html`<div class="trial-note">
    <div class="tn-ico">${raw(icon('clock'))}</div>
    <h3>${title}</h3>
    <p class="muted">${body}</p>
    <div class="row end"><button class="btn" id="tn-later">${t('Daha sonra', 'Later')}</button><button class="btn primary" id="tn-go">${t('Aboneliği başlat', 'Start subscription')}</button></div>
  </div>`);
  s.el.querySelector('#tn-later').onclick = () => s.close();
  s.el.querySelector('#tn-go').onclick = () => { s.close(); go('/subscribe'); };
}
