# Sağlayıcı: Claude API (kendi anahtarınla)

Anahtar `.env.local › ANTHROPIC_API_KEY` (CLI) ya da tarayıcı `sessionStorage` (kolay yol). Kit sunucusu yok; istek doğrudan `api.anthropic.com`'a gider. Ücret kullanıcının hesabından.

## client.mjs sözleşmesi (uygulandı: `harness/client.mjs`)

```js
import {assist} from './client.mjs';
const out = await assist({provider:'claude-api', config:{apiKey:process.env.ANTHROPIC_API_KEY, model:process.env.NEXUS_AI_MODEL}, task:'sketch-to-plan', input, images:[{mediaType:'image/jpeg', data:base64}]});
// out = {task, ok, result, notes, confidence}  — JSON dışı metin atılır, şema doğrulanır
```

- `messages.create`; sistem = `AGENTS.md` + ilgili `SKILL.md`; kullanıcı = JSON görev zarfı + görüntü blokları (base64, ≤ 1,5 MB, JPEG/WebP).
- `max_tokens` görev başına (describe 600, sketch-to-plan 2000, review 1200).
- Model kimliği kullanıcı seçer; kit varsayılan olarak güncel Claude ailesinden görüntü destekli bir model önerir ve belgede sabit kimlik yazmaz (kimlikler değişir; `client.mjs --list-models` günceli gösterir).
- Tarayıcıda: `anthropic-dangerous-direct-browser-access: true` başlığı; anahtar yalnız `sessionStorage`; sekme kapanınca gider; sihirbaz bunu kullanıcıya yazar.
- Zaman aşımı 60 s; hata → "yardımcısız devam" düğmesi.

## Güvenlik

Anahtar prompt'a, log'a, `place.json`'a, ZIP'e girmez. `.env.local` `.gitignore`'da (init yazar). `dist/`e sızma `check`te kırmızı.
