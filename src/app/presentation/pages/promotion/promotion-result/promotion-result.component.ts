import { Component, Inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-promotion-result',
  templateUrl: './promotion-result.component.html',
  styleUrl: './promotion-result.component.css',
})
export class PromotionResultComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private apiService: ApiService,
    private dialog: MatDialogRef<PromotionResultComponent>,
    private alertService: AlertService,
    private formBuilder: FormBuilder
  ) {}

  isLoading: boolean = false;

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
    this.apiService.get(`promotion/result/${this.data.id}`).subscribe({
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
    });
  }
}
