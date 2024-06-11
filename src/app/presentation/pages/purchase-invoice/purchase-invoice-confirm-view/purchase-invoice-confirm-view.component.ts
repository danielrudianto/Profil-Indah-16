import { DatePipe, Location } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DeleteConfirmationComponent } from 'src/app/presentation/components/delete-confirmation/delete-confirmation.component';
import { UpdateProductPurchasePriceComponent } from 'src/app/presentation/components/update-product-purchase-price/update-product-purchase-price.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-purchase-invoice-confirm-view',
  templateUrl: './purchase-invoice-confirm-view.component.html',
  styleUrls: ['./purchase-invoice-confirm-view.component.css'],
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
    private router: Router
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
    date: new FormControl('', Validators.required),
    name: new FormControl('', Validators.required),
    good_receipt_name: new FormControl('', Validators.required),
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

  /**
   * Value form group is used to store confirm.
   * Only confirm is required.
   * This will be step 3.
   */
  valueFormGroup: FormGroup = new FormGroup({
    confirm: new FormControl('', [
      Validators.required,
      Validators.requiredTrue,
    ]),
  });

  get f() {
    return this.purchaseDocumentFormGroup.controls;
  }

  get t() {
    return this.f['items'] as FormArray;
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.apiService
      .get(`purchase-invoice/${this.route.snapshot.params['id']}`)
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
              this.translateService.instant('general__allready-confirmed')
            );
            this.location.back();
          }

          if (data.is_delete) {
            this.alertService.showSuccess(
              this.translateService.instant('general__allready-deleted')
            );
            this.location.back();
          }

          let sub_total = 0;
          (data.good_receipt_code.good_receipt as any[]).forEach((x) => {
            this.t.push(
              this.formBuilder.group({
                id: [x.id, Validators.required],
                reference: [x.item.reference, [Validators.required]],
                description: [x.item.description, [Validators.required]],
                item_unit_id: [x.item_unit == null ? null : x.item_unit.id],
                unit: [x.item_unit == null ? x.item.unit : x.item_unit.unit],
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

            sub_total +=
              Number(x.quantity) * (Number(x.price) - Number(x.discount));
          });

          this.metaFormGroup.patchValue({
            good_receipt_name: data.good_receipt_code.name,
            name: data.name == '' ? data.good_receipt_code.name : data.name,
            date: data.date,
            supplier_id: data.good_receipt_code.supplier.id,
            company_id: data.good_receipt_code.company.id,
            supplier_name: data.good_receipt_code.supplier.name,
            company_name: data.good_receipt_code.company.name,
          });

          this.purchaseDocumentFormGroup.patchValue({
            discount: data.discount,
            total: sub_total,
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
        let sub_total = 0;
        this.t.controls.forEach((x) => {
          sub_total +=
            Number(x.get('quantity')?.value) *
            (Number(x.get('price')?.value) - Number(x.get('discount')?.value));
        });

        this.purchaseDocumentFormGroup.patchValue({
          total: sub_total,
        });
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }

  openEditDiscount(i: number) {
    const sheet = this.sheet.open(UpdateProductPurchasePriceComponent, {
      data: {
        discount: this.t.controls[i].get('discount')?.value,
        price: this.t.controls[i].get('price')?.value,
        discountPercentage: this.t.controls[i].get('discountPercentage')?.value,
        save_price: this.t.controls[i].get('save_price')?.value,
      },
    });
    sheet.afterDismissed().subscribe((data: any) => {
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
    if (
      this.purchaseDocumentFormGroup.invalid ||
      this.isSubmitting ||
      this.purchaseDocumentFormGroup.get('discount')?.value >
        this.purchaseDocumentFormGroup.get('total')?.value
    ) {
      return;
    } else {
      if (type == 'confirm') {
        this.dialog
          .open(DeleteConfirmationComponent, {
            data: {
              header: this.translateService.instant(
                'purchase-invoice__confirm__header'
              ),
              title: this.translateService.instant(
                'purchase-invoice__confirm__confirm__title'
              ),
              document: `[${this.metaFormGroup.value.good_receipt_name}]`,
            },
          })
          .afterClosed()
          .subscribe((data) => {
            if (data == true) {
              this.isSubmitting = true;
              this.apiService
                .put(`purchase-invoice/confirm`, {
                  id: this.route.snapshot.params['id'],
                  discount: this.purchaseDocumentFormGroup.value.discount,
                  good_receipt: this.t.controls.map((x) => {
                    return {
                      id: x.get('id')?.value,
                      price: x.get('price')?.value,
                      discount: x.get('discount')?.value,
                    };
                  }),
                  good_receipt_name: this.metaFormGroup.value.good_receipt_name,
                  purchase_invoice_name: this.metaFormGroup.value.name,
                  date: this.datePipe.transform(
                    this.metaFormGroup.value.date,
                    'yyyy-MM-dd'
                  ),
                })
                .subscribe({
                  next: (_) => {
                    this.alertService.showSuccess(
                      this.translateService.instant(
                        'purchase-invoice__confirm__confirm__success'
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
            if (data == true) {
              this.isSubmitting = true;
              this.apiService
                .put(`purchase-invoice/delete`, {
                  id: this.route.snapshot.params['id'],
                  discount: this.purchaseDocumentFormGroup.value.discount,
                  good_receipt: this.t.controls.map((x) => {
                    return {
                      id: x.get('id')?.value,
                      price: x.get('price')?.value,
                      discount: x.get('discount')?.value,
                    };
                  }),
                  good_receipt_name: this.metaFormGroup.value.good_receipt_name,
                  purchase_invoice_name: this.metaFormGroup.value.name,
                  date: this.datePipe.transform(
                    this.metaFormGroup.value.date,
                    'yyyy-MM-dd'
                  ),
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
  }

  getFormGroupAt(i: number) {
    return this.t.at(i) as FormGroup;
  }
}
