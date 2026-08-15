/**
 * Kartu ringkasan angka pada dashboard.
 *
 * Sebelumnya dideklarasikan di dalam dashboard.component.ts dan diimpor dari
 * sana oleh dashboard tiap peran. Dipindahkan ke berkasnya sendiri ketika
 * halaman itu dirombak: antarmuka yang dipakai beberapa komponen tidak layak
 * menumpang pada berkas komponen lain, karena merombak komponennya lalu
 * mematahkan berkas yang sama sekali tidak disentuh.
 */
export interface StatCard {
  title: string;
  value: number;
  previousValue?: number;
  againstText?: string;
}
