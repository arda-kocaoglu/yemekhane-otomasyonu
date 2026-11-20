const express = require("express");
const router = express.Router();

const {
    girisYap,
    cikisYap,
    kullaniciBilgisi
} = require("../controllers/authController");

const {
    oturumKontrol,
    rolKontrol
} = require("../middleware/authMiddleware");

router.post("/giris", girisYap);
router.post("/cikis", cikisYap);

router.get("/profil", oturumKontrol, kullaniciBilgisi);

router.get(
    "/yonetici-kontrol",
    oturumKontrol,
    rolKontrol(["yonetici"]),
    (req, res) => {
        res.json({
            mesaj: "Yönetici erişimi başarılı."
        });
    }
);

module.exports = router;
