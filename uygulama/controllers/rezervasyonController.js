const {
    rezervasyonYap,
    rezervasyonlarimiGetir,
    rezervasyonIptalEt
} = require("../models/rezervasyonModel");

async function rezervasyonOlustur(req, res) {
    try {
        if (!req.session.kullanici) {
            return res.status(401).json({
                mesaj: "Rezervasyon yapmak için giriş yapmalısınız."
            });
        }

        const { menu_id } = req.body;

        if (!menu_id) {
            return res.status(400).json({
                mesaj: "Menü bilgisi gereklidir."
            });
        }

        const kullaniciId = req.session.kullanici.id;

        const sonuc = await rezervasyonYap(
            kullaniciId,
            menu_id
        );

        res.json({
            durum: "Başarılı",
            mesaj: "Rezervasyon işlemi tamamlandı.",
            rezervasyon: sonuc
        });

    } catch (error) {
        console.log(error.message);

        res.status(400).json({
            durum: "Hata",
            mesaj: error.sqlMessage || "Rezervasyon oluşturulamadı."
        });
    }
}

async function rezervasyonlarimiListele(req, res) {
    try {
        if (!req.session.kullanici) {
            return res.status(401).json({
                mesaj: "Bu işlem için giriş yapmalısınız."
            });
        }

        const kullaniciId = req.session.kullanici.id;

        const rezervasyonlar = await rezervasyonlarimiGetir(
            kullaniciId
        );

        res.json({
            durum: "Başarılı",
            rezervasyonlar: rezervasyonlar
        });

    } catch (error) {
        console.log(error.message);

        res.status(500).json({
            mesaj: "Rezervasyonlar getirilemedi."
        });
    }
}

async function rezervasyonIptal(req, res) {
    try {
        if (!req.session.kullanici) {
            return res.status(401).json({
                mesaj: "Bu işlem için giriş yapmalısınız."
            });
        }

        const rezervasyonId = req.params.rezervasyonId;

        if (!rezervasyonId) {
            return res.status(400).json({
                mesaj: "Rezervasyon bilgisi gereklidir."
            });
        }

        const kullaniciId = req.session.kullanici.id;

        const sonuc = await rezervasyonIptalEt(
            kullaniciId,
            rezervasyonId
        );

        res.json({
            durum: "Başarılı",
            mesaj: "Rezervasyon iptal edildi.",
            rezervasyon: sonuc
        });

    } catch (error) {
        console.log(error.message);

        res.status(400).json({
            durum: "Hata",
            mesaj: error.sqlMessage || "Rezervasyon iptal edilemedi."
        });
    }
}

module.exports = {
    rezervasyonOlustur,
    rezervasyonlarimiListele,
    rezervasyonIptal
};
