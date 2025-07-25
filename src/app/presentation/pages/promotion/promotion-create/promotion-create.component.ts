import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { PromotionCreateRuleComponent } from '../promotion-create-rule/promotion-create-rule.component';

@Component({
  selector: 'app-promotion-create',
  templateUrl: './promotion-create.component.html',
  styleUrls: ['./promotion-create.component.css'],
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
