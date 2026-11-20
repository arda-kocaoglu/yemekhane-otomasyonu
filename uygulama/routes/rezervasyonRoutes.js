const express = require("express");
const router = express.Router();

const {
    rezervasyonOlustur,
    rezervasyonlarimiListele,
    rezervasyonIptal
} = require("../controllers/rezervasyonController");

const {
    oturumKontrol
} = require("../middleware/authMiddleware");

// Rezervasyon oluşturma
router.post(
    "/olustur",
    oturumKontrol,
    rezervasyonOlustur
);

// Kullanıcının rezervasyonlarını listeleme
router.get(
    "/",
    oturumKontrol,
    rezervasyonlarimiListele
);

// Rezervasyon iptal etme
router.delete(
    "/:rezervasyonId",
    oturumKontrol,
    rezervasyonIptal
);

module.exports = router;
