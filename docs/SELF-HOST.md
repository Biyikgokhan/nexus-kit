# Host yourself, connect openly / Kendin barındır, açıkça bağlan

## English

Nexus Interlink is an Apache-2.0 JSON/HTTPS protocol. It requires no Nexus account, paid AI, mandatory renderer or hosted Nexus backend. Each participant pays for or supplies their own domain/hosting. The project does not promise free hosting or pay participants' bills.

1. Build a place with the wizard, Blender/GLB workflow or your own renderer.
2. Publish your site on your own HTTPS origin.
3. Serve a public manifest at `https://your-host/.well-known/nexus.json`. Use [the minimal example](../templates/interlink-minimal.json) and [schema](../schema/nexus-interlink-0.2.schema.json). Return JSON with no redirect. Keep it under 256 KiB for the directory verifier. Use public IPv4 hosting for the current verifier.
4. Put normal HTTPS URLs in `links`. Two places can link directly without waiting for a directory.
5. [Request a connection](https://github.com/Biyikgokhan/nexus-kit/issues/new?template=place-connection.yml). A maintainer checks the live file and reviews the request. Only an accepted listing is added to a future static atlas publication.

The maintenance registry is private. You do not need access to it. Public submissions happen in this kit's Issues. Registry records are reviewed snapshots, not automatic synchronization. Request updates or removal in an issue. No inbound server, AI API, account database or per-visitor proxy is needed for this workflow.

Exact coordinates and business addresses are optional. Never publish a private home address or credentials. You choose the public story and original art. Domain-root manifest access is required; a project subpath alone is insufficient unless you also control the root.

## Türkçe

Nexus Interlink, Apache-2.0 lisanslı JSON/HTTPS protokolüdür. Nexus hesabı, ücretli AI, zorunlu motor veya Nexus’un barındırdığı bir sunucu gerektirmez. Her katılımcı kendi domain/hostingini sağlar; proje ücretsiz barındırma sözü vermez veya başkalarının faturasını üstlenmez.

1. Sihirbazla, Blender/GLB yoluyla veya kendi motorunla mekânını üret.
2. Kendi HTTPS adresinde yayınla.
3. Sunucunun kökünde `/.well-known/nexus.json` sun. [En küçük örneği](../templates/interlink-minimal.json) ve [şemayı](../schema/nexus-interlink-0.2.schema.json) kullan. Yönlendirmesiz JSON döndür. Dizin doğrulayıcısı için 256 KiB altında ve açık IPv4 üzerinden erişilebilir olsun.
4. `links` alanına normal HTTPS bağlantıları ekle. İki mekân dizin onayını beklemeden birbirine bağlanabilir.
5. [Bağlantı talebi aç](https://github.com/Biyikgokhan/nexus-kit/issues/new?template=place-connection.yml). Bakımcı canlı dosyayı ve başvuruyu inceler; kabul edilen kayıt sonraki statik atlas yayınına eklenir.

Bakım registry’si private kalır; erişmen gerekmez. Başvurular bu açık kitin Issues bölümündedir. Kayıtlar incelenmiş anlık kopyalardır; otomatik eşitleme yoktur. Değişiklik veya kaldırma için issue aç. Bu akış yeni bir sunucu, AI API’si, hesap veritabanı veya ziyaretçi başına vekil servis gerektirmez.

Kesin koordinat ve işletme adresi isteğe bağlıdır. Özel ev adresi ya da anahtar yayınlama. Hikâyen ve özgün eserin sende kalır. Manifest kökte olmalıdır; yalnız proje alt dizinini yönetmek yeterli değildir.

## Maintainer / Bakımcı

Review the linked public manifest and the content/rights declarations. Use the private registry verifier locally for bounded DNS-pinned fetching, then review the proposed diff. Only a human maintainer approves directory entries. Update the existing static atlas source and rebuild/deploy its static bundle; the current atlas still has build-time seed data. The public form does not silently modify the registry or the atlas.

Canlı manifesti ve içerik/hak beyanını incele. Sınırlandırılmış, DNS’i sabitlenmiş çekim için private registry doğrulayıcısını yerelde kullan, çıkan farkı gözden geçir. Kayıt onayını insan bakımcı verir. Mevcut statik atlas kaynağını güncelle, paketini yeniden derleyip yayınla; atlas hâlen derleme sırasında alınan başlangıç verisini kullanır. Form, registry veya atlası sessizce değiştirmez.

