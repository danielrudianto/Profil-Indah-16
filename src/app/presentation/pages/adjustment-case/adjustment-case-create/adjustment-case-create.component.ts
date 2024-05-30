import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { Subject } from 'rxjs';
import {
  ProductSelectorComponent,
  ProductSelectorType,
} from 'src/app/presentation/components/product-selector/product-selector.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-adjustment-case-create',
  templateUrl: './adjustment-case-create.component.html',
  styleUrls: ['./adjustment-case-create.component.css'],
})
export class AdjustmentCaseCreateComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private _hotkeysService: HotkeysService,
    private datePipe: DatePipe
  ) {
    this._hotkeysService.add(
      new Hotkey('alt+a', (event: KeyboardEvent): boolean => {
        this.openItemSelector();
        return false; // Prevent bubbling
      })
    );
  }

  productSelectorSubject: Subject<any> = new Subject();
  isSubmitting: boolean = false;
  metaFormGroup: FormGroup = new FormGroup({
    type: new FormControl(0, Validators.required),
    date: new FormControl(new Date(), Validators.required),
    company_id: new FormControl(null, Validators.required),
  });

  adjustmentEventFormGroup: FormGroup = new FormGroup({
    items: new FormArray([]),
    number_of_items: new FormControl(0, [
      Validators.required,
      Validators.min(0.01),
    ]),
    company_search_bar: new FormControl(''),
  });

  ngOnInit(): void {
    this.t.valueChanges.subscribe(() => {
      let totalItems = 0;
      this.t.controls.forEach((x) => {
        totalItems += parseFloat(x.get('quantity')?.value);
      });

      this.adjustmentEventFormGroup.patchValue({
        number_of_items: totalItems,
      });
    });

    this.metaFormGroup.controls['type'].valueChanges.subscribe((value) => {
      if (value == 1) {
        this.metaFormGroup.controls['company_id'].setValidators([]);
        this.metaFormGroup.patchValue({
          company_id: null,
        });
      } else {
        this.metaFormGroup.controls['company_id'].setValidators([
          Validators.required,
        ]);
      }
    });
  }

  onSelectCompany(data: any) {
    this.metaFormGroup.patchValue({
      company_id: data.id,
    });
    this.metaFormGroup.controls['company_id'].markAsDirty();
  }

  onUnselectCompany() {
    this.metaFormGroup.patchValue({
      company_id: '',
    });
  }

  get f() {
    return this.adjustmentEventFormGroup.controls;
  }
  get t() {
    return this.f['items'] as FormArray;
  }

  getFormGroupAt(i: number) {
    return this.t.at(i) as FormGroup;
  }

  removeItem(i: number) {
    this.t.removeAt(i);
  }

  openItemSelector() {
    this.productSelectorSubject =
      this.dynamicComponentService.createDynamicComponent(
        ProductSelectorComponent,
        {
          type: ProductSelectorType.sales,
        }
      );

    this.productSelectorSubject.subscribe((data: any) => {
      if (data != null && data != undefined) {
        if (
          this.t.controls.filter(
            (x) =>
              x.get('item_unit_id')?.value == data.item_unit_id &&
              x.get('item_id')?.value == data.id
          ).length > 0
        ) {
          this.alertService.showSuccess(
            'Item already exists! Please select different item.'
          );
        } else {
          this.t.push(
            this.formBuilder.group({
              item_id: [data.item.id, Validators.required],
              item_unit_id: [
                data.price == null ? null : data.price.item_unit_id,
              ],
              reference: [data.item.reference, Validators.required],
              description: [data.item.description, Validators.required],
              quantity: [0, [Validators.required, Validators.min(0.01)]],
              unit: [
                data.price == null ? data.item.unit : data.price.unit,
                Validators.required,
              ],
            })
          );

          this.adjustmentEventFormGroup.patchValue({
            number_of_items: this.t.length,
          });
        }
      }
    });
  }

  submitForm() {
    this.isSubmitting = true;
    const items: any[] = [];
    this.t.controls.forEach((x) => {
      items.push({
        item_id: x.get('item_id')?.value,
        item_unit_id: x.get('item_unit_id')?.value,
        quantity: parseFloat(x.get('quantity')?.value),
      });
    });
    const adjusment_case: any = {
      date: this.datePipe.transform(
        this.metaFormGroup.controls['date'].value,
        'yyyy-MM-dd'
      ),
      type: this.metaFormGroup.controls['type'].value,
      company_id:
        this.metaFormGroup.controls['company_id'].value == null
          ? null
          : parseInt(this.metaFormGroup.controls['company_id'].value),
      adjustment_case: items,
    };
    this.apiService
      .post('adjustment-event', adjusment_case)
      .subscribe({
        next: () => {
          this.alertService.showSuccess(
            'Adjustment event is successfully created.'
          );

          this.adjustmentEventFormGroup.reset();
          this.t.clear();
          this.metaFormGroup.patchValue({
            type: 0,
            date: new Date(),
          });

          this.adjustmentEventFormGroup.patchValue({
            number_of_items: 0,
          });
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  canExit() {
    if (this.metaFormGroup.dirty || this.adjustmentEventFormGroup.dirty) {
      if (
        confirm('All input will be deleted. Are you sure to exit this page?')
      ) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
}
