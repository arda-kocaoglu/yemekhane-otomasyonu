const express = require("express");
const router = express.Router();

const {
    bakiyeBilgileriniGetir,
    bakiyeYukleIslemi
} = require("../controllers/bakiyeController");

const {
    oturumKontrol
} = require("../middleware/authMiddleware");

// Bakiye bilgilerini getir
router.get(
    "/",
    oturumKontrol,
    bakiyeBilgileriniGetir
);

// Bakiye yükle
router.post(
    "/yukle",
    oturumKontrol,
    bakiyeYukleIslemi
);

module.exports = router;
