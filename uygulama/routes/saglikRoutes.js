const express = require("express");
const router = express.Router();

const { saglikKontrol } = require("../controllers/saglikController");

router.get("/", saglikKontrol);

module.exports = router;
