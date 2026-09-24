# KG Editor

Tarayıcıda çalışan, Blender / Cinema 4D alışkanlıklarıyla kullanılan three.js sahne editörü. Kod değişmez: her düzenleme
`scene-overrides.json` dosyasına yazılır ve dünya her yüklendiğinde koddan sonra uygulanır. biyikgokhan.com'daki
atölye, Esatpaşa, yıldız ve yeraltı dünyaları bununla düzenleniyor; kendi three.js sahnesi olan her sayfaya bağlanır.

Dosyalar (kaynak: `kg_atelier/src/engine`, buradaki kopya güncel sürümdür):

- `editor.js` — arayüz, gizmo, ağaç, paneller, kısayollar. `startEditor(host)`.
- `editor-host.js` — `createEditorHost({renderer,scene,camera,canvas,roots,realm,overrides})`: orbit kontrolleri, görünüm modları, overlay. Dünyanın döngüsü `host.editing` iken `host.frame(dt)` çağırır.
- `editor-audio.js` — dünyanın editöre verdiği ses/müzik kontrolleri kaydı.
- `scene-overrides.js` — yol adresleme (`name#index`), dönüşüm / görünürlük / renk / malzeme / doku / ışık / uniform / dünya ayarlarının uygulanması, ekleme, parent.
- `editor.css` — koyu panel teması.
- `vite-plugin.mjs` — dev sunucusunda kaydetme, doku listesi ve doku yükleme uçları.

Bağımlılık: `three` (r180 ile test edildi) ve `three/addons` (TransformControls, OrbitControls, GLTFLoader).

## Bir dünyaya bağlamak

```js
import {createEditorHost} from './editor/editor-host.js';
import {startEditor} from './editor/editor.js';
import {applyOverrides,applyWorld,readDraft} from './editor/scene-overrides.js';
import OVERRIDES_FILE from './scene-overrides.json' with {type:'json'};

const EDITOR=new URLSearchParams(location.search).has('editor');
const overrides=(EDITOR&&readDraft())||OVERRIDES_FILE;
applyOverrides(THREE,scene,overrides.myworld);applyWorld(scene,renderer,overrides.myworld?.world);
let host=null;
renderer.setAnimationLoop(()=>{const dt=clock.getDelta();if(host?.editing){host.frame(dt);return;} /* oyun döngüsü */});
if(EDITOR){host=createEditorHost({renderer,scene,camera,canvas,roots:{myworld:scene},realm:'myworld',overrides});startEditor(host);}
```

Vite: `import {editorSave} from './editor/vite-plugin.mjs'` → `plugins:[editorSave]`. Canlı sitede Kaydet dosyayı indirir.

Lisans: GPL-3.0-or-later (nexus-kit araçlarıyla aynı).

---


Atölyeyi ve Esatpaşa'yı tarayıcıda, Blender ve Cinema 4D alışkanlıklarıyla düzenlemek için.
Kod değişmiyor. Yaptığın her şey `src/scene-overrides.json` dosyasına yazılıyor.
Dünya her yüklendiğinde önce kod sahneyi kuruyor, sonra bu dosya uygulanıyor.

## Nerede çalışır

`?editor=1` üç dünyada da açılır: `/?editor=1` (atölye + Esatpaşa), `/yildiz.html?editor=1`, `/yeralti.html?editor=1`. Yıldız ve yeraltı `src/engine/editor-host.js` üzerinden bağlanır; kendi three.js sahnesi olan her sayfa aynı host ile editörü alabilir (`bootEditor` in `editor-gate.js`).

## Açmak

Kaydın doğrudan dosyaya gitmesi için yerel sunucuyu kullan:

```bash
cd C:\Users\biyik\Desktop\kg_atelier
npm run dev
```

Tarayıcıda şu adresi aç:

```
http://127.0.0.1:5195/?editor=1
```

Canlı sitede de `https://gokhanbiyik.com/?editor=1` çalışıyor. Orada önce terminal parolası (Satori özel kanal parolası, `.runtime/satori-owner.phrase`) sorulur. Parolayı atölye bilgisayarındaki gateway, Tailscale üzerinden doğrular. Canlı sitede "Kaydet" dosyayı yazamaz, `scene-overrides.json` olarak indirir. İndirilen dosyayı projede `src/` klasörüne koy.

Düzenlemelerin kaydetmeden önce de kaybolmaz: bu tarayıcıda taslak olarak tutulur ve sayfayı yenilesen de geri gelir.

## Kısayollar

Editörde `?` tuşu bu tabloyu gösterir.

| | |
|---|---|
| Kamera (Blender) | Orta tuş döndür · Shift+orta kaydır · Ctrl+orta ya da tekerlek yakınlaş (fare noktasına) |
| Fly | Sağ tuş basılı: fareyle bak · W A S D ileri/yan · Q E aşağı/yukarı · Shift hızlı · tekerlek hız |
| Kamera (C4D) | Alt+sol döndür · Alt+orta kaydır · Alt+sağ yakınlaş |
| Seçim | Sol tık · Shift / Ctrl + tık ekle-çıkar (en son seçilen aktif) · ↑ üst grup · Esc bırak · ağaçta çift tık odaklar |
| Hiyerarşi | Ctrl+P seçilenleri aktif olana bağla · Alt+P ayır · Ctrl+G / Alt+G grupla · ağaçta sürükle-bırak: üstüne bırak = çocuk yap, "Sahne kökü"ne bırak = ayır |
| Odak | F / O / numpad . seçili · Home hepsi |
| Gizmo | G veya E taşı · R döndür · S veya T ölçekle · X / Y / Z eksen kilidi · W dünya/yerel · Ctrl basılı snap |
| Düzen | Shift+D kopyala · Shift+A ekle · Delete / H gizle · Alt+H hepsini göster |
| Geçmiş | Ctrl+Z geri · Ctrl+Y ya da Ctrl+Shift+Z ileri |
| Görünüm | Numpad 1 ön · 3 sağ · 7 üst (Ctrl ile ters) · 2 4 6 8 adım adım döndür · 9 arkaya çevir |
| Komut dili | Seçimle G / R / S, sonra X Y Z, sonra sayı, ⏎ — `G X 1.5` 1,5 m taşır, `R Z 45` 45° döndürür, `S 2` iki kat büyütür; Esc iptal |
| Snap | Sürüklerken Ctrl 5 cm / 15° · Shift 10 cm / 45° · Snap düğmesi kalıcı |
| Seçim kümesi | A hepsi · Alt+A hiçbiri · Ctrl+I tersle · Shift+H izole et · ağaçta Shift aralık, Ctrl tek tek, Ctrl+Shift aralık ekle |
| Serbest gezinme | Shift+F: sağ tuşa basmadan fare ile bak, W A S D, Q E, Shift hızlı, tekerlek hız; Esc çıkar |
| Sağ tık | Kısa tık bağlam menüsü (odakla, kopyala, grupla, gizle, görünüm, tam ekran…) · basılı tut uçuş |
| Görünüm | Z mod döndürür (Render · Malzeme · Katı · Tel · Normal) · Shift+Z tel · Işık: Sahne / Stüdyo |
| Tam ekran | Ctrl+Alt+F ya da üst çubuk |
| Kaydet | Ctrl+S |

## Neler yapılabilir

- **Dönüştür:** herhangi bir nesneyi taşı, döndür, ölçekle. Sağ paneldeki kutulara sayı da yazabilirsin; dönüş derece cinsinden.
- **Görünürlük:** gizle ya da göster. Silmek yerine gizlemek, kodun kurduğu nesneleri güvenle kaldırır.
- **Renk:** değiştirildiğinde nesneye kendi malzemesi verilir. Aynı malzemeyi paylaşan diğer duvarlar ve kutular etkilenmez.
- **Ekle:** küp, silindir, küre, düzlem, nokta ışık ya da `public/models/` altındaki bir `.glb` model. Eklenen nesne Delete ile gerçekten silinir.
- **Kopyala:** var olan bir nesnenin kopyası (Shift+D).
- **Parent ve grup:** birden fazla nesneyi seçip taşıyınca ortak merkezden birlikte gider. Kalıcı olarak birlikte hareket etsinler diye grupla ya da birini diğerine bağla. Bu bağlar da dosyaya kaydedilir.
- **İpuçları:** her düğmenin ve alanın üstünde yarım saniye bekleyince ne yaptığı ve kısayolu çıkar.
- **Işık:** şiddet, renk, menzil, sönüm, spot açısı, gölge.
- **Malzeme:** ışıma, pürüz, metal, opaklık, tel kafes, yüz; doku olarak `/textures/` altından bir dosya (listeden seçilir), tekrar. Shader malzemelerde sayısal ve renk uniform'lar.
- **Dünya:** hiçbir şey seçili değilken sağ panelde sis rengi/yoğunluğu, arka plan, pozlama. `world` anahtarıyla kaydedilir.
- **Ses:** üst çubuktaki Ses paneli dünyanın verdiği kontrolleri gösterir (atölye: ortam sesi, düzey, müzik; yeraltı: radyo, sessiz, strobe).
- **Sıfırla:** seçili nesneyi koddaki hâline döndürür.
- **Âlem:** üst çubuktan Atölye ile Esatpaşa arasında geçiş. Çatı düğmesi atölyenin çatısını açıp kapatır.

## Yayına almak

```bash
npm test
npm run build
node tools/stage-site.mjs
cd release/site
git add -A
git commit -m "Sahne düzenlemeleri"
git push
```

## Bilmen gerekenler

- Nesneler yollarıyla bulunur, örneğin `#0/#229/#5` ya da `sofa#1`: adı olanlar adıyla, olmayanlar sırasıyla. Kodda aynı gruba yeni bir nesne eklenirse sıra numaraları kayabilir. O zaman editörde düzenlemenin yanlış nesneye gittiğini görürsün; sağ panelden Sıfırla, yeniden konumla.
- Hareket eden nesneler (kapılar, Şakir, top, Satori) her karede kodla yeniden konumlanır. Onları taşımak kalıcı olmaz.
- Editör modunda sahne birleştirilmeden çizilir, bu yüzden biraz daha ağırdır. Normal ziyaretçi bundan etkilenmez.
