// KATILIMCI EKRANI — giriş gerektirmez; tek soru / tek ekran, kaldığı yerden devam
import { html, raw, toStr, $, $$, store, deviceToken, esc } from '../core/util.js';
import { t, T, L, getLang, errText } from '../core/i18n.js';
import { api } from '../core/api.js';
import { icon, toast, loader, setBusy } from '../core/ui.js';
import { getModule, effective } from '../modules/index.js';
import { likertSteps, SCALES } from '../modules/common.js';
import { COG, SJT, PERS, COG_MINUTES } from '../modules/ik.js';
import { app, brand, langToggle, bindLang } from './layout.js';

const KEY = (code) => 'apx.sv.' + code;
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

function ikSteps() {
  const s = [];
  s.push({ type: 'section', sec: 'cog', title: { tr: 'Bölüm 1 · Bilişsel yetenek', en: 'Section 1 · Cognitive ability' },
    body: { tr: `${COG.length} soru · ${COG_MINUTES} dakika. Sayısal, sözel, mantıksal ve dikkat sorularından oluşur. Süre başladığında durdurulamaz; süre dolarsa bölüm otomatik kapanır. Hesap makinesi kullanmayın; not kâğıdı kullanabilirsiniz. Her sorunun tek doğru cevabı vardır.`,
            en: `${COG.length} questions · ${COG_MINUTES} minutes. Numerical, verbal, logical and attention items. The timer cannot be paused; the section closes automatically when time runs out. Do not use a calculator; scratch paper is fine. Each question has one correct answer.` } });
  COG.forEach((q) => s.push({ type: 'mcq', item: q, sec: 'cog' }));
  s.push({ type: 'section', sec: 'sjt', title: { tr: 'Bölüm 2 · Durumsal yargı', en: 'Section 2 · Situational judgement' },
    body: { tr: `${SJT.length} iş senaryosu. Her durumda size en uygun gelen davranışı seçin. Doğru/yanlış değil, en etkili yaklaşım aranır. Süre sınırı yoktur.`,
            en: `${SJT.length} workplace scenarios. Choose the action that you would most likely take. There is no time limit.` } });
  SJT.forEach((q) => s.push({ type: 'mcq', item: q, sec: 'sjt' }));
  s.push({ type: 'section', sec: 'pers', title: { tr: 'Bölüm 3 · Kişilik envanteri', en: 'Section 3 · Personality inventory' },
    body: { tr: `${PERS.length} ifade. Kendinizi olduğunuz gibi tanımlayın; olmak istediğiniz gibi değil. İlk aklınıza gelen yanıt genellikle en doğrusudur.`,
            en: `${PERS.length} statements. Describe yourself as you are, not as you wish to be. Your first instinct is usually best.` } });
  PERS.forEach((it) => s.push({ type: 'likert', item: it, scale: 'agree5', sec: 'pers' }));
  return s;
}

export async function renderSurvey({ code }) {
  const el = app();
  el.innerHTML = loader();
  let pub;
  try {
    pub = await api.getPublic(code);
  } catch (err) {
    return message(el, t('Bağlantı açılamadı', 'Could not open link'), errText(err));
  }
  if (!pub?.ok) {
    const map = {
      not_found: [t('Bağlantı geçersiz', 'Invalid link'), t('Bu bağlantıya ait bir değerlendirme bulunamadı. Bağlantıyı size gönderen kişiyle iletişime geçin.', 'No assessment matches this link. Please contact the person who sent it.')],
      closed: [t('Değerlendirme kapandı', 'Assessment closed'), t('Bu değerlendirme artık yanıt kabul etmiyor. Katılım isteğiniz için teşekkürler.', 'This assessment no longer accepts responses. Thank you for your interest.')],
      completed: [t('Tamamlandı', 'Completed'), t('Bu değerlendirme daha önce tamamlanmış.', 'This assessment has already been completed.')],
    };
    const [h, p] = map[pub?.error] || map.not_found;
    return message(el, h, p, pub?.org);
  }
  const base = getModule(pub.module);
  const mod = effective(base, { public: pub.settings });
  const steps = pub.module === 'ik' ? ikSteps() : likertSteps(mod, pub.settings);
  const kiosk = !!pub.settings?.kiosk;
  const saved = store.get(KEY(code));
  const S = saved && saved.v === 2 ? saved : { v: 2, i: -1, answers: {}, meta: {}, timings: {}, start: null, cogStart: null, cogEnd: null, timeout: false };
  const persist = () => store.set(KEY(code), S);
  let tShown = 0, timerInt = null;

  const total = steps.length;
  const frame = (inner, { progress = true } = {}) => {
    clearInterval(timerInt);
    const pct = S.i < 0 ? 0 : Math.round((100 * S.i) / total);
    el.innerHTML = toStr(html`<div class="sv">
      <div class="sv-top">${brand()}<div class="t"><b>${pub.title}</b><span>${pub.org} · ${L(base.short)}</span></div>
        ${pub.module === 'ik' && steps[S.i]?.sec === 'cog' && S.cogStart && !S.cogEnd ? html`<span class="timer" id="tm"></span>` : ''}${langToggle()}</div>
      ${progress ? html`<div class="progress"><i style="width:${pct}%"></i></div>` : ''}
      <div class="sv-body">${inner}</div></div>`);
    bindLang(el, () => show());
    tShown = performance.now();
    const tm = $('#tm', el);
    if (tm) {
      const tick = () => {
        const left = COG_MINUTES * 60 - Math.floor((Date.now() - S.cogStart) / 1000);
        if (left <= 0) {
          clearInterval(timerInt);
          S.timeout = true;
          S.cogEnd = S.cogStart + COG_MINUTES * 60000;
          S.i = steps.findIndex((s) => s.type === 'section' && s.sec === 'sjt');
          persist();
          toast(t('Bilişsel bölümün süresi doldu.', 'Time is up for the cognitive section.'));
          return show();
        }
        tm.textContent = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
        tm.classList.toggle('warn', left < 120);
      };
      tick();
      timerInt = setInterval(tick, 1000);
    }
  };

  const next = () => {
    S.i++;
    persist();
    show();
  };
  const back = () => {
    if (S.i <= 0) return;
    let j = S.i - 1;
    // süreli bölüm kapandıysa geri dönülmez; bölüm girişlerinin üzerinden atla
    while (j > 0 && steps[j].type === 'section') j--;
    if (steps[j]?.sec === 'cog' && S.cogEnd) return;
    S.i = j;
    persist();
    show();
  };
  const answer = (id, v, auto = true) => {
    S.answers[id] = v;
    S.timings[id] = Math.round((performance.now() - tShown) / 100) / 10;
    persist();
    if (auto) setTimeout(next, 220);
  };

  function show() {
    if (S.i < 0) return intro();
    if (S.i >= total) return finish();
    const st = steps[S.i];
    const navBack = S.i > 0 ? html`<button class="btn ghost" id="bk">${raw(icon('back'))} ${T('back')}</button>` : html`<span></span>`;
    const num = html`<div class="q-num">${S.i + 1} / ${total}</div>`;

    if (st.type === 'section') {
      frame(html`<div class="sv-intro"><div class="card">
        <div class="eyebrow">${L(base.short)}</div><h2 style="margin-top:10px">${L(st.title)}</h2><p class="muted">${L(st.body)}</p>
        <div class="row end"><button class="btn primary" id="go">${st.sec === 'cog' ? t('Süreyi başlat', 'Start timer') : T('continue')}</button></div></div></div>`, { progress: true });
      $('#go', el).onclick = () => {
        if (st.sec === 'cog' && !S.cogStart) S.cogStart = Date.now();
        if (st.sec === 'sjt' && S.cogStart && !S.cogEnd) S.cogEnd = Date.now();
        next();
      };
      return;
    }
    if (st.type === 'meta') {
      frame(html`<div class="q"><div class="q-dim">${t('Sizi tanıyalım', 'About you')}</div>
        <div class="q-text">${t('Bu bilgiler yalnızca grup karşılaştırması için kullanılır; az kişili gruplar raporda ayrıca gösterilmez.', 'Used only for group comparisons; small groups are never shown separately in reports.')}</div>
        ${st.fields.map((f) => html`<label class="field"><span>${L(f.label)}</span><select class="input" data-k="${f.key}"><option value="">${t('Seçiniz', 'Select')}</option>${f.options.map((o) => html`<option value="${o.v}" ${S.meta[f.key] === o.v ? 'selected' : ''}>${L(o)}</option>`)}</select></label>`)}
        <div class="sv-nav">${navBack}<button class="btn primary" id="go">${T('continue')}</button></div></div>`);
      $('#go', el).onclick = () => {
        const sel = $$('select[data-k]', el);
        if (sel.some((s) => !s.value)) return toast(t('Lütfen tüm alanları seçin.', 'Please complete all fields.'), 'err');
        sel.forEach((s) => (S.meta[s.dataset.k] = s.value));
        next();
      };
      bindNav();
      return;
    }
    if (st.type === 'likert' || st.type === 'rate5') {
      const it = st.item;
      const scale = SCALES[st.scale || it.scale || 'agree5'];
      const dim = st.attention ? '' : st.sec === 'pers' ? t('Kişilik', 'Personality') : it.scen ? L(mod.scenarios?.find((s) => s.key === it.scen)?.name) : L(mod.dims?.find((d) => d.key === it.dim)?.name);
      const cur = S.answers[it.id];
      frame(html`<div class="q">${num}<div class="q-dim">${dim || ''}</div><div class="q-text">${L(it)}</div>
        <div class="likert">${scale.map((o, k) => html`<button class="${cur === k + 1 ? 'on' : ''}" data-v="${k + 1}"><span class="k">${k + 1}</span>${L(o)}</button>`)}</div>
        <div class="sv-nav">${navBack}${cur ? html`<button class="btn" id="nx">${T('next')} ${raw(icon('next'))}</button>` : ''}</div></div>`);
      $$('.likert button', el).forEach((b) => (b.onclick = () => {
        $$('.likert button', el).forEach((x) => x.classList.remove('on'));
        b.classList.add('on');
        answer(it.id, +b.dataset.v);
      }));
      bindNav();
      return;
    }
    if (st.type === 'mcq') {
      const it = st.item;
      const cur = S.answers[it.id];
      const lang = getLang() === 'en' ? 1 : 0;
      frame(html`<div class="q">${num}<div class="q-dim">${st.sec === 'cog' ? t('Bilişsel yetenek', 'Cognitive ability') : t('Durumsal yargı', 'Situational judgement')}</div>
        <div class="q-text" style="white-space:pre-line">${L(it)}</div>
        <div class="picks">${it.o.map((o, k) => html`<button class="${cur === k ? 'on' : ''}" data-v="${k}"><span class="n">${LETTERS[k]}</span><span>${o[lang]}</span></button>`)}</div>
        <div class="sv-nav">${navBack}${cur != null ? html`<button class="btn" id="nx">${T('next')} ${raw(icon('next'))}</button>` : ''}</div></div>`);
      $$('.picks button', el).forEach((b) => (b.onclick = () => {
        $$('.picks button', el).forEach((x) => x.classList.remove('on'));
        b.classList.add('on');
        answer(it.id, +b.dataset.v);
      }));
      bindNav();
      return;
    }
    if (st.type === 'nps' || st.type === 'scale10') {
      const it = st.item, cur = S.answers[it.id];
      frame(html`<div class="q">${num}<div class="q-dim">${st.type === 'nps' ? t('Tavsiye', 'Advocacy') : t('Genel değerlendirme', 'Overall')}</div><div class="q-text">${L(it)}</div>
        <div class="scale10">${Array.from({ length: 11 }, (_, k) => html`<button class="${cur === k ? 'on' : ''}" data-v="${k}">${k}</button>`)}</div>
        <div class="scale10-leg"><span>0 · ${L(it.low)}</span><span>${L(it.high)} · 10</span></div>
        <div class="sv-nav">${navBack}${cur != null ? html`<button class="btn" id="nx">${T('next')} ${raw(icon('next'))}</button>` : ''}</div></div>`);
      $$('.scale10 button', el).forEach((b) => (b.onclick = () => {
        $$('.scale10 button', el).forEach((x) => x.classList.remove('on'));
        b.classList.add('on');
        answer(it.id, +b.dataset.v);
      }));
      bindNav();
      return;
    }
    if (st.type === 'choice') {
      const it = st.item, cur = S.answers[it.id];
      frame(html`<div class="q">${num}<div class="q-text">${L(it)}</div>
        <div class="picks">${it.options.map((o, k) => html`<button class="${cur === o.v ? 'on' : ''}" data-v="${o.v}"><span class="n">${LETTERS[k]}</span><span>${L(o)}</span></button>`)}</div>
        <div class="sv-nav">${navBack}${cur != null ? html`<button class="btn" id="nx">${T('next')} ${raw(icon('next'))}</button>` : ''}</div></div>`);
      $$('.picks button', el).forEach((b) => (b.onclick = () => {
        $$('.picks button', el).forEach((x) => x.classList.remove('on'));
        b.classList.add('on');
        answer(it.id, b.dataset.v);
      }));
      bindNav();
      return;
    }
    if (st.type === 'rank') {
      const it = st.item;
      const list = pub.settings?.priorities || [];
      if (!list.length) return next();
      let picked = Array.isArray(S.answers[it.id]) ? [...S.answers[it.id]] : [];
      frame(html`<div class="q">${num}<div class="q-dim">${t('Öncelikler', 'Priorities')}</div><div class="q-text">${L(it)}</div>
        <p class="dim" style="margin-top:-12px">${t(`Tam ${it.pick} seçenek işaretleyin.`, `Select exactly ${it.pick}.`)}</p>
        <div class="picks" id="rk">${list.map((p, k) => html`<button class="${picked.includes(k) ? 'on' : ''}" data-v="${k}"><span class="n">${picked.includes(k) ? picked.indexOf(k) + 1 : ''}</span><span>${p}</span></button>`)}</div>
        <div class="sv-nav">${navBack}<button class="btn primary" id="go">${T('continue')}</button></div></div>`);
      $$('#rk button', el).forEach((b) => (b.onclick = () => {
        const v = +b.dataset.v;
        if (picked.includes(v)) picked = picked.filter((x) => x !== v);
        else if (picked.length < it.pick) picked.push(v);
        $$('#rk button', el).forEach((x) => {
          const k = +x.dataset.v;
          x.classList.toggle('on', picked.includes(k));
          x.querySelector('.n').textContent = picked.includes(k) ? picked.indexOf(k) + 1 : '';
        });
      }));
      $('#go', el).onclick = () => {
        if (picked.length !== it.pick) return toast(t(`Lütfen ${it.pick} seçenek işaretleyin.`, `Please select ${it.pick}.`), 'err');
        answer(it.id, picked, false);
        next();
      };
      bindNav();
      return;
    }
    if (st.type === 'text') {
      const it = st.item;
      frame(html`<div class="q">${num}<div class="q-dim">${t('Görüşünüz (isteğe bağlı)', 'Your view (optional)')}</div><div class="q-text">${L(it)}</div>
        <textarea class="input" id="tx" maxlength="600" placeholder="${t('Kimliğinizi belli edecek bilgi yazmayın.', 'Do not include information that identifies you.')}">${S.answers[it.id] || ''}</textarea>
        <div class="sv-nav">${navBack}<button class="btn primary" id="go">${S.answers[it.id] ? T('continue') : t('Atla / devam', 'Skip / continue')}</button></div></div>`);
      const tx = $('#tx', el);
      tx.oninput = () => ($('#go', el).textContent = tx.value.trim() ? T('continue') : t('Atla / devam', 'Skip / continue'));
      $('#go', el).onclick = () => {
        const v = tx.value.trim();
        if (v) S.answers[it.id] = v.slice(0, 600);
        else delete S.answers[it.id];
        persist();
        next();
      };
      bindNav(false);
      return;
    }
    next();
  }

  function bindNav(keys = true) {
    const bk = $('#bk', el), nx = $('#nx', el);
    if (bk) bk.onclick = back;
    if (nx) nx.onclick = next;
    document.onkeydown = keys
      ? (e) => {
          if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
          if (e.key === 'ArrowLeft') back();
          const n = parseInt(e.key, 10);
          if (!Number.isNaN(n)) {
            const btns = $$('.likert button, .picks button', el);
            const b = btns[n - 1];
            if (b && n >= 1) b.click();
          }
        }
      : null;
  }

  function intro() {
    const isIk = pub.module === 'ik';
    frame(html`<div class="sv-intro"><div class="card">
      <div class="eyebrow">${pub.org}</div>
      <h2 style="margin-top:10px">${pub.title}</h2>
      <p class="muted">${isIk
        ? t('Bu değerlendirme üç bölümden oluşur ve yaklaşık 35 dakika sürer. Kesintisiz bir zaman ve sessiz bir ortam seçin. Sonuçlarınız yalnızca sizi davet eden kurumun yetkilileriyle paylaşılır.', 'This assessment has three sections and takes about 35 minutes. Choose an uninterrupted time and a quiet place. Results are shared only with authorised staff of the inviting organization.')
        : t(`${L(base.name)} çalışmasına hoş geldiniz. Yaklaşık ${base.minutes} dakika sürer. Adınız, e-postanız veya telefonunuz sorulmaz; yanıtlar yalnızca toplu olarak raporlanır.`, `Welcome to the ${L(base.name)} survey. It takes about ${base.minutes} minutes. Your name, email or phone are not collected; responses are only reported in aggregate.`)}</p>
      <div class="dim-chips"><span class="chip"><b>${total - (isIk ? 3 : 0)}</b> ${T('questions')}</span><span class="chip"><b>~${base.minutes}</b> ${T('minutes')}</span>${!isIk ? html`<span class="chip">${raw(icon('lock'))} ${t('Anonim', 'Anonymous')}</span>` : ''}</div>
      <p class="dim" style="font-size:13px">${t('İpucu: Her soruda size en uygun seçeneğe dokunun; otomatik olarak sonraki soruya geçilir. Bilgisayarda 1–5 tuşlarını kullanabilirsiniz. Yarıda bırakırsanız aynı cihazdan kaldığınız yerden devam edebilirsiniz.', 'Tip: tap the option that fits best and you will move on automatically. On a computer you can use keys 1–5. If you stop halfway, you can resume on the same device.')}</p>
      <label class="check"><input type="checkbox" id="ok"> <span>${raw(isIk
        ? t('Verilerimin <a href="#/legal/kvkk-respondent" target="_blank">aydınlatma metninde</a> belirtilen amaçla işe alım değerlendirmesi için işlenmesine açık rıza veriyorum.', 'I give explicit consent for my data to be processed for recruitment assessment as described in the <a href="#/legal/kvkk-respondent" target="_blank">privacy notice</a>.')
        : t('Katılımın gönüllü olduğunu ve yanıtlarımın <a href="#/legal/kvkk-respondent" target="_blank">aydınlatma metninde</a> belirtildiği şekilde anonim olarak işleneceğini anladım.', 'I understand participation is voluntary and my answers are processed anonymously as described in the <a href="#/legal/kvkk-respondent" target="_blank">privacy notice</a>.'))}</span></label>
      <div class="row end">${S.start ? html`<button class="btn" id="restart">${t('Baştan başla', 'Start over')}</button>` : ''}<button class="btn primary" id="go">${S.start ? t('Kaldığım yerden devam et', 'Resume') : t('Başla', 'Start')} ${raw(icon('next'))}</button></div>
    </div></div>`, { progress: false });
    $('#go', el).onclick = () => {
      if (!$('#ok', el).checked) return toast(t('Devam etmek için onay kutusunu işaretleyin.', 'Please tick the box to continue.'), 'err');
      if (!S.start) S.start = Date.now();
      if (S.i < 0) S.i = 0;
      persist();
      show();
    };
    const rs = $('#restart', el);
    if (rs) rs.onclick = () => {
      if (isIk && S.cogStart) return toast(t('Süreli bölüm başladığı için baştan başlanamaz.', 'Cannot restart after the timed section has begun.'), 'err');
      Object.assign(S, { i: -1, answers: {}, meta: {}, timings: {}, start: null });
      persist();
      intro();
    };
  }

  async function finish() {
    frame(html`<div class="sv-intro"><div class="card center">
      <h2>${t('Göndermeye hazır', 'Ready to submit')}</h2>
      <p class="muted">${t('Tüm soruları tamamladınız. Yanıtlarınızı göndermek için aşağıdaki düğmeye dokunun.', 'You have completed all questions. Tap below to submit your answers.')}</p>
      <div class="row" style="justify-content:center"><button class="btn" id="bk">${raw(icon('back'))} ${T('back')}</button><button class="btn primary" id="go">${t('Yanıtlarımı gönder', 'Submit my answers')}</button></div></div></div>`);
    $('#bk', el).onclick = back;
    $('#go', el).onclick = async (e) => {
      const b = e.currentTarget;
      setBusy(b, true);
      const meta = { ...S.meta, lang: getLang() };
      if (pub.module === 'ik') {
        meta.cog_seconds = S.cogStart ? Math.round(((S.cogEnd || Date.now()) - S.cogStart) / 1000) : null;
        if (S.timeout) meta.timeout = true;
      }
      try {
        await api.submit(code, {
          answers: S.answers, meta, timings: S.timings,
          duration: S.start ? Math.round((Date.now() - S.start) / 1000) : null,
          device: kiosk ? null : (deviceToken() + ':' + code).slice(0, 64),
        });
        store.del(KEY(code));
        thanks();
      } catch (err) {
        setBusy(b, false);
        const m = String(err.message || '');
        if (m.includes('duplicate') || m.includes('completed')) {
          store.del(KEY(code));
          return message(el, t('Zaten yanıtlandı', 'Already answered'), errText(err), pub.org);
        }
        toast(errText(err), 'err');
      }
    };
  }

  function thanks() {
    document.onkeydown = null;
    frame(html`<div class="sv-intro"><div class="card center">
      <div style="width:64px;height:64px;border-radius:50%;margin:0 auto 14px;display:grid;place-items:center;background:rgba(61,214,176,.12);color:var(--c-excellent)">${raw(icon('check'))}</div>
      <h2>${t('Teşekkür ederiz', 'Thank you')}</h2>
      <p class="muted">${pub.module === 'ik' ? t('Değerlendirmeniz tamamlandı ve kaydedildi. Süreçle ilgili bilgilendirme kurum tarafından yapılacaktır.', 'Your assessment is complete and saved. The organization will contact you about next steps.') : t('Yanıtlarınız anonim olarak kaydedildi. Katkınız, daha iyi bir çalışma ortamı için doğrudan kullanılacak.', 'Your answers were saved anonymously. Your input will be used directly to improve the workplace.')}</p>
      ${kiosk ? html`<button class="btn primary" id="again">${t('Yeni katılımcı için başlat', 'Start for next participant')}</button>` : ''}
      <p class="dim mono" style="font-size:11px;margin-top:18px">Analiz ProX</p></div></div>`, { progress: false });
    const ag = $('#again', el);
    if (ag) ag.onclick = () => renderSurvey({ code });
  }

  show();
}

function message(el, title, body, org) {
  el.innerHTML = toStr(html`<div class="sv"><div class="sv-top">${brand()}<div class="t"><b>${org || ''}</b></div>${langToggle()}</div>
    <div class="sv-body"><div class="sv-intro"><div class="card center"><h2>${title}</h2><p class="muted">${body}</p></div></div></div></div>`);
  bindLang(el);
}
