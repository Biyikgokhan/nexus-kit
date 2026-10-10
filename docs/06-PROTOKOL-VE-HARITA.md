> Design reference / Tasarım hedefleri. Shipped 0.3 scope and installation: [README](../README.md). Some workflows below are planned, not implemented.

# Protokol ve harita — `nexus-interlink/0.2`, barındırma, kayıt

## Manifest

Her mekân kendi alan adının kökünde iki kopya yayınlar: `/nexus.json` ve `/.well-known/nexus.json`. İkisi byte-byte aynıdır. Üretici: `manifestFor(node, nodes)` (Fudō `src/nexus/data.js`, KG Atelier `src/engine/nexus.js`).

```json
{
  "protocol": "nexus-interlink/0.2",
  "id": "bisiklet-atolyesi",
  "name": "Kozyatağı Bisiklet Atölyesi",
  "url": "https://bisikletatolyesi.com/",
  "kind": "studio",
  "description": "Eski çerçeveler, yeni yollar. …",
  "address": "… Kadıköy, İstanbul",
  "coordinates": {"latitude": 40.97, "longitude": 29.09},
  "anchorId": null,
  "coordinateSource": "Mekân sahibinin beyanı",
  "engine": "fudo-three",
  "room": {"width": 6.5, "depth": 5.1, "items": [{"id":"0","type":"table","x":-2,"z":-1.6,"label":"Tezgâh","target":""}]},
  "photos": [],
  "links": [{"object":"Duvardaki atlas","relation":"portal","url":"https://gokhanbiyik.com/nexus/"}]
}
```

| Alan | Kural | Kaynak |
| --- | --- | --- |
| `id` | kebab-case, 2–40, alan adından türetilir | kit |
| `name` | 2–70 | `validateNode` |
| `url` | `https://`, kimlik bilgisi yok | `safeUrl` |
| `kind` | `studio · garden · simulation · gallery · shop` | `kindLabels` |
| `description` | ≤ 600 | |
| `address` | ≤ 250 veya `null` (dijital mekân) | |
| `coordinates` | −90…90 / −180…180 veya `null`; `coordinateSource` zorunlu eşlik | `validCoordinates` |
| `anchorId` | dijital mekânın bağlı olduğu fiziksel mekân (SIM01 → kg-atelier) | NEXUS.md |
| `engine` | `fudo-three` (kolay yol / room) · `kg-walk` (modelci walk) · `fudo-stage` · başka | 0.3'te serbest metin + `engineUrl` |
| `room` | 3–16 m, ≤ 24 nesne, tür listesi | `validateNode` |
| `photos` | ≤ 3; 0.2'de `data:` URI (< 1,5 MB), 0.3'te göreli yol | |
| `links[]` | `{object, relation: portal|reference, url}`; `https` | |
| `aliases[]` | ikinci alan adları (biyikgokhan.com → gokhanbiyik.com) | KG Atelier |
| `extensions` | serbest; kit `extensions.nexusKit {version, path: easy|modeler, geometry, checkedAt}` yazar | KG Atelier `extensions.atelier` |

Şema dosyası: [`schema/nexus-interlink-0.2.schema.json`](../schema/nexus-interlink-0.2.schema.json). `nexus-kit check` ve kayıt deposunun CI'ı aynı şemayı kullanır.

## İlişkiler: ne demek, ne demek değil

- `relation: portal` = bu nesneye dokunan ziyaretçi o siteye ışınlanır (`interlink.js warpTo`, hedef destekliyorsa `?nexus-entry=portal` varış efekti).
- `relation: reference` = bahsediyor, kapı değil.
- Bağlantı **tek yönlüdür** ve karşı tarafın onayı, takibi ya da üyeliği anlamına gelmez. Takip (kullanıcı → mekân) atlas tarafında ve tarayıcıda yereldir.
- Domain sahipliği **beyan**dır. Kayıt deposu CI'ı manifestin o alan adında gerçekten yayınlandığını kontrol eder; bu, sahiplik challenge'ı değildir ama beyanı canlı dosyaya bağlar.

## Barındırma

Paket statiktir. Tek zorunluluk: HTTPS + `.well-known` klasörünün servis edilmesi.

| Sağlayıcı | Ücret | `.well-known` | Not |
| --- | --- | --- | --- |
| Vercel | ücretsiz | çalışır | sürükle-bırak; alan adı Settings › Domains |
| Netlify | ücretsiz | çalışır | |
| Cloudflare Pages | ücretsiz | çalışır | |
| GitHub Pages | ücretsiz | `.nojekyll` gerekir (pakette hazır) | özel alan adı CNAME dosyası |
| cPanel / FTP | hosting ücreti | gizli klasör göster | `.htaccess` ile JSON MIME |

Alt klasör kuralı: `.well-known/nexus.json` **kökte**; mekân `/mekan/` altındaysa `url` o yolu gösterir. Sihirbaz bunu 8. adımda söyler.

## Haritaya çıkma: topluluk kaydı

Bugün federasyon yok; atlas `registry.json`'dan okur. Tasarım:

```text
github.com/<org>/nexus-registry
  registry.json            atlasın okuduğu liste (yalnız url + id + kind + anchorId + eklenme tarihi; içerik canlı manifestten)
  places/<id>.json         başvuru anındaki manifest kopyası (arşiv, diff için)
  .github/ISSUE_TEMPLATE/place-registration.yml   sihirbazın 9. adımda doldurduğu form
  .github/workflows/verify.yml
      · issue'daki URL'den .well-known/nexus.json çeker (10 s, 256 kB, yalnız https, yönlendirme ≤ 2, özel IP'ler engelli)
      · şema doğrular · id çakışması · kind · boyut
      · geçtiyse otomatik PR açar: registry.json + places/<id>.json
      · insan gözden geçirir (ekol/uygunluk), birleştirir
  CONTRIBUTING.md · CODE_OF_CONDUCT.md · POLICY.md (kaldırma, itiraz, ticari kullanım)
```

Atlas (`gokhanbiyik.com/nexus/`) yayın sırasında `registry.json`'ı alır ve her mekân için canlı manifesti **build sırasında** çeker (SSRF korumalı, aynı sınırlar); çalışma anında tarayıcı üçüncü taraf manifest çekmez (CORS ve gizlilik). Böylece mekân sahibi sadece kendi dosyasını günceller, sonraki atlas yayınında değişir. Haftalık otomatik atlas yayını yol haritasında.

Kaldırma: sahibi issue açar ya da manifestini `410`/silinmiş hâle getirir; CI üç ardışık başarısız çekişte kaydı "kayıp" işaretler, dördüncü haftada listeden düşer.

## Atlasta görünüm

- Adresli mekân: küre üzerinde koordinatında; şehir ölçeğinde stilize diyagramda; `coordinateSource` kartta yazılır.
- Dijital mekân: `anchorId` verdiği fiziksel mekânın yanında, lider çizgiyle.
- Kart: ad, tür, `tag` (kit `kind` + şehirden türetir; sahibi `extensions.nexusKit.tag` ile ezebilir), hikâye, kapılar (links), "Mekâna gir ↗" (portal geçişi).
- Renk: manifest vermez; atlas `kind`e göre atar (studio kırmızı, garden yeşil, simulation amber, gallery petrol, shop bakır). 0.3'te `color` isteğe bağlı alan.

## 0.3 önerileri (geriye uyumlu)

`photos` göreli yol · yeni `room.items.type` değerleri + `fallback` · `engine` serbest + `engineUrl` · `color` · `language` (`tr`, `en`) · `updatedAt` · `extensions.nexusKit`. Okuyucular bilinmeyen alanı yok sayar; bilinmeyen türü `fallback` ile çizer.

## Federasyona giden yol (bu paket iddia etmez)

1. Domain sahiplik challenge'ı (`/.well-known/nexus-challenge/<token>`).
2. İmzalı takip/geri çekme ve gelen kutusu (mekân → mekân).
3. Sınırlı, SSRF korumalı uzak manifest keşfi (bugün yalnız CI'da).
4. Açık dışa/içe aktarma; topluluk yönetimi ve itiraz politikası.
5. Google Places benzeri adres doğrulama, kullanıcıya ait kısıtlı anahtarla.

