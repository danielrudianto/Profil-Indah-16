import { Component } from '@angular/core';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { DepositViewComponent } from '../deposit-view/deposit-view.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-deposit-list',
  templateUrl: './deposit-list.component.html',
  styleUrls: ['./deposit-list.component.css'],
})
export class DepositListComponent {
  constructor(private dialog: MatDialog) {}

  isLoading: boolean = false;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;

  changePage(event: any) {
    this.page = event.pageIndex + 1;
  }

  viewDeposit(id: number) {
    this.dialog.open(DepositViewComponent, {
      data: {
        id: id,
        noAction: true,
        print: true,
      },
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

  getValue(data: any[]) {
    return data.reduce((a, b) => {
      return a + b.quantity * (b.price - b.discount);
    }, 0);
  }
}
