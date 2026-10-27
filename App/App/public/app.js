// Analiz ProX — uygulama giriş noktası
import { route, fallback, start, go } from './core/router.js';
import { refresh, state } from './core/state.js';
import { onLang } from './core/i18n.js';
import { installNativeLinks } from './core/native.js';
import { loadLiveLegal } from './core/legal-live.js';
import { renderHub } from './views/hub.js';
import { renderLogin, renderRegister, renderForgot, renderOnboarding, renderAccount } from './views/auth.js';
import { renderDashboard, renderModule, renderNew, renderAssessment } from './views/panels.js';
import { renderReport, renderDemo } from './views/report.js';
import { renderSurvey } from './views/survey.js';
import { renderLegal } from './views/legal.js';
import { renderGuide } from './views/guide.js';
import { renderSubscribe } from './views/subscribe.js';
import { renderXray } from './views/xray.js';
import { msAutoSync } from './core/subscription.js';
import { renderAdmin, renderMessages } from './views/admin.js';

const authed = (fn) => (...a) => (state.session ? fn(...a) : go('/login?next=' + encodeURIComponent(location.hash.slice(1) || '/app')));

route('/', renderHub);
route('/login', (p, q) => (state.session ? go(state.orgs.length ? '/app' : '/onboarding') : renderLogin(p, q)));
route('/register', (p, q) => (state.session ? go('/app') : renderRegister(p, q)));
route('/forgot', renderForgot);
route('/onboarding', authed(renderOnboarding));
route('/account', authed(renderAccount));
route('/app', authed(renderDashboard));
route('/admin', authed(renderAdmin));
route('/messages', authed(renderMessages));
route('/m/:key', authed(renderModule));
route('/m/:key/new', authed(renderNew));
route('/a/:id', authed(renderAssessment));
route('/a/:id/report', authed(renderReport));
route('/demo/:key', renderDemo);
route('/s/:code', renderSurvey);
route('/legal/:doc', renderLegal);
route('/legal', () => renderLegal({ doc: 'privacy' }));
route('/guide', renderGuide);
route('/subscribe', authed(renderSubscribe));
route('/xray', authed(renderXray));
route('/guide/:key', renderGuide);
fallback(() => go('/'));

(async () => {
  installNativeLinks();
  loadLiveLegal();
  try {
    await refresh();
  } catch (e) {
    console.error(e);
  }
  start();
  msAutoSync().catch(() => {}); // yalnızca Microsoft Store Windows uygulamasında etkili
  // Katılımcı ekranı dışında dil değişince sayfayı yeniden çiz (anket kendi durumunu korur)
  onLang(() => {
    if (!location.hash.startsWith('#/s/')) window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
})();
