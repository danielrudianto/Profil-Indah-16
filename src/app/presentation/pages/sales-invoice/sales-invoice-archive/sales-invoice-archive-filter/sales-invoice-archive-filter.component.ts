import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-sales-invoice-archive-filter',
  templateUrl: './sales-invoice-archive-filter.component.html',
  styleUrls: ['./sales-invoice-archive-filter.component.css'],
  animations: [panelAnimation],
})
export class SalesInvoiceArchiveFilterComponent {
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
  salesInvoiceArchiveFilterFormGroup: FormGroup = new FormGroup({
    startDate: new FormControl(''),
    endDate: new FormControl(''),
    status: new FormControl('', Validators.required),
    paymentStatus: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.panelState = 'opened';
    this.maxDate = new Date(this.data.year, this.data.month, 0);
    this.minDate = new Date(this.data.year, this.data.month - 1, 1);
    this.salesInvoiceArchiveFilterFormGroup.patchValue({
      startDate: this.data.startDate,
      endDate: this.data.endDate,
      status: this.data.status,
      paymentStatus: this.data.paymentStatus,
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
        this.salesInvoiceArchiveFilterFormGroup.value
      );
    }, 300);
  }

  setStatusFilter(value: number) {
    this.salesInvoiceArchiveFilterFormGroup.get('status')?.setValue(value);
  }

  setPaymentStatusFilter(value: number) {
    this.salesInvoiceArchiveFilterFormGroup
      .get('paymentStatus')
      ?.setValue(value);
  }
}
