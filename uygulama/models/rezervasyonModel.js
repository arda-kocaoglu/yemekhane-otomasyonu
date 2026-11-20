const { yazmaBaglantisi, okumaBaglantisi } = require("../config/db");

async function rezervasyonYap(kullaniciId, menuId) {
    const [sonuclar] = await yazmaBaglantisi.query(
        "CALL sp_rezervasyon_yap(?, ?)",
        [kullaniciId, menuId]
    );

    return sonuclar[0][0];
}

async function rezervasyonlarimiGetir(kullaniciId) {
    const [sonuclar] = await okumaBaglantisi.query(
        `SELECT
            r.id AS rezervasyon_id,
            r.menu_id,
            yh.ad AS yemekhane,
            o.ad AS ogun,
            m.tarih,
            r.durum,
            r.ucret,
            TIMESTAMP(m.tarih, o.son_saat) AS rezervasyon_son,
            CASE
                WHEN r.durum = 'aktif'
                AND NOW() < TIMESTAMP(m.tarih, o.son_saat)
                THEN 1
                ELSE 0
            END AS iptal_edilebilir
        FROM rezervasyonlar r
        JOIN menuler m ON m.id = r.menu_id
        JOIN yemekhaneler yh ON yh.id = m.yemekhane_id
        JOIN ogunler o ON o.id = m.ogun_id
        WHERE r.kullanici_id = ?
        ORDER BY m.tarih DESC`,
        [kullaniciId]
    );

    return sonuclar;
}

async function rezervasyonIptalEt(kullaniciId, rezervasyonId) {
    const [sonuclar] = await yazmaBaglantisi.query(
        "CALL sp_rezervasyon_iptal(?, ?)",
        [kullaniciId, rezervasyonId]
    );

    return sonuclar[0][0];
}

module.exports = {
    rezervasyonYap,
    rezervasyonlarimiGetir,
    rezervasyonIptalEt
};
