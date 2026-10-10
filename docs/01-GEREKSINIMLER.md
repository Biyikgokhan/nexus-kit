> Design reference / Tasarım hedefleri. Shipped 0.3 scope and installation: [README](../README.md). Some workflows below are planned, not implemented.

# Gereksinimler ve kurulacaklar

Sihirbaz ilk ekranda bu tabloyu kendisi gösterir ve makineyi kontrol eder. Buradaki değerler KG Atelier ve Fudō'nun gerçek üretim ortamından alınmıştır (Node 22.12+, Three 0.180, Vite 7, Blender 4.5 LTS). "Önerilen" sütunu iki sitenin geliştirildiği makinelere yakın bir hedeftir; "asgari" sütunu sihirbazın çalışmayı reddetmediği sınırdır.

## Kolay yol (tarayıcı sihirbazı)

Kurulum yok. Sihirbaz statik bir sayfadır; fotoğraflar tarayıcından çıkmaz, ZIP tarayıcında üretilir.

| | Asgari | Önerilen |
| --- | --- | --- |
| Tarayıcı | WebGL2 destekli güncel Chrome / Edge / Firefox / Safari 17 | Chrome veya Edge, masaüstü |
| Cihaz | 4 GB RAM, telefon da olur | Dizüstü, 8 GB RAM, harici fare (kroki üstüne sürüklemek için) |
| Girdi | 1–3 fotoğraf (telefon, JPEG/WebP, her biri ≤ 1,5 MB'a küçültülür) + 1 kroki fotoğrafı | Kroki: A4 kâğıt, kalın kalem, numaralı eşyalar (Fudō örneği: 1 masa, 2 sedye, 3 koltuk…) |
| Ağ | Sihirbaz sayfasını açacak kadar; sonrası çevrimdışı da çalışır | — |
| Yayın için | Kendi alan adı (ör. `dukkanim.com`) ve HTTPS veren ücretsiz bir statik barındırma: Vercel, Netlify, Cloudflare Pages, GitHub Pages; ya da cPanel/FTP | Vercel veya Netlify (sürükle-bırak yükleme) |
| Yapay zekâ (isteğe bağlı) | Yok | Kendi Claude API anahtarı (tarayıcı oturum belleğinde, asla kaydedilmez) **veya** bilgisayarında çalışan Ollama |

Sihirbazın tarayıcıda kontrol ettikleri: WebGL2, `OffscreenCanvas`/`FileReader`, ekran genişliği (320 px'e kadar çalışır; 768 px altında kroki düzenleme "dokun ve yerleştir" moduna geçer), `prefers-reduced-motion`.

## Modelci yolu (CLI sihirbazı + Blender hattı)

`npx nexus-kit init` ilk iş olarak `doctor` çalıştırır ve aşağıdakileri raporlar. Eksik olan varsa kurulum bağlantısını ve işletim sistemine göre komutu gösterir; devam etmeye zorlamaz.

### Bilgisayar

| | Asgari | Önerilen |
| --- | --- | --- |
| İşletim sistemi | Windows 10/11, macOS 13+, Ubuntu 22.04+ | Windows 11 veya macOS (Fudō/KG Atelier Windows 11'de üretildi) |
| CPU | 4 çekirdek | 8+ çekirdek (Blender batch + Vite build) |
| RAM | 8 GB | 16–32 GB |
| GPU | WebGL2 yeteneği olan herhangi bir GPU, dahil grafik olur | Ayrık GPU; yerel yapay zekâ isteniyorsa 8 GB+ VRAM (gemma/qwen 7–9B sınıfı) |
| Disk | 5 GB boş | 20 GB (Blender, node_modules, model dosyaları) |
| Ekran | 1366×768 | 1920×1080; QA ekran görüntüleri 1440×900 ve 390 px mobil emülasyonuyla alınır |

### Kurulacaklar (zorunlu)

| Araç | Sürüm | Ne için | Kontrol komutu |
| --- | --- | --- | --- |
| Node.js | 22.12 veya üstü | Vite, motor, `nexus-kit` CLI | `node --version` |
| npm | Node ile gelir | Bağımlılıklar (`three@0.180`, `vite@7`) | `npm --version` |
| Git | 2.40+ | Sürümleme, kayıt PR'ı | `git --version` |
| Blender | **4.5 LTS** | `--background --python` ile sahne üretimi ve GLB dışa aktarma | `blender --version` (Windows'ta `"C:/Program Files/Blender Foundation/Blender 4.5/blender.exe" --version`) |

Blender 4.5 önemli: hat `bpy` API'siyle, Principled BSDF girdileri ve GLTF dışa aktarıcı seçenekleriyle 4.5'te doğrulandı. 4.2 LTS de büyük ihtimalle çalışır; 5.x için doğrulama yol haritasında.

### Kurulacaklar (isteğe bağlı, yola göre)

| Araç | Ne zaman | Not |
| --- | --- | --- |
| Python 3.12 | Mekânda canlı servis istiyorsan (Satori benzeri ziyaretçi rehberi, ziyaretçi defteri, yazıcı röle) | KG Atelier `tools/satori/guest_service.py` deseni; loopback + kendi geçidin |
| Ollama | Yerel yapay zekâ sağlayıcısı | `ollama pull` ile 7–9B bir model; görüntü yorumu için vision destekli model (kroki okuma) |
| Claude Code | Harness'ı ajanla kullanmak için | Kendi Claude üyeliğin; `harness/AGENTS.md` doğrudan `CLAUDE.md` olarak kullanılır |
| Vercel CLI / Netlify CLI | Terminalden yayın | Sürükle-bırak da yeter |
| Playwright | Tarayıcı QA (`nexus-kit check --browser`) | Fudō `tools/qa-*.mjs` deseni; Chromium indirir (~150 MB) |
| ImageMagick veya `sharp` | Doku üretimi (`tools/*-textures.mjs` deseni) | CLI `sharp`'ı npm ile getirir |
| Tailscale / cloudflared | Yerel servisi kendi alan adına açmak | KG Atelier: Tailscale Funnel; Fudō: cloudflared quick tunnel. İkisi de sahibinin açık onayıyla |

### Bilgi gereksinimi (modelci yolu)

Sihirbaz bunları öğretmez, varsayar; eksikse bağlantı verir:
- Blender'da nesne adlandırma, koleksiyon, modifier uygulama, Principled BSDF.
- Terminalde klasör değiştirme, `npm` komutu çalıştırma.
- Web (x, yükseklik, derinlik) ile Blender Z-up koordinatı farkı (hat dönüştürür; `tools/build_shop.py` `pos()` deseni).
- Bir alan adının DNS'ini barındırma sağlayıcısına yönlendirme.

## `doctor` raporu örneği

```text
nexus-kit doctor · 2026-09-20

  ✔ Node 22.12.0
  ✔ npm 10.9
  ✔ Git 2.47
  ✖ Blender bulunamadı
      Windows: winget install BlenderFoundation.Blender  (4.5 LTS seç)
      macOS:   brew install --cask blender
      Linux:   https://www.blender.org/download/lts/4-5/
  ✔ GPU: WebGL2 (headless Chromium ile denendi)
  ◌ Ollama yok  (isteğe bağlı; yerel yapay zekâ için)
  ◌ ANTHROPIC_API_KEY yok  (isteğe bağlı; Claude API için)
  ✔ Claude Code bulundu (claude 2.x)  → harness/providers/claude-code.md

  Devam edebilirsin: "init" çalışır; "blender" adımı Blender kurulana kadar atlanır.
```

`doctor` hiçbir şeyi otomatik kurmaz, hiçbir anahtar okumaz; yalnızca var/yok bakar.

