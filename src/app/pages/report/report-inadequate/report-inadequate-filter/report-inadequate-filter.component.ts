import { Component, Input } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { AlertService } from 'src/app/services/alert.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { MatDialogTitle } from '@angular/material/dialog';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { AutocompleteSearchComponent } from '../../../../components/autocomplete-search/autocomplete-search.component';
import { NgIf, NgFor } from '@angular/common';
import { MatList, MatListSubheaderCssMatStyler, MatListItem, MatListItemIcon, MatListItemTitle } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';

@Component({
    selector: 'app-report-inadequate-filter',
    templateUrl: './report-inadequate-filter.component.html',
    styleUrls: ['./report-inadequate-filter.component.css'],
    animations: [panelAnimation],
    imports: [MatDialogTitle, MatIconButton, MatIcon, FormsModule, ReactiveFormsModule, AutocompleteSearchComponent, NgIf, MatList, MatListSubheaderCssMatStyler, NgFor, MatListItem, MatListItemIcon, MatListItemTitle, MatDivider, TranslatePipe]
})
export class ReportInadequateFilterComponent {
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
