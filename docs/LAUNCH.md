# Launch copy and publishing notes

Use after the kit is publicly readable; the maintenance registry stays private. Identify yourself as the maintainer and disclose that the project was developed with AI assistance under your design direction and prompting. Keep the personal introduction brief. Do not present design goals as shipped features. The original SVG in docs/img/nexus-flow.svg is Apache-2.0; credit the project. No media generation credits were spent.

Live wizard: [English](https://gokhanbiyik.com/nexus-kit/?lang=en) · [Türkçe](https://gokhanbiyik.com/nexus-kit/). These are prepared announcement drafts, not a record of posts already published.

## Reddit publication status / Reddit yayın durumu

Prepared on 2026-10-10. No Reddit posts have been submitted. These communities are candidates, not confirmed posting permissions. The browser currently requires Reddit human verification and account sign-in; the web reader did not expose the communities' current rule text. Check the rules and required flair in the signed-in interface before submitting. If a community restricts promotion, use its designated thread or leave it out. Record actual permalinks below only after verifying submission.

2026-10-10 tarihinde hazırlandı. Henüz Reddit gönderisi yayınlanmadı. Aşağıdaki topluluklar adaydır; paylaşım izinleri doğrulanmış değildir. Tarayıcıda insan doğrulaması ve hesap girişi gerekiyor. Güncel kurallar ve gerekli etiket paylaşım öncesi kontrol edilecek; tanıtımı kısıtlayan toplulukta uygun sabit başlık kullanılacak veya paylaşım yapılmayacak.

## Reddit / r/threejs — English technical introduction

Title: Nexus Kit: an open-source Three.js starter for studios on their own domains

Hi everyone, I'm Gökhan, a self-taught designer with 20+ years of professional experience, mainly in motion design and art direction. I maintain Nexus Interlink, an AI-assisted project developed through my design direction, visual references and iterative prompting.

The project grew out of the stylized spaces at fudo.tattoo and gokhanbiyik.com, and I wanted to make the basic workflow reusable for other artists and small studios.

The longer-term goal is to make this kind of creative web space more accessible while leaving ownership and hosting choices with each participant.

The idea is that each place lives on its owner's domain, with links to other places. A small JSON manifest at `/.well-known/nexus.json` describes the place and those links. The connection format is independent of the renderer, so using Three.js isn't a requirement for joining.

Owners can introduce Nexus on their own sites and recommend neighbouring places through visible HTML links beside the 3D view. Visitors go directly to the linked site. Each owner chooses those links; a return link is optional. The self-hosting guide includes a small HTML example for this.

The current Nexus Kit starter includes:

- A Turkish/English browser wizard with an orbitable Three.js room and editable objects.
- An editable Three.js/Vite source ZIP, GLB loading and ordinary text links alongside the 3D view.
- A renderer that draws on demand, caps pixel ratio and exposes triangle/draw-call counters.

You can refine a scene in Blender or another tool that exports GLB. There's also an optional AI brief workflow and Claude/Codex tooling; the wizard itself makes no AI requests, and reference photos stay in browser memory.

This is an early diorama starter. The export needs a Node build before deployment; it doesn't reconstruct buildings from photos or include the full engine behind the reference sites. Each owner supplies their own hosting. Directory requests are reviewed manually, while direct links between places work independently.

[Try the wizard](https://gokhanbiyik.com/nexus-kit/?lang=en) · [Source and setup](https://github.com/Biyikgokhan/nexus-kit)

Tooling is GPL-3.0-or-later; exported templates and the protocol are Apache-2.0. Your original artwork remains yours.

I'd appreciate feedback on the GLB workflow and accessible navigation in particular. If you were adapting this for a small studio, which part would you want to replace first?

## Reddit / r/SideProject — English project introduction

Title: I open-sourced a kit for artists to build 3D studios on their own websites

I'm Gökhan, a self-taught designer with 20+ years of professional experience in design, mainly motion and art direction. Nexus Interlink is an AI-assisted project that I guide through design decisions, visual references and iterative prompts.

It grew out of building stylized versions of creative spaces. I wanted artists and studios to be able to host their own place and link to one another, while keeping control of their files and domain.

Making that accessible to more people is the goal. The current build-and-deploy step still needs technical familiarity, and reducing that barrier is part of the work ahead.

The first public version is Nexus Kit: a Turkish/English setup wizard where you arrange a small 3D room, add links and download the editable source. It uses Three.js, accepts GLB models from tools such as Blender, and can be used with or without an AI assistant.

The connection part is deliberately small: each site publishes a JSON file describing its place and links. Owners provide their own hosting. Anyone can request a listing through the public GitHub form; entries are reviewed before appearing in the shared directory.

I also want discovery to happen through the places themselves: an artist can introduce Nexus and recommend another studio on their own site. Visitors follow ordinary links between them. Each owner decides whom to recommend, with no required reciprocal link or tracking widget.

You can [try the wizard here](https://gokhanbiyik.com/nexus-kit/?lang=en). [The source, licenses and setup instructions are on GitHub](https://github.com/Biyikgokhan/nexus-kit).

It's still an early starter. Exported projects need to be built with Node/npm, so deployment is the main technical step today. I'd like to hear from people who make portfolios or run small creative spaces: would a linked 3D place be useful to you, and where would this setup get in your way?

## Reddit / r/CodingTR — Türkçe proje ve mimari paylaşımı

Başlık: Kendi alan adında çalışan 3B atölyeler için açık kaynak başlangıç kiti: Nexus Kit

Merhaba, ben Gökhan. Kendi kendine öğrenerek yetişmiş, 20 yılı aşkın profesyonel deneyimi olan bir tasarımcıyım; geçmişim ağırlıklı olarak motion tasarım ve sanat yönetimi. Nexus Interlink, tasarım kararları, görsel referanslar ve yinelemeli promptlarla yönlendirdiğim AI destekli bir proje.

Çıkış noktası fudo.tattoo ve gokhanbiyik.com'daki stilize mekânlardı. Bu yaklaşımı, başka sanatçıların ve küçük stüdyoların da kendi araçlarıyla kullanabileceği bir başlangıca dönüştürmek istedim.

Amaç, bu tür yaratıcı web mekânlarını daha çok insan için erişilebilir kılmak; dosya, alan adı ve üretim araçları üzerindeki kontrolü katılımcıda bırakmak. Kurulumun hâlâ teknik bilgi isteyen tarafları var.

Fikir şu: herkes kendi 3B mekânını kendi domain ve hostinginde yayınlıyor; mekânlar birbirine bağlantı veriyor. Bağlantı yapısını, sitenin kökündeki `/.well-known/nexus.json` dosyası tanımlıyor. Bu dosya mekânın adı, adresi ve diğer mekânlara bağlantıları gibi bilgileri taşıyor. Aynı motoru kullanma zorunluluğu yok.

İnsanların birbirini bu mekânların içinden keşfetmesini istiyorum. Katılımcı kendi sitesinde Nexus'u tanıtabiliyor, seçtiği başka atölyelere görünür bağlantılar verebiliyor. Ziyaretçi doğrudan o siteye gidiyor; karşı bağlantı zorunluluğu yok. Three.js görünümünün yanına eklenebilen basit HTML örneğini kurulum rehberine koydum.

Açık kaynak olarak yayınladığım Nexus Kit'te bugün şunlar var:

- Türkçe/İngilizce kurulum sihirbazı ve düzenlenebilir Three.js oda önizlemesi.
- Kaynak proje ZIP'i; Blender gibi araçlardan GLB model kullanma yolu.
- 3B görünümün yanında normal metin bağlantıları.
- İsteğe bağlı AI tasarım özeti ve Claude/Codex araçları. Sihirbazın kendisi AI çağrısı yapmıyor; referans fotoğrafları tarayıcıda kalıyor.

Şu an küçük bir diorama başlangıcı. Fotoğraftan otomatik bina çıkarmıyor; dışa aktarılan projeyi Node/npm ile derleyip yayınlamak gerekiyor. Domain ve hosting katılımcıya ait. Ortak atlasa katılmak için GitHub'dan başvuru yapılabiliyor; başvurular insan incelemesinden geçiyor. Mekânların birbirine doğrudan link vermesi için bu onay gerekmiyor.

[Sihirbazı dene](https://gokhanbiyik.com/nexus-kit/) · [Kaynak kod ve kurulum](https://github.com/Biyikgokhan/nexus-kit)

Araçlar GPL-3.0-or-later, başlangıç şablonları ve protokol Apache-2.0 lisanslı. Özgün eserlerin hakları üreticisinde kalıyor.

Özellikle mobil kullanım, GLB aktarımı ve kurulumun anlaşılabilirliği konusunda yorumlarınızı duymak isterim. Kendi portfolyonuz ya da stüdyonuz için uyarlayacak olsanız ilk eksik bulacağınız şey ne olurdu?

## Three.js forum / Showcase

Title: Nexus Interlink — independently hosted creative spaces with a Three.js starter

I'm Gökhan, a self-taught designer with 20+ years of professional experience, mainly in motion design and art direction. I maintain Nexus Interlink, an AI-assisted project developed through my design direction, visual references and iterative prompting.

Nexus Interlink uses a root HTTPS manifest and ordinary links to connect independent creative spaces. The current open-source release provides a TR/EN wizard, a procedural orbitable room and a source ZIP with Three.js/Vite, GLB loading and accessible text links.

The aim is broader access to creating these spaces, with participants retaining their own files, domains and choice of tools.

Discovery can happen on participants' own sites: visible HTML links introduce Nexus and point visitors to independently chosen neighbours. The guide includes a copyable example; no reciprocal link or tracking widget is required.

The renderer uses on-demand rendering and a capped pixel ratio. It reports actual renderer triangle/draw-call counters; no universal FPS promise is made. A manifest is engine-independent, so creators can replace this starter or bring models from Blender and other tools.

I'd welcome concrete feedback about accessibility and what you would need to adopt this in a small studio. Current limitations and the roadmap are documented in the README.

Source and setup: https://github.com/Biyikgokhan/nexus-kit
Live wizard: https://gokhanbiyik.com/nexus-kit/?lang=en

## Türkçe kısa duyuru

Ben Gökhan; kendi kendine öğrenerek yetişmiş, motion tasarım ve sanat yönetimi ağırlıklı 20 yılı aşkın profesyonel deneyimi olan bir tasarımcıyım. Nexus, tasarımını ve geliştirme sürecini promptlar ve görsel referanslarla yönlendirdiğim AI destekli bir proje.

Nexus Interlink’i kreatiflerin ve stüdyoların kendi 3B mekânlarını kurup birbirlerine referans verebildiği açık bir zemine dönüştürüyoruz. Nexus Kit; Türkçe/İngilizce sihirbaz, Three.js kaynak proje ZIP’i, Blender/GLB yolu ve isteğe bağlı Claude/Codex becerileri sunuyor. Mekân kendi alan adında, özgün eserler sende. AI zorunlu değil.

Hedef, üretime katılma imkânını daha çok insana açmak ve katılımcının kendi dosyaları ile araçları üzerindeki kontrolünü korumak.

Katılımcılar kendi sitelerinde Nexus'u tanıtıp seçtikleri komşu mekânlara görünür bağlantılar verebilir. Böylece ziyaretçiler mekândan mekâna keşfe devam eder; karşı bağlantı zorunlu değildir. Kurulum rehberinde kopyalanabilir HTML örneği var.

İlk sürüm küçük bir diorama başlangıcı; otomatik bina modelleme veya ölçülmüş dijital ikiz iddiası yok. Katkı alanları: mobil performans, erişilebilirlik, açık lisanslı varlıklar ve birlikte çalışan farklı motorlar.

Domain ve hosting katılımcıya ait. Bağlantı başvuruları public GitHub formundan alınır ve bakımcı tarafından incelenir; bu akış projeye yeni bir sunucu veya ziyaretçi başına servis yükü getirmez.

Sihirbaz: https://gokhanbiyik.com/nexus-kit/
Bağlantı başvurusu: https://github.com/Biyikgokhan/nexus-kit/issues/new?template=place-connection.yml

https://github.com/Biyikgokhan/nexus-kit

## Platform fit

- Reddit: read the selected community rules first; publish a single useful, disclosed post. Do not mass-crosspost.
- Three.js forum: use Showcase and allow normal moderation.
- Stack Overflow: no general launch announcement. Only answer a real, relevant technical question, include the solution in the answer and disclose affiliation if linking. No invented question to create a promotional opportunity.
- DEV/Hashnode: a technical article is appropriate if an existing authorized account is available.
- Blender communities: first test the actual Blender render pipeline, then share the tested workflow rather than implying an unverified addon.

Policies checked: [Stack Overflow promotion](https://stackoverflow.com/help/promotion), [Reddit spam](https://support.reddithelp.com/hc/en-us/articles/360043504051-Spam), [Three.js forum guidelines](https://discourse.threejs.org/guidelines).


## Türkçe teknik paylaşım

Ben Gökhan. Kendi kendine öğrenerek yetişmiş, 20 yılı aşkın profesyonel deneyimi olan bir tasarımcıyım; geçmişim ağırlıklı olarak motion tasarım ve sanat yönetimi. Nexus Interlink, tasarım kararları, görsel referanslar ve yinelemeli promptlarla yönlendirdiğim AI destekli bir proje.

Nexus Interlink, bağımsız yaratıcı mekânları kök HTTPS manifesti ve normal bağlantılarla birleştirir. Açık kaynak sürüm; TR/EN sihirbaz, prosedürel oda ve Three.js/Vite kaynak ZIP’i sunar. Blender veya diğer araçlardan GLB aktarabilir, WebGL olmasa da metin bağlantılarını kullanabilirsin.

Amaç yaratıcı üretime erişimi genişletmek. Bunun için kurulum, düşük donanımda kullanım ve erişilebilirlik tarafında hâlâ geliştirilmesi gereken noktalar var.

Keşif için katılımcıların kendi sayfalarından seçtikleri komşu mekânlara doğrudan bağlantı vermesini öneriyoruz. Nexus tanıtımı ve komşu bağlantısı için Three.js yanında kullanılabilen basit HTML örneği rehberde; karşı bağlantı şartı veya takip betiği yok.

Görüntüleyici yalnız etkileşim sırasında yeniden çizer ve piksel oranını sınırlar. Gerçek üçgen/çizim çağrısı sayaçlarını gösterir; her cihaz için FPS sözü vermez. Erişilebilirlik, mobil performans ve stüdyoların ihtiyaç duyduğu varlıklar konusunda somut geri bildirim arıyoruz.

Kaynak: https://github.com/Biyikgokhan/nexus-kit

Görseller: docs/img/nexus-flow.svg (EN), docs/img/nexus-flow.tr.svg (TR). İki dilde de aynı kapsamı ve sınırları anlat.

## Bio references / Biyografi kaynakları

The self-taught background, 20+ years of professional experience and role in prompting/design direction are Gökhan's own account. The short description of his practice was checked against his [portfolio](https://gokhanbiyik.com/) and [Behance profile](https://www.behance.net/biyikgokhan). Keep project credits precise: for example, the [EuroLeague Final Four 2017 case study](https://www.behance.net/gallery/59213135/EuroLeague-Final-Four-2017-Case-Study) credits Gökhan for post-production within a team, not sole authorship. The Reddit introductions intentionally omit client lists.

Özöğrenim, 20 yılı aşkın profesyonel deneyim ve prompt/tasarım yönlendirmesi bilgileri Gökhan'ın kendi anlatımıdır. Motion tasarım ve sanat yönetimi özeti portfolyosu ve Behance profiliyle karşılaştırıldı. Ekip işlerini tek kişiye mal eden ifadeler veya uzun müşteri listeleri kullanılmadı.

## Responding to criticism / Eleştirilere yanıt notları

These are factual reference notes, not automatic replies. Address the actual comment, acknowledge a valid limitation, and link to the relevant code or documentation. Do not use career length to dismiss technical criticism. Do not claim a fix until it has been implemented and checked. No automated promotional bot or reply system is included.

Bunlar otomatik cevaplar değil, yanıt verirken başvurulacak bilgi notlarıdır. Yorumun asıl noktasını ele al; haklı bir eksiği kabul et ve ilgili kodu veya belgeyi göster. Mesleki deneyimi teknik eleştiriyi geçersiz saymak için kullanma. Uygulanıp kontrol edilmemiş bir düzeltmeyi tamamlanmış gibi anlatma. Otomatik reklam/paylaşım botu veya cevap sistemi bu sürümde yok.

### AI assistance / AI desteği

**EN:** Yes, AI assisted development. I guide the concept and visual direction through references and iterative prompts. The source is available for inspection. Passing tests is useful evidence, but it does not establish that the code is bug-free or independently security-audited. People using the kit do not need an AI subscription.

**TR:** Evet, geliştirmede AI desteği var. Fikri ve görsel yönü referanslar ve yinelemeli promptlarla yönlendiriyorum. Kaynak kod incelemeye açık. Testlerin geçmesi yararlı bir kontrol; kodun hatasız veya bağımsız güvenlik denetiminden geçmiş olduğu anlamına gelmiyor. Kiti kullanmak için AI aboneliği gerekmiyor.

### Access and costs / Erişim ve maliyet

**EN:** Wider access is the aim, not a claim that every barrier has been solved. The wizard supports Turkish and English, but publishing still requires a Node/npm build and an HTTPS host. Each participant supplies their domain and hosting. The project still needs maintenance and listing review; it does not promise free hosting or zero human effort.

**TR:** Daha geniş erişim hedefimiz; bütün engelleri çözdüğümüz iddiası değil. Sihirbaz Türkçe/İngilizce, ancak yayın için hâlâ Node/npm ile derleme ve HTTPS hosting gerekiyor. Domain ve hosting katılımcıya ait. Projenin bakım ve başvuru inceleme işi devam ediyor; ücretsiz hosting veya sıfır emek sözü vermiyoruz.

### Private registry / Private registry

**EN:** The maintained directory is currently private and its listings are reviewed by a maintainer. That is a centralized editorial decision, even though places host themselves. The protocol and starter are public; direct links between places do not require directory approval. This is not yet community-run governance or an incorporated foundation.

**TR:** Bakımını yaptığımız dizin şu an private; listeye kabul kararını bakımcı veriyor. Mekânlar bağımsız barındırılsa da bu, merkezi bir yayın kararıdır. Protokol ve başlangıç kiti açık; iki mekânın birbirine doğrudan bağlantı vermesi dizin onayı gerektirmez. Henüz topluluk yönetimi veya kurulmuş bir vakıf iddiasında bulunmuyoruz.

### HTML, search and accessibility / HTML, arama ve erişilebilirlik

**EN:** The exported starter has ordinary text and links alongside the canvas, but currently inserts the place-specific content with JavaScript. That is not the same as prerendered HTML for crawlers or a JavaScript-free page. The portfolio reference site already exposes readable HTML; the starter does not yet reproduce that full approach. Static HTML output, metadata/social cards and broader accessibility checks remain work to do. We make no search-ranking guarantee.

**TR:** Dışa aktarılan başlangıç sayfasında canvas yanında normal metin ve bağlantılar var; ancak mekâna ait içerik şu anda JavaScript ile ekleniyor. Bu, botlara önceden hazırlanmış HTML sunmak veya JavaScript olmadan çalışan sayfa demek değil. Referans portfolyo sitesinde okunur HTML var; kit henüz bu yaklaşımın tamamını sunmuyor. Statik HTML çıktısı, metadata/paylaşım kartları ve daha geniş erişilebilirlik kontrolleri yapılacak işler arasında. Arama sıralaması garantisi vermiyoruz.

### What can be reused? / Neler yeniden kullanılabilir?

**EN:** Tooling is GPL-3.0-or-later; starter templates and the protocol are Apache-2.0, with dependency notices still applicable. The kit is an early diorama starter, not the complete engine or artwork from the reference sites. Original and third-party art require their own rights and license checks.

**TR:** Araçlar GPL-3.0-or-later; başlangıç şablonları ve protokol Apache-2.0 lisanslı, bağımlılıkların bildirimleri de geçerli. Kit erken aşamadaki bir diorama başlangıcı; referans sitelerin tüm motoru ve eserleri bu pakete dahil değil. Özgün ve üçüncü taraf eserler için hak/lisans koşulları ayrıca değerlendirilir.

### Visitor discovery / Ziyaretçilerin birbirini keşfetmesi

**EN:** Participants may recommend other places they choose using ordinary, visible links on their own sites. Return links are optional, and joining does not guarantee traffic. The HTML example is a manual way to introduce Nexus and a neighbouring place, not an automated advertising service. It adds no click tracking or central redirect. Site owners remain responsible for the links they publish and their own privacy practices.

**TR:** Katılımcılar kendi sitelerinde seçtikleri mekânları görünür, normal bağlantılarla önerebilir. Karşı bağlantı isteğe bağlıdır; ağa katılmak trafik garantisi vermez. HTML örneği Nexus'u ve komşu bir mekânı elle tanıtmanın yolu; otomatik reklam servisi değildir. Tıklama takibi veya merkezi yönlendirme eklemez. Site sahipleri yayınladıkları bağlantılardan ve kendi gizlilik uygulamalarından sorumludur.
