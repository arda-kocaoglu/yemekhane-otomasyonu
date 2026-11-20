const express = require("express");
const router = express.Router();

const {
    yemekhaneleriGetir,
    ogunleriGetir,
    gununMenusuGetir,
    haftalikMenuGetir
} = require("../controllers/menuController");

router.get("/yemekhaneler", yemekhaneleriGetir);
router.get("/ogunler", ogunleriGetir);
router.get("/gunun-menusu", gununMenusuGetir);
router.get("/haftalik", haftalikMenuGetir);

module.exports = router;
