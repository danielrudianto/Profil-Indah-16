/**
 * Peran pengguna.
 *
 * Nilainya harus sama dengan kolom `user.role` di basis data dan dengan
 * UserRoleModel.roles di backend — keduanya memakai angka yang sama, dan
 * penjaga di server membandingkannya apa adanya.
 *
 * Angka 4 memang tidak dipakai; penomorannya berlubang sejak awal dan
 * merapikannya sekarang berarti menyentuh baris pengguna yang sudah ada.
 */
export enum Role {
  Purchasing = 1,
  Sales = 2,
  /** Penjualan dan pembelian sekaligus, ditambah menu umum. */
  General = 3,
  Administrator = 5,
  /**
   * BELUM AKTIF. Gudang belum punya subpohon rute maupun halaman sendiri di
   * frontend, dan tidak masuk daftar penjaga mana pun di backend — pengguna
   * dengan peran ini bisa masuk tetapi tidak dapat membuka apa pun.
   *
   * Sengaja tidak dicantumkan pada item menu di navigation.constant.ts:
   * menampilkan menu yang ujungnya ditolak server lebih buruk daripada tidak
   * menampilkannya sama sekali.
   */
  Warehouse = 6,
  /** Pemilik. Satu-satunya yang boleh menghapus dan menyetujui penyesuaian stok. */
  Owner = 7,
}

/** Peran yang boleh membuka menu administrator. */
export const ADMIN_ROLES: Role[] = [Role.Administrator, Role.Owner];
