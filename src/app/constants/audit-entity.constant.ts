/**
 * Entitas yang muncul pada penyaring halaman aktivitas.
 *
 * Nilainya harus sama persis dengan nama tabel di basis data, karena pencatat
 * di server memakai nama model Prisma apa adanya. Penyaring yang memakai
 * bentuk jamak buatan sendiri tidak akan menemukan apa pun — dan kegagalannya
 * tidak menimbulkan galat, hanya menghasilkan tabel kosong.
 *
 * Daftarnya harus sejalan dengan AUDITED_MODELS di
 * profilIndahNode/src/constants/audit.constant.ts.
 */
export const AUDITED_ENTITIES: string[] = [
  'user',
  'customer',
  'supplier',
  'company',
  'product',
  'product_brand',
  'product_type',
  'product_unit',
  'payment_method',
  'expense',
  'expense_type',
  'promotion_code',
  'sales_invoice_code',
  'sales_deposit_code',
  'sales_return_code',
  'good_receipt_code',
  'adjustment_case_code',
  'package_code',
  'overpayment',
  'receivable',
];
