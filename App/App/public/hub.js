// ANA PANEL — yedi paneli yörüngede gösteren giriş ekranı
import { html, raw, toStr, $, $$ } from '../core/util.js';
import { t, T, L } from '../core/i18n.js';
import { state } from '../core/state.js';
import { icon, sheet } from '../core/ui.js';
import { go } from '../core/router.js';
import { MODULES, getModule } from '../modules/index.js';
import { app, brand, langToggle, bindLang } from './layout.js';
import { CONFIG, DEMO_MODE } from '../config.js';

const AUD = {
  employees: { tr: 'Tüm çalışanlar · anonim', en: 'All employees · anonymous' },
  managers: { tr: 'Yönetim ekibi', en: 'Leadership team' },
  meeting: { tr: 'Toplantı katılımcıları · anonim', en: 'Meeting participants · anonymous' },
  candidate: { tr: 'Aday başına kişisel bağlantı', en: 'Personal link per candidate' },
};

export function itemCount(m) {
  if (m.key === 'ik') return m.counts.cog + m.counts.sjt + m.counts.pers;
  return m.items.length + (m.extras || []).length;
}

export function moduleSheet(key) {
  const m = getModule(key);
  const dims = m.key === 'ik'
    ? [t('Bilişsel yetenek', 'Cognitive ability'), t('Durumsal yargı', 'Situational judgement'), t('Kişilik (5 faktör)', 'Personality (Big Five)'), t('İş uyumu', 'Role fit')]
    : m.dims.map((d) => L(d.name));
  const s = sheet(html`
    <div class="eyebrow">${t('Analiz ProX Yedilisi', 'Analiz ProX Seven')} · 0${m.order}</div>
    <h2 style="margin-top:10px">${L(m.name)}</h2>
    <p class="muted">${L(m.about)}</p>
    <div class="dim-chips">${dims.map((d) => html`<span class="chip">${d}</span>`)}</div>
    <div class="grid g3" style="margin-bottom:22px">
      <div class="stat"><b>${itemCount(m)}</b><span>${T('questions')}</span></div>
      <div class="stat"><b>~${m.minutes}</b><span>${T('minutes')}</span></div>
      <div class="stat"><b style="font-size:15px;font-family:var(--f-sans);line-height:1.3">${L(AUD[m.audience])}</b><span>${t('Katılımcı', 'Respondents')}</span></div>
    </div>
    <div class="row">
      <button class="btn primary" id="sh-enter">${raw(icon('next'))} ${T('enterPanel')}</button>
      <a class="btn" href="#/demo/${m.key}">${raw(icon('chart'))} ${T('sampleReport')}</a>
      <a class="btn ghost" href="#/guide/${m.key}">${raw(icon('info'))} ${t('Kullanım kılavuzu', 'User guide')}</a>
    </div>`);
  $('#sh-enter', s.el).onclick = () => {
    s.close();
    go(state.session ? `/m/${m.key}` : `/login?next=${encodeURIComponent('/m/' + m.key)}`);
  };
}

export function renderHub() {
  const el = app();
  const mods = [...MODULES].sort((a, b) => a.order - b.order);
  const total = mods.reduce((s, m) => s + itemCount(m), 0);
  const n = mods.length;
  const nodes = mods.map((m, i) => {
    const ang = -Math.PI / 2 + (2 * Math.PI * i) / n;
    const x = 50 + 43 * Math.cos(ang), y = 50 + 43 * Math.sin(ang);
    return html`<button class="node" style="left:${x}%;top:${y}%" data-k="${m.key}" aria-label="${L(m.name)}">
      <span class="dot">${raw(icon(m.icon))}</span><span class="nm">${L(m.short)}</span></button>`;
  });
  el.innerHTML = toStr(html`<div class="hub">
    <div class="hub-top">${langToggle()}
      ${state.session ? html`<a class="btn sm primary" href="#/app">${raw(icon('grid'))} ${t('Panelim', 'My panels')}</a>` : html`<a class="btn sm" href="#/login">${T('login')}</a><a class="btn sm primary" href="#/register">${T('register')}</a>`}
    </div>
    <div class="hub-main">
      <div class="hub-copy">
        ${brand('lg')}
        <h1 class="tag"><em><i>ProX Yedilisi</i></em> ${t('ile işletmenizin röntgenini çekin.', 'takes an X-ray of your organization.')} <span>${t('Kör noktalarınızı görün, potansiyelinizi ölçün.', 'See your blind spots, measure your potential.')}</span></h1>
        <p>${t('Yedi bilimsel analiz paneli, tek hesap. Çalışanlarınız anonim bağlantıyla yanıtlar; siz güven aralıkları, etki analizleri ve aksiyon önerileriyle hazırlanmış raporları anında görürsünüz.', 'Seven scientific analysis panels, one account. Your people respond anonymously via a link; you instantly get reports with confidence intervals, driver analysis and recommended actions.')}</p>
        <div class="hub-stats">
          <div><b>7</b><span>${t('panel', 'panels')}</span></div>
          <div><b>${total}</b><span>${t('ölçüm maddesi', 'measurement items')}</span></div>
          <div><b>${t('%100', '100%')}</b><span>${t('anonim katılım', 'anonymous responses')}</span></div>
        </div>
        <div class="row">
          <button class="btn primary" id="hub-start">${state.session ? t('Panelime git', 'Go to my panels') : t('Ücretsiz hesap oluştur', 'Create free account')}</button>
          <button class="btn" id="hub-pick">${t('Bir panel seçin', 'Pick a panel')}</button>
        </div>
      </div>
      <div>
        <div class="orbit" id="orbit">
          <div class="ring"></div><div class="ring r2"></div><div class="sweep"></div>
          <div class="core"><div><b>AP·<i>X</i></b><span>360°</span></div></div>
          ${nodes}
        </div>
        <p class="center dim mono" style="font-size:11.5px;letter-spacing:.18em;margin-top:14px">${t('PANEL SEÇMEK İÇİN DOKUNUN', 'TAP A PANEL TO SELECT')}</p>
      </div>
    </div>
    <section class="hub-seo">
      <h2>${t('Yedi analiz paneli', 'Seven analysis panels')}</h2>
      <div class="hub-seo-grid">${mods.map((m) => html`<a href="#/guide/${m.key}"><b>${L(m.name)}</b><span>${L(m.tagline)}</span></a>`)}</div>
      <h2>${t('Kurum Röntgeni ve Claude ile Derin Analiz', 'Organization X-Ray and Deep Analysis with Claude')}</h2>
      <p>${t('Tüm panellerin sonuçları tek radar grafiğinde birleşir: en güçlü ve en zayıf alanlar, alanlar arası bağlantılar ve öncelikli aksiyonlar. Abonelikte Anthropic\'in Claude yapay zekâsı sonuçlarınızı bir iş danışmanı gibi yorumlar ve İK adaylarınız için kişiye özel mülakat rehberi hazırlar. 30 gün ücretsiz deneme; web, Android, iOS ve Windows\'ta aynı hesap.', 'All panel results combine on one radar: strongest and weakest areas, cross-area links and priority actions. With a subscription, Anthropic\'s Claude AI interprets your results like a business advisor and prepares candidate-specific interview guides. 30-day free trial; one account on web, Android, iOS and Windows.')}</p>
    </section>
    <footer class="hub-foot">
      <span>${t('Destek', 'Support')}: <a href="mailto:${CONFIG.SUPPORT_EMAIL}">${CONFIG.SUPPORT_EMAIL}</a></span>
      <a href="https://barisakca.com.tr" target="_blank" rel="noopener">barisakca.com.tr</a>
      <span>Bursa, ${t('Türkiye', 'Türkiye')}</span>
      <a href="#/guide">${t('Kullanım Kılavuzu', 'User Guide')}</a>
      <a href="#/legal/privacy">${t('Gizlilik Politikası', 'Privacy Policy')}</a>
      <a href="#/legal/terms">${t('Kullanım Koşulları', 'Terms of Use')}</a>
      <a href="#/legal/kvkk">${t('KVKK Aydınlatma', 'KVKK Notice')}</a>
      <span>© ${new Date().getFullYear()} Analiz ProX</span>
    </footer>
  </div>${DEMO_MODE ? raw(`<div class="demo-ribbon">${t('DEMO MODU', 'DEMO MODE')}</div>`) : ''}`);
  bindLang(el, renderHub);
  $$('.node', el).forEach((b) => (b.onclick = () => moduleSheet(b.dataset.k)));
  $('#hub-start', el).onclick = () => go(state.session ? '/app' : '/register');
  $('#hub-pick', el).onclick = () => {
    const nodesEl = $$('.node', el);
    nodesEl.forEach((b, i) => setTimeout(() => {
      b.classList.add('on');
      setTimeout(() => b.classList.remove('on'), 380);
    }, i * 110));
  };
}
