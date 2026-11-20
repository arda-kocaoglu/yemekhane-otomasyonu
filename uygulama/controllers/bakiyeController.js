const {
    bakiyeGetir,
    bakiyeHareketleriniGetir,
    bakiyeYukle
} = require("../models/bakiyeModel");

// Bakiye ve hareket geçmişini getir
async function bakiyeBilgileriniGetir(req, res) {
    try {
        const kullaniciId = req.session.kullanici.id;

        const bakiye = await bakiyeGetir(kullaniciId);

        if (!bakiye) {
            return res.status(404).json({
                durum: "Hata",
                mesaj: "Kullanıcı bulunamadı."
            });
        }

        const hareketler =
            await bakiyeHareketleriniGetir(kullaniciId);

        res.json({
            durum: "Başarılı",
            bakiye: bakiye.bakiye,
            hareketler: hareketler
        });

    } catch (error) {
        console.log(error.message);

        res.status(500).json({
            durum: "Hata",
            mesaj: "Bakiye bilgileri alınamadı."
        });
    }
}

// Bakiye yükle
async function bakiyeYukleIslemi(req, res) {
    try {
        const kullaniciId = req.session.kullanici.id;
        const tutar = Number(req.body.tutar);

        if (!Number.isFinite(tutar) || tutar < 10 || tutar > 1000) {
            return res.status(400).json({
                durum: "Hata",
                mesaj: "Yükleme tutarı 10 ile 1000 TL arasında olmalıdır."
            });
        }

        const sonuc = await bakiyeYukle(
            kullaniciId,
            tutar
        );

        res.json({
            durum: "Başarılı",
            mesaj: "Bakiye yükleme işlemi tamamlandı.",
            hareket_id: sonuc.hareket_id,
            bakiye: sonuc.bakiye
        });

    } catch (error) {
        console.log(error.message);

        res.status(400).json({
            durum: "Hata",
            mesaj: error.sqlMessage || "Bakiye yüklenemedi."
        });
    }
}

module.exports = {
    bakiyeBilgileriniGetir,
    bakiyeYukleIslemi
};
