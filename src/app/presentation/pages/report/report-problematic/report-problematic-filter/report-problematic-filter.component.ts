import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { AlertService } from '../../../../../services/alert.service';
import { DynamicComponentService } from '../../../../../services/dynamic-component.service';
import { panelAnimation } from '../../../../../animations/panel.animation';

@Component({
  selector: 'app-report-problematic-filter',
  templateUrl: './report-problematic-filter.component.html',
  styleUrls: ['./report-problematic-filter.component.css'],
  animations: [panelAnimation],
})
export class ReportProblematicFilterComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private _hotKeysService: HotkeysService,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private translateService: TranslateService
  ) {
    this._hotKeysService.add([
      new Hotkey('esc', (): boolean => {
        this.close();
        return false;
      }),
    ]);
  }

  @Input('data') data: any;
  panelState: string = 'closed';
  reportFormGroup: FormGroup = new FormGroup({
    brands: new FormArray([]),
    types: new FormArray([]),
  });

  ngOnInit(): void {
    this.panelState = 'opened';
    const brands = this.data.brands;
    const types = this.data.types;

    brands.forEach((x: any) => {
      this.t.push(this.formBuilder.group({ id: x.id, name: x.name }));
    });

    types.forEach((x: any) => {
      this.u.push(this.formBuilder.group({ id: x.id, name: x.name }));
    });
  }

  close(data: any = undefined) {
    this.panelState = 'closed';
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent(data);
    }, 300);
  }

  onSelectBrand(event: any) {
    if (
      this.t.controls.filter((x) => x.get('id')?.value == event.id).length > 0
    ) {
      this.alertService.showSuccess(
        this.translateService.instant(
          'report-inadequate__filter__brand__exists'
        )
      );
      return;
    } else {
      this.t.push(this.formBuilder.group({ id: event.id, name: event.name }));
    }
  }

  onSelectType(event: any) {
    if (
      this.u.controls.filter((x) => x.get('id')?.value == event.id).length > 0
    ) {
      this.alertService.showSuccess(
        this.translateService.instant('report-inadequate__filter__type__exists')
      );
      return;
    } else {
      this.u.push(this.formBuilder.group({ id: event.id, name: event.name }));
    }
  }

  removeBrand(i: number) {
    this.t.removeAt(i);
  }

  removeType(i: number) {
    this.u.removeAt(i);
  }

  saveFilters() {
    this.close(this.reportFormGroup.value);
  }

  get f() {
    return this.reportFormGroup.controls;
  }

  get t() {
    return this.reportFormGroup.controls['brands'] as FormArray;
  }

  get u() {
    return this.reportFormGroup.controls['types'] as FormArray;
  }
}
