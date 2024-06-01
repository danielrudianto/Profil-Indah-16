import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-stock-list-report',
  templateUrl: './stock-list-report.component.html',
  styleUrls: ['./stock-list-report.component.css'],
  animations: [panelAnimation],
})
export class StockListReportComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private _hotKeysService: HotkeysService,
    private apiService: ApiService,
    private alertService: AlertService,
    private datePipe: DatePipe
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
  isLoading: boolean = true;
  dataSource: any = null;
  index: number = 1;
  formGroup: FormGroup = new FormGroup({
    date: new FormControl(
      this.datePipe.transform(new Date(), 'yyyy-MM-dd'),
      Validators.required
    ),
    view_by: new FormControl(false, Validators.required),
  });

  ngOnInit(): void {
    this.panelState = 'opened';
    this.fetchByID();

    this.formGroup.controls['date'].valueChanges.subscribe(() => {
      this.fetchByID();
    });
  }

  fetchByID(): void {
    this.isLoading = true;
    this.formGroup.disable({ emitEvent: false });
    const date = new Date(this.formGroup.controls['date'].value);
    this.apiService
      .post('product-stock', {
        mode: 'mutation',
        itemID: this.data.id,
        date: this.datePipe.transform(date, 'yyyy-MM-dd'),
        offset: date.getTimezoneOffset(),
      })
      .subscribe({
        next: (data) => {
          this.dataSource = data;
        },
        error: (error) => {
          this.alertService.showError(error);
          this.close();
        },
      })
      .add(() => {
        this.isLoading = false;
        this.formGroup.enable({ emitEvent: false });
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
}
