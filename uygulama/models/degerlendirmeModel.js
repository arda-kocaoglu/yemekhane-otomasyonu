const { yazmaBaglantisi, okumaBaglantisi } = require("../config/db");

// Kullanıcının değerlendirebileceği menüleri getir
async function kullanilmisMenuleriGetir(kullaniciId) {
    const [sonuclar] = await okumaBaglantisi.query(
        `SELECT
            r.menu_id,
            yh.ad AS yemekhane,
            o.ad AS ogun,
            m.tarih
        FROM rezervasyonlar r
        JOIN menuler m ON m.id = r.menu_id
        JOIN yemekhaneler yh ON yh.id = m.yemekhane_id
        JOIN ogunler o ON o.id = m.ogun_id
        LEFT JOIN degerlendirmeler d
            ON d.menu_id = r.menu_id
            AND d.kullanici_id = r.kullanici_id
        WHERE r.kullanici_id = ?
        AND r.durum = 'kullanildi'
        AND d.id IS NULL
        ORDER BY m.tarih DESC`,
        [kullaniciId]
    );

    return sonuclar;
}

// Değerlendirme ekle
async function degerlendirmeEkle(
    kullaniciId,
    menuId,
    puan,
    yorum
) {
    const [sonuclar] = await yazmaBaglantisi.query(
        `INSERT INTO degerlendirmeler
        (kullanici_id, menu_id, puan, yorum)
        VALUES (?, ?, ?, ?)`,
        [kullaniciId, menuId, puan, yorum]
    );

    return sonuclar.insertId;
}

// Kullanıcının değerlendirmelerini getir
async function degerlendirmelerimiGetir(kullaniciId) {
    const [sonuclar] = await okumaBaglantisi.query(
        `SELECT
            d.id,
            d.menu_id,
            yh.ad AS yemekhane,
            o.ad AS ogun,
            m.tarih,
            d.puan,
            d.yorum,
            d.olusturma
        FROM degerlendirmeler d
        JOIN menuler m ON m.id = d.menu_id
        JOIN yemekhaneler yh ON yh.id = m.yemekhane_id
        JOIN ogunler o ON o.id = m.ogun_id
        WHERE d.kullanici_id = ?
        ORDER BY d.olusturma DESC`,
        [kullaniciId]
    );

    return sonuclar;
}

module.exports = {
    kullanilmisMenuleriGetir,
    degerlendirmeEkle,
    degerlendirmelerimiGetir
};
