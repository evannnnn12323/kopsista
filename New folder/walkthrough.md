# Walkthrough Hasil Pengerjaan: Alur Persetujuan Absensi Petugas Kopsis "Koperasi THHK"

Kami telah memperbarui alur keamanan absensi petugas kopsis sesuai instruksi baru Anda. Sekarang sistem menerapkan mekanisme **persetujuan (approval) admin**, **penguncian tanggal sistem otomatis**, dan **pembatasan hak akses penuh**.

---

## 📂 Berkas Proyek yang Diperbarui

Semua berkas berikut berlokasi di direktori:
[Proyek Koperasi THHK](file:///C:/Users/MSI/.gemini/antigravity/scratch/koperasi-sekolah/)

* **[app.js](file:///C:/Users/MSI/.gemini/antigravity/scratch/koperasi-sekolah/app.js)**: Menyediakan panel persetujuan di dashboard admin, membatasi hak input agar petugas hanya bisa mengisi baris miliknya sendiri, menonaktifkan fitur ubah tanggal untuk petugas, serta mengarahkan input petugas ke antrean persetujuan.
* **[index.html](file:///C:/Users/MSI/.gemini/antigravity/scratch/koperasi-sekolah/index.html)**: Menambahkan modul kartu "Persetujuan Kehadiran Petugas" di Dashboard Admin.
* **[database.js](file:///C:/Users/MSI/.gemini/antigravity/scratch/koperasi-sekolah/database.js)**: Menyediakan skema data baru `petugasAttendanceRequests` beserta fungsi-fungsi persetujuan (`submit`, `approve`, `reject`).

---

## 🔒 Alur Keamanan & Validasi Baru

### 1. Hak Akses Terbatas (Hanya Admin yang Bisa Save/Edit)
* **Admin**:
  * Memiliki kendali penuh di tab "Absensi Petugas" (dapat melihat seluruh petugas, mengubah tanggal absensi ke hari apa saja, serta menyimpan secara langsung menggunakan tombol **Simpan Absensi**).
  * Dapat melihat daftar pengajuan absensi dari petugas yang masuk dan melakukan persetujuan/penolakan langsung dari Dashboard Admin.
* **Petugas**:
  * Di tab "Absensi Petugas", pemilih tanggal dikunci secara otomatis (**disabled**) pada tanggal hari ini dari sistem untuk mencegah kebohongan tanggal.
  * Hanya dapat mengubah status dan membubuhkan tanda tangan pada **baris namanya sendiri**. Baris petugas lain dinonaktifkan (read-only).
  * Tombol aksi diubah menjadi **Kirim Kehadiran** (mengirim data absensi ke antrean persetujuan admin). Petugas tidak bisa langsung menyimpan absensi ke basis data utama.

### 2. Validasi Tanda Tangan Wajib
* Untuk status kehadiran **Hadir**, petugas maupun admin **wajib** membubuhkan tanda tangan digital. Sistem akan memblokir pengiriman/penyimpanan jika status Hadir diisi tanpa tanda tangan.

### 3. Panel Persetujuan di Dashboard Admin
* Ketika petugas mengirimkan absensinya, notifikasi persetujuan secara otomatis muncul di Dashboard Admin.
* Admin dapat melihat detail pengajuan (Tanggal, Nama, Status, dan gambar Tanda Tangan) dan menyetujuinya (**Setujui**) atau menolaknya (**Tolak**).
* Kehadiran dan gaji (Rp 3.000) baru akan masuk ke laporan rekapitulasi gaji setelah disetujui oleh admin.

---

## 🔑 Kredensial Akun Pengujian

### Akun Petugas Kopsis (Role: Petugas)
1. **Jeisen** &rarr; Username: `jeisen` | Password: `738241`
2. **Marquez** &rarr; Username: `marquez` | Password: `591064`
3. **Mikhaela** &rarr; Username: `mikhaela` | Password: `326817`
4. **Agnel** &rarr; Username: `agnel` | Password: `847392`
5. **Calvin** &rarr; Username: `calvin` | Password: `103956`

### Akun Administrator (Role: Admin)
* Username: `Yanuar` | Password: `12345678`

---

## 🚀 Panduan Pengujian Manual Alur Baru

### Tahap 1: Penginputan oleh Petugas
1. Buka aplikasi, lalu masuk menggunakan akun petugas (contoh: `jeisen` / `738241`).
2. Buka menu **Absensi Petugas**.
3. Perhatikan bahwa **Tanggal terkunci** otomatis pada hari ini dan tombol **Muat Tanggal** disembunyikan.
4. Baris untuk petugas lainnya (Marquez, Mikhaela, dll) terkunci dan tidak bisa diubah statusnya.
5. Pada baris **Jeisen**, ubah status menjadi **Hadir**, bubuhkan tanda tangan di modal, lalu klik **Simpan Tanda Tangan**.
6. Klik tombol **Kirim Kehadiran** di kanan atas. Sistem akan memunculkan pesan pengajuan berhasil. Logout dari akun petugas.

### Tahap 2: Persetujuan oleh Admin
1. Login sebagai Admin (`Yanuar` / `12345678`).
2. Pada **Dashboard Admin**, akan muncul kartu notifikasi **Persetujuan Kehadiran Petugas** yang menampilkan detail pengajuan Jeisen beserta coretan tanda tangannya.
3. Klik tombol **Setujui**. Pengajuan tersebut akan hilang dari daftar tunggu dan masuk ke sistem absensi utama.
4. Buka menu **Absensi Petugas** di panel Admin. Rekapitulasi gaji di bagian bawah akan secara otomatis memperbarui gaji Jeisen bertambah Rp 3.000.
