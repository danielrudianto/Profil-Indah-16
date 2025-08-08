import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ExpenseTypeViewChildrenComponent } from './expense-type-view-children/expense-type-view-children.component';
import { MatDialog } from '@angular/material/dialog';
import { ExpenseTypeUpdateComponent } from './expense-type-update/expense-type-update.component';
import { DeleteConfirmationComponent } from '../../components/delete-confirmation/delete-confirmation.component';
import { ApiService } from 'src/app/services/api.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-expense-type',
  templateUrl: './expense-type.component.html',
  styleUrls: ['./expense-type.component.css'],
})
export class ExpenseTypeComponent {
  constructor(
    private authService: AuthService,
    private sheet: MatBottomSheet
  ) {}

  isLoading: boolean = true;
  dataSource: any[] = [];
  dataCount: number = 0;

  page: number = 1;
  isAdministrator: boolean = false;
  isSubmitting: boolean = false;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
  }

  openDialog(id: number) {
    this.sheet
      .open(ExpenseTypeViewChildrenComponent, {
        data: {
          id: id,
        },
      })
      .afterDismissed()
      .subscribe((data) => {
        if (data === 'deleted') {
          const index = this.dataSource.findIndex((x) => x.id == id);
          if (index != -1) {
            this.dataSource.splice(index, 1);
            this.dataCount -= 1;
          }
        } else {
          this.fetchProducts();
        }
      });
  }

  changePage(event: PageEvent) {
    this.page = event.pageIndex + 1;
  }

  fetchProducts(page: number = this.page) {
    this.page = page;
  }

  onUpdatePage() {
    this.page = 1;
  }

  onUpdateData(data: any) {
    this.dataSource = data;
  }

  onUpdateLoadingStatus(data: any) {
    this.isLoading = data;
  }
}
