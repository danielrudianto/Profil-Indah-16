import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-adjustment-case-archive-filter',
  templateUrl: './adjustment-case-archive-filter.component.html',
  styleUrls: ['./adjustment-case-archive-filter.component.css'],
  animations: [panelAnimation],
})
export class AdjustmentCaseArchiveFilterComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private _hotKeysService: HotkeysService
  ) {
    this._hotKeysService.add([
      new Hotkey('esc', (event: KeyboardEvent): boolean => {
        this.close();
        return false; // Prevent bubbling
      }),
      new Hotkey('f', (event: KeyboardEvent): boolean => {
        this.enlarge();
        return false;
      }),
    ]);
  }

  @Input('data') data: any;
  panelState: string = 'closed';
  maxDate: Date = new Date();
  minDate: Date = new Date();
  adjustmentCaseArchiveFilterFormGroup: FormGroup = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    status: new FormControl('', Validators.required),
    type: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.panelState = 'opened';
    this.maxDate = new Date(this.data.year, this.data.month, 0);
    this.minDate = new Date(this.data.year, this.data.month - 1, 1);
    this.adjustmentCaseArchiveFilterFormGroup.patchValue({
      startDate: this.data.startDate,
      endDate: this.data.endDate,
      status: this.data.status,
      type: this.data.type,
    });
  }

  close() {
    this.panelState = 'closed';
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }

  enlarge() {
    if (this.panelState == 'opened') {
      this.panelState = 'enlarged';
    } else if (this.panelState == 'enlarged') {
      this.panelState = 'opened';
    }
  }

  saveFilters() {
    this.panelState = 'closed';
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent(
        this.adjustmentCaseArchiveFilterFormGroup.value
      );
    }, 300);
  }

  setStatusFilter(value: number) {
    this.adjustmentCaseArchiveFilterFormGroup.get('status')?.setValue(value);
  }

  setTypeFilter(value: number) {
    this.adjustmentCaseArchiveFilterFormGroup.get('type')?.setValue(value);
  }
}
