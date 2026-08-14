import { DatePipe, NgIf, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { Subject } from 'rxjs';
import {
  ProductSelectorComponent,
  ProductSelectorType,
} from 'src/app/presentation/components/product-selector/product-selector.component';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { VerticalDividerComponent } from '../../../components/vertical-divider/vertical-divider.component';
import { BoxStepperComponent } from '../../../components/box-stepper/box-stepper.component';
import { MatFormField, MatLabel, MatSuffix, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatSelect, MatOption } from '@angular/material/select';
import { AutocompleteSearchComponent } from '../../../components/autocomplete-search/autocomplete-search.component';
import { MatButton, MatIconButton } from '@angular/material/button';
import { NgxMaskDirective } from 'ngx-mask';
import { MatIcon } from '@angular/material/icon';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';

@Component({
    selector: 'app-adjustment-case-create',
    templateUrl: './adjustment-case-create.component.html',
    styleUrls: ['./adjustment-case-create.component.css'],
    imports: [VerticalDividerComponent, BoxStepperComponent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, MatSelect, MatOption, AutocompleteSearchComponent, MatButton, NgIf, NgFor, NgxMaskDirective, MatHint, MatIconButton, MatIcon, EmptyTableComponent, TranslateModule]
})
export class AdjustmentCaseCreateComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private _hotkeysService: HotkeysService,
    private datePipe: DatePipe,
    private translateService: TranslateService
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
  });

  ngOnInit(): void {
    this.t.valueChanges.subscribe(() => {
      let totalItems = 0;
      this.t.controls.forEach((x) => {
        totalItems += Number(x.get('quantity')?.value);
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

  ngOnDestroy(): void {
    this._hotkeysService.reset();
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

    this.productSelectorSubject.subscribe((result: any) => {
      if (result) {
        const data = result.data;
        const sub = result.sub;

        if (sub) {
          this.t.push(
            this.formBuilder.group({
              product_id: [data.id, Validators.required],
              product_unit_id: [sub.id],
              reference: [data.reference, Validators.required],
              description: [data.description, Validators.required],
              quantity: [0, [Validators.required]],
              unit: [sub.unit],
              conversion: [sub.conversion],
              default_unit: [data.unit],
            })
          );
        } else {
          this.t.push(
            this.formBuilder.group({
              product_id: [data.id, Validators.required],
              product_unit_id: [null],
              reference: [data.reference, Validators.required],
              description: [data.description, Validators.required],
              quantity: [0, [Validators.required]],
              unit: [data.unit, Validators.required],
              conversion: [1],
              default_unit: [data.unit],
            })
          );
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
      adjustment_case: this.t.controls.map((x) => {
        return {
          product_id: x.get('product_id')?.value,
          product_unit_id: x.get('product_unit_id')?.value,
          quantity: parseFloat(x.get('quantity')?.value),
        };
      }),
    };
    this.apiService
      .post('adjustment-case', adjusment_case)
      .subscribe({
        next: () => {
          this.alertService.showSuccess(
            this.translateService.instant('adjustment-case__create__success')
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
