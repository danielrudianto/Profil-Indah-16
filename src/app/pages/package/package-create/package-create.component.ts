import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { KOLOM_ISIAN } from 'src/app/utils/keycode.utils';
import { MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';

import {
  ProductSelectorComponent,
} from 'src/app/components/product-selector/product-selector.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

/**
 * Buat paket — bundel beberapa barang dengan satu harga paket.
 *
 * Saat masuk faktur, isi paket dihargai proporsional terhadap harga
 * paketnya, jadi harga acuan tiap baris di sini menentukan PORSI, bukan
 * harga jual akhir. Barang yang sama dengan satuan yang sama ditolak masuk
 * dua kali — beda dengan faktur, komposisi master tidak punya alasan untuk
 * baris kembar.
 */
@Component({
  selector: 'app-package-create',
  templateUrl: './package-create.component.html',
  styleUrls: ['./package-create.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    DecimalPipe,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatInput,
    NgxMaskDirective,
    TranslatePipe,
  ],
})
export class PackageCreateComponent implements OnInit, OnDestroy {
  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private hotkeysService: HotkeysService,
    private apiService: ApiService,
    private dynamicComponentService: DynamicComponentService,
    private translateService: TranslateService,
    private router: Router,
  ) {
    this.hotkeysService.add(
      new Hotkey('alt+a', (): boolean => {
        this.openItemSelector();
        return false;
      }, KOLOM_ISIAN),
    );
  }

  isSubmitting = false;

  metaFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    price: new FormControl('', [Validators.required, Validators.min(1)]),
  });

  itemFormGroup: FormGroup = new FormGroup({
    items: new FormArray([]),
  });

  ngOnInit(): void {
    this.perbaruiChecklist();
    this.metaFormGroup.valueChanges.subscribe(() => this.perbaruiChecklist());
    this.itemFormGroup.valueChanges.subscribe(() => this.perbaruiChecklist());
  }

  ngOnDestroy(): void {
    this.hotkeysService.reset();
  }

  get t(): FormArray {
    return this.itemFormGroup.get('items') as FormArray;
  }

  itemAt(i: number): FormGroup {
    return this.t.at(i) as FormGroup;
  }

  /** Nilai seluruh isi pada harga satuannya, sebelum diskon. */
  get nilaiSatuan(): number {
    return this.t.controls.reduce((total, x) => {
      return (
        total +
        (Number(x.get('quantity')?.value) || 0) *
          (Number(x.get('price')?.value) || 0)
      );
    }, 0);
  }

  /** Nilai netto diskon — pembanding harga paketnya. */
  get nilaiNetto(): number {
    return this.t.controls.reduce((total, x) => {
      return (
        total +
        (Number(x.get('quantity')?.value) || 0) *
          ((Number(x.get('price')?.value) || 0) -
            (Number(x.get('discount')?.value) || 0))
      );
    }, 0);
  }

  get hargaPaket(): number {
    return Number(this.metaFormGroup.get('price')?.value) || 0;
  }

  get hemat(): number {
    return this.nilaiNetto - this.hargaPaket;
  }

  /**
   * Daftar syarat sebelum simpan. FIELD yang diperbarui pada perubahan
   * formulir, BUKAN getter yang mengembalikan larik baru — getter seperti
   * itu membuat NG0100 berulang. Sudah pernah terjadi di aplikasi ini.
   */
  checklist: { kunci: string; selesai: boolean }[] = [];

  perbaruiChecklist(): void {
    this.checklist = [
      {
        kunci: 'package__create__check-info',
        selesai: this.metaFormGroup.valid,
      },
      {
        kunci: 'package__create__check-items',
        selesai: this.t.length > 0,
      },
      {
        kunci: 'package__create__check-valid',
        selesai: this.t.length > 0 && this.itemFormGroup.valid,
      },
    ];
  }

  removeItem(i: number): void {
    this.t.removeAt(i);
  }

  openItemSelector(): void {
    this.dynamicComponentService
      .createDynamicComponent(ProductSelectorComponent, {})
      .subscribe((result: any) => {
        if (!result) {
          return;
        }

        const data = result.data;
        const sub = result.sub;

        /*
          Komposisi master tidak punya alasan untuk baris kembar — beda
          dengan faktur yang membolehkannya untuk bonus supplier.
        */
        if (this.sudahAda(data.id, sub == null ? null : sub.id)) {
          this.alertService.showSuccess(
            this.translateService.instant('general__item__exists'),
          );
          return;
        }

        this.t.push(
          this.formBuilder.group({
            product_id: [data.id, Validators.required],
            product_unit_id: [sub == null ? null : sub.id],
            reference: [data.reference, Validators.required],
            description: [data.description, Validators.required],
            unit: [sub == null ? data.unit : sub.unit],
            price: [
              sub == null ? data.sales_price : sub.sales_price,
              [Validators.required, Validators.min(0.01)],
            ],
            discount: [
              sub == null ? data.sales_discount : sub.sales_discount,
              [Validators.required, Validators.min(0)],
            ],
            quantity: [null, [Validators.required, Validators.min(0.01)]],
          }),
        );
      });
  }

  private sudahAda(productID: number, productUnitID: number | null): boolean {
    return this.t.value.some(
      (x: any) =>
        x.product_id === productID && x.product_unit_id === productUnitID,
    );
  }

  batal(): void {
    this.router.navigate(['/Package']);
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService
      .post('product-package', {
        name: this.metaFormGroup.get('name')?.value,
        description: this.metaFormGroup.get('description')?.value,
        price: Number(this.metaFormGroup.get('price')?.value),
        package_content: this.t.value.map((x: any) => {
          return {
            product_id: x.product_id,
            product_unit_id: x.product_unit_id,
            quantity: x.quantity,
            /* Harga acuan disimpan NETTO — porsi proporsionalnya di faktur. */
            price: x.price - x.discount,
          };
        }),
      })
      .subscribe({
        next: (result: any) => {
          this.alertService.showSuccess(
            `${result.name} ${this.translateService.instant('package__create__success-prefix')}`,
          );
          this.router.navigate(['/Package']);
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }
}
