import { Role } from './role.constant';

/**
 * Awalan jalur navigasi untuk tiap peran.
 *
 * Dashboard utama tidak mengalihkan pengguna ke mana-mana; ia menentukan
 * NAVIGASI MANA yang ditampilkan. Nilai di sini adalah awalan yang dipakai
 * item menunya — lihat masukan `base` pada SidenavComponent.
 *
 * Diperlukan selama keempat subpohon peran masih berdiri sendiri
 * (/Sales/Stock, /Administrator/Stock, dan seterusnya menunjuk halaman yang
 * sama). Ketika rutenya digabung menjadi satu pohon nanti, peta ini menjadi
 * tidak perlu dan `base` cukup dikosongkan.
 *
 * Peran 3 memakai General meskipun ia juga berhak atas halaman penjualan dan
 * pembelian: daftar menunya sendiri sudah memuat ketiganya, dan awalan ini
 * hanya menentukan subpohon mana yang dilalui.
 */
export const ROLE_NAV_BASE: Record<number, string> = {
  [Role.Purchasing]: 'Purchasing',
  [Role.Sales]: 'Sales',
  [Role.General]: 'General',
  [Role.Administrator]: 'Administrator',
  [Role.Owner]: 'Administrator',
};

/**
 * Awalan bagi peran yang belum punya subpohon sendiri — saat ini hanya Gudang.
 *
 * Navigasinya akan kosong, dan itu memang keadaan sebenarnya: peran tersebut
 * belum punya halaman mana pun. Menampilkan menu milik peran lain justru
 * mengarahkan ke halaman yang akan ditolak server.
 */
export const ROLE_NAV_BASE_FALLBACK = '';
