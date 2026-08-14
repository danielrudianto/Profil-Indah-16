import { DatePipe, NgIf, NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { PromotionCreateRuleComponent } from '../promotion-create-rule/promotion-create-rule.component';
import { ActivatedRoute } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { FeatureBackgroundComponent } from '../../../components/feature-background/feature-background.component';
import { FeatureHeaderComponent } from '../../../components/feature-header/feature-header.component';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgxMaskDirective } from 'ngx-mask';
import { AutocompleteSearchComponent } from '../../../components/autocomplete-search/autocomplete-search.component';
import { MatChipSet, MatChip } from '@angular/material/chips';
import { MatButton, MatIconButton } from '@angular/material/button';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-promotion-update',
    templateUrl: './promotion-update.component.html',
    styleUrl: './promotion-update.component.scss',
    imports: [FeatureBackgroundComponent, FeatureHeaderComponent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, NgxMaskDirective, AutocompleteSearchComponent, NgIf, MatChipSet, NgFor, MatChip, MatButton, EmptyTableComponent, NgSwitch, NgSwitchCase, MatIconButton, MatIcon, TranslatePipe]
})
export class PromotionUpdateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private sheet: MatBottomSheet,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private translateService: TranslateService
  ) {}

  isSubmitting: boolean = false;
  isLoading: boolean = true;

  promotionFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    start_date: new FormControl(new Date(), [Validators.required]),
    end_date: new FormControl(''),
    target: new FormControl('', [Validators.required, Validators.min(0)]),
    supplier: new FormControl('', Validators.required),
    supplier_name: new FormControl('', Validators.required),
    rules: new FormArray([]),
    promotion_brand: new FormArray([]),
  });

  ngOnInit(): void {
    this.fetchByID();
  }

  onSelectBrand(event: any) {
    const index = this.u.value.findIndex((x: any) => x.id == event.id);

    if (index == -1) {
      this.u.push(
        this.formBuilder.group({
          id: [event.id],
          name: [event.name],
        })
      );
    }
  }

  onSelectSupplier(event: any) {
    this.promotionFormGroup.patchValue({
      supplier: event.id,
    });
  }

  onRemoveBrand(index: number) {
    this.u.removeAt(index);
  }

  onUnselectSupplier() {
    this.promotionFormGroup.patchValue({
      supplier: '',
    });
  }

  get f() {
    return this.promotionFormGroup.controls;
  }

  get t(): FormArray {
    return this.promotionFormGroup.get('rules') as FormArray;
  }

  get u(): FormArray {
    return this.promotionFormGroup.get('promotion_brand') as FormArray;
  }

  addRule() {
    const sheet = this.sheet.open(PromotionCreateRuleComponent, {});
    sheet.afterDismissed().subscribe((data) => {
      if (data) {
        this.t.push(
          new FormGroup({
            rule: new FormControl(data.rule, [Validators.required]),
            value: new FormControl(data.value, [Validators.required]),
          })
        );
      }
    });
  }

  removeRule(i: number) {
    this.t.removeAt(i);
  }

  fetchByID() {
    this.isLoading = true;
    const id = this.route.snapshot.params['id'];
    this.apiService.get(`promotion/${id}`).subscribe({
      next: (data: any) => {
        this.promotionFormGroup.patchValue({
          id: data.id,
          name: data.name,
          description: data.description,
          startDate: data.startDate,
          endDate: data.endDate,
          target: data.target,
          supplier: data.supplier_id,
          supplier_name: data.supplier.name,
        });

        data.promotion_rules.forEach((x: any) => {
          this.t.push(
            this.formBuilder.group({
              rule: [x.rule],
              value: [x.value],
            })
          );
        });

        data.promotion_brand.forEach((x: any) => {
          this.u.push(
            this.formBuilder.group({
              id: [x.product_brand.id],
              name: [x.product_brand.name],
            })
          );
        });
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }

  submitForm() {
    this.isSubmitting = true;
    this.apiService
      .put('promotion', {
        id: this.promotionFormGroup.value.id,
        supplier_id: this.promotionFormGroup.value.supplier,
        name: this.promotionFormGroup.value.name,
        description: this.promotionFormGroup.value.description,
        end_date:
          this.promotionFormGroup.value.end_date == ''
            ? null
            : this.datePipe.transform(
                this.promotionFormGroup.value.end_date,
                'dd-MM-YYYY'
              ),
        target: Number(this.promotionFormGroup.value.target),
        start_date: this.datePipe.transform(
          this.promotionFormGroup.value.start_date,
          'dd-MM-YYYY'
        ),
        promotion_rules: this.t.value,
        promotion_brand: this.u.value.map((x: any) => {
          return {
            product_brand_id: x.id,
          };
        }),
      })
      .subscribe({
        next: (_) => {
          this.alertService.showSuccess(
            this.translateService.instant('promotion__update__success')
          );
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
