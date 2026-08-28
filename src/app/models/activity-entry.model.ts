/**
 * Satu baris jejak aktivitas, sesuai balasan GET /audit-logs.
 *
 * `changes` memuat nilai yang DITETAPKAN, tanpa nilai sebelumnya: mengetahui
 * nilai lama menuntut satu pembacaan tambahan sebelum setiap tulisan di server.
 *
 * `note` terisi ketika jejaknya lahir dari dalam transaksi. Baris seperti itu
 * tidak ikut dibatalkan bila transaksinya gagal, sehingga bisa saja menyebut
 * perubahan yang pada akhirnya tidak tersimpan.
 */
export interface ActivityEntry {
  id: number;
  entity: string;
  entityID: number | null;
  action: string;
  userID: number | null;
  userName: string | null;
  changes: Record<string, { to: unknown }> | null;
  note: string | null;
  /**
   * Alamat asal permintaan.
   *
   * null pada dua keadaan yang berbeda dan sama-sama sah: jejak yang lahir
   * dari perintah CLI atau pekerjaan latar — di sana memang tidak ada
   * permintaan HTTP — dan jejak lama yang tercatat sebelum kolomnya ada.
   * Keduanya ditampilkan sebagai tanda pisah, bukan alamat karangan.
   */
  ip: string | null;
  /**
   * Avatar pemiliknya, bila ia pernah mengaturnya.
   *
   * Bentuknya cerminan tabel user_avatar: top, accessories, clothes, eyes,
   * eyebrows, mouth (angka), color (teks), circle (boolean).
   *
   * Sengaja `any`, sama seperti topbar dan halaman pengaturan: app-avatar
   * menuntut tipe enum untuk tiap ruasnya, sementara yang datang dari server
   * angka biasa yang boleh null. Menuliskan enumnya di sini berarti berbohong
   * tentang bentuk balasan; menuliskan `number | null` membuat pengikatannya
   * ditolak kompilasi. Seluruh aplikasi memilih jalan yang sama.
   */
  userAvatar: any | null;
  createdAt: string;
}
