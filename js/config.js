
// ==========================================
// FİREBASE YAPILANDIRMASI
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyCYqy0PZPUV23XIwcsS0sSRheIZpgqwn1s",
    authDomain: "odeme-takip-b34e1.firebaseapp.com",
    projectId: "odeme-takip-b34e1",
    storageBucket: "odeme-takip-b34e1.firebasestorage.app",
    messagingSenderId: "985345280614",
    appId: "1:985345280614:web:b27ab143ac17d987863ba7",
    measurementId: "G-DBR8GPCQJ1"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

// Firebase servislerini tanımla
const auth = firebase.auth();
const db = firebase.firestore();

// Kategoriler
const KATS = [
    { id: 'kira', isim: 'Kira', renk: 'bg-orange-500', icon: 'home' },
    { id: 'faturalar', isim: 'Faturalar', renk: 'bg-red-500', icon: 'zap' },
    { id: 'krediler', isim: 'Krediler', renk: 'bg-purple-500', icon: 'trending-down' },
    { id: 'kredikarti', isim: 'Kredi Kartı', renk: 'bg-pink-500', icon: 'credit-card' },
    { id: 'okul', isim: 'Okul', renk: 'bg-blue-500', icon: 'book' },
    { id: 'birikim', isim: 'Birikim', renk: 'bg-green-500', icon: 'piggy-bank' },
    { id: 'diger', isim: 'Diğer', renk: 'bg-gray-500', icon: 'more-horizontal' }
];
