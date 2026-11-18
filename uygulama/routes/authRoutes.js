const express = require("express");
const router = express.Router();

const {
    girisYap,
    cikisYap
} = require("../controllers/authController");

router.post("/giris", girisYap);
router.post("/cikis", cikisYap);

module.exports = router;
