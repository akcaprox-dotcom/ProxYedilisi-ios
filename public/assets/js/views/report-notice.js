import { html } from '../core/util.js';
import { t } from '../core/i18n.js';

// ------------------------------------------------------------ SORUMLULUK NOTU (tüm raporların sonunda)
export function reportNotice(key) {
  return html`<div class="rp-notice">
    <p><b>${t('Bu rapor nasıl kullanılmalı?', 'How to use this report')}</b> ${t('Bu rapor, katılımcıların verdiği yanıtların istatistiksel bir özetidir; bir tahmin aracıdır, kesin bir yargı değildir. Sonuçlar yanıt sayısına, katılım oranına ve yanıtların içtenliğine bağlıdır. Güven aralıklarını dikkate alın, ilişkiyi neden-sonuç olarak okumayın ve önemli kararlardan önce bulguları görüşmeler ve iş verileriyle doğrulayın.', 'This report is a statistical summary of respondents\' answers — an estimate, not a definitive judgement. Results depend on the number of responses, participation and candour. Mind the confidence intervals, do not read correlation as causation, and validate findings with interviews and business data before major decisions.')}</p>
    <p>${t('Analiz ProX yalnızca bir analiz platformudur. Değerlendirmeyi yürüten, sonuçları yorumlayan ve bunlara dayanarak karar alan kurumdur; bu işlemlerin sorumluluğu tamamen kuruma aittir.', 'Analiz ProX is an analytics platform only. The organization that runs the assessment, interprets the results and acts on them is solely responsible for those actions.')}
      <span class="no-print"> · <a href="#/guide/${key}">${t('Panel kılavuzu', 'Panel guide')}</a> · <a href="#/guide/principles">${t('Doğru yorumlama ilkeleri', 'Interpretation principles')}</a> · <a href="#/legal/terms">${t('Kullanım Koşulları', 'Terms of Use')}</a></span></p>
  </div>`;
}

