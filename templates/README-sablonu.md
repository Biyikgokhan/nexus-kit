# <Mekân adı> — <kısa alt başlık> / 0.1

<İki cümle: burası ne, kim kurdu.> Fotoğraf + kroki + sahibinin anlatımından yorumlanmış Three.js mekânı; ölçülü rölöve değildir.

## Çalıştırma

Node 22.12+:

```sh
npm ci
npm run dev        # http://127.0.0.1:5195
npm test
npx nexus-kit check
npm run build
```

## 0.1 — <bu turun adı>

- <Ne yapıldı: mimari kabuk, kapı, N eşya, K istasyon.>
- <Ne ölçüldü: N üçgen, M mesh (batch sonrası), D draw call; geometri sayımıdır, FPS ölçümü değildir.>
- <Ne yapılmadı: sonraki odalar, ses, karakter, canlı servis.>
- <Testler: N Node testi geçti; tarayıcı QA 1440/390 px, console hatası yok.>

## Referans ve yorum sınırı

Kaynak: sahibinin <N> fotoğrafı ve numaralı krokisi (`reference/`). Uzun kenar <X> m sahibinin beyanı; diğer ölçüler yaklaşık yorumdur. Görülmeyen odalar modellenmedi. Google görüntüsü kullanılmadı ve dağıtılmadı.

## Mekân dosyası

`/.well-known/nexus.json` — `nexus-interlink/0.2`. Kapılar: <liste>. Atlas kaydı: <bekliyor / birleşti, tarih>.

## Lisans

Kod: MIT (`LICENSE`, `src/engine/LICENSE`). Fotoğraflar, eserler, logo ve alan adı sahibine aittir. Üçüncü taraf: `THIRD-PARTY.md`.
