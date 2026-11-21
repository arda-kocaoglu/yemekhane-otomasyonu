const {
    menuRaporlariniGetir,
    menuSecenekleriniGetir,
    menuOlustur,
    menuGuncelle
} = require("../models/adminModel");

const redisClient = require("../config/redis");

// Kullanıcının yönetici olup olmadığını kontrol et
function yoneticiMi(req, res) {
    if (!req.session.kullanici ||
        req.session.kullanici.rol !== "yonetici") {

        res.status(403).json({
            durum: "Hata",
            mesaj: "Bu işlem için yönetici yetkisi gereklidir."
        });

        return false;
    }

    return true;
}

// Menü raporlarını getir
async function menuRaporlariniGetirController(req, res) {
    if (!yoneticiMi(req, res)) {
        return;
    }

    try {
        const menuler = await menuRaporlariniGetir();

        res.json({
            durum: "Başarılı",
            menuler
        });

    } catch (error) {
        console.log(error.message);

        res.status(500).json({
            durum: "Hata",
            mesaj: "Menü raporları getirilemedi."
        });
    }
}

// Menü oluşturma seçeneklerini getir
async function menuSecenekleriniGetirController(req, res) {
    if (!yoneticiMi(req, res)) {
        return;
    }

    try {
        const secenekler = await menuSecenekleriniGetir();

        res.json({
            durum: "Başarılı",
            secenekler
        });

    } catch (error) {
        console.log(error.message);

        res.status(500).json({
            durum: "Hata",
            mesaj: "Menü seçenekleri getirilemedi."
        });
    }
}

// Yeni menü oluştur
async function menuOlusturController(req, res) {
    if (!yoneticiMi(req, res)) {
        return;
    }

    try {
        const {
            yemekhane_id,
            tarih,
            ogun_id,
            ogrenci_fiyati,
            personel_fiyati,
            yemek_ids
        } = req.body;

        if (
            !yemekhane_id ||
            !tarih ||
            !ogun_id ||
            ogrenci_fiyati === undefined ||
            personel_fiyati === undefined ||
            !Array.isArray(yemek_ids) ||
            yemek_ids.length === 0
        ) {
            return res.status(400).json({
                durum: "Hata",
                mesaj: "Menü bilgileri eksik."
            });
        }

        if (
            !Number.isFinite(Number(ogrenci_fiyati)) ||
            !Number.isFinite(Number(personel_fiyati)) ||
            Number(ogrenci_fiyati) < 0 ||
            Number(personel_fiyati) < 0
        ) {
            return res.status(400).json({
                durum: "Hata",
                mesaj: "Menü fiyatları geçerli olmalıdır."
            });
        }

        const menuId = await menuOlustur({
            yemekhane_id,
            tarih,
            ogun_id,
            ogrenci_fiyati,
            personel_fiyati,
            yemek_ids
        });

        const anahtar =
            `menu:${yemekhane_id}:${tarih}:${ogun_id}`;

        const silinenKayitSayisi = await redisClient.del(anahtar);

        console.log("Yeni menü önbelleği temizlendi:", anahtar);
        console.log("Silinen Redis kayıt sayısı:", silinenKayitSayisi);

        res.status(201).json({
            durum: "Başarılı",
            mesaj: "Yeni menü oluşturuldu.",
            menu_id: menuId
        });

    } catch (error) {
        console.log(error.message);

        res.status(400).json({
            durum: "Hata",
            mesaj: error.sqlMessage || error.message ||
                "Menü oluşturulamadı."
        });
    }
}

// Menü düzenle
async function menuGuncelleController(req, res) {
    if (!yoneticiMi(req, res)) {
        return;
    }

    try {
        const menuId = Number(req.params.id);

        const {
            yemekhane_id,
            tarih,
            ogun_id,
            ogrenci_fiyati,
            personel_fiyati,
            yemek_ids
        } = req.body;

        if (
            !Number.isInteger(menuId) ||
            menuId <= 0 ||
            !yemekhane_id ||
            !tarih ||
            !ogun_id ||
            ogrenci_fiyati === undefined ||
            personel_fiyati === undefined ||
            !Array.isArray(yemek_ids) ||
            yemek_ids.length === 0
        ) {
            return res.status(400).json({
                durum: "Hata",
                mesaj: "Menü bilgileri eksik veya hatalı."
            });
        }

        if (
            !Number.isFinite(Number(ogrenci_fiyati)) ||
            !Number.isFinite(Number(personel_fiyati)) ||
            Number(ogrenci_fiyati) < 0 ||
            Number(personel_fiyati) < 0
        ) {
            return res.status(400).json({
                durum: "Hata",
                mesaj: "Menü fiyatları geçerli olmalıdır."
            });
        }

        const eskiMenu = await menuGuncelle(menuId, {
            yemekhane_id,
            tarih,
            ogun_id,
            ogrenci_fiyati,
            personel_fiyati,
            yemek_ids
        });

        const eskiAnahtar =
            `menu:${eskiMenu.yemekhane_id}:${eskiMenu.tarih}:${eskiMenu.ogun_id}`;

        const yeniAnahtar =
            `menu:${yemekhane_id}:${tarih}:${ogun_id}`;

        // Aynı anahtarın iki kez gönderilmesini önle
        const anahtarlar = [...new Set([eskiAnahtar, yeniAnahtar])];

        const silinenKayitSayisi = await redisClient.del(anahtarlar);

        console.log(
            "Menü önbelleği temizlendi:",
            eskiAnahtar,
            yeniAnahtar
        );

        console.log("Silinen Redis kayıt sayısı:", silinenKayitSayisi);

        res.json({
            durum: "Başarılı",
            mesaj: "Menü güncellendi.",
            menu_id: menuId
        });

    } catch (error) {
        console.log(error.message);

        res.status(400).json({
            durum: "Hata",
            mesaj: error.sqlMessage || error.message ||
                "Menü güncellenemedi."
        });
    }
}

module.exports = {
    menuRaporlariniGetirController,
    menuSecenekleriniGetirController,
    menuOlusturController,
    menuGuncelleController
};
