# Tasarım özeti — Nexus Kit kurulum sihirbazı

Tarih: 20 Eylül 2026. Kaynak gerçekler: `kg_atelier` 0.11 (`src/engine/*`, `src/worlds/*`, `public/.well-known/nexus.json`), Fudō `gta` (`src/nexus/*`, `server/nexus-api.mjs`, `tools/build_shop.py`, `NEXUS.md`, `PERFORMANCE.md`, `STUDIO-RECONSTRUCTION.md`).

## Sorun

Bugün Nexus atlasına bir mekân eklemek için ya Fudō'daki yerel üyelik API'sini çalıştırmak (loopback, JSON dosyası, tek süreç) ya da `registry.json` + `seedNodes` içine elle kayıt girmek gerekiyor. Motor ZIP'i var ama sadece sahibine özel API'den iniyor. Fotoğraf ve krokiden geometri çıkarımı yok; iki sitenin kurulumu tamamen sahibinin anlatımı + ajan + Blender ile elle yapıldı. Dışarıdan biri bu ekolde bir mekân kurmak istese nereden başlayacağını bilmiyor.

## Çözüm: iki sihirbaz, bir harness, bir protokol

```text
                 ┌──────────────────────┐        ┌──────────────────────────┐
  fotoğraf ───▶  │  KOLAY YOL           │        │  MODELCİ YOLU            │  ◀─── Blender
  kroki   ───▶  │  tarayıcı sihirbazı  │        │  npx nexus-kit (CLI)     │  ◀─── terminal
                 │  kurulum yok         │        │  Node 22 + Blender 4.5   │
                 └─────────┬────────────┘        └────────────┬─────────────┘
                           │  room JSON (3–16 m, ≤24 nesne)   │  world factory + GLB + navigation
                           ▼                                  ▼
                 ┌──────────────────────────────────────────────────────────┐
                 │  HARNESS (isteğe bağlı, kendi token'ınla)                │
                 │  kroki → plan · metin · Blender script · ekol denetimi    │
                 │  sağlayıcı: Ollama | Claude Code | Claude API | Astra     │
                 └──────────────────────────┬───────────────────────────────┘
                                            ▼
                 ┌──────────────────────────────────────────────────────────┐
                 │  nexus.json + .well-known/nexus.json  (nexus-interlink/0.2)│
                 │  kendi HTTPS alan adının kökü                              │
                 └──────────────────────────┬───────────────────────────────┘
                                            ▼
                 ┌──────────────────────────────────────────────────────────┐
                 │  TOPLULUK KAYDI (registry repo, PR ile) → atlas (gokhanbiyik.com/nexus) │
                 └──────────────────────────────────────────────────────────┘
```

## Kararlar

| # | Karar | Neden |
| --- | --- | --- |
| K1 | Kolay yol tamamen statik ve tarayıcıda çalışır; sunucu yok, hesap yok. | Fudō'daki üyelik API'si üretim için uygun değil (NEXUS.md "Yerel veri ve yayın sınırı"). Kullanıcının verisi tarayıcısında kalır, ZIP olarak iner. |
| K2 | Yapay zekâ her adımda isteğe bağlı; her adımın elle yolu var. | "Herkes kendi token'ını kullanacak" ilkesi: Kit anahtar toplamaz, sağlayıcıya aracılık etmez. Anahtarsız kullanıcı da bitirebilmeli. |
| K3 | Krokiden geometri çıkarımı otomatik değil, yardımlı. | Fotogrametri yok (NEXUS.md). Kroki, kullanıcı ızgaraya nesne sürüklerken arka plan görüntüsü; harness bağlıysa ilk yerleşimi ajan önerir, kullanıcı düzeltir. |
| K4 | Modelci yolu KG Atelier motorunu (`createWorldView` + `createNavigation` + `batchStaticMeshes`) şablon olarak alır; Fudō'nun Blender background script yöntemini GLB hattı olarak alır. | İki site bu ikisiyle kuruldu; ekol budur. Kolay yol Fudō `room-view` + `createRoom` prosedürel motorunu kullanır. |
| K5 | Haritaya çıkış PR tabanlı topluluk kaydıyla. | Sunucular arası federasyon, imzalı takip, domain sahiplik challenge'ı henüz yok. PR + `.well-known` doğrulaması bugün dürüstçe yapılabilen tek şey. |
| K6 | Ekol kuralları denetlenebilir: `nexus-kit check` bütçe ve şema kontrolü yapar, harness aynı kuralları sistem talimatı olarak taşır. | "Bizim dokunuşumuz optimize Three.js'e uygun 3B stilizasyon"; kural yazılı ve ölçülebilir olmazsa topluluk dağılır. |
| K7 | Astra bir sağlayıcı seçeneğidir, zorunlu değil. | Satori ziyaretçi/özel kanal ayrımı örneği: Astra'ya erişim davetle, sahibin geçidi üzerinden, kişisel harness dosyaları asla paylaşılmaz. |
| K8 | Hedef listesi kesin: `table plant frame portal seat` (0.2) + planlanan `counter shelf bed sign` (0.3). | Şema geriye uyumlu genişler; kolay yol ilk sürümde 0.2 türlerini kullanır. |

## Neyin var, neyin yok

Var (bugün kullanılabilir gerçekler):
- Manifest şeması ve `manifestFor()`; `.well-known/nexus.json` yayını; portal geçişi (`interlink.js`, `nexus-entry=portal`).
- Prosedürel oda motoru (`createRoom`, `room-view.js`), motor ZIP paketleyici (`nexus-zip.mjs`).
- KG Atelier motor çekirdeği: perspektif kamera, yürüyüş, A*, batch, istasyon, konumsal ses, KG/OS.
- Fudō Blender hattı: web koordinatı `(x, height, depth)`, adlandırılmış eser slotları, zone + malzeme batch, GLB dışa aktarma.

Yok (bu tasarımla yapılacak):
- Tarayıcı sihirbazı sayfası (`/nexus/#kur`), CLI paketi, `check` denetçisi, kayıt deposu, harness dosyalarının yayını, EN çeviri.
- Ajanın kroki yorumu için görüntü girişi (Claude API / Ollama vision) adaptörü.
- Sunucular arası federasyon, domain sahiplik challenge'ı, imzalı takip (yol haritasında; bu paket bunları iddia etmez).

## Kullanıcı yolculuğu (özet)

Kolay yol: 20–40 dakika, tamamen tarayıcıda. Modelci yolu: ilk dünya 1–3 gün; ilk `check` geçişi birinci gün hedefi.

## Başarı ölçütü

Bir dükkân sahibi, bir öğleden sonra, kimseye sormadan, kendi alan adında `.well-known/nexus.json` yayınlayabiliyor ve bir hafta içinde PR'ı birleşip atlasta görünüyor. Bir modelci, harness'ı Claude Code'a ya da Ollama'ya bağlayıp `nexus-kit check` yeşil olana kadar KG Atelier kalitesinde bir dünya çıkarabiliyor.
