const {
    alerjenleriGetir,
    kullaniciAlerjenleriniGetir,
    kullaniciAlerjenleriniKaydet
} = require("../models/profilModel");

async function profilGetir(req, res) {
    try {
        if (!req.session.kullanici) {
            return res.status(401).json({
                mesaj: "Bu işlem için giriş yapmalısınız."
            });
        }

        const kullaniciId = req.session.kullanici.id;

        const alerjenler = await alerjenleriGetir();
        const seciliAlerjenler = await kullaniciAlerjenleriniGetir(kullaniciId);

        res.json({
            durum: "Başarılı",
            kullanici: req.session.kullanici,
            alerjenler: alerjenler,
            secili_alerjenler: seciliAlerjenler
        });

    } catch (error) {
        console.log(error.message);

        res.status(500).json({
            mesaj: "Profil bilgileri getirilemedi."
        });
    }
}

async function alerjenleriKaydet(req, res) {
    try {
        if (!req.session.kullanici) {
            return res.status(401).json({
                mesaj: "Bu işlem için giriş yapmalısınız."
            });
        }

        const { alerjen_idler } = req.body;

        if (!Array.isArray(alerjen_idler)) {
            return res.status(400).json({
                mesaj: "Alerjen listesi geçersiz."
            });
        }

        const temizListe = [...new Set(alerjen_idler)];

        if (!temizListe.every(id => Number.isInteger(id) && id > 0)) {
            return res.status(400).json({
                mesaj: "Alerjen numaraları geçersiz."
            });
        }

        const mevcutAlerjenler = await alerjenleriGetir();
        const gecerliIdler = mevcutAlerjenler.map(alerjen => alerjen.id);

        if (!temizListe.every(id => gecerliIdler.includes(id))) {
            return res.status(400).json({
                mesaj: "Seçilen alerjenlerden biri bulunamadı."
            });
        }

        const kullaniciId = req.session.kullanici.id;

        await kullaniciAlerjenleriniKaydet(kullaniciId, temizListe);

        res.json({
            durum: "Başarılı",
            mesaj: "Alerjen tercihleriniz kaydedildi.",
            secili_alerjenler: temizListe
        });

    } catch (error) {
        console.log(error.message);

        res.status(500).json({
            mesaj: "Alerjen tercihleri kaydedilemedi."
        });
    }
}

module.exports = {
    profilGetir,
    alerjenleriKaydet
};
