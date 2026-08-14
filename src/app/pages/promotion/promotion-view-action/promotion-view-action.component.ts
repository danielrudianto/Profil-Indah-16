import { Component, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PromotionCreateRuleComponent } from '../promotion-create-rule/promotion-create-rule.component';
import { PromotionViewComponent } from '../promotion-view/promotion-view.component';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DatePipe, NgIf, NgFor, NgSwitch, NgSwitchCase } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { DynamicDialogComponent } from '../../../components/dynamic-dialog/dynamic-dialog.component';
import { DialogHeaderComponent } from '../../../components/dialog-header/dialog-header.component';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgxMaskDirective } from 'ngx-mask';
import { AutocompleteSearchComponent } from '../../../components/autocomplete-search/autocomplete-search.component';
import { EmptyTableComponent } from '../../../components/empty-table/empty-table.component';
import { MatIconButton, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-promotion-view-action',
    templateUrl: './promotion-view-action.component.html',
    styleUrls: ['./promotion-view-action.component.css'],
    animations: [panelAnimation],
    imports: [DynamicDialogComponent, DialogHeaderComponent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, MatDatepickerInput, MatDatepickerToggle, MatSuffix, MatDatepicker, NgxMaskDirective, AutocompleteSearchComponent, NgIf, EmptyTableComponent, NgFor, NgSwitch, NgSwitchCase, MatIconButton, MatIcon, MatButton, TranslatePipe]
})
export class PromotionViewActionComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private _hotKeysService: HotkeysService,
    private apiService: ApiService,
    private alertService: AlertService,
    private sheet: MatBottomSheet,
    private datePipe: DatePipe,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {
    this._hotKeysService.add([
      new Hotkey('esc', () => {
        this.closeDialog();
        return false;
      }),
    ]);
  }

  @Input() data!: any;

  panelState: string = 'closed';
  isLoading: boolean = true;
  dataSource: any = null;
  isSubmitting: boolean = false;
  isOpened: boolean = false;

  promotionFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    start: new FormControl('', [Validators.required]),
    end: new FormControl(''),
    target: new FormControl(0, [Validators.required, Validators.min(0)]),
    brand: new FormControl('', [Validators.required]),
    brand_name: new FormControl(''),
    supplier: new FormControl('', Validators.required),
    supplier_name: new FormControl(''),
    rules: new FormArray([]),
  });

  ngOnInit(): void {
    this.isOpened = true;
    this.fetchByID(this.data.id);

    this.promotionFormGroup.patchValue({
      brand_name: this.data.brand,
      supplier_name: this.data.supplier,
    });
  }

  closeDialog() {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }

  fetchByID(id: number) {
    this.isLoading = true;
    this.apiService
      .get(`promotion/${id}`)
      .subscribe({
        next: (data: any) => {
          this.promotionFormGroup.patchValue({
            name: data.name,
            description: data.description,
            start: new Date(data.start),
            end: data.end == null ? null : new Date(data.end),
            target: data.target,
            brand_name: data.brand.name,
            brand: data.brand_id,
            supplier_name: data.supplier.name,
            supplier: data.supplier_id,
          });

          data.promotion.forEach((x: any) => {
            this.t.push(
              new FormGroup({
                rule: new FormControl(x.rule),
                value: new FormControl(x.value),
              })
            );
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

  get f() {
    return this.promotionFormGroup.controls;
  }

  get t(): FormArray {
    return this.promotionFormGroup.get('rules') as FormArray;
  }

  save() {
    this.isSubmitting = true;
    this.apiService
      .put('promotion', {
        id: this.data.id,
        name: this.f['name'].value,
        description: this.f['description'].value,
        startDate: this.datePipe.transform(
          this.f['startDate'].value,
          'yyyy-MM-dd'
        ),
        endDate:
          this.f['endDate'].value == ''
            ? null
            : this.datePipe.transform(this.f['endDate'].value, 'yyyy-MM-dd'),
        target: this.f['target'].value,
        brand_id: this.f['brand'].value,
        rules: this.t.value,
      })
      .subscribe({
        next: (_) => {
          this.alertService.showSuccess(
            this.translateService.instant('promotion__update__success')
          );
          this.closeDialog();
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isSubmitting = false;
      });
  }

  viewPromotionResult() {
    this.dialog.open(PromotionViewComponent, {
      data: {
        id: this.data.id,
      },
    });
  }

  removeRule(index: number) {
    this.t.removeAt(index);
  }

  addRuleDialog() {
    const ruleSheet = this.sheet.open(PromotionCreateRuleComponent);
    ruleSheet.afterDismissed().subscribe((data) => {
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

  onSelectSupplier(event: any) {
    this.promotionFormGroup.patchValue({
      supplier: event.id,
    });
  }

  onUnselectSupplier() {
    this.promotionFormGroup.patchValue({
      supplier: '',
    });
  }

  onSelectBrand(event: any) {
    this.promotionFormGroup.patchValue({
      brand: event.id,
    });
  }

  onUnselectBrand() {
    this.promotionFormGroup.patchValue({
      brand: '',
    });
  }

  submitForm(): void {
    this.isSubmitting = true;
    this.apiService
      .put('promotion', {
        id: this.data.id,
        name: this.f['name'].value,
        description: this.f['description'].value,
        startDate: this.datePipe.transform(this.f['start'].value, 'yyyy-MM-dd'),
        endDate:
          this.f['end'].value == ''
            ? null
            : this.datePipe.transform(this.f['end'].value, 'yyyy-MM-dd'),
        target: this.f['target'].value,
        brand_id: this.f['brand'].value,
        rules: this.t.value,
      })
      .subscribe({
        next: (_) => {
          this.alertService.showSuccess(
            this.translateService.instant('promotion__update__success')
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
