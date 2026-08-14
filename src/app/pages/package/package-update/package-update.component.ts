import { Location, NgIf, NgFor, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { VerticalDividerComponent } from '../../../components/vertical-divider/vertical-divider.component';
import { BoxStepperComponent } from '../../../components/box-stepper/box-stepper.component';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgxMaskDirective } from 'ngx-mask';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';

@Component({
    selector: 'app-package-update',
    templateUrl: './package-update.component.html',
    styleUrls: ['./package-update.component.css'],
    imports: [NgIf, MatProgressSpinner, VerticalDividerComponent, BoxStepperComponent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, NgxMaskDirective, NgFor, MatHint, EmptyTableComponent, DecimalPipe, TranslatePipe]
})
export class PackageUpdateComponent {
  constructor(
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private apiService: ApiService,
    private translateService: TranslateService,
    private activatedRoute: ActivatedRoute,
    private location: Location
  ) {}

  isLoading: boolean = true;
  isSubmitting: boolean = false;

  metaFormGroup: FormGroup = new FormGroup({
    id: new FormControl(0, Validators.required),
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    price: new FormControl('', [Validators.required, Validators.min(1)]),
  });

  itemsFormGroup: FormGroup = new FormGroup({
    items: new FormArray([]),
    number_of_items: new FormControl(0, Validators.min(1)),
    value: new FormControl(0),
    valueWODiscount: new FormControl(0),
  });

  ngOnInit(): void {
    this.fetchByID();
    this.t.valueChanges.subscribe(() => {
      let totalPrice = 0;
      if (this.t.controls.length > 0) {
        this.t.controls.forEach((x) => {
          const price = Number(x.get('price')?.value);
          const quantity = Number(x.get('quantity')?.value);

          totalPrice += quantity * price;
        });

        this.itemsFormGroup.patchValue({
          value: totalPrice,
        });
      }
    });
  }

  fetchByID(): void {
    this.isLoading = true;
    this.apiService
      .get(`product-package/${this.activatedRoute.snapshot.params['id']}`)
      .subscribe({
        next: (data: any) => {
          this.metaFormGroup.patchValue({
            id: data.id,
            name: data.name,
            description: data.description,
            price: data.price,
          });

          (data.package_content as any[]).forEach((x) => {
            this.t.push(
              this.formBuilder.group({
                id: [x.id, Validators.required],
                product_id: [x.product_id, Validators.required],
                reference: [x.product.reference],
                description: [x.product.description],
                price: [x.price, [Validators.required, Validators.min(1)]],
                quantity: [x.quantity],
                unit: [
                  x.product_unit == null ? x.product.unit : x.product_unit.unit,
                ],
                conversion: [
                  x.product_unit == null ? 1 : x.product_unit.conversion,
                ],
                default_unit: [x.product.unit],
              })
            );
          });

          this.itemsFormGroup.patchValue({
            number_of_items: this.t.length,
          });
        },
        error: (error) => {
          this.alertService.showError(error);
          this.location.back();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  get f() {
    return this.itemsFormGroup.controls;
  }
  get t() {
    return this.f['items'] as FormArray;
  }

  getFormGroupAt(i: number) {
    return this.t.at(i) as FormGroup;
  }

  submitForm() {
    this.isSubmitting = true;
    this.apiService
      .put('product-package', {
        id: Number(this.metaFormGroup.get('id')?.value),
        name: this.metaFormGroup.get('name')?.value,
        description: this.metaFormGroup.get('description')?.value,
        price: Number(this.metaFormGroup.get('price')?.value),
      })
      .subscribe({
        next: (_) => {
          this.alertService.showSuccess(
            this.translateService.instant('package__update__success')
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
