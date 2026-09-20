# Sağlayıcı: Ollama (yerel, ücretsiz)

`http://127.0.0.1:11434`, `POST /api/chat`, `stream:false`, `format:"json"`. Görüntü için `images[]` (base64) ve vision destekli model.

| Görev | Önerilen model sınıfı | Not |
| --- | --- | --- |
| describe · label · review | 7–9B metin (gemma, qwen) | 8 GB VRAM ya da CPU'da yavaş |
| sketch-to-plan | vision model (qwen-vl, llava sınıfı) | model yoksa sihirbaz "bu yardımcı çizim okuyamıyor" der |

Gerçek ölçüm (KG Atelier ziyaretçi hattı, RTX sınıfı GPU): gemma4:31b ilk yanıt 7,1 s. CPU'da (Fudō F-03: Qwen 4B, 3 iş parçacığı) ilk soğuk yanıt 46 s, sıcak 9–12 s. Zaman aşımı 120 s; "yardımcısız devam" her zaman görünür.

Tarayıcı sihirbazından erişim: Ollama'nın CORS'u kapalıdır; kullanıcı `OLLAMA_ORIGINS=https://gokhanbiyik.com` ile başlatır (sihirbaz komutu gösterir). Yerel adres `localStorage`'da kalır; anahtar yoktur.

Sınır: küçük modeller JSON zarfını bozabilir; `client.mjs` ilk `{…}` bloğunu ayıklar, şema doğrular, üç denemeden sonra `ok:false` döner.
