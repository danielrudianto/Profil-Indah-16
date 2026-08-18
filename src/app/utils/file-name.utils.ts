/*
  Nama berkas cetakan mengikuti NOMOR DOKUMENNYA — "SI-2026-00123.pdf",
  bukan "Sales_invoice1755512345678.pdf" — supaya berkas yang tersimpan
  bisa dikenali tanpa dibuka. Karakter yang dilarang sistem berkas
  diganti strip; nomor yang kosong jatuh ke nama cadangan pemanggil.
*/
export function namaBerkasDokumen(
  nomor: string | null | undefined,
  cadangan: string,
): string {
  const bersih = (nomor ?? '').replace(/[\\/:*?"<>|]/g, '-').trim();
  return bersih || cadangan;
}
