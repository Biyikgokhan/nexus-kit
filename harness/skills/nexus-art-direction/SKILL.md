---
name: nexus-art-direction
description: KG Atelier / Fudō ekolünün stilizasyon kuralları, bütçeleri, paleti, ışık ve navigasyon sözleşmesi; nexus-kit check raporunu okuyup kırmızı/sarı bulguları düzeltme. Tetikleyiciler - "ekol", "art direction", "bütçe aşıldı", "check kırmızı", "palet", "ışık", "bevel", "batch", "stilize et", "optimize et".
---

# nexus-art-direction

Uzun sürüm: kit reposunda `docs/04-ART-DIRECTION.md`. Bu dosya ajanın her turda hatırlaması gereken kısımdır.

## Tavır (üç cümle)

Fotoğraftan yorum, kopya değil; görmediğini modelleme. Az üçgen, çok niyet: bevel'li kenar, doğru malzeme, masaya toplanan küçük nesne yoğunluğu, yerel görev ışığı. Gerçek içerik: hazır varlık yok, eser slotları boş gelir.

## Sayılar (masaüstü 1440×900, DPR ≤ 1,5)

| Ölçü | Yeşil | Sarı |
| --- | --- | --- |
| statik üçgen | ≤ 250k | ≤ 500k |
| kare başına üçgen | ≤ 130k | ≤ 200k |
| draw call | ≤ 300 | ≤ 400 |
| batch sonrası mesh | ≤ 300 | ≤ 450 |
| malzeme | ≤ 20 | ≤ 30 |
| doku | ≤ 1024², ≤ 33 adet | 2048² gerekçeli |
| GLB | ≤ 3 MB | ≤ 5 MB |
| gölge düşüren ışık / toplam | ≤ 3 / ≤ 14 | 4 / 18 |

## Geometri

- Kutu ≥ 8 cm her boyutta → `boxGeometry()` (RoundedBox, 1 segment, r = min(1,4 cm, min×0,12)). Küçükse düz.
- Silindir kenarı yarıçapa göre: < 1,2 cm 8 · < 3 cm 12 · < 8 cm 18 · üstü ≤ 24.
- Blender: `box(..., bevel=0.01–0.02)`, `cyl(vertices=12)`, `rod(8)`; her nesne `register(o, name, mat)` ile adlı ve zone'lu.
- Eser oranı korunur; `picture()` assert'i kalır.

## Batch bayrakları

`userData.station | interaction | reference` → grup içinde birleşir, tıklama gruba çıkar. `dynamic` → hiç birleşmez (`mergeRigidParts`). `keep` ya da `name` → tek kalır. Şeffaf/Reflector/Skinned dışarıda. Hareket eden her şeyin `dynamic` altında olduğundan emin ol; batch sonrası `getObjectByName` testleri geçmeli.

## Render

`antialias:false` + SMAA; ACES 1,0; PCF gölge, adaptif kadans (15/24 ms eşikleri); bloom yalnız emissive; DPR `min(dpr, w<700?1.25:1.5)`; sis arka planla akraba; reduced-motion'da partikül/uçuş kapalı.

## Palet

Tek accent. Gece: paper `#101522`, ink `#e8e3cf`, accent `#f36a4d`, sage `#7dd1c7`, filament `#d89632`, wood `#76513c`. Gündüz (Fudō): `#eae6d8 / #22362e / #bd4834 / #c3c6b5 / #8f6950`. Kontrast ink/paper ≥ 7:1.

## Navigasyon ve arayüz

Göz 1,62 m; kamera nesnenin yanına götürür, içerik ikinci dokunuşla / E ile açılır; istasyon başına tek eylem; ≤ 3 etiket, 44 px vuruş; "Geçişi atla" her zaman; paneller modal değil; formlar taslak hazırlar, göndermez; dış bağlantı `↗`.

## Check raporu okuma

`nexus-kit check --json` → `findings[]` `{level, rule, value, limit, hint}`.

| Bulgu | İlk hamle |
| --- | --- |
| üçgen aşımı | en büyük 10 mesh'e bak; silindir kenarı, lathe segmenti, bitki yaprak sayısı, tekrar eden küçük parça (instancing) |
| draw call / mesh aşımı | malzeme birleştir (aynı renk-roughness → tek), bayrak fazlalığı (`keep` gereksiz mi), zone çok küçük |
| malzeme aşımı | palete indir; doku atlası |
| ışık aşımı | point light → emissive yüzey; iki spotu birleştir |
| navigasyon rotası yok | engel payını küçült, zone ekle |
| yasak | dosyayı kaldır, kullanıcıya nedenini söyle |

Sarıda kullanıcıya iki seçenek sun: sadeleştir (önerilen) / bilinçli kabul (README'ye yaz). "Bütçeyi yükselt" önerme.

## Yasaklar (kırmızı)

Google görüntüsü/dokusu · izinsiz eser/logo/yüz · hazır oyun varlığı · `http://` · sır `dist/`te · olmayan iddia (ölçülü, canlı kamera, gerçek OS) · otomatik mikrofon/konum/takip · reduced-motion'ı yok sayan uçuş.
