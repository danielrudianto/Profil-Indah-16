import { DatePipe, NgFor } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { saveAs } from 'file-saver';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import * as xlsx from 'xlsx';
import { CdkScrollable } from '@angular/cdk/scrolling';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { MatList, MatListItem, MatListItemTitle, MatListItemLine } from '@angular/material/list';
import { MatButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-promotion-result',
    templateUrl: './promotion-result.component.html',
    styleUrl: './promotion-result.component.css',
    imports: [MatDialogTitle, FormsModule, ReactiveFormsModule, CdkScrollable, MatDialogContent, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatFormField, MatLabel, MatInput, NgxMaskDirective, MatList, NgFor, MatListItem, MatListItemTitle, MatListItemLine, MatDialogActions, MatButton, MatMenuTrigger, MatMenu, MatMenuItem, MatIcon, TranslateModule]
})
export class PromotionResultComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private apiService: ApiService,
    private dialog: MatDialogRef<PromotionResultComponent>,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private datePipe: DatePipe
  ) {}

  isLoading: boolean = false;
  isDownloading: boolean = false;

  promotionFormGroup: FormGroup = new FormGroup({
    sales: new FormControl(0, Validators.required),
    purchase: new FormControl(0, Validators.required),
    products: new FormArray([]),
  });

  get f() {
    return this.promotionFormGroup.controls;
  }

  get t(): FormArray {
    return this.f['products'] as FormArray;
  }

  ngOnInit(): void {
    this.fetchPromotionResult();
  }

  fetchPromotionResult() {
    this.isLoading = true;
    this.apiService
      .get(`promotion/result/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.promotionFormGroup.patchValue({
            sales: data.result.sales,
            purchase: data.result.purchase,
          });

          data.products.forEach((x: any) => {
            this.t.push(
              this.formBuilder.group({
                reference: [x.reference],
                description: [x.description],
                product_brand: [x.product_brand.name],
                product_type: [x.product_type.name],
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

  downloadReport(type: 'sales' | 'purchase') {
    this.isDownloading = true;
    if (type == 'sales') {
      this.apiService
        .get(`promotion/result/sales/${this.data.id}`)
        .subscribe({
          next: (data: any) => {
            const workbook = xlsx.utils.book_new();
            const createSheet = (sheetName: string, sheetData: any[]) => {
              const worksheetData = [
                [
                  'Date',
                  'Name',
                  'Customer',
                  'Reference',
                  'Quantity',
                  'Price',
                  'Discount',
                  'Unit',
                ],
              ];

              sheetData.forEach((x, index) => {
                worksheetData.push([
                  this.datePipe.transform(new Date(x.date), 'YYYY-MM-dd'),
                  x.name,
                  x.reference,
                  x.customer,
                  x.quantity,
                  x.price,
                  x.discount,
                  x.unit,
                ]);
              });

              const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
              xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
            };

            createSheet('Sales', data.data);

            const excelBuffer = xlsx.write(workbook, {
              bookType: 'xlsx',
              type: 'array',
            });

            const blob = new Blob([excelBuffer], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            saveAs(blob, `Sales promotion result ${this.data.id}.xlsx`);
            this.alertService.showSuccess(
              this.translateService.instant(
                'promotion__result__download__success'
              )
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

    if (type == 'purchase') {
      this.apiService
        .get(`promotion/result/purchase/${this.data.id}`)
        .subscribe({
          next: (data: any) => {
            const workbook = xlsx.utils.book_new();
            const createSheet = (sheetName: string, sheetData: any[]) => {
              const worksheetData = [
                [
                  'Date',
                  'Name',
                  'Supplier',
                  'Reference',
                  'Quantity',
                  'Price',
                  'Discount',
                  'Unit',
                ],
              ];

              sheetData.forEach((x, index) => {
                worksheetData.push([
                  this.datePipe.transform(new Date(x.date), 'YYYY-MM-dd'),
                  x.name,
                  x.reference,
                  x.supplier,
                  x.quantity,
                  x.price,
                  x.discount,
                  x.unit,
                ]);
              });

              const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
              xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
            };

            createSheet('Purchase', data.data);

            const excelBuffer = xlsx.write(workbook, {
              bookType: 'xlsx',
              type: 'array',
            });

            const blob = new Blob([excelBuffer], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            saveAs(blob, `Purchase promotion result ${this.data.id}.xlsx`);
            this.alertService.showSuccess(
              this.translateService.instant(
                'promotion__result__download__success'
              )
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
  }
}
