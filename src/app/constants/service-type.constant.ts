/**
 * Jenis jasa yang boleh ditagihkan pada faktur penjualan dan setoran.
 *
 * Cerminan src/constants/service-type.constant.ts di backend. Sengaja
 * konstanta, bukan data master yang bisa diisi tangan: isinya tiga dan sudah
 * begitu bertahun-tahun, sementara master yang bisa diketik di sistem ini
 * terbukti selalu kembar.
 *
 * NILAI-nya yang dikirim ke server dan tersimpan; labelnya diterjemahkan
 * lewat kunci i18n supaya layar Inggris tidak menampilkan istilah Indonesia
 * dan sebaliknya.
 */
export enum ServiceType {
  CNC = 'CNC',
  Frame = 'FRAME',
  Solid = 'SOLID',
}

export const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: ServiceType.CNC, label: 'service-type__cnc' },
  { value: ServiceType.Frame, label: 'service-type__frame' },
  { value: ServiceType.Solid, label: 'service-type__solid' },
];
