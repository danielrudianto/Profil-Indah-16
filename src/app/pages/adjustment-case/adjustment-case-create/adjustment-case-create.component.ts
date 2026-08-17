import { DatePipe, NgIf, NgFor, DecimalPipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { Subject } from 'rxjs';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NgxMaskDirective } from 'ngx-mask';

import {
  ProductSelectorComponent,
  ProductSelectorType,
} from 'src/app/components/product-selector/product-selector.component';
import { ComboSearchComponent } from 'src/app/components/combo-search/combo-search.component';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

/**
 * Buat penyesuaian stok — bagian `12b` berkas desain.
 *
 * Jenisnya dua kartu pilihan besar, meniru keadaan dokumen di penerimaan
 * barang: Ditemukan menambah stok dan wajib menunjuk perusahaan pemiliknya,
 * Hilang mengurangi stok tanpa perusahaan. Stok baru benar-benar berubah
 * setelah kasusnya dikonfirmasi admin.
 */
@Component({
  providers: [provideNativeDateAdapter()],
  selector: 'app-adjustment-case-create',
  templateUrl: './adjustment-case-create.component.html',
  styleUrls: ['./adjustment-case-create.component.scss'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    DecimalPipe,
    ComboSearchComponent,
    NgxMaskDirective,
    MatFormField,
    MatLabel,
    MatInput,
    MatSuffix,
    MatDatepicker,
    MatDatepickerInput,
    TranslatePipe,
  ],
})
export class AdjustmentCaseCreateComponent implements OnInit, OnDestroy {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private hotkeysService: HotkeysService,
    private datePipe: DatePipe,
    private translateService: TranslateService,
    private router: Router,
    private authService: AuthService,
  ) {
    this.hotkeysService.add(
      new Hotkey('alt+a', (): boolean => {
        this.openItemSelector();
        return false;
      }),
    );
  }

  productSelectorSubject: Subject<any> = new Subject();
  isSubmitting: boolean = false;

  /* Antrean persetujuan hanya milik pemilik — tautannya pun begitu. */
  isSuperAdministrator = false;

  /* 0 = Ditemukan (wajib perusahaan), 1 = Hilang — mengikuti backend. */
  metaFormGroup: FormGroup = new FormGroup({
    type: new FormControl(0, Validators.required),
    date: new FormControl(new Date(), Validators.required),
    company_id: new FormControl(null, Validators.required),
  });

  itemFormGroup: FormGroup = new FormGroup({
    items: new FormArray([]),
  });

  ngOnInit(): void {
    this.isSuperAdministrator = this.authService.isSuperAdministrator();
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

  get jenis(): number {
    return this.metaFormGroup.get('type')?.value;
  }

  /**
   * Memilih jenis lewat kartu keadaan.
   *
   * Hilang tidak menunjuk perusahaan — kolomnya disembunyikan DAN nilai serta
   * validatornya dilepas, supaya formulir tidak diam-diam menuntut isian yang
   * tidak bisa dilihat.
   */
  pilihJenis(jenis: number): void {
    this.metaFormGroup.patchValue({ type: jenis });

    const perusahaan = this.metaFormGroup.controls['company_id'];
    if (jenis === 1) {
      perusahaan.setValidators([]);
      this.metaFormGroup.patchValue({ company_id: null });
    } else {
      perusahaan.setValidators([Validators.required]);
    }
    perusahaan.updateValueAndValidity();
  }

  onSelectCompany(data: any): void {
    this.metaFormGroup.patchValue({ company_id: data.id });
  }

  onUnselectCompany(): void {
    this.metaFormGroup.patchValue({ company_id: null });
  }

  /** Jumlah baris yang memakai barang yang sama — untuk penanda ×N. */
  jumlahBaris(productId: number): number {
    return this.t.controls.filter(
      (x) => x.get('product_id')?.value === productId,
    ).length;
  }

  /** Total jumlah semua baris, untuk ringkasan di kolom samping. */
  get totalJumlah(): number {
    return this.t.controls.reduce(
      (total, x) => total + (Number(x.get('quantity')?.value) || 0),
      0,
    );
  }

  /**
   * Daftar syarat sebelum ajukan. FIELD yang diperbarui pada perubahan
   * formulir, BUKAN getter yang mengembalikan larik baru — getter seperti itu
   * membuat NG0100 berulang sampai halamannya berhenti tergambar. Sudah
   * pernah terjadi di aplikasi ini.
   */
  checklist: { kunci: string; selesai: boolean }[] = [];

  perbaruiChecklist(): void {
    const v = this.metaFormGroup.value;
    const daftar = [
      { kunci: 'adjustment-case__create__check-date', selesai: !!v.date },
    ];

    if (v.type === 0) {
      daftar.push({
        kunci: 'adjustment-case__create__check-company',
        selesai: v.company_id != null && v.company_id !== '',
      });
    }

    daftar.push({
      kunci: 'adjustment-case__create__check-items',
      selesai: this.t.length > 0,
    });
    daftar.push({
      kunci: 'adjustment-case__create__check-quantity',
      selesai: this.t.length > 0 && this.itemFormGroup.valid,
    });

    this.checklist = daftar;
  }

  removeItem(i: number): void {
    this.t.removeAt(i);
  }

  openItemSelector(): void {
    this.productSelectorSubject =
      this.dynamicComponentService.createDynamicComponent(
        ProductSelectorComponent,
        {
          type: ProductSelectorType.sales,
        },
      );

    this.productSelectorSubject.subscribe((result: any) => {
      if (!result) {
        return;
      }

      const data = result.data;
      const sub = result.sub;

      this.t.push(
        this.formBuilder.group({
          product_id: [data.id, Validators.required],
          product_unit_id: [sub ? sub.id : null],
          reference: [data.reference, Validators.required],
          description: [data.description, Validators.required],
          quantity: [null, [Validators.required, Validators.min(0.01)]],
          unit: [sub ? sub.unit : data.unit],
          conversion: [sub ? sub.conversion : 1],
          default_unit: [data.unit],
        }),
      );
    });
  }

  batal(): void {
    this.router.navigate(['/Adjustment-case/Archive']);
  }

  submitForm(): void {
    this.isSubmitting = true;

    this.apiService
      .post('adjustment-case', {
        date: this.datePipe.transform(
          this.metaFormGroup.controls['date'].value,
          'yyyy-MM-dd',
        ),
        type: this.metaFormGroup.controls['type'].value,
        company_id:
          this.metaFormGroup.controls['company_id'].value == null
            ? null
            : parseInt(this.metaFormGroup.controls['company_id'].value),
        adjustment_case: this.t.controls.map((x) => {
          return {
            product_id: x.get('product_id')?.value,
            product_unit_id: x.get('product_unit_id')?.value,
            quantity: parseFloat(x.get('quantity')?.value),
          };
        }),
      })
      .subscribe({
        next: () => {
          this.alertService.showSuccess(
            this.translateService.instant('adjustment-case__create__success'),
          );

          this.t.clear();
          this.metaFormGroup.reset({
            type: 0,
            date: new Date(),
            company_id: null,
          });
          this.pilihJenis(0);
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  bukaArsip(): void {
    this.router.navigate(['/Adjustment-case/Archive']);
  }

  bukaAntrean(): void {
    this.router.navigate(['/Adjustment-case/Confirm']);
  }
}
