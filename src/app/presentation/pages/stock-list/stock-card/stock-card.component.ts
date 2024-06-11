import { Component, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';
import { panelAnimation } from 'src/app/animations/panel.animation';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-stock-card',
  templateUrl: './stock-card.component.html',
  styleUrls: ['./stock-card.component.css'],
  animations: [panelAnimation],
})
export class StockCardComponent {
  constructor(
    private apiService: ApiService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService,
    private _hotKeysService: HotkeysService
  ) {
    this._hotKeysService.add([
      new Hotkey('esc', (): boolean => {
        this.closeDialog();
        return false;
      }),
    ]);
  }

  @Input('data') data: any;
  isLoadingCard: boolean = false;
  isLoadingData: boolean = false;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  productDataSource: any = null;
  isOpened: boolean = false;
  id: number | null = null;

  ngOnInit(): void {
    this.isOpened = true;
    this.id = Number(this.data.id);

    this.fetchProduct(this.id);
    this.fetchStockCard(this.id, 1);
  }

  fetchStockCard(id: number, page: number = this.page) {
    this.page = page;
    this.isLoadingCard = true;
    this.apiService
      .get(`product-stock/${id}`, {
        page: this.page,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoadingCard = false;
      });
  }

  fetchProduct(id: number) {
    this.isLoadingData = true;
    this.apiService
      .get(`product-stock/meta/${id}`)
      .subscribe({
        next: (data) => {
          this.productDataSource = data;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoadingData = false;
      });
  }

  changePage(event: PageEvent) {
    this.fetchStockCard(this.id!, event.pageIndex + 1);
  }

  closeDialog() {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }
}
