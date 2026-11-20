const express = require("express");
const router = express.Router();

const {
    kullanilmisMenuleriListele,
    degerlendirmeYap,
    degerlendirmelerimiListele
} = require("../controllers/degerlendirmeController");

const {
    oturumKontrol
} = require("../middleware/authMiddleware");

router.get(
    "/kullanilmis-menuler",
    oturumKontrol,
    kullanilmisMenuleriListele
);

router.get(
    "/",
    oturumKontrol,
    degerlendirmelerimiListele
);

router.post(
    "/",
    oturumKontrol,
    degerlendirmeYap
);

module.exports = router;
