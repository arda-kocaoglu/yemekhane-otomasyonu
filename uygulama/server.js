const express = require("express");
const session = require("express-session");
const { RedisStore } = require("connect-redis");
const redisClient = require("./config/redis");

const saglikRoutes = require("./routes/saglikRoutes");
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const rezervasyonRoutes = require("./routes/rezervasyonRoutes");
const bakiyeRoutes = require("./routes/bakiyeRoutes");
const degerlendirmeRoutes = require("./routes/degerlendirmeRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(express.json());

// Redis oturum deposu
const redisStore = new RedisStore({
    client: redisClient,
    prefix: "oturum:"
});

// Oturum ayarları
app.use(session({
    store: redisStore,
    secret: "yemekhane_otomasyonu_gizli_anahtar",
    resave: false,
    saveUninitialized: false,
    rolling: true,
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
