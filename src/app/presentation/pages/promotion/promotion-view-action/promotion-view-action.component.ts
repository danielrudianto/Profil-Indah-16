import { Component, Input } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { PromotionCreateRuleComponent } from '../promotion-create-rule/promotion-create-rule.component';
import { PromotionViewComponent } from '../promotion-view/promotion-view.component';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { panelAnimation } from 'src/app/animations/panel.animation';

@Component({
  selector: 'app-promotion-view-action',
  templateUrl: './promotion-view-action.component.html',
  styleUrls: ['./promotion-view-action.component.css'],
  animations: [panelAnimation],
})
export class PromotionViewActionComponent {
  @Input() data!: any;

  panelState: string = 'closed';
  isLoading: boolean = true;
  dataSource: any = null;
  isSubmitting: boolean = false;

  promotionFormGroup: FormGroup = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl(''),
    target: new FormControl(0, [Validators.required, Validators.min(0)]),
    brand: new FormControl('', [Validators.required]),
    brand_name: new FormControl(''),
    supplier: new FormControl('', Validators.required),
    supplier_name: new FormControl(''),
    rules: new FormArray([]),
  });

  constructor(
    private dynamicComponentService: DynamicComponentService,
    private _hotKeysService: HotkeysService,
    private apiService: ApiService,
    private alertService: AlertService,
    private sheet: MatBottomSheet,
    private datePipe: DatePipe,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.panelState = 'opened';
    this._hotKeysService.add([
      new Hotkey('esc', (event: KeyboardEvent): boolean => {
        this.close();
        return false;
      }),
      new Hotkey('f', (event: KeyboardEvent): boolean => {
        this.enlarge();
        return false;
      }),
    ]);

    this.fetchByID(this.data.id);

    this.promotionFormGroup.patchValue({
      brand_name: this.data.brand,
      supplier_name: this.data.supplier,
    });
  }

  enlarge() {
    if (this.panelState == 'opened') {
      this.panelState = 'enlarged';
    } else if (this.panelState == 'enlarged') {
      this.panelState = 'opened';
    }
  }

  close() {
    this.panelState = 'closed';
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
            startDate: data.start,
            endDate: data.end,
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
          this.close();
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
        next: (data) => {
          this.alertService.showSuccess('Promotion updated successfully');
          this.close();
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
      data: this.data.id,
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
}
