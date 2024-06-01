import { Component, Input } from '@angular/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-price-sales-update',
  templateUrl: './price-sales-update.component.html',
  styleUrls: ['./price-sales-update.component.css'],
})
export class PriceSalesUpdateComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private _hotKeysService: HotkeysService,
    private apiService: ApiService,
    private alertService: AlertService
  ) {
    this._hotKeysService.add([
      new Hotkey('esc', (event: KeyboardEvent): boolean => {
        this.closeDialog();
        return false;
      }),
    ]);
  }

  @Input('data') data: any;
  isOpened: boolean = true;
  isLoading: boolean = true;
  dataSource: any;

  ngOnInit(): void {
    this.fetchByID();
    console.log(this.data);
  }

  fetchByID(): void {
    this.apiService
      .get(`product-price-sales/${this.data.id}`)
      .subscribe({
        next: (data) => {
          this.dataSource = data;
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

  closeDialog() {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }
}
