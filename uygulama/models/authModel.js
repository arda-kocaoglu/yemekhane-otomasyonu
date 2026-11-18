const { okumaBaglantisi } = require("../config/db");

async function kullaniciBul(eposta) {
    const [sonuclar] = await okumaBaglantisi.query(
        "SELECT id, ad, soyad, eposta, sifre_hash, rol, ogrenci_no, bakiye, aktif FROM kullanicilar WHERE eposta = ?",
        [eposta]
    );

    if (sonuclar.length === 0) {
        return null;
    }

    return sonuclar[0];
}

module.exports = {
    kullaniciBul
};
