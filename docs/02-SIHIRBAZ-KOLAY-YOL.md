# Kolay yol — tarayıcı sihirbazı (bilişime uzak kullanıcı)

Adres: `https://gokhanbiyik.com/nexus/#kur` (statik sayfa; aynı sayfa ZIP olarak indirilip çevrimdışı da açılabilir). Teknik altyapı: Fudō `src/nexus/room-view.js` + `geometry.js createRoom()` + `data.js validateNode()` + `tools/nexus-zip.mjs`'in tarayıcı sürümü. Hiçbir adım sunucuya veri göndermez.

## Tasarım ilkeleri (sihirbazın kendini net ifade etmesi)

- Her ekranda **tek soru**, tek büyük düğme, altında "bu ne demek?" açılır satırı.
- Jargon yok. "Manifest" yerine "mekân dosyası", "deploy" yerine "yayınla", "domain" yerine "alan adın (siteni açtığın adres)".
- Her ekranın üstünde ilerleme: `1 Sen · 2 Fotoğraflar · 3 Kroki · 4 Yerleşim · 5 Kapılar · 6 Önizle · 7 İndir · 8 Yayınla · 9 Haritaya çık`.
- Her ekran geri alınabilir; taslak tarayıcıda (`localStorage`) durur, "taslağı sil" görünür.
- Yapay zekâ yardımı her ekranda aynı yerde, aynı küçük düğmede: **"Yardımcıya sor"**. Bağlı değilse düğme gri ve yanında "Bağla" bağlantısı.
- Sihirbaz hiçbir zaman "otomatik" iddia etmez. Yapay zekâ önerisi her zaman **öneri** olarak gelir, kullanıcı onaylar.
- 320 px'te çalışır; kroki ızgarası dar ekranda "dokun → nesne seç → dokun → yerleştir" moduna düşer.

## Ekranlar

### 0 · Karşılama

> **Kendi mekânını kur.**
> Birkaç fotoğraf ve kâğıda çizilmiş bir kroki yeter. Bilgisayar bilgisi gerekmez; hiçbir şey yüklenmez.
> Yaklaşık 30 dakika. İstediğin yerde durup sonra devam edebilirsin.
>
> [ Başla ]   [ Önce örnek bir mekânı gez ↗ ]

Altta küçük: "Fotoğrafların ve çizimin bu tarayıcıdan çıkmaz. Sonunda bir klasör indirirsin; onu kendi sitene yüklersin."

Tarayıcı kontrolü burada sessizce yapılır. WebGL yoksa: "Bu tarayıcı 3B önizlemeyi açamıyor. Krokiden düzenlemeye devam edebilirsin; önizlemeyi başka bir cihazda görürsün." (Fudō `room-view` fallback mesajıyla aynı davranış.)

### 1 · Sen ve mekânın

Alanlar (hepsi `validateNode()` sınırlarıyla):

| Alan | Kural | Yardım metni |
| --- | --- | --- |
| Mekânın adı | 2–70 karakter | "Tabelada ne yazıyor?" |
| Tür | stüdyo · bahçe · simülasyon · galeri · mağaza | "En yakın olanı seç; sonra değiştirilebilir." |
| Siten | `https://` zorunlu | "Mekânın internetteki adresi. Henüz yoksa boş bırak; 8. adımda birlikte açacağız." (boşsa geçici `https://ornek.invalid` yerine **yayın adımına kadar taslak** olarak işaretlenir; manifest o adımda tamamlanır) |
| Hikâye | ≤ 600 karakter | "Kapıdan giren birine iki cümleyle ne anlatırsın?" |
| Adres | ≤ 250, isteğe bağlı | "Gerçek bir kapın varsa yaz. Yoksa mekânın 'dijital' sayılır ve haritada bağlı olduğu merkezin yanında görünür." |
| Konum | enlem/boylam, isteğe bağlı | "Adres yazdıysan haritadan işaretle" → Google Haritalar bağlantısı açılır, kullanıcı koordinatı kopyalar; sihirbaz `validCoordinates()` ile denetler. Kaynak `coordinateSource: 'Mekân sahibinin beyanı'`. |

"Yardımcıya sor": hikâye metnini üç öneriyle yazar (harness `nexus-place` skill'i, `describe` görevi).

### 2 · Fotoğraflar

> **Mekânından 1–3 fotoğraf seç.**
> Kapıdan içeri bakan bir kare, karşı duvar, ve en sevdiğin köşe.
> Telefon fotoğrafı yeter. Yüzler ve plakalar varsa buradan kırpabilirsin.

- İstemcide 1600 px uzun kenara küçültme, JPEG/WebP; her biri < 1,5 MB (şema sınırı).
- Basit kırpma; "yüzü kapat" fırçası (tek renk dikdörtgen). Otomatik yüz tanıma yok.
- Uyarı: "Bu fotoğraflar mekân paketine girer ve sitende herkese açık olur. Başkasının eseri ya da yüzü varsa izinsiz koyma."

### 3 · Kroki

> **Krokini çek.**
> Kâğıda kuşbakışı çiz: duvarlar, kapı, pencere, büyük eşyalar. Eşyaları numaralandır; numaraların ne olduğunu kenara yaz.
> [ Örnek kroki ] düğmesi Fudō'nun 10 numaralı krokisini stilize gösterir (gerçek kroki değil, çizim şablonu: `templates/kroki-sablonu.svg`).

- Kroki fotoğrafı yüklendikten sonra: "Kâğıdın dört köşesine dokun" → perspektif düzeltme (tarayıcıda 4 nokta homografi; `OpenCV` yok, basit projektif dönüşüm).
- "Uzun kenar kaç metre?" → tek sayı; sihirbaz oda genişlik/derinliğini buradan türetir (3–16 m sınırı). Bilmiyorsa: "Adımla: bir adım ≈ 0,75 m."
- Yardım kutusu: "Ölçü kesin olmak zorunda değil. Bu bir mimari proje değil, mekânın yorumlanmış bir modeli. Sonradan değişir."

"Yardımcıya sor" (görüntü destekli sağlayıcı bağlıysa): kroki + fotoğraflar ajana gider, ajan `room.items` **taslağı** döndürür (harness `nexus-place` `sketch-to-plan` görevi, sıkı JSON). Kullanıcı 4. ekranda düzeltir. Sağlayıcı görüntü desteklemiyorsa düğme "Bu yardımcı çizim okuyamıyor" der.

### 4 · Yerleşim

Kroki, ızgaranın arka planı olur (yarı saydam). Sol palet, 0.2 nesne türleri:

| Palet | Manifest `type` | Sahnede (Fudō `createRoom`) |
| --- | --- | --- |
| Masa / tezgâh | `table` | 1,4 × 0,8 m ahşap masa |
| Koltuk / oturma | `seat` | 1,3 m koltuk |
| Bitki | `plant` | saksılı bitki |
| Çerçeve / eser / ekran | `frame` | duvar çerçevesi, kırmızı mühür |
| Kapı (başka bir dünyaya) | `portal` | portal kabini + Interlink halkası |

- Sürükle-bırak, 0,25 m'ye yapışma, oda dışına çıkmaz (`Math.abs(x) ≤ width/2`).
- Her nesneye etiket (≤ 80 karakter): "Bu ne? Ziyaretçi üstüne gelince bunu okur."
- En fazla 24 nesne; sayaç görünür.
- Canlı 3B önizleme sağda (`room-view`), fotoğraflar arka duvara asılır (mevcut davranış).
- "Yeterli mi?" kutusu: "3–8 nesne iyi bir başlangıç. Her şeyi koyma; ziyaretçi önce kapıyı, masayı ve bir kapıyı görsün."

### 5 · Kapılar (bağlantılar)

> **Bu mekândan hangi dünyalara geçilsin?**
> Bir nesneye dokun, ona bir site adresi ver. Ziyaretçi o nesneye dokununca oraya ışınlanır.

- Yalnız `https://`. Portal olan nesneler için `target`; diğerleri için `links[] {object, relation: 'portal'|'reference', url}`.
- Hazır öneriler: "Nexus atlası (gokhanbiyik.com/nexus)", "Fudō", kendi Instagram'ın (yalnız `reference`).
- Uyarı: "Sitene giden kapı senin; başka mekâna açtığın kapı o mekânın seni takip ettiği anlamına gelmez." (NEXUS.md ilişki sınırı.)

### 6 · Önizle

Tam ekran `room-view`: döndür, nesnelere dokun, portalı dene (`warpTo` gerçek siteye gider; "İptal" ile geri). Sağ üstte "Telefonda nasıl görünür?" (390 px çerçeve). Reduced-motion tercihini duyurur.

### 7 · İndir

> **Mekân paketin hazır.**
> Tek klasör: `index.html`, `nexus.json`, `.well-known/nexus.json`, motor dosyaları, fontlar, fotoğrafların, lisanslar.
> [ Paketi indir (.zip) ]
> Şifre, hesap ya da e-posta yok; içinde ne varsa görüyorsun.

ZIP içeriği `engineZip()` ile birebir; `README.txt` bu belgenin 8. adımını içerir. Ek olarak `KAYIT.md`: 9. adım için hazır başvuru metni.

### 8 · Yayınla (kendi alan adına)

Sekmeli, sağlayıcıya göre ekran görüntülü adımlar. Her sekme aynı üç cümleyle biter: "Adresini tarayıcıda aç. `https://senin-alan-adin/.well-known/nexus.json` açılıyorsa bitti. Açılmıyorsa `.well-known` klasörü yüklenmemiştir; gizli klasörleri göster."

| Sekme | Adımlar |
| --- | --- |
| Vercel (önerilen, ücretsiz) | Hesap aç → "Add New → Project" → ZIP'i açıp klasörü sürükle → Deploy → Settings › Domains → alan adını ekle → DNS kaydını sağlayıcında gir |
| Netlify | Aynı; "Drag & drop" alanı |
| Cloudflare Pages | "Direct upload" |
| GitHub Pages | Repo oluştur, klasörü yükle, Settings › Pages, `.nojekyll` dosyası (ZIP'te hazır gelir çünkü Jekyll `.well-known`'ı gizler) |
| Kendi sunucun / cPanel | FTP ile `public_html`'e; `.well-known` klasörünü koru; HTTPS zorunlu |

"Sitem zaten var" sekmesi: "Paketi bir alt klasöre koyma. `.well-known/nexus.json` **kökte** olmalı. Mekânı `/mekan/` altında yayınlıyorsan yalnız manifesti köke koy ve `url` alanını `/mekan/` olarak yaz."

Sihirbaz burada bir **doğrulama** kutusu sunar: alan adını yaz → tarayıcı `https://alan/.well-known/nexus.json`'ı `fetch` eder (CORS'a takılırsa `no-cors` ile yalnız ulaşılabilirliği söyler ve "Kendin aç" bağlantısı verir). Sunucu yok; doğrulama tarayıcıdan.

### 9 · Haritaya çık

> **Atlasta görün.**
> Başvurun bir GitHub konusu (issue) olarak açılır; topluluk manifestini kontrol eder ve birleştirir. Genelde bir hafta içinde.
> [ Başvuruyu hazırla ]

- Düğme, `KAYIT.md` içeriğiyle önceden doldurulmuş GitHub issue bağlantısı açar (`nexus-registry` reposu, `place-registration.yml` şablonu). GitHub hesabı yoksa: "Metni kopyala, `nexus@…` adresine e-posta ile gönder" (e-posta yol haritasında; ilk sürümde yalnız GitHub).
- Başvuru içeriği: alan adı, manifest URL'si, tür, kısa hikâye, "fotoğraflar bana ait / izinliyim" onayı, "ekol kurallarını okudum" onayı.
- Ne olacağı açıkça yazılır: "Kaydın birleşince atlas senin `.well-known/nexus.json` dosyanı okur. Mekânını sonradan değiştirmek için sadece kendi dosyanı güncellersin; tekrar başvuru gerekmez. Silmek için issue açarsın."

## Yardımcı (yapay zekâ) bağlama ekranı

Sağ üst "Yardımcı: bağlı değil" → panel:

| Seçenek | Ne olur | Nerede saklanır |
| --- | --- | --- |
| Claude (kendi anahtarınla) | `ANTHROPIC_API_KEY` alanı; tarayıcıdan doğrudan Claude API'ye (`anthropic-dangerous-direct-browser-access` başlığıyla) | Yalnız `sessionStorage`; sekme kapanınca gider. Sihirbaz sunucusu yok, aracı yok. |
| Bilgisayarımdaki Ollama | `http://127.0.0.1:11434` adresi, model seçimi | `localStorage` (adres yalnız) |
| Astra (davetle) | Sahibinin geçidinin verdiği davet adresi + davet anahtarı | `sessionStorage` |
| Yardımcısız devam | — | — |

Panel metni: "Bu anahtar yalnız bu sekmede kalır ve doğrudan seçtiğin sağlayıcıya gider. Nexus Kit'in sunucusu yok. Ücretleri sağlayıcın hesabından öder."

Uygulandı (20 Eylül 2026): Fudō `src/nexus/helper.js` + `src/nexus/assist.js` (kitten kopya). Düğmeler: 01'de "hikâyeyi yaz" (üç öneri, biri seçilir), 03'te "krokiyi oku" (öneri listelenir, "Öneriyi krokiye uygula" ile ızgaraya oturur, hücre başına bir nesne), 04'te "ekol denetimi" (kırmızı/sarı/yeşil bulgular). Astra seçeneği panelde henüz yok (tasarım).

Ajan görevleri (harness `nexus-place` skill'i): `describe` (hikâye), `sketch-to-plan` (kroki → items), `label` (nesne etiketleri), `review` (ekol denetimi: "3 nesne var, portal yok; bir kapı ekle"). Her görev sıkı JSON döndürür; sihirbaz JSON dışını atar.

## Sihirbazın reddettiği şeyler

- `http://` adresler, kullanıcı adı/parola içeren URL'ler.
- Oda 3 m'den küçük, 16 m'den büyük; 24'ten fazla nesne; oda dışına taşan nesne.
- 1,5 MB üstü görsel; JPEG/PNG/WebP dışı.
- "Google Haritalar'dan ekran görüntüsü" yükleme girişimi: fotoğraf ekranında ipucu: "Harita ekran görüntüsü koyma; kendi çektiğin fotoğrafı koy."

## Teknik not (uygulayan için)

- Tek Vite girişi `kur.html`, `src/nexus/wizard/*`; `three` chunk'ı atlasla paylaşılır.
- ZIP üretimi tarayıcıda: `nexus-zip.mjs`'in `zipFiles()` fonksiyonu Buffer'sız `Uint8Array` sürümü; motor `assets/` listesi build sırasında `wizard-assets.json`'a yazılır.
- Fotoğraflar manifestte `data:` URI olarak değil, ZIP'te `photos/1.jpg` olarak; manifest `photos: ['photos/1.jpg']` (0.3 şema önerisi; 0.2 uyumluluğu için `data:` seçeneği de kalır).
- Taslak `localStorage` `nexus-kit:draft`; fotoğraflar `IndexedDB`.
