// SENARYO PLANLAMA & KRİZ HAZIRLIĞI — yöneticilerin yanıtladığı olgunluk değerlendirmesi
import { SCALES } from './common.js';

export const SCENARIOS = [
  { key: 'eco', name: { tr: 'Ekonomik daralma & finansal şok', en: 'Economic downturn & financial shock' }, short: { tr: 'Ekonomik', en: 'Economic' } },
  { key: 'tech', name: { tr: 'Teknolojik kırılma & yeni rakip', en: 'Technological disruption & new competitor' }, short: { tr: 'Teknolojik', en: 'Technology' } },
  { key: 'reg', name: { tr: 'Mevzuat & regülasyon değişimi', en: 'Regulatory change' }, short: { tr: 'Mevzuat', en: 'Regulatory' } },
];

const RAW = {
  eco: {
    finance: [
      ['Gelirlerin %30 düştüğü bir senaryoda kaç ay faaliyet sürdürebileceğimizi hesapladık ve izliyoruz.', 'We have calculated, and monitor, how many months we could operate if revenue fell by 30%.'],
      ['Kur ve faiz riskine karşı tanımlı bir koruma (hedging) politikamız var.', 'We have a defined hedging policy against FX and interest-rate risk.'],
      ['Krizde devreye alınacak maliyet azaltma adımları önceden önceliklendirilmiştir.', 'Cost-reduction steps to activate in a crisis are prioritized in advance.'],
    ],
    ops: [
      ['Talep düştüğünde kapasiteyi hızla küçültüp yeniden büyütebilecek esnekliğe sahibiz.', 'We have the flexibility to scale capacity down and back up quickly when demand drops.'],
      ['Kritik süreçler için yazılı ve test edilmiş iş sürekliliği planlarımız var.', 'We have written and tested business continuity plans for critical processes.'],
      ['Hangi ürün/hizmetlerin kârlı olduğunu güncel verilerle biliyoruz.', 'We know, with current data, which products/services are profitable.'],
    ],
    hr: [
      ['Kriz döneminde kilit çalışanları elde tutmaya yönelik bir planımız var.', 'We have a plan to retain key employees during a crisis.'],
      ['Çalışanları farklı görev ve birimlere esnek biçimde kaydırabiliyoruz.', 'We can flexibly redeploy employees across roles and units.'],
      ['Zor kararları çalışanlara şeffaf ve zamanında anlatacak bir iletişim planımız var.', 'We have a plan to communicate tough decisions to employees transparently and on time.'],
    ],
    supply: [
      ['Finansal olarak zayıflayan tedarikçileri erken fark edecek bir izleme yapıyoruz.', 'We monitor suppliers so we can spot those weakening financially early.'],
      ['Kritik girdiler için alternatif tedarikçiler önceden onaylanmıştır.', 'Alternative suppliers for critical inputs are pre-approved.'],
      ['Stok ve sipariş politikalarımız talep dalgalanmalarına göre hızla ayarlanabilir.', 'Our inventory and ordering policies can be adjusted quickly to demand swings.'],
    ],
    reputation: [
      ['Kriz anında müşterilere net ve tutarlı mesaj verecek sorumlular bellidir.', 'Owners are designated to give customers clear, consistent messages in a crisis.'],
      ['Banka, yatırımcı ve ortaklarla düzenli ve güven veren bir iletişimimiz var.', 'We maintain regular, confidence-building communication with banks, investors and partners.'],
      ['Kriz sırasında kalite ve hizmet seviyesini koruyacak önlemlerimiz tanımlıdır.', 'Measures to protect quality and service levels during a crisis are defined.'],
    ],
  },
  tech: {
    finance: [
      ['Yeni teknolojilere yatırım için ayrılmış ve hızlı kullanılabilir bir bütçemiz var.', 'We have a ring-fenced budget that can be deployed quickly for new technologies.'],
      ['Teknoloji yatırımlarının geri dönüşünü (ROI) ölçüyor ve takip ediyoruz.', 'We measure and track the return (ROI) on technology investments.'],
      ['Rakip bir teknolojinin gelirimize etkisini senaryolarla modelledik.', 'We have modelled the impact of a competing technology on our revenue using scenarios.'],
    ],
    ops: [
      ['Mevcut sistemlerimiz yeni teknolojilerle entegre olmaya uygundur.', 'Our current systems are fit to integrate with new technologies.'],
      ['Yeni bir teknolojiyi pilot olarak deneyip hızla yaygınlaştırma yöntemimiz var.', 'We have a way to pilot a new technology and scale it quickly.'],
      ['Eski (legacy) sistemlerin dönüşümü için bir yol haritamız var.', 'We have a roadmap for transforming legacy systems.'],
    ],
    hr: [
      ['Çalışanlarımızın dijital yetkinliklerini düzenli olarak ölçüp geliştiriyoruz.', "We regularly assess and develop our employees' digital skills."],
      ['Gerekli teknoloji yetkinliklerini hızla işe alabilir veya dışarıdan sağlayabiliriz.', 'We can quickly hire or source the technology skills we need.'],
      ['Çalışanlar yeni teknolojileri tehdit değil fırsat olarak görüyor.', 'Employees see new technologies as an opportunity rather than a threat.'],
    ],
    supply: [
      ['Tedarik zincirimizde uçtan uca dijital görünürlüğe sahibiz.', 'We have end-to-end digital visibility across our supply chain.'],
      ['Tedarikçilerimizin teknolojik hazırlık düzeyini değerlendiriyoruz.', "We assess our suppliers' technological readiness."],
      ['Tedarik kararlarında veri analitiğini aktif olarak kullanıyoruz.', 'We actively use data analytics in supply decisions.'],
    ],
    reputation: [
      ['Pazarda yenilikçi bir kurum olarak algılanıyoruz.', 'We are perceived in the market as an innovative organization.'],
      ['Teknoloji yönümüzü müşteri ve paydaşlara düzenli olarak anlatıyoruz.', 'We regularly communicate our technology direction to customers and stakeholders.'],
      ['Sektörel iş birliklerine, girişimlere ve üniversitelere açığız.', 'We are open to industry partnerships, start-ups and universities.'],
    ],
  },
  reg: {
    finance: [
      ['Yeni düzenlemelerin (vergi, çevre, veri koruma) maliyet etkisini önceden hesaplıyoruz.', 'We estimate the cost impact of new regulations (tax, environment, data protection) in advance.'],
      ['Karbon/emisyon düzenlemelerinin (ör. AB SKDM/CBAM) maliyetlerimize etkisini biliyoruz.', 'We know the impact of carbon/emissions rules (e.g., EU CBAM) on our costs.'],
      ['Olası idari para cezaları ve uyum maliyetleri için finansal karşılık ayırdık.', 'We have set aside provisions for possible administrative fines and compliance costs.'],
    ],
    ops: [
      ['Süreçlerimizi yeni çevre ve İSG standartlarına hızla uyarlayabiliriz.', 'We can quickly adapt our processes to new environmental and OHS standards.'],
      ['Mevzuat değişikliklerini izleyen bir erken uyarı mekanizmamız var.', 'We have an early-warning mechanism that tracks regulatory changes.'],
      ['Ruhsat, izin ve denetim süreçlerimiz kişiye bağlı değil, sistematiktir.', 'Our licensing, permit and audit processes are systematic, not person-dependent.'],
    ],
    hr: [
      ['Uyum (compliance) sorumluluğu belirli bir kişi veya birimde net olarak tanımlıdır.', 'Compliance responsibility sits clearly with a named person or unit.'],
      ['Çalışanlar KVKK, İSG ve etik kurallar konusunda düzenli eğitim alıyor.', 'Employees receive regular training on data protection, OHS and ethics.'],
      ['Yeni düzenlemeler ilgili ekiplere anlaşılır talimatlara dönüştürülerek aktarılıyor.', 'New regulations are translated into clear instructions for the relevant teams.'],
    ],
    supply: [
      ['Tedarikçilerimizin mevzuata uyumunu (çevre, iş gücü, belgeler) denetliyoruz.', "We audit our suppliers' regulatory compliance (environment, labour, documentation)."],
      ['Gümrük ve dış ticaret kuralları değiştiğinde tedarik rotalarımızı hızla değiştirebiliriz.', 'We can quickly change supply routes when customs and trade rules change.'],
      ['Tedarikçilerle paylaşılan veriler sözleşme ve veri koruma güvencesi altındadır.', 'Data shared with suppliers is protected by contracts and data-protection safeguards.'],
    ],
    reputation: [
      ['Sürdürülebilirlik / ESG performansımızı şeffaf biçimde raporluyoruz.', 'We report our sustainability / ESG performance transparently.'],
      ['Düzenleyici kurumlarla yapıcı ve düzenli bir ilişkimiz var.', 'We have a constructive, regular relationship with regulators.'],
      ['Bir uyumsuzluk ortaya çıkarsa kullanılacak kriz iletişim planımız hazır.', 'A crisis communication plan is ready in case a compliance breach emerges.'],
    ],
  },
};

const AREAS = ['finance', 'ops', 'hr', 'supply', 'reputation'];
const ALL_ITEMS = [];
for (const s of SCENARIOS)
  AREAS.forEach((a) => RAW[s.key][a].forEach(([tr, en], i) => ALL_ITEMS.push({ id: `${s.key}_${a}_${i + 1}`, dim: a, scen: s.key, rev: false, tr, en })));

const extrasFor = (scens) =>
  scens.flatMap((s) => [
    { id: `lik_${s.key}`, type: 'rate5', scale: 'likelihood5', scen: s.key,
      tr: `"${s.name.tr}" senaryosunun önümüzdeki 24 ayda kurumunuzu etkileme olasılığı nedir?`,
      en: `How likely is the "${s.name.en}" scenario to affect your organization in the next 24 months?` },
    { id: `imp_${s.key}`, type: 'rate5', scale: 'impact5', scen: s.key,
      tr: `Bu senaryo gerçekleşirse kurumunuza etkisi ne olur?`,
      en: `If this scenario happens, what would its impact on your organization be?` },
  ]);

const base = {
  key: 'senaryo',
  icon: 'fork',
  order: 5,
  name: { tr: 'Senaryo Planlama & Kriz Hazırlığı', en: 'Scenario Planning & Crisis Readiness' },
  short: { tr: 'Senaryo Planlama', en: 'Scenarios' },
  tagline: {
    tr: 'Üç kriz senaryosunda beş kritik alanın hazırlık düzeyi ve risk maruziyeti.',
    en: 'Readiness of five critical areas across three crisis scenarios, with risk exposure.',
  },
  about: {
    tr: 'Yönetim ekibinin yanıtladığı bir olgunluk değerlendirmesi. Ekonomik şok, teknolojik kırılma ve mevzuat değişimi senaryolarında finans, operasyon, insan kaynakları, tedarik zinciri ve itibar alanlarının hazırlığını 1–5 olgunluk ölçeğiyle ölçer. Yöneticilerin olasılık ve etki tahminlerini hazırlıkla birleştirerek her senaryo için bir Risk Maruziyeti puanı üretir.',
    en: 'A maturity assessment completed by the leadership team. It rates readiness of finance, operations, HR, supply chain and reputation on a 1–5 maturity scale across economic-shock, technological-disruption and regulatory-change scenarios, and combines leaders\' likelihood and impact estimates with readiness to produce a Risk Exposure score for each scenario.',
  },
  audience: 'managers',
  minutes: 12,
  scale: 'maturity5',
  indexName: { tr: 'Kriz Hazırlık Endeksi', en: 'Crisis Readiness Index' },
  dims: [
    { key: 'finance', name: { tr: 'Finansal Dayanıklılık', en: 'Financial Resilience' }, short: { tr: 'Finans', en: 'Finance' },
      actions: { tr: ['13 haftalık yuvarlanan nakit akışı tahmini ve stres testi kurun.', 'Kur/faiz riski için yönetim kurulu onaylı bir koruma politikası yazın.', 'Kriz anında devreye girecek maliyet kesintilerini 3 kademe olarak hazırlayın.'],
                 en: ['Set up a 13-week rolling cash-flow forecast with stress tests.', 'Write a board-approved FX/interest hedging policy.', 'Prepare crisis cost cuts in three pre-agreed tiers.'] } },
    { key: 'ops', name: { tr: 'Operasyonel Esneklik', en: 'Operational Flexibility' }, short: { tr: 'Operasyon', en: 'Operations' },
      actions: { tr: ['Kritik süreçler için iş sürekliliği planı (BCP) yazıp yılda en az bir kez tatbikat yapın.', 'Ürün/müşteri kârlılık analizini aylık hâle getirin.', 'Kapasite esnekliği için vardiya ve fason seçeneklerini önceden tanımlayın.'],
                 en: ['Write business continuity plans for critical processes and exercise them at least yearly.', 'Make product/customer profitability analysis monthly.', 'Pre-define shift and subcontracting options for capacity flexibility.'] } },
    { key: 'hr', name: { tr: 'İK Uyum Kabiliyeti', en: 'HR Adaptability' }, short: { tr: 'İK', en: 'HR' },
      actions: { tr: ['Kilit pozisyonlar için yedekleme (ardıl) planı çıkarın.', 'Çapraz yetkinlik matrisiyle çalışanların kaydırılabileceği rolleri belirleyin.', 'Kriz iletişim planında çalışanlara yönelik mesaj ve sorumluları tanımlayın.'],
                 en: ['Create succession plans for key positions.', 'Use a cross-skills matrix to identify roles staff can move into.', 'Define employee messaging and owners in the crisis communication plan.'] } },
    { key: 'supply', name: { tr: 'Tedarik Zinciri', en: 'Supply Chain' }, short: { tr: 'Tedarik', en: 'Supply' },
      actions: { tr: ['Tek kaynaklı kritik girdiler için ikinci tedarikçi onayı başlatın.', 'Tedarikçi risk skor kartı (finansal, coğrafi, uyum) oluşturun.', 'Emniyet stoklarını talep değişkenliği ve tedarik süresine göre yeniden hesaplayın.'],
                 en: ['Start qualifying second sources for single-source critical inputs.', 'Create a supplier risk scorecard (financial, geographic, compliance).', 'Recalculate safety stocks from demand variability and lead times.'] } },
    { key: 'reputation', name: { tr: 'İtibar & Paydaş Yönetimi', en: 'Reputation & Stakeholders' }, short: { tr: 'İtibar', en: 'Reputation' },
      actions: { tr: ['Kriz sözcüsü, onay zinciri ve hazır mesaj şablonlarını belirleyin.', 'Banka ve kilit müşterilerle düzenli bilgilendirme ritmi kurun.', 'ESG/sürdürülebilirlik göstergelerini yıllık raporlamaya başlayın.'],
                 en: ['Designate a crisis spokesperson, approval chain and message templates.', 'Set a regular update rhythm with banks and key customers.', 'Start annual reporting of ESG/sustainability indicators.'] } },
  ],
  items: ALL_ITEMS,
  attention: null,
  extras: extrasFor(SCENARIOS),
  meta: [
    { key: 'function', label: { tr: 'Sorumlu olduğunuz alan', en: 'Your area of responsibility' },
      options: [
        { v: 'exec', tr: 'Genel müdür / üst yönetim', en: 'CEO / executive' },
        { v: 'finance', tr: 'Finans', en: 'Finance' },
        { v: 'ops', tr: 'Operasyon / üretim', en: 'Operations / production' },
        { v: 'hr', tr: 'İnsan kaynakları', en: 'Human resources' },
        { v: 'supply', tr: 'Satın alma / tedarik zinciri', en: 'Procurement / supply chain' },
        { v: 'sales', tr: 'Satış / pazarlama', en: 'Sales / marketing' },
        { v: 'other', tr: 'Diğer', en: 'Other' },
      ] },
  ],
  minGroupN: 2,
  settings: ['scenarios'],
};

// Değerlendirmede seçilen senaryolara göre modülü daralt
base.forSettings = (pub = {}) => {
  const keys = pub.scenarios && pub.scenarios.length ? pub.scenarios : SCENARIOS.map((s) => s.key);
  const scens = SCENARIOS.filter((s) => keys.includes(s.key));
  return { ...base, items: ALL_ITEMS.filter((it) => keys.includes(it.scen)), extras: extrasFor(scens), scenarios: scens };
};
base.scenarios = SCENARIOS;
base.areas = AREAS;
base.scaleLabels = SCALES.maturity5;

export default base;
