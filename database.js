// database.js - LocalStorage Database Manager for Koperasi Sekolah & Absensi

// Simple synchronous hashing helper
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return 'hash_' + Math.abs(hash).toString(16);
}

// Initial default data
const DEFAULT_DATA = {
    settings: {
        schoolName: "T.H.H.K Tegal",
        coopName: "KOPSISTA (KOPERASI SISWA THHK)",
        address: "Jl. Pendidikan No. 12, Tegal",
        phone: "(0283) 351234",
        logo: "school_logo.png",
        developerName: "Yanuar Evanto",
        developerBio: "Pengembang sistem KOPSISTA (KOPERASI SISWA THHK) & Absensi Siswa.",
        developerContact: "0812-3456-7890",
        developerSocial: "@yanuar_evanto"
    },
    users: [
        // ============ ADMIN ============
        {
            username: "Yanuar",
            passwordHash: hashPassword("12345678"),
            role: "admin",
            name: "Yanuar Evanto",
            jabatan: "Kepala Koperasi",
            photo: "",
            isActive: true
        },
        {
            username: "kepsek",
            passwordHash: hashPassword("kepsek123"),
            role: "admin",
            name: "Kepala Sekolah THHK",
            jabatan: "Kepala Sekolah",
            photo: "",
            isActive: true
        },

        // ============ PETUGAS KOPSIS INTI ============
        {
            username: "jeisen",
            passwordHash: hashPassword("738241"),
            role: "petugas_inti",
            name: "Jeisen",
            jabatan: "Petugas Kasir",
            photo: "",
            isActive: true
        },
        {
            username: "marquez",
            passwordHash: hashPassword("591064"),
            role: "petugas_inti",
            name: "Marquez",
            jabatan: "Petugas Kasir",
            photo: "",
            isActive: true
        },
        {
            username: "mikhaela",
            passwordHash: hashPassword("326817"),
            role: "petugas_inti",
            name: "Mikhaela",
            jabatan: "Petugas Kasir",
            photo: "",
            isActive: true
        },
        // ============ ANGGOTA KOPSIS ============
        // Anggota Kopsis dikelola manual melalui Panel Admin.
        {
            username: "agnel",
            passwordHash: hashPassword("847392"),
            role: "petugas_inti",
            name: "Agnel",
            jabatan: "Petugas Kasir",
            photo: "",
            isActive: true
        },
        {
            username: "calvin",
            passwordHash: hashPassword("103956"),
            role: "petugas_inti",
            name: "Calvin",
            jabatan: "Petugas Kasir",
            photo: "",
            isActive: true
        },
        // ============ SISWA (1 akun bersama) ============
        {
            username: "siswa",
            passwordHash: hashPassword("siswa123"),
            role: "siswa",
            studentId: null,
            name: "Siswa THHK",
            photo: "",
            isActive: true
        }
    ],
    students: [
        { id: "S001", name: "Ahmad Fauzi", class: "XI RPL 1", gender: "Laki-laki", phone: "081234567890", photo: "" },
        { id: "S002", name: "Siti Aminah", class: "XI RPL 1", gender: "Perempuan", phone: "081234567891", photo: "" },
        { id: "S003", name: "Budi Santoso", class: "XI RPL 2", gender: "Laki-laki", phone: "081234567892", photo: "" },
        { id: "S004", name: "Dewi Lestari", class: "X RPL 1", gender: "Perempuan", phone: "081234567893", photo: "" }
    ],
    products: [
        { id: "P001", name: "Buku Tulis Kiky", category: "Alat Tulis", price: 5000, costPrice: 4000, stock: 50, image: "" },
        { id: "P002", name: "Pulpen Pilot Black", category: "Alat Tulis", price: 3000, costPrice: 2200, stock: 35, image: "" },
        { id: "P003", name: "Penggaris Besi 30cm", category: "Alat Tulis", price: 7500, costPrice: 5500, stock: 15, image: "" },
        { id: "P004", name: "Pensil 2B Castell", category: "Alat Tulis", price: 2500, costPrice: 1800, stock: 40, image: "" },
        { id: "P005", name: "Dasi Sekolah SMA", category: "Atribut", price: 15000, costPrice: 12000, stock: 20, image: "" },
        { id: "P006", name: "Topi Sekolah SMA", category: "Atribut", price: 20000, costPrice: 16000, stock: 12, image: "" },
        { id: "P007", name: "Roti Sari Roti Srikaya", category: "Makanan", price: 6000, costPrice: 4800, stock: 10, image: "" },
        { id: "P008", name: "Teh Botol Sosro Sosro", category: "Minuman", price: 4000, costPrice: 3000, stock: 24, image: "" },
        { id: "P009", name: "Keripik Singkong (Titipan)", category: "Makanan", price: 5000, costPrice: 4000, stock: 15, image: "", isConsigned: true, consignmentId: "CON-001", studentId: "S001" }
    ],
    transactions: [
        {
            id: "TR-10001",
            date: "2026-06-22T08:30:00.000Z",
            studentId: "S001",
            studentName: "Ahmad Fauzi",
            items: [
                { productId: "P001", name: "Buku Tulis Kiky", quantity: 2, price: 5000, costPrice: 4000 },
                { productId: "P009", name: "Keripik Singkong (Titipan)", quantity: 1, price: 5000, costPrice: 4000 }
            ],
            totalAmount: 15000,
            totalProfit: 3000,
            cashierUsername: "Yanuar"
        },
        {
            id: "TR-10002",
            date: "2026-06-22T10:15:00.000Z",
            studentId: "S002",
            studentName: "Siti Aminah",
            items: [
                { productId: "P005", name: "Dasi Sekolah SMA", quantity: 1, price: 15000, costPrice: 12000 },
                { productId: "P008", name: "Teh Botol Sosro Sosro", quantity: 2, price: 4000, costPrice: 3000 }
            ],
            totalAmount: 23000,
            totalProfit: 5000,
            cashierUsername: "Yanuar"
        }
    ],
    attendance: [
        { date: "2026-06-22", studentId: "S001", status: "Hadir" },
        { date: "2026-06-22", studentId: "S002", status: "Hadir" },
        { date: "2026-06-22", studentId: "S003", status: "Izin" },
        { date: "2026-06-22", studentId: "S004", status: "Hadir" },
        { date: "2026-06-23", studentId: "S001", status: "Hadir" },
        { date: "2026-06-23", studentId: "S002", status: "Hadir" },
        { date: "2026-06-23", studentId: "S003", status: "Hadir" },
        { date: "2026-06-23", studentId: "S004", status: "Sakit" }
    ],
    auditLogs: [
        { id: "L-001", date: "2026-06-22T07:00:00.000Z", username: "System", role: "system", action: "Inisialisasi", details: "Database sistem Koperasi THHK dibuat pertama kali" },
        { id: "L-002", date: "2026-06-22T08:00:00.000Z", username: "Yanuar", role: "admin", action: "Login", details: "Admin Yanuar login ke sistem" },
        { id: "L-003", date: "2026-06-23T07:30:00.000Z", username: "siswa", role: "siswa", action: "Login", details: "Siswa Ahmad Fauzi login ke sistem" }
    ],
    consignments: [
        {
            id: "CON-001",
            productId: "P009",
            studentId: "S001",
            studentName: "Ahmad Fauzi",
            productName: "Keripik Singkong",
            category: "Makanan",
            costPrice: 4000,
            sellingPrice: 5000,
            consignedQty: 25,
            soldQty: 10,
            consignmentDate: "2026-06-22T08:00:00.000Z",
            status: "Aktif",
            payoutStatus: "Belum Dibayar"
        }
    ],
    consignmentSales: [
        {
            id: "CS-001",
            consignmentId: "CON-001",
            productId: "P009",
            productName: "Keripik Singkong",
            studentId: "S001",
            studentName: "Ahmad Fauzi",
            quantity: 9,
            sellingPrice: 5000,
            costPrice: 4000,
            earnings: 36000,
            coopProfit: 9000,
            date: "2026-06-22T08:45:00.000Z",
            transactionId: "TR-Manual"
        },
        {
            id: "CS-002",
            consignmentId: "CON-001",
            productId: "P009",
            productName: "Keripik Singkong",
            studentId: "S001",
            studentName: "Ahmad Fauzi",
            quantity: 1,
            sellingPrice: 5000,
            costPrice: 4000,
            earnings: 4000,
            coopProfit: 1000,
            date: "2026-06-22T08:30:00.000Z",
            transactionId: "TR-10001"
        }
    ],
    consignmentPayouts: [
        {
            id: "PAY-001",
            studentId: "S001",
            studentName: "Ahmad Fauzi",
            amount: 20000,
            payoutDate: "2026-06-22T15:00:00.000Z",
            details: "Pembayaran bagi hasil penjualan 5 unit awal"
        }
    ],
    financialAdjustments: [
        {
            id: "ADJ-001",
            date: "2026-06-22T16:00:00.000Z",
            type: "Kerugian",
            category: "Kerusakan Barang",
            amount: 12000,
            description: "2 botol Teh Botol pecah di gudang"
        },
        {
            id: "ADJ-002",
            date: "2026-06-23T09:00:00.000Z",
            type: "Keuntungan",
            category: "Operasional",
            amount: 25000,
            description: "Jasa print tugas siswa di koperasi"
        }
    ],
    petugasAttendance: [],
    petugasAttendanceRequests: [],
    schoolCalendar: [],
    consignmentRequests: []
};

// Gaji per pertemuan (bisa diubah admin)
const GAJI_PER_PERTEMUAN = 3000;

// Database class
class KoperasiDB {
    constructor() {
        this.storageKey = "koperasi_sekolah_db";
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify(DEFAULT_DATA));
        } else {
            // Migrasi otomatis: pastikan semua akun siswa terbaru ada di database
            this._migrateUserAccounts();
        }
    }

    _migrateUserAccounts() {
        const data = this.getData();
        let changed = false;

        if (!data.petugasAttendanceRequests) {
            data.petugasAttendanceRequests = [];
            changed = true;
        }
        if (!data.schoolCalendar) {
            data.schoolCalendar = [];
            changed = true;
        }
        if (!data.consignmentRequests) {
            data.consignmentRequests = [];
            changed = true;
        }

        // Re-seed siswa jika kosong (akibat localStorage lama / data hilang)
        if (!data.students || data.students.length === 0) {
            data.students = JSON.parse(JSON.stringify(DEFAULT_DATA.students));
            changed = true;
        }

        // Re-seed produk jika kosong (akibat localStorage lama / data hilang)
        if (!data.products || data.products.length === 0) {
            data.products = JSON.parse(JSON.stringify(DEFAULT_DATA.products));
            changed = true;
        }

        // Jangan hapus akun yang dibuat secara manual (misal Anggota Kopsis)
        // Kita hanya mengupdate data akun bawaan jika ada perubahan role

        // Tambahkan akun yang belum ada di database, dan update role dan nama yang berubah
        DEFAULT_DATA.users.forEach(reqUser => {
            const existingUserIndex = data.users.findIndex(u => u.username === reqUser.username);
            if (existingUserIndex === -1) {
                data.users.push({ ...reqUser });
                changed = true;
            } else {
                // Update role if changed
                if (data.users[existingUserIndex].role !== reqUser.role) {
                    data.users[existingUserIndex].role = reqUser.role;
                    changed = true;
                }
                // Update name if changed
                if (data.users[existingUserIndex].name !== reqUser.name) {
                    data.users[existingUserIndex].name = reqUser.name;
                    changed = true;
                }
            }
        });

        if (!data.settings.developerName) {
            data.settings.developerName = "Yanuar Evanto";
            data.settings.developerBio = "Pengembang sistem KOPSISTA (KOPERASI SISWA THHK) & Absensi Siswa.";
            data.settings.developerContact = "0812-3456-7890";
            data.settings.developerSocial = "@yanuar_evanto";
            changed = true;
        }

        if (data.settings.coopName === "Koperasi THHK" || !data.settings.coopName) {
            data.settings.coopName = "KOPSISTA (KOPERASI SISWA THHK)";
            data.settings.developerBio = "Pengembang sistem KOPSISTA (KOPERASI SISWA THHK) & Absensi Siswa.";
            changed = true;
        }


        if (changed) {
            this.saveData(data);
        }
    }

    getData() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : DEFAULT_DATA;
    }

    saveData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // AUTHENTICATION
    login(username, password) {
        const data = this.getData();
        const user = data.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.isActive !== false);
        if (!user) return { success: false, message: "Username tidak ditemukan atau dinonaktifkan." };
        
        const inputHash = hashPassword(password);
        if (user.passwordHash === inputHash) {
            this.addAuditLog(user.username, user.role, "Login", `Pengguna ${user.username} (${user.role}) berhasil login`);
            this.recordLoginHistory(user.username);
            return { success: true, user: { username: user.username, role: user.role, name: user.name, jabatan: user.jabatan || '', studentId: user.studentId, photo: user.photo } };
        }
        
        this.addAuditLog(username, "unknown", "Gagal Login", `Percobaan login gagal untuk username: ${username}`);
        return { success: false, message: "Password salah." };
    }

    recordLoginHistory(username) {
        const key = "koperasi_login_history";
        let history = JSON.parse(localStorage.getItem(key) || "[]");
        history.unshift({
            username: username,
            time: new Date().toISOString()
        });
        if (history.length > 50) history = history.slice(0, 50);
        localStorage.setItem(key, JSON.stringify(history));
    }

    getLoginHistory() {
        const key = "koperasi_login_history";
        return JSON.parse(localStorage.getItem(key) || "[]");
    }

    // USERS CRUD
    getUsers() {
        return this.getData().users;
    }

    addUser(userObj) {
        const data = this.getData();
        if (data.users.some(u => u.username.toLowerCase() === userObj.username.toLowerCase())) {
            return { success: false, message: "Username sudah digunakan!" };
        }
        userObj.passwordHash = hashPassword(userObj.password);
        delete userObj.password;
        data.users.push(userObj);
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Tambah Pengguna", `Menambahkan pengguna baru: ${userObj.username} (${userObj.role})`);
        return { success: true };
    }

    updateUser(username, updatedFields) {
        const data = this.getData();
        const userIdx = data.users.findIndex(u => u.username === username);
        if (userIdx === -1) return { success: false, message: "Pengguna tidak ditemukan." };

        if (updatedFields.password) {
            updatedFields.passwordHash = hashPassword(updatedFields.password);
            delete updatedFields.password;
        }

        data.users[userIdx] = { ...data.users[userIdx], ...updatedFields };
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Ubah Pengguna", `Mengubah data pengguna: ${username}`);
        return { success: true };
    }

    deleteUser(username) {
        if (username === "Yanuar") return { success: false, message: "Akun admin default tidak dapat dihapus!" };
        const data = this.getData();
        data.users = data.users.filter(u => u.username !== username);
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Hapus Pengguna", `Menghapus pengguna: ${username}`);
        return { success: true };
    }

    // STUDENTS CRUD
    getStudents() {
        return this.getData().students;
    }

    addStudent(studentObj) {
        const data = this.getData();
        if (data.students.some(s => s.id === studentObj.id)) {
            return { success: false, message: "ID Siswa sudah terdaftar!" };
        }
        data.students.push(studentObj);
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Tambah Siswa", `Menambahkan siswa baru: ${studentObj.name} (${studentObj.id})`);
        return { success: true };
    }

    updateStudent(id, updatedFields) {
        const data = this.getData();
        const idx = data.students.findIndex(s => s.id === id);
        if (idx === -1) return { success: false, message: "Siswa tidak ditemukan." };

        data.students[idx] = { ...data.students[idx], ...updatedFields };
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Ubah Siswa", `Mengubah data siswa: ${id} - ${data.students[idx].name}`);
        return { success: true };
    }

    deleteStudent(id) {
        const data = this.getData();
        const student = data.students.find(s => s.id === id);
        if (!student) return { success: false, message: "Siswa tidak ditemukan." };

        data.students = data.students.filter(s => s.id !== id);
        // Also disable user associated with this student
        data.users = data.users.filter(u => u.studentId !== id);
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Hapus Siswa", `Menghapus siswa: ${student.name} (${id})`);
        return { success: true };
    }

    // PRODUCTS CRUD
    getProducts() {
        return this.getData().products;
    }

    addProduct(prodObj) {
        const data = this.getData();
        if (data.products.some(p => p.id === prodObj.id)) {
            return { success: false, message: "ID Barang sudah digunakan!" };
        }
        data.products.push(prodObj);
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Tambah Barang", `Menambahkan barang baru: ${prodObj.name} (${prodObj.id})`);
        return { success: true };
    }

    updateProduct(id, updatedFields) {
        const data = this.getData();
        const idx = data.products.findIndex(p => p.id === id);
        if (idx === -1) return { success: false, message: "Barang tidak ditemukan." };

        data.products[idx] = { ...data.products[idx], ...updatedFields };
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Ubah Barang", `Mengubah data barang: ${data.products[idx].name} (${id})`);
        return { success: true };
    }

    updateStock(id, newStock) {
        const data = this.getData();
        const idx = data.products.findIndex(p => p.id === id);
        if (idx === -1) return { success: false, message: "Barang tidak ditemukan." };
        const oldStock = data.products[idx].stock;
        data.products[idx].stock = parseInt(newStock);
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Update Stok", `Mengubah stok ${data.products[idx].name} dari ${oldStock} ke ${newStock}`);
        return { success: true };
    }

    deleteProduct(id) {
        const data = this.getData();
        const prod = data.products.find(p => p.id === id);
        if (!prod) return { success: false, message: "Barang tidak ditemukan." };

        data.products = data.products.filter(p => p.id !== id);
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Hapus Barang", `Menghapus barang: ${prod.name} (${id})`);
        return { success: true };
    }

    // ATTENDANCE
    getAttendance() {
        return this.getData().attendance;
    }

    saveAttendance(date, attendanceList) {
        const data = this.getData();
        data.attendance = data.attendance.filter(a => a.date !== date);
        attendanceList.forEach(att => {
            data.attendance.push({ date, studentId: att.studentId, status: att.status, reason: att.reason || '' });
        });
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Simpan Absensi", `Mencatat absensi untuk tanggal ${date} (${attendanceList.length} siswa)`);
        return { success: true };
    }

    deleteStudentAttendanceRecord(date, studentId) {
        const data = this.getData();
        const before = data.attendance.length;
        data.attendance = data.attendance.filter(a => !(a.date === date && a.studentId === studentId));
        if (data.attendance.length === before) return { success: false, message: 'Data tidak ditemukan.' };
        this.saveData(data);
        this.addAuditLog("admin", "admin", "Hapus Absensi Siswa", `Menghapus absensi siswa ${studentId} tanggal ${date}`);
        return { success: true };
    }

    clearAttendanceForDate(date) {
        const data = this.getData();
        const count = data.attendance.filter(a => a.date === date).length;
        data.attendance = data.attendance.filter(a => a.date !== date);
        this.saveData(data);
        this.addAuditLog("admin", "admin", "Hapus Semua Absensi", `Menghapus ${count} data absensi tanggal ${date}`);
        return { success: true, count };
    }

    // SCHOOL CALENDAR (Masuk / Libur)
    getSchoolCalendar() {
        return this.getData().schoolCalendar || [];
    }

    getDayStatus(date) {
        const cal = this.getSchoolCalendar();
        const entry = cal.find(e => e.date === date);
        return entry || { date, status: 'Masuk', reason: '' };
    }

    setDayStatus(date, status, reason = '') {
        const data = this.getData();
        if (!data.schoolCalendar) data.schoolCalendar = [];
        const idx = data.schoolCalendar.findIndex(e => e.date === date);
        const entry = { date, status, reason };
        if (idx !== -1) {
            data.schoolCalendar[idx] = entry;
        } else {
            data.schoolCalendar.push(entry);
        }
        this.saveData(data);
        this.addAuditLog("admin", "admin", "Set Status Hari", `Tanggal ${date} ditandai: ${status}${reason ? ' (' + reason + ')' : ''}`);
        return { success: true };
    }

    getStudentAttendanceStats(studentId) {
        const data = this.getData();
        const records = data.attendance.filter(a => a.studentId === studentId);
        const stats = { Hadir: 0, Sakit: 0, Izin: 0, Alfa: 0, Total: records.length };
        records.forEach(r => {
            if (stats[r.status] !== undefined) stats[r.status]++;
        });
        return stats;
    }

    // TRANSACTIONS & POS
    getTransactions() {
        return this.getData().transactions;
    }

    _getCurrentShiftName() {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        const time = h * 60 + m;
        // Shift 1: 09:00-09:15 (540-555)
        // Shift 2: 11:35-11:50 (695-710)
        // Shift 3: 11:55-12:10 (715-730)
        if (time >= 540 && time <= 555) return 'Shift 1';
        if (time >= 695 && time <= 710) return 'Shift 2';
        if (time >= 715 && time <= 730) return 'Shift 3';
        return 'Di Luar Shift';
    }

    createTransaction(studentId, cartItems, cashierUsername) {
        const data = this.getData();
        const itemsDetail = [];
        let totalAmount = 0;
        let totalProfit = 0;

        for (const cartItem of cartItems) {
            const product = data.products.find(p => p.id === cartItem.productId);
            if (!product) return { success: false, message: `Barang dengan ID ${cartItem.productId} tidak ditemukan.` };
            if (product.stock < cartItem.quantity) {
                return { success: false, message: `Stok tidak mencukupi untuk barang: ${product.name}. Tersedia: ${product.stock}` };
            }
            
            product.stock -= cartItem.quantity;
            
            // Integrasi barang titipan siswa (konsinyasi)
            if (product.isConsigned) {
                const consignment = data.consignments.find(c => c.id === product.consignmentId);
                if (consignment) {
                    consignment.soldQty = (consignment.soldQty || 0) + cartItem.quantity;
                    
                    // Log penjualan titipan siswa
                    data.consignmentSales.push({
                        id: "CS-" + (data.consignmentSales.length + 1),
                        consignmentId: consignment.id,
                        productId: product.id,
                        productName: product.name,
                        studentId: consignment.studentId,
                        studentName: consignment.studentName,
                        quantity: cartItem.quantity,
                        sellingPrice: product.price,
                        costPrice: product.costPrice,
                        earnings: cartItem.quantity * product.costPrice,
                        coopProfit: cartItem.quantity * (product.price - product.costPrice),
                        date: new Date().toISOString(),
                        transactionId: "TR-" + (10000 + data.transactions.length + 1)
                    });
                }
            }
            
            const lineTotal = product.price * cartItem.quantity;
            const lineCost = product.costPrice * cartItem.quantity;
            const lineProfit = lineTotal - lineCost;

            itemsDetail.push({
                productId: product.id,
                name: product.name,
                quantity: cartItem.quantity,
                price: product.price,
                costPrice: product.costPrice
            });

            totalAmount += lineTotal;
            totalProfit += lineProfit;
        }

        let studentName = "Umum/Tamu";
        if (studentId) {
            const student = data.students.find(s => s.id === studentId);
            if (student) studentName = student.name;
        }

        const txId = "TX-" + Date.now();
        const currentShift = this._getCurrentShiftName();
        const newTx = {
            id: txId,
            date: new Date().toISOString(),
            shift: currentShift,
            cashier: cashierUsername,
            studentId: studentId || null,
            studentName: studentName,
            items: itemsDetail,
            totalAmount: totalAmount,
            totalProfit: totalProfit,
            cashierUsername: cashierUsername
        };

        data.transactions.push(newTx);
        this.saveData(data);
        this.addAuditLog(cashierUsername, "admin", "Transaksi Penjualan", `Transaksi ${newTx.id} senilai Rp ${totalAmount.toLocaleString('id-ID')} berhasil diproses`);
        
        return { success: true, transaction: newTx };
    }

    createShiftTransaction(dateStr, shiftName, items, cashierUsername) {
        const data = this.getData();
        if (!data.transactions) data.transactions = [];
        if (!data.consignmentSales) data.consignmentSales = [];
        
        let totalAmount = 0;
        let totalProfit = 0;
        const transactionItems = [];
        
        // Validate stock first
        for (const item of items) {
            const product = data.products.find(p => p.id === item.productId);
            if (!product) return { success: false, message: `Barang dengan ID ${item.productId} tidak ditemukan.` };
            if (product.stock < item.quantity) {
                return { success: false, message: `Stok tidak mencukupi untuk barang: ${product.name}.` };
            }
        }
        
        // Deduct stock and process
        for (const item of items) {
            const product = data.products.find(p => p.id === item.productId);
            product.stock -= item.quantity;
            
            // Consignment integration
            if (product.isConsigned) {
                const consignment = data.consignments.find(c => c.id === product.consignmentId);
                if (consignment) {
                    consignment.soldQty = (consignment.soldQty || 0) + item.quantity;
                    
                    // Log consignment sale
                    data.consignmentSales.push({
                        id: "CS-" + (data.consignmentSales.length + 1),
                        consignmentId: consignment.id,
                        productId: product.id,
                        productName: product.name,
                        studentId: consignment.studentId,
                        studentName: consignment.studentName,
                        quantity: item.quantity,
                        sellingPrice: product.price,
                        costPrice: product.costPrice,
                        earnings: item.quantity * product.costPrice,
                        coopProfit: item.quantity * (product.price - product.costPrice),
                        date: new Date(dateStr + 'T12:00:00').toISOString(),
                        transactionId: "TX-SHIFT-" + Date.now()
                    });
                }
            }
            
            const lineTotal = product.price * item.quantity;
            const lineCost = product.costPrice * item.quantity;
            const lineProfit = lineTotal - lineCost;
            
            totalAmount += lineTotal;
            totalProfit += lineProfit;
            
            transactionItems.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                costPrice: product.costPrice,
                quantity: item.quantity,
                total: lineTotal
            });
        }
        
        const txId = "TX-" + Date.now();
        const newTransaction = {
            id: txId,
            date: new Date(dateStr + 'T12:00:00').toISOString(),
            shift: shiftName,
            cashier: cashierUsername,
            studentId: null,
            studentName: "Umum/Tamu",
            items: transactionItems,
            totalAmount,
            totalProfit,
            cashierUsername
        };
        
        data.transactions.push(newTransaction);
        this.saveData(data);
        
        this.addAuditLog(cashierUsername, "petugas", "Penjualan Shift", 
            `Input manual penjualan ${shiftName} pada ${dateStr} sebesar Rp ${totalAmount.toLocaleString('id-ID')} berhasil disimpan`);
            
        return { success: true, transaction: newTransaction };
    }


    // AUDIT LOGS
    getAuditLogs() {
        return this.getData().auditLogs;
    }

    addAuditLog(username, role, action, details) {
        const data = this.getData();
        const newLog = {
            id: "L-" + String(data.auditLogs.length + 1).padStart(3, '0'),
            date: new Date().toISOString(),
            username,
            role,
            action,
            details
        };
        data.auditLogs.push(newLog);
        this.saveData(data);
    }

    // SETTINGS
    getSettings() {
        return this.getData().settings;
    }

    saveSettings(updatedSettings) {
        const data = this.getData();
        data.settings = { ...data.settings, ...updatedSettings };
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Ubah Pengaturan", "Mengubah pengaturan profil koperasi/sekolah");
        return { success: true };
    }

    // BACKUP & RESTORE
    exportDatabase() {
        const dataStr = localStorage.getItem(this.storageKey);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `backup_koperasi_${new Date().toISOString().slice(0,10)}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        this.addAuditLog("Yanuar", "admin", "Backup Database", "Melakukan ekspor/backup database sistem");
    }

    importDatabase(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (parsed.settings && parsed.users && parsed.products && parsed.transactions && parsed.attendance && parsed.auditLogs) {
                localStorage.setItem(this.storageKey, jsonString);
                this.addAuditLog("Yanuar", "admin", "Restore Database", "Melakukan impor/restore database sukses");
                return { success: true };
            }
            return { success: false, message: "Format file backup tidak valid. Kolom utama tidak ditemukan." };
        } catch (e) {
            return { success: false, message: "Gagal membaca file backup. Pastikan berkas berupa JSON valid." };
        }
    }

    // ============================================================
    // CONSIGNMENT (BARANG SISWA) CRUD
    // ============================================================
    getConsignments() {
        const data = this.getData();
        if (!data.consignments) data.consignments = [];
        return data.consignments;
    }

    addConsignment(consObj) {
        const data = this.getData();
        if (!data.consignments) data.consignments = [];
        if (!data.consignmentSales) data.consignmentSales = [];
        
        // Generate product ID and consignment ID
        const consId = "CON-" + String(data.consignments.length + 1).padStart(3, '0');
        const prodId = "P-CONS-" + String(data.products.length + 1).padStart(3, '0');
        
        consObj.id = consId;
        consObj.productId = prodId;
        consObj.soldQty = 0;
        consObj.status = "Aktif";
        consObj.payoutStatus = "Belum Dibayar";
        
        // Save to consignments table
        data.consignments.push(consObj);
        
        // Insert into products table as well, so POS kasir can see it
        data.products.push({
            id: prodId,
            name: consObj.productName + " (Titipan)",
            category: consObj.category,
            price: consObj.sellingPrice,
            costPrice: consObj.costPrice, // bagian siswa
            stock: consObj.consignedQty,
            image: "",
            isConsigned: true,
            consignmentId: consId,
            studentId: consObj.studentId
        });
        
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Tambah Barang Titipan", `Menitipkan ${consObj.productName} dari siswa ${consObj.studentName} sebanyak ${consObj.consignedQty} pcs`);
        return { success: true, consignment: consObj };
    }

    deleteConsignment(id) {
        const data = this.getData();
        const cons = data.consignments.find(c => c.id === id);
        if (!cons) return { success: false, message: "Barang titipan tidak ditemukan." };
        
        // Remove from consignments
        data.consignments = data.consignments.filter(c => c.id !== id);
        // Remove from products as well
        data.products = data.products.filter(p => p.id !== cons.productId);
        
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Hapus Barang Titipan", `Menghapus barang titipan ${cons.productName} (${id})`);
        return { success: true };
    }

    getConsignmentSales() {
        const data = this.getData();
        if (!data.consignmentSales) data.consignmentSales = [];
        return data.consignmentSales;
    }

    deleteConsignmentSale(saleId) {
        const data = this.getData();
        if (!data.consignmentSales) data.consignmentSales = [];
        
        const idx = data.consignmentSales.findIndex(s => s.id === saleId);
        if (idx === -1) return { success: false, message: "Riwayat penjualan tidak ditemukan." };
        
        const sale = data.consignmentSales[idx];
        
        // Cari barang titipan aktif terkait dan kurangi jumlah terjualnya
        const consignment = data.consignments.find(c => c.id === sale.consignmentId);
        if (consignment) {
            consignment.soldQty = Math.max(0, (consignment.soldQty || 0) - sale.quantity);
        }
        
        // Hapus penjualan dari array
        data.consignmentSales.splice(idx, 1);
        
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Hapus Penjualan Titipan", `Menghapus riwayat penjualan barang titipan ${sale.productName} (Sale ID: ${saleId})`);
        return { success: true };
    }


    getConsignmentPayouts() {
        const data = this.getData();
        if (!data.consignmentPayouts) data.consignmentPayouts = [];
        return data.consignmentPayouts;
    }

    settleStudentPayout(studentId, amount, details) {
        const data = this.getData();
        if (!data.consignmentPayouts) data.consignmentPayouts = [];
        
        const student = data.students.find(s => s.id === studentId);
        const name = student ? student.name : "Siswa";
        
        const payoutId = "PAY-" + String(data.consignmentPayouts.length + 1).padStart(3, '0');
        const newPayout = {
            id: payoutId,
            studentId: studentId,
            studentName: name,
            amount: parseInt(amount),
            payoutDate: new Date().toISOString(),
            details: details || "Pembayaran bagi hasil barang titipan"
        };
        
        data.consignmentPayouts.push(newPayout);
        
        // Update payoutStatus of student's consignments
        // For simplicity, mark all their unpaid consignments payoutStatus as "Lunas" or update them
        data.consignments.forEach(c => {
            if (c.studentId === studentId) {
                // If all sold units have been paid for
                const totalEarned = c.soldQty * c.costPrice;
                // We'll mark them as Lunas if we pay out
                c.payoutStatus = "Lunas";
            }
        });
        
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Bayar Bagi Hasil Siswa", `Menyerahkan uang bagi hasil ke ${name} sebesar Rp ${parseInt(amount).toLocaleString('id-ID')}`);
        return { success: true, payout: newPayout };
    }

    getConsignmentRequests() {
        const data = this.getData();
        if (!data.consignmentRequests) data.consignmentRequests = [];
        // Sort newest first
        return data.consignmentRequests.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    addConsignmentRequest(reqObj) {
        const data = this.getData();
        if (!data.consignmentRequests) data.consignmentRequests = [];
        
        const reqId = "REQ-CON-" + String(data.consignmentRequests.length + 1).padStart(3, '0');
        reqObj.id = reqId;
        reqObj.date = new Date().toISOString();
        reqObj.status = "Pending"; // Pending, Approved, Rejected
        
        data.consignmentRequests.push(reqObj);
        this.saveData(data);
        this.addAuditLog(reqObj.studentName, "siswa", "Pengajuan Titipan", `Mengajukan titipan barang: ${reqObj.productName} sebanyak ${reqObj.consignedQty} unit`);
        return { success: true, request: reqObj };
    }

    approveConsignmentRequest(requestId, approvedSellingPrice) {
        const data = this.getData();
        if (!data.consignmentRequests) data.consignmentRequests = [];
        
        const idx = data.consignmentRequests.findIndex(r => r.id === requestId);
        if (idx === -1) return { success: false, message: "Pengajuan tidak ditemukan." };
        
        const req = data.consignmentRequests[idx];
        req.status = "Approved";
        
        // Add to actual consignments (using addConsignment)
        const res = this.addConsignment({
            studentId: req.studentId,
            studentName: req.studentName,
            productName: req.productName,
            category: req.category,
            costPrice: req.costPrice,
            sellingPrice: approvedSellingPrice,
            consignedQty: req.consignedQty,
            consignmentDate: new Date().toISOString()
        });
        
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Setujui Titipan", `Menyetujui titipan barang: ${req.productName} dari ${req.studentName}`);
        return { success: true, consignment: res.consignment };
    }

    rejectConsignmentRequest(requestId, reason = '') {
        const data = this.getData();
        if (!data.consignmentRequests) data.consignmentRequests = [];
        
        const idx = data.consignmentRequests.findIndex(r => r.id === requestId);
        if (idx === -1) return { success: false, message: "Pengajuan tidak ditemukan." };
        
        const req = data.consignmentRequests[idx];
        req.status = "Rejected";
        req.rejectReason = reason;
        
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Tolak Titipan", `Menolak titipan barang: ${req.productName} dari ${req.studentName} karena: ${reason}`);
        return { success: true };
    }

    // ============================================================
    // FINANCIAL ADJUSTMENTS (UNTUNG/RUGI MANUAL)
    // ============================================================
    getFinancialAdjustments() {
        const data = this.getData();
        if (!data.financialAdjustments) data.financialAdjustments = [];
        // Sort by date descending
        return data.financialAdjustments.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    addFinancialAdjustment(adjObj) {
        const data = this.getData();
        if (!data.financialAdjustments) data.financialAdjustments = [];
        
        adjObj.id = "ADJ-" + String(data.financialAdjustments.length + 1).padStart(3, '0');
        data.financialAdjustments.push(adjObj);
        
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Pencatatan Keuangan Manual", `Mencatat ${adjObj.type} (${adjObj.category}) sebesar Rp ${adjObj.amount.toLocaleString('id-ID')} pada tanggal ${adjObj.date.slice(0, 10)}`);
        return { success: true, adjustment: adjObj };
    }

    deleteFinancialAdjustment(id) {
        const data = this.getData();
        const adj = data.financialAdjustments.find(a => a.id === id);
        if (!adj) return { success: false, message: "Catatan tidak ditemukan." };
        
        data.financialAdjustments = data.financialAdjustments.filter(a => a.id !== id);
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Hapus Catatan Keuangan", `Menghapus catatan keuangan ${id}`);
        return { success: true };
    }

    // ============================================================
    // ABSENSI PETUGAS KOPSIS + GAJI OTOMATIS
    // ============================================================
    getPetugasAttendance() {
        const data = this.getData();
        if (!data.petugasAttendance) data.petugasAttendance = [];
        return data.petugasAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    savePetugasAttendance(date, records) {
        // records: [{ username, name, status, signatureData }]
        const data = this.getData();
        if (!data.petugasAttendance) data.petugasAttendance = [];

        // Hapus record tanggal yg sama dulu (replace)
        data.petugasAttendance = data.petugasAttendance.filter(r => r.date !== date);

        records.forEach(rec => {
            const id = "PA-" + date.replace(/-/g, '') + "-" + rec.username;
            const userObj = data.users.find(u => u.username === rec.username);
            const isInti = userObj && userObj.role === 'petugas_inti';
            const gajiPertemuan = isInti ? 5000 : (data.settings.gajiPetugasPerPertemuan || GAJI_PER_PERTEMUAN);
            data.petugasAttendance.push({
                id,
                date,
                username: rec.username,
                name: rec.name,
                status: rec.status,           // 'Hadir' | 'Tidak Hadir'
                signatureData: rec.signatureData || null,
                gaji: rec.status === 'Hadir' ? gajiPertemuan : 0,
                recordedAt: new Date().toISOString()
            });
        });

        this.saveData(data);
        const hadirCount = records.filter(r => r.status === 'Hadir').length;
        this.addAuditLog("System", "admin", "Absensi Petugas",
            `Absensi petugas tanggal ${date}: ${hadirCount} hadir dari ${records.length} petugas`);
        return { success: true };
    }

    getPetugasSalaryReport() {
        const data = this.getData();
        if (!data.petugasAttendance) return [];
        const gajiPertemuan = data.settings.gajiPetugasPerPertemuan || GAJI_PER_PERTEMUAN;

        // Kelompokkan per username
        const summary = {};
        const petugasUsers = data.users.filter(u => u.role === 'petugas_inti' || u.role === 'anggota' || u.role === 'petugas');
        petugasUsers.forEach(u => {
            summary[u.username] = { username: u.username, name: u.name, totalHadir: 0, totalGaji: 0 };
        });

        data.petugasAttendance.forEach(rec => {
            if (!summary[rec.username]) {
                summary[rec.username] = { username: rec.username, name: rec.name, totalHadir: 0, totalGaji: 0 };
            }
            if (rec.status === 'Hadir') {
                const userObj = data.users.find(u => u.username === rec.username);
                const isInti = userObj && userObj.role === 'petugas_inti';
                const defaultGaji = isInti ? 5000 : (data.settings.gajiPetugasPerPertemuan || GAJI_PER_PERTEMUAN);
                summary[rec.username].totalHadir++;
                summary[rec.username].totalGaji += (rec.gaji !== undefined ? rec.gaji : defaultGaji);
            }
        });

        return Object.values(summary);
    }

    deletePetugasAttendanceDate(date) {
        const data = this.getData();
        if (!data.petugasAttendance) return { success: false };
        data.petugasAttendance = data.petugasAttendance.filter(r => r.date !== date);
        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Hapus Absensi Petugas", `Menghapus data absensi petugas tanggal ${date}`);
        return { success: true };
    }

    getPetugasAttendanceRequests() {
        const data = this.getData();
        if (!data.petugasAttendanceRequests) data.petugasAttendanceRequests = [];
        return data.petugasAttendanceRequests.filter(r => r.approvalStatus === 'Pending').sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
    }

    submitShiftDeposit(username, shiftName, realAmount) {
        const data = this.getData();
        if (!data.shiftDeposits) data.shiftDeposits = [];
        const todayStr = new Date().toISOString().split('T')[0];
        
        // Cek apakah sudah ada setoran untuk shift yang sama di hari yang sama
        const existingIdx = data.shiftDeposits.findIndex(d => d.date === todayStr && d.shift === shiftName && d.username === username);
        if (existingIdx !== -1) {
            data.shiftDeposits[existingIdx].realAmount = realAmount;
            data.shiftDeposits[existingIdx].updatedAt = new Date().toISOString();
        } else {
            data.shiftDeposits.push({
                date: todayStr,
                shift: shiftName,
                username,
                realAmount,
                submittedAt: new Date().toISOString()
            });
        }
        this.saveData(data);
        return { success: true };
    }

    getShiftDeposits(date) {
        const data = this.getData();
        if (!data.shiftDeposits) return [];
        return data.shiftDeposits.filter(d => d.date === date);
    }

    submitPetugasAttendanceRequest(date, username, name, status, reason, signatureData) {
        const data = this.getData();
        if (!data.petugasAttendanceRequests) data.petugasAttendanceRequests = [];

        const reqId = "REQ-" + username + "-" + date.replace(/-/g, '');
        
        // Hapus data pengajuan hari yang sama jika ada sebelumnya
        data.petugasAttendanceRequests = data.petugasAttendanceRequests.filter(r => !(r.date === date && r.username === username));

        data.petugasAttendanceRequests.push({
            id: reqId,
            date,
            username,
            name,
            status, // 'Hadir' | 'Tidak Hadir'
            reason,
            signatureData: status === 'Hadir' ? signatureData : null,
            submittedAt: new Date().toISOString(),
            approvalStatus: 'Pending'
        });

        this.saveData(data);
        this.addAuditLog(username, "petugas", "Kirim Absensi", `Mengajukan absensi ${status} untuk tanggal ${date}`);
        return { success: true };
    }

    approvePetugasAttendanceRequest(requestId) {
        const data = this.getData();
        if (!data.petugasAttendanceRequests) data.petugasAttendanceRequests = [];
        if (!data.petugasAttendance) data.petugasAttendance = [];

        const reqIdx = data.petugasAttendanceRequests.findIndex(r => r.id === requestId);
        if (reqIdx === -1) return { success: false, message: "Pengajuan tidak ditemukan." };

        const req = data.petugasAttendanceRequests[reqIdx];
        
        // Simpan ke petugasAttendance resmi (Hapus data lama jika ada)
        data.petugasAttendance = data.petugasAttendance.filter(r => !(r.date === req.date && r.username === req.username));
        
        const id = "PA-" + req.date.replace(/-/g, '') + "-" + req.username;
        const userObj = data.users.find(u => u.username === req.username);
        const isInti = userObj && userObj.role === 'petugas_inti';
        const gajiPertemuan = isInti ? 5000 : (data.settings.gajiPetugasPerPertemuan || GAJI_PER_PERTEMUAN);

        data.petugasAttendance.push({
            id,
            date: req.date,
            username: req.username,
            name: req.name,
            status: req.status,
            reason: req.reason,
            signatureData: req.signatureData,
            gaji: req.status === 'Hadir' ? gajiPertemuan : 0,
            recordedAt: new Date().toISOString()
        });

        // Hapus request dari antrean pending
        data.petugasAttendanceRequests.splice(reqIdx, 1);

        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Setujui Absensi", `Menyetujui absensi ${req.status} petugas ${req.name} pada ${req.date}`);
        return { success: true };
    }

    rejectPetugasAttendanceRequest(requestId) {
        const data = this.getData();
        if (!data.petugasAttendanceRequests) data.petugasAttendanceRequests = [];

        const reqIdx = data.petugasAttendanceRequests.findIndex(r => r.id === requestId);
        if (reqIdx === -1) return { success: false, message: "Pengajuan tidak ditemukan." };

        const req = data.petugasAttendanceRequests[reqIdx];

        // Hapus dari antrean
        data.petugasAttendanceRequests.splice(reqIdx, 1);

        this.saveData(data);
        this.addAuditLog("Yanuar", "admin", "Tolak Absensi", `Menolak absensi ${req.status} petugas ${req.name} pada ${req.date}`);
        return { success: true };
    }
}

// Export single instance globally
window.db = new KoperasiDB();
window.GAJI_PER_PERTEMUAN = GAJI_PER_PERTEMUAN;
