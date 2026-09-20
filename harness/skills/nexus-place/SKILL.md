---
name: nexus-place
description: Fotoğraf + kroki + sahibin anlatımından Nexus place.json üretir ve düzenler. Görevler - describe (hikâye), sketch-to-plan (kroki → oda planı), label (nesne etiketleri), review (ekol gözden geçirme). Tetikleyiciler - "mekânımı kur", "krokiyi oku", "odayı planla", "hikâye yaz", "place.json", "nexus mekânı".
---

# nexus-place

Girdi: `reference/sketch.jpg`, `reference/photos/*.jpg`, kullanıcının cevapları (uzun kenar kaç metre, kapı/pencere hangi kenarda, numaraların anlamı). Çıktı: `place.json` (şema: `schema/nexus-interlink-0.2.schema.json` + kit alanları).

## Kurallar

- Kroki **ölçüsüzdür**. Uzun kenarı kullanıcıdan al; bilmiyorsa adım sayısı × 0,75 m. Oda 3–16 m arasında kalır.
- Oda merkezi (0,0). `x` sağ, `z` kameraya doğru (+z ön). Kapı `south` = +z kenarı. Blender ve Three.js aynı sayıyı kullanır.
- En fazla 24 nesne; ilk taslakta 4–8. Tür: `table plant frame portal seat` (0.2). Sedye/yatak → `seat` (not düş: 0.3'te `bed`), tezgâh → `table`, ekran/tabela → `frame`, raf → `table` dar (not düş).
| Kroki numarası | Tür seçimi |
| --- | --- |
| masa, tezgâh, dolap | `table` |
| koltuk, sandalye, sedye | `seat` |
| bitki, saksı | `plant` |
| tablo, ekran, ayna, tabela | `frame` |
| başka siteye açılan şey | `portal` |
- Fotoğraftan **görünen** eşyayı koy; krokide olup fotoğrafta olmayanı krokiye güven, fotoğrafta olup krokide olmayanı sor.
- Her nesneye kısa, sahibin dilinde etiket (≤ 80): "Çalışma masası", "Bir çay içelim". Reklam dili yok.
- `portal` yalnız gerçek bir `https://` hedefi varsa. Sahibinin sitesi zaten `url`; portal başka dünyalara.
- `description` ≤ 600, iki-üç cümle, kapıdan giren birine anlatır gibi; "en iyi", "eşsiz" gibi sıfatlar yok. KG Atelier örneği: "Karagümrük'te bağımsız tasarım, hareketli görüntüler, etkileşim, 3D baskı ve IoT için açık atölye."
- `address` sahibi verdiyse; `coordinates` sahibi verdiyse `coordinateSource: "Mekân sahibinin beyanı"`. Sen koordinat uydurmazsın; adresten tahmin etmezsin.
- `geometry` alanı `"photo-sketch-and-owner-layout-interpretation"`; değiştirme.

## Görevler (JSON zarfı)

`describe` → `{"description": "...", "alternatives": ["...", "..."]}`
`sketch-to-plan` → `{"room": {"width", "depth", "items": [...]}, "stations": [{"id","name","tag","anchor":[x,y,z]}], "obstacles": [{"x","z","w","d"}]}`; `confidence` ver; emin olmadığın nesneyi `notes`a yaz.
`label` → `{"items": [{"id","label"}]}`
`review` → `{"findings": [{"level":"red|yellow|green","message":"...","fix":"..."}]}`; kontrol listesi: portal var mı, nesne sayısı, oda dışı nesne, `http://`, boş hikâye, adres var koordinat yok, fotoğraf yok.

## Modelci yolunda ek çıktı

`sketch-to-plan` sonucu `src/worlds/place-navigation.js` taslağına dönüşür: `zones` = oda dikdörtgeni eksi engeller (koridor ≥ 0,7 m), `obstacles` = her `table/seat` kutusu + 5 cm pay, `locations` = her istasyon için bakış noktası (nesnenin 1,2 m önü, göz 1,62). Rota testi (`tests/navigation.test.mjs`) her lokasyona ulaşabilmeli; ulaşamıyorsa engeli daralt, zone'u genişlet, kullanıcıya söyle.

## Yapma

Fotogrametri iddiası; görünmeyen oda; ölçülü rölöve dili; koordinat tahmini; sahibinin izin vermediği fotoğrafı pakete koymak.
