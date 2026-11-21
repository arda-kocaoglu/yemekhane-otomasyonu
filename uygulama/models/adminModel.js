const { yazmaBaglantisi, okumaBaglantisi } = require("../config/db");

// Yönetici panelindeki menü raporlarını getir
async function menuRaporlariniGetir() {
    const [sonuclar] = await okumaBaglantisi.query(
        `SELECT
            d.menu_id,
            DATE_FORMAT(d.tarih, '%Y-%m-%d') AS tarih,
            d.yemekhane_id,
            d.yemekhane,
            d.ogun_id,
            d.ogun,
            d.kapasite,
            d.rezerve,
            d.bos_yer,
            d.doluluk_yuzde,
            p.oy_sayisi,
            p.ortalama_puan,
            m.ogrenci_fiyati,
            m.personel_fiyati,
            (
                SELECT GROUP_CONCAT(my.yemek_id)
                FROM menu_yemekleri my
                WHERE my.menu_id = d.menu_id
            ) AS yemek_ids
        FROM v_menu_doluluk d
        JOIN menuler m ON m.id = d.menu_id
        LEFT JOIN v_menu_puan p ON p.menu_id = d.menu_id
        ORDER BY d.tarih DESC, d.ogun_id`
    );

    return sonuclar;
}

// Menü oluşturmak için seçenekleri getir
async function menuSecenekleriniGetir() {
    const [yemekhaneler] = await okumaBaglantisi.query(
        "SELECT id, ad, kapasite FROM yemekhaneler ORDER BY id"
    );

    const [ogunler] = await okumaBaglantisi.query(
        "SELECT id, ad, sira FROM ogunler ORDER BY sira"
    );

    const [yemekler] = await okumaBaglantisi.query(
        `SELECT
            y.id,
            y.ad,
            y.kalori,
            y.vejetaryen,
            k.ad AS kategori
        FROM yemekler y
        JOIN yemek_kategorileri k ON k.id = y.kategori_id
        ORDER BY k.sira, y.ad`
    );

    return {
        yemekhaneler,
        ogunler,
        yemekler
    };
}

// Yeni menü oluştur
async function menuOlustur(menu) {
    const baglanti = await yazmaBaglantisi.getConnection();

    try {
        await baglanti.beginTransaction();

        const [sonuc] = await baglanti.query(
            `INSERT INTO menuler
            (yemekhane_id, tarih, ogun_id,
             ogrenci_fiyati, personel_fiyati)
            VALUES (?, ?, ?, ?, ?)`,
            [
                menu.yemekhane_id,
                menu.tarih,
                menu.ogun_id,
                menu.ogrenci_fiyati,
                menu.personel_fiyati
            ]
        );

        const menuId = sonuc.insertId;

        for (const yemekId of menu.yemek_ids) {
            await baglanti.query(
                `INSERT INTO menu_yemekleri
                (menu_id, yemek_id)
                VALUES (?, ?)`,
                [menuId, yemekId]
            );
        }

        await baglanti.commit();

        return menuId;

    } catch (error) {
        await baglanti.rollback();
        throw error;

    } finally {
        baglanti.release();
    }
}

// Mevcut menüyü düzenle
async function menuGuncelle(menuId, menu) {
    const baglanti = await yazmaBaglantisi.getConnection();

    try {
        await baglanti.beginTransaction();

        // Güncellemeden önce eski menü bilgilerini al
        const [eskiMenuler] = await baglanti.query(
            `SELECT
                yemekhane_id,
                DATE_FORMAT(tarih, '%Y-%m-%d') AS tarih,
                ogun_id
            FROM menuler
            WHERE id = ?
            FOR UPDATE`,
            [menuId]
        );

        if (eskiMenuler.length === 0) {
            throw new Error("Menü bulunamadı.");
        }

        const eskiMenu = eskiMenuler[0];

        await baglanti.query(
            `UPDATE menuler
            SET yemekhane_id = ?,
                tarih = ?,
                ogun_id = ?,
                ogrenci_fiyati = ?,
                personel_fiyati = ?
            WHERE id = ?`,
            [
                menu.yemekhane_id,
                menu.tarih,
                menu.ogun_id,
                menu.ogrenci_fiyati,
                menu.personel_fiyati,
                menuId
            ]
        );

        await baglanti.query(
            "DELETE FROM menu_yemekleri WHERE menu_id = ?",
            [menuId]
        );

        for (const yemekId of menu.yemek_ids) {
            await baglanti.query(
                `INSERT INTO menu_yemekleri
                (menu_id, yemek_id)
                VALUES (?, ?)`,
                [menuId, yemekId]
            );
        }

        await baglanti.commit();

        return eskiMenu;

    } catch (error) {
        await baglanti.rollback();
        throw error;

    } finally {
        baglanti.release();
    }
}

module.exports = {
    menuRaporlariniGetir,
    menuSecenekleriniGetir,
    menuOlustur,
    menuGuncelle
};
