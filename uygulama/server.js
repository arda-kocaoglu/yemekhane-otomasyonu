const express = require("express");
const session = require("express-session");

const saglikRoutes = require("./routes/saglikRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(express.json());

app.use(session({
    secret: "yemekhane_otomasyonu_gizli_anahtar",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 30 * 60 * 1000
    }
}));

app.use("/api/saglik", saglikRoutes);
app.use("/api/auth", authRoutes);

const PORT = 8000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Uygulama ${PORT} portunda çalışıyor.`);
});
