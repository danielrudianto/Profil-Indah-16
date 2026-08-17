import { Role } from './role.constant';

/**
 * Satu-satunya daftar menu aplikasi.
 *
 * Sebelumnya menu ditulis tangan EMPAT KALI, di empat template shell peran
 * (sales, purchasing, general, administrator). Akibatnya menambah satu halaman
 * berarti menyunting empat berkas, perbedaan kecil di antaranya tidak pernah
 * ketahuan, dan Gudang tidak punya menu sama sekali karena tidak ada template
 * yang mewakilinya.
 *
 * HAK AKSESNYA DITURUNKAN DARI PENJAGA, bukan dari template. Sebuah halaman
 * yang berada di bawah /Sales dijaga SalesGuard — [2, 3, 5, 7] — jadi itulah
 * daftar perannya, bukan "peran yang kebetulan templatenya menyebutkan".
 * Halaman yang muncul di beberapa subpohon mengambil gabungan keduanya.
 *
 * DAFTAR INI TIDAK MENGGANTIKAN PENJAGAAN. Menyembunyikan menu hanya merapikan
 * tampilan; yang benar-benar menahan akses tetap guard di frontend dan
 * middleware di backend.
 */

export type NavGroup = 'menu' | 'master' | 'administrator';

export interface NavItem {
  /** Kunci i18n untuk labelnya. */
  label: string;
  /** Ikon Phosphor, ditulis lengkap dengan awalannya. */
  icon: string;
  /**
   * Jalur halaman, misalnya "Sales-invoice" pada /Sales-invoice.
   *
   * Sejak keempat subpohon peran digabung menjadi satu pohon, tidak ada lagi
   * awalan peran di depannya.
   */
  path: string;
  group: NavGroup;
  roles: Role[];
}

const SALES = [Role.Sales, Role.General, Role.Administrator, Role.Owner];
const PURCHASING = [
  Role.Purchasing,
  Role.General,
  Role.Administrator,
  Role.Owner,
];
const GENERAL = [Role.General, Role.Administrator, Role.Owner];
const ADMIN = [Role.Administrator, Role.Owner];
const SEMUA_OPERASIONAL = [
  Role.Purchasing,
  Role.Sales,
  Role.General,
  Role.Administrator,
  Role.Owner,
];

export const NAV_ITEMS: NavItem[] = [
  /* ---------------------------------------------------------------- */
  /* Transaksi                                                        */
  /* ---------------------------------------------------------------- */
  { label: 'nav__sales_invoice', icon: 'ph ph-receipt', path: 'Sales-invoice', group: 'menu', roles: SALES },
  { label: 'nav__purchase_invoice', icon: 'ph ph-file-text', path: 'Purchase-invoice', group: 'menu', roles: ADMIN },
  { label: 'nav__good_receipt', icon: 'ph ph-package', path: 'Good-receipt', group: 'menu', roles: PURCHASING },
  { label: 'nav__sales_return', icon: 'ph ph-arrow-u-up-left', path: 'Sales-return', group: 'menu', roles: SALES },
  { label: 'nav__deposit', icon: 'ph ph-hand-coins', path: 'Deposit', group: 'menu', roles: SALES },
  { label: 'nav__receivable', icon: 'ph ph-notebook', path: 'Receivable', group: 'menu', roles: SALES },
  { label: 'nav__overpayment', icon: 'ph ph-arrows-counter-clockwise', path: 'Overpayment', group: 'menu', roles: SALES },
  { label: 'nav__expense', icon: 'ph ph-trend-down', path: 'Expense', group: 'menu', roles: GENERAL },
  { label: 'nav__adjustment_case', icon: 'ph ph-sliders', path: 'Adjustment-case', group: 'menu', roles: ADMIN },
  /* Perannya menjiplak OperationalGuard di rutenya; muka laporannya sendiri
     menyaring kartu per peran lebih lanjut. */
  { label: 'nav__report', icon: 'ph ph-chart-bar', path: 'Report', group: 'menu', roles: SEMUA_OPERASIONAL },

  /* ---------------------------------------------------------------- */
  /* Master                                                            */
  /* ---------------------------------------------------------------- */
  { label: 'nav__product', icon: 'ph ph-archive', path: 'Product', group: 'master', roles: PURCHASING },
  { label: 'nav__product_brand', icon: 'ph ph-tag-simple', path: 'Product-brand', group: 'master', roles: PURCHASING },
  { label: 'nav__product_type', icon: 'ph ph-squares-four', path: 'Product-type', group: 'master', roles: PURCHASING },
  { label: 'nav__stock', icon: 'ph ph-stack', path: 'Stock', group: 'master', roles: SEMUA_OPERASIONAL },
  { label: 'nav__package', icon: 'ph ph-shapes', path: 'Package', group: 'master', roles: SEMUA_OPERASIONAL },
  { label: 'nav__price_sales', icon: 'ph ph-tag', path: 'Price/Sales', group: 'master', roles: SALES },
  { label: 'nav__price_purchase', icon: 'ph ph-tag', path: 'Price/Purchase', group: 'master', roles: ADMIN },
  { label: 'nav__promotion', icon: 'ph ph-megaphone', path: 'Promotion', group: 'master', roles: ADMIN },
  { label: 'nav__customer', icon: 'ph ph-users', path: 'Customer', group: 'master', roles: SALES },
  { label: 'nav__supplier', icon: 'ph ph-truck', path: 'Supplier', group: 'master', roles: PURCHASING },

  /* ---------------------------------------------------------------- */
  /* Administrator                                                     */
  /* ---------------------------------------------------------------- */
  { label: 'nav__user', icon: 'ph ph-users-three', path: 'User', group: 'administrator', roles: ADMIN },
  { label: 'nav__company', icon: 'ph ph-buildings', path: 'Company', group: 'administrator', roles: GENERAL },
  { label: 'nav__payment_method', icon: 'ph ph-credit-card', path: 'Payment-method', group: 'administrator', roles: GENERAL },
  { label: 'nav__expense_type', icon: 'ph ph-list-checks', path: 'Expense-type', group: 'administrator', roles: GENERAL },
];

/** Urutan tampil dan kunci i18n judul tiap grup. */
export const NAV_GROUPS: { key: NavGroup; label: string }[] = [
  { key: 'menu', label: 'nav__group_menu' },
  { key: 'master', label: 'nav__group_master' },
  { key: 'administrator', label: 'nav__group_administrator' },
];

/* ------------------------------------------------------------------ */
/* Kaki navigasi                                                       */
/* ------------------------------------------------------------------ */

export interface NavFooterItem {
  label: string;
  icon: string;
  /**
   * Jalur PENUH, bukan potongan seperti pada NavItem.
   *
   * Sekarang seluruh rute berada di satu pohon, jadi bedanya dengan NavItem
   * tinggal garis miring di depannya.
   */
  path: string;
  roles: Role[];
}

/**
 * Tautan yang MENETAP di dasar navigasi, tidak ikut menggulung bersama daftar
 * menu.
 *
 * Isinya bukan tempat bekerja melainkan jalan keluar, dan jalan keluar harus
 * selalu ada di tempat yang sama. Menaruhnya di ujung daftar yang panjang
 * berarti pengguna menggulung sampai habis hanya untuk keluar.
 *
 * "Keluar" tidak ada di sini karena ia perbuatan, bukan alamat — lihat
 * SidenavComponent.
 *
 * Jejak aktivitas dijaga AdministratorGuard di frontend dan
 * administratorMiddleware di server, jadi daftar perannya mengikuti itu, bukan
 * diperlebar supaya menunya terlihat ramai.
 */
export const NAV_FOOTER: NavFooterItem[] = [
  { label: 'nav__settings', icon: 'ph ph-gear', path: '/Settings', roles: [...SEMUA_OPERASIONAL, Role.Warehouse] },
  { label: 'nav__activity', icon: 'ph ph-pulse', path: '/Activity', roles: ADMIN },
];
