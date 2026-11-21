import express from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GOOGLE_TTS_API_KEY;

app.use(helmet({ contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"], scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"], mediaSrc: ["'self'", "blob:"],
    connectSrc: ["'self'"], imgSrc: ["'self'", "data:"]
  }
}}));
app.use(express.json({ limit: "32kb" }));
app.use("/api/", rateLimit({ windowMs: 60_000, limit: 8, standardHeaders: "draft-7", legacyHeaders: false,
  message: { error: "खूप विनंत्या झाल्या. कृपया एका मिनिटाने पुन्हा प्रयत्न करा." }
}));
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/tts", async (req, res) => {
  try {
    if (!API_KEY) return res.status(500).json({ error: "Server configuration missing: GOOGLE_TTS_API_KEY" });
    const { text, languageCode, gender, speakingRate = 1, pitch = 0 } = req.body || {};
    if (typeof text !== "string" || !text.trim()) return res.status(400).json({ error: "मजकूर आवश्यक आहे." });
    if ([...text].length > 4000) return res.status(400).json({ error: "कमाल 4,000 अक्षरे परवानगी आहेत." });
    const languages = ["mr-IN", "hi-IN", "en-IN"];
    if (!languages.includes(languageCode)) return res.status(400).json({ error: "अवैध भाषा." });
    if (!["MALE", "FEMALE"].includes(gender)) return res.status(400).json({ error: "अवैध voice निवड." });
    if (![0.85, 1, 1.15].includes(Number(speakingRate))) return res.status(400).json({ error: "अवैध speaking rate." });
    if (![-2, 0, 2].includes(Number(pitch))) return res.status(400).json({ error: "अवैध pitch." });

    const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(API_KEY)}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode, ssmlGender: gender },
        audioConfig: { audioEncoding: "MP3", speakingRate: Number(speakingRate), pitch: Number(pitch) }
      })
    });
    const result = await response.json();
    if (!response.ok) {
      console.error("Google TTS error:", result);
      return res.status(response.status).json({ error: result.error?.message || "Google TTS विनंती अयशस्वी झाली." });
    }
    return res.json({ audioContent: result.audioContent });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error. कृपया पुन्हा प्रयत्न करा." });
  }
});

app.listen(PORT, () => console.log(`VoiceGen running on port ${PORT}`));
