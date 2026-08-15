/**
 * Satuan barang yang boleh dipakai.
 *
 * Daftarnya TETAP, bukan diambil dari server: satuan di sini menentukan cara
 * stok dihitung, dan membiarkan pengguna mengarang satuan baru membuat dua
 * barang yang sama dicatat dengan satuan yang berbeda — "PCS" dan "pcs" dan
 * "Pieces" — yang tidak akan pernah bisa dijumlahkan.
 *
 * Sebelumnya daftar yang sama ditulis langsung di template halaman tambah
 * barang sebagai empat belas <mat-option>.
 */
export interface ProductUnit {
  /** Nilai yang dikirim ke server. */
  value: string;
  /** Yang dibaca pengguna; sama dengan nilainya kecuali bila perlu penjelasan. */
  label: string;
}

export const PRODUCT_UNITS: ProductUnit[] = [
  { value: 'PCS', label: 'PCS' },
  { value: 'SET', label: 'SET' },
  { value: 'BOX', label: 'BOX' },
  { value: 'LEMBAR', label: 'LEMBAR' },
  { value: 'BATANG', label: 'BATANG' },
  { value: 'KALENG', label: 'KALENG' },
  { value: 'GALON', label: 'GALON' },
  { value: 'BLEK', label: 'BLEK' },
  { value: 'METER', label: 'METER' },
  { value: 'ROLL', label: 'ROLL' },
  { value: 'TUBE', label: 'TUBE' },
  { value: 'PASANG', label: 'PASANG' },
  { value: 'M2', label: 'M² (METER PERSEGI)' },
  { value: 'KG', label: 'KG' },
];
