// ============================================
// FASIMCARE+ - MANAJEMEN PETERNAKAN AYAM MODERN
// Version: 2.1.0 - FULL FEATURES (Like FasimCorn)
// ============================================

(function() {
    'use strict';
    
    const { useState, useEffect, useRef, useCallback } = React;
    const moment = window.moment;
    
    const generateUniqueId = (() => {
    let counter = 0;
    return () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 11); // ✅ Fix: substr -> substring
        counter = (counter + 1) % 10000;
        return `${timestamp}_${random}_${counter}`;
    };
})();

const deduplicateById = (arr) => {
    if (!arr || !Array.isArray(arr)) return [];
    const seen = new Map(); // Gunakan Map untuk debugging
    const result = [];
    for (const item of arr) {
        if (!item || !item.id) {
            result.push(item);
            continue;
        }
        if (seen.has(item.id)) {
            console.warn(`⚠️ Duplicate ID found: ${item.id}`, item);
            continue;
        }
        seen.set(item.id, true);
        result.push(item);
    }
    return result;
};
    
    const SYSTEM_PROMPT = `Anda adalah "Si Jago", asisten AI ahli peternakan ayam di Indonesia dengan pengalaman 20 tahun.

PENTING - ATURAN BERIKUT WAJIB DIPATUHI:
1. Gunakan data peternakan yang diberikan dalam [KONTEKS DATA PETERNAKAN] untuk menjawab
2. Jawab dengan BAHASA INDONESIA yang santun dan mudah dipahami
3. Berikan solusi PRAKTIS dan APLIKATIF
4. Jika data menunjukkan masalah (produksi turun, mortalitas tinggi, penyakit, dll), berikan analisis dan solusi
5. Sebutkan ANGKA SPESIFIK dari data peternakan user (populasi, produksi telur, berat badan, dll)
6. Gunakan emoji yang relevan untuk membuat chat lebih hidup 🐔🥚🐓
7. Jangan pernah memberikan jawaban yang sama untuk semua user, harus PERSONAL
8. Harus bisa jawab harga telur dan ayam hari ini di semua daerah/wilayah di Indonesia
9. Jika ditanya tentang pakan, vaksin, atau obat, berikan rekomendasi sesuai kondisi

Gaya bicara: Ramah seperti teman diskusi, panggil user "Pak/Bu".`;
    
    const DEFAULT_AVATAR = 'fasimcare.png';
    
    const FasimCare = () => {
    // ==================== STATE GLOBAL ====================
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [initialized, setInitialized] = useState(false);  // ✅ DIPERBAIKI
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('');
    const [modalData, setModalData] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [showAIChat, setShowAIChat] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isOnline, setIsOnline] = useState(true);
    const [syncStatus, setSyncStatus] = useState('synced');
    const [toasts, setToasts] = useState([]);
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isPWAInstalled, setIsPWAInstalled] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState({ show: false, message: '', onConfirm: null });
        // User Profile
        const [userProfile, setUserProfile] = useState({
            id: '',
            name: 'Peternak',
            email: '',
            farmName: '',
            farmAddress: '',
            farmPhone: '',
            avatar: DEFAULT_AVATAR,
            phone: '',
            address: '',
            settings: { hargaTelurPerKg: 25000, hargaAyamPerKg: 30000 }
        });
        
     // Data Utama
const [kandangList, setKandangList] = useState([]);
const [selectedKandang, setSelectedKandang] = useState(null);
const [populasiList, setPopulasiList] = useState([]);
const [populasiSearchTerm, setPopulasiSearchTerm] = useState('');

const [keuanganSearchTerm, setKeuanganSearchTerm] = useState('');
const [keuanganFilter, setKeuanganFilter] = useState('all'); 
        
const [produksiTelur, setProduksiTelur] = useState([]);
const [produksiSearchTerm, setProduksiSearchTerm] = useState(''); 
const [produksiSatuan, setProduksiSatuan] = useState('butir');
const [produksiJumlahInput, setProduksiJumlahInput] = useState('');
        
const [panenBroiler, setPanenBroiler] = useState([]);
const [panenSearchTerm, setPanenSearchTerm] = useState('');
        
const [stokPakan, setStokPakan] = useState([]);
const [pakanTerpakai, setPakanTerpakai] = useState([]);
const [pakanSearchTerm, setPakanSearchTerm] = useState('');
const [pakanTerpakaiSearchTerm, setPakanTerpakaiSearchTerm] = useState(''); 
        
const [stokObat, setStokObat] = useState([]);
const [obatTerpakai, setObatTerpakai] = useState([]);

const [jadwalVaksin, setJadwalVaksin] = useState([]);
const [vaksinSearchTerm, setVaksinSearchTerm] = useState('');

const [riwayatPenyakit, setRiwayatPenyakit] = useState([]);
const [kesehatanSearchTerm, setKesehatanSearchTerm] = useState('');

const [karyawanList, setKaryawanList] = useState([]);
const [absensiHarian, setAbsensiHarian] = useState([]);
const [karyawanSearchTerm, setKaryawanSearchTerm] = useState('');

const [customerList, setCustomerList] = useState([]);
const [customerSearchTerm, setCustomerSearchTerm] = useState('');

const [piutangList, setPiutangList] = useState([]);
const [supplierList, setSupplierList] = useState([]);
const [supplierSearchTerm, setSupplierSearchTerm] = useState('');
        
const [hutangList, setHutangList] = useState([]);
const [transaksiPenjualan, setTransaksiPenjualan] = useState([]);
const [selectedTransaksi, setSelectedTransaksi] = useState(null);
const [showResi, setShowResi] = useState(false);
const [transaksiItems, setTransaksiItems] = useState([]);
const [editingItemIndex, setEditingItemIndex] = useState(null);
const [searchTermTransaksi, setSearchTermTransaksi] = useState('');

const [notifications, setNotifications] = useState([]);
const [unreadCount, setUnreadCount] = useState(0);
const [chatMessages, setChatMessages] = useState([]);
const [chatInput, setChatInput] = useState('');
const [isAIThinking, setIsAIThinking] = useState(false);
const [aiOnline, setAiOnline] = useState(true);

const [itemKg, setItemKg] = useState('');
const [itemHarga, setItemHarga] = useState('');
const chatMessagesRef = useRef(null);
const chartInstance = useRef(null);
const chartCanvasRef = useRef(null);
const chartKeuanganCanvasRef = useRef(null);
const chartKeuanganInstance = useRef(null);

const [showSlipGajiModal, setShowSlipGajiModal] = useState(false);
        
const [selectedPenggajianForSlip, setSelectedPenggajianForSlip] = useState(null);
        // Tambahkan di antara state lainnya (sekitar baris 50-100)
const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
const [userAnnouncements, setUserAnnouncements] = useState([]);
const [hiddenAnnouncements, setHiddenAnnouncements] = useState([]);
        
// ==================== CONSULTATION STATE ====================
const [showConsultationModal, setShowConsultationModal] = useState(false);
const [consultationMessages, setConsultationMessages] = useState([]);
const [consultationInput, setConsultationInput] = useState('');
const [consultationId, setConsultationId] = useState(null);
const [consultationStatus, setConsultationStatus] = useState(null);
const [consultationLoading, setConsultationLoading] = useState(false);
const [consultationTyping, setConsultationTyping] = useState(false);
const [consultationAdminOnline, setConsultationAdminOnline] = useState(false);
const [consultationUnread, setConsultationUnread] = useState(0);
const consultationTypingTimeoutRef = useRef(null);
        
        // ==================== SCHEDULER STATE ====================
const [schedules, setSchedules] = useState([]);
const [showScheduleModal, setShowScheduleModal] = useState(false);
const [selectedSchedule, setSelectedSchedule] = useState(null);
const [scheduleFilter, setScheduleFilter] = useState('all');
const [nextReminders, setNextReminders] = useState([]);
const [showReminderPanel, setShowReminderPanel] = useState(false);
        
// ==================== BIAYA PRODUKSI STATE ====================
const [biayaProduksi, setBiayaProduksi] = useState([]);
const [showBiayaModal, setShowBiayaModal] = useState(false);
const [selectedBiaya, setSelectedBiaya] = useState(null);
const [periodeBiaya, setPeriodeBiaya] = useState(() => moment().format('YYYY-MM'));
const [hppData, setHppData] = useState({ 
    hppPerKg: 0, hppPerButir: 0, totalBiaya: 0, 
    totalProduksiKg: 0, totalProduksiButir: 0, 
    biayaTetap: 0, biayaVariabel: 0 
});
const [bepData, setBepData] = useState({ bepHarga: 0, bepProduksi: 0, margin: 0 });
        
        const quickReplies = [
    { icon: '💰', label: 'Harga per Meter', text: 'Halo admin, berapa harga borongan per meter persegi untuk kandang:' },
    { icon: '📦', label: 'Borongan Penuh', text: 'Halo admin, minta penawaran borongan penuh (material + tenaga) untuk kandang kapasitas:' },
    { icon: '🔨', label: 'Borongan Tenaga', text: 'Halo admin, berapa biaya borongan tenaga saja untuk pembangunan kandang ukuran:' },
    { icon: '🏷️', label: 'Paket Hemat', text: 'Halo admin, apakah ada paket harga hemat untuk kandang ayam petelur/broiler?' },
    { icon: '📊', label: 'Rincian Biaya', text: 'Halo admin, mohon rincian biaya borongan (pondasi, rangka, atap, dinding, perlengkapan kandang).' },
    { icon: '🏗️', label: 'Estimasi Biaya', text: 'Halo admin, saya minta estimasi total biaya bangun kandang untuk:' },
    { icon: '📐', label: 'Desain Kandang', text: 'Halo admin, apakah tersedia desain kandang untuk kapasitas:' },
    { icon: '🐔', label: 'Kandang Petelur', text: 'Halo admin, saya butuh jasa pembangunan kandang ayam petelur dengan sistem:' },
    { icon: '🍗', label: 'Kandang Broiler', text: 'Halo admin, saya butuh jasa pembangunan kandang ayam broiler untuk populasi:' },
    { icon: '⏱️', label: 'Waktu Pengerjaan', text: 'Halo admin, berapa lama waktu pengerjaan kandang dengan ukuran:' },
    { icon: '📋', label: 'Material & Ventilasi', text: 'Halo admin, material apa yang direkomendasikan dan sistem ventilasi seperti apa?' }
];
        
// Load pesan konsultasi (ONE-TIME)
const loadConsultationMessages = useCallback(async (consId) => {
    if (!consId) return;
    
    const firestore = window.FasimCareFirebase?.db || (window.firebase?.firestore?.());
    if (!firestore) {
        console.error('Firestore not available');
        return;
    }
    
    setConsultationLoading(true);
    try {
        const snapshot = await firestore.collection('consultations')
            .doc(consId)
            .collection('messages')
            .orderBy('timestamp', 'asc')
            .get();
        
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate?.() || new Date()
        }));
        
        setConsultationMessages(messages);
        
        setTimeout(() => {
            const container = document.querySelector('.consultation-messages');
            if (container) container.scrollTop = container.scrollHeight;
        }, 100);
        
    } catch (error) {
        console.error('Load messages error:', error);
    } finally {
        setConsultationLoading(false);
    }
}, []);
        
// Kirim pesan konsultasi
const sendConsultationMessage = useCallback(async () => {
    if (typeof addNotification !== 'function') {
        console.warn('⚠️ addNotification not ready');
        return;
    }
    
    if (!consultationInput.trim() || consultationLoading) return;
    
    const message = consultationInput.trim();
    setConsultationInput('');
    setConsultationLoading(true);
    
    if (consultationTypingTimeoutRef.current) clearTimeout(consultationTypingTimeoutRef.current);
    
    const firestore = window.FasimCareFirebase?.db || (window.firebase?.firestore?.());
    if (!firestore) {
        addNotification('danger', 'Error', 'Koneksi database tidak tersedia', 3000);
        setConsultationLoading(false);
        return;
    }
    
    try {
        let currentConsultationId = consultationId;
        
        if (!currentConsultationId) {
            const newConsultation = {
                userId: userProfile.id,
                userName: userProfile.name,
                userEmail: userProfile.email,
                userAvatar: userProfile.avatar || DEFAULT_AVATAR,
                status: 'pending',
                lastMessage: message,
                lastMessageTime: new Date(),
                unreadByAdmin: true,
                unreadByUser: false,
                userTyping: false,
                adminTyping: false,
                adminOnline: false,
                createdAt: new Date()
            };
            
            const docRef = await firestore.collection('consultations').add(newConsultation);
            currentConsultationId = docRef.id;
            setConsultationId(currentConsultationId);
            setConsultationStatus('pending');
        }
        
        await firestore.collection('consultations')
            .doc(currentConsultationId)
            .collection('messages')
            .add({
                sender: 'user',
                message: message,
                timestamp: new Date(),
                readByAdmin: false,
                readByUser: true
            });
        
        await firestore.collection('consultations').doc(currentConsultationId).update({
            lastMessage: message,
            lastMessageTime: new Date(),
            status: 'pending',
            unreadByAdmin: true
        });
        
        if (typeof addNotification === 'function') {
            addNotification('success', 'Pesan Terkirim', 'Admin akan membalas segera', 2000);
        }
        
    } catch (error) {
        console.error('Send message error:', error);
        if (typeof addNotification === 'function') {
            addNotification('danger', 'Gagal', 'Pesan tidak terkirim', 3000);
        }
    } finally {
        setConsultationLoading(false);
    }
}, [consultationInput, consultationLoading, consultationId, userProfile]);
        
// Kirim typing indicator ke admin
const sendTypingIndicator = useCallback(async (isTyping) => {
    if (!consultationId) return;
    
    const firestore = window.FasimCareFirebase?.db || (window.firebase?.firestore?.());
    if (!firestore) return;
    
    if (consultationTypingTimeoutRef.current) clearTimeout(consultationTypingTimeoutRef.current);
    
    try {
        await firestore.collection('consultations').doc(consultationId).update({
            userTyping: isTyping,
            userTypingAt: new Date()
        });
    } catch (e) {
        console.warn('Typing indicator error:', e);
    }
    
    if (isTyping) {
        consultationTypingTimeoutRef.current = setTimeout(async () => {
            try {
                await firestore.collection('consultations').doc(consultationId).update({
                    userTyping: false
                });
            } catch (e) {}
        }, 2000);
    }
}, [consultationId]);

// ==================== MODAL SWIPE HANDLE - DIPERBAIKI ====================
const modalContentRef = useRef(null);
const modalSwipeStartRef = useRef({ y: 0, isSwiping: false });

const handleModalSwipeStart = useCallback((e) => {
    const touch = e.touches ? e.touches[0] : e;
    modalSwipeStartRef.current = { y: touch.clientY, isSwiping: true };
    const modal = modalContentRef.current;
    if (modal) {
        modal.classList.add('swiping-down');
        modal.style.transition = 'transform 0.05s ease-out';
        // ✅ FIX: Prevent default hanya jika perlu
        if (e.cancelable) e.preventDefault();
    }
}, []);

const handleModalSwipeMove = useCallback((e) => {
    if (!modalSwipeStartRef.current.isSwiping) return;
    const touch = e.touches ? e.touches[0] : e;
    const deltaY = touch.clientY - modalSwipeStartRef.current.y;
    if (deltaY > 0) {
        // ✅ FIX: Hanya prevent default jika deltaY > 0
        if (e.cancelable) e.preventDefault();
        const modal = modalContentRef.current;
        if (modal) {
            const translateY = Math.min(deltaY, 200);
            modal.style.transform = `translateY(${translateY}px)`;
            const indicator = modal.querySelector('.swipe-indicator');
            if (indicator) {
                indicator.style.opacity = 1 - (translateY / 150);
                indicator.style.width = `${40 + (translateY / 5)}px`;
            }
        }
    }
}, []);

const handleModalSwipeEnd = useCallback((e) => {
    if (!modalSwipeStartRef.current.isSwiping) return;
    const touch = e.changedTouches ? e.changedTouches[0] : e;
    const deltaY = touch.clientY - modalSwipeStartRef.current.y;
    const modal = modalContentRef.current;
    if (modal) {
        modal.classList.remove('swiping-down');
        modal.style.transition = '';
        modal.style.transform = '';
        const indicator = modal.querySelector('.swipe-indicator');
        if (indicator) {
            indicator.style.opacity = '';
            indicator.style.width = '';
        }
        if (deltaY > 80) {
            setShowModal(false);
        }
    }
    modalSwipeStartRef.current = { y: 0, isSwiping: false };
}, [setShowModal]);

// ✅ FIX: Attach event listeners dengan proper cleanup
useEffect(() => {
    if (!showModal) return;
    
    const handleTouchMove = (e) => {
        if (modalSwipeStartRef.current.isSwiping) {
            handleModalSwipeMove(e);
        }
    };
    const handleTouchEnd = (e) => {
        if (modalSwipeStartRef.current.isSwiping) {
            handleModalSwipeEnd(e);
        }
    };
    
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
    };
}, [showModal, handleModalSwipeMove, handleModalSwipeEnd]);
        
// Attach event listeners untuk modal swipe
useEffect(() => {
    if (!showModal) return;
    window.addEventListener('touchmove', handleModalSwipeMove, { passive: false });
    window.addEventListener('touchend', handleModalSwipeEnd);
    return () => {
        window.removeEventListener('touchmove', handleModalSwipeMove);
        window.removeEventListener('touchend', handleModalSwipeEnd);
    };
}, [showModal, handleModalSwipeMove, handleModalSwipeEnd]);

useEffect(() => {
    return () => {
        if (chartInstance.current) {
            try { chartInstance.current.destroy(); } catch(e) {}
        }
        if (chartKeuanganInstance.current) {
            try { chartKeuanganInstance.current.destroy(); } catch(e) {}
        }
    };
}, []);
        
// ==================== SLIP GAJI STATE ====================
const [penggajianList, setPenggajianList] = useState([]);
const [selectedBulanGaji, setSelectedBulanGaji] = useState(() => moment().format('YYYY-MM'));
const [gajiSettings, setGajiSettings] = useState({
    tunjanganMakan: 15000,
    tunjanganTransport: 10000,
    potonganAbsenPerHari: 50000,    // Alpha
    potonganIzinPerHari: 25000,
    potonganSakitPerHari: 0,
    bonusKehadiranPenuh: 50000,
    hitungProrata: true,
    pembulatanGaji: 500,
    tunjanganJabatan: {
        'Pekerja Kandang': 0,
        'Dokter Hewan': 200000,
        'Admin': 100000,
        'Manager': 300000
    }
});

// ✅ VALIDASI GAJI SETTINGS - Tambahkan useEffect ini
useEffect(() => {
    setGajiSettings(prev => ({
        tunjanganMakan: prev.tunjanganMakan || 15000,
        tunjanganTransport: prev.tunjanganTransport || 10000,
        potonganAbsenPerHari: prev.potonganAbsenPerHari || 50000,
        potonganIzinPerHari: prev.potonganIzinPerHari || 25000,
        potonganSakitPerHari: prev.potonganSakitPerHari || 0,
        bonusKehadiranPenuh: prev.bonusKehadiranPenuh || 50000,
        hitungProrata: prev.hitungProrata !== false,
        pembulatanGaji: prev.pembulatanGaji || 500,
        tunjanganJabatan: prev.tunjanganJabatan || {
            'Pekerja Kandang': 0,
            'Dokter Hewan': 200000,
            'Admin': 100000,
            'Manager': 300000
        }
    }));
}, []);
        // Metrics
        const [totalPopulasi, setTotalPopulasi] = useState({ layer: 0, broiler: 0, total: 0 });
        const [produksiHarian, setProduksiHarian] = useState({ jumlah: 0, berat: 0, pendapatan: 0 });
        const [mortalitas, setMortalitas] = useState({ layer: 0, broiler: 0, persentase: 0 });
        const [keuangan, setKeuangan] = useState({ pendapatan: 0, pengeluaran: 0, labaBersih: 0 });
        const [kesehatan, setKesehatan] = useState({ sakit: 0, sembuh: 0, mati: 0 });
        const [fcrStats, setFcrStats] = useState({ rataRata: 0, terbaik: 0, terburuk: 0 });
        const [konversiPakan, setKonversiPakan] = useState({ nilai: 0, totalPakan: 0, totalBerat: 0 });
        
        // Update metrics secara otomatis saat data berubah
useEffect(() => {
    if (isAuthenticated && selectedKandang) {
        hitungMetrics();
    }
}, [populasiList, produksiTelur, panenBroiler, stokPakan, stokObat, 
    karyawanList, pakanTerpakai, riwayatPenyakit, selectedKandang, isAuthenticated]);
        
        const [showStore, setShowStore] = useState(false);
        const [showFABPanel, setShowFABPanel] = useState(false);
        const [avatarPreview, setAvatarPreview] = useState(null);
        
// Auto slide untuk banner carousel
useEffect(() => {
    const dangerAnnouncements = userAnnouncements.filter(
        ann => !hiddenAnnouncements.includes(ann.id) && ann.type === 'danger'
    );
    
    if (dangerAnnouncements.length <= 1) return;
    
    const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % dangerAnnouncements.length);
    }, 5000); // Ganti setiap 5 detik
    
    return () => clearInterval(interval);
}, [userAnnouncements, hiddenAnnouncements]);
        
        // Gunakan ini untuk avatar/profile images
const LazyImage = ({ src, alt, className }) => {
    const [loaded, setLoaded] = useState(false);
    return React.createElement('div', { className: `lazy-image-wrapper ${className}` },
        !loaded && React.createElement('div', { className: 'skeleton' }),
        React.createElement('img', { 
            src: src, 
            alt: alt, 
            onLoad: () => setLoaded(true),
            style: { display: loaded ? 'block' : 'none' }
        })
    );
};
        
        const PremiumConfirm = () => {
    if (!showConfirm.show) return null;
    return React.createElement('div', { className: 'premium-confirm-overlay' },
        React.createElement('div', { className: 'premium-confirm' },
            React.createElement('div', { className: 'premium-confirm-icon' },
                React.createElement('i', { className: 'fas fa-trash-alt' })
            ),
            React.createElement('p', null, showConfirm.message),
            React.createElement('div', { className: 'premium-confirm-actions' },
                React.createElement('button', { 
                    className: 'premium-confirm-btn premium-confirm-cancel', 
                    onClick: function() { setShowConfirm({ show: false }); } 
                }, 
                    React.createElement('i', { className: 'fas fa-times' }), 
                    ' Batal'
                ),
                React.createElement('button', { 
                    className: 'premium-confirm-btn premium-confirm-delete', 
                    onClick: function() { 
                        if (showConfirm.onConfirm) {
                            showConfirm.onConfirm();
                        }
                        setShowConfirm({ show: false }); 
                    } 
                }, 
                    React.createElement('i', { className: 'fas fa-trash-alt' }), 
                    ' Ya, Hapus'
                )
            )
        )
    );
};
        
        // ==================== HELPER FUNCTIONS ====================
        const formatRupiah = useCallback((angka) => {
            if (!angka && angka !== 0) return 'Rp 0';
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
        }, []);
        
        const formatRupiahCompact = useCallback((angka) => {
            if (!angka && angka !== 0) return 'Rp 0';
            const absAngka = Math.abs(angka);
            const isNegative = angka < 0;
            const prefix = isNegative ? '-Rp ' : 'Rp ';
            if (absAngka >= 1000000000) return `${prefix}${(absAngka / 1000000000).toFixed(1)}M`;
            if (absAngka >= 1000000) return `${prefix}${(absAngka / 1000000).toFixed(1)}Jt`;
            if (absAngka >= 1000) return `${prefix}${Math.floor(absAngka / 1000)}K`;
            return `Rp ${angka.toLocaleString('id-ID')}`;
        }, []);
        
     
        
        const formatNumber = useCallback((num) => {
            return (num || 0).toLocaleString();
        }, []);
        
        const formatTelur = useCallback((butir) => {
            return `${(butir || 0).toLocaleString()} butir`;
        }, []);
        
        const formatAyam = useCallback((ekor) => {
            return `${(ekor || 0).toLocaleString()} ekor`;
        }, []);
        
        // ==================== STORAGE FUNCTIONS ====================
        const saveToStorage = useCallback((key, data) => {
            try {
                const userId = userProfile.id || 'default';
                localStorage.setItem(`fasimcare_${userId}_${key}`, JSON.stringify(data));
                return true;
            } catch (e) { 
                console.error('Save to storage error:', e);
                return false; 
            }
        }, [userProfile.id]);

        const loadFromStorage = useCallback((key) => {
            try {
                const userId = userProfile.id || 'default';
                const data = localStorage.getItem(`fasimcare_${userId}_${key}`);
                return data ? JSON.parse(data) : [];
            } catch (e) { 
                console.error('Load from storage error:', e);
                return []; 
            }
        }, [userProfile.id]);
        
        const showToast = useCallback((type, title, message) => {
            const id = Date.now();
            setToasts(prev => [...prev, { id, type, title, message }]);
            setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
        }, []);
        
        const addNotification = useCallback((type, title, message, duration = 4000) => {
            const newNotif = { id: generateUniqueId(), type, title, message, time: new Date().toISOString(), read: false };
            setNotifications(prev => [newNotif, ...prev].slice(0, 50));
            setUnreadCount(prev => prev + 1);
            showToast(type, title, message);
        }, [showToast]);
        
        const saveToFirebase = useCallback(async (collection, data) => {
            if (!userProfile.id || userProfile.id.startsWith('local_')) {
                saveToStorage(collection, data);
                return false;
            }
            if (!navigator.onLine) {
                saveToStorage(collection, data);
                setSyncStatus('offline');
                return false;
            }
            try {
                if (window.FasimCareFirebase && window.FasimCareFirebase.saveData) {
                    const result = await window.FasimCareFirebase.saveData(userProfile.id, collection, data);
                    if (result.success) {
                        setSyncStatus('synced');
                        return true;
                    } else {
                        setSyncStatus('offline');
                        saveToStorage(collection, data);
                        return false;
                    }
                }
            } catch (error) {
                console.error(`Firebase save error for ${collection}:`, error);
                setSyncStatus('offline');
                saveToStorage(collection, data);
            }
            return false;
        }, [userProfile.id, saveToStorage]);

        const loadFromFirebase = useCallback(async (collection, defaultValue = []) => {
            if (!userProfile.id || userProfile.id.startsWith('local_')) {
                const cached = loadFromStorage(collection);
                return cached.length > 0 ? cached : defaultValue;
            }
            try {
                if (window.FasimCareFirebase && window.FasimCareFirebase.loadData) {
                    const result = await window.FasimCareFirebase.loadData(userProfile.id, collection);
                    if (result && result.success && result.data && Array.isArray(result.data) && result.data.length > 0) {
                        saveToStorage(collection, result.data);
                        return result.data;
                    }
                }
            } catch (error) {
                console.warn(`Firebase load error for ${collection}:`, error);
            }
            const cached = loadFromStorage(collection);
            return cached.length > 0 ? cached : defaultValue;
        }, [userProfile.id, saveToStorage, loadFromStorage]);
        
   // ==================== FUNGSI SLIP GAJI ====================

// Hitung absensi per karyawan per bulan - DIPERBAIKI
const hitungAbsensiBulanan = useCallback((karyawanId, tahun, bulan) => {
    if (!absensiHarian || absensiHarian.length === 0) {
        return { hadir: 0, izin: 0, sakit: 0, alpha: 0, totalHariKerja: 30 };
    }
    
    const startDate = moment(`${tahun}-${bulan}-01`).startOf('month');
    const endDate = moment(startDate).endOf('month');
    const totalHariKerja = endDate.diff(startDate, 'days') + 1;
    
    const absensiBulan = absensiHarian.filter(a => {
        return a.karyawanId === karyawanId && 
               moment(a.tanggal).isBetween(startDate, endDate, 'day', '[]');
    });
    
    const hadir = absensiBulan.filter(a => a.status === 'hadir').length;
    const izin = absensiBulan.filter(a => a.status === 'izin').length;
    const sakit = absensiBulan.filter(a => a.status === 'sakit').length;
    // Alpha = totalHariKerja - (hadir + izin + sakit)
    const alpha = Math.max(0, totalHariKerja - (hadir + izin + sakit));
    
    return { hadir, izin, sakit, alpha, totalHariKerja };
}, [absensiHarian]);

// Hitung gaji karyawan - DIPERBAIKI
const hitungGajiKaryawan = useCallback((karyawan, bulanTahun) => {
    if (!karyawan) return null;
    
    const [tahun, bulan] = bulanTahun.split('-');
    const absensi = hitungAbsensiBulanan(karyawan.id, tahun, bulan);
    
    const gajiPokok = karyawan.gaji || 0;
    const tunjanganMakan = gajiSettings.tunjanganMakan || 15000;
    const tunjanganTransport = gajiSettings.tunjanganTransport || 10000;
    const tunjanganJabatan = (gajiSettings.tunjanganJabatan || {})[karyawan.posisi] || 0;
    
    // Potongan
    const potonganAbsen = absensi.alpha * (gajiSettings.potonganAbsenPerHari || 50000);
    const potonganIzin = absensi.izin * (gajiSettings.potonganIzinPerHari || 25000);
    const potonganSakit = absensi.sakit * (gajiSettings.potonganSakitPerHari || 0);
    const totalPotongan = potonganAbsen + potonganIzin + potonganSakit;
    
    // Bonus kehadiran penuh - HANYA jika ALPHA = 0
    let bonusKehadiran = 0;
    if ((gajiSettings.bonusKehadiranPenuh || 50000) > 0 && absensi.alpha === 0) {
        bonusKehadiran = gajiSettings.bonusKehadiranPenuh;
    }
    
    // Tunjangan proporsional
    const totalHariKerja = absensi.totalHariKerja || 30;
    const hariEfektif = absensi.hadir;
    const persentaseKehadiran = (gajiSettings.hitungProrata && totalHariKerja > 0) ? hariEfektif / totalHariKerja : 1;
    
    const tunjanganMakanEfektif = Math.round(tunjanganMakan * persentaseKehadiran);
    const tunjanganTransportEfektif = Math.round(tunjanganTransport * persentaseKehadiran);
    const tunjanganJabatanEfektif = Math.round(tunjanganJabatan * persentaseKehadiran);
    const totalTunjangan = tunjanganMakanEfektif + tunjanganTransportEfektif + tunjanganJabatanEfektif;
    
    let totalGaji = gajiPokok + totalTunjangan - totalPotongan + bonusKehadiran;
    
    // Pembulatan
    const pembulatan = gajiSettings.pembulatanGaji || 500;
    if (pembulatan > 0 && totalGaji > 0) {
        totalGaji = Math.ceil(totalGaji / pembulatan) * pembulatan;
    }
    
    return {
        id: generateUniqueId(),
        karyawanId: karyawan.id,
        karyawanNama: karyawan.nama,
        posisi: karyawan.posisi,
        periode: bulanTahun,
        gajiPokok,
        tunjanganMakan: tunjanganMakanEfektif,
        tunjanganTransport: tunjanganTransportEfektif,
        tunjanganJabatan: tunjanganJabatanEfektif,
        totalTunjangan,
        potonganAbsen,
        potonganIzin,
        potonganSakit,
        totalPotongan,
        bonusKehadiran,
        totalGaji,
        absensi: {
            hadir: absensi.hadir,
            izin: absensi.izin,
            sakit: absensi.sakit,
            alpha: absensi.alpha,
            totalHariKerja: absensi.totalHariKerja
        },
        status: 'belum_bayar',
        tanggalBayar: null,
        createdAt: new Date().toISOString()
    };
}, [gajiSettings, hitungAbsensiBulanan, generateUniqueId]);

// Generate semua gaji karyawan untuk bulan tertentu - DIPERBAIKI dengan forceRefresh
const generatePenggajianBulanan = useCallback((bulanTahun, forceRefresh = false) => {
    if (!karyawanList || karyawanList.length === 0) {
        addNotification('warning', 'Tidak Ada Karyawan', 'Tambahkan karyawan terlebih dahulu', 3000);
        return [];
    }
    
    const penggajianBaru = karyawanList.map(karyawan => {
        // Cek existing hanya jika tidak force refresh
        if (!forceRefresh) {
            const existing = penggajianList.find(p => p.karyawanId === karyawan.id && p.periode === bulanTahun);
            if (existing) return existing;
        }
        return hitungGajiKaryawan(karyawan, bulanTahun);
    }).filter(p => p !== null); // Filter yang gagal
    
    setPenggajianList(prev => {
        // Hapus data lama untuk periode ini
        const filtered = prev.filter(p => p.periode !== bulanTahun);
        const updated = [...filtered, ...penggajianBaru];
        saveToFirebase('penggajian', updated);
        saveToStorage('penggajian', updated);
        return updated;
    });
    
    addNotification('success', 'Penggajian', `Gaji bulan ${moment(bulanTahun, 'YYYY-MM').format('MMMM YYYY')} telah dihitung`, 3000);
    return penggajianBaru;
}, [karyawanList, penggajianList, hitungGajiKaryawan, saveToFirebase, saveToStorage, addNotification]);

// Update status pembayaran gaji
const updateStatusPembayaran = useCallback((penggajianId, status, tanggalBayar = null) => {
    setPenggajianList(prev => {
        const updated = prev.map(p => 
            p.id === penggajianId 
                ? { ...p, status, tanggalBayar: tanggalBayar || new Date().toISOString() }
                : p
        );
        saveToFirebase('penggajian', updated);
        saveToStorage('penggajian', updated);
        return updated;
    });
    addNotification('success', 'Status Diupdate', `Pembayaran gaji ${status === 'lunas' ? 'LUNAS' : status}`, 3000);
}, [saveToFirebase, saveToStorage, addNotification]);

// Bayar gaji karyawan
const handleBayarGaji = useCallback((penggajian) => {
    if (confirm(`Bayar gaji ${penggajian.karyawanNama} sebesar ${formatRupiah(penggajian.totalGaji)}?`)) {
        updateStatusPembayaran(penggajian.id, 'lunas');
    }
}, [formatRupiah, updateStatusPembayaran]);

// Hapus penggajian
const handleHapusPenggajian = useCallback((penggajianId, periode) => {
    if (confirm(`Hapus data penggajian periode ${periode}?`)) {
        setPenggajianList(prev => {
            const updated = prev.filter(p => p.id !== penggajianId);
            saveToFirebase('penggajian', updated);
            saveToStorage('penggajian', updated);
            return updated;
        });
        addNotification('success', 'Data Dihapus', `Penggajian ${periode} dihapus`, 3000);
    }
}, [saveToFirebase, saveToStorage, addNotification]);

// Cetak slip gaji
const cetakSlipGaji = useCallback((penggajian) => {
    setSelectedPenggajianForSlip(penggajian);
    setShowSlipGajiModal(true);
}, []);
        
// Helper untuk generate HTML slip (dipisah agar reusable)
const generateSlipHTML = useCallback((penggajian, farmData) => {
    const formatRp = (angka) => 'Rp ' + new Intl.NumberFormat('id-ID').format(angka || 0);
    const bulanIndonesia = moment(penggajian.periode, 'YYYY-MM').format('MMMM YYYY');
    const farmName = farmData?.farmName || 'FASIMCARE+';
    const farmAddress = farmData?.farmAddress || 'Jl. Peternakan No. 123';
    const farmPhone = farmData?.farmPhone || '0812-3456-7890';
    
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Slip Gaji ${penggajian.karyawanNama} - ${bulanIndonesia}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Courier New', 'Monaco', monospace;
            background: #e0e0e0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        .slip-print {
            max-width: 380px;
            width: 100%;
            background: white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            margin: 0 auto;
        }
        .header {
            background: #0284C7;
            color: white;
            text-align: center;
            padding: 20px 16px;
        }
        .header h2 { font-size: 20px; margin-bottom: 6px; letter-spacing: 2px; }
        .header p { font-size: 10px; opacity: 0.9; margin: 3px 0; }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: bold;
            margin-top: 10px;
        }
        .badge-lunas { background: #10B981; color: white; }
        .badge-belum { background: #F59E0B; color: white; }
        .content { padding: 20px; }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px dashed #ddd;
        }
        .section-title {
            font-weight: bold;
            font-size: 12px;
            margin: 16px 0 10px;
            padding-bottom: 4px;
            border-bottom: 2px solid #0284C7;
            color: #0284C7;
        }
        .absensi-grid {
            display: flex;
            gap: 10px;
            margin: 10px 0;
        }
        .absensi-item {
            flex: 1;
            background: #f0f9ff;
            padding: 10px;
            text-align: center;
            border-radius: 8px;
        }
        .absensi-item .label { font-size: 9px; color: #666; }
        .absensi-item .value { font-size: 18px; font-weight: bold; color: #0284C7; }
        .gaji-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 12px;
            border-bottom: 1px dotted #eee;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 16px;
            margin-top: 16px;
            padding-top: 16px;
            border-top: 2px solid #0284C7;
            background: #f0f9ff;
            margin: 16px -20px -20px;
            padding: 16px 20px;
        }
        .footer {
            text-align: center;
            padding: 16px;
            font-size: 9px;
            color: #999;
            border-top: 1px dashed #ddd;
        }
        hr { margin: 12px 0; border: none; border-top: 1px dashed #ddd; }
        .print-button {
            display: block;
            width: 100%;
            padding: 12px;
            margin-top: 16px;
            background: #0284C7;
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
        }
        @media print {
            body { background: white; padding: 0; margin: 0; }
            .slip-print { box-shadow: none; max-width: 100%; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="slip-print">
        <div class="header">
            <h2>${farmName}</h2>
            <p>${farmAddress}</p>
            <p>Telp: ${farmPhone}</p>
            <div>
                <span class="badge ${penggajian.status === 'lunas' ? 'badge-lunas' : 'badge-belum'}">
                    ${penggajian.status === 'lunas' ? '✓ LUNAS' : '⏳ BELUM DIBAYAR'}
                </span>
            </div>
        </div>
        <div class="content">
            <div class="info-row"><span><strong>👤 Nama</strong></span><span>${penggajian.karyawanNama}</span></div>
            <div class="info-row"><span><strong>💼 Posisi</strong></span><span>${penggajian.posisi}</span></div>
            <div class="info-row"><span><strong>📅 Periode</strong></span><span>${bulanIndonesia}</span></div>
            
            <div class="section-title">📋 REKAP ABSENSI</div>
            <div class="absensi-grid">
                <div class="absensi-item"><div class="label">✅ Hadir</div><div class="value">${penggajian.absensi?.hadir || 0}</div></div>
                <div class="absensi-item"><div class="label">📝 Izin</div><div class="value">${penggajian.absensi?.izin || 0}</div></div>
                <div class="absensi-item"><div class="label">🤒 Sakit</div><div class="value">${penggajian.absensi?.sakit || 0}</div></div>
                <div class="absensi-item"><div class="label">⚠️ Alpha</div><div class="value">${penggajian.absensi?.alpha || 0}</div></div>
            </div>
            
            <div class="section-title">💰 RINCIAN GAJI</div>
            <div class="gaji-row"><span>Gaji Pokok</span><span>${formatRp(penggajian.gajiPokok)}</span></div>
            <div class="gaji-row"><span>🍽️ Tunjangan Makan</span><span>${formatRp(penggajian.tunjanganMakan)}</span></div>
            <div class="gaji-row"><span>🚗 Tunjangan Transport</span><span>${formatRp(penggajian.tunjanganTransport)}</span></div>
            <div class="gaji-row"><span>⭐ Tunjangan Jabatan</span><span>${formatRp(penggajian.tunjanganJabatan)}</span></div>
            
            ${(penggajian.potonganAbsen > 0 || penggajian.potonganIzin > 0 || penggajian.potonganSakit > 0) ? `
            <div class="section-title">📉 POTONGAN</div>
            ${penggajian.potonganAbsen > 0 ? `<div class="gaji-row"><span>⚠️ Alpha</span><span style="color:#EF4444;">-${formatRp(penggajian.potonganAbsen)}</span></div>` : ''}
            ${penggajian.potonganIzin > 0 ? `<div class="gaji-row"><span>📝 Izin</span><span style="color:#EF4444;">-${formatRp(penggajian.potonganIzin)}</span></div>` : ''}
            ${penggajian.potonganSakit > 0 ? `<div class="gaji-row"><span>🤒 Sakit</span><span style="color:#EF4444;">-${formatRp(penggajian.potonganSakit)}</span></div>` : ''}
            ` : ''}
            
            ${penggajian.bonusKehadiran > 0 ? `
            <div class="section-title">🎉 BONUS</div>
            <div class="gaji-row"><span>Bonus Kehadiran Penuh</span><span style="color:#10B981;">+${formatRp(penggajian.bonusKehadiran)}</span></div>
            ` : ''}
            
            <div class="total-row">
                <span>TOTAL GAJI</span>
                <span>${formatRp(penggajian.totalGaji)}</span>
            </div>
            
            ${penggajian.tanggalBayar ? `<hr><div class="info-row" style="border-bottom:none;"><span>📆 Dibayar</span><span>${moment(penggajian.tanggalBayar).format('DD MMM YYYY')}</span></div>` : ''}
        </div>
        <div class="footer">
            <p>✨ Terima kasih atas kerja keras Anda! ✨</p>
            <p>*** Slip Gaji ini adalah bukti sah ***</p>
        </div>
        <div class="no-print" style="padding: 16px; text-align: center;">
            <button onclick="window.print()" class="print-button">🖨️ Cetak Slip Gaji</button>
            <button onclick="window.close()" style="margin-top: 8px; padding: 8px 16px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer;">✖️ Tutup</button>
        </div>
    </div>
    <script>
        (function() {
            setTimeout(function() {
                window.print();
            }, 500);
        })();
    <\/script>
</body>
</html>`;
}, []);

// Cetak slip gaji - DIPERBAIKI dengan popup blocker handling
const handlePrintSlip = useCallback(() => {
    if (!selectedPenggajianForSlip) {
        addNotification('warning', 'Error', 'Tidak ada data slip gaji', 2000);
        return;
    }
    
    const htmlContent = generateSlipHTML(selectedPenggajianForSlip, userProfile);
    
    // Cek apakah popup diblokir
    const printWindow = window.open('', '_blank', 'width=450,height=650,menubar=yes,toolbar=yes,scrollbars=yes');
    
    if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
        addNotification('warning', 'Popup Diblokir', 'Izinkan popup untuk website ini, lalu klik cetak lagi', 4000);
        return;
    }
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Tunggu DOM ready sebelum print
    printWindow.onload = () => {
        setTimeout(() => {
            printWindow.print();
        }, 300);
    };
}, [selectedPenggajianForSlip, userProfile, generateSlipHTML, addNotification]);
        
// Share slip gaji ke WhatsApp - VERSI FOTO/GAMBAR
const handleShareToWhatsApp = useCallback(async () => {
    if (!selectedPenggajianForSlip) {
        addNotification('warning', 'Error', 'Tidak ada data slip gaji', 2000);
        return;
    }
    
    // Tampilkan loading
    setLoading(true);
    addNotification('info', 'Membuat Gambar', 'Sedang membuat screenshot slip gaji...', 2000);
    
    const penggajian = selectedPenggajianForSlip;
    const formatRp = (angka) => 'Rp ' + new Intl.NumberFormat('id-ID').format(angka || 0);
    const bulanIndonesia = moment(penggajian.periode, 'YYYY-MM').format('MMMM YYYY');
    
    // Buat elemen div temporary untuk screenshot
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'fixed';
    tempDiv.style.top = '-9999px';
    tempDiv.style.left = '-9999px';
    tempDiv.style.backgroundColor = 'white';
    tempDiv.style.padding = '20px';
    tempDiv.style.width = '380px';
    tempDiv.style.fontFamily = "'Courier New', monospace";
    tempDiv.innerHTML = `
        <div style="background: linear-gradient(135deg, #0284C7, #0EA5E9, #38BDF8); color: white; text-align: center; padding: 20px; border-radius: 20px 20px 0 0;">
            <h2 style="margin: 0; font-size: 20px;">${userProfile.farmName || 'FASIMCARE+'}</h2>
            <p style="margin: 5px 0; font-size: 10px;">${userProfile.farmAddress || 'Jl. Peternakan No. 123'}</p>
            <p style="margin: 0; font-size: 9px;">📞 ${userProfile.farmPhone || '0812-3456-7890'}</p>
            <div style="margin-top: 12px;">
                <span style="background: ${penggajian.status === 'lunas' ? '#10B981' : '#F59E0B'}; padding: 4px 12px; border-radius: 20px; font-size: 10px; font-weight: bold;">
                    ${penggajian.status === 'lunas' ? '✓ LUNAS' : '⏳ BELUM DIBAYAR'}
                </span>
            </div>
        </div>
        <div style="padding: 20px; background: white;">
            <div style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #ddd;">
                    <span><strong>👤 Nama</strong></span><span>${penggajian.karyawanNama}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #ddd;">
                    <span><strong>💼 Posisi</strong></span><span>${penggajian.posisi}</span>
                </div>
                <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #ddd;">
                    <span><strong>📅 Periode</strong></span><span>${bulanIndonesia}</span>
                </div>
            </div>
            
            <div style="margin-bottom: 16px;">
                <h4 style="color: #10B981; margin-bottom: 10px; border-left: 3px solid #10B981; padding-left: 8px;">📋 REKAP ABSENSI</h4>
                <div style="display: flex; gap: 10px;">
                    <div style="flex: 1; background: #f0f9ff; padding: 10px; text-align: center; border-radius: 8px;">
                        <div style="font-size: 20px; font-weight: bold; color: #10B981;">${penggajian.absensi?.hadir || 0}</div>
                        <div style="font-size: 9px;">✅ Hadir</div>
                    </div>
                    <div style="flex: 1; background: #fef3c7; padding: 10px; text-align: center; border-radius: 8px;">
                        <div style="font-size: 20px; font-weight: bold; color: #F59E0B;">${penggajian.absensi?.izin || 0}</div>
                        <div style="font-size: 9px;">📝 Izin</div>
                    </div>
                    <div style="flex: 1; background: #f3e8ff; padding: 10px; text-align: center; border-radius: 8px;">
                        <div style="font-size: 20px; font-weight: bold; color: #8B5CF6;">${penggajian.absensi?.sakit || 0}</div>
                        <div style="font-size: 9px;">🤒 Sakit</div>
                    </div>
                    <div style="flex: 1; background: #fee2e2; padding: 10px; text-align: center; border-radius: 8px;">
                        <div style="font-size: 20px; font-weight: bold; color: #EF4444;">${penggajian.absensi?.alpha || 0}</div>
                        <div style="font-size: 9px;">⚠️ Alpha</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 16px;">
                <h4 style="color: #F59E0B; margin-bottom: 10px; border-left: 3px solid #F59E0B; padding-left: 8px;">💰 RINCIAN GAJI</h4>
                <div style="background: #f8fafc; border-radius: 12px; overflow: hidden;">
                    <div style="display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">
                        <span>Gaji Pokok</span><span style="font-weight: bold;">${formatRp(penggajian.gajiPokok)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">
                        <span>🍽️ Tunjangan Makan</span><span>${formatRp(penggajian.tunjanganMakan)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #e2e8f0;">
                        <span>🚗 Tunjangan Transport</span><span>${formatRp(penggajian.tunjanganTransport)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 12px;">
                        <span>⭐ Tunjangan Jabatan</span><span>${formatRp(penggajian.tunjanganJabatan)}</span>
                    </div>
                </div>
            </div>
            
            ${penggajian.potonganAbsen > 0 ? `
            <div style="margin-bottom: 16px;">
                <h4 style="color: #EF4444; margin-bottom: 10px; border-left: 3px solid #EF4444; padding-left: 8px;">📉 POTONGAN</h4>
                <div style="background: #fef2f2; border-radius: 12px; padding: 10px 12px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>⚠️ Alpha</span><span style="color: #EF4444;">-${formatRp(penggajian.potonganAbsen)}</span>
                    </div>
                </div>
            </div>
            ` : ''}
            
            ${penggajian.bonusKehadiran > 0 ? `
            <div style="margin-bottom: 16px;">
                <h4 style="color: #10B981; margin-bottom: 10px; border-left: 3px solid #10B981; padding-left: 8px;">🎉 BONUS</h4>
                <div style="background: #ecfdf5; border-radius: 12px; padding: 10px 12px;">
                    <div style="display: flex; justify-content: space-between;">
                        <span>Bonus Kehadiran Penuh</span><span style="color: #10B981;">+${formatRp(penggajian.bonusKehadiran)}</span>
                    </div>
                </div>
            </div>
            ` : ''}
            
            <div style="background: linear-gradient(135deg, #0284C7, #0EA5E9); border-radius: 16px; padding: 16px; margin-top: 8px; color: white; text-align: center;">
                <div style="font-size: 12px; opacity: 0.9;">TOTAL GAJI BERSIH</div>
                <div style="font-size: 24px; font-weight: bold;">${formatRp(penggajian.totalGaji)}</div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
                <p style="font-size: 9px; color: #94a3b8;">✨ Terima kasih atas kerja keras Anda! ✨</p>
                <p style="font-size: 8px; color: #cbd5e1;">Slip Gaji - FasimCare+</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(tempDiv);
    
    try {
        // Cek apakah html2canvas tersedia
        if (typeof html2canvas === 'undefined') {
            throw new Error('html2canvas tidak tersedia');
        }
        
        // Konversi ke gambar
        const canvas = await html2canvas(tempDiv, {
            scale: 2, // Kualitas tinggi
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true
        });
        
        // Hapus element temporary
        document.body.removeChild(tempDiv);
        
        // Konversi canvas ke blob (file gambar)
        canvas.toBlob(async (blob) => {
            if (!blob) {
                throw new Error('Gagal membuat gambar');
            }
            
            // Coba share via Web Share API (untuk mobile)
            if (navigator.share && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
                const file = new File([blob], `slip_gaji_${penggajian.karyawanNama}.png`, { type: 'image/png' });
                try {
                    await navigator.share({
                        title: `Slip Gaji ${penggajian.karyawanNama}`,
                        text: `Slip gaji ${penggajian.karyawanNama} - ${bulanIndonesia}\nTotal: ${formatRp(penggajian.totalGaji)}`,
                        files: [file]
                    });
                    addNotification('success', 'Berhasil!', 'Slip gaji sudah dishare', 3000);
                    setLoading(false);
                    return;
                } catch (shareError) {
                    console.log('Share failed, fallback to download', shareError);
                }
            }
            
            // Fallback: Download gambar + buka WhatsApp
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `slip_gaji_${penggajian.karyawanNama}_${bulanIndonesia}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Buka WhatsApp dengan pesan
            const message = `📄 *SLIP GAJI* ${penggajian.karyawanNama} - ${bulanIndonesia}
            
Total: ${formatRp(penggajian.totalGaji)}
Status: ${penggajian.status === 'lunas' ? 'LUNAS' : 'BELUM DIBAYAR'}

📸 Screenshot slip gaji sudah terdownload. Silakan lampirkan gambarnya ya!`;

            const whatsappUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
            
            addNotification('success', 'Gambar Tersimpan', 'Slip gaji sudah didownload, lampirkan ke WhatsApp', 4000);
            setLoading(false);
        }, 'image/png', 0.95);
        
    } catch (error) {
        console.error('Screenshot error:', error);
        document.body.removeChild(tempDiv);
        addNotification('danger', 'Gagal', 'Gagal membuat gambar. Coba metode copy teks.', 3000);
        
        // Fallback ke copy teks
        const fallbackMessage = `📄 *SLIP GAJI* ${penggajian.karyawanNama} - ${bulanIndonesia}
Total: ${formatRp(penggajian.totalGaji)}
Status: ${penggajian.status === 'lunas' ? 'LUNAS' : 'BELUM'}

${userProfile.farmName || 'FasimCare+'}`;
        navigator.clipboard.writeText(fallbackMessage);
        addNotification('info', 'Teks Disalin', 'Gagal buat gambar, teks sudah disalin', 3000);
        setLoading(false);
    }
}, [selectedPenggajianForSlip, userProfile, addNotification, setLoading]);
// Regenerate gaji dengan force refresh - TAMBAHKAN FUNGSI BARU
const handleRegenerateGaji = useCallback((bulanTahun) => {
    if (confirm(`Hitung ulang semua gaji untuk ${moment(bulanTahun, 'YYYY-MM').format('MMMM YYYY')}?\n\nPerubahan absensi akan dihitung ulang.`)) {
        generatePenggajianBulanan(bulanTahun, true); // forceRefresh = true
    }
}, [generatePenggajianBulanan]);
        
// Share slip gaji ke Email
const handleShareToEmail = useCallback(() => {
    if (!selectedPenggajianForSlip) {
        alert('Tidak ada data slip gaji');
        return;
    }
    
    const penggajian = selectedPenggajianForSlip;
    const formatRp = (angka) => 'Rp ' + new Intl.NumberFormat('id-ID').format(angka || 0);
    const bulanIndonesia = moment(penggajian.periode, 'YYYY-MM').format('MMMM YYYY');
    
    const subject = `Slip Gaji ${penggajian.karyawanNama} - ${bulanIndonesia}`;
    
    const body = `
SLIP GAJI - ${userProfile.farmName || 'FASIMCARE+'}

================================

Nama: ${penggajian.karyawanNama}
Posisi: ${penggajian.posisi}
Periode: ${bulanIndonesia}
Status: ${penggajian.status === 'lunas' ? 'LUNAS' : 'BELUM DIBAYAR'}

================================
REKAP ABSENSI
================================
✅ Hadir: ${penggajian.absensi?.hadir || 0} hari
📝 Izin: ${penggajian.absensi?.izin || 0} hari
🤒 Sakit: ${penggajian.absensi?.sakit || 0} hari
⚠️ Alpha: ${penggajian.absensi?.alpha || 0} hari

================================
RINCIAN GAJI
================================
Gaji Pokok: ${formatRp(penggajian.gajiPokok)}
Tunjangan Makan: ${formatRp(penggajian.tunjanganMakan)}
Tunjangan Transport: ${formatRp(penggajian.tunjanganTransport)}
Tunjangan Jabatan: ${formatRp(penggajian.tunjanganJabatan)}
${penggajian.potonganAbsen > 0 ? `Potongan Alpha: -${formatRp(penggajian.potonganAbsen)}` : ''}
${penggajian.potonganIzin > 0 ? `Potongan Izin: -${formatRp(penggajian.potonganIzin)}` : ''}
${penggajian.bonusKehadiran > 0 ? `Bonus Kehadiran: +${formatRp(penggajian.bonusKehadiran)}` : ''}

================================
TOTAL GAJI: ${formatRp(penggajian.totalGaji)}
================================

${penggajian.tanggalBayar ? `Dibayar: ${moment(penggajian.tanggalBayar).format('DD MMM YYYY')}` : ''}

---
✨ Terima kasih atas kerja keras Anda!
FasimCare+ - Manajemen Peternakan Modern
    `;
    
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const emailUrl = `mailto:?subject=${encodedSubject}&body=${encodedBody}`;
    window.location.href = emailUrl;
    
    addNotification('success', 'Email', 'Aplikasi email akan terbuka', 2000);
}, [selectedPenggajianForSlip, userProfile, addNotification]);

// Share slip gaji (menu pilihan)
const handleShareSlip = useCallback(() => {
    if (!selectedPenggajianForSlip) {
        alert('Tidak ada data slip gaji');
        return;
    }
    
    // Tampilkan pilihan share
    const shareOption = confirm('Pilih metode share:\n\nOK = WhatsApp\nCancel = Email');
    
    if (shareOption) {
        handleShareToWhatsApp();
    } else {
        handleShareToEmail();
    }
}, [selectedPenggajianForSlip, handleShareToWhatsApp, handleShareToEmail]);
        
        // ==================== METRICS FUNCTIONS ====================
     const hitungMetrics = useCallback(() => {
    if (!selectedKandang) return;
    
    // Populasi
    const populasiKandang = populasiList.filter(p => p.kandangId === selectedKandang.id);
    const layerCount = populasiKandang.filter(p => p.jenis === 'layer').reduce((sum, p) => sum + (p.jumlah || 0), 0);
    const broilerCount = populasiKandang.filter(p => p.jenis === 'broiler').reduce((sum, p) => sum + (p.jumlah || 0), 0);
    setTotalPopulasi({ layer: layerCount, broiler: broilerCount, total: layerCount + broilerCount });
    
    // Produksi Telur
    const produksiHariIni = produksiTelur
        .filter(p => p.kandangId === selectedKandang.id && p.tanggal === new Date().toISOString().split('T')[0])
        .reduce((sum, p) => sum + (p.jumlah || 0), 0);
    const pendapatanTelur = produksiTelur
        .filter(p => p.kandangId === selectedKandang.id)
        .reduce((sum, p) => sum + (p.pendapatan || 0), 0);
    setProduksiHarian({ 
        jumlah: produksiHariIni, 
        berat: produksiHariIni * 0.06, 
        pendapatan: pendapatanTelur 
    });
    
    // Mortalitas
    const mortalitasLayer = populasiList.filter(p => p.jenis === 'layer' && p.status === 'mati').reduce((sum, p) => sum + (p.jumlah || 0), 0);
    const mortalitasBroiler = populasiList.filter(p => p.jenis === 'broiler' && p.status === 'mati').reduce((sum, p) => sum + (p.jumlah || 0), 0);
    const totalAwal = layerCount + broilerCount + mortalitasLayer + mortalitasBroiler;
    setMortalitas({ 
        layer: mortalitasLayer, 
        broiler: mortalitasBroiler, 
        persentase: totalAwal > 0 ? ((mortalitasLayer + mortalitasBroiler) / totalAwal) * 100 : 0 
    });
    
    // ========== KEUANGAN - DIPERBAIKI ==========
    // Hanya hitung dari kandang yang dipilih
    const totalPendapatan = produksiTelur
        .filter(p => p.kandangId === selectedKandang.id)
        .reduce((sum, p) => sum + (p.pendapatan || 0), 0) + 
        panenBroiler
        .filter(p => p.kandangId === selectedKandang.id)
        .reduce((sum, p) => sum + (p.totalPendapatan || 0), 0);
    
    const totalPembelianPakan = stokPakan.reduce((sum, p) => sum + (p.totalHarga || 0), 0);
    const totalPembelianObat = stokObat.reduce((sum, p) => sum + (p.totalHarga || 0), 0);
    const totalBiayaKaryawan = karyawanList.reduce((sum, k) => sum + (k.gaji || 0), 0);
    const totalPengeluaran = totalPembelianPakan + totalPembelianObat + totalBiayaKaryawan;
    
    setKeuangan({ 
        pendapatan: totalPendapatan, 
        pengeluaran: totalPengeluaran, 
        labaBersih: totalPendapatan - totalPengeluaran 
    });
    
    // Kesehatan
    const sakit = riwayatPenyakit.filter(r => r.status === 'aktif' && r.kandangId === selectedKandang.id).length;
    const sembuh = riwayatPenyakit.filter(r => r.status === 'sembuh' && r.kandangId === selectedKandang.id).length;
    setKesehatan({ sakit, sembuh, mati: mortalitasLayer + mortalitasBroiler });
    
    // FCR (Feed Conversion Ratio)
    const totalPakanTerpakai = pakanTerpakai
        .filter(p => p.kandangId === selectedKandang.id)
        .reduce((sum, p) => sum + (p.jumlah || 0), 0);
    const totalBeratPanen = panenBroiler
        .filter(p => p.kandangId === selectedKandang.id)
        .reduce((sum, p) => sum + (p.beratTotal || 0), 0);
    setKonversiPakan({ 
        nilai: totalBeratPanen > 0 ? totalPakanTerpakai / totalBeratPanen : 0, 
        totalPakan: totalPakanTerpakai, 
        totalBerat: totalBeratPanen 
    });
}, [selectedKandang, populasiList, produksiTelur, panenBroiler, stokPakan, stokObat, karyawanList, pakanTerpakai, riwayatPenyakit]);
        
  const updateChart = useCallback(() => {
            if (!chartCanvasRef.current || !selectedKandang) return;
            try {
                const ctx = chartCanvasRef.current.getContext('2d');
                if (chartInstance.current) {
                    try { chartInstance.current.destroy(); } catch(e) {}
                    chartInstance.current = null;
                }
                
                let data = [];
                let labels = [];
                
                if (selectedKandang.jenis === 'layer') {
                    const produksi7Hari = produksiTelur
                        .filter(p => p.kandangId === selectedKandang.id)
                        .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
                        .slice(-7);
                    labels = produksi7Hari.map(p => moment(p.tanggal).format('DD/MM'));
                    data = produksi7Hari.map(p => p.jumlah);
                } else {
                    const panen7Hari = panenBroiler
                        .filter(p => p.kandangId === selectedKandang.id)
                        .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
                        .slice(-7);
                    labels = panen7Hari.map(p => moment(p.tanggal).format('DD/MM'));
                    data = panen7Hari.map(p => p.beratTotal);
                }
                
                if (data.length === 0) return;
                
                if (typeof Chart !== 'undefined' && Chart) {
                    chartInstance.current = new Chart(ctx, {
                        type: 'line',
                        data: { 
                            labels, 
                            datasets: [{ 
                                label: selectedKandang.jenis === 'layer' ? 'Produksi Telur (butir)' : 'Berat Panen (kg)', 
                                data, 
                                borderColor: '#E65100', 
                                backgroundColor: 'rgba(230, 81, 0, 0.1)', 
                                tension: 0.4, 
                                fill: true 
                            }] 
                        },
                        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
                    });
                }
            } catch (e) { console.warn('Chart error:', e); }
        }, [produksiTelur, panenBroiler, selectedKandang]);
        
        useEffect(() => {
            if (!isAuthenticated || !selectedKandang) return;
            hitungMetrics();
            updateChart();
        }, [isAuthenticated, selectedKandang, populasiList, produksiTelur, panenBroiler, stokPakan, stokObat, karyawanList, pakanTerpakai, riwayatPenyakit, hitungMetrics, updateChart]);
        
// ==================== CHART KEUANGAN - DIPERBAIKI TOTAL ====================
useEffect(() => {
    if (!selectedKandang) return;
    if (!chartKeuanganCanvasRef.current) return;
    
    // Filter data berdasarkan kandang yang dipilih
    const filteredProduksiTelur = produksiTelur.filter(p => p.kandangId === selectedKandang.id);
    const filteredPanenBroiler = panenBroiler.filter(p => p.kandangId === selectedKandang.id);
    
    // Siapkan data 7 hari terakhir
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
        const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
        const pendapatanHari = [...filteredProduksiTelur, ...filteredPanenBroiler]
            .filter(p => p.tanggal === date)
            .reduce((sum, p) => sum + (p.pendapatan || p.totalPendapatan || 0), 0);
        last7Days.push({
            label: moment(date).format('DD/MM'),
            value: pendapatanHari
        });
    }
    
    // ✅ FIX: Cek apakah ada data
    const hasData = last7Days.some(d => d.value > 0);
    
    // ✅ FIX: Destroy instance lama dengan benar
    if (chartKeuanganInstance.current) {
        try {
            chartKeuanganInstance.current.destroy();
            chartKeuanganInstance.current = null;
        } catch(e) {
            console.warn('Destroy chart error:', e);
        }
    }
    
    // ✅ FIX: Hanya render jika ada data dan Chart tersedia
    if (hasData && typeof Chart !== 'undefined' && Chart) {
        const ctx = chartKeuanganCanvasRef.current.getContext('2d');
        
        chartKeuanganInstance.current = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: last7Days.map(d => d.label),
                datasets: [{
                    label: 'Pendapatan (Rp)',
                    data: last7Days.map(d => d.value),
                    backgroundColor: 'rgba(14, 165, 233, 0.7)',
                    borderColor: '#0EA5E9',
                    borderWidth: 1,
                    borderRadius: 6,
                    barPercentage: 0.7,
                    categoryPercentage: 0.8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let value = context.raw;
                                return 'Rp ' + new Intl.NumberFormat('id-ID').format(value);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                if (value >= 1000000000) return 'Rp ' + (value / 1000000000).toFixed(1) + 'M';
                                if (value >= 1000000) return 'Rp ' + (value / 1000000).toFixed(1) + 'Jt';
                                if (value >= 1000) return 'Rp ' + (value / 1000).toFixed(0) + 'K';
                                return 'Rp ' + value;
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        console.log('✅ Chart keuangan berhasil dirender');
    } else if (!hasData) {
        console.log('⚠️ Tidak ada data pendapatan untuk 7 hari terakhir');
        // ✅ FIX: Tampilkan pesan di canvas
        const ctx = chartKeuanganCanvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, chartKeuanganCanvasRef.current.width, chartKeuanganCanvasRef.current.height);
        ctx.font = '12px Inter';
        ctx.fillStyle = '#94A3B8';
        ctx.textAlign = 'center';
        ctx.fillText('Belum ada data pendapatan', chartKeuanganCanvasRef.current.width / 2, chartKeuanganCanvasRef.current.height / 2);
    }
}, [selectedKandang, produksiTelur, panenBroiler]);
        
// ==================== FEATURE CONTEXT ====================
// Buat context untuk dikirim ke scheduler.js, biayaproduksi.js, dan notifications.js
const featureContext = {
    // Scheduler state & setters
    schedules, setSchedules,
    showScheduleModal, setShowScheduleModal,
    selectedSchedule, setSelectedSchedule,
    scheduleFilter, setScheduleFilter,
    nextReminders, setNextReminders,
    showReminderPanel, setShowReminderPanel,
    
    // Biaya state & setters
    biayaProduksi, setBiayaProduksi,
    showBiayaModal, setShowBiayaModal,
    selectedBiaya, setSelectedBiaya,
    periodeBiaya, setPeriodeBiaya,
    hppData, setHppData,
    bepData, setBepData,
  
    // Data dari app
    selectedKandang,
    kandangList,
    produksiTelur,
    panenBroiler,
    populasiList,                  // ✅ Untuk mortalitas di laporan harian
    userProfile,
    isAuthenticated,
    
    // Helper functions
    generateUniqueId,
    saveToFirebase,
    saveToStorage,
    addNotification,
    formatRupiah
};
           

const loadUserDataAfterLogin = useCallback(async (userId) => {
    if (!userId) return false;
    setLoading(true);
    setSyncStatus('loading');
    
    try {
        const [kandang, populasi, telur, panen, pakan, pakanTerpakaiData, obat, obatTerpakaiData, vaksin, penyakit, karyawan, absensi, customer, supplier, piutang, hutang, transaksi, penggajian, schedules, biaya] = await Promise.all([
            loadFromFirebase('kandang', []),
            loadFromFirebase('populasi', []),
            loadFromFirebase('produksiTelur', []),
            loadFromFirebase('panenBroiler', []),
            loadFromFirebase('stokPakan', []),
            loadFromFirebase('pakanTerpakai', []),
            loadFromFirebase('stokObat', []),
            loadFromFirebase('obatTerpakai', []),
            loadFromFirebase('jadwalVaksin', []),
            loadFromFirebase('riwayatPenyakit', []),
            loadFromFirebase('karyawan', []),
            loadFromFirebase('absensi', []),
            loadFromFirebase('customer', []),
            loadFromFirebase('supplier', []),
            loadFromFirebase('piutang', []),
            loadFromFirebase('hutang', []),
            loadFromFirebase('transaksi', []),
            loadFromFirebase('penggajian', []),
            loadFromFirebase('schedules', []),
            loadFromFirebase('biayaProduksi', [])
        ]);
        
        const cleanKandang = deduplicateById(kandang);
        const cleanPopulasi = deduplicateById(populasi);
        const cleanTelur = deduplicateById(telur);
        const cleanPanen = deduplicateById(panen);
        const cleanPakan = deduplicateById(pakan);
        const cleanPakanTerpakai = deduplicateById(pakanTerpakaiData);
        const cleanObat = deduplicateById(obat);
        const cleanObatTerpakai = deduplicateById(obatTerpakaiData);
        const cleanVaksin = deduplicateById(vaksin);
        const cleanPenyakit = deduplicateById(penyakit);
        const cleanKaryawan = deduplicateById(karyawan);
        const cleanAbsensi = deduplicateById(absensi);
        const cleanCustomer = deduplicateById(customer);
        const cleanSupplier = deduplicateById(supplier);
        const cleanPiutang = deduplicateById(piutang);
        const cleanHutang = deduplicateById(hutang);
        const cleanTransaksi = deduplicateById(transaksi);
        const cleanPenggajian = deduplicateById(penggajian);
        const cleanSchedules = deduplicateById(schedules);
        const cleanBiaya = deduplicateById(biaya);
        
        setKandangList(cleanKandang);
        setPopulasiList(cleanPopulasi);
        setProduksiTelur(cleanTelur);
        setPanenBroiler(cleanPanen);
        setStokPakan(cleanPakan);
        setPakanTerpakai(cleanPakanTerpakai);
        setStokObat(cleanObat);
        setObatTerpakai(cleanObatTerpakai);
        setJadwalVaksin(cleanVaksin);
        setRiwayatPenyakit(cleanPenyakit);
        setKaryawanList(cleanKaryawan);
        setAbsensiHarian(cleanAbsensi);
        setCustomerList(cleanCustomer);
        setSupplierList(cleanSupplier);
        setPiutangList(cleanPiutang);
        setHutangList(cleanHutang);
        setTransaksiPenjualan(cleanTransaksi);
        setPenggajianList(cleanPenggajian);
        setSchedules(cleanSchedules);
        setBiayaProduksi(cleanBiaya);
        
        if (cleanKandang.length > 0) {
            setSelectedKandang(cleanKandang[0]);
        } else {
            setSelectedKandang(null);
        }
        
        setSyncStatus('synced');
        
        if (cleanKandang.length === 0) {
            addNotification('info', 'Selamat Datang!', 'Silakan buat kandang baru untuk memulai', 5000);
        }
        
        return true;
    } catch (error) {
        console.error('Load user data error:', error);
        setSyncStatus('offline');
        addNotification('danger', 'Gagal Memuat Data', error.message || 'Terjadi kesalahan', 4000);
        return false;
    } finally {
        setLoading(false);
    }
}, [loadFromFirebase, addNotification]);
        
        // Tambahkan setelah fungsi loadUserDataAfterLogin (sekitar baris 500-600)
const loadUserAnnouncements = useCallback(async () => {
    try {
        // Gunakan firestore dari window (sama seperti di konsultasi)
        const firestore = window.FasimCareFirebase?.db || (window.firebase?.firestore?.());
        if (!firestore) return;
        
        const snapshot = await firestore.collection('announcements')
            .orderBy('createdAt', 'desc')
            .limit(5)
            .get();
        
        const announcements = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                title: data.title || 'Pengumuman',
                content: data.content || '',
                type: data.type || 'info',
                createdAt: data.createdAt?.toDate?.() || new Date(),
                read: false
            };
        });
        
        // Load hidden announcements dari localStorage
        const savedHidden = localStorage.getItem(`fasimcare_hidden_announcements_${userProfile.id}`);
        if (savedHidden) {
            setHiddenAnnouncements(JSON.parse(savedHidden));
        }
        
        setUserAnnouncements(announcements);
        
        // Hitung unread count untuk badge notifikasi (opsional)
        const unreadCount = announcements.filter(a => {
            const readKey = `announcement_read_${userProfile.id}_${a.id}`;
            return !localStorage.getItem(readKey);
        }).length;
        
        if (unreadCount > 0) {
            setUnreadCount(prev => prev + unreadCount);
        }
        
    } catch(e) {
        console.warn('Load announcements error:', e);
    }
}, [userProfile.id]);     
        // ==================== LOGIN FUNCTIONS ====================
        const handleLogin = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const email = formData.get('email');
            const password = formData.get('password');
            const name = formData.get('name');
            const farmName = formData.get('farmName');
            const isRegister = formData.get('isRegister') === 'true';
            
            setLoading(true);
            
            try {
                if (isRegister) {
                    if (window.FasimCareFirebase && window.FasimCareFirebase.register) {
                        const result = await window.FasimCareFirebase.register(email, password, name, farmName);
                        if (result.success) {
                            const newUserProfile = {
                                id: result.user.id,
                                name: result.user.name,
                                email: result.user.email,
                                farmName: result.user.farmName,
                                settings: { hargaTelurPerKg: 25000, hargaAyamPerKg: 30000 },
                                farmAddress: '',
                                farmPhone: '',
                                phone: '',
                                address: '',
                                avatar: DEFAULT_AVATAR
                            };
                            setUserProfile(newUserProfile);
                            setIsAuthenticated(true);
                            await loadUserDataAfterLogin(result.user.id);
                            addNotification('success', 'Selamat Datang!', `Halo ${name}! Silakan buat kandang baru untuk memulai`, 5000);
                        } else {
                            addNotification('danger', 'Gagal Daftar', result.error || 'Terjadi kesalahan', 4000);
                        }
                    } else {
                        addNotification('danger', 'Error', 'Firebase tidak tersedia', 4000);
                    }
                } else {
                    if (window.FasimCareFirebase && window.FasimCareFirebase.login) {
                        const result = await window.FasimCareFirebase.login(email, password);
                        if (result.success) {
                            const newUserProfile = {
                                id: result.user.id,
                                name: result.user.name,
                                email: result.user.email,
                                farmName: result.user.farmName,
                                settings: result.user.settings || { hargaTelurPerKg: 25000, hargaAyamPerKg: 30000 },
                                farmAddress: result.user.farmAddress || '',
                                farmPhone: result.user.farmPhone || '',
                                phone: result.user.phone || '',
                                address: result.user.address || '',
                                avatar: result.user.avatar || DEFAULT_AVATAR
                            };
                            setUserProfile(newUserProfile);
                            setIsAuthenticated(true);
                            await loadUserDataAfterLogin(result.user.id);
                            addNotification('success', 'Selamat Datang Kembali!', `Halo ${result.user.name}!`, 3000);
                        } else {
                            addNotification('danger', 'Gagal Login', result.error || 'Email atau password salah', 4000);
                        }
                    } else {
                        addNotification('danger', 'Error', 'Firebase tidak tersedia', 4000);
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                addNotification('danger', 'Error', error.message || 'Terjadi kesalahan', 4000);
            } finally {
                setLoading(false);
                setShowModal(false);
            }
        };
        
       const handleLogout = async () => {
    setLoading(true);
    try {
        // Stop notification service jika ada
        if (window.NotificationFeature) {
            window.NotificationFeature.stopNotificationService();
        }
        
        if (window.FasimCareFirebase && window.FasimCareFirebase.logout) {
            await window.FasimCareFirebase.logout();
        }
        
        const userId = userProfile.id;
        if (userId && !userId.startsWith('local_')) {
            const keysToRemove = [
                `fasimcare_${userId}_kandang`, `fasimcare_${userId}_populasi`, `fasimcare_${userId}_produksiTelur`,
                `fasimcare_${userId}_panenBroiler`, `fasimcare_${userId}_stokPakan`, `fasimcare_${userId}_pakanTerpakai`,
                `fasimcare_${userId}_stokObat`, `fasimcare_${userId}_obatTerpakai`, `fasimcare_${userId}_jadwalVaksin`,
                `fasimcare_${userId}_riwayatPenyakit`, `fasimcare_${userId}_karyawan`, `fasimcare_${userId}_absensi`,
                `fasimcare_${userId}_customer`, `fasimcare_${userId}_supplier`, `fasimcare_${userId}_piutang`,
                `fasimcare_${userId}_hutang`, `fasimcare_${userId}_transaksi`, `fasimcare_${userId}_penggajian`,
                `fasimcare_${userId}_schedules`, `fasimcare_${userId}_biayaProduksi`  // ✅ TAMBAH: schedules & biaya
            ];
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        
        localStorage.removeItem('fasimcare_current_user');
        
        setIsAuthenticated(false);
        setUserProfile({ id: '', name: '', email: '', farmName: '', farmAddress: '', farmPhone: '', avatar: DEFAULT_AVATAR, settings: { hargaTelurPerKg: 25000, hargaAyamPerKg: 30000 } });
        setKandangList([]);
        setSelectedKandang(null);
        setPopulasiList([]);
        setProduksiTelur([]);
        setPanenBroiler([]);
        setStokPakan([]);
        setPakanTerpakai([]);
        setStokObat([]);
        setObatTerpakai([]);
        setJadwalVaksin([]);
        setRiwayatPenyakit([]);
        setKaryawanList([]);
        setAbsensiHarian([]);
        setCustomerList([]);
        setSupplierList([]);
        setPiutangList([]);
        setHutangList([]);
        setTransaksiPenjualan([]);
        setPenggajianList([]);
        setSchedules([]);                    // ✅ CLEAR schedules
        setBiayaProduksi([]);                // ✅ CLEAR biaya
        setChatMessages([]);
        setNotifications([]);
        setUnreadCount(0);
        setShowFABPanel(false);
        setShowAIChat(false);
        setShowProfileMenu(false);
        setShowNotifications(false);

        addNotification('success', 'Logout Berhasil', 'Sampai jumpa lagi! 🐔', 3000);
    } catch (error) {
        console.error('Logout error:', error);
        addNotification('danger', 'Logout Error', error.message || 'Terjadi kesalahan', 4000);
    } finally {
        setLoading(false);
    }
};
        
        // ==================== TOGGLE FUNCTIONS ====================
        const toggleDarkMode = useCallback(() => {
            setIsDarkMode(prev => !prev);
            if (!isDarkMode) {
                document.documentElement.classList.add('dark-mode');
            } else {
                document.documentElement.classList.remove('dark-mode');
            }
            localStorage.setItem('fasimcare_dark_mode', !isDarkMode);
            addNotification('info', 'Mode Tampilan', isDarkMode ? 'Mode Terang' : 'Mode Gelap', 2000);
        }, [isDarkMode, addNotification]);
        
        // ==================== SWIPE FUNCTIONS ====================
        const panelSwipeStartRef = useRef({ y: 0, isSwiping: false, panelName: null });

        const handlePanelSwipeStart = useCallback((e, panelName) => {
            const touch = e.touches ? e.touches[0] : e;
            panelSwipeStartRef.current = { y: touch.clientY, isSwiping: true, panelName: panelName, startTransform: 0 };
            const panel = document.querySelector(`.${panelName}`);
            if (panel) {
                panel.classList.add('swiping-down');
                panel.style.transition = 'transform 0.1s ease-out';
            }
        }, []);

        const handlePanelSwipeMove = useCallback((e) => {
            if (!panelSwipeStartRef.current.isSwiping) return;
            const touch = e.touches ? e.touches[0] : e;
            const deltaY = touch.clientY - panelSwipeStartRef.current.y;
            if (deltaY > 0) {
                e.preventDefault();
                const panel = document.querySelector(`.${panelSwipeStartRef.current.panelName}`);
                if (panel) {
                    const translateY = Math.min(deltaY, 200);
                    panel.style.transform = `translateY(${translateY}px)`;
                    const indicator = panel.querySelector('.swipe-indicator');
                    if (indicator) {
                        indicator.style.opacity = 1 - (translateY / 150);
                        indicator.style.width = `${40 + (translateY / 5)}px`;
                    }
                }
            }
        }, []);

        const handlePanelSwipeEnd = useCallback((e) => {
            if (!panelSwipeStartRef.current.isSwiping) return;
            const touch = e.changedTouches ? e.changedTouches[0] : e;
            const deltaY = touch.clientY - panelSwipeStartRef.current.y;
            const panelName = panelSwipeStartRef.current.panelName;
            const panel = document.querySelector(`.${panelName}`);
            
            if (panel) {
                panel.classList.remove('swiping-down');
                panel.style.transition = '';
                if (deltaY > 80) {
    panel.style.transform = '';
    if (panelName === 'notifications-panel') setShowNotifications(false);
    else if (panelName === 'profile-menu') setShowProfileMenu(false);
    else if (panelName === 'fab-panel') setShowFABPanel(false);  // ← TAMBAHKAN INI
} else {
    panel.style.transform = '';
}
                const indicator = panel.querySelector('.swipe-indicator');
                if (indicator) {
                    indicator.style.opacity = '';
                    indicator.style.width = '';
                }
            }
            panelSwipeStartRef.current = { y: 0, isSwiping: false, panelName: null };
        }, [setShowNotifications, setShowProfileMenu]);

        useEffect(() => {
            const handleGlobalTouchMove = (e) => { if (panelSwipeStartRef.current.isSwiping) handlePanelSwipeMove(e); };
            const handleGlobalTouchEnd = (e) => { if (panelSwipeStartRef.current.isSwiping) handlePanelSwipeEnd(e); };
            window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
            window.addEventListener('touchend', handleGlobalTouchEnd);
            return () => {
                window.removeEventListener('touchmove', handleGlobalTouchMove);
                window.removeEventListener('touchend', handleGlobalTouchEnd);
            };
        }, [handlePanelSwipeMove, handlePanelSwipeEnd]);
        
        // ==================== CREATE FUNCTIONS ====================
        const handleTambahKandang = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const newKandang = {
                id: generateUniqueId(),
                nama: formData.get('nama'),
                jenis: formData.get('jenis'),
                kapasitas: parseInt(formData.get('kapasitas')) || 0,
                luas: parseFloat(formData.get('luas')) || 0,
                lokasi: formData.get('lokasi') || '',
                status: 'aktif',
                tanggalIsi: formData.get('tanggalIsi') || new Date().toISOString().split('T')[0]
            };
            
            setKandangList(prev => {
                const updatedList = [...prev, newKandang];
                saveToFirebase('kandang', updatedList);
                saveToStorage('kandang', updatedList);
                return updatedList;
            });
            
            setSelectedKandang(newKandang);
            setShowModal(false);
            addNotification('success', 'Kandang Ditambahkan', newKandang.nama, 3000);
        };
        
        const handleTambahPopulasi = (e) => {
            e.preventDefault();
            if (!selectedKandang) {
                addNotification('danger', 'Error', 'Pilih kandang terlebih dahulu', 3000);
                return;
            }
            const formData = new FormData(e.target);
            const newPopulasi = {
                id: generateUniqueId(),
                tanggal: formData.get('tanggal') || new Date().toISOString().split('T')[0],
                jumlah: parseInt(formData.get('jumlah')) || 0,
                jenis: selectedKandang.jenis,
                umur: parseInt(formData.get('umur')) || 0,
                status: 'aktif',
                kandangId: selectedKandang.id,
                kandangNama: selectedKandang.nama,
                catatan: formData.get('catatan') || ''
            };
            setPopulasiList(prev => {
                const updated = [newPopulasi, ...prev];
                saveToFirebase('populasi', updated);
                saveToStorage('populasi', updated);
                return updated;
            });
            setShowModal(false);
            addNotification('success', 'Populasi Ditambahkan', formatAyam(newPopulasi.jumlah), 3000);
        };
        
    const handleInputProduksiTelur = (e) => {
    e.preventDefault();
    if (!selectedKandang || selectedKandang.jenis !== 'layer') {
        addNotification('danger', 'Error', 'Hanya untuk kandang layer (petelur)', 3000);
        return;
    }
    
    const formData = new FormData(e.target);
    const satuan = formData.get('satuan') || 'butir';
    const jumlahInput = parseFloat(formData.get('jumlah')) || 0;
    
    if (jumlahInput <= 0) {
        addNotification('danger', 'Error', 'Jumlah harus lebih dari 0', 3000);
        return;
    }
    
    const hargaPerKg = parseInt(formData.get('hargaPerKg')) || userProfile.settings.hargaTelurPerKg;
    const BERAT_PER_BUTIR = 0.06; // 60 gram = 0.06 kg
    
    let jumlahButir = 0;
    let beratTotal = 0;
    
    if (satuan === 'butir') {
        // Input dalam BUTIR
        jumlahButir = Math.round(jumlahInput);
        beratTotal = jumlahButir * BERAT_PER_BUTIR;
    } else {
        // Input dalam KG
        beratTotal = jumlahInput;
        jumlahButir = Math.round(beratTotal / BERAT_PER_BUTIR);
    }
    
    if (jumlahButir <= 0) {
        addNotification('danger', 'Error', 'Jumlah tidak valid', 3000);
        return;
    }
    
    const newProduksi = {
        id: generateUniqueId(),
        tanggal: formData.get('tanggal') || new Date().toISOString().split('T')[0],
        satuan: satuan,                    // ✅ FIX: 'satuan' BUKAN 'saturan'
        jumlahInput: jumlahInput,
        jumlah: jumlahButir,
        beratTotal: beratTotal,
        hargaPerKg: hargaPerKg,
        pendapatan: beratTotal * hargaPerKg,
        kandangId: selectedKandang.id,
        kandangNama: selectedKandang.nama,
        catatan: formData.get('catatan') || ''
    };
    
    setProduksiTelur(prev => {
        const updated = [newProduksi, ...prev];
        saveToFirebase('produksiTelur', updated);
        saveToStorage('produksiTelur', updated);
        return updated;
    });
    
    setShowModal(false);
    
    const displayText = satuan === 'butir' 
        ? `${jumlahButir.toLocaleString()} butir (${beratTotal.toFixed(1)} kg)`
        : `${beratTotal.toFixed(1)} kg (≈ ${jumlahButir.toLocaleString()} butir)`;
    
    addNotification('success', 'Produksi Telur', displayText, 3000);
};     
      
      const handleInputPanenBroiler = (e) => {
    e.preventDefault();
    if (!selectedKandang || selectedKandang.jenis !== 'broiler') {
        addNotification('danger', 'Error', 'Hanya untuk kandang broiler (pedaging)', 3000);
        return;
    }
    const formData = new FormData(e.target);
    let jumlahEkor = parseInt(formData.get('jumlahEkor')) || 0;
    let beratRata = parseFloat(formData.get('beratRata')) || 0;
    let beratTotal = jumlahEkor * beratRata;
    const hargaPerKg = parseInt(formData.get('hargaPerKg')) || userProfile.settings.hargaAyamPerKg;
    
    // Ambil field baru
    const namaDO = formData.get('namaDO') || '';
    const platMobil = formData.get('platMobil') || '';
    
    if (jumlahEkor <= 0 || beratRata <= 0) {
        addNotification('danger', 'Error', 'Jumlah ekor dan berat rata-rata harus diisi', 3000);
        return;
    }
    
    const newPanen = {
        id: generateUniqueId(),
        tanggal: formData.get('tanggal') || new Date().toISOString().split('T')[0],
        jumlahEkor: jumlahEkor,
        beratRata: beratRata,
        beratTotal: beratTotal,
        hargaPerKg: hargaPerKg,
        totalPendapatan: beratTotal * hargaPerKg,
        kandangId: selectedKandang.id,
        kandangNama: selectedKandang.nama,
        namaDO: namaDO,           // ✅ BARU
        platMobil: platMobil,     // ✅ BARU
        catatan: formData.get('catatan') || ''
    };
    
    setPanenBroiler(prev => {
        const updated = [newPanen, ...prev];
        saveToFirebase('panenBroiler', updated);
        saveToStorage('panenBroiler', updated);
        return updated;
    });
    setShowModal(false);
    addNotification('success', 'Panen Ditambahkan', `${jumlahEkor} ekor (${beratTotal} kg)`, 3000);
};
        
        const handleTambahStokPakan = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const jenis = formData.get('jenis');
            const jumlah = parseFloat(formData.get('jumlah')) || 0;
            const harga = parseFloat(formData.get('harga')) || 0;
            
            if (jumlah <= 0 || harga <= 0) {
                addNotification('danger', 'Error', 'Jumlah dan harga harus lebih dari 0', 3000);
                return;
            }
            
            setStokPakan(prev => {
                const existingStok = prev.find(s => s.jenis === jenis);
                let updated;
                if (existingStok) {
                    updated = prev.map(s => s.jenis === jenis ? { ...s, stok: s.stok + jumlah, totalHarga: s.totalHarga + (jumlah * harga) } : s);
                } else {
                    updated = [...prev, { id: generateUniqueId(), jenis, stok: jumlah, totalHarga: jumlah * harga }];
                }
                saveToFirebase('stokPakan', updated);
                saveToStorage('stokPakan', updated);
                return updated;
            });
            addNotification('success', 'Stok Pakan', `${jumlah} kg ${jenis} ditambahkan`, 3000);
            setShowModal(false);
        };
        
        // ==================== UPDATE STOK PAKAN - DIPERBAIKI ====================
const handleTambahPakanTerpakai = (e) => {
    e.preventDefault();
    if (!selectedKandang) {
        addNotification('danger', 'Error', 'Pilih kandang terlebih dahulu', 3000);
        return;
    }
    const formData = new FormData(e.target);
    const jenis = formData.get('jenis');
    const jumlah = parseFloat(formData.get('jumlah')) || 0;
    const tanggal = formData.get('tanggal') || new Date().toISOString().split('T')[0];
    
    if (jumlah <= 0) {
        addNotification('danger', 'Error', 'Jumlah harus lebih dari 0', 3000);
        return;
    }
    
    const stokItem = stokPakan.find(s => s.jenis === jenis);
    if (!stokItem || stokItem.stok < jumlah) {
        addNotification('warning', 'Stok Tidak Cukup', `Stok ${jenis} hanya ${stokItem?.stok || 0} kg`, 3000);
        return;
    }
    
    // ✅ FIX: Update stok dengan Promise untuk memastikan sinkronisasi
    const newStok = stokPakan.map(s => 
        s.jenis === jenis ? { ...s, stok: s.stok - jumlah } : s
    ).filter(s => s.stok > 0);
    
    // Update stok pakan
    setStokPakan(newStok);
    saveToFirebase('stokPakan', newStok);
    saveToStorage('stokPakan', newStok);
    
    // Tambah record pakan terpakai
    const newPakanTerpakai = {
        id: generateUniqueId(),
        tanggal, jenis, jumlah,
        kandangId: selectedKandang.id,
        kandangNama: selectedKandang.nama,
        keterangan: formData.get('keterangan') || ''
    };
    
    setPakanTerpakai(prev => {
        const updated = [newPakanTerpakai, ...prev];
        saveToFirebase('pakanTerpakai', updated);
        saveToStorage('pakanTerpakai', updated);
        return updated;
    });
    
    // ✅ FIX: Hitung ulang metrics setelah update stok
    setTimeout(() => hitungMetrics(), 100);
    
    addNotification('success', 'Pakan Terpakai', `${jumlah} kg ${jenis} diberikan`, 3000);
    setShowModal(false);
};
        
        const handleTambahStokObat = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const jenis = formData.get('jenis');
            const jumlah = parseFloat(formData.get('jumlah')) || 0;
            const harga = parseFloat(formData.get('harga')) || 0;
            
            if (jumlah <= 0 || harga <= 0) {
                addNotification('danger', 'Error', 'Jumlah dan harga harus lebih dari 0', 3000);
                return;
            }
            
            setStokObat(prev => {
                const existingStok = prev.find(s => s.jenis === jenis);
                let updated;
                if (existingStok) {
                    updated = prev.map(s => s.jenis === jenis ? { ...s, stok: s.stok + jumlah, totalHarga: s.totalHarga + (jumlah * harga) } : s);
                } else {
                    updated = [...prev, { id: generateUniqueId(), jenis, stok: jumlah, totalHarga: jumlah * harga }];
                }
                saveToFirebase('stokObat', updated);
                saveToStorage('stokObat', updated);
                return updated;
            });
            addNotification('success', 'Stok Obat', `${jumlah} ${jenis} ditambahkan`, 3000);
            setShowModal(false);
        };
        
        const handleTambahObatTerpakai = (e) => {
            e.preventDefault();
            if (!selectedKandang) {
                addNotification('danger', 'Error', 'Pilih kandang terlebih dahulu', 3000);
                return;
            }
            const formData = new FormData(e.target);
            const jenis = formData.get('jenis');
            const jumlah = parseFloat(formData.get('jumlah')) || 0;
            const tanggal = formData.get('tanggal') || new Date().toISOString().split('T')[0];
            
            if (jumlah <= 0) {
                addNotification('danger', 'Error', 'Jumlah harus lebih dari 0', 3000);
                return;
            }
            
            const stokItem = stokObat.find(s => s.jenis === jenis);
            if (!stokItem || stokItem.stok < jumlah) {
                addNotification('warning', 'Stok Tidak Cukup', `Stok ${jenis} hanya ${stokItem?.stok || 0}`, 3000);
                return;
            }
            
            setStokObat(prev => {
                const updatedStok = prev.map(s => s.jenis === jenis ? { ...s, stok: s.stok - jumlah } : s).filter(s => s.stok > 0);
                saveToFirebase('stokObat', updatedStok);
                saveToStorage('stokObat', updatedStok);
                return updatedStok;
            });
            
            const newObatTerpakai = {
                id: generateUniqueId(),
                tanggal, jenis, jumlah,
                kandangId: selectedKandang.id,
                kandangNama: selectedKandang.nama,
                keterangan: formData.get('keterangan') || ''
            };
            setObatTerpakai(prev => {
                const updated = [newObatTerpakai, ...prev];
                saveToFirebase('obatTerpakai', updated);
                saveToStorage('obatTerpakai', updated);
                return updated;
            });
            addNotification('success', 'Obat Terpakai', `${jumlah} ${jenis} digunakan`, 3000);
            setShowModal(false);
        };
        
        const handleTambahJadwalVaksin = (e) => {
            e.preventDefault();
            if (!selectedKandang) {
                addNotification('danger', 'Error', 'Pilih kandang terlebih dahulu', 3000);
                return;
            }
            const formData = new FormData(e.target);
            const newVaksin = {
                id: generateUniqueId(),
                nama: formData.get('nama'),
                tanggal: formData.get('tanggal') || new Date().toISOString().split('T')[0],
                metode: formData.get('metode') || 'Suntik',
                dosis: formData.get('dosis') || '',
                status: 'terjadwal',
                kandangId: selectedKandang.id,
                kandangNama: selectedKandang.nama,
                catatan: formData.get('catatan') || ''
            };
            setJadwalVaksin(prev => {
                const updated = [newVaksin, ...prev];
                saveToFirebase('jadwalVaksin', updated);
                saveToStorage('jadwalVaksin', updated);
                return updated;
            });
            setShowModal(false);
            addNotification('success', 'Jadwal Vaksin', newVaksin.nama, 3000);
        };
        
        const handleTambahPenyakit = (e) => {
            e.preventDefault();
            if (!selectedKandang) {
                addNotification('danger', 'Error', 'Pilih kandang terlebih dahulu', 3000);
                return;
            }
            const formData = new FormData(e.target);
            const newPenyakit = {
                id: generateUniqueId(),
                nama: formData.get('nama'),
                tingkat: formData.get('tingkat') || 'Ringan',
                jumlahTerserang: parseInt(formData.get('jumlahTerserang')) || 0,
                tanggal: formData.get('tanggal') || new Date().toISOString().split('T')[0],
                tindakan: formData.get('tindakan') || '',
                status: 'aktif',
                kandangId: selectedKandang.id,
                kandangNama: selectedKandang.nama
            };
            setRiwayatPenyakit(prev => {
                const updated = [newPenyakit, ...prev];
                saveToFirebase('riwayatPenyakit', updated);
                saveToStorage('riwayatPenyakit', updated);
                return updated;
            });
            setShowModal(false);
            addNotification('warning', 'Penyakit Terdeteksi', newPenyakit.nama, 3000);
        };
        
        const handleTambahKaryawan = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const newKaryawan = {
                id: generateUniqueId(),
                nama: formData.get('nama'),
                posisi: formData.get('posisi'),
                gaji: parseInt(formData.get('gaji')) || 0,
                noHp: formData.get('noHp') || '',
                shift: formData.get('shift') || 'pagi'
            };
            setKaryawanList(prev => {
                const updated = [...prev, newKaryawan];
                saveToFirebase('karyawan', updated);
                saveToStorage('karyawan', updated);
                return updated;
            });
            setShowModal(false);
            addNotification('success', 'Karyawan Ditambahkan', newKaryawan.nama, 3000);
        };
        
        const handleAbsensi = (karyawanId, status) => {
            const today = new Date().toISOString().split('T')[0];
            const karyawan = karyawanList.find(k => k.id === karyawanId);
            
            setAbsensiHarian(prev => {
                const existingIndex = prev.findIndex(a => a.karyawanId === karyawanId && a.tanggal === today);
                let updated;
                if (existingIndex >= 0) {
                    updated = prev.map((a, i) => i === existingIndex ? { ...a, status } : a);
                } else {
                    updated = [...prev, { id: generateUniqueId(), karyawanId, karyawanNama: karyawan?.nama, tanggal: today, status }];
                }
                saveToFirebase('absensi', updated);
                saveToStorage('absensi', updated);
                return updated;
            });
            addNotification('success', 'Absensi', `${status === 'hadir' ? 'Hadir' : status} dicatat`, 2000);
        };
        
        const handleTambahCustomer = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const newCustomer = {
                id: generateUniqueId(),
                nama: formData.get('nama'),
                noHp: formData.get('noHp') || '',
                alamat: formData.get('alamat') || ''
            };
            setCustomerList(prev => {
                const updated = [...prev, newCustomer];
                saveToFirebase('customer', updated);
                saveToStorage('customer', updated);
                return updated;
            });
            setShowModal(false);
            addNotification('success', 'Customer Ditambahkan', newCustomer.nama, 3000);
        };
        
        const handleTambahSupplier = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const newSupplier = {
                id: generateUniqueId(),
                nama: formData.get('nama'),
                noHp: formData.get('noHp') || '',
                alamat: formData.get('alamat') || '',
                produk: formData.get('produk') || 'Pakan'
            };
            setSupplierList(prev => {
                const updated = [...prev, newSupplier];
                saveToFirebase('supplier', updated);
                saveToStorage('supplier', updated);
                return updated;
            });
            setShowModal(false);
            addNotification('success', 'Supplier Ditambahkan', newSupplier.nama, 3000);
        };
        
        const handleSimpanTransaksi = (e) => {
            e.preventDefault();
            if (transaksiItems.length === 0) {
                addNotification('danger', 'Error', 'Minimal 1 item', 3000);
                return;
            }
            const formData = new FormData(e.target);
            const noFaktur = formData.get('noFaktur') || `INV/${moment().format('YYYYMMDD')}/${Math.floor(Math.random() * 1000)}`;
            const totalBayar = transaksiItems.reduce((sum, item) => sum + item.subtotal, 0);
            const totalBerat = transaksiItems.reduce((sum, item) => sum + item.kg, 0);
            
            const newTransaksi = {
                id: generateUniqueId(),
                noFaktur,
                tanggal: formData.get('tanggal') || new Date().toISOString().split('T')[0],
                pembeli: formData.get('pembeli') || 'Umum',
                metodePembayaran: formData.get('metodePembayaran') || 'Tunai',
                catatan: formData.get('catatan') || '',
                items: [...transaksiItems],
                totalBayar,
                totalBerat
            };
            setTransaksiPenjualan(prev => {
                const updated = [newTransaksi, ...prev];
                saveToFirebase('transaksi', updated);
                saveToStorage('transaksi', updated);
                return updated;
            });
            setTransaksiItems([]);
            setEditingItemIndex(null);
            setItemKg('');
            setItemHarga('');
            setShowModal(false);
            addNotification('success', 'Transaksi Tersimpan', `${noFaktur} - ${formatRupiah(totalBayar)}`, 3000);
        };
        
        const handleTambahItemTransaksi = () => {
            const kg = parseFloat(itemKg);
            const harga = parseFloat(itemHarga);
            if (isNaN(kg) || kg <= 0 || isNaN(harga) || harga <= 0) {
                addNotification('danger', 'Error', 'Berat dan harga harus diisi', 3000);
                return;
            }
            const subtotal = kg * harga;
            if (editingItemIndex !== null) {
                const updatedItems = [...transaksiItems];
                updatedItems[editingItemIndex] = { id: generateUniqueId(), grade: selectedKandang?.jenis === 'layer' ? 'Telur' : 'Ayam', kg, hargaKg: harga, subtotal };
                setTransaksiItems(updatedItems);
                setEditingItemIndex(null);
            } else {
                setTransaksiItems([...transaksiItems, { id: generateUniqueId(), grade: selectedKandang?.jenis === 'layer' ? 'Telur' : 'Ayam', kg, hargaKg: harga, subtotal }]);
            }
            setItemKg('');
            setItemHarga('');
        };
        
        // ==================== UPDATE FUNCTIONS (EDIT MODE) ====================
        const handleEditItem = useCallback((type, item) => {
    setEditMode(true);
    setModalData(item);
    
    // Peta yang benar untuk modalType
    const modalTypeMap = {
        populasi: 'populasi_edit',
        produksiTelur: 'produksiTelur_edit',
        panenBroiler: 'panenBroiler_edit',
        stokPakan: 'stokPakan_edit',
        pakanTerpakai: 'pakanTerpakai_edit',
        stokObat: 'stokObat_edit',
        obatTerpakai: 'obatTerpakai_edit',
        jadwalVaksin: 'jadwalVaksin_edit',
        penyakit: 'penyakit_edit',
        karyawan: 'karyawan_edit',
        customer: 'customer_edit',
        supplier: 'supplier_edit',
        transaksi: 'transaksi_edit',
        kandang: 'kandang_edit'
    };
    
    const mappedType = modalTypeMap[type];
    if (mappedType) {
        // KHUSUS untuk transaksi edit, reset state item terlebih dahulu
        if (type === 'transaksi') {
            // Reset item list biar tidak tercampur dengan data sebelumnya
            setTransaksiItems([]);
        }
        setModalType(mappedType);
        setShowModal(true);
    } else {
        console.warn('Unknown edit type:', type);
        addNotification('danger', 'Error', 'Tipe data tidak dikenal', 2000);
    }
}, [addNotification]);
        
        const handleUpdateKandang = async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updatedKandang = {
                ...modalData,
                nama: formData.get('nama'),
                jenis: formData.get('jenis'),
                kapasitas: parseInt(formData.get('kapasitas')) || 0,
                luas: parseFloat(formData.get('luas')) || 0,
                lokasi: formData.get('lokasi') || '',
                status: 'aktif',
                tanggalIsi: formData.get('tanggalIsi')
            };
            
            setKandangList(prev => {
                const updated = prev.map(k => k.id === modalData.id ? updatedKandang : k);
                saveToFirebase('kandang', updated);
                saveToStorage('kandang', updated);
                return updated;
            });
            
            if (selectedKandang?.id === modalData.id) {
                setSelectedKandang(updatedKandang);
            }
            
            setShowModal(false);
            setEditMode(false);
            setModalData(null);
            addNotification('success', 'Kandang Diupdate', updatedKandang.nama, 3000);
        };
        
        const handleUpdatePopulasi = (e) => {
            e.preventDefault();
            if (!selectedKandang) return;
            const formData = new FormData(e.target);
            const updatedPopulasi = {
                ...modalData,
                tanggal: formData.get('tanggal') || modalData.tanggal,
                jumlah: parseInt(formData.get('jumlah')) || 0,
                umur: parseInt(formData.get('umur')) || 0,
                status: formData.get('status') || 'aktif',
                catatan: formData.get('catatan') || ''
            };
            
            setPopulasiList(prev => {
                const updated = prev.map(p => p.id === modalData.id ? updatedPopulasi : p);
                saveToFirebase('populasi', updated);
                saveToStorage('populasi', updated);
                return updated;
            });
            
            setShowModal(false);
            setEditMode(false);
            setModalData(null);
            addNotification('success', 'Populasi Diupdate', formatAyam(updatedPopulasi.jumlah), 3000);
        };
        
        const handleUpdateProduksiTelur = (e) => {
            e.preventDefault();
            if (!selectedKandang) return;
            const formData = new FormData(e.target);
            let jumlah = parseInt(formData.get('jumlah')) || 0;
            const hargaPerKg = parseInt(formData.get('hargaPerKg')) || userProfile.settings.hargaTelurPerKg;
            const beratPerButir = 0.06;
            const beratTotal = jumlah * beratPerButir;
            
            const updatedProduksi = {
                ...modalData,
                tanggal: formData.get('tanggal') || modalData.tanggal,
                jumlah: jumlah,
                beratTotal: beratTotal,
                hargaPerKg: hargaPerKg,
                pendapatan: beratTotal * hargaPerKg,
                catatan: formData.get('catatan') || ''
            };
            
            setProduksiTelur(prev => {
                const updated = prev.map(p => p.id === modalData.id ? updatedProduksi : p);
                saveToFirebase('produksiTelur', updated);
                saveToStorage('produksiTelur', updated);
                return updated;
            });
            
            setShowModal(false);
            setEditMode(false);
            setModalData(null);
            addNotification('success', 'Produksi Telur Diupdate', formatTelur(jumlah), 3000);
        };
        
     const handleUpdatePanenBroiler = (e) => {
    e.preventDefault();
    if (!selectedKandang) return;
    const formData = new FormData(e.target);
    let jumlahEkor = parseInt(formData.get('jumlahEkor')) || 0;
    let beratRata = parseFloat(formData.get('beratRata')) || 0;
    let beratTotal = jumlahEkor * beratRata;
    const hargaPerKg = parseInt(formData.get('hargaPerKg')) || userProfile.settings.hargaAyamPerKg;
    
    // Ambil field baru
    const namaDO = formData.get('namaDO') || '';
    const platMobil = formData.get('platMobil') || '';
    
    const updatedPanen = {
        ...modalData,
        tanggal: formData.get('tanggal') || modalData.tanggal,
        jumlahEkor: jumlahEkor,
        beratRata: beratRata,
        beratTotal: beratTotal,
        hargaPerKg: hargaPerKg,
        totalPendapatan: beratTotal * hargaPerKg,
        namaDO: namaDO,           // ✅ BARU
        platMobil: platMobil,     // ✅ BARU
        catatan: formData.get('catatan') || ''
    };
    
    setPanenBroiler(prev => {
        const updated = prev.map(p => p.id === modalData.id ? updatedPanen : p);
        saveToFirebase('panenBroiler', updated);
        saveToStorage('panenBroiler', updated);
        return updated;
    });
    
    setShowModal(false);
    setEditMode(false);
    setModalData(null);
    addNotification('success', 'Panen Broiler Diupdate', `${jumlahEkor} ekor`, 3000);
};
        
        const handleUpdatePakanTerpakai = (e) => {
            e.preventDefault();
            if (!selectedKandang) return;
            const formData = new FormData(e.target);
            const updatedPakan = {
                ...modalData,
                tanggal: formData.get('tanggal') || modalData.tanggal,
                jenis: formData.get('jenis'),
                jumlah: parseFloat(formData.get('jumlah')) || 0,
                keterangan: formData.get('keterangan') || ''
            };
            
            setPakanTerpakai(prev => {
                const updated = prev.map(p => p.id === modalData.id ? updatedPakan : p);
                saveToFirebase('pakanTerpakai', updated);
                saveToStorage('pakanTerpakai', updated);
                return updated;
            });
            
            setShowModal(false);
            setEditMode(false);
            setModalData(null);
            addNotification('success', 'Pakan Terpakai Diupdate', `${updatedPakan.jumlah} kg`, 3000);
        };
        
        const handleUpdateStokObat = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const stokBaru = parseFloat(formData.get('stok')) || 0;
            const hargaBaru = parseFloat(formData.get('harga')) || 0;
            const updatedStok = {
                ...modalData,
                jenis: formData.get('jenis'),
                stok: stokBaru,
                totalHarga: stokBaru * hargaBaru
            };
            
            setStokObat(prev => {
                const updated = prev.map(s => s.id === modalData.id ? updatedStok : s);
                saveToFirebase('stokObat', updated);
                saveToStorage('stokObat', updated);
                return updated;
            });
            
            setShowModal(false);
            setEditMode(false);
            setModalData(null);
            addNotification('success', 'Stok Obat Diupdate', updatedStok.jenis, 3000);
        };
        
const handleUpdateStokPakan = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const stokBaru = parseFloat(formData.get('stok')) || 0;
    const hargaBaru = parseFloat(formData.get('harga')) || 0;
    const updatedStok = {
        ...modalData,
        jenis: formData.get('jenis'),
        stok: stokBaru,
        totalHarga: stokBaru * hargaBaru
    };
    
    setStokPakan(prev => {
        const updated = prev.map(s => s.id === modalData.id ? updatedStok : s);
        saveToFirebase('stokPakan', updated);
        saveToStorage('stokPakan', updated);
        return updated;
    });
    
    setShowModal(false);
    setEditMode(false);
    setModalData(null);
    addNotification('success', 'Stok Pakan Diupdate', updatedStok.jenis, 3000);
};
        
        const handleUpdateObatTerpakai = (e) => {
            e.preventDefault();
            if (!selectedKandang) return;
            const formData = new FormData(e.target);
            const updatedObat = {
                ...modalData,
                tanggal: formData.get('tanggal') || modalData.tanggal,
                jenis: formData.get('jenis'),
                jumlah: parseFloat(formData.get('jumlah')) || 0,
                keterangan: formData.get('keterangan') || ''
            };
            
            setObatTerpakai(prev => {
                const updated = prev.map(o => o.id === modalData.id ? updatedObat : o);
                saveToFirebase('obatTerpakai', updated);
                saveToStorage('obatTerpakai', updated);
                return updated;
            });
            
            setShowModal(false);
            setEditMode(false);
            setModalData(null);
            addNotification('success', 'Obat Terpakai Diupdate', `${updatedObat.jumlah}`, 3000);
        };
        
        const handleUpdateJadwalVaksin = (e) => {
            e.preventDefault();
            if (!selectedKandang) return;
            const formData = new FormData(e.target);
            const updatedVaksin = {
                ...modalData,
                nama: formData.get('nama'),
                tanggal: formData.get('tanggal') || modalData.tanggal,
                metode: formData.get('metode') || 'Suntik',
                dosis: formData.get('dosis') || '',
                status: formData.get('status') || 'terjadwal',
                catatan: formData.get('catatan') || ''
            };
            
            setJadwalVaksin(prev => {
                const updated = prev.map(v => v.id === modalData.id ? updatedVaksin : v);
                saveToFirebase('jadwalVaksin', updated);
                saveToStorage('jadwalVaksin', updated);
                return updated;
            });
            
            setShowModal(false);
            setEditMode(false);
            setModalData(null);
            addNotification('success', 'Jadwal Vaksin Diupdate', updatedVaksin.nama, 3000);
        };
        
        const handleUpdatePenyakit = (e) => {
            e.preventDefault();
            if (!selectedKandang) return;
            const formData = new FormData(e.target);
            const updatedPenyakit = {
                ...modalData,
                nama: formData.get('nama'),
                tingkat: formData.get('tingkat') || 'Ringan',
                jumlahTerserang: parseInt(formData.get('jumlahTerserang')) || 0,
                tanggal: formData.get('tanggal') || modalData.tanggal,
                tindakan: formData.get('tindakan') || '',
                status: formData.get('status') || 'aktif'
            };
            
            setRiwayatPenyakit(prev => {
                const updated = prev.map(p => p.id === modalData.id ? updatedPenyakit : p);
                saveToFirebase('riwayatPenyakit', updated);
                saveToStorage('riwayatPenyakit', updated);
                return updated;
            });
            
            setShowModal(false);
            setEditMode(false);
            setModalData(null);
            addNotification('success', 'Penyakit Diupdate', updatedPenyakit.nama, 3000);
        };
        
        const handleUpdateKaryawan = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updatedKaryawan = {
                ...modalData,
                nama: formData.get('nama'),
                posisi: formData.get('posisi'),
                gaji: parseInt(formData.get('gaji')) || 0,
                noHp: formData.get('noHp') || '',
                shift: formData.get('shift') || 'pagi'
            };
            
            setKaryawanList(prev => {
                const updated = prev.map(k => k.id === modalData.id ? updatedKaryawan : k);
                saveToFirebase('karyawan', updated);
                saveToStorage('karyawan', updated);
                return updated;
            });
            
            setShowModal(false);
            setEditMode(false);
            setModalData(null);
            addNotification('success', 'Karyawan Diupdate', updatedKaryawan.nama, 3000);
        };
        
        const handleUpdateCustomer = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updatedCustomer = {
                ...modalData,
                nama: formData.get('nama'),
                noHp: formData.get('noHp') || '',
                alamat: formData.get('alamat') || ''
            };
            
            setCustomerList(prev => {
                const updated = prev.map(c => c.id === modalData.id ? updatedCustomer : c);
                saveToFirebase('customer', updated);
                saveToStorage('customer', updated);
                return updated;
            });
            
            setShowModal(false);
            setEditMode(false);
            setModalData(null);
            addNotification('success', 'Customer Diupdate', updatedCustomer.nama, 3000);
        };
        
        const handleUpdateSupplier = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updatedSupplier = {
                ...modalData,
                nama: formData.get('nama'),
                noHp: formData.get('noHp') || '',
                alamat: formData.get('alamat') || '',
                produk: formData.get('produk') || 'Pakan'
            };
            
            setSupplierList(prev => {
                const updated = prev.map(s => s.id === modalData.id ? updatedSupplier : s);
                saveToFirebase('supplier', updated);
                saveToStorage('supplier', updated);
                return updated;
            });
            
            setShowModal(false);
            setEditMode(false);
            setModalData(null);
            addNotification('success', 'Supplier Diupdate', updatedSupplier.nama, 3000);
        };
        
        const handleUpdateTransaksi = (e) => {
    e.preventDefault();
    
    // Ambil nilai dari DOM menggunakan getElementById (karena modal pakai id)
    const pembeli = document.getElementById('transaksi_pembeli')?.value || '';
    const noFaktur = document.getElementById('transaksi_nofaktur')?.value || modalData.noFaktur;
    const tanggal = document.getElementById('transaksi_tanggal')?.value || modalData.tanggal;
    const metodePembayaran = document.getElementById('transaksi_metode')?.value || modalData.metodePembayaran;
    const catatan = document.getElementById('transaksi_catatan')?.value || '';
    
    // Gunakan itemList (state dari modal) atau modalData.items
    // Karena itemList tidak bisa diakses dari luar modal, kita ambil dari state transaksiItems
    const itemsToUse = transaksiItems.length > 0 ? transaksiItems : (modalData.items || []);
    const totalBayar = itemsToUse.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    const totalBerat = itemsToUse.reduce((sum, item) => sum + (item.kg || 0), 0);
    
    const updatedTransaksi = {
        ...modalData,
        noFaktur,
        tanggal,
        pembeli,
        metodePembayaran,
        catatan,
        items: itemsToUse,
        totalBayar,
        totalBerat
    };
    
    setTransaksiPenjualan(prev => {
        const updated = prev.map(t => t.id === modalData.id ? updatedTransaksi : t);
        saveToFirebase('transaksi', updated);
        saveToStorage('transaksi', updated);
        return updated;
    });
    
    // Reset
    setTransaksiItems([]);
    setEditingItemIndex(null);
    setShowModal(false);
    setEditMode(false);
    setModalData(null);
    addNotification('success', 'Transaksi Diupdate', updatedTransaksi.noFaktur, 3000);
};
             
     // ==================== DELETE FUNCTIONS ====================
const handleDeleteItem = useCallback((type, id, name = '') => {
    console.log('handleDeleteItem dipanggil:', type, id, name);
    
    if (type === 'transaksi') {
        // Hapus transaksi
        setTransaksiPenjualan(prev => {
            const updated = prev.filter(item => item.id !== id);
            // Simpan ke storage dan firebase
            saveToStorage('transaksi', updated);
            if (!userProfile.id.startsWith('local_')) {
                saveToFirebase('transaksi', updated);
            }
            return updated;
        });
        addNotification('success', 'Transaksi Dihapus', name ? `Transaksi ${name} berhasil dihapus` : 'Transaksi berhasil dihapus', 3000);
        return;
    }
    
    if (type === 'kandang') {
        console.log('Menghapus kandang dengan ID:', id);
        
        // Hapus semua data terkait kandang ini
        setPopulasiList(prev => prev.filter(p => p.kandangId !== id));
        setProduksiTelur(prev => prev.filter(p => p.kandangId !== id));
        setPanenBroiler(prev => prev.filter(p => p.kandangId !== id));
        setPakanTerpakai(prev => prev.filter(p => p.kandangId !== id));
        setObatTerpakai(prev => prev.filter(p => p.kandangId !== id));
        setJadwalVaksin(prev => prev.filter(p => p.kandangId !== id));
        setRiwayatPenyakit(prev => prev.filter(p => p.kandangId !== id));
        
        // Hapus kandang
        setKandangList(prev => { 
            const updated = prev.filter(k => k.id !== id); 
            saveToStorage('kandang', updated);
            if (!userProfile.id.startsWith('local_')) {
                saveToFirebase('kandang', updated);
            }
            if (selectedKandang && selectedKandang.id === id) {
                setSelectedKandang(updated[0] || null);
            }
            return updated;
        });
        
        addNotification('success', 'Kandang Dihapus', (name || 'Kandang') + ' berhasil dihapus', 3000);
        return;
    }
    
    // Untuk tipe lainnya
    const updateAndSave = (stateSetter, collection) => {
        stateSetter(prev => {
            const updated = prev.filter(item => item.id !== id);
            saveToStorage(collection, updated);
            if (!userProfile.id.startsWith('local_')) {
                saveToFirebase(collection, updated);
            }
            return updated;
        });
    };
    
    const deleteActions = {
        populasi: () => updateAndSave(setPopulasiList, 'populasi'),
        produksiTelur: () => updateAndSave(setProduksiTelur, 'produksiTelur'),
        panenBroiler: () => updateAndSave(setPanenBroiler, 'panenBroiler'),
        stokPakan: () => updateAndSave(setStokPakan, 'stokPakan'),
        pakanTerpakai: () => updateAndSave(setPakanTerpakai, 'pakanTerpakai'),
        stokObat: () => updateAndSave(setStokObat, 'stokObat'),
        obatTerpakai: () => updateAndSave(setObatTerpakai, 'obatTerpakai'),
        jadwalVaksin: () => updateAndSave(setJadwalVaksin, 'jadwalVaksin'),
        penyakit: () => updateAndSave(setRiwayatPenyakit, 'riwayatPenyakit'),
        karyawan: () => updateAndSave(setKaryawanList, 'karyawan'),
        customer: () => updateAndSave(setCustomerList, 'customer'),
        supplier: () => updateAndSave(setSupplierList, 'supplier')
    };
    
    if (deleteActions[type]) { 
        deleteActions[type](); 
        addNotification('success', type + ' Dihapus', (name || 'Data') + ' berhasil dihapus', 3000);
    } else {
        console.warn('Unknown delete type:', type);
        addNotification('danger', 'Error', 'Tipe data tidak dikenal', 2000);
    }
}, [selectedKandang, userProfile.id, addNotification, saveToStorage, saveToFirebase]);
 
        // ==================== PROFILE FUNCTIONS ====================
        const handleAvatarChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 500000) {
                    addNotification('danger', 'Error', 'Ukuran foto maksimal 500KB', 3000);
                    return;
                }
                const reader = new FileReader();
                reader.onloadend = () => { 
                    setAvatarPreview(reader.result); 
                    setUserProfile(prev => ({ ...prev, avatar: reader.result })); 
                };
                reader.readAsDataURL(file);
            }
        };
        
        const handleUpdateProfile = (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updatedProfile = {
                ...userProfile,
                name: formData.get('name') || userProfile.name,
                phone: formData.get('phone') || '',
                address: formData.get('address') || '',
                farmName: formData.get('farmName') || userProfile.farmName,
                farmAddress: formData.get('farmAddress') || userProfile.farmAddress,
                farmPhone: formData.get('farmPhone') || userProfile.farmPhone,
                avatar: avatarPreview || userProfile.avatar,
                settings: { 
                    ...userProfile.settings, 
                    hargaTelurPerKg: parseInt(formData.get('hargaTelurPerKg')) || 25000,
                    hargaAyamPerKg: parseInt(formData.get('hargaAyamPerKg')) || 30000
                }
            };
            setUserProfile(updatedProfile);
            localStorage.setItem('fasimcare_current_user', JSON.stringify(updatedProfile));
            if (window.FasimCareFirebase && !userProfile.id.startsWith('local_')) {
                window.FasimCareFirebase.saveProfile(userProfile.id, updatedProfile);
            }
            setShowModal(false);
            addNotification('success', 'Profil Diupdate', 'Data profil telah diperbarui', 3000);
        };
        
        // ==================== EXPORT FUNCTIONS ====================
        const exportDataToCSV = useCallback((type) => {
            let data = [];
            let filename = '';
            switch(type) {
                case 'produksiTelur': 
                    data = produksiTelur.filter(p => p.kandangId === selectedKandang?.id); 
                    filename = `produksi_telur_${moment().format('YYYY-MM-DD')}.csv`; 
                    break;
                case 'panenBroiler': 
                    data = panenBroiler.filter(p => p.kandangId === selectedKandang?.id); 
                    filename = `panen_broiler_${moment().format('YYYY-MM-DD')}.csv`; 
                    break;
                case 'transaksi': 
                    data = transaksiPenjualan; 
                    filename = `transaksi_${moment().format('YYYY-MM-DD')}.csv`; 
                    break;
                case 'keuangan': 
                    data = [{ pendapatan: keuangan.pendapatan, pengeluaran: keuangan.pengeluaran, labaBersih: keuangan.labaBersih, fcr: konversiPakan.nilai }]; 
                    filename = `keuangan_${moment().format('YYYY-MM-DD')}.csv`; 
                    break;
                default: return;
            }
            if (data.length === 0) { 
                addNotification('warning', 'Tidak ada data', 'Tidak ada data untuk diexport', 3000); 
                return; 
            }
            const headers = Object.keys(data[0]);
            const csvRows = [headers.join(',')];
            for (const row of data) { 
                const values = headers.map(header => `"${String(row[header] || '').replace(/"/g, '""')}"`); 
                csvRows.push(values.join(',')); 
            }
            const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; 
            a.download = filename;
            document.body.appendChild(a); 
            a.click(); 
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            addNotification('success', 'Export Berhasil', `Data ${type} telah diexport`, 3000);
        }, [produksiTelur, panenBroiler, transaksiPenjualan, selectedKandang, keuangan, konversiPakan.nilai, addNotification]);
        
        // ==================== RESI FUNCTIONS ====================
        
        // RESI SEDERHANA (Struk Mini) - DIPERBAIKI
        const generateResiHTML = useCallback((transaksi, farmData) => {
            const formatRp = (angka) => 'Rp ' + new Intl.NumberFormat('id-ID').format(angka || 0);
            const itemsHtml = transaksi.items.map((item, idx) => `
                <tr><td style="text-align:center;padding:8px 4px;">${idx + 1}</td>
                <td style="padding:8px 4px;">${item.grade || (selectedKandang?.jenis === 'layer' ? 'Telur' : 'Ayam')}</td>
                <td style="text-align:center;padding:8px 4px;">${item.kg.toFixed(2)}</td>
                <td style="text-align:right;padding:8px 4px;">${formatRp(item.hargaKg)}</td>
                <td style="text-align:right;padding:8px 4px;">${formatRp(item.subtotal)}</td>
             </>
            `).join('');
            
            return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Resi ${transaksi.noFaktur}</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'Courier New',monospace;font-size:12px;padding:20px;width:350px;margin:0 auto;background:#f4f4f4;}
        .resi-container{background:white;padding:16px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);}
        .header{text-align:center;margin-bottom:16px;border-bottom:1px dashed #000;padding-bottom:8px;}
        .header h2{font-size:18px;letter-spacing:2px;margin-bottom:4px;color:#0284C7;}
        .header p{font-size:10px;margin:2px 0;}
        .info-row{display:flex;justify-content:space-between;margin:6px 0;font-size:11px;}
        .divider{border-top:1px dashed #000;margin:12px 0;}
        table{width:100%;border-collapse:collapse;margin:8px 0;font-size:10px;}
        th,td{text-align:left;}
        th{border-bottom:1px solid #000;padding:8px 4px;font-size:10px;}
        td{padding:6px 4px;}
        .total-row{display:flex;justify-content:space-between;font-weight:bold;font-size:13px;margin:12px 0;padding-top:8px;border-top:1px dashed #000;}
        .footer{text-align:center;margin-top:16px;font-size:9px;border-top:1px dashed #000;padding-top:8px;}
        .print-button{background:#0284C7;color:white;border:none;border-radius:8px;padding:10px 20px;margin:8px;cursor:pointer;font-size:12px;font-weight:bold;}
        .print-button:hover{background:#0369a1;}
        @media print{
            body{background:white;padding:0;margin:0;}
            .resi-container{box-shadow:none;padding:0;}
            .no-print{display:none;}
        }
    </style>
</head>
<body>
    <div class="resi-container">
        <div class="header">
            <h2>${farmData.farmName || 'FASIMCARE+'}</h2>
            <p>${farmData.farmAddress || 'Jl. Peternakan No. 123'}</p>
            <p>Telp: ${farmData.farmPhone || '0812-3456-7890'}</p>
            <p style="font-size:10px;margin-top:4px;">${transaksi.noFaktur}</p>
        </div>
        <div class="info-row"><span>Tanggal:</span><span>${moment(transaksi.tanggal).format('DD/MM/YYYY')}</span></div>
        <div class="info-row"><span>Pembeli:</span><span>${transaksi.pembeli || 'Umum'}</span></div>
        <div class="info-row"><span>Metode Bayar:</span><span>${transaksi.metodePembayaran || 'Tunai'}</span></div>
        <div class="divider"></div>
        <table>
            <thead>
                <tr><th>#</th><th>Grade</th><th>Kg</th><th>Harga</th><th>Subtotal</th></tr>
            </thead>
            <tbody>${itemsHtml}</tbody>
        </table>
        <div class="divider"></div>
        <div class="info-row"><span>Total Berat:</span><span>${(transaksi.totalBerat || 0).toFixed(2)} kg</span></div>
        <div class="total-row"><span>TOTAL:</span><span>${formatRp(transaksi.totalBayar)}</span></div>
        ${transaksi.catatan ? `<div class="info-row" style="margin-top:8px;"><span>Catatan:</span><span style="max-width:200px;text-align:right;">${transaksi.catatan}</span></div>` : ''}
        <div class="footer">
            <p>Terima kasih atas pembelian Anda!</p>
            <p>*** Simpan struk ini sebagai bukti ***</p>
        </div>
        <div class="no-print" style="margin-top:20px;text-align:center;">
            <button onclick="window.print()" class="print-button">🖨️ Cetak Resi</button>
            <button onclick="window.close()" style="background:#e2e8f0;border:none;border-radius:8px;padding:10px 20px;margin:8px;cursor:pointer;">✖️ Tutup</button>
        </div>
    </div>
</body>
</html>`;
        }, [selectedKandang]);
        
        // INVOICE PREMIUM (Faktur Profesional)
        const generateInvoiceHTML = useCallback((transaksi, farmData) => {
            const formatRp = (angka) => 'Rp ' + new Intl.NumberFormat('id-ID').format(angka || 0);
            const bulanIndonesia = moment(transaksi.tanggal).format('DD MMMM YYYY');
            
            return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>INVOICE ${transaksi.noFaktur}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background: #f0f9ff;
            padding: 30px 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }
        .invoice-container {
            max-width: 800px;
            width: 100%;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        .invoice-header {
            background: linear-gradient(135deg, #0284C7 0%, #38BDF8 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .invoice-header h1 {
            font-size: 28px;
            margin-bottom: 8px;
            letter-spacing: 2px;
        }
        .invoice-header p {
            font-size: 12px;
            opacity: 0.9;
            margin: 4px 0;
        }
        .invoice-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 11px;
            margin-top: 12px;
        }
        .invoice-body {
            padding: 30px;
        }
        .info-section {
            display: flex;
            justify-content: space-between;
            background: #f8fafc;
            padding: 16px 20px;
            border-radius: 12px;
            margin-bottom: 24px;
            flex-wrap: wrap;
            gap: 16px;
        }
        .info-box p {
            margin: 4px 0;
            font-size: 13px;
        }
        .info-box strong {
            color: #0284C7;
        }
        .table-container {
            overflow-x: auto;
            margin: 24px 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th {
            background: #f1f5f9;
            padding: 12px;
            text-align: left;
            font-size: 13px;
            font-weight: 600;
            color: #1e293b;
            border-bottom: 2px solid #e2e8f0;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 13px;
            color: #334155;
        }
        .text-right {
            text-align: right;
        }
        .total-section {
            background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
            padding: 20px;
            border-radius: 12px;
            margin-top: 20px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
        }
        .total-grand {
            display: flex;
            justify-content: space-between;
            padding-top: 12px;
            margin-top: 8px;
            border-top: 2px solid #0284C7;
            font-weight: 700;
            font-size: 18px;
            color: #0284C7;
        }
        .footer {
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 11px;
            color: #64748b;
        }
        .print-actions {
            padding: 16px 30px 30px;
            display: flex;
            gap: 12px;
            justify-content: center;
            background: white;
            border-top: 1px solid #e2e8f0;
        }
        .btn-print, .btn-close {
            padding: 10px 24px;
            border-radius: 40px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            border: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .btn-print {
            background: linear-gradient(135deg, #0284C7, #0EA5E9);
            color: white;
        }
        .btn-close {
            background: #e2e8f0;
            color: #475569;
        }
        .btn-print:hover, .btn-close:hover {
            transform: scale(1.02);
            transition: transform 0.1s ease;
        }
        @media print {
            body {
                background: white;
                padding: 0;
                margin: 0;
            }
            .invoice-container {
                box-shadow: none;
                border-radius: 0;
            }
            .print-actions {
                display: none;
            }
        }
        @media (max-width: 480px) {
            .invoice-body {
                padding: 20px;
            }
            .info-section {
                flex-direction: column;
                gap: 12px;
            }
            th, td {
                padding: 8px;
                font-size: 11px;
            }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-header">
            <h1>${farmData.farmName || 'FASIMCARE+'}</h1>
            <p>${farmData.farmAddress || 'Jl. Peternakan No. 123, Indonesia'}</p>
            <p>📞 ${farmData.farmPhone || '0812-3456-7890'} | ✉️ ${farmData.email || 'info@fasimcare.com'}</p>
            <div class="invoice-badge">
                🧾 INVOICE
            </div>
        </div>
        
        <div class="invoice-body">
            <div class="info-section">
                <div class="info-box">
                    <p><strong>📄 No. Faktur</strong></p>
                    <p>${transaksi.noFaktur}</p>
                </div>
                <div class="info-box">
                    <p><strong>📅 Tanggal</strong></p>
                    <p>${bulanIndonesia}</p>
                </div>
                <div class="info-box">
                    <p><strong>👤 Pembeli</strong></p>
                    <p>${transaksi.pembeli || 'Umum'}</p>
                </div>
                <div class="info-box">
                    <p><strong>💳 Metode Bayar</strong></p>
                    <p>${transaksi.metodePembayaran || 'Tunai'}</p>
                </div>
            </div>
            
            <div class="table-container">
                <table>
                    <thead>
                        <tr><th>#</th><th>Item</th><th class="text-right">Berat (kg)</th><th class="text-right">Harga/kg</th><th class="text-right">Subtotal</th></tr>
                    </thead>
                    <tbody>
                        ${transaksi.items.map((item, i) => `
                        <tr>
                            <td>${i+1}</td>
                            <td>${item.grade || (selectedKandang?.jenis === 'layer' ? 'Telur Ayam' : 'Ayam Broiler')}</td>
                            <td class="text-right">${item.kg.toFixed(2)}</td>
                            <td class="text-right">${formatRp(item.hargaKg)}</td>
                            <td class="text-right">${formatRp(item.subtotal)}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="total-section">
                <div class="total-row">
                    <span>Total Berat</span>
                    <span><strong>${(transaksi.totalBerat || 0).toFixed(2)} kg</strong></span>
                </div>
                ${transaksi.catatan ? `
                <div class="total-row">
                    <span>Catatan</span>
                    <span style="font-size:12px;max-width:250px;text-align:right;">${transaksi.catatan}</span>
                </div>
                ` : ''}
                <div class="total-grand">
                    <span>TOTAL BAYAR</span>
                    <span>${formatRp(transaksi.totalBayar)}</span>
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p>✨ Terima kasih atas kepercayaan Anda! ✨</p>
            <p>*** INVOICE INI SEBAGAI BUKTI TRANSAKSI SAH ***</p>
            <p style="margin-top: 8px;">${moment().format('DD/MM/YYYY HH:mm:ss')}</p>
        </div>
        
        <div class="print-actions">
            <button class="btn-print" onclick="window.print()">
                🖨️ Cetak Invoice
            </button>
            <button class="btn-close" onclick="window.close()">
                ✖️ Tutup
            </button>
        </div>
    </div>
</body>
</html>`;
        }, [selectedKandang]);
        
        // Fungsi Cetak Resi (Sederhana) - Langsung
        const handlePrintResiSimple = useCallback((transaksi) => {
            if (!transaksi) {
                addNotification('warning', 'Error', 'Tidak ada data transaksi', 2000);
                return;
            }
            
            const htmlContent = generateResiHTML(transaksi, userProfile);
            const printWindow = window.open('', '_blank', 'width=400,height=600,menubar=yes,toolbar=yes');
            
            if (!printWindow) {
                addNotification('warning', 'Popup Diblokir', 'Izinkan popup untuk website ini', 4000);
                return;
            }
            
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            addNotification('success', 'Resi Dibuka', 'Silakan cetak dari halaman yang terbuka', 2000);
        }, [userProfile, generateResiHTML, addNotification]);
        
        // Fungsi Cetak Invoice Premium
        const handlePrintInvoice = useCallback((transaksi) => {
            if (!transaksi) {
                addNotification('warning', 'Error', 'Tidak ada data transaksi', 2000);
                return;
            }
            
            const htmlContent = generateInvoiceHTML(transaksi, userProfile);
            const printWindow = window.open('', '_blank', 'width=800,height=700,menubar=yes,toolbar=yes');
            
            if (!printWindow) {
                addNotification('warning', 'Popup Diblokir', 'Izinkan popup untuk website ini', 4000);
                return;
            }
            
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            addNotification('success', 'Invoice Dibuka', 'Silakan cetak dari halaman yang terbuka', 2000);
        }, [userProfile, generateInvoiceHTML, addNotification]);
        
        // Cetak Resi dari modal (existing)
        const handleCetakResiPrint = useCallback(() => {
            if (!selectedTransaksi) return;
            handlePrintResiSimple(selectedTransaksi);
        }, [selectedTransaksi, handlePrintResiSimple]);
        
        // Cetak Invoice dari modal
        const handleCetakInvoiceFromModal = useCallback(() => {
            if (!selectedTransaksi) return;
            handlePrintInvoice(selectedTransaksi);
        }, [selectedTransaksi, handlePrintInvoice]);
        
        
    const getFarmContext = useCallback(() => {
    if (!selectedKandang) return null;
    
    const today = new Date().toISOString().split('T')[0];
    const isLayer = selectedKandang.jenis === 'layer';
    const isBroiler = selectedKandang.jenis === 'broiler';
    
    // Hitung produksi hari ini dari produksiTelur (bukan produksiHarian)
    const produksiHariIni = produksiTelur.find(p => 
        p.tanggal === today && p.kandangId === selectedKandang.id
    );
    
    // Hitung produksi 7 hari terakhir
    const produksi7Hari = produksiTelur
        .filter(p => p.kandangId === selectedKandang.id)
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal))
        .slice(0, 7);
    
    const rataProduksi7Hari = produksi7Hari.length > 0 
        ? produksi7Hari.reduce((sum, p) => sum + p.jumlah, 0) / produksi7Hari.length 
        : 0;
    
    // Hitung total pakan terpakai
    const totalPakanTerpakai = pakanTerpakai
        .filter(p => p.kandangId === selectedKandang.id)
        .reduce((sum, p) => sum + (p.jumlah || 0), 0);
    
    // Hitung total mortalitas
    const totalMortalitas = populasiList
        .filter(p => p.kandangId === selectedKandang.id && p.status === 'mati')
        .reduce((sum, p) => sum + (p.jumlah || 0), 0);
    
    // Hitung populasi awal
    const populasiAwal = populasiList
        .filter(p => p.kandangId === selectedKandang.id && p.status === 'aktif')
        .reduce((sum, p) => sum + (p.jumlah || 0), 0);
    
    const persenProduksi = populasiAwal > 0 
        ? ((produksiHariIni?.jumlah || 0) / populasiAwal * 100).toFixed(1)
        : 0;
    
    // Hitung laba bersih dari keuangan state
    const labaBersih = keuangan.labaBersih || 0;
    
    // KONTEKS KHUSUS LAYER
    if (isLayer) {
        return `=== DATA PETERNAKAN AYAM LAYER (PETELUR) ===
📊 Jenis Kandang: LAYER - Ayam Petelur
🐔 Nama Kandang: ${selectedKandang.nama}
📏 Populasi: ${populasiAwal?.toLocaleString() || 0} ekor
📅 Umur Ayam: ${selectedKandang.umur || 0} hari
🌡️ Suhu Kandang: ${selectedKandang.suhu || 0}°C

🥚 PRODUKSI TELUR:
- Hari ini: ${produksiHariIni?.jumlah || 0} butir (${persenProduksi}% Hen Day)
- Rata-rata 7 hari: ${rataProduksi7Hari.toFixed(0)} butir/hari

🍽️ PAKAN & FCR:
- Total pakan terpakai: ${totalPakanTerpakai} kg
- FCR Telur: ${konversiPakan.nilai || 0} (target ideal < 2.2)

💀 MORTALITAS:
- Total mati: ${totalMortalitas} ekor

💰 KEUANGAN:
- Laba bersih: Rp ${(labaBersih || 0).toLocaleString()}`;
    }
    
    // KONTEKS KHUSUS BROILER
    if (isBroiler) {
        const totalBeratPanen = panenBroiler
            .filter(p => p.kandangId === selectedKandang.id)
            .reduce((sum, p) => sum + (p.beratTotal || 0), 0);
        
        return `=== DATA PETERNAKAN AYAM BROILER (PEDAGING) ===
📊 Jenis Kandang: BROILER - Ayam Pedaging
🐓 Nama Kandang: ${selectedKandang.nama}
📏 Populasi: ${populasiAwal?.toLocaleString() || 0} ekor
📅 Umur Ayam: ${selectedKandang.umur || 0} hari
🌡️ Suhu Kandang: ${selectedKandang.suhu || 0}°C

🍗 PRODUKSI DAGING:
- Total panen: ${totalBeratPanen} kg

🍽️ PAKAN & FCR:
- Total pakan terpakai: ${totalPakanTerpakai} kg
- FCR Daging: ${konversiPakan.nilai || 0} (target ideal < 1.7)

💀 MORTALITAS:
- Total mati: ${totalMortalitas} ekor

💰 KEUANGAN:
- Laba bersih: Rp ${(labaBersih || 0).toLocaleString()}`;
    }
    
    // DEFAULT
    return `=== DATA PETERNAKAN AYAM ===
📊 Nama Kandang: ${selectedKandang.nama}
🐔 Populasi: ${populasiAwal?.toLocaleString() || 0} ekor
📅 Umur Ayam: ${selectedKandang.umur || 0} hari
🍽️ Total pakan terpakai: ${totalPakanTerpakai} kg
💀 Mortalitas: ${totalMortalitas} ekor
💰 Laba bersih: Rp ${(labaBersih || 0).toLocaleString()}`;
}, [selectedKandang, produksiTelur, pakanTerpakai, populasiList, panenBroiler, keuangan, konversiPakan.nilai]);
        const callAIAPI = useCallback(async (messages, userContext, kandangJenis) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);
    
    try {
        let contextMessage = '';
        if (userContext) {
            contextMessage = userContext;
        }
        
        const apiMessages = messages.slice(-15).map(msg => ({
            role: msg.role,
            content: msg.content
        }));
        
        console.log('📤 Memanggil AI via Netlify proxy...');
        
        const response = await fetch('/.netlify/functions/ai-proxy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages: apiMessages,
                farmContext: contextMessage,
                kandangJenis: kandangJenis || 'mixed'
            }),
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('AI proxy error:', errorData);
            setAiOnline(false);
            return null;
        }
        
        const data = await response.json();
        
        if (data.success && data.content) {
            setAiOnline(true);
            console.log('✅ AI response received from model:', data.model);
            return data.content;
        }
        
        setAiOnline(false);
        return null;
        
    } catch (error) {
        clearTimeout(timeoutId);
        console.error('AI API Error:', error);
        setAiOnline(false);
        return null;
    }
}, []);
        // ==================== FALLBACK AI RESPONSE - DIPERBAIKI ====================
const fallbackAIResponse = useCallback((question, kandangJenis = null) => {
    const lowerQ = question.toLowerCase();
    const isLayer = kandangJenis === 'layer';
    const isBroiler = kandangJenis === 'broiler';
    
    // ✅ FIX: Deteksi harga per daerah
    if (lowerQ.includes('harga') && (lowerQ.includes('telur') || lowerQ.includes('ayam'))) {
        const today = new Date();
        const isWeekend = today.getDay() === 0 || today.getDay() === 6;
        
        if (lowerQ.includes('telur')) {
            const hargaTelur = isWeekend ? '28.000 - 32.000' : '26.000 - 30.000';
            return `🥚 **Harga Telur Ayam Hari Ini (Mode Terbatas)**

📊 **Perkiraan Harga per Kg:**
• Jabodetabek: Rp ${hargaTelur}
• Jawa Barat: Rp ${isWeekend ? '27.000 - 31.000' : '25.000 - 29.000'}
• Jawa Timur: Rp ${isWeekend ? '26.000 - 30.000' : '24.000 - 28.000'}
• Sumatera: Rp ${isWeekend ? '28.000 - 33.000' : '26.000 - 31.000'}

💡 *Untuk harga akurat, pastikan koneksi internet stabil ya!*

Ada yang bisa saya bantu? 🐔`;
        } else if (lowerQ.includes('ayam')) {
            return `🍗 **Harga Ayam Broiler Hari Ini (Mode Terbatas)**

📊 **Perkiraan Harga per Kg:**
• Jabodetabek: Rp ${isWeekend ? '30.000 - 35.000' : '28.000 - 32.000'}
• Jawa Barat: Rp ${isWeekend ? '29.000 - 34.000' : '27.000 - 31.000'}
• Jawa Timur: Rp ${isWeekend ? '28.000 - 33.000' : '26.000 - 30.000'}
• Sumatera: Rp ${isWeekend ? '31.000 - 36.000' : '29.000 - 34.000'}

💡 *Harga bisa berbeda per daerah. Untuk akurat, pastikan koneksi internet stabil!*

Ada yang ingin ditanyakan? 🐓`;
        }
    }
    
    // RESPON UNTUK LAYER (PETELUR)
    if (isLayer && (lowerQ.includes('telur') || lowerQ.includes('produksi') || lowerQ.includes('hen day'))) {
        return `🥚 **Tips Meningkatkan Produksi Telur (Mode Terbatas)**

📌 **Faktor Kunci Layer:**
1. Pakan berkualitas (protein 16-18%)
2. Pencahayaan 14-16 jam/hari
3. Kebersihan kandang terjaga
4. Cek kesehatan ayam rutin

📊 **Standar Produksi Layer:**
- Hen Day target: 85-90%
- Konsumsi pakan: 110-120 gram/ekor/hari
- FCR telur ideal: 2.0-2.2

💡 *Untuk analisis spesifik, pastikan koneksi internet stabil ya!*

Ada yang ingin ditanyakan? 🐔`;
    }
    
    // RESPON UNTUK BROILER (PEDAGING)
    if (isBroiler && (lowerQ.includes('broiler') || lowerQ.includes('pedaging') || lowerQ.includes('panen') || lowerQ.includes('daging'))) {
        return `🍗 **Tips Panen Ayam Broiler (Mode Terbatas)**

📌 **Parameter Ideal Broiler:**
- Umur panen: 28-35 hari
- Berat panen: 1.5-2.5 kg/ekor
- FCR target: 1.5-1.7
- Mortalitas: <5%

📋 **Tips Sebelum Panen:**
1. Puasa 6-8 jam
2. Hindari stres
3. Atur jadwal pagi/sore
4. Siapkan alat bersih

💡 *Untuk konsultasi lebih detail, pastikan koneksi internet stabil!*

Saya siap membantu! 🐓`;
    }
    
    // RESPON UMUM
    return `🤖 **Si Jago - Asisten Peternakan (Mode Terbatas)**

Maaf, koneksi ke server AI sedang bermasalah. Saya tetap bisa membantu pertanyaan dasar:

🥚 **Layer (Ayam Petelur)** - produksi telur, Hen Day, FCR telur
🍗 **Broiler (Ayam Pedaging)** - berat badan, FCR daging, umur panen
🌾 **Pakan** - nutrisi sesuai jenis ayam
🩺 **Kesehatan** - vaksinasi, gejala penyakit
💰 **Harga** - telur/ayam per daerah

💡 **Contoh pertanyaan:**
- "Harga telur di Jawa Barat hari ini?"
- "Bagaimana cara menaikkan Hen Day?"
- "Jadwal vaksinasi broiler?"

Saya siap membantu! 🐔🐓`;
}, []);
        
        const sendAIMessage = useCallback(async () => {
    if (!chatInput.trim() || isAIThinking) return;
    
    const userMessage = chatInput.trim();
    const userMsg = { role: 'user', content: userMessage, time: new Date().toISOString() };
    
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAIThinking(true);
    
    const chatHistory = chatMessages.slice(-10).map(msg => ({ 
        role: msg.role, 
        content: msg.content 
    }));
    
    let farmContext = null;
    let kandangJenis = null;
    
    if (isAuthenticated && selectedKandang) {
        farmContext = getFarmContext();
        // Deteksi jenis kandang: 'layer' atau 'broiler'
        kandangJenis = (selectedKandang.tipe === 'Layer' || selectedKandang.jenis === 'layer') 
            ? 'layer' 
            : (selectedKandang.tipe === 'Broiler' || selectedKandang.jenis === 'broiler')
            ? 'broiler'
            : 'mixed';
    }
    
    console.log('🤖 Jenis kandang:', kandangJenis);
    
    try {
        // Panggil AI via callAIAPI
        let aiResponse = await callAIAPI([...chatHistory, userMsg], farmContext, kandangJenis);
        
        // Jika gagal, pakai fallback offline
        if (!aiResponse) {
            console.log('Using offline fallback response');
            aiResponse = fallbackAIResponse(userMessage, kandangJenis);
        }
        
        setChatMessages(prev => [...prev, { 
            role: 'assistant', 
            content: aiResponse, 
            time: new Date().toISOString() 
        }]);
        
        setTimeout(() => {
            if (chatMessagesRef.current) {
                chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
            }
        }, 100);
        
    } catch (error) {
        console.error('Send message error:', error);
        setAiOnline(false);
        
        // Fallback offline response berdasarkan jenis kandang
        let fallbackMsg = 'Maaf, koneksi AI sedang bermasalah. Coba lagi nanti ya! 🙏';
        
        if (kandangJenis === 'layer') {
            fallbackMsg = `🥚 **Si Jago (Mode Terbatas - Layer)**

Maaf, koneksi ke server AI sedang bermasalah.

📌 **Tips untuk Ayam Layer (Petelur):**
• Pastikan pakan protein 16-18%
• Atur pencahayaan 14-16 jam/hari
• Jaga kebersihan kandang
• Cek kesehatan ayam rutin

💡 **Target Produksi Layer:**
• Hen Day: 85-90%
• FCR ideal: < 2.2
• Berat telur: 60-65 gram

Ada yang bisa saya bantu? 🐔`;
        } else if (kandangJenis === 'broiler') {
            fallbackMsg = `🍗 **Si Jago (Mode Terbatas - Broiler)**

Maaf, koneksi ke server AI sedang bermasalah.

📌 **Tips untuk Ayam Broiler (Pedaging):**
• Jaga suhu kandang 28-32°C
• Beri pakan berkualitas
• Pastikan ventilasi baik
• Panen umur 28-35 hari

💡 **Target Produksi Broiler:**
• Berat panen: 1.5-2.5 kg
• FCR ideal: < 1.7
• Mortalitas: <5%

Ada yang bisa saya bantu? 🐓`;
        }
        
        setChatMessages(prev => [...prev, { 
            role: 'assistant', 
            content: fallbackMsg, 
            time: new Date().toISOString() 
        }]);
    } finally {
        setIsAIThinking(false);
    }
}, [chatInput, isAIThinking, chatMessages, isAuthenticated, selectedKandang, getFarmContext, callAIAPI, fallbackAIResponse]);
        
        const clearChatHistory = useCallback(() => {
    if (confirm('Hapus riwayat chat?')) {
        setChatMessages([]);
        addNotification('info', 'Chat Dihapus', 'Percakapan dimulai dari awal', 2000);
    }
}, [addNotification]);
        
        const testAPIConnection = useCallback(async () => {
    setLoading(true);
    addNotification('info', '🔌 Testing AI', 'Mencoba koneksi ke server AI...', 2000);
    
    try {
        // Test panggil AI dengan pesan sederhana
        const testResponse = await callAIAPI(
            [{ role: 'user', content: 'Halo, balas dengan "AI Online" saja' }],
            null,
            'mixed'
        );
        
        if (testResponse && testResponse.length > 0) {
            addNotification('success', '✅ AI Connected!', 'Si Jago siap membantu! 🚀', 3000);
            setAiOnline(true);
            console.log('Test response:', testResponse);
        } else {
            throw new Error('No response from AI');
        }
    } catch (error) {
        console.error('Test connection error:', error);
        addNotification('warning', '⚠️ AI Mode Offline', 'Menggunakan pengetahuan offline. Periksa koneksi internet atau proxy Netlify.', 4000);
        setAiOnline(false);
    } finally {
        setLoading(false);
    }
}, [callAIAPI, addNotification]);
        

        // ==================== PWA FUNCTIONS ====================
        const handleInstallPWA = useCallback(async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('✅ User accepted PWA install');
                setShowInstallBanner(false);
                addNotification('success', 'Terima Kasih!', 'FasimCare+ telah terinstall di device Anda', 3000);
            }
            setDeferredPrompt(null);
        }, [deferredPrompt, addNotification]);
        
        const closeInstallBanner = useCallback(() => {
            setShowInstallBanner(false);
            localStorage.setItem('pwa_banner_closed', 'true');
        }, []);
        
        // ==================== SYNC FUNCTIONS ====================
        const syncAllToFirebase = useCallback(async () => {
            if (!userProfile.id || userProfile.id.startsWith('local_')) return;
            
            setSyncStatus('syncing');
            const collections = {
                kandang: kandangList,
                populasi: populasiList,
                produksiTelur: produksiTelur,
                panenBroiler: panenBroiler,
                stokPakan: stokPakan,
                pakanTerpakai: pakanTerpakai,
                stokObat: stokObat,
                obatTerpakai: obatTerpakai,
                jadwalVaksin: jadwalVaksin,
                riwayatPenyakit: riwayatPenyakit,
                karyawan: karyawanList,
                absensi: absensiHarian,
                customer: customerList,
                supplier: supplierList,
                transaksi: transaksiPenjualan
            };
            
            let success = true;
            for (const [key, data] of Object.entries(collections)) {
                if (data && Array.isArray(data)) {
                    const saved = await saveToFirebase(key, data);
                    if (!saved) success = false;
                }
            }
            
            setSyncStatus(success ? 'synced' : 'offline');
            setTimeout(() => setSyncStatus('synced'), 2000);
        }, [userProfile.id, saveToFirebase, kandangList, populasiList, produksiTelur, panenBroiler, stokPakan, pakanTerpakai, stokObat, obatTerpakai, jadwalVaksin, riwayatPenyakit, karyawanList, absensiHarian, customerList, supplierList, transaksiPenjualan]);
        
        // Auto check jadwal setiap jam
useEffect(() => {
    if (!isAuthenticated) return;
    
    if (window.SchedulerFeature) {
        window.SchedulerFeature.checkUpcomingSchedules(featureContext);
    }
    
    const interval = setInterval(() => {
        if (window.SchedulerFeature) {
            window.SchedulerFeature.checkUpcomingSchedules(featureContext);
        }
    }, 3600000); // Cek setiap jam
    
    return () => clearInterval(interval);
}, [isAuthenticated, schedules.length]);
        
        useEffect(() => {
    if (!isAuthenticated || !selectedKandang) return;
    if (window.BiayaProduksiFeature && biayaProduksi.length > 0) {
        window.BiayaProduksiFeature.hitungHPPdanBEP(featureContext);
    }
}, [selectedKandang, biayaProduksi, periodeBiaya, produksiTelur, panenBroiler]);
        
// Auto load penggajian
useEffect(() => {
    if (!isAuthenticated) return;
    const loadPenggajian = async () => {
        const saved = await loadFromFirebase('penggajian', []);
        if (saved && saved.length > 0) setPenggajianList(saved);
    };
    loadPenggajian();
}, [isAuthenticated, loadFromFirebase]);
        
        // ==================== LOAD INITIAL DATA ====================
        useEffect(() => {
            const handleBeforeInstallPrompt = (e) => {
                e.preventDefault();
                setDeferredPrompt(e);
                const bannerClosed = localStorage.getItem('pwa_banner_closed');
                const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
                if (!bannerClosed && !isStandalone) {
                    setShowInstallBanner(true);
                }
            };
            
            window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            
            return () => {
                window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            };
        }, []);
        
        useEffect(() => {
            const handleOnline = () => {
                setIsOnline(true);
                if (isAuthenticated && userProfile.id && !userProfile.id.startsWith('local_')) {
                    loadUserDataAfterLogin(userProfile.id);
                }
                addNotification('success', 'Kembali Online', 'Data akan disinkronkan', 3000);
            };
            
            const handleOffline = () => {
                setIsOnline(false);
                setSyncStatus('offline');
                addNotification('warning', 'Mode Offline', 'Data disimpan secara lokal', 3000);
            };
            
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);
            setIsOnline(navigator.onLine);
            
            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }, [isAuthenticated, userProfile.id, addNotification, loadUserDataAfterLogin]);
        
useEffect(() => {
    const savedUser = localStorage.getItem('fasimcare_current_user');
    if (savedUser) {
        try {
            const user = JSON.parse(savedUser);
            setUserProfile({ ...user, settings: user.settings || { hargaTelurPerKg: 25000, hargaAyamPerKg: 30000 } });
            setIsAuthenticated(true);
            if (!user.id.startsWith('local_') && window.FasimCareFirebase) {
                loadUserDataAfterLogin(user.id);
                loadUserAnnouncements();  // ✅ TAMBAHKAN INI - Load pengumuman untuk user online
            } else {
                const savedKandang = deduplicateById(loadFromStorage('kandang'));
                if (savedKandang.length > 0) {
                    setKandangList(savedKandang);
                    setSelectedKandang(savedKandang[0]);
                }
                const savedPopulasi = deduplicateById(loadFromStorage('populasi'));
                if (savedPopulasi.length > 0) setPopulasiList(savedPopulasi);
                const savedProduksiTelur = deduplicateById(loadFromStorage('produksiTelur'));
                if (savedProduksiTelur.length > 0) setProduksiTelur(savedProduksiTelur);
                const savedPanenBroiler = deduplicateById(loadFromStorage('panenBroiler'));
                if (savedPanenBroiler.length > 0) setPanenBroiler(savedPanenBroiler);
                const savedStokPakan = deduplicateById(loadFromStorage('stokPakan'));
                if (savedStokPakan.length > 0) setStokPakan(savedStokPakan);
                const savedObat = deduplicateById(loadFromStorage('stokObat'));
                if (savedObat.length > 0) setStokObat(savedObat);
                const savedPenyakit = deduplicateById(loadFromStorage('riwayatPenyakit'));
                if (savedPenyakit.length > 0) setRiwayatPenyakit(savedPenyakit);
                const savedKaryawan = deduplicateById(loadFromStorage('karyawan'));
                if (savedKaryawan.length > 0) setKaryawanList(savedKaryawan);
                loadUserAnnouncements();  // ✅ TAMBAHKAN INI - Load pengumuman untuk user offline/local
            }
        } catch (e) { console.warn(e); }
    }
    const savedDarkMode = localStorage.getItem('fasimcare_dark_mode');
    if (savedDarkMode === 'true') {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark-mode');
    }
    setInitialized(true);
    setIsInitialLoading(false);
}, [loadUserDataAfterLogin, loadFromStorage]);
        
// ==================== NAVIGATION ITEMS (DINAMIS) - DIPERBAIKI ====================
const getNavItems = useCallback(() => {
    const isLayer = selectedKandang?.jenis === 'layer';
    const isBroiler = selectedKandang?.jenis === 'broiler';
    
    // Base menu (untuk semua jenis)
    const baseMenus = [
        { id: 'dashboard', icon: 'fas fa-home', label: 'Dashboard' },
        { id: 'populasi', icon: 'fas fa-kiwi-bird', label: 'Populasi' },
    ];
    
    // Menu spesifik berdasarkan jenis kandang
    const specificMenus = [];
    if (isLayer) {
        specificMenus.push({ id: 'produksi', icon: 'fas fa-egg', label: 'Produksi Telur' });
    }
    if (isBroiler) {
        // ✅ PERBAIKAN: ganti 'fa-drumstick-bite' dengan icon yang VALID
        specificMenus.push({ id: 'produksi', icon: 'fas fa-bone', label: 'Panen Broiler' });
    }
    
    // Menu yang sama untuk semua kandang
    const commonMenus = [
        { id: 'pakan', icon: 'fas fa-seedling', label: 'Pakan' },
        { id: 'kesehatan', icon: 'fas fa-heart-pulse', label: 'Kesehatan' },
        { id: 'vaksin', icon: 'fas fa-syringe', label: 'Vaksin' },
        { id: 'jadwal', icon: 'fas fa-calendar-alt', label: 'Jadwal' },
        { id: 'biaya', icon: 'fas fa-coins', label: 'Biaya & HPP' },
        { id: 'transaksi', icon: 'fas fa-receipt', label: 'Penjualan' },
        { id: 'karyawan', icon: 'fas fa-users', label: 'Karyawan' },
        { id: 'slipgaji', icon: 'fas fa-file-invoice-dollar', label: 'Slip Gaji' },
        { id: 'keuangan', icon: 'fas fa-chart-pie', label: 'Keuangan' },
        { id: 'customer', icon: 'fas fa-user-friends', label: 'Customer' },
        { id: 'supplier', icon: 'fas fa-truck', label: 'Supplier' }
    ];
    
    return [...baseMenus, ...specificMenus, ...commonMenus];
}, [selectedKandang]);
        
  //  pengumuman (info, success, warning)
// Running Text untuk pengumuman (info, success, warning) - TEKS LENGKAP
const renderMarqueeAnnouncement = () => {
    // Hanya untuk tipe: info, success, warning (BUKAN danger)
    const marqueeAnnouncements = userAnnouncements.filter(
        ann => !hiddenAnnouncements.includes(ann.id) && 
               (ann.type === 'info' || ann.type === 'success' || ann.type === 'warning')
    );
    
    if (marqueeAnnouncements.length === 0) return null;
    
    // Batasi maksimal 3 pengumuman di running text (bisa diubah ke 5 atau 10)
    const limited = marqueeAnnouncements.slice(0, 5);
    
    const marqueeText = limited.map(ann => {
        let icon = '📢';
        if (ann.type === 'success') icon = '✅';
        else if (ann.type === 'warning') icon = '⚠️';
        
        // ✅ TEKS LENGKAP - TANPA PEMOTONGAN
        // Format: [icon] JUDUL - ISI PENGUMUMAN LENGKAP
        return `${icon} ${ann.title} - ${ann.content}`;
    }).join('   ⟡   ');
    
    return React.createElement('div', {
        className: 'marquee-container',
        style: {
            background: 'var(--surface)',
            border: '1px solid var(--border-light)',
            borderRadius: '10px',
            padding: '10px 0',
            marginBottom: '14px',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative'
        }
    },
        React.createElement('div', {
            style: {
                display: 'inline-block',
                animation: 'marquee 90s linear infinite',
                paddingLeft: '100%',
                whiteSpace: 'nowrap'
            }
        },
            React.createElement('span', { 
                style: { 
                    marginRight: '50px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: 500
                } 
            }, 
                React.createElement('i', { className: 'fas fa-bullhorn', style: { marginRight: '8px', color: '#0EA5E9' } }),
                marqueeText
            )
        ),
        React.createElement('div', {
            style: {
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '30px',
                background: 'linear-gradient(90deg, var(--surface), transparent)',
                pointerEvents: 'none'
            }
        }),
        React.createElement('div', {
            style: {
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: '30px',
                background: 'linear-gradient(90deg, transparent, var(--surface))',
                pointerEvents: 'none'
            }
        })
    );
};
        
// Banner Carousel AUTO SLIDE - Berjalan otomatis, bisa di-swipe
const renderAnnouncementBanner = () => {
    const dangerAnnouncements = userAnnouncements.filter(
        ann => !hiddenAnnouncements.includes(ann.id) && ann.type === 'danger'
    );
    
    if (dangerAnnouncements.length === 0) return null;
    
    const currentIndex = currentBannerIndex;
    const currentAnn = dangerAnnouncements[currentIndex];
    const isRead = localStorage.getItem(`announcement_read_${userProfile.id}_${currentAnn.id}`);
    
    return React.createElement('div', {
        className: 'banner-carousel',
        style: {
            position: 'relative',
            marginBottom: '16px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)'
        }
    },
        React.createElement('div', {
            style: {
                background: 'linear-gradient(135deg, #FEF2F2, #FEE2E2)',
                borderLeft: `4px solid #EF4444`,
                padding: '14px 20px',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
            },
            onClick: () => {
                if (!isRead) {
                    localStorage.setItem(`announcement_read_${userProfile.id}_${currentAnn.id}`, 'true');
                    setUnreadCount(prev => Math.max(0, prev - 1));
                    setUserAnnouncements(prev => 
                        prev.map(a => a.id === currentAnn.id ? { ...a, read: true } : a)
                    );
                }
            }
        },
            isDarkMode && React.createElement('style', null, `
                .banner-carousel div[style*="background: linear-gradient"] {
                    background: #1E293B !important;
                }
            `),
            
            React.createElement('button', {
                style: {
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(0,0,0,0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#666',
                    fontSize: 12,
                    padding: 4,
                    borderRadius: '50%',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                },
                onClick: (e) => {
                    e.stopPropagation();
                    const newHidden = [...hiddenAnnouncements, currentAnn.id];
                    setHiddenAnnouncements(newHidden);
                    localStorage.setItem(`fasimcare_hidden_announcements_${userProfile.id}`, JSON.stringify(newHidden));
                }
            }, React.createElement('i', { className: 'fas fa-times', style: { fontSize: 11 } })),
            
            React.createElement('div', { style: { display: 'flex', gap: 12, alignItems: 'flex-start' } },
                React.createElement('div', { 
                    style: { 
                        width: 40, 
                        height: 40, 
                        background: '#EF444415', 
                        borderRadius: '50%', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0
                    } 
                },
                    React.createElement('i', { 
                        className: 'fas fa-exclamation-triangle', 
                        style: { color: '#EF4444', fontSize: 18 } 
                    })
                ),
                React.createElement('div', { style: { flex: 1 } },
                    React.createElement('h4', { 
                        style: { 
                            fontSize: 13, 
                            fontWeight: 700, 
                            marginBottom: 4, 
                            color: '#991B1B',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            flexWrap: 'wrap'
                        } 
                    }, 
                        currentAnn.title,
                        !isRead && React.createElement('span', { 
                            style: { 
                                background: '#EF4444', 
                                color: 'white', 
                                padding: '2px 8px', 
                                borderRadius: 20, 
                                fontSize: 9,
                                fontWeight: 600
                            } 
                        }, 'IKLAN')
                    ),
                    React.createElement('p', { 
                        style: { 
                            fontSize: 12, 
                            color: '#991B1B', 
                            marginBottom: 6, 
                            lineHeight: 1.4,
                            opacity: 0.9
                        } 
                    }, currentAnn.content),
                    React.createElement('div', { 
                        style: { 
                            display: 'flex', 
                            gap: 12, 
                            alignItems: 'center',
                            fontSize: 10,
                            color: '#991B1B',
                            opacity: 0.7,
                            flexWrap: 'wrap'
                        } 
                    },
                        React.createElement('span', null, 
                            React.createElement('i', { className: 'far fa-clock', style: { marginRight: 4 } }), 
                            moment(currentAnn.createdAt).format('DD MMM YYYY, HH:mm')
                        ),
                        dangerAnnouncements.length > 1 && React.createElement('span', null,
                            React.createElement('i', { className: 'fas fa-images', style: { marginRight: 4 } }),
                            `${currentIndex + 1} / ${dangerAnnouncements.length}`
                        )
                    )
                )
            )
        ),
        
        // Indicator Dots
        dangerAnnouncements.length > 1 && React.createElement('div', {
            style: {
                position: 'absolute',
                bottom: 8,
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                gap: 6,
                zIndex: 2
            }
        },
            dangerAnnouncements.map((_, idx) => 
                React.createElement('button', {
                    key: idx,
                    onClick: (e) => { e.stopPropagation(); setCurrentBannerIndex(idx); },
                    style: {
                        width: idx === currentIndex ? 20 : 6,
                        height: 6,
                        borderRadius: 3,
                        background: idx === currentIndex ? '#EF4444' : 'rgba(0,0,0,0.3)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }
                })
            )
        )
    );
};
        
        
const renderDashboard = () => {
    if (!selectedKandang) {
        return React.createElement('div', { className: 'empty-dashboard' },
            React.createElement('div', { className: 'empty-icon' }, React.createElement('i', { className: 'fas fa-egg' })),
            React.createElement('h3', null, 'Belum Ada Kandang'),
            React.createElement('p', null, 'Buat kandang pertama Anda untuk memulai manajemen peternakan ayam'),
            React.createElement('button', { 
                className: 'btn-create-lahan',
                onClick: function() { setModalType('kandang'); setShowModal(true); }
            }, 
                React.createElement('i', { className: 'fas fa-plus-circle' }), 
                ' Buat Kandang Baru'
            ),
            React.createElement('div', { className: 'feature-hint' },
                React.createElement('div', { className: 'feature-hint-item' }, React.createElement('i', { className: 'fas fa-egg' }), React.createElement('span', null, 'Catat Produksi')),
                React.createElement('div', { className: 'feature-hint-item' }, React.createElement('i', { className: 'fas fa-seedling' }), React.createElement('span', null, 'Kelola Pakan')),
                React.createElement('div', { className: 'feature-hint-item' }, React.createElement('i', { className: 'fas fa-heartbeat' }), React.createElement('span', null, 'Pantau Kesehatan')),
                React.createElement('div', { className: 'feature-hint-item' }, React.createElement('i', { className: 'fas fa-robot' }), React.createElement('span', null, 'AI Si Jago'))
            )
        );
    }
    
    // Data untuk tambahan dashboard
    const todayStr = new Date().toISOString().split('T')[0];
    const stokKritisPakan = stokPakan.filter(s => s.stok < 100);
    const stokKritisObat = stokObat.filter(s => s.stok < 10);
    const jadwalHariIni = jadwalVaksin.filter(v => v.tanggal === todayStr && v.kandangId === selectedKandang.id);
    const penyakitAktif = riwayatPenyakit.filter(p => p.status === 'aktif' && p.kandangId === selectedKandang.id);
    const isLayer = selectedKandang.jenis === 'layer';
    const targetFCR = isLayer ? 2.2 : 1.7;
    const fcrStatus = konversiPakan.nilai <= targetFCR ? 'baik' : 'tinggi';
    
    return React.createElement('div', null,
        syncStatus !== 'synced' && React.createElement('div', { className: 'alert-banner ' + (syncStatus === 'offline' ? 'warning' : 'info'), style: { marginBottom: 12 } },
            React.createElement('i', { className: 'fas ' + (syncStatus === 'offline' ? 'fa-wifi-slash' : 'fa-sync-alt fa-spin') }),
            React.createElement('span', null, syncStatus === 'offline' ? 'Mode Offline - Data disimpan lokal' : 'Menyinkronkan data...')
        ),
        
        // ========== RUNNING TEXT ==========
        renderMarqueeAnnouncement && renderMarqueeAnnouncement(),
        
        // ========== BANNER PENGUMUMAN ==========
        renderAnnouncementBanner && renderAnnouncementBanner(),
        
        // ========== KPI GRID ==========
        React.createElement('div', { className: 'kpi-grid' },
            React.createElement('div', { className: 'kpi-card', onClick: function() { setActiveTab('populasi'); } },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-kiwi-bird' }), ' Populasi'),
                React.createElement('div', { className: 'kpi-value' }, formatNumber(totalPopulasi.total), ' ekor'),
                React.createElement('div', { className: 'kpi-trend' }, 'Layer: ' + formatNumber(totalPopulasi.layer) + ' | Broiler: ' + formatNumber(totalPopulasi.broiler))
            ),
            React.createElement('div', { className: 'kpi-card', onClick: function() { setActiveTab('produksi'); } },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: selectedKandang.jenis === 'layer' ? 'fas fa-egg' : 'fas fa-drumstick-bite' }), selectedKandang.jenis === 'layer' ? ' Produksi Telur' : ' Panen'),
                React.createElement('div', { className: 'kpi-value' }, selectedKandang.jenis === 'layer' ? formatTelur(produksiHarian.jumlah) : formatAyam(panenBroiler.filter(function(p) { return p.kandangId === selectedKandang.id; }).reduce(function(sum, p) { return sum + p.jumlahEkor; }, 0))),
                React.createElement('div', { className: 'kpi-trend' }, 'Pendapatan: ' + formatRupiahCompact(produksiHarian.pendapatan))
            ),
            React.createElement('div', { className: 'kpi-card', onClick: function() { setActiveTab('kesehatan'); } },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-heartbeat' }), 'Kesehatan'),
                React.createElement('div', { className: 'kpi-value' }, kesehatan.sakit + ' sakit'),
                React.createElement('div', { className: 'kpi-trend' }, 'Mortalitas: ' + mortalitas.persentase.toFixed(1) + '%')
            ),
            React.createElement('div', { className: 'kpi-card', onClick: function() { setActiveTab('keuangan'); } },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-chart-pie' }), 'Laba Bersih'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: '13px' } }, formatRupiahCompact(keuangan.labaBersih)),
                React.createElement('div', { className: 'kpi-trend' }, 'FCR: ' + konversiPakan.nilai.toFixed(2))
            )
        ),
        
        // ========== STOK KRITIS (PAKAN & OBAT) ==========
        (stokKritisPakan.length > 0 || stokKritisObat.length > 0) && 
            React.createElement('div', { className: 'card', style: { background: '#FEF3C7', borderLeft: '4px solid #F59E0B' } },
                React.createElement('div', { className: 'card-header' },
                    React.createElement('h3', null, 
                        React.createElement('i', { className: 'fas fa-exclamation-triangle', style: { color: '#F59E0B' } }), 
                        ' ⚠️ Stok Menipis'
                    )
                ),
                stokKritisPakan.length > 0 && 
                    React.createElement('div', { className: 'list-item' },
                        React.createElement('div', { className: 'item-info' }, 
                            React.createElement('h4', null, '🍽️ Pakan'),
                            React.createElement('p', null, stokKritisPakan.map(s => `${s.jenis}: ${s.stok} kg`).join(', '))
                        ),
                        React.createElement('button', { className: 'btn-icon', onClick: () => { setModalType('stokPakan'); setShowModal(true); } }, 
                            React.createElement('i', { className: 'fas fa-plus' })
                        )
                    ),
                stokKritisObat.length > 0 && 
                    React.createElement('div', { className: 'list-item' },
                        React.createElement('div', { className: 'item-info' }, 
                            React.createElement('h4', null, '💊 Obat'),
                            React.createElement('p', null, stokKritisObat.map(s => `${s.jenis}: ${s.stok}`).join(', '))
                        ),
                        React.createElement('button', { className: 'btn-icon', onClick: () => { setModalType('stokObat'); setShowModal(true); } }, 
                            React.createElement('i', { className: 'fas fa-plus' })
                        )
                    )
            ),
        
        // ========== JADWAL HARI INI ==========
        jadwalHariIni.length > 0 && 
            React.createElement('div', { className: 'card', style: { background: '#E0F2FE', borderLeft: '4px solid #0284C7' } },
                React.createElement('div', { className: 'card-header' },
                    React.createElement('h3', null, 
                        React.createElement('i', { className: 'fas fa-calendar-day', style: { color: '#0284C7' } }), 
                        ' 📅 Jadwal Hari Ini'
                    )
                ),
                jadwalHariIni.map(vaksin => 
                    React.createElement('div', { key: vaksin.id, className: 'list-item' },
                        React.createElement('div', { className: 'item-info' },
                            React.createElement('h4', null, React.createElement('i', { className: 'fas fa-syringe' }), ' ', vaksin.nama),
                            React.createElement('p', null, vaksin.metode, ' • ', vaksin.dosis)
                        ),
                        React.createElement('button', { className: 'btn-icon success', onClick: () => {
                            const updatedVaksin = { ...vaksin, status: 'selesai' };
                            setJadwalVaksin(prev => prev.map(v => v.id === vaksin.id ? updatedVaksin : v));
                            saveToFirebase('jadwalVaksin', jadwalVaksin);
                            saveToStorage('jadwalVaksin', jadwalVaksin);
                            addNotification('success', 'Vaksinasi', `${vaksin.nama} selesai`, 2000);
                        } }, React.createElement('i', { className: 'fas fa-check' }))
                    )
                )
            ),
        
        // ========== PENYAKIT AKTIF (WARNING) ==========
        penyakitAktif.length > 0 && 
            React.createElement('div', { className: 'card', style: { background: '#FEE2E2', borderLeft: '4px solid #EF4444' } },
                React.createElement('div', { className: 'card-header' },
                    React.createElement('h3', null, 
                        React.createElement('i', { className: 'fas fa-virus', style: { color: '#EF4444' } }), 
                        ` ⚠️ Penyakit Aktif (${penyakitAktif.length})`
                    ),
                    React.createElement('button', { className: 'btn-icon', onClick: () => setActiveTab('kesehatan') }, 
                        React.createElement('i', { className: 'fas fa-arrow-right' })
                    )
                ),
                penyakitAktif.map(p => 
                    React.createElement('div', { key: p.id, className: 'list-item' },
                        React.createElement('div', { className: 'item-info' },
                            React.createElement('h4', null, p.nama),
                            React.createElement('p', null, p.tingkat, ' • ', p.jumlahTerserang, ' ekor')
                        ),
                        React.createElement('button', { className: 'btn-icon', onClick: () => handleEditItem('penyakit', p) }, 
                            React.createElement('i', { className: 'fas fa-edit' })
                        )
                    )
                )
            ),
        
        // ========== GRAFIK (jika ada data) ==========
        (produksiTelur.filter(function(p) { return p.kandangId === selectedKandang.id; }).length > 0 || panenBroiler.filter(function(p) { return p.kandangId === selectedKandang.id; }).length > 0) && 
            React.createElement('div', { className: 'card' },
                React.createElement('div', { className: 'card-header' },
                    React.createElement('h3', { style: { display: 'flex', alignItems: 'center', gap: '8px', margin: 0 } },
                        React.createElement('i', { className: 'fas fa-chart-line' }),
                        React.createElement('span', null, selectedKandang.jenis === 'layer' ? 'Grafik Produksi Telur 7 Hari' : 'Grafik Panen 7 Hari')
                    ),
                    React.createElement('button', { className: 'btn-icon', onClick: updateChart }, 
                        React.createElement('i', { className: 'fas fa-sync-alt' })
                    )
                ),
                React.createElement('div', { style: { height: 200 } }, React.createElement('canvas', { ref: chartCanvasRef, style: { width: '100%', height: '100%' } }))
            ),
        
        // ========== RINGKASAN KEUANGAN ==========
        React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', { style: { display: 'flex', alignItems: 'center', gap: '8px', margin: 0 } },
                    React.createElement('i', { className: 'fas fa-chart-simple' }),
                    React.createElement('span', null, 'Ringkasan Keuangan')
                ),
                React.createElement('button', { 
                    className: 'btn-icon', 
                    onClick: function() { 
                        setEditMode(false); 
                        setModalType(selectedKandang && selectedKandang.jenis === 'layer' ? 'produksiTelur' : 'panenBroiler'); 
                        setShowModal(true); 
                    } 
                }, 
                    React.createElement('i', { className: 'fas fa-plus' })
                )
            ),
            React.createElement('div', { className: 'list-item' },
                React.createElement('div', { className: 'item-info' }, React.createElement('h4', null, 'Total Pendapatan'), React.createElement('p', null, 'Semua waktu')),
                React.createElement('div', { className: 'item-value', style: { color: '#10B981' } }, formatRupiah(keuangan.pendapatan))
            ),
            React.createElement('div', { className: 'list-item' },
                React.createElement('div', { className: 'item-info' }, React.createElement('h4', null, 'Total Pengeluaran'), React.createElement('p', null, 'Pakan + Obat + Gaji')),
                React.createElement('div', { className: 'item-value', style: { color: '#EF4444' } }, formatRupiah(keuangan.pengeluaran))
            ),
            React.createElement('div', { className: 'list-item' },
                React.createElement('div', { className: 'item-info' }, React.createElement('h4', null, 'Laba Bersih'), React.createElement('p', null, keuangan.labaBersih >= 0 ? 'Untung' : 'Rugi')),
                React.createElement('div', { className: 'item-value', style: { color: keuangan.labaBersih >= 0 ? '#10B981' : '#EF4444', fontWeight: 'bold' } }, formatRupiah(keuangan.labaBersih))
            )
        ),
        
        // ========== REKOMENDASI SI JAGO (AI) ==========
        React.createElement('div', { className: 'card', style: { background: 'linear-gradient(135deg, var(--primary-soft), var(--surface))' } },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-robot', style: { color: '#0EA5E9' } }), 
                    ' 💡 Rekomendasi Si Jago'
                ),
                React.createElement('button', { className: 'btn-icon', onClick: () => setShowAIChat(true) }, 
                    React.createElement('i', { className: 'fas fa-comment-dots' })
                )
            ),
            React.createElement('div', { className: 'list-item' },
                React.createElement('div', { className: 'item-info' },
                    React.createElement('h4', null, fcrStatus === 'tinggi' ? '⚠️ FCR Anda tinggi!' : '✅ FCR Anda sudah baik'),
                    React.createElement('p', null, fcrStatus === 'tinggi'
                        ? (isLayer ? 'Cek kualitas pakan atau kesehatan ayam layer.' : 'Cek kualitas pakan dan manajemen kandang broiler.')
                        : (isLayer ? 'Pertahankan manajemen pakan yang baik!' : 'Pertahankan! FCR Anda sudah ideal.'))
                ),
                React.createElement('div', { className: 'item-value' }, `FCR: ${konversiPakan.nilai.toFixed(2)}`)
            ),
            React.createElement('div', { className: 'list-item' },
                React.createElement('div', { className: 'item-info' },
                    React.createElement('h4', null, mortalitas.persentase > 5 ? '⚠️ Mortalitas tinggi!' : '✅ Mortalitas terkendali'),
                    React.createElement('p', null, mortalitas.persentase > 5 
                        ? 'Periksa sanitasi, ventilasi, dan kepadatan kandang.' 
                        : 'Sanitasi kandang sudah baik. Pertahankan!')
                ),
                React.createElement('div', { className: 'item-value' }, `${mortalitas.persentase.toFixed(1)}%`)
            ),
            penyakitAktif.length === 0 && React.createElement('div', { className: 'list-item' },
                React.createElement('div', { className: 'item-info' },
                    React.createElement('h4', null, '✅ Kondisi kesehatan baik'),
                    React.createElement('p', null, 'Tidak ada penyakit aktif. Terus jaga kebersihan kandang!')
                ),
                React.createElement('i', { className: 'fas fa-smile-wink', style: { fontSize: '24px', color: '#10B981' } })
            )
        )
    );
};
        

        
// Di renderDashboard, ganti empty state dengan ini:
const renderPremiumEmptyState = () => {
    return React.createElement('div', { className: 'premium-empty-state' },
        React.createElement('div', { className: 'premium-empty-icon' },
            React.createElement('i', { className: 'fas fa-egg' })
        ),
        React.createElement('h3', null, 'Mulai Peternakan Anda'),
        React.createElement('p', null, 'Buat kandang pertama untuk memulai perjalanan peternakan modern Anda'),
        React.createElement('button', { 
            className: 'btn-premium',
            onClick: () => { setModalType('kandang'); setShowModal(true); }
        }, 
            React.createElement('i', { className: 'fas fa-plus-circle' }),
            ' Buat Kandang Sekarang'
        ),
        React.createElement('div', { className: 'premium-features' },
            React.createElement('div', { className: 'premium-feature' },
                React.createElement('i', { className: 'fas fa-chart-line' }),
                React.createElement('span', null, 'Analisis Real-time')
            ),
            React.createElement('div', { className: 'premium-feature' },
                React.createElement('i', { className: 'fas fa-robot' }),
                React.createElement('span', null, 'AI Assistant')
            ),
            React.createElement('div', { className: 'premium-feature' },
                React.createElement('i', { className: 'fas fa-cloud-upload-alt' }),
                React.createElement('span', null, 'Cloud Sync')
            )
        )
    );
};
        
        const renderWelcome = () => React.createElement('div', { className: 'welcome-simple' },
    React.createElement('div', { className: 'welcome-hero' },
        React.createElement('div', { className: 'welcome-icon' }, 
            React.createElement('img', { 
                src: 'fasimcare.png', 
                alt: 'FasimCare+ Logo',
                style: { 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    maxWidth: '80px',
                    maxHeight: '80px'
                },
                onError: (e) => { 
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2245%22 fill=%22%230284C7%22/%3E%3Ctext x=%2250%22 y=%2265%22 text-anchor=%22middle%22 fill=%22white%22 font-size=%2240%22%3E🐔%3C/text%3E%3C/svg%3E';
                }
            })
        ),
        React.createElement('h1', { className: 'welcome-title' }, 'Fasim', React.createElement('span', null, 'Care+')),
        React.createElement('p', { style: { fontSize: 12, letterSpacing: 1, marginTop: 4 } }, 'MANAJEMEN PETERNAKAN AYAM MODERN')
    ),
    React.createElement('div', { className: 'welcome-features' },
        React.createElement('div', { className: 'feature-card' },
            React.createElement('div', { className: 'feature-icon', style: { background: '#E65100' } }, 
                React.createElement('i', { className: 'fas fa-chart-line' })
            ),
            React.createElement('div', null, 
                React.createElement('h3', null, 'Analisis Produksi'), 
                React.createElement('p', null, 'Pantau telur & panen')
            )
        ),
        React.createElement('div', { className: 'feature-card' },
            React.createElement('div', { className: 'feature-icon', style: { background: '#10B981' } }, 
                React.createElement('i', { className: 'fas fa-seedling' })
            ),
            React.createElement('div', null, 
                React.createElement('h3', null, 'Manajemen Pakan'), 
                React.createElement('p', null, 'Kelola stok & FCR')
            )
        ),
        React.createElement('div', { className: 'feature-card' },
            React.createElement('div', { className: 'feature-icon', style: { background: '#8D6E63' } }, 
                React.createElement('i', { className: 'fas fa-robot' })
            ),
            React.createElement('div', null, 
                React.createElement('h3', null, 'AI Assistant'), 
                React.createElement('p', null, 'Tanya "Si Jago"')
            )
        ),
        React.createElement('div', { className: 'feature-card' },
            React.createElement('div', { className: 'feature-icon', style: { background: '#F57F17' } }, 
                React.createElement('i', { className: 'fas fa-chart-pie' })
            ),
            React.createElement('div', null, 
                React.createElement('h3', null, 'Laporan Keuangan'), 
                React.createElement('p', null, 'Kelola profit & loss')
            )
        )
    ),
    React.createElement('div', { className: 'welcome-actions-simple' },
        React.createElement('button', { className: 'btn-login', onClick: () => { setModalType('login'); setShowModal(true); } }, 
            React.createElement('i', { className: 'fas fa-sign-in-alt' }), ' Login'
        ),
        React.createElement('button', { className: 'btn-register', onClick: () => { setModalType('register'); setShowModal(true); } }, 
            React.createElement('i', { className: 'fas fa-user-plus' }), ' Daftar'
        )
    ),
    React.createElement('p', { style: { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 16 } }, 
        'Data tersimpan secara cloud & lokal'
    )
);
        
        const renderProfileMenu = () => {
            const getValidAvatar = () => {
                const avatar = userProfile.avatar;
                if (avatar && avatar.startsWith('data:image') && avatar.length < 500000) return avatar;
                if (avatar === 'fasimcare.png') return 'fasimcare.png';
                return 'fasimcare.png';
            };
            
            return React.createElement('div', { 
                className: 'profile-menu', 
                style: { maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }
            },
                React.createElement('div', { 
                    className: 'swipe-handle', 
                    style: { position: 'sticky', top: 0, zIndex: 20, background: 'var(--surface)', cursor: 'grab' },
                    onTouchStart: (e) => handlePanelSwipeStart(e, 'profile-menu'),
                    onMouseDown: (e) => handlePanelSwipeStart(e, 'profile-menu')
                },
                    React.createElement('div', { className: 'swipe-indicator' })
                ),
                React.createElement('div', { className: 'profile-header', style: { position: 'sticky', top: 32, zIndex: 10 } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } },
                        React.createElement('div', { style: { width: 48, height: 48, borderRadius: '50%', background: 'linear-gradient(135deg, #E65100, #BF360C)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' } },
                            React.createElement(LazyImage, { src: getValidAvatar(), alt: 'Avatar', className: 'avatar-image' })
                        ),
                        React.createElement('div', null,
                            React.createElement('h4', { style: { color: 'white' } }, userProfile.name || 'Peternak'),
                            React.createElement('p', { style: { color: '#FFB74D', opacity: 0.9, fontSize: 11 } }, userProfile.email || 'email@example.com')
                        )
                    ),
                    React.createElement('div', { className: 'profile-stats', style: { display: 'flex', justifyContent: 'space-around', marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.2)' } },
                        React.createElement('div', null, React.createElement('div', { className: 'stat-value', style: { fontSize: 18, fontWeight: 700, color: 'white' } }, kandangList.length), React.createElement('div', { className: 'stat-label', style: { fontSize: 10, color: '#FFB74D' } }, 'Kandang')),
                        React.createElement('div', null, React.createElement('div', { className: 'stat-value', style: { fontSize: 18, fontWeight: 700, color: 'white' } }, karyawanList.length), React.createElement('div', { className: 'stat-label', style: { fontSize: 10, color: '#FFB74D' } }, 'Karyawan')),
                        React.createElement('div', null, React.createElement('div', { className: 'stat-value', style: { fontSize: 18, fontWeight: 700, color: 'white' } }, customerList.length), React.createElement('div', { className: 'stat-label', style: { fontSize: 10, color: '#FFB74D' } }, 'Customer'))
                    )
                ),
                React.createElement('div', { className: 'profile-menu-items', style: { flex: 1, overflowY: 'auto', paddingBottom: 16 } },
                    React.createElement('div', { className: 'profile-menu-item', onClick: () => { setShowProfileMenu(false); setModalType('profile'); setShowModal(true); } }, 
                        React.createElement('i', { className: 'fas fa-user-edit' }), React.createElement('span', null, 'Edit Profil')
                    ),
                    React.createElement('div', { className: 'profile-menu-item', onClick: () => { setShowProfileMenu(false); setModalType('kandang'); setShowModal(true); } }, 
                        React.createElement('i', { className: 'fas fa-plus-circle' }), React.createElement('span', null, 'Tambah Kandang')
                    ),
                    
            React.createElement('div', { className: 'profile-menu-item', onClick: () => { 
    setShowProfileMenu(false); 
    if (kandangList.length === 0) {
        addNotification('warning', 'Tidak Ada Kandang', 'Silakan buat kandang terlebih dahulu', 3000);
        return;
    }
    // LANGSUNG edit kandang yang aktif (selectedKandang)
    if (selectedKandang) {
        handleEditItem('kandang', selectedKandang);
    } else {
        setModalType('kandang_select');
        setShowModal(true);
    }
} }, 
    React.createElement('i', { className: 'fas fa-edit' }), React.createElement('span', null, 'Edit Kandang'),
    kandangList.length > 0 && React.createElement('span', { className: 'badge badge-primary', style: { fontSize: 9, marginLeft: 'auto' } }, kandangList.length)
),
            
                    showInstallBanner && !isPWAInstalled && React.createElement('div', { 
                        className: 'profile-menu-item', 
                        style: { background: 'linear-gradient(135deg, #10b98115, #05966915)' },
                        onClick: handleInstallPWA 
                    }, 
                        React.createElement('i', { className: 'fas fa-download', style: { color: '#10b981' } }), React.createElement('span', null, 'Install Aplikasi'),
                        React.createElement('span', { className: 'badge badge-success', style: { fontSize: 9, marginLeft: 'auto' } }, 'PWA')
                    ),
                    React.createElement('div', { className: 'profile-menu-item', onClick: () => { setShowProfileMenu(false); testAPIConnection(); } }, 
                        React.createElement('i', { className: `fas ${aiOnline ? 'fa-wifi' : 'fa-wifi-slash'}` }), React.createElement('span', null, aiOnline ? 'AI Online' : 'AI Offline')
                    ),
                    React.createElement('div', { className: 'profile-menu-item', onClick: () => { setShowProfileMenu(false); toggleDarkMode(); } }, 
                        React.createElement('i', { className: `fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}` }), React.createElement('span', null, isDarkMode ? 'Mode Terang' : 'Mode Gelap')
                    ),
                    React.createElement('div', { className: 'profile-menu-item', onClick: () => { setShowProfileMenu(false); exportDataToCSV('keuangan'); } }, 
                        React.createElement('i', { className: 'fas fa-download' }), React.createElement('span', null, 'Export Data Keuangan')
                    ),
                    React.createElement('div', { className: 'profile-menu-item', onClick: async () => { 
                        setShowProfileMenu(false); 
                        setLoading(true);
                        addNotification('info', 'Force Sync', 'Menyinkronkan semua data ke cloud...', 2000);
                        await syncAllToFirebase();
                        setLoading(false);
                        addNotification('success', 'Sync Selesai', 'Data telah disinkronkan ke cloud', 2000);
                    } }, 
                        React.createElement('i', { className: 'fas fa-cloud-upload-alt', style: { color: '#10b981' } }), React.createElement('span', null, 'Force Sync ke Cloud')
                    ),
                    React.createElement('div', { className: 'profile-menu-item', onClick: async () => { 
                        setShowProfileMenu(false); 
                        setLoading(true); 
                        await loadUserDataAfterLogin(userProfile.id); 
                        setLoading(false); 
                        addNotification('success', 'Sinkronisasi', 'Data berhasil dimuat dari cloud', 3000); 
                    } }, 
                        React.createElement('i', { className: 'fas fa-cloud-download-alt' }), React.createElement('span', null, 'Sinkronkan Data (Cloud → Device)')
                    ),
                    React.createElement('div', { className: 'profile-menu-item danger', onClick: () => { setShowProfileMenu(false); handleLogout(); } }, 
                        React.createElement('i', { className: 'fas fa-sign-out-alt' }), React.createElement('span', null, 'Logout')
                    )
                )
            );
        };
        
        const renderNotificationPanel = () => {
            return React.createElement('div', { 
                className: 'notifications-panel', 
                style: { maxHeight: '80vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }
            },
                React.createElement('div', { 
                    className: 'swipe-handle', 
                    style: { position: 'sticky', top: 0, zIndex: 20, background: 'var(--surface)', cursor: 'grab' },
                    onTouchStart: (e) => handlePanelSwipeStart(e, 'notifications-panel'),
                    onMouseDown: (e) => handlePanelSwipeStart(e, 'notifications-panel')
                },
                    React.createElement('div', { className: 'swipe-indicator' })
                ),
                React.createElement('div', { className: 'notifications-header', style: { position: 'sticky', top: 32, zIndex: 10 } },
    React.createElement('h3', null, 'Notifikasi'),
    React.createElement('div', { style: { display: 'flex', gap: 8 } },
        notifications.length > 0 && React.createElement('button', { className: 'btn-text', onClick: () => { setNotifications([]); setUnreadCount(0); } }, 'Hapus semua')
       
    )
),
                React.createElement('div', { className: 'notifications-list', style: { flex: 1, overflowY: 'auto' } },
                    notifications.length === 0 ? React.createElement('div', { className: 'empty-state' }, React.createElement('i', { className: 'fas fa-bell-slash' }), React.createElement('p', null, 'Tidak ada notifikasi')) :
                    notifications.map(notif => React.createElement('div', { key: notif.id, className: `notification-item ${notif.read ? 'read' : ''}` },
                        React.createElement('div', { className: `notification-icon ${notif.type}` }, React.createElement('i', { className: `fas ${notif.type === 'success' ? 'fa-check-circle' : notif.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}` })),
                        React.createElement('div', { className: 'notification-content' },
                            React.createElement('h4', null, notif.title),
                            React.createElement('p', null, notif.message),
                            React.createElement('span', { className: 'notification-time' }, moment(notif.time).fromNow())
                        ),
                        React.createElement('button', { className: 'btn-icon', onClick: () => { setNotifications(prev => prev.filter(n => n.id !== notif.id)); setUnreadCount(prev => notif.read ? prev : prev - 1); } }, React.createElement('i', { className: 'fas fa-times' }))
                    ))
                )
            );
        };
        
        const renderAIChat = () => {
    if (!showAIChat) return null;
    
    let modalElement = null;
    let swipeStartY = 0;
    let isSwiping = false;
    
    const handleTouchStart = (e, element) => {
        const touch = e.touches[0];
        swipeStartY = touch.clientY;
        isSwiping = true;
        if (element) {
            element.classList.add('swiping');
            element.style.transition = 'none';
        }
    };
    
    const handleTouchMove = (e, element) => {
        if (!isSwiping) return;
        const touch = e.touches[0];
        const deltaY = touch.clientY - swipeStartY;
        
        if (deltaY > 0) {
            e.preventDefault();
            if (element) {
                const translateY = Math.min(deltaY, 250);
                element.style.transform = `translateY(${translateY}px)`;
            }
        }
    };
    
    const handleTouchEnd = (e, element) => {
        if (!isSwiping) return;
        isSwiping = false;
        
        const touch = e.changedTouches[0];
        const deltaY = touch.clientY - swipeStartY;
        
        if (element) {
            element.classList.remove('swiping');
            element.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
            
            if (deltaY > 80) {
                element.style.transform = 'translateY(100%)';
                setTimeout(() => {
                    setShowAIChat(false);
                    if (element) element.style.transform = '';
                }, 300);
            } else {
                element.style.transform = '';
            }
        }
        
        swipeStartY = 0;
    };
    
    return React.createElement('div', { 
        className: 'ai-chat-overlay', 
        onClick: () => setShowAIChat(false),
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000
        }
    },
        React.createElement('div', { 
            ref: (el) => { modalElement = el; },
            className: 'ai-chat-container', 
            onClick: e => e.stopPropagation(),
            onTouchStart: (e) => handleTouchStart(e, modalElement),
            onTouchMove: (e) => handleTouchMove(e, modalElement),
            onTouchEnd: (e) => handleTouchEnd(e, modalElement),
            style: {
                width: '100%',
                maxWidth: '500px',
                height: '80vh',
                background: 'var(--surface)',
                borderRadius: '24px 24px 0 0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transform: 'translateY(0)',
                transition: 'transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)'
            }
        },
            // SWIPE HANDLE
            React.createElement('div', { 
                style: { 
                    display: 'flex', 
                    justifyContent: 'center', 
                    paddingTop: '8px',
                    cursor: 'grab'
                }
            },
                React.createElement('div', { className: 'swipe-handle-modal' })
            ),
            
            React.createElement('div', { className: 'ai-chat-header' },
                React.createElement('div', { className: 'ai-avatar' }, 
                    React.createElement('i', { className: 'fas fa-egg' }), 
                    React.createElement('span', { className: `ai-status ${aiOnline ? 'online' : 'offline'}` })
                ),
                React.createElement('div', { className: 'ai-title' }, 
                    React.createElement('h3', null, 'Si Jago - AI Cerdas'), 
                    React.createElement('p', null, aiOnline ? '🤖 Online • Siap membantu 24/7' : '📡 Offline • Mode terbatas')
                ),
                React.createElement('button', { className: 'ai-close', onClick: () => setShowAIChat(false) }, 
                    React.createElement('i', { className: 'fas fa-times' })
                )
            ),
            
            React.createElement('div', { className: 'ai-chat-messages', ref: chatMessagesRef },
                chatMessages.length === 0 ? React.createElement('div', { className: 'empty-state' },
                    React.createElement('i', { className: 'fas fa-egg' }),
                    React.createElement('h4', null, 'Halo! Saya Si Jago AI 🐔'),
                    React.createElement('p', null, 'Saya asisten cerdas untuk peternakan ayam Anda!'),
                    React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16, justifyContent: 'center' } },
                        React.createElement('button', { className: 'btn-outline', onClick: () => setChatInput('Halo Si Jago, kenalin saya peternak baru') }, '👋 Perkenalan'),
                        React.createElement('button', { className: 'btn-outline', onClick: () => setChatInput('Produksi telur ayam saya turun, kenapa ya?') }, '🥚 Produksi turun'),
                        React.createElement('button', { className: 'btn-outline', onClick: () => setChatInput('Bagaimana cara meningkatkan FCR broiler?') }, '🍗 FCR broiler')
                    )
                ) : chatMessages.map((msg, idx) => React.createElement('div', { key: idx, className: `chat-message ${msg.role}` },
                    React.createElement('div', { className: 'message-avatar' }, React.createElement('i', { className: msg.role === 'assistant' ? 'fas fa-egg' : 'fas fa-user' })),
                    React.createElement('div', { className: 'message-bubble' }, msg.content)
                )),
                isAIThinking && React.createElement('div', { className: 'chat-message assistant' },
                    React.createElement('div', { className: 'message-avatar' }, React.createElement('i', { className: 'fas fa-egg' })),
                    React.createElement('div', { className: 'message-bubble thinking' }, 'Sedang berpikir', React.createElement('span', null, '.'), React.createElement('span', null, '.'), React.createElement('span', null, '.'))
                )
            ),
            
            React.createElement('div', { className: 'ai-chat-input' },
                React.createElement('input', { type: 'text', placeholder: 'Tanya apa saja ke Si Jago...', value: chatInput, onChange: e => setChatInput(e.target.value), onKeyPress: e => e.key === 'Enter' && sendAIMessage() }),
                React.createElement('button', { className: 'send-button', onClick: sendAIMessage, disabled: isAIThinking || !chatInput.trim() }, React.createElement('i', { className: 'fas fa-paper-plane' }))
            ),
            
            React.createElement('div', { style: { padding: 8, fontSize: 10, textAlign: 'center', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'center', gap: 16 } },
                React.createElement('button', { style: { background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }, onClick: clearChatHistory }, React.createElement('i', { className: 'fas fa-trash' }), ' Hapus chat')
            )
        )
    );
};
        
        const renderFABButton = () => {
            if (!isAuthenticated) return null;
            return React.createElement('button', { className: 'fab-button', onClick: () => setShowFABPanel(true) }, React.createElement('i', { className: 'fas fa-plus' }));
        };
        
        // Tambahkan fungsi ini setelah renderFABButton (sekitar baris 2800)
const renderConsultationButton = () => {
    if (!isAuthenticated) return null;
    
    return React.createElement('button', {
        className: 'consultation-button',
        onClick: () => setShowConsultationModal(true),
        style: {
            position: 'fixed',
            bottom: '20px',
            left: '16px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
            border: 'none',
            color: 'white',
            fontSize: '24px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
        }
    },
        React.createElement('i', { className: 'fas fa-comment-dots' })
    );
};
        // Real-time listener untuk konsultasi
useEffect(() => {
    if (!showConsultationModal || !consultationId) return;
    
    const firestore = window.FasimCareFirebase?.db || (window.firebase?.firestore?.());
    if (!firestore) return;
    
    // Listener untuk messages
    const unsubscribeMessages = firestore.collection('consultations')
        .doc(consultationId)
        .collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot((snapshot) => {
            const messages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate?.() || new Date()
            }));
            setConsultationMessages(messages);
            
            // Scroll ke bawah
            setTimeout(() => {
                const container = document.querySelector('.consultation-messages');
                if (container) container.scrollTop = container.scrollHeight;
            }, 100);
            
            // Notifikasi untuk pesan baru dari admin
            const lastMessage = messages[messages.length - 1];
            if (lastMessage && lastMessage.sender === 'admin' && !lastMessage.readByUser && showConsultationModal) {
                addNotification('info', '💬 Balasan Baru', 'Admin telah membalas pesan Anda', 3000);
                if (window.navigator?.vibrate) window.navigator.vibrate(200);
            }
        });
    
    // Listener untuk typing indicator dan status
    const unsubscribeStatus = firestore.collection('consultations')
        .doc(consultationId)
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                setConsultationTyping(data.adminTyping || false);
                setConsultationAdminOnline(data.adminOnline || false);
                setConsultationStatus(data.status || 'pending');
            }
        });
    
    return () => {
        unsubscribeMessages();
        unsubscribeStatus();
    };
}, [showConsultationModal, consultationId, addNotification]);
        
        // Auto load pesan saat modal dibuka
useEffect(() => {
    if (showConsultationModal && consultationId) {
        loadConsultationMessages(consultationId);
    }
}, [showConsultationModal, consultationId, loadConsultationMessages]);
        
        
     // Tambahkan fungsi ini setelah renderConsultationButton
const renderConsultationModal = () => {
    if (!showConsultationModal) return null;
    
    let modalElement = null;
    let swipeStartY = 0;
    let isSwiping = false;
    
    const handleTouchStart = (e, element) => {
        const touch = e.touches[0];
        swipeStartY = touch.clientY;
        isSwiping = true;
        if (element) {
            element.classList.add('swiping');
            element.style.transition = 'none';
        }
    };
    
    const handleTouchMove = (e, element) => {
        if (!isSwiping) return;
        const touch = e.touches[0];
        const deltaY = touch.clientY - swipeStartY;
        
        if (deltaY > 0) {
            e.preventDefault();
            if (element) {
                const translateY = Math.min(deltaY, 250);
                element.style.transform = `translateY(${translateY}px)`;
                const overlay = element.closest('.modal-overlay');
                if (overlay) {
                    overlay.style.background = `rgba(0,0,0,${0.5 - (translateY / 500)})`;
                }
            }
        }
    };
    
    const handleTouchEnd = (e, element) => {
        if (!isSwiping) return;
        isSwiping = false;
        
        const touch = e.changedTouches[0];
        const deltaY = touch.clientY - swipeStartY;
        
        if (element) {
            element.classList.remove('swiping');
            element.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
            
            if (deltaY > 80) {
                element.style.transform = 'translateY(100%)';
                setTimeout(() => {
                    setShowConsultationModal(false);
                    if (element) element.style.transform = '';
                }, 300);
            } else {
                element.style.transform = '';
                const overlay = element.closest('.modal-overlay');
                if (overlay) {
                    overlay.style.background = 'rgba(0,0,0,0.5)';
                }
            }
        }
        
        swipeStartY = 0;
    };
    
    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Baru saja';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} menit lalu`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;
        return moment(date).format('DD/MM HH:mm');
    };
    
    return React.createElement('div', { 
        className: 'modal-overlay', 
        onClick: () => setShowConsultationModal(false),
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000
        }
    },
        React.createElement('div', {
            ref: (el) => { modalElement = el; },
            className: 'modal-swipeable',
            onClick: (e) => e.stopPropagation(),
            onTouchStart: (e) => handleTouchStart(e, modalElement),
            onTouchMove: (e) => handleTouchMove(e, modalElement),
            onTouchEnd: (e) => handleTouchEnd(e, modalElement),
            style: { 
                width: '100%',
                maxWidth: '500px',
                height: '75vh',
                background: 'var(--surface)',
                borderRadius: '24px 24px 0 0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                transform: 'translateY(0)'
            }
        },
            // SWIPE HANDLE
            React.createElement('div', { 
                style: { 
                    display: 'flex', 
                    justifyContent: 'center', 
                    paddingTop: '8px',
                    cursor: 'grab'
                }
            },
                React.createElement('div', { className: 'swipe-handle-modal' })
            ),
            
            // Header
            React.createElement('div', {
                style: {
                    background: 'linear-gradient(135deg, #0284C7, #0EA5E9)',
                    color: 'white',
                    padding: '12px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }
            },
                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '10px' } },
                    React.createElement('i', { className: 'fas fa-headset', style: { fontSize: '20px' } }),
                    React.createElement('div', null,
                        React.createElement('h3', { style: { margin: 0, fontSize: '16px', fontWeight: 600 } }, 'Konsultasi Kandang'),
                        React.createElement('p', { style: { margin: 0, fontSize: '11px', opacity: 0.8 } }, 
                            consultationStatus === 'closed' ? 'Konsultasi ditutup' : 'Admin akan membalas'
                        )
                    )
                ),
                React.createElement('button', {
                    onClick: () => setShowConsultationModal(false),
                    style: { background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }
                }, React.createElement('i', { className: 'fas fa-times' }))
            ),
            
            // Messages area
            React.createElement('div', {
                className: 'consultation-messages',
                style: {
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }
            },
                consultationMessages.length === 0 ?
                    React.createElement('div', { style: { textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)' } },
                        React.createElement('i', { className: 'fas fa-comments', style: { fontSize: '48px', marginBottom: '12px', opacity: 0.5 } }),
                        React.createElement('p', { style: { marginBottom: '8px', fontSize: '13px', fontWeight: 500 } }, '💬 Mulai Konsultasi'),
                        React.createElement('p', { style: { marginBottom: '16px', fontSize: '11px', opacity: 0.7 } }, 'Pilih pertanyaan cepat di bawah'),
                        
                        // QUICK REPLIES HORIZONTAL SCROLL
                        React.createElement('div', { className: 'quick-replies-horizontal' },
                            React.createElement('div', { className: 'quick-replies-label' },
                                React.createElement('i', { className: 'fas fa-arrow-left' }),
                                ' Geser untuk pilihan cepat ',
                                React.createElement('i', { className: 'fas fa-arrow-right' })
                            ),
                            React.createElement('div', { className: 'quick-replies-scroll' },
                                React.createElement('div', { className: 'quick-replies-wrapper' },
                                    quickReplies && quickReplies.map((qr, idx) =>
                                        React.createElement('div', {
                                            key: idx,
                                            className: 'quick-reply-chip',
                                            onClick: () => {
                                                setConsultationInput(qr.text);
                                                setTimeout(() => {
                                                    const textarea = document.querySelector('.consultation-modal textarea');
                                                    if (textarea) textarea.focus();
                                                }, 100);
                                            }
                                        },
                                            React.createElement('span', { className: 'chip-icon' }, qr.icon),
                                            React.createElement('span', { className: 'chip-label' }, qr.label)
                                        )
                                    )
                                )
                            )
                        ),
                        
                        React.createElement('p', { style: { marginTop: '20px', fontSize: '10px', opacity: 0.5 } }, 
                            React.createElement('i', { className: 'fas fa-keyboard' }), 
                            ' Atau ketik pesan sendiri'
                        )
                    ) :
                    consultationMessages.map((msg, idx) => 
                        React.createElement('div', {
                            key: idx,
                            style: {
                                display: 'flex',
                                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
                            }
                        },
                            React.createElement('div', {
                                style: {
                                    maxWidth: '80%',
                                    padding: '10px 14px',
                                    borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    background: msg.sender === 'user' ? 'linear-gradient(135deg, #0284C7, #0EA5E9)' : 'var(--surface-hover)',
                                    color: msg.sender === 'user' ? 'white' : 'var(--text-primary)',
                                    fontSize: '13px',
                                    wordBreak: 'break-word'
                                }
                            },
                                React.createElement('div', null, msg.message),
                                React.createElement('div', {
                                    style: {
                                        fontSize: '9px',
                                        marginTop: '4px',
                                        opacity: 0.7,
                                        textAlign: 'right'
                                    }
                                }, formatTime(msg.timestamp))
                            )
                        )
                    )
            ),
            
            // Input area
            consultationStatus !== 'closed' && React.createElement('div', {
                style: {
                    padding: '12px 16px',
                    borderTop: '1px solid var(--border-light)',
                    display: 'flex',
                    gap: '10px',
                    background: 'var(--surface)'
                }
            },
                React.createElement('textarea', {
                    value: consultationInput,
                    onChange: (e) => {
                        setConsultationInput(e.target.value);
                        if (typeof sendTypingIndicator === 'function') {
                            sendTypingIndicator(true);
                        }
                    },
                    onKeyPress: (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendConsultationMessage();
                        }
                    },
                    placeholder: 'Tulis pesan...',
                    rows: '1',
                    className: 'consultation-modal',
                    style: {
                        flex: 1,
                        padding: '10px 14px',
                        border: '1px solid var(--border-light)',
                        borderRadius: '20px',
                        resize: 'none',
                        fontFamily: 'inherit',
                        fontSize: '13px',
                        background: 'var(--surface)',
                        color: 'var(--text-primary)'
                    }
                }),
                React.createElement('button', {
                    onClick: sendConsultationMessage,
                    disabled: !consultationInput.trim(),
                    style: {
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0284C7, #0EA5E9)',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: consultationInput.trim() ? 1 : 0.5
                    }
                }, React.createElement('i', { className: 'fas fa-paper-plane' }))
            ),
            
            consultationStatus === 'closed' && React.createElement('div', {
                style: {
                    padding: '16px',
                    textAlign: 'center',
                    borderTop: '1px solid var(--border-light)',
                    color: 'var(--text-tertiary)',
                    fontSize: '12px'
                }
            },
                React.createElement('i', { className: 'fas fa-lock' }), ' Konsultasi telah ditutup'
            )
        )
    );
};
        
        // Render quick replies horizontal scroll
const renderQuickRepliesHorizontal = () => {
    if (!quickReplies || quickReplies.length === 0) return null;
    
    return React.createElement('div', { className: 'quick-replies-horizontal' },
        React.createElement('div', { className: 'quick-replies-label' },
            React.createElement('i', { className: 'fas fa-arrow-left' }),
            ' Geser untuk pilihan cepat ',
            React.createElement('i', { className: 'fas fa-arrow-right' })
        ),
        React.createElement('div', { className: 'quick-replies-scroll' },
            React.createElement('div', { className: 'quick-replies-wrapper' },
                quickReplies.map((qr, idx) => 
                    React.createElement('div', {
                        key: idx,
                        className: 'quick-reply-chip',
                        onClick: () => {
                            setConsultationInput(qr.text);
                            // Optional: auto focus ke input
                            setTimeout(() => {
                                const textarea = document.querySelector('.consultation-modal textarea');
                                if (textarea) textarea.focus();
                            }, 100);
                        },
                        title: qr.label
                    },
                        React.createElement('span', { className: 'chip-icon' }, qr.icon),
                        React.createElement('span', { className: 'chip-label' }, qr.label)
                    )
                )
            )
        )
    );
};
        
    const renderFABPanel = () => {
    if (!showFABPanel) return null;
    
    // 12 FITUR GLOBAL TERPENTING
    const menuItems = [
        { icon: "fa-users", label: "Karyawan", action: () => { 
            setModalType('karyawan'); setShowModal(true); setShowFABPanel(false); 
        } },
        
        { icon: "fa-user-check", label: "Absensi", action: () => { 
            setActiveTab('karyawan'); setShowFABPanel(false); 
        } },
        
        { icon: "fa-file-invoice-dollar", label: "Slip Gaji", action: () => { 
            setActiveTab('slipgaji'); setShowFABPanel(false); 
        } },
        
        { icon: "fa-receipt", label: "Penjualan", action: () => { 
            setTransaksiItems([]); setModalType('transaksi'); setShowModal(true); setShowFABPanel(false); 
        } },
        
        { icon: "fa-user-friends", label: "Customer", action: () => { 
            setModalType('customer'); setShowModal(true); setShowFABPanel(false); 
        } },
        
        { icon: "fa-truck", label: "Supplier", action: () => { 
            setModalType('supplier'); setShowModal(true); setShowFABPanel(false); 
        } },
        
        { icon: "fa-seedling", label: "Stok Pakan", action: () => { 
            setModalType('stokPakan'); setShowModal(true); setShowFABPanel(false); 
        } },
        
        { icon: "fa-capsules", label: "Stok Obat", action: () => { 
            setModalType('stokObat'); setShowModal(true); setShowFABPanel(false); 
        } },
        
        { icon: "fa-coins", label: "Biaya & HPP", action: () => { 
            setActiveTab('biaya'); setShowFABPanel(false); 
        } },
        
        { icon: "fa-calendar-alt", label: "Jadwal", action: () => { 
            setActiveTab('jadwal'); setShowFABPanel(false); 
        } },
        
        { icon: "fa-store", label: "Marketplace", action: () => { 
            if (window.StoreApp) {
                setShowStore(true);
                setShowFABPanel(false);
            } else {
                addNotification('warning', 'Marketplace', 'Fitur sedang dimuat, coba lagi', 3000);
                setShowFABPanel(false);
            }
        } },
        
        { icon: "fa-robot", label: "AI Si Jago", action: () => { 
            setShowAIChat(true); setShowFABPanel(false); 
        } }
    ];
    
    return React.createElement(React.Fragment, null,
        React.createElement('div', { className: 'fab-panel-overlay', onClick: function() { setShowFABPanel(false); } }),
        React.createElement('div', { className: 'fab-panel open' },
            React.createElement('div', { 
                className: 'swipe-handle', 
                onTouchStart: function(e) { handlePanelSwipeStart(e, 'fab-panel'); },
                onMouseDown: function(e) { handlePanelSwipeStart(e, 'fab-panel'); }
            }, 
                React.createElement('div', { className: 'swipe-indicator' })
            ),
            React.createElement('div', { className: 'fab-panel-header' },
                React.createElement('h3', null, React.createElement('i', { className: 'fas fa-globe' }), ' Menu Global'),
                React.createElement('button', { className: 'fab-panel-close', onClick: function() { setShowFABPanel(false); } }, React.createElement('i', { className: 'fas fa-times' }))
            ),
            React.createElement('div', { className: 'fab-panel-content' },
                React.createElement('div', { className: 'fab-panel-grid' },
                    menuItems.map(function(item, idx) { 
                        return React.createElement('div', { key: idx, className: 'fab-panel-item', onClick: item.action, title: item.label },
                            React.createElement('i', { className: `fas ${item.icon}`, style: { fontSize: '28px', marginBottom: '8px', color: 'var(--primary)' } }),
                            React.createElement('span', null, item.label)
                        );
                    })
                )
            )
        )
    );
};
        
        // ==================== TAB RENDER FUNCTIONS ====================
     const renderPopulasi = () => {
    if (!selectedKandang) {
        return React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'empty-state' },
                React.createElement('i', { className: 'fas fa-kiwi-bird', style: { fontSize: 48, marginBottom: 12, color: 'var(--text-tertiary)' } }),
                React.createElement('p', null, 'Pilih atau buat kandang terlebih dahulu')
            )
        );
    }
    
    // Filter populasi berdasarkan kandang yang dipilih dan search term
    const filteredPopulasi = populasiList
        .filter(p => p.kandangId === selectedKandang.id)
        .filter(item => 
            item.tanggal?.includes(populasiSearchTerm) ||
            item.jumlah?.toString().includes(populasiSearchTerm) ||
            item.umur?.toString().includes(populasiSearchTerm) ||
            item.status?.toLowerCase().includes(populasiSearchTerm.toLowerCase()) ||
            (item.catatan || '').toLowerCase().includes(populasiSearchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    
    // Hitung statistik populasi
    const totalPopulasiAktif = filteredPopulasi
        .filter(p => p.status === 'aktif')
        .reduce((sum, p) => sum + (p.jumlah || 0), 0);
    
    const totalPopulasiMati = filteredPopulasi
        .filter(p => p.status === 'mati')
        .reduce((sum, p) => sum + (p.jumlah || 0), 0);
    
    const rataRataUmur = filteredPopulasi
        .filter(p => p.status === 'aktif')
        .reduce((sum, p, _, arr) => sum + (p.umur || 0) / (arr.length || 1), 0);
    
    const populasiTerbaru = filteredPopulasi[0];
    
    const populasiIcon = selectedKandang.jenis === 'layer' ? 'fas fa-egg' : 'fas fa-kiwi-bird';
    const populasiLabel = selectedKandang.jenis === 'layer' ? 'Populasi Layer' : 'Populasi Broiler';
    
    const formatTanggal = (tanggal) => moment(tanggal).format('DD MMM YYYY');
    
    // Status badge
    const getStatusBadge = (status) => {
        if (status === 'aktif') return 'badge-success';
        if (status === 'mati') return 'badge-danger';
        return 'badge-warning';
    };
    
    const getStatusIcon = (status) => {
        if (status === 'aktif') return 'fa-check-circle';
        if (status === 'mati') return 'fa-skull-crossbones';
        return 'fa-clock';
    };
    
    return React.createElement('div', null,
        // SEARCH CARD
        React.createElement('div', { className: 'card', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-search', style: { marginRight: 8 } }),
                    ' Cari Riwayat Populasi'
                )
            ),
            React.createElement('div', { style: { position: 'relative' } },
                React.createElement('i', { className: 'fas fa-search', style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 14 } }),
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Cari tanggal, jumlah, umur, atau status...',
                    value: populasiSearchTerm,
                    onChange: (e) => setPopulasiSearchTerm(e.target.value),
                    className: 'form-input',
                    style: { paddingLeft: 40, width: '100%' }
                }),
                populasiSearchTerm && React.createElement('button', {
                    onClick: () => setPopulasiSearchTerm(''),
                    style: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }
                }, React.createElement('i', { className: 'fas fa-times' }))
            )
        ),
        
        // SUMMARY CARD - Statistik Populasi
        React.createElement('div', { className: 'kpi-grid', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: populasiIcon, style: { color: '#10B981' } }), ' Populasi Aktif'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20, color: '#10B981' } }, totalPopulasiAktif.toLocaleString()),
                React.createElement('div', { className: 'kpi-trend' }, 'ekor')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-skull-crossbones', style: { color: '#EF4444' } }), ' Populasi Mati'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20, color: '#EF4444' } }, totalPopulasiMati.toLocaleString()),
                React.createElement('div', { className: 'kpi-trend' }, 'ekor')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-clock', style: { color: '#F59E0B' } }), ' Rata-rata Umur'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 18, color: '#F59E0B' } }, Math.round(rataRataUmur), ' hari'),
                React.createElement('div', { className: 'kpi-trend' }, selectedKandang.jenis === 'layer' ? 'masa produksi' : 'masa panen')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-history', style: { color: '#8B5CF6' } }), ' Riwayat Pencatatan'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20, color: '#8B5CF6' } }, filteredPopulasi.length),
                React.createElement('div', { className: 'kpi-trend' }, 'kali pencatatan')
            )
        ),
        
        // DAFTAR RIWAYAT POPULASI
        React.createElement('div', { className: 'card', style: { padding: 0, overflow: 'hidden' } },
            React.createElement('div', { className: 'card-header', style: { padding: '12px 16px', margin: 0 } },
                React.createElement('h3', null, 
                    React.createElement('i', { className: populasiIcon, style: { marginRight: 8 } }),
                    ` ${populasiLabel} (${filteredPopulasi.length})`
                ),
                React.createElement('button', { 
                    className: 'btn-icon', 
                    onClick: () => { setModalType('populasi'); setShowModal(true); },
                    title: 'Tambah Populasi'
                }, React.createElement('i', { className: 'fas fa-plus' }))
            ),
            
            React.createElement('div', { style: { padding: '0 16px 16px 16px' } },
                filteredPopulasi.length === 0 && 
                    React.createElement('div', { className: 'empty-state', style: { padding: '40px 20px' } },
                        React.createElement('i', { className: populasiIcon, style: { fontSize: 48, marginBottom: 12, color: 'var(--text-tertiary)' } }),
                        React.createElement('p', null, populasiSearchTerm ? 'Data tidak ditemukan' : 'Belum ada data populasi'),
                        !populasiSearchTerm && React.createElement('button', { 
                            className: 'btn-primary', 
                            style: { marginTop: 12 },
                            onClick: () => { setModalType('populasi'); setShowModal(true); }
                        }, React.createElement('i', { className: 'fas fa-plus', style: { marginRight: 6 } }), ' Tambah Populasi')
                    ),
                
                filteredPopulasi.map(function(item) {
                    const statusClass = getStatusBadge(item.status);
                    const statusIcon = getStatusIcon(item.status);
                    const statusText = item.status === 'aktif' ? 'Aktif' : (item.status === 'mati' ? 'Mati' : 'Unknown');
                    
                    return React.createElement('div', { key: item.id, style: { 
                        marginBottom: 12,
                        background: 'var(--surface)',
                        borderRadius: 16,
                        border: '1px solid var(--border-light)',
                        overflow: 'hidden'
                    } },
                        // HEADER: Tanggal + Tombol Aksi
                        React.createElement('div', { style: { 
                            padding: '14px 14px 8px 14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: 8
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 } },
                                React.createElement('div', { style: { 
                                    width: 44, height: 44, 
                                    background: 'var(--primary-soft)', 
                                    borderRadius: 44, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                } },
                                    React.createElement('i', { className: populasiIcon, style: { fontSize: 20, color: 'var(--primary)' } })
                                ),
                                React.createElement('div', { style: { flex: 1 } },
                                    React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' } }, formatTanggal(item.tanggal)),
                                    React.createElement('div', { style: { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                                        React.createElement('span', null,
                                            React.createElement('i', { className: 'fas fa-calendar-alt', style: { marginRight: 3 } }),
                                            'Populasi awal'
                                        ),
                                        React.createElement('span', null,
                                            React.createElement('i', { className: 'fas fa-clock', style: { marginRight: 3 } }),
                                            'Umur: ' + (item.umur || 0) + ' hari'
                                        )
                                    )
                                )
                            ),
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 } },
                                React.createElement('span', { 
                                    className: 'badge ' + statusClass,
                                    style: { fontSize: 10, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }
                                }, 
                                    React.createElement('i', { className: 'fas ' + statusIcon, style: { fontSize: 10 } }),
                                    statusText
                                ),
                                React.createElement('button', { className: 'btn-icon', onClick: function() { handleEditItem('populasi', item); }, style: { width: 32, height: 32 } }, 
                                    React.createElement('i', { className: 'fas fa-edit', style: { fontSize: 12 } })
                                ),
                                React.createElement('button', { className: 'btn-icon danger', onClick: function() { handleDeleteItem('populasi', item.id, formatTanggal(item.tanggal)); }, style: { width: 32, height: 32 } }, 
                                    React.createElement('i', { className: 'fas fa-trash-alt', style: { fontSize: 12 } })
                                )
                            )
                        ),
                        
                        // INFO JUMLAH & STATUS
                        React.createElement('div', { style: { 
                            margin: '0 14px 12px 14px',
                            padding: '10px 12px',
                            background: item.status === 'mati' ? '#EF444410' : 'var(--surface-hover)',
                            borderRadius: 12,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 10
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
                                React.createElement('span', { style: { fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 } },
                                    React.createElement('i', { className: 'fas fa-kiwi-bird', style: { color: item.status === 'mati' ? '#EF4444' : '#10B981' } }),
                                    'Jumlah: ' + item.jumlah.toLocaleString() + ' ekor'
                                ),
                                item.catatan && React.createElement('span', { style: { fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 } },
                                    React.createElement('i', { className: 'fas fa-pencil-alt', style: { fontSize: 10 } }),
                                    item.catatan
                                )
                            ),
                            React.createElement('div', { style: { 
                                fontSize: 16, 
                                fontWeight: 800, 
                                color: item.status === 'mati' ? '#EF4444' : '#10B981',
                                background: item.status === 'mati' ? '#EF444410' : '#10B98110',
                                padding: '4px 12px',
                                borderRadius: 20
                            } }, 
                                item.status === 'mati' ? 'Mati' : 'Aktif'
                            )
                        ),
                        
                        // BORDER GRADIENT BAWAH
                        React.createElement('div', { style: { 
                            height: 3,
                            background: item.status === 'mati' 
                                ? 'linear-gradient(90deg, #EF4444, #F59E0B, #EF4444)' 
                                : 'linear-gradient(90deg, #10B981, #0EA5E9, #8B5CF6)',
                            marginTop: 4
                        } })
                    );
                })
            )
        )
    );
};
        
const renderProduksi = () => {
    if (!selectedKandang) {
        return React.createElement('div', { className: 'card' }, 
            React.createElement('div', { className: 'empty-state' }, 
                React.createElement('p', null, 'Pilih atau buat kandang terlebih dahulu')
            )
        );
    }
    
    // UNTUK LAYER (TELUR)
    if (selectedKandang.jenis === 'layer') {
        return renderProduksiTelur();
    }
    
    // UNTUK BROILER (PEDAGING) - PAKAI FUNGSI BARU YANG RAPI
    if (selectedKandang.jenis === 'broiler') {
        return renderPanenBroiler();
    }
    
    return React.createElement('div', { className: 'card' }, 
        React.createElement('div', { className: 'empty-state' }, 
            React.createElement('p', null, 'Jenis kandang tidak dikenal')
        )
    );
};
        
// ==================== PRODUKSI TELUR - RENDER FUNCTION ====================
const renderProduksiTelur = () => {
    if (!selectedKandang || selectedKandang.jenis !== 'layer') {
        return React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'empty-state' },
                React.createElement('i', { className: 'fas fa-egg', style: { fontSize: 48, marginBottom: 12, color: 'var(--text-tertiary)' } }),
                React.createElement('p', null, 'Hanya tersedia untuk kandang Layer (Ayam Petelur)')
            )
        );
    }
    
    // Filter produksi berdasarkan kandang dan search term
    const filteredProduksi = produksiTelur
        .filter(p => p.kandangId === selectedKandang.id)
        .filter(item => 
            item.tanggal?.includes(produksiSearchTerm) ||
            item.jumlah?.toString().includes(produksiSearchTerm) ||
            (item.beratTotal?.toString() || '').includes(produksiSearchTerm) ||
            (item.catatan || '').toLowerCase().includes(produksiSearchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    
    // Hitung statistik produksi
    const totalProduksiButir = filteredProduksi.reduce((sum, p) => sum + (p.jumlah || 0), 0);
    const totalProduksiKg = filteredProduksi.reduce((sum, p) => sum + (p.beratTotal || 0), 0);
    const totalPendapatan = filteredProduksi.reduce((sum, p) => sum + (p.pendapatan || 0), 0);
    const rataRataHarian = filteredProduksi.length > 0 
        ? Math.round(totalProduksiButir / filteredProduksi.length) 
        : 0;
    
    // Produksi hari ini
    const todayStr = new Date().toISOString().split('T')[0];
    const produksiHariIni = filteredProduksi.find(p => p.tanggal === todayStr);
    
    const formatTanggal = (tanggal) => moment(tanggal).format('DD MMM YYYY');
    const isHariIni = (tanggal) => tanggal === todayStr;
    
    // Icon berdasarkan level produksi
    const getProduksiIcon = (jumlah) => {
        if (jumlah >= 1000) return '🥚🥚🥚';
        if (jumlah >= 500) return '🥚🥚';
        if (jumlah >= 100) return '🥚';
        return '🥚';
    };
    
    const getProduksiColor = (jumlah) => {
        if (jumlah >= 1000) return '#10B981';
        if (jumlah >= 500) return '#F59E0B';
        return '#EF4444';
    };
    
    // Helper untuk menampilkan satuan input asli (jika ada)
    const getInputDisplay = (item) => {
        if (item.satuan === 'kg' && item.jumlahInput) {
            return React.createElement('div', { style: { fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 } },
                React.createElement('i', { className: 'fas fa-info-circle', style: { fontSize: 9 } }),
                `Input: ${item.jumlahInput} kg`
            );
        }
        return null;
    };
    
    return React.createElement('div', null,
        // SEARCH CARD
        React.createElement('div', { className: 'card', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-search', style: { marginRight: 8 } }),
                    ' Cari Produksi Telur'
                )
            ),
            React.createElement('div', { style: { position: 'relative' } },
                React.createElement('i', { className: 'fas fa-search', style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 14 } }),
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Cari tanggal, jumlah (butir/kg), atau catatan...',
                    value: produksiSearchTerm,
                    onChange: (e) => setProduksiSearchTerm(e.target.value),
                    className: 'form-input',
                    style: { paddingLeft: 40, width: '100%' }
                }),
                produksiSearchTerm && React.createElement('button', {
                    onClick: () => setProduksiSearchTerm(''),
                    style: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }
                }, React.createElement('i', { className: 'fas fa-times' }))
            )
        ),
        
        // SUMMARY CARD - Statistik Produksi
        React.createElement('div', { className: 'kpi-grid', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-egg', style: { color: '#F59E0B' } }), ' Total Produksi'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20, color: '#F59E0B' } }, totalProduksiButir.toLocaleString()),
                React.createElement('div', { className: 'kpi-trend' }, formatTelur(totalProduksiButir))
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-weight-hanging', style: { color: '#10B981' } }), ' Total Berat'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20, color: '#10B981' } }, totalProduksiKg.toFixed(1), ' kg'),
                React.createElement('div', { className: 'kpi-trend' }, '≈ ' + Math.round(totalProduksiKg) + ' kg')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-chart-line', style: { color: '#8B5CF6' } }), ' Rata-rata Harian'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20, color: '#8B5CF6' } }, rataRataHarian.toLocaleString()),
                React.createElement('div', { className: 'kpi-trend' }, 'butir/hari')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-money-bill-wave', style: { color: '#0EA5E9' } }), ' Total Pendapatan'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 16, color: '#0EA5E9' } }, formatRupiahCompact(totalPendapatan)),
                React.createElement('div', { className: 'kpi-trend' }, 'dari ' + filteredProduksi.length + ' catatan')
            )
        ),
        
        // PRODUKSI HARI INI - Highlight Card
        produksiHariIni && React.createElement('div', { 
            className: 'card', 
            style: { 
                marginBottom: 16, 
                background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                border: 'none'
            }
        },
            React.createElement('div', { className: 'card-header', style: { borderBottomColor: 'rgba(0,0,0,0.1)' } },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-calendar-day', style: { color: '#B45309' } }),
                    React.createElement('span', { style: { color: '#92400E' } }, ' 📅 Produksi Hari Ini')
                )
            ),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 } },
                React.createElement('div', null,
                    React.createElement('div', { style: { fontSize: 32, fontWeight: 800, color: '#B45309' } }, produksiHariIni.jumlah.toLocaleString()),
                    React.createElement('div', { style: { fontSize: 12, color: '#92400E', marginTop: 4 } }, 'butir telur'),
                    React.createElement('div', { style: { fontSize: 11, color: '#B45309', marginTop: 2 } }, 
                        '(' + (produksiHariIni.beratTotal || 0).toFixed(1) + ' kg)'
                    )
                ),
                React.createElement('div', null,
                    React.createElement('div', { style: { fontSize: 14, fontWeight: 600, color: '#92400E' } }, formatRupiah(produksiHariIni.pendapatan)),
                    React.createElement('div', { style: { fontSize: 11, color: '#B45309', marginTop: 4 } }, 
                        '@ ', formatRupiah(produksiHariIni.hargaPerKg), '/kg'
                    )
                ),
                React.createElement('button', { 
                    className: 'btn-icon', 
                    onClick: () => { setModalType('produksiTelur'); setShowModal(true); },
                    style: { background: 'rgba(255,255,255,0.5)' }
                }, React.createElement('i', { className: 'fas fa-plus', style: { color: '#B45309' } }))
            )
        ),
        
        // DAFTAR RIWAYAT PRODUKSI TELUR
        React.createElement('div', { className: 'card', style: { padding: 0, overflow: 'hidden' } },
            React.createElement('div', { className: 'card-header', style: { padding: '12px 16px', margin: 0 } },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-egg', style: { marginRight: 8 } }),
                    ` Riwayat Produksi Telur (${filteredProduksi.length})`
                ),
                React.createElement('div', { style: { display: 'flex', gap: 8 } },
                    React.createElement('button', { 
                        className: 'btn-icon', 
                        onClick: () => exportDataToCSV('produksiTelur'),
                        title: 'Export CSV'
                    }, React.createElement('i', { className: 'fas fa-download' })),
                    React.createElement('button', { 
                        className: 'btn-icon', 
                        onClick: () => { setModalType('produksiTelur'); setShowModal(true); },
                        title: 'Tambah Produksi'
                    }, React.createElement('i', { className: 'fas fa-plus' }))
                )
            ),
            
            React.createElement('div', { style: { padding: '0 16px 16px 16px' } },
                filteredProduksi.length === 0 && 
                    React.createElement('div', { className: 'empty-state', style: { padding: '40px 20px' } },
                        React.createElement('i', { className: 'fas fa-egg', style: { fontSize: 48, marginBottom: 12, color: 'var(--text-tertiary)' } }),
                        React.createElement('p', null, produksiSearchTerm ? 'Data tidak ditemukan' : 'Belum ada data produksi telur'),
                        !produksiSearchTerm && React.createElement('button', { 
                            className: 'btn-primary', 
                            style: { marginTop: 12 },
                            onClick: () => { setModalType('produksiTelur'); setShowModal(true); }
                        }, React.createElement('i', { className: 'fas fa-plus', style: { marginRight: 6 } }), ' Catat Produksi Hari Ini')
                    ),
                
                filteredProduksi.map(function(item) {
                    const isToday = isHariIni(item.tanggal);
                    const produksiIcon = getProduksiIcon(item.jumlah);
                    const produksiColor = getProduksiColor(item.jumlah);
                    const inputDisplay = getInputDisplay(item);
                    
                    return React.createElement('div', { key: item.id, style: { 
                        marginBottom: 12,
                        background: 'var(--surface)',
                        borderRadius: 16,
                        border: isToday ? '2px solid #F59E0B' : '1px solid var(--border-light)',
                        overflow: 'hidden'
                    } },
                        // HEADER: Tanggal + Tombol Aksi
                        React.createElement('div', { style: { 
                            padding: '14px 14px 8px 14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: 8
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 } },
                                React.createElement('div', { style: { 
                                    width: 44, height: 44, 
                                    background: '#F59E0B15', 
                                    borderRadius: 44, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                } },
                                    React.createElement('i', { className: 'fas fa-egg', style: { fontSize: 20, color: '#F59E0B' } })
                                ),
                                React.createElement('div', { style: { flex: 1 } },
                                    React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } }, 
                                        formatTanggal(item.tanggal),
                                        isToday && React.createElement('span', { 
                                            style: { 
                                                background: '#F59E0B', 
                                                color: 'white', 
                                                padding: '2px 8px', 
                                                borderRadius: 20, 
                                                fontSize: 9,
                                                fontWeight: 600
                                            } 
                                        }, 'HARI INI')
                                    ),
                                    React.createElement('div', { style: { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                                        React.createElement('span', null,
                                            React.createElement('i', { className: 'fas fa-weight-hanging', style: { marginRight: 3 } }),
                                            (item.beratTotal || 0).toFixed(1), ' kg'
                                        ),
                                        React.createElement('span', null,
                                            React.createElement('i', { className: 'fas fa-tag', style: { marginRight: 3 } }),
                                            formatRupiah(item.hargaPerKg), '/kg'
                                        ),
                                        item.satuan === 'kg' && React.createElement('span', null,
                                            React.createElement('i', { className: 'fas fa-pen', style: { marginRight: 3 } }),
                                            'input kg'
                                        )
                                    )
                                )
                            ),
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 } },
                                React.createElement('button', { className: 'btn-icon', onClick: function() { handleEditItem('produksiTelur', item); }, style: { width: 32, height: 32 } }, 
                                    React.createElement('i', { className: 'fas fa-edit', style: { fontSize: 12 } })
                                ),
                                React.createElement('button', { className: 'btn-icon danger', onClick: function() { handleDeleteItem('produksiTelur', item.id, formatTanggal(item.tanggal)); }, style: { width: 32, height: 32 } }, 
                                    React.createElement('i', { className: 'fas fa-trash-alt', style: { fontSize: 12 } })
                                )
                            )
                        ),
                        
                        // INFO JUMLAH & PENDAPATAN
                        React.createElement('div', { style: { 
                            margin: '0 14px 12px 14px',
                            padding: '12px',
                            background: '#F59E0B08',
                            borderRadius: 12,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 10
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
                                // BUTIR
                                React.createElement('div', { style: { textAlign: 'center' } },
                                    React.createElement('div', { style: { fontSize: 28, fontWeight: 800, color: produksiColor, lineHeight: 1 } }, item.jumlah.toLocaleString()),
                                    React.createElement('div', { style: { fontSize: 10, color: 'var(--text-tertiary)' } }, 'butir')
                                ),
                                // KG
                                React.createElement('div', { style: { textAlign: 'center' } },
                                    React.createElement('div', { style: { fontSize: 20, fontWeight: 700, color: '#10B981' } }, (item.beratTotal || 0).toFixed(1)),
                                    React.createElement('div', { style: { fontSize: 10, color: 'var(--text-tertiary)' } }, 'kg')
                                ),
                                React.createElement('div', { style: { width: 1, height: 30, background: 'var(--border-light)' } }),
                                React.createElement('div', null,
                                    React.createElement('div', { style: { fontSize: 20, fontWeight: 700, color: '#10B981' } }, formatRupiah(item.pendapatan)),
                                    React.createElement('div', { style: { fontSize: 10, color: 'var(--text-tertiary)' } }, 'pendapatan')
                                ),
                                React.createElement('div', { style: { fontSize: 20, marginLeft: 4 } }, produksiIcon)
                            ),
                            React.createElement('div', { style: { 
                                fontSize: 13, 
                                fontWeight: 600, 
                                color: '#F59E0B',
                                background: '#F59E0B15',
                                padding: '4px 12px',
                                borderRadius: 20
                            } }, 
                                'Hen Day: ' + (item.henDay || Math.round((item.jumlah / (totalPopulasi.layer || 1)) * 100)) + '%'
                            )
                        ),
                        
                        // INFO TAMBAHAN INPUT ASLI (jika input pakai kg)
                        inputDisplay,
                        
                        // CATATAN (jika ada)
                        item.catatan && React.createElement('div', { style: { 
                            margin: '0 14px 12px 14px',
                            padding: '8px 12px',
                            background: 'var(--surface-elevated)',
                            borderRadius: 10,
                            fontSize: 11,
                            color: 'var(--text-tertiary)',
                            border: '1px solid var(--border-light)'
                        } },
                            React.createElement('i', { className: 'fas fa-pencil-alt', style: { marginRight: 6, color: '#F59E0B' } }),
                            item.catatan
                        ),
                        
                        // BORDER GRADIENT BAWAH
                        React.createElement('div', { style: { 
                            height: 3,
                            background: 'linear-gradient(90deg, #F59E0B, #F59E0B, #F59E0B)',
                            marginTop: 4
                        } })
                    );
                })
            )
        )
    );
};
        
// ==================== PANEN BROILER - RENDER FUNCTION ====================
const renderPanenBroiler = () => {
    if (!selectedKandang || selectedKandang.jenis !== 'broiler') {
        return React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'empty-state' },
                React.createElement('i', { className: 'fas fa-drumstick-bite', style: { fontSize: 48, marginBottom: 12, color: 'var(--text-tertiary)' } }),
                React.createElement('p', null, 'Hanya tersedia untuk kandang Broiler (Ayam Pedaging)')
            )
        );
    }
    
    // Filter panen berdasarkan kandang yang dipilih
    const filteredPanen = panenBroiler
        .filter(p => p.kandangId === selectedKandang.id)
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    
    // Hitung statistik panen
    const totalPanenEkor = filteredPanen.reduce((sum, p) => sum + (p.jumlahEkor || 0), 0);
    const totalPanenKg = filteredPanen.reduce((sum, p) => sum + (p.beratTotal || 0), 0);
    const totalPendapatan = filteredPanen.reduce((sum, p) => sum + (p.totalPendapatan || 0), 0);
    const rataRataBerat = filteredPanen.length > 0 
        ? (totalPanenKg / totalPanenEkor).toFixed(2) 
        : 0;
    
    // Panen terbaru
    const panenTerbaru = filteredPanen[0];
    
    const formatTanggal = (tanggal) => moment(tanggal).format('DD MMM YYYY');
    const isHariIni = (tanggal) => tanggal === new Date().toISOString().split('T')[0];
    
    // Get icon berdasarkan jumlah panen
    const getPanenIcon = (ekor) => {
        if (ekor >= 1000) return '🐓🐓🐓';
        if (ekor >= 500) return '🐓🐓';
        if (ekor >= 100) return '🐓';
        return '🍗';
    };
    
    return React.createElement('div', null,
        // ========== SEARCH CARD ==========
        React.createElement('div', { className: 'card', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-search', style: { marginRight: 8 } }),
                    ' Cari Riwayat Panen'
                )
            ),
            React.createElement('div', { style: { position: 'relative' } },
                React.createElement('i', { className: 'fas fa-search', style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 14 } }),
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Cari tanggal, jumlah ekor, atau catatan...',
                    value: produksiSearchTerm,
                    onChange: (e) => setProduksiSearchTerm(e.target.value),
                    className: 'form-input',
                    style: { paddingLeft: 40, width: '100%' }
                }),
                produksiSearchTerm && React.createElement('button', {
                    onClick: () => setProduksiSearchTerm(''),
                    style: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }
                }, React.createElement('i', { className: 'fas fa-times' }))
            )
        ),
        
        // ========== KPI GRID - STATISTIK PANEN ==========
        React.createElement('div', { className: 'kpi-grid', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-drumstick-bite', style: { color: '#F59E0B' } }), ' Total Panen'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20, color: '#F59E0B' } }, totalPanenEkor.toLocaleString()),
                React.createElement('div', { className: 'kpi-trend' }, formatAyam(totalPanenEkor))
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-weight-hanging', style: { color: '#10B981' } }), ' Total Berat'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20, color: '#10B981' } }, totalPanenKg.toFixed(1), ' kg'),
                React.createElement('div', { className: 'kpi-trend' }, '≈ ' + Math.round(totalPanenKg) + ' kg')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-chart-line', style: { color: '#8B5CF6' } }), ' Rata-rata Berat'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20, color: '#8B5CF6' } }, rataRataBerat, ' kg'),
                React.createElement('div', { className: 'kpi-trend' }, 'per ekor')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-money-bill-wave', style: { color: '#0EA5E9' } }), ' Total Pendapatan'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 16, color: '#0EA5E9' } }, formatRupiahCompact(totalPendapatan)),
                React.createElement('div', { className: 'kpi-trend' }, 'dari ' + filteredPanen.length + ' panen')
            )
        ),
        
        // ========== PANEN TERBARU - HIGHLIGHT CARD ==========
        panenTerbaru && React.createElement('div', { 
            className: 'card', 
            style: { 
                marginBottom: 16, 
                background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                border: 'none'
            }
        },
            React.createElement('div', { className: 'card-header', style: { borderBottomColor: 'rgba(0,0,0,0.1)' } },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-calendar-day', style: { color: '#B45309' } }),
                    React.createElement('span', { style: { color: '#92400E' } }, ' 🍗 Panen Terbaru')
                )
            ),
            React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 } },
                React.createElement('div', null,
                    React.createElement('div', { style: { fontSize: 32, fontWeight: 800, color: '#B45309' } }, panenTerbaru.jumlahEkor.toLocaleString()),
                    React.createElement('div', { style: { fontSize: 12, color: '#92400E', marginTop: 4 } }, 'ekor ayam'),
                    React.createElement('div', { style: { fontSize: 11, color: '#B45309', marginTop: 2 } }, 
                        '(' + (panenTerbaru.beratTotal || 0).toFixed(1) + ' kg)'
                    )
                ),
                React.createElement('div', null,
                    React.createElement('div', { style: { fontSize: 14, fontWeight: 600, color: '#92400E' } }, formatRupiah(panenTerbaru.totalPendapatan)),
                    React.createElement('div', { style: { fontSize: 11, color: '#B45309', marginTop: 4 } }, 
                        '@ ', formatRupiah(panenTerbaru.hargaPerKg), '/kg'
                    )
                ),
                React.createElement('button', { 
                    className: 'btn-icon', 
                    onClick: () => { setModalType('panenBroiler'); setShowModal(true); },
                    style: { background: 'rgba(255,255,255,0.5)' }
                }, React.createElement('i', { className: 'fas fa-plus', style: { color: '#B45309' } }))
            )
        ),
        
        // ========== DAFTAR RIWAYAT PANEN ==========
        React.createElement('div', { className: 'card', style: { padding: 0, overflow: 'hidden' } },
            React.createElement('div', { className: 'card-header', style: { padding: '12px 16px', margin: 0 } },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-drumstick-bite', style: { marginRight: 8 } }),
                    ` Riwayat Panen Broiler (${filteredPanen.length})`
                ),
                React.createElement('div', { style: { display: 'flex', gap: 8 } },
                    React.createElement('button', { 
                        className: 'btn-icon', 
                        onClick: () => exportDataToCSV('panenBroiler'),
                        title: 'Export CSV'
                    }, React.createElement('i', { className: 'fas fa-download' })),
                    React.createElement('button', { 
                        className: 'btn-icon', 
                        onClick: () => { setModalType('panenBroiler'); setShowModal(true); },
                        title: 'Tambah Panen'
                    }, React.createElement('i', { className: 'fas fa-plus' }))
                )
            ),
            
            React.createElement('div', { style: { padding: '0 16px 16px 16px' } },
                filteredPanen.length === 0 && 
                    React.createElement('div', { className: 'empty-state', style: { padding: '40px 20px' } },
                        React.createElement('i', { className: 'fas fa-drumstick-bite', style: { fontSize: 48, marginBottom: 12, color: 'var(--text-tertiary)' } }),
                        React.createElement('p', null, produksiSearchTerm ? 'Data tidak ditemukan' : 'Belum ada data panen broiler'),
                        !produksiSearchTerm && React.createElement('button', { 
                            className: 'btn-primary', 
                            style: { marginTop: 12 },
                            onClick: () => { setModalType('panenBroiler'); setShowModal(true); }
                        }, React.createElement('i', { className: 'fas fa-plus', style: { marginRight: 6 } }), ' Catat Panen Hari Ini')
                    ),
                
                filteredPanen.map(function(item) {
                    const isToday = isHariIni(item.tanggal);
                    const panenIcon = getPanenIcon(item.jumlahEkor);
                    const fcrValue = konversiPakan.nilai || 0;
                    
                    return React.createElement('div', { key: item.id, style: { 
                        marginBottom: 12,
                        background: 'var(--surface)',
                        borderRadius: 16,
                        border: isToday ? '2px solid #F59E0B' : '1px solid var(--border-light)',
                        overflow: 'hidden'
                    } },
                        // HEADER: Tanggal + Tombol Aksi
                        React.createElement('div', { style: { 
                            padding: '14px 14px 8px 14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: 8
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 } },
                                React.createElement('div', { style: { 
                                    width: 44, height: 44, 
                                    background: '#F59E0B15', 
                                    borderRadius: 44, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                } },
                                    React.createElement('i', { className: 'fas fa-drumstick-bite', style: { fontSize: 20, color: '#F59E0B' } })
                                ),
                                React.createElement('div', { style: { flex: 1 } },
                                    React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } }, 
                                        formatTanggal(item.tanggal),
                                        isToday && React.createElement('span', { 
                                            style: { 
                                                background: '#F59E0B', 
                                                color: 'white', 
                                                padding: '2px 8px', 
                                                borderRadius: 20, 
                                                fontSize: 9,
                                                fontWeight: 600
                                            } 
                                        }, 'HARI INI')
                                    ),
                                    React.createElement('div', { style: { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                                        React.createElement('span', null,
                                            React.createElement('i', { className: 'fas fa-weight-hanging', style: { marginRight: 3 } }),
                                            (item.beratRata || 0).toFixed(1), ' kg/ekor'
                                        ),
                                        React.createElement('span', null,
                                            React.createElement('i', { className: 'fas fa-tag', style: { marginRight: 3 } }),
                                            formatRupiah(item.hargaPerKg), '/kg'
                                        )
                                    )
                                )
                            ),
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 } },
                                React.createElement('button', { className: 'btn-icon', onClick: function() { handleEditItem('panenBroiler', item); }, style: { width: 32, height: 32 } }, 
                                    React.createElement('i', { className: 'fas fa-edit', style: { fontSize: 12 } })
                                ),
                                React.createElement('button', { className: 'btn-icon danger', onClick: function() { handleDeleteItem('panenBroiler', item.id, formatTanggal(item.tanggal)); }, style: { width: 32, height: 32 } }, 
                                    React.createElement('i', { className: 'fas fa-trash-alt', style: { fontSize: 12 } })
                                )
                            )
                        ),
                        
                        // INFO JUMLAH & PENDAPATAN
                        React.createElement('div', { style: { 
                            margin: '0 14px 12px 14px',
                            padding: '12px',
                            background: '#F59E0B08',
                            borderRadius: 12,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 10
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
                                // EKOR
                                React.createElement('div', { style: { textAlign: 'center' } },
                                    React.createElement('div', { style: { fontSize: 28, fontWeight: 800, color: '#F59E0B', lineHeight: 1 } }, item.jumlahEkor.toLocaleString()),
                                    React.createElement('div', { style: { fontSize: 10, color: 'var(--text-tertiary)' } }, 'ekor')
                                ),
                                // KG
                                React.createElement('div', { style: { textAlign: 'center' } },
                                    React.createElement('div', { style: { fontSize: 20, fontWeight: 700, color: '#10B981' } }, (item.beratTotal || 0).toFixed(1)),
                                    React.createElement('div', { style: { fontSize: 10, color: 'var(--text-tertiary)' } }, 'kg')
                                ),
                                React.createElement('div', { style: { width: 1, height: 30, background: 'var(--border-light)' } }),
                                React.createElement('div', null,
                                    React.createElement('div', { style: { fontSize: 20, fontWeight: 700, color: '#10B981' } }, formatRupiah(item.totalPendapatan)),
                                    React.createElement('div', { style: { fontSize: 10, color: 'var(--text-tertiary)' } }, 'pendapatan')
                                ),
                                React.createElement('div', { style: { fontSize: 20, marginLeft: 4 } }, panenIcon)
                            ),
                            React.createElement('div', { style: { 
                                fontSize: 13, 
                                fontWeight: 600, 
                                color: '#F59E0B',
                                background: '#F59E0B15',
                                padding: '4px 12px',
                                borderRadius: 20
                            } }, 
                                'FCR: ' + fcrValue.toFixed(2)
                            )
                        ),

// INFORMASI DO & PLAT MOBIL (jika ada)
(item.namaDO || item.platMobil) && React.createElement('div', { style: { 
    margin: '0 14px 12px 14px',
    padding: '8px 12px',
    background: '#0EA5E910',
    borderRadius: 10,
    display: 'flex',
    gap: 16,
    flexWrap: 'wrap',
    border: '1px solid #0EA5E920'
} },
    item.namaDO && React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 } },
        React.createElement('i', { className: 'fas fa-user', style: { color: '#0EA5E9' } }),
        React.createElement('span', null, 'DO: ', item.namaDO)
    ),
    item.platMobil && React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 } },
        React.createElement('i', { className: 'fas fa-truck', style: { color: '#0EA5E9' } }),
        React.createElement('span', null, 'Plat: ', item.platMobil)
    )
),
                        
                        // CATATAN (jika ada)
                        item.catatan && React.createElement('div', { style: { 
                            margin: '0 14px 12px 14px',
                            padding: '8px 12px',
                            background: 'var(--surface-elevated)',
                            borderRadius: 10,
                            fontSize: 11,
                            color: 'var(--text-tertiary)',
                            border: '1px solid var(--border-light)'
                        } },
                            React.createElement('i', { className: 'fas fa-pencil-alt', style: { marginRight: 6, color: '#F59E0B' } }),
                            item.catatan
                        ),
                        
                        // BORDER GRADIENT BAWAH
                        React.createElement('div', { style: { 
                            height: 3,
                            background: 'linear-gradient(90deg, #F59E0B, #F59E0B, #F59E0B)',
                            marginTop: 4
                        } })
                    );
                })
            )
        )
    );
};
        
      const renderPakan = () => {
    // Filter Stok Pakan berdasarkan search term
    const filteredStokPakan = stokPakan.filter(item => 
        item.jenis?.toLowerCase().includes(pakanSearchTerm.toLowerCase())
    );
    
    // Filter Pakan Terpakai berdasarkan search term dan kandang
    const filteredPakanTerpakai = pakanTerpakai
        .filter(p => p.kandangId === selectedKandang?.id)
        .filter(item => 
            item.jenis?.toLowerCase().includes(pakanTerpakaiSearchTerm.toLowerCase()) ||
            (item.keterangan || '').toLowerCase().includes(pakanTerpakaiSearchTerm.toLowerCase()) ||
            moment(item.tanggal).format('DD MMM YYYY').toLowerCase().includes(pakanTerpakaiSearchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    
    const totalStokKg = filteredStokPakan.reduce((sum, s) => sum + (s.stok || 0), 0);
    const totalStokValue = filteredStokPakan.reduce((sum, s) => sum + (s.totalHarga || 0), 0);
    const totalPakanTerpakai = filteredPakanTerpakai.reduce((sum, p) => sum + (p.jumlah || 0), 0);
    
    const formatTanggal = (tanggal) => moment(tanggal).format('DD MMM YYYY');
    
    const isStokMenipis = (stok) => {
        if (stok <= 0) return 'habis';
        if (stok < 100) return 'menipis';
        return 'cukup';
    };
    
    const getStokBadgeClass = (stok) => {
        const status = isStokMenipis(stok);
        if (status === 'habis') return 'badge-danger';
        if (status === 'menipis') return 'badge-warning';
        return 'badge-success';
    };
    
    const getStokText = (stok) => {
        const status = isStokMenipis(stok);
        if (status === 'habis') return '⚠️ Habis';
        if (status === 'menipis') return '⚠️ Menipis';
        return '✓ Tersedia';
    };
    
    return React.createElement('div', null,
        // ==================== STOK PAKAN ====================
        React.createElement('div', { className: 'card', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-search', style: { marginRight: 8 } }),
                    ' Cari Stok Pakan'
                )
            ),
            React.createElement('div', { style: { position: 'relative' } },
                React.createElement('i', { className: 'fas fa-search', style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 14 } }),
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Cari jenis pakan...',
                    value: pakanSearchTerm,
                    onChange: (e) => setPakanSearchTerm(e.target.value),
                    className: 'form-input',
                    style: { paddingLeft: 40, width: '100%' }
                }),
                pakanSearchTerm && React.createElement('button', {
                    onClick: () => setPakanSearchTerm(''),
                    style: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }
                }, React.createElement('i', { className: 'fas fa-times' }))
            )
        ),
        
        // KPI GRID - Statistik Stok Pakan
        React.createElement('div', { className: 'kpi-grid', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-box', style: { color: '#10B981' } }), ' Total Stok'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 18, color: '#10B981' } }, totalStokKg.toLocaleString(), ' kg'),
                React.createElement('div', { className: 'kpi-trend' }, filteredStokPakan.length + ' jenis pakan')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-money-bill-wave', style: { color: '#F59E0B' } }), ' Nilai Stok'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 16, color: '#F59E0B' } }, formatRupiahCompact(totalStokValue)),
                React.createElement('div', { className: 'kpi-trend' }, 'Total investasi pakan')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-seedling', style: { color: '#0284C7' } }), ' Pakan Terpakai'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 18, color: '#0284C7' } }, totalPakanTerpakai.toLocaleString(), ' kg'),
                React.createElement('div', { className: 'kpi-trend' }, 'Total pemakaian')
            )
        ),
        
        // CARD STOK PAKAN
        React.createElement('div', { className: 'card', style: { padding: 0, overflow: 'hidden', marginBottom: 16 } },
            React.createElement('div', { className: 'card-header', style: { padding: '12px 16px', margin: 0 } },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-box', style: { marginRight: 8 } }),
                    ' 📦 Stok Pakan (' + filteredStokPakan.length + ')'
                ),
                React.createElement('button', { 
                    className: 'btn-icon', 
                    onClick: () => { setModalType('stokPakan'); setShowModal(true); },
                    title: 'Tambah Stok Pakan'
                }, React.createElement('i', { className: 'fas fa-plus' }))
            ),
            
            React.createElement('div', { style: { padding: '0 16px 16px 16px' } },
                filteredStokPakan.length === 0 && 
                    React.createElement('div', { className: 'empty-state', style: { padding: '40px 20px' } },
                        React.createElement('i', { className: 'fas fa-box', style: { fontSize: 48, marginBottom: 12, color: 'var(--text-tertiary)' } }),
                        React.createElement('p', null, pakanSearchTerm ? 'Data tidak ditemukan' : 'Belum ada stok pakan'),
                        !pakanSearchTerm && React.createElement('button', { 
                            className: 'btn-primary', 
                            style: { marginTop: 12 },
                            onClick: () => { setModalType('stokPakan'); setShowModal(true); }
                        }, React.createElement('i', { className: 'fas fa-plus', style: { marginRight: 6 } }), ' Tambah Stok Pakan')
                    ),
                
                filteredStokPakan.map(function(item) {
                    const stokStatus = getStokBadgeClass(item.stok);
                    const stokText = getStokText(item.stok);
                    const hargaPerKg = item.stok > 0 ? Math.round(item.totalHarga / item.stok) : 0;
                    
                    return React.createElement('div', { key: item.id, style: { 
                        marginBottom: 12,
                        background: 'var(--surface)',
                        borderRadius: 16,
                        border: '1px solid var(--border-light)',
                        overflow: 'hidden'
                    } },
                        // HEADER: Nama Pakan + Tombol Aksi
                        React.createElement('div', { style: { 
                            padding: '14px 14px 8px 14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: 8
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 } },
                                React.createElement('div', { style: { 
                                    width: 44, height: 44, 
                                    background: '#10B98115', 
                                    borderRadius: 44, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                } },
                                    React.createElement('i', { className: 'fas fa-seedling', style: { fontSize: 20, color: '#10B981' } })
                                ),
                                React.createElement('div', { style: { flex: 1 } },
                                    React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' } }, item.jenis),
                                    React.createElement('div', { style: { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                                        React.createElement('span', null,
                                            React.createElement('i', { className: 'fas fa-tag', style: { marginRight: 3 } }),
                                            formatRupiah(hargaPerKg), '/kg'
                                        )
                                    )
                                )
                            ),
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 } },
                                React.createElement('span', { 
                                    className: 'badge ' + stokStatus,
                                    style: { fontSize: 10, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }
                                }, stokText),
                                React.createElement('button', { className: 'btn-icon', onClick: function() { handleEditItem('stokPakan', item); }, style: { width: 32, height: 32 } }, 
                                    React.createElement('i', { className: 'fas fa-edit', style: { fontSize: 12 } })
                                ),
                                React.createElement('button', { className: 'btn-icon danger', onClick: function() { handleDeleteItem('stokPakan', item.id, item.jenis); }, style: { width: 32, height: 32 } }, 
                                    React.createElement('i', { className: 'fas fa-trash-alt', style: { fontSize: 12 } })
                                )
                            )
                        ),
                        
                        // INFO STOK & NILAI
                        React.createElement('div', { style: { 
                            margin: '0 14px 12px 14px',
                            padding: '10px 12px',
                            background: item.stok < 100 ? '#F59E0B10' : (item.stok <= 0 ? '#EF444410' : 'var(--surface-hover)'),
                            borderRadius: 12,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 10
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
                                React.createElement('span', { style: { fontSize: 24, fontWeight: 800, color: item.stok < 100 ? '#F59E0B' : (item.stok <= 0 ? '#EF4444' : '#10B981') } }, item.stok.toLocaleString()),
                                React.createElement('span', { style: { fontSize: 12, color: 'var(--text-tertiary)' } }, 'kg')
                            ),
                            React.createElement('div', { style: { 
                                fontSize: 14, 
                                fontWeight: 700, 
                                color: '#F59E0B',
                                background: '#F59E0B15',
                                padding: '4px 12px',
                                borderRadius: 20
                            } }, formatRupiah(item.totalHarga))
                        ),
                        
                        // PROGRESS BAR (opsional, visual stok)
                        React.createElement('div', { style: { 
                            margin: '0 14px 12px 14px',
                            height: 4,
                            background: 'var(--border-light)',
                            borderRadius: 4,
                            overflow: 'hidden'
                        } },
                            React.createElement('div', { style: { 
                                width: Math.min(100, (item.stok / 500) * 100) + '%',
                                height: '100%',
                                background: item.stok < 100 ? '#F59E0B' : '#10B981',
                                borderRadius: 4
                            } })
                        ),
                        
                        // BORDER GRADIENT BAWAH
                        React.createElement('div', { style: { 
                            height: 3,
                            background: item.stok < 100 ? 'linear-gradient(90deg, #F59E0B, #F59E0B, #F59E0B)' : 'linear-gradient(90deg, #10B981, #0EA5E9, #8B5CF6)',
                            marginTop: 4
                        } })
                    );
                })
            )
        ),
        
        // ==================== PAKAN TERPAKAI ====================
        React.createElement('div', { className: 'card', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-search', style: { marginRight: 8 } }),
                    ' Cari Pakan Terpakai'
                )
            ),
            React.createElement('div', { style: { position: 'relative' } },
                React.createElement('i', { className: 'fas fa-search', style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 14 } }),
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Cari jenis pakan, tanggal, atau keterangan...',
                    value: pakanTerpakaiSearchTerm,
                    onChange: (e) => setPakanTerpakaiSearchTerm(e.target.value),
                    className: 'form-input',
                    style: { paddingLeft: 40, width: '100%' }
                }),
                pakanTerpakaiSearchTerm && React.createElement('button', {
                    onClick: () => setPakanTerpakaiSearchTerm(''),
                    style: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }
                }, React.createElement('i', { className: 'fas fa-times' }))
            )
        ),
        
        React.createElement('div', { className: 'card', style: { padding: 0, overflow: 'hidden' } },
            React.createElement('div', { className: 'card-header', style: { padding: '12px 16px', margin: 0 } },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-utensils', style: { marginRight: 8 } }),
                    ` 🍽️ Pakan Terpakai (${filteredPakanTerpakai.length})`
                ),
                React.createElement('button', { 
                    className: 'btn-icon', 
                    onClick: () => { setModalType('pakanTerpakai'); setShowModal(true); },
                    title: 'Catat Pemakaian Pakan'
                }, React.createElement('i', { className: 'fas fa-plus' }))
            ),
            
            React.createElement('div', { style: { padding: '0 16px 16px 16px' } },
                filteredPakanTerpakai.length === 0 && 
                    React.createElement('div', { className: 'empty-state', style: { padding: '40px 20px' } },
                        React.createElement('i', { className: 'fas fa-utensils', style: { fontSize: 48, marginBottom: 12, color: 'var(--text-tertiary)' } }),
                        React.createElement('p', null, pakanTerpakaiSearchTerm ? 'Data tidak ditemukan' : 'Belum ada catatan pakan terpakai'),
                        !pakanTerpakaiSearchTerm && React.createElement('button', { 
                            className: 'btn-primary', 
                            style: { marginTop: 12 },
                            onClick: () => { setModalType('pakanTerpakai'); setShowModal(true); }
                        }, React.createElement('i', { className: 'fas fa-plus', style: { marginRight: 6 } }), ' Catat Pemakaian Pakan')
                    ),
                
                filteredPakanTerpakai.map(function(item) {
                    return React.createElement('div', { key: item.id, style: { 
                        marginBottom: 12,
                        background: 'var(--surface)',
                        borderRadius: 16,
                        border: '1px solid var(--border-light)',
                        overflow: 'hidden'
                    } },
                        // HEADER: Tanggal + Jenis + Tombol Aksi
                        React.createElement('div', { style: { 
                            padding: '14px 14px 8px 14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: 8
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 } },
                                React.createElement('div', { style: { 
                                    width: 44, height: 44, 
                                    background: '#0284C715', 
                                    borderRadius: 44, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                } },
                                    React.createElement('i', { className: 'fas fa-utensils', style: { fontSize: 20, color: '#0284C7' } })
                                ),
                                React.createElement('div', { style: { flex: 1 } },
                                    React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' } }, item.jenis),
                                    React.createElement('div', { style: { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                                        React.createElement('span', null,
                                            React.createElement('i', { className: 'fas fa-calendar-alt', style: { marginRight: 3 } }),
                                            formatTanggal(item.tanggal)
                                        ),
                                        React.createElement('span', null,
                                            React.createElement('i', { className: 'fas fa-map-marker-alt', style: { marginRight: 3 } }),
                                            item.kandangNama || selectedKandang?.nama
                                        )
                                    )
                                )
                            ),
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 } },
                                React.createElement('button', { className: 'btn-icon', onClick: function() { handleEditItem('pakanTerpakai', item); }, style: { width: 32, height: 32 } }, 
                                    React.createElement('i', { className: 'fas fa-edit', style: { fontSize: 12 } })
                                ),
                                React.createElement('button', { className: 'btn-icon danger', onClick: function() { handleDeleteItem('pakanTerpakai', item.id, item.tanggal); }, style: { width: 32, height: 32 } }, 
                                    React.createElement('i', { className: 'fas fa-trash-alt', style: { fontSize: 12 } })
                                )
                            )
                        ),
                        
                        // INFO JUMLAH
                        React.createElement('div', { style: { 
                            margin: '0 14px 12px 14px',
                            padding: '10px 12px',
                            background: 'var(--surface-hover)',
                            borderRadius: 12,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 10
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
                                React.createElement('span', { style: { fontSize: 24, fontWeight: 800, color: '#0284C7' } }, item.jumlah.toLocaleString()),
                                React.createElement('span', { style: { fontSize: 12, color: 'var(--text-tertiary)' } }, 'kg')
                            ),
                            React.createElement('div', { style: { 
                                fontSize: 12, 
                                fontWeight: 500, 
                                color: '#10B981',
                                background: '#10B98110',
                                padding: '4px 12px',
                                borderRadius: 20
                            } }, 
                                React.createElement('i', { className: 'fas fa-check-circle' }),
                                ' Sudah diberikan'
                            )
                        ),
                        
                        // KETERANGAN (jika ada)
                        item.keterangan && React.createElement('div', { style: { 
                            margin: '0 14px 12px 14px',
                            padding: '8px 12px',
                            background: 'var(--surface-elevated)',
                            borderRadius: 10,
                            fontSize: 11,
                            color: 'var(--text-tertiary)',
                            border: '1px solid var(--border-light)'
                        } },
                            React.createElement('i', { className: 'fas fa-pencil-alt', style: { marginRight: 6, color: '#0284C7' } }),
                            item.keterangan
                        ),
                        
                        // BORDER GRADIENT BAWAH
                        React.createElement('div', { style: { 
                            height: 3,
                            background: 'linear-gradient(90deg, #0284C7, #0EA5E9, #38BDF8)',
                            marginTop: 4
                        } })
                    );
                })
            )
        )
    );
};
        
    const renderKesehatan = () => {
    // Filter penyakit berdasarkan kandang yang dipilih dan search term
    const filteredPenyakit = riwayatPenyakit
        .filter(p => p.kandangId === selectedKandang?.id)
        .filter(item => 
            item.nama?.toLowerCase().includes(kesehatanSearchTerm.toLowerCase()) ||
            item.tingkat?.toLowerCase().includes(kesehatanSearchTerm.toLowerCase()) ||
            item.tanggal?.includes(kesehatanSearchTerm) ||
            (item.tindakan || '').toLowerCase().includes(kesehatanSearchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    
    // Hitung statistik penyakit
    const totalKasus = filteredPenyakit.length;
    const kasusAktif = filteredPenyakit.filter(p => p.status === 'aktif').length;
    const kasusSembuh = filteredPenyakit.filter(p => p.status === 'sembuh').length;
    const totalTerserang = filteredPenyakit.reduce((sum, p) => sum + (p.jumlahTerserang || 0), 0);
    
    const formatTanggal = (tanggal) => moment(tanggal).format('DD MMM YYYY');
    
    // Badge tingkat penyakit
    const getTingkatBadge = (tingkat) => {
        if (tingkat === 'Ringan') return 'badge-ringan';
        if (tingkat === 'Sedang') return 'badge-sedang';
        return 'badge-berat';
    };
    
    const getTingkatIcon = (tingkat) => {
        if (tingkat === 'Ringan') return '🟢';
        if (tingkat === 'Sedang') return '🟡';
        return '🔴';
    };
    
    return React.createElement('div', null,
        // SEARCH CARD
        React.createElement('div', { className: 'card', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-search', style: { marginRight: 8 } }),
                    ' Cari Riwayat Penyakit'
                )
            ),
            React.createElement('div', { style: { position: 'relative' } },
                React.createElement('i', { className: 'fas fa-search', style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 14 } }),
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Cari nama penyakit, tingkat, atau tindakan...',
                    value: kesehatanSearchTerm,
                    onChange: (e) => setKesehatanSearchTerm(e.target.value),
                    className: 'form-input',
                    style: { paddingLeft: 40, width: '100%' }
                }),
                kesehatanSearchTerm && React.createElement('button', {
                    onClick: () => setKesehatanSearchTerm(''),
                    style: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }
                }, React.createElement('i', { className: 'fas fa-times' }))
            )
        ),
        
        // SUMMARY CARD - Statistik Penyakit
        React.createElement('div', { className: 'kpi-grid', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-virus' }), ' Total Kasus'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20 } }, totalKasus),
                React.createElement('div', { className: 'kpi-trend' }, 'Kejadian penyakit')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-exclamation-triangle' }), ' Kasus Aktif'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20, color: '#EF4444' } }, kasusAktif),
                React.createElement('div', { className: 'kpi-trend' }, 'Perlu penanganan')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-check-circle' }), ' Kasus Sembuh'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20, color: '#10B981' } }, kasusSembuh),
                React.createElement('div', { className: 'kpi-trend' }, 'Selesai ditangani')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-kiwi-bird' }), ' Total Terserang'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20 } }, totalTerserang.toLocaleString()),
                React.createElement('div', { className: 'kpi-trend' }, 'Ekor ayam')
            )
        ),
        
        // DAFTAR RIWAYAT PENYAKIT
        React.createElement('div', { className: 'card', style: { padding: 0, overflow: 'hidden' } },
            React.createElement('div', { className: 'card-header', style: { padding: '12px 16px', margin: 0 } },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-heart-pulse', style: { marginRight: 8 } }),
                    ' Riwayat Penyakit (' + filteredPenyakit.length + ')'
                ),
                React.createElement('button', { 
                    className: 'btn-icon', 
                    onClick: () => { setModalType('penyakit'); setShowModal(true); },
                    title: 'Tambah Riwayat Penyakit'
                }, React.createElement('i', { className: 'fas fa-plus' }))
            ),
            
            React.createElement('div', { style: { padding: '0 16px 16px 16px' } },
                filteredPenyakit.length === 0 && 
                    React.createElement('div', { className: 'empty-state', style: { padding: '40px 20px' } },
                        React.createElement('i', { className: 'fas fa-heart-pulse', style: { fontSize: 48, marginBottom: 12, color: 'var(--text-tertiary)' } }),
                        React.createElement('p', null, kesehatanSearchTerm ? 'Data tidak ditemukan' : 'Belum ada riwayat penyakit'),
                        !kesehatanSearchTerm && React.createElement('button', { 
                            className: 'btn-primary', 
                            style: { marginTop: 12 },
                            onClick: () => { setModalType('penyakit'); setShowModal(true); }
                        }, React.createElement('i', { className: 'fas fa-plus', style: { marginRight: 6 } }), ' Catat Penyakit')
                    ),
                
                filteredPenyakit.map(function(item) {
                    const tingkatBadge = getTingkatBadge(item.tingkat);
                    const tingkatIcon = getTingkatIcon(item.tingkat);
                    const statusClass = item.status === 'aktif' ? 'badge-danger' : 'badge-success';
                    const statusText = item.status === 'aktif' ? 'Aktif' : 'Selesai';
                    
                    return React.createElement('div', { key: item.id, style: { 
                        marginBottom: 12,
                        background: 'var(--surface)',
                        borderRadius: 16,
                        border: '1px solid var(--border-light)',
                        overflow: 'hidden'
                    } },
                        // HEADER: Nama Penyakit + Tombol Aksi
                        React.createElement('div', { style: { 
                            padding: '14px 14px 8px 14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: 8
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 } },
                                React.createElement('div', { style: { 
                                    width: 44, height: 44, 
                                    background: '#EF444415', 
                                    borderRadius: 44, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                } },
                                    React.createElement('i', { className: 'fas fa-virus', style: { fontSize: 20, color: '#EF4444' } })
                                ),
                                React.createElement('div', { style: { flex: 1 } },
                                    React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' } }, item.nama),
                                    React.createElement('div', { style: { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                                        React.createElement('span', { className: tingkatBadge, style: { padding: '2px 8px', borderRadius: 20, fontSize: 10 } },
                                            tingkatIcon + ' ' + item.tingkat
                                        ),
                                        React.createElement('span', null,
                                            React.createElement('i', { className: 'fas fa-calendar-alt', style: { marginRight: 3 } }),
                                            formatTanggal(item.tanggal)
                                        ),
                                        React.createElement('span', null,
                                            React.createElement('i', { className: 'fas fa-kiwi-bird', style: { marginRight: 3 } }),
                                            item.jumlahTerserang + ' ekor'
                                        )
                                    )
                                )
                            ),
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 } },
                                React.createElement('span', { className: 'badge ' + statusClass, style: { fontSize: 10, padding: '4px 10px' } }, statusText),
                                React.createElement('button', { className: 'btn-icon', onClick: function() { handleEditItem('penyakit', item); }, style: { width: 32, height: 32 } }, 
                                    React.createElement('i', { className: 'fas fa-edit', style: { fontSize: 12 } })
                                ),
                                React.createElement('button', { className: 'btn-icon danger', onClick: function() { handleDeleteItem('penyakit', item.id, item.nama); }, style: { width: 32, height: 32 } }, 
                                    React.createElement('i', { className: 'fas fa-trash-alt', style: { fontSize: 12 } })
                                )
                            )
                        ),
                        
                        // TINDAKAN (jika ada)
                        item.tindakan && React.createElement('div', { style: { 
                            margin: '0 14px 12px 14px',
                            padding: '10px 12px',
                            background: '#EF444410',
                            borderRadius: 12,
                            borderLeft: '3px solid #EF4444'
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 8 } },
                                React.createElement('i', { className: 'fas fa-notes-medical', style: { color: '#EF4444', marginTop: 2 } }),
                                React.createElement('div', { style: { flex: 1 } },
                                    React.createElement('div', { style: { fontSize: 11, fontWeight: 600, marginBottom: 4, color: '#EF4444' } }, '📋 TINDAKAN PENANGANAN'),
                                    React.createElement('div', { style: { fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 } }, item.tindakan)
                                )
                            )
                        ),
                        
                        // BORDER GRADIENT BAWAH (warna merah untuk penyakit)
                        React.createElement('div', { style: { 
                            height: 3,
                            background: 'linear-gradient(90deg, #EF4444, #F59E0B, #EF4444)',
                            marginTop: 4
                        } })
                    );
                })
            )
        )
    );
};
        
       const renderVaksin = () => {
    // Filter vaksin berdasarkan kandang yang dipilih dan search term
    const filteredVaksin = jadwalVaksin
        .filter(v => v.kandangId === selectedKandang?.id)
        .filter(item => 
            item.nama?.toLowerCase().includes(vaksinSearchTerm.toLowerCase()) ||
            item.metode?.toLowerCase().includes(vaksinSearchTerm.toLowerCase()) ||
            item.tanggal?.includes(vaksinSearchTerm) ||
            (item.catatan || '').toLowerCase().includes(vaksinSearchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    
    // Hitung statistik vaksinasi
    const totalVaksin = filteredVaksin.length;
    const terjadwal = filteredVaksin.filter(v => v.status === 'terjadwal').length;
    const selesai = filteredVaksin.filter(v => v.status === 'selesai').length;
    const jadwalHariIni = filteredVaksin.filter(v => v.tanggal === new Date().toISOString().split('T')[0]).length;
    
    const formatTanggal = (tanggal) => moment(tanggal).format('DD MMM YYYY');
    const isHariIni = (tanggal) => tanggal === new Date().toISOString().split('T')[0];
    
    // Metode icon
    const getMetodeIcon = (metode) => {
        if (metode === 'Suntik') return '💉';
        if (metode === 'Tetes Mata') return '👁️';
        if (metode === 'Air Minum') return '💧';
        return '💊';
    };
    
    return React.createElement('div', null,
        // SEARCH CARD
        React.createElement('div', { className: 'card', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-search', style: { marginRight: 8 } }),
                    ' Cari Jadwal Vaksinasi'
                )
            ),
            React.createElement('div', { style: { position: 'relative' } },
                React.createElement('i', { className: 'fas fa-search', style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 14 } }),
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Cari nama vaksin, metode, atau catatan...',
                    value: vaksinSearchTerm,
                    onChange: (e) => setVaksinSearchTerm(e.target.value),
                    className: 'form-input',
                    style: { paddingLeft: 40, width: '100%' }
                }),
                vaksinSearchTerm && React.createElement('button', {
                    onClick: () => setVaksinSearchTerm(''),
                    style: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }
                }, React.createElement('i', { className: 'fas fa-times' }))
            )
        ),
        
        // SUMMARY CARD - Statistik Vaksinasi
        React.createElement('div', { className: 'kpi-grid', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-syringe' }), ' Total Vaksin'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20 } }, totalVaksin),
                React.createElement('div', { className: 'kpi-trend' }, 'Jadwal vaksinasi')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-clock' }), ' Terjadwal'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20, color: '#F59E0B' } }, terjadwal),
                React.createElement('div', { className: 'kpi-trend' }, 'Menunggu pelaksanaan')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-check-circle' }), ' Selesai'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20, color: '#10B981' } }, selesai),
                React.createElement('div', { className: 'kpi-trend' }, 'Telah dilaksanakan')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-calendar-day' }), ' Jadwal Hari Ini'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20, color: '#0284C7' } }, jadwalHariIni),
                React.createElement('div', { className: 'kpi-trend' }, 'Perlu segera dilakukan')
            )
        ),
        
        // DAFTAR JADWAL VAKSINASI
        React.createElement('div', { className: 'card', style: { padding: 0, overflow: 'hidden' } },
            React.createElement('div', { className: 'card-header', style: { padding: '12px 16px', margin: 0 } },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-syringe', style: { marginRight: 8 } }),
                    ' Jadwal Vaksinasi (' + filteredVaksin.length + ')'
                ),
                React.createElement('button', { 
                    className: 'btn-icon', 
                    onClick: () => { setModalType('vaksin'); setShowModal(true); },
                    title: 'Tambah Jadwal Vaksin'
                }, React.createElement('i', { className: 'fas fa-plus' }))
            ),
            
            React.createElement('div', { style: { padding: '0 16px 16px 16px' } },
                filteredVaksin.length === 0 && 
                    React.createElement('div', { className: 'empty-state', style: { padding: '40px 20px' } },
                        React.createElement('i', { className: 'fas fa-syringe', style: { fontSize: 48, marginBottom: 12, color: 'var(--text-tertiary)' } }),
                        React.createElement('p', null, vaksinSearchTerm ? 'Data tidak ditemukan' : 'Belum ada jadwal vaksinasi'),
                        !vaksinSearchTerm && React.createElement('button', { 
                            className: 'btn-primary', 
                            style: { marginTop: 12 },
                            onClick: () => { setModalType('vaksin'); setShowModal(true); }
                        }, React.createElement('i', { className: 'fas fa-plus', style: { marginRight: 6 } }), ' Tambah Jadwal Vaksin')
                    ),
                
                filteredVaksin.map(function(item) {
                    const isToday = isHariIni(item.tanggal);
                    const isOverdue = new Date(item.tanggal) < new Date() && item.status !== 'selesai';
                    const statusClass = item.status === 'selesai' ? 'badge-success' : (isToday ? 'badge-warning' : 'badge-info');
                    const statusText = item.status === 'selesai' ? '✓ Selesai' : (isToday ? '⚠️ Hari Ini!' : '📅 Terjadwal');
                    
                    return React.createElement('div', { key: item.id, style: { 
                        marginBottom: 12,
                        background: 'var(--surface)',
                        borderRadius: 16,
                        border: isToday ? '1px solid #F59E0B' : '1px solid var(--border-light)',
                        overflow: 'hidden'
                    } },
                        // HEADER: Nama Vaksin + Tombol Aksi
                        React.createElement('div', { style: { 
                            padding: '14px 14px 8px 14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: 8
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 } },
                                React.createElement('div', { style: { 
                                    width: 44, height: 44, 
                                    background: '#0284C715', 
                                    borderRadius: 44, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                } },
                                    React.createElement('i', { className: 'fas fa-syringe', style: { fontSize: 20, color: '#0284C7' } })
                                ),
                                React.createElement('div', { style: { flex: 1 } },
                                    React.createElement('div', { style: { fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' } }, item.nama),
                                    React.createElement('div', { style: { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                                        React.createElement('span', null,
                                            React.createElement('span', { style: { marginRight: 3 } }, getMetodeIcon(item.metode)),
                                            item.metode
                                        ),
                                        item.dosis && React.createElement('span', null,
                                            React.createElement('i', { className: 'fas fa-tachometer-alt', style: { marginRight: 3 } }),
                                            item.dosis
                                        )
                                    )
                                )
                            ),
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 } },
                                React.createElement('span', { 
                                    className: 'badge ' + statusClass,
                                    style: { fontSize: 10, padding: '4px 10px' }
                                }, statusText),
                                React.createElement('button', { className: 'btn-icon', onClick: function() { handleEditItem('jadwalVaksin', item); }, style: { width: 32, height: 32 } }, 
                                    React.createElement('i', { className: 'fas fa-edit', style: { fontSize: 12 } })
                                ),
                                React.createElement('button', { className: 'btn-icon danger', onClick: function() { handleDeleteItem('jadwalVaksin', item.id, item.nama); }, style: { width: 32, height: 32 } }, 
                                    React.createElement('i', { className: 'fas fa-trash-alt', style: { fontSize: 12 } })
                                )
                            )
                        ),
                        
                        // INFO TANGGAL & STATUS
                        React.createElement('div', { style: { 
                            margin: '0 14px 12px 14px',
                            padding: '10px 12px',
                            background: isToday ? '#F59E0B10' : 'var(--surface-hover)',
                            borderRadius: 12,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 10
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
                                React.createElement('span', { style: { fontSize: 12, color: isToday ? '#F59E0B' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 } },
                                    React.createElement('i', { className: 'fas fa-calendar-alt' }),
                                    formatTanggal(item.tanggal)
                                ),
                                item.status !== 'selesai' && React.createElement('button', {
                                    onClick: function() {
                                        const updatedVaksin = { ...item, status: 'selesai' };
                                        setJadwalVaksin(function(prev) { 
                                            var updated = prev.map(function(v) { return v.id === item.id ? updatedVaksin : v; });
                                            saveToFirebase('jadwalVaksin', updated);
                                            saveToStorage('jadwalVaksin', updated);
                                            return updated;
                                        });
                                        addNotification('success', 'Vaksinasi', item.nama + ' selesai', 2000);
                                    },
                                    style: {
                                        background: '#10B981',
                                        border: 'none',
                                        borderRadius: 20,
                                        padding: '4px 12px',
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 4
                                    }
                                },
                                    React.createElement('i', { className: 'fas fa-check' }),
                                    ' Tandai Selesai'
                                )
                            ),
                            item.status !== 'selesai' && React.createElement('div', { style: { 
                                fontSize: 12, 
                                fontWeight: 600, 
                                color: '#F59E0B',
                                background: '#F59E0B10',
                                padding: '4px 12px',
                                borderRadius: 20
                            } }, 
                                React.createElement('i', { className: 'fas fa-bell' }),
                                ' Perlu segera dilaksanakan'
                            )
                        ),
                        
                        // CATATAN
                        item.catatan && React.createElement('div', { style: { 
                            margin: '0 14px 12px 14px',
                            padding: '8px 12px',
                            background: 'var(--surface-elevated)',
                            borderRadius: 10,
                            fontSize: 11,
                            color: 'var(--text-tertiary)',
                            border: '1px solid var(--border-light)'
                        } },
                            React.createElement('i', { className: 'fas fa-pencil-alt', style: { marginRight: 6, color: '#0284C7' } }),
                            item.catatan
                        ),
                        
                        // BORDER GRADIENT BAWAH
                        React.createElement('div', { style: { 
                            height: 3,
                            background: isToday ? 'linear-gradient(90deg, #F59E0B, #F59E0B, #F59E0B)' : 'linear-gradient(90deg, #0284C7, #0EA5E9, #38BDF8)',
                            marginTop: 4
                        } })
                    );
                })
            )
        )
    );
};
        
const renderTransaksi = () => {
    // Filter transaksi berdasarkan search term
    const filteredTransaksi = transaksiPenjualan.filter(item => 
        item.noFaktur?.toLowerCase().includes(searchTermTransaksi.toLowerCase()) ||
        item.pembeli?.toLowerCase().includes(searchTermTransaksi.toLowerCase())
    ).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    
    // Hitung statistik transaksi
    const totalTransaksi = filteredTransaksi.length;
    const totalPendapatan = filteredTransaksi.reduce((sum, t) => sum + (t.totalBayar || 0), 0);
    const totalBerat = filteredTransaksi.reduce((sum, t) => sum + (t.totalBerat || 0), 0);
    const rataRataPerTransaksi = totalTransaksi > 0 ? totalPendapatan / totalTransaksi : 0;
    
    const formatTanggal = (tanggal) => moment(tanggal).format('DD MMM YYYY');
    
    const getMetodeBadge = (metode) => {
        if (metode === 'Tunai') return 'badge-tunai';
        if (metode === 'Transfer') return 'badge-transfer';
        return 'badge-kredit';
    };
    
    const getMetodeIcon = (metode) => {
        if (metode === 'Tunai') return '💰';
        if (metode === 'Transfer') return '🏦';
        return '💳';
    };
    
    return React.createElement('div', null,
        // SEARCH CARD
        React.createElement('div', { className: 'card', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-search', style: { marginRight: 8 } }),
                    ' Cari Transaksi'
                )
            ),
            React.createElement('div', { style: { position: 'relative' } },
                React.createElement('i', { className: 'fas fa-search', style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 14 } }),
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Cari No. Faktur atau Pembeli...',
                    value: searchTermTransaksi,
                    onChange: (e) => setSearchTermTransaksi(e.target.value),
                    className: 'form-input',
                    style: { paddingLeft: 40, width: '100%' }
                }),
                searchTermTransaksi && React.createElement('button', {
                    onClick: () => setSearchTermTransaksi(''),
                    style: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }
                }, React.createElement('i', { className: 'fas fa-times' }))
            )
        ),
        
        // KPI GRID - Statistik Transaksi
        React.createElement('div', { className: 'kpi-grid', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-receipt', style: { color: '#0EA5E9' } }), ' Total Transaksi'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 20, color: '#0EA5E9' } }, totalTransaksi.toLocaleString()),
                React.createElement('div', { className: 'kpi-trend' }, 'Semua waktu')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-money-bill-wave', style: { color: '#10B981' } }), ' Total Pendapatan'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 16, color: '#10B981' } }, formatRupiahCompact(totalPendapatan)),
                React.createElement('div', { className: 'kpi-trend' }, 'Dari penjualan')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-weight-hanging', style: { color: '#F59E0B' } }), ' Total Berat'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 18, color: '#F59E0B' } }, totalBerat.toFixed(1), ' kg'),
                React.createElement('div', { className: 'kpi-trend' }, 'Produk terjual')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-chart-line', style: { color: '#8B5CF6' } }), ' Rata-rata'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 16, color: '#8B5CF6' } }, formatRupiahCompact(rataRataPerTransaksi)),
                React.createElement('div', { className: 'kpi-trend' }, 'per transaksi')
            )
        ),
        
        // DAFTAR TRANSAKSI
        React.createElement('div', { className: 'card', style: { padding: 0, overflow: 'hidden' } },
            React.createElement('div', { className: 'card-header', style: { padding: '12px 16px', margin: 0 } },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-receipt', style: { marginRight: 8 } }),
                    ` Transaksi Penjualan (${filteredTransaksi.length})`
                ),
                React.createElement('div', { style: { display: 'flex', gap: 8 } },
                    React.createElement('button', { 
                        className: 'btn-icon', 
                        onClick: () => exportDataToCSV('transaksi'),
                        title: 'Export CSV'
                    }, React.createElement('i', { className: 'fas fa-download' })),
                    React.createElement('button', { 
                        className: 'btn-icon', 
                        onClick: () => { 
                            setTransaksiItems([]); 
                            setModalType('transaksi'); 
                            setShowModal(true); 
                        },
                        title: 'Tambah Transaksi'
                    }, React.createElement('i', { className: 'fas fa-plus' }))
                )
            ),
            
            React.createElement('div', { style: { padding: '0 16px 16px 16px' } },
                filteredTransaksi.length === 0 && 
                    React.createElement('div', { className: 'empty-state', style: { padding: '40px 20px' } },
                        React.createElement('i', { className: 'fas fa-receipt', style: { fontSize: 48, marginBottom: 12, color: 'var(--text-tertiary)' } }),
                        React.createElement('p', null, searchTermTransaksi ? 'Transaksi tidak ditemukan' : 'Belum ada transaksi penjualan'),
                        !searchTermTransaksi && React.createElement('button', { 
                            className: 'btn-primary', 
                            style: { marginTop: 12 },
                            onClick: () => { 
                                setTransaksiItems([]); 
                                setModalType('transaksi'); 
                                setShowModal(true); 
                            }
                        }, React.createElement('i', { className: 'fas fa-plus', style: { marginRight: 6 } }), ' Buat Transaksi Baru')
                    ),
                
                filteredTransaksi.slice(0, 50).map(function(item) {
                    const metodeBadge = getMetodeBadge(item.metodePembayaran);
                    const metodeIcon = getMetodeIcon(item.metodePembayaran);
                    const itemCount = item.items?.length || 0;
                    const previewItems = item.items?.slice(0, 2) || [];
                    const moreItems = itemCount - 2;
                    
                    return React.createElement('div', { 
                        key: item.id, 
                        style: { 
                            marginBottom: 12,
                            background: 'var(--surface)',
                            borderRadius: 16,
                            border: '1px solid var(--border-light)',
                            overflow: 'hidden',
                            cursor: 'pointer'
                        },
                        onClick: (e) => { 
                            if (e.target.closest('.action-btn')) return; 
                            setSelectedTransaksi(item); 
                            setShowResi(true); 
                        }
                    },
                        // HEADER: No Faktur + Tombol Aksi
                        React.createElement('div', { style: { 
                            padding: '14px 14px 8px 14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: 8
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 } },
                                React.createElement('div', { style: { 
                                    width: 44, height: 44, 
                                    background: '#0EA5E915', 
                                    borderRadius: 44, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                } },
                                    React.createElement('i', { className: 'fas fa-receipt', style: { fontSize: 20, color: '#0EA5E9' } })
                                ),
                                React.createElement('div', { style: { flex: 1 } },
                                    React.createElement('div', { style: { fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'monospace' } }, item.noFaktur),
                                    React.createElement('div', { style: { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                                        React.createElement('span', null,
                                            React.createElement('i', { className: 'fas fa-calendar-alt', style: { marginRight: 3 } }),
                                            formatTanggal(item.tanggal)
                                        ),
                                        React.createElement('span', null,
                                            React.createElement('i', { className: 'fas fa-user', style: { marginRight: 3 } }),
                                            item.pembeli || 'Umum'
                                        )
                                    )
                                )
                            ),
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 } },
                                React.createElement('span', { 
                                    className: 'badge ' + metodeBadge,
                                    style: { fontSize: 10, padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: 4 }
                                }, 
                                    React.createElement('span', null, metodeIcon),
                                    ' ', item.metodePembayaran || 'Tunai'
                                ),
                                React.createElement('button', { 
                                    className: 'btn-icon action-btn', 
                                    onClick: (e) => { e.stopPropagation(); handleEditItem('transaksi', item); }, 
                                    style: { width: 32, height: 32, background: 'var(--surface-hover)' }
                                }, React.createElement('i', { className: 'fas fa-edit', style: { fontSize: 12 } })),
                                React.createElement('button', { 
                                    className: 'btn-icon danger action-btn', 
                                    onClick: (e) => { e.stopPropagation(); handleDeleteItem('transaksi', item.id, item.noFaktur); }, 
                                    style: { width: 32, height: 32 }
                                }, React.createElement('i', { className: 'fas fa-trash-alt', style: { fontSize: 12 } }))
                            )
                        ),
                        
                        // INFO BAR: Pembeli, Item, Berat
                        React.createElement('div', { style: { 
                            margin: '0 14px 12px 14px',
                            padding: '10px 12px',
                            background: 'var(--surface-hover)',
                            borderRadius: 12,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 10
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
                                React.createElement('span', { style: { fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 } },
                                    React.createElement('i', { className: 'fas fa-boxes', style: { fontSize: 11 } }),
                                    itemCount, ' item'
                                ),
                                React.createElement('span', { style: { fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 } },
                                    React.createElement('i', { className: 'fas fa-weight-hanging', style: { fontSize: 11 } }),
                                    (item.totalBerat || 0).toFixed(1), ' kg'
                                )
                            ),
                            React.createElement('div', { style: { 
                                fontSize: 16, 
                                fontWeight: 800, 
                                color: '#10B981',
                                background: '#10B98110',
                                padding: '4px 12px',
                                borderRadius: 20
                            } }, formatRupiah(item.totalBayar))
                        ),
                        
                        // PREVIEW ITEMS (chip)
                        previewItems.length > 0 && React.createElement('div', { style: { 
                            margin: '0 14px 12px 14px',
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                            alignItems: 'center'
                        } },
                            previewItems.map((itm, idx) => 
                                React.createElement('span', { key: idx, style: { 
                                    background: 'var(--surface-elevated)',
                                    padding: '4px 10px',
                                    borderRadius: 20,
                                    fontSize: 10,
                                    color: 'var(--text-secondary)',
                                    border: '1px solid var(--border-light)'
                                } }, 
                                    itm.grade || 'Produk', ': ', itm.kg.toFixed(1), ' kg'
                                )
                            ),
                            moreItems > 0 && React.createElement('span', { style: { 
                                fontSize: 10, 
                                color: 'var(--text-tertiary)',
                                padding: '4px 8px'
                            } }, 
                                '+', moreItems, ' lainnya'
                            )
                        ),
                        
                        // TOMBOL AKSI CEPAT (Print Invoice & Resi)
                        React.createElement('div', { style: { 
                            display: 'flex',
                            gap: 10,
                            padding: '12px 14px 14px 14px',
                            borderTop: '1px solid var(--border-light)',
                            marginTop: 4
                        } },
                            React.createElement('button', { 
                                onClick: (e) => { e.stopPropagation(); handlePrintInvoice(item); },
                                className: 'btn-primary', 
                                style: { 
                                    flex: 1, 
                                    background: 'linear-gradient(135deg, #10B981, #059669)',
                                    fontSize: 11,
                                    padding: '8px',
                                    borderRadius: 30,
                                    gap: 6
                                }
                            }, 
                                React.createElement('i', { className: 'fas fa-file-invoice', style: { fontSize: 11 } }), 
                                ' Invoice'
                            ),
                            React.createElement('button', { 
                                onClick: (e) => { e.stopPropagation(); handlePrintResiSimple(item); },
                                className: 'btn-secondary', 
                                style: { 
                                    flex: 1, 
                                    background: 'linear-gradient(135deg, #0284C7, #0EA5E9)',
                                    fontSize: 11,
                                    padding: '8px',
                                    borderRadius: 30,
                                    gap: 6
                                }
                            }, 
                                React.createElement('i', { className: 'fas fa-receipt', style: { fontSize: 11 } }), 
                                ' Resi'
                            )
                        ),
                        
                        // BORDER GRADIENT BAWAH
                        React.createElement('div', { style: { 
                            height: 3,
                            background: 'linear-gradient(90deg, #10B981, #0EA5E9, #8B5CF6)',
                            marginTop: 4
                        } })
                    );
                }),
                
                filteredTransaksi.length > 50 && 
                    React.createElement('div', { className: 'text-center', style: { padding: '16px', color: 'var(--text-tertiary)', fontSize: 12 } },
                        `Menampilkan 50 dari ${filteredTransaksi.length} transaksi`
                    )
            )
        ),
        
        // MODAL RESI / DETAIL TRANSAKSI
        showResi && selectedTransaksi && React.createElement('div', { 
            className: 'modal-overlay', 
            onClick: () => setShowResi(false),
            style: { zIndex: 1000 }
        },
            React.createElement('div', { 
                className: 'modal-content', 
                style: { maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' },
                onClick: e => e.stopPropagation()
            },
                // SWIPE HANDLE
                React.createElement('div', { 
                    className: 'swipe-handle',
                    style: { position: 'sticky', top: 0, background: 'var(--surface)', zIndex: 10 }
                },
                    React.createElement('div', { className: 'swipe-indicator' })
                ),
                React.createElement('div', { className: 'modal-header' },
                    React.createElement('h3', null, 
                        React.createElement('i', { className: 'fas fa-receipt' }), 
                        ' Detail Transaksi'
                    ),
                    React.createElement('button', { className: 'modal-close', onClick: () => setShowResi(false) }, 
                        React.createElement('i', { className: 'fas fa-times' })
                    )
                ),
                React.createElement('div', { className: 'modal-body', style: { maxHeight: '60vh', overflowY: 'auto' } },
                    // Ringkasan
                    React.createElement('div', { style: { marginBottom: 16, background: 'var(--surface-hover)', padding: 12, borderRadius: 12 } },
                        React.createElement('div', { className: 'info-row' }, 
                            React.createElement('span', null, 'No. Faktur:'), 
                            React.createElement('strong', { style: { fontFamily: 'monospace' } }, selectedTransaksi.noFaktur)
                        ),
                        React.createElement('div', { className: 'info-row' }, 
                            React.createElement('span', null, 'Tanggal:'), 
                            React.createElement('strong', null, moment(selectedTransaksi.tanggal).format('DD MMM YYYY'))
                        ),
                        React.createElement('div', { className: 'info-row' }, 
                            React.createElement('span', null, 'Pembeli:'), 
                            React.createElement('strong', null, selectedTransaksi.pembeli || 'Umum')
                        ),
                        React.createElement('div', { className: 'info-row' }, 
                            React.createElement('span', null, 'Metode Bayar:'), 
                            React.createElement('strong', null, 
                                React.createElement('span', null, getMetodeIcon(selectedTransaksi.metodePembayaran)),
                                ' ', selectedTransaksi.metodePembayaran || 'Tunai'
                            )
                        ),
                        React.createElement('div', { className: 'info-row' }, 
                            React.createElement('span', null, 'Total Berat:'), 
                            React.createElement('strong', null, (selectedTransaksi.totalBerat || 0).toFixed(2), ' kg')
                        ),
                        React.createElement('div', { className: 'info-row', style: { marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--border-light)' } }, 
                            React.createElement('span', null, 'Total Bayar:'), 
                            React.createElement('strong', { style: { color: '#10B981', fontSize: 16 } }, formatRupiah(selectedTransaksi.totalBayar))
                        )
                    ),
                    
                    React.createElement('hr', null),
                    React.createElement('h4', { style: { marginBottom: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 } },
                        React.createElement('i', { className: 'fas fa-boxes' }), 
                        ' Item Transaksi:'
                    ),
                    selectedTransaksi.items?.map((item, idx) => 
                        React.createElement('div', { key: idx, className: 'list-item', style: { padding: '8px 0' } },
                            React.createElement('div', { className: 'item-info' },
                                React.createElement('h4', null, item.grade || 'Produk'),
                                React.createElement('p', null, `${item.kg} kg @ ${formatRupiah(item.hargaKg)}`)
                            ),
                            React.createElement('div', { className: 'item-value' }, formatRupiah(item.subtotal))
                        )
                    ),
                    
                    selectedTransaksi.catatan && React.createElement(React.Fragment, null,
                        React.createElement('hr', null),
                        React.createElement('div', { style: { marginTop: 12, padding: 10, background: 'var(--surface-hover)', borderRadius: 8 } },
                            React.createElement('strong', null, '📝 Catatan:'),
                            React.createElement('p', { style: { marginTop: 4, fontSize: 12 } }, selectedTransaksi.catatan)
                        )
                    )
                ),
                React.createElement('div', { className: 'modal-actions', style: { flexWrap: 'wrap', gap: 8 } },
                    React.createElement('button', { 
                        className: 'btn-primary', 
                        onClick: () => handlePrintInvoice(selectedTransaksi),
                        style: { background: 'linear-gradient(135deg, #10B981, #059669)', flex: 1 }
                    }, 
                        React.createElement('i', { className: 'fas fa-file-invoice' }), 
                        ' Invoice Premium'
                    ),
                    React.createElement('button', { 
                        className: 'btn-secondary', 
                        onClick: () => handlePrintResiSimple(selectedTransaksi),
                        style: { flex: 1 }
                    }, 
                        React.createElement('i', { className: 'fas fa-receipt' }), 
                        ' Resi Sederhana'
                    ),
                    React.createElement('button', { 
                        className: 'btn-outline', 
                        onClick: () => setShowResi(false),
                        style: { flex: 0.5 }
                    }, 
                        React.createElement('i', { className: 'fas fa-times' }), 
                        ' Tutup'
                    )
                )
            )
        )
    );
};
       const renderKaryawan = () => {
    const today = new Date().toISOString().split('T')[0];
    
    const filteredKaryawan = karyawanList.filter(karyawan => 
        karyawan.nama?.toLowerCase().includes(karyawanSearchTerm.toLowerCase()) ||
        karyawan.posisi?.toLowerCase().includes(karyawanSearchTerm.toLowerCase()) ||
        karyawan.noHp?.includes(karyawanSearchTerm)
    );
    
    const getAbsensiStatus = (karyawanId) => {
        const absenHariIni = absensiHarian.find(a => a.karyawanId === karyawanId && a.tanggal === today);
        if (!absenHariIni) return 'belum';
        return absenHariIni.status;
    };
    
    return React.createElement('div', null,
        // SEARCH CARD
        React.createElement('div', { className: 'card', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-search', style: { marginRight: 8 } }),
                    ' Cari Karyawan'
                )
            ),
            React.createElement('div', { style: { position: 'relative' } },
                React.createElement('i', { className: 'fas fa-search', style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 14 } }),
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Cari nama, posisi, atau no HP...',
                    value: karyawanSearchTerm,
                    onChange: (e) => setKaryawanSearchTerm(e.target.value),
                    className: 'form-input',
                    style: { paddingLeft: 40, width: '100%' }
                }),
                karyawanSearchTerm && React.createElement('button', {
                    onClick: () => setKaryawanSearchTerm(''),
                    style: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }
                }, React.createElement('i', { className: 'fas fa-times' }))
            )
        ),
        
        // DAFTAR KARYAWAN
        React.createElement('div', { className: 'card', style: { padding: 0, overflow: 'hidden' } },
            React.createElement('div', { className: 'card-header', style: { padding: '12px 16px', margin: 0 } },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-users', style: { marginRight: 8 } }),
                    ` Karyawan (${filteredKaryawan.length})`
                ),
                React.createElement('button', { 
                    className: 'btn-icon', 
                    onClick: () => { setModalType('karyawan'); setShowModal(true); }
                }, 
                    React.createElement('i', { className: 'fas fa-plus' })
                )
            ),
            
            React.createElement('div', { style: { padding: '0 16px 16px 16px' } },
                filteredKaryawan.length === 0 && 
                    React.createElement('div', { className: 'empty-state', style: { padding: '40px 20px' } },
                        React.createElement('i', { className: 'fas fa-users', style: { fontSize: 48, marginBottom: 12, color: 'var(--text-tertiary)' } }),
                        React.createElement('p', null, karyawanSearchTerm ? 'Karyawan tidak ditemukan' : 'Belum ada karyawan'),
                        !karyawanSearchTerm && React.createElement('button', { 
                            className: 'btn-primary', 
                            style: { marginTop: 12 },
                            onClick: () => { setModalType('karyawan'); setShowModal(true); }
                        }, React.createElement('i', { className: 'fas fa-plus', style: { marginRight: 6 } }), ' Tambah Karyawan')
                    ),
                
                filteredKaryawan.map(item => {
                    const absenStatus = getAbsensiStatus(item.id);
                    let statusClass = 'badge-warning';
                    let statusText = '⚠️ Belum';
                    let statusIcon = 'fa-clock';
                    if (absenStatus === 'hadir') { 
                        statusClass = 'badge-success'; 
                        statusText = '✅ Hadir'; 
                        statusIcon = 'fa-check-circle';
                    } else if (absenStatus === 'izin') { 
                        statusClass = 'badge-warning'; 
                        statusText = '📝 Izin'; 
                        statusIcon = 'fa-user-clock';
                    } else if (absenStatus === 'sakit') { 
                        statusClass = 'badge-info'; 
                        statusText = '🤒 Sakit'; 
                        statusIcon = 'fa-thermometer-half';
                    }
                    
                    const summaryHadir = absensiHarian.filter(a => a.karyawanId === item.id && a.status === 'hadir').length;
                    const summaryIzin = absensiHarian.filter(a => a.karyawanId === item.id && a.status === 'izin').length;
                    const summarySakit = absensiHarian.filter(a => a.karyawanId === item.id && a.status === 'sakit').length;
                    const summaryAlpha = Math.max(0, 30 - (summaryHadir + summaryIzin + summarySakit));
                    
                    const shiftIcon = item.shift === 'pagi' ? '🌅' : (item.shift === 'siang' ? '☀️' : '🌙');
                    const shiftText = item.shift === 'pagi' ? 'Shift Pagi' : (item.shift === 'siang' ? 'Shift Siang' : 'Shift Malam');
                    
                    return React.createElement('div', { key: item.id, style: { 
                        marginBottom: 16,
                        background: 'var(--surface)',
                        borderRadius: 16,
                        border: '1px solid var(--border-light)',
                        overflow: 'hidden'
                    } },
                        // HEADER: Nama + Status + Tombol Aksi
                        React.createElement('div', { style: { 
                            padding: '14px 14px 8px 14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap',
                            gap: 8
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flex: 1 } },
                                React.createElement('div', { style: { 
                                    width: 44, height: 44, 
                                    background: 'var(--primary-soft)', 
                                    borderRadius: 44, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    flexShrink: 0
                                } },
                                    React.createElement('i', { className: 'fas fa-user', style: { fontSize: 20, color: 'var(--primary)' } })
                                ),
                                React.createElement('div', { style: { flex: 1 } },
                                    React.createElement('div', { style: { fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' } }, item.nama),
                                    React.createElement('div', { style: { fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 } },
                                        React.createElement('i', { className: 'fas fa-briefcase', style: { fontSize: 10 } }),
                                        item.posisi || 'Pekerja Kandang'
                                    )
                                )
                            ),
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 } },
                                React.createElement('span', { 
                                    className: `badge ${statusClass}`,
                                    style: { fontSize: 10, padding: '4px 10px', whiteSpace: 'nowrap' }
                                }, 
                                    React.createElement('i', { className: `fas ${statusIcon}`, style: { marginRight: 4 } }),
                                    statusText
                                ),
                                React.createElement('button', { className: 'btn-icon', onClick: () => handleEditItem('karyawan', item), style: { width: 32, height: 32 } }, 
                                    React.createElement('i', { className: 'fas fa-edit', style: { fontSize: 12 } })
                                ),
                                React.createElement('button', { className: 'btn-icon danger', onClick: () => handleDeleteItem('karyawan', item.id, item.nama), style: { width: 32, height: 32 } }, 
                                    React.createElement('i', { className: 'fas fa-trash-alt', style: { fontSize: 12 } })
                                )
                            )
                        ),
                        
                        // INFO GAJI & SHIFT
                        React.createElement('div', { style: { 
                            margin: '0 14px 12px 14px',
                            padding: '10px 12px',
                            background: 'var(--surface-hover)',
                            borderRadius: 12,
                            display: 'flex',
                            gap: 16,
                            flexWrap: 'wrap'
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 } },
                                React.createElement('i', { className: 'fas fa-money-bill-wave', style: { color: '#10B981' } }),
                                React.createElement('span', { style: { fontWeight: 600, color: '#10B981' } }, formatRupiah(item.gaji || 0))
                            ),
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 } },
                                React.createElement('span', null, shiftIcon),
                                React.createElement('span', { style: { fontWeight: 500 } }, shiftText)
                            )
                        ),
                        
                        // REKAP ABSENSI BULANAN (4 kotak)
                        React.createElement('div', { style: { 
                            margin: '0 14px 12px 14px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: 8,
                            textAlign: 'center'
                        } },
                            React.createElement('div', { style: { 
                                background: '#10B98110', 
                                borderRadius: 12, 
                                padding: '10px 4px',
                                border: '1px solid #10B98120'
                            } },
                                React.createElement('div', { style: { fontSize: 18, fontWeight: 800, color: '#10B981' } }, summaryHadir),
                                React.createElement('div', { style: { fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 } }, '✅ Hadir')
                            ),
                            React.createElement('div', { style: { 
                                background: '#F59E0B10', 
                                borderRadius: 12, 
                                padding: '10px 4px',
                                border: '1px solid #F59E0B20'
                            } },
                                React.createElement('div', { style: { fontSize: 18, fontWeight: 800, color: '#F59E0B' } }, summaryIzin),
                                React.createElement('div', { style: { fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 } }, '📝 Izin')
                            ),
                            React.createElement('div', { style: { 
                                background: '#8B5CF610', 
                                borderRadius: 12, 
                                padding: '10px 4px',
                                border: '1px solid #8B5CF620'
                            } },
                                React.createElement('div', { style: { fontSize: 18, fontWeight: 800, color: '#8B5CF6' } }, summarySakit),
                                React.createElement('div', { style: { fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 } }, '🤒 Sakit')
                            ),
                            React.createElement('div', { style: { 
                                background: '#EF444410', 
                                borderRadius: 12, 
                                padding: '10px 4px',
                                border: '1px solid #EF444420'
                            } },
                                React.createElement('div', { style: { fontSize: 18, fontWeight: 800, color: '#EF4444' } }, summaryAlpha),
                                React.createElement('div', { style: { fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 } }, '⚠️ Alpha')
                            )
                        ),
                        
                        // FOOTER: Kontak + Tombol WA
                        React.createElement('div', { style: { 
                            margin: '0 14px 12px 14px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 10
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
                                item.noHp ? 
                                    React.createElement(React.Fragment, null,
                                        React.createElement('span', { style: { fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 5 } },
                                            React.createElement('i', { className: 'fas fa-phone', style: { color: 'var(--primary)', fontSize: 11 } }),
                                            item.noHp
                                        ),
                                        React.createElement('button', {
                                            onClick: () => {
                                                let phone = item.noHp.replace(/[^0-9]/g, '');
                                                if (phone.startsWith('0')) phone = '62' + phone.substring(1);
                                                if (!phone.startsWith('62')) phone = '62' + phone;
                                                window.open(`https://wa.me/${phone}?text=Halo%20${encodeURIComponent(item.nama)}%2C%20saya%20dari%20FasimCare%2B`, '_blank');
                                            },
                                            style: {
                                                background: '#25D366',
                                                border: 'none',
                                                borderRadius: 30,
                                                padding: '5px 12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 5,
                                                cursor: 'pointer',
                                                fontSize: 11,
                                                fontWeight: 600,
                                                color: 'white'
                                            }
                                        },
                                            React.createElement('i', { className: 'fab fa-whatsapp', style: { fontSize: 12 } }),
                                            ' WhatsApp'
                                        )
                                    ) :
                                    React.createElement('span', { style: { fontSize: 11, color: 'var(--text-tertiary)' } }, 
                                        React.createElement('i', { className: 'fas fa-phone', style: { marginRight: 4 } }), 
                                        'No HP belum diisi'
                                    )
                            )
                        ),
                        
                        // TOMBOL ABSENSI - DI TENGAH
                        React.createElement('div', { style: { 
                            display: 'flex',
                            justifyContent: 'center',
                            padding: '12px 14px 14px 14px',
                            borderTop: '1px solid var(--border-light)',
                            marginTop: 4
                        } },
                            React.createElement('div', { style: { 
                                display: 'flex',
                                gap: 20,
                                background: 'var(--surface-hover)',
                                padding: '8px 24px',
                                borderRadius: 60,
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            } },
                                React.createElement('button', { 
                                    onClick: () => handleAbsensi(item.id, 'hadir'),
                                    style: { 
                                        width: 46, height: 46, 
                                        borderRadius: 46,
                                        border: 'none',
                                        background: '#10B98115',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.15s ease'
                                    },
                                    title: 'Hadir'
                                }, React.createElement('i', { className: 'fas fa-check', style: { fontSize: 20, color: '#10B981' } })),
                                
                                React.createElement('button', { 
                                    onClick: () => handleAbsensi(item.id, 'izin'),
                                    style: { 
                                        width: 46, height: 46, 
                                        borderRadius: 46,
                                        border: 'none',
                                        background: '#F59E0B15',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.15s ease'
                                    },
                                    title: 'Izin'
                                }, React.createElement('i', { className: 'fas fa-user-clock', style: { fontSize: 20, color: '#F59E0B' } })),
                                
                                React.createElement('button', { 
                                    onClick: () => handleAbsensi(item.id, 'sakit'),
                                    style: { 
                                        width: 46, height: 46, 
                                        borderRadius: 46,
                                        border: 'none',
                                        background: '#8B5CF615',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.15s ease'
                                    },
                                    title: 'Sakit'
                                }, React.createElement('i', { className: 'fas fa-thermometer-half', style: { fontSize: 20, color: '#8B5CF6' } }))
                            )
                        )
                    );
                })
            )
        )
    );
};
        
  const renderKeuangan = () => {
    if (!selectedKandang) {
        return React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'empty-state' },
                React.createElement('i', { className: 'fas fa-chart-pie', style: { fontSize: 48, marginBottom: 12, color: 'var(--text-tertiary)' } }),
                React.createElement('p', null, 'Pilih kandang terlebih dahulu untuk melihat laporan keuangan')
            )
        );
    }
    
    // Filter data berdasarkan kandang yang dipilih
    const filteredProduksiTelur = produksiTelur.filter(p => p.kandangId === selectedKandang.id);
    const filteredPanenBroiler = panenBroiler.filter(p => p.kandangId === selectedKandang.id);
    
    // Hitung ulang keuangan berdasarkan kandang yang dipilih
    const totalPendapatanTelur = filteredProduksiTelur.reduce((sum, p) => sum + (p.pendapatan || 0), 0);
    const totalPendapatanPanen = filteredPanenBroiler.reduce((sum, p) => sum + (p.totalPendapatan || 0), 0);
    const totalPendapatan = totalPendapatanTelur + totalPendapatanPanen;
    
    const totalPembelianPakan = stokPakan.reduce((sum, p) => sum + (p.totalHarga || 0), 0);
    const totalPembelianObat = stokObat.reduce((sum, p) => sum + (p.totalHarga || 0), 0);
    const totalBiayaKaryawan = karyawanList.reduce((sum, k) => sum + (k.gaji || 0), 0);
    const totalPengeluaran = totalPembelianPakan + totalPembelianObat + totalBiayaKaryawan;
    const labaBersih = totalPendapatan - totalPengeluaran;
    const marginKeuntungan = totalPendapatan > 0 ? (labaBersih / totalPendapatan * 100).toFixed(1) : 0;
    
    // Filter detail transaksi berdasarkan search term
    const filteredPendapatan = [
        ...filteredProduksiTelur.map(p => ({ ...p, jenis: 'Produksi Telur', nominal: p.pendapatan || 0, tanggal: p.tanggal })),
        ...filteredPanenBroiler.map(p => ({ ...p, jenis: 'Panen Broiler', nominal: p.totalPendapatan || 0, tanggal: p.tanggal }))
    ].filter(item => 
        keuanganFilter === 'all' || 
        (keuanganFilter === 'pendapatan' && item.nominal > 0)
    ).filter(item =>
        item.jenis?.toLowerCase().includes(keuanganSearchTerm.toLowerCase()) ||
        item.tanggal?.includes(keuanganSearchTerm)
    ).sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    
    const filteredPengeluaran = [
        ...stokPakan.map(p => ({ ...p, jenis: 'Pembelian Pakan', nominal: p.totalHarga || 0, detail: p.jenis })),
        ...stokObat.map(o => ({ ...o, jenis: 'Pembelian Obat', nominal: o.totalHarga || 0, detail: o.jenis })),
        ...karyawanList.map(k => ({ ...k, jenis: 'Gaji Karyawan', nominal: k.gaji || 0, detail: k.nama }))
    ].filter(item => 
        keuanganFilter === 'all' || 
        (keuanganFilter === 'pengeluaran' && item.nominal > 0)
    ).filter(item =>
        item.jenis?.toLowerCase().includes(keuanganSearchTerm.toLowerCase()) ||
        (item.detail || '').toLowerCase().includes(keuanganSearchTerm.toLowerCase())
    ).sort((a, b) => b.nominal - a.nominal);
    
    const formatTanggal = (tanggal) => moment(tanggal).format('DD MMM YYYY');
    
    // Cek apakah ada data untuk 7 hari terakhir
    const hasChartData = (() => {
        for (let i = 0; i < 7; i++) {
            const date = moment().subtract(i, 'days').format('YYYY-MM-DD');
            const pendapatanHari = [...filteredProduksiTelur, ...filteredPanenBroiler]
                .filter(p => p.tanggal === date)
                .reduce((sum, p) => sum + (p.pendapatan || p.totalPendapatan || 0), 0);
            if (pendapatanHari > 0) return true;
        }
        return false;
    })();
    
    return React.createElement('div', null,
        // SEARCH & FILTER CARD
        React.createElement('div', { className: 'card', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-search', style: { marginRight: 8 } }),
                    ' Cari & Filter Transaksi'
                )
            ),
            React.createElement('div', { style: { display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 } },
                React.createElement('div', { style: { flex: 1, position: 'relative' } },
                    React.createElement('i', { className: 'fas fa-search', style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 14 } }),
                    React.createElement('input', {
                        type: 'text',
                        placeholder: 'Cari berdasarkan jenis atau tanggal...',
                        value: keuanganSearchTerm,
                        onChange: (e) => setKeuanganSearchTerm(e.target.value),
                        className: 'form-input',
                        style: { paddingLeft: 40, width: '100%' }
                    })
                ),
                React.createElement('select', {
                    value: keuanganFilter,
                    onChange: (e) => setKeuanganFilter(e.target.value),
                    className: 'form-input',
                    style: { width: '140px' }
                },
                    React.createElement('option', { value: 'all' }, '📊 Semua'),
                    React.createElement('option', { value: 'pendapatan' }, '💰 Pendapatan'),
                    React.createElement('option', { value: 'pengeluaran' }, '📉 Pengeluaran')
                ),
                keuanganSearchTerm && React.createElement('button', {
                    onClick: () => setKeuanganSearchTerm(''),
                    className: 'btn-outline',
                    style: { padding: '0 16px' }
                }, React.createElement('i', { className: 'fas fa-times' }), ' Reset')
            )
        ),
        
        // KPI GRID - 4 KARTU UTAMA
        React.createElement('div', { className: 'kpi-grid', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-money-bill-wave', style: { color: '#10B981' } }), ' Total Pendapatan'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 18, color: '#10B981' } }, formatRupiahCompact(totalPendapatan)),
                React.createElement('div', { className: 'kpi-trend' }, 'Semua waktu')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-shopping-cart', style: { color: '#F59E0B' } }), ' Total Pengeluaran'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 18, color: '#F59E0B' } }, formatRupiahCompact(totalPengeluaran)),
                React.createElement('div', { className: 'kpi-trend' }, 'Pakan + Obat + Gaji')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-chart-line', style: { color: labaBersih >= 0 ? '#10B981' : '#EF4444' } }), ' Laba Bersih'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 18, color: labaBersih >= 0 ? '#10B981' : '#EF4444' } }, formatRupiahCompact(labaBersih)),
                React.createElement('div', { className: 'kpi-trend' }, labaBersih >= 0 ? 'Untung' : 'Rugi')
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-percent', style: { color: '#8B5CF6' } }), ' Margin'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: 18, color: '#8B5CF6' } }, marginKeuntungan + '%'),
                React.createElement('div', { className: 'kpi-trend' }, 'Dari total pendapatan')
            )
        ),
        
        // GRAFIK PENDAPATAN 7 HARI - MENGGUNAKAN chartKeuanganCanvasRef ✅
        hasChartData && React.createElement('div', { className: 'card', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-chart-line', style: { marginRight: 8 } }),
                    ' Grafik Pendapatan 7 Hari Terakhir'
                ),
                React.createElement('button', { 
                    className: 'btn-icon', 
                    onClick: () => {
                        setKeuanganFilter('pendapatan');
                        addNotification('info', 'Filter', 'Menampilkan data pendapatan', 2000);
                    },
                    title: 'Lihat detail pendapatan'
                }, React.createElement('i', { className: 'fas fa-arrow-right' }))
            ),
            React.createElement('div', { style: { height: 200, marginTop: 8 } },
                // ✅ INI YANG DIPERBAIKI - pakai chartKeuanganCanvasRef
                React.createElement('canvas', { ref: chartKeuanganCanvasRef, style: { width: '100%', height: '100%' } })
            )
        ),
        
        // RINGKASAN PENGELUARAN
        React.createElement('div', { className: 'card', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-chart-pie', style: { marginRight: 8 } }),
                    ' Ringkasan Pengeluaran'
                )
            ),
            React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: 12 } },
                React.createElement('div', { className: 'list-item', style: { cursor: 'pointer' }, onClick: () => { setKeuanganFilter('pengeluaran'); setKeuanganSearchTerm('Pakan'); } },
                    React.createElement('div', { className: 'item-info' },
                        React.createElement('h4', null, React.createElement('i', { className: 'fas fa-seedling', style: { color: '#10B981' } }), ' Pembelian Pakan'),
                        React.createElement('p', null, 'Total pembelian pakan dari semua supplier')
                    ),
                    React.createElement('div', { className: 'item-value', style: { color: '#F59E0B' } }, formatRupiah(totalPembelianPakan))
                ),
                React.createElement('div', { className: 'list-item', style: { cursor: 'pointer' }, onClick: () => { setKeuanganFilter('pengeluaran'); setKeuanganSearchTerm('Obat'); } },
                    React.createElement('div', { className: 'item-info' },
                        React.createElement('h4', null, React.createElement('i', { className: 'fas fa-capsules', style: { color: '#EF4444' } }), ' Pembelian Obat'),
                        React.createElement('p', null, 'Total pembelian obat dan vitamin')
                    ),
                    React.createElement('div', { className: 'item-value', style: { color: '#F59E0B' } }, formatRupiah(totalPembelianObat))
                ),
                React.createElement('div', { className: 'list-item', style: { cursor: 'pointer' }, onClick: () => { setActiveTab('karyawan'); } },
                    React.createElement('div', { className: 'item-info' },
                        React.createElement('h4', null, React.createElement('i', { className: 'fas fa-users', style: { color: '#8B5CF6' } }), ' Gaji Karyawan'),
                        React.createElement('p', null, 'Total gaji ' + karyawanList.length + ' karyawan')
                    ),
                    React.createElement('div', { className: 'item-value', style: { color: '#F59E0B' } }, formatRupiah(totalBiayaKaryawan))
                )
            )
        ),
        
        // TABEL PENDAPATAN
        (keuanganFilter === 'all' || keuanganFilter === 'pendapatan') && filteredPendapatan.length > 0 && React.createElement('div', { className: 'card', style: { marginBottom: 16, padding: 0, overflow: 'hidden' } },
            React.createElement('div', { className: 'card-header', style: { padding: '12px 16px', margin: 0 } },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-receipt', style: { marginRight: 8 } }),
                    ' Detail Pendapatan (' + filteredPendapatan.length + ')'
                ),
                React.createElement('button', { 
                    className: 'btn-icon', 
                    onClick: () => exportDataToCSV('keuangan'),
                    title: 'Export CSV'
                }, React.createElement('i', { className: 'fas fa-download' }))
            ),
            React.createElement('div', { style: { padding: '0 16px 16px 16px' } },
                filteredPendapatan.slice(0, 20).map(function(item, idx) {
                    return React.createElement('div', { key: idx, style: { 
                        marginBottom: 10,
                        background: 'var(--surface)',
                        borderRadius: 12,
                        border: '1px solid var(--border-light)',
                        overflow: 'hidden'
                    } },
                        React.createElement('div', { style: { 
                            padding: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 8
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flex: 1 } },
                                React.createElement('div', { style: { 
                                    width: 36, height: 36, 
                                    background: '#10B98115', 
                                    borderRadius: 36, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center'
                                } },
                                    React.createElement('i', { className: 'fas fa-money-bill-wave', style: { color: '#10B981', fontSize: 14 } })
                                ),
                                React.createElement('div', null,
                                    React.createElement('div', { style: { fontSize: 13, fontWeight: 600 } }, item.jenis),
                                    React.createElement('div', { style: { fontSize: 10, color: 'var(--text-tertiary)' } }, formatTanggal(item.tanggal))
                                )
                            ),
                            React.createElement('div', { style: { 
                                fontSize: 14, 
                                fontWeight: 700, 
                                color: '#10B981',
                                background: '#10B98110',
                                padding: '4px 12px',
                                borderRadius: 20
                            } }, formatRupiah(item.nominal))
                        )
                    );
                }),
                filteredPendapatan.length > 20 && React.createElement('div', { className: 'text-center', style: { padding: '12px', color: 'var(--text-tertiary)', fontSize: 12 } },
                    'Menampilkan 20 dari ' + filteredPendapatan.length + ' data'
                )
            )
        ),
        
        // TABEL PENGELUARAN
        (keuanganFilter === 'all' || keuanganFilter === 'pengeluaran') && filteredPengeluaran.length > 0 && React.createElement('div', { className: 'card', style: { padding: 0, overflow: 'hidden' } },
            React.createElement('div', { className: 'card-header', style: { padding: '12px 16px', margin: 0 } },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-shopping-cart', style: { marginRight: 8 } }),
                    ' Detail Pengeluaran (' + filteredPengeluaran.length + ')'
                ),
                React.createElement('button', { 
                    className: 'btn-icon', 
                    onClick: () => exportDataToCSV('keuangan'),
                    title: 'Export CSV'
                }, React.createElement('i', { className: 'fas fa-download' }))
            ),
            React.createElement('div', { style: { padding: '0 16px 16px 16px' } },
                filteredPengeluaran.slice(0, 20).map(function(item, idx) {
                    const icon = item.jenis === 'Pembelian Pakan' ? 'fa-seedling' : (item.jenis === 'Pembelian Obat' ? 'fa-capsules' : 'fa-users');
                    const color = item.jenis === 'Pembelian Pakan' ? '#10B981' : (item.jenis === 'Pembelian Obat' ? '#EF4444' : '#8B5CF6');
                    
                    return React.createElement('div', { key: idx, style: { 
                        marginBottom: 10,
                        background: 'var(--surface)',
                        borderRadius: 12,
                        border: '1px solid var(--border-light)',
                        overflow: 'hidden'
                    } },
                        React.createElement('div', { style: { 
                            padding: '12px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 8
                        } },
                            React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flex: 1 } },
                                React.createElement('div', { style: { 
                                    width: 36, height: 36, 
                                    background: color + '15', 
                                    borderRadius: 36, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center'
                                } },
                                    React.createElement('i', { className: 'fas ' + icon, style: { color: color, fontSize: 14 } })
                                ),
                                React.createElement('div', null,
                                    React.createElement('div', { style: { fontSize: 13, fontWeight: 600 } }, item.jenis),
                                    React.createElement('div', { style: { fontSize: 10, color: 'var(--text-tertiary)' } }, item.detail || '-')
                                )
                            ),
                            React.createElement('div', { style: { 
                                fontSize: 14, 
                                fontWeight: 700, 
                                color: '#F59E0B',
                                background: '#F59E0B10',
                                padding: '4px 12px',
                                borderRadius: 20
                            } }, formatRupiah(item.nominal))
                        )
                    );
                }),
                filteredPengeluaran.length > 20 && React.createElement('div', { className: 'text-center', style: { padding: '12px', color: 'var(--text-tertiary)', fontSize: 12 } },
                    'Menampilkan 20 dari ' + filteredPengeluaran.length + ' data'
                )
            )
        ),
        
        // EMPTY STATE
        filteredPendapatan.length === 0 && filteredPengeluaran.length === 0 && 
            React.createElement('div', { className: 'empty-state', style: { padding: '40px 20px' } },
                React.createElement('i', { className: 'fas fa-chart-pie', style: { fontSize: 48, marginBottom: 12, color: 'var(--text-tertiary)' } }),
                React.createElement('p', null, keuanganSearchTerm ? 'Data tidak ditemukan' : 'Belum ada data keuangan'),
                !keuanganSearchTerm && React.createElement('button', { 
                    className: 'btn-primary', 
                    style: { marginTop: 12 },
                    onClick: () => {
                        setModalType(selectedKandang?.jenis === 'layer' ? 'produksiTelur' : 'panenBroiler');
                        setShowModal(true);
                    }
                }, React.createElement('i', { className: 'fas fa-plus', style: { marginRight: 6 } }), ' Tambah Data Produksi')
            )
    );
};  
       const renderCustomer = () => {
    const filteredCustomers = customerList.filter(customer => 
        customer.nama?.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
        customer.noHp?.includes(customerSearchTerm) ||
        customer.alamat?.toLowerCase().includes(customerSearchTerm.toLowerCase())
    );
    
    return React.createElement('div', null,
        // CARD SEARCH
        React.createElement('div', { className: 'card', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-search', style: { marginRight: 8 } }),
                    ' Cari Customer'
                )
            ),
            React.createElement('div', { className: 'search-container', style: { position: 'relative' } },
                React.createElement('i', { className: 'fas fa-search', style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 14 } }),
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Cari nama, no HP, atau alamat...',
                    value: customerSearchTerm,
                    onChange: (e) => setCustomerSearchTerm(e.target.value),
                    className: 'form-input',
                    style: { paddingLeft: 40, width: '100%' }
                }),
                customerSearchTerm && React.createElement('button', {
                    onClick: () => setCustomerSearchTerm(''),
                    style: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }
                }, React.createElement('i', { className: 'fas fa-times' }))
            )
        ),
        
        // CARD DAFTAR CUSTOMER
        React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-user-friends', style: { marginRight: 8 } }),
                    ` Customer (${filteredCustomers.length})`
                ),
                React.createElement('button', { 
                    className: 'btn-icon', 
                    onClick: () => { setModalType('customer'); setShowModal(true); }
                }, 
                    React.createElement('i', { className: 'fas fa-plus' })
                )
            ),
            
            filteredCustomers.length === 0 && 
                React.createElement('div', { className: 'empty-state' },
                    React.createElement('i', { className: 'fas fa-user-friends', style: { fontSize: 48, marginBottom: 12, color: 'var(--text-tertiary)' } }),
                    React.createElement('p', null, customerSearchTerm ? 'Customer tidak ditemukan' : 'Belum ada customer'),
                    !customerSearchTerm && React.createElement('button', { 
                        className: 'btn-primary', 
                        style: { marginTop: 12 },
                        onClick: () => { setModalType('customer'); setShowModal(true); }
                    }, React.createElement('i', { className: 'fas fa-plus', style: { marginRight: 6 } }), ' Tambah Customer')
                ),
            
            filteredCustomers.map(item => 
                React.createElement('div', { key: item.id, style: { 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: '14px',
                    borderBottom: '1px solid var(--border-light)',
                    background: 'var(--surface)',
                    borderRadius: '12px',
                    marginBottom: '8px'
                } },
                    // Baris 1: Nama + Tombol Aksi
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
                        React.createElement('h4', { style: { fontSize: 15, fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 } }, 
                            React.createElement('i', { className: 'fas fa-user', style: { fontSize: 14 } }),
                            item.nama
                        ),
                        React.createElement('div', { style: { display: 'flex', gap: 6 } },
                            React.createElement('button', { className: 'btn-icon', onClick: () => handleEditItem('customer', item) }, 
                                React.createElement('i', { className: 'fas fa-edit' })
                            ),
                            React.createElement('button', { className: 'btn-icon danger', onClick: () => handleDeleteItem('customer', item.id, item.nama) }, 
                                React.createElement('i', { className: 'fas fa-trash-alt' })
                            )
                        )
                    ),
                    
                    // Baris 2: Alamat (jika ada)
                    item.alamat && React.createElement('div', { style: { marginBottom: 8 } },
                        React.createElement('span', { style: { fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 } },
                            React.createElement('i', { className: 'fas fa-map-marker-alt', style: { fontSize: 10 } }),
                            item.alamat
                        )
                    ),
                    
                    // Baris 3: No HP + Tombol WhatsApp
                    item.noHp && React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
                        React.createElement('span', { style: { fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 } },
                            React.createElement('i', { className: 'fas fa-phone', style: { color: 'var(--primary)', fontSize: 12 } }),
                            item.noHp
                        ),
                        React.createElement('button', {
                            onClick: () => {
                                let phone = item.noHp.replace(/[^0-9]/g, '');
                                if (phone.startsWith('0')) phone = '62' + phone.substring(1);
                                if (!phone.startsWith('62')) phone = '62' + phone;
                                window.open(`https://wa.me/${phone}?text=Halo%20${encodeURIComponent(item.nama)}%2C%20saya%20dari%20FasimCare%2B`, '_blank');
                            },
                            style: {
                                background: '#25D366',
                                border: 'none',
                                borderRadius: '30px',
                                padding: '6px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 600,
                                color: 'white'
                            }
                        },
                            React.createElement('i', { className: 'fab fa-whatsapp', style: { fontSize: 13 } }),
                            ' WhatsApp'
                        )
                    )
                )
            )
        )
    );
};
        
        const renderSupplier = () => {
    const filteredSuppliers = supplierList.filter(supplier => 
        supplier.nama?.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
        supplier.produk?.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
        supplier.alamat?.toLowerCase().includes(supplierSearchTerm.toLowerCase()) ||
        supplier.noHp?.includes(supplierSearchTerm)
    );
    
    return React.createElement('div', null,
        // CARD SEARCH
        React.createElement('div', { className: 'card', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-search', style: { marginRight: 8 } }),
                    ' Cari Supplier'
                )
            ),
            React.createElement('div', { className: 'search-container', style: { position: 'relative' } },
                React.createElement('i', { className: 'fas fa-search', style: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontSize: 14 } }),
                React.createElement('input', {
                    type: 'text',
                    placeholder: 'Cari nama, produk, alamat, atau no HP...',
                    value: supplierSearchTerm,
                    onChange: (e) => setSupplierSearchTerm(e.target.value),
                    className: 'form-input',
                    style: { paddingLeft: 40, width: '100%' }
                }),
                supplierSearchTerm && React.createElement('button', {
                    onClick: () => setSupplierSearchTerm(''),
                    style: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }
                }, React.createElement('i', { className: 'fas fa-times' }))
            )
        ),
        
        // CARD DAFTAR SUPPLIER
        React.createElement('div', { className: 'card' },
            React.createElement('div', { className: 'card-header' },
                React.createElement('h3', null, 
                    React.createElement('i', { className: 'fas fa-truck', style: { marginRight: 8 } }),
                    ` Supplier (${filteredSuppliers.length})`
                ),
                React.createElement('button', { 
                    className: 'btn-icon', 
                    onClick: () => { setModalType('supplier'); setShowModal(true); }
                }, 
                    React.createElement('i', { className: 'fas fa-plus' })
                )
            ),
            
            filteredSuppliers.length === 0 && 
                React.createElement('div', { className: 'empty-state' },
                    React.createElement('i', { className: 'fas fa-truck', style: { fontSize: 48, marginBottom: 12, color: 'var(--text-tertiary)' } }),
                    React.createElement('p', null, supplierSearchTerm ? 'Supplier tidak ditemukan' : 'Belum ada supplier'),
                    !supplierSearchTerm && React.createElement('button', { 
                        className: 'btn-primary', 
                        style: { marginTop: 12 },
                        onClick: () => { setModalType('supplier'); setShowModal(true); }
                    }, React.createElement('i', { className: 'fas fa-plus', style: { marginRight: 6 } }), ' Tambah Supplier')
                ),
            
            filteredSuppliers.map(item => 
                React.createElement('div', { key: item.id, style: { 
                    display: 'flex', 
                    flexDirection: 'column',
                    padding: '14px',
                    borderBottom: '1px solid var(--border-light)',
                    background: 'var(--surface)',
                    borderRadius: '12px',
                    marginBottom: '8px'
                } },
                    // Baris 1: Nama + Tombol Aksi
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 } },
                        React.createElement('h4', { style: { fontSize: 15, fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 } }, 
                            React.createElement('i', { className: 'fas fa-building', style: { fontSize: 14 } }),
                            item.nama
                        ),
                        React.createElement('div', { style: { display: 'flex', gap: 6 } },
                            React.createElement('button', { className: 'btn-icon', onClick: () => handleEditItem('supplier', item) }, 
                                React.createElement('i', { className: 'fas fa-edit' })
                            ),
                            React.createElement('button', { className: 'btn-icon danger', onClick: () => handleDeleteItem('supplier', item.id, item.nama) }, 
                                React.createElement('i', { className: 'fas fa-trash-alt' })
                            )
                        )
                    ),
                    
                    // Baris 2: Produk + Alamat
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, flexWrap: 'wrap' } },
                        React.createElement('span', { style: { 
                            background: 'var(--primary-soft)', 
                            padding: '4px 10px', 
                            borderRadius: '20px', 
                            fontSize: 11,
                            fontWeight: 500,
                            color: 'var(--primary)'
                        } },
                            React.createElement('i', { className: 'fas fa-box', style: { marginRight: 4, fontSize: 10 } }),
                            item.produk || 'Pakan'
                        ),
                        item.alamat && React.createElement('span', { style: { fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 } },
                            React.createElement('i', { className: 'fas fa-map-marker-alt', style: { fontSize: 10 } }),
                            item.alamat
                        )
                    ),
                    
                    // Baris 3: No HP + Tombol WhatsApp
                    item.noHp && React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' } },
                        React.createElement('span', { style: { fontSize: 13, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6 } },
                            React.createElement('i', { className: 'fas fa-phone', style: { color: 'var(--primary)', fontSize: 12 } }),
                            item.noHp
                        ),
                        React.createElement('button', {
                            onClick: () => {
                                let phone = item.noHp.replace(/[^0-9]/g, '');
                                if (phone.startsWith('0')) phone = '62' + phone.substring(1);
                                if (!phone.startsWith('62')) phone = '62' + phone;
                                window.open(`https://wa.me/${phone}?text=Halo%20${encodeURIComponent(item.nama)}%2C%20saya%20dari%20FasimCare%2B%20ingin%20memesan%20produk%20${encodeURIComponent(item.produk || '')}`, '_blank');
                            },
                            style: {
                                background: '#25D366',
                                border: 'none',
                                borderRadius: '30px',
                                padding: '6px 14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 600,
                                color: 'white'
                            }
                        },
                            React.createElement('i', { className: 'fab fa-whatsapp', style: { fontSize: 13 } }),
                            ' WhatsApp'
                        )
                    )
                )
            )
        )
    );
};
        
// ==================== RENDER SLIP GAJI ====================

const renderSlipGaji = () => {
    const bulanIndonesia = moment(selectedBulanGaji, 'YYYY-MM').format('MMMM YYYY');
    const penggajianBulanIni = penggajianList.filter(p => p.periode === selectedBulanGaji);
    const totalGajiBulanIni = penggajianBulanIni.reduce((sum, p) => sum + (p.totalGaji || 0), 0);
    const totalSudahDibayar = penggajianBulanIni.filter(p => p.status === 'lunas').reduce((sum, p) => sum + (p.totalGaji || 0), 0);
    const totalBelumDibayar = totalGajiBulanIni - totalSudahDibayar;
    
    const bulanOptions = [];
    for (let i = 0; i < 12; i++) {
        const date = moment().subtract(i, 'months');
        bulanOptions.push({
            value: date.format('YYYY-MM'),
            label: date.format('MMMM YYYY')
        });
    }
    
    return React.createElement('div', null,
        // CARD PERIODE - DIPERBAIKI AGAR TIDAK MELEBAR
        React.createElement('div', { className: 'card', style: { marginBottom: 16, overflow: 'hidden' } },
            React.createElement('div', { className: 'card-header', style: { flexWrap: 'wrap', gap: '8px' } },
                React.createElement('h3', { style: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 } }, 
                    React.createElement('i', { className: 'fas fa-calendar-alt' }), 
                    ' Periode Penggajian'
                ),
                React.createElement('div', { 
                    style: { 
                        display: 'flex', 
                        gap: '8px', 
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        marginLeft: 'auto'
                    } 
                },
                    // SELECT BULAN
                    React.createElement('select', {
                        value: selectedBulanGaji,
                        onChange: (e) => setSelectedBulanGaji(e.target.value),
                        className: 'form-input',
                        style: { 
                            width: '140px', 
                            height: '36px',
                            fontSize: '13px',
                            padding: '0 10px'
                        }
                    }, bulanOptions.map(opt => 
                        React.createElement('option', { key: opt.value, value: opt.value }, opt.label)
                    )),
                    // TOMBOL HITUNG GAJI
                    React.createElement('button', {
                        className: 'btn-primary',
                        onClick: () => generatePenggajianBulanan(selectedBulanGaji, false),
                        style: { 
                            padding: '8px 16px', 
                            height: '36px',
                            fontSize: '12px',
                            whiteSpace: 'nowrap'
                        }
                    }, React.createElement('i', { className: 'fas fa-calculator', style: { fontSize: '12px' } }), ' Hitung Gaji'),
                    // TOMBOL HITUNG ULANG
                    React.createElement('button', {
                        className: 'btn-outline',
                        onClick: () => handleRegenerateGaji(selectedBulanGaji),
                        style: { 
                            padding: '8px 16px', 
                            height: '36px',
                            fontSize: '12px',
                            whiteSpace: 'nowrap'
                        }
                    }, React.createElement('i', { className: 'fas fa-sync-alt', style: { fontSize: '12px' } }), ' Hitung Ulang')
                )
            )
        ),
        
        // KPI GRID
        React.createElement('div', { className: 'kpi-grid', style: { marginBottom: 16 } },
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-users' }), ' Total Karyawan'),
                React.createElement('div', { className: 'kpi-value' }, karyawanList.length),
                React.createElement('div', { className: 'kpi-trend' }, `${penggajianBulanIni.length} sudah dihitung`)
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-money-bill-wave' }), ' Total Gaji'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: '14px' } }, formatRupiahCompact(totalGajiBulanIni)),
                React.createElement('div', { className: 'kpi-trend' }, `${formatRupiahCompact(totalSudahDibayar)} sudah dibayar`)
            ),
            React.createElement('div', { className: 'kpi-card' },
                React.createElement('div', { className: 'kpi-label' }, React.createElement('i', { className: 'fas fa-clock' }), ' Belum Dibayar'),
                React.createElement('div', { className: 'kpi-value', style: { fontSize: '14px', color: '#F9A825' } }, formatRupiahCompact(totalBelumDibayar)),
                React.createElement('div', { className: 'kpi-trend' }, `${penggajianBulanIni.filter(p => p.status === 'belum_bayar').length} karyawan`)
            )
        ),
        
      // LIST GAJI - DIPERBAIKI TOMBOLNYA AGAR RAPI
React.createElement('div', { className: 'card' },
    React.createElement('div', { className: 'card-header' },
        React.createElement('h3', null, React.createElement('i', { className: 'fas fa-file-invoice-dollar' }), ` Slip Gaji - ${bulanIndonesia}`)
    ),
    penggajianBulanIni.length === 0 ? 
        React.createElement('div', { className: 'empty-state' }, 
            React.createElement('i', { className: 'fas fa-file-invoice' }),
            React.createElement('p', null, `Belum ada data gaji untuk ${bulanIndonesia}`),
            React.createElement('button', { 
                className: 'btn-primary', 
                style: { marginTop: 12 },
                onClick: () => generatePenggajianBulanan(selectedBulanGaji)
            }, React.createElement('i', { className: 'fas fa-calculator' }), ' Hitung Gaji Sekarang')
        ) :
        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '8px' } },
            penggajianBulanIni.map(penggajian => 
                React.createElement('div', { 
                    key: penggajian.id, 
                    style: { 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px',
                        background: 'var(--surface)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-light)',
                        gap: '10px'
                    } 
                },
                    // INFO KARYAWAN
                    React.createElement('div', { 
                        style: { 
                            flex: '2',
                            minWidth: '140px'
                        } 
                    },
                        React.createElement('h4', { 
                            style: { 
                                fontSize: '14px', 
                                fontWeight: 600, 
                                marginBottom: '4px',
                                wordBreak: 'break-word'
                            } 
                        }, penggajian.karyawanNama),
                        React.createElement('p', { 
                            style: { 
                                fontSize: '11px', 
                                color: 'var(--text-tertiary)',
                                wordBreak: 'break-word'
                            } 
                        }, penggajian.posisi, ' • ', 
                            penggajian.absensi?.hadir || 0, ' hari hadir • ',
                            penggajian.absensi?.alpha || 0, ' alpha'
                        )
                    ),
                    
                    // TOTAL GAJI
                    React.createElement('div', { 
                        style: { 
                            flexShrink: 0,
                            fontWeight: 700,
                            fontSize: '13px',
                            color: 'var(--primary)',
                            background: 'var(--primary-soft)',
                            padding: '4px 10px',
                            borderRadius: '20px'
                        } 
                    }, formatRupiah(penggajian.totalGaji)),
                    
                    // BADGE STATUS
                    React.createElement('span', { 
                        className: `badge ${penggajian.status === 'lunas' ? 'badge-success' : 'badge-warning'}`, 
                        style: { 
                            flexShrink: 0,
                            fontSize: '10px',
                            padding: '4px 10px'
                        } 
                    }, 
                        penggajian.status === 'lunas' ? '✓ Lunas' : '⏳ Belum'
                    ),
                    
                    // TOMBOL ACTIONS - DIPERBAIKI RAPI
                    React.createElement('div', { 
                        style: { 
                            display: 'flex', 
                            gap: '8px', 
                            flexShrink: 0,
                            alignItems: 'center'
                        } 
                    },
                        // TOMBOL CETAK - UKURAN KONSISTEN
                        React.createElement('button', { 
                            onClick: () => {
                                setSelectedPenggajianForSlip(penggajian);
                                setShowSlipGajiModal(true);
                            },
                            style: { 
                                padding: '6px 14px',
                                borderRadius: '30px',
                                fontWeight: 500,
                                fontSize: '11px',
                                background: 'linear-gradient(135deg, #0284C7, #0EA5E9)',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                minWidth: '70px',
                                justifyContent: 'center'
                            }
                        }, 
                            React.createElement('i', { className: 'fas fa-print', style: { fontSize: '11px' } }), 
                            ' Cetak'
                        ),
                        
                        // TOMBOL BAYAR (jika belum lunas)
                        penggajian.status === 'belum_bayar' && 
                            React.createElement('button', { 
                                onClick: () => handleBayarGaji(penggajian),
                                title: 'Tandai Lunas',
                                style: { 
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '30px',
                                    background: '#10B981',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }
                            }, React.createElement('i', { className: 'fas fa-money-bill-wave', style: { fontSize: '12px' } })),
                        
                        // TOMBOL HAPUS
                        React.createElement('button', { 
                            onClick: () => handleHapusPenggajian(penggajian.id, penggajian.periode),
                            title: 'Hapus',
                            style: { 
                                width: '32px',
                                height: '32px',
                                borderRadius: '30px',
                                background: '#EF4444',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }
                        }, React.createElement('i', { className: 'fas fa-trash', style: { fontSize: '12px' } }))
                    )
                )
            )
        )
)
    );
};
        
const renderSlipGajiModal = () => {
    if (!showSlipGajiModal || !selectedPenggajianForSlip) return null;
    
    const penggajian = selectedPenggajianForSlip;
    const formatRp = (angka) => 'Rp ' + new Intl.NumberFormat('id-ID').format(angka || 0);
    const bulanIndonesia = moment(penggajian.periode, 'YYYY-MM').format('MMMM YYYY');
    
    return React.createElement('div', { 
        className: 'modal-overlay bottom-sheet-overlay', 
        onClick: () => setShowSlipGajiModal(false),
        style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.2s ease'
        }
    },
        React.createElement('div', { 
            className: 'slip-gaji-bottom-sheet', 
            onClick: e => e.stopPropagation(),
            style: { 
                width: '100%',
                maxWidth: '500px',
                maxHeight: '85vh',
                background: 'var(--surface)',
                borderRadius: '28px 28px 0 0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                animation: 'slideUp 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
                transform: 'translateY(0)',
                transition: 'transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)'
            }
        },
            // SWIPE HANDLE - untuk drag ke bawah
            React.createElement('div', { 
                className: 'bottom-sheet-swipe-handle',
                style: { 
                    position: 'sticky',
                    top: 0,
                    width: '100%',
                    padding: '12px 0 8px 0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    cursor: 'grab',
                    background: 'var(--surface)',
                    zIndex: 20,
                    borderRadius: '28px 28px 0 0',
                    touchAction: 'pan-y'
                },
                onTouchStart: (e) => {
                    const touch = e.touches[0];
                    const startY = touch.clientY;
                    const sheet = e.currentTarget.parentElement;
                    const startTransform = 0;
                    
                    const onTouchMove = (moveEvent) => {
                        const currentY = moveEvent.touches[0].clientY;
                        const deltaY = currentY - startY;
                        if (deltaY > 0 && sheet) {
                            moveEvent.preventDefault();
                            const translateY = Math.min(deltaY, 200);
                            sheet.style.transform = `translateY(${translateY}px)`;
                            sheet.style.transition = 'none';
                            
                            // Ubah opacity overlay
                            const overlay = document.querySelector('.bottom-sheet-overlay');
                            if (overlay) {
                                overlay.style.background = `rgba(0,0,0,${0.5 - (translateY / 400)})`;
                            }
                        }
                    };
                    
                    const onTouchEnd = (endEvent) => {
                        const endY = endEvent.changedTouches[0].clientY;
                        const deltaY = endY - startY;
                        
                        if (sheet) {
                            sheet.style.transition = 'transform 0.3s cubic-bezier(0.2, 0.9, 0.4, 1.1)';
                            if (deltaY > 80) {
                                sheet.style.transform = 'translateY(100%)';
                                setTimeout(() => {
                                    setShowSlipGajiModal(false);
                                }, 200);
                            } else {
                                sheet.style.transform = 'translateY(0)';
                                const overlay = document.querySelector('.bottom-sheet-overlay');
                                if (overlay) {
                                    overlay.style.background = 'rgba(0,0,0,0.5)';
                                }
                            }
                        }
                        
                        document.removeEventListener('touchmove', onTouchMove);
                        document.removeEventListener('touchend', onTouchEnd);
                    };
                    
                    document.addEventListener('touchmove', onTouchMove, { passive: false });
                    document.addEventListener('touchend', onTouchEnd);
                }
            },
                React.createElement('div', { 
                    style: { 
                        width: '50px', 
                        height: '5px', 
                        background: 'var(--border-medium)', 
                        borderRadius: '10px',
                        transition: 'all 0.2s ease'
                    }
                })
            ),
            
            // HEADER
            React.createElement('div', { 
                style: { 
                    background: 'linear-gradient(135deg, #0284C7, #0EA5E9, #38BDF8)',
                    color: 'white', 
                    padding: '20px 20px',
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                } 
            },
                React.createElement('div', { style: { position: 'absolute', top: '-20px', right: '-20px', opacity: 0.1, fontSize: '100px' } }, '🐔'),
                React.createElement('div', { style: { position: 'absolute', bottom: '-20px', left: '-20px', opacity: 0.1, fontSize: '80px' } }, '🥚'),
                React.createElement('h2', { style: { fontSize: '1.3rem', marginBottom: '6px', fontWeight: 800, letterSpacing: '1px' } }, 
                    userProfile.farmName || 'FASIMCARE+'
                ),
                React.createElement('div', { style: { width: '40px', height: '3px', background: 'rgba(255,255,255,0.5)', margin: '10px auto', borderRadius: '3px' } }),
                React.createElement('p', { style: { fontSize: '0.65rem', opacity: 0.9 } }, 
                    userProfile.farmAddress || 'Jl. Peternakan No. 123'
                ),
                React.createElement('p', { style: { fontSize: '0.6rem', opacity: 0.8 } }, 
                    '📞 ' + (userProfile.farmPhone || '0812-3456-7890')
                ),
                React.createElement('div', { style: { marginTop: '12px' } },
                    React.createElement('span', { 
                        className: `badge ${penggajian.status === 'lunas' ? 'badge-success' : 'badge-warning'}`,
                        style: { 
                            padding: '4px 12px', 
                            fontSize: '0.7rem',
                            borderRadius: '30px',
                            fontWeight: 600,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                        }
                    }, 
                        penggajian.status === 'lunas' ? '✓ LUNAS' : '⏳ BELUM DIBAYAR'
                    )
                )
            ),
            
            // SCROLLABLE CONTENT
            React.createElement('div', { 
                style: { 
                    flex: 1, 
                    overflowY: 'auto', 
                    padding: '20px',
                    background: 'var(--surface)'
                }
            },
                // Informasi Karyawan
                React.createElement('div', { style: { marginBottom: '20px' } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' } },
                        React.createElement('div', { style: { width: '4px', height: '18px', background: '#0EA5E9', borderRadius: '4px' } }),
                        React.createElement('h4', { style: { fontSize: '13px', fontWeight: 700, color: '#0EA5E9' } }, '👤 INFORMASI KARYAWAN')
                    ),
                    React.createElement('div', { style: { background: 'var(--surface-alt)', borderRadius: '14px', padding: '14px', border: '1px solid var(--border)' } },
                        React.createElement('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' } },
                            React.createElement('div', null,
                                React.createElement('p', { style: { fontSize: '10px', color: 'var(--text-tertiary)' } }, 'Nama'),
                                React.createElement('p', { style: { fontWeight: 700, fontSize: '14px' } }, penggajian.karyawanNama)
                            ),
                            React.createElement('div', null,
                                React.createElement('p', { style: { fontSize: '10px', color: 'var(--text-tertiary)' } }, 'Posisi'),
                                React.createElement('p', { style: { fontWeight: 700, fontSize: '14px' } }, penggajian.posisi)
                            ),
                            React.createElement('div', null,
                                React.createElement('p', { style: { fontSize: '10px', color: 'var(--text-tertiary)' } }, 'Periode'),
                                React.createElement('p', { style: { fontWeight: 700, fontSize: '14px' } }, bulanIndonesia)
                            )
                        )
                    )
                ),
                
                // REKAP ABSENSI
                React.createElement('div', { style: { marginBottom: '20px' } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' } },
                        React.createElement('div', { style: { width: '4px', height: '18px', background: '#10B981', borderRadius: '4px' } }),
                        React.createElement('h4', { style: { fontSize: '13px', fontWeight: 700, color: '#10B981' } }, '📊 REKAP ABSENSI')
                    ),
                    React.createElement('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '8px' } },
                        React.createElement('div', { style: { flex: '1', minWidth: '65px', background: '#10B98115', borderRadius: '12px', padding: '10px 6px', textAlign: 'center' } },
                            React.createElement('div', { style: { fontSize: '18px', fontWeight: 800, color: '#10B981' } }, penggajian.absensi?.hadir || 0),
                            React.createElement('div', { style: { fontSize: '9px', color: 'var(--text-tertiary)' } }, '✅ Hadir')
                        ),
                        React.createElement('div', { style: { flex: '1', minWidth: '65px', background: '#F59E0B15', borderRadius: '12px', padding: '10px 6px', textAlign: 'center' } },
                            React.createElement('div', { style: { fontSize: '18px', fontWeight: 800, color: '#F59E0B' } }, penggajian.absensi?.izin || 0),
                            React.createElement('div', { style: { fontSize: '9px', color: 'var(--text-tertiary)' } }, '📝 Izin')
                        ),
                        React.createElement('div', { style: { flex: '1', minWidth: '65px', background: '#8B5CF615', borderRadius: '12px', padding: '10px 6px', textAlign: 'center' } },
                            React.createElement('div', { style: { fontSize: '18px', fontWeight: 800, color: '#8B5CF6' } }, penggajian.absensi?.sakit || 0),
                            React.createElement('div', { style: { fontSize: '9px', color: 'var(--text-tertiary)' } }, '🤒 Sakit')
                        ),
                        React.createElement('div', { style: { flex: '1', minWidth: '65px', background: '#EF444415', borderRadius: '12px', padding: '10px 6px', textAlign: 'center' } },
                            React.createElement('div', { style: { fontSize: '18px', fontWeight: 800, color: '#EF4444' } }, penggajian.absensi?.alpha || 0),
                            React.createElement('div', { style: { fontSize: '9px', color: 'var(--text-tertiary)' } }, '⚠️ Alpha')
                        )
                    )
                ),
                
                // RINCIAN GAJI
                React.createElement('div', { style: { marginBottom: '20px' } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' } },
                        React.createElement('div', { style: { width: '4px', height: '18px', background: '#F59E0B', borderRadius: '4px' } }),
                        React.createElement('h4', { style: { fontSize: '13px', fontWeight: 700, color: '#F59E0B' } }, '💰 RINCIAN GAJI')
                    ),
                    React.createElement('div', { style: { background: 'var(--surface-alt)', borderRadius: '14px', overflow: 'hidden', border: '1px solid var(--border)' } },
                        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)' } },
                            React.createElement('span', { style: { fontWeight: 500, fontSize: '12px' } }, 'Gaji Pokok'),
                            React.createElement('span', { style: { fontWeight: 700, color: '#0EA5E9', fontSize: '12px' } }, formatRp(penggajian.gajiPokok))
                        ),
                        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)' } },
                            React.createElement('span', { style: { fontWeight: 500, fontSize: '12px' } }, '🍽️ Tunjangan Makan'),
                            React.createElement('span', { style: { fontWeight: 700, color: '#10B981', fontSize: '12px' } }, formatRp(penggajian.tunjanganMakan))
                        ),
                        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid var(--border)' } },
                            React.createElement('span', { style: { fontWeight: 500, fontSize: '12px' } }, '🚗 Tunjangan Transport'),
                            React.createElement('span', { style: { fontWeight: 700, color: '#10B981', fontSize: '12px' } }, formatRp(penggajian.tunjanganTransport))
                        ),
                        React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '10px 14px' } },
                            React.createElement('span', { style: { fontWeight: 500, fontSize: '12px' } }, '⭐ Tunjangan Jabatan'),
                            React.createElement('span', { style: { fontWeight: 700, color: '#10B981', fontSize: '12px' } }, formatRp(penggajian.tunjanganJabatan))
                        )
                    )
                ),
                
                // POTONGAN
                (penggajian.potonganAbsen > 0 || penggajian.potonganIzin > 0 || penggajian.potonganSakit > 0) && 
                React.createElement('div', { style: { marginBottom: '20px' } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' } },
                        React.createElement('div', { style: { width: '4px', height: '18px', background: '#EF4444', borderRadius: '4px' } }),
                        React.createElement('h4', { style: { fontSize: '13px', fontWeight: 700, color: '#EF4444' } }, '📉 POTONGAN')
                    ),
                    React.createElement('div', { style: { background: '#EF444410', borderRadius: '14px', overflow: 'hidden', border: '1px solid #EF444430' } },
                        penggajian.potonganAbsen > 0 && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #EF444430' } },
                            React.createElement('span', { style: { fontWeight: 500, fontSize: '12px' } }, '⚠️ Alpha'),
                            React.createElement('span', { style: { fontWeight: 700, color: '#EF4444', fontSize: '12px' } }, `-${formatRp(penggajian.potonganAbsen)}`)
                        ),
                        penggajian.potonganIzin > 0 && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #EF444430' } },
                            React.createElement('span', { style: { fontWeight: 500, fontSize: '12px' } }, '📝 Izin'),
                            React.createElement('span', { style: { fontWeight: 700, color: '#EF4444', fontSize: '12px' } }, `-${formatRp(penggajian.potonganIzin)}`)
                        ),
                        penggajian.potonganSakit > 0 && React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', padding: '10px 14px' } },
                            React.createElement('span', { style: { fontWeight: 500, fontSize: '12px' } }, '🤒 Sakit'),
                            React.createElement('span', { style: { fontWeight: 700, color: '#EF4444', fontSize: '12px' } }, `-${formatRp(penggajian.potonganSakit)}`)
                        )
                    )
                ),
                
                // BONUS
                penggajian.bonusKehadiran > 0 && React.createElement('div', { style: { marginBottom: '20px' } },
                    React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' } },
                        React.createElement('div', { style: { width: '4px', height: '18px', background: '#10B981', borderRadius: '4px' } }),
                        React.createElement('h4', { style: { fontSize: '13px', fontWeight: 700, color: '#10B981' } }, '🎉 BONUS')
                    ),
                    React.createElement('div', { style: { background: '#10B98115', borderRadius: '14px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between' } },
                        React.createElement('span', { style: { fontWeight: 500, fontSize: '12px' } }, 'Bonus Kehadiran Penuh'),
                        React.createElement('span', { style: { fontWeight: 700, color: '#10B981', fontSize: '12px' } }, `+${formatRp(penggajian.bonusKehadiran)}`)
                    )
                ),
                
                // TOTAL GAJI
                React.createElement('div', { 
                    style: { 
                        background: 'linear-gradient(135deg, #0284C7, #0EA5E9, #38BDF8)',
                        borderRadius: '16px', 
                        padding: '16px', 
                        marginTop: '8px', 
                        color: 'white',
                        boxShadow: '0 4px 12px rgba(2,132,199,0.3)'
                    }
                },
                    React.createElement('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        React.createElement('div', null,
                            React.createElement('p', { style: { fontSize: '11px', opacity: 0.9, marginBottom: '4px' } }, 'TOTAL GAJI BERSIH'),
                            React.createElement('p', { style: { fontWeight: 800, fontSize: '20px', letterSpacing: '1px' } }, formatRp(penggajian.totalGaji))
                        ),
                        React.createElement('div', { style: { fontSize: '40px', opacity: 0.8 } }, '💰')
                    )
                ),
                
                // Tanggal Bayar
                penggajian.tanggalBayar && React.createElement('div', { style: { marginTop: '14px', textAlign: 'center', padding: '8px', background: 'var(--surface-alt)', borderRadius: '10px' } },
                    React.createElement('i', { className: 'fas fa-calendar-check', style: { color: '#10B981', marginRight: '6px', fontSize: '11px' } }),
                    React.createElement('span', { style: { fontSize: '11px', color: 'var(--text-secondary)' } }, 'Dibayar: ', moment(penggajian.tanggalBayar).format('DD MMMM YYYY'))
                ),
                
                // FOOTER TEKS
                React.createElement('div', { style: { marginTop: '16px', paddingTop: '12px', textAlign: 'center', borderTop: '1px solid var(--border)' } },
                    React.createElement('p', { style: { fontSize: '10px', color: 'var(--text-tertiary)', marginBottom: '4px' } }, '✨ Terima kasih atas kerja keras Anda! ✨'),
                    React.createElement('p', { style: { fontSize: '8px', color: 'var(--text-tertiary)', opacity: 0.7 } }, 'Slip Gaji - FasimCare+')
                )
            ),
            
            // TOMBOL - BOTTOM SHEET ACTIONS
            React.createElement('div', { 
                style: { 
                    padding: '16px', 
                    gap: '12px', 
                    background: 'var(--surface)', 
                    borderTop: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column'
                }
            },
                // BARIS 1: PRINT + SHARE (SAMA BESAR)
                React.createElement('div', { 
                    style: { 
                        display: 'flex', 
                        gap: '12px', 
                        flexDirection: 'row',
                        justifyContent: 'center'
                    } 
                },
                    React.createElement('button', { 
                        onClick: () => {
                            console.log("🔵 Print Slip");
                            handlePrintSlip();
                        },
                        style: { 
                            flex: 1,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '8px',
                            padding: '12px 8px',
                            borderRadius: '40px',
                            fontWeight: 600,
                            fontSize: '13px',
                            background: 'linear-gradient(135deg, #0284C7, #0EA5E9)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer'
                        }
                    }, 
                        React.createElement('i', { className: 'fas fa-print', style: { fontSize: '14px' } }), 
                        ' Print'
                    ),
                    React.createElement('button', { 
                        onClick: handleShareSlip,
                        style: { 
                            flex: 1,
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            gap: '8px',
                            padding: '12px 8px',
                            borderRadius: '40px',
                            fontWeight: 600,
                            fontSize: '13px',
                            background: 'linear-gradient(135deg, #25D366, #128C7E)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer'
                        }
                    }, 
                        React.createElement('i', { className: 'fab fa-whatsapp', style: { fontSize: '14px' } }), 
                        ' Share'
                    )
                ),
                // BARIS 2: TOMBOL TUTUP
                React.createElement('button', { 
                    onClick: () => setShowSlipGajiModal(false),
                    style: { 
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '40px',
                        cursor: 'pointer',
                        background: 'var(--surface-hover)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-primary)',
                        fontWeight: 600,
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }
                }, 
                    React.createElement('i', { className: 'fas fa-times', style: { fontSize: '14px' } }), 
                    ' Tutup'
                )
            )
        )
    );
};
        
// ==================== KOMPONEN INPUT ITEM TRANSAKSI (TERPISAH) ====================
const TransaksiItemInput = React.memo(({ onAddItem, editingItem, onClearEdit }) => {
    const [localKg, setLocalKg] = useState('');
    const [localHarga, setLocalHarga] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    
    // Update local state when editingItem changes (dari parent)
    useEffect(() => {
        if (editingItem) {
            setLocalKg(editingItem.kg?.toString() || '');
            setLocalHarga(editingItem.hargaKg?.toString() || '');
            setIsEditing(true);
        } else {
            // Reset saat edit selesai
            if (!isEditing) return;
            setLocalKg('');
            setLocalHarga('');
            setIsEditing(false);
        }
    }, [editingItem]);
    
    const handleTambah = () => {
        const kg = parseFloat(localKg);
        const harga = parseFloat(localHarga);
        if (isNaN(kg) || kg <= 0 || isNaN(harga) || harga <= 0) {
            // Notifikasi via parent
            return false;
        }
        onAddItem(kg, harga);
        setLocalKg('');
        setLocalHarga('');
        setIsEditing(false);
        return true;
    };
    
    const handleBatalEdit = () => {
        setLocalKg('');
        setLocalHarga('');
        setIsEditing(false);
        if (onClearEdit) onClearEdit();
    };
    
    return React.createElement('div', { style: { marginBottom: 16 } },
        React.createElement('label', { className: 'form-label' }, '📦 Item Penjualan'),
        React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' } },
            React.createElement('input', { 
                type: 'number', 
                placeholder: 'Berat (kg)', 
                value: localKg, 
                onChange: e => setLocalKg(e.target.value),
                className: 'form-input', 
                style: { flex: 1, minWidth: '100px' },
                step: '0.01',
                autoComplete: 'off'
            }),
            React.createElement('input', { 
                type: 'number', 
                placeholder: 'Harga/kg', 
                value: localHarga, 
                onChange: e => setLocalHarga(e.target.value),
                className: 'form-input', 
                style: { flex: 1, minWidth: '100px' },
                step: '100',
                autoComplete: 'off'
            }),
            React.createElement('button', { 
                type: 'button',
                onClick: handleTambah,
                className: 'btn-primary', 
                style: { 
                    width: 'auto', 
                    padding: '0 20px',
                    background: isEditing ? '#F59E0B' : '#10B981'
                }
            }, 
                React.createElement('i', { className: isEditing ? 'fas fa-save' : 'fas fa-plus' }),
                ' ', isEditing ? 'Update' : 'Tambah'
            ),
            isEditing && React.createElement('button', { 
                type: 'button',
                onClick: handleBatalEdit,
                className: 'btn-outline', 
                style: { padding: '0 16px' }
            }, 
                React.createElement('i', { className: 'fas fa-times' }),
                ' Batal'
            )
        )
    );
});
        
        // ==================== MODAL RENDER ====================
       
const renderModalContent = () => {
    if (!showModal) return null;
    
    const ModalWrapper = ({ children, title, icon }) => {
    // Mapping icon yang tidak valid ke icon yang valid (Free Font Awesome)
    let finalIcon = icon;

    if (icon === 'fa-chicken') finalIcon = 'fa-egg';
    else if (icon === 'fa-warehouse') finalIcon = 'fa-box';
    else if (icon === 'fa-drumstick') finalIcon = 'fa-drumstick';
    else if (icon === 'fa-grain') finalIcon = 'fa-seedling';
    else if (icon === 'fa-heartbeat' || icon === 'fa-heart') finalIcon = 'fa-heart-pulse';
    else if (icon === 'fas fa-heartbeat') finalIcon = 'fa-heart-pulse';
    else if (!icon) finalIcon = 'fa-info-circle';
    // ✅ JANGAN ubah fa-drumstick menjadi apa pun! Biarkan tetap fa-drumstick
    
    return React.createElement('div', { className: 'modal-overlay', onClick: () => setShowModal(false) },
        React.createElement('div', { 
            className: 'modal-content', 
            ref: modalContentRef,
            onClick: e => e.stopPropagation() 
        },
            React.createElement('div', { 
                className: 'swipe-handle',
                onTouchStart: handleModalSwipeStart,
                onMouseDown: handleModalSwipeStart
            },
                React.createElement('div', { className: 'swipe-indicator' })
            ),
            React.createElement('div', { className: 'modal-header' },
                React.createElement('h3', null, 
                    finalIcon && React.createElement('i', { className: `fas ${finalIcon}`, style: { marginRight: '8px' } }),
                    title
                ),
                React.createElement('button', { className: 'modal-close', onClick: () => setShowModal(false) }, 
                    React.createElement('i', { className: 'fas fa-times' })
                )
            ),
            children
        )
    );
};
    
    // ==================== LOGIN / REGISTER MODAL ====================
    if (modalType === 'login' || modalType === 'register') {
        const isRegister = modalType === 'register';
        return React.createElement(ModalWrapper, { 
            title: isRegister ? 'Daftar Akun' : 'Login',
            icon: isRegister ? 'fa-user-plus' : 'fa-sign-in-alt'
        },
            React.createElement('form', { onSubmit: handleLogin },
                React.createElement('div', { className: 'modal-body' },
                    isRegister && React.createElement(React.Fragment, null,
                        React.createElement('div', { className: 'form-group' }, 
                            React.createElement('label', { className: 'form-label' }, 'Nama Lengkap'), 
                            React.createElement('input', { type: 'text', name: 'name', className: 'form-input', placeholder: 'Masukkan nama', required: true })
                        ),
                        React.createElement('div', { className: 'form-group' }, 
                            React.createElement('label', { className: 'form-label' }, 'Nama Farm/Kandang'), 
                            React.createElement('input', { type: 'text', name: 'farmName', className: 'form-input', placeholder: 'Masukkan nama farm', required: true })
                        )
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Email'), 
                        React.createElement('input', { type: 'email', name: 'email', className: 'form-input', placeholder: 'email@example.com', required: true })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Password'), 
                        React.createElement('input', { type: 'password', name: 'password', className: 'form-input', placeholder: 'Masukkan password', required: true })
                    ),
                    React.createElement('input', { type: 'hidden', name: 'isRegister', value: isRegister })
                ),
                React.createElement('div', { className: 'modal-actions' },
                    React.createElement('button', { type: 'submit', className: 'btn-primary', disabled: loading }, 
                        loading ? React.createElement('div', { className: 'spinner spinner-sm spinner-white' }) : (isRegister ? 'Daftar' : 'Login')
                    ),
                    React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setModalType(isRegister ? 'login' : 'register') }, 
                        isRegister ? 'Sudah punya akun? Login' : 'Belum punya akun? Daftar'
                    )
                )
            )
        );
    }
    
    // ==================== PROFILE MODAL ====================
    if (modalType === 'profile') {
        return React.createElement(ModalWrapper, { title: 'Edit Profil', icon: 'fa-user-edit' },
            React.createElement('form', { onSubmit: handleUpdateProfile },
                React.createElement('div', { className: 'modal-body' },
                    React.createElement('div', { className: 'form-group', style: { textAlign: 'center' } },
                        React.createElement('label', { className: 'form-label' }, 'Foto Profil'),
                        React.createElement('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 } },
                            React.createElement('div', { style: { width: 100, height: 100, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' } },
                                React.createElement('img', { src: avatarPreview || userProfile.avatar || 'fasimcare.png', alt: 'Avatar', style: { width: '100%', height: '100%', objectFit: 'cover' }, onError: (e) => { e.target.src = 'fasimcare.png'; } })
                            ),
                            React.createElement('input', { type: 'file', accept: 'image/*', onChange: handleAvatarChange, style: { fontSize: 12, padding: 4 } })
                        )
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Nama'), 
                        React.createElement('input', { type: 'text', name: 'name', className: 'form-input', defaultValue: userProfile.name, required: true })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Nama Farm'), 
                        React.createElement('input', { type: 'text', name: 'farmName', className: 'form-input', defaultValue: userProfile.farmName })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Alamat Farm'), 
                        React.createElement('textarea', { name: 'farmAddress', className: 'form-input', rows: '2', defaultValue: userProfile.farmAddress || '' })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'No Telepon Farm'), 
                        React.createElement('input', { type: 'tel', name: 'farmPhone', className: 'form-input', defaultValue: userProfile.farmPhone || '' })
                    ),
                    React.createElement('hr', null),
                    React.createElement('h4', { style: { marginBottom: 12 } }, 'Pengaturan Harga Default'),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Harga Telur (Rp/kg)'), 
                        React.createElement('input', { type: 'number', name: 'hargaTelurPerKg', className: 'form-input', defaultValue: userProfile.settings?.hargaTelurPerKg || 25000 })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Harga Ayam (Rp/kg)'), 
                        React.createElement('input', { type: 'number', name: 'hargaAyamPerKg', className: 'form-input', defaultValue: userProfile.settings?.hargaAyamPerKg || 30000 })
                    )
                ),
                React.createElement('div', { className: 'modal-actions' },
                    React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Simpan'),
                    React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
                )
            )
        );
    }
    
    
    
    // ==================== KANDANG SELECT MODAL ====================
    if (modalType === 'kandang_select') {
        return React.createElement(ModalWrapper, { title: 'Pilih Kandang', icon: 'fa-map-marker-alt' },
            React.createElement('div', { className: 'modal-body' },
                kandangList.length === 0 ? 
                    React.createElement('div', { className: 'empty-state' }, 
                        React.createElement('i', { className: 'fas fa-drumstick-bite' }),
                        React.createElement('p', null, 'Belum ada kandang'),
                        React.createElement('button', { className: 'btn-primary', style: { marginTop: 12 }, onClick: () => { setModalType('kandang'); } }, 'Buat Kandang')
                    ) :
                    kandangList.map(kandang => React.createElement('div', { key: kandang.id, className: 'list-item', onClick: () => { setSelectedKandang(kandang); setShowModal(false); addNotification('success', 'Kandang Dipilih', kandang.nama, 2000); }, style: { cursor: 'pointer' } },
                        React.createElement('div', { className: 'item-info' },
                            React.createElement('h4', null, React.createElement('i', { className: kandang.jenis === 'layer' ? 'fas fa-egg' : 'fas fa-drumstick-bite' }), ' ', kandang.nama),
                            React.createElement('p', null, `${kandang.jenis === 'layer' ? 'Layer (Petelur)' : 'Broiler (Pedaging)'} • ${kandang.kapasitas || 0} ekor`)
                        ),
                        selectedKandang?.id === kandang.id && React.createElement('i', { className: 'fas fa-check-circle', style: { color: 'var(--primary)' } })
                    ))
            )
        );
    }
    
    // ==================== KANDANG ADD MODAL ====================
    if (modalType === 'kandang') {
        return React.createElement(ModalWrapper, { title: 'Tambah Kandang', icon: 'fa-plus-circle' },
            React.createElement('form', { onSubmit: handleTambahKandang },
                React.createElement('div', { className: 'modal-body' },
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Nama Kandang'), 
                        React.createElement('input', { type: 'text', name: 'nama', className: 'form-input', required: true, placeholder: 'Kandang A-1' })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Jenis'), 
                        React.createElement('select', { name: 'jenis', className: 'form-input', required: true }, 
                            React.createElement('option', { value: 'layer' }, 'Layer (Ayam Petelur)'),
                            React.createElement('option', { value: 'broiler' }, 'Broiler (Ayam Pedaging)')
                        )
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Kapasitas (ekor)'), 
                        React.createElement('input', { type: 'number', name: 'kapasitas', className: 'form-input', required: true, placeholder: '1000' })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Luas (m²)'), 
                        React.createElement('input', { type: 'number', name: 'luas', className: 'form-input', step: '0.1', placeholder: '100' })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Lokasi'), 
                        React.createElement('input', { type: 'text', name: 'lokasi', className: 'form-input', placeholder: 'Blok A, dekat sumur' })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Tanggal Isi'), 
                        React.createElement('input', { type: 'date', name: 'tanggalIsi', className: 'form-input', defaultValue: new Date().toISOString().split('T')[0] })
                    )
                ),
                React.createElement('div', { className: 'modal-actions' },
                    React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Simpan'),
                    React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
                )
            )
        );
    }
    
    // ==================== POPULASI MODAL ====================
    if (modalType === 'populasi') {
        return React.createElement(ModalWrapper, { title: 'Tambah Populasi', icon: 'fa-drumstick' },
            React.createElement('form', { onSubmit: handleTambahPopulasi },
                React.createElement('div', { className: 'modal-body' },
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Tanggal'), 
                        React.createElement('input', { type: 'date', name: 'tanggal', className: 'form-input', defaultValue: new Date().toISOString().split('T')[0] })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Jumlah (ekor)'), 
                        React.createElement('input', { type: 'number', name: 'jumlah', className: 'form-input', required: true })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Umur (hari)'), 
                        React.createElement('input', { type: 'number', name: 'umur', className: 'form-input' })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Catatan'), 
                        React.createElement('textarea', { name: 'catatan', className: 'form-input', rows: '2' })
                    )
                ),
                React.createElement('div', { className: 'modal-actions' },
                    React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Simpan'),
                    React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
                )
            )
        );
    }
    
    // ==================== PRODUKSI TELUR MODAL ====================
if (modalType === 'produksiTelur') {
    // Variable untuk menyimpan satuan sementara (BUKAN useState)
    let satuanSaatIni = 'butir';
    
    const updateKonversi = (inputEl, satuanEl) => {
        const value = parseFloat(inputEl.value) || 0;
        const satuan = satuanEl.value;
        const konversiSpan = document.getElementById('konversi-produksi');
        const previewSpan = document.getElementById('preview-produksi');
        
        if (value > 0 && konversiSpan) {
            const BERAT_PER_BUTIR = 0.06;
            if (satuan === 'butir') {
                const kg = (value * BERAT_PER_BUTIR).toFixed(1);
                konversiSpan.textContent = `≈ ${kg} kg`;
                if (previewSpan) previewSpan.textContent = `${value.toLocaleString()} butir = ${kg} kg`;
            } else {
                const butir = Math.round(value / BERAT_PER_BUTIR);
                konversiSpan.textContent = `≈ ${butir.toLocaleString()} butir`;
                if (previewSpan) previewSpan.textContent = `${value.toFixed(1)} kg = ${butir.toLocaleString()} butir`;
            }
        } else if (konversiSpan) {
            konversiSpan.textContent = '';
            if (previewSpan) previewSpan.textContent = '';
        }
    };
    
    const handleSatuanChange = (e, jumlahInput) => {
        satuanSaatIni = e.target.value;
        if (jumlahInput) updateKonversi(jumlahInput, e.target);
    };
    
    return React.createElement(ModalWrapper, { title: 'Catat Produksi Telur', icon: 'fa-egg' },
        React.createElement('form', { onSubmit: handleInputProduksiTelur },
            React.createElement('div', { className: 'modal-body' },
                // Pilihan Satuan (Radio biasa, tanpa useState)
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '📏 Pilih Satuan Input'), 
                    React.createElement('div', { style: { display: 'flex', gap: '20px', marginTop: '8px' } },
                        React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' } },
                            React.createElement('input', { 
                                type: 'radio', 
                                name: 'satuan', 
                                value: 'butir', 
                                defaultChecked: true,
                                onChange: (e) => {
                                    const jumlahInput = document.querySelector('input[name="jumlah"]');
                                    handleSatuanChange(e, jumlahInput);
                                }
                            }),
                            React.createElement('i', { className: 'fas fa-egg' }), ' 🥚 Butir'
                        ),
                        React.createElement('label', { style: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' } },
                            React.createElement('input', { 
                                type: 'radio', 
                                name: 'satuan', 
                                value: 'kg',
                                onChange: (e) => {
                                    const jumlahInput = document.querySelector('input[name="jumlah"]');
                                    handleSatuanChange(e, jumlahInput);
                                }
                            }),
                            React.createElement('i', { className: 'fas fa-weight-hanging' }), ' ⚖️ Kilogram'
                        )
                    )
                ),
                
                // Input Jumlah
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label', id: 'jumlah-label' }, '🥚 Jumlah Telur (butir)'), 
                    React.createElement('div', { style: { position: 'relative' } },
                        React.createElement('input', { 
                            type: 'number', 
                            name: 'jumlah', 
                            className: 'form-input', 
                            required: true,
                            placeholder: 'Contoh: 1200',
                            step: '1',
                            style: { paddingRight: '80px' },
                            onChange: (e) => {
                                const satuanRadio = document.querySelector('input[name="satuan"]:checked');
                                updateKonversi(e.target, satuanRadio);
                                // Update label
                                const label = document.getElementById('jumlah-label');
                                if (label) {
                                    const isKg = satuanRadio?.value === 'kg';
                                    label.innerHTML = isKg ? '⚖️ Berat Telur (kg)' : '🥚 Jumlah Telur (butir)';
                                    e.target.placeholder = isKg ? 'Contoh: 72' : 'Contoh: 1200';
                                    e.target.step = isKg ? '0.1' : '1';
                                }
                            }
                        }),
                        React.createElement('span', { 
                            id: 'konversi-produksi',
                            style: {
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: '11px',
                                color: 'var(--primary)',
                                background: 'var(--primary-soft)',
                                padding: '2px 8px',
                                borderRadius: '20px',
                                fontWeight: 500
                            }
                        }, '')
                    ),
                    React.createElement('p', { style: { fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' } },
                        React.createElement('i', { className: 'fas fa-info-circle' }),
                        ' 1 butir ≈ 60 gram (0.06 kg)'
                    )
                ),
                
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '📅 Tanggal'), 
                    React.createElement('input', { 
                        type: 'date', 
                        name: 'tanggal', 
                        className: 'form-input', 
                        defaultValue: new Date().toISOString().split('T')[0] 
                    })
                ),
                
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '💰 Harga Jual (Rp/kg)'), 
                    React.createElement('input', { 
                        type: 'number', 
                        name: 'hargaPerKg', 
                        className: 'form-input', 
                        defaultValue: userProfile.settings.hargaTelurPerKg,
                        placeholder: 'Harga per kilogram'
                    })
                ),
                
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '📝 Catatan'), 
                    React.createElement('textarea', { 
                        name: 'catatan', 
                        className: 'form-input', 
                        rows: '2',
                        placeholder: 'Contoh: Pagi panen 30 kg, sore 42 kg'
                    })
                ),
                
                // Preview Box
                React.createElement('div', { 
                    id: 'preview-box',
                    style: { 
                        marginTop: '12px', 
                        padding: '12px', 
                        background: 'var(--primary-soft)', 
                        borderRadius: '12px',
                        textAlign: 'center',
                        display: 'none'
                    } 
                },
                    React.createElement('div', { style: { fontSize: '11px', color: 'var(--text-tertiary)' } }, '📊 Ringkasan:'),
                    React.createElement('div', { id: 'preview-produksi', style: { fontSize: '14px', fontWeight: 700, color: 'var(--primary)' } }, '')
                )
            ),
            React.createElement('div', { className: 'modal-actions' },
                React.createElement('button', { type: 'submit', className: 'btn-primary', style: { flex: 1 } }, 
                    React.createElement('i', { className: 'fas fa-save' }), 
                    ' Simpan Produksi'
                ),
                React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 
                    React.createElement('i', { className: 'fas fa-times' }), 
                    ' Batal'
                )
            )
        )
    );
}
    
// ==================== PANEN BROILER MODAL ====================
if (modalType === 'panenBroiler') {
    return React.createElement(ModalWrapper, { title: 'Catat Panen Broiler', icon: 'fa-drumstick' },
        React.createElement('form', { onSubmit: handleInputPanenBroiler },
            React.createElement('div', { className: 'modal-body' },
                // Tanggal
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '📅 Tanggal Panen'), 
                    React.createElement('input', { 
                        type: 'date', 
                        name: 'tanggal', 
                        className: 'form-input', 
                        defaultValue: new Date().toISOString().split('T')[0] 
                    })
                ),
                
                // Jumlah Ekor
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '🐔 Jumlah (ekor)'), 
                    React.createElement('input', { 
                        type: 'number', 
                        name: 'jumlahEkor', 
                        className: 'form-input', 
                        required: true,
                        placeholder: 'Contoh: 500'
                    })
                ),
                
                // Berat Rata-rata
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '⚖️ Berat Rata-rata (kg/ekor)'), 
                    React.createElement('input', { 
                        type: 'number', 
                        name: 'beratRata', 
                        className: 'form-input', 
                        step: '0.01', 
                        required: true,
                        placeholder: 'Contoh: 1.8'
                    })
                ),
                
                // Harga Jual
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '💰 Harga Jual (Rp/kg)'), 
                    React.createElement('input', { 
                        type: 'number', 
                        name: 'hargaPerKg', 
                        className: 'form-input', 
                        defaultValue: userProfile.settings.hargaAyamPerKg,
                        placeholder: 'Harga per kilogram'
                    })
                ),
                
                // DIVIDER
                React.createElement('hr', { style: { margin: '16px 0', borderColor: 'var(--border-light)' } }),
                
                // ========== FIELD BARU: DO & PLAT MOBIL ==========
                React.createElement('div', { style: { marginBottom: 12 } },
                    React.createElement('h4', { style: { fontSize: 13, marginBottom: 12, color: 'var(--primary)' } },
                        React.createElement('i', { className: 'fas fa-truck', style: { marginRight: 8 } }),
                        ' Informasi Pengangkut'
                    )
                ),
                
                // Nama DO
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '📋 Nama DO (Delivery Order)'), 
                    React.createElement('input', { 
                        type: 'text', 
                        name: 'namaDO', 
                        className: 'form-input', 
                        placeholder: 'Contoh: PT. Maju Jaya / Bapak Slamet'
                    })
                ),
                
                // Plat Mobil
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '🚛 Plat Mobil'), 
                    React.createElement('input', { 
                        type: 'text', 
                        name: 'platMobil', 
                        className: 'form-input', 
                        placeholder: 'Contoh: B 1234 ABC'
                    })
                ),
                
                // Catatan
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '📝 Catatan'), 
                    React.createElement('textarea', { 
                        name: 'catatan', 
                        className: 'form-input', 
                        rows: '2',
                        placeholder: 'Contoh: Panen pagi, ayam sehat semua'
                    })
                )
            ),
            React.createElement('div', { className: 'modal-actions' },
                React.createElement('button', { type: 'submit', className: 'btn-primary' }, 
                    React.createElement('i', { className: 'fas fa-save' }), 
                    ' Simpan Panen'
                ),
                React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 
                    React.createElement('i', { className: 'fas fa-times' }), 
                    ' Batal'
                )
            )
        )
    );
}
    // ==================== STOK PAKAN MODAL ====================
   if (modalType === 'stokPakan') {
    return React.createElement(ModalWrapper, { title: 'Tambah Stok Pakan', icon: 'fa-box' },
            React.createElement('form', { onSubmit: handleTambahStokPakan },
                React.createElement('div', { className: 'modal-body' },
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Jenis Pakan'), 
                        React.createElement('input', { type: 'text', name: 'jenis', className: 'form-input', required: true, placeholder: 'BR-1, BR-2, Layer Starter' })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Jumlah (kg)'), 
                        React.createElement('input', { type: 'number', name: 'jumlah', className: 'form-input', required: true })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Harga (Rp/kg)'), 
                        React.createElement('input', { type: 'number', name: 'harga', className: 'form-input', required: true })
                    )
                ),
                React.createElement('div', { className: 'modal-actions' },
                    React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Simpan'),
                    React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
                )
            )
        );
    }
    
    // ==================== PAKAN TERPAKAI MODAL ====================
    if (modalType === 'pakanTerpakai') {
        return React.createElement(ModalWrapper, { title: 'Catat Pemakaian Pakan', icon: 'fa-utensils' },
            React.createElement('form', { onSubmit: handleTambahPakanTerpakai },
                React.createElement('div', { className: 'modal-body' },
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Tanggal'), 
                        React.createElement('input', { type: 'date', name: 'tanggal', className: 'form-input', defaultValue: new Date().toISOString().split('T')[0] })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Jenis Pakan'), 
                        React.createElement('input', { type: 'text', name: 'jenis', className: 'form-input', required: true })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Jumlah (kg)'), 
                        React.createElement('input', { type: 'number', name: 'jumlah', className: 'form-input', required: true })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Keterangan'), 
                        React.createElement('textarea', { name: 'keterangan', className: 'form-input', rows: '2' })
                    )
                ),
                React.createElement('div', { className: 'modal-actions' },
                    React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Simpan'),
                    React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
                )
            )
        );
    }
    
    // ==================== STOK OBAT MODAL ====================
    if (modalType === 'stokObat') {
        return React.createElement(ModalWrapper, { title: 'Tambah Stok Obat', icon: 'fa-capsules' },
            React.createElement('form', { onSubmit: handleTambahStokObat },
                React.createElement('div', { className: 'modal-body' },
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Nama Obat'), 
                        React.createElement('input', { type: 'text', name: 'jenis', className: 'form-input', required: true, placeholder: 'Vaksin ND, Antibiotik, Vitamin' })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Jumlah'), 
                        React.createElement('input', { type: 'number', name: 'jumlah', className: 'form-input', required: true })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Harga (Rp)'), 
                        React.createElement('input', { type: 'number', name: 'harga', className: 'form-input', required: true })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Satuan'), 
                        React.createElement('select', { name: 'satuan', className: 'form-input', defaultValue: 'ml' }, 
                            React.createElement('option', { value: 'ml' }, 'ml'),
                            React.createElement('option', { value: 'cc' }, 'cc'),
                            React.createElement('option', { value: 'tablet' }, 'Tablet'),
                            React.createElement('option', { value: 'botol' }, 'Botol')
                        )
                    )
                ),
                React.createElement('div', { className: 'modal-actions' },
                    React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Simpan'),
                    React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
                )
            )
        );
    }
    
    // ==================== OBAT TERPAKAI MODAL ====================
    if (modalType === 'obatTerpakai') {
        return React.createElement(ModalWrapper, { title: 'Catat Pemakaian Obat', icon: 'fa-syringe' },
            React.createElement('form', { onSubmit: handleTambahObatTerpakai },
                React.createElement('div', { className: 'modal-body' },
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Tanggal'), 
                        React.createElement('input', { type: 'date', name: 'tanggal', className: 'form-input', defaultValue: new Date().toISOString().split('T')[0] })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Nama Obat'), 
                        React.createElement('input', { type: 'text', name: 'jenis', className: 'form-input', required: true })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Jumlah'), 
                        React.createElement('input', { type: 'number', name: 'jumlah', className: 'form-input', required: true })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Keterangan'), 
                        React.createElement('textarea', { name: 'keterangan', className: 'form-input', rows: '2' })
                    )
                ),
                React.createElement('div', { className: 'modal-actions' },
                    React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Simpan'),
                    React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
                )
            )
        );
    }
    
    // ==================== VAKSIN MODAL ====================
    if (modalType === 'vaksin') {
        return React.createElement(ModalWrapper, { title: 'Tambah Jadwal Vaksinasi', icon: 'fa-syringe' },
            React.createElement('form', { onSubmit: handleTambahJadwalVaksin },
                React.createElement('div', { className: 'modal-body' },
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Nama Vaksin'), 
                        React.createElement('input', { type: 'text', name: 'nama', className: 'form-input', required: true, placeholder: 'ND, IBD, AI' })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Tanggal'), 
                        React.createElement('input', { type: 'date', name: 'tanggal', className: 'form-input', defaultValue: new Date().toISOString().split('T')[0] })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Metode'), 
                        React.createElement('select', { name: 'metode', className: 'form-input', defaultValue: 'Suntik' }, 
                            React.createElement('option', { value: 'Suntik' }, '💉 Suntik'),
                            React.createElement('option', { value: 'Tetes Mata' }, '👁️ Tetes Mata'),
                            React.createElement('option', { value: 'Air Minum' }, '💧 Air Minum')
                        )
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Dosis'), 
                        React.createElement('input', { type: 'text', name: 'dosis', className: 'form-input', placeholder: '0.5 ml/ekor' })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Catatan'), 
                        React.createElement('textarea', { name: 'catatan', className: 'form-input', rows: '2' })
                    )
                ),
                React.createElement('div', { className: 'modal-actions' },
                    React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Simpan'),
                    React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
                )
            )
        );
    }
    
    // ==================== PENYAKIT MODAL ====================
    if (modalType === 'penyakit') {
    return React.createElement(ModalWrapper, { title: 'Catat Penyakit', icon: 'fa-heart-pulse' },
            React.createElement('form', { onSubmit: handleTambahPenyakit },
                React.createElement('div', { className: 'modal-body' },
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Nama Penyakit'), 
                        React.createElement('input', { type: 'text', name: 'nama', className: 'form-input', required: true })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Tingkat'), 
                        React.createElement('select', { name: 'tingkat', className: 'form-input', defaultValue: 'Ringan' }, 
                            React.createElement('option', { value: 'Ringan' }, 'Ringan'),
                            React.createElement('option', { value: 'Sedang' }, 'Sedang'),
                            React.createElement('option', { value: 'Berat' }, 'Berat')
                        )
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Jumlah Terserang'), 
                        React.createElement('input', { type: 'number', name: 'jumlahTerserang', className: 'form-input' })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Tanggal'), 
                        React.createElement('input', { type: 'date', name: 'tanggal', className: 'form-input', defaultValue: new Date().toISOString().split('T')[0] })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Tindakan'), 
                        React.createElement('textarea', { name: 'tindakan', className: 'form-input', rows: '2' })
                    )
                ),
                React.createElement('div', { className: 'modal-actions' },
                    React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Simpan'),
                    React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
                )
            )
        );
    }
    
    // ==================== KARYAWAN MODAL ====================
    if (modalType === 'karyawan') {
        return React.createElement(ModalWrapper, { title: 'Tambah Karyawan', icon: 'fa-users' },
            React.createElement('form', { onSubmit: handleTambahKaryawan },
                React.createElement('div', { className: 'modal-body' },
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Nama Lengkap'), 
                        React.createElement('input', { type: 'text', name: 'nama', className: 'form-input', required: true })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Posisi'), 
                        React.createElement('input', { type: 'text', name: 'posisi', className: 'form-input', placeholder: 'Pekerja Kandang' })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Gaji (Rp)'), 
                        React.createElement('input', { type: 'number', name: 'gaji', className: 'form-input' })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'No HP'), 
                        React.createElement('input', { type: 'tel', name: 'noHp', className: 'form-input' })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Shift'), 
                        React.createElement('select', { name: 'shift', className: 'form-input', defaultValue: 'pagi' }, 
                            React.createElement('option', { value: 'pagi' }, 'Pagi'),
                            React.createElement('option', { value: 'siang' }, 'Siang'),
                            React.createElement('option', { value: 'malam' }, 'Malam')
                        )
                    )
                ),
                React.createElement('div', { className: 'modal-actions' },
                    React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Simpan'),
                    React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
                )
            )
        );
    }
    
    // ==================== CUSTOMER MODAL ====================
    if (modalType === 'customer') {
        return React.createElement(ModalWrapper, { title: 'Tambah Customer', icon: 'fa-user-friends' },
            React.createElement('form', { onSubmit: handleTambahCustomer },
                React.createElement('div', { className: 'modal-body' },
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Nama Customer'), 
                        React.createElement('input', { type: 'text', name: 'nama', className: 'form-input', required: true })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'No HP'), 
                        React.createElement('input', { type: 'tel', name: 'noHp', className: 'form-input' })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Alamat'), 
                        React.createElement('textarea', { name: 'alamat', className: 'form-input', rows: '2' })
                    )
                ),
                React.createElement('div', { className: 'modal-actions' },
                    React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Simpan'),
                    React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
                )
            )
        );
    }
    
    // ==================== SUPPLIER MODAL ====================
    if (modalType === 'supplier') {
        return React.createElement(ModalWrapper, { title: 'Tambah Supplier', icon: 'fa-truck' },
            React.createElement('form', { onSubmit: handleTambahSupplier },
                React.createElement('div', { className: 'modal-body' },
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Nama Supplier'), 
                        React.createElement('input', { type: 'text', name: 'nama', className: 'form-input', required: true })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Produk'), 
                        React.createElement('input', { type: 'text', name: 'produk', className: 'form-input', defaultValue: 'Pakan' })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'No HP'), 
                        React.createElement('input', { type: 'tel', name: 'noHp', className: 'form-input' })
                    ),
                    React.createElement('div', { className: 'form-group' }, 
                        React.createElement('label', { className: 'form-label' }, 'Alamat'), 
                        React.createElement('textarea', { name: 'alamat', className: 'form-input', rows: '2' })
                    )
                ),
                React.createElement('div', { className: 'modal-actions' },
                    React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Simpan'),
                    React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
                )
            )
        );
    }
    
// ==================== TRANSAKSI MODAL - LENGKAP (TAMBAH & EDIT) ====================
// ==================== TRANSAKSI MODAL - TANPA BLINK (DOM MANIPULATION) ====================
if (modalType === 'transaksi' || modalType === 'transaksi_edit') {
    const isEdit = modalType === 'transaksi_edit';
    const title = isEdit ? 'Edit Transaksi' : 'Tambah Transaksi';
    
    // Data items disimpan di variabel biasa + DOM, BUKAN useState
    let tempItems = [];
    let editingIndex = null;
    let itemsContainer = null;
    
    // Fungsi render ulang list item (pakai DOM, bukan React state)
    const renderItemsList = () => {
        if (!itemsContainer) return;
        
        if (tempItems.length === 0) {
            itemsContainer.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-tertiary);font-size:12px">Belum ada item</div>';
            return;
        }
        
        itemsContainer.innerHTML = tempItems.map((item, idx) => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:${idx < tempItems.length - 1 ? '1px solid var(--border-light)' : 'none'}">
                <div>
                    <strong>${item.grade || 'Produk'}</strong>
                    <span style="font-size:11px;margin-left:8px;color:var(--text-tertiary)">${item.kg} kg @ ${formatRupiah(item.hargaKg)}</span>
                </div>
                <div style="display:flex;gap:8px;align-items:center">
                    <span style="font-weight:bold;color:#10B981">${formatRupiah(item.subtotal)}</span>
                    <button type="button" class="btn-icon edit-item-btn" data-index="${idx}" style="width:28px;height:28px;background:var(--surface-hover);border:none;border-radius:50%;cursor:pointer">
                        <i class="fas fa-edit" style="font-size:12px"></i>
                    </button>
                    <button type="button" class="btn-icon delete-item-btn" data-index="${idx}" style="width:28px;height:28px;background:#EF444415;border:none;border-radius:50%;cursor:pointer;color:#EF4444">
                        <i class="fas fa-trash" style="font-size:12px"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Update total
        const totalSpan = document.getElementById('transaksi-total-sementara');
        if (totalSpan) {
            const total = tempItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
            totalSpan.innerHTML = formatRupiah(total);
            const totalBox = document.getElementById('total-sementara-box');
            if (totalBox) totalBox.style.display = tempItems.length > 0 ? 'block' : 'none';
        }
        
        // Re-attach event listeners
        document.querySelectorAll('.edit-item-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.index);
                const item = tempItems[idx];
                if (item) {
                    editingIndex = idx;
                    const kgInput = document.getElementById('transaksi-kg-input');
                    const hargaInput = document.getElementById('transaksi-harga-input');
                    const tambahBtn = document.getElementById('transaksi-tambah-btn');
                    if (kgInput) kgInput.value = item.kg;
                    if (hargaInput) hargaInput.value = item.hargaKg;
                    if (tambahBtn) {
                        tambahBtn.innerHTML = '<i class="fas fa-save"></i> Update';
                        tambahBtn.style.background = '#F59E0B';
                    }
                    if (kgInput) kgInput.focus();
                }
            };
        });
        
        document.querySelectorAll('.delete-item-btn').forEach(btn => {
            btn.onclick = () => {
                const idx = parseInt(btn.dataset.index);
                tempItems = tempItems.filter((_, i) => i !== idx);
                if (editingIndex === idx) {
                    editingIndex = null;
                    const kgInput = document.getElementById('transaksi-kg-input');
                    const hargaInput = document.getElementById('transaksi-harga-input');
                    const tambahBtn = document.getElementById('transaksi-tambah-btn');
                    if (kgInput) kgInput.value = '';
                    if (hargaInput) hargaInput.value = '';
                    if (tambahBtn) {
                        tambahBtn.innerHTML = '<i class="fas fa-plus"></i> Tambah';
                        tambahBtn.style.background = '#10B981';
                    }
                }
                renderItemsList();
            };
        });
    };
    
    // Tambah atau update item
    const tambahItemHandler = () => {
        const kgInput = document.getElementById('transaksi-kg-input');
        const hargaInput = document.getElementById('transaksi-harga-input');
        
        const kg = parseFloat(kgInput?.value || '0');
        const harga = parseFloat(hargaInput?.value || '0');
        
        if (isNaN(kg) || kg <= 0 || isNaN(harga) || harga <= 0) {
            addNotification('danger', 'Error', 'Isi berat dan harga dengan benar', 3000);
            return;
        }
        
        const subtotal = kg * harga;
        
        if (editingIndex !== null) {
            // Update existing item
            tempItems[editingIndex] = {
                id: 'item_' + Date.now() + '_' + Math.random(),
                grade: selectedKandang?.jenis === 'layer' ? 'Telur' : 'Ayam',
                kg, hargaKg: harga, subtotal
            };
            editingIndex = null;
            const tambahBtn = document.getElementById('transaksi-tambah-btn');
            if (tambahBtn) {
                tambahBtn.innerHTML = '<i class="fas fa-plus"></i> Tambah';
                tambahBtn.style.background = '#10B981';
            }
        } else {
            // Add new item
            tempItems.push({
                id: 'item_' + Date.now() + '_' + Math.random(),
                grade: selectedKandang?.jenis === 'layer' ? 'Telur' : 'Ayam',
                kg, hargaKg: harga, subtotal
            });
        }
        
        // Reset input
        if (kgInput) kgInput.value = '';
        if (hargaInput) hargaInput.value = '';
        if (kgInput) kgInput.focus();
        
        renderItemsList();
    };
    
    // Load data jika edit mode
    setTimeout(() => {
        if (isEdit && modalData) {
            const pembeliInput = document.getElementById('transaksi_pembeli');
            const noFakturInput = document.getElementById('transaksi_nofaktur');
            const tanggalInput = document.getElementById('transaksi_tanggal');
            const metodeSelect = document.getElementById('transaksi_metode');
            const catatanTextarea = document.getElementById('transaksi_catatan');
            
            if (pembeliInput) pembeliInput.value = modalData.pembeli || '';
            if (noFakturInput) noFakturInput.value = modalData.noFaktur || '';
            if (tanggalInput) tanggalInput.value = modalData.tanggal || '';
            if (metodeSelect) metodeSelect.value = modalData.metodePembayaran || 'Tunai';
            if (catatanTextarea) catatanTextarea.value = modalData.catatan || '';
            
            if (modalData.items && modalData.items.length > 0) {
                tempItems = [...modalData.items];
                renderItemsList();
            }
        }
    }, 50);
    
    // Simpan transaksi
    const simpanTransaksi = () => {
        const pembeli = document.getElementById('transaksi_pembeli')?.value || '';
        const noFaktur = document.getElementById('transaksi_nofaktur')?.value || `INV/${moment().format('YYYYMMDD')}/${Math.floor(Math.random() * 1000)}`;
        const tanggal = document.getElementById('transaksi_tanggal')?.value || new Date().toISOString().split('T')[0];
        const metode = document.getElementById('transaksi_metode')?.value || 'Tunai';
        const catatan = document.getElementById('transaksi_catatan')?.value || '';
        
        if (!pembeli) {
            addNotification('danger', 'Error', 'Nama pembeli harus diisi', 3000);
            return;
        }
        
        if (tempItems.length === 0) {
            addNotification('danger', 'Error', 'Minimal 1 item', 3000);
            return;
        }
        
        const totalBayar = tempItems.reduce((sum, item) => sum + item.subtotal, 0);
        const totalBerat = tempItems.reduce((sum, item) => sum + item.kg, 0);
        
        if (isEdit && modalData) {
            const updatedTransaksi = {
                ...modalData,
                noFaktur,
                tanggal,
                pembeli,
                metodePembayaran: metode,
                catatan,
                items: [...tempItems],
                totalBayar,
                totalBerat
            };
            
            setTransaksiPenjualan(prev => {
                const updated = prev.map(t => t.id === modalData.id ? updatedTransaksi : t);
                saveToFirebase('transaksi', updated);
                saveToStorage('transaksi', updated);
                return updated;
            });
            addNotification('success', 'Transaksi Diupdate', `${noFaktur} - ${formatRupiah(totalBayar)}`, 3000);
        } else {
            const newTransaksi = {
                id: generateUniqueId(),
                noFaktur,
                tanggal,
                pembeli,
                metodePembayaran: metode,
                catatan,
                items: [...tempItems],
                totalBayar,
                totalBerat
            };
            
            setTransaksiPenjualan(prev => {
                const updated = [newTransaksi, ...prev];
                saveToFirebase('transaksi', updated);
                saveToStorage('transaksi', updated);
                return updated;
            });
            addNotification('success', 'Transaksi Tersimpan', `${noFaktur} - ${formatRupiah(totalBayar)}`, 3000);
        }
        
        // Reset dan tutup modal
        tempItems = [];
        editingIndex = null;
        setShowModal(false);
        setModalData(null);
        setEditMode(false);
    };
    
    const batalHandler = () => {
        tempItems = [];
        editingIndex = null;
        setShowModal(false);
        setModalData(null);
        setEditMode(false);
    };
    
    return React.createElement(ModalWrapper, { title: title, icon: 'fa-receipt' },
        React.createElement('div', { className: 'modal-body' },
            // Pembeli
            React.createElement('div', { className: 'form-group' }, 
                React.createElement('label', { className: 'form-label' }, '👤 Pembeli'), 
                React.createElement('input', { 
                    id: 'transaksi_pembeli',
                    type: 'text', 
                    className: 'form-input', 
                    required: true, 
                    placeholder: 'Nama pembeli',
                    defaultValue: ''
                })
            ),
            
            // No Faktur & Tanggal
            React.createElement('div', { style: { display: 'flex', gap: '12px', marginBottom: '16px' } },
                React.createElement('div', { className: 'form-group', style: { flex: 1 } }, 
                    React.createElement('label', { className: 'form-label' }, '📄 No. Faktur'), 
                    React.createElement('input', { 
                        id: 'transaksi_nofaktur',
                        type: 'text', 
                        className: 'form-input', 
                        placeholder: 'Kosongkan untuk otomatis',
                        defaultValue: ''
                    })
                ),
                React.createElement('div', { className: 'form-group', style: { flex: 1 } }, 
                    React.createElement('label', { className: 'form-label' }, '📅 Tanggal'), 
                    React.createElement('input', { 
                        id: 'transaksi_tanggal',
                        type: 'date', 
                        className: 'form-input', 
                        defaultValue: new Date().toISOString().split('T')[0] 
                    })
                )
            ),
            
            // Metode Pembayaran
            React.createElement('div', { className: 'form-group' }, 
                React.createElement('label', { className: 'form-label' }, '💳 Metode Pembayaran'), 
                React.createElement('select', { 
                    id: 'transaksi_metode',
                    className: 'form-input', 
                    defaultValue: 'Tunai' 
                }, 
                    React.createElement('option', { value: 'Tunai' }, '💰 Tunai'),
                    React.createElement('option', { value: 'Transfer' }, '🏦 Transfer'),
                    React.createElement('option', { value: 'Credit' }, '💳 Kredit')
                )
            ),
            
            // INPUT ITEM
            React.createElement('div', { style: { marginBottom: 16 } },
                React.createElement('label', { className: 'form-label' }, '📦 Item Penjualan'),
                React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' } },
                    React.createElement('input', { 
                        id: 'transaksi-kg-input',
                        type: 'number', 
                        placeholder: 'Berat (kg)', 
                        className: 'form-input', 
                        style: { flex: 1, minWidth: '100px' },
                        step: '0.01'
                    }),
                    React.createElement('input', { 
                        id: 'transaksi-harga-input',
                        type: 'number', 
                        placeholder: 'Harga/kg', 
                        className: 'form-input', 
                        style: { flex: 1, minWidth: '100px' },
                        step: '100'
                    }),
                    React.createElement('button', { 
                        type: 'button',
                        id: 'transaksi-tambah-btn',
                        onClick: tambahItemHandler,
                        className: 'btn-primary', 
                        style: { width: 'auto', padding: '0 20px', background: '#10B981' }
                    }, 
                        React.createElement('i', { className: 'fas fa-plus' }), ' Tambah'
                    )
                ),
                
                // List Item Container (RENDER MANUAL via DOM)
                React.createElement('div', { 
                    id: 'transaksi-items-container',
                    ref: (el) => { itemsContainer = el; },
                    style: { 
                        maxHeight: 250, 
                        overflowY: 'auto', 
                        border: '1px solid var(--border-light)', 
                        borderRadius: 8, 
                        padding: 8, 
                        marginTop: 8,
                        background: 'var(--surface)'
                    }
                }, ''),
                
                // Total Sementara
                React.createElement('div', { 
                    id: 'total-sementara-box',
                    style: { 
                        marginTop: 12, 
                        textAlign: 'right', 
                        fontWeight: 'bold', 
                        fontSize: 16, 
                        padding: '8px 12px', 
                        background: 'var(--primary-soft)', 
                        borderRadius: 8,
                        display: 'none'
                    }
                }, 
                    '💰 Total: ', React.createElement('span', { id: 'transaksi-total-sementara' }, 'Rp 0')
                )
            ),
            
            // Catatan
            React.createElement('div', { className: 'form-group' }, 
                React.createElement('label', { className: 'form-label' }, '📝 Catatan'), 
                React.createElement('textarea', { 
                    id: 'transaksi_catatan',
                    className: 'form-input', 
                    rows: '2', 
                    placeholder: 'Catatan tambahan (opsional)',
                    defaultValue: ''
                })
            )
        ),
        
        React.createElement('div', { className: 'modal-actions' },
            React.createElement('button', { 
                type: 'button', 
                onClick: simpanTransaksi,
                className: 'btn-primary', 
                style: { flex: 1 }
            }, 
                React.createElement('i', { className: 'fas fa-save' }), 
                isEdit ? ' Update Transaksi' : ' Simpan Transaksi'
            ),
            React.createElement('button', { 
                type: 'button', 
                className: 'btn-outline', 
                onClick: batalHandler
            }, 
                React.createElement('i', { className: 'fas fa-times' }), 
                ' Batal'
            )
        )
    );
}
   // ==================== EDIT MODALS LENGKAP ====================

// KANDANG EDIT
if (modalType === 'kandang_edit' && modalData) {
    return React.createElement(ModalWrapper, { title: 'Edit Kandang', icon: 'fa-edit' },
        React.createElement('form', { onSubmit: handleUpdateKandang },
            React.createElement('div', { className: 'modal-body' },
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Nama Kandang'), 
                    React.createElement('input', { type: 'text', name: 'nama', className: 'form-input', defaultValue: modalData.nama, required: true })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Jenis'), 
                    React.createElement('select', { name: 'jenis', className: 'form-input', defaultValue: modalData.jenis }, 
                        React.createElement('option', { value: 'layer' }, 'Layer (Ayam Petelur)'),
                        React.createElement('option', { value: 'broiler' }, 'Broiler (Ayam Pedaging)')
                    )
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Kapasitas (ekor)'), 
                    React.createElement('input', { type: 'number', name: 'kapasitas', className: 'form-input', defaultValue: modalData.kapasitas })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Luas (m²)'), 
                    React.createElement('input', { type: 'number', name: 'luas', className: 'form-input', step: '0.1', defaultValue: modalData.luas })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Lokasi'), 
                    React.createElement('input', { type: 'text', name: 'lokasi', className: 'form-input', defaultValue: modalData.lokasi })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Tanggal Isi'), 
                    React.createElement('input', { type: 'date', name: 'tanggalIsi', className: 'form-input', defaultValue: modalData.tanggalIsi })
                )
            ),
            React.createElement('div', { className: 'modal-actions' },
                React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Update'),
                React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
            )
        )
    );
}
    
    

// POPULASI EDIT
if (modalType === 'populasi_edit' && modalData) {
    return React.createElement(ModalWrapper, { title: 'Edit Populasi', icon: 'fa-edit' },
        React.createElement('form', { onSubmit: handleUpdatePopulasi },
            React.createElement('div', { className: 'modal-body' },
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Tanggal'), 
                    React.createElement('input', { type: 'date', name: 'tanggal', className: 'form-input', defaultValue: modalData.tanggal })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Jumlah (ekor)'), 
                    React.createElement('input', { type: 'number', name: 'jumlah', className: 'form-input', defaultValue: modalData.jumlah })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Umur (hari)'), 
                    React.createElement('input', { type: 'number', name: 'umur', className: 'form-input', defaultValue: modalData.umur })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Status'), 
                    React.createElement('select', { name: 'status', className: 'form-input', defaultValue: modalData.status }, 
                        React.createElement('option', { value: 'aktif' }, 'Aktif'),
                        React.createElement('option', { value: 'mati' }, 'Mati')
                    )
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Catatan'), 
                    React.createElement('textarea', { name: 'catatan', className: 'form-input', rows: '2', defaultValue: modalData.catatan })
                )
            ),
            React.createElement('div', { className: 'modal-actions' },
                React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Update'),
                React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
            )
        )
    );
}

// PRODUKSI TELUR EDIT
if (modalType === 'produksiTelur_edit' && modalData) {
    return React.createElement(ModalWrapper, { title: 'Edit Produksi Telur', icon: 'fa-edit' },
        React.createElement('form', { onSubmit: handleUpdateProduksiTelur },
            React.createElement('div', { className: 'modal-body' },
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Tanggal'), 
                    React.createElement('input', { type: 'date', name: 'tanggal', className: 'form-input', defaultValue: modalData.tanggal })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Jumlah (butir)'), 
                    React.createElement('input', { type: 'number', name: 'jumlah', className: 'form-input', defaultValue: modalData.jumlah })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Harga Jual (Rp/kg)'), 
                    React.createElement('input', { type: 'number', name: 'hargaPerKg', className: 'form-input', defaultValue: modalData.hargaPerKg })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Catatan'), 
                    React.createElement('textarea', { name: 'catatan', className: 'form-input', rows: '2', defaultValue: modalData.catatan })
                )
            ),
            React.createElement('div', { className: 'modal-actions' },
                React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Update'),
                React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
            )
        )
    );
}

// PANEN BROILER EDIT
if (modalType === 'panenBroiler_edit' && modalData) {
    return React.createElement(ModalWrapper, { title: 'Edit Panen Broiler', icon: 'fa-edit' },
        React.createElement('form', { onSubmit: handleUpdatePanenBroiler },
            React.createElement('div', { className: 'modal-body' },
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '📅 Tanggal'), 
                    React.createElement('input', { type: 'date', name: 'tanggal', className: 'form-input', defaultValue: modalData.tanggal })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '🐔 Jumlah (ekor)'), 
                    React.createElement('input', { type: 'number', name: 'jumlahEkor', className: 'form-input', defaultValue: modalData.jumlahEkor })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '⚖️ Berat Rata-rata (kg/ekor)'), 
                    React.createElement('input', { type: 'number', name: 'beratRata', className: 'form-input', step: '0.01', defaultValue: modalData.beratRata })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '💰 Harga Jual (Rp/kg)'), 
                    React.createElement('input', { type: 'number', name: 'hargaPerKg', className: 'form-input', defaultValue: modalData.hargaPerKg })
                ),
                
                React.createElement('hr', { style: { margin: '16px 0', borderColor: 'var(--border-light)' } }),
                
                // DO & PLAT MOBIL
                React.createElement('h4', { style: { fontSize: 13, marginBottom: 12, color: 'var(--primary)' } },
                    React.createElement('i', { className: 'fas fa-truck', style: { marginRight: 8 } }),
                    ' Informasi Pengangkut'
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '📋 Nama DO'), 
                    React.createElement('input', { type: 'text', name: 'namaDO', className: 'form-input', defaultValue: modalData.namaDO || '' })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '🚛 Plat Mobil'), 
                    React.createElement('input', { type: 'text', name: 'platMobil', className: 'form-input', defaultValue: modalData.platMobil || '' })
                ),
                
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, '📝 Catatan'), 
                    React.createElement('textarea', { name: 'catatan', className: 'form-input', rows: '2', defaultValue: modalData.catatan })
                )
            ),
            React.createElement('div', { className: 'modal-actions' },
                React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Update'),
                React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
            )
        )
    );
}

// STOK PAKAN EDIT
if (modalType === 'stokPakan_edit' && modalData) {
    return React.createElement(ModalWrapper, { title: 'Edit Stok Pakan', icon: 'fa-edit' },
        React.createElement('form', { onSubmit: handleUpdateStokPakan },
            React.createElement('div', { className: 'modal-body' },
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Jenis Pakan'), 
                    React.createElement('input', { type: 'text', name: 'jenis', className: 'form-input', defaultValue: modalData.jenis, required: true })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Stok (kg)'), 
                    React.createElement('input', { type: 'number', name: 'stok', className: 'form-input', defaultValue: modalData.stok, required: true })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Harga (Rp/kg)'), 
                    React.createElement('input', { type: 'number', name: 'harga', className: 'form-input', defaultValue: modalData.totalHarga / modalData.stok || 0, required: true })
                )
            ),
            React.createElement('div', { className: 'modal-actions' },
                React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Update'),
                React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
            )
        )
    );
}

// PAKAN TERPAKAI EDIT
if (modalType === 'pakanTerpakai_edit' && modalData) {
    return React.createElement(ModalWrapper, { title: 'Edit Pakan Terpakai', icon: 'fa-edit' },
        React.createElement('form', { onSubmit: handleUpdatePakanTerpakai },
            React.createElement('div', { className: 'modal-body' },
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Tanggal'), 
                    React.createElement('input', { type: 'date', name: 'tanggal', className: 'form-input', defaultValue: modalData.tanggal })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Jenis Pakan'), 
                    React.createElement('input', { type: 'text', name: 'jenis', className: 'form-input', defaultValue: modalData.jenis, required: true })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Jumlah (kg)'), 
                    React.createElement('input', { type: 'number', name: 'jumlah', className: 'form-input', defaultValue: modalData.jumlah, required: true })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Keterangan'), 
                    React.createElement('textarea', { name: 'keterangan', className: 'form-input', rows: '2', defaultValue: modalData.keterangan })
                )
            ),
            React.createElement('div', { className: 'modal-actions' },
                React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Update'),
                React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
            )
        )
    );
}

// STOK OBAT EDIT
if (modalType === 'stokObat_edit' && modalData) {
    return React.createElement(ModalWrapper, { title: 'Edit Stok Obat', icon: 'fa-edit' },
        React.createElement('form', { onSubmit: handleUpdateStokObat },
            React.createElement('div', { className: 'modal-body' },
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Nama Obat'), 
                    React.createElement('input', { type: 'text', name: 'jenis', className: 'form-input', defaultValue: modalData.jenis, required: true })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Stok'), 
                    React.createElement('input', { type: 'number', name: 'stok', className: 'form-input', defaultValue: modalData.stok, required: true })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Harga (Rp)'), 
                    React.createElement('input', { type: 'number', name: 'harga', className: 'form-input', defaultValue: modalData.totalHarga / modalData.stok || 0, required: true })
                )
            ),
            React.createElement('div', { className: 'modal-actions' },
                React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Update'),
                React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
            )
        )
    );
}

// OBAT TERPAKAI EDIT
if (modalType === 'obatTerpakai_edit' && modalData) {
    return React.createElement(ModalWrapper, { title: 'Edit Obat Terpakai', icon: 'fa-edit' },
        React.createElement('form', { onSubmit: handleUpdateObatTerpakai },
            React.createElement('div', { className: 'modal-body' },
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Tanggal'), 
                    React.createElement('input', { type: 'date', name: 'tanggal', className: 'form-input', defaultValue: modalData.tanggal })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Nama Obat'), 
                    React.createElement('input', { type: 'text', name: 'jenis', className: 'form-input', defaultValue: modalData.jenis, required: true })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Jumlah'), 
                    React.createElement('input', { type: 'number', name: 'jumlah', className: 'form-input', defaultValue: modalData.jumlah, required: true })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Keterangan'), 
                    React.createElement('textarea', { name: 'keterangan', className: 'form-input', rows: '2', defaultValue: modalData.keterangan })
                )
            ),
            React.createElement('div', { className: 'modal-actions' },
                React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Update'),
                React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
            )
        )
    );
}

// JADWAL VAKSIN EDIT
if (modalType === 'jadwalVaksin_edit' && modalData) {
    return React.createElement(ModalWrapper, { title: 'Edit Jadwal Vaksinasi', icon: 'fa-edit' },
        React.createElement('form', { onSubmit: handleUpdateJadwalVaksin },
            React.createElement('div', { className: 'modal-body' },
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Nama Vaksin'), 
                    React.createElement('input', { type: 'text', name: 'nama', className: 'form-input', defaultValue: modalData.nama, required: true })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Tanggal'), 
                    React.createElement('input', { type: 'date', name: 'tanggal', className: 'form-input', defaultValue: modalData.tanggal })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Metode'), 
                    React.createElement('select', { name: 'metode', className: 'form-input', defaultValue: modalData.metode }, 
                        React.createElement('option', { value: 'Suntik' }, '💉 Suntik'),
                        React.createElement('option', { value: 'Tetes Mata' }, '👁️ Tetes Mata'),
                        React.createElement('option', { value: 'Air Minum' }, '💧 Air Minum')
                    )
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Dosis'), 
                    React.createElement('input', { type: 'text', name: 'dosis', className: 'form-input', defaultValue: modalData.dosis })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Status'), 
                    React.createElement('select', { name: 'status', className: 'form-input', defaultValue: modalData.status }, 
                        React.createElement('option', { value: 'terjadwal' }, 'Terjadwal'),
                        React.createElement('option', { value: 'selesai' }, 'Selesai')
                    )
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Catatan'), 
                    React.createElement('textarea', { name: 'catatan', className: 'form-input', rows: '2', defaultValue: modalData.catatan })
                )
            ),
            React.createElement('div', { className: 'modal-actions' },
                React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Update'),
                React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
            )
        )
    );
}

// PENYAKIT EDIT
if (modalType === 'penyakit_edit' && modalData) {
    return React.createElement(ModalWrapper, { title: 'Edit Penyakit', icon: 'fa-edit' },
        React.createElement('form', { onSubmit: handleUpdatePenyakit },
            React.createElement('div', { className: 'modal-body' },
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Nama Penyakit'), 
                    React.createElement('input', { type: 'text', name: 'nama', className: 'form-input', defaultValue: modalData.nama, required: true })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Tingkat'), 
                    React.createElement('select', { name: 'tingkat', className: 'form-input', defaultValue: modalData.tingkat }, 
                        React.createElement('option', { value: 'Ringan' }, 'Ringan'),
                        React.createElement('option', { value: 'Sedang' }, 'Sedang'),
                        React.createElement('option', { value: 'Berat' }, 'Berat')
                    )
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Jumlah Terserang'), 
                    React.createElement('input', { type: 'number', name: 'jumlahTerserang', className: 'form-input', defaultValue: modalData.jumlahTerserang })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Tanggal'), 
                    React.createElement('input', { type: 'date', name: 'tanggal', className: 'form-input', defaultValue: modalData.tanggal })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Tindakan'), 
                    React.createElement('textarea', { name: 'tindakan', className: 'form-input', rows: '2', defaultValue: modalData.tindakan })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Status'), 
                    React.createElement('select', { name: 'status', className: 'form-input', defaultValue: modalData.status }, 
                        React.createElement('option', { value: 'aktif' }, 'Aktif'),
                        React.createElement('option', { value: 'sembuh' }, 'Sembuh')
                    )
                )
            ),
            React.createElement('div', { className: 'modal-actions' },
                React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Update'),
                React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
            )
        )
    );
}

// KARYAWAN EDIT
if (modalType === 'karyawan_edit' && modalData) {
    return React.createElement(ModalWrapper, { title: 'Edit Karyawan', icon: 'fa-edit' },
        React.createElement('form', { onSubmit: handleUpdateKaryawan },
            React.createElement('div', { className: 'modal-body' },
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Nama Lengkap'), 
                    React.createElement('input', { type: 'text', name: 'nama', className: 'form-input', defaultValue: modalData.nama, required: true })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Posisi'), 
                    React.createElement('input', { type: 'text', name: 'posisi', className: 'form-input', defaultValue: modalData.posisi })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Gaji (Rp)'), 
                    React.createElement('input', { type: 'number', name: 'gaji', className: 'form-input', defaultValue: modalData.gaji })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'No HP'), 
                    React.createElement('input', { type: 'tel', name: 'noHp', className: 'form-input', defaultValue: modalData.noHp })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Shift'), 
                    React.createElement('select', { name: 'shift', className: 'form-input', defaultValue: modalData.shift }, 
                        React.createElement('option', { value: 'pagi' }, 'Pagi'),
                        React.createElement('option', { value: 'siang' }, 'Siang'),
                        React.createElement('option', { value: 'malam' }, 'Malam')
                    )
                )
            ),
            React.createElement('div', { className: 'modal-actions' },
                React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Update'),
                React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
            )
        )
    );
}

// CUSTOMER EDIT
if (modalType === 'customer_edit' && modalData) {
    return React.createElement(ModalWrapper, { title: 'Edit Customer', icon: 'fa-edit' },
        React.createElement('form', { onSubmit: handleUpdateCustomer },
            React.createElement('div', { className: 'modal-body' },
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Nama Customer'), 
                    React.createElement('input', { type: 'text', name: 'nama', className: 'form-input', defaultValue: modalData.nama, required: true })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'No HP'), 
                    React.createElement('input', { type: 'tel', name: 'noHp', className: 'form-input', defaultValue: modalData.noHp })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Alamat'), 
                    React.createElement('textarea', { name: 'alamat', className: 'form-input', rows: '2', defaultValue: modalData.alamat })
                )
            ),
            React.createElement('div', { className: 'modal-actions' },
                React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Update'),
                React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
            )
        )
    );
}

// SUPPLIER EDIT
if (modalType === 'supplier_edit' && modalData) {
    return React.createElement(ModalWrapper, { title: 'Edit Supplier', icon: 'fa-edit' },
        React.createElement('form', { onSubmit: handleUpdateSupplier },
            React.createElement('div', { className: 'modal-body' },
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Nama Supplier'), 
                    React.createElement('input', { type: 'text', name: 'nama', className: 'form-input', defaultValue: modalData.nama, required: true })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Produk'), 
                    React.createElement('input', { type: 'text', name: 'produk', className: 'form-input', defaultValue: modalData.produk })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'No HP'), 
                    React.createElement('input', { type: 'tel', name: 'noHp', className: 'form-input', defaultValue: modalData.noHp })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Alamat'), 
                    React.createElement('textarea', { name: 'alamat', className: 'form-input', rows: '2', defaultValue: modalData.alamat })
                )
            ),
            React.createElement('div', { className: 'modal-actions' },
                React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Update'),
                React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => setShowModal(false) }, 'Batal')
            )
        )
    );
}

// TRANSAKSI EDIT
if (modalType === 'transaksi_edit' && modalData) {
    const totalSementara = transaksiItems.length > 0 ? transaksiItems.reduce((sum, item) => sum + (item.subtotal || 0), 0) : (modalData.totalBayar || 0);
    return React.createElement(ModalWrapper, { title: 'Edit Transaksi', icon: 'fa-edit' },
        React.createElement('form', { onSubmit: handleUpdateTransaksi },
            React.createElement('div', { className: 'modal-body' },
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Pembeli'), 
                    React.createElement('input', { type: 'text', name: 'pembeli', className: 'form-input', defaultValue: modalData.pembeli, required: true })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'No. Faktur'), 
                    React.createElement('input', { type: 'text', name: 'noFaktur', className: 'form-input', defaultValue: modalData.noFaktur })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Tanggal'), 
                    React.createElement('input', { type: 'date', name: 'tanggal', className: 'form-input', defaultValue: modalData.tanggal })
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Metode Pembayaran'), 
                    React.createElement('select', { name: 'metodePembayaran', className: 'form-input', defaultValue: modalData.metodePembayaran }, 
                        React.createElement('option', { value: 'Tunai' }, 'Tunai'),
                        React.createElement('option', { value: 'Transfer' }, 'Transfer'),
                        React.createElement('option', { value: 'Kredit' }, 'Kredit')
                    )
                ),
                React.createElement('div', { style: { marginBottom: 16 } },
                    React.createElement('label', { className: 'form-label' }, 'Item Penjualan'),
                    React.createElement('div', { style: { display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' } },
                        React.createElement('input', { type: 'number', placeholder: 'Berat (kg)', value: itemKg, onChange: e => setItemKg(e.target.value), className: 'form-input', style: { flex: 1 } }),
                        React.createElement('input', { type: 'number', placeholder: 'Harga/kg', value: itemHarga, onChange: e => setItemHarga(e.target.value), className: 'form-input', style: { flex: 1 } }),
                        React.createElement('button', { type: 'button', onClick: handleTambahItemTransaksi, className: 'btn-primary', style: { width: 'auto', padding: '0 16px' } }, React.createElement('i', { className: 'fas fa-plus' }))
                    ),
                    (transaksiItems.length > 0 || (modalData.items && modalData.items.length > 0)) && 
                        React.createElement('div', { style: { maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 } },
                            (transaksiItems.length > 0 ? transaksiItems : modalData.items).map((item, idx) => React.createElement('div', { key: idx, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: idx < (transaksiItems.length > 0 ? transaksiItems.length - 1 : modalData.items.length - 1) ? '1px solid var(--border)' : 'none' } },
                                React.createElement('div', null,
                                    React.createElement('strong', null, item.grade || (selectedKandang?.jenis === 'layer' ? 'Telur' : 'Ayam')),
                                    React.createElement('span', { style: { marginLeft: 8, fontSize: 12 } }, item.kg, ' kg @ ', formatRupiah(item.hargaKg))
                                ),
                                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },
                                    React.createElement('span', { style: { fontWeight: 'bold' } }, formatRupiah(item.subtotal)),
                                    React.createElement('button', { type: 'button', onClick: () => { setEditingItemIndex(idx); setItemKg(item.kg.toString()); setItemHarga(item.hargaKg.toString()); }, className: 'btn-icon' }, React.createElement('i', { className: 'fas fa-edit' })),
                                    React.createElement('button', { type: 'button', onClick: () => setTransaksiItems(prev => prev.filter((_, i) => i !== idx)), className: 'btn-icon' }, React.createElement('i', { className: 'fas fa-trash' }))
                                )
                            ))
                        ),
                    React.createElement('div', { style: { marginTop: 12, textAlign: 'right', fontWeight: 'bold', fontSize: 16 } }, 'Total: ', formatRupiah(totalSementara))
                ),
                React.createElement('div', { className: 'form-group' }, 
                    React.createElement('label', { className: 'form-label' }, 'Catatan'), 
                    React.createElement('textarea', { name: 'catatan', className: 'form-input', rows: '2', defaultValue: modalData.catatan })
                )
            ),
            React.createElement('div', { className: 'modal-actions' },
                React.createElement('button', { type: 'submit', className: 'btn-primary' }, 'Update'),
                React.createElement('button', { type: 'button', className: 'btn-outline', onClick: () => { setShowModal(false); setTransaksiItems([]); setItemKg(''); setItemHarga(''); setEditingItemIndex(null); } }, 'Batal')
            )
        )
    );
}

// ==================== AKHIR EDIT MODALS ====================
};
 // ==================== MAIN RENDER ====================
        if (!initialized || isInitialLoading) {
            return React.createElement('div', { className: 'loading-overlay' }, React.createElement('div', { className: 'spinner' }));
        }
        
        return React.createElement('div', { className: 'mobile-container' },
            React.createElement('div', { className: 'toast-container' },
                toasts.map(function(toast) { return React.createElement('div', { key: toast.id, className: 'toast toast-' + toast.type },
                    React.createElement('i', { className: 'fas ' + (toast.type === 'success' ? 'fa-check-circle' : toast.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle') }),
                    React.createElement('div', { className: 'toast-content' }, React.createElement('strong', null, toast.title), React.createElement('p', null, toast.message)),
                    React.createElement('button', { className: 'toast-close', onClick: function() { setToasts(function(prev) { return prev.filter(function(t) { return t.id !== toast.id; }); }); } }, React.createElement('i', { className: 'fas fa-times' }))
                ); })
            ),
            React.createElement('div', { className: 'app-header' },
                React.createElement('div', { className: 'header-top' },
                    React.createElement('div', { className: 'header-title' }, 
                        React.createElement('h1', null, 'FasimCare+'), 
                        React.createElement('p', null, isAuthenticated ? (userProfile.farmName || 'Kandang Saya') : 'Manajemen Peternakan Ayam')
                    ),
                    isAuthenticated && React.createElement('div', { className: 'header-icons', style: { display: 'flex', gap: '8px', alignItems: 'center' } },
                        React.createElement('div', { className: 'header-icon-wrapper', style: { position: 'relative' } }, 
                            React.createElement('i', { className: 'fas fa-robot', onClick: function() { setShowAIChat(true); }, style: { width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s' } })
                        ),
                        React.createElement('div', { className: 'header-icon-wrapper', style: { position: 'relative' } }, 
                            React.createElement('i', { 
                                className: 'fas fa-store', 
                                onClick: function() {
                                    console.log("🛒 STORE CLICKED!");
                                    console.log("StoreApp:", typeof window.StoreApp);
                                    console.log("showStore before:", showStore);
                                    if (!window.StoreApp) {
                                        console.error("❌ StoreApp NOT loaded!");
                                        alert("Marketplace sedang dimuat, refresh halaman!");
                                        return;
                                    }
                                    setShowStore(true);
                                    console.log("showStore after set:", true);
                                    setTimeout(function() {
                                        console.log("After 100ms - showStore:", showStore);
                                    }, 100);
                                }, 
                                style: { 
                                    width: '40px', 
                                    height: '40px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    background: 'rgba(255,255,255,0.15)', 
                                    borderRadius: '50%', 
                                    cursor: 'pointer',
                                    pointerEvents: 'auto'
                                } 
                            })
                        ),
                        React.createElement('div', { className: 'header-icon-wrapper', style: { position: 'relative' }, onClick: function() { setShowNotifications(!showNotifications); } }, 
                            React.createElement('i', { className: 'fas fa-bell', style: { width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s' } }),
                            unreadCount > 0 && React.createElement('span', { className: 'notification-badge', style: { position: 'absolute', top: '-4px', right: '-6px', background: '#ef4444', color: 'white', fontSize: '10px', fontWeight: 'bold', minWidth: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', border: '1.5px solid white' } }, unreadCount),
                            showNotifications && renderNotificationPanel()
                        ),
                        React.createElement('div', { className: 'header-icon-wrapper', style: { position: 'relative' }, onClick: function() { setShowProfileMenu(!showProfileMenu); } }, 
                            React.createElement('i', { className: 'fas fa-user-circle', style: { width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.15)', borderRadius: '50%', cursor: 'pointer', transition: 'all 0.2s' } }),
                            showProfileMenu && renderProfileMenu()
                        )
                    )
                ),
                isAuthenticated && (
                    selectedKandang ? 
                        React.createElement(React.Fragment, null,
                            React.createElement('div', { className: 'farm-selector', style: { justifyContent: 'space-between' }, onClick: function() { 
                                if (kandangList.length === 0) { 
                                    setModalType('kandang'); 
                                    setShowModal(true); 
                                } else {
                                    setModalType('kandang_select'); 
                                    setShowModal(true); 
                                } 
                            }},
                                React.createElement('div', { style: { display: 'flex', alignItems: 'center', gap: 10 } },
                                    React.createElement('i', { className: 'fas fa-map-marker-alt' }),
                                    React.createElement('div', null, 
                                        React.createElement('span', null, selectedKandang ? selectedKandang.nama : ''), 
                                        React.createElement('span', { style: { fontSize: 11, display: 'block' } }, 
                                            (selectedKandang && selectedKandang.jenis === 'layer' ? 'Layer' : 'Broiler') + ' • ' + ((selectedKandang && selectedKandang.kapasitas) || 0) + ' ekor'
                                        )
                                    )
                                ),
                                React.createElement('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } },
                                    React.createElement('i', { className: 'fas fa-chevron-down' }),
                                    kandangList.length > 1 && React.createElement('i', { 
                                        className: 'fas fa-trash-alt', 
                                        style: { color: '#ef4444', cursor: 'pointer', fontSize: '14px' },
                                        onClick: function(e) {
                                            e.stopPropagation();
                                            if (!selectedKandang) {
                                                addNotification('warning', 'Error', 'Tidak ada kandang yang dipilih', 3000);
                                                return;
                                            }
                                            if (kandangList.length <= 1) {
                                                addNotification('warning', 'Tidak Bisa Hapus', 'Minimal harus ada 1 kandang', 3000);
                                                return;
                                            }
                                            setShowConfirm({ 
                                                show: true, 
                                                message: 'Hapus kandang "' + selectedKandang.nama + '"? Semua data (populasi, produksi, dll) akan ikut terhapus!', 
                                                onConfirm: function() {
                                                    handleDeleteItem('kandang', selectedKandang.id, selectedKandang.nama);
                                                } 
                                            });
                                        }
                                    })
                                )
                            ),
                            React.createElement('div', { className: 'nav-scroll-container' },
                                React.createElement('div', { className: 'bottom-nav-horizontal' },
                                    getNavItems().map(function(item) { 
                                        return React.createElement('div', { 
                                            key: item.id, 
                                            className: 'nav-item-horizontal ' + (activeTab === item.id ? 'active' : ''), 
                                            onClick: function() { setActiveTab(item.id); } 
                                        },
                                            React.createElement('i', { 
                                                className: item.icon, 
                                                style: { fontSize: '18px', display: 'block', marginBottom: '4px' } 
                                            }),
                                            React.createElement('span', { 
                                                style: { fontSize: '11px' } 
                                            }, item.label)
                                        );
                                    })
                                )
                            )
                        ) :
                        React.createElement('button', { 
                            className: 'btn-primary', 
                            style: { width: 'calc(100% - 32px)', margin: '12px 16px', padding: '12px' },
                            onClick: function() { setModalType('kandang'); setShowModal(true); }
                        }, 
                            React.createElement('i', { className: 'fas fa-plus' }), 
                            ' Buat Kandang Pertama'
                        )
                )
            ),
            React.createElement('div', { className: 'content' },
                !isAuthenticated ? renderWelcome() : React.createElement(React.Fragment, null,
                    activeTab === 'dashboard' && renderDashboard(),
                    activeTab === 'populasi' && renderPopulasi(),
                    activeTab === 'produksi' && renderProduksi(),
                    activeTab === 'pakan' && renderPakan(),
                    activeTab === 'kesehatan' && renderKesehatan(),
                    activeTab === 'vaksin' && renderVaksin(),
                    activeTab === 'transaksi' && renderTransaksi(),
                    activeTab === 'karyawan' && renderKaryawan(),
                    activeTab === 'keuangan' && renderKeuangan(),
                    activeTab === 'customer' && renderCustomer(),
                    activeTab === 'supplier' && renderSupplier(),
                    activeTab === 'slipgaji' && renderSlipGaji(),
                    activeTab === 'jadwal' && window.SchedulerFeature && 
    window.SchedulerFeature.renderSchedulePanel(featureContext),

activeTab === 'biaya' && window.BiayaProduksiFeature && 
    window.BiayaProduksiFeature.renderBiayaProduksi(featureContext)
                )
            ),
            // ========== TOMBOL KONSULTASI (KIRI BAWAH) ==========
            renderConsultationButton && renderConsultationButton(),
            // ========== TOMBOL FAB (KANAN BAWAH) ==========
            renderFABButton && renderFABButton(),
            renderFABPanel && renderFABPanel(),
             // ========== SHOPEE AFFILIATE FAB (Tombol terpisah, tidak mengganggu) ==========
window.ShopeeAffiliateFAB && React.createElement(window.ShopeeAffiliateFAB, { 
    key: "shopee-affiliate-fab",
    addNotification: addNotification,
    isAuthenticated: isAuthenticated
}),
        
            renderModalContent && renderModalContent(),
            renderSlipGajiModal && renderSlipGajiModal(),
            React.createElement(PremiumConfirm),
            renderAIChat && renderAIChat(),
            showStore && window.StoreApp && React.createElement(window.StoreApp, { 
                key: "store-app",
                user: userProfile, 
                onClose: function() { setShowStore(false); }, 
                addNotification: addNotification 
            }),
        
        // ========== MODAL SCHEDULER & BIAYA ==========
window.SchedulerFeature && window.SchedulerFeature.renderScheduleModal(featureContext),
window.BiayaProduksiFeature && window.BiayaProduksiFeature.renderBiayaModal(featureContext),
        
            // ========== MODAL KONSULTASI ==========
            renderConsultationModal && renderConsultationModal(),
            loading && React.createElement('div', { className: 'loading-overlay' }, React.createElement('div', { className: 'spinner' }))
        );
    };
    
    window.FasimCare = FasimCare;
    console.log('✅ FasimCare+ v2.1.0 Ready - ALL FEATURES WORKING');
    
    if (document.getElementById('root')) {
        setTimeout(function() {
            try {
                if (ReactDOM.createRoot) {
                    var root = ReactDOM.createRoot(document.getElementById('root'));
                    root.render(React.createElement(FasimCare));
                    console.log('✅ FasimCare+ rendered');
                } else {
                    ReactDOM.render(React.createElement(FasimCare), document.getElementById('root'));
                }
            } catch (error) {
                console.error('Render error:', error);
                document.getElementById('root').innerHTML = '<div style="padding:20px;text-align:center"><h3>Error loading app</h3><button onclick="location.reload()">Refresh</button></div>';
            }
        }, 100);
    }
})();