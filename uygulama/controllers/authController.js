const bcrypt = require("bcrypt");
const { kullaniciBul } = require("../models/authModel");

async function girisYap(req, res) {
    try {
        const { eposta, sifre } = req.body;

        if (!eposta || !sifre) {
            return res.status(400).json({
                mesaj: "E-posta ve şifre gereklidir."
            });
        }

        const kullanici = await kullaniciBul(eposta);

        if (!kullanici || kullanici.aktif !== 1) {
            return res.status(401).json({
                mesaj: "E-posta veya şifre hatalı."
            });
        }

        const sifreDogru = await bcrypt.compare(
            sifre,
            kullanici.sifre_hash
        );

        if (!sifreDogru) {
            return res.status(401).json({
                mesaj: "E-posta veya şifre hatalı."
            });
        }

        req.session.kullanici = {
            id: kullanici.id,
            ad: kullanici.ad,
            soyad: kullanici.soyad,
            eposta: kullanici.eposta,
            rol: kullanici.rol,
            ogrenci_no: kullanici.ogrenci_no
        };

        res.json({
            durum: "Başarılı",
            mesaj: "Giriş yapıldı.",
            kullanici: req.session.kullanici
        });

    } catch (error) {
        console.log(error.message);

        res.status(500).json({
            mesaj: "Giriş işlemi sırasında hata oluştu."
        });
    }
}

function cikisYap(req, res) {
    req.session.destroy((error) => {
        if (error) {
            return res.status(500).json({
                mesaj: "Çıkış yapılamadı."
            });
        }

        res.clearCookie("connect.sid");

        res.json({
            mesaj: "Çıkış başarılı."
        });
    });
}

function kullaniciBilgisi(req, res) {
    res.json({
        durum: "Başarılı",
        kullanici: req.session.kullanici
    });
}

module.exports = {
    girisYap,
    cikisYap,
    kullaniciBilgisi
};