# Sağlayıcı: başka bir ajan (Codex, Gemini CLI, Cursor, Aider, kendi betiğin)

Gereken tek şey: ajan `harness/AGENTS.md`'yi ve ilgili `harness/skills/*/SKILL.md`'yi okuyabilsin ve JSON görev zarfını döndürsün.

- `AGENTS.md` adı çoğu ajanın varsayılan talimat dosyasıdır; kopyalamadan çalışır.
- Skill'ler düz Markdown; ajanın skill mekanizması yoksa dosyayı sohbete/bağlama ekle.
- CLI görevleri için `harness/client.mjs --provider custom --command "<komut>"`: kit görev zarfını stdin'e yazar, stdout'tan JSON bekler. Böylece herhangi bir yerel betik/ajan sağlayıcı olur.
- Tarayıcı sihirbazı özel sağlayıcıyı `POST <senin adresin>` (JSON zarfı) ile çağırabilir; CORS ve anahtar senin sorumluluğun; kit saklamaz.

Sınırlar aynıdır: yayın komutu gösterilir, çalıştırılmaz; sır okunmaz; görülmeyen oda modellenmez.
