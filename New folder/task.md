# Daftar Tugas - Alur Keamanan Absensi & Persetujuan Kopsis

- [x] Tambahkan skema database `petugasAttendanceRequests` (`database.js`)
- [x] Buat fungsi database pengajuan absensi, persetujuan, dan penolakan (`database.js`)
- [x] Tambahkan kartu notifikasi pengajuan absensi di Dashboard Admin (`index.html`)
- [x] Tampilkan daftar antrean persetujuan absensi di Dashboard Admin (`app.js`)
- [x] Buat logika approval (Setujui / Tolak) yang memindahkan pengajuan ke data absensi utama (`app.js`)
- [x] Batasi hak akses petugas di halaman absensi kopsis (`app.js`):
  - [x] Kunci tanggal otomatis ke hari ini (tidak bisa diubah)
  - [x] Batasi pengisian agar petugas hanya bisa mengisi baris miliknya sendiri
  - [x] Ganti tombol "Simpan" menjadi "Kirim Kehadiran" untuk mengirim data ke antrean persetujuan admin
- [ ] Verifikasi & Pengujian
  - [ ] Uji login petugas kopsis (contoh: `jeisen`) dan kirim absensi hari ini dengan tanda tangan wajib
  - [ ] Uji login admin (`Yanuar`) dan verifikasi kartu pengajuan muncul di dashboard admin
  - [ ] Uji tombol Setujui/Tolak oleh admin dan pastikan nominal gaji diperbarui secara real-time
