
// ==========================================
// RENDER (EKRAN ÇİZİMİ) MODÜLÜ
// ==========================================

/**
 * Ana render fonksiyonu - tüm ekranı çizer
 */
app.render = function() {
    const stats = this.getStats();
    const filtreli = this.getFiltreli();
    
    let html = '';
    
    // Header
    html += this.renderHeader();
    
    // Sekme Navigasyonu (Desktop)
    html += this.renderSekmeNav();
    
    // İçerik
    if (this.sekme === 'odemeler') {
        html += this.renderOdemeler(stats, filtreli);
    } else if (this.sekme === 'bakiye') {
        html += this.renderBakiye();
    } else if (this.sekme === 'kategoriler') {
        html += this.renderKategoriler();
    } else if (this.sekme === 'gecmis') {
        html += this.renderGecmis();
    }
    
    document.getElementById('app').innerHTML = html;
    this.initializeSelectBoxes();
    this.attachEventListeners();
    lucide.createIcons();
};

/**
 * Header render
 */
app.renderHeader = function() {
    return `
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div class="flex items-center justify-between">
                <div>
                    <h1 class="text-3xl font-bold text-gray-800 mb-2">
                        <i data-lucide="dollar-sign"></i> Ödeme Takip
                    </h1>
                    <p class="text-gray-600">${this.currentUser ? this.currentUser.email : ''}</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="app.logout()" class="p-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200" title="Çıkış Yap">
                        <i data-lucide="log-out" style="width:20px"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
};

/**
 * Sekme navigasyonu render
 */
app.renderSekmeNav = function() {
    const sekmeler = [
        ['odemeler', 'calendar', 'Ödemeler'],
        ['bakiye', 'wallet', 'Bakiye'],
        ['kategoriler', 'tag', 'Kategoriler'],
        ['gecmis', 'filter', 'Geçmiş']
    ];
    
    let html = '<div class="bg-white rounded-2xl shadow-lg p-4 mb-6 hidden md:block"><div class="flex gap-2 flex-wrap">';
    
    sekmeler.forEach(([id, icon, label]) => {
        const aktif = this.sekme === id;
        html += `
            <button onclick="app.setSekme('${id}')" 
                    class="px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${aktif ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}">
                <i data-lucide="${icon}" style="width:20px"></i> ${label}
            </button>
        `;
    });
    
    html += '</div></div>';
    return html;
};

/**
 * Ödemeler sekmesi render
 */
app.renderOdemeler = function(stats, filtreli) {
    let html = '';
    
    // İstatistikler
    html += `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-white rounded-xl shadow p-4">
                <p class="text-sm text-gray-600">Bu Ay</p>
                <p class="text-2xl font-bold text-indigo-600">${stats.buAyAdet}</p>
            </div>
            <div class="bg-white rounded-xl shadow p-4">
                <p class="text-sm text-gray-600">Bu Ay Tutar</p>
                <p class="text-2xl font-bold text-green-600">${stats.buAyToplam.toLocaleString('tr-TR')} ₺</p>
            </div>
            <div class="bg-white rounded-xl shadow p-4">
                <p class="text-sm text-gray-600">Toplam Bekleyen</p>
                <p class="text-2xl font-bold text-orange-600">${stats.toplamBekleyen.toLocaleString('tr-TR')} ₺</p>
            </div>
            <div class="bg-white rounded-xl shadow p-4 border-2 border-purple-200">
                <p class="text-sm text-gray-600"><i data-lucide="refresh-cw" style="width:14px"></i> Tekrarlı</p>
                <p class="text-2xl font-bold text-purple-600">${stats.tekrarliAdet} adet</p>
                <p class="text-sm text-purple-600">${stats.tekrarliToplam.toLocaleString('tr-TR')} ₺/ay</p>
            </div>
        </div>
    `;
    
    // Yeni ödeme butonu
    html += `
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div class="flex items-center justify-between mb-4">
                <h2 class="text-xl font-bold text-gray-800">Yeni Ödeme Ekle</h2>
                <button onclick="app.openYeniOdemeModal()" class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition">
                    <i data-lucide="plus-circle" style="width:20px"></i> Ödeme Ekle
                </button>
            </div>
            <p class="text-sm text-gray-600">Yeni bir ödeme eklemek için yukarıdaki butona tıklayın</p>
        </div>
    `;
    
    // Filtreler
    html += this.renderFiltreler();
    
    // Toplu işlem butonları
    if (this.secili.size > 0) {
        html += `
            <div class="bg-indigo-50 border-2 border-indigo-300 rounded-xl p-4 mb-6">
                <div class="flex items-center justify-between flex-wrap gap-3">
                    <span class="font-semibold">${this.secili.size} seçildi</span>
                    <div class="flex gap-2">
                        <button onclick="app.topluTamamla()" class="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2">
                            <i data-lucide="check-circle" style="width:18px"></i> Toplu Tamamla
                        </button>
                        <button onclick="app.topluSil()" class="px-4 py-2 bg-red-600 text-white rounded-lg flex items-center gap-2">
                            <i data-lucide="trash-2" style="width:18px"></i> Toplu Sil
                        </button>
                        <button onclick="app.secili.clear(); app.render(); lucide.createIcons();" class="px-4 py-2 bg-gray-600 text-white rounded-lg">İptal</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Ödeme listesi
    if (filtreli.length === 0) {
        html += `
            <div class="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500">
                <i data-lucide="alert-circle" style="width:48px" class="mx-auto mb-4"></i>
                <p class="text-lg">Ödeme bulunamadı</p>
            </div>
        `;
    } else {
        html += `<button onclick="app.tumunuSec()" class="w-full md:w-auto px-4 py-2 bg-gray-200 rounded-lg mb-4">${this.secili.size ? 'Seçimi Kaldır' : 'Tümünü Seç'}</button>`;
        html += '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';
        html += filtreli.map(o => this.renderOdemeCard(o)).join('');
        html += '</div>';
    }
    
    return html;
};

/**
 * Filtreler render
 */
app.renderFiltreler = function() {
    let html = '<div class="bg-white rounded-2xl shadow-lg p-4 mb-6">';
    html += '<div class="mb-4"><input type="text" id="aramaInput" placeholder="Ara..." value="' + this.arama + '" class="w-full border-2 rounded-lg px-4 py-2"></div>';
    
    // Durum filtreleri
    html += '<div class="flex gap-2 flex-wrap mb-3"><span class="text-sm font-semibold py-2">Durum:</span>';
    const filtreler = [
        ['hepsi', this.odemeler.length],
        ['bekleyen', this.odemeler.filter(o => !o.tamamlandi).length],
        ['buay', this.getBuAyOdemeler().length],
        ['tekrarli', this.odemeler.filter(o => o.tekrarlar && !o.tamamlandi).length],
        ['tamamlanan', this.odemeler.filter(o => o.tamamlandi).length]
    ];
    const renkler = { hepsi: 'indigo', bekleyen: 'orange', buay: 'blue', tekrarli: 'purple', tamamlanan: 'green' };
    
    filtreler.forEach(([f, count]) => {
        const aktif = this.filtre === f;
        const icon = f === 'buay' ? 'calendar-check' : f === 'tekrarli' ? 'refresh-cw' : '';
        html += `
            <button onclick="app.setFiltre('${f}')" class="px-4 py-2 rounded-lg text-sm ${aktif ? `bg-${renkler[f]}-600 text-white` : 'bg-gray-100 text-gray-700'}">
                ${icon ? `<i data-lucide="${icon}" style="width:16px"></i> ` : ''}
                ${f.charAt(0).toUpperCase() + f.slice(1)} (${count})
            </button>
        `;
    });
    html += '</div>';
    
    // Kategori filtreleri
    html += '<div class="flex gap-2 flex-wrap"><span class="text-sm font-semibold py-2">Kategori:</span>';
    html += `<button onclick="app.setKatFiltre('hepsi')" class="px-3 py-1 rounded-lg text-sm ${this.katFiltre === 'hepsi' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}">Tümü</button>`;
    
    KATS.forEach(k => {
        const aktif = this.katFiltre === k.id;
        html += `
            <button onclick="app.setKatFiltre('${k.id}')" class="px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${aktif ? k.renk + ' text-white' : 'bg-gray-100'}">
                <i data-lucide="${k.icon}" style="width:14px"></i> ${k.isim}
            </button>
        `;
    });
    html += '</div></div>';
    
    return html;
};

/**
 * Tek ödeme kartı render
 */
app.renderOdemeCard = function(odeme) {
    const durum = utils.durum(odeme.vadeTarihi, odeme.tamamlandi);
    const durumText = utils.durumText(odeme.vadeTarihi, odeme.tamamlandi);
    const durumRenk = utils.durumRenk(durum);
    const kategori = KATS.find(k => k.id === odeme.kategori);
    const secili = this.secili.has(odeme.id);
    
    return `
        <div class="grid-card ${durumRenk} border-2 rounded-xl p-4 shadow ${odeme.tekrarlar && !odeme.tamamlandi ? 'ring-2 ring-purple-300' : ''} ${secili ? 'ring-4 ring-indigo-400' : ''}">
            <div class="flex items-start gap-2 mb-3">
                <input type="checkbox" ${secili ? 'checked' : ''} onchange="app.toggleSecim('${odeme.id}')" class="mt-1 w-5 h-5 cursor-pointer flex-shrink-0">
                <div class="flex-1 min-w-0">
                    <h3 class="text-base font-semibold mb-1 ${odeme.tamamlandi ? 'line-through text-gray-500' : 'text-gray-800'}">${odeme.aciklama}</h3>
                    <div class="flex flex-wrap gap-1 mb-2">
                        ${kategori ? `<span class="text-xs ${kategori.renk} text-white px-2 py-1 rounded-full flex items-center gap-1"><i data-lucide="${kategori.icon}" style="width:10px"></i> ${kategori.isim}</span>` : ''}
                        ${odeme.tekrarlar && !odeme.tamamlandi ? '<span class="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full flex items-center gap-1"><i data-lucide="refresh-cw" style="width:10px"></i> Tekrarlı</span>' : ''}
                    </div>
                    <p class="text-2xl font-bold text-indigo-600 mb-2">${odeme.tutar.toLocaleString('tr-TR')} ₺</p>
                    <div class="text-sm text-gray-600 space-y-1">
                        <p><i data-lucide="calendar" style="width:12px" class="inline"></i> ${new Date(odeme.vadeTarihi).toLocaleDateString('tr-TR')}</p>
                        <p class="font-medium ${durum === 'gecmis' ? 'text-red-600' : durum === 'acil' ? 'text-orange-600' : ''}">${durumText}</p>
                    </div>
                </div>
            </div>
            <div class="flex flex-col gap-2 mt-3">
                <button onclick="app.openEditModal('${odeme.id}')" class="w-full p-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition flex items-center justify-center gap-2">
                    <i data-lucide="edit" style="width:16px"></i> Düzenle
                </button>
                ${odeme.tekrarlar && !odeme.tamamlandi ? `
                    <button onclick="app.tekrarDurdur('${odeme.id}')" class="w-full p-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 transition flex items-center justify-center gap-2">
                        <i data-lucide="x-circle" style="width:16px"></i> Tekrarı Durdur
                    </button>
                ` : ''}
                <button onclick="app.odemeTamamla('${odeme.id}')" class="w-full p-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${odeme.tamamlandi ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 hover:bg-gray-300'}">
                    <i data-lucide="check-circle" style="width:16px"></i> ${odeme.tamamlandi ? 'Ödendi' : 'Tamamla'}
                </button>
                <button onclick="app.odemeSil('${odeme.id}')" class="w-full p-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition flex items-center justify-center gap-2">
                    <i data-lucide="trash-2" style="width:16px"></i> Sil
                </button>
            </div>
        </div>
    `;
};

/**
 * Bakiye sekmesi render (devam edecek...)
 */
app.renderBakiye = function() {
    const aylar = this.getTumAylar();
    const buAy = utils.getBuAy();
    const gelir = this.getGelir(buAy);
    const gider = this.getAyGider(buAy).reduce((t, o) => t + o.tutar, 0);
    const bakiye = gelir - gider;
    
    let html = '<div class="bg-white rounded-2xl shadow-lg p-6 mb-6">';
    html += `<div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-gray-800"><i data-lucide="wallet"></i> Bu Ay Bakiye</h2>
        <span class="text-sm text-gray-600">${utils.getAyIsim(buAy)}</span>
    </div>`;
    
    if (gelir === 0) {
        html += '<div class="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 mb-4"><p class="font-semibold text-yellow-800">Gelir girilmemiş</p></div>';
    }
    
    html += '<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">';
    html += `<div class="bg-green-50 rounded-xl p-4 border-2 border-green-200"><p class="text-sm text-green-700 mb-1">Gelir</p><p class="text-3xl font-bold text-green-700">${gelir.toLocaleString('tr-TR')} ₺</p></div>`;
    html += `<div class="bg-red-50 rounded-xl p-4 border-2 border-red-200"><p class="text-sm text-red-700 mb-1">Gider</p><p class="text-3xl font-bold text-red-700">${gider.toLocaleString('tr-TR')} ₺</p></div>`;
    html += `<div class="bg-indigo-50 rounded-xl p-4 border-2 ${bakiye < 0 ? 'border-red-400' : 'border-indigo-200'}"><p class="text-sm mb-1 ${bakiye < 0 ? 'text-red-700' : 'text-indigo-700'}">Bakiye</p><p class="text-3xl font-bold ${bakiye < 0 ? 'text-red-700' : 'text-indigo-700'}">${bakiye.toLocaleString('tr-TR')} ₺</p>${bakiye < 0 ? '<p class="text-xs text-red-600 mt-1 font-medium">Aşım!</p>' : ''}</div>`;
    html += '</div>';
    
    html += `<div class="bg-blue-50 rounded-xl p-4 border-2 border-blue-200"><label class="block text-sm font-semibold mb-2">Gelir Girin</label><div class="flex gap-3">
        <input type="number" id="buAyGelir" placeholder="Gelir" value="${gelir || ''}" class="flex-1 border-2 rounded-lg px-4 py-3 text-lg">
        <button onclick="app.setGelir('${buAy}', document.getElementById('buAyGelir').value)" class="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg"><i data-lucide="save" style="width:20px"></i> Kaydet</button>
    </div></div></div>`;
    
    // Tüm aylar özeti
    html += '<div class="bg-white rounded-2xl shadow-lg p-6"><h2 class="text-2xl font-bold text-gray-800 mb-4"><i data-lucide="bar-chart-2"></i> Tüm Aylar</h2><div class="space-y-3">';
    aylar.forEach(ay => {
        const g = this.getGelir(ay);
        const gid = this.getAyGider(ay);
        const topGid = gid.reduce((t, o) => t + o.tutar, 0);
        const bak = g - topGid;
        html += `<div class="p-4 rounded-xl border-2 ${bak < 0 ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'}">
            <div class="flex items-center justify-between mb-2"><span class="font-bold">${utils.getAyIsim(ay)}</span>
            <span class="font-bold text-lg ${bak < 0 ? 'text-red-700' : 'text-indigo-700'}">${bak.toLocaleString('tr-TR')} ₺</span></div>
            <div class="flex gap-4 text-sm">
            <span class="text-green-700">Gelir: ${g.toLocaleString('tr-TR')} ₺</span>
            <span class="text-red-700">Gider: ${topGid.toLocaleString('tr-TR')} ₺</span>
            <span class="text-gray-600">(${gid.length} ödeme)</span></div></div>`;
    });
    html += '</div></div>';
    
    return html;
};

/**
 * Kategoriler sekmesi render
 */
app.renderKategoriler = function() {
    const buAy = utils.getBuAy();
    let html = '<div class="bg-white rounded-2xl shadow-lg p-6 mb-6">';
    html += '<h2 class="text-2xl font-bold text-gray-800 mb-4"><i data-lucide="tag"></i> Kategori Yönetimi</h2>';
    html += '<p class="text-gray-600 mb-6">Her kategori için aylık bütçe limiti belirleyin</p>';
    html += '<div class="grid grid-cols-1 md:grid-cols-2 gap-4">';
    
    KATS.forEach(k => {
        const harcama = this.getKatHarca(k.id, buAy);
        const limit = this.getKatButce(k.id);
        const yuzde = limit > 0 ? (harcama / limit) * 100 : 0;
        const asim = harcama > limit && limit > 0;
        
        html += `<div class="bg-gray-50 rounded-xl p-4 border-2 ${asim ? 'border-red-400' : 'border-gray-200'}">`;
        html += `<div class="flex items-center justify-between mb-3">`;
        html += `<div class="flex items-center gap-2"><div class="w-10 h-10 ${k.renk} rounded-lg flex items-center justify-center">`;
        html += `<i data-lucide="${k.icon}" class="text-white" style="width:20px"></i></div>`;
        html += `<div><h3 class="font-bold text-gray-800">${k.isim}</h3>`;
        html += `<p class="text-xs text-gray-600">${this.odemeler.filter(o => o.kategori === k.id && !o.tamamlandi).length} bekleyen</p></div></div>`;
        if (asim) html += '<span class="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">Aşıldı!</span>';
        html += '</div><div class="mb-3">';
        html += `<div class="flex justify-between text-sm mb-1"><span class="text-gray-600">Harcanan</span>`;
        html += `<span class="font-bold ${asim ? 'text-red-600' : 'text-gray-800'}">${harcama.toLocaleString('tr-TR')} ₺</span></div>`;
        if (limit > 0) {
            html += `<div class="w-full bg-gray-200 rounded-full h-3">`;
            html += `<div class="${asim ? 'bg-red-500' : 'bg-green-500'} h-3 rounded-full transition-all" style="width: ${Math.min(yuzde, 100)}%"></div></div>`;
            html += `<div class="flex justify-between text-xs mt-1"><span class="text-gray-500">Limit: ${limit.toLocaleString('tr-TR')} ₺</span>`;
            html += `<span class="${asim ? 'text-red-600' : 'text-gray-600'}">${(limit - harcama).toLocaleString('tr-TR')} ₺ kaldı</span></div>`;
        }
        html += '</div><div class="flex gap-2">';
        html += `<input type="number" id="lim_${k.id}" placeholder="Limit" value="${limit || ''}" class="flex-1 text-sm border-2 rounded-lg px-3 py-2">`;
        html += `<button onclick="app.setKatButce('${k.id}', document.getElementById('lim_${k.id}').value)" class="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg">`;
        html += `<i data-lucide="save" style="width:16px"></i></button></div></div>`;
    });
    
    html += '</div></div>';
    return html;
};

/**
 * Geçmiş sekmesi render
 */
app.renderGecmis = function() {
    const aylikGec = this.getAylikGec();
    const yillikGec = this.getYillikGec();
    
    let html = '<div class="bg-white rounded-2xl shadow-lg p-4 mb-6"><div class="flex gap-2">';
    html += `<button onclick="app.setGecmisSekme('aylik')" class="px-6 py-3 rounded-lg font-medium ${this.gecmisSekme === 'aylik' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}">Aylık Geçmiş</button>`;
    html += `<button onclick="app.setGecmisSekme('yillik')" class="px-6 py-3 rounded-lg font-medium ${this.gecmisSekme === 'yillik' ? 'bg-indigo-600 text-white' : 'bg-gray-100'}">Yıllık Geçmiş</button>`;
    html += '</div></div>';
    
    if (this.gecmisSekme === 'aylik') {
        html += '<div class="space-y-4">';
        if (aylikGec.length === 0) {
            html += '<div class="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500"><i data-lucide="alert-circle" style="width:48px" class="mx-auto mb-4"></i><p class="text-lg">Tamamlanmış ödeme yok</p></div>';
        } else {
            aylikGec.forEach(ay => {
                html += `<div class="bg-white rounded-2xl shadow-lg p-6">`;
                html += `<div class="flex items-center justify-between mb-4 pb-4 border-b-2"><h2 class="text-2xl font-bold"><i data-lucide="calendar"></i> ${ay.ay}</h2>`;
                html += `<div class="text-right"><p class="text-sm text-gray-600">${ay.adet} Ödeme</p><p class="text-2xl font-bold text-indigo-600">${ay.toplam.toLocaleString('tr-TR')} ₺</p></div></div>`;
                html += '<div class="space-y-2">';
                ay.odemeler.forEach(o => {
                    const k = KATS.find(x => x.id === o.kategori);
                    html += '<div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">';
                    html += `<div><div class="flex items-center gap-2"><p class="font-medium">${o.aciklama}</p>`;
                    if (k) html += `<span class="text-xs ${k.renk} text-white px-2 py-1 rounded-full">${k.isim}</span>`;
                    if (o.tekrarlar) html += '<i data-lucide="refresh-cw" style="width:14px" class="text-purple-600"></i>';
                    html += `</div><p class="text-sm text-gray-600">Ödeme: ${o.odemeTarihi ? new Date(o.odemeTarihi).toLocaleDateString('tr-TR') : 'Bilinmiyor'}</p></div>`;
                    html += `<span class="font-bold text-lg">${o.tutar.toLocaleString('tr-TR')} ₺</span></div>`;
                });
                html += '</div></div>';
            });
        }
        html += '</div>';
    } else {
        html += '<div class="space-y-4">';
        if (yillikGec.length === 0) {
            html += '<div class="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500"><i data-lucide="alert-circle" style="width:48px" class="mx-auto mb-4"></i><p class="text-lg">Yıllık veri yok</p></div>';
        } else {
            yillikGec.forEach(yilData => {
                html += '<div class="bg-white rounded-2xl shadow-lg p-6">';
                html += `<div class="flex items-center justify-between mb-4 pb-4 border-b-2">`;
                html += `<h2 class="text-2xl font-bold"><i data-lucide="calendar"></i> ${yilData.yil}</h2>`;
                html += '<div class="grid grid-cols-3 gap-4 text-right">';
                html += `<div><p class="text-xs text-green-700">Toplam Gelir</p><p class="text-lg font-bold text-green-700">${yilData.toplamGelir.toLocaleString('tr-TR')} ₺</p></div>`;
                html += `<div><p class="text-xs text-red-700">Toplam Gider</p><p class="text-lg font-bold text-red-700">${yilData.toplamGider.toLocaleString('tr-TR')} ₺</p></div>`;
                html += `<div><p class="text-xs ${yilData.toplamBakiye < 0 ? 'text-red-700' : 'text-indigo-700'}">Yıl Bakiye</p><p class="text-lg font-bold ${yilData.toplamBakiye < 0 ? 'text-red-700' : 'text-indigo-700'}">${yilData.toplamBakiye.toLocaleString('tr-TR')} ₺</p></div>`;
                html += '</div></div>';
                html += '<div class="space-y-2">';
                yilData.aylarArr.forEach(ay => {
                    html += `<div class="p-4 rounded-xl border-2 ${ay.bakiye < 0 ? 'bg-red-50 border-red-300' : 'bg-gray-50 border-gray-200'}">`;
                    html += `<div class="flex items-center justify-between mb-2">`;
                    html += `<span class="font-bold">${ay.ay}</span>`;
                    html += `<span class="font-bold text-lg ${ay.bakiye < 0 ? 'text-red-700' : 'text-indigo-700'}">${ay.bakiye.toLocaleString('tr-TR')} ₺</span>`;
                    html += '</div><div class="flex gap-4 text-sm">';
                    html += `<span class="text-green-700">Gelir: ${ay.gelir.toLocaleString('tr-TR')} ₺</span>`;
                    html += `<span class="text-red-700">Gider: ${ay.gider.toLocaleString('tr-TR')} ₺</span>`;
                    html += `<span class="text-gray-600">(${ay.adet} ödeme)</span></div></div>`;
                });
                html += '</div></div>';
            });
        }
        html += '</div>';
    }
    
    return html;
};

/**
 * Select box'ları başlat
 */
app.initializeSelectBoxes = function() {
    const modalKatSel = document.getElementById('modalKategori');
    if (modalKatSel) {
        modalKatSel.innerHTML = '';
        KATS.forEach(k => {
            const opt = document.createElement('option');
            opt.value = k.id;
            opt.textContent = k.isim;
            modalKatSel.appendChild(opt);
        });
    }
    
    const editKatSel = document.getElementById('editKategori');
    if (editKatSel) {
        editKatSel.innerHTML = '';
        KATS.forEach(k => {
            const opt = document.createElement('option');
            opt.value = k.id;
            opt.textContent = k.isim;
            editKatSel.appendChild(opt);
        });
    }
};

/**
 * Event listener'ları ekle
 */
app.attachEventListeners = function() {
    const aramaInput = document.getElementById('aramaInput');
    if (aramaInput && this.sekme === 'odemeler') {
        aramaInput.addEventListener('input', (e) => this.setArama(e.target.value));
    }
};
