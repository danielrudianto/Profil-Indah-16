import { Component } from '@angular/core';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { DepositViewComponent } from '../deposit-view/deposit-view.component';

@Component({
  selector: 'app-deposit-list',
  templateUrl: './deposit-list.component.html',
  styleUrls: ['./deposit-list.component.css'],
})
export class DepositListComponent {
  constructor(private dynamicComponentService: DynamicComponentService) {}

  isLoading: boolean = false;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;

  changePage(event: any) {
    this.page = event.pageIndex + 1;
  }

  viewDeposit(id: number) {
    const dialog = this.dynamicComponentService.createDynamicComponent(
      DepositViewComponent,
      {
        id: id,
      }
    );

    dialog.subscribe((data) => {
      if (data == 'deleted') {
        this.dataCount = this.dataCount - 1;
        const index = this.dataSource.findIndex((x) => x.id == id);
        this.dataSource.splice(index, 1);
      }
    });
  }

  onUpdateData(event: any) {
    this.dataSource = event.data;
    this.dataCount = event.count;
  }

  onUpdateLoadingStatus(event: any) {
    this.isLoading = event;
  }

  onUpdatePage() {
    this.page = 1;
  }
}
