import { Component, Inject, Input } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-price-purchase-update',
  templateUrl: './price-purchase-update.component.html',
  styleUrls: ['./price-purchase-update.component.css'],
})
export class PricePurchaseUpdateComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _hotKeysService: HotkeysService,
    private apiService: ApiService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private dialog: MatDialogRef<PricePurchaseUpdateComponent>
  ) {
    this._hotKeysService.add([
      new Hotkey('esc', (event: KeyboardEvent): boolean => {
        this.closeDialog();
        return false;
      }),
    ]);
  }

  isOpened: boolean = true;
  isSubmitting: boolean = false;
  isLoading: boolean = true;
  priceFormGroup: FormGroup = new FormGroup({
    reference: new FormControl(''),
    description: new FormControl(''),
    id: new FormControl('', Validators.required),
    item_price: new FormArray([]),
  });

  ngOnInit(): void {
    this.fetchByID();
  }

  get f() {
    return this.priceFormGroup.controls;
  }

  get t() {
    return this.priceFormGroup.get('item_price') as FormArray;
  }

  fetchByID(): void {
    this.apiService
      .get(`product-price-purchase/v2/${this.data.id}`)
      .subscribe({
        next: (data: any) => {
          this.priceFormGroup.patchValue({
            reference: data.reference,
            description: data.description,
            id: data.id,
          });

          const index = data.item_price.findIndex(
            (x: any) => x.item_unit_id == null
          );

          this.t.push(
            this.formBuilder.group({
              item_id: [data.id],
              item_unit_id: [null],
              unit: [data.unit, [Validators.required]],
              price: [
                index == -1 ? 0 : data.item_price[index].price,
                [Validators.required, Validators.min(0)],
              ],
              discount: [
                index == -1 ? 0 : data.item_price[index].discount,
                [Validators.required, Validators.min(0)],
              ],
            })
          );

          data.item_price
            .filter((x: any) => x.item_unit_id != null)
            .forEach((item: any) => {
              const item_price = this.formBuilder.group({
                item_id: [data.id],
                item_unit_id: [item.item_unit_id],
                unit: [item.item_unit.unit],
                price: [item.price, [Validators.required, Validators.min(0)]],
                discount: [
                  item.discount,
                  [Validators.required, Validators.min(0)],
                ],
              });

              this.t.push(item_price);
            });
        },
        error: (error) => {
          this.alertService.showError(error);
          this.closeDialog();
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  closeDialog(data: any = undefined) {
    this.dialog.close(data);
  }

  getFormGroupAt(i: number) {
    return this.t.at(i) as FormGroup;
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService
      .put('product-price-purchase/v2', {
        data: this.t.value,
      })
      .subscribe({
        next: (_) => {
          this.alertService.showSuccess(
            this.translateService.instant('purchase-price__update__success')
          );
          this.closeDialog(this.t.value);
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
