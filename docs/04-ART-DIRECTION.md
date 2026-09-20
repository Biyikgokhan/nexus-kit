# Art direction — ekolün stilizasyon sözleşmesi

Bu belge "bizim dokunuşumuz"un yazılı hâlidir: KG Atelier ve Fudō'nun optimize Three.js stilizasyonu. `nexus-kit check` bu belgedeki ölçülebilir kuralları denetler; `harness/skills/nexus-art-direction` aynı kuralları ajana taşır. Sayılar iki sitenin gerçek ölçümlerinden türetilmiştir (`reference/geometry-v6.json`, Fudō `PERFORMANCE.md`).

## 1. Tavır

- **Fotoğraftan yorum, kopya değil.** Mekân, sahibinin fotoğrafı ve krokisinden *yorumlanır*. Ölçülü rölöve değildir ve öyle sunulmaz. Görmediğin oda modellenmez ("Mutfak/WC içleri hakkında referans olmadığı için içerilerine hayalî prop eklenmedi").
- **Düşük poligon, yüksek niyet.** Az üçgenle çok anlam: bevel'li kenarlar ışığı yakalar, malzeme az ama doğru, küçük nesne yoğunluğu masaya toplanır.
- **Gerçek içerik.** Genel poster yerine sahibinin gerçek işi; eser slotları adlandırılmış ve boş gelir. Hazır oyun varlığı, stok model, Google görüntüsü, başkasının eseri kullanılmaz.
- **Işık anlatır.** Genel ışık düşük, görev ışıkları yerel. Gece paleti varsayılan (KG Atelier); gündüz varyantı Fudō'nun krem/turkuaz paleti.
- **Dürüst arayüz.** Simülasyon simülasyon olarak etiketlenir ("Bu görsel baskı simülasyonudur"), yapay zekâ yapay zekâ olarak, prosedürel ses "gerçek makine kaydı değildir" diye.

## 2. Palet

| Ad | KG Atelier (gece) | Fudō (gündüz) | Kullanım |
| --- | --- | --- | --- |
| paper | `#101522` | `#eae6d8` | arka plan / zemin |
| ink | `#e8e3cf` | `#22362e` | metin, koyu mobilya |
| accent | `#f36a4d` | `#bd4834` | tek vurgu: düğme, mühür, portal |
| sage | `#7dd1c7` | `#c3c6b5` | ikincil yüzey, ekran ışığı |
| filament / wood | `#d89632` / `#76513c` | `#8f6950` | sıcak malzeme |
| wall | petrol gri sıva | `#dcd8bf` | duvar |

Kural: bir mekânda **tek accent**. Sis rengi arka planla akraba (`FogExp2 '#14222c', .021`). Sokak lambası amber (`#ffbd57`), ekran/pencere camgöbeği (`#62bfce`), bakır kablo tonu. Yeni mekân kendi paletini `place.json › palette` ile verir; sihirbaz altı anahtarı ister ve kontrastı (ink/paper ≥ 7:1) kontrol eder.

## 3. Geometri kuralları

| Kural | Değer | Kaynak |
| --- | --- | --- |
| Bevel | her boyutu ≥ 8 cm olan kutu `RoundedBoxGeometry`, 1 segment, yarıçap `min(1,4 cm, minSize×0,12)`; daha küçük parça düz `BoxGeometry` | `src/engine/geometry.js BEVEL` |
| Silindir kenar sayısı | yarıçap < 1,2 cm → 8; < 3 cm → 12; < 8 cm → 18; üstü istenen (≤ 24) | `radialSegments()` |
| Blender bevel | `BEVEL` modifier, `segments=1`, width nesneye göre 1–2 cm; uygulanır (apply) | `build_shop.py box()` |
| Blender silindir | 12 kenar varsayılan; çubuklar 8 | `cyl()`, `rod()` |
| Bitki | lathe saksı + 7–9 kavisli plane yaprak, `DoubleSide`, roughness ,63 | `plant()` |
| Eser çerçevesi | çerçeve + paspartu + eser; eser oranı **korunur** (assert) | `picture()` |
| Kumaş | dikiş çizgisi ince kutu, mikro doku canvas ile | `atelier-detail.js` |
| Karakter | 24 kemik, 1K atlas, 5,8–7,3k üçgen, idle/walk/sit klipleri | Fudō punk cast |

## 4. Bütçeler (masaüstü 1440×900, DPR ≤ 1,5)

| Ölçü | Yeşil | Sarı | Kırmızı |
| --- | --- | --- | --- |
| Statik dünya üçgeni (sinek/karakter hariç) | ≤ 250.000 | ≤ 500.000 | üstü |
| Kare başına gönderilen üçgen (gölge dahil) | ≤ 130.000 | ≤ 200.000 | üstü |
| Draw call / kare | ≤ 300 | ≤ 400 | üstü |
| Batch sonrası mesh sayısı | ≤ 300 | ≤ 450 | üstü |
| Malzeme sayısı | ≤ 20 | ≤ 30 | üstü |
| Doku | ≤ 1024², ≤ 33 doku yerleşik | 2048² tek tek gerekçeli | üstü |
| GLB (mimari) | ≤ 3 MB | ≤ 5 MB | üstü |
| Three vendor chunk | ~500 kB (gzip ~144 kB) uyarısı kabul | — | — |
| Gölge düşüren ışık | ≤ 3 | 4 | üstü |
| Toplam ışık | ≤ 14 | 18 | üstü |
| Shadow map | 2048² güneş/ay, 1024² spot | — | — |

Notlar: KG Atelier 0.6'da bütün dünya 495.743 üçgen / 404 mesh (yazıcı tek başına 282.738) ve bu sarı bölge; Fudō tam kare 131k üçgen / 385 draw call. Bunlar geometri sayımıdır, FPS garantisi değildir; `check` raporu bu cümleyi aynen yazar. Hedef 16,7 ms masaüstü, bilinçli 33,3 ms mobil katmanı.

## 5. Batch ve bayrak sözleşmesi

Statik birleştirme `batchStaticMeshes(root)`: adı olmayan, opak, `userData` bayrağı olmayan, çocuğu olmayan her mesh **aynı raycast grubu içinde** malzemeye göre birleşir. Bunun için modelci şunları bilir:

| `userData` | Anlam | Etki |
| --- | --- | --- |
| `station` | istasyon kökü | birleşme bu grubun içinde kalır; tıklama gruba çıkar |
| `interaction` | tıklanabilir nesne | aynı |
| `reference` | eser/proje referansı (`catalog.json` id'si) | aynı; panel açar |
| `dynamic` | hareketli alt ağaç (kedi, drone, yazıcı kafası) | hiç birleştirilmez; `mergeRigidParts` uygulanır |
| `keep` | tek başına kalacak mesh | birleştirilmez |
| `name` (mesh adı) | test/kod `getObjectByName` ile bulur | birleştirilmez |

Şeffaf, `Reflector`, `SkinnedMesh`, çoklu malzeme her zaman dışarıda kalır. Blender tarafında karşılığı: `zone` özelliği + nesne adı; export sonrası Three.js'de zone kökü `userData.station`a eşlenir.

## 6. Render ve post

- `WebGLRenderer({antialias:false, powerPreference:'high-performance'})`, SMAA pass ile kenar yumuşatma.
- `ACESFilmicToneMapping`, exposure 1,0 (gece) / 1,1 (oda önizleme).
- `PCFShadowMap`; gölge kadansı adaptif: kare maliyeti < 15 ms → her kare, < 24 ms → 2/3, üstü → 3/6 kare (`shadowCadence`).
- `UnrealBloomPass` düşük eşik değil; bloom yalnız emissive'lerde (neon, ekran, LED).
- Hafif film dokusu (`ShaderPass`), sis, yağmun/partikül isteğe bağlı ve reduced-motion'da kapalı.
- DPR: `min(devicePixelRatio, innerWidth<700 ? 1.25 : 1.5)`.
- Dış mekân (Fudō): %70 çözünürlük, 960 px üst sınır, kamera hareketsizken 1/30 s yeniden kullanım; derinlik korunur.
- Pencereler (Fudō): analitik iç mekân haritalama, iki üçgen; oda mesh'i yok.

## 7. Navigasyon ve beden

- `createNavigation({zones, obstacles, locations, eyeHeight})`: dikdörtgen yürünebilir alanlar, engel kutuları, nesne bakış noktaları, A*, geçiş açıklığı kontrolü, düz koridor sadeleştirme.
- Göz yüksekliği 1,62 m; eğilme (`C`/Ctrl), zıplama (Space) eğrileri `pose.js`.
- Kamera önce **nesnenin yanına** götürür; içerik kendiliğinden açılmaz; ikinci dokunuş / E açar. Terminali kapatmak kamerayı geri götürmez.
- Her istasyonun **tek** eylemi; büyük, nabız atan tek düğme; en yakın istasyon izlenir (son tıklanan değil).
- Yakınlık etiketleri: en fazla 3 etiket görünür; 28 px işaret, 44 px vuruş alanı.
- Kapıdan içeri giriş: mimari geçişleri izleyen kamera yolculuğu; "Geçişi atla" her zaman var; reduced-motion'da otomatik atlanır.

## 8. Ses

Web Audio, HRTF `PannerNode`, dinleyici kamerayı izler. Kaynaklar prosedürel (osilatör/gürültü), dosya yok, mikrofon yok. Duvar örtülmesi: low-pass + seviye düşüşü, ışın taramaları kısıtlı sıklıkta. İlk etkileşimle başlar, SESİ AÇ düğmesi ayrıca; seviye ve sessiz tercihi hatırlanır; arka plan sekmesi askıya alır. Etiket: "prosedürel ses tasarımıdır".

## 9. Karakter ve yaşayan şeyler

- Ev sahibi karakter (Şakir kedi, Satori drone, Eyüp, Çivi…) **özgün** tasarımdır; hazır film/oyun karakteri kopyalanmaz. Sevimli aile-animasyonu dili serbest.
- Davranış yerel: A*, ihtiyaç durumları, sonlu durum makinesi. LLM hareket ajanı değil; model çıktısı hareket/terminal komutu olarak çalıştırılmaz.
- Görünür NPC sayısı çevrimiçi ziyaretçi sayısından bağımsız sabit (Fudō CAPACITY=6).

## 10. Arayüz dili

- Tam ekran sahne, küçük teknik HUD, koyu içerik terminalleri, `micro` etiketler büyük harf ve nokta ayraçlı: `ATLAS NO. 002 / İSTANBUL ↔ İNTERNET`.
- Fontlar: Barlow + DM Sans (OFL), yerelde barındırılır; Türkçe aksan için satır yüksekliği pay bırakır.
- Metin panelleri modal değil (Satori paneli gibi); WASD çalışmaya devam eder; yazı alanında yürüyüş tuşları işlenmez.
- Formlar: otomatik gönderim yok; e-posta taslağı / WhatsApp taslağı hazırlanır, kullanıcı gönderir. Sunucu kaydı varsa açıkça yazılır.
- Her dış bağlantıda `↗`; site içi geçişte portal.

## 11. Yasaklar (check kırmızı)

1. Google Maps / Street View / Earth görüntüsü ya da dokusu pakette.
2. Başkasının eseri, logosu, fotoğrafı izinsiz.
3. Hazır oyun varlığı (GTA vb.) veya lisansı belirsiz model.
4. `http://` hedef, kimlik bilgisi içeren URL.
5. Sırlar (`.env*`, `.runtime/`, anahtar dosyaları) `dist/` içinde.
6. Ölçülü rölöve, gerçek ölçüm, canlı kamera, gerçek işletim sistemi gibi **olmayan** iddialar arayüz metninde.
7. Oto-oynatılan mikrofon, izinsiz konum, takip çerezi.
8. Reduced-motion'ı yok sayan zorunlu uzun kamera uçuşu.

## 12. Yeni nesne türleri (0.3 önerisi)

`counter` (tezgâh), `shelf` (raf), `bed` (sedye/yatak), `sign` (tabela, emissive), `machine` (yazıcı/cihaz, `dynamic` alt ağaç). Kolay yol paleti bunları 0.3 şemasıyla açar; 0.2 okuyucular bilinmeyen türü `table` gibi çizer (şemada `fallback` alanı).
