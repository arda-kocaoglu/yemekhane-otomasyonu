function oturumKontrol(req, res, next) {
    if (!req.session.kullanici) {
        return res.status(401).json({
            mesaj: "Bu işlem için giriş yapmalısınız."
        });
    }

    next();
}

function rolKontrol(izinliRoller) {
    return (req, res, next) => {
        if (!req.session.kullanici) {
            return res.status(401).json({
                mesaj: "Giriş yapmanız gerekiyor."
            });
        }

        if (!izinliRoller.includes(req.session.kullanici.rol)) {
            return res.status(403).json({
                mesaj: "Bu işlem için yetkiniz bulunmuyor."
            });
        }

        next();
    };
}

module.exports = {
    oturumKontrol,
    rolKontrol
};