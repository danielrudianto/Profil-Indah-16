import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as xlsx from 'xlsx';
import { saveAs } from 'file-saver';

import { ApiService } from './api.service';
import { AlertService } from './alert.service';
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
          this.tulisExcel(data, kini);
          this.alertService.showSuccess(
            this.translateService.instant('daily-report__export__successful'),
          );
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.sedangUnduh = false;
      });
  }

  private tulisExcel(data: any[], kini: Date): void {
    const workbook: xlsx.WorkBook = xlsx.utils.book_new();

    for (const kelompok of data) {
      const baris: any[][] = [
        [
          'Reference',
          'Description',
          'Unit',
          'Brand',
          'Type',
          'Initial Stock',
          'Adjustment Input',
          'Adjustment Output',
          'Good Receipt Input',
          'Bill Output',
          'Sales Return',
          'Final Stock',
        ],
      ];

      for (const item of kelompok.items) {
        /* Mutasi keluar sudah bertanda negatif; stok akhir tinggal jumlah. */
        const stokAkhir =
          Number(item.initialStock) +
          Number(item.adjustment_input) +
          Number(item.adjustment_output) +
          Number(item.good_receipt_input) +
          Number(item.bill_output) +
          Number(item.sales_return);

        baris.push([
          item.reference,
          item.description,
          item.unit,
          item.brand,
          item.type,
          item.initialStock,
          item.adjustment_input,
          item.adjustment_output,
          item.good_receipt_input,
          item.bill_output,
          item.sales_return,
          stokAkhir,
        ]);
      }

      const worksheet = xlsx.utils.aoa_to_sheet(baris);
      xlsx.utils.book_append_sheet(workbook, worksheet, kelompok.name);
    }

    const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const tanggal = `${kini.getFullYear()}-${String(kini.getMonth() + 1).padStart(2, '0')}-${String(kini.getDate()).padStart(2, '0')}`;
    saveAs(blob, `Rekap_stok_harian_${tanggal}.xlsx`);
  }
}
