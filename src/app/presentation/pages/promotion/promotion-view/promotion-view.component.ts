import { DatePipe } from '@angular/common';
import { Component, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import * as xlsx from 'xlsx';
import { saveAs } from 'file-saver';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-promotion-view',
    templateUrl: './promotion-view.component.html',
    styleUrls: ['./promotion-view.component.css'],
    standalone: false
})
export class PromotionViewComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number; noAction: boolean },
    private apiService: ApiService,
    private alertService: AlertService,
    private dialog: MatDialogRef<PromotionViewComponent>,
    private translateService: TranslateService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  isLoading: boolean = false;
  isDownloading: boolean = false;

  step = signal(0);

  formGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    target: new FormControl('', Validators.required),
    supplierID: new FormControl('', Validators.required),
    supplierName: new FormControl('', Validators.required),
    startDate: new FormControl('', Validators.required),
    endDate: new FormControl('', Validators.required),
    status: new FormControl('', Validators.required),
    createdBy: new FormControl('', Validators.required),
    createdAt: new FormControl('', Validators.required),
    promotion_brand: new FormArray([]),
    promotion_rules: new FormArray([]),
  });

  get f() {
    return this.formGroup.controls;
  }

  get t() {
    return this.f['promotion_brand'] as FormArray;
  }

  get u() {
    return this.f['promotion_rules'] as FormArray;
  }

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
                  this.datePipe.transform(element.date, 'dd MMM YYYY'),
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
                  this.datePipe.transform(element.date, 'dd MMM YYYY'),
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
          this.formGroup.patchValue({
            id: data.id,
            name: data.name,
            target: data.target,
            description: data.description,
            supplierID: data.supplier_id,
            supplierName: data.supplier.name,
            startDate: this.datePipe.transform(data.startDate, 'dd MMMM YYYY'),
            endDate:
              data.endDate == null
                ? this.translateService.instant('promotion__view__continuous')
                : this.datePipe.transform(data.endDate, 'dd MMMM YYYY'),
            status: data.is_delete
              ? this.translateService.instant(
                  'promotion__view__status__deleted'
                )
              : this.translateService.instant(
                  'promotion__view__status__active'
                ),
            createdBy: data.promotion_code_created_by.name,
            createdAt: this.datePipe.transform(data.created_at, 'dd MMMM YYYY'),
          });

          data.promotion_brand.forEach((x: any) => {
            this.t.push(
              this.formBuilder.group({
                id: [x.id],
                name: [x.product_brand.name],
              })
            );
          });

          data.promotion_rules.forEach((x: any) => {
            this.u.push(
              this.formBuilder.group({
                rule: [x.rule],
                value: [x.value],
              })
            );
          });
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

  setStep(index: number) {
    this.step.set(index);
  }

  nextStep() {
    this.step.update((i) => i + 1);
  }

  prevStep() {
    this.step.update((i) => i - 1);
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
