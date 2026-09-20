# Modelci yolu — CLI sihirbazı ve Blender hattı

Hedef kitle: Blender açabilen, terminali kullanabilen, kendi mekânını kendisi modellemek isteyen kişi. Sonuç: KG Atelier sınıfında bir dünya (perspektif kamera, yürüyüş, A*, istasyonlar, portallar, isteğe bağlı canlı servisler) ya da Fudō sınıfında bir sahne (Blender'dan GLB, istasyon kameraları, cutaway).

Sihirbaz bir npm paketidir: `npx nexus-kit <komut>`. Her komut kendini açıklar, hiçbir adımı sessizce atlamaz, hiçbir şeyi onaysız silmez veya yayınlamaz.

## Komut sözleşmesi

| Komut | Ne yapar | Ne yapmaz |
| --- | --- | --- |
| `doctor` | Gereksinim kontrolü (bkz. 01) | Kurmaz |
| `init <klasör>` | Proje iskeleti; motor şablonu seçimi; `harness/` kopyası; `place.json` sorgusu | Ağa bağlanmaz (npm hariç) |
| `sketch` | Kroki + fotoğrafları `place.json › room` planına çevirir; ajan bağlıysa öneri alır, yoksa interaktif ızgara TUI | Otomatik fotogrametri |
| `blender` | Blender 4.5 background ile `tools/build_place.py` çalıştırır; GLB üretir; üçgen/malzeme raporu | Blender'ı kurmaz; `.blend` dosyanı ezmez (önce `.runtime/backup/`) |
| `dev` | Vite dev sunucusu, 127.0.0.1, `strictPort` | Dışa açmaz |
| `check` | Şema, `.well-known`, ekol bütçeleri, geometri sayımı, isteğe bağlı tarayıcı QA | FPS garantisi vermez; raporda böyle yazar |
| `manifest` | `place.json` → `public/nexus.json` + `public/.well-known/nexus.json` (`manifestFor()`) | — |
| `package` | `dist/` + kaynak ZIP (`tools/package.mjs` deseni) | — |
| `publish` | Sağlayıcı seçtirir (Vercel/Netlify/Pages/manuel), yayın sonrası `.well-known` doğrular, kayıt PR metni hazırlar | Senin adına push/deploy yapmaz; komutu gösterir, onay ister |
| `harness` | Sağlayıcı seç (Claude Code / Claude API / Ollama / Astra), `.env.local` ve `CLAUDE.md`/`AGENTS.md` bağlantılarını kurar | Anahtar saklamaz; `.env.local` `.gitignore`'da |

Her komut `--json` ile makine okunur çıktı verir (ajanların kullanması için) ve `--dry-run` destekler.

## `init` akışı (sihirbazın soruları)

```text
? Mekânın adı                      › Kozyatağı Bisiklet Atölyesi
? Tür                              › studio · garden · simulation · gallery · shop
? Site adresin (https://)          › https://bisikletatolyesi.com   (boş bırakılabilir)
? Motor şablonu
    ▸ walk    KG Atelier: perspektif kamera, WASD yürüyüş, A*, istasyonlar, gece paleti
      stage   Fudō: sabit istasyon kameraları, cutaway diorama, GLB sahne, NPC yok
      room    Fudō Engine: prosedürel oda (kolay yolla aynı motor; hızlı başlangıç)
? Geometri kaynağı
    ▸ blender  Blender 4.5 script → GLB (Fudō yöntemi)
      code     Three.js prosedürel (KG Atelier yöntemi: box/cylinder/lathe + bevel)
      both     mimari GLB + prosedürel detay (önerilen)
? Yapay zekâ harness'ı bağlansın mı?   › Şimdi değil / Claude Code / Claude API / Ollama / Astra
? Canlı servis iskeleti (Python)?      › Hayır / Ziyaretçi rehberi (guest_service deseni)
```

Sonuç iskelet (`walk` + `both` seçimi):

```text
my-place/
  place.json                  tek kaynak: ad, tür, url, adres, koordinat, room, links, stations, palette
  index.html
  vite.config.js              base './', three manualChunk, strictPort
  package.json                dev/build/preview/test/check/package
  src/
    config.js                 place.json'dan türetilir (KG Atelier src/config.js deseni)
    main.js                   UI + createWorldView bağlama
    engine/                   VENDORED: world-view, navigation, batch, geometry, pose, nexus, spatial-audio, fly, announcer (MIT)
    worlds/
      place-layout.js         oda/eşik/cephe parametreleri (atelier-layout deseni)
      place-navigation.js     zones · obstacles · locations · eyeHeight · createNavigation()
      place.js                world factory: GLB yükle + prosedürel detay + istasyon bayrakları
      place-surfaces.js       malzeme/doku kurulumu (installAtelierSurfaces deseni)
  tools/
    build_place.py            Blender 4.5 hattı (build_shop.py'den türetilmiş, yerler boş)
    manifest.mjs              nexus.json üretimi
    geometry-report.mjs       üçgen/mesh sayımı → reference/geometry-vN.json
    qa.mjs                    Playwright ekran/console kontrolü (isteğe bağlı)
  public/
    models/                   GLB çıktısı
    textures/ fonts/ licenses/
    .well-known/nexus.json    (manifest komutu üretir)
  harness/                    AGENTS.md + skills + providers (kit'ten kopya)
  CLAUDE.md → harness/AGENTS.md   (Claude Code seçildiyse sembolik değil, kopya; Windows uyumu)
  tests/                      navigation.test.mjs, manifest.test.mjs, architecture.test.mjs şablonları
  reference/                  geometri raporları, QA görüntüleri
  .runtime/                   yerel sırlar, yedekler (gitignore)
```

`src/engine/` vendored'dır: KG Atelier README'sindeki dürüst not korunur ("iki sitenin otomatik güncellendiği yayımlanmış ortak npm paketi henüz yok"). Yol haritasında `@nexus-kit/engine` paketi var; o güne kadar `nexus-kit upgrade-engine` komutu diff gösterip onayla kopyalar.

## `sketch` akışı

1. `reference/sketch.jpg` ve `reference/photos/*.jpg` okunur (kullanıcı koyar).
2. Sorular: uzun kenar (m), kapı hangi kenarda, pencere hangi kenarda, tavan yüksekliği (varsayılan 3,0; KG Atelier 3,23).
3. Ajan bağlıysa `nexus-place › sketch-to-plan`: kroki + fotoğraf + cevaplar → `room.items` + `stations` + `obstacles` **önerisi**; terminalde ASCII plan çizilir; kullanıcı satır satır onaylar/düzeltir.
4. Ajan yoksa TUI ızgara: ok tuşlarıyla nesne koy, `l` etiket, `t` hedef URL.
5. Çıktı `place.json › room` + `src/worlds/place-navigation.js` taslağı (zones = oda dikdörtgeni − obstacles).

Kayıt: `place.json › geometry: "photo-sketch-and-owner-layout-interpretation"`. Bu alan manifest `extensions` içine yazılır; sihirbaz "ölçülü" demene izin vermez, çünkü kroki ölçü içermez (Fudō STUDIO-RECONSTRUCTION.md: "Krokide ölçü yok").

## `blender` hattı

`tools/build_place.py`, Fudō `tools/build_shop.py`'nin genelleştirilmiş hâlidir. Aynı sözleşme:

- Koordinat: web `(x, height, depth)`; `pos()` Blender Z-up'a çevirir. Böylece `place.json` içindeki `x,z` değerleri hem Three.js hem Blender'da aynı sayıdır.
- Yardımcılar: `mat()`, `tex()`, `box()` (bevel modifier, 1 segment), `cyl()` (12 kenar varsayılan), `ell()`, `rod()`, `panel()` (dik UV), `picture()` (eser oranı korunur; `assert` var), `plant()`.
- Her nesne `register(o, name, material)` ile **adlandırılır** ve `zone` alır. Ad, Three.js tarafında `getObjectByName` ile bulunur; batch adlı nesneleri birleştirmez.
- Eser slotları adlandırılmış boş paneller: `wall-art-00…`, `screen-00…`. Kit gerçek eser koymaz; kullanıcı kendi görselini koyar.
- Sonda: zone + malzeme bazlı birleştirme, `mesh.data.validate()`, GLB dışa aktarma (`export_apply=True`, `export_yup=True`, Draco yok — `three` yüklerken ek decoder istemesin).
- Rapor: üçgen sayısı toplam ve zone başına, malzeme sayısı, en büyük 10 mesh, doku boyutları; `reference/blender-report.json`.

`nexus-kit blender` komutu:

```text
· Blender 4.5 bulundu: C:/Program Files/Blender Foundation/Blender 4.5/blender.exe
· Yedek: .runtime/backup/place-2026-09-20T14-02.glb
· Çalıştırılıyor: blender --background --python tools/build_place.py
· 58 s · 41.203 üçgen · 27 malzeme · 12 zone · GLB 1,9 MB → public/models/place.glb
· Bütçe: ✔ üçgen (≤ 250k)  ✔ GLB (≤ 3 MB)  ✔ doku (≤ 1024²)  ⚠ 27 malzeme (hedef ≤ 20; batch draw call'ı artırır)
  Öneri: 'wood', 'wood-dark', 'oak' malzemelerini tek atlasta birleştir. (harness › nexus-blender › merge-materials)
```

Kullanıcı `.blend` içinde elle modelliyorsa: `tools/build_place.py --from-blend fudo-studio.blend` yalnız adlandırma denetimi + batch + export yapar; script sahneyi yeniden üretmez.

## `check` (ekol denetçisi)

Kırmızı = paketlenmez, sarı = uyarı, yeşil = geçti. Değerler [04-ART-DIRECTION.md](04-ART-DIRECTION.md) bütçelerinden gelir.

| Kontrol | Yöntem |
| --- | --- |
| Manifest şeması | `schema/nexus-interlink-0.2.schema.json` ile; `validateNode()` ile ikinci kez |
| `.well-known/nexus.json` == `nexus.json` | byte karşılaştırma |
| `https://` dışı bağlantı | red |
| Üçgen / mesh / malzeme / doku bütçesi | `geometry-report.mjs` (KG Atelier `tools/geometry-report.mjs` deseni); GLB için `gltf-transform inspect` |
| Bevel kuralı | prosedürel kodda `boxGeometry` kullanılmış mı (düz `BoxGeometry` ≥ 8 cm için uyarı) |
| Batch bayrakları | `userData.station/dynamic/reference/interaction/keep` dışında hareket eden mesh var mı (test: batch sonrası `getObjectByName` hâlâ buluyor mu) |
| Navigasyon | her `station.anchor` yürünebilir zone içinde mi; her `location` rotası var mı (`routeBetween` testi) |
| Işık bütçesi | gölge düşüren ışık ≤ 3, toplam ışık ≤ 14 (KG Atelier: moon + 2 spot gölgeli, 8 point) |
| Post | SMAA var, bloom eşiği ≥ 0,7, DPR ≤ 1,5 |
| Reduced motion | `prefers-reduced-motion` dallanması mevcut mu |
| Erişilebilirlik | canvas `aria-label`, skip link, `role="status"` |
| Yasaklar | `public/` içinde `maps.google`/`streetview` görüntüsü adı; `THIRD-PARTY.md` var mı; `.runtime/` ve `.env*` dist'e girmiş mi |
| Tarayıcı (`--browser`) | Playwright: 1440×900 ve 390 px; console error sıfır; yatay taşma yok; ilk boyama < 4 s (yerel) |

Rapor `reference/check-vN.json`; README'ye yapıştırılacak özet satırı üretir ("N Node testi geçti; geometri sayımı FPS ölçümü değildir").

## `publish`

1. `npm run build` → `dist/`.
2. Sağlayıcı seçimi; komutu **gösterir**, onay ister: `vercel deploy --prod` / `netlify deploy --prod --dir dist` / GitHub Pages için branch push adımı / manuel: "dist içeriğini kökte yayınla".
3. Yayın sonrası: `https://alan/.well-known/nexus.json` `fetch`, manifest `url` alanıyla karşılaştırma.
4. `KAYIT.md` üretir ve `gh issue create --repo <org>/nexus-registry --template place-registration` komutunu gösterir (gh yoksa bağlantı).
5. Canlı servis seçildiyse: geçidi nasıl açacağını anlatır (Tailscale Funnel / cloudflared) ve **açmaz**; KG Atelier'deki gibi bu ayrı, açık bir onaydır.

## Harness ile çalışma (modelci)

`nexus-kit harness` sonrası ajan, `harness/AGENTS.md`'yi okur ve dört skill'i bilir. Tipik döngü:

```text
sen:   "Krokideki 4 numaralı dolabı sağ duvara, 2,4 m genişlikte, üç raflı yap."
ajan:  place.json'a obstacle ekler → build_place.py'ye 'cabinet-04' fonksiyonu yazar (adlandırma + zone + bevel kuralı)
       → nexus-kit blender --json → raporu okur → bütçe aşıldıysa kendisi sadeleştirir → nexus-kit check --json → yeşil.
sen:   tarayıcıda bakarsın; "raflar çok kalın" dersin; döngü.
```

Ajan hiçbir zaman `publish`'i onaysız çalıştırmaz; skill dosyaları bunu yazar.

## İlk günün hedefi

`init` → `sketch` (elle, 6 nesne) → `blender` (yalnız kabuk + zemin + kapı) → `dev`'de içeri yürü → `check` yeşil. Detay, ışık, ses, Satori benzeri rehber sonra gelir. Bu, KG Atelier'in gerçek sırasıdır: 0.4 mimari, 0.5 eşya, 0.6 yazıcı, 0.7 Satori, 0.8 ses, 0.11 KG/OS.
