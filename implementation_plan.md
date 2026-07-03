# Rencana Implementasi: Fitur Barang Titipan Siswa (Konsinyasi)

Fitur ini memungkinkan siswa untuk menitipkan barang dagangan mereka di Koperasi Sekolah. Sistem akan melacak nama barang, siswa penitip, jumlah yang dititipkan, jumlah barang terjual, sisa stok, serta laporan bagi hasil (dana yang harus dibayarkan ke siswa).

---

## Memerlukan Tinjauan Pengguna

> [!IMPORTANT]
> Barang titipan akan terintegrasi langsung ke dalam katalog produk utama sehingga kasir (Admin) dapat menjual barang tersebut melalui POS Kasir secara normal tanpa alur checkout yang terpisah. 
> Bagian keuntungan koperasi dihitung dari selisih Harga Jual ke Pembeli dan Harga Pemilik (Bagian Siswa).

---

## Detail Perubahan Sistem

### 1. Model Data (`database.js`)
Kami akan memperluas objek produk dengan field tambahan:
- `isConsigned`: boolean (menandakan barang titipan siswa).
- `studentId`: string (ID siswa penitip).
- `ownerPrice`: number (harga modal/bagian uang yang diberikan ke siswa per barang terjual).
- `consignedQty`: number (jumlah total barang yang dititipkan).
- `soldQty`: number (jumlah barang yang sudah laku terjual).
- Dan `stock` akan dihitung secara dinamis: `consignedQty - soldQty`.

Kami juga menambahkan logika di transaksi POS: saat barang konsinyasi terjual, sistem otomatis meningkatkan `soldQty`.

### 2. Antarmuka Admin (`index.html`)
- Menambahkan tab menu **"Barang Titipan"** di sidebar Admin.
- Membuat halaman `admin-page-consignment` berisi:
  - Tombol **"Daftarkan Barang Titipan"**.
  - Tabel Daftar Barang Titipan: Nama Barang, Siswa Penitip, Jumlah Dititipkan, Terjual, Sisa Stok, Bagian Siswa (Harga Pemilik), Akumulasi Pendapatan Siswa (Terjual × Harga Pemilik), dan Status/Aksi.
- Membuat Modal Form `modal-consignment` untuk input barang titipan baru.

### 3. Antarmuka Siswa (`index.html`)
- Menambahkan menu **"Titipan Saya"** di navbar Siswa.
- Membuat halaman `siswa-page-my-consignment` agar siswa bisa memantau barang jualan mereka sendiri secara transparan (stok awal, jumlah terjual, dan dana yang siap diambil dari koperasi).

### 4. Logika Aplikasi (`app.js`)
- Mengatur rendering data barang titipan di dashboard Admin dan dashboard Siswa.
- Membuat handler pengisian form pendaftaran barang titipan baru.
- Menambahkan fitur pembayaran bagi hasil (settle) di sisi Admin ketika uang hasil penjualan sudah diserahkan ke siswa.

---

## Rencana Verifikasi

### Pengujian Manual
1. Login sebagai Admin (`Yanuar`).
2. Masuk ke menu **Barang Titipan** dan klik **Daftarkan Barang Titipan**.
3. Isi data: nama barang "Kripik Pisang", penitip "Ahmad Fauzi", jumlah "20", harga jual "5000", harga pemilik "4500".
4. Buka **POS Kasir**, cari "Kripik Pisang", tambahkan ke keranjang, dan lakukan checkout transaksi.
5. Periksa menu **Barang Titipan** lagi, pastikan jumlah Terjual menjadi `1`, sisa stok `19`, dan dana bagi hasil siswa terhitung `Rp 4.500`.
6. Logout, lalu login sebagai Siswa (`siswa` - Ahmad Fauzi).
7. Buka menu **Titipan Saya**, pastikan siswa dapat melihat barang "Kripik Pisang" miliknya beserta data penjualannya.
