const express = require("express");
const router = express.Router();

const {
    menuRaporlariniGetirController,
    menuSecenekleriniGetirController,
    menuOlusturController,
    menuGuncelleController
} = require("../controllers/adminController");

const {
    rolKontrol
} = require("../middleware/authMiddleware");

// Yönetici yetkisi gereken bütün işlemler
router.get(
    "/raporlar",
    rolKontrol(["yonetici"]),
    menuRaporlariniGetirController
);

router.get(
    "/secenekler",
    rolKontrol(["yonetici"]),
    menuSecenekleriniGetirController
);

router.post(
    "/menu-olustur",
    rolKontrol(["yonetici"]),
    menuOlusturController
);

router.put(
    "/menu-guncelle/:id",
    rolKontrol(["yonetici"]),
    menuGuncelleController
);

module.exports = router;
