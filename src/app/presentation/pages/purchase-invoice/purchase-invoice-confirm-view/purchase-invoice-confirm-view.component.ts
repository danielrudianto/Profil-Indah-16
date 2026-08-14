import { DatePipe, DecimalPipe, Location, NgIf, NgFor, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { of, switchMap } from 'rxjs';
import { DeleteConfirmationComponent } from 'src/app/presentation/components/delete-confirmation/delete-confirmation.component';
import { UpdateProductPurchasePriceComponent } from 'src/app/presentation/components/update-product-purchase-price/update-product-purchase-price.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { VerticalDividerComponent } from '../../../components/vertical-divider/vertical-divider.component';
import { BoxStepperComponent } from '../../../components/box-stepper/box-stepper.component';
import { MatFormField, MatLabel, MatSuffix, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgxMaskDirective } from 'ngx-mask';
import { MatTooltip } from '@angular/material/tooltip';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
    selector: 'app-purchase-invoice-confirm-view',
    templateUrl: './purchase-invoice-confirm-view.component.html',
    styleUrls: ['./purchase-invoice-confirm-view.component.css'],
    imports: [NgIf, VerticalDividerComponent, BoxStepperComponent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, NgxMaskDirective, MatHint, NgFor, MatTooltip, NgClass, MatProgressSpinner, DecimalPipe, TranslateModule]
})
export class PurchaseInvoiceConfirmViewComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private sheet: MatBottomSheet,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private location: Location,
    private translateService: TranslateService,
    private router: Router,
    private decimalPipe: DecimalPipe
  ) {}

  isSubmitting: boolean = false;
  isLoading: boolean = false;
  stepIndex: number = 0;

  /**
   * Meta form group is used to store date, name, good receipt name, faktur, supplier id, company id, supplier name, and company name.
   * Only date, name, good receipt name, supplier id, and company id are required.
   * This will be step 1.
   */
  metaFormGroup: FormGroup = new FormGroup({
    id: new FormControl('', [Validators.required, Validators.min(0)]),
    date: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    invoice_name: new FormControl('', Validators.required),
    faktur: new FormControl('', [Validators.pattern(/(^$|(^([0-9]{16})$))/g)]),
    supplier_id: new FormControl('', Validators.required),
    company_id: new FormControl('', Validators.required),

    supplier_name: new FormControl(''),
    company_name: new FormControl(''),
  });

  /**
   * Purchase document form group is used to store items, discount, and total.
   * Items is an array of form group which contains id, reference, description, item unit id, unit, quantity, price, discount, discount percentage, initial price, initial discount, discount type, and save.
   * Only id, reference, description, quantity, price, and discount type are required.
   * This will be step 2.
   */
  purchaseDocumentFormGroup: FormGroup = new FormGroup({
    items: new FormArray([]),
    discount: new FormControl(0, [Validators.required, Validators.min(0)]),
    total: new FormControl(0),
  });

  get f() {
    return this.purchaseDocumentFormGroup.controls;
  }

  get t() {
    return this.f['items'] as FormArray;
  }

  getFormGroupAt(i: number) {
    return this.t.at(i) as FormGroup;
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.apiService
      .get(`good-receipt/${this.route.snapshot.params['id']}`)
      .subscribe({
        next: (data: any) => {
          if (!data) {
            this.alertService.showSuccess(
              this.translateService.instant('general__not-found')
            );
            this.location.back();
          }

          if (data.is_confirm) {
            this.alertService.showSuccess(
              this.translateService.instant('general__already-confirmed')
            );
            this.location.back();
          }

          if (data.is_delete) {
            this.alertService.showSuccess(
              this.translateService.instant('general__allready-deleted')
            );
            this.location.back();
          }

          (data.good_receipt as any[]).forEach((x) => {
            this.t.push(
              this.formBuilder.group({
                id: [x.id, Validators.required],
                reference: [x.product.reference, [Validators.required]],
                description: [x.product.description, [Validators.required]],
                product_id: [x.product_id],
                product_unit_id: [x.product_unit_id],
                unit: [
                  x.product_unit == null ? x.product.unit : x.product_unit.unit,
                ],
                quantity: [x.quantity],
                price: [x.price],
                discount: [x.discount],
                discountPercentage: [
                  x.price == 0 ? 0 : (x.discount / x.price) * 100,
                ],
                initialPrice: [x.price],
                initialDiscount: [x.discount],
                save_price: [false],
              })
            );
          });

          this.metaFormGroup.patchValue({
            id: data.id,
            name: data.name,
            invoice_name: data.invoice_name,
            date: data.date,
            supplier_id: data.supplier.id,
            company_id: data.company.id,
            supplier_name: data.supplier.name,
            company_name: data.company.name,
          });

          this.purchaseDocumentFormGroup.patchValue({
            discount: data.discount,
            total: this.t.controls.reduce((a: any, b: any) => {
              return (
                a +
                b.get('quantity').value *
                  (b.get('price').value - b.get('discount').value)
              );
            }, 0),
          });
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });

    this.t.valueChanges.subscribe({
      next: () => {
        this.purchaseDocumentFormGroup.patchValue({
          total: this.t.controls.reduce((a: any, b: any) => {
            return (
              a +
              b.get('quantity').value *
                (b.get('price').value - b.get('discount').value)
            );
          }, 0),
        });
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }

  openEditDiscount(i: number) {
    this.dialog
      .open(UpdateProductPurchasePriceComponent, {
        data: {
          discount: this.t.controls[i].get('discount')?.value,
          price: this.t.controls[i].get('price')?.value,
          discountPercentage:
            this.t.controls[i].get('discountPercentage')?.value,
          save_price: this.t.controls[i].get('save_price')?.value,
        },
      })
      .afterClosed()
      .subscribe((data: any) => {
        if (data != undefined) {
          this.t.controls[i].get('discount')?.setValue(data.discount);
          this.t.controls[i]
            .get('discountPercentage')!
            .setValue(data.discountPercentage);
          this.t.controls[i].get('price')?.setValue(data.price);
          this.t.controls[i].get('save_price')?.setValue(data.save_price);
        }
      });
  }

  submitForm(type: string) {
    if (this.isSubmitting || this.isLoading) {
      return;
    }

    if (type == 'confirm') {
      if (!this.isValid) {
        return;
      }

      this.dialog
        .open(DeleteConfirmationComponent, {
          data: {
            header: this.translateService.instant(
              'purchase-invoice__confirm__header'
            ),
            title: this.translateService.instant(
              'purchase-invoice__confirm__confirm__title'
            ),
            document: `[${this.metaFormGroup.value.name}]`,
          },
        })
        .afterClosed()
        .subscribe((data) => {
          if (data) {
            this.apiService
              .put('good-receipt/confirm', {
                id: Number(this.metaFormGroup.value.id),
                name: this.metaFormGroup.value.name,
                invoice_name: this.metaFormGroup.value.invoice_name,
                faktur: this.metaFormGroup.value.faktur,
                date: this.datePipe.transform(
                  this.metaFormGroup.value.date,
                  'yyyy-MM-dd'
                ),
                discount: Number(
                  this.purchaseDocumentFormGroup.controls['discount'].value
                ),
                good_receipt: this.t.controls.map((x) => {
                  return {
                    id: x.get('id')?.value,
                    price: Number(x.get('price')?.value),
                    discount: Number(x.get('discount')?.value),
                  };
                }),
              })
              .pipe(
                switchMap((result) => {
                  if (!result) return of(null);

                  const itemsToSave = this.t.controls
                    .filter((x) => x.get('save_price')?.value)
                    .map((x) => ({
                      product_id: x.get('product_id')?.value,
                      product_unit_id: x.get('product_unit_id')?.value,
                      price: x.get('price')?.value,
                      discount: x.get('discount')?.value,
                    }));

                  if (itemsToSave.length > 0) {
                    // Post to purchase-price
                    return this.apiService.put('product/price-purchase', {
                      items: itemsToSave,
                    });
                  }
                  return of(null);
                })
              )
              .subscribe({
                next: (result) => {
                  this.alertService.showSuccess(
                    this.translateService.instant(
                      'purchase-invoice__confirm__confirm__success'
                    )
                  );

                  const url = this.router.url;
                  const urlSegments = url.split('/');
                  urlSegments.pop();

                  this.router.navigate(urlSegments);
                },
                error: (error) => {
                  this.alertService.showError(error);
                },
              })
              .add(() => {
                this.isSubmitting = false;
              });
          }
        });
    } else if (type == 'delete') {
      this.dialog
        .open(DeleteConfirmationComponent, {
          data: {
            header: this.translateService.instant(
              'purchase-invoice__confirm__header'
            ),
            title: this.translateService.instant(
              'purchase-invoice__confirm__delete__title'
            ),
            document: `[${this.metaFormGroup.value.good_receipt_name}]`,
          },
        })
        .afterClosed()
        .subscribe((data) => {
          if (data) {
            this.isSubmitting = true;
            this.apiService
              .put(`good-receipt/reject`, {
                id: Number(this.metaFormGroup.value.id),
              })
              .subscribe({
                next: (_) => {
                  this.alertService.showSuccess(
                    this.translateService.instant(
                      'purchase-invoice__confirm__delete__success'
                    )
                  );
                  // navigate to before
                  const url = this.router.url;
                  const urlSegments = url.split('/');
                  urlSegments.pop();

                  this.router.navigate(urlSegments);
                },
                error: (error) => {
                  this.alertService.showError(error);
                },
              })
              .add(() => {
                this.isSubmitting = false;
              });
          }
        });
    }
  }

  get isValid(): boolean {
    if (!this.metaFormGroup.valid) {
      return false;
    }

    if (!this.purchaseDocumentFormGroup.valid) {
      return false;
    }

    const discount = Number(
      this.purchaseDocumentFormGroup.get('discount')?.value
    );
    const total = Number(this.purchaseDocumentFormGroup.get('total')?.value);

    if (discount > total) {
      return false;
    }

    return true;
  }

  getDiscountPercentage(discount: number, price: number) {
    if (price == 0) {
      return '0%';
    } else {
      return `${this.decimalPipe.transform(
        (discount * 100) / price,
        '1.2-2'
      )}%`;
    }
  }
}
