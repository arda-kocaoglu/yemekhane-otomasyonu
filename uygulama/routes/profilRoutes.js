const express = require("express");
const router = express.Router();

const {
    profilGetir,
    alerjenleriKaydet
} = require("../controllers/profilController");

router.get("/", profilGetir);
router.put("/alerjenler", alerjenleriKaydet);

module.exports = router;
