import { DatePipe, DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import * as xlsx from 'xlsx';
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
    private alertService: AlertService,
    private dialog: MatDialogRef<PromotionViewComponent>,
    private translateService: TranslateService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute
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
            this.translateService.instant('promotion__download__waiting')
          );

          const worksheet: xlsx.WorkSheet = xlsx.utils.aoa_to_sheet([]);
          xlsx.utils.sheet_add_aoa(worksheet, [
            [this.translateService.instant('promotion__download__sheet-name')],
          ]);

          xlsx.utils.sheet_add_aoa(worksheet, [
            [
              this.translateService.instant('promotion__download__name'),
              data.data.name,
            ],
            [
              this.translateService.instant('promotion__download__description'),
              data.data.description,
            ],
            [
              this.translateService.instant('promotion__download__brand'),
              data.data.brand.name,
            ],
            [
              this.translateService.instant('promotion__download__supplier'),
              data.data.supplier.name,
            ],
            [
              this.translateService.instant('promotion__download__target'),
              data.data.target,
            ],
            [
              this.translateService.instant('promotion__download__start-date'),
              this.datePipe.transform(data.data.start, 'dd MMM yyyy'),
            ],
            [
              this.translateService.instant('promotion__download__end-date'),
              data.data.end == null
                ? this.translateService.instant(
                    'promotion__download__continuous-end'
                  )
                : this.datePipe.transform(data.data.end, 'dd MMM yyyy'),
            ],
          ]);

          const worksheetItems: xlsx.WorkSheet = xlsx.utils.aoa_to_sheet([]);
          xlsx.utils.sheet_add_aoa(worksheetItems, [
            [
              this.translateService.instant(
                'promotion__download__sheet-item-name'
              ),
            ],
          ]);

          // Add table headers
          xlsx.utils.sheet_add_aoa(
            worksheet,
            [
              [
                this.translateService.instant('promotion__download__date'),
                this.translateService.instant(
                  'promotion__download__good-receipt-name'
                ),
                this.translateService.instant('promotion__download__value'),
              ],
            ],
            { origin: -1 }
          );

          xlsx.utils.sheet_add_aoa(
            worksheetItems,
            [
              [
                this.translateService.instant('promotion__download__date'),
                this.translateService.instant(
                  'promotion__download__good-receipt-name'
                ),
                this.translateService.instant('promotion__download__reference'),
                this.translateService.instant('promotion__download__quantity'),
                this.translateService.instant('promotion__download__unit'),
                this.translateService.instant('promotion__download__price'),
                this.translateService.instant('promotion__download__discount'),
                this.translateService.instant(
                  'promotion__download__total_unit_price'
                ),

                this.translateService.instant('promotion__download__total'),
              ],
            ],
            { origin: -1 }
          );

          data.result.forEach((element: any) => {
            xlsx.utils.sheet_add_aoa(
              worksheet,
              [
                [
                  this.datePipe.transform(element.date, 'dd MMM yyyy'),
                  element.good_receipt_code_name,
                  element.value,
                ],
              ],
              { origin: -1 }
            );
          });

          data.items.forEach((element: any) => {
            xlsx.utils.sheet_add_aoa(
              worksheetItems,
              [
                [
                  this.datePipe.transform(element.date, 'dd MMM yyyy'),
                  element.good_receipt_code_name,
                  element.reference,
                  element.quantity,
                  element.unit,
                  element.price,
                  element.discount,
                  Number(element.price) - Number(element.discount),
                  (Number(element.price) - Number(element.discount)) *
                    element.quantity,
                ],
              ],
              { origin: -1 }
            );
          });

          // Adjusting column width
          const wscols = [
            { wpx: 150 }, // width in pixels
            { wpx: 200 }, // width in pixels
            { wpx: 100 }, // width in pixels
          ];

          const wsItemcols = [
            { wpx: 150 }, // width in pixels
            { wpx: 200 }, // width in pixels
            { wpx: 200 }, // width in pixels
            { wpx: 100 }, // width in pixels
            { wpx: 100 }, // width in pixels
            { wpx: 150 }, // width in pixels
            { wpx: 150 },
            { wpx: 200 },
            { wpx: 200 },
          ];

          worksheet['!cols'] = wscols;
          worksheetItems['!cols'] = wsItemcols;

          const boldRows = [1, 2, 3, 4, 5, 6, 7, 9]; // Rows to be bold (1-based indexing)
          boldRows.forEach((rowNumber) => {
            const row = worksheet[xlsx.utils.encode_row(rowNumber - 1)];
            if (row) {
              Object.keys(row).forEach((key) => {
                if (row[key].s) {
                  row[key].s.font = { bold: true };
                } else {
                  row[key].s = { font: { bold: true } };
                }
              });
            }
          });

          boldRows.forEach((rowNumber) => {
            const row = worksheetItems[xlsx.utils.encode_row(rowNumber - 1)];
            if (row) {
              Object.keys(row).forEach((key) => {
                if (row[key].s) {
                  row[key].s.font = { bold: true };
                } else {
                  row[key].s = { font: { bold: true } };
                }
              });
            }
          });

          // Format numeric values with thousand separator
          for (let R = 10; R < 10 + data.result.length; R++) {
            const cellAddress = xlsx.utils.encode_cell({ r: R - 1, c: 2 });
            if (worksheet[cellAddress]) {
              worksheet[cellAddress].z = '#,##0';
            }
          }

          // Create a workbook and add the worksheet
          const workbook: xlsx.WorkBook = xlsx.utils.book_new();

          xlsx.utils.book_append_sheet(workbook, worksheet, 'Result');
          xlsx.utils.book_append_sheet(workbook, worksheetItems, 'Items');

          const excelBuffer: any = xlsx.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
          });
          this.saveAsExcelFile(
            excelBuffer,
            this.translateService.instant('promotion__download__file-name')
          );
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
            (x: any) => x.product_brand.name
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

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    saveAs(data, `${fileName}_${new Date().getTime()}.xlsx`);
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
