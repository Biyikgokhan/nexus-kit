# Launch copy and publishing notes

Use after the kit is publicly readable; the maintenance registry stays private. Identify yourself as the maintainer. Do not present design goals as shipped features. The original SVG in docs/img/nexus-flow.svg is Apache-2.0; credit the project. No media generation credits were spent.

Live wizard: [English](https://gokhanbiyik.com/nexus-kit/?lang=en) · [Türkçe](https://gokhanbiyik.com/nexus-kit/). These are prepared announcement drafts, not a record of posts already published.

## Reddit publication status / Reddit yayın durumu

Prepared on 2026-10-10. No Reddit posts have been submitted. These communities are candidates, not confirmed posting permissions. The browser currently requires Reddit human verification and account sign-in; the web reader did not expose the communities' current rule text. Check the rules and required flair in the signed-in interface before submitting. If a community restricts promotion, use its designated thread or leave it out. Record actual permalinks below only after verifying submission.

2026-10-10 tarihinde hazırlandı. Henüz Reddit gönderisi yayınlanmadı. Aşağıdaki topluluklar adaydır; paylaşım izinleri doğrulanmış değildir. Tarayıcıda insan doğrulaması ve hesap girişi gerekiyor. Güncel kurallar ve gerekli etiket paylaşım öncesi kontrol edilecek; tanıtımı kısıtlayan toplulukta uygun sabit başlık kullanılacak veya paylaşım yapılmayacak.

## Reddit / r/threejs — English technical introduction

Title: Nexus Kit: an open-source Three.js starter for studios on their own domains

Hi everyone, I maintain Nexus Interlink. The project grew out of the stylized spaces at fudo.tattoo and gokhanbiyik.com, and I wanted to make the basic workflow reusable for other artists and small studios.

The idea is that each place lives on its owner's domain, with links to other places. A small JSON manifest at `/.well-known/nexus.json` describes the place and those links. The connection format is independent of the renderer, so using Three.js isn't a requirement for joining.

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

I maintain Nexus Interlink, a small project that grew out of building stylized versions of creative spaces. I wanted artists and studios to be able to host their own place and link to one another, while keeping control of their files and domain.

The first public version is Nexus Kit: a Turkish/English setup wizard where you arrange a small 3D room, add links and download the editable source. It uses Three.js, accepts GLB models from tools such as Blender, and can be used with or without an AI assistant.

The connection part is deliberately small: each site publishes a JSON file describing its place and links. Owners provide their own hosting. Anyone can request a listing through the public GitHub form; entries are reviewed before appearing in the shared directory.

You can [try the wizard here](https://gokhanbiyik.com/nexus-kit/?lang=en). [The source, licenses and setup instructions are on GitHub](https://github.com/Biyikgokhan/nexus-kit).

It's still an early starter. Exported projects need to be built with Node/npm, so deployment is the main technical step today. I'd like to hear from people who make portfolios or run small creative spaces: would a linked 3D place be useful to you, and where would this setup get in your way?

## Reddit / r/CodingTR — Türkçe proje ve mimari paylaşımı

Başlık: Kendi alan adında çalışan 3B atölyeler için açık kaynak başlangıç kiti: Nexus Kit

Merhaba, Nexus Interlink projesini geliştiriyorum. Çıkış noktası fudo.tattoo ve gokhanbiyik.com'daki stilize mekânlardı. Bu yaklaşımı, başka sanatçıların ve küçük stüdyoların da kendi araçlarıyla kullanabileceği bir başlangıca dönüştürmek istedim.

Fikir şu: herkes kendi 3B mekânını kendi domain ve hostinginde yayınlıyor; mekânlar birbirine bağlantı veriyor. Bağlantı yapısını, sitenin kökündeki `/.well-known/nexus.json` dosyası tanımlıyor. Bu dosya mekânın adı, adresi ve diğer mekânlara bağlantıları gibi bilgileri taşıyor. Aynı motoru kullanma zorunluluğu yok.

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

Nexus Interlink uses a root HTTPS manifest and ordinary links to connect independent creative spaces. I'm the project maintainer. The current open-source release provides a TR/EN wizard, a procedural orbitable room and a source ZIP with Three.js/Vite, GLB loading and accessible text links.

The renderer uses on-demand rendering and a capped pixel ratio. It reports actual renderer triangle/draw-call counters; no universal FPS promise is made. A manifest is engine-independent, so creators can replace this starter or bring models from Blender and other tools.

I'd welcome concrete feedback about accessibility and what you would need to adopt this in a small studio. Current limitations and the roadmap are documented in the README.

Source and setup: https://github.com/Biyikgokhan/nexus-kit
Live wizard: https://gokhanbiyik.com/nexus-kit/?lang=en

## Türkçe kısa duyuru

Nexus Interlink’i kreatiflerin ve stüdyoların kendi 3B mekânlarını kurup birbirlerine referans verebildiği açık bir zemine dönüştürüyoruz. Nexus Kit; Türkçe/İngilizce sihirbaz, Three.js kaynak proje ZIP’i, Blender/GLB yolu ve isteğe bağlı Claude/Codex becerileri sunuyor. Mekân kendi alan adında, özgün eserler sende. AI zorunlu değil.

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

Nexus Interlink, bağımsız yaratıcı mekânları kök HTTPS manifesti ve normal bağlantılarla birleştirir. Projenin bakımcısıyım. Açık kaynak sürüm; TR/EN sihirbaz, prosedürel oda ve Three.js/Vite kaynak ZIP’i sunar. Blender veya diğer araçlardan GLB aktarabilir, WebGL olmasa da metin bağlantılarını kullanabilirsin.

Görüntüleyici yalnız etkileşim sırasında yeniden çizer ve piksel oranını sınırlar. Gerçek üçgen/çizim çağrısı sayaçlarını gösterir; her cihaz için FPS sözü vermez. Erişilebilirlik, mobil performans ve stüdyoların ihtiyaç duyduğu varlıklar konusunda somut geri bildirim arıyoruz.

Kaynak: https://github.com/Biyikgokhan/nexus-kit

Görseller: docs/img/nexus-flow.svg (EN), docs/img/nexus-flow.tr.svg (TR). İki dilde de aynı kapsamı ve sınırları anlat.
