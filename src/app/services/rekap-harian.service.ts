import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { ApiService } from './api.service';
import { AlertService } from './alert.service';
import { ExcelService, SheetExcel } from './excel.service';
import { TIPE_REKAP_HARIAN } from '../constants/rekap-harian.constant';

/**
 * Rekap stok harian — hidup kembali dari dashboard umum lama.
 *
 * Satu berkas Excel berisi mutasi stok HARI INI untuk tipe-tipe komoditas
 * inti (lihat TIPE_REKAP_HARIAN): satu sheet per tipe, tiap barisnya stok
 * awal, seluruh mutasi, dan stok akhir — dipakai mencocokkan stok fisik
 * dengan catatan setiap sore. Logikanya diangkat ke service supaya dashboard
 * administrator dan dashboard umum mengunduh dari sumber yang sama.
 */
@Injectable({ providedIn: 'root' })
export class RekapHarianService {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private excelService: ExcelService,
  ) {}

  sedangUnduh = false;

  unduh(): void {
    if (this.sedangUnduh) {
      return;
    }

    this.sedangUnduh = true;
    const kini = new Date();

    this.apiService
      .post('report/daily-sales', {
        day: kini.getDate(),
        month: kini.getMonth() + 1,
        year: kini.getFullYear(),
        type: TIPE_REKAP_HARIAN,
        group: 'type',
      })
      .subscribe({
        next: (data: any) => {
          const tanggal = `${kini.getFullYear()}-${String(kini.getMonth() + 1).padStart(2, '0')}-${String(kini.getDate()).padStart(2, '0')}`;

          /*
            Endpoint-nya kini mengirim daftar DATAR per barang — bukan
            {name, items} seperti yang diharapkan ekspor lamanya, yang
            berarti ekspor lamanya sudah lama patah diam-diam. Di sini
            barisnya dikelompokkan ulang per tipe, dan hanya yang BERGERAK
            hari itu yang ditulis: rekap sore memang tentang mutasi, dan
            ribuan baris nol hanya menenggelamkannya.
          */
          const perTipe = new Map<string, any[]>();
          for (const x of data as any[]) {
            const mutasi =
              Number(x.goodReceipt ?? 0) +
              Number(x.salesInvoice ?? 0) +
              Number(x.salesReturn ?? 0) +
              Number(x.adjustmentCase?.found ?? 0) +
              Number(x.adjustmentCase?.lost ?? 0);
            if (mutasi === 0) {
              continue;
            }
            const tipe = x.product_type?.name ?? '-';
            if (!perTipe.has(tipe)) {
              perTipe.set(tipe, []);
            }
            perTipe.get(tipe)!.push(x);
          }

          const sheets: SheetExcel[] = [...perTipe.entries()].map(
            ([tipe, isi]) => ({
              nama: tipe,
              judul: `Rekap stok harian — ${tipe}`,
              keterangan: `${tanggal} · hanya barang yang bergerak hari ini`,
              kolom: [
                { judul: 'Reference', lebar: 18 },
                { judul: 'Description', lebar: 42 },
                { judul: 'Brand', lebar: 16 },
                { judul: 'Penerimaan', format: 'angka' as const },
                { judul: 'Penjualan', format: 'angka' as const },
                { judul: 'Retur penjualan', format: 'angka' as const },
                { judul: 'Penyesuaian ditemukan', format: 'angka' as const },
                { judul: 'Penyesuaian hilang', format: 'angka' as const },
                { judul: 'Mutasi bersih', format: 'angka' as const },
              ],
              baris: isi.map((x) => [
                x.reference,
                x.description,
                x.product_brand?.name ?? '',
                Number(x.goodReceipt ?? 0),
                Number(x.salesInvoice ?? 0),
                Number(x.salesReturn ?? 0),
                Number(x.adjustmentCase?.found ?? 0),
                Number(x.adjustmentCase?.lost ?? 0),
                Number(x.goodReceipt ?? 0) +
                  Number(x.salesInvoice ?? 0) +
                  Number(x.salesReturn ?? 0) +
                  Number(x.adjustmentCase?.found ?? 0) +
                  Number(x.adjustmentCase?.lost ?? 0),
              ]),
            }),
          );

          if (sheets.length === 0) {
            sheets.push({
              nama: 'Rekap',
              judul: 'Rekap stok harian',
              keterangan: `${tanggal} · tidak ada mutasi hari ini`,
              kolom: [{ judul: 'Keterangan', lebar: 44 }],
              baris: [['Tidak ada mutasi stok pada tipe yang dipantau.']],
            });
          }

          this.excelService
            .unduh(`Rekap_stok_harian_${tanggal}`, sheets)
            .then(() => {
              this.alertService.showSuccess(
                this.translateService.instant(
                  'daily-report__export__successful',
                ),
              );
            });
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.sedangUnduh = false;
      });
  }
}
