
// ==========================================
// ANA UYGULAMA MODÜLÜ
// ==========================================

const app = {
    // Durum değişkenleri
    currentUser: null,
    odemeler: [],
    gelirler: {},
    butce: {},
    filtre: 'hepsi',
    katFiltre: 'hepsi',
    arama: '',
    sekme: 'odemeler',
    secilenAy: null,
    editingId: null,
    secili: new Set(),
    gecmisSekme: 'aylik',
    secilenYil: null,

    /**
     * Uygulamayı başlat
     */
    async init() {
        this.secilenAy = utils.getAyKey(new Date());
        this.secilenYil = new Date().getFullYear();
        await this.loadData();
        this.render();
        lucide.createIcons();
    },

    /**
     * Verileri Firebase'den yükle
     */
    async loadData() {
        if (!this.currentUser) return;
        
        try {
            const data = await database.loadAllData(this.currentUser.uid);
            this.odemeler = data.odemeler;
            this.gelirler = data.gelirler;
            this.butce = data.butce;
        } catch (error) {
            utils.showMsg('Veriler yüklenemedi!', 'error');
        }
    },

    /**
     * Çıkış yap
     */
    async logout() {
        if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
            await auth.signOut();
        }
    },

    // ==========================================
    // GELİR VE BÜTÇE İŞLEMLERİ
    // ==========================================

    /**
     * Gelir al
     */
    getGelir(ay) {
        return this.gelirler[ay] || 0;
    },

    /**
     * Gelir kaydet
     */
    async setGelir(ay, gelir) {
        this.gelirler[ay] = parseFloat(gelir) || 0;
        await database.saveGelir(this.currentUser.uid, ay, this.gelirler[ay]);
        this.render();
        lucide.createIcons();
    },

    /**
     * Kategori bütçesini al
     */
    getKatButce(kategori) {
        return this.butce[kategori] || 0;
    },

    /**
     * Kategori bütçesini kaydet
     */
    async setKatButce(kategori, limit) {
        this.butce[kategori] = parseFloat(limit) || 0;
        await database.saveButce(this.currentUser.uid, kategori, this.butce[kategori]);
        this.render();
        lucide.createIcons();
    },

    // ==========================================
    // ÖDEME İŞLEMLERİ
    // ==========================================

    /**
     * Yeni ödeme modalını aç
     */
    openYeniOdemeModal() {
        document.getElementById('yeniOdemeModal').classList.add('active');
        lucide.createIcons();
    },

    /**
     * Yeni ödeme modalını kapat
     */
    closeYeniOdemeModal() {
        document.getElementById('yeniOdemeModal').classList.remove('active');
        document.getElementById('modalAciklama').value = '';
        document.getElementById('modalTutar').value = '';
        document.getElementById('modalVadeTarihi').value = '';
        document.getElementById('modalKategori').value = 'kira';
        document.getElementById('modalTekrarlar').checked = false;
    },

    /**
     * Modal'dan ödeme ekle
     */
    async odemeEkleModal() {
        const aciklama = document.getElementById('modalAciklama').value;
        const tutar = document.getElementById('modalTutar').value;
        const vadeTarihi = document.getElementById('modalVadeTarihi').value;
        const kategori = document.getElementById('modalKategori').value;
        const tekrarlar = document.getElementById('modalTekrarlar').checked;
        
        if (!aciklama || !tutar || !vadeTarihi) {
            utils.showMsg('Lütfen tüm alanları doldurun!', 'error');
            return;
        }
        
        const odeme = {
            id: Date.now().toString(),
            aciklama,
            tutar: parseFloat(tutar),
            vadeTarihi,
            tamamlandi: false,
            odemeTarihi: null,
            tekrarlar,
            kategori
        };
        
        this.odemeler.push(odeme);
        await database.saveOdeme(this.currentUser.uid, odeme);
        utils.showMsg('Ödeme eklendi!', 'success');
        this.closeYeniOdemeModal();
        this.render();
        lucide.createIcons();
    },

    /**
     * Düzenleme modalını aç
     */
    openEditModal(id) {
        const odeme = this.odemeler.find(o => o.id === id);
        if (!odeme) return;
        
        this.editingId = id;
        document.getElementById('editAciklama').value = odeme.aciklama;
        document.getElementById('editTutar').value = odeme.tutar;
        document.getElementById('editVadeTarihi').value = odeme.vadeTarihi;
        document.getElementById('editKategori').value = odeme.kategori || 'kira';
        document.getElementById('editTekrarlar').checked = odeme.tekrarlar;
        document.getElementById('editModal').classList.add('active');
        lucide.createIcons();
    },

    /**
     * Düzenleme modalını kapat
     */
    closeEditModal() {
        this.editingId = null;
        document.getElementById('editModal').classList.remove('active');
    },

    /**
     * Düzenlemeyi kaydet
     */
    async saveEdit() {
        if (!this.editingId) return;
        
        const aciklama = document.getElementById('editAciklama').value;
        const tutar = document.getElementById('editTutar').value;
        const vadeTarihi = document.getElementById('editVadeTarihi').value;
        const kategori = document.getElementById('editKategori').value;
        const tekrarlar = document.getElementById('editTekrarlar').checked;
        
        if (!aciklama || !tutar || !vadeTarihi) {
            utils.showMsg('Lütfen tüm alanları doldurun!', 'error');
            return;
        }
        
        this.odemeler = this.odemeler.map(o => {
            if (o.id === this.editingId) {
                return {
                    ...o,
                    aciklama,
                    tutar: parseFloat(tutar),
                    vadeTarihi,
                    kategori,
                    tekrarlar
                };
            }
            return o;
        });
        
        const guncellenenOdeme = this.odemeler.find(o => o.id === this.editingId);
        await database.saveOdeme(this.currentUser.uid, guncellenenOdeme);
        this.closeEditModal();
        utils.showMsg('Güncellendi!', 'success');
        this.render();
        lucide.createIcons();
    },

    /**
     * Ödeme sil
     */
    async odemeSil(id) {
        if (confirm('Silmek istediğinize emin misiniz?')) {
            this.odemeler = this.odemeler.filter(o => o.id !== id);
            await database.deleteOdeme(this.currentUser.uid, id);
            utils.showMsg('Silindi!', 'success');
            this.render();
            lucide.createIcons();
        }
    },

    /**
     * Ödeme tamamla/geri al
     */
    async odemeTamamla(id, silent = false) {
        const odeme = this.odemeler.find(o => o.id === id);
        if (!odeme) return;
        
        if (!odeme.tamamlandi && odeme.tekrarlar) {
            // Tekrarlayan ödeme - tamamla ve yeni ödeme oluştur
            const tamamlanan = {
                ...odeme,
                tamamlandi: true,
                odemeTarihi: new Date().toISOString()
            };
            const yeniOdeme = utils.sonrakiAy(odeme);
            
            this.odemeler = this.odemeler.map(o => o.id === id ? tamamlanan : o).concat(yeniOdeme);
            await database.saveOdeme(this.currentUser.uid, tamamlanan);
            await database.saveOdeme(this.currentUser.uid, yeniOdeme);
        } else {
            // Normal ödeme - durumu değiştir
            this.odemeler = this.odemeler.map(o => {
                if (o.id === id) {
                    return {
                        ...o,
                        tamamlandi: !o.tamamlandi,
                        odemeTarihi: !o.tamamlandi ? new Date().toISOString() : null
                    };
                }
                return o;
            });
            
            const guncellenenOdeme = this.odemeler.find(o => o.id === id);
            await database.saveOdeme(this.currentUser.uid, guncellenenOdeme);
        }
        
        if (!silent) {
            this.render();
            lucide.createIcons();
        }
    },

    /**
     * Tekrarı durdur
     */
    async tekrarDurdur(id) {
        this.odemeler = this.odemeler.map(o => 
            o.id === id ? { ...o, tekrarlar: false } : o
        );
        const guncellenenOdeme = this.odemeler.find(o => o.id === id);
        await database.saveOdeme(this.currentUser.uid, guncellenenOdeme);
        this.render();
        lucide.createIcons();
    },

    // ==========================================
    // TOPLU İŞLEMLER
    // ==========================================

    /**
     * Seçimi değiştir
     */
    toggleSecim(id) {
        if (this.secili.has(id)) {
            this.secili.delete(id);
        } else {
            this.secili.add(id);
        }
        this.render();
        lucide.createIcons();
    },

    /**
     * Tümünü seç/kaldır
     */
    tumunuSec() {
        const filtrelenenler = this.getFiltreli();
        if (this.secili.size === filtrelenenler.length) {
            this.secili.clear();
        } else {
            filtrelenenler.forEach(o => this.secili.add(o.id));
        }
        this.render();
        lucide.createIcons();
    },

    /**
     * Toplu tamamla
     */
    async topluTamamla() {
        if (this.secili.size === 0) {
            utils.showMsg('Lütfen seçim yapın!', 'error');
            return;
        }
        
        for (const id of this.secili) {
            await this.odemeTamamla(id, true);
        }
        
        this.secili.clear();
        utils.showMsg('Tamamlandı!', 'success');
        this.render();
        lucide.createIcons();
    },

    /**
     * Toplu sil
     */
    async topluSil() {
        if (this.secili.size === 0) {
            utils.showMsg('Lütfen seçim yapın!', 'error');
            return;
        }
        
        if (confirm(`${this.secili.size} ödeme silinecek. Emin misiniz?`)) {
            for (const id of this.secili) {
                await database.deleteOdeme(this.currentUser.uid, id);
            }
            
            this.odemeler = this.odemeler.filter(o => !this.secili.has(o.id));
            this.secili.clear();
            utils.showMsg('Silindi!', 'success');
            this.render();
            lucide.createIcons();
        }
    },

    // Devam edecek... (2. kısım render.js'de olacak)

    // ==========================================
    // VERİ FİLTRELEME VE HESAPLAMA
    // ==========================================

    /**
     * Bir aydaki giderleri al
     */
    getAyGider(ay) {
        return this.odemeler.filter(o => {
            if (!o.tamamlandi) return false;
            const tarih = o.odemeTarihi ? new Date(o.odemeTarihi) : new Date(o.vadeTarihi);
            return utils.getAyKey(tarih) === ay;
        });
    },

    /**
     * Kategori harcamasını hesapla
     */
    getKatHarca(kategori, ay = null) {
        const seciliAy = ay || utils.getBuAy();
        return this.getAyGider(seciliAy)
            .filter(o => o.kategori === kategori)
            .reduce((toplam, o) => toplam + o.tutar, 0);
    },

    /**
     * Bakiye hesapla
     */
    getBakiye(ay) {
        const gelir = this.getGelir(ay);
        const gider = this.getAyGider(ay).reduce((t, o) => t + o.tutar, 0);
        return gelir - gider;
    },

    /**
     * Tüm ayları listele
     */
    getTumAylar() {
        const aylar = new Set([utils.getBuAy()]);
        
        this.odemeler.forEach(o => {
            if (o.tamamlandi) {
                const tarih = o.odemeTarihi ? new Date(o.odemeTarihi) : new Date(o.vadeTarihi);
                aylar.add(utils.getAyKey(tarih));
            }
        });
        
        Object.keys(this.gelirler).forEach(ay => aylar.add(ay));
        
        return Array.from(aylar).sort((a, b) => b.localeCompare(a));
    },

    /**
     * Ödemeleri filtrele
     */
    getFiltreli() {
        return this.odemeler.filter(o => {
            // Kategori filtresi
            if (this.katFiltre !== 'hepsi' && o.kategori !== this.katFiltre) {
                return false;
            }
            
            // Arama filtresi
            if (this.arama && !o.aciklama.toLowerCase().includes(this.arama.toLowerCase())) {
                return false;
            }
            
            // Durum filtresi
            if (this.filtre === 'bekleyen') return !o.tamamlandi;
            if (this.filtre === 'tamamlanan') return o.tamamlandi;
            if (this.filtre === 'tekrarli') return o.tekrarlar && !o.tamamlandi;
            if (this.filtre === 'buay') return utils.buAyMi(o) && !o.tamamlandi;
            
            return true;
        }).sort((a, b) => new Date(a.vadeTarihi) - new Date(b.vadeTarihi));
    },

    /**
     * Bu ay ödemelerini al
     */
    getBuAyOdemeler() {
        return this.odemeler.filter(o => utils.buAyMi(o) && !o.tamamlandi);
    },

    /**
     * İstatistikleri hesapla
     */
    getStats() {
        const bekleyenler = this.odemeler.filter(o => !o.tamamlandi);
        const tekrarlilar = bekleyenler.filter(o => o.tekrarlar);
        const buAyOdemeler = this.getBuAyOdemeler();
        
        return {
            buAyAdet: buAyOdemeler.length,
            buAyToplam: buAyOdemeler.reduce((t, o) => t + o.tutar, 0),
            toplamBekleyen: bekleyenler.reduce((t, o) => t + o.tutar, 0),
            tekrarliAdet: tekrarlilar.length,
            tekrarliToplam: tekrarlilar.reduce((t, o) => t + o.tutar, 0)
        };
    },

    /**
     * Aylık geçmişi hazırla
     */
    getAylikGec() {
        const aylar = {};
        
        this.odemeler.forEach(o => {
            if (!o.tamamlandi) return;
            
            const tarih = o.odemeTarihi ? new Date(o.odemeTarihi) : new Date(o.vadeTarihi);
            const ayKey = utils.getAyKey(tarih);
            
            if (!aylar[ayKey]) {
                aylar[ayKey] = {
                    ay: tarih.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }),
                    toplam: 0,
                    adet: 0,
                    odemeler: []
                };
            }
            
            aylar[ayKey].toplam += o.tutar;
            aylar[ayKey].adet += 1;
            aylar[ayKey].odemeler.push(o);
        });
        
        return Object.entries(aylar)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .map(item => item[1]);
    },

    /**
     * Yıllık geçmişi hazırla
     */
    getYillikGec() {
        const yillar = {};
        
        // Ödemeleri yıllara göre grupla
        this.odemeler.forEach(o => {
            if (!o.tamamlandi) return;
            
            const tarih = o.odemeTarihi ? new Date(o.odemeTarihi) : new Date(o.vadeTarihi);
            const yil = tarih.getFullYear();
            const ayKey = utils.getAyKey(tarih);
            
            if (!yillar[yil]) {
                yillar[yil] = {
                    yil,
                    aylar: {},
                    toplamGelir: 0,
                    toplamGider: 0,
                    toplamBakiye: 0
                };
            }
            
            if (!yillar[yil].aylar[ayKey]) {
                yillar[yil].aylar[ayKey] = {
                    ay: tarih.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }),
                    gelir: this.getGelir(ayKey),
                    gider: 0,
                    bakiye: 0,
                    adet: 0
                };
            }
            
            yillar[yil].aylar[ayKey].gider += o.tutar;
            yillar[yil].aylar[ayKey].adet += 1;
        });
        
        // Gelirleri ekle
        Object.keys(this.gelirler).forEach(ayKey => {
            const [yilStr] = ayKey.split('-');
            const yil = parseInt(yilStr);
            
            if (!yillar[yil]) {
                yillar[yil] = {
                    yil,
                    aylar: {},
                    toplamGelir: 0,
                    toplamGider: 0,
                    toplamBakiye: 0
                };
            }
            
            if (!yillar[yil].aylar[ayKey]) {
                const [y, m] = ayKey.split('-');
                yillar[yil].aylar[ayKey] = {
                    ay: new Date(y, m - 1, 1).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' }),
                    gelir: this.getGelir(ayKey),
                    gider: 0,
                    bakiye: 0,
                    adet: 0
                };
            } else {
                yillar[yil].aylar[ayKey].gelir = this.getGelir(ayKey);
            }
        });
        
        // Bakiyeleri hesapla
        Object.keys(yillar).forEach(yil => {
            const aylarArr = Object.keys(yillar[yil].aylar).sort((a, b) => a.localeCompare(b));
            
            aylarArr.forEach(ayKey => {
                const ay = yillar[yil].aylar[ayKey];
                ay.bakiye = ay.gelir - ay.gider;
                yillar[yil].toplamGelir += ay.gelir;
                yillar[yil].toplamGider += ay.gider;
            });
            
            yillar[yil].toplamBakiye = yillar[yil].toplamGelir - yillar[yil].toplamGider;
            yillar[yil].aylarArr = aylarArr.map(k => yillar[yil].aylar[k]);
        });
        
        return Object.values(yillar).sort((a, b) => b.yil - a.yil);
    },

    // ==========================================
    // NAVİGASYON VE FİLTRE İŞLEMLERİ
    // ==========================================

    /**
     * Sekme değiştir
     */
    setSekme(sekme) {
        this.sekme = sekme;
        if (sekme === 'bakiye') {
            this.secilenAy = utils.getBuAy();
        }
        
        // Mobil navigasyon güncelle
        ['mobNav1', 'mobNav2', 'mobNav3', 'mobNav4'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.classList.remove('bg-indigo-600', 'text-white');
        });
        
        const navMap = {
            odemeler: 'mobNav1',
            bakiye: 'mobNav2',
            kategoriler: 'mobNav3',
            gecmis: 'mobNav4'
        };
        
        const aktifBtn = document.getElementById(navMap[sekme]);
        if (aktifBtn) aktifBtn.classList.add('bg-indigo-600', 'text-white');
        
        this.render();
        lucide.createIcons();
    },

    /**
     * Filtre değiştir
     */
    setFiltre(filtre) {
        this.filtre = filtre;
        this.render();
        lucide.createIcons();
    },

    /**
     * Kategori filtresi değiştir
     */
    setKatFiltre(kategori) {
        this.katFiltre = kategori;
        this.render();
        lucide.createIcons();
    },

    /**
     * Arama metnini değiştir
     */
    setArama(metin) {
        this.arama = metin;
        this.render();
        lucide.createIcons();
    },

    /**
     * Geçmiş sekmesini değiştir
     */
    setGecmisSekme(sekme) {
        this.gecmisSekme = sekme;
        this.render();
        lucide.createIcons();
    },

    /**
     * Önceki aya git
     */
    oncekiAy() {
        const [yil, ay] = this.secilenAy.split('-');
        const tarih = new Date(yil, ay - 1, 1);
        tarih.setMonth(tarih.getMonth() - 1);
        this.secilenAy = utils.getAyKey(tarih);
        this.render();
        lucide.createIcons();
    },

    /**
     * Sonraki aya git
     */
    sonrakiAyNav() {
        const [yil, ay] = this.secilenAy.split('-');
        const tarih = new Date(yil, ay - 1, 1);
        tarih.setMonth(tarih.getMonth() + 1);
        const buAy = utils.getBuAy();
        
        if (utils.getAyKey(tarih) <= buAy) {
            this.secilenAy = utils.getAyKey(tarih);
            this.render();
            lucide.createIcons();
        }
    },

    // render() fonksiyonu render.js dosyasında olacak
};

