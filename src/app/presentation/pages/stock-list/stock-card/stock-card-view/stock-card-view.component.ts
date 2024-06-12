import { Component, Input } from '@angular/core';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-stock-card-view',
  templateUrl: './stock-card-view.component.html',
  styleUrls: ['./stock-card-view.component.css'],
})
export class StockCardViewComponent {
  constructor(
    private apiService: ApiService,
    private dynamicComponentService: DynamicComponentService,
    private _hotKeysService: HotkeysService,
    private alertService: AlertService
  ) {
    this._hotKeysService.add([
      new Hotkey('esc', (): boolean => {
        this.closeDialog();
        return false;
      }),
    ]);
  }

  @Input('data') data: any;
  isOpened: boolean = false;
  isLoading: boolean = true;
  dataSource: any = null;

  ngOnInit(): void {
    this.isOpened = true;
    this.fetchDocument(this.data.id, this.data.route);
  }

  fetchDocument(id: number, route: string): void {
    this.isLoading = true;
    this.apiService
      .get(`${route}/${id}`)
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

  closeDialog(): void {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    });
  }
}
