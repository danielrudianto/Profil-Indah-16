import { Component } from '@angular/core';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { DepositViewComponent } from '../deposit-view/deposit-view.component';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { ApiService } from '../../../../services/api.service';
import { AlertService } from '../../../../services/alert.service';
import { debounceTime } from 'rxjs';

@Component({
    selector: 'app-deposit-list',
    templateUrl: './deposit-list.component.html',
    styleUrls: ['./deposit-list.component.css'],
    standalone: false
})
export class DepositListComponent {
  constructor(
    private dialog: MatDialog,
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  isLoading: boolean = false;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  pageSize: number = 10;

  searchBarFormControl: FormControl = new FormControl('');

  ngOnInit(): void {
    this.fetch(1);

    this.searchBarFormControl.valueChanges
      .pipe(debounceTime(500))
      .subscribe(() => {
        this.fetch(1);
      });
  }

  changePage(event: any) {
    if (event.pageIndex == this.page - 1) {
      this.pageSize = event.pageSize;
      this.fetch(1);
    } else {
      this.page = event.pageIndex + 1;
      this.fetch();
    }
  }

  viewDeposit(id: number) {
    this.dialog
      .open(DepositViewComponent, {
        data: {
          id: id,
          noAction: false,
          print: true,
        },
      })
      .afterClosed()
      .subscribe((data) => {
        if (data === 'reject') {
          const index = this.dataSource.findIndex((x) => x.id === id);
          if (index != -1) {
            this.dataSource.splice(index, 1);
          }
          this.dataCount--;
        }
      });
  }

  fetch(page: number = this.page) {
    this.isLoading = true;
    this.apiService
      .get(`sales-deposit`, {
        keyword: this.searchBarFormControl.value,
        page: this.page,
        pageSize: this.pageSize,
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
        this.isLoading = false;
      });
  }

  getValue(data: any[]) {
    return data.reduce((a, b) => {
      return a + b.quantity * (b.price - b.discount);
    }, 0);
  }
}
