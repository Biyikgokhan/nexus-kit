# Topluluk — repo yapısı, katkı, lisans ayrımı

## Açık kaynak yayın planı

Üç repo, tek örgüt (`nexus-interlink` önerisi):

| Repo | İçerik | Lisans |
| --- | --- | --- |
| `nexus-kit` | bu klasör: sihirbaz (tarayıcı + CLI), harness, şema, belgeler, `engine/` vendored çekirdek | araç GPL-3.0-or-later; `templates/` ve `schema/` Apache-2.0 (bkz. NOTICE.md) |
| `nexus-registry` | topluluk kaydı, issue şablonu, CI doğrulama, politika | MIT (veri: CC-BY-4.0; her mekân kendi manifestinin sahibi) |
| `nexus-atlas` | atlas sayfasının açık kaynağı (Fudō `src/nexus/*` + geodata) | motor Apache-2.0; Natural Earth kamu malı |

KG Atelier ve Fudō siteleri **örnek** olarak bağlanır; kendileri açılmaz (kişisel içerik, fotoğraflar, eserler, sahibin servisleri). `nexus-kit/examples/` içinde iki sitenin **manifestleri** ve `place.json` karşılıkları bulunur, kaynak kodu değil.

## Ne açılır, ne açılmaz

Açılır: motor çekirdeği (`world-view`, `navigation`, `batch`, `geometry`, `pose`, `spatial-audio`, `nexus`, `fly`, `announcer`), prosedürel oda motoru, Blender hat şablonu, sihirbazlar, harness, şema, belgeler, QA araç desenleri.

Açılmaz: fotoğraflar, eser görselleri, `catalog.json` içerikleri, Şakir/Satori/Eyüp/punk kadro modelleri ve `.blend` dosyaları, Satori özel kanal/terminal kodu, `guest_service.py`'nin sahibe özel kısımları, alan adları, anahtarlar. KG Atelier `src/engine/LICENSE` ve Fudō `src/nexus/LICENSE` zaten bu ayrımı yapar; kit onu genişletir.

Gri alan, karar gerekli: `laptop-os.js` (KG/OS 98 kabuğu) — kabuk açılabilir, içerik (İşler, Defter, Yazıcı) sahibe özel. Öneri: `os-shell` olarak boş uygulama listesiyle açmak, 0.2'de değil sonra.

## Katkı akışı

1. **Mekân eklemek** kod katkısı değildir: `nexus-registry` issue şablonu, CI, insan onayı. Bir hafta hedefi.
2. **Kod katkısı** (`nexus-kit`): issue → PR; `npm test` + `nexus-kit check` yeşil; README'ye dürüst sürüm satırı ("ne yapıldı, ne ölçüldü, ne yapılmadı").
3. **Ekol tartışması**: `04-ART-DIRECTION.md` değişiklikleri RFC ile (`rfcs/0001-…md`), iki bakımcı onayı. Bütçe sayıları ölçümle değişir, zevkle değil.
4. **Yeni motor şablonu**: `templates/<ad>/` + `check` kuralları + bir örnek mekân. Ekol dışı şablon (fotogerçekçi, ağır post) kabul edilmez; ayrı fork olabilir.
5. **Çeviri**: `docs/en/` yansısı; Türkçe kaynak dil kalır.

## Davranış ve politika (POLICY.md taslağı)

- Kayıt için uygunluk: gerçek bir mekân ya da gerçek bir dijital proje; manifest sahibi yayınlıyor; fotoğraflar izinli; nefret/dolandırıcılık/yetişkin içerik yok; ticari mekânlar serbest (Fudō bir dükkândır).
- Kaldırma: sahibi isterse hemen; şikâyet üzerine bakımcı kararı, 7 gün itiraz.
- Bağlantı etiği: bir mekâna portal açmak o mekânın onayı anlamına gelmez; istenmeyen portal için kayıt deposuna bildirim, `links` filtrelenir (atlas tarafında gösterilmez; kaynak manifest değişmez).
- Veri: atlas ziyaretçi verisi toplamaz; takipler tarayıcıda; kayıt deposu yalnız kamuya açık manifest tutar.

## Bakımcılar ve ilk çekirdek

İlk bakımcı ekol sahibi (KG Atelier). İkinci bakımcı Fudō. Üçüncü, ilk dış mekân sahibinden. Astra topluluk içinde bir **sağlayıcı** olarak vardır (davetli yardımcı), bakımcı değildir; ajan kararı birleştirmez.

## Lisans metni ayrımı (paket kökü)

```text
LICENSE           MIT — kit kodu ve belgeleri
THIRD-PARTY.md    Three.js (MIT), Barlow / DM Sans (OFL), Natural Earth (public domain), xterm (MIT, yalnız terminal şablonunda)
ASSETS.md         "Bu paket senin fotoğraflarına, eserlerine, logona ve alan adına hak vermez; onlar senindir. Örnek mekânların (KG Atelier, Fudō) içerikleri sahiplerine aittir ve bu lisansın dışındadır."
```

## İlk duyuru (taslak, 5 cümle)

> İki site, sıfır hazır varlık, otuz yıllık nerd bilgisi ve bir ajanla kuruldu: fudo.tattoo ve biyikgokhan.com. Şimdi yöntemi açıyoruz. Nexus Kit: birkaç fotoğraf ve bir kroki ile kendi alan adında gezilebilir bir 3B mekân, sonra ortak atlasta bir nokta. Bilişime uzaksan tarayıcı sihirbazı; modelliyorsan Blender hattı ve ajan harness'ı. Kendi token'ın, kendi alan adın, kendi mekânın.
