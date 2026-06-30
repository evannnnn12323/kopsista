// app.js - Main Application Logic for Koperasi Sekolah & Absensi

// App State
let state = {
    currentUser: null,
    activeView: 'login',
    activeTab: 'dashboard',
    cart: [],
    idleTimer: null,
    charts: {}
};

// Auto-Logout Inactivity limit (30 minutes)
const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30 minutes in ms

function safeCreateIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        try {
            window.lucide.createIcons();
        } catch (e) {
            console.error("Lucide icons error:", e);
        }
    }
}

// DOM Elements
const views = {
    login: document.getElementById('view-login'),
    admin: document.getElementById('view-admin'),
    siswa: document.getElementById('view-siswa')
};

// Toast Notifications Helper
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'check-circle';
    if (type === 'error') icon = 'x-circle';
    if (type === 'warning') icon = 'alert-triangle';
    if (type === 'info') icon = 'info';

    toast.innerHTML = `
        <i data-lucide="${icon}"></i>
        <div class="toast-message">${message}</div>
    `;
    
    container.appendChild(toast);
    safeCreateIcons();

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeIn 0.3s ease-out reverse forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Session Timeout Management
function resetIdleTimer() {
    clearTimeout(state.idleTimer);
    if (state.currentUser) {
        state.idleTimer = setTimeout(handleAutoLogout, INACTIVITY_LIMIT);
    }
}

function handleAutoLogout() {
    showToast("Anda telah otomatis logout karena tidak aktif selama 30 menit.", "warning");
    logout();
}

// Setup activity listeners
['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'].forEach(evt => {
    document.addEventListener(evt, resetIdleTimer, true);
});

// Real-time Date and Time
function updateClock() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('id-ID', options);
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    const loginClock = document.getElementById('login-realtime-clock');
    const adminClock = document.getElementById('admin-realtime-clock');
    const siswaClock = document.getElementById('siswa-realtime-clock');

    if (loginClock) loginClock.innerHTML = `${dateStr} - ${timeStr}`;
    if (adminClock) adminClock.innerHTML = `<i data-lucide="clock" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></i> ${dateStr} | ${timeStr}`;
    if (siswaClock) siswaClock.innerHTML = `<i data-lucide="clock" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 4px;"></i> ${dateStr} | ${timeStr}`;
    
    // Quick Lucide refresh if clock elements re-rendered
    if (adminClock || siswaClock) safeCreateIcons();
}
setInterval(updateClock, 1000);
updateClock();

// SPA View Management
function navigateTo(viewName) {
    state.activeView = viewName;
    
    // Hide all views
    Object.keys(views).forEach(v => {
        views[v].classList.remove('active');
    });
    
    // Show selected view
    views[viewName].classList.add('active');
    
    if (viewName === 'login') {
        state.currentUser = null;
        clearTimeout(state.idleTimer);
        document.getElementById('login-password').value = '';
    } else {
        resetIdleTimer();
        renderHeaderProfile();
    }
}

function renderHeaderProfile() {
    const user = state.currentUser;
    const nameElements = document.querySelectorAll('.header-user-name');
    const roleElements = document.querySelectorAll('.header-user-role');
    const avatarElements = document.querySelectorAll('.header-user-avatar');
    
    const avatarUrl = user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';

    nameElements.forEach(el => el.textContent = user.name || user.username);
    
    let roleLabel = 'Siswa';
    if (user.role === 'admin') roleLabel = 'Administrator';
    else if (user.role === 'petugas_inti') roleLabel = 'Petugas Kopsis Inti';
    else if (user.role === 'anggota') roleLabel = 'Anggota Kopsis';
    else if (user.role === 'petugas') roleLabel = user.jabatan || 'Petugas Kopsis';
    roleElements.forEach(el => el.textContent = roleLabel);
    
    avatarElements.forEach(el => el.setAttribute('src', avatarUrl));

    // Tampilkan/sembunyikan menu sidebar sesuai hak akses petugas
    if (user.role === 'petugas' || user.role === 'petugas_inti' || user.role === 'anggota') {
        const allowed = ['pos', 'products', 'students', 'attendance', 'petugas-attendance', 'consignment'];
        if (user.role === 'petugas_inti') allowed.push('endofday');
        document.querySelectorAll('#view-admin .sidebar-item').forEach(item => {
            const link = item.querySelector('.sidebar-link[data-tab]');
            if (link) {
                const tab = link.getAttribute('data-tab');
                if (allowed.includes(tab)) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                }
            }
        });
        // Sembunyikan menu-category yang tidak diperlukan petugas
        // Kategori "Laporan & Audit" hanya untuk petugas_inti dan admin
        const sidebarMenu = document.querySelector('#view-admin .sidebar-menu');
        if (sidebarMenu) {
            const allItems = Array.from(sidebarMenu.children);
            allItems.forEach((li, idx) => {
                if (li.classList.contains('menu-category')) {
                    // Cek apakah ada minimal 1 sidebar-item yang tampil setelah kategori ini
                    let hasVisibleChild = false;
                    for (let i = idx + 1; i < allItems.length; i++) {
                        if (allItems[i].classList.contains('menu-category')) break;
                        if (allItems[i].classList.contains('sidebar-item') && allItems[i].style.display !== 'none') {
                            hasVisibleChild = true;
                            break;
                        }
                    }
                    li.style.display = hasVisibleChild ? '' : 'none';
                }
            });
        }
        // Update sidebar label
        const sidebarLabel = document.getElementById('sidebar-role-label');
        if (sidebarLabel) sidebarLabel.textContent = user.role === 'petugas_inti' ? 'Panel Petugas Inti' : (user.role === 'anggota' ? 'Panel Anggota' : 'Panel Petugas');
    } else {
        // Tampilkan semua menu untuk admin
        document.querySelectorAll('#view-admin .sidebar-item').forEach(item => {
            item.style.display = '';
        });
        // Tampilkan semua menu-category juga
        document.querySelectorAll('#view-admin .menu-category').forEach(cat => {
            cat.style.display = '';
        });
        const sidebarLabel = document.getElementById('sidebar-role-label');
        if (sidebarLabel) sidebarLabel.textContent = 'Panel Admin';
    }
}

// Sidebars Navigation
function setupNavigation() {
    // Admin Sidebar
    document.querySelectorAll('#view-admin .sidebar-link').forEach(link => {
        link.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchAdminTab(tabName);
        });
    });

    // Siswa Navbar
    document.querySelectorAll('#view-siswa .siswa-nav-link').forEach(link => {
        link.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchSiswaTab(tabName);
        });
    });
}

function switchAdminTab(tabName) {
    // Petugas tidak boleh mengakses tab admin-only
    const user = state.currentUser;
    const isPetugas = user && (user.role === 'petugas' || user.role === 'petugas_inti' || user.role === 'anggota');
    const petugasAllowed = ['pos', 'products', 'students', 'attendance', 'petugas-attendance', 'consignment'];
    if (user && user.role === 'petugas_inti') petugasAllowed.push('endofday');
    
    if (isPetugas && !petugasAllowed.includes(tabName)) {
        showToast('Anda tidak memiliki akses ke menu ini.', 'error');
        tabName = 'pos'; // Redirect ke POS
    }

    // Pengecekan jam operasional untuk menu Katalog & Stok Barang (products)
    if (isPetugas && tabName === 'products') {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        const time = h * 60 + m;
        // Pagi 06:00-08:30 (360-510), Sore 15:00-18:00 (900-1080)
        const isMorning = time >= 360 && time <= 510;
        const isEvening = time >= 900 && time <= 1080;
        
        if (!isMorning && !isEvening) {
            showToast('Akses Katalog & Stok Barang hanya dibuka pada jam 06:00-08:30 dan 15:00-18:00.', 'error');
            tabName = 'pos';
        }
    }

    state.activeTab = tabName;
    
    // Toggle active link
    document.querySelectorAll('#view-admin .sidebar-item').forEach(item => {
        item.classList.remove('active');
        if (item.querySelector(`.sidebar-link[data-tab="${tabName}"]`)) {
            item.classList.add('active');
        }
    });

    // Toggle active page
    document.querySelectorAll('#view-admin .dashboard-page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`admin-page-${tabName}`).classList.add('active');

    // Run tab specific renders
    const renderMap = {
        'dashboard': renderAdminDashboard,
        'users': renderUsersTab,
        'students': renderStudentsTab,
        'attendance': renderAttendanceTab,
        'petugas-attendance': renderPetugasAttendanceTab,
        'products': renderProductsTab,
        'pos': renderPOSTab,
        'endofday': renderEndOfDayTab,
        'consignment': renderConsignmentTab,
        'reports': renderReportsTab,
        'logs': renderLogsTab,
        'settings': renderSettingsTab,
    };
    if (renderMap[tabName]) {
        try {
            renderMap[tabName]();
        } catch(e) {
            console.error('Error rendering tab', tabName, e);
            document.getElementById(`admin-page-${tabName}`).innerHTML =
                `<div style="padding:2rem; color:red; background:#fff3f3; border-radius:8px; margin:1rem;">
                    <strong>⚠️ Terjadi error saat memuat halaman ini:</strong><br><pre style="font-size:0.8rem;white-space:pre-wrap;">${e.message}</pre>
                </div>`;
        }
    }
}

function switchSiswaTab(tabName) {
    state.activeTab = tabName;
    
    // Toggle active link
    document.querySelectorAll('#view-siswa .siswa-nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-tab') === tabName) {
            link.classList.add('active');
        }
    });

    // Toggle active page
    document.querySelectorAll('#view-siswa .dashboard-page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`siswa-page-${tabName}`).classList.add('active');

    // Run tab specific renders
    if (tabName === 'catalog') renderSiswaCatalog();
    else if (tabName === 'history') renderSiswaHistory();
    else if (tabName === 'consignment') renderSiswaConsignment();
    else if (tabName === 'attendance') renderSiswaAttendance();
    else if (tabName === 'profile') renderSiswaProfile();
}

// ================= ADMIN FUNCTIONS =================

// 1. ADMIN DASHBOARD OVERVIEW
function renderAdminDashboard() {
    const products = window.db.getProducts();
    const students = window.db.getStudents();
    const txs = window.db.getTransactions();
    const logs = window.db.getAuditLogs();
    
    // Calculate stats
    const today = new Date().toISOString().slice(0, 10);
    const todayTxs = txs.filter(t => t.date.startsWith(today));
    const todaySales = todayTxs.reduce((sum, t) => sum + t.totalAmount, 0);
    
    document.getElementById('stat-sales-today').textContent = `Rp ${todaySales.toLocaleString('id-ID')}`;
    document.getElementById('stat-total-students').textContent = students.length;
    document.getElementById('stat-total-products').textContent = products.length;
    
    const lowStockCount = products.filter(p => p.stock <= 5).length;
    const lowStockBadge = document.getElementById('stat-low-stock');
    lowStockBadge.textContent = lowStockCount;
    if (lowStockCount > 0) {
        lowStockBadge.className = 'stat-icon-box orange';
        lowStockBadge.style.color = 'var(--danger)';
    } else {
        lowStockBadge.className = 'stat-icon-box green';
    }

    // Render low stock warning list
    const lowStockList = document.getElementById('dashboard-low-stock-list');
    const lowProducts = products.filter(p => p.stock <= 8);
    if (lowProducts.length === 0) {
        lowStockList.innerHTML = '<div style="color: var(--gray-500); padding: 1rem; text-align: center;">Semua stok barang aman.</div>';
    } else {
        lowStockList.innerHTML = lowProducts.map(p => `
            <div class="cart-item-row" style="grid-template-columns: 1fr auto; border-bottom: 1px solid var(--gray-100);">
                <div>
                    <div class="cart-item-name" style="font-weight: 700;">${p.name}</div>
                    <small style="color: var(--gray-500)">Kategori: ${p.category}</small>
                </div>
                <span class="badge ${p.stock <= 3 ? 'absent' : 'permission'}" style="font-weight:700;">Sisa: ${p.stock}</span>
            </div>
        `).join('');
    }

    // Recent activity logs
    const recentLogs = document.getElementById('dashboard-recent-logs');
    const lastLogs = logs.slice(-5).reverse();
    recentLogs.innerHTML = lastLogs.map(l => {
        const time = new Date(l.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        return `
            <div style="padding: 0.75rem 0; border-bottom: 1px solid var(--gray-100); display: flex; gap: 0.75rem; font-size: 0.85rem;">
                <span style="color: var(--primary-dark); font-weight:700; min-width: 45px;">${time}</span>
                <div>
                    <span style="font-weight:700;">${l.username}</span> ${l.details}
                </div>
            </div>
        `;
    }).join('');

    // Muat antrean persetujuan absensi petugas
    renderAttendanceApprovals();
}

function renderAttendanceApprovals() {
    const requests = window.db.getPetugasAttendanceRequests();
    const card = document.getElementById('dashboard-attendance-approvals-card');
    const tbody = document.getElementById('dashboard-attendance-approvals-body');
    const badge = document.getElementById('pa-approval-badge');

    if (!card || !tbody || !badge) return;

    if (requests.length === 0) {
        card.style.display = 'none';
        return;
    }

    card.style.display = 'block';
    badge.textContent = requests.length;

    tbody.innerHTML = requests.map(r => {
        let sigHtml = '-';
        if (r.signatureData) {
            sigHtml = `<img src="${r.signatureData}" alt="Tanda Tangan" style="height:35px; border:1px solid var(--gray-200); border-radius:4px; background:#fff; padding:1px;">`;
        }

        const badgeClass = r.status === 'Hadir' ? 'present' : 'absent';

        return `
            <tr data-request-id="${r.id}">
                <td><small>${new Date(r.date).toLocaleDateString('id-ID')}</small></td>
                <td><strong>${r.name}</strong></td>
                <td><code>${r.username}</code></td>
                <td><span class="badge ${badgeClass}">${r.status}</span></td>
                <td>${r.reason || '-'}</td>
                <td>${sigHtml}</td>
                <td>
                    <button class="btn-success" style="padding:0.25rem 0.5rem; font-size:0.75rem; display:inline-flex; align-items:center; gap:0.25rem;" onclick="approvePaRequest('${r.id}')">
                        Setujui
                    </button>
                    <button class="btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem; display:inline-flex; align-items:center; gap:0.25rem;" onclick="rejectPaRequest('${r.id}')">
                        Tolak
                    </button>
                </td>
            </tr>
        `;
    }).join('');
    
    safeCreateIcons();
}

window.approvePaRequest = function(requestId) {
    const res = window.db.approvePetugasAttendanceRequest(requestId);
    if (res.success) {
        showToast("Absensi petugas disetujui.");
        renderAdminDashboard();
    } else {
        showToast(res.message, "error");
    }
};

window.rejectPaRequest = function(requestId) {
    if (confirm("Apakah Anda yakin ingin menolak pengajuan absensi ini?")) {
        const res = window.db.rejectPetugasAttendanceRequest(requestId);
        if (res.success) {
            showToast("Absensi petugas ditolak.");
            renderAdminDashboard();
        } else {
            showToast(res.message, "error");
        }
    }
}

// 2. USER ACCOUNTS TAB
function renderUsersTab() {
    const users = window.db.getUsers();
    const tbody = document.getElementById('users-table-body');
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>
                <div style="display:flex; align-items:center; gap: 0.5rem;">
                    <img src="${u.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=50'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                    <strong>${u.name || u.username}</strong>
                </div>
            </td>
            <td><code>${u.username}</code></td>
            <td><span class="badge ${u.role}">${u.role}</span></td>
            <td><span class="badge ${u.isActive !== false ? 'active' : 'inactive'}">${u.isActive !== false ? 'Aktif' : 'Nonaktif'}</span></td>
            <td>
                <button class="btn-action-icon edit" onclick="openEditUserModal('${u.username}')" title="Edit Akun"><i data-lucide="edit-3"></i></button>
                <button class="btn-action-icon delete" onclick="deleteUserAccount('${u.username}')" title="Hapus Akun"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>
    `).join('');
    safeCreateIcons();
}

window.openAddUserModal = function() {
    const modal = document.getElementById('modal-user');
    document.getElementById('modal-user-title').textContent = "Tambah Akun Pengguna";
    document.getElementById('user-form-mode').value = "add";
    document.getElementById('user-username').disabled = false;
    
    // Clear fields
    document.getElementById('user-username').value = '';
    document.getElementById('user-name').value = '';
    document.getElementById('user-password').value = '';
    document.getElementById('user-role').value = 'siswa';
    document.getElementById('user-status').value = 'true';
    document.getElementById('user-student-id-wrapper').style.display = 'block';
    
    // Populate student select
    const students = window.db.getStudents();
    const select = document.getElementById('user-student-id');
    select.innerHTML = '<option value="">-- Hubungkan dengan Siswa --</option>' + 
        students.map(s => `<option value="${s.id}">${s.name} (${s.id})</option>`).join('');

    modal.classList.add('active');
};

window.openEditUserModal = function(username) {
    const user = window.db.getUsers().find(u => u.username === username);
    if (!user) return;

    const modal = document.getElementById('modal-user');
    document.getElementById('modal-user-title').textContent = `Edit Akun: ${username}`;
    document.getElementById('user-form-mode').value = "edit";
    document.getElementById('user-username').value = user.username;
    document.getElementById('user-username').disabled = true;
    document.getElementById('user-name').value = user.name || '';
    document.getElementById('user-password').value = ''; // Leave blank if not changing
    document.getElementById('user-role').value = user.role;
    document.getElementById('user-status').value = String(user.isActive !== false);

    // Populate student select
    const students = window.db.getStudents();
    const select = document.getElementById('user-student-id');
    select.innerHTML = '<option value="">-- Hubungkan dengan Siswa --</option>' + 
        students.map(s => `<option value="${s.id}" ${user.studentId === s.id ? 'selected' : ''}>${s.name} (${s.id})</option>`).join('');

    if (user.role === 'siswa') {
        document.getElementById('user-student-id-wrapper').style.display = 'block';
    } else {
        document.getElementById('user-student-id-wrapper').style.display = 'none';
    }

    modal.classList.add('active');
};

document.getElementById('user-role').addEventListener('change', function() {
    if (this.value === 'siswa') {
        document.getElementById('user-student-id-wrapper').style.display = 'block';
    } else {
        document.getElementById('user-student-id-wrapper').style.display = 'none';
    }
});

window.saveUserForm = function() {
    const mode = document.getElementById('user-form-mode').value;
    const username = document.getElementById('user-username').value.trim();
    const name = document.getElementById('user-name').value.trim();
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;
    const studentId = role === 'siswa' ? document.getElementById('user-student-id').value : '';
    const isActive = document.getElementById('user-status').value === 'true';

    if (!username || !name) {
        showToast("Username dan Nama harus diisi!", "error");
        return;
    }

    if (mode === 'add') {
        if (!password) {
            showToast("Password untuk pengguna baru harus diisi!", "error");
            return;
        }
        const res = window.db.addUser({ username, name, password, role, studentId, isActive, photo: "" });
        if (res.success) {
            showToast("Akun berhasil ditambahkan.");
            closeModal('modal-user');
            renderUsersTab();
        } else {
            showToast(res.message, "error");
        }
    } else {
        const fields = { name, role, studentId, isActive };
        if (password) fields.password = password; // Only update password if input
        const res = window.db.updateUser(username, fields);
        if (res.success) {
            showToast("Akun berhasil diubah.");
            closeModal('modal-user');
            renderUsersTab();
        } else {
            showToast(res.message, "error");
        }
    }
};

window.deleteUserAccount = function(username) {
    if (confirm(`Apakah Anda yakin ingin menghapus akun '${username}'?`)) {
        const res = window.db.deleteUser(username);
        if (res.success) {
            showToast("Akun berhasil dihapus.");
            renderUsersTab();
        } else {
            showToast(res.message, "error");
        }
    }
};

// 3. STUDENT MANAGEMENT TAB
function renderStudentsTab() {
    const students = window.db.getStudents();
    const tbody = document.getElementById('students-table-body');
    tbody.innerHTML = students.map(s => `
        <tr>
            <td><strong>${s.id}</strong></td>
            <td>
                <div style="display:flex; align-items:center; gap: 0.5rem;">
                    <img src="${s.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=50'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                    <span>${s.name}</span>
                </div>
            </td>
            <td>${s.class}</td>
            <td>${s.gender}</td>
            <td>${s.phone || '-'}</td>
            <td>
                <button class="btn-action-icon edit" onclick="openEditStudentModal('${s.id}')" title="Edit Siswa"><i data-lucide="edit-3"></i></button>
                <button class="btn-action-icon delete" onclick="deleteStudentData('${s.id}')" title="Hapus Siswa"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>
    `).join('');
    safeCreateIcons();
}

window.openAddStudentModal = function() {
    const modal = document.getElementById('modal-student');
    document.getElementById('modal-student-title').textContent = "Tambah Data Siswa";
    document.getElementById('student-form-mode').value = "add";
    document.getElementById('student-id').disabled = false;
    
    document.getElementById('student-id').value = '';
    document.getElementById('student-name').value = '';
    document.getElementById('student-class').value = 'X RPL 1';
    document.getElementById('student-gender').value = 'Laki-laki';
    document.getElementById('student-phone').value = '';

    modal.classList.add('active');
};

window.openEditStudentModal = function(id) {
    const student = window.db.getStudents().find(s => s.id === id);
    if (!student) return;

    const modal = document.getElementById('modal-student');
    document.getElementById('modal-student-title').textContent = `Edit Siswa: ${id}`;
    document.getElementById('student-form-mode').value = "edit";
    document.getElementById('student-id').value = student.id;
    document.getElementById('student-id').disabled = true;
    document.getElementById('student-name').value = student.name;
    document.getElementById('student-class').value = student.class;
    document.getElementById('student-gender').value = student.gender;
    document.getElementById('student-phone').value = student.phone || '';

    modal.classList.add('active');
};

window.saveStudentForm = function() {
    const mode = document.getElementById('student-form-mode').value;
    const id = document.getElementById('student-id').value.trim();
    const name = document.getElementById('student-name').value.trim();
    const studentClass = document.getElementById('student-class').value;
    const gender = document.getElementById('student-gender').value;
    const phone = document.getElementById('student-phone').value.trim();

    if (!id || !name) {
        showToast("ID Siswa dan Nama harus diisi!", "error");
        return;
    }

    if (mode === 'add') {
        const res = window.db.addStudent({ id, name, class: studentClass, gender, phone, photo: "" });
        if (res.success) {
            showToast("Data siswa berhasil ditambahkan.");
            // Ask to auto-create credentials
            if (confirm("Apakah ingin membuatkan akun login Siswa secara otomatis? \n(Username = ID Siswa, Password = ID Siswa)")) {
                window.db.addUser({
                    username: id,
                    password: id,
                    role: "siswa",
                    studentId: id,
                    name: name,
                    photo: "",
                    isActive: true
                });
                showToast("Akun login berhasil dibuat!");
            }
            closeModal('modal-student');
            renderStudentsTab();
        } else {
            showToast(res.message, "error");
        }
    } else {
        const res = window.db.updateStudent(id, { name, class: studentClass, gender, phone });
        if (res.success) {
            showToast("Data siswa berhasil diubah.");
            closeModal('modal-student');
            renderStudentsTab();
        } else {
            showToast(res.message, "error");
        }
    }
};

window.deleteStudentData = function(id) {
    if (confirm(`Apakah Anda yakin menghapus siswa ${id}? Akun login siswa terkait juga akan dihapus.`)) {
        const res = window.db.deleteStudent(id);
        if (res.success) {
            showToast("Data siswa berhasil dihapus.");
            renderStudentsTab();
        } else {
            showToast(res.message, "error");
        }
    }
};

// 4. ATTENDANCE MANAGEMENT TAB
function renderAttendanceTab() {
    const todayStr = new Date().toISOString().slice(0, 10);
    const dateInput = document.getElementById('attendance-date-picker');
    if (!dateInput.value) dateInput.value = todayStr;
    
    loadAttendanceForDate(dateInput.value);
}

window.changeAttendanceDate = function() {
    const dateStr = document.getElementById('attendance-date-picker').value;
    loadAttendanceForDate(dateStr);
};

function loadAttendanceForDate(dateStr) {
    const students = window.db.getStudents();
    const attendance = window.db.getAttendance().filter(a => a.date === dateStr);
    const tbody = document.getElementById('attendance-table-body');
    
    tbody.innerHTML = students.map(s => {
        const record = attendance.find(a => a.studentId === s.id);
        const status = record ? record.status : 'Hadir'; // Default 'Hadir'
        const reason = record ? (record.reason || '') : '';
        
        return `
            <tr>
                <td><strong>${s.id}</strong></td>
                <td>${s.name}</td>
                <td>${s.class}</td>
                <td>
                    <div style="display:flex; gap:0.5rem;">
                        <label style="cursor:pointer; display:flex; align-items:center; gap:0.25rem;">
                            <input type="radio" name="att-${s.id}" value="Hadir" ${status === 'Hadir' ? 'checked' : ''}> Hadir
                        </label>
                        <label style="cursor:pointer; display:flex; align-items:center; gap:0.25rem; color:var(--secondary-dark);">
                            <input type="radio" name="att-${s.id}" value="Sakit" ${status === 'Sakit' ? 'checked' : ''}> Sakit
                        </label>
                        <label style="cursor:pointer; display:flex; align-items:center; gap:0.25rem; color:var(--warning);">
                            <input type="radio" name="att-${s.id}" value="Izin" ${status === 'Izin' ? 'checked' : ''}> Izin
                        </label>
                        <label style="cursor:pointer; display:flex; align-items:center; gap:0.25rem; color:var(--danger);">
                            <input type="radio" name="att-${s.id}" value="Alfa" ${status === 'Alfa' ? 'checked' : ''}> Alfa
                        </label>
                    </div>
                </td>
                <td>
                    <input type="text" class="form-input sa-reason-input" value="${reason}" placeholder="Keterangan..." style="padding:0.35rem; width:130px; font-size:0.85rem;" data-studentid="${s.id}">
                </td>
            </tr>
        `;
    }).join('');
}

window.saveAttendanceData = function() {
    const dateStr = document.getElementById('attendance-date-picker').value;
    const students = window.db.getStudents();
    const list = [];
    
    students.forEach(s => {
        const tr = document.querySelector(`input[name="att-${s.id}"]`).closest('tr');
        const radio = tr.querySelector(`input[name="att-${s.id}"]:checked`);
        const status = radio ? radio.value : 'Hadir';
        const reasonInput = tr.querySelector('.sa-reason-input');
        const reason = reasonInput ? reasonInput.value.trim() : '';
        
        list.push({ studentId: s.id, status, reason });
    });

    const res = window.db.saveAttendance(dateStr, list);
    if (res.success) {
        showToast("Absensi berhasil disimpan!");
    } else {
        showToast("Gagal menyimpan absensi.", "error");
    }
};

// 5. GOODS & COOPERATIVE ITEMS MANAGEMENT
function renderProductsTab() {
    const products = window.db.getProducts();
    const tbody = document.getElementById('products-table-body');
    tbody.innerHTML = products.map(p => `
        <tr>
            <td><code>${p.id}</code></td>
            <td>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <div style="width:30px; height:30px; background:var(--gray-100); border-radius:4px; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                        <img src="${p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=50'}" style="max-width:100%; max-height:100%; object-fit:contain;">
                    </div>
                    <strong>${p.name}</strong>
                </div>
            </td>
            <td>${p.category}</td>
            <td>Rp ${p.costPrice.toLocaleString('id-ID')}</td>
            <td>Rp ${p.price.toLocaleString('id-ID')}</td>
            <td>
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <span class="badge ${p.stock <= 5 ? 'absent' : 'active'}" style="font-weight:700;">${p.stock}</span>
                    <button class="btn-action-icon edit" onclick="openUpdateStockModal('${p.id}', ${p.stock})" title="Update Stok"><i data-lucide="plus-circle"></i></button>
                </div>
            </td>
            <td>
                <button class="btn-action-icon edit" onclick="openEditProductModal('${p.id}')" title="Edit Barang"><i data-lucide="edit-3"></i></button>
                <button class="btn-action-icon delete" onclick="deleteProductData('${p.id}')" title="Hapus Barang"><i data-lucide="trash-2"></i></button>
            </td>
        </tr>
    `).join('');
    safeCreateIcons();
}

window.openAddProductModal = function() {
    const modal = document.getElementById('modal-product');
    document.getElementById('modal-product-title').textContent = "Tambah Barang Koperasi";
    document.getElementById('product-form-mode').value = "add";
    document.getElementById('prod-id').disabled = false;

    document.getElementById('prod-id').value = '';
    document.getElementById('prod-name').value = '';
    document.getElementById('prod-category').value = 'Alat Tulis';
    document.getElementById('prod-cost').value = '';
    document.getElementById('prod-price').value = '';
    document.getElementById('prod-stock').value = '';
    document.getElementById('prod-img-b64').value = '';

    modal.classList.add('active');
};

window.openEditProductModal = function(id) {
    const prod = window.db.getProducts().find(p => p.id === id);
    if (!prod) return;

    const modal = document.getElementById('modal-product');
    document.getElementById('modal-product-title').textContent = `Edit Barang: ${id}`;
    document.getElementById('product-form-mode').value = "edit";
    document.getElementById('prod-id').value = prod.id;
    document.getElementById('prod-id').disabled = true;
    document.getElementById('prod-name').value = prod.name;
    document.getElementById('prod-category').value = prod.category;
    document.getElementById('prod-cost').value = prod.costPrice;
    document.getElementById('prod-price').value = prod.price;
    document.getElementById('prod-stock').value = prod.stock;
    document.getElementById('prod-img-b64').value = prod.image || '';

    modal.classList.add('active');
};

window.saveProductForm = function() {
    const mode = document.getElementById('product-form-mode').value;
    const id = document.getElementById('prod-id').value.trim();
    const name = document.getElementById('prod-name').value.trim();
    const category = document.getElementById('prod-category').value;
    const costPrice = parseInt(document.getElementById('prod-cost').value);
    const price = parseInt(document.getElementById('prod-price').value);
    const stock = parseInt(document.getElementById('prod-stock').value);
    const image = document.getElementById('prod-img-b64').value;

    if (!id || !name || isNaN(costPrice) || isNaN(price) || isNaN(stock)) {
        showToast("Semua field wajib diisi dengan format benar!", "error");
        return;
    }

    if (mode === 'add') {
        const res = window.db.addProduct({ id, name, category, costPrice, price, stock, image });
        if (res.success) {
            showToast("Barang berhasil ditambahkan.");
            closeModal('modal-product');
            renderProductsTab();
        } else {
            showToast(res.message, "error");
        }
    } else {
        const res = window.db.updateProduct(id, { name, category, costPrice, price, stock, image });
        if (res.success) {
            showToast("Barang berhasil diubah.");
            closeModal('modal-product');
            renderProductsTab();
        } else {
            showToast(res.message, "error");
        }
    }
};

window.openUpdateStockModal = function(id, curStock) {
    const newStock = prompt(`Masukkan jumlah stok baru untuk Barang ID: ${id}`, curStock);
    if (newStock !== null) {
        if (isNaN(parseInt(newStock)) || parseInt(newStock) < 0) {
            showToast("Input stok tidak valid!", "error");
            return;
        }
        window.db.updateStock(id, parseInt(newStock));
        showToast("Stok berhasil diperbarui!");
        renderProductsTab();
    }
};

window.deleteProductData = function(id) {
    if (confirm(`Apakah Anda yakin ingin menghapus barang ${id}?`)) {
        const res = window.db.deleteProduct(id);
        if (res.success) {
            showToast("Barang berhasil dihapus.");
            renderProductsTab();
        } else {
            showToast(res.message, "error");
        }
    }
};

// Handle product image base64 conversions
window.handleProductImageUpload = function(evt) {
    const file = evt.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('prod-img-b64').value = e.target.result;
            showToast("Foto barang berhasil dimuat.");
        };
        reader.readAsDataURL(file);
    }
};

// 6. POS PANEL (KASIR PENJUALAN)
function renderPOSTab() {
    // Cek Shift untuk anggota kopsis
    const user = state.currentUser;
    const shiftAlert = document.getElementById('pos-shift-alert');
    const shiftText = document.getElementById('pos-shift-text');
    if (user && (user.role === 'anggota' || user.role === 'petugas_inti')) {
        const now = new Date();
        const h = now.getHours();
        const m = now.getMinutes();
        const time = h * 60 + m;
        // Shift 1: 09:00-09:15 (540-555)
        // Shift 2: 11:35-11:50 (695-710)
        // Shift 3: 11:55-12:10 (715-730)
        let inShift = false;
        let shiftName = '';
        if (time >= 540 && time <= 555) { inShift = true; shiftName = 'Shift 1'; }
        else if (time >= 695 && time <= 710) { inShift = true; shiftName = 'Shift 2'; }
        else if (time >= 715 && time <= 730) { inShift = true; shiftName = 'Shift 3'; }

        if (inShift) {
            const todayStr = new Date().toISOString().split('T')[0];
            const txs = window.db.getTransactions().filter(t => t.date.startsWith(todayStr) && t.shift === shiftName);
            const shiftSales = txs.reduce((sum, t) => sum + t.total, 0);

            shiftAlert.style.display = 'flex';
            shiftAlert.style.flexDirection = 'column';
            shiftAlert.style.alignItems = 'flex-start';
            shiftAlert.style.background = 'var(--primary-color)';
            shiftAlert.innerHTML = `
                <div style="display:flex; align-items:center; gap:8px; font-weight:bold;">
                    <i data-lucide="clock" style="width:18px;height:18px;"></i>
                    <span>Jadwal Jaga Aktif: ${shiftName}</span>
                </div>
                <div style="margin-top:8px; width:100%;">
                    <p style="margin:0; font-size:0.85rem;">Total Penjualan Sementara (Shift Ini): <strong>Rp ${shiftSales.toLocaleString('id-ID')}</strong></p>
                    <div style="display:flex; gap:8px; margin-top:8px; flex-wrap:wrap;">
                        <input type="number" id="pos-shift-deposit-input" placeholder="Masukkan Uang Fisik Kasir" style="padding:4px 8px; border-radius:4px; border:none; color:#333; font-size:0.85rem; width:200px;">
                        <button onclick="submitShiftDeposit('${shiftName}')" style="background:var(--success-color); color:white; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:0.85rem;">Simpan Setoran</button>
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        } else {
            shiftAlert.style.display = 'flex';
            shiftAlert.style.flexDirection = 'row';
            shiftAlert.style.background = 'var(--warning-color)';
            shiftAlert.innerHTML = '<i data-lucide="clock" style="width:18px;height:18px;"></i><span>Saat ini bukan jadwal Shift Istirahat (Akses POS tetap diizinkan).</span>';
            if (window.lucide) window.lucide.createIcons();
        }
    } else {
        if(shiftAlert) shiftAlert.style.display = 'none';
    }
    state.cart = [];
    updateCartUI();
    
    // Fill customer select
    const students = window.db.getStudents();
    const select = document.getElementById('pos-customer-select');
    select.innerHTML = '<option value="">-- Tamu / Pembeli Umum --</option>' + 
        students.map(s => `<option value="${s.id}">${s.name} (${s.class})</option>`).join('');

    // Load category tabs
    const products = window.db.getProducts();
    const categories = ['Semua', ...new Set(products.map(p => p.category))];
    
    const tabsWrapper = document.getElementById('pos-categories-wrapper');
    tabsWrapper.innerHTML = categories.map((cat, idx) => `
        <button class="pos-tab ${idx === 0 ? 'active' : ''}" onclick="filterPOSProducts('${cat}', this)">${cat}</button>
    `).join('');

    loadPOSProducts('Semua');
}

window.filterPOSProducts = function(category, tabBtn) {
    document.querySelectorAll('#pos-categories-wrapper .pos-tab').forEach(b => b.classList.remove('active'));
    tabBtn.classList.add('active');
    loadPOSProducts(category);
};

window.searchPOSProducts = function() {
    const query = document.getElementById('pos-search-input').value.toLowerCase();
    const activeTab = document.querySelector('#pos-categories-wrapper .pos-tab.active').textContent;
    loadPOSProducts(activeTab, query);
};

function loadPOSProducts(category, searchQuery = '') {
    let products = window.db.getProducts();
    
    if (category !== 'Semua') {
        products = products.filter(p => p.category === category);
    }
    
    if (searchQuery) {
        products = products.filter(p => p.name.toLowerCase().includes(searchQuery) || p.id.toLowerCase().includes(searchQuery));
    }

    const grid = document.getElementById('pos-products-grid');
    if (products.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding:2rem; color:var(--gray-500);">Produk tidak ditemukan.</div>';
        return;
    }

    grid.innerHTML = products.map(p => {
        const isLow = p.stock <= 5;
        return `
            <div class="pos-product-card" onclick="addToCart('${p.id}')">
                <div>
                    <div class="pos-prod-img">
                        <img src="${p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=50'}" style="max-width:100%; max-height:100%; object-fit:contain;">
                    </div>
                    <div class="pos-prod-name" title="${p.name}">${p.name}</div>
                </div>
                <div>
                    <div class="pos-prod-price">Rp ${p.price.toLocaleString('id-ID')}</div>
                    <div class="pos-prod-stock ${isLow ? 'low' : ''}">Stok: ${p.stock}</div>
                </div>
            </div>
        `;
    }).join('');
}

window.addToCart = function(productId) {
    const products = window.db.getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) return;
    if (product.stock <= 0) {
        showToast("Stok produk habis!", "error");
        return;
    }

    const cartItem = state.cart.find(item => item.productId === productId);
    
    if (cartItem) {
        if (cartItem.quantity >= product.stock) {
            showToast("Stok sudah mencapai batas maksimal di keranjang!", "warning");
            return;
        }
        cartItem.quantity++;
    } else {
        state.cart.push({ productId, quantity: 1 });
    }

    updateCartUI();
};

window.adjustCartQty = function(productId, delta) {
    const cartIdx = state.cart.findIndex(item => item.productId === productId);
    if (cartIdx === -1) return;

    const cartItem = state.cart[cartIdx];
    const products = window.db.getProducts();
    const product = products.find(p => p.id === productId);

    if (delta > 0 && cartItem.quantity >= product.stock) {
        showToast("Stok sudah mencapai batas maksimal!", "warning");
        return;
    }

    cartItem.quantity += delta;
    if (cartItem.quantity <= 0) {
        state.cart.splice(cartIdx, 1);
    }

    updateCartUI();
};

window.removeCartItem = function(productId) {
    state.cart = state.cart.filter(item => item.productId !== productId);
    updateCartUI();
};

function updateCartUI() {
    const scroll = document.getElementById('pos-cart-items');
    const products = window.db.getProducts();
    
    if (state.cart.length === 0) {
        scroll.innerHTML = '<div style="text-align:center; padding:3rem 0; color:var(--gray-500);">Keranjang belanja kosong.</div>';
        document.getElementById('pos-cart-subtotal').textContent = 'Rp 0';
        document.getElementById('pos-cart-total').textContent = 'Rp 0';
        return;
    }

    let subtotal = 0;
    
    scroll.innerHTML = state.cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        const lineTotal = product.price * item.quantity;
        subtotal += lineTotal;
        
        return `
            <div class="cart-item-row">
                <div>
                    <div class="cart-item-name" title="${product.name}">${product.name}</div>
                    <small style="color:var(--gray-500);">Rp ${product.price.toLocaleString('id-ID')}</small>
                </div>
                <div class="cart-item-qty">
                    <button class="btn-qty" onclick="adjustCartQty('${product.id}', -1)">-</button>
                    <span class="qty-val">${item.quantity}</span>
                    <button class="btn-qty" onclick="adjustCartQty('${product.id}', 1)">+</button>
                </div>
                <div class="cart-item-subtotal">Rp ${lineTotal.toLocaleString('id-ID')}</div>
                <button class="btn-cart-remove" onclick="removeCartItem('${product.id}')"><i data-lucide="trash" style="width:14px;"></i></button>
            </div>
        `;
    }).join('');

    safeCreateIcons();
    document.getElementById('pos-cart-subtotal').textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    document.getElementById('pos-cart-total').textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
}

window.processPOSCheckout = function() {
    if (state.cart.length === 0) {
        showToast("Keranjang belanja kosong!", "error");
        return;
    }

    const studentId = document.getElementById('pos-customer-select').value;
    const res = window.db.createTransaction(studentId, state.cart, state.currentUser.username);

    if (res.success) {
        showToast("Transaksi berhasil diproses!");
        showInvoiceModal(res.transaction);
        renderPOSTab(); // Reset cart and catalog
    } else {
        showToast(res.message, "error");
    }
};

window.submitShiftDeposit = function(shiftName) {
    const input = document.getElementById('pos-shift-deposit-input');
    const amount = parseInt(input.value);
    if (!amount || amount < 0) {
        showToast("Masukkan nominal uang fisik yang valid!", "error");
        return;
    }
    const res = window.db.submitShiftDeposit(state.currentUser.username, shiftName, amount);
    if (res.success) {
        showToast(`Setoran ${shiftName} berhasil disimpan: Rp ${amount.toLocaleString('id-ID')}`);
        input.value = '';
    } else {
        showToast("Gagal menyimpan setoran", "error");
    }
};

function showInvoiceModal(tx) {
    const modal = document.getElementById('modal-invoice');
    const container = document.getElementById('invoice-receipt-container');
    
    const settings = window.db.getSettings();
    const itemsHtml = tx.items.map(item => `
        <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.25rem;">
            <span>${item.name} (x${item.quantity})</span>
            <span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
        </div>
    `).join('');

    container.innerHTML = `
        <div style="text-align:center; border-bottom:1px dashed var(--gray-300); padding-bottom:0.75rem; margin-bottom:0.75rem;">
            <h3 style="font-weight:700; color:var(--primary-dark);">${settings.coopName}</h3>
            <div style="font-size:0.75rem; color:var(--gray-500);">${settings.schoolName}</div>
            <div style="font-size:0.75rem; color:var(--gray-500);">${settings.address}</div>
        </div>
        <div style="font-size:0.8rem; margin-bottom:0.75rem; line-height:1.4;">
            <div><strong>No Transaksi:</strong> ${tx.id}</div>
            <div><strong>Tanggal:</strong> ${new Date(tx.date).toLocaleString('id-ID')}</div>
            <div><strong>Kasir:</strong> ${tx.cashierUsername}</div>
            <div><strong>Pelanggan:</strong> ${tx.studentName} ${tx.studentId ? `(${tx.studentId})` : ''}</div>
        </div>
        <div style="border-bottom:1px dashed var(--gray-300); border-top:1px dashed var(--gray-300); padding:0.5rem 0; margin-bottom:0.75rem;">
            ${itemsHtml}
        </div>
        <div style="display:flex; justify-content:space-between; font-weight:700; font-size:1rem; color:var(--primary-dark);">
            <span>TOTAL BELANJA</span>
            <span>Rp ${tx.totalAmount.toLocaleString('id-ID')}</span>
        </div>
        <div style="text-align:center; margin-top:1.5rem; font-size:0.75rem; color:var(--gray-500);">
            Terima kasih telah berbelanja di Koperasi Sekolah!
        </div>
    `;

    modal.classList.add('active');
}

window.printInvoice = function() {
    const printContents = document.getElementById('invoice-receipt-container').innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = `
        <div style="width: 300px; padding: 20px; font-family: monospace;">
            ${printContents}
        </div>
    `;
    window.print();
    document.body.innerHTML = originalContents;
    
    // Re-initialize dynamic behaviors
    window.location.reload();
};

// 7. FINANCIAL REPORTS TAB (Chart.js)
function renderReportsTab() {
    // Menu End Of Day visibility for Admin or Petugas Inti
    const endOfDayBtn = document.getElementById('btn-end-of-day');
    if (state.currentUser.role === 'admin' || state.currentUser.role === 'petugas_inti') {
        endOfDayBtn.style.display = 'block';
    } else {
        endOfDayBtn.style.display = 'none';
    }

    const txs = window.db.getTransactions();
    const products = window.db.getProducts();
    const adjustments = window.db.getFinancialAdjustments();
    
    // Calculations
    const totalRevenue = txs.reduce((sum, t) => sum + t.totalAmount, 0);
    const posProfit = txs.reduce((sum, t) => sum + t.totalProfit, 0);
    
    const manualProfit = adjustments.filter(a => a.type === 'Keuntungan').reduce((sum, a) => sum + a.amount, 0);
    const manualLoss = adjustments.filter(a => a.type === 'Kerugian').reduce((sum, a) => sum + a.amount, 0);
    
    const netProfit = posProfit + manualProfit - manualLoss;
    const totalCount = txs.length;

    document.getElementById('report-total-revenue').textContent = `Rp ${totalRevenue.toLocaleString('id-ID')}`;
    document.getElementById('report-total-profit').textContent = `Rp ${netProfit.toLocaleString('id-ID')} (Bersih)`;
    document.getElementById('report-total-transactions').textContent = totalCount;

    // Render manual daily adjustments table
    renderAdjustmentsTable();

    if (typeof Chart === 'undefined') {
        console.warn('Chart.js is not loaded. Skipping chart rendering.');
        return;
    }

    // Destroy existing charts to recreate
    if (state.charts.salesChart) state.charts.salesChart.destroy();
    if (state.charts.productChart) state.charts.productChart.destroy();

    // Chart 1: Daily Revenue Trends (last 7 days)
    const dailyData = {};
    txs.forEach(t => {
        const dateKey = new Date(t.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        dailyData[dateKey] = (dailyData[dateKey] || 0) + t.totalAmount;
    });
    
    const dates = Object.keys(dailyData).slice(-7);
    const revenues = dates.map(d => dailyData[d]);

    const ctx1 = document.getElementById('salesTrendChart').getContext('2d');
    state.charts.salesChart = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Penjualan (Rp)',
                data: revenues,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Chart 2: Popular Products (sold quantities)
    const productSales = {};
    txs.forEach(t => {
        t.items.forEach(item => {
            productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
        });
    });

    const sortedProds = Object.keys(productSales).sort((a,b) => productSales[b] - productSales[a]).slice(0, 5);
    const prodQtys = sortedProds.map(p => productSales[p]);

    const ctx2 = document.getElementById('popularProductsChart').getContext('2d');
    state.charts.productChart = new Chart(ctx2, {
        type: 'bar',
        data: {
            labels: sortedProds,
            datasets: [{
                label: 'Jumlah Terjual',
                data: prodQtys,
                backgroundColor: ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#3b82f6'],
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });

    // Load reports table
    const tbody = document.getElementById('reports-table-body');
    tbody.innerHTML = txs.map(t => `
        <tr>
            <td><code>${t.id}</code></td>
            <td>${new Date(t.date).toLocaleDateString('id-ID')}</td>
            <td>${t.studentName}</td>
            <td>Rp ${t.totalAmount.toLocaleString('id-ID')}</td>
            <td>Rp ${t.totalProfit.toLocaleString('id-ID')}</td>
            <td>${t.cashierUsername}</td>
            <td><button class="btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="viewTxDetail('${t.id}')">Detail</button></td>
        </tr>
    `).join('');
}

window.viewTxDetail = function(txId) {
    const tx = window.db.getTransactions().find(t => t.id === txId);
    if (tx) showInvoiceModal(tx);
};

// 8. AUDIT LOGS TAB
function renderLogsTab() {
    const logs = window.db.getAuditLogs();
    const tbody = document.getElementById('logs-table-body');
    
    // Show logs in reverse order (newest first)
    const reversedLogs = [...logs].reverse();
    tbody.innerHTML = reversedLogs.map(l => `
        <tr>
            <td><small>${new Date(l.date).toLocaleString('id-ID')}</small></td>
            <td><code>${l.username}</code></td>
            <td><span class="badge ${l.role}">${l.role}</span></td>
            <td><strong>${l.action}</strong></td>
            <td>${l.details}</td>
        </tr>
    `).join('');
}

// 9. SYSTEM SETTINGS TAB
function renderSettingsTab() {
    const settings = window.db.getSettings();
    document.getElementById('settings-school').value = settings.schoolName;
    document.getElementById('settings-coop').value = settings.coopName;
    document.getElementById('settings-address').value = settings.address;
    document.getElementById('settings-phone').value = settings.phone;
}

window.saveSystemSettings = function(e) {
    const schoolName = document.getElementById('settings-school').value.trim();
    const coopName = document.getElementById('settings-coop').value.trim();
    const address = document.getElementById('settings-address').value.trim();
    const phone = document.getElementById('settings-phone').value.trim();

    if (!schoolName || !coopName) {
        showToast("Nama Sekolah dan Koperasi wajib diisi!", "error");
        return;
    }

    window.db.saveSettings({ schoolName, coopName, address, phone });
    showToast("Pengaturan sistem berhasil disimpan!");
};

window.exportDatabase = function() {
    window.db.exportDatabase();
    showToast("Database berhasil diekspor.");
};

window.importDatabase = function(evt) {
    const file = evt.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const res = window.db.importDatabase(e.target.result);
            if (res.success) {
                showToast("Database berhasil dipulihkan! Me-restart sistem...");
                setTimeout(() => window.location.reload(), 1500);
            } else {
                showToast(res.message, "error");
            }
        };
        reader.readAsText(file);
    }
};

// ================= SISWA FUNCTIONS =================

// 1. SISWA CATALOG
function renderSiswaCatalog() {
    const products = window.db.getProducts();
    const grid = document.getElementById('siswa-catalog-grid');
    
    grid.innerHTML = products.map(p => {
        const isLow = p.stock <= 5;
        return `
            <div class="catalog-card">
                <div class="catalog-img-wrapper">
                    <span class="catalog-category-tag">${p.category}</span>
                    <img src="${p.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=150'}" class="catalog-img">
                </div>
                <div class="catalog-details">
                    <div class="catalog-name">${p.name}</div>
                    <div class="catalog-footer">
                        <span class="catalog-price">Rp ${p.price.toLocaleString('id-ID')}</span>
                        <span class="catalog-stock-tag ${isLow ? 'low' : ''}">Stok: ${p.stock}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 2. SISWA PURCHASE HISTORY
function renderSiswaHistory() {
    const studentId = state.currentUser.studentId;
    const txs = window.db.getTransactions().filter(t => t.studentId === studentId);
    const tbody = document.getElementById('siswa-history-table-body');
    
    if (txs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--gray-500);">Belum ada riwayat pembelian.</td></tr>';
        return;
    }

    tbody.innerHTML = txs.reverse().map(t => `
        <tr>
            <td><code>${t.id}</code></td>
            <td>${new Date(t.date).toLocaleDateString('id-ID')}</td>
            <td>Rp ${t.totalAmount.toLocaleString('id-ID')}</td>
            <td>${t.cashierUsername}</td>
            <td><button class="btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="viewTxDetail('${t.id}')">Nota Belanja</button></td>
        </tr>
    `).join('');
}

// 3. SISWA ATTENDANCE & STATS
function renderSiswaAttendance() {
    const studentId = state.currentUser.studentId;
    const attendance = window.db.getAttendance().filter(a => a.studentId === studentId);
    
    // Stats calculation
    const stats = window.db.getStudentAttendanceStats(studentId);
    
    document.getElementById('siswa-stat-hadir').textContent = stats.Hadir;
    document.getElementById('siswa-stat-sakit').textContent = stats.Sakit;
    document.getElementById('siswa-stat-izin').textContent = stats.Izin;
    document.getElementById('siswa-stat-alfa').textContent = stats.Alfa;

    const attendanceRate = stats.Total > 0 ? Math.round((stats.Hadir / stats.Total) * 100) : 100;
    document.getElementById('siswa-attendance-percentage').textContent = `${attendanceRate}%`;
    document.getElementById('siswa-attendance-bar').style.width = `${attendanceRate}%`;

    // Attendance Log table
    const tbody = document.getElementById('siswa-attendance-table-body');
    if (attendance.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--gray-500);">Belum ada data absensi.</td></tr>';
        return;
    }

    tbody.innerHTML = attendance.reverse().map(a => {
        let statusBadgeClass = 'present';
        if (a.status === 'Sakit') statusBadgeClass = 'sick';
        if (a.status === 'Izin') statusBadgeClass = 'permission';
        if (a.status === 'Alfa') statusBadgeClass = 'absent';
        
        return `
            <tr>
                <td>${new Date(a.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</td>
                <td><span class="badge ${statusBadgeClass}">${a.status}</span></td>
            </tr>
        `;
    }).join('');
}

// 4. SISWA PROFILE
function renderSiswaProfile() {
    const user = state.currentUser;
    document.getElementById('profile-username').value = user.username;
    document.getElementById('profile-name').value = user.name;
    document.getElementById('profile-avatar-img').src = user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150';
}

window.handleProfilePhotoUpload = function(evt) {
    const file = evt.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const base64Url = e.target.result;
            // Update in DB
            window.db.updateUser(state.currentUser.username, { photo: base64Url });
            
            // Update current state
            state.currentUser.photo = base64Url;
            
            // Re-render
            renderHeaderProfile();
            document.getElementById('profile-avatar-img').src = base64Url;
            showToast("Foto profil berhasil diperbarui!");
        };
        reader.readAsDataURL(file);
    }
};

window.saveSiswaPassword = function() {
    const oldPass = document.getElementById('profile-old-password').value;
    const newPass = document.getElementById('profile-new-password').value;
    const confPass = document.getElementById('profile-confirm-password').value;

    if (!oldPass || !newPass || !confPass) {
        showToast("Semua field kata sandi wajib diisi!", "error");
        return;
    }

    if (newPass !== confPass) {
        showToast("Konfirmasi password baru tidak cocok!", "error");
        return;
    }

    if (newPass.length < 6) {
        showToast("Password baru minimal 6 karakter!", "warning");
        return;
    }

    // Try log in with current credentials to verify old password
    const testLogin = window.db.login(state.currentUser.username, oldPass);
    if (testLogin.success) {
        window.db.updateUser(state.currentUser.username, { password: newPass });
        showToast("Password berhasil diganti!");
        
        // Clear fields
        document.getElementById('profile-old-password').value = '';
        document.getElementById('profile-new-password').value = '';
        document.getElementById('profile-confirm-password').value = '';
    } else {
        showToast("Password lama salah!", "error");
    }
};

// ================= GLOBAL ACTIONS =================

// Modal Close helpers
window.closeModal = function(modalId) {
    document.getElementById(modalId).classList.remove('active');
};

// GLOBAL USER LOGOUT
window.logout = function() {
    navigateTo('login');
};

// Toggle password visibility
window.togglePasswordVisibility = function(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.setAttribute('data-lucide', 'eye-off');
    } else {
        input.type = 'password';
        icon.setAttribute('data-lucide', 'eye');
    }
    safeCreateIcons();
};

// Handle Forgot Password click
window.handleForgotPassword = function() {
    alert("Silakan hubungi Administrator sekolah di Koperasi / Ruang IT untuk mereset kata sandi Anda.");
};

// Toggle demo info box open/close
window.toggleDemoInfo = function() {
    const body = document.getElementById('demo-info-body');
    const chevron = document.getElementById('demo-chevron');
    if (!body) return;

    const isVisible = body.style.display !== 'none';
    body.style.display = isVisible ? 'none' : 'block';
    if (chevron) {
        chevron.classList.toggle('rotated', !isVisible);
    }
    safeCreateIcons();
};

// Fill login form with demo credentials
window.fillLogin = function(username, password) {
    const unameEl = document.getElementById('login-username');
    const passEl = document.getElementById('login-password');
    if (unameEl) unameEl.value = username;
    if (passEl) passEl.value = password;
    // Close the demo panel after filling
    const body = document.getElementById('demo-info-body');
    const chevron = document.getElementById('demo-chevron');
    if (body) body.style.display = 'none';
    if (chevron) chevron.classList.remove('rotated');
    showToast(`Akun "${username}" siap — klik Masuk untuk lanjut.`, 'info');
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    
    // Login Submit Handler
    document.getElementById('login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const userVal = document.getElementById('login-username').value.trim();
        const passVal = document.getElementById('login-password').value;
        
        if (!userVal || !passVal) {
            showToast("Harap masukkan username dan password!", "error");
            return;
        }

        const res = window.db.login(userVal, passVal);
        if (res.success) {
            state.currentUser = res.user;
            showToast(`Selamat datang, ${res.user.name}! 👋`);
            
            if (res.user.role === 'admin') {
                navigateTo('admin');
                switchAdminTab('dashboard');
            } else if (res.user.role === 'petugas' || res.user.role === 'petugas_inti' || res.user.role === 'anggota') {
                navigateTo('admin');
                switchAdminTab('pos'); // Petugas langsung ke POS kasir
            } else {
                navigateTo('siswa');
                switchSiswaTab('catalog');
            }
        } else {
            showToast(res.message, "error");
        }
    });

    // Default to Login view
    navigateTo('login');
});

// ================= ================= =================
// ================= CONSIGNMENT (BARANG SISWA) FUNCTIONS =================
// ================= ================= =================
let activeConsignmentTab = 'list';

window.switchConsignmentSubTab = function(subTabName) {
    activeConsignmentTab = subTabName;
    document.querySelectorAll('#admin-page-consignment .sec-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const clickedBtn = Array.from(document.querySelectorAll('#admin-page-consignment .sec-tab-btn'))
        .find(btn => btn.getAttribute('onclick').includes(subTabName));
    if (clickedBtn) clickedBtn.classList.add('active');

    document.querySelectorAll('#admin-page-consignment .cons-subtab-content').forEach(content => {
        content.classList.remove('active');
    });
    if (subTabName === 'list') {
        document.getElementById('cons-subtab-list').classList.add('active');
        renderConsignmentList();
    } else if (subTabName === 'sales') {
        document.getElementById('cons-subtab-sales').classList.add('active');
        renderConsignmentSales();
    } else if (subTabName === 'payouts') {
        document.getElementById('cons-subtab-payouts').classList.add('active');
        renderConsignmentPayouts();
    }
};

window.renderConsignmentTab = function() {
    switchConsignmentSubTab(activeConsignmentTab);
};

function renderConsignmentList() {
    const list = window.db.getConsignments();
    const tbody = document.getElementById('cons-list-table-body');
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" style="text-align:center; color:var(--gray-500);">Belum ada barang titipan.</td></tr>';
        return;
    }
    tbody.innerHTML = list.map(c => {
        const remaining = c.consignedQty - c.soldQty;
        const statusBadgeClass = remaining === 0 ? 'absent' : 'present';
        const payoutBadgeClass = c.payoutStatus === 'Lunas' ? 'present' : 'permission';
        return `
            <tr>
                <td><code>${c.id}</code></td>
                <td><strong>${c.studentName}</strong> <br><small style="color:var(--gray-500)">ID: ${c.studentId}</small></td>
                <td>${c.productName}</td>
                <td>${c.category}</td>
                <td>Rp ${c.sellingPrice.toLocaleString('id-ID')}</td>
                <td>Rp ${c.costPrice.toLocaleString('id-ID')}</td>
                <td>${c.consignedQty} unit</td>
                <td style="color:var(--success); font-weight:700;">${c.soldQty} unit</td>
                <td style="font-weight:700;">${remaining} unit</td>
                <td><small>${new Date(c.consignmentDate).toLocaleString('id-ID')}</small></td>
                <td><span class="badge ${payoutBadgeClass}">${c.payoutStatus}</span></td>
                <td>
                    <button class="btn-action-icon delete" onclick="deleteConsignment('${c.id}')" title="Hapus"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `;
    }).join('');
    safeCreateIcons();
}

function renderConsignmentSales() {
    const sales = window.db.getConsignmentSales();
    const tbody = document.getElementById('cons-sales-table-body');
    if (sales.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; color:var(--gray-500);">Belum ada riwayat penjualan barang titipan.</td></tr>';
        return;
    }
    tbody.innerHTML = [...sales].reverse().map(s => `
        <tr>
            <td><code>${s.id}</code></td>
            <td><strong>${s.productName}</strong></td>
            <td>${s.studentName}</td>
            <td>${s.quantity} unit</td>
            <td>Rp ${s.sellingPrice.toLocaleString('id-ID')}</td>
            <td>Rp ${s.costPrice.toLocaleString('id-ID')}</td>
            <td>Rp ${s.coopProfit.toLocaleString('id-ID')}</td>
            <td><small>${new Date(s.date).toLocaleString('id-ID')}</small></td>
            <td><code>${s.transactionId || 'Manual'}</code></td>
        </tr>
    `).join('');
}

function renderConsignmentPayouts() {
    const consignments = window.db.getConsignments();
    const payouts = window.db.getConsignmentPayouts();
    
    // Group earnings by student
    const studentFunds = {};
    consignments.forEach(c => {
        if (!studentFunds[c.studentId]) {
            studentFunds[c.studentId] = {
                id: c.studentId,
                name: c.studentName,
                totalSold: 0,
                totalEarned: 0,
                paid: 0
            };
        }
        studentFunds[c.studentId].totalSold += c.soldQty;
        studentFunds[c.studentId].totalEarned += c.soldQty * c.costPrice;
    });

    // Factor in paid amounts
    payouts.forEach(p => {
        if (studentFunds[p.studentId]) {
            studentFunds[p.studentId].paid += p.amount;
        }
    });

    const tbody = document.getElementById('cons-payouts-summary-body');
    const list = Object.values(studentFunds);
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:var(--gray-500);">Belum ada bagi hasil tercatat.</td></tr>';
    } else {
        tbody.innerHTML = list.map(s => {
            const unpaid = s.totalEarned - s.paid;
            const statusClass = unpaid === 0 ? 'present' : 'permission';
            const statusText = unpaid === 0 ? 'Lunas' : 'Ada Piutang';
            return `
                <tr>
                    <td><code>${s.id}</code></td>
                    <td><strong>${s.name}</strong></td>
                    <td>${s.totalSold} unit</td>
                    <td>Rp ${s.totalEarned.toLocaleString('id-ID')}</td>
                    <td style="color:var(--success); font-weight:700;">Rp ${s.paid.toLocaleString('id-ID')}</td>
                    <td style="color:var(--danger); font-weight:700;">Rp ${unpaid.toLocaleString('id-ID')}</td>
                    <td>
                        <button class="btn-primary" style="font-size:0.75rem; padding:0.25rem 0.5rem;" onclick="openPayoutModal('${s.id}', '${s.name}', ${unpaid})" ${unpaid <= 0 ? 'disabled' : ''}>
                            <i data-lucide="banknote" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:2px;"></i> Bayar Siswa
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        safeCreateIcons();
    }

    // Render payout history
    const historyBody = document.getElementById('cons-payouts-history-body');
    if (payouts.length === 0) {
        historyBody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--gray-500);">Belum ada riwayat pembayaran.</td></tr>';
    } else {
        historyBody.innerHTML = [...payouts].reverse().map(p => `
            <tr>
                <td><small>${new Date(p.payoutDate).toLocaleString('id-ID')}</small></td>
                <td><strong>${p.studentName}</strong></td>
                <td style="color:var(--success); font-weight:700;">Rp ${p.amount.toLocaleString('id-ID')}</td>
            </tr>
        `).join('');
    }
}

window.openAddConsignmentModal = function() {
    const modal = document.getElementById('modal-consignment');
    
    // Populate students dropdown
    const students = window.db.getStudents();
    const select = document.getElementById('cons-student-id');
    select.innerHTML = students.map(s => `<option value="${s.id}">${s.name} (${s.id})</option>`).join('');

    // Clear form and set default date-time
    document.getElementById('cons-prod-name').value = '';
    document.getElementById('cons-cost-price').value = '';
    document.getElementById('cons-selling-price').value = '';
    document.getElementById('cons-qty').value = '';
    
    // Format current date-time for datetime-local input
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('cons-datetime').value = now.toISOString().slice(0, 16);

    modal.classList.add('active');
};

window.saveConsignmentForm = function() {
    const studentId = document.getElementById('cons-student-id').value;
    const productName = document.getElementById('cons-prod-name').value.trim();
    const category = document.getElementById('cons-category').value;
    const costPrice = parseInt(document.getElementById('cons-cost-price').value);
    const sellingPrice = parseInt(document.getElementById('cons-selling-price').value);
    const consignedQty = parseInt(document.getElementById('cons-qty').value);
    const consignmentDate = new Date(document.getElementById('cons-datetime').value).toISOString();

    if (!productName || !costPrice || !sellingPrice || !consignedQty) {
        showToast("Semua field formulir wajib diisi!", "error");
        return;
    }

    if (costPrice >= sellingPrice) {
        showToast("Harga Pemilik (Siswa) harus lebih kecil dari Harga Jual!", "error");
        return;
    }

    const students = window.db.getStudents();
    const student = students.find(s => s.id === studentId);
    const studentName = student ? student.name : "Siswa";

    const res = window.db.addConsignment({
        studentId,
        studentName,
        productName,
        category,
        costPrice,
        sellingPrice,
        consignedQty,
        consignmentDate
    });

    if (res.success) {
        showToast("Barang titipan berhasil didaftarkan!");
        closeModal('modal-consignment');
        renderConsignmentTab();
    } else {
        showToast(res.message, "error");
    }
};

window.deleteConsignment = function(id) {
    if (confirm("Apakah Anda yakin ingin menghapus data barang titipan ini beserta produk kasirnya?")) {
        const res = window.db.deleteConsignment(id);
        if (res.success) {
            showToast("Barang titipan berhasil dihapus.");
            renderConsignmentTab();
        } else {
            showToast(res.message, "error");
        }
    }
};

window.openPayoutModal = function(studentId, name, unpaidAmount) {
    document.getElementById('payout-student-id').value = studentId;
    document.getElementById('payout-student-name').value = name;
    document.getElementById('payout-estimated-amount').value = `Rp ${unpaidAmount.toLocaleString('id-ID')}`;
    document.getElementById('payout-amount').value = unpaidAmount;
    document.getElementById('payout-details').value = `Serah terima tunai hasil penjualan barang titipan untuk ${name}`;
    
    document.getElementById('modal-payout').classList.add('active');
};

window.submitStudentPayout = function() {
    const studentId = document.getElementById('payout-student-id').value;
    const amount = parseInt(document.getElementById('payout-amount').value);
    const details = document.getElementById('payout-details').value.trim();

    if (!amount || amount <= 0) {
        showToast("Nominal pembayaran harus lebih besar dari 0!", "error");
        return;
    }

    const res = window.db.settleStudentPayout(studentId, amount, details);
    if (res.success) {
        showToast("Pembayaran serah terima uang berhasil dicatat!");
        closeModal('modal-payout');
        renderConsignmentTab();
    } else {
        showToast(res.message, "error");
    }
};

// ================= SISWA CONSIGNMENT VIEW =================
window.renderSiswaConsignment = function() {
    const studentId = state.currentUser.studentId;
    const consignments = window.db.getConsignments().filter(c => c.studentId === studentId);
    const sales = window.db.getConsignmentSales().filter(s => s.studentId === studentId);
    const payouts = window.db.getConsignmentPayouts().filter(p => p.studentId === studentId);

    // Calculate summaries
    let totalQty = 0;
    let totalSold = 0;
    let totalEarned = 0;
    let totalPaid = payouts.reduce((sum, p) => sum + p.amount, 0);

    consignments.forEach(c => {
        totalQty += c.consignedQty;
        totalSold += c.soldQty;
        totalEarned += c.soldQty * c.costPrice;
    });

    const unpaid = totalEarned - totalPaid;

    document.getElementById('siswa-cons-total-qty').textContent = `${totalQty} unit`;
    document.getElementById('siswa-cons-sold-qty').textContent = `${totalSold} unit`;
    document.getElementById('siswa-cons-total-earnings').textContent = `Rp ${totalEarned.toLocaleString('id-ID')}`;
    document.getElementById('siswa-cons-unpaid').textContent = `Rp ${unpaid.toLocaleString('id-ID')}`;

    // Render list table
    const tbodyList = document.getElementById('siswa-cons-list-body');
    if (consignments.length === 0) {
        tbodyList.innerHTML = '<tr><td colspan="9" style="text-align:center; color:var(--gray-500);">Anda belum menitipkan barang jualan.</td></tr>';
    } else {
        tbodyList.innerHTML = consignments.map(c => {
            const remaining = c.consignedQty - c.soldQty;
            const payoutBadgeClass = c.payoutStatus === 'Lunas' ? 'present' : 'permission';
            return `
                <tr>
                    <td><strong>${c.productName}</strong></td>
                    <td>${c.category}</td>
                    <td>Rp ${c.costPrice.toLocaleString('id-ID')}</td>
                    <td>Rp ${c.sellingPrice.toLocaleString('id-ID')}</td>
                    <td>${c.consignedQty} unit</td>
                    <td style="color:var(--success); font-weight:700;">${c.soldQty} unit</td>
                    <td style="font-weight:700;">${remaining} unit</td>
                    <td><small>${new Date(c.consignmentDate).toLocaleDateString('id-ID')}</small></td>
                    <td><span class="badge ${payoutBadgeClass}">${c.payoutStatus}</span></td>
                </tr>
            `;
        }).join('');
    }

    // Render sales log table
    const tbodySales = document.getElementById('siswa-cons-sales-body');
    if (sales.length === 0) {
        tbodySales.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--gray-500);">Belum ada riwayat penjualan.</td></tr>';
    } else {
        tbodySales.innerHTML = [...sales].reverse().map(s => `
            <tr>
                <td><small>${new Date(s.date).toLocaleString('id-ID')}</small></td>
                <td>${s.productName}</td>
                <td>${s.quantity} unit</td>
                <td style="color:var(--success); font-weight:700;">Rp ${s.earnings.toLocaleString('id-ID')}</td>
            </tr>
        `).join('');
    }
};

// ================= FINANCIAL ADJUSTMENT (UNTUNG/RUGI MANUAL) =================
window.openAddAdjustmentModal = function() {
    const modal = document.getElementById('modal-adjustment');
    
    // Clear inputs and set default datetime
    document.getElementById('adj-amount').value = '';
    document.getElementById('adj-description').value = '';
    document.getElementById('adj-type').value = 'Keuntungan';
    document.getElementById('adj-category').value = 'Operasional';
    
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('adj-datetime').value = now.toISOString().slice(0, 16);
    
    modal.classList.add('active');
};

window.saveAdjustmentForm = function() {
    const date = new Date(document.getElementById('adj-datetime').value).toISOString();
    const type = document.getElementById('adj-type').value;
    const category = document.getElementById('adj-category').value;
    const amount = parseInt(document.getElementById('adj-amount').value);
    const description = document.getElementById('adj-description').value.trim();

    if (!amount || amount <= 0 || !description) {
        showToast("Formulir nominal dan keterangan wajib diisi dengan benar!", "error");
        return;
    }

    const res = window.db.addFinancialAdjustment({
        date,
        type,
        category,
        amount,
        description
    });

    if (res.success) {
        showToast(`Catatan ${type} berhasil ditambahkan!`);
        closeModal('modal-adjustment');
        renderReportsTab(); // Refresh financial report calculations and UI
    } else {
        showToast(res.message, "error");
    }
};

window.deleteAdjustment = function(id) {
    if (confirm("Apakah Anda yakin ingin menghapus catatan keuangan ini?")) {
        const res = window.db.deleteFinancialAdjustment(id);
        if (res.success) {
            showToast("Catatan keuangan berhasil dihapus.");
            renderReportsTab();
        } else {
            showToast(res.message, "error");
        }
    }
};

function renderAdjustmentsTable() {
    const adjustments = window.db.getFinancialAdjustments();
    const tbody = document.getElementById('adjustments-table-body');
    if (adjustments.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:var(--gray-500);">Belum ada catatan untung/rugi manual.</td></tr>';
        return;
    }
    
    tbody.innerHTML = adjustments.map(a => {
        const typeBadgeClass = a.type === 'Keuntungan' ? 'present' : 'absent';
        return `
            <tr>
                <td><small>${new Date(a.date).toLocaleString('id-ID')}</small></td>
                <td><span class="badge ${typeBadgeClass}">${a.type}</span></td>
                <td>${a.category}</td>
                <td style="font-weight:700; color:${a.type === 'Keuntungan' ? 'var(--success-dark)' : 'var(--danger-dark)'}">
                    ${a.type === 'Keuntungan' ? '+' : '-'} Rp ${a.amount.toLocaleString('id-ID')}
                </td>
                <td>${a.description}</td>
                <td>
                    <button class="btn-action-icon delete" onclick="deleteAdjustment('${a.id}')" title="Hapus"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `;
    }).join('');
    safeCreateIcons();
}

// ================= ABSENSI PETUGAS KOPSIS & TANDA TANGAN =================
let currentSigningUsername = null;
let signatureCanvas = null;
let signatureCtx = null;
let isDrawingSignature = false;
let hasDrawnSignature = false;

// Objek sementara untuk menampung tanda tangan di memori halaman sebelum disimpan ke DB
// Key: username, Value: base64 signature image
let tempSignatures = {};

window.renderPetugasAttendanceTab = function() {
    const datePicker = document.getElementById('pa-date-picker');
    const user = state.currentUser;
    
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    if (user && (user.role === 'petugas' || user.role === 'petugas_inti' || user.role === 'anggota')) {
        // Petugas: tanggal dikunci otomatis dari sistem
        datePicker.value = todayStr;
        datePicker.disabled = true;
        
        // Cek apakah sudah ada pengajuan hari ini
        const allRequests = window.db.getData().petugasAttendanceRequests || [];
        const myRequest = allRequests.find(r => r.username === user.username && r.date === todayStr);
        
        // Tampilkan/perbarui banner status pengajuan
        let statusBanner = document.getElementById('pa-self-status-banner');
        const pageHeader = document.querySelector('#admin-page-petugas-attendance .card-header-flex');
        
        if (!statusBanner) {
            statusBanner = document.createElement('div');
            statusBanner.id = 'pa-self-status-banner';
            statusBanner.style.cssText = 'margin-bottom:1rem; padding:0.85rem 1.25rem; border-radius:10px; font-size:0.9rem; display:flex; align-items:center; gap:0.75rem;';
            if (pageHeader && pageHeader.parentNode) {
                pageHeader.parentNode.insertBefore(statusBanner, pageHeader.nextSibling);
            }
        }
        
        if (myRequest) {
            if (myRequest.approvalStatus === 'Pending') {
                statusBanner.style.background = 'rgba(251, 189, 35, 0.15)';
                statusBanner.style.border = '1px solid rgba(251, 189, 35, 0.4)';
                statusBanner.style.color = 'var(--warning)';
                statusBanner.innerHTML = `<i data-lucide="clock" style="width:18px; height:18px; flex-shrink:0;"></i> <div><strong>Kehadiran Anda Sudah Diajukan</strong> — Status: <strong>Menunggu Persetujuan Admin</strong>. Anda masih bisa mengubah dan mengirim ulang jika diperlukan.</div>`;
                statusBanner.style.display = 'flex';
            } else if (myRequest.approvalStatus === 'Approved') {
                statusBanner.style.background = 'rgba(34, 197, 94, 0.12)';
                statusBanner.style.border = '1px solid rgba(34, 197, 94, 0.4)';
                statusBanner.style.color = 'var(--success)';
                statusBanner.innerHTML = `<i data-lucide="check-circle" style="width:18px; height:18px; flex-shrink:0;"></i> <div><strong>Kehadiran Anda Sudah Disetujui</strong> — Absensi Anda untuk hari ini telah tercatat secara resmi.</div>`;
                statusBanner.style.display = 'flex';
            }
        } else {
            statusBanner.style.background = 'rgba(99, 102, 241, 0.1)';
            statusBanner.style.border = '1px solid rgba(99, 102, 241, 0.25)';
            statusBanner.style.color = 'var(--primary-dark)';
            statusBanner.innerHTML = `<i data-lucide="info" style="width:18px; height:18px; flex-shrink:0;"></i> <div><strong>Belum mengisi kehadiran hari ini.</strong> Pilih status kehadiran Anda, isi alasan jika tidak hadir, tambahkan tanda tangan, lalu klik <strong>Kirim Kehadiran</strong>.</div>`;
            statusBanner.style.display = 'flex';
        }
        
        // Ubah tombol Simpan menjadi Kirim Kehadiran
        const saveBtn = document.querySelector('button[onclick="savePetugasAttendanceForm()"]');
        if (saveBtn) {
            saveBtn.innerHTML = '<i data-lucide="send"></i> Kirim Kehadiran';
            saveBtn.setAttribute('onclick', 'submitPetugasAttendanceForm()');
            saveBtn.className = 'btn-primary';
        }
        
        // Sembunyikan tombol "Muat Tanggal"
        const loadBtn = document.querySelector('button[onclick="loadPetugasAttendanceForm()"]');
        if (loadBtn) {
            loadBtn.style.display = 'none';
        }
    } else {
        // Admin - sembunyikan banner jika ada
        const statusBanner = document.getElementById('pa-self-status-banner');
        if (statusBanner) statusBanner.style.display = 'none';
        
        // Admin
        datePicker.disabled = false;
        if (!datePicker.value) {
            datePicker.value = todayStr;
        }
        
        const saveBtn = document.querySelector('button[onclick="submitPetugasAttendanceForm()"]') || document.querySelector('button[onclick="savePetugasAttendanceForm()"]');
        if (saveBtn) {
            saveBtn.innerHTML = '<i data-lucide="save"></i> Simpan Absensi';
            saveBtn.setAttribute('onclick', 'savePetugasAttendanceForm()');
            saveBtn.className = 'btn-success';
        }
        
        const loadBtn = document.querySelector('button[onclick="loadPetugasAttendanceForm()"]');
        if (loadBtn) {
            loadBtn.style.display = '';
        }
    }
    
    // Reset temp signatures setiap ganti tanggal / render tab
    tempSignatures = {};
    
    loadPetugasAttendanceForm();
    renderPetugasSalaryReport();
    
    // Jalankan lucide untuk ikon di banner baru
    safeCreateIcons();
};

window.loadPetugasAttendanceForm = function() {
    const datePicker = document.getElementById('pa-date-picker');
    const dateStr = datePicker.value;
    if (!dateStr) return;

    const dbAttendance = window.db.getPetugasAttendance().filter(a => a.date === dateStr);
    // Ambil semua pengajuan pending/approved untuk tanggal ini
    const allRequests = (window.db.getData().petugasAttendanceRequests || []).filter(r => r.date === dateStr);
    let users = window.db.getUsers().filter(u => u.role === 'petugas' || u.role === 'petugas_inti' || u.role === 'anggota');
    const tbody = document.getElementById('pa-attendance-body');

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:var(--text-secondary); padding:2rem;">Tidak ada data petugas kopsis.</td></tr>';
        return;
    }

    tbody.innerHTML = users.map((u, index) => {
        const record = dbAttendance.find(a => a.username === u.username);
        // Cek status pengajuan pending untuk user ini
        const pendingRequest = allRequests.find(r => r.username === u.username);
        
        let status = 'Tidak Hadir';
        let sigData = null;
        let gaji = 0;
        let reason = '';
        
        if (record) {
            status = record.status;
            sigData = record.signatureData;
            gaji = record.gaji;
            reason = record.reason || '';
        }
        
        // Cek apakah ada tanda tangan sementara di memori
        if (tempSignatures[u.username]) {
            sigData = tempSignatures[u.username];
            status = 'Hadir'; // Jika ditandatangani, otomatis set Hadir
            gaji = window.db.getData().settings.gajiPetugasPerPertemuan || window.GAJI_PER_PERTEMUAN || 3000;
        }

        const isHadir = (status === 'Hadir');
        const formattedGaji = isHadir ? (window.db.getData().settings.gajiPetugasPerPertemuan || window.GAJI_PER_PERTEMUAN || 3000) : 0;

        // Petugas hanya bisa menginput/mengedit barisnya sendiri. Admin bisa mengedit semua baris.
        const currentUser = state.currentUser;
        const isAdmin = currentUser.role === 'admin';
        const isSelf = (isAdmin || currentUser.username === u.username);
        const isSelfRow = (currentUser.username === u.username);
        
        // Style baris highlight untuk diri sendiri (non-admin)
        const rowStyle = (!isAdmin && isSelfRow) ? 'background: rgba(99,102,241,0.06); border-left: 3px solid var(--primary);' : '';
        
        // Badge status pengajuan
        let pendingBadgeHtml = '';
        if (pendingRequest && !record) {
            if (pendingRequest.approvalStatus === 'Pending') {
                pendingBadgeHtml = `<span style="display:inline-block; margin-left:0.4rem; padding:0.15rem 0.5rem; border-radius:20px; font-size:0.7rem; font-weight:700; background:rgba(251,189,35,0.2); color:var(--warning);">⏳ Pending</span>`;
            } else if (pendingRequest.approvalStatus === 'Approved') {
                pendingBadgeHtml = `<span style="display:inline-block; margin-left:0.4rem; padding:0.15rem 0.5rem; border-radius:20px; font-size:0.7rem; font-weight:700; background:rgba(34,197,94,0.15); color:var(--success);">✓ Disetujui</span>`;
            }
        }

        // Generate kolom tanda tangan
        let sigColumnHtml = '';
        if (isHadir) {
            if (sigData) {
                sigColumnHtml = `
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <img src="${sigData}" alt="Tanda Tangan" style="height:40px; border:1px solid var(--gray-200); border-radius:4px; background:#fff; padding:2px;">
                        ${isSelf ? `
                        <button class="btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="openSignatureModal('${u.username}')">
                            Ubah
                        </button>
                        ` : ''}
                    </div>
                `;
            } else {
                sigColumnHtml = `
                    ${isSelf ? `
                    <button class="btn-primary" style="padding:0.4rem 0.75rem; font-size:0.75rem; display:inline-flex; align-items:center; gap:0.25rem;" onclick="openSignatureModal('${u.username}')">
                        <i data-lucide="edit-3" style="width:14px; height:14px;"></i> Tulis Tanda Tangan
                    </button>
                    ` : '<span style="color:var(--gray-400); font-size:0.8rem; font-style:italic;">Belum tanda tangan</span>'}
                `;
            }
        } else {
            sigColumnHtml = `<span style="color:var(--text-secondary); font-size:0.8rem; font-style:italic;">Tidak perlu tanda tangan</span>`;
        }

        return `
            <tr data-username="${u.username}" data-name="${u.name}" style="${rowStyle}">
                <td>${index + 1}</td>
                <td><strong>${u.name}</strong>${isSelfRow && !isAdmin ? ' <span style="font-size:0.7rem; padding:0.1rem 0.4rem; border-radius:20px; background:rgba(99,102,241,0.15); color:var(--primary-dark); font-weight:700;">Saya</span>' : ''}${pendingBadgeHtml}</td>
                <td><code style="background:var(--gray-50); padding:0.15rem 0.35rem; border-radius:4px; font-size:0.85rem;">${u.username}</code></td>
                <td>
                    <select class="form-input pa-status-select" ${!isSelf ? 'disabled' : ''} style="padding:0.35rem 0.5rem; width:130px; font-size:0.85rem;" onchange="handlePaStatusChange(this, '${u.username}')">
                        <option value="Tidak Hadir" ${!isHadir ? 'selected' : ''}>Tidak Hadir</option>
                        <option value="Hadir" ${isHadir ? 'selected' : ''}>Hadir</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="form-input pa-reason-input" value="${reason}" placeholder="Isi alasan..." ${!isSelf ? 'disabled' : ''} style="padding:0.35rem; width:130px; font-size:0.85rem;">
                </td>
                <td class="pa-sig-cell">${sigColumnHtml}</td>
                <td class="pa-gaji-cell" style="font-weight:700; color:var(--text-primary);">
                    Rp ${formattedGaji.toLocaleString('id-ID')}
                </td>
                <td>
                    ${(sigData && isSelf) ? `
                        <button class="btn-action-icon delete" onclick="clearRowSignature('${u.username}')" title="Hapus Tanda Tangan">
                            <i data-lucide="x-circle"></i>
                        </button>
                    ` : '-'}
                </td>
            </tr>
        `;
    }).join('');

    safeCreateIcons();
};

window.handlePaStatusChange = function(selectEl, username) {
    const isHadir = (selectEl.value === 'Hadir');
    const tr = selectEl.closest('tr');
    const sigCell = tr.querySelector('.pa-sig-cell');
    const gajiCell = tr.querySelector('.pa-gaji-cell');
    const actionCell = tr.cells[6];
    
    const gajiPertemuan = window.db.getData().settings.gajiPetugasPerPertemuan || window.GAJI_PER_PERTEMUAN || 3000;

    const isSelf = (state.currentUser.role === 'admin' || state.currentUser.username === username);

    if (isHadir) {
        gajiCell.textContent = `Rp ${gajiPertemuan.toLocaleString('id-ID')}`;
        const existingSig = tempSignatures[username] || getSavedSignatureForDate(username);
        if (existingSig) {
            tempSignatures[username] = existingSig;
            sigCell.innerHTML = `
                <div style="display:flex; align-items:center; gap:0.5rem;">
                    <img src="${existingSig}" alt="Tanda Tangan" style="height:40px; border:1px solid var(--gray-200); border-radius:4px; background:#fff; padding:2px;">
                    ${isSelf ? `
                    <button class="btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="openSignatureModal('${username}')">
                        Ubah
                    </button>
                    ` : ''}
                </div>
            `;
            if (isSelf) {
                actionCell.innerHTML = `
                    <button class="btn-action-icon delete" onclick="clearRowSignature('${username}')" title="Hapus Tanda Tangan">
                        <i data-lucide="x-circle"></i>
                    </button>
                `;
            } else {
                actionCell.textContent = '-';
            }
        } else {
            sigCell.innerHTML = `
                ${isSelf ? `
                <button class="btn-primary" style="padding:0.4rem 0.75rem; font-size:0.75rem; display:inline-flex; align-items:center; gap:0.25rem;" onclick="openSignatureModal('${username}')">
                    <i data-lucide="edit-3" style="width:14px; height:14px;"></i> Tulis Tanda Tangan
                </button>
                ` : '<span style="color:var(--gray-400); font-size:0.8rem; font-style:italic;">Belum tanda tangan</span>'}
            `;
            actionCell.textContent = '-';
        }
    } else {
        gajiCell.textContent = 'Rp 0';
        sigCell.innerHTML = `<span style="color:var(--text-secondary); font-size:0.8rem; font-style:italic;">Tidak perlu tanda tangan</span>`;
        actionCell.textContent = '-';
        delete tempSignatures[username];
    }
    safeCreateIcons();
};

function getSavedSignatureForDate(username) {
    const dateStr = document.getElementById('pa-date-picker').value;
    const record = window.db.getPetugasAttendance().find(a => a.date === dateStr && a.username === username);
    return record ? record.signatureData : null;
}

window.clearRowSignature = function(username) {
    delete tempSignatures[username];
    
    const tr = document.querySelector(`tr[data-username="${username}"]`);
    if (tr) {
        const sigCell = tr.querySelector('.pa-sig-cell');
        const actionCell = tr.cells[6];
        
        sigCell.innerHTML = `
            <button class="btn-primary" style="padding:0.4rem 0.75rem; font-size:0.75rem; display:inline-flex; align-items:center; gap:0.25rem;" onclick="openSignatureModal('${username}')">
                <i data-lucide="edit-3" style="width:14px; height:14px;"></i> Tulis Tanda Tangan
            </button>
        `;
        actionCell.textContent = '-';
        safeCreateIcons();
    }
};

window.savePetugasAttendanceForm = function() {
    const datePicker = document.getElementById('pa-date-picker');
    const dateStr = datePicker.value;
    if (!dateStr) {
        showToast("Pilih tanggal terlebih dahulu!", "error");
        return;
    }

    const tbody = document.getElementById('pa-attendance-body');
    const rows = tbody.querySelectorAll('tr');
    const records = [];

    let hasValidationError = false;

    rows.forEach(tr => {
        const username = tr.getAttribute('data-username');
        const name = tr.getAttribute('data-name');
        if (!username) return;

        const statusSelect = tr.querySelector('.pa-status-select');
        const status = statusSelect.value;
        const reasonInput = tr.querySelector('.pa-reason-input');
        const reason = reasonInput ? reasonInput.value.trim() : '';

        let signatureData = tempSignatures[username] || getSavedSignatureForDate(username);

        if (status === 'Hadir' && !signatureData) {
            showToast(`Petugas ${name} berstatus Hadir tetapi belum membubuhkan Tanda Tangan!`, "error");
            hasValidationError = true;
        }

        records.push({
            username,
            name,
            status,
            reason,
            signatureData: status === 'Hadir' ? signatureData : null
        });
    });

    if (hasValidationError) return;

    const res = window.db.savePetugasAttendance(dateStr, records);
    if (res.success) {
        showToast(`Absensi petugas tanggal ${dateStr} berhasil disimpan!`);
        tempSignatures = {};
        loadPetugasAttendanceForm();
        renderPetugasSalaryReport();
    } else {
        showToast("Gagal menyimpan absensi petugas.", "error");
    }
};

window.submitPetugasAttendanceForm = function() {
    const datePicker = document.getElementById('pa-date-picker');
    const dateStr = datePicker.value;
    const username = state.currentUser.username;
    const name = state.currentUser.name || username;

    const tr = document.querySelector(`tr[data-username="${username}"]`);
    if (!tr) return;

    const statusSelect = tr.querySelector('.pa-status-select');
    const status = statusSelect.value;
    const reasonInput = tr.querySelector('.pa-reason-input');
    const reason = reasonInput ? reasonInput.value.trim() : '';

    let signatureData = tempSignatures[username] || getSavedSignatureForDate(username);

    if (status === 'Hadir' && !signatureData) {
        showToast("Anda wajib membubuhkan tanda tangan untuk status Hadir!", "error");
        return;
    }

    const res = window.db.submitPetugasAttendanceRequest(dateStr, username, name, status, reason, signatureData);
    if (res.success) {
        showToast("Kehadiran Anda berhasil diajukan. Menunggu persetujuan admin! ✅");
        tempSignatures = {};
        renderPetugasAttendanceTab(); // Re-render penuh agar banner status terupdate
    } else {
        showToast("Gagal mengajukan absensi.", "error");
    }
};

window.renderPetugasSalaryReport = function() {
    let report = window.db.getPetugasSalaryReport();
    const tbody = document.getElementById('pa-salary-report-body');

    if (state.currentUser.role !== 'admin') {
        report = report.filter(r => r.username === state.currentUser.username);
    }

    if (report.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:var(--text-secondary);">Belum ada data absensi petugas kopsis.</td></tr>';
        return;
    }

    tbody.innerHTML = report.map(r => `
        <tr style="${r.username === state.currentUser.username ? 'background:rgba(99,102,241,0.05);' : ''}">
            <td><strong>${r.name}</strong> ${r.username === state.currentUser.username ? '<span style="font-size:0.7rem; padding:0.1rem 0.4rem; border-radius:20px; background:rgba(99,102,241,0.15); color:var(--primary-dark); font-weight:700;">Saya</span>' : ''}</td>
            <td><code>${r.username}</code></td>
            <td style="font-weight:700;">${r.totalHadir} pertemuan</td>
            <td style="font-weight:700; color:var(--success-dark);">Rp ${r.totalGaji.toLocaleString('id-ID')}</td>
        </tr>
    `).join('');
};

// ================= LOGIKA SIGNATURE CANVAS =================
window.openSignatureModal = function(username) {
    const modal = document.getElementById('signature-modal');
    const nameSpan = document.getElementById('sig-modal-name');
    
    const user = window.db.getUsers().find(u => u.username === username);
    nameSpan.textContent = user ? user.name : username;
    
    currentSigningUsername = username;
    modal.style.display = 'flex';
    
    initSignatureCanvas();
    clearSignature();
};

window.closeSignatureModal = function() {
    const modal = document.getElementById('signature-modal');
    modal.style.display = 'none';
    currentSigningUsername = null;
};

window.clearSignature = function() {
    if (signatureCtx && signatureCanvas) {
        signatureCtx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
        
        // Beri background putih tipis agar ekspor transparan/jelas
        signatureCtx.fillStyle = '#ffffff';
        signatureCtx.fillRect(0, 0, signatureCanvas.width, signatureCanvas.height);
        
        hasDrawnSignature = false;
    }
};

window.confirmSignature = function() {
    if (!hasDrawnSignature) {
        showToast("Silakan goreskan tanda tangan Anda terlebih dahulu!", "error");
        return;
    }
    
    if (signatureCanvas && currentSigningUsername) {
        const dataUrl = signatureCanvas.toDataURL('image/png');
        tempSignatures[currentSigningUsername] = dataUrl;
        
        // Cari row dan ubah status dropdown ke Hadir secara otomatis
        const tr = document.querySelector(`tr[data-username="${currentSigningUsername}"]`);
        if (tr) {
            const selectEl = tr.querySelector('.pa-status-select');
            if (selectEl && selectEl.value !== 'Hadir') {
                selectEl.value = 'Hadir';
            }
            // Trigger refresh baris secara lokal
            handlePaStatusChange(selectEl, currentSigningUsername);
        }
        
        showToast("Tanda tangan berhasil direkam di memori. Jangan lupa klik 'Simpan Absensi'!");
        closeSignatureModal();
    }
};

function initSignatureCanvas() {
    if (signatureCanvas) return; // sudah diinisialisasi
    
    signatureCanvas = document.getElementById('signature-canvas');
    if (!signatureCanvas) return;
    
    signatureCtx = signatureCanvas.getContext('2d');
    signatureCtx.strokeStyle = '#312e81'; // Indigo dark
    signatureCtx.lineWidth = 3;
    signatureCtx.lineCap = 'round';
    signatureCtx.lineJoin = 'round';
    
    // MOUSE EVENTS
    signatureCanvas.addEventListener('mousedown', (e) => {
        isDrawingSignature = true;
        hasDrawnSignature = true;
        const pos = getCanvasCoords(e);
        signatureCtx.beginPath();
        signatureCtx.moveTo(pos.x, pos.y);
    });
    
    signatureCanvas.addEventListener('mousemove', (e) => {
        if (!isDrawingSignature) return;
        const pos = getCanvasCoords(e);
        signatureCtx.lineTo(pos.x, pos.y);
        signatureCtx.stroke();
    });
    
    signatureCanvas.addEventListener('mouseup', () => { isDrawingSignature = false; });
    signatureCanvas.addEventListener('mouseleave', () => { isDrawingSignature = false; });
    
    // TOUCH EVENTS (MOBILE)
    signatureCanvas.addEventListener('touchstart', (e) => {
        isDrawingSignature = true;
        hasDrawnSignature = true;
        if (e.touches.length > 0) {
            const pos = getCanvasCoords(e.touches[0]);
            signatureCtx.beginPath();
            signatureCtx.moveTo(pos.x, pos.y);
        }
        e.preventDefault();
    });
    
    signatureCanvas.addEventListener('touchmove', (e) => {
        if (!isDrawingSignature) return;
        if (e.touches.length > 0) {
            const pos = getCanvasCoords(e.touches[0]);
            signatureCtx.lineTo(pos.x, pos.y);
            signatureCtx.stroke();
        }
        e.preventDefault();
    });
    
    signatureCanvas.addEventListener('touchend', (e) => {
        isDrawingSignature = false;
        e.preventDefault();
    });
}

function getCanvasCoords(event) {
    const rect = signatureCanvas.getBoundingClientRect();
    // Mendapatkan koordinat mouse/touch relatif terhadap canvas client rect
    // dan menghitung rasio resolusi canvas jika ada perbedaan css width/height
    const clientX = event.clientX;
    const clientY = event.clientY;
    
    return {
        x: (clientX - rect.left) * (signatureCanvas.width / rect.width),
        y: (clientY - rect.top) * (signatureCanvas.height / rect.height)
    };
}



// ================= END OF DAY REPORT =================
window.renderEndOfDayTab = function() {
    const todayStr = new Date().toISOString().split('T')[0];
    const txs = window.db.getTransactions().filter(t => t.date.startsWith(todayStr));
    const deposits = window.db.getShiftDeposits(todayStr);
    
    let totalTx = txs.length;
    let totalIncome = txs.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
    let totalProfit = txs.reduce((sum, t) => sum + (t.totalProfit || 0), 0);
    
    document.getElementById('eod-total-tx').textContent = totalTx;
    document.getElementById('eod-total-income').textContent = 'Rp ' + totalIncome.toLocaleString('id-ID');
    document.getElementById('eod-total-profit').textContent = 'Rp ' + totalProfit.toLocaleString('id-ID');
    
    document.getElementById('eod-real-cash').value = '';
    document.getElementById('eod-discrepancy-box').style.display = 'none';

    // Rincian per Shift
    let breakdownHtml = `
        <div style="margin-top:20px; border-top:1px solid #eee; padding-top:15px;">
            <h4 style="margin-bottom:10px;">Rincian Penjualan & Setoran per Shift</h4>
            <div class="table-responsive">
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>Shift / Waktu</th>
                            <th>Penjualan Sistem</th>
                            <th>Setoran Manual (Fisik)</th>
                            <th>Selisih (Manual - Sistem)</th>
                            <th>Petugas Setor</th>
                        </tr>
                    </thead>
                    <tbody>
    `;
    
    const shifts = ['Shift 1', 'Shift 2', 'Shift 3', 'Di Luar Shift'];
    shifts.forEach(shift => {
        const shiftTxs = txs.filter(t => t.shift === shift);
        const shiftSystemTotal = shiftTxs.reduce((sum, t) => sum + (t.totalAmount || 0), 0);
        
        const shiftDeps = deposits.filter(d => d.shift === shift);
        const shiftManualTotal = shiftDeps.reduce((sum, d) => sum + d.realAmount, 0);
        const diff = shiftManualTotal - shiftSystemTotal;
        const users = shiftDeps.map(d => d.username).join(', ') || '-';
        
        let diffColor = diff === 0 ? 'var(--success-color)' : (diff > 0 ? 'var(--warning-color)' : 'var(--error-color)');
        
        breakdownHtml += `
            <tr>
                <td><strong>${shift}</strong></td>
                <td>Rp ${shiftSystemTotal.toLocaleString('id-ID')}</td>
                <td>${shiftDeps.length > 0 ? 'Rp ' + shiftManualTotal.toLocaleString('id-ID') : '<em style="color:var(--text-secondary)">Belum Setor</em>'}</td>
                <td style="color:${shiftDeps.length > 0 ? diffColor : 'var(--text-secondary)'}; font-weight:bold;">
                    ${shiftDeps.length > 0 ? 'Rp ' + diff.toLocaleString('id-ID') : '-'}
                </td>
                <td>${users}</td>
            </tr>
        `;
    });
    
    breakdownHtml += `
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const container = document.getElementById('eod-discrepancy-box').parentElement;
    let oldBreakdown = document.getElementById('eod-shift-breakdown');
    if(oldBreakdown) oldBreakdown.remove();
    
    const bdDiv = document.createElement('div');
    bdDiv.id = 'eod-shift-breakdown';
    bdDiv.innerHTML = breakdownHtml;
    // Insert before the input physical cash area
    container.insertBefore(bdDiv, document.getElementById('eod-discrepancy-box').parentElement.querySelector('.form-group'));
};

window.submitEndOfDayReport = function() {
    const realCashStr = document.getElementById('eod-real-cash').value;
    if (!realCashStr) {
        showToast('Harap masukkan jumlah uang fisik di laci kasir.', 'error');
        return;
    }
    const realCash = parseFloat(realCashStr);
    
    const todayStr = new Date().toISOString().split('T')[0];
    const txs = window.db.getTransactions().filter(t => t.date.startsWith(todayStr));
    let expectedCash = txs.reduce((sum, t) => sum + t.total, 0);
    
    const diff = realCash - expectedCash;
    const box = document.getElementById('eod-discrepancy-box');
    const title = document.getElementById('eod-discrepancy-title');
    const text = document.getElementById('eod-discrepancy-text');
    
    box.style.display = 'block';
    if (diff === 0) {
        box.style.background = 'var(--success-color)';
        box.style.color = 'white';
        title.textContent = 'Saldo Sesuai (Balance)';
        text.textContent = 'Uang fisik sesuai dengan total transaksi hari ini.';
    } else if (diff > 0) {
        box.style.background = 'var(--warning-color)';
        box.style.color = 'white';
        title.textContent = 'Kelebihan Uang (Surplus)';
        text.textContent = 'Terdapat kelebihan uang kas sebesar Rp ' + diff.toLocaleString('id-ID') + '.';
    } else {
        box.style.background = 'var(--error-color)';
        box.style.color = 'white';
        title.textContent = 'Kekurangan Uang (Shortage)';
        text.textContent = 'Terdapat kekurangan uang kas sebesar Rp ' + Math.abs(diff).toLocaleString('id-ID') + '.';
    }
    
    window.db.addAuditLog(state.currentUser.name, state.currentUser.role, 'Laporan Akhir Hari', 
        'Submit laporan akhir hari ' + todayStr + '. Sistem: Rp' + expectedCash + ', Fisik: Rp' + realCash + ', Selisih: Rp' + diff);
    
    showToast('Laporan akhir hari telah diserahkan dan dicatat di sistem.', 'success');
};

