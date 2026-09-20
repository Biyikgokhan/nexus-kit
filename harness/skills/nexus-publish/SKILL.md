---
name: nexus-publish
description: Manifest üretimi (nexus.json + .well-known), yayın komutunu gösterme (çalıştırmama), yayın sonrası .well-known doğrulaması, KAYIT.md ve kayıt deposu başvurusu. Tetikleyiciler - "yayınla", "deploy", "manifest", ".well-known", "haritaya çık", "kayıt", "Vercel", "Netlify", "GitHub Pages".
---

# nexus-publish

## Sıra

1. `npx nexus-kit manifest` → `public/nexus.json` ve `public/.well-known/nexus.json` (byte-aynı). `place.json`'dan `manifestFor()`; `extensions.nexusKit {version, path, geometry, checkedAt}`.
2. `npx nexus-kit check` yeşil değilse yayın önerme.
3. `npm run build` → `dist/`. `dist/` içinde `.env*`, `.runtime/`, ham fotoğraf klasörü **olmamalı** (`check` bakar; sen de bak).
4. Yayın komutunu **göster**, çalıştırma:

| Sağlayıcı | Komut / adım |
| --- | --- |
| Vercel | `vercel deploy --prod` (proje dizininde); alan adı: Settings › Domains |
| Netlify | `netlify deploy --prod --dir dist` |
| Cloudflare Pages | `wrangler pages deploy dist` |
| GitHub Pages | `dist/` → `gh-pages` branch; `.nojekyll` pakette; `CNAME` dosyası alan adı |
| Manuel | `dist/` içeriğini kökte yayınla; `.well-known` gizli klasörünü unutma |

5. Yayın sonrası doğrulama (bunu yapabilirsin, salt okunur): `curl -sI https://alan/.well-known/nexus.json` → 200 ve `application/json`; içerik `public/.well-known/nexus.json` ile aynı mı. Farklıysa eski dağıtım / önbellek; kullanıcıya söyle.
6. `KAYIT.md` üret:

```markdown
# Nexus kayıt başvurusu
- Mekân: <name>
- Manifest: https://<alan>/.well-known/nexus.json
- Tür: <kind> · Adres: <address|dijital> · Bağlı merkez: <anchorId|—>
- Hikâye: <description>
- [ ] Fotoğraflar bana ait ya da izinliyim.
- [ ] Ekol kurallarını (04-ART-DIRECTION) okudum.
- [ ] Manifestimi ben yayınlıyorum; kaldırmak istersem issue açarım.
```

7. Başvuru komutunu göster: `gh issue create --repo <org>/nexus-registry --template place-registration.yml --title "Kayıt: <name>" --body-file KAYIT.md`. `gh` yoksa şablon bağlantısı.

## Alt klasör

Mekân `/mekan/` altındaysa manifest yine **kökte**; `url` `https://alan/mekan/`. Kullanıcı kökü yönetemiyorsa: kayıt yapılamaz, dürüstçe söyle (0.3'te `Link:` başlığıyla keşif yol haritasında).

## Canlı servis (isteğe bağlı)

Python ziyaretçi rehberi/defter varsa: yalnız loopback'te çalışır; dışa açmak (Tailscale Funnel, cloudflared) **ayrı ve açık** bir kullanıcı kararıdır. Komutu göster, açma. Origin allowlist, kapasite ve hız sınırı olmadan açmayı önerme.

## Yapma

Deploy/push/issue çalıştırmak; alan adı DNS'ine dokunmak; `check` kırmızıyken yayın; sırları `dist`e sokmak; "yayında" demek doğrulamadan.
