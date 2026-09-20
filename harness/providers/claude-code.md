# Sağlayıcı: Claude Code (kendi üyeliğinle)

Kurulum: `npx nexus-kit harness --provider claude-code` şunları yapar (her biri onayla):

1. `harness/AGENTS.md` → proje kökünde `CLAUDE.md` (kopya; Windows'ta sembolik bağ sorun çıkarır).
2. `harness/skills/nexus-*` → `.claude/skills/nexus-*/SKILL.md`.
3. `.claude/settings.json` izin önerisi (yalnız gösterir):

```json
{"permissions":{"allow":["Bash(npx nexus-kit doctor*)","Bash(npx nexus-kit check*)","Bash(npx nexus-kit blender*)","Bash(npx nexus-kit manifest*)","Bash(npm run build*)","Bash(npm test*)"],"deny":["Bash(vercel deploy*)","Bash(netlify deploy*)","Bash(git push*)","Bash(gh issue create*)","Read(./.env*)","Read(./.runtime/**)"]}}
```

`deny` listesi harness sınırlarını araç düzeyinde de uygular: ajan yayın komutunu göstermek zorunda kalır.

Görüntü: ajan krokiyi `Read reference/sketch.jpg` ile görür; ek adaptör gerekmez. Ücret: kullanıcının Claude üyeliği. Anahtar: Claude Code'un kendi oturumu; kit hiçbir şey saklamaz.

Tarayıcı sihirbazı (kolay yol) Claude Code'u kullanamaz; orada Claude API ya da Ollama seçilir.
