const menuModel = require("../models/menuModel");
const redisClient = require("../config/redis");

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

        const anahtar = `menu:${yemekhaneId}:${tarih}:${ogunId}`;

        // Önce Redis kontrol edilir
        const kayitliMenu = await redisClient.get(anahtar);

        if (kayitliMenu) {
            console.log("Menü Redis'ten getirildi:", anahtar);

            return res.json({
                durum: "Başarılı",
                menu: JSON.parse(kayitliMenu)
            });
        }

        // Redis'te yoksa MySQL'den alınır
        const menu = await menuModel.gununMenusuGetir(
            yemekhaneId,
            tarih,
            ogunId
        );

        // Önbellek süresi: ilgili günün sonuna kadar
        const gunSonu = new Date(`${tarih}T23:59:59+03:00`);
        const kalanSure = Math.floor((gunSonu.getTime() - Date.now()) / 1000);

        if (kalanSure > 0) {
            await redisClient.set(anahtar, JSON.stringify(menu), {
                EX: kalanSure
            });
        }

        console.log("Menü MySQL'den getirildi:", anahtar);

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