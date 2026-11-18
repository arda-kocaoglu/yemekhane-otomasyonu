const { saglikKontrolEt } = require("../models/saglikModel");

async function saglikKontrol(req, res) {
    try {
        await saglikKontrolEt();

        res.json({
            durum: "Başarılı",
            mesaj: "Uygulama ve veritabanları çalışıyor."
        });
    } catch (error) {
        console.log(error.message);

        res.status(500).json({
            durum: "Hata",
            mesaj: "Veritabanı bağlantısı kurulamadı."
        });
    }
}

module.exports = {
    saglikKontrol
};
