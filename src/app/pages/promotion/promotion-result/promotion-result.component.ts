import { DatePipe, NgFor } from '@angular/common';
import { Component, Inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
} from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { ExcelService } from 'src/app/services/excel.service';
import { CdkScrollable } from '@angular/cdk/scrolling';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import {
  MatList,
  MatListItem,
  MatListItemTitle,
  MatListItemLine,
} from '@angular/material/list';
import { MatButton } from '@angular/material/button';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-promotion-result',
  templateUrl: './promotion-result.component.html',
  imports: [
    MatDialogTitle,
    FormsModule,
    ReactiveFormsModule,
    CdkScrollable,
    MatDialogContent,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatFormField,
    MatLabel,
    MatInput,
    NgxMaskDirective,
    MatList,
    NgFor,
    MatListItem,
    MatListItemTitle,
    MatListItemLine,
    MatDialogActions,
    MatButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatIcon,
    TranslatePipe,
  ],
})
export class PromotionResultComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private apiService: ApiService,
    private excelService: ExcelService,
    private dialog: MatDialogRef<PromotionResultComponent>,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private datePipe: DatePipe,
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
              }),
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
            /*
              Urutan lamanya menukar kolom Customer dan Reference —
              header bilang satu hal, isinya hal lain. Di sini disejajarkan.
            */
            this.excelService
              .unduh('Hasil_promosi_penjualan_' + this.data.id, [
                {
                  nama: 'Sales',
                  judul: 'Hasil promosi — sales',
                  kolom: [
                    { judul: 'Date', format: 'tanggal' },
                    { judul: 'Name', lebar: 24 },
                    { judul: 'Customer', lebar: 28 },
                    { judul: 'Reference', lebar: 18 },
                    { judul: 'Quantity', format: 'angka' },
                    { judul: 'Price', format: 'uang' },
                    { judul: 'Discount', format: 'uang' },
                    { judul: 'Unit', lebar: 10 },
                  ],
                  baris: (data.data as any[]).map((x) => [
                    new Date(x.date),
                    x.name,
                    x.customer,
                    x.reference,
                    x.quantity,
                    x.price,
                    x.discount,
                    x.unit,
                  ]),
                },
              ])
              .then(() => {
                this.alertService.showSuccess(
                  this.translateService.instant(
                    'promotion__result__download__success',
                  ),
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

    if (type == 'purchase') {
      this.apiService
        .get(`promotion/result/purchase/${this.data.id}`)
        .subscribe({
          next: (data: any) => {
            /*
              Urutan lamanya menukar kolom Supplier dan Reference —
              header bilang satu hal, isinya hal lain. Di sini disejajarkan.
            */
            this.excelService
              .unduh('Hasil_promosi_pembelian_' + this.data.id, [
                {
                  nama: 'Purchase',
                  judul: 'Hasil promosi — purchase',
                  kolom: [
                    { judul: 'Date', format: 'tanggal' },
                    { judul: 'Name', lebar: 24 },
                    { judul: 'Supplier', lebar: 28 },
                    { judul: 'Reference', lebar: 18 },
                    { judul: 'Quantity', format: 'angka' },
                    { judul: 'Price', format: 'uang' },
                    { judul: 'Discount', format: 'uang' },
                    { judul: 'Unit', lebar: 10 },
                  ],
                  baris: (data.data as any[]).map((x) => [
                    new Date(x.date),
                    x.name,
                    x.supplier,
                    x.reference,
                    x.quantity,
                    x.price,
                    x.discount,
                    x.unit,
                  ]),
                },
              ])
              .then(() => {
                this.alertService.showSuccess(
                  this.translateService.instant(
                    'promotion__result__download__success',
                  ),
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
  }
}
