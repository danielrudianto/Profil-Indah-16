import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from '../../../services/dynamic-component.service';
import { DeleteConfirmationComponent } from '../../components/delete-confirmation/delete-confirmation.component';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../../services/api.service';
import { UserEditComponent } from './user-edit/user-edit.component';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent {
  constructor(
    private authService: AuthService,
    private dialog: MatDialog,
    private dynamicComponentService: DynamicComponentService,
    private apiService: ApiService
  ) {}

  isLoading: boolean = true;
  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  previousRoute: string = '';
  isAdministrator: boolean = false;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
  }

  openDialog(dialogType: string, id: number) {
    if (dialogType == 'delete') {
      this.dialog
        .open(DeleteConfirmationComponent, {
          data: {
            header: 'Delete User',
            document: `Are you sure to delete this user?`,
            id: id,
          },
        })
        .afterClosed()
        .subscribe((data) => {
          if (data === true) {
            this.apiService.delete(`user/${id}`).subscribe((data) => {
              const index = this.dataSource.findIndex((x) => x.id === id);
              this.dataSource.splice(index, 1);
              this.dataSource = [...this.dataSource];
              this.dataCount = this.dataCount - 1;
            });
          }
        });
    } else if (dialogType == 'edit') {
      this.dynamicComponentService
        .createDynamicComponent(UserEditComponent, {
          id: id,
        })
        .subscribe({
          next: (data) => {
            if (data != undefined) {
              const index = this.dataSource.findIndex((x) => x.id === id);
              this.dataSource[index].name = data.name;
              this.dataSource[index].nik = data.nik;
              this.dataSource[index].username = data.username;
              this.dataSource[index].role = data.role;
            }
          },
          error: (error) => {},
        });
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
    this.dataCount = data.count;
    this.dataSource = data.data;
  }

  onUpdateLoadingStatus(data: any) {
    this.isLoading = data;
  }

  onAddButtonPressed() {}
}
