
// ==========================================
// YARDIMCI FONKSİYONLAR MODÜLÜ
// ==========================================

const utils = {
    /**
     * Bildirim mesajı göster
     */
    showMsg(msg, type = 'info') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500'
        };
        
        const div = document.createElement('div');
        div.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in`;
        div.textContent = msg;
        document.body.appendChild(div);
        
        setTimeout(() => div.remove(), 3000);
    },

    /**
     * Tarihten ay anahtarı oluştur (YYYY-MM formatında)
     */
    getAyKey(tarih) {
        return tarih.getFullYear() + '-' + String(tarih.getMonth() + 1).padStart(2, '0');
    },

    /**
     * Ay anahtarından ay ismi al
     */
    getAyIsim(key) {
        const [y, m] = key.split('-');
        return new Date(y, m - 1, 1).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long'
        });
    },

    /**
     * Bugünün ay anahtarını al
     */
    getBuAy() {
        return this.getAyKey(new Date());
    },

    /**
     * Vade tarihine göre gün farkı hesapla
     */
    gunFark(vade) {
        const bugun = new Date();
        bugun.setHours(0, 0, 0, 0);
        const v = new Date(vade);
        v.setHours(0, 0, 0, 0);
        return Math.ceil((v - bugun) / 86400000);
    },

    /**
     * Ödeme durumunu belirle
     */
    durum(vade, tamamlandi) {
        if (tamamlandi) return 'tamamlandi';
        const fark = this.gunFark(vade);
        if (fark < 0) return 'gecmis';
        if (fark <= 3) return 'acil';
        if (fark <= 7) return 'yakin';
        return 'normal';
    },

    /**
     * Durum rengini al
     */
    durumRenk(durum) {
        const renkler = {
            gecmis: 'bg-red-50 border-red-300',
            acil: 'bg-orange-50 border-orange-300',
            yakin: 'bg-yellow-50 border-yellow-300',
            tamamlandi: 'bg-green-50 border-green-300'
        };
        return renkler[durum] || 'bg-white border-gray-200';
    },

    /**
     * Durum metnini al
     */
    durumText(vade, tamamlandi) {
        if (tamamlandi) return 'Ödendi ✓';
        const fark = this.gunFark(vade);
        if (fark < 0) return Math.abs(fark) + ' gün gecikmiş!';
        if (fark === 0) return 'BUGÜN!';
        if (fark === 1) return 'Yarın';
        return fark + ' gün kaldı';
    },

    /**
     * Ödemenin bu ay olup olmadığını kontrol et
     */
    buAyMi(odeme) {
        const bugun = new Date();
        const vade = new Date(odeme.vadeTarihi);
        return vade.getMonth() === bugun.getMonth() && 
               vade.getFullYear() === bugun.getFullYear();
    },

    /**
     * Sonraki ayın ödeme kaydını oluştur (tekrarlayan ödemeler için)
     */
    sonrakiAy(odeme) {
        const eski = new Date(odeme.vadeTarihi);
        const yeni = new Date(eski);
        yeni.setMonth(yeni.getMonth() + 1);
        
        // Ayın son günü kontrolü (örn: 31 Ocak -> 28 Şubat)
        if (yeni.getDate() !== eski.getDate()) {
            yeni.setDate(0);
        }
        
        return {
            id: Date.now().toString() + Math.random(),
            aciklama: odeme.aciklama,
            tutar: odeme.tutar,
            vadeTarihi: yeni.toISOString().split('T')[0],
            tamamlandi: false,
            odemeTarihi: null,
            tekrarlar: true,
            kategori: odeme.kategori
        };
    }
};
