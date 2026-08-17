import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { NgIf, NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { MatFormField, MatLabel, MatSuffix, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ComboSearchComponent } from 'src/app/components/combo-search/combo-search.component';

import { NgxMaskDirective } from 'ngx-mask';
@Component({
  providers: [provideNativeDateAdapter()],
    selector: 'app-promotion-create',
    templateUrl: './promotion-create.component.html',
    styleUrls: ['./promotion-create.component.scss'],
    imports: [
    MatSuffix,
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    ComboSearchComponent,
    NgxMaskDirective,
    MatFormField,
    MatLabel,
    MatPrefix,
    MatInput,
    MatSelect,
    MatOption,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    TranslatePipe,
  ]
})
export class PromotionCreateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private router: Router,
    private translateService: TranslateService
  ) {}

  isSubmitting: boolean = false;

  promotionFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    start_date: new FormControl(new Date(), [Validators.required]),
    end_date: new FormControl(''),
    /* Opsional — kosong berarti tanpa target; basis data menyimpan 0. */
    target: new FormControl('', [Validators.min(0)]),
    supplier: new FormControl('', Validators.required),
    rules: new FormArray([]),
  });

  brands: any[] = [];

  ngOnInit(): void {
    this.perbaruiChecklist();
    this.promotionFormGroup.valueChanges.subscribe(() => this.perbaruiChecklist());
  }

  get f() {
    return this.promotionFormGroup.controls;
  }

  get t(): FormArray {
    return this.promotionFormGroup.get('rules') as FormArray;
  }

  addRule() {
    this.t.push(
      new FormGroup({
        rule: new FormControl('Contains', [Validators.required]),
        value: new FormControl('', [Validators.required]),
      })
    );
  }

  removeRule(i: number) {
    this.t.removeAt(i);
  }

  /**
   * Daftar syarat sebelum simpan. FIELD yang diperbarui pada perubahan
   * formulir, BUKAN getter: getter yang mengembalikan larik baru dibaca
   * *ngFor sebagai nilai yang selalu berubah — NG0100 berulang sampai
   * halamannya berhenti tergambar. Sudah pernah terjadi di aplikasi ini.
   */
  checklist: { kunci: string; selesai: boolean }[] = [];

  perbaruiChecklist(): void {
    const v = this.promotionFormGroup.value;
    this.checklist = [
      { kunci: 'promotion__create__check-info', selesai: !!v.name && !!v.description },
      { kunci: 'promotion__create__check-supplier', selesai: !!v.supplier },
      { kunci: 'promotion__create__check-brand', selesai: this.brands.length > 0 },
      { kunci: 'promotion__create__check-start', selesai: !!v.start_date },
    ];
  }

  ruleAt(i: number) {
    return this.t.at(i) as FormGroup;
  }

  onSelectSupplier(item: any) {
    this.promotionFormGroup.patchValue({ supplier: item.id });
  }

  onUnselectSupplier() {
    this.promotionFormGroup.patchValue({ supplier: '' });
  }

  onSelectBrand(item: any) {
    if (!this.brands.some((x) => x.id === item.id)) {
      this.brands.push(item);
    }
    this.perbaruiChecklist();
  }

  /*
    splice(i, 1), BUKAN splice(i). Tanpa panjang, splice membuang SEMUA merek
    dari titik itu sampai akhir — melepas satu chip di tengah ikut menyeret
    semua chip di kanannya. Bug ini ada sejak versi lama.
  */
  removeBrand(i: number) {
    this.brands.splice(i, 1);
    this.perbaruiChecklist();
  }

  batal() {
    this.router.navigate(['/Promotion']);
  }

  submitForm() {
    this.isSubmitting = true;
    this.apiService
      .post('promotion', {
        supplier_id: this.promotionFormGroup.value.supplier,
        name: this.promotionFormGroup.value.name,
        description: this.promotionFormGroup.value.description,
        end_date:
          this.promotionFormGroup.value.end_date == '' ||
          this.promotionFormGroup.value.end_date == null
            ? null
            : this.datePipe.transform(
                this.promotionFormGroup.value.end_date,
                'dd-MM-yyyy'
              ),
        target: Number(this.promotionFormGroup.value.target) || 0,
        start_date: this.datePipe.transform(
          this.promotionFormGroup.value.start_date,
          'dd-MM-yyyy'
        ),
        promotion_rules: this.promotionFormGroup.value.rules,
        promotion_brand: this.brands.map((x) => {
          return {
            product_brand_id: x.id,
          };
        }),
      })
      .subscribe({
        next: (data: any) => {
          this.alertService.showSuccess(
            `${data.name} ${this.translateService.instant('promotion__create__success')}`
          );

          this.promotionFormGroup.reset();
          this.brands = [];
          this.t.clear();
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
