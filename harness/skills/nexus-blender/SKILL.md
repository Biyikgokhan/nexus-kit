---
name: nexus-blender
description: Blender 4.5 background hattı (tools/build_place.py) ile ekol kurallarına uygun sahne üretimi ve GLB dışa aktarma; adlandırma, zone, bevel, malzeme birleştirme, bütçe düşürme, .blend'den yalnız batch+export. Tetikleyiciler - "blender", "GLB", "build_place", "modelle", "raf/dolap/tezgâh ekle", "sahneyi üret", "üçgen düşür".
---

# nexus-blender

Hat, Fudō `tools/build_shop.py`'nin genelleştirilmiş şablonudur. Çalıştırma: `npx nexus-kit blender` (yedek alır, `blender --background --python tools/build_place.py` çağırır, rapor yazar). Doğrudan: `"C:/Program Files/Blender Foundation/Blender 4.5/blender.exe" --background --python tools/build_place.py`.

## Sözleşme

- Koordinat **web** düzeni `(x, height, depth)`; `pos()` Blender Z-up'a çevirir. `place.json`'daki `x,z` doğrudan kullanılır.
- Yardımcılar: `mat(name, rgb, metal, rough, emit)`, `tex(name, file)`, `box(name, p, size, mat, bevel)`, `cyl(name, p, r, h, mat, vertices=12, r2)`, `ell`, `rod(name, a, b, r, mat)` (8 kenar), `panel` (dik UV), `picture(name, x,y,z, w,h, art, side)` (oran korunur), `plant(name, x,y,z, size)`.
- Her nesne `register(o, name, mat)`: **ad zorunlu**, `zone` aktif bölge. Ad kalıbı: `<zone>-<nesne>-<nn>` (`desk-lamp-00`, `wall-art-03`). Three.js tarafında `getObjectByName` ile bulunur; test dosyaları bu adlara bakar.
- Eser slotları boş panel: `wall-art-00…`, `screen-00…`, `sign-00`. İçerik sahibi koyar.
- Malzeme: paletten; aynı renk-roughness için tek `mat`. Emissive yalnız lamba/ekran/neon (`emit` 1–2).
- Sonda: zone + malzeme birleştirme, `mesh.validate()`, `bpy.ops.export_scene.gltf(export_format='GLB', export_apply=True, export_yup=True)`; Draco kapalı. Rapor `reference/blender-report.json`: toplam/zone üçgen, malzeme sayısı, en büyük 10 mesh, doku boyutları.

## Kullanıcının kendi .blend'i

`tools/build_place.py --from-blend dosya.blend`: sahne üretmez; adlandırma denetler (adsız mesh → uyarı listesi), zone yoksa koleksiyon adını zone yapar, batch + export. Kullanıcının dosyasını **ezmez**; `.runtime/backup/` önce.

## Yeni nesne fonksiyonu yazarken

```python
def cabinet(n, x, y, z, w=1.2, h=2.0, d=0.45, shelves=3):
    box(n+' body', (x, y+h/2, z), (w, h, d), 'wood', bevel=.012)
    for i in range(shelves):
        box(n+f' shelf-{i:02d}', (x, y+h*(i+1)/(shelves+1), z+.02), (w-.06, .025, d-.06), 'woodLight')
```

Kural: gövde bevel'li, raf düz (2,5 cm < 8 cm), 12 kenarlı silindir, adlar numaralı, tek malzeme ailesi. Kapı/çekmece sadece fotoğrafta görünüyorsa.

## Bütçe düşürme sırası

1. Rapordaki en büyük 10 mesh. 2. Lathe/sphere segmenti (`ell(…, 8, 4)`). 3. Bitki yaprak sayısı 9 → 7. 4. Tekrar eden küçük parça → Three.js tarafında `InstancedMesh` (kitap, şişe, kablo klipsi). 5. Görünmeyen yüz (`bpy.ops.mesh.remove_doubles`, iç yüz temizliği; Fudō L kabuk deseni). 6. Uzak nesneler için ayrı düşük detay (LOD) — yalnız gerekiyorsa.

## GLB'yi Three.js'e bağlama

`src/worlds/place.js`: `GLTFLoader` → kök gruba; zone kökleri `userData.station = id`; hareket edecek alt ağaç `userData.dynamic = true`; sonra `batchStaticMeshes(child)` (world-view zaten yapar). Gölge: `castShadow/receiveShadow` zone kökünde `traverse` ile. Doku `SRGBColorSpace`.

## Yapma

Draco/KTX2 (0.6'da); 2048² doku gerekçesiz; adsız mesh; `zone`suz nesne; fotoğrafı doku olarak duvara yapıştırmak (yalnız `frame` içinde eser); Google/stok görüntü.
