import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ExpenseTypeViewChildrenComponent } from './expense-type-view-children/expense-type-view-children.component';
import { MatDialog } from '@angular/material/dialog';
import { ExpenseTypeUpdateComponent } from './expense-type-update/expense-type-update.component';
import { DeleteConfirmationComponent } from '../../components/delete-confirmation/delete-confirmation.component';
import { ApiService } from 'src/app/services/api.service';

@Component({
  selector: 'app-expense-type',
  templateUrl: './expense-type.component.html',
  styleUrls: ['./expense-type.component.css'],
})
export class ExpenseTypeComponent {
  constructor(
    private authService: AuthService,
    private dynamicComponentService: DynamicComponentService,
    private dialog: MatDialog,
    private apiService: ApiService
  ) {}

  panelState: string = 'closed';
  isLoading: boolean = true;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  previousRoute: string = '';
  isAdministrator: boolean = false;
  isSubmitting: boolean = false;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
  }

  openDialog(dialogType: string, id: number) {
    switch (dialogType) {
      case 'children':
        this.dynamicComponentService.createDynamicComponent(
          ExpenseTypeViewChildrenComponent,
          {
            id: id,
            name: this.dataSource.filter((e) => e.id == id)[0].name,
            description: this.dataSource.filter((e) => e.id == id)[0]
              .description,
          }
        );
        break;
      case 'edit':
        this.dialog.open(ExpenseTypeUpdateComponent, {
          data: {
            id: id,
          },
        });
        break;
      case 'delete':
        const dialog = this.dialog.open(DeleteConfirmationComponent, {
          data: {
            title: 'Are you sure to delete this expense type?',
            document:
              'This operation will also delete the children data (if any).',
          },
        });

        dialog.afterClosed().subscribe({
          next: (data) => {
            if (data == true) {
              this.isSubmitting = true;
              this.apiService
                .delete(`expense-type/${id}`)
                .subscribe({
                  next: (data) => {},
                  error: (error) => {},
                })
                .add(() => {
                  this.isSubmitting = false;
                });
            }
          },
        });
        break;
    }
  }

  changePage(event: PageEvent) {
    this.page = event.pageIndex + 1;
  }

  fetchProducts(page: number) {
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
