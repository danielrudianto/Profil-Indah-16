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
   * Ruas jalur SETELAH awalan peran, misalnya "Sales-invoice" pada
   * /Administrator/Sales-invoice.
   *
   * Disimpan tanpa awalan supaya satu daftar melayani keempat shell — dan
   * supaya penggabungan menjadi satu pohon rute nanti hanya perlu mengosongkan
   * awalannya, bukan menulis ulang daftarnya.
   */
  path: string;
  /**
   * Shell yang BENAR-BENAR memuat rute ini, berurutan sesuai pilihan.
   *
   * Keempat subpohon peran dibangun satu per satu dan isinya tidak sama.
   * /Purchasing punya Good-receipt, /Administrator tidak — padahal
   * AdministratorGuard jelas mengizinkan peran 5 membukanya. Menyusun jalur
   * dari awalan milik PERAN, seperti sebelumnya, menghasilkan
   * /Administrator/Good-receipt: alamat yang tidak pernah ada, dan menunya
   * diam saja ketika ditekan.
   *
   * Daftar ini menyatakan kenyataan rutenya. SidenavComponent memakai awalan
   * shell pengguna bila rutenya memang ada di sana, dan kalau tidak, jatuh ke
   * shell pertama di daftar ini — yang penjaganya selalu memuat setiap peran
   * yang ditawari menu ini.
   *
   * Ketika keempat subpohon digabung menjadi satu pohon nanti, bidang ini
   * ikut hilang bersama `base`.
   */
  shells: string[];
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
  { label: 'nav__sales_invoice', icon: 'ph ph-receipt', path: 'Sales-invoice', shells: ['Sales', 'Administrator'], group: 'menu', roles: SALES },
  { label: 'nav__purchase_invoice', icon: 'ph ph-file-text', path: 'Purchase-invoice', shells: ['Administrator'], group: 'menu', roles: ADMIN },
  { label: 'nav__good_receipt', icon: 'ph ph-package', path: 'Good-receipt', shells: ['Purchasing'], group: 'menu', roles: PURCHASING },
  { label: 'nav__sales_return', icon: 'ph ph-arrow-u-up-left', path: 'Sales-return', shells: ['Sales', 'Administrator'], group: 'menu', roles: SALES },
  { label: 'nav__deposit', icon: 'ph ph-hand-coins', path: 'Deposit', shells: ['Sales', 'Administrator'], group: 'menu', roles: SALES },
  { label: 'nav__receivable', icon: 'ph ph-notebook', path: 'Receivable', shells: ['Sales', 'Administrator'], group: 'menu', roles: SALES },
  { label: 'nav__overpayment', icon: 'ph ph-arrows-counter-clockwise', path: 'Overpayment', shells: ['Sales', 'General', 'Administrator'], group: 'menu', roles: SALES },
  { label: 'nav__expense', icon: 'ph ph-trend-down', path: 'Expense', shells: ['General', 'Administrator'], group: 'menu', roles: GENERAL },
  { label: 'nav__adjustment_case', icon: 'ph ph-sliders', path: 'Adjustment-case', shells: ['Administrator'], group: 'menu', roles: ADMIN },

  /* ---------------------------------------------------------------- */
  /* Master                                                            */
  /* ---------------------------------------------------------------- */
  { label: 'nav__product', icon: 'ph ph-archive', path: 'Product', shells: ['Purchasing', 'Administrator'], group: 'master', roles: PURCHASING },
  { label: 'nav__product_brand', icon: 'ph ph-tag-simple', path: 'Product-brand', shells: ['Purchasing', 'Administrator'], group: 'master', roles: PURCHASING },
  { label: 'nav__product_type', icon: 'ph ph-squares-four', path: 'Product-type', shells: ['Purchasing', 'Administrator'], group: 'master', roles: PURCHASING },
  { label: 'nav__stock', icon: 'ph ph-stack', path: 'Stock', shells: ['Purchasing', 'Sales', 'General', 'Administrator'], group: 'master', roles: SEMUA_OPERASIONAL },
  { label: 'nav__package', icon: 'ph ph-shapes', path: 'Package', shells: ['Purchasing', 'Sales', 'Administrator'], group: 'master', roles: SEMUA_OPERASIONAL },
  { label: 'nav__price_sales', icon: 'ph ph-tag', path: 'Price/Sales', shells: ['Sales', 'Administrator'], group: 'master', roles: SALES },
  { label: 'nav__price_purchase', icon: 'ph ph-tag', path: 'Price/Purchase', shells: ['Sales', 'Administrator'], group: 'master', roles: ADMIN },
  { label: 'nav__promotion', icon: 'ph ph-megaphone', path: 'Promotion', shells: ['Administrator'], group: 'master', roles: ADMIN },
  { label: 'nav__customer', icon: 'ph ph-users', path: 'Customer', shells: ['Sales', 'Administrator'], group: 'master', roles: SALES },
  { label: 'nav__supplier', icon: 'ph ph-truck', path: 'Supplier', shells: ['Purchasing', 'Administrator'], group: 'master', roles: PURCHASING },

  /* ---------------------------------------------------------------- */
  /* Administrator                                                     */
  /* ---------------------------------------------------------------- */
  { label: 'nav__user', icon: 'ph ph-users-three', path: 'User', shells: ['Administrator'], group: 'administrator', roles: ADMIN },
  { label: 'nav__company', icon: 'ph ph-buildings', path: 'Company', shells: ['General', 'Administrator'], group: 'administrator', roles: GENERAL },
  { label: 'nav__payment_method', icon: 'ph ph-credit-card', path: 'Payment-method', shells: ['General', 'Administrator'], group: 'administrator', roles: GENERAL },
  { label: 'nav__expense_type', icon: 'ph ph-list-checks', path: 'Expense-type', shells: ['General', 'Administrator'], group: 'administrator', roles: GENERAL },
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
   * Isi kaki navigasi tidak tinggal di subpohon peran mana pun: pengaturan ada
   * di akar, dan jejak aktivitas ada di bawah /Administrator apa pun peran yang
   * sedang membukanya. Menambahkan awalan shell justru mengantar ke alamat yang
   * tidak ada.
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
  { label: 'nav__activity', icon: 'ph ph-pulse', path: '/Administrator/Activity', roles: ADMIN },
];
