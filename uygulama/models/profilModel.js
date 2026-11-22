const { yazmaBaglantisi, okumaBaglantisi } = require("../config/db");

async function alerjenleriGetir() {
    const [sonuclar] = await okumaBaglantisi.query(
        "SELECT id, ad FROM alerjenler ORDER BY id"
    );

    return sonuclar;
}

async function kullaniciAlerjenleriniGetir(kullaniciId) {
    const [sonuclar] = await yazmaBaglantisi.query(
        `SELECT alerjen_id
         FROM kullanici_alerjenleri
         WHERE kullanici_id = ?
         ORDER BY alerjen_id`,
        [kullaniciId]
    );

    return sonuclar.map(kayit => kayit.alerjen_id);
}

async function kullaniciAlerjenleriniKaydet(kullaniciId, alerjenIdler) {
    const baglanti = await yazmaBaglantisi.getConnection();

    try {
        await baglanti.beginTransaction();

        await baglanti.query(
            "DELETE FROM kullanici_alerjenleri WHERE kullanici_id = ?",
            [kullaniciId]
        );

        for (const alerjenId of alerjenIdler) {
            await baglanti.query(
                `INSERT INTO kullanici_alerjenleri
                 (kullanici_id, alerjen_id)
                 VALUES (?, ?)`,
                [kullaniciId, alerjenId]
            );
        }

        await baglanti.commit();
    } catch (error) {
        await baglanti.rollback();
        throw error;
    } finally {
        baglanti.release();
    }
}

module.exports = {
    alerjenleriGetir,
    kullaniciAlerjenleriniGetir,
    kullaniciAlerjenleriniKaydet
};
