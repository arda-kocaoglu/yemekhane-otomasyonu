const {
    kullanilmisMenuleriGetir,
    degerlendirmeEkle,
    degerlendirmelerimiGetir
} = require("../models/degerlendirmeModel");

// Değerlendirilebilecek menüleri getir
async function kullanilmisMenuleriListele(req, res) {
    try {
        const kullaniciId = req.session.kullanici.id;

        const menuler = await kullanilmisMenuleriGetir(
            kullaniciId
        );

        res.json({
            durum: "Başarılı",
            menuler: menuler
        });

    } catch (error) {
        console.log(error.message);

        res.status(500).json({
            durum: "Hata",
            mesaj: "Menüler alınamadı."
        });
    }
}

// Değerlendirme yap
async function degerlendirmeYap(req, res) {
    try {
        const kullaniciId = req.session.kullanici.id;
        const menuId = Number(req.body.menu_id);
        const puan = Number(req.body.puan);
        const yorum = req.body.yorum || null;

        if (!Number.isInteger(menuId) || menuId <= 0) {
            return res.status(400).json({
                durum: "Hata",
                mesaj: "Geçerli bir menü seçmelisiniz."
            });
        }

        if (!Number.isInteger(puan) || puan < 1 || puan > 5) {
            return res.status(400).json({
                durum: "Hata",
                mesaj: "Puan 1 ile 5 arasında olmalıdır."
            });
        }

        if (yorum !== null && (
            typeof yorum !== "string" || yorum.length > 500
        )) {
            return res.status(400).json({
                durum: "Hata",
                mesaj: "Yorum en fazla 500 karakter olabilir."
            });
        }

        const menuler = await kullanilmisMenuleriGetir(
            kullaniciId
        );

        const uygunMenu = menuler.find(
            menu => menu.menu_id === menuId
        );

        if (!uygunMenu) {
            return res.status(400).json({
                durum: "Hata",
                mesaj: "Bu menüyü değerlendiremezsiniz."
            });
        }

        const sonuc = await degerlendirmeEkle(
            kullaniciId,
            menuId,
            puan,
            yorum
        );

        res.json({
            durum: "Başarılı",
            mesaj: "Değerlendirmeniz kaydedildi.",
            degerlendirme_id: sonuc
        });

    } catch (error) {
        console.log(error.message);

        res.status(400).json({
            durum: "Hata",
            mesaj: error.code === "ER_DUP_ENTRY"
                ? "Bu menüyü daha önce değerlendirdiniz."
                : "Değerlendirme kaydedilemedi."
        });
    }
}

// Kullanıcının değerlendirmelerini getir
async function degerlendirmelerimiListele(req, res) {
    try {
        const kullaniciId = req.session.kullanici.id;

        const degerlendirmeler =
            await degerlendirmelerimiGetir(kullaniciId);

        res.json({
            durum: "Başarılı",
            degerlendirmeler: degerlendirmeler
        });

    } catch (error) {
        console.log(error.message);

        res.status(500).json({
            durum: "Hata",
            mesaj: "Değerlendirmeler alınamadı."
        });
    }
}

module.exports = {
    kullanilmisMenuleriListele,
    degerlendirmeYap,
    degerlendirmelerimiListele
};
