const express = require("express");
const session = require("express-session");
const { createClient } = require("redis");
const { RedisStore } = require("connect-redis");

const saglikRoutes = require("./routes/saglikRoutes");
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const rezervasyonRoutes = require("./routes/rezervasyonRoutes");
const bakiyeRoutes = require("./routes/bakiyeRoutes");
const degerlendirmeRoutes = require("./routes/degerlendirmeRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(express.json());

// Redis bağlantısı
const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || "redis"}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on("error", (error) => {
    console.log("Redis bağlantı hatası:", error.message);
});

// Redis oturum deposu
const redisStore = new RedisStore({
    client: redisClient,
    prefix: "yemekhane:oturum:"
});

// Oturum ayarları
app.use(session({
    store: redisStore,
    secret: "yemekhane_otomasyonu_gizli_anahtar",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 30 * 60 * 1000
    }
}));

// API rotaları
app.use("/api/saglik", saglikRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/rezervasyon", rezervasyonRoutes);
app.use("/api/bakiye", bakiyeRoutes);
app.use("/api/degerlendirme", degerlendirmeRoutes);
app.use("/api/admin", adminRoutes);

// Sunucuyu başlat
const PORT = 8000;

async function sunucuyuBaslat() {
    await redisClient.connect();

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Uygulama ${PORT} portunda çalışıyor.`);
    });
}

sunucuyuBaslat().catch((error) => {
    console.log("Uygulama başlatılamadı:", error.message);
});
