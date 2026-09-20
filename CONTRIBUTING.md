# Katkı

- Sorun ve öneriler: GitHub Issues. Mekân kaydı için [nexus-registry](https://github.com/Biyikgokhan/nexus-registry) formunu kullan.
- PR'lar küçük ve testli olsun: `npm test` (Node 22.12+). Bağımlılık eklemeden önce sor; kit bilinçli olarak bağımlılıksız.
- Ekol kuralları [docs/04-ART-DIRECTION.md](docs/04-ART-DIRECTION.md); `nexus-kit check` yeşil olmadan paket yayınlanmaz.
- Başkasının eserini, harita görüntüsünü ya da hazır oyun varlığını örnek olarak ekleme ([ASSETS.md](ASSETS.md)).
- Lisans: `bin/ lib/ harness/ docs/` katkıları GPL-3.0-or-later, `templates/ schema/` katkıları Apache-2.0 altında kabul edilir (bkz. NOTICE.md). Her commit'e `git commit -s` ile DCO imzası ekle (`Signed-off-by: Ad Soyad <e-posta>`): "bu katkıyı yapmaya hakkım var" beyanıdır, telif devri değildir.
- Dil: belgeler Türkçe, kod ve yorumlar İngilizce. İngilizce belge çevirisi en çok istenen katkı.
