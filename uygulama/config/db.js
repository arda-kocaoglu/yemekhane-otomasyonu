const mysql = require("mysql2/promise");

const yazmaBaglantisi = mysql.createPool({
    host: process.env.DB_YAZMA_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_KULLANICI,
    password: process.env.DB_SIFRE,
    database: process.env.DB_ADI,
    waitForConnections: true,
    connectionLimit: 10
});

const okumaBaglantisi = mysql.createPool({
    host: process.env.DB_OKUMA_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_KULLANICI,
    password: process.env.DB_SIFRE,
    database: process.env.DB_ADI,
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = {
    yazmaBaglantisi,
    okumaBaglantisi
};
