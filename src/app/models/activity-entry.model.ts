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
  createdAt: string;
}
