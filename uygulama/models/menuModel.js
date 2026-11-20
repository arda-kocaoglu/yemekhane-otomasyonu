const { okumaBaglantisi } = require("../config/db");

// Yemekhaneleri getir
async function yemekhaneleriGetir() {
    const [sonuclar] = await okumaBaglantisi.query(
        "SELECT id, ad, konum, kapasite FROM yemekhaneler ORDER BY ad"
    );

    return sonuclar;
}

// Öğünleri getir
async function ogunleriGetir() {
    const [sonuclar] = await okumaBaglantisi.query(
        "SELECT id, ad, sira, son_saat, servis_baslangic, servis_bitis FROM ogunler ORDER BY sira"
    );

    return sonuclar;
}

// Günün menüsünü getir
async function gununMenusuGetir(yemekhaneId, tarih, ogunId) {
    const [sonuclar] = await okumaBaglantisi.query(
        `SELECT
            d.*,
            vd.kapasite,
            vd.rezerve,
            vd.bos_yer,
            vd.doluluk_yuzde,
            m.ogrenci_fiyati,
            m.personel_fiyati
         FROM v_menu_detay d
         JOIN v_menu_doluluk vd
            ON vd.menu_id = d.menu_id
         JOIN menuler m
            ON m.id = d.menu_id
         WHERE d.yemekhane_id = ?
         AND DATE(d.tarih) = ?
         AND d.ogun_id = ?
         ORDER BY d.ogun_sira, d.kategori_sira, d.yemek`,
        [yemekhaneId, tarih, ogunId]
    );

    return sonuclar;
}

// Haftalık menüleri getir
async function haftalikMenuGetir(baslangicTarihi, bitisTarihi, yemekhaneId) {
    let sql = `
        SELECT
            d.*,
            m.ogrenci_fiyati,
            m.personel_fiyati
        FROM v_menu_doluluk d
        JOIN menuler m ON m.id = d.menu_id
        WHERE d.tarih BETWEEN ? AND ?
    `;

    const parametreler = [baslangicTarihi, bitisTarihi];

    if (yemekhaneId) {
        sql += " AND d.yemekhane_id = ?";
        parametreler.push(yemekhaneId);
    }

    sql += " ORDER BY d.tarih, d.ogun_id";

    const [sonuclar] = await okumaBaglantisi.query(
        sql,
        parametreler
    );

    return sonuclar;
}

module.exports = {
    yemekhaneleriGetir,
    ogunleriGetir,
    gununMenusuGetir,
    haftalikMenuGetir
};
