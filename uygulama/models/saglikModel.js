const { yazmaBaglantisi, okumaBaglantisi } = require("../config/db");

async function saglikKontrolEt() {
    await yazmaBaglantisi.query("SELECT 1");
    await okumaBaglantisi.query("SELECT 1");

    return true;
}

module.exports = {
    saglikKontrolEt
};
