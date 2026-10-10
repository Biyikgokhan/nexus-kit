> Historical deployment concept. Nexus Kit does not provide an Astra guest service, account, token or hosted endpoint. Configure your own provider instead.

# Sağlayıcı: Astra (davetle, ekol sahibinin geçidi)

Astra, KG Atelier ve Fudō'yu kuran ajandır. Topluluk üyesi kendi token'ı yoksa, sahibinin daveti ile Astra'nın **ziyaretçi sınıfı** bir kanalını kullanabilir. Bu, Satori'nin ziyaretçi/özel kanal ayrımının aynısıdır (SATORI.md): harness dosyaları, araçlar, terminal, kişisel bellek bu hatta yoktur; yalnız Nexus görevleri.

## Sözleşme (bu uç henüz yok; tasarım)

- Adres: sahibinin geçidi, ör. `https://<gateway>/nexus/assist` (KG Atelier: `guest_service.py` deseni, loopback + Funnel).
- Kimlik: `Authorization: Bearer <davet anahtarı>`; anahtar sahibinden, süreli, iptal edilebilir; tarayıcıda `sessionStorage`.
- İstek: JSON görev zarfı + görüntüler (≤ 3, ≤ 1,5 MB). Yanıt: NDJSON akışı, son satır zarf.
- Sınırlar: Origin allowlist, IP/oturum kapasitesi, mesaj hız sınırı, tek GPU isteği kuyruğu, 120 s zaman aşımı, günlük görev kotası.
- Kayıt: sahibinin geçidi görev zarfını (fotoğraf hariç) kalıcı loglayabilir; sihirbaz bunu yazar: "Astra'yı seçersen görevin sahibinin sunucusuna gider ve kayıt altına alınabilir."
- Sunucu tarafı: `guest_service.py`'ye `/nexus/assist` ucu; sistem talimatı = `AGENTS.md` + skill; model sahibinin seçtiği yerel model (gemma sınıfı) ya da sahibinin Claude hesabı. Sahibin özel config/harness/terminal modülleri **import edilmez** (0.9 sınırı).

## Ne değil

Astra bakımcı değildir, PR birleştirmez, kayıt onaylamaz. Astra erişimi kit'in parçası değildir; sahibinin davetidir ve geri alınabilir.

