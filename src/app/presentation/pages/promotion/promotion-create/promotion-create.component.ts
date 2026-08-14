import { DatePipe, NgIf, NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { PromotionCreateRuleComponent } from '../promotion-create-rule/promotion-create-rule.component';
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
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-promotion-create',
    templateUrl: './promotion-create.component.html',
    styleUrls: ['./promotion-create.component.css'],
    imports: [FeatureBackgroundComponent, FeatureHeaderComponent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, NgxMaskDirective, AutocompleteSearchComponent, NgIf, MatChipSet, NgFor, MatChip, MatButton, EmptyTableComponent, NgSwitch, NgSwitchCase, MatIconButton, MatIcon, TranslatePipe]
})
export class PromotionCreateComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private datePipe: DatePipe,
    private sheet: MatBottomSheet
  ) {}

  isSubmitting: boolean = false;

  promotionFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    start_date: new FormControl(new Date(), [Validators.required]),
    end_date: new FormControl(''),
    target: new FormControl('', [Validators.required, Validators.min(0)]),
    supplier: new FormControl('', Validators.required),
    rules: new FormArray([]),
  });

  brands: any[] = [];

  ngOnInit(): void {}

  onSelectBrand(event: any) {
    const index = this.brands.findIndex((x) => {
      return x.id == event.id;
    });

    if (index == -1) {
      this.brands.push(event);
    }
  }

  onSelectSupplier(event: any) {
    this.promotionFormGroup.patchValue({
      supplier: event.id,
    });
  }

  onRemoveBrand(index: number) {
    this.brands.splice(index);
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
                'dd-MM-YYYY'
              ),
        target: Number(this.promotionFormGroup.value.target),
        start_date: this.datePipe.transform(
          this.promotionFormGroup.value.start_date,
          'dd-MM-YYYY'
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
            `Promotion ${data.name} created successfully`
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
