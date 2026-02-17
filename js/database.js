
// ==========================================
// VERİTABANI İŞLEMLERİ MODÜLÜ
// ==========================================

const database = {
    /**
     * Kullanıcının tüm verilerini yükle
     */
    async loadAllData(userId) {
        try {
            // Ödemeleri yükle
            const odemelerSnap = await db.collection('users').doc(userId).collection('odemeler').get();
            const odemeler = odemelerSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            
            // Gelirleri yükle
            const gelirlerSnap = await db.collection('users').doc(userId).collection('gelirler').get();
            const gelirler = {};
            gelirlerSnap.docs.forEach(doc => {
                gelirler[doc.id] = doc.data().tutar;
            });
            
            // Bütçeleri yükle
            const butceSnap = await db.collection('users').doc(userId).collection('butce').get();
            const butce = {};
            butceSnap.docs.forEach(doc => {
                butce[doc.id] = doc.data().limit;
            });
            
            return { odemeler, gelirler, butce };
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
            throw error;
        }
    },

    /**
     * Ödeme kaydet
     */
    async saveOdeme(userId, odeme) {
        try {
            await db.collection('users').doc(userId).collection('odemeler').doc(odeme.id).set(odeme);
        } catch (error) {
            console.error('Ödeme kaydetme hatası:', error);
            throw error;
        }
    },

    /**
     * Ödeme sil
     */
    async deleteOdeme(userId, odemeId) {
        try {
            await db.collection('users').doc(userId).collection('odemeler').doc(odemeId).delete();
        } catch (error) {
            console.error('Ödeme silme hatası:', error);
            throw error;
        }
    },

    /**
     * Gelir kaydet
     */
    async saveGelir(userId, ay, tutar) {
        try {
            await db.collection('users').doc(userId).collection('gelirler').doc(ay).set({ tutar });
        } catch (error) {
            console.error('Gelir kaydetme hatası:', error);
            throw error;
        }
    },

    /**
     * Bütçe kaydet
     */
    async saveButce(userId, kategori, limit) {
        try {
            await db.collection('users').doc(userId).collection('butce').doc(kategori).set({ limit });
        } catch (error) {
            console.error('Bütçe kaydetme hatası:', error);
            throw error;
        }
    }
};
