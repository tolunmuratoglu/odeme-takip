
// ==========================================
// KİMLİK DOĞRULAMA (AUTH) MODÜLÜ
// ==========================================

const authApp = {
    /**
     * Giriş formunu göster
     */
    showLogin() {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginTab').classList.add('bg-indigo-600', 'text-white');
        document.getElementById('loginTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('registerTab').classList.remove('bg-indigo-600', 'text-white');
        document.getElementById('registerTab').classList.add('bg-gray-200', 'text-gray-700');
        this.hideMessages();
    },

    /**
     * Kayıt formunu göster
     */
    showRegister() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
        document.getElementById('registerTab').classList.add('bg-indigo-600', 'text-white');
        document.getElementById('registerTab').classList.remove('bg-gray-200', 'text-gray-700');
        document.getElementById('loginTab').classList.remove('bg-indigo-600', 'text-white');
        document.getElementById('loginTab').classList.add('bg-gray-200', 'text-gray-700');
        this.hideMessages();
    },

    /**
     * Hata mesajı göster
     */
    showError(msg) {
        const errorDiv = document.getElementById('authError');
        errorDiv.querySelector('p').textContent = msg;
        errorDiv.classList.remove('hidden');
        document.getElementById('authSuccess').classList.add('hidden');
    },

    /**
     * Başarı mesajı göster
     */
    showSuccess(msg) {
        const successDiv = document.getElementById('authSuccess');
        successDiv.querySelector('p').textContent = msg;
        successDiv.classList.remove('hidden');
        document.getElementById('authError').classList.add('hidden');
    },

    /**
     * Mesajları gizle
     */
    hideMessages() {
        document.getElementById('authError').classList.add('hidden');
        document.getElementById('authSuccess').classList.add('hidden');
    },

    /**
     * Email/Şifre ile giriş
     */
    async login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            this.showError('Lütfen tüm alanları doldurun!');
            return;
        }
        
        try {
            await auth.signInWithEmailAndPassword(email, password);
            this.showSuccess('Giriş başarılı!');
        } catch (error) {
            console.error('Login error:', error);
            if (error.code === 'auth/user-not-found') {
                this.showError('Bu email ile kayıtlı kullanıcı bulunamadı!');
            } else if (error.code === 'auth/wrong-password') {
                this.showError('Hatalı şifre!');
            } else if (error.code === 'auth/invalid-email') {
                this.showError('Geçersiz email!');
            } else {
                this.showError('Giriş yapılamadı!');
            }
        }
    },

    /**
     * Email/Şifre ile kayıt
     */
    async register() {
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const passwordConfirm = document.getElementById('registerPasswordConfirm').value;
        
        if (!email || !password || !passwordConfirm) {
            this.showError('Lütfen tüm alanları doldurun!');
            return;
        }
        
        if (password !== passwordConfirm) {
            this.showError('Şifreler eşleşmiyor!');
            return;
        }
        
        if (password.length < 6) {
            this.showError('Şifre en az 6 karakter olmalı!');
            return;
        }
        
        try {
            await auth.createUserWithEmailAndPassword(email, password);
            this.showSuccess('Kayıt başarılı!');
        } catch (error) {
            console.error('Register error:', error);
            if (error.code === 'auth/email-already-in-use') {
                this.showError('Bu email zaten kullanımda!');
            } else if (error.code === 'auth/invalid-email') {
                this.showError('Geçersiz email!');
            } else {
                this.showError('Kayıt olunamadı!');
            }
        }
    },

    /**
     * Google ile giriş
     */
    async googleLogin() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            await auth.signInWithPopup(provider);
            this.showSuccess('Google ile giriş başarılı!');
        } catch (error) {
            console.error('Google login error:', error);
            if (error.code === 'auth/popup-closed-by-user') {
                this.showError('Giriş penceresi kapatıldı!');
            } else if (error.code === 'auth/cancelled-popup-request') {
                // Kullanıcı iptal etti, sessizce geç
            } else {
                this.showError('Google ile giriş yapılamadı!');
            }
        }
    }
};

// Auth state değişikliğini dinle
auth.onAuthStateChanged((user) => {
    if (user) {
        // Kullanıcı giriş yaptı
        document.getElementById('authScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        app.currentUser = user;
        app.init();
    } else {
        // Kullanıcı çıkış yaptı
        document.getElementById('authScreen').style.display = 'flex';
        document.getElementById('mainApp').style.display = 'none';
    }
});
