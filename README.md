# Yemekhane Otomasyonu

Web Teknolojileri dersi dönem ödevi için geliştirilmiş bir yemekhane otomasyonudur.

Proje dört aşamada hazırlanmıştır. Docker, MySQL, Node.js, Apache, Redis, HTML, CSS ve JavaScript kullanılmıştır.

## Kullanılan Teknolojiler

- HTML, CSS ve JavaScript
- Node.js ve Express
- Apache HTTP Server
- MySQL 8.4
- Redis 7.4
- Docker ve Docker Compose

## Projenin Mimarisi

Projede Web API + Frontend mimarisi kullanılmıştır.

Frontend tarafı HTML, CSS ve JavaScript ile hazırlanmıştır. JavaScript, `fetch` kullanarak API'ye istek gönderir.

Backend tarafında Node.js ve Express kullanılmıştır. Kodlar `routes`, `controllers` ve `models` olarak ayrılmıştır.

Veritabanı işlemlerinde iki MySQL sunucusu bulunmaktadır:

- `mysql-primary`: Yazma işlemleri
- `mysql-replica`: Okuma işlemleri

Redis, menü önbelleği ve kullanıcı oturumları için kullanılmaktadır.

Apache, arayüz dosyalarını sunar ve `/api/` isteklerini Node.js uygulamasına yönlendirir.

## Docker Servisleri

Projede altı servis bulunmaktadır:

1. `frontend`: Apache web sunucusu
2. `uygulama`: Node.js API
3. `mysql-primary`: Ana veritabanı
4. `mysql-replica`: Okuma veritabanı
5. `replica-setup`: Replikasyon kurulumu
6. `redis`: Önbellek ve oturum yönetimi

`replica-setup` kurulum tamamlandıktan sonra `Exited (0)` durumuna geçer. Bu normaldir.

## Kurulum

Bilgisayarda Docker Desktop ve Git kurulu olmalıdır.

Projeyi indirmek için:

```bash
git clone https://github.com/arda-kocaoglu/yemekhane-otomasyonu.git
cd yemekhane-otomasyonu
```

Projeyi başlatmak için:

```bash
docker compose up -d
```

Servislerin durumunu görmek için:

```bash
docker compose ps -a
```

İlk kurulumda MySQL ve replikasyon işlemleri nedeniyle biraz beklemek gerekebilir.

Uygulamayı tarayıcıdan açmak için:

http://localhost:8080

Kod değişikliklerinden sonra Docker imajlarını yeniden oluşturmak için:

```bash
docker compose up -d --build
```

## Test Kullanıcıları

Örnek verilerde bulunan bazı kullanıcılar:

| E-posta | Rol |
|---|---|
| leyla.arslan@kampus.edu.tr | Yönetici |
| murat.kaya@kampus.edu.tr | Personel |
| ayse.demir@ogr.kampus.edu.tr | Öğrenci |
| mehmet.yildiz@ogr.kampus.edu.tr | Öğrenci |

Örnek kullanıcıların şifresi:

`Yemek2026!`

## Uygulamanın Özellikleri

### 1. Giriş ve Çıkış

Kullanıcılar e-posta ve şifre ile giriş yapabilir. Şifreler bcrypt ile kontrol edilir.

Oturum bilgileri Redis üzerinde tutulur. Çıkış yapıldığında oturum silinir.

### 2. Günlük Menü

Kullanıcılar yemekhane ve öğün seçerek günlük menüyü görüntüleyebilir.

Yemeklerin kalorileri, vejetaryen bilgileri ve alerjenleri gösterilir.

### 3. Haftalık Menü ve Rezervasyon

Kullanıcılar haftalık menüleri görüntüleyebilir ve uygun menülere rezervasyon yapabilir.

Rezervasyon sırasında kapasite, son saat ve bakiye kontrolleri yapılır.

### 4. Rezervasyonlarım

Kullanıcılar rezervasyonlarını ve durumlarını görüntüleyebilir.

Süresi dolmamış aktif rezervasyonlar iptal edilebilir.

### 5. Bakiye İşlemleri

Kullanıcılar bakiyelerini ve bakiye hareketlerini görüntüleyebilir.

Bakiye yükleme işlemi yapılabilir.

### 6. Değerlendirme

Kullanıcılar kullandıkları menülere 1 ile 5 arasında puan verebilir ve yorum yazabilir.

### 7. Yönetici Paneli

Yönetici kullanıcılar menü oluşturma ve düzenleme işlemlerini yapabilir.

Menülerin doluluk ve ortalama puan bilgileri görüntülenebilir.

### 8. Yarım Porsiyon

Öğle ve akşam öğünlerinde tam veya yarım porsiyon seçilebilir.

Yarım porsiyonun ücreti tam porsiyon fiyatının %60'ıdır.

Kahvaltıda yalnızca tam porsiyon seçeneği bulunur.

### 9. Alerjen Tercihleri

Kullanıcılar profil ekranından alerjen tercihlerini kaydedebilir.

Seçilen alerjenleri içeren yemeklerde kırmızı uyarılar gösterilir.

## Veritabanı

Veritabanı dosyaları `db/init/` klasöründedir.

- `01_sema.sql`: Başlangıç tabloları, view'lar ve stored procedure'ler
- `02_ornek_veri.sql`: Örnek kullanıcı, yemek, menü ve rezervasyon verileri
- `04_degisiklik.sql`: Yarım porsiyon ve alerjen özellikleri için veritabanı değişiklikleri

Para hareketleri ve rezervasyon işlemlerinde aşağıdaki stored procedure'ler kullanılır:

- `sp_rezervasyon_yap`
- `sp_rezervasyon_iptal`
- `sp_bakiye_yukle`
- `sp_turnike_gecis`

Aşama 4 ile `sp_rezervasyon_yap` yarım porsiyon seçimini destekleyecek şekilde güncellenmiştir.

MySQL Primary üzerinde yapılan değişiklikler replikasyon yoluyla MySQL Replica'ya aktarılır.

## Redis

Redis iki amaçla kullanılmaktadır.

**Menü önbelleği:** Menü bilgileri `menu:{yemekhane_id}:{tarih}:{ogun_id}` biçimindeki anahtarlarla saklanır. Yönetici menüyü değiştirdiğinde ilgili önbellek temizlenir.

**Oturum yönetimi:** Kullanıcı oturumları `oturum:{token}` biçimindeki anahtarlarla tutulur. Oturum süresi 30 dakikadır ve istek geldikçe yenilenir.

## Klasör Yapısı

```text
apache/                 Apache yapılandırması
db/init/                SQL dosyaları
db/replica-setup.sh     Replikasyon kurulumu
frontend/               HTML, CSS ve JavaScript
uygulama/config/        MySQL ve Redis bağlantıları
uygulama/controllers/   API işlemleri
uygulama/middleware/    Yetkilendirme
uygulama/models/        Veritabanı işlemleri
uygulama/routes/        API yolları
uygulama/server.js      Node.js uygulaması
rapor/                  Aşama raporları
docker-compose.yml      Docker servisleri
README.md               Proje açıklaması
```

## Aşama Raporları

Her aşamanın raporu `rapor/` klasöründe bulunmaktadır:

- `asama-1.pdf`: Docker ve MySQL replikasyonu
- `asama-2.pdf`: Web API ve kullanıcı arayüzü
- `asama-3.pdf`: Redis önbelleği ve oturum yönetimi
- `asama-4.pdf`: Yarım porsiyon ve alerjen geliştirmeleri

Git üzerinde aşamaları göstermek için `asama-1`, `asama-2`, `asama-3` ve `asama-4` etiketleri kullanılmıştır.

## Veritabanı Hakkında Önemli Not

`db/init/` klasöründeki SQL dosyaları veritabanı ilk kez oluşturulurken otomatik çalışır.

Aşama 4 değişikliği mevcut bir veritabanına uygulanacaksa `04_degisiklik.sql` dosyası ayrıca çalıştırılmalıdır.

Veritabanını tamamen sıfırlamak için kullanılan `docker compose down -v` komutu bütün kayıtlı verileri siler. Bu nedenle yalnızca verilerin silinmesi istendiğinde kullanılmalıdır.

## Projeyi Durdurma

Container'ları ve kayıtlı verileri silmeden durdurmak için:

```bash
docker compose down
```

Tekrar başlatmak için:

```bash
docker compose up -d
```
