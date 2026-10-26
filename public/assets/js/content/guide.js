// =====================================================================
//  KULLANIM KILAVUZU — genel bölümler + 7 panel için ayrı kılavuz
//  Uygulamanın gerçek davranışıyla (eşikler, formüller, düğme adları) birebir uyumludur.
// =====================================================================

// ---------------------------------------------------------------- GENEL BÖLÜMLER
export const GENERAL = [
  {
    id: 'start',
    icon: 'play',
    title: { tr: 'Başlarken', en: 'Getting started' },
    tr: `
<p>Analiz ProX, yedi analiz panelini tek bir hesapta toplar. Bir kez kayıt olur, kurumunuzu tanımlar ve tüm panelleri aynı hesaptan kullanırsınız. Çalışanlarınız ve adaylarınız hiçbir zaman hesap açmaz; yalnızca sizin gönderdiğiniz bağlantıyla yanıt verir.</p>
<h3>Hesap oluşturma</h3>
<ol class="steps">
<li><b>Hesap oluştur</b>'a dokunun. Ad soyad, e-posta (iletişim için), cep telefonu ve en az 8 karakterli, harf ve rakam içeren bir şifre girin. Aydınlatma metnini onaylayın.</li>
<li>Telefonunuza SMS ile gelen <b>6 haneli kodu</b> girin. Telefon numaranız yalnızca bu adımda, bir kez doğrulanır.</li>
<li><b>Kurumunuzu tanımlayın:</b> kurum adı, sektör ve çalışan sayısı. Bu ad raporlarda ve katılımcı ekranlarında görünür.</li>
<li><b>Paneller</b> ekranına ulaşırsınız. Buradan istediğiniz panele girip değerlendirme başlatabilirsiniz.</li>
</ol>
<h3>Giriş ve şifre</h3>
<ul>
<li>Girişte <b>cep telefonu numaranızı</b> ve şifrenizi kullanırsınız; her girişte SMS kodu istenmez.</li>
<li><b>Şifremi unuttum:</b> telefonunuza gelen kodla yeni şifre belirlersiniz. Kod 10 dakika geçerlidir. Güvenlik nedeniyle bu talep <b>haftada yalnızca bir kez</b> yapılabilir; kodu aldıktan sonra işlemi tamamlamaya dikkat edin.</li>
<li>Şifrenizi giriş yapmışken <b>Hesabım</b> sayfasından dilediğiniz zaman değiştirebilirsiniz.</li>
</ul>
<h3>Gezinme</h3>
<ul>
<li><b>Ana panel:</b> yedi paneli yörünge görünümünde gösteren giriş ekranı. Bir panele dokunarak tanıtımını ve örnek raporunu görebilirsiniz.</li>
<li><b>Paneller:</b> kurumunuzun çalışma alanı. Her panelde kaç değerlendirme ve yanıt olduğunu gösterir.</li>
<li><b>Mesajlar (zarf simgesi):</b> Analiz ProX'ten gelen bildirim ve duyurular. Okunmamış mesaj sayısı simgenin üzerinde görünür.</li>
<li>Her sayfanın başındaki <b>← Geri</b> düğmesi bir üst sayfaya döner.</li>
<li>Sağ üstteki baş harfleriniz: <b>Hesabım</b>, <b>Çıkış</b>.</li>
</ul>
<div class="tip"><b>İpucu:</b> Her panelin sayfasında <b>Örnek rapor</b> düğmesi vardır. Gerçek bir değerlendirme başlatmadan önce raporun neye benzediğini görmek ve yöneticilerinize göstermek için kullanın.</div>`,
    en: `
<p>Analiz ProX brings seven analysis panels together in one account. Sign up once, define your organization and use every panel from the same account. Employees and candidates never create accounts; they respond through the link you send.</p>
<h3>Creating an account</h3>
<ol class="steps">
<li>Tap <b>Create account</b>. Enter your name, email (for contact), mobile number and a password of at least 8 characters with letters and numbers. Accept the privacy notice.</li>
<li>Enter the <b>6-digit code</b> sent to your phone. Your number is verified only once, at this step.</li>
<li><b>Set up your organization:</b> name, sector and size. The name appears on reports and respondent screens.</li>
<li>You arrive at <b>Panels</b>, where you can open any panel and start an assessment.</li>
</ol>
<h3>Sign-in and password</h3>
<ul><li>Sign in with your <b>mobile number</b> and password; no SMS code is required at each sign-in.</li>
<li><b>Forgot password:</b> set a new password with a texted code (valid 10 minutes). For security this can be requested <b>only once a week</b>.</li>
<li>Change your password any time in <b>My account</b>.</li></ul>
<h3>Navigation</h3>
<ul><li><b>Home:</b> the orbit screen with all seven panels, their descriptions and sample reports.</li>
<li><b>Panels:</b> your organization's workspace.</li>
<li><b>Messages (envelope):</b> notices from Analiz ProX; unread count shown on the icon.</li>
<li><b>← Back</b> at the top of each page returns to the parent page.</li></ul>
<div class="tip"><b>Tip:</b> every panel has a <b>Sample report</b> button. Use it to see what the report looks like before launching a real assessment.</div>`,
  },
  {
    id: 'run',
    icon: 'link',
    title: { tr: 'Değerlendirme yürütme ve paylaşım', en: 'Running and sharing an assessment' },
    tr: `
<h3>Değerlendirmenin yaşam döngüsü</h3>
<ol class="steps">
<li><b>Oluştur:</b> Panel sayfasında <b>Yeni değerlendirme</b>'ye dokunun; başlığı ve panele özel ayarları girin (birimler, toplantı bilgileri, senaryolar, öncelikler, aday bilgileri vb.). <b>Beklenen katılımcı sayısı</b> girerseniz yanıt oranı hesaplanır.</li>
<li><b>Paylaş:</b> Oluşturduğunuz anda size özel bir bağlantı ve QR kod üretilir. Bağlantıyı kopyalayabilir, WhatsApp veya e-postayla gönderebilir, hazır <b>davet metnini</b> kopyalayabilir ya da QR kodu bir panoya/afişe basabilirsiniz.</li>
<li><b>Takip et:</b> Değerlendirme sayfasında gelen yanıt sayısını, yanıt oranını ve her yanıtın <b>yanıt güveni</b> puanını görürsünüz.</li>
<li><b>Kapat:</b> Yeterli yanıt toplandığında <b>Yanıtlara kapat</b>'a dokunun ya da oluştururken bir <b>kapanış tarihi</b> belirleyin. Kapalı değerlendirme yeni yanıt almaz; gerekirse <b>Yeniden aç</b> ile açabilirsiniz.</li>
<li><b>Raporla:</b> <b>Raporu aç</b> ile analizi görün; <b>PDF olarak kaydet</b> ile çıktısını alın, <b>CSV indir</b> ile ham veriyi Excel'de açın.</li>
</ol>
<h3>Paylaşım yöntemleri</h3>
<table>
<tr><th>Yöntem</th><th>Ne zaman</th></tr>
<tr><td>Bağlantı (WhatsApp, e-posta, kurum içi mesajlaşma)</td><td>Çalışanların kendi telefonu veya bilgisayarı varsa. Her cihazdan yalnızca bir yanıt kabul edilir.</td></tr>
<tr><td>QR kod (pano, mola alanı, toplantı salonu)</td><td>Sahada çalışanlar için; telefon kamerasıyla okutulur.</td></tr>
<tr><td><b>Ortak cihaz (kiosk) modu</b></td><td>Fabrika veya mağazada tek bir tablet/bilgisayardan sırayla birden fazla kişi yanıt verecekse. Değerlendirmeyi oluştururken işaretleyin; her yanıttan sonra ekranda "Yeni katılımcı için başlat" düğmesi çıkar.</td></tr>
</table>
<h3>Katılımcı deneyimi</h3>
<ul>
<li>Her ekranda tek soru görünür; seçeneğe dokununca otomatik olarak sonraki soruya geçilir. Bilgisayarda 1–5 tuşları kullanılabilir.</li>
<li>Katılımcı yarıda bırakırsa aynı cihazdan kaldığı yerden devam edebilir.</li>
<li>Uygulama Türkçe ve İngilizce kullanılabilir; katılımcı dili ekranın üstünden değiştirebilir.</li>
</ul>
<h3>Değerlendirmeyi yönetme</h3>
<ul>
<li><b>Arama ve filtre:</b> panel sayfasındaki arama kutusu başlık, kod, birim, tarih ve (İK'da) aday adı ile pozisyonda arar. Birden fazla kelime yazarsanız hepsini içeren kayıtlar gelir. <b>Tümü / Açık / Kapalı</b> düğmeleri ve sıralama menüsü (en yeni, en eski, en çok yanıt, ada göre) ile listeyi daraltın. Liste 20'şer kayıt gösterir; devamı için <b>Daha fazla göster</b>.</li>
<li><b>Düzenle:</b> başlık, beklenen katılımcı sayısı ve kapanış tarihi sonradan değiştirilebilir. Sorular ve ayarlar (birimler, senaryolar) yanıt toplanmaya başladıktan sonra değiştirilemez; bu, sonuçların karşılaştırılabilir kalması içindir.</li>
<li><b>Tek bir yanıtı silme:</b> yanıtlar tablosundaki çöp kutusu simgesi. Test amaçlı verdiğiniz yanıtları rapordan çıkarmak için kullanın.</li>
<li><b>Değerlendirmeyi silme:</b> değerlendirme ve tüm yanıtları kalıcı olarak silinir.</li>
</ul>
<div class="warn"><b>Önemli:</b> Bağlantıyı yalnızca hedef katılımcılarla paylaşın. Bağlantıya sahip herkes yanıt verebilir; kurum dışına yayılması sonuçları bozar.</div>`,
    en: `
<h3>Assessment lifecycle</h3>
<ol class="steps">
<li><b>Create:</b> tap <b>New assessment</b> on a panel page and enter the title and panel-specific settings. Entering <b>expected respondents</b> enables the response rate.</li>
<li><b>Share:</b> a unique link and QR code are generated. Copy the link, send via WhatsApp or email, copy the ready <b>invitation text</b>, or print the QR code.</li>
<li><b>Track:</b> the assessment page shows the number of responses, response rate and each response's <b>reliability</b> score.</li>
<li><b>Close:</b> tap <b>Close</b> when you have enough responses, or set a <b>closing date</b>. Closed assessments accept no new responses; <b>Reopen</b> if needed.</li>
<li><b>Report:</b> <b>Open report</b>; <b>Save as PDF</b> for a printout, <b>Download CSV</b> for raw data.</li>
</ol>
<h3>Sharing methods</h3>
<table><tr><th>Method</th><th>When</th></tr>
<tr><td>Link (WhatsApp, email, chat)</td><td>When people have their own phone or PC. One response per device.</td></tr>
<tr><td>QR code</td><td>For frontline staff; scanned with a phone camera.</td></tr>
<tr><td><b>Shared device (kiosk) mode</b></td><td>When several people respond in turn on one tablet/PC. Tick it when creating the assessment.</td></tr></table>
<h3>Managing</h3>
<ul><li><b>Search and filter:</b> the panel page searches title, code, department, date and (HR) candidate name and position; filter by All / Open / Closed and sort by newest, oldest, most responses or name. 20 items are shown at a time.</li><li><b>Edit:</b> title, expected respondents and closing date can be changed later; questions and settings cannot, so results stay comparable.</li>
<li><b>Delete a single response</b> (e.g. your own test answers) or the whole assessment.</li></ul>
<div class="warn"><b>Important:</b> share the link only with intended respondents; anyone with the link can respond.</div>`,
  },
  {
    id: 'anonymity',
    icon: 'lock',
    title: { tr: 'Anonimlik ve güven', en: 'Anonymity and trust' },
    tr: `
<p>Çalışanların dürüst yanıt vermesi, yanıtlarının gerçekten anonim olduğuna inanmalarına bağlıdır. Analiz ProX bunu teknik olarak sağlar; sizin göreviniz bunu çalışanlarınıza açıkça anlatmaktır.</p>
<h3>Platform neyi garanti eder?</h3>
<ul>
<li>Çalışan anketlerinde ad, e-posta, telefon veya IP adresi yanıtlarla birlikte <b>kaydedilmez</b>.</li>
<li>Raporlarda <b>5'ten az yanıtlı</b> birim veya gruplar ayrı gösterilmez ("Anonimlik eşiğinin altında" yazar). Toplantı panelinde bu eşik 3, senaryo panelinde 2'dir.</li>
<li>Rapor, toplamda en az <b>3 geçerli yanıt</b> olmadan açılmaz.</li>
<li>Yönetim–çalışan karşılaştırması, yönetici grubunda en az 3 kişi olmadıkça gösterilmez.</li>
</ul>
<h3>Sizin yapmanız gerekenler</h3>
<ul>
<li>Davet metninde katılımın gönüllü ve anonim olduğunu belirtin (hazır davet metni bunu içerir).</li>
<li>Birim listesini çok küçük birimlere bölmeyin; 5 kişiden küçük birimleri birleştirin.</li>
<li>Kimin yanıt verip vermediğini sormayın, takip etmeyin; yanıt vermeyene yaptırım uygulamayın.</li>
<li>Açık uçlu yorumlardan kişi tahmin etmeye çalışmayın.</li>
<li>Sonuçları ve atacağınız adımları çalışanlarla paylaşın. Bir sonraki ankette katılım bunu belirler.</li>
</ul>
<div class="warn">Anonimliği aşmaya çalışmak hem güveni kalıcı olarak zedeler hem de <a href="#/legal/terms">Kullanım Koşulları</a>'na aykırıdır.</div>`,
    en: `
<p>Honest answers depend on people believing their responses are truly anonymous. Analiz ProX ensures this technically; your job is to explain it clearly.</p>
<h3>What the platform guarantees</h3>
<ul><li>Name, email, phone or IP are <b>not stored</b> with employee-survey answers.</li>
<li>Units or groups with <b>fewer than 5 responses</b> are not shown separately (3 for meetings, 2 for scenarios).</li>
<li>No report opens with fewer than <b>3 valid responses</b>.</li>
<li>Management vs. employee comparison requires at least 3 managers.</li></ul>
<h3>What you should do</h3>
<ul><li>State that participation is voluntary and anonymous.</li><li>Don't split departments into tiny units.</li><li>Never track or sanction who did or didn't respond.</li><li>Don't try to identify people from comments.</li><li>Share results and actions with employees.</li></ul>`,
  },
  {
    id: 'reading',
    icon: 'chart',
    title: { tr: 'Raporlar nasıl okunur?', en: 'How to read reports' },
    tr: `
<p>Altı panelin raporu aynı yapıyı ve aynı matematiği kullanır (İK raporu kendi bölümünde anlatılır). Bölümleri sırasıyla açıklıyoruz.</p>
<h3>Puanlar ve bantlar</h3>
<p>Her soru 1–5 arasında yanıtlanır. Olumsuz ifadeli ("ters") sorular otomatik çevrilir; böylece <b>her zaman yüksek puan = daha iyi durum</b> olur. Puanlar 0–100 ölçeğine taşınır:</p>
<table>
<tr><th>Puan</th><th>Bant</th><th>Anlamı</th></tr>
<tr><td>85–100</td><td><b style="color:var(--c-excellent)">Mükemmel</b></td><td>Örnek alınacak güçlü alan; koruyun.</td></tr>
<tr><td>70–84</td><td><b style="color:var(--c-strong)">Güçlü</b></td><td>Sağlıklı; küçük iyileştirmeler yeterli.</td></tr>
<tr><td>55–69</td><td><b style="color:var(--c-develop)">Gelişime açık</b></td><td>Çalışanların önemli bir kısmı kararsız ya da memnun değil.</td></tr>
<tr><td>40–54</td><td><b style="color:var(--c-risk)">Riskli</b></td><td>Olumsuz algı yaygın; planlı aksiyon gerekir.</td></tr>
<tr><td>0–39</td><td><b style="color:var(--c-critical)">Kritik</b></td><td>Acil öncelik; çalışan kaybı, kalite ve güvenlik riskleri doğurabilir.</td></tr>
</table>
<p><b>50 puan "ortalama" değildir:</b> 50, katılımcıların ortalamada "kararsızım" dediği anlamına gelir. Çoğu kurumda 60–75 arası makul bir sağlık düzeyidir.</p>

<h3>01 · Yönetici özeti</h3>
<ul>
<li><b>Genel endeks (ibre):</b> boyut puanlarının ortalaması. Altındaki <b>%95 GA</b> (güven aralığı), gerçek değerin %95 olasılıkla bulunduğu aralıktır. Örneğin "62 · %95 GA 58–66": gerçek değer büyük olasılıkla 58 ile 66 arasındadır. Az yanıtta aralık genişler.</li>
<li><b>Olumlu yanıt oranı:</b> tüm yanıtlar içinde 4–5 ("katılıyorum") verilenlerin payı. Altındaki olumsuz oran 1–2 verilenlerdir.</li>
<li><b>Görüş birliği:</b> çalışanların ne kadar benzer düşündüğü. %70 üstü ortak bir algı; %55 altı birbirinden çok farklı deneyimler (bazı ekipler çok iyi, bazıları çok kötü) demektir.</li>
<li><b>Otomatik bulgular:</b> en güçlü/zayıf alan, kaldıraç noktası, kör nokta ve veri kalitesi notu düz bir dille özetlenir.</li>
</ul>

<h3>02 · Boyut profili</h3>
<p>Radar grafik tüm boyutları bir arada gösterir; yanındaki çubuklar puanları sıralı olarak verir. Çubuk üzerindeki ince beyaz çizgi güven aralığıdır. <b>İki boyutun aralıkları üst üste biniyorsa aralarındaki fark istatistiksel olarak anlamlı olmayabilir</b>; 2–3 puanlık farkları abartmayın. Boyut adının altındaki <b>α</b> değeri (Cronbach alfa) o boyuttaki soruların tutarlılığını gösterir; 0,70 üstü iyidir, 20 yanıttan sonra hesaplanır.</p>

<h3>03 · Yanıt dağılımı</h3>
<p>Her boyut için olumsuz (kırmızı), kararsız (gri) ve olumlu (yeşil) yanıtların payı. Puanı aynı olan iki boyut farklı hikâyeler anlatabilir: <b>yüksek kararsız oranı</b> bilgi eksikliğine ya da güvensizliğe; <b>hem yüksek olumlu hem yüksek olumsuz</b> oran ise kurum içinde bölünmüş deneyimlere işaret eder.</p>

<h3>04 · Etki analizi (neye öncelik verilmeli?)</h3>
<p>Her boyutun, panelin <b>sonuç göstergesiyle</b> (ör. tavsiye eNPS, genel güven, tükenmişlik) ne kadar ilişkili olduğunu gösterir. Yatay eksen puan, dikey eksen ilişkinin gücüdür (Pearson r). En az 8 yanıtla hesaplanır.</p>
<table>
<tr><th>Bölge</th><th>Anlamı</th><th>Ne yapmalı?</th></tr>
<tr><td><b>Öncelikli aksiyon</b> (sol üst)</td><td>Sonucu en çok etkileyen ama zayıf alanlar</td><td>İyileştirme kaynağının ilk önce gideceği yer</td></tr>
<tr><td><b>Güçlü yanı koru</b> (sağ üst)</td><td>Etkili ve güçlü</td><td>Mevcut uygulamaları sürdürün, yaygınlaştırın</td></tr>
<tr><td><b>İzle</b> (sol alt)</td><td>Zayıf ama sonuca etkisi düşük</td><td>İzleyin; kaynak varsa ele alın</td></tr>
<tr><td><b>Sürdür</b> (sağ alt)</td><td>Güçlü, etkisi düşük</td><td>Olduğu gibi bırakın</td></tr>
</table>
<div class="warn"><b>İlişki, neden-sonuç değildir.</b> Bir boyutun sonuçla güçlü ilişkili olması güçlü bir ipucudur, kesin kanıt değildir. Kararı odak grup görüşmeleriyle doğrulayın.</div>

<h3>05 · Kör noktalar (yönetim ve çalışan algısı)</h3>
<p>Yönetici grubunun verdiği puan ile diğer çalışanların puanı arasındaki fark. <b>+10 ve üstü fark</b>, yönetimin sahadaki durumu olduğundan iyi gördüğü bir kör noktadır. Negatif fark ise yöneticilerin daha karamsar olduğunu gösterir; bu da çoğu zaman yöneticilerin çalışanlardan daha fazla bilgiye sahip olduğu ama bunu paylaşmadığı anlamına gelir.</p>

<h3>Grup karşılaştırması (ısı haritası)</h3>
<p>Birim, pozisyon grubu ve kıdem gibi kırılımlarda her boyutun puanı renklerle gösterilir. Satır satır okuyun: hangi birim genel olarak zayıf, hangi boyut her birimde zayıf? Bir boyut <b>tüm birimlerde</b> düşükse sorun kurum genelindedir (politika, üst yönetim); <b>tek bir birimde</b> düşükse sorun büyük olasılıkla o birimin yönetimiyle ilgilidir. Satır yanındaki <b>n</b> yanıt sayısıdır; küçük n'li satırlara temkinli yaklaşın.</p>

<h3>Madde analizi</h3>
<p>En yüksek ve en düşük puan alan 5 ifade. Boyut puanı neden düşük, sorusunun cevabı genellikle buradadır. Somut aksiyon cümleleri yazmak için en kullanışlı bölümdür.</p>

<h3>Bireysel endeks dağılımı</h3>
<p>Her katılımcının kendi genel puanının dağılımı. Dar, tek tepeli dağılım ortak bir deneyime; iki tepeli dağılım iki farklı grup deneyimine (ör. bir bölüm çok mutlu, diğeri çok mutsuz) işaret eder. <b>55 altında puan veren oran</b>, risk altındaki çalışan payının kaba bir göstergesidir.</p>

<h3>Önerilen aksiyon planı</h3>
<p>En düşük puanlı ve etki analizinde öncelikli çıkan boyutlar için 90 günlük somut adımlar ve bir sonraki ölçümde hedeflenecek puan. Bu öneriler genel niteliklidir; kendi kurumunuza uyarlayın, her aksiyona bir sorumlu ve tarih verin.</p>

<h3>Veri kalitesi ve metodoloji</h3>
<p>Her yanıt 0–100 arası bir <b>yanıt güveni</b> puanı alır. Puan şu durumlarda düşer: dikkat kontrol sorusu ("Lütfen bu soruda Katılmıyorum'u işaretleyin") yanlış yanıtlandıysa, neredeyse tüm sorulara aynı seçenek verildiyse, soru başına süre 1,6 saniyenin altındaysa ve birbirine zıt ifadelere çelişkili yanıt verildiyse.</p>
<ul>
<li><b>70+ Güvenilir</b> ve <b>40–69 Dikkat</b>: analize dahil.</li>
<li><b>40 altı Şüpheli</b>: varsayılan olarak analiz dışı. Rapor başlığındaki <b>"Şüpheli yanıtları dahil et"</b> kutusuyla etkisini görebilirsiniz.</li>
</ul>
<p>Şüpheli oranı %15'i aşıyorsa katılımcılar anketi ciddiye almamış ya da baskı altında hissetmiş olabilir; davet sürecini gözden geçirin.</p>

<h3>PDF ve CSV</h3>
<ul>
<li><b>PDF olarak kaydet:</b> tarayıcının yazdırma penceresi açılır; hedef olarak <b>"PDF olarak kaydet"</b>i seçin. Rapor baskıda otomatik olarak açık renkli, yazıcı dostu temaya geçer.</li>
<li><b>CSV indir</b> (değerlendirme sayfasında): tüm ham yanıtlar, grup bilgileri ve yanıt güveni puanı. Excel'de açarken ayırıcı olarak noktalı virgül seçin.</li>
</ul>`,
    en: `
<p>Six panels share the same report structure and maths (the HR report is covered separately).</p>
<h3>Scores and bands</h3>
<p>Each item is answered 1–5; negatively worded items are recoded so that <b>higher always means better</b>. Scores are mapped to 0–100.</p>
<table><tr><th>Score</th><th>Band</th><th>Meaning</th></tr>
<tr><td>85–100</td><td>Excellent</td><td>Role-model strength; protect it.</td></tr>
<tr><td>70–84</td><td>Strong</td><td>Healthy; minor tuning.</td></tr>
<tr><td>55–69</td><td>Developing</td><td>Many are neutral or dissatisfied.</td></tr>
<tr><td>40–54</td><td>At risk</td><td>Widespread negative perception; plan action.</td></tr>
<tr><td>0–39</td><td>Critical</td><td>Urgent priority.</td></tr></table>
<p><b>50 is not "average"</b>: it means respondents were neutral on average. 60–75 is a reasonable health level for most organizations.</p>
<h3>Executive summary</h3>
<ul><li><b>Overall index</b> with its <b>95% CI</b>: the range where the true value lies with 95% probability; wider with fewer responses.</li>
<li><b>Favourability:</b> share of 4–5 answers.</li>
<li><b>Consensus:</b> how similar views are; above 70% shared, below 55% divided.</li></ul>
<h3>Dimension profile</h3>
<p>Radar and ranked bars. The thin white line is the confidence interval; <b>overlapping intervals mean the difference may not be meaningful</b>. α (Cronbach's alpha) shows internal consistency; above 0.70 is good (from 20 responses).</p>
<h3>Response distribution</h3>
<p>Unfavourable / neutral / favourable shares. High neutral often signals lack of information or distrust; both high favourable and unfavourable signals divided experiences.</p>
<h3>Driver analysis</h3>
<p>Correlation of each dimension with the panel's outcome (eNPS, overall trust, burnout…), from 8 responses. Top-left = <b>act now</b>; top-right = protect; bottom = monitor/maintain. <b>Correlation is not causation</b>; validate with focus groups.</p>
<h3>Blind spots</h3>
<p>Manager minus employee score; <b>+10 or more</b> means management sees things as better than they are.</p>
<h3>Group heatmap</h3>
<p>Low in every unit → organization-wide issue; low in one unit → likely local leadership. Mind small n.</p>
<h3>Item analysis, distribution, action plan</h3>
<p>Top and bottom 5 statements explain why a dimension is low. A two-peaked distribution signals two different experiences. The action plan gives 90-day steps; adapt and assign owners.</p>
<h3>Data quality</h3>
<p>Each response gets a 0–100 reliability score (attention check, straight-lining, under 1.6 s per item, contradictions). 70+ reliable and 40–69 caution are included; below 40 is excluded by default (toggle <b>Include suspect responses</b>).</p>
<h3>PDF and CSV</h3>
<p><b>Save as PDF</b> opens the print dialog — choose "Save as PDF"; the report switches to a printer-friendly light theme. <b>Download CSV</b> exports raw data (semicolon-separated).</p>`,
  },
  {
    id: 'principles',
    icon: 'info',
    title: { tr: 'Doğru yorumlama ilkeleri', en: 'Principles of sound interpretation' },
    tr: `
<p>Analiz ProX, topladığınız verinin istatistiksel sonucunu gösterir. Sonuçların değeri, doğru okunmalarına bağlıdır. Raporları paylaşmadan ve karar almadan önce aşağıdaki ilkeleri gözden geçirin.</p>
<ol class="steps">
<li><b>Önce yanıt sayısına ve oranına bakın.</b> 120 kişilik bir kurumda 15 yanıt, kurumun tamamını temsil etmez. Genel kural: yanıt oranı %60'ın üzerindeyse sonuçlar güvenilir, %40'ın altındaysa yalnızca yönlendiricidir.</li>
<li><b>Güven aralığını okuyun.</b> 64 ile 61 arasındaki fark, aralıklar örtüşüyorsa gerçek bir fark olmayabilir.</li>
<li><b>Kendinizi kendinizle karşılaştırın.</b> En anlamlı karşılaştırma, aynı panelin 6–12 ay sonra tekrarlanmasıdır. Başka kurumların puanlarıyla karşılaştırma yanıltıcı olabilir.</li>
<li><b>İlişki neden-sonuç değildir.</b> Etki analizi nereye bakacağınızı söyler, neden olduğunu kanıtlamaz.</li>
<li><b>Ortalama, dağılımı gizleyebilir.</b> Görüş birliği düşükse ısı haritasına ve dağılım grafiğine bakın.</li>
<li><b>Kişi aramayın, sistem arayın.</b> Raporlar kişileri değil süreçleri, yönetim uygulamalarını ve kültürü ölçer. Düşük puanlı bir birimi cezalandırmak yerine nedenini anlamaya çalışın.</li>
<li><b>Açık uçlu yorumları sayın, tartmayın.</b> Tek bir sert yorum, tekrar eden üç yumuşak yorumdan daha önemli değildir. Raporda aynı yorumlar birleştirilip "×3" gibi sayıyla gösterilir.</li>
<li><b>Sonucu doğrulayın.</b> Önemli kararlardan önce bulguları odak grup görüşmeleri, çıkış mülakatları ve iş verileri (devamsızlık, kaza, kalite, devir oranı) ile karşılaştırın.</li>
<li><b>Geri bildirim döngüsünü kapatın.</b> Anketin bittiği yerde iş başlar: sonuçları çalışanlarla paylaşın, 2–3 öncelik seçin, sorumlu ve tarih belirleyin, sonra yeniden ölçün.</li>
<li><b>Klinik ve hukuki sınırları bilin.</b> Stres paneli tıbbi tanı koymaz; İK raporu tek başına işe alım kararı değildir.</li>
</ol>
<div class="warn"><b>Sorumluluk:</b> Analiz ProX yalnızca bir analiz platformudur. Değerlendirmeleri yürüten, sonuçları yorumlayan ve bunlara dayanarak karar alan kurumdur; bu işlemlerin tüm sorumluluğu kuruma aittir. Ayrıntılar: <a href="#/legal/terms">Kullanım Koşulları ve Sorumluluk Reddi</a>.</div>`,
    en: `
<ol class="steps">
<li><b>Check response count and rate first.</b> Above 60% results are reliable; below 40% only indicative.</li>
<li><b>Read the confidence interval;</b> overlapping intervals may not be a real difference.</li>
<li><b>Compare yourself with yourself</b> — repeat the same panel in 6–12 months.</li>
<li><b>Correlation is not causation.</b></li>
<li><b>Averages can hide distribution;</b> check consensus, the heatmap and the histogram.</li>
<li><b>Look for systems, not people.</b></li>
<li><b>Count comments, don't weigh them;</b> identical comments are grouped with a count.</li>
<li><b>Validate</b> with focus groups and business data before major decisions.</li>
<li><b>Close the loop:</b> share results, pick 2–3 priorities, assign owners, re-measure.</li>
<li><b>Know the limits:</b> the stress panel is not a diagnosis; HR reports are not hiring decisions on their own.</li>
</ol>
<div class="warn"><b>Responsibility:</b> Analiz ProX is an analytics platform only. The organization runs assessments, interprets results and takes decisions, and is fully responsible for them. See the <a href="#/legal/terms">Terms of Use and Disclaimer</a>.</div>`,
  },
  {
    id: 'faq',
    icon: 'chat',
    title: { tr: 'Sık sorulan sorular', en: 'FAQ' },
    tr: `
<h4>Kaç kişinin yanıt vermesi gerekir?</h4><p>Rapor 3 geçerli yanıtla açılır, ancak anlamlı bir kurum analizi için en az 10, birim kırılımları için her birimde en az 5 yanıt önerilir. Etki analizi 8, ölçek güvenilirliği (α) 20 yanıttan sonra hesaplanır.</p>
<h4>Bir çalışan iki kez yanıt verebilir mi?</h4><p>Aynı cihazdan hayır. Kiosk modunda aynı cihazdan sırayla birden fazla kişi yanıt verebilir; bu durumda tekrarı önlemek kurumun sorumluluğundadır.</p>
<h4>Test için kendim yanıt verdim; rapordan nasıl çıkarırım?</h4><p>Değerlendirme sayfasındaki yanıtlar tablosunda ilgili satırın çöp kutusu simgesine dokunun.</p>
<h4>Değerlendirme açıkken sorular değiştirilebilir mi?</h4><p>Hayır. Aynı anketin yanıtları karşılaştırılabilir olsun diye sorular sabittir. Farklı ayarlar için yeni bir değerlendirme açın.</p>
<h4>Aynı paneli tekrar uygulayabilir miyim?</h4><p>Evet, istediğiniz kadar değerlendirme açabilirsiniz. Önerilen tekrar sıklığı: 360° İşletme, Güven, Vizyon ve Stres için 6–12 ay; Toplantı için her toplantı; Senaryo için yılda bir veya büyük bir değişiklikten sonra.</p>
<h4>Ücretsiz deneme ve abonelik nasıl işler?</h4><p>Kurumunuzu oluşturduğunuz an <b>30 gün ücretsiz</b> tam erişim başlar; kart istenmez. Deneme bitince yedi panelin tamamı tek bir <b>aylık "ProX Yedilisi" aboneliğiyle</b> kullanılır. Abonelik Android, iOS veya Windows (Microsoft Store) uygulamasında <b>Hesap menüsü → Abonelik</b> ekranından, mağazanın ödeme sistemiyle başlatılır ve aynı hesapla tüm cihazlarda ve web'de geçerli olur. Fiyat mağazadan alınır; her zaman mağazadaki güncel fiyat geçerlidir. İptal için App Store, Google Play veya Microsoft hesabınızın abonelik ayarlarını kullanın.</p>
<h4>Deneme bitince verilerim ne olur?</h4><p>Hiçbir şey silinmez ve açık anketleriniz yanıt toplamaya devam eder. Yalnızca yeni değerlendirme açma ile raporlar ve yanıt verileri, abonelik başlayana kadar kilitli kalır.</p>
<h4>Verilerimi nasıl silerim?</h4><p>Tek bir yanıtı veya değerlendirmeyi ilgili sayfadan; hesabınızı ve tüm kurum verilerinizi <b>Hesabım → Hesabı sil</b> ile kalıcı olarak silebilirsiniz.</p>
<h4>Hesabım askıya alındı, ne yapmalıyım?</h4><p>Askı gerekçesi giriş ekranında ve Mesajlar bölümünde görünür. Bilgi için analizprox@gmail.com adresine yazabilirsiniz.</p>`,
    en: `
<h4>How many responses do I need?</h4><p>Reports open from 3 valid responses; at least 10 overall and 5 per unit are recommended. Driver analysis needs 8, alpha 20.</p>
<h4>Can someone respond twice?</h4><p>Not from the same device (except in kiosk mode).</p>
<h4>How do I remove my test answers?</h4><p>Use the bin icon in the responses table.</p>
<h4>Can I change questions while open?</h4><p>No; open a new assessment for different settings.</p>
<h4>Can I repeat a panel?</h4><p>Yes — every 6–12 months for employee panels, after each meeting for meetings, yearly for scenarios.</p>
<h4>How do the trial and subscription work?</h4><p>Every new organization gets <b>30 days free</b>, no card required. After that, all seven panels are available with one monthly <b>"ProX Yedilisi"</b> subscription, started in the Android, iOS or Windows (Microsoft Store) app (<b>Account menu → Subscription</b>) and valid everywhere with the same account. The store's current price always applies; cancel in your store subscription settings.</p>
<h4>What happens when the trial ends?</h4><p>Nothing is deleted and open surveys keep collecting answers; only new assessments, reports and response data are locked until you subscribe.</p>
<h4>How do I delete my data?</h4><p>Delete responses or assessments on their pages, or everything via <b>My account → Delete account</b>.</p>`,
  },
];

// ---------------------------------------------------------------- PANEL KILAVUZLARI
export const MODULE_GUIDES = {
  isletme: {
    tr: `
<h3>Ne ölçer?</h3>
<p>Çalışanların işyerini on alanda nasıl deneyimlediğini ölçen 360° bir tarama: iş güvenliği ve çevre, süreç verimliliği, ekipman ve teknoloji, kalite, eğitim ve gelişim, iletişim ve işbirliği, çalışma koşulları ve haklar, iş yükü ve zaman, liderlik ve yönetim, bağlılık ve motivasyon. 40 ifade, 1 tavsiye (eNPS) sorusu, 2 isteğe bağlı açık uçlu soru; yaklaşık 9 dakika.</p>
<h3>Kimler yanıtlar?</h3>
<p>Mavi yaka, beyaz yaka ve yöneticiler dahil <b>tüm çalışanlar</b>. Katılımcı kendi pozisyon grubunu, birimini ve kıdemini seçer. Yöneticilerin de katılması önemlidir; "kör nokta" analizi yönetim ile çalışan algısını bu sayede karşılaştırır.</p>
<h3>Adım adım</h3>
<ol class="steps">
<li><b>Paneller → 360° İşletme Röntgeni → Yeni değerlendirme</b>.</li>
<li>Başlık verin (ör. "360° İşletme — Ekim 2026").</li>
<li><b>Birimler</b> alanına her satıra bir birim yazın (Üretim, Kalite, Satış…). 5 kişiden küçük birimleri birleştirin.</li>
<li>Sahada ortak tablet kullanılacaksa <b>Ortak cihaz (kiosk) modu</b>'nu işaretleyin.</li>
<li><b>Beklenen katılımcı sayısı</b>'nı ve isterseniz kapanış tarihini girin, <b>Oluştur</b>'a dokunun.</li>
<li>Davet metnini kopyalayıp WhatsApp/e-postayla gönderin, QR kodu panolara asın. 7–10 gün açık tutun; ortada bir hatırlatma gönderin.</li>
<li>Yanıt oranı hedefe ulaşınca <b>Yanıtlara kapat</b> ve <b>Raporu aç</b>.</li>
</ol>
<h3>Rapora özel bölümler</h3>
<ul>
<li><b>eNPS (çalışan tavsiye skoru):</b> "Bu kurumu bir yakınınıza tavsiye eder misiniz?" sorusuna 9–10 verenlerin oranından 0–6 verenlerin oranı çıkarılır; −100 ile +100 arasındadır. 0'ın üstü olumlu, +20'nin üstü iyi, +40'ın üstü çok iyi kabul edilir. Türkiye'de üretim sektöründe eksi değerler yaygındır; asıl önemli olan kendi trendinizdir.</li>
<li><b>Etki analizi:</b> hangi alanın eNPS'i en çok etkilediğini gösterir. Sol üstteki "Öncelikli aksiyon" alanları, çalışan bağlılığını artırmak için en yüksek getirili yatırımlardır.</li>
<li><b>Kör noktalar:</b> yöneticilerin puanı ile diğer çalışanların puanı arasındaki fark. Tipik bulgu: yöneticiler iletişimi, eğitimi ve iş yükünü sahadan 15–25 puan daha iyi görür.</li>
<li><b>Isı haritası:</b> birimler ve pozisyon grupları arasındaki farklar; mavi yaka–beyaz yaka ayrışmasına özellikle bakın.</li>
</ul>
<h3>Yorumlarken dikkat</h3>
<ul>
<li>İş güvenliği puanı yüksek olsa bile "hedeflere yetişmek için güvenlikten taviz veriliyor" maddesinin puanına ayrıca bakın.</li>
<li>Ücret ve yan haklar maddeleri çoğu kurumda düşük çıkar; tek başına diğer alanlardaki iyileşmeyi gölgelemesine izin vermeyin.</li>
<li>Sonuçları birim yöneticileriyle paylaşırken her birime yalnızca kendi verisini ve kurum ortalamasını gösterin.</li>
</ul>`,
    en: `
<h3>What it measures</h3><p>A 360° scan of the employee experience across ten areas (safety, process, equipment, quality, learning, communication, conditions, workload, leadership, engagement): 40 statements, an eNPS question and 2 optional open questions; about 9 minutes.</p>
<h3>Who responds</h3><p><b>All employees</b> including managers; each picks their position group, unit and tenure. Manager participation powers the blind-spot analysis.</p>
<h3>Step by step</h3><ol class="steps"><li><b>Panels → 360° Business X-Ray → New assessment</b>.</li><li>Give it a title.</li><li>List <b>departments</b>, one per line; merge units under 5 people.</li><li>Tick <b>kiosk mode</b> for shared tablets.</li><li>Enter expected respondents and optionally a closing date; create.</li><li>Share the invitation and QR; keep open 7–10 days with one reminder.</li><li>Close and open the report.</li></ol>
<h3>Report specifics</h3><ul><li><b>eNPS:</b> % promoters (9–10) minus % detractors (0–6), −100…+100; above 0 positive, +20 good, +40 very good. Your trend matters most.</li><li><b>Driver analysis</b> shows which area drives eNPS.</li><li><b>Blind spots:</b> managers often rate communication, training and workload 15–25 points higher than the frontline.</li><li><b>Heatmap:</b> watch blue- vs. white-collar gaps.</li></ul>`,
  },

  guven: {
    tr: `
<h3>Ne ölçer?</h3>
<p>Kurum içi güvenin dört katmanı: <b>yönetime güven</b>, <b>ekip güveni</b>, <b>psikolojik güvenlik</b> (hata yapmaktan, soru sormaktan, itiraz etmekten çekinmemek) ve <b>adalet & şeffaflık</b>. 28 ifade, 1 genel güven sorusu, 1 isteğe bağlı açık uçlu soru; yaklaşık 7 dakika.</p>
<h3>Kimler yanıtlar?</h3>
<p>Tüm çalışanlar. Anonimlik bu panelde her zamankinden önemlidir; davet metninde mutlaka vurgulayın.</p>
<h3>Adım adım</h3>
<ol class="steps">
<li><b>Paneller → Güven & Psikolojik Güvenlik → Yeni değerlendirme</b>.</li>
<li>Birimleri girin (küçük birimleri birleştirin), gerekirse kiosk modunu açın.</li>
<li>Oluşturun ve paylaşın. Mümkünse daveti üst yönetim değil, bağımsız bir kişi (İK, kalite) göndersin.</li>
<li>Yeterli yanıttan sonra kapatıp raporu açın.</li>
</ol>
<h3>Rapora özel bölümler</h3>
<ul>
<li><b>Sonuç göstergesi:</b> "Genel olarak bu kurumda kendimi güvende hissediyorum" sorusu. Etki analizi, genel güven duygusunu en çok hangi katmanın belirlediğini gösterir.</li>
<li><b>Psikolojik güvenlik:</b> 55'in altındaysa çalışanlar hataları ve riskleri saklıyor olabilir; bu, kalite ve iş güvenliği sorunlarının erken uyarısıdır.</li>
<li><b>Adalet & şeffaflık:</b> terfi, ücret ve kuralların uygulanmasına ilişkin algı. Genellikle en düşük çıkan katmandır.</li>
<li><b>Kör noktalar:</b> yöneticiler güveni neredeyse her zaman daha yüksek görür; 10 puanı aşan fark ciddiye alınmalıdır.</li>
</ul>
<h3>Yorumlarken dikkat</h3>
<ul>
<li>Yüksek <b>ekip güveni</b> ile düşük <b>yönetime güven</b> birlikteyse çalışanlar birbirine kenetlenmiş ama yönetimden uzaklaşmıştır; iletişim kanallarını gözden geçirin.</li>
<li>Bu panelin sonuçlarını kimseyi suçlamak için kullanmayın. Güven, sonuçların nasıl kullanıldığını gördükçe artar ya da azalır.</li>
</ul>`,
    en: `
<h3>What it measures</h3><p>Four layers of trust: <b>trust in leadership</b>, <b>team trust</b>, <b>psychological safety</b> and <b>fairness & transparency</b>. 28 statements, an overall-safety item and an optional comment; about 7 minutes.</p>
<h3>Step by step</h3><ol class="steps"><li><b>Panels → Trust & Psychological Safety → New assessment</b>.</li><li>Add departments; kiosk if needed.</li><li>Create and share — ideally sent by HR rather than top management.</li><li>Close and open the report.</li></ol>
<h3>Report specifics</h3><ul><li>The outcome is "Overall, I feel safe in this organization"; driver analysis shows which layer drives it.</li><li>Psychological safety under 55 means people may hide mistakes — an early warning for quality and safety.</li><li>Fairness is usually the lowest layer.</li><li>Manager–employee gaps above 10 points deserve attention.</li></ul>`,
  },

  ik: {
    tr: `
<h3>Ne ölçer?</h3>
<p>Her aday için üç bölümlü bir değerlendirme:</p>
<ul>
<li><b>Bilişsel yetenek</b> (24 soru, 18 dakika, süreli): sayısal akıl yürütme, sözel akıl yürütme, mantıksal çıkarım, dikkat & örüntü.</li>
<li><b>Durumsal yargı</b> (12 iş senaryosu): iş hayatındaki zor durumlarda en etkili davranışı seçme becerisi.</li>
<li><b>Kişilik envanteri</b> (32 ifade): Beş Faktör modeli (deneyime açıklık, sorumluluk, dışadönüklük, uyumluluk, duygusal denge) ve iki "sosyal beğenirlik" kontrol sorusu.</li>
</ul>
<p>Toplam yaklaşık 35 dakika. Bilişsel ve durumsal bölümlerin cevap anahtarı <b>yalnızca sunucuda</b> tutulur; aday tarafında hiçbir zaman görünmez.</p>
<h3>Adım adım</h3>
<ol class="steps">
<li><b>Paneller → İK Aday Değerlendirme → Yeni aday</b>.</li>
<li>Adayın adını soyadını ve başvurduğu pozisyonu yazın.</li>
<li><b>Pozisyon ailesini</b> seçin: Satış, Üretim, Yönetici, Ofis, Teknik veya Hizmet. Bu seçim, kişilik hedef aralıklarını ve uyum skorundaki ağırlıkları belirler.</li>
<li>İsterseniz adayın iletişim bilgisini ve yalnızca sizin göreceğiniz bir not ekleyin, <b>Oluştur</b>'a dokunun.</li>
<li>Adaya özel bağlantıyı e-posta veya WhatsApp ile gönderin. <b>Bağlantı tek kullanımlıktır</b>; aday testi tamamladıktan sonra tekrar açılamaz.</li>
<li>Adaydan sessiz bir ortamda, tek oturumda tamamlamasını isteyin. Bilişsel bölüm başladıktan sonra süre durdurulamaz; süre dolarsa bölüm otomatik kapanır.</li>
<li>Aday tamamlayınca <b>Rapor</b> düğmesi etkinleşir. Panel sayfasındaki <b>Aday karşılaştırma</b> tablosu tüm adayları uyum skoruna göre sıralar.</li>
</ol>
<h3>Rapor nasıl okunur?</h3>
<ul>
<li><b>İş uyum skoru:</b> pozisyon ailesine göre ağırlıklandırılmış genel uyum. Örneğin Yönetici ailesinde %40 bilişsel + %35 durumsal yargı + %25 kişilik uyumu. 70 ve üstü güçlü uyum, 55–69 koşullu uyum, 55 altı zayıf uyum olarak okunabilir.</li>
<li><b>Bilişsel alanlar:</b> her alanda doğru yanıt yüzdesi. Pozisyonun gerektirdiği alana odaklanın (ör. planlama rolünde sayısal, kalite rolünde dikkat & örüntü).</li>
<li><b>Durumsal yargı:</b> her senaryoda seçilen davranışın etkililiği (0–100). İletişim, etik, müşteri ve ekip davranışlarına dair güçlü bir ipucudur.</li>
<li><b>Kişilik profili:</b> noktalar adayın puanını, kesikli alanlar pozisyon için hedef aralığı gösterir. Kişilik özellikleri iyi ya da kötü değildir; yalnızca role uygunluk açısından yorumlanır. Örneğin düşük dışadönüklük satış için zorluk, teknik bir rol için avantaj olabilir.</li>
<li><b>Mülakat soruları:</b> adayın en zayıf üç alanı için önerilen yapılandırılmış mülakat soruları. Mülakatta bu alanları somut örneklerle derinleştirin.</li>
<li><b>Yanıt güvenilirliği:</b> kişilik bölümünde tekdüze ya da çelişkili yanıt, aşırı hızlı bilişsel bölüm veya yüksek <b>sosyal beğenirlik</b> (kendini olduğundan iyi gösterme) varsa uyarı verir. Uyarı varsa kişilik sonuçlarını temkinli yorumlayın.</li>
</ul>
<div class="warn"><b>Önemli:</b> Bu rapor bir <b>karar destek</b> aracıdır. İşe alım kararını yalnızca bu rapora dayandırmayın; yapılandırılmış mülakat, referans kontrolü ve iş örneğiyle birlikte değerlendirin. Adaylara eşit koşullar sağlayın ve ayrımcılık yasağına uyun.</div>`,
    en: `
<h3>What it measures</h3><p>Three sections per candidate: <b>cognitive ability</b> (24 items, 18 minutes, timed), <b>situational judgement</b> (12 scenarios) and a <b>Big Five personality inventory</b> (32 statements incl. 2 social-desirability checks). About 35 minutes. Answer keys exist only on the server.</p>
<h3>Step by step</h3><ol class="steps"><li><b>Panels → HR Candidate Assessment → New candidate</b>.</li><li>Enter name and position.</li><li>Choose the <b>job family</b>; it sets personality target ranges and weights.</li><li>Optionally add contact and a private note; create.</li><li>Send the personal, <b>single-use</b> link.</li><li>The cognitive timer cannot be paused and closes automatically.</li><li>After completion open the report; the comparison table ranks all candidates.</li></ol>
<h3>Reading the report</h3><ul><li><b>Role fit score</b> weighted by job family (e.g. manager: 40% cognitive, 35% situational, 25% personality fit). 70+ strong, 55–69 conditional, below 55 weak.</li><li><b>Cognitive domains:</b> % correct per domain.</li><li><b>Situational judgement:</b> effectiveness of chosen actions.</li><li><b>Personality:</b> dots vs. target ranges; traits are not good or bad, only fit.</li><li><b>Interview questions</b> for the three weakest areas.</li><li><b>Reliability</b> warnings (monotony, contradictions, speed, social desirability).</li></ul>
<div class="warn">This is <b>decision support</b>; never base a hiring decision on it alone.</div>`,
  },

  vizyon: {
    tr: `
<h3>Ne ölçer?</h3>
<p>Stratejinin çalışanlara ne kadar ulaştığını ve ne kadar paylaşıldığını beş boyutta ölçer: vizyon netliği, hedef uyumu, değerler & kültür, iç iletişim, rol netliği & hesap verebilirlik. Ayrıca çalışanlardan kurumun en önemli <b>üç önceliğini</b> seçmelerini ister ve bunu yönetimin resmî öncelikleriyle karşılaştırır. 25 ifade + 1 yön netliği sorusu + öncelik seçimi; yaklaşık 7 dakika.</p>
<h3>Adım adım</h3>
<ol class="steps">
<li><b>Paneller → Vizyon & İletişim Uyumu → Yeni değerlendirme</b>.</li>
<li>Birimleri girin.</li>
<li><b>Stratejik öncelik listesi</b>ni düzenleyin: 5–8 madde, her satıra bir tane. Hazır liste kendi önceliklerinize göre değiştirilebilir.</li>
<li>Altındaki listeden yönetimin <b>resmî ilk 3 önceliğini</b> işaretleyin. Bu seçim katılımcılara <b>gösterilmez</b>.</li>
<li>Oluşturun, paylaşın, yeterli yanıttan sonra kapatıp raporu açın.</li>
</ol>
<h3>Rapora özel bölümler</h3>
<ul>
<li><b>Strateji uyum oranı:</b> katılımcıların seçtiği üç öncelikten kaçının resmî önceliklerle örtüştüğünün ortalaması. Rastgele seçimde beklenen oran raporda ayrıca gösterilir (ör. 8 maddede %38). Uyum oranı bunun çok üzerinde değilse strateji çalışanlara ulaşmıyor demektir. %70 ve üstü güçlü bir hizalanmadır.</li>
<li><b>Önceliklerin seçilme oranı:</b> resmî öncelikler altın renkle işaretlidir. Resmî olmayan bir madde çok seçiliyorsa, çalışanlar kurumun gerçekte neye önem verdiğini farklı algılıyor olabilir; bu bazen yönetimin söylemiyle uygulamasının ayrıştığını gösterir.</li>
<li><b>Kör noktalar:</b> yöneticiler vizyonu genellikle çok daha net görür; fark büyükse vizyon üst kademede kalıyordur.</li>
</ul>
<h3>Yorumlarken dikkat</h3>
<ul><li>Düşük hedef uyumu ile yüksek "öncelikler sık değişiyor" şikâyeti birlikteyse sorun iletişimden çok planlama disiplinindedir.</li></ul>`,
    en: `
<h3>What it measures</h3><p>Vision clarity, goal alignment, values & culture, internal communication and role clarity, plus a <b>top-three priority</b> pick compared with management's official priorities. About 7 minutes.</p>
<h3>Step by step</h3><ol class="steps"><li><b>Panels → Vision & Communication Alignment → New assessment</b>.</li><li>Add departments.</li><li>Edit the <b>priority list</b> (5–8 items).</li><li>Tick the <b>official top 3</b> (hidden from respondents).</li><li>Create, share, close and report.</li></ol>
<h3>Report specifics</h3><ul><li><b>Strategy alignment rate:</b> average overlap with official priorities; compare with the chance level shown. 70%+ is strong alignment.</li><li><b>Pick rates:</b> heavily picked non-official items reveal a gap between what is said and what is done.</li><li>Large manager–employee gaps mean the vision stays at the top.</li></ul>`,
  },

  senaryo: {
    tr: `
<h3>Ne ölçer?</h3>
<p>Kurumun üç kriz senaryosuna hazırlık düzeyi: <b>ekonomik daralma & finansal şok</b>, <b>teknolojik kırılma & yeni rakip</b>, <b>mevzuat & regülasyon değişimi</b>. Her senaryoda beş alan (finans, operasyon, İK, tedarik zinciri, itibar) üçer ifadeyle, 1–5 <b>olgunluk ölçeği</b>yle değerlendirilir: Yok → Başlangıç → Gelişiyor → Yerleşik → İleri. Ayrıca yöneticiler her senaryonun <b>olasılığını</b> ve <b>etkisini</b> tahmin eder. Üç senaryoda 45 ifade + 6 tahmin; yaklaşık 12 dakika.</p>
<h3>Kimler yanıtlar?</h3>
<p><b>Yönetim ekibi</b>: genel müdür ve finans, operasyon, İK, satın alma, satış gibi fonksiyonların sorumluları. Önerilen sayı 5–15 kişidir. Farklı fonksiyonlardan katılım, kör noktaları ortaya çıkarır.</p>
<h3>Adım adım</h3>
<ol class="steps">
<li><b>Paneller → Senaryo Planlama & Kriz Hazırlığı → Yeni değerlendirme</b>.</li>
<li>Değerlendirilecek <b>senaryoları</b> seçin (üçü birden ya da yalnızca kurumunuzu ilgilendirenler).</li>
<li>Oluşturun ve bağlantıyı yalnızca yönetim ekibiyle paylaşın.</li>
<li>Herkes yanıtladıktan sonra raporu bir yönetim toplantısında birlikte inceleyin.</li>
</ol>
<h3>Rapora özel bölümler</h3>
<ul>
<li><b>Kriz Hazırlık Endeksi:</b> tüm alanların ortalama olgunluğu. 55'in altı, kriz anında doğaçlama yapılacağı anlamına gelir.</li>
<li><b>Senaryo × alan matrisi:</b> her hücre bir senaryoda bir alanın olgunluk puanıdır. Kırmızı hücreler kriz anında ilk kırılacak noktalardır; aksiyon planına buradan başlayın.</li>
<li><b>Risk matrisi:</b> balonun yatay konumu olasılığı, dikey konumu etkiyi, büyüklüğü hazırlık eksikliğini gösterir. Sağ üstteki büyük balonlar en tehlikeli senaryolardır.</li>
<li><b>Risk maruziyeti</b> = (olasılık × etki / 25) × (100 − hazırlık). <b>40 ve üstü:</b> acil eylem planı; <b>25–39:</b> 6 ay içinde planlama; <b>25 altı:</b> izleme.</li>
<li><b>Fonksiyon kırılımı:</b> örneğin finans yöneticisinin finansal hazırlığa verdiği puan diğer yöneticilerinkinden çok yüksekse, bilgi tek kişide kalıyor olabilir.</li>
</ul>
<h3>Yorumlarken dikkat</h3>
<ul><li>Olgunluk ölçeği kendi beyana dayanır. "Yerleşik" veya "İleri" denen alanlar için kanıt isteyin: yazılı plan var mı, en son ne zaman test edildi?</li>
<li>Yılda bir ve büyük bir değişiklikten (yeni yatırım, yeni pazar, yeni mevzuat) sonra tekrarlayın.</li></ul>`,
    en: `
<h3>What it measures</h3><p>Readiness for three crises (economic shock, technological disruption, regulatory change) across five areas on a 1–5 <b>maturity scale</b>, plus leaders' <b>likelihood</b> and <b>impact</b> estimates. About 12 minutes.</p>
<h3>Who responds</h3><p>The <b>leadership team</b> (5–15 people from different functions).</p>
<h3>Step by step</h3><ol class="steps"><li><b>Panels → Scenario Planning → New assessment</b>.</li><li>Select scenarios.</li><li>Share only with the leadership team.</li><li>Review the report together in a leadership meeting.</li></ol>
<h3>Report specifics</h3><ul><li><b>Crisis Readiness Index</b>; below 55 means improvisation in a crisis.</li><li><b>Scenario × area matrix</b>: red cells break first.</li><li><b>Risk matrix</b>: x likelihood, y impact, bubble size readiness gap.</li><li><b>Exposure</b> = (likelihood × impact / 25) × (100 − readiness): 40+ urgent, 25–39 plan within 6 months, below 25 monitor.</li></ul>`,
  },

  stres: {
    tr: `
<h3>Ne ölçer?</h3>
<p>İş kaynaklı stresin sekiz kaynağı: iş yükü dengesi, kontrol & özerklik, yönetici desteği, ekip desteği, ilişkiler & çatışma, rol netliği, değişim yönetimi ve iş-yaşam dengesi. Ayrıca son bir aydaki <b>tükenmişlik belirtileri</b> (yorgunluk, uyku sorunu, isteksizlik, bedensel şikâyetler) ayrı bir gösterge olarak izlenir. 36 ifade + 1 isteğe bağlı açık uçlu soru; yaklaşık 8 dakika.</p>
<h3>Adım adım</h3>
<ol class="steps">
<li><b>Paneller → Kurumsal Stres & Dayanıklılık → Yeni değerlendirme</b>.</li>
<li>Birimleri girin; sahada ortak cihaz kullanılacaksa kiosk modunu açın.</li>
<li>Paylaşın. Yoğun dönemlerin (yıl sonu, sezon) hemen ortasında değil, olağan bir dönemde uygulamak sonuçları daha karşılaştırılabilir kılar.</li>
<li>Kapatıp raporu açın.</li>
</ol>
<h3>Rapora özel bölümler</h3>
<ul>
<li><b>Psikososyal Sağlık Endeksi:</b> sekiz stres kaynağının ortalaması. <b>Yüksek puan = daha sağlıklı ortam</b> (daha az stres).</li>
<li><b>Yüksek tükenmişlik riski:</b> belirti puanı 40'ın altında olan çalışanların oranı. %25'in üzeri kurum için ciddi bir uyarıdır.</li>
<li><b>Tükenmişlik belirtileri bölümü:</b> düşük / orta / yüksek risk dağılımı. Bu bölüm endekse katılmaz; stres kaynaklarının sonucunu gösterir.</li>
<li><b>Etki analizi:</b> hangi stres kaynağının tükenmişlikle en güçlü ilişkili olduğunu gösterir. Çoğu kurumda iş yükü, değişim yönetimi veya yönetici desteği öne çıkar.</li>
<li><b>Isı haritası:</b> belirli bir birimde belirtiler yoğunsa o birimde iş yükünü acil olarak yeniden dengeleyin.</li>
</ul>
<div class="warn"><b>Önemli:</b> Bu panel grup düzeyinde bir <b>risk taramasıdır</b>; bireysel tıbbi veya psikolojik tanı koymaz. Ciddi belirtiler için iş yeri hekimi, Çalışan Destek Programı (EAP) veya bir sağlık profesyoneline yönlendirme yapılması önerilir.</div>`,
    en: `
<h3>What it measures</h3><p>Eight work stressors plus <b>burnout symptoms</b> over the past month as a separate indicator; 36 statements, about 8 minutes.</p>
<h3>Step by step</h3><ol class="steps"><li><b>Panels → Workplace Stress → New assessment</b>.</li><li>Add departments; kiosk if needed.</li><li>Run in a normal period for comparability.</li><li>Close and report.</li></ol>
<h3>Report specifics</h3><ul><li><b>Psychosocial Health Index</b>: higher = healthier.</li><li><b>High burnout risk</b>: share with symptom score below 40; above 25% is a serious warning.</li><li><b>Driver analysis</b> shows which stressor relates most to burnout.</li></ul>
<div class="warn">A group-level <b>risk screen</b>, not a diagnosis. Refer serious cases to occupational health or an EAP.</div>`,
  },

  toplanti: {
    tr: `
<h3>Ne ölçer?</h3>
<p>Tek bir toplantının verimliliğini beş ağırlıklı boyutta ölçer: amaç & gündem (%25), zaman yönetimi (%20), katılım & etkileşim (%20), karar & aksiyon (%25), ortam & moderasyon (%10). 25 ifade + "bu toplantı gerekli miydi?" + "zamana değdi mi? (0–10)" + 1 isteğe bağlı öneri; <b>3–4 dakika</b>.</p>
<h3>Adım adım</h3>
<ol class="steps">
<li><b>Paneller → Toplantı Verimliliği → Yeni değerlendirme</b>.</li>
<li>Toplantı adını, tarihini, <b>süresini (dakika)</b> ve <b>katılımcı sayısını</b> girin.</li>
<li>Maliyet hesabı için <b>katılımcı başına ortalama saatlik maliyeti</b> (₺) girin. Brüt ücret + yan haklar toplamını yıllık çalışma saatine bölerek kabaca hesaplayabilirsiniz.</li>
<li>Oluşturun; toplantının <b>son 5 dakikasında</b> QR kodu ekrana yansıtın veya bağlantıyı toplantı grubuna gönderin. Toplantı bitmeden yanıtlatmak katılımı çok artırır.</li>
<li>Düzenli toplantılar (ör. haftalık üretim toplantısı) için <b>her toplantıya ayrı bir değerlendirme</b> açın. Panel sayfasında bu toplantıların <b>verimlilik trendi</b> grafiği oluşur.</li>
</ol>
<h3>Rapora özel bölümler</h3>
<ul>
<li><b>Toplantı Verimlilik Skoru:</b> beş boyutun ağırlıklı ortalaması. 70 ve üstü verimli, 55 altı ciddi iyileştirme gerektiren bir toplantıdır.</li>
<li><b>Maliyet</b> = süre (saat) × katılımcı sayısı × saatlik maliyet. <b>Verimsizlik kaybı</b> = maliyet × (1 − skor/100). Toplantı haftalık tekrarlanıyorsa rapor yıllık kaybı da hesaplar (×48 hafta).</li>
<li><b>Bu toplantı gerekli miydi?</b> Katılımcıların ne kadarının "daha kısa olabilirdi", "daha az kişiyle yapılabilirdi" veya "e-posta yeterdi" dediğini gösterir. "E-posta yeterdi" oranı %30'u aşıyorsa toplantının formatı sorgulanmalıdır.</li>
<li><b>Zamana değdi mi?</b> 0–10 ortalaması; etki analizinde sonuç göstergesi olarak kullanılır.</li>
<li><b>Rol kırılımı:</b> toplantıyı yönetenle katılımcıların puanı arasındaki fark, yöneticinin toplantıyı olduğundan iyi gördüğünü gösterebilir. Bu kırılım en az 3 kişilik gruplarda gösterilir.</li>
</ul>
<h3>Yorumlarken dikkat</h3>
<ul><li>Küçük toplantılarda (5 kişiden az) tek bir yanıt skoru çok etkiler; trendi birkaç toplantı boyunca izleyin.</li></ul>`,
    en: `
<h3>What it measures</h3><p>A single meeting on five weighted dimensions (purpose 25%, time 20%, participation 20%, decisions 25%, facilitation 10%) plus necessity, worth (0–10) and a suggestion; <b>3–4 minutes</b>.</p>
<h3>Step by step</h3><ol class="steps"><li><b>Panels → Meeting Effectiveness → New assessment</b>.</li><li>Enter name, date, <b>duration</b> and <b>attendees</b>.</li><li>Enter the <b>average hourly cost</b> per attendee.</li><li>Show the QR in the last 5 minutes of the meeting.</li><li>Create one assessment per occurrence of a recurring meeting to get a <b>trend</b>.</li></ol>
<h3>Report specifics</h3><ul><li><b>Score</b>: 70+ effective, below 55 needs serious work.</li><li><b>Cost</b> = hours × attendees × hourly cost; <b>inefficiency loss</b> = cost × (1 − score/100), annualised ×48 for weekly meetings.</li><li><b>Necessity</b>: over 30% "an email would do" is a red flag.</li><li><b>Role breakdown</b> (groups of 3+).</li></ul>`,
  },
};
