# Yol haritası

Sıra, KG Atelier'in gerçek sürüm mantığıyla: önce yürünebilir iskelet, sonra detay. Her madde "bitti" sayılmak için README'ye dürüst bir satır ister.

## 0.1 — Belgeler ve harness (bu klasör)

- [x] Tasarım özeti, gereksinimler, iki sihirbaz akışı, art direction, harness, protokol, topluluk.
- [x] `harness/AGENTS.md`, dört skill, sağlayıcı adaptörleri, `.env.example`.
- [x] `schema/nexus-interlink-0.2.schema.json`, `templates/place.example.json`, kroki şablonu.
- [ ] Ekol sahibi gözden geçirir; sayılar ve yasaklar onaylanır.

## 0.2 — Kolay yol (tarayıcı sihirbazı)

- [x] Atlasın mevcut kurucusu genişletildi (`nexus.html#kur`, `src/nexus/wizard.js`, `zip-browser.js`): 04 İndir · 05 Yayınla · 06 Haritaya çık; tarayıcı ZIP motor paketini yayının kendi Vite manifestinden toplar.
- [x] Izgara, palet, etiket, kapı, 3B önizleme (mevcut kurucu). [ ] Kroki 4-nokta düzeltme.
- [x] Yayın sekmeleri (Vercel/Netlify/Cloudflare/GitHub Pages/cPanel), `.well-known` tarayıcı kontrolü.
- [ ] Yardımcı paneli: Claude API (sessionStorage), Ollama; JSON görev zarfı.
- [ ] 320/390/1440 px QA, reduced-motion, console sıfır hata; `reference/wizard-qa.json`.

## 0.3 — Kayıt deposu ve atlas bağı

- [x] `nexus-registry` repo: issue şablonu, SSRF korumalı doğrulama (`scripts/verify.mjs`), otomatik PR iş akışı, POLICY.
- [ ] Atlas build'i `registry.json` + canlı manifest çekimi; haftalık yayın.
- [ ] Şema 0.3 (göreli foto, yeni türler + fallback, engine serbest, updatedAt).

## 0.4 — Modelci yolu (CLI)

- [x] `nexus-kit`: doctor · init · manifest · check · blender · harness · publish (bağımlılıksız, testli). [ ] sketch · dev · package.
- [ ] `walk` şablonu: KG Atelier `src/engine/*` vendored + `place-*.js` iskeleti + testler.
- [x] `templates/project/build_place.py`: place.json → kabuk + nesneler → zone/malzeme batch → GLB + rapor; Blender 4.5'te uçtan uca denendi. [ ] `--from-blend` gerçek dosyayla denenmedi.
- [x] `check`: şema, .well-known, https, sırlar, yasak varlık, GLB/üçgen/malzeme/doku bütçesi, bevel/reduced-motion/AA ipuçları. [ ] navigasyon rotası, Playwright.
- [ ] `stage` şablonu (Fudō istasyon kamerası) ve `room` şablonu.

## 0.5 — Harness sağlayıcıları

- [ ] `harness/client.mjs`: Claude API + Ollama; görüntü girişi; zaman aşımı; JSON zarfı doğrulama.
- [x] Claude Code kurulum komutu (`harness --provider=claude-code`).
- [ ] Astra ucu: sahibin geçidinde `POST /nexus/assist` (ziyaretçi sınıfı, davet anahtarı, kapasite); `astra.md` sözleşmesine göre.
- [ ] `schema/harness-task.schema.json`.

## 0.6 — Motor paketi ve canlı servis iskeleti

- [ ] `@nexus-kit/engine` npm paketi; `upgrade-engine` diff komutu; KG Atelier ve Fudō'nun ona geçişi.
- [ ] Python ziyaretçi rehberi iskeleti (`guest_service.py` deseni: loopback, Origin, kapasite, NDJSON; sahibe özel hiçbir şey yok).
- [ ] `os-shell` (KG/OS 98 kabuğu, boş uygulama listesi) kararı.

## Sonra

- EN belgeler; topluluk çağrısı; ilk üç dış mekân.
- Federasyon: domain challenge, imzalı takip, uzak keşif, dışa/içe aktarma.
- Blender 5.x doğrulaması; KTX2/Basis doku sıkıştırma; instancing yardımcıları.
