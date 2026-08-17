/**
 * Toleransi pembulatan pelunasan, dalam rupiah — kembaran konstanta
 * backend di src/constants/receivable.constant.ts dan harus bernilai
 * sama. Selisih tagihan <= nilai ini dianggap lunas; tanpa toleransi,
 * pembayaran yang dibulatkan kasir menggantungkan dokumen "belum
 * lunas" selamanya.
 */
export const PAYMENT_ROUNDING_TOLERANCE = 5;
