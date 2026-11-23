const API = "/api";

let kullanici = null;
let menuSecenekleri = null;
let haftalikMenuler = [];
let seciliAlerjenler = [];
let tumAlerjenler = [];

// API istekleri
async function apiIstegi(url, secenekler = {}) {
    const ayarlar = {
        credentials: "include",
        ...secenekler,
        headers: {
            "Content-Type": "application/json",
            ...(secenekler.headers || {})
        }
    };

    const yanit = await fetch(API + url, ayarlar);

    let veri = {};

    try {
        veri = await yanit.json();
    } catch (error) {
        veri = {};
    }

    if (!yanit.ok) {
        throw new Error(
            veri.mesaj || "İşlem sırasında bir hata oluştu."
        );
    }

    return veri;
}

// HTML içine güvenli metin yazmak için
function guvenliMetin(metin) {
    return String(metin ?? "").replace(/[&<>"']/g, karakter => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[karakter]);
}

// Para biçimi
function paraBicimi(tutar) {
    return Number(tutar || 0).toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " TL";
}

// Tarih biçimi
function tarihBicimi(tarih) {
    if (!tarih) return "-";

    return new Date(tarih).toLocaleDateString("tr-TR");
}

// Bildirim göster
function bildirimGoster(elemanId, mesaj, basarili = false) {
    const eleman = document.getElementById(elemanId);

    if (!eleman) return;

    eleman.className = basarili
        ? "bildirim bildirim-basari"
        : "bildirim bildirim-hata";

    eleman.textContent = mesaj;
}

// Genel bildirim
function genelMesaj(mesaj, basarili = false) {
    bildirimGoster("genel-mesaj", mesaj, basarili);
}

// Giriş ekranını göster
function girisEkraniniGoster() {
    document.getElementById("giris-ekrani").hidden = false;
    document.getElementById("uygulama").hidden = true;

    document.querySelectorAll(".menu-link").forEach(link => {
        link.classList.remove("aktif");
    });

    document.querySelectorAll(".sayfa").forEach(sayfa => {
        sayfa.classList.remove("aktif");
        sayfa.hidden = true;
    });
}

// Ana uygulamayı göster
function uygulamayiGoster() {
    document.getElementById("giris-ekrani").hidden = true;
    document.getElementById("uygulama").hidden = false;

    document.getElementById("kullanici-adi").textContent =
        kullanici.ad + " " + kullanici.soyad;

    const adminMenu = document.getElementById("admin-menu-link");

    adminMenu.hidden = kullanici.rol !== "yonetici";

    document.querySelectorAll(".menu-link").forEach(link => {
        link.classList.remove("aktif");
    });

    document.querySelectorAll(".sayfa").forEach(sayfa => {
        sayfa.classList.remove("aktif");
        sayfa.hidden = true;
    });

    const gununMenusu = document.getElementById("gunun-menusu");

    gununMenusu.hidden = false;
    gununMenusu.classList.add("aktif");

    const gununMenusuLinki = document.querySelector(
        '.menu-link[data-sayfa="gunun-menusu"]'
    );

    if (gununMenusuLinki) {
        gununMenusuLinki.classList.add("aktif");
    }
}

// Giriş işlemi
document.getElementById("giris-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const eposta = document.getElementById("eposta").value;
    const sifre = document.getElementById("sifre").value;

    try {
        const veri = await apiIstegi("/auth/giris", {
            method: "POST",
            body: JSON.stringify({
                eposta,
                sifre
            })
        });

        kullanici = veri.kullanici;

        uygulamayiGoster();

        bildirimGoster(
            "genel-mesaj",
            "Giriş başarılı. Hoş geldiniz.",
            true
        );

        await anaVerileriYukle();

    } catch (error) {
        bildirimGoster(
            "giris-mesaj",
            error.message
        );
    }
});

// Çıkış işlemi
document.getElementById("cikis-dugmesi").addEventListener("click", async function() {
    try {
        await apiIstegi("/auth/cikis", {
            method: "POST"
        });
    } catch (error) {
        console.log(error.message);
    }

    kullanici = null;
    menuSecenekleri = null;
    haftalikMenuler = [];
    seciliAlerjenler = [];
    tumAlerjenler = [];

    girisEkraniniGoster();

    document.getElementById("giris-form").reset();
});

// Sayfalar arasında geçiş
document.querySelectorAll(".menu-link").forEach(dugme => {
    dugme.addEventListener("click", async function() {
        const sayfaAdi = this.dataset.sayfa;

        if (sayfaAdi === "yonetici-paneli" &&
            kullanici.rol !== "yonetici") {
            return;
        }

        document.querySelectorAll(".menu-link").forEach(link => {
            link.classList.remove("aktif");
        });

        this.classList.add("aktif");

        document.querySelectorAll(".sayfa").forEach(sayfa => {
            sayfa.classList.remove("aktif");
            sayfa.hidden = true;
        });

        const aktifSayfa = document.getElementById(sayfaAdi);

        aktifSayfa.hidden = false;
        aktifSayfa.classList.add("aktif");

        try {
            if (sayfaAdi === "gunun-menusu") {
                await gununMenusunuGetir();
            }

            if (sayfaAdi === "haftalik-menu") {
                await haftalikMenuGetir();
            }

            if (sayfaAdi === "rezervasyonlarim") {
                await rezervasyonlarimiGetir();
            }

            if (sayfaAdi === "bakiye") {
                await bakiyeyiGetir();
            }

            if (sayfaAdi === "degerlendirme") {
                await degerlendirmeSayfasiniGetir();
            }

            if (sayfaAdi === "profilim") {
                await profilSayfasiniGetir();
            }

            if (sayfaAdi === "yonetici-paneli") {
                await yoneticiPaneliniGetir();
            }

        } catch (error) {
            genelMesaj(error.message);
        }
    });
});

// Tarih değerini YYYY-MM-DD olarak al
function tarihDegeri(tarih) {
    if (!tarih) return "";

    if (typeof tarih === "string") {
        const eslesme = tarih.match(/^(\d{4}-\d{2}-\d{2})/);

        if (eslesme) {
            return eslesme[1];
        }
    }

    const tarihNesnesi = new Date(tarih);

    const yil = tarihNesnesi.getUTCFullYear();
    const ay = String(tarihNesnesi.getUTCMonth() + 1).padStart(2, "0");
    const gun = String(tarihNesnesi.getUTCDate()).padStart(2, "0");

    return yil + "-" + ay + "-" + gun;
}

// Tarih seçme alanlarını hazırla
function tarihleriHazirla() {
    const bugun = new Date();

    const baslangic = tarihDegeri(bugun);

    const bitisTarihi = new Date(bugun);
    bitisTarihi.setDate(bitisTarihi.getDate() + 6);

    document.getElementById("gunluk-tarih").value = baslangic;

    document.getElementById("haftalik-baslangic").value = baslangic;

    document.getElementById("haftalik-bitis").value =
        tarihDegeri(bitisTarihi);

    document.getElementById("admin-tarih").value = baslangic;
}

// Haftalık menüleri API'den getir
async function menuVerileriniGetir(baslangic, bitis) {
    const parametreler = new URLSearchParams({
        baslangicTarihi: baslangic,
        bitisTarihi: bitis
    });

    const veri = await apiIstegi(
        "/menu/haftalik?" + parametreler.toString()
    );

    return veri.menuler || [];
}

// Yemekhane seçeneklerini doldur
function yemekhaneleriDoldur(elemanId, menuler) {
    const secim = document.getElementById(elemanId);
    const oncekiDeger = secim.value;

    const yemekhaneler = new Map();

    menuler.forEach(menu => {
        yemekhaneler.set(
            menu.yemekhane_id,
            menu.yemekhane
        );
    });

    secim.innerHTML = '<option value="">Tüm yemekhaneler</option>';

    yemekhaneler.forEach((ad, id) => {
        secim.innerHTML += `
            <option value="${guvenliMetin(id)}">
                ${guvenliMetin(ad)}
            </option>
        `;
    });

    if (yemekhaneler.has(Number(oncekiDeger))) {
        secim.value = oncekiDeger;
    }
}

// Öğün seçeneklerini doldur
function ogunleriDoldur(elemanId, menuler) {
    const secim = document.getElementById(elemanId);
    const oncekiDeger = secim.value;

    const ogunler = new Map();

    menuler.forEach(menu => {
        ogunler.set(menu.ogun_id, menu.ogun);
    });

    secim.innerHTML = '<option value="">Tüm öğünler</option>';

    ogunler.forEach((ad, id) => {
        secim.innerHTML += `
            <option value="${guvenliMetin(id)}">
                ${guvenliMetin(ad)}
            </option>
        `;
    });

    if (ogunler.has(Number(oncekiDeger))) {
        secim.value = oncekiDeger;
    }
}

// Günlük menüdeki yemek satırlarını grupla
function menuleriGrupla(satirlar) {
    const gruplar = new Map();

    satirlar.forEach(satir => {
        const id = satir.menu_id;

        if (!gruplar.has(id)) {
            gruplar.set(id, { ...satir, yemekler: [] });
        }

        if (satir.yemek) {
            gruplar.get(id).yemekler.push({
                ad: satir.yemek,
                kalori: satir.kalori,
                vejetaryen: satir.vejetaryen,
                alerjenler: satir.alerjenler,
                alerjen_idler: satir.alerjen_idler
            });
        }
    });

    return Array.from(gruplar.values());
}

// Kullanıcının alerjenleriyle eşleşen yemekleri bul
function yemekAlerjenUyarisi(yemek) {
    if (seciliAlerjenler.length === 0) {
        return "";
    }

    const yemekAlerjenIdleri = String(
        yemek.alerjen_idler || ""
    )
        .split(",")
        .filter(id => id !== "")
        .map(Number);

    const eslesenler = seciliAlerjenler.filter(id =>
        yemekAlerjenIdleri.includes(Number(id))
    );

    if (eslesenler.length === 0) {
        return "";
    }

    const adlar = eslesenler.map(id => {
        const alerjen = tumAlerjenler.find(a =>
            Number(a.id) === Number(id)
        );

        return alerjen ? alerjen.ad : "Alerjen";
    });

    return `
        <p style="color:#b42318;font-weight:bold;margin:6px 0;">
            ⚠ Alerjen Uyarısı: ${guvenliMetin(adlar.join(", "))}
        </p>
    `;
}

// Kullanıcının rolüne göre tam porsiyon fiyatı
function menuFiyatiniBul(menu) {
    if (kullanici.rol === "personel") {
        return Number(menu.personel_fiyati || 0);
    }

    return Number(menu.ogrenci_fiyati || 0);
}

// Menü kartını oluştur
function menuKartiOlustur(menu) {
    const tarih = tarihBicimi(menu.tarih);
    const doluluk = Number(menu.doluluk_yuzde || 0);
    const bosYer = Number(menu.bos_yer || 0);

    // Rezervasyon son saatini kontrol et
    const sonSaatMetni = String(menu.rezervasyon_son || "")
        .replace(" ", "T");

    const sonSaat = sonSaatMetni
        ? new Date(sonSaatMetni + (
            /[zZ]|[+-]\d\d:\d\d$/.test(sonSaatMetni) ? "" : "+03:00"
        ))
        : null;

    const sureDoldu = sonSaat instanceof Date
        && !isNaN(sonSaat.getTime())
        && Date.now() >= sonSaat.getTime();

    const rezervasyonKapali = bosYer <= 0 || sureDoldu;

    const kahvaltiMi = String(menu.ogun || "")
        .toLocaleLowerCase("tr-TR")
        .includes("kahvaltı");

    const tamFiyat = menuFiyatiniBul(menu);
    const yarimFiyat = Math.round(tamFiyat * 60) / 100;

    let yemekBilgisi = "";

    if (Array.isArray(menu.yemekler) && menu.yemekler.length > 0) {
        const toplamKalori = menu.yemekler.reduce(
            (toplam, yemek) => toplam + Number(yemek.kalori || 0), 0
        );

        yemekBilgisi = '<div class="menu-yemekler"><h4>Yemekler</h4><ul>';

        menu.yemekler.forEach(yemek => {
            const vejetaryen = yemek.vejetaryen == 1 ? "Evet" : "Hayır";

            yemekBilgisi += `
                <li>
                    <strong>${guvenliMetin(yemek.ad)}</strong>
                    - ${guvenliMetin(yemek.kalori ?? "-")} kcal
                    - Vejetaryen: ${vejetaryen}
                    - Alerjenler:
                    ${guvenliMetin(yemek.alerjenler || "Belirtilmemiş")}
                    ${yemekAlerjenUyarisi(yemek)}
                </li>
            `;
        });

        yemekBilgisi += `
            </ul>
            <p><strong>Toplam kalori:</strong> ${toplamKalori} kcal</p>
            </div>
        `;
    }

    let fiyatBilgisi = "";

    if (kullanici.rol === "ogrenci") {
        fiyatBilgisi = `
            <p class="menu-fiyat">
                <strong>Öğrenci Fiyatı:</strong>
                ${paraBicimi(menu.ogrenci_fiyati)}
            </p>
        `;
    } else if (kullanici.rol === "personel") {
        fiyatBilgisi = `
            <p class="menu-fiyat">
                <strong>Personel Fiyatı:</strong>
                ${paraBicimi(menu.personel_fiyati)}
            </p>
        `;
    } else {
        fiyatBilgisi = `
            <p>Öğrenci Fiyatı: ${paraBicimi(menu.ogrenci_fiyati)}</p>
            <p>Personel Fiyatı: ${paraBicimi(menu.personel_fiyati)}</p>
        `;
    }

    const porsiyonAlani = kullanici.rol !== "yonetici" ? `
        <div class="form-grup">
            <label for="porsiyon-${menu.menu_id}">
                Porsiyon Seçimi
            </label>

            <select
                id="porsiyon-${menu.menu_id}"
                class="porsiyon-secimi"
                data-menu-id="${menu.menu_id}"
            >
                <option value="tam">
                    Tam Porsiyon - ${paraBicimi(tamFiyat)}
                </option>

                ${kahvaltiMi ? "" : `
                    <option value="yarim">
                        Yarım Porsiyon - ${paraBicimi(yarimFiyat)}
                    </option>
                `}
            </select>

            ${kahvaltiMi ? `
                <small>Kahvaltıda yalnızca tam porsiyon seçilebilir.</small>
            ` : `
                <small>Yarım porsiyon, tam fiyatın %60'ıdır.</small>
            `}
        </div>
    ` : "";

    return `
        <div class="kart menu-karti">
            <h3>${guvenliMetin(menu.yemekhane)}</h3>

            <p><strong>Tarih:</strong> ${tarih}</p>
            <p><strong>Öğün:</strong> ${guvenliMetin(menu.ogun)}</p>

            <div class="menu-istatistikleri">
                <p><strong>Kapasite:</strong> ${menu.kapasite}</p>
                <p><strong>Rezerve:</strong> ${menu.rezerve}</p>
                <p><strong>Boş Yer:</strong>
                    <span class="bos-yer">${bosYer}</span>
                </p>
                <p><strong>Doluluk:</strong> %${doluluk}</p>
            </div>

            ${yemekBilgisi}
            ${fiyatBilgisi}

            ${kullanici.rol !== "yonetici" ? `
                ${porsiyonAlani}

                <button
                    class="dugme rezervasyon-yap"
                    data-menu-id="${menu.menu_id}"
                    ${rezervasyonKapali ? "disabled" : ""}
                >
                    ${bosYer <= 0
                        ? "Kontenjan Doldu"
                        : sureDoldu
                            ? "Rezervasyon Süresi Doldu"
                            : "Rezervasyon Yap"}
                </button>
            ` : ""}
        </div>
    `;
}

// Rezervasyon butonlarını çalıştır
function rezervasyonButonlariniBagla() {
    document.querySelectorAll(".rezervasyon-yap").forEach(dugme => {
        dugme.addEventListener("click", async function() {
            const menuId = Number(this.dataset.menuId);

            const porsiyonAlani = document.getElementById(
                "porsiyon-" + menuId
            );

            const porsiyon = porsiyonAlani
                ? porsiyonAlani.value
                : "tam";

            const porsiyonAdi = porsiyon === "yarim"
                ? "yarım porsiyon"
                : "tam porsiyon";

            if (!confirm(
                "Bu menü için " + porsiyonAdi +
                " rezervasyonu yapmak istiyor musunuz?"
            )) {
                return;
            }

            try {
                const veri = await apiIstegi("/rezervasyon/olustur", {
                    method: "POST",
                    body: JSON.stringify({
                        menu_id: menuId,
                        porsiyon: porsiyon
                    })
                });

                alert(veri.mesaj || "Rezervasyon oluşturuldu.");

                await gununMenusunuGetir();

            } catch (error) {
                alert(error.message);
            }
        });
    });
}

// Günün menüsü
async function gununMenusunuGetir() {
    const tarih = document.getElementById("gunluk-tarih").value;

    if (!tarih) {
        return;
    }

    const sonuc = document.getElementById("gunluk-menu-sonuc");

    const yemekhaneAlani = document.getElementById("gunluk-yemekhane");
    const ogunAlani = document.getElementById("gunluk-ogun");

    const secilenYemekhane = yemekhaneAlani.value;
    const secilenOgun = ogunAlani.value;

    const menuler = await menuVerileriniGetir(tarih, tarih);
    haftalikMenuler = menuler;

    yemekhaneleriDoldur("gunluk-yemekhane", menuler);
    ogunleriDoldur("gunluk-ogun", menuler);

    if (Array.from(yemekhaneAlani.options).some(o =>
        o.value === secilenYemekhane
    )) {
        yemekhaneAlani.value = secilenYemekhane;
    }

    if (Array.from(ogunAlani.options).some(o =>
        o.value === secilenOgun
    )) {
        ogunAlani.value = secilenOgun;
    }

    const yemekhaneId = yemekhaneAlani.value;
    const ogunId = ogunAlani.value;

    if (!yemekhaneId || !ogunId) {
        sonuc.innerHTML = "<p>Lütfen yemekhane ve öğün seçiniz.</p>";
        return;
    }

    const parametreler = new URLSearchParams({
        yemekhaneId,
        tarih,
        ogunId
    });

    const veri = await apiIstegi(
        "/menu/gunun-menusu?" + parametreler.toString()
    );

    const gunlukMenuler = menuleriGrupla(veri.menu || []);

    if (gunlukMenuler.length === 0) {
        sonuc.innerHTML = "<p>Bu tarihte menü bulunamadı.</p>";
        return;
    }

    sonuc.innerHTML = gunlukMenuler.map(menuKartiOlustur).join("");

    rezervasyonButonlariniBagla();
}

// Günlük menü butonu
document.getElementById("gunluk-menu-getir").addEventListener("click", async function() {
    try {
        await gununMenusunuGetir();
    } catch (error) {
        genelMesaj(error.message);
    }
});

// Günlük filtre değişiklikleri
["gunluk-yemekhane", "gunluk-ogun"].forEach(id => {
    document.getElementById(id).addEventListener("change", async function() {
        try {
            await gununMenusunuGetir();
        } catch (error) {
            genelMesaj(error.message);
        }
    });
});

// Haftalık menü
async function haftalikMenuGetir() {
    const baslangic =
        document.getElementById("haftalik-baslangic").value;

    const bitis =
        document.getElementById("haftalik-bitis").value;

    if (!baslangic || !bitis || baslangic > bitis) {
        throw new Error("Tarih aralığını doğru seçiniz.");
    }

    const menuler = await menuVerileriniGetir(baslangic, bitis);

    haftalikMenuler = menuler;

    yemekhaneleriDoldur("haftalik-yemekhane", menuler);

    const yemekhaneId =
        document.getElementById("haftalik-yemekhane").value;

    const filtrelenmis = menuler.filter(menu => {
        return !yemekhaneId ||
            Number(menu.yemekhane_id) === Number(yemekhaneId);
    });

    const sonuc = document.getElementById("haftalik-menu-sonuc");

    if (filtrelenmis.length === 0) {
        sonuc.innerHTML = "<p>Seçilen tarihlerde menü bulunamadı.</p>";
        return;
    }

    sonuc.innerHTML = filtrelenmis.map(menuKartiOlustur).join("");

    rezervasyonButonlariniBagla();
}

document.getElementById("haftalik-menu-getir").addEventListener("click", async function() {
    try {
        await haftalikMenuGetir();
    } catch (error) {
        genelMesaj(error.message);
    }
});

document.getElementById("haftalik-yemekhane").addEventListener("change", async function() {
    try {
        await haftalikMenuGetir();
    } catch (error) {
        genelMesaj(error.message);
    }
});

// Rezervasyonlarımı getir
async function rezervasyonlarimiGetir() {
    const veri = await apiIstegi("/rezervasyon");

    const rezervasyonlar = veri.rezervasyonlar || [];

    const liste = document.getElementById("rezervasyon-listesi");

    if (rezervasyonlar.length === 0) {
        liste.innerHTML = `
            <tr>
                <td colspan="8">Henüz rezervasyonunuz bulunmuyor.</td>
            </tr>
        `;
        return;
    }

    liste.innerHTML = rezervasyonlar.map(r => {
        const durum = String(r.durum || "").toLocaleLowerCase("tr-TR");

        let durumSinifi = "durum-aktif";

        if (durum.includes("kullan")) {
            durumSinifi = "durum-kullanildi";
        } else if (durum.includes("iptal")) {
            durumSinifi = "durum-iptal";
        }

        const porsiyonAdi = r.porsiyon === "yarim"
            ? "Yarım"
            : "Tam";

        return `
            <tr>
                <td>${r.menu_id}</td>
                <td>${tarihBicimi(r.tarih)}</td>
                <td>${guvenliMetin(r.yemekhane)}</td>
                <td>${guvenliMetin(r.ogun)}</td>
                <td>
                    <span class="durum-etiketi ${durumSinifi}">
                        ${guvenliMetin(r.durum)}
                    </span>
                </td>
                <td>${paraBicimi(r.ucret)}</td>
                <td>${porsiyonAdi}</td>
                <td>
                    ${Number(r.iptal_edilebilir) === 1 ? `
                        <button
                            class="dugme rezervasyon-iptal"
                            data-id="${r.rezervasyon_id}"
                        >
                            İptal Et
                        </button>
                    ` : "-"}
                </td>
            </tr>
        `;
    }).join("");

    document.querySelectorAll(".rezervasyon-iptal").forEach(dugme => {
        dugme.addEventListener("click", async function() {
            const id = this.dataset.id;

            if (!confirm("Rezervasyonu iptal etmek istiyor musunuz?")) {
                return;
            }

            try {
                const sonuc = await apiIstegi("/rezervasyon/" + id, {
                    method: "DELETE"
                });

                alert(sonuc.mesaj || "Rezervasyon iptal edildi.");

                await rezervasyonlarimiGetir();

            } catch (error) {
                alert(error.message);
            }
        });
    });
}

// Bakiye bilgilerini getir
async function bakiyeyiGetir() {
    const veri = await apiIstegi("/bakiye");

    const bakiyeAlani = document.getElementById("guncel-bakiye");
    bakiyeAlani.textContent = paraBicimi(veri.bakiye);

    const liste = document.getElementById("bakiye-hareketleri");
    const hareketler = veri.hareketler || [];

    if (hareketler.length === 0) {
        liste.innerHTML = `
            <tr>
                <td colspan="4">Henüz bakiye hareketi bulunmuyor.</td>
            </tr>
        `;
        return;
    }

    liste.innerHTML = hareketler.map(hareket => {
        let tur = "";

        if (hareket.tur === "rezervasyon") {
            tur = "Rezervasyon Ücreti";
        } else if (hareket.tur === "yukleme") {
            tur = "Bakiye Yükleme";
        } else if (hareket.tur === "iade") {
            tur = "Ücret İadesi";
        } else {
            tur = hareket.tur;
        }

        return `
            <tr>
                <td>${guvenliMetin(tur)}</td>
                <td>${paraBicimi(hareket.tutar)}</td>
                <td>${guvenliMetin(hareket.aciklama)}</td>
                <td>${new Date(hareket.olusturma).toLocaleString("tr-TR")}</td>
            </tr>
        `;
    }).join("");
}

// Bakiye yükleme
document.getElementById("bakiye-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const tutar = Number(
        document.getElementById("yuklenecek-tutar").value
    );

    if (!Number.isFinite(tutar) || tutar <= 0) {
        alert("Geçerli bir tutar giriniz.");
        return;
    }

    try {
        const veri = await apiIstegi("/bakiye/yukle", {
            method: "POST",
            body: JSON.stringify({
                tutar
            })
        });

        alert(veri.mesaj || "Bakiye yüklendi.");

        this.reset();

        await bakiyeyiGetir();

    } catch (error) {
        alert(error.message);
    }
});

// Değerlendirme sayfası
async function degerlendirmeSayfasiniGetir() {
    const [kullanilmis, degerlendirmeler] = await Promise.all([
        apiIstegi("/degerlendirme/kullanilmis-menuler"),
        apiIstegi("/degerlendirme")
    ]);

    const menuListesi = kullanilmis.menuler || [];

    const menuSecimi =
        document.getElementById("degerlendirme-menu");

    menuSecimi.innerHTML =
        '<option value="">Menü seçiniz</option>';

    menuListesi.forEach(menu => {
        menuSecimi.innerHTML += `
            <option value="${menu.menu_id}">
                ${guvenliMetin(menu.yemekhane)} -
                ${guvenliMetin(menu.ogun)} -
                ${tarihBicimi(menu.tarih)}
            </option>
        `;
    });

    const liste =
        document.getElementById("degerlendirmeler-listesi");

    const degerler = degerlendirmeler.degerlendirmeler || [];

    if (degerler.length === 0) {
        liste.innerHTML = "<p>Henüz değerlendirme yapmadınız.</p>";
        return;
    }

    liste.innerHTML = degerler.map(d => `
        <div class="degerlendirme-karti">
            <strong>${guvenliMetin(d.yemekhane)} - ${guvenliMetin(d.ogun)}</strong>
            <p>Tarih: ${tarihBicimi(d.tarih)}</p>
            <p>Puan: ${d.puan} / 5</p>
            <p>${guvenliMetin(d.yorum)}</p>
        </div>
    `).join("");
}

// Değerlendirme gönder
document.getElementById("degerlendirme-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const menuId =
        Number(document.getElementById("degerlendirme-menu").value);

    const puan =
        Number(document.getElementById("degerlendirme-puan").value);

    const yorum =
        document.getElementById("degerlendirme-yorum").value;

    if (!menuId || puan < 1 || puan > 5) {
        alert("Menü ve puan seçiniz.");
        return;
    }

    try {
        const veri = await apiIstegi("/degerlendirme", {
            method: "POST",
            body: JSON.stringify({
                menu_id: menuId,
                puan,
                yorum
            })
        });

        alert(veri.mesaj || "Değerlendirme kaydedildi.");

        this.reset();

        await degerlendirmeSayfasiniGetir();

    } catch (error) {
        alert(error.message);
    }
});

// Profil bilgilerini getir
async function profilBilgileriniYukle() {
    const veri = await apiIstegi("/profil");

    tumAlerjenler = veri.alerjenler || [];
    seciliAlerjenler = veri.secili_alerjenler || [];

    return veri;
}

 // Profil sayfasını getir
async function profilSayfasiniGetir() {
    await profilBilgileriniYukle();

    const liste = document.getElementById("profil-alerjen-listesi");

    if (tumAlerjenler.length === 0) {
        liste.innerHTML = "<p>Alerjen kaydı bulunamadı.</p>";
        return;
    }

    liste.innerHTML = tumAlerjenler.map(alerjen => {
        const secili = seciliAlerjenler.some(id =>
            Number(id) === Number(alerjen.id)
        );

        return `
            <label class="alerjen-secenegi">
                <input
                    type="checkbox"
                    class="profil-alerjen"
                    value="${Number(alerjen.id)}"
                    ${secili ? "checked" : ""}
                >
                <span>${guvenliMetin(alerjen.ad)}</span>
            </label>
        `;
    }).join("");

    const mesaj = document.getElementById("profil-mesaj");
    mesaj.textContent = "";
    mesaj.className = "";
}

// Alerjen tercihlerini kaydet
document.getElementById("profil-alerjen-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const alerjenIdler = Array.from(
        document.querySelectorAll(".profil-alerjen:checked")
    ).map(alan => Number(alan.value));

    try {
        const veri = await apiIstegi("/profil/alerjenler", {
            method: "PUT",
            body: JSON.stringify({
                alerjen_idler: alerjenIdler
            })
        });

        seciliAlerjenler = alerjenIdler;

        bildirimGoster(
            "profil-mesaj",
            veri.mesaj || "Alerjen tercihleriniz kaydedildi.",
            true
        );

    } catch (error) {
        bildirimGoster("profil-mesaj", error.message);
    }
});

// Yönetici seçeneklerini getir
async function adminSecenekleriniGetir() {
    const veri = await apiIstegi("/admin/secenekler");

    menuSecenekleri = veri.secenekler;

    const secenekler = menuSecenekleri;

    const yemekhaneAlanlari = [
        "admin-yemekhane",
        "gunluk-yemekhane",
        "haftalik-yemekhane"
    ];

    yemekhaneAlanlari.forEach(id => {
        const alan = document.getElementById(id);

        if (id === "admin-yemekhane") {
            alan.innerHTML = '<option value="">Yemekhane seçiniz</option>';
        }

        secenekler.yemekhaneler.forEach(y => {
            if (!Array.from(alan.options).some(o => o.value == y.id)) {
                alan.innerHTML += `
                    <option value="${y.id}">
                        ${guvenliMetin(y.ad)}
                    </option>
                `;
            }
        });
    });

    const ogunAlanlari = ["admin-ogun", "gunluk-ogun"];

    ogunAlanlari.forEach(id => {
        const alan = document.getElementById(id);

        if (id === "admin-ogun") {
            alan.innerHTML = '<option value="">Öğün seçiniz</option>';
        }

        secenekler.ogunler.forEach(o => {
            if (!Array.from(alan.options).some(secim => secim.value == o.id)) {
                alan.innerHTML += `
                    <option value="${o.id}">
                        ${guvenliMetin(o.ad)}
                    </option>
                `;
            }
        });
    });

    const yemekAlan = document.getElementById("admin-yemekler");

    yemekAlan.innerHTML = "";

    secenekler.yemekler.forEach(yemek => {
        yemekAlan.innerHTML += `
            <option value="${yemek.id}">
                ${guvenliMetin(yemek.ad)}
                (${guvenliMetin(yemek.kategori)})
            </option>
        `;
    });
}

// Yönetici raporlarını getir
async function adminRaporlariniGetir() {
    const veri = await apiIstegi("/admin/raporlar");

    const menuler = veri.menuler || [];

    const liste = document.getElementById("admin-rapor-listesi");

    if (menuler.length === 0) {
        liste.innerHTML = `
            <tr><td colspan="11">Menü kaydı bulunamadı.</td></tr>
        `;
        return;
    }

    liste.innerHTML = menuler.map(menu => `
        <tr>
            <td>${menu.menu_id}</td>
            <td>${tarihBicimi(menu.tarih)}</td>
            <td>${guvenliMetin(menu.yemekhane)}</td>
            <td>${guvenliMetin(menu.ogun)}</td>
            <td>${menu.kapasite}</td>
            <td>${menu.rezerve}</td>
            <td>${menu.bos_yer}</td>
            <td>%${menu.doluluk_yuzde}</td>
            <td>${menu.oy_sayisi || 0}</td>
            <td>${menu.ortalama_puan ?? "-"}</td>
            <td>
                <button
                    class="dugme menu-duzenle"
                    data-id="${menu.menu_id}"
                >
                    Düzenle
                </button>
            </td>
        </tr>
    `).join("");

    document.querySelectorAll(".menu-duzenle").forEach(dugme => {
        dugme.addEventListener("click", function() {
            menuDuzenlemeAlanlariniDoldur(
                Number(this.dataset.id),
                menuler
            );
        });
    });
}

// Menü düzenleme alanlarını doldur
function menuDuzenlemeAlanlariniDoldur(menuId, menuler) {
    const menu = menuler.find(
        m => Number(m.menu_id) === menuId
    );

    if (!menu) {
        alert("Menü bilgisi bulunamadı.");
        return;
    }

    document.getElementById("admin-menu-id").value = menuId;

    document.getElementById("admin-yemekhane").value =
        menu.yemekhane_id;

    document.getElementById("admin-tarih").value =
        tarihDegeri(menu.tarih);

    document.getElementById("admin-ogun").value =
        menu.ogun_id;

    document.getElementById("admin-ogrenci-fiyati").value =
        menu.ogrenci_fiyati;

    document.getElementById("admin-personel-fiyati").value =
        menu.personel_fiyati;

    const yemekIds = menu.yemek_ids
        ? String(menu.yemek_ids).split(",").map(Number)
        : [];

    const yemekAlan = document.getElementById("admin-yemekler");

    Array.from(yemekAlan.options).forEach(option => {
        option.selected = yemekIds.includes(Number(option.value));
    });

    document.getElementById("yonetici-paneli").scrollIntoView({
        behavior: "smooth"
    });

    alert("Menü bilgileri düzenleme formuna getirildi.");
}

// Menü oluşturma ve güncelleme
document.getElementById("admin-menu-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    const menuId = document.getElementById("admin-menu-id").value;

    const yemekIds = Array.from(
        document.getElementById("admin-yemekler").selectedOptions
    ).map(option => Number(option.value));

    const menu = {
        yemekhane_id: Number(document.getElementById("admin-yemekhane").value),
        tarih: document.getElementById("admin-tarih").value,
        ogun_id: Number(document.getElementById("admin-ogun").value),
        ogrenci_fiyati: Number(document.getElementById("admin-ogrenci-fiyati").value),
        personel_fiyati: Number(document.getElementById("admin-personel-fiyati").value),
        yemek_ids: yemekIds
    };

    if (
        !menu.yemekhane_id ||
        !menu.tarih ||
        !menu.ogun_id ||
        yemekIds.length === 0 ||
        menu.ogrenci_fiyati < 0 ||
        menu.personel_fiyati < 0
    ) {
        alert("Lütfen bütün menü bilgilerini doğru doldurunuz.");
        return;
    }

    try {
        const url = menuId
            ? "/admin/menu-guncelle/" + menuId
            : "/admin/menu-olustur";

        const veri = await apiIstegi(url, {
            method: menuId ? "PUT" : "POST",
            body: JSON.stringify(menu)
        });

        alert(veri.mesaj || "Menü işlemi tamamlandı.");

        this.reset();

        document.getElementById("admin-menu-id").value = "";

        await adminRaporlariniGetir();

    } catch (error) {
        alert(error.message);
    }
});

// Yönetici formunu temizle
document.getElementById("admin-form-temizle").addEventListener("click", function() {
    document.getElementById("admin-menu-form").reset();
    document.getElementById("admin-menu-id").value = "";
});

// Yönetici paneli
async function yoneticiPaneliniGetir() {
    await adminSecenekleriniGetir();
    await adminRaporlariniGetir();
}

// İlk yüklemede gerekli verileri getir
async function anaVerileriYukle() {
    tarihleriHazirla();

    // Alerjenleri önce yükle ki menüde uyarılar gösterilebilsin
    await profilBilgileriniYukle();

    await gununMenusunuGetir();

    if (kullanici.rol === "yonetici") {
        await adminSecenekleriniGetir();
    }
}

// Sayfa yenilendiğinde oturumu kontrol et
async function oturumuKontrolEt() {
    try {
        const veri = await apiIstegi("/auth/profil");

        kullanici = veri.kullanici;

        uygulamayiGoster();

        await anaVerileriYukle();

    } catch (error) {
        kullanici = null;
        girisEkraniniGoster();
    }
}

// İlk ekran
tarihleriHazirla();
oturumuKontrolEt();
