// =====================================================================
//  YASAL METİNLER — Gizlilik Politikası · KVKK Aydınlatma (kurum / katılımcı)
//  · Kullanım Koşulları ve Sorumluluk Reddi
//  Bu dosya tarayıcıda (views/legal.js) ve Node'da (tools/build-static.mjs →
//  web/gizlilik.html, web/privacy.html) kullanılır; tarayıcıya özgü kod içermez.
//  Yayından önce bir hukukçuya okutulması önerilir.
// =====================================================================
export const UPDATED = '2026-10-27';
const MAIL = 'analizprox@gmail.com';
const MIN_N = 5;

export const DOCS = {
  // ---------------------------------------------------------------- GİZLİLİK POLİTİKASI
  privacy: {
    title: { tr: 'Gizlilik Politikası', en: 'Privacy Policy' },
    tr: `
<p>Bu politika, <b>Analiz ProX</b> web sitesi ve mobil uygulamalarının ("Platform") hangi kişisel verileri, hangi amaçla, hangi altyapı üzerinde işlediğini açık ve anlaşılır biçimde anlatır. Platformu kullanarak bu politikayı okuduğunuzu kabul edersiniz.</p>

<h3>1. Biz kimiz?</h3>
<p>Analiz ProX, kurumların çalışan deneyimi, güven, stres, toplantı verimliliği, kriz hazırlığı, vizyon uyumu ve aday değerlendirme analizleri yapabilmesi için geliştirilmiş bir <b>yazılım ve analiz platformudur</b>. Platform, bireysel geliştirici <b>Barış Akça</b> tarafından işletilir (Bursa, Türkiye). İletişim: <a href="mailto:${MAIL}">${MAIL}</a></p>
<p>Platform yalnızca bir <b>araçtır</b>: anketleri kurumlar oluşturur, katılımcıları kurumlar davet eder ve sonuçları kurumlar yorumlar. Analiz ProX, kurumlar adına anket yürütmez, çalışanlarla doğrudan iletişime geçmez ve danışmanlık hizmeti vermez.</p>

<h3>2. Roller: kim veri sorumlusu?</h3>
<ul>
<li><b>Kurum hesapları için</b> (ad soyad, telefon, e-posta, kurum bilgileri): veri sorumlusu Analiz ProX'tir.</li>
<li><b>Anket ve değerlendirme yanıtları için</b>: veri sorumlusu, değerlendirmeyi oluşturan ve katılımcıları davet eden <b>kurumdur</b>. Analiz ProX bu verileri yalnızca kurumun talimatıyla, platformun teknik işleyişi için işleyen <b>veri işleyendir</b>.</li>
</ul>

<h3>3. Hangi verileri topluyoruz?</h3>
<p><b>a) Kurum yöneticileri (hesap sahipleri):</b> ad soyad; cep telefonu numarası (giriş ve doğrulama için); e-posta adresi (yalnızca iletişim için, doğrulanmaz); şifrenizin geri döndürülemez özeti (şifrenin kendisi hiçbir yerde saklanmaz); unvan ve dil tercihi; kurum adı (veya yerine kullandığınız rumuz), sektör ve çalışan sayısı aralığı; oluşturduğunuz değerlendirmeler ve ayarları; Analiz ProX'in size gönderdiği mesajların okunma durumu; şifre sıfırlama taleplerinin tarihi; deneme süresi ve abonelik durumu (bitiş tarihi, mağaza, yenilenme durumu). Kart veya ödeme bilgileriniz bize ulaşmaz; ödemeyi Apple, Google veya Microsoft alır.</p>
<p><b>Kurum adı yerine rumuz kullanabilirsiniz.</b> Platform, gerçek işletme adınızı girmenizi şart koşmaz ve bunu istemez. Kurum adı alanına yalnızca sizin bileceğiniz bir rumuz veya kod (ör. "Testlerim 1980", "Mavi Ekip") yazabilirsiniz; hizmetin hiçbir özelliği bundan etkilenmez. Bu alana ne yazacağınız tamamen sizin kararınızdır. Verileri korumak için teknik ve idari önlemleri alıyoruz; ancak internet üzerinden işlenen hiçbir veri için risk tamamen ortadan kaldırılamaz. Bu nedenle işletmenizi tanımlayan bilgileri paylaşmamanızı, gerekmedikçe gerçek ad yerine rumuz kullanmanızı öneririz. Gerçek ad girmeyi tercih etmeniz hâlinde bu bilgi de bu politikadaki önlemlerle korunur.</p>
<p><b>b) Çalışan anketi katılımcıları:</b> sorulara verilen yanıtlar; katılımcının kendisinin seçtiği grup bilgileri (birim, pozisyon grubu, kıdem aralığı gibi); soru başına yanıt süreleri; aynı cihazdan ikinci kez yanıt verilmesini önlemek için cihazda üretilen <b>rastgele</b> bir kimlik; dil. <b>Ad, soyad, e-posta, telefon, IP adresi veya konum yanıtlarla birlikte kaydedilmez.</b> Açık uçlu sorulara yazılan metinler olduğu gibi saklanır; katılımcılardan kimliklerini belli edecek bilgi yazmamaları istenir.</p>
<p><b>c) İK aday değerlendirmesi katılımcıları:</b> kurumun verdiği aday kodu (ad soyad istenmez), pozisyon, kurumun isteğe bağlı girdiği e-posta ve not; adayın yanıtları; sunucuda hesaplanan puanlar; yanıt süreleri. Bu veriler adayla ilişkilendirilmiş olarak tutulur ve yalnızca adayı davet eden kurumun yetkililerine gösterilir.</p>
<p><b>d) Teknik veriler:</b> altyapı sağlayıcılarımız, hizmetin güvenliği ve işleyişi için IP adresi, tarayıcı bilgisi ve istek zamanı gibi verileri kısa süreli sistem kayıtlarında işleyebilir. Bu kayıtlar anket yanıtlarıyla ilişkilendirilmez ve tarafımızca profil oluşturmak için kullanılmaz.</p>

<h3>4. Verileri hangi amaçlarla kullanıyoruz?</h3>
<ul>
<li>Hesap oluşturmak, telefon numarasını bir kez doğrulamak, giriş yapmanızı ve şifrenizi sıfırlamanızı sağlamak;</li>
<li>Değerlendirmeleri yayınlamak, yanıtları toplamak ve raporları hesaplayıp size göstermek;</li>
<li>Kötüye kullanımı önlemek (ör. aynı cihazdan mükerrer yanıt, haftada bir ile sınırlı şifre sıfırlama), hizmetin güvenliğini sağlamak;</li>
<li>Hizmetle ilgili zorunlu bildirimleri ve duyuruları platform içinden iletmek;</li>
<li>Yasal yükümlülükleri yerine getirmek.</li>
</ul>
<p><b>Reklam yapmıyoruz, verileri satmıyoruz, üçüncü taraf takip/analitik araçları (ör. reklam kimlikleri, izleme pikselleri) kullanmıyoruz ve verileri yapay zekâ modellerini eğitmek için kullanmıyoruz.</b></p>

<h3>5. Hukuki sebepler</h3>
<p>Kurum hesap verileri; sözleşmenin kurulması ve ifası, hukuki yükümlülük ve meşru menfaat hukuki sebeplerine (KVKK m.5/2-c, ç, f) dayanır. Anket ve değerlendirme verilerinin hukuki sebebini kurum belirler ve katılımcılarına bildirir; İK aday değerlendirmelerinde aday, başlamadan önce açık rızasını verir.</p>

<h3>6. Altyapı ve hizmet sağlayıcılarımız (şeffaflık)</h3>
<p>Platform aşağıdaki hizmet sağlayıcılar üzerinde çalışır. Her biri yalnızca belirtilen iş için gereken verilere erişir:</p>
<table>
<tr><th>Sağlayıcı</th><th>Ne için</th><th>Veri ve konum</th></tr>
<tr><td><b>Supabase Inc.</b></td><td>Veritabanı, kimlik doğrulama, sunucu fonksiyonları</td><td>Tüm hesap, değerlendirme ve yanıt verileri. Veritabanı <b>Frankfurt, Almanya</b> (AWS eu-central-1) bölgesinde barındırılır.</td></tr>
<tr><td><b>Cloudflare Inc.</b></td><td>Web sitesinin barındırılması ve güvenli (HTTPS) iletimi</td><td>Site dosyalarını sunar; bağlantı sırasında IP adresi gibi teknik verileri işler. Küresel sunucu ağı.</td></tr>
<tr><td><b>İletimerkezi</b> (iletimerkezi.com)</td><td>Doğrulama ve şifre sıfırlama SMS'lerinin gönderimi</td><td>Yalnızca telefon numaranız ve 6 haneli kod. Türkiye.</td></tr>
<tr><td><b>RevenueCat Inc.</b></td><td>iOS ve Android abonelik satın alımlarının doğrulanması ve yönetimi</td><td>Kurumunuzun rastgele kimliği (uuid), satın alınan ürün, abonelik tarihleri ve mağazanın satın alma makbuzu. Ad, telefon veya anket verisi <b>gönderilmez</b>. ABD. (Windows aboneliklerinde Microsoft Store'un verdiği satın alma anahtarı doğrudan veritabanımızda, kurumunuzla ilişkili olarak saklanır.)</td></tr>
<tr><td><b>OpenRouter Inc.</b> ve <b>Anthropic PBC</b> (Claude yapay zekâ)</td><td>Yalnızca kurum yetkilisi "Derin Analiz"i başlattığında, ücretli abonelikte: sonuçların Claude yapay zekâ modeli ile yorumlanması. OpenRouter isteği Anthropic'e iletir.</td><td>Değerlendirmelerin toplu puanları (alan, madde ve grup ortalamaları), yanıt sayıları ve tarihleri; katılımcıların açık uçlu yorumları <b>yazıldığı gibi</b>; İK analizinde adayın kodu, pozisyonu ve test puanları. Kurum kullanıcılarının ve adayların <b>adı, telefonu, e-postası gönderilmez</b>. Kurum yetkilisinin tek seferlik onayıyla yapılır. ABD.</td></tr>
<tr><td><b>Apple / Google / Microsoft</b></td><td>Uygulamanın App Store, Google Play ve Microsoft Store üzerinden dağıtımı; abonelik ödemelerinin tahsili</td><td>Mağaza hesabınızla ilgili veriler, bu şirketlerin kendi politikalarına tabidir.</td></tr>
</table>
<p>Yazı tipleri ve tüm uygulama dosyaları kendi sunucumuzdan yüklenir; Google Fonts veya benzeri harici kaynaklar kullanılmaz.</p>

<h3>7. Yurt dışına aktarım</h3>
<p>Supabase ve Cloudflare yurt dışında yerleşik şirketlerdir ve verileriniz Türkiye dışındaki (Avrupa Birliği) sunucularda saklanır. Derin Analiz kullanıldığında yukarıda belirtilen toplu sonuçlar ve açık uçlu yorumlar, yalnızca analiz üretmek amacıyla ABD'deki OpenRouter ve Anthropic'e aktarılır; bu aktarım kurum yetkilisinin uygulama içinde verdiği açık onaya dayanır. Tüm aktarımlar KVKK m.9 ve ilgili mevzuatta öngörülen güvencelere uygun olarak yapılır.</p>
<h4>Yapay zekâ kullanımı</h4>
<p>"Claude ile Derin Analiz" özelliği Anthropic'in Claude yapay zekâ modelini kullanır. Üretilen metin karar destek amaçlıdır; kişiler hakkında yalnızca otomatik analize dayalı karar alınmamalıdır. Verileriniz, hizmet sağlayıcıların kendi koşulları gereği yapay zekâ modellerinin eğitiminde kullanılmamak üzere, yalnızca isteğe yanıt üretmek için işlenir. Üretilen analizler kurumunuzun hesabında saklanır ve değerlendirme ya da hesap silindiğinde silinir.</p>

<h3>8. Saklama ve silme</h3>
<ul>
<li>Hesap verileri, hesabınız açık olduğu sürece saklanır. <b>Hesabım → Hesabı sil</b> ile hesabınızı ve sahibi olduğunuz kurumlara ait tüm değerlendirme ve yanıtları uygulama içinden anında, kalıcı olarak silebilirsiniz.</li>
<li>Kurumlar tek bir yanıtı veya bir değerlendirmeyi tüm yanıtlarıyla birlikte istedikleri an silebilir.</li>
<li>Silinen veriler, altyapı sağlayıcısının yedeklerinden en geç 30 gün içinde kalkar.</li>
<li>Şifre sıfırlama kayıtları 7 günlük sınırın uygulanması için tutulur ve hesapla birlikte silinir.</li>
</ul>

<h3>9. Cihazınızda sakladıklarımız</h3>
<p>Çerez kullanmıyoruz. Tarayıcınızın yerel depolamasında (localStorage) yalnızca şunlar tutulur: oturum anahtarı (girişte kalmanız için), dil tercihi, seçili kurum, yarıda bırakılan anketin ilerlemesi (aynı cihazdan devam edebilmeniz için; gönderildiğinde silinir) ve mükerrer yanıtı önleyen rastgele cihaz kimliği. Bu bilgiler reklam veya takip amacıyla kullanılmaz.</p>

<h3>10. Güvenlik</h3>
<p>Tüm bağlantılar HTTPS ile şifrelenir. Her kurum yalnızca kendi verisini görebilir; bu kural sunucuda, veritabanı düzeyinde (satır düzeyi güvenlik) uygulanır. Katılımcılar yanıt tablolarını okuyamaz. İK testlerinin cevap anahtarı yalnızca sunucuda tutulur. Raporlarda ${MIN_N} kişiden az yanıtlı alt gruplar gösterilmez. Veri en aza indirme ilkesi gereği kurum adı yerine rumuz kullanılmasını öneririz (bkz. madde 3-a). Hiçbir sistem %100 güvenli değildir; bir güvenlik ihlali olursa mevzuatın öngördüğü şekilde bildirim yapılır.</p>

<h3>11. Çocuklar</h3>
<p>Platform 18 yaşından küçükler için tasarlanmamıştır ve bilerek 18 yaş altı kişilerden veri toplamaz. Kurumlar değerlendirmelere yalnızca 18 yaşını doldurmuş kişileri davet etmelidir.</p>

<h3>12. Haklarınız</h3>
<p>KVKK m.11 (ve uygulanabildiği ölçüde AB Genel Veri Koruma Tüzüğü) kapsamında; verilerinizin işlenip işlenmediğini öğrenme, bilgi talep etme, düzeltme, silme, işlemeye itiraz etme, aktarıldığı tarafları öğrenme ve zarara uğramanız hâlinde giderilmesini talep etme haklarına sahipsiniz. Talepleriniz için <a href="mailto:${MAIL}">${MAIL}</a> adresine yazabilirsiniz; en geç 30 gün içinde yanıtlanır. Anket katılımcıları, yanıtlarıyla ilgili taleplerini öncelikle kendilerini davet eden kuruma iletmelidir; yanıtlar anonim olduğundan Analiz ProX belirli bir kişiye ait yanıtı tespit edemez.</p>

<h3>13. Değişiklikler</h3>
<p>Bu politika güncellenebilir. Güncel metin her zaman bu sayfada, son güncelleme tarihiyle yayımlanır; önemli değişiklikler platform içinden duyurulur.</p>
`,
    en: `
<p>This policy explains, clearly and plainly, what personal data the <b>Analiz ProX</b> website and mobile apps (the "Platform") process, why, and on which infrastructure.</p>
<h3>1. Who we are</h3>
<p>Analiz ProX is a <b>software and analytics platform</b> that lets organizations run employee-experience, trust, stress, meeting-effectiveness, crisis-readiness, vision-alignment and candidate assessments. It is operated by independent developer <b>Barış Akça</b> (Bursa, Türkiye). Contact: <a href="mailto:${MAIL}">${MAIL}</a></p>
<p>The Platform is a <b>tool</b>: organizations create the surveys, invite the respondents and interpret the results. Analiz ProX does not run surveys on anyone's behalf, does not contact employees directly and does not provide consultancy.</p>
<h3>2. Roles</h3>
<ul><li><b>Organization accounts</b> (name, phone, email, organization details): Analiz ProX is the data controller.</li>
<li><b>Survey and assessment responses</b>: the <b>organization</b> that creates the assessment and invites respondents is the data controller; Analiz ProX acts as a <b>data processor</b>, processing the data only to operate the Platform on the organization's instructions.</li></ul>
<h3>3. Data we collect</h3>
<p><b>a) Organization admins:</b> full name; mobile number (for sign-in and verification); email (contact only, not verified); an irreversible hash of your password (the password itself is never stored); title and language; organization name (or the alias you use instead), sector and size band; the assessments you create; read status of messages from Analiz ProX; dates of password-reset requests; trial and subscription status (end date, store, renewal state). Card or payment details never reach us; Apple, Google or Microsoft collect payment.</p>
<p><b>You may use an alias instead of your organization's name.</b> The Platform does not require or ask for your real business name. You can enter an alias or code only you will recognise (e.g. "Tests 1980", "Blue Team"); no feature is affected. What you enter is entirely your choice. We apply technical and organisational safeguards, but no data processed over the internet is entirely free of risk, so we recommend not sharing information that identifies your business and using an alias unless you need the real name. If you choose to enter your real name, it is protected by the measures in this policy.</p>
<p><b>b) Employee-survey respondents:</b> answers; group information the respondent chooses (unit, position group, tenure band); response times per item; a <b>random</b> device identifier used only to prevent duplicate responses; language. <b>Name, email, phone, IP address or location are not stored with responses.</b> Free-text answers are stored as written; respondents are asked not to include identifying details.</p>
<p><b>c) HR candidates:</b> the candidate code given by the organization (no name is requested), position, and the optional email and note entered by the organization; the candidate's answers; scores calculated on the server; response times. These are linked to the candidate and shown only to authorised staff of the inviting organization.</p>
<p><b>d) Technical data:</b> our infrastructure providers may process IP address, browser details and request times in short-lived system logs for security and operations. These logs are not linked to survey answers and are not used by us for profiling.</p>
<h3>4. Purposes</h3>
<ul><li>Creating your account, verifying your phone once, signing in and resetting your password;</li><li>Publishing assessments, collecting responses and calculating reports;</li><li>Preventing abuse and keeping the service secure (e.g. duplicate responses, one password reset per week);</li><li>Sending essential service notices in the app;</li><li>Meeting legal obligations.</li></ul>
<p><b>We do not advertise, sell data, use third-party tracking or analytics tools, or use your data to train AI models.</b></p>
<h3>5. Legal basis</h3>
<p>Account data: performance of contract, legal obligation and legitimate interest. For survey data the organization determines and communicates the legal basis; HR candidates give explicit consent before starting.</p>
<h3>6. Infrastructure and service providers (transparency)</h3>
<table><tr><th>Provider</th><th>Purpose</th><th>Data and location</th></tr>
<tr><td><b>Supabase Inc.</b></td><td>Database, authentication, server functions</td><td>All account, assessment and response data. Database hosted in <b>Frankfurt, Germany</b> (AWS eu-central-1).</td></tr>
<tr><td><b>Cloudflare Inc.</b></td><td>Hosting and secure (HTTPS) delivery of the website</td><td>Serves site files; processes technical data such as IP address during connections. Global network.</td></tr>
<tr><td><b>İletimerkezi</b> (iletimerkezi.com)</td><td>Sending verification and password-reset SMS</td><td>Only your phone number and the 6-digit code. Türkiye.</td></tr>
<tr><td><b>RevenueCat Inc.</b></td><td>Validating and managing in-app subscription purchases</td><td>Your organization's random ID (uuid), purchased product, subscription dates and the store receipt. No name, phone or survey data is sent. USA.</td></tr>
<tr><td><b>OpenRouter Inc.</b> and <b>Anthropic PBC</b> (Claude AI)</td><td>Only when an authorised user starts "Deep Analysis" on a paid subscription: interpreting results with the Claude AI model. OpenRouter forwards the request to Anthropic.</td><td>Aggregated scores (dimension, item and group averages), response counts and dates; respondents' open-ended comments <b>as written</b>; for HR analysis the candidate code, position and test scores. <b>Names, phones and emails</b> of users and candidates are not sent. Based on a one-time consent by the organization. USA.</td></tr>
<tr><td><b>Apple / Google / Microsoft</b></td><td>Distributing the app via App Store, Google Play and Microsoft Store; collecting subscription payments</td><td>Subject to their own policies.</td></tr></table>
<p>Fonts and all app files are served from our own host; no Google Fonts or similar external resources are used.</p>
<h3>7. International transfers</h3>
<p>Supabase and Cloudflare are based outside Türkiye and data is stored on servers in the European Union. When Deep Analysis is used, the aggregated results and open-ended comments described above are transferred to OpenRouter and Anthropic in the USA solely to produce the analysis, based on the organization's explicit in-app consent. All transfers follow the safeguards required by applicable law.</p>
<h4>Use of AI</h4>
<p>"Deep Analysis with Claude" uses Anthropic's Claude AI model. The generated text is for decision support; decisions about individuals must not rely solely on automated analysis. Data is processed only to answer the request. Generated analyses are stored in your organization's account and deleted with the assessment or account.</p>
<h3>8. Retention and deletion</h3>
<ul><li>Account data is kept while your account is open. Use <b>My account → Delete account</b> to permanently delete your account and all data of organizations you own, instantly, inside the app.</li><li>Organizations can delete any single response or an assessment with all its responses at any time.</li><li>Deleted data leaves provider backups within 30 days at the latest.</li><li>Password-reset logs are kept to enforce the 7-day limit and are deleted with the account.</li></ul>
<h3>9. Data stored on your device</h3>
<p>We do not use cookies. Local storage holds only: the session token, language, selected organization, progress of an unfinished survey (deleted on submission) and the random device identifier. None of it is used for advertising or tracking.</p>
<h3>10. Security</h3>
<p>All connections use HTTPS. Each organization can see only its own data, enforced on the server at database level (row-level security). Respondents cannot read response tables. HR answer keys exist only on the server. Sub-groups with fewer than ${MIN_N} responses are never shown. Following data minimisation, we recommend an alias instead of your real organization name (see 3-a). No system is 100% secure; breaches will be notified as required by law.</p>
<h3>11. Children</h3>
<p>The Platform is not intended for anyone under 18 and does not knowingly collect their data. Organizations must invite only people aged 18 or over.</p>
<h3>12. Your rights</h3>
<p>You may request access, rectification, erasure, objection, information about recipients and compensation. Write to <a href="mailto:${MAIL}">${MAIL}</a>; we reply within 30 days. Survey respondents should first contact the inviting organization; as responses are anonymous, Analiz ProX cannot identify an individual's answers.</p>
<h3>13. Changes</h3>
<p>This policy may be updated; the current version is always published here with its date, and significant changes are announced in the app.</p>
`,
  },

  // ---------------------------------------------------------------- KVKK — KURUM KULLANICILARI
  kvkk: {
    title: { tr: 'KVKK Aydınlatma Metni — Kurum Kullanıcıları', en: 'Privacy Notice — Organization Users' },
    tr: `
<p>6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") m.10 uyarınca, Analiz ProX hesabı oluşturan kurum yöneticilerine yönelik aydınlatma metnidir. Ayrıntılar için <a href="#/legal/privacy">Gizlilik Politikası</a>'na bakınız.</p>
<h3>Veri sorumlusu</h3><p>Barış Akça — Analiz ProX, Bursa / Türkiye · <a href="mailto:${MAIL}">${MAIL}</a></p>
<h3>İşlenen veriler</h3><p>Kimlik (ad soyad, unvan), iletişim (cep telefonu, e-posta), müşteri işlem (kurum adı veya rumuzu, sektör, çalışan aralığı, oluşturulan değerlendirmeler, mesaj okunma durumu), işlem güvenliği (şifre özeti, oturum ve şifre sıfırlama kayıtları) verileri.</p>
<h3>İşleme amaçları</h3><p>Üyelik ve kimlik doğrulama süreçlerinin yürütülmesi, hizmetin sunulması, bilgi güvenliğinin sağlanması, kötüye kullanımın önlenmesi, talep ve şikâyetlerin yönetilmesi, hizmetle ilgili bildirimlerin yapılması, mevzuattan doğan yükümlülüklerin yerine getirilmesi.</p>
<h3>Hukuki sebep ve toplama yöntemi</h3><p>Veriler, kayıt formu ve platform kullanımı sırasında elektronik ortamda toplanır; KVKK m.5/2-(c) sözleşmenin kurulması ve ifası, (ç) hukuki yükümlülük ve (f) meşru menfaat hukuki sebeplerine dayanır.</p>
<h3>Aktarım</h3><p>Veriler, hizmetin teknik işleyişi için altyapı sağlayıcılarına aktarılır: Supabase Inc. (veritabanı ve kimlik doğrulama; sunucular Frankfurt, Almanya), Cloudflare Inc. (barındırma), İletimerkezi (SMS gönderimi; yalnızca telefon numarası ve kod), RevenueCat Inc. (abonelik doğrulama; yalnızca kurum kimliği ve satın alma bilgisi), OpenRouter Inc. ve Anthropic PBC (yalnızca kurum yetkilisi Claude ile Derin Analiz'i başlattığında ve açık onayıyla; toplu sonuçlar ve açık uçlu yorumlar, ABD; kullanıcı adı/telefon/e-posta gönderilmez). Yurt dışına aktarım KVKK m.9'daki güvencelere uygun olarak yapılır. Yetkili kamu kurumlarına yalnızca kanunen zorunlu hâllerde aktarım yapılır.</p>
<h3>Kurum adı yerine rumuz</h3><p>Gerçek işletme adınızı girmek zorunda değilsiniz; Analiz ProX bunu talep etmez. Kurum adı alanına yalnızca sizin bileceğiniz bir rumuz veya kod (ör. "Testlerim 1980") yazabilirsiniz. Bu alana ne gireceğiniz tamamen size kalmıştır. Gerekli güvenlik önlemlerini alıyoruz; ancak internet ortamında işlenen veriler için risk hiçbir zaman tamamen sıfırlanamaz. İşletmenizi tanımlayan bilgileri girmemeniz, ileride doğabilecek olası sorunları en baştan önler; bu nedenle rumuz kullanmanızı öneririz.</p>
<h3>Haklarınız</h3><p>KVKK m.11 kapsamındaki haklarınızı <a href="mailto:${MAIL}">${MAIL}</a> adresine yazılı olarak iletebilirsiniz. Hesabınızı uygulama içinden <b>Hesabım → Hesabı sil</b> ile dilediğiniz an silebilirsiniz.</p>`,
    en: `
<p>Notice under Article 10 of Turkish Law No. 6698 on the Protection of Personal Data for organization admins. See the <a href="#/legal/privacy">Privacy Policy</a> for details.</p>
<h3>Data controller</h3><p>Barış Akça — Analiz ProX, Bursa / Türkiye · <a href="mailto:${MAIL}">${MAIL}</a></p>
<h3>Data processed</h3><p>Identity (name, title), contact (mobile, email), customer transaction (organization name or alias, sector, size band, assessments, message read status) and security data (password hash, session and password-reset logs).</p>
<h3>Purposes</h3><p>Membership and authentication, providing the service, information security, abuse prevention, handling requests, service notices and legal obligations.</p>
<h3>Legal basis and collection</h3><p>Collected electronically through sign-up and use of the Platform; based on contract performance, legal obligation and legitimate interest.</p>
<h3>Transfers</h3><p>To infrastructure providers for technical operation: Supabase Inc. (database and authentication; servers in Frankfurt, Germany), Cloudflare Inc. (hosting), İletimerkezi (SMS; phone number and code only), RevenueCat Inc. (subscription validation; organization ID and purchase data only), OpenRouter Inc. and Anthropic PBC (only when an authorised user starts Deep Analysis with Claude, with explicit consent; aggregated results and open-ended comments, USA; no user names, phones or emails). Transfers abroad follow the safeguards required by law; disclosures to authorities only where legally required.</p>
<h3>Alias instead of organization name</h3><p>You do not have to enter your real business name; Analiz ProX does not ask for it. You can enter an alias or code only you will recognise (e.g. "Tests 1980"). What you enter is entirely up to you. We take the necessary safeguards, but the risk for data processed online can never be reduced to zero. Not entering information that identifies your business avoids possible issues from the start, so we recommend using an alias.</p>
<h3>Your rights</h3><p>Send requests to <a href="mailto:${MAIL}">${MAIL}</a>. You can delete your account at any time via <b>My account → Delete account</b>.</p>`,
  },

  // ---------------------------------------------------------------- KVKK — KATILIMCILAR
  'kvkk-respondent': {
    title: { tr: 'Aydınlatma Metni — Katılımcılar', en: 'Privacy Notice — Respondents' },
    tr: `
<p>Bu değerlendirme, sizi davet eden kurum (<b>veri sorumlusu</b>) adına Analiz ProX platformu (<b>veri işleyen</b>) üzerinden yürütülür. Analiz ProX bir yazılım platformudur; anketin içeriğine ve sonuçların kullanımına ilişkin kararlar kuruma aittir.</p>
<h3>Çalışan anketleri</h3><p>Adınız, e-posta adresiniz, telefonunuz veya IP adresiniz yanıtlarınızla birlikte <b>kaydedilmez</b>. Yalnızca sorulara verdiğiniz yanıtlar, kendinizin seçtiği birim/grup bilgisi, yanıt süreleri ve aynı cihazdan tekrar yanıt verilmesini önlemek için cihazınızda üretilen rastgele bir kimlik saklanır. Sonuçlar kuruma yalnızca <b>toplu olarak</b> raporlanır; ${MIN_N} kişiden az yanıtlı alt gruplar raporda gösterilmez. Açık uçlu sorulara kimliğinizi belli edecek bilgi yazmamanızı öneririz. Katılım gönüllüdür; istediğiniz an yarıda bırakabilirsiniz.</p>
<p>Kurum, sonuçları yorumlamak için "Claude ile Derin Analiz" özelliğini kullanırsa toplu sonuçlar ve açık uçlu yorumlar (<b>yazdığınız gibi</b>) Anthropic'in Claude yapay zekâ modeline, OpenRouter aracılığıyla ABD'ye aktarılabilir. Bu nedenle açık uçlu yorumlara kendinizin veya başkalarının adını, telefonunu ya da kimliği belli eden bilgileri yazmayın. Çok az kişiyle yapılan (3 kişiden az) değerlendirmelerde yanıtlar anonim kalmaz; bu durum anketin giriş ekranında ayrıca belirtilir.</p>
<h3>Aday değerlendirmeleri</h3><p>Analiz ProX aday adını ve soyadını <b>saklamaz</b>. Yanıtlarınız, kurumun size verdiği bir aday kodu (ör. ADY-001) ve pozisyon bilgisiyle ilişkilendirilir; kod ile kimliğinizin eşleştirmesi yalnızca kurumun kendi kayıtlarındadır. Kurum davet için isteğe bağlı olarak e-posta adresinizi girmişse bu bilginin veri sorumlusu kurumdur. Sonuçlar yalnızca işe alım sürecinde, kurumun yetkili çalışanları tarafından değerlendirilir. Kurum dilerse sonuçlarınızı, adınız ve iletişim bilginiz paylaşılmadan, değerlendirme desteği için Anthropic'in Claude yapay zekâ modeli ile (OpenRouter aracılığıyla, ABD) analiz ettirebilir. Bu işlemler, başlamadan önce verdiğiniz açık rızaya dayanır. Sonuçlar ve yapay zekâ analizi tek başına işe alım kararı için kullanılmamalıdır; KVKK m.11/1-(g) uyarınca münhasıran otomatik sistemlerle analiz sonucu aleyhinize bir sonuç çıkmasına itiraz hakkınız vardır.</p>
<h3>Altyapı ve saklama</h3><p>Veriler Supabase (Frankfurt, Almanya) altyapısında saklanır ve Cloudflare üzerinden güvenli bağlantıyla iletilir. Veriler, kurum ilgili değerlendirmeyi veya hesabını silene kadar saklanır.</p>
<h3>Haklarınız</h3><p>KVKK m.11 kapsamındaki haklarınız için öncelikle sizi davet eden kuruma, ayrıca <a href="mailto:${MAIL}">${MAIL}</a> adresine başvurabilirsiniz. Çalışan anketleri anonim olduğundan belirli bir kişiye ait yanıt tespit edilemez.</p>`,
    en: `
<p>This assessment is run on behalf of the inviting organization (<b>data controller</b>) through the Analiz ProX platform (<b>data processor</b>). Analiz ProX is a software platform; decisions about the survey and the use of results belong to the organization.</p>
<h3>Employee surveys</h3><p>Your name, email, phone or IP address are <b>not stored</b> with your answers. Only your answers, the unit/group you select, response times and a random device identifier (to prevent duplicates) are kept. Results are reported only <b>in aggregate</b>; sub-groups with fewer than ${MIN_N} responses are never shown. Please avoid identifying details in free-text answers. Participation is voluntary.</p>
<p>If the organization uses "Deep Analysis with Claude", aggregated results and open-ended comments (<b>as you wrote them</b>) may be transferred to Anthropic's Claude AI model via OpenRouter (USA). Do not write your own or others' names, phone numbers or identifying details in comments. Very small assessments (fewer than 3 people) are not anonymous; this is shown on the start screen.</p>
<h3>Candidate assessments</h3><p>Analiz ProX does <b>not store</b> candidate names. Your answers are linked to a candidate code (e.g. ADY-001) and the position; only the organization's own records map the code to you. If the organization optionally entered your email for the invitation, it is the data controller for it. Results are reviewed only by authorised staff for recruitment. The organization may have your results analysed with Anthropic's Claude AI model (via OpenRouter, USA) without your name or contact details. This is based on the explicit consent you give before starting. Neither the results nor the AI analysis should be the sole basis for a hiring decision; you may object to an adverse outcome resulting solely from automated analysis.</p>
<h3>Infrastructure and retention</h3><p>Stored on Supabase (Frankfurt, Germany) and delivered securely via Cloudflare, until the organization deletes the assessment or its account.</p>
<h3>Your rights</h3><p>Contact the inviting organization first, or <a href="mailto:${MAIL}">${MAIL}</a>. Anonymous survey answers cannot be traced to an individual.</p>`,
  },

  // ---------------------------------------------------------------- KULLANIM KOŞULLARI + SORUMLULUK REDDİ
  terms: {
    title: { tr: 'Kullanım Koşulları ve Sorumluluk Reddi', en: 'Terms of Use and Disclaimer' },
    tr: `
<p>Bu koşullar, Analiz ProX web sitesi ve mobil uygulamalarının ("Platform") kullanımını düzenler. Hesap oluşturarak veya Platformu kullanarak bu koşulları kabul etmiş sayılırsınız.</p>

<h3>1. Platformun niteliği</h3>
<p>Analiz ProX bir <b>yazılım ve analiz platformudur</b>. Kurumlara hazır ölçme araçları, anonim yanıt toplama altyapısı ve istatistiksel raporlar sunar. Analiz ProX; anket yürütmez, katılımcı seçmez, kurumlar adına karar vermez, insan kaynakları, hukuk, sağlık veya yönetim danışmanlığı hizmeti vermez. <b>Platform yalnızca kurumun topladığı verilerin istatistiksel sonucunu gösterir.</b></p>

<h3>2. Kurumun sorumlulukları</h3>
<p>Platformu kullanan kurum ve kurum adına işlem yapan yöneticiler, Platform üzerinden yaptıkları <b>tüm işlemlerden münhasıran sorumludur</b>. Bu kapsamda kurum:</p>
<ul>
<li>Çalışanlarını ve adayları değerlendirmeye davet etmek için gerekli hukuki dayanağa sahip olmakla, katılımcıları KVKK ve iş mevzuatına uygun biçimde bilgilendirmekle ve gerektiğinde açık rızalarını almakla;</li>
<li>Katılımın gönüllü olmasını sağlamakla, katılımcılar üzerinde baskı kurmamakla, yanıt vermeyen veya olumsuz yanıt veren kişilere karşı hiçbir yaptırım uygulamamakla;</li>
<li>Anonimliği aşmaya, yanıtları belirli kişilerle eşleştirmeye, küçük grupları ayrıştırmaya veya ortak cihaz (kiosk) kullanımını izlemeye <b>çalışmamakla</b>;</li>
<li>Girdiği bilgilerin (aday adı, pozisyon, birim adları, davet metinleri vb.) doğruluğundan ve hukuka uygunluğundan;</li>
<li>Raporlara dayanarak aldığı kararlardan (işe alım, terfi, ücret, görev değişikliği, işten çıkarma, yatırım, yeniden yapılanma vb.) ve bu kararların sonuçlarından;</li>
<li>Ayrımcılık yasağı başta olmak üzere iş, sosyal güvenlik, kişisel verilerin korunması ve tüketici mevzuatına uymakla;</li>
<li>Hesabının, şifresinin ve hesabına eriştirdiği kişilerin güvenliğinden yükümlüdür.</li>
</ul>

<h3>3. Sonuçların doğru yorumlanması</h3>
<p>Raporlar; katılımcıların verdiği yanıtlara, yanıt sayısına, yanıt oranına ve katılımcıların dürüstlüğüne bağlı <b>istatistiksel tahminlerdir</b>. Bu nedenle:</p>
<ul>
<li>Sonuçlar, rapordaki güven aralıkları, yanıt sayısı ve veri kalitesi göstergeleriyle birlikte okunmalıdır. Az sayıda yanıtla elde edilen sonuçlar yanıltıcı olabilir.</li>
<li>Etki (ilişki) analizleri nedensellik değil <b>ilişki</b> gösterir.</li>
<li>Stres ve tükenmişlik göstergeleri grup düzeyinde risk taramasıdır; <b>bireysel tıbbi veya psikolojik tanı değildir</b>.</li>
<li>İK aday raporları bir <b>karar destek</b> aracıdır; tek başına işe alım veya red kararı için kullanılmamalı, yapılandırılmış mülakat, referans ve iş örnekleriyle birlikte değerlendirilmelidir.</li>
<li>Öneriler (aksiyon planı) genel nitelikli yönlendirmelerdir; kurumun kendi koşullarına göre uzman görüşüyle değerlendirilmelidir.</li>
</ul>
<p>Sonuçların yanlış yorumlanmasından, eksik veya hatalı veriyle elde edilen sonuçlardan ve bu sonuçlara dayanılarak alınan kararlardan Analiz ProX sorumlu tutulamaz. Doğru kullanım için uygulamadaki <a href="#/guide">Kullanım Kılavuzu</a>'nu okumanızı öneririz.</p>

<h3>4. Sorumluluğun sınırlandırılması</h3>
<p>Platform "olduğu gibi" ve "mevcut olduğu ölçüde" sunulur. Kesintisiz, hatasız çalışacağı veya belirli bir amaca uygun olacağı garanti edilmez. Yürürlükteki mevzuatın izin verdiği azami ölçüde Analiz ProX; dolaylı zararlardan, kâr kaybından, veri kaybından, iş kesintisinden ve kurumların Platformu kullanarak yaptığı işlemlerden doğan üçüncü kişi taleplerinden sorumlu değildir. Kurum, kendi işlemlerinden doğan taleplerde Analiz ProX'i sorumlu tutmayacağını kabul eder. Tüketici işlemlerinde tüketici mevzuatından doğan haklar saklıdır.</p>

<h3>5. Kabul edilemez kullanım</h3>
<p>Platform; katılımcıların kimliğini tespit etmeye çalışmak, ayrımcılık yapmak, yıldırma veya baskı amacıyla kullanılmak, hukuka aykırı içerik yaymak, sistemin güvenliğini aşmaya çalışmak veya başkası adına hesap açmak için kullanılamaz. Bu koşulların ihlali hâlinde Analiz ProX, önceden bildirimde bulunarak veya acil durumlarda bildirimsiz olarak hesabı <b>askıya alabilir</b> veya kapatabilir.</p>

<h3>6. Fikrî mülkiyet</h3>
<p>Platformun yazılımı, tasarımı, ölçme araçları, soru bankaları, puanlama yöntemleri ve rapor şablonları Analiz ProX'e aittir; izinsiz kopyalanamaz ve çoğaltılamaz. Kurumların topladığı veriler kurumlara aittir.</p>

<h3>7. Hizmet değişiklikleri ve ücretlendirme</h3>
<p>Analiz ProX, Platformun özelliklerini değiştirebilir, geliştirebilir veya sonlandırabilir.</p>
<h4>Ücretsiz deneme ve abonelik</h4>
<ul>
<li>Her yeni kurum, oluşturulduğu andan itibaren <b>30 gün ücretsiz</b> tam erişim kullanır. Deneme hakkı telefon numarası başına bir kez tanınır; kart bilgisi istenmez ve deneme sonunda otomatik ücretlendirme yapılmaz.</li>
<li>Deneme bittikten sonra Platformun tamamı (yedi panel) <b>"ProX Yedilisi" aylık aboneliği</b> ile kullanılır. Abonelik Analiz ProX'in iOS (App Store), Android (Google Play) ve Windows (Microsoft Store) uygulamaları içinden, ilgili mağazanın ödeme sistemiyle satın alınır.</li>
<li><b>Fiyat:</b> Uygulamada gösterilen fiyat mağazadan alınır. Her zaman mağazada geçerli olan güncel abonelik fiyatı uygulanır.</li>
<li><b>Yenileme ve iptal:</b> Abonelik her ay otomatik yenilenir; dönem bitiminden en az 24 saat önce iptal edilmezse bir sonraki dönem ücreti mağaza hesabınızdan tahsil edilir. Aboneliği App Store, Google Play veya Microsoft hesap ayarlarınızdan istediğiniz zaman yönetebilir ve iptal edebilirsiniz; iptal, içinde bulunulan dönemin sonunda geçerli olur.</li>
<li><b>İade:</b> Ödemeler Apple, Google veya Microsoft tarafından tahsil edildiğinden iade talepleri ilgili mağazanın iade politikasına göre mağazaya iletilir.</li>
<li>Abonelik <b>kuruma bağlıdır</b>; aynı hesapla web, Windows, Android ve iOS'ta geçerlidir.</li>
<li><b>Claude ile Derin Analiz</b> yalnızca ücretli abonelikte (deneme süresinde değil) kullanılır: Kurum Röntgeni için kurum başına ayda 2, İK aday analizi için ayda 50 analiz hakkı vardır; haklar her ayın 1'inde yenilenir, kullanılmayan hak devretmez. Analizler Anthropic'in Claude yapay zekâ modeliyle üretilir, karar destek amaçlıdır ve hata içerebilir; kişiler hakkında yalnızca bu analize dayanarak karar verilmemelidir. Analiz ProX hak sayısını ve kullanılan modeli hizmetin işleyişine göre değiştirebilir.</li>
<li>Deneme süresi dolduğunda veya abonelik sona erdiğinde veriler silinmez; açık anketler yanıt toplamaya devam eder. Ancak yeni değerlendirme oluşturma ile raporlara ve yanıt verilerine erişim, abonelik başlatılana kadar kapalı kalır. Hesabınızı ve verilerinizi dilediğiniz an silebilirsiniz.</li>
</ul>

<h3>8. Uygulanacak hukuk</h3>
<p>Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Uyuşmazlıklarda Bursa mahkemeleri ve icra daireleri yetkilidir; tüketicilerin kanundan doğan hakları saklıdır.</p>

<h3>9. İletişim</h3>
<p><a href="mailto:${MAIL}">${MAIL}</a></p>`,
    en: `
<p>These terms govern the use of the Analiz ProX website and mobile apps (the "Platform"). By creating an account or using the Platform you accept them.</p>
<h3>1. Nature of the Platform</h3>
<p>Analiz ProX is a <b>software and analytics platform</b> that provides measurement tools, anonymous response collection and statistical reports. It does not run surveys, select respondents, make decisions for organizations or provide HR, legal, health or management consultancy. <b>The Platform only shows the statistical result of the data collected by the organization.</b></p>
<h3>2. The organization's responsibilities</h3>
<p>The organization and admins acting on its behalf are <b>solely responsible for all actions</b> taken through the Platform, including:</p>
<ul><li>having a lawful basis to invite employees and candidates, informing them and obtaining consent where required;</li><li>keeping participation voluntary and never sanctioning anyone for not responding or for negative answers;</li><li><b>not attempting</b> to de-anonymise responses, match answers to individuals, isolate small groups or monitor shared-device (kiosk) use;</li><li>the accuracy and lawfulness of information they enter;</li><li>any decisions taken based on reports (hiring, promotion, pay, dismissal, investment, restructuring, etc.) and their consequences;</li><li>complying with labour, anti-discrimination, data-protection and consumer law;</li><li>keeping their account and password secure.</li></ul>
<h3>3. Interpreting results correctly</h3>
<p>Reports are <b>statistical estimates</b> that depend on the answers given, the number of responses, response rate and respondents' honesty. Read results together with confidence intervals, sample size and data-quality indicators; driver analysis shows <b>association, not causation</b>; stress and burnout indicators are group-level risk screens, <b>not medical or psychological diagnoses</b>; HR candidate reports are <b>decision support</b> and must not be the sole basis for hiring decisions; recommendations are general guidance. Analiz ProX is not liable for misinterpretation, for results based on incomplete or inaccurate data, or for decisions based on them. Please read the in-app <a href="#/guide">User Guide</a>.</p>
<h3>4. Limitation of liability</h3>
<p>The Platform is provided "as is" and "as available", without warranty of uninterrupted or error-free operation or fitness for a particular purpose. To the maximum extent permitted by law, Analiz ProX is not liable for indirect damages, lost profits, data loss, business interruption or third-party claims arising from organizations' use of the Platform. Statutory consumer rights are unaffected.</p>
<h3>5. Acceptable use</h3>
<p>The Platform must not be used to identify respondents, discriminate, intimidate, spread unlawful content, breach security or open accounts on behalf of others. Analiz ProX may <b>suspend</b> or close accounts that breach these terms.</p>
<h3>6. Intellectual property</h3>
<p>The software, design, measurement tools, item banks, scoring methods and report templates belong to Analiz ProX. Data collected by organizations belongs to them.</p>
<h3>7. Changes and pricing</h3>
<p>Features may change.</p>
<h4>Free trial and subscription</h4>
<ul>
<li>Every new organization gets <b>30 days of free</b> full access. One trial per phone number; no card is required and nothing is charged automatically at the end of the trial.</li>
<li>After the trial, the whole Platform (all seven panels) is available with the monthly <b>"ProX Yedilisi"</b> subscription, purchased inside the Analiz ProX iOS (App Store), Android (Google Play) and Windows (Microsoft Store) apps via the store's payment system.</li>
<li><b>Price:</b> the price shown in the app comes from the store; the current subscription price in the store always applies.</li>
<li><b>Renewal and cancellation:</b> the subscription renews monthly unless cancelled at least 24 hours before the end of the period, and is charged to your store account. Manage or cancel any time in your App Store, Google Play or Microsoft account settings; cancellation takes effect at the end of the current period.</li>
<li><b>Refunds</b> are handled by Apple, Google or Microsoft under their policies.</li>
<li>The subscription belongs to the <b>organization</b> and applies on web, Windows, Android and iOS with the same account.</li>
<li><b>Deep Analysis with Claude</b> is available only on a paid subscription (not during the trial): 2 Organization X-Ray analyses and 50 HR candidate analyses per organization per month, renewing on the 1st; unused analyses do not roll over. Analyses are produced by Anthropic's Claude AI model, are for decision support and may contain errors; decisions about individuals must not rely solely on them. Analiz ProX may change quotas and the model used.</li>
<li>When the trial or subscription ends, nothing is deleted and open surveys keep collecting answers, but creating assessments and accessing reports and response data are locked until a subscription is started.</li>
</ul>
<h3>8. Governing law</h3>
<p>Turkish law applies; Bursa courts have jurisdiction, without prejudice to consumers' statutory rights.</p>
<h3>9. Contact</h3><p><a href="mailto:${MAIL}">${MAIL}</a></p>`,
  },
};
