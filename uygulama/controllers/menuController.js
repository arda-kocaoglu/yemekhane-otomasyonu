const menuModel = require("../models/menuModel");

// Yemekhaneleri listele
async function yemekhaneleriGetir(req, res) {
    try {
        const yemekhaneler = await menuModel.yemekhaneleriGetir();

        res.json({
            durum: "Başarılı",
            yemekhaneler
        });
    } catch (hata) {
        console.log(hata);
        res.status(500).json({
            mesaj: "Yemekhaneler getirilemedi."
        });
    }
}

// Öğünleri listele
async function ogunleriGetir(req, res) {
    try {
        const ogunler = await menuModel.ogunleriGetir();

        res.json({
            durum: "Başarılı",
            ogunler
        });
    } catch (hata) {
        console.log(hata);
        res.status(500).json({
            mesaj: "Öğünler getirilemedi."
        });
    }
}

// Günün menüsünü getir
async function gununMenusuGetir(req, res) {
    try {
        const { yemekhaneId, tarih, ogunId } = req.query;

        if (!yemekhaneId || !tarih || !ogunId) {
            return res.status(400).json({
                mesaj: "Yemekhane, tarih ve öğün bilgileri gereklidir."
            });
        }

        const menu = await menuModel.gununMenusuGetir(
            yemekhaneId,
            tarih,
            ogunId
        );

        res.json({
            durum: "Başarılı",
            menu
        });
    } catch (hata) {
        console.log(hata);
        res.status(500).json({
            mesaj: "Menü getirilemedi."
        });
    }
}

// Haftalık menüleri getir
async function haftalikMenuGetir(req, res) {
    try {
        const { baslangicTarihi, bitisTarihi, yemekhaneId } = req.query;

        if (!baslangicTarihi || !bitisTarihi) {
            return res.status(400).json({
                mesaj: "Başlangıç ve bitiş tarihleri gereklidir."
            });
        }

        const menuler = await menuModel.haftalikMenuGetir(
            baslangicTarihi,
            bitisTarihi,
            yemekhaneId
        );

        res.json({
            durum: "Başarılı",
            menuler
        });
    } catch (hata) {
        console.log(hata);
        res.status(500).json({
            mesaj: "Haftalık menüler getirilemedi."
        });
    }
}

module.exports = {
    yemekhaneleriGetir,
    ogunleriGetir,
    gununMenusuGetir,
    haftalikMenuGetir
};
