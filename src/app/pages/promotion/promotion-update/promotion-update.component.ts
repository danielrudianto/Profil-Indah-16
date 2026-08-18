import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormControl,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
  MatPrefix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import {
  MatDatepicker,
  MatDatepickerInput,
} from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ComboSearchComponent } from 'src/app/components/combo-search/combo-search.component';
import { NgxMaskDirective } from 'ngx-mask';

/**
 * Ubah promosi — kembaran anatomi buat promosi (17a/17b), memuat data lama
 * lebih dulu. Aturan SKU disunting sebaris seperti di formulir buatnya,
 * bukan lewat bottom sheet + tabel seperti bentuk lamanya.
 *
 * Bentuk lamanya mem-patch `startDate`/`endDate` ke kontrol bernama
 * `start_date`/`end_date` — tidak pernah cocok, jadi TANGGAL PROMOSI TIDAK
 * PERNAH TERMUAT dan tersimpan ulang sebagai hari ini. Dibenahi di
 * fetchByID.
 */
@Component({
  providers: [provideNativeDateAdapter()],
  selector: 'app-promotion-update',
  templateUrl: './promotion-update.component.html',
  styleUrls: ['./promotion-update.component.scss'],
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
    TranslatePipe,
  ],
})
export class PromotionUpdateComponent implements OnInit {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private router: Router,
    private route: ActivatedRoute,
    private translateService: TranslateService,
  ) {}

  isSubmitting: boolean = false;
  isLoading: boolean = true;

  namaSupplier = '';

  promotionFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    start_date: new FormControl<Date | null>(null, [Validators.required]),
    end_date: new FormControl(''),
    /* Opsional — kosong berarti tanpa target; basis data menyimpan 0. */
    target: new FormControl('', [Validators.min(0)]),
    supplier: new FormControl('', Validators.required),
    rules: new FormArray([]),
  });

  brands: any[] = [];

  /* Id merek yang sudah jadi kapsul — sarannya dimatikan di daftarnya. */
  get idMerekTerpilih(): number[] {
    return this.brands.map((x: any) => x.id);
  }


  ngOnInit(): void {
    this.fetchByID();
    this.promotionFormGroup.valueChanges.subscribe(() =>
      this.perbaruiChecklist(),
    );
  }

  get t(): FormArray {
    return this.promotionFormGroup.get('rules') as FormArray;
  }

  fetchByID(): void {
    const id = this.route.snapshot.params['id'];
    this.apiService
      .get(`promotion/${id}`)
      .subscribe({
        next: (data: any) => {
          this.promotionFormGroup.patchValue({
            id: data.id,
            name: data.name,
            description: data.description,
            /* API memakai camelCase di sini; kontrolnya snake_case. */
            start_date: data.startDate,
            end_date: data.endDate ?? '',
            target: Number(data.target) || '',
            supplier: data.supplier_id,
          });
          this.namaSupplier = data.supplier?.name ?? '';

          data.promotion_rules.forEach((x: any) => {
            this.t.push(
              new FormGroup({
                rule: new FormControl(x.rule, [Validators.required]),
                value: new FormControl(x.value, [Validators.required]),
              }),
            );
          });

          this.brands = data.promotion_brand.map((x: any) => x.product_brand);
          this.perbaruiChecklist();
        },
        error: (error) => {
          this.alertService.showError(error);
          this.router.navigate(['/Promotion']);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  addRule(): void {
    this.t.push(
      new FormGroup({
        rule: new FormControl('Contains', [Validators.required]),
        value: new FormControl('', [Validators.required]),
      }),
    );
  }

  removeRule(i: number): void {
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
      {
        kunci: 'promotion__create__check-info',
        selesai: !!v.name && !!v.description,
      },
      { kunci: 'promotion__create__check-supplier', selesai: !!v.supplier },
      {
        kunci: 'promotion__create__check-brand',
        selesai: this.brands.length > 0,
      },
      { kunci: 'promotion__create__check-start', selesai: !!v.start_date },
    ];
  }

  ruleAt(i: number): FormGroup {
    return this.t.at(i) as FormGroup;
  }

  onSelectSupplier(item: any): void {
    this.promotionFormGroup.patchValue({ supplier: item.id });
  }

  onUnselectSupplier(): void {
    this.promotionFormGroup.patchValue({ supplier: '' });
  }

  onSelectBrand(item: any): void {
    if (!this.brands.some((x) => x.id === item.id)) {
      this.brands.push(item);
    }
    this.perbaruiChecklist();
  }

  removeBrand(i: number): void {
    this.brands.splice(i, 1);
    this.perbaruiChecklist();
  }

  batal(): void {
    this.router.navigate(['/Promotion']);
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService
      .put('promotion', {
        id: this.promotionFormGroup.value.id,
        supplier_id: this.promotionFormGroup.value.supplier,
        name: this.promotionFormGroup.value.name,
        description: this.promotionFormGroup.value.description,
        end_date:
          this.promotionFormGroup.value.end_date == '' ||
          this.promotionFormGroup.value.end_date == null
            ? null
            : this.datePipe.transform(
                this.promotionFormGroup.value.end_date,
                'dd-MM-yyyy',
              ),
        target: Number(this.promotionFormGroup.value.target) || 0,
        start_date: this.datePipe.transform(
          this.promotionFormGroup.value.start_date,
          'dd-MM-yyyy',
        ),
        promotion_rules: this.promotionFormGroup.value.rules,
        promotion_brand: this.brands.map((x) => {
          return {
            product_brand_id: x.id,
          };
        }),
      })
      .subscribe({
        next: () => {
          this.alertService.showSuccess(
            this.translateService.instant('promotion__update__success'),
          );
          this.router.navigate(['/Promotion']);
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
