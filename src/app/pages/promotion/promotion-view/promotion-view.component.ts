import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
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
  imports: [NgIf, NgFor, DecimalPipe, DatePipe, TranslatePipe],
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

  downloadResult(): void {
    this.isDownloading = true;
    this.apiService
      .post('promotion/download', this.data)
      .subscribe({
        next: (data: any) => {
          this.alertService.showInfo(
            this.translateService.instant('promotion__download__waiting'),
          );

          const t = (kunci: string) => this.translateService.instant(kunci);
          const periode =
            data.data.end == null
              ? t('promotion__download__continuous-end')
              : `${this.datePipe.transform(data.data.start, 'dd MMM yyyy')} – ${this.datePipe.transform(data.data.end, 'dd MMM yyyy')}`;

          this.excelService
            .unduh(t('promotion__download__file-name'), [
              {
                nama: t('promotion__download__sheet-name'),
                judul: data.data.name,
                keterangan: `${data.data.description} · ${data.data.brand.name} · ${data.data.supplier.name} · Target Rp ${Number(data.data.target).toLocaleString('id-ID')} · ${periode}`,
                kolom: [
                  { judul: t('promotion__download__date'), format: 'tanggal' },
                  {
                    judul: t('promotion__download__good-receipt-name'),
                    lebar: 28,
                  },
                  { judul: t('promotion__download__value'), format: 'uang' },
                ],
                baris: (data.result as any[]).map((element) => [
                  new Date(element.date),
                  element.good_receipt_code_name,
                  element.value,
                ]),
                totalBaris: [
                  'TOTAL',
                  null,
                  (data.result as any[]).reduce(
                    (a, b) => a + Number(b.value),
                    0,
                  ),
                ],
              },
              {
                nama: t('promotion__download__sheet-item-name'),
                judul: t('promotion__download__sheet-item-name'),
                keterangan: data.data.name,
                kolom: [
                  { judul: t('promotion__download__date'), format: 'tanggal' },
                  {
                    judul: t('promotion__download__good-receipt-name'),
                    lebar: 28,
                  },
                  { judul: t('promotion__download__reference'), lebar: 18 },
                  {
                    judul: t('promotion__download__quantity'),
                    format: 'angka',
                  },
                  { judul: t('promotion__download__unit'), lebar: 10 },
                  { judul: t('promotion__download__price'), format: 'uang' },
                  { judul: t('promotion__download__discount'), format: 'uang' },
                  {
                    judul: t('promotion__download__total_unit_price'),
                    format: 'uang',
                  },
                  { judul: t('promotion__download__total'), format: 'uang' },
                ],
                baris: (data.items as any[]).map((element) => [
                  new Date(element.date),
                  element.good_receipt_code_name,
                  element.reference,
                  element.quantity,
                  element.unit,
                  element.price,
                  element.discount,
                  Number(element.price) - Number(element.discount),
                  (Number(element.price) - Number(element.discount)) *
                    element.quantity,
                ]),
              },
            ])
            .then(() => {
              this.alertService.showSuccess(
                this.translateService.instant('promotion__download__success'),
              );
            });
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isDownloading = false;
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
