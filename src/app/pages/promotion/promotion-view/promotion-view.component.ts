import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { forkJoin, Observable } from 'rxjs';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ExcelService } from 'src/app/services/excel.service';
import { saveAs } from 'file-saver';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Tampilan BACA promosi — dokumen, bukan formulir berbaju input.
 * Unduhan hasil Excel dipertahankan persis; aksi ubah dan lihat hasil
 * naik ke kaki dialog, tidak lagi bersembunyi di menu "Aksi lainnya".
 */
@Component({
  selector: 'app-promotion-view',
  templateUrl: './promotion-view.component.html',
  styleUrls: ['./promotion-view.component.scss'],
  providers: [DatePipe],
  imports: [
    NgIf,
    NgFor,
    DecimalPipe,
    DatePipe,
    TranslatePipe,
    CdkDrag,
    CdkDragHandle,
  ],
})
export class PromotionViewComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number; noAction: boolean },
    private apiService: ApiService,
    private excelService: ExcelService,
    private alertService: AlertService,
    private dialog: MatDialogRef<PromotionViewComponent>,
    private translateService: TranslateService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  isLoading: boolean = false;
  isDownloading: boolean = false;

  promo: any = null;
  merek: string[] = [];
  aturan: { rule: string; value: string }[] = [];

  ngOnInit(): void {
    this.fetchByID();
  }

  tutup(): void {
    this.dialog.close();
  }

  /**
   * Unduh hasil promosi — penjualan DAN pembelian dalam satu berkas.
   *
   * Bentuk sebelumnya memanggil POST /promotion/download, endpoint yang TIDAK
   * PERNAH ADA di server: `git log -S` atas seluruh riwayat tidak menemukannya
   * sekali pun. Jadi tombol ini menjawab 404 sejak hari ia ditulis. Pemetaan
   * kolomnya pun sudah keliru — ia membaca good_receipt_code_name, sementara
   * barisnya bernama `name`.
   *
   * Ditulis ulang di atas dua endpoint yang MEMANG ada dan sudah dipakai
   * dialog hasil promosi, jadi tidak ada rute baru di server. Keduanya diambil
   * bersamaan; satu berkas dua lembar lebih berguna daripada dua berkas
   * terpisah, karena pertanyaan yang dijawab promosi selalu membandingkan
   * keduanya.
   *
   * Berkas versi lama menukar kolomnya — "Customer" berisi kode barang dan
   * "Reference" berisi nama pelanggan. Di sini header dan isinya disejajarkan.
   */
  downloadResult(): void {
    if (!this.promo) {
      return;
    }

    this.isDownloading = true;
    const t = (kunci: string) => this.translateService.instant(kunci);

    forkJoin({
      penjualan: this.apiService.get(
        `promotion/result/sales/${this.data.id}`,
      ) as Observable<any>,
      pembelian: this.apiService.get(
        `promotion/result/purchase/${this.data.id}`,
      ) as Observable<any>,
    }).subscribe({
      next: (jawaban) => {
        const barisJual: any[] = jawaban.penjualan?.data ?? [];
        const barisBeli: any[] = jawaban.pembelian?.data ?? [];

        if (barisJual.length === 0 && barisBeli.length === 0) {
          this.alertService.showInfo(t('promotion__download__empty'));
          this.isDownloading = false;
          return;
        }

        const bersih = (x: any) => Number(x.price) - Number(x.discount);
        const nilai = (x: any) => bersih(x) * Number(x.quantity);

        const periode =
          this.promo.endDate == null
            ? t('promotion__download__continuous-end')
            : `${this.datePipe.transform(this.promo.startDate, 'dd MMM yyyy')} – ${this.datePipe.transform(this.promo.endDate, 'dd MMM yyyy')}`;

        const keterangan = [
          this.promo.description,
          this.merek.join(', '),
          this.promo.supplierName,
          `${t('promotion__download__target')} Rp ${Number(this.promo.target).toLocaleString('id-ID')}`,
          periode,
        ]
          .filter((x) => !!x)
          .join(' · ');

        /* Kedua lembar sebentuk; hanya kolom pihak keduanya yang berbeda. */
        const lembar = (
          nama: string,
          judulPihak: string,
          ambilPihak: (x: any) => string,
          judulDokumen: string,
          data: any[],
        ) => ({
          nama,
          judul: `${this.promo.name} — ${nama}`,
          keterangan,
          kolom: [
            {
              judul: t('promotion__download__date'),
              format: 'tanggal' as const,
            },
            { judul: judulDokumen, lebar: 26 },
            { judul: judulPihak, lebar: 26 },
            { judul: t('promotion__download__reference'), lebar: 18 },
            {
              judul: t('promotion__download__quantity'),
              format: 'angka' as const,
            },
            { judul: t('promotion__download__unit'), lebar: 10 },
            { judul: t('promotion__download__price'), format: 'uang' as const },
            {
              judul: t('promotion__download__discount'),
              format: 'uang' as const,
            },
            {
              judul: t('promotion__download__net-price'),
              format: 'uang' as const,
            },
            { judul: t('promotion__download__total'), format: 'uang' as const },
          ],
          baris: data.map((x) => [
            new Date(x.date),
            x.name,
            ambilPihak(x),
            x.reference,
            Number(x.quantity),
            x.unit,
            Number(x.price),
            Number(x.discount),
            bersih(x),
            nilai(x),
          ]),
          totalBaris: [
            'TOTAL',
            null,
            null,
            null,
            data.reduce((a, b) => a + Number(b.quantity), 0),
            null,
            null,
            null,
            null,
            data.reduce((a, b) => a + nilai(b), 0),
          ],
        });

        /* Lembar tanpa satu pun baris dibuang, bukan ditulis kosong. */
        const sheets = [
          barisJual.length
            ? lembar(
                t('promotion__download__sheet-sales'),
                t('promotion__download__customer'),
                (x) => x.customer,
                t('promotion__download__invoice-name'),
                barisJual,
              )
            : null,
          barisBeli.length
            ? lembar(
                t('promotion__download__sheet-purchase'),
                t('promotion__download__supplier'),
                (x) => x.supplier,
                t('promotion__download__good-receipt-name'),
                barisBeli,
              )
            : null,
        ].filter((x) => x != null) as any[];

        this.excelService
          .unduh(
            `${t('promotion__download__file-name')} ${this.data.id}`,
            sheets,
          )
          .then(() => {
            this.alertService.showSuccess(t('promotion__download__success'));
          })
          .catch((galat) => {
            this.alertService.showError(galat);
          })
          .finally(() => {
            this.isDownloading = false;
          });
      },
      error: (galat) => {
        this.alertService.showError(galat);
        this.isDownloading = false;
      },
    });
  }

  fetchByID() {
    this.isLoading = true;
    this.apiService
      .get(`promotion/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.promo = {
            name: data.name,
            description: data.description,
            target: Number(data.target),
            supplierName: data.supplier.name,
            startDate: data.startDate,
            endDate: data.endDate,
            isDelete: data.is_delete,
            createdBy: data.promotion_code_created_by.name,
            createdAt: data.created_at,
          };
          this.merek = (data.promotion_brand ?? []).map(
            (x: any) => x.product_brand.name,
          );
          this.aturan = (data.promotion_rules ?? []).map((x: any) => ({
            rule: x.rule,
            value: x.value,
          }));
        },
        error: (error) => {
          this.alertService.showError(error);
          this.dialog.close();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  openUpdatePromotion() {
    this.dialog.close();
    this.router.navigate(['Administrator', 'Promotion', this.data.id], {
      relativeTo: this.route,
    });
  }

  openPromotionResult() {
    this.dialog.close('result');
  }
}
