import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import * as xlsx from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-promotion-view',
  templateUrl: './promotion-view.component.html',
  styleUrls: ['./promotion-view.component.css'],
})
export class PromotionViewComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialogRef<PromotionViewComponent>,
    private translateService: TranslateService,
    private datePipe: DatePipe
  ) {}

  isLoading: boolean = false;
  isDownloading: boolean = false;
  dataSource: any = null;

  ngOnInit(): void {
    this.fetchByID();
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
              this.datePipe.transform(data.data.start, 'dd MMM YYYY'),
            ],
            [
              this.translateService.instant('promotion__download__end-date'),
              data.data.end == null
                ? this.translateService.instant(
                    'promotion__download__continuous-end'
                  )
                : this.datePipe.transform(data.data.end, 'dd MMM YYYY'),
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

          data.result.forEach((element: any) => {
            xlsx.utils.sheet_add_aoa(
              worksheet,
              [
                [
                  this.datePipe.transform(element.date, 'dd MMM YYYY'),
                  element.good_receipt_code_name,
                  element.value,
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

          worksheet['!cols'] = wscols;

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

          // Format numeric values with thousand separator
          for (let R = 10; R < 10 + data.result.length; R++) {
            const cellAddress = xlsx.utils.encode_cell({ r: R - 1, c: 2 });
            if (worksheet[cellAddress]) {
              worksheet[cellAddress].z = '#,##0';
            }
          }

          // Create a workbook and add the worksheet
          const workbook: xlsx.WorkBook = xlsx.utils.book_new();
          xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

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
      .get(`promotion/result/${this.data.id}`)
      .subscribe({
        next: (data) => {
          this.dataSource = data;
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
}
