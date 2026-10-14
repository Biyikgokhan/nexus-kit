> **Setup update / Kurulum güncellemesi — 2026-10-14:** The current wizard exports a ready-to-host site ZIP requiring no end-user Node/npm, plus a separate developer source ZIP. Older drafts below that say every export requires a Node build describe the previous release. Verify the live wizard before claiming a deployment is complete. / Güncel sihirbaz Node/npm gerektirmeyen hazır site ZIP’i ve ayrı geliştirici kaynak ZIP’i üretir. Aşağıdaki eski taslaklarda her kurulum için Node istenmesi önceki sürüme aittir. Yayın tamamlandı demeden canlı sihirbazı kontrol et.

# Launch copy and publishing notes

Use after the kit is publicly readable; the maintenance registry stays private. Identify yourself as the maintainer and disclose that the project was developed with AI assistance under your design direction and prompting. Keep the personal introduction brief. Do not present design goals as shipped features. The original SVG in docs/img/nexus-flow.svg is Apache-2.0; credit the project. No media generation credits were spent.

Live wizard: [English](https://gokhanbiyik.com/nexus-kit/?lang=en) · [Türkçe](https://gokhanbiyik.com/nexus-kit/). These are prepared announcement drafts, not a record of posts already published.

## Reddit publication status / Reddit yayın durumu

Prepared on 2026-10-10. No Reddit posts have been submitted. The browser currently requires Reddit human verification and account sign-in; Chrome automation is also blocked by an open extension panel. Research findings below distinguish candidates from excluded communities. Confirm current rules, flair and account eligibility before submitting. Record actual permalinks only after verifying submission.

2026-10-10 tarihinde hazırlandı. Henüz Reddit gönderisi yayınlanmadı. Aşağıdaki topluluklar adaydır; paylaşım izinleri doğrulanmış değildir. Tarayıcıda insan doğrulaması ve hesap girişi gerekiyor. Güncel kurallar ve gerekli etiket paylaşım öncesi kontrol edilecek; tanıtımı kısıtlayan toplulukta uygun sabit başlık kullanılacak veya paylaşım yapılmayacak.

Voice / Üslup: invite people to explore and improve the project together. Use "I'd love to tinker together" naturally, alongside a concrete area for feedback. Express trust in younger makers without assigning them an obligation or promising resources. / İnsanları birlikte denemeye ve geliştirmeye davet et; "birlikte kurcalayıp geliştirmek isterim" ifadesini somut bir katkı alanıyla kullan. Genç üreticilere güveni anlatırken onlara görev yükleme veya sağlanmayan kaynaklar vaat etme.

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

I'd appreciate feedback on the GLB workflow and accessible navigation in particular. If this sounds interesting, I'd love to tinker together. What would make this a useful starting point for your own studio?

## Reddit / r/SideProject — English project introduction

Title: I open-sourced a kit for artists to build 3D studios on their own websites

I'm Gökhan, a self-taught designer with 20+ years of professional experience in design, mainly motion and art direction. Nexus Interlink is an AI-assisted project that I guide through design decisions, visual references and iterative prompts.

It grew out of building stylized versions of creative spaces. I wanted artists and studios to be able to host their own place and link to one another, while keeping control of their files and domain.

Making that accessible to more people is the goal. The current build-and-deploy step still needs technical familiarity, and reducing that barrier is part of the work ahead.

The first public version is Nexus Kit: a Turkish/English setup wizard where you arrange a small 3D room, add links and download the editable source. It uses Three.js, accepts GLB models from tools such as Blender, and can be used with or without an AI assistant.

The connection part is deliberately small: each site publishes a JSON file describing its place and links. Owners provide their own hosting. Anyone can request a listing through the public GitHub form; entries are reviewed before appearing in the shared directory.

I also want discovery to happen through the places themselves: an artist can introduce Nexus and recommend another studio on their own site. Visitors follow ordinary links between them. Each owner decides whom to recommend, with no required reciprocal link or tracking widget.

You can [try the wizard here](https://gokhanbiyik.com/nexus-kit/?lang=en). [The source, licenses and setup instructions are on GitHub](https://github.com/Biyikgokhan/nexus-kit).

It's still an early starter. Exported projects need to be built with Node/npm, so deployment is the main technical step today. I'm hopeful younger makers will take this further than I can imagine. If it sparks your curiosity, I'd love to tinker together — especially on making setup easier for artists and small studios.

## Türkçe proje ve mimari paylaşımı — genel taslak

Bu taslak r/CodingTR için kullanılmayacak: [kural 2](https://www.reddit.com/r/CodingTR/wiki/rules/) tamamı yapay zekâyla oluşturulmuş gönderileri yasaklıyor. Metin, bu tür içeriğe izin veren başka bir yerde kullanılmak üzere korunuyor.

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

Genç üreticilerin bu fikri benim hayal ettiğimden daha ileriye taşıyabileceğine inanıyorum. Merak edenlerle birlikte kurcalayıp geliştirmek isterim. Özellikle mobil kullanım, GLB aktarımı ve kurulumun anlaşılabilirliği konusunda yorumlarınızı duymak güzel olur.

## Reddit / r/acikkaynak — Türkçe açık kaynak yazılım paylaşımı

Başlık: Nexus Kit: kendi sitenizde yayınlayabileceğiniz 3B atölyeler için açık kaynak başlangıç kiti

Merhaba, ben Gökhan. Kendi kendine öğrenerek yetişmiş, motion tasarım ve sanat yönetimi ağırlıklı 20 yılı aşkın profesyonel deneyimi olan bir tasarımcıyım. Nexus Interlink'i tasarım kararları, görsel referanslar ve yinelemeli promptlarla yönlendirdiğim AI destekli bir proje olarak geliştiriyorum.

Sanatçıların ve küçük stüdyoların kendi alan adlarında stilize bir mekân kurup birbirlerine bağlantı verebilmelerini istiyorum. Bunun için hazırladığım Nexus Kit'i açık kaynak yayınladım. Türkçe/İngilizce sihirbazda küçük bir Three.js odası düzenlenebiliyor; düzenlenebilir kaynak proje ZIP olarak indirilebiliyor. Blender gibi araçlardan GLB model kullanma yolu da var.

Bağlantı tarafı basit: sitenin kökündeki `/.well-known/nexus.json` dosyası mekânı ve komşu bağlantılarını tanımlıyor. Herkes kendi domain ve hostingini kullanıyor. Site sahibi seçtiği atölyeleri görünür HTML bağlantılarıyla önerebiliyor; karşı bağlantı zorunlu değil. Doğrudan bağlantılar merkezi dizin onayı gerektirmiyor; bakımını yaptığım atlas için başvurular ayrıca inceleniyor.

Araçlar GPL-3.0-or-later, başlangıç şablonları ve protokol Apache-2.0 lisanslı. Özgün eserlerin hakları üreticisinde kalıyor. Kiti kullanmak için AI hizmeti veya aboneliği gerekmiyor.

Bu hâlâ erken bir başlangıç. Fotoğraflardan otomatik bina üretmiyor; indirilen projeyi Node/npm ile derleyip HTTPS sunan bir hostta yayınlamak gerekiyor. Kurulumun teknik olmayan kullanıcılar için daha anlaşılır olması gereken yerleri var.

[Kaynak kod ve kurulum](https://github.com/Biyikgokhan/nexus-kit) · [Sihirbazı dene](https://gokhanbiyik.com/nexus-kit/)

Genç üreticilerin bu fikri benim hayal ettiğimden daha ileriye taşıyabileceğine inanıyorum. Merak edenlerle birlikte kurcalayıp geliştirmek isterim. Özellikle kurulum rehberindeki eksikleri ve bağımsız siteler arasındaki bu bağlantı biçiminin sizce neyi kolaylaştıracağını duymak isterim.

## Three.js forum / Showcase

Title: Nexus Interlink — independently hosted creative spaces with a Three.js starter

I'm Gökhan, a self-taught designer with 20+ years of professional experience, mainly in motion design and art direction. I maintain Nexus Interlink, an AI-assisted project developed through my design direction, visual references and iterative prompting.

Nexus Interlink uses a root HTTPS manifest and ordinary links to connect independent creative spaces. The current open-source release provides a TR/EN wizard, a procedural orbitable room and a source ZIP with Three.js/Vite, GLB loading and accessible text links.

The aim is broader access to creating these spaces, with participants retaining their own files, domains and choice of tools.

Discovery can happen on participants' own sites: visible HTML links introduce Nexus and point visitors to independently chosen neighbours. The guide includes a copyable example; no reciprocal link or tracking widget is required.

The renderer uses on-demand rendering and a capped pixel ratio. It reports actual renderer triangle/draw-call counters; no universal FPS promise is made. A manifest is engine-independent, so creators can replace this starter or bring models from Blender and other tools.

If you're curious about small, independently hosted 3D spaces, I'd love to tinker together. Feedback on accessibility and what a studio would need to adopt this would be especially useful. Current limitations and the roadmap are documented in the README.

Source and setup: https://github.com/Biyikgokhan/nexus-kit
Live wizard: https://gokhanbiyik.com/nexus-kit/?lang=en

## Türkçe kısa duyuru

Ben Gökhan; kendi kendine öğrenerek yetişmiş, motion tasarım ve sanat yönetimi ağırlıklı 20 yılı aşkın profesyonel deneyimi olan bir tasarımcıyım. Nexus, tasarımını ve geliştirme sürecini promptlar ve görsel referanslarla yönlendirdiğim AI destekli bir proje.

Nexus Interlink’i kreatiflerin ve stüdyoların kendi 3B mekânlarını kurup birbirlerine referans verebildiği açık bir zemine dönüştürüyoruz. Nexus Kit; Türkçe/İngilizce sihirbaz, Three.js kaynak proje ZIP’i, Blender/GLB yolu ve isteğe bağlı Claude/Codex becerileri sunuyor. Mekân kendi alan adında, özgün eserler sende. AI zorunlu değil.

Hedef, üretime katılma imkânını daha çok insana açmak ve katılımcının kendi dosyaları ile araçları üzerindeki kontrolünü korumak.

Katılımcılar kendi sitelerinde Nexus'u tanıtıp seçtikleri komşu mekânlara görünür bağlantılar verebilir. Böylece ziyaretçiler mekândan mekâna keşfe devam eder; karşı bağlantı zorunlu değildir. Kurulum rehberinde kopyalanabilir HTML örneği var.

İlk sürüm küçük bir diorama başlangıcı; otomatik bina modelleme veya ölçülmüş dijital ikiz iddiası yok. Katkı alanları: mobil performans, erişilebilirlik, açık lisanslı varlıklar ve birlikte çalışan farklı motorlar.

Domain ve hosting katılımcıya ait. Bağlantı başvuruları public GitHub formundan alınır ve bakımcı tarafından incelenir; bu akış projeye yeni bir sunucu veya ziyaretçi başına servis yükü getirmez.

Genç üreticilerin bu fikri çok daha ileriye taşıyabileceğine inanıyorum. Merak edenlerle birlikte kurcalayıp geliştirmek isterim.

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

### Community research, 2026-10-10 / Topluluk araştırması

| Community | Relevant angle | Current decision |
| --- | --- | --- |
| [r/threejs](https://www.reddit.com/r/threejs/) | Three.js starter, GLB and accessible navigation | Candidate; live rules and account eligibility still need checking. |
| [r/SideProject](https://www.reddit.com/r/SideProject/) | Why it exists, working demo and simpler onboarding | Candidate; live rules and account eligibility still need checking. |
| [r/acikkaynak](https://www.reddit.com/r/acikkaynak/) | Turkish open-source kit, licensing and self-hosting | Candidate: rules allow relevant project promotion. Use an original software post, choose the current appropriate flair, and recheck composer rules and account eligibility. No closed-source product recommendations. |
| [r/CodingTR rules](https://www.reddit.com/r/CodingTR/wiki/rules/) | Turkish software development | Excluded from this AI-authored campaign: rule 2 prohibits posts written entirely with AI. Do not disguise or paraphrase around that restriction. |
| [r/selfhosted](https://www.reddit.com/r/selfhosted/) | Static output on the participant's own HTTPS host | New projects belong in the current New Project Megathread. Prepare a top-level comment using its requested fields, not a separate launch post. |
| [r/webdev](https://www.reddit.com/r/webdev/) | Browser wizard, export/build flow and engineering limitations | Excluded from this AI-authored campaign: rule 8 prohibits LLM-generated posts/comments, including on Showoff Saturday. |
| [Three.js Showcase](https://discourse.threejs.org/) | Technical walkthrough and visible demo | Relevant forum; account sign-in required. |
| [r/opensource](https://www.reddit.com/r/opensource/) | Open-source licensing and participation | Excluded from this AI-authored campaign: rule 3 bans AI-generated content. Do not disguise or paraphrase around that restriction. |
| [r/creativecoding](https://www.reddit.com/r/creativecoding/) | Creative process and interactive spaces | Left out of this launch: its no-AI-art rule makes this AI-assisted creative showcase a poor fit without clarification from moderators. |

These are research decisions, not a claim that any post has been published or accepted. / Bunlar araştırma kararlarıdır; yayınlanmış veya kabul edilmiş gönderi anlamına gelmez.

### r/selfhosted — New Project Megathread comment

Research reference: [Week of 08 Oct 2026](https://www.reddit.com/r/selfhosted/comments/1x145j7/new_project_megathread_week_of_08_oct_2026/). If posting later, find the current pinned thread rather than reviving an old one.

**Project Name:** Nexus Kit / Nexus Interlink

**Repo / website:** [Source and setup](https://github.com/Biyikgokhan/nexus-kit) · [Browser wizard](https://gokhanbiyik.com/nexus-kit/?lang=en)

**Description:** An early starter for artists and small studios to host a stylized 3D place on their own domain. It exports editable Three.js/Vite source, supports GLB models and uses an HTTPS JSON manifest plus ordinary links to connect independent places. Owners can introduce the project and recommend neighbouring studios on their own sites; return links are optional. The maintained atlas uses manual review, but direct links work without its approval.

**Deployment:** Node.js 22.12+ and npm for setup/build. Run the wizard locally or use the public wizard, extract the source ZIP, run `npm install` and `npm run build`, then serve `dist/` on an HTTPS host with `/.well-known/nexus.json` at the domain root. Runtime output is static; this starter has no database or hosted AI backend. Hosting is supplied by each participant. [TR/EN self-host guide](https://github.com/Biyikgokhan/nexus-kit/blob/main/docs/SELF-HOST.md).

**AI Involvement:** Yes. I'm Gökhan, a self-taught designer with 20+ years of professional experience, mainly motion design and art direction. I guide this AI-assisted project through design decisions, references and iterative prompts. AI use is optional for people using the kit. Tooling is GPL-3.0-or-later; templates and protocol are Apache-2.0.

It's an early diorama starter, and deployment still needs technical familiarity. If this sounds interesting, I'd love to tinker together, especially on making self-hosting easier for creative people.


## Türkçe teknik paylaşım

Ben Gökhan. Kendi kendine öğrenerek yetişmiş, 20 yılı aşkın profesyonel deneyimi olan bir tasarımcıyım; geçmişim ağırlıklı olarak motion tasarım ve sanat yönetimi. Nexus Interlink, tasarım kararları, görsel referanslar ve yinelemeli promptlarla yönlendirdiğim AI destekli bir proje.

Nexus Interlink, bağımsız yaratıcı mekânları kök HTTPS manifesti ve normal bağlantılarla birleştirir. Açık kaynak sürüm; TR/EN sihirbaz, prosedürel oda ve Three.js/Vite kaynak ZIP’i sunar. Blender veya diğer araçlardan GLB aktarabilir, WebGL olmasa da metin bağlantılarını kullanabilirsin.

Amaç yaratıcı üretime erişimi genişletmek. Bunun için kurulum, düşük donanımda kullanım ve erişilebilirlik tarafında hâlâ geliştirilmesi gereken noktalar var.

Keşif için katılımcıların kendi sayfalarından seçtikleri komşu mekânlara doğrudan bağlantı vermesini öneriyoruz. Nexus tanıtımı ve komşu bağlantısı için Three.js yanında kullanılabilen basit HTML örneği rehberde; karşı bağlantı şartı veya takip betiği yok.

Görüntüleyici yalnız etkileşim sırasında yeniden çizer ve piksel oranını sınırlar. Gerçek üçgen/çizim çağrısı sayaçlarını gösterir; her cihaz için FPS sözü vermez. Erişilebilirlik, mobil performans ve stüdyoların ihtiyaç duyduğu varlıklar üzerine birlikte kurcalayıp geliştirmek isterim.

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
