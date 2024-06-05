import { Location } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  FormArray,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-package-update',
  templateUrl: './package-update.component.html',
  styleUrls: ['./package-update.component.css'],
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
      let valueWODiscount = 0;
      if (this.t.controls.length > 0) {
        this.t.controls.forEach((x) => {
          const discount = Number(x.get('discount')?.value);
          const price = Number(x.get('price')?.value);
          const quantity = Number(x.get('quantity')?.value);

          totalPrice += quantity * (price - discount);
          valueWODiscount += quantity * price;
        });

        this.itemsFormGroup.patchValue({
          value: totalPrice,
          valueWODiscount: valueWODiscount,
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
                reference: [x.item.reference],
                description: [x.item.description],
                price: [x.price, [Validators.required, Validators.min(1)]],
                discount: [
                  x.discount,
                  [Validators.required, Validators.min(0)],
                ],
                quantity: [x.quantity],
                unit: [x.item_unit == null ? x.item.unit : x.item_unit.unit],
                conversion: [x.item_unit == null ? 1 : x.item_unit.conversion],
                default_unit: [x.item.unit],
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
