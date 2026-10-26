// OTOMATİK ÜRETİLDİ — elle düzenlemeyin. Kaynak: tools/ik-bank.mjs → node tools/build-ik.mjs
// Bu dosyada cevap anahtarı YOKTUR; puanlama sunucuda (submit_response) yapılır.
export const COG = [
 {
  "id": "N1",
  "domain": "num",
  "tr": "Bir ürünün fiyatı önce %20 artırılıyor, ardından yeni fiyat üzerinden %20 indirim yapılıyor. Son fiyat, ilk fiyata göre nasıldır?",
  "en": "A product's price is raised by 20%, then a 20% discount is applied to the new price. How does the final price compare with the original?",
  "o": [
   [
    "%2 daha düşüktür",
    "2% lower"
   ],
   [
    "%4 daha yüksektir",
    "4% higher"
   ],
   [
    "%4 daha düşüktür",
    "4% lower"
   ],
   [
    "Aynıdır",
    "The same"
   ]
  ]
 },
 {
  "id": "N2",
  "domain": "num",
  "tr": "Bir makine saatte 240 parça üretiyor. Verim %15 artırılırsa 8 saatlik bir vardiyada kaç parça üretir?",
  "en": "A machine produces 240 parts per hour. If its output rises by 15%, how many parts will it produce in an 8-hour shift?",
  "o": [
   [
    "2.112",
    "2,112"
   ],
   [
    "2.160",
    "2,160"
   ],
   [
    "2.280",
    "2,280"
   ],
   [
    "2.208",
    "2,208"
   ]
  ]
 },
 {
  "id": "N3",
  "domain": "num",
  "tr": "Aynı hızda çalışan 3 kişi bir işi 12 günde bitiriyor. Aynı hızda çalışan 4 kişi bu işi kaç günde bitirir?",
  "en": "Three people working at the same rate finish a job in 12 days. How many days would four people at the same rate need?",
  "o": [
   [
    "16",
    "16"
   ],
   [
    "8",
    "8"
   ],
   [
    "9",
    "9"
   ],
   [
    "10",
    "10"
   ]
  ]
 },
 {
  "id": "N4",
  "domain": "num",
  "tr": "Bir depoda günlük tüketim 75 birim, tedarik süresi 6 gün ve emniyet stoğu 150 birimdir. Yeniden sipariş noktası kaç birimdir?",
  "en": "A warehouse uses 75 units per day, the supplier lead time is 6 days and safety stock is 150 units. What is the reorder point?",
  "o": [
   [
    "450",
    "450"
   ],
   [
    "750",
    "750"
   ],
   [
    "525",
    "525"
   ],
   [
    "600",
    "600"
   ]
  ]
 },
 {
  "id": "N5",
  "domain": "num",
  "tr": "Bir ekip ilk çeyrekte 480.000 TL, ikinci çeyrekte 552.000 TL satış yaptı. Artış oranı yüzde kaçtır?",
  "en": "A team sold 480,000 in Q1 and 552,000 in Q2. What is the percentage increase?",
  "o": [
   [
    "%13,5",
    "13.5%"
   ],
   [
    "%15",
    "15%"
   ],
   [
    "%12",
    "12%"
   ],
   [
    "%18",
    "18%"
   ]
  ]
 },
 {
  "id": "N6",
  "domain": "num",
  "tr": "Sayı dizisinde soru işareti yerine ne gelmelidir?  3 · 7 · 15 · 31 · 63 · ?",
  "en": "Which number should replace the question mark?  3 · 7 · 15 · 31 · 63 · ?",
  "o": [
   [
    "127",
    "127"
   ],
   [
    "125",
    "125"
   ],
   [
    "94",
    "94"
   ],
   [
    "129",
    "129"
   ]
  ]
 },
 {
  "id": "V1",
  "domain": "verbal",
  "tr": "\"Titiz\" kelimesine anlamca en yakın ifade hangisidir?",
  "en": "Which is closest in meaning to \"meticulous\"?",
  "o": [
   [
    "Sert",
    "Harsh"
   ],
   [
    "Dikkatli ve özenli",
    "Careful and thorough"
   ],
   [
    "Hızlı",
    "Fast"
   ],
   [
    "Özensiz",
    "Careless"
   ]
  ]
 },
 {
  "id": "V2",
  "domain": "verbal",
  "tr": "\"Geçici\" kelimesinin zıt anlamlısı hangisidir?",
  "en": "Which is the opposite of \"temporary\"?",
  "o": [
   [
    "Ani",
    "Sudden"
   ],
   [
    "Kısa",
    "Brief"
   ],
   [
    "Değişken",
    "Variable"
   ],
   [
    "Kalıcı",
    "Permanent"
   ]
  ]
 },
 {
  "id": "V3",
  "domain": "verbal",
  "tr": "Kaptan : Gemi  =  Pilot : ?",
  "en": "Captain : Ship  =  Pilot : ?",
  "o": [
   [
    "Yolcu",
    "Passenger"
   ],
   [
    "Kule",
    "Tower"
   ],
   [
    "Havalimanı",
    "Airport"
   ],
   [
    "Uçak",
    "Aircraft"
   ]
  ]
 },
 {
  "id": "V4",
  "domain": "verbal",
  "tr": "\"Şirket maliyetleri düşürmek için tedarikçi sayısını azalttı; ancak bu karar tek tedarikçiye bağımlılığı artırdı.\" Bu cümleden hangi sonuç çıkarılabilir?",
  "en": "\"The company cut its number of suppliers to lower costs; however, this increased its dependence on a single supplier.\" Which conclusion follows?",
  "o": [
   [
    "Kararın hem bir faydası hem de bir riski var.",
    "The decision has both a benefit and a risk."
   ],
   [
    "Tedarikçiler karardan memnun değil.",
    "Suppliers are unhappy with the decision."
   ],
   [
    "Maliyetler kesinlikle arttı.",
    "Costs definitely rose."
   ],
   [
    "Şirket yeni tedarikçi arıyor.",
    "The company is looking for new suppliers."
   ]
  ]
 },
 {
  "id": "V5",
  "domain": "verbal",
  "tr": "Aşağıdaki cümlelerden hangisi yazım bakımından doğrudur?",
  "en": "Which sentence is spelled correctly?",
  "o": [
   [
    "Toplantı yarın saat 10'da yapılacak.",
    "The meeting will be held tomorrow at 10."
   ],
   [
    "Yanlız çalışmayı sever.",
    "She works seperately."
   ],
   [
    "Herkez toplantıya katıldı.",
    "Everyone recieved the email."
   ],
   [
    "Birşey söylemeden çıktı.",
    "He definately agreed."
   ]
  ]
 },
 {
  "id": "V6",
  "domain": "verbal",
  "tr": "Tohum : Ağaç  =  Yumurta : ?",
  "en": "Seed : Tree  =  Egg : ?",
  "o": [
   [
    "Kanat",
    "Wing"
   ],
   [
    "Yuva",
    "Nest"
   ],
   [
    "Kuş",
    "Bird"
   ],
   [
    "Kabuk",
    "Shell"
   ]
  ]
 },
 {
  "id": "L1",
  "domain": "logic",
  "tr": "Tüm yöneticiler liderlik eğitimi aldı. Ayşe liderlik eğitimi almadı. Buna göre hangisi kesinlikle doğrudur?",
  "en": "All managers have taken leadership training. Ayşe has not taken leadership training. Which is definitely true?",
  "o": [
   [
    "Ayşe eğitimi ileride alacaktır.",
    "Ayşe will take the training later."
   ],
   [
    "Ayşe yönetici değildir.",
    "Ayşe is not a manager."
   ],
   [
    "Kesin bir şey söylenemez.",
    "Nothing definite can be said."
   ],
   [
    "Ayşe yöneticidir.",
    "Ayşe is a manager."
   ]
  ]
 },
 {
  "id": "L2",
  "domain": "logic",
  "tr": "Bazı mühendisler satış ekibindedir. Satış ekibindeki herkes İngilizce bilir. Buna göre hangisi kesinlikle doğrudur?",
  "en": "Some engineers are in the sales team. Everyone in the sales team speaks English. Which is definitely true?",
  "o": [
   [
    "Bütün mühendisler İngilizce bilir.",
    "All engineers speak English."
   ],
   [
    "Hiçbir mühendis İngilizce bilmez.",
    "No engineer speaks English."
   ],
   [
    "İngilizce bilen herkes satış ekibindedir.",
    "Everyone who speaks English is in sales."
   ],
   [
    "Bazı mühendisler İngilizce bilir.",
    "Some engineers speak English."
   ]
  ]
 },
 {
  "id": "L3",
  "domain": "logic",
  "tr": "A, B'den uzundur. C, A'dan uzundur. D, B'den kısadır. En uzun kimdir?",
  "en": "A is taller than B. C is taller than A. D is shorter than B. Who is the tallest?",
  "o": [
   [
    "D",
    "D"
   ],
   [
    "C",
    "C"
   ],
   [
    "A",
    "A"
   ],
   [
    "B",
    "B"
   ]
  ]
 },
 {
  "id": "L4",
  "domain": "logic",
  "tr": "Bugün pazartesi ise 100 gün sonra hangi gündür?",
  "en": "If today is Monday, what day will it be in 100 days?",
  "o": [
   [
    "Salı",
    "Tuesday"
   ],
   [
    "Pazar",
    "Sunday"
   ],
   [
    "Çarşamba",
    "Wednesday"
   ],
   [
    "Perşembe",
    "Thursday"
   ]
  ]
 },
 {
  "id": "L5",
  "domain": "logic",
  "tr": "\"Yağmur yağarsa saha çalışması ertelenir.\" Saha çalışması ertelenmedi. Buna göre hangisi kesinlikle doğrudur?",
  "en": "\"If it rains, the fieldwork is postponed.\" The fieldwork was not postponed. Which is definitely true?",
  "o": [
   [
    "Yağmur yağmadı.",
    "It did not rain."
   ],
   [
    "Saha çalışması iptal edildi.",
    "The fieldwork was cancelled."
   ],
   [
    "Yağmur yağdı.",
    "It rained."
   ],
   [
    "Kesin bir şey söylenemez.",
    "Nothing definite can be said."
   ]
  ]
 },
 {
  "id": "L6",
  "domain": "logic",
  "tr": "P, R, S, T, U projeleri sırayla teslim edilecek. U ilk, T son teslim ediliyor. S, P'den önce; R ise S'den hemen sonra teslim ediliyor. Üçüncü sırada hangi proje teslim edilir?",
  "en": "Projects P, R, S, T, U are delivered in sequence. U is first and T is last. S comes before P, and R comes immediately after S. Which project is delivered third?",
  "o": [
   [
    "P",
    "P"
   ],
   [
    "U",
    "U"
   ],
   [
    "S",
    "S"
   ],
   [
    "R",
    "R"
   ]
  ]
 },
 {
  "id": "P1",
  "domain": "pattern",
  "tr": "Hangisi diğerleriyle aynı gruba ait değildir?",
  "en": "Which one does not belong with the others?",
  "o": [
   [
    "Pul",
    "Washer"
   ],
   [
    "Çekiç",
    "Hammer"
   ],
   [
    "Vida",
    "Screw"
   ],
   [
    "Somun",
    "Nut"
   ]
  ]
 },
 {
  "id": "P2",
  "domain": "pattern",
  "tr": "Dizide soru işareti yerine ne gelmelidir?  2 · 6 · 12 · 20 · 30 · ?",
  "en": "What comes next?  2 · 6 · 12 · 20 · 30 · ?",
  "o": [
   [
    "42",
    "42"
   ],
   [
    "44",
    "44"
   ],
   [
    "40",
    "40"
   ],
   [
    "36",
    "36"
   ]
  ]
 },
 {
  "id": "P3",
  "domain": "pattern",
  "tr": "Harf dizisinde sıradaki harf hangisidir?  A · C · F · J · O · ?",
  "en": "Which letter comes next?  A · C · F · J · O · ?",
  "o": [
   [
    "S",
    "S"
   ],
   [
    "U",
    "U"
   ],
   [
    "V",
    "V"
   ],
   [
    "T",
    "T"
   ]
  ]
 },
 {
  "id": "P4",
  "domain": "pattern",
  "tr": "Aşağıdaki kod çiftlerinden hangisinin iki tarafı birebir aynıdır?",
  "en": "In which pair are both codes exactly identical?",
  "o": [
   [
    "TR-9073-PL  /  TR-9073-PL",
    "TR-9073-PL  /  TR-9073-PL"
   ],
   [
    "TR-5546-ZA  /  TR-5564-ZA",
    "TR-5546-ZA  /  TR-5564-ZA"
   ],
   [
    "TR-1180-MN  /  TR-1180-NM",
    "TR-1180-MN  /  TR-1180-NM"
   ],
   [
    "TR-4821-KX  /  TR-4812-KX",
    "TR-4821-KX  /  TR-4812-KX"
   ]
  ]
 },
 {
  "id": "P5",
  "domain": "pattern",
  "tr": "Dizide sıradaki sayı hangisidir?  81 · 27 · 9 · 3 · ?",
  "en": "What comes next?  81 · 27 · 9 · 3 · ?",
  "o": [
   [
    "1/2",
    "1/2"
   ],
   [
    "0",
    "0"
   ],
   [
    "1",
    "1"
   ],
   [
    "6",
    "6"
   ]
  ]
 },
 {
  "id": "P6",
  "domain": "pattern",
  "tr": "Saat tam 3:15'i gösterirken akrep ile yelkovan arasındaki küçük açı kaç derecedir?",
  "en": "At exactly 3:15, what is the smaller angle between the hour and minute hands?",
  "o": [
   [
    "22,5°",
    "22.5°"
   ],
   [
    "15°",
    "15°"
   ],
   [
    "0°",
    "0°"
   ],
   [
    "7,5°",
    "7.5°"
   ]
  ]
 }
];

export const SJT = [
 {
  "id": "J1",
  "tr": "Teslim tarihine iki gün kala, projenin kritik bir bölümünde ciddi bir hata fark ettiniz. Hatayı düzeltmek teslimi geciktirecek. Ne yaparsınız?",
  "en": "Two days before a deadline you notice a serious error in a critical part of the project. Fixing it will delay delivery. What do you do?",
  "o": [
   [
    "Ekip arkadaşlarımdan destek ister, gecikmeyi en aza indirmeye çalışır ve durumu yöneticime de iletirim.",
    "Ask teammates for help to minimise the delay and also let my manager know."
   ],
   [
    "Teslimi zamanında yapar, hatayı bir sonraki sürümde düzeltirim.",
    "Deliver on time and fix the error in the next release."
   ],
   [
    "Kimseye söylemeden, mesai dışında çalışarak yetiştirmeye çalışırım.",
    "Try to catch up by working after hours without telling anyone."
   ],
   [
    "Yöneticimi hemen bilgilendirir; hatanın etkisini ve iki-üç çözüm seçeneğini birlikte sunarım.",
    "Inform my manager immediately, presenting the impact and two or three solution options."
   ]
  ]
 },
 {
  "id": "J2",
  "tr": "Bir müşteri şirket politikasına aykırı bir ayrıcalık istiyor ve ısrar ediyor. Ne yaparsınız?",
  "en": "A customer insists on an exception that goes against company policy. What do you do?",
  "o": [
   [
    "Talebi değerlendirmesi için yöneticime yönlendiririm.",
    "Refer the request to my manager to decide."
   ],
   [
    "Talebi kesin bir dille reddeder ve konuyu kapatırım.",
    "Refuse firmly and close the topic."
   ],
   [
    "Politikayı nazikçe açıklar, politika çerçevesinde sunabileceğim bir alternatif öneririm.",
    "Politely explain the policy and offer an alternative within it."
   ],
   [
    "Müşteriyi kaybetmemek için bu seferlik kabul ederim.",
    "Agree just this once so as not to lose the customer."
   ]
  ]
 },
 {
  "id": "J3",
  "tr": "Bir ekip arkadaşınız toplantıda sizin hazırladığınız bir fikri kendi fikriymiş gibi sundu. Ne yaparsınız?",
  "en": "A colleague presents an idea you developed as their own in a meeting. What do you do?",
  "o": [
   [
    "Toplantıdan sonra kendisiyle birebir ve sakin bir dille konuşurum.",
    "Talk to them one-to-one, calmly, after the meeting."
   ],
   [
    "Toplantıda hemen araya girip fikrin bana ait olduğunu söylerim.",
    "Interrupt right away in the meeting and say the idea is mine."
   ],
   [
    "Hiçbir şey söylemem; önemli olan fikrin hayata geçmesi.",
    "Say nothing; what matters is that the idea gets implemented."
   ],
   [
    "Durumu yöneticime anlatırım.",
    "Tell my manager about it."
   ]
  ]
 },
 {
  "id": "J4",
  "tr": "İki farklı yöneticiden, ikisi de \"acil\" işaretli iki görev aldınız ve ikisini birden zamanında bitirmeniz mümkün değil. Ne yaparsınız?",
  "en": "Two managers each give you an \"urgent\" task and you cannot finish both on time. What do you do?",
  "o": [
   [
    "İkisine de yetişmeye çalışır, gerekirse kaliteden ödün veririm.",
    "Try to do both, compromising on quality if necessary."
   ],
   [
    "Kendi değerlendirmeme göre daha kritik olanı seçer, diğerine gecikeceğini bildiririm.",
    "Pick the more critical one myself and tell the other manager theirs will be late."
   ],
   [
    "İki yöneticiyi de durumdan haberdar edip önceliği birlikte netleştirmelerini isterim.",
    "Inform both managers and ask them to agree on the priority together."
   ],
   [
    "Daha kıdemli yöneticinin işini yaparım.",
    "Do the more senior manager's task."
   ]
  ]
 },
 {
  "id": "J5",
  "tr": "Yeni başladığınız bir işte size verilen talimatın verimsiz olduğunu düşünüyorsunuz. Ne yaparsınız?",
  "en": "In a job you have just started, you think an instruction you were given is inefficient. What do you do?",
  "o": [
   [
    "Talimata uyar, düşüncemi kendime saklarım.",
    "Follow it and keep my thoughts to myself."
   ],
   [
    "Bildiğim daha iyi yöntemle yaparım.",
    "Do it my own, better way."
   ],
   [
    "Önce talimata uyar, süreci anladıktan sonra somut verilerle iyileştirme öneririm.",
    "Follow it first, then propose an improvement with concrete data once I understand the process."
   ],
   [
    "Yöneticime talimatı neden verimsiz bulduğumu hemen anlatırım.",
    "Immediately tell my manager why I find it inefficient."
   ]
  ]
 },
 {
  "id": "J6",
  "tr": "Bir iş arkadaşınızın şirket aracını düzenli olarak özel işleri için kullandığını fark ettiniz. Ne yaparsınız?",
  "en": "You notice a colleague regularly using a company vehicle for personal errands. What do you do?",
  "o": [
   [
    "Hemen etik bildirim kanalına veya yöneticime bildiririm.",
    "Report it immediately to the ethics channel or my manager."
   ],
   [
    "Görmezden gelirim; beni ilgilendirmez.",
    "Ignore it; it's not my business."
   ],
   [
    "Diğer iş arkadaşlarımla bu durumu konuşurum.",
    "Discuss it with other colleagues."
   ],
   [
    "Önce kendisiyle konuşur, devam ederse uygun kanala bildiririm.",
    "Speak to them first, and report it through the proper channel if it continues."
   ]
  ]
 },
 {
  "id": "J7",
  "tr": "Bir müşteri, sizin hatanız olmayan bir gecikme için telefonda size bağırıyor. Ne yaparsınız?",
  "en": "A customer shouts at you on the phone about a delay that was not your fault. What do you do?",
  "o": [
   [
    "Özür diler, konuyu yöneticime aktaracağımı söylerim.",
    "Apologise and say I will pass it to my manager."
   ],
   [
    "Sakin kalır, yaşadığı sorunu kabul eder ve çözüm için net bir sonraki adım ve zaman veririm.",
    "Stay calm, acknowledge the problem and give a clear next step and timeline."
   ],
   [
    "Hatanın başka bir departmanda olduğunu açıklar ve onlara yönlendiririm.",
    "Explain the error was in another department and transfer them."
   ],
   [
    "Aynı ses tonuyla karşılık veririm.",
    "Respond in the same tone."
   ]
  ]
 },
 {
  "id": "J8",
  "tr": "Ekibinizde sürekli geç kalan ve işlerini size bırakan bir arkadaşınız var. Ne yaparsınız?",
  "en": "A teammate is constantly late and leaves their work to you. What do you do?",
  "o": [
   [
    "Ben de aynı şekilde davranmaya başlarım.",
    "Start behaving the same way."
   ],
   [
    "Durumu yöneticime bildiririm.",
    "Report the situation to my manager."
   ],
   [
    "Onun işlerini de yapmaya devam ederim.",
    "Keep doing their work as well."
   ],
   [
    "Kendisiyle açık ve yapıcı bir görüşme yapar, etkisini somut örneklerle anlatırım.",
    "Have an open, constructive talk with them using concrete examples of the impact."
   ]
  ]
 },
 {
  "id": "J9",
  "tr": "Yöneticiniz, sevkiyatı hızlandırmak için kalite kontrol adımlarından birini atlamanızı istiyor. Ne yaparsınız?",
  "en": "Your manager asks you to skip a quality-control step to speed up a shipment. What do you do?",
  "o": [
   [
    "Atlamayı reddeder, gerekirse kalite birimine danışırım.",
    "Refuse to skip it and consult the quality department if needed."
   ],
   [
    "Riskleri somut olarak açıklar, kalite adımını koruyarak hızlandırmanın başka yollarını öneririm.",
    "Explain the risks concretely and propose other ways to speed up while keeping the check."
   ],
   [
    "Talimat olduğu için adımı atlarım.",
    "Skip the step, since it's an instruction."
   ],
   [
    "Yazılı talimat isterim; yazılı gelirse atlarım.",
    "Ask for written instructions and skip it if I get them."
   ]
  ]
 },
 {
  "id": "J10",
  "tr": "Uzun süredir üzerinde çalıştığınız bir öneri yönetim tarafından reddedildi. Ne yaparsınız?",
  "en": "A proposal you worked on for a long time is rejected by management. What do you do?",
  "o": [
   [
    "Kararı kabul eder, konuyu kapatırım.",
    "Accept the decision and drop it."
   ],
   [
    "Ret gerekçesini öğrenir; geri bildirimle öneriyi geliştirir ya da başka işlere odaklanırım.",
    "Find out why, then improve the proposal with the feedback or move on to other work."
   ],
   [
    "Öneriyi değiştirmeden tekrar tekrar sunarım.",
    "Keep resubmitting it unchanged."
   ],
   [
    "Motivasyonumu kaybeder, artık öneri vermem.",
    "Lose motivation and stop making proposals."
   ]
  ]
 },
 {
  "id": "J11",
  "tr": "Yeni bir yazılım sistemine geçiliyor ve ekibin deneyimli çalışanları değişime direnç gösteriyor. Ne yaparsınız?",
  "en": "A new software system is being rolled out and the team's experienced members resist the change. What do you do?",
  "o": [
   [
    "Ben de eski yöntemle çalışmaya devam ederim.",
    "Keep working the old way too."
   ],
   [
    "Yalnızca kendi işime odaklanır, başkalarına karışmam.",
    "Focus only on my own work and stay out of it."
   ],
   [
    "Sistemi öğrenip ekibe pratik ipuçlarıyla yardım eder, kaygılarını yöneticiye iletirim.",
    "Learn the system, help the team with practical tips and pass their concerns to the manager."
   ],
   [
    "Ekip için eğitim düzenlenmesini yönetime öneririm.",
    "Suggest to management that training be arranged for the team."
   ]
  ]
 },
 {
  "id": "J12",
  "tr": "Önemli bir toplantıya hazırlanırken sunacağınız verilerde hedefin altında kalan bir sonuç gördünüz. Ne yaparsınız?",
  "en": "Preparing for an important meeting, you see that one result in your data falls short of target. What do you do?",
  "o": [
   [
    "Veriyi sunar ama dikkat çekmemesi için sona koyarım.",
    "Present it but put it at the end so it draws less attention."
   ],
   [
    "Sonucu olduğu gibi sunar; nedenlerini ve düzeltici planı da eklerim.",
    "Present it as it is, adding the causes and a corrective plan."
   ],
   [
    "Yöneticime önceden danışır, nasıl sunacağımıza birlikte karar veririz.",
    "Consult my manager beforehand and decide together how to present it."
   ],
   [
    "O veriyi sunumdan çıkarırım.",
    "Remove that data from the presentation."
   ]
  ]
 }
];
