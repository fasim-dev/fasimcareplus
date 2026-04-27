// ============================================
// FASIMCARE+ - FIREBASE CONFIGURATION
// Version: 2.2.0 - FULL FEATURES WITH ADMIN PANEL
// ============================================

const firebaseConfig = {
    apiKey: "AIzaSyB0oSNtW_6rycfNYTKOIcObCny4qHikqmo",
    authDomain: "fasimcareplus.firebaseapp.com",
    projectId: "fasimcareplus",
    storageBucket: "fasimcareplus.firebasestorage.app",
    messagingSenderId: "899282265704",
    appId: "1:899282265704:web:1ed68485ea7792eb9dfddd",
    measurementId: "G-WX8DS5MPHT"
};

let db = null;
let auth = null;
let firebaseApp = null;
let isFirebaseInitialized = false;

// ==================== INITIALIZATION ====================
try {
    if (typeof firebase !== 'undefined' && firebase.apps) {
        if (firebase.apps.length === 0) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully');
        } else {
            firebaseApp = firebase.apps[0];
            console.log('✅ Firebase already initialized');
        }
        
        db = firebase.firestore();
        auth = firebase.auth();
        
        // Enable offline persistence
        if (db && db.enablePersistence) {
            db.enablePersistence({ synchronizeTabs: true })
                .then(() => console.log('✅ Firebase persistence enabled'))
                .catch((err) => {
                    if (err.code === 'failed-precondition') {
                        console.warn('⚠️ Persistence failed: multiple tabs open');
                    } else if (err.code === 'unimplemented') {
                        console.warn('⚠️ Persistence not supported by browser');
                    } else {
                        console.warn('⚠️ Persistence error:', err);
                    }
                });
        }
        
        isFirebaseInitialized = true;
        console.log('✅ Firebase services ready (Firestore + Auth)');
    } else {
        console.warn('⚠️ Firebase SDK not loaded, using local storage only');
        isFirebaseInitialized = false;
    }
} catch(e) {
    console.error('❌ Firebase init error:', e);
    isFirebaseInitialized = false;
}

// ==================== HELPER FUNCTIONS ====================
function generateUniqueId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    return `${timestamp}_${random}`;
}

function deduplicateData(arr) {
    if (!arr || !Array.isArray(arr)) return [];
    const seen = new Set();
    return arr.filter(item => {
        if (!item || !item.id) return true;
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return true;
    });
}

function isLocalUser(userId) {
    return userId && userId.startsWith('local_');
}

// ==================== CORE FIREBASE SERVICE ====================
const FirebaseService = {
    // Check if Firebase is ready
    isReady: () => db !== null && auth !== null && isFirebaseInitialized,
    
    // Get current status
    getStatus: () => ({ 
        isFirebaseReady: FirebaseService.isReady(), 
        mode: FirebaseService.isReady() ? 'online' : 'offline',
        isAuthenticated: auth && auth.currentUser ? true : false,
        currentUser: auth && auth.currentUser ? auth.currentUser.uid : null
    }),
    
    // Get current user from Firebase
    getCurrentUser: () => {
        if (!auth) return null;
        const user = auth.currentUser;
        if (!user) return null;
        return { 
            id: user.uid, 
            email: user.email, 
            name: user.displayName || 'Peternak',
            isAnonymous: user.isAnonymous || false
        };
    },
    
    // ==================== AUTHENTICATION ====================
    register: async function(email, password, name, farmName, farmType = 'mixed') {
        if (!this.isReady()) {
            // Fallback to local storage
            const localId = 'local_' + Date.now();
            const user = {
                id: localId,
                name: name,
                email: email,
                farmName: farmName || 'Kandang Saya',
                settings: { hargaTelurPerKg: 25000, hargaAyamPerKg: 30000, farmType: farmType },
                avatar: null,
                farmAddress: '',
                farmPhone: '',
                phone: '',
                address: '',
                isLocal: true,
                createdAt: new Date().toISOString()
            };
            localStorage.setItem('fasimcare_current_user', JSON.stringify(user));
            return { success: true, user, isLocal: true };
        }
        
        try {
            // Validation
            if (!email || !password || !name) {
                return { success: false, error: 'Semua field harus diisi' };
            }
            if (password.length < 6) {
                return { success: false, error: 'Password minimal 6 karakter' };
            }
            
            // Check if registration is allowed
            const settingsDoc = await db.collection('settings').doc('app_settings').get();
            const settings = settingsDoc.data() || {};
            if (settings.allowRegistration === false) {
                return { success: false, error: 'Pendaftaran ditutup sementara' };
            }
            
            // Create user
            const result = await auth.createUserWithEmailAndPassword(email, password);
            await result.user.updateProfile({ displayName: name });
            
            // Save user data to Firestore
            const userData = { 
                name: name,
                email: email, 
                farmName: farmName || 'Kandang Saya',
                farmType: farmType || 'mixed',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastActive: firebase.firestore.FieldValue.serverTimestamp(),
                settings: { 
                    hargaTelurPerKg: settings.defaultHargaTelur || 25000, 
                    hargaAyamPerKg: settings.defaultHargaAyam || 30000,
                    farmType: farmType || 'mixed',
                    satuanTelur: 'kg'
                },
                avatar: null,
                farmAddress: '',
                farmPhone: '',
                phone: '',
                address: ''
            };
            
            await db.collection('users').doc(result.user.uid).set(userData);
            
            // Return user object
            const user = { 
                id: result.user.uid,
                name: name,
                email: email, 
                farmName: farmName || 'Kandang Saya',
                settings: userData.settings,
                avatar: null,
                farmAddress: '',
                farmPhone: '',
                phone: '',
                address: '',
                isLocal: false,
                createdAt: new Date().toISOString()
            };
            
            // Save to localStorage for offline access
            localStorage.setItem('fasimcare_current_user', JSON.stringify(user));
            console.log('✅ User registered:', user.id);
            return { success: true, user, isLocal: false };
            
        } catch (error) {
            console.error('Register error:', error);
            let errorMessage = error.message;
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email sudah terdaftar';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password minimal 6 karakter';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Email tidak valid';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Periksa koneksi internet Anda';
            }
            return { success: false, error: errorMessage };
        }
    },
    
    login: async function(email, password) {
        if (!this.isReady()) {
            // Try local login
            const savedUser = localStorage.getItem('fasimcare_current_user');
            if (savedUser) {
                try {
                    const user = JSON.parse(savedUser);
                    if (user.email === email && user.isLocal) {
                        return { success: true, user, isLocal: true };
                    }
                } catch(e) {}
            }
            return { success: false, error: 'Koneksi ke server gagal. Periksa koneksi internet.' };
        }
        
        try {
            if (!email || !password) {
                return { success: false, error: 'Email dan password harus diisi' };
            }
            
            // Check maintenance mode
            const settingsDoc = await db.collection('settings').doc('app_settings').get();
            const settings = settingsDoc.data() || {};
            if (settings.maintenanceMode === true) {
                // Check if user is admin
                const isAdmin = await this.isAdmin();
                if (!isAdmin) {
                    return { success: false, error: 'Aplikasi sedang dalam maintenance. Coba lagi nanti.' };
                }
            }
            
            // Sign in
            const result = await auth.signInWithEmailAndPassword(email, password);
            
            // Get user data from Firestore
            const userDoc = await db.collection('users').doc(result.user.uid).get();
            const userData = userDoc.data() || {};
            
            // Update last active
            await db.collection('users').doc(result.user.uid).update({
                lastActive: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            const user = {
                id: result.user.uid,
                name: result.user.displayName || userData.name || 'Peternak',
                email: result.user.email,
                farmName: userData.farmName || 'Kandang Saya',
                settings: userData.settings || { hargaTelurPerKg: 25000, hargaAyamPerKg: 30000, farmType: 'mixed' },
                avatar: userData.avatar || null,
                farmAddress: userData.farmAddress || '',
                farmPhone: userData.farmPhone || '',
                phone: userData.phone || '',
                address: userData.address || '',
                isLocal: false,
                createdAt: userData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            };
            
            // Save to localStorage
            localStorage.setItem('fasimcare_current_user', JSON.stringify(user));
            console.log('✅ User logged in:', user.id);
            return { success: true, user, isLocal: false };
            
        } catch (error) {
            console.error('Login error:', error);
            let errorMessage = error.message;
            if (error.code === 'auth/user-not-found') {
                errorMessage = 'Email tidak ditemukan';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Password salah';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Email tidak valid';
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = 'Terlalu banyak percobaan. Coba lagi nanti';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Periksa koneksi internet Anda';
            }
            return { success: false, error: errorMessage };
        }
    },
    
    logout: async function() {
        if (auth && this.isReady()) {
            try {
                await auth.signOut();
                console.log('✅ User logged out from Firebase');
            } catch(e) {
                console.warn('Logout error:', e);
            }
        }
        localStorage.removeItem('fasimcare_current_user');
        return { success: true };
    },
    
    // ==================== ADMIN FUNCTIONS ====================
    isAdmin: async function() {
        if (!auth || !auth.currentUser || !this.isReady()) return false;
        try {
            const adminDoc = await db.collection('admins').doc(auth.currentUser.uid).get();
            return adminDoc.exists && adminDoc.data().isAdmin === true;
        } catch(e) {
            console.warn('Check admin error:', e);
            return false;
        }
    },
    
    getAdminInfo: async function() {
        if (!auth || !auth.currentUser || !this.isReady()) return null;
        try {
            const adminDoc = await db.collection('admins').doc(auth.currentUser.uid).get();
            if (adminDoc.exists && adminDoc.data().isAdmin) {
                return { id: auth.currentUser.uid, ...adminDoc.data() };
            }
            return null;
        } catch(e) {
            return null;
        }
    },
    
    // Get system settings
    getSystemSettings: async function() {
        if (!this.isReady()) {
            return {
                appName: 'FasimCare+',
                maintenanceMode: false,
                allowRegistration: true,
                defaultHargaTelur: 25000,
                defaultHargaAyam: 30000,
                contactEmail: 'support@fasimcare.com',
                contactWhatsapp: '6281234567890'
            };
        }
        
        try {
            const settingsDoc = await db.collection('settings').doc('app_settings').get();
            const settings = settingsDoc.data() || {};
            return {
                appName: settings.appName || 'FasimCare+',
                maintenanceMode: settings.maintenanceMode || false,
                allowRegistration: settings.allowRegistration !== false,
                defaultHargaTelur: settings.defaultHargaTelur || 25000,
                defaultHargaAyam: settings.defaultHargaAyam || 30000,
                contactEmail: settings.contactEmail || 'support@fasimcare.com',
                contactWhatsapp: settings.contactWhatsapp || '6281234567890',
                appVersion: settings.appVersion || '2.1.0'
            };
        } catch(e) {
            console.warn('Get settings error:', e);
            return {
                appName: 'FasimCare+',
                maintenanceMode: false,
                allowRegistration: true,
                defaultHargaTelur: 25000,
                defaultHargaAyam: 30000,
                contactEmail: 'support@fasimcare.com',
                contactWhatsapp: '6281234567890'
            };
        }
    },
    
    // Update system settings (admin only)
    updateSystemSettings: async function(settings) {
        if (!this.isReady() || !(await this.isAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        
        try {
            await db.collection('settings').doc('app_settings').set({
                ...settings,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedBy: auth.currentUser.uid
            }, { merge: true });
            return { success: true };
        } catch(e) {
            console.error('Update settings error:', e);
            return { success: false, error: e.message };
        }
    },
    
    // Get all announcements
    getAnnouncements: async function() {
        if (!this.isReady()) return [];
        
        try {
            const snapshot = await db.collection('announcements')
                .orderBy('createdAt', 'desc')
                .limit(20)
                .get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            }));
        } catch(e) {
            console.warn('Get announcements error:', e);
            return [];
        }
    },
    
    // Add announcement (admin only)
    addAnnouncement: async function(title, content, type = 'info') {
        if (!this.isReady() || !(await this.isAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        
        try {
            const announcement = {
                title,
                content,
                type,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                createdBy: auth.currentUser.uid,
                isActive: true
            };
            const docRef = await db.collection('announcements').add(announcement);
            return { success: true, id: docRef.id };
        } catch(e) {
            console.error('Add announcement error:', e);
            return { success: false, error: e.message };
        }
    },
    
    // Delete announcement (admin only)
    deleteAnnouncement: async function(announcementId) {
        if (!this.isReady() || !(await this.isAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        
        try {
            await db.collection('announcements').doc(announcementId).delete();
            return { success: true };
        } catch(e) {
            console.error('Delete announcement error:', e);
            return { success: false, error: e.message };
        }
    },
    
    // Get all users (admin only)
    getAllUsers: async function() {
        if (!this.isReady() || !(await this.isAdmin())) {
            return { success: false, error: 'Unauthorized', users: [] };
        }
        
        try {
            const snapshot = await db.collection('users').get();
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
                lastActive: doc.data().lastActive?.toDate?.()?.toISOString() || null
            }));
            return { success: true, users };
        } catch(e) {
            console.error('Get users error:', e);
            return { success: false, error: e.message, users: [] };
        }
    },
    
    // Delete user (admin only)
    deleteUser: async function(userId) {
        if (!this.isReady() || !(await this.isAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        
        try {
            // Delete user document
            await db.collection('users').doc(userId).delete();
            
            // Delete all farm data
            const farmDataSnapshot = await db.collection('farm_data')
                .where('userId', '==', userId)
                .get();
            
            const batch = db.batch();
            farmDataSnapshot.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            
            // Note: Cannot delete Auth user from client SDK
            // Need Firebase Admin SDK or manual deletion from console
            
            return { success: true };
        } catch(e) {
            console.error('Delete user error:', e);
            return { success: false, error: e.message };
        }
    },
    
    // Get dashboard stats (admin only)
    getDashboardStats: async function() {
        if (!this.isReady() || !(await this.isAdmin())) {
            return { success: false, error: 'Unauthorized', stats: null };
        }
        
        try {
            // Get users
            const usersSnapshot = await db.collection('users').get();
            const totalUsers = usersSnapshot.size;
            
            // Get farm data stats
            const farmDataSnapshot = await db.collection('farm_data').get();
            let totalKandang = 0;
            let totalTransaksi = 0;
            let totalPendapatan = 0;
            
            farmDataSnapshot.forEach(doc => {
                const data = doc.data().data;
                if (Array.isArray(data)) {
                    if (doc.id.includes('kandang')) {
                        totalKandang += data.length;
                    }
                    if (doc.id.includes('transaksi')) {
                        totalTransaksi += data.length;
                        totalPendapatan += data.reduce((sum, t) => sum + (t.totalBayar || 0), 0);
                    }
                }
            });
            
            // Count active users (last 7 days)
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            let activeUsers = 0;
            usersSnapshot.forEach(doc => {
                const lastActive = doc.data().lastActive?.toDate();
                if (lastActive && lastActive > sevenDaysAgo) {
                    activeUsers++;
                }
            });
            
            return {
                success: true,
                stats: {
                    totalUsers,
                    activeUsers,
                    totalKandang,
                    totalTransaksi,
                    totalPendapatan
                }
            };
        } catch(e) {
            console.error('Get stats error:', e);
            return { success: false, error: e.message, stats: null };
        }
    },
    
    // ==================== DATA MANAGEMENT ====================
    saveData: async function(userId, collection, data) {
        if (!userId) {
            console.warn(`Cannot save ${collection}: No user ID`);
            return { success: false, source: 'none', error: 'No user ID' };
        }
        
        // Always save to localStorage first
        let localSuccess = false;
        try {
            localStorage.setItem(`fasimcare_${userId}_${collection}`, JSON.stringify(data));
            localSuccess = true;
        } catch(e) {
            console.warn(`LocalStorage save error for ${collection}:`, e);
        }
        
        // If local user or offline, just return local success
        if (isLocalUser(userId) || !this.isReady() || !navigator.onLine) {
            return { success: localSuccess, source: 'local', synced: false };
        }
        
        // Try to save to cloud
        try {
            const docId = `${userId}_${collection}`;
            const docRef = db.collection('farm_data').doc(docId);
            
            await docRef.set({
                data: data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
                userId: userId,
                collection: collection,
                lastSynced: Date.now()
            }, { merge: true });
            
            console.log(`✅ Saved to cloud: ${collection} (${data?.length || 0} items)`);
            return { success: true, source: 'cloud', synced: true };
            
        } catch (error) {
            console.error(`Cloud save error for ${collection}:`, error);
            return { success: localSuccess, source: 'local', synced: false, error: error.message };
        }
    },
    
    loadData: async function(userId, collection, defaultValue = []) {
        if (!userId) {
            console.warn(`Cannot load ${collection}: No user ID`);
            return defaultValue;
        }
        
        // Try to load from localStorage first
        let localData = defaultValue;
        try {
            const localRaw = localStorage.getItem(`fasimcare_${userId}_${collection}`);
            if (localRaw) {
                const parsed = JSON.parse(localRaw);
                if (Array.isArray(parsed)) {
                    localData = deduplicateData(parsed);
                }
            }
        } catch(e) {
            console.warn(`Failed to parse local data for ${collection}:`, e);
        }
        
        // If local user or offline, return local data
        if (isLocalUser(userId) || !this.isReady() || !navigator.onLine) {
            console.log(`📱 Using local data for ${collection}: ${localData.length} items`);
            return localData;
        }
        
        // Try to load from cloud
        try {
            const docId = `${userId}_${collection}`;
            const doc = await db.collection('farm_data').doc(docId).get();
            
            if (doc.exists) {
                const cloudData = doc.data().data || [];
                if (cloudData.length > 0) {
                    const finalData = deduplicateData(cloudData);
                    // Update localStorage with cloud data
                    localStorage.setItem(`fasimcare_${userId}_${collection}`, JSON.stringify(finalData));
                    console.log(`✅ Loaded from cloud: ${collection} (${finalData.length} items)`);
                    return finalData;
                }
            }
            
            console.log(`📁 Using local data for ${collection}: ${localData.length} items`);
            return localData;
            
        } catch (error) {
            console.warn(`Load error for ${collection}:`, error);
            return localData;
        }
    },
    
    // Save user profile
    saveProfile: async function(userId, profile) {
        if (!userId) return false;
        
        // Save to localStorage
        try {
            localStorage.setItem('fasimcare_current_user', JSON.stringify(profile));
        } catch(e) {
            console.warn('LocalStorage profile save error:', e);
        }
        
        // If local user or offline, just return
        if (isLocalUser(userId) || !this.isReady() || !navigator.onLine) {
            return false;
        }
        
        // Save to cloud
        try {
            const { id, ...profileData } = profile;
            await db.collection('users').doc(userId).update({
                ...profileData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Profile saved to cloud');
            return true;
        } catch(e) {
            console.error('Save profile error:', e);
            return false;
        }
    },
    
    // Load user profile
    loadProfile: async function(userId) {
        if (!userId) return null;
        
        // Load from localStorage
        const localProfile = localStorage.getItem('fasimcare_current_user');
        let cachedProfile = null;
        if (localProfile) {
            try {
                cachedProfile = JSON.parse(localProfile);
            } catch(e) {
                console.warn('Parse local profile error:', e);
            }
        }
        
        // If local user or offline, return cached
        if (isLocalUser(userId) || !this.isReady() || !navigator.onLine) {
            return cachedProfile;
        }
        
        // Load from cloud
        try {
            const userDoc = await db.collection('users').doc(userId).get();
            if (userDoc.exists) {
                const profile = userDoc.data();
                const mergedProfile = {
                    id: userId,
                    name: profile.name || cachedProfile?.name || 'Peternak',
                    email: profile.email || cachedProfile?.email || '',
                    farmName: profile.farmName || cachedProfile?.farmName || 'Kandang Saya',
                    farmAddress: profile.farmAddress || cachedProfile?.farmAddress || '',
                    farmPhone: profile.farmPhone || cachedProfile?.farmPhone || '',
                    phone: profile.phone || cachedProfile?.phone || '',
                    address: profile.address || cachedProfile?.address || '',
                    avatar: profile.avatar || cachedProfile?.avatar || null,
                    settings: profile.settings || cachedProfile?.settings || { 
                        hargaTelurPerKg: 25000, 
                        hargaAyamPerKg: 30000,
                        farmType: profile.farmType || 'mixed'
                    },
                    isLocal: false,
                    createdAt: profile.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
                };
                localStorage.setItem('fasimcare_current_user', JSON.stringify(mergedProfile));
                console.log('✅ Profile loaded from cloud');
                return mergedProfile;
            }
        } catch(e) {
            console.error('Load profile error:', e);
        }
        
        return cachedProfile;
    },
    
    // ==================== BACKUP & RESTORE ====================
    backupAllData: async function() {
        if (!this.isReady() || !(await this.isAdmin())) {
            return { success: false, error: 'Unauthorized' };
        }
        
        try {
            // Get all users
            const usersSnapshot = await db.collection('users').get();
            const users = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
            }));
            
            // Get all announcements
            const announcementsSnapshot = await db.collection('announcements').get();
            const announcements = announcementsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null
            }));
            
            // Get settings
            const settingsDoc = await db.collection('settings').doc('app_settings').get();
            const settings = settingsDoc.exists ? settingsDoc.data() : null;
            
            // Get all farm data
            const farmDataSnapshot = await db.collection('farm_data').get();
            const farmData = {};
            farmDataSnapshot.forEach(doc => {
                farmData[doc.id] = doc.data();
            });
            
            const backup = {
                exportedAt: new Date().toISOString(),
                version: '2.2.0',
                users,
                announcements,
                settings,
                farmData
            };
            
            return { success: true, backup };
        } catch(e) {
            console.error('Backup error:', e);
            return { success: false, error: e.message };
        }
    },
    
    // Listen to auth state changes
    onAuthStateChanged: function(callback) {
        if (auth && this.isReady()) {
            const unsubscribe = auth.onAuthStateChanged(async (user) => {
                if (user) {
                    const profile = await this.loadProfile(user.uid);
                    callback(profile || {
                        id: user.uid,
                        name: user.displayName || 'Peternak',
                        email: user.email,
                        farmName: 'Kandang Saya',
                        settings: { hargaTelurPerKg: 25000, hargaAyamPerKg: 30000, farmType: 'mixed' },
                        farmAddress: '',
                        farmPhone: '',
                        phone: '',
                        address: '',
                        avatar: null,
                        isLocal: false
                    });
                } else {
                    callback(null);
                }
            });
            return unsubscribe;
        }
        
        // Fallback to localStorage
        const savedUser = localStorage.getItem('fasimcare_current_user');
        if (savedUser) {
            try {
                callback(JSON.parse(savedUser));
            } catch(e) {
                callback(null);
            }
        } else {
            callback(null);
        }
        return () => {};
    },
    
    // Delete all user data
    deleteUserData: async function(userId) {
        if (!userId) return false;
        
        // Clear localStorage
        const keysToRemove = [
            `fasimcare_${userId}_kandang`,
            `fasimcare_${userId}_populasi`,
            `fasimcare_${userId}_produksiTelur`,
            `fasimcare_${userId}_panenBroiler`,
            `fasimcare_${userId}_stokPakan`,
            `fasimcare_${userId}_pakanTerpakai`,
            `fasimcare_${userId}_stokObat`,
            `fasimcare_${userId}_obatTerpakai`,
            `fasimcare_${userId}_jadwalVaksin`,
            `fasimcare_${userId}_riwayatPenyakit`,
            `fasimcare_${userId}_karyawan`,
            `fasimcare_${userId}_absensi`,
            `fasimcare_${userId}_customer`,
            `fasimcare_${userId}_supplier`,
            `fasimcare_${userId}_piutang`,
            `fasimcare_${userId}_hutang`,
            `fasimcare_${userId}_transaksi`,
            `fasimcare_${userId}_penggajian`
        ];
        keysToRemove.forEach(key => localStorage.removeItem(key));
        localStorage.removeItem('fasimcare_current_user');
        
        // Delete from cloud if online
        if (!isLocalUser(userId) && this.isReady() && navigator.onLine) {
            try {
                // Delete all farm data
                const collections = [
                    'kandang', 'populasi', 'produksiTelur', 'panenBroiler',
                    'stokPakan', 'pakanTerpakai', 'stokObat', 'obatTerpakai',
                    'jadwalVaksin', 'riwayatPenyakit', 'karyawan', 'absensi',
                    'customer', 'supplier', 'piutang', 'hutang', 'transaksi',
                    'penggajian'
                ];
                
                for (const collection of collections) {
                    const docId = `${userId}_${collection}`;
                    const docRef = db.collection('farm_data').doc(docId);
                    await docRef.delete();
                }
                
                // Delete user profile
                await db.collection('users').doc(userId).delete();
                
                console.log('✅ All user data deleted from cloud');
            } catch(e) {
                console.error('Delete cloud data error:', e);
            }
        }
        
        return true;
    }
};

// Register to multiple global names for compatibility
window.FasimCareFirebase = FirebaseService;
window.FasimChickFirebase = FirebaseService;
window.FasimCornFirebase = FirebaseService;

// Log status
console.log('🐔 FasimCare+ Firebase Service v2.2.0 Ready');
console.log('📡 Status:', FirebaseService.getStatus());
console.log('💾 Mode:', FirebaseService.isReady() ? 'Online (Cloud Sync)' : 'Offline (Local Storage Only)');
console.log('🔐 New features: Admin Panel, Announcements, System Settings, Backup/Restore');