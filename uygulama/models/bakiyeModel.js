const { yazmaBaglantisi, okumaBaglantisi } = require("../config/db");

// Kullanıcının güncel bakiyesini getir
async function bakiyeGetir(kullaniciId) {
    const [sonuclar] = await yazmaBaglantisi.query(
        "SELECT bakiye FROM kullanicilar WHERE id = ?",
        [kullaniciId]
    );

    if (sonuclar.length === 0) {
        return null;
    }

    return sonuclar[0];
}

// Bakiye hareket geçmişini getir
async function bakiyeHareketleriniGetir(kullaniciId) {
    const [sonuclar] = await okumaBaglantisi.query(
        `SELECT
            id,
            tur,
            tutar,
            rezervasyon_id,
            aciklama,
            olusturma
        FROM bakiye_hareketleri
        WHERE kullanici_id = ?
        ORDER BY olusturma DESC`,
        [kullaniciId]
    );

    return sonuclar;
}

// Kullanıcının bakiyesine para yükle
async function bakiyeYukle(kullaniciId, tutar) {
    const [sonuclar] = await yazmaBaglantisi.query(
        "CALL sp_bakiye_yukle(?, ?)",
        [kullaniciId, tutar]
    );

    return sonuclar[0][0];
}

module.exports = {
    bakiyeGetir,
    bakiyeHareketleriniGetir,
    bakiyeYukle
};
