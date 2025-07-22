import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { CustomerModel } from 'src/app/models/customer.model';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { CustomerUpdateComponent } from './customer-update/customer-update.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css'],
})
export class CustomerComponent {
  constructor(
    private authService: AuthService,
    private dynamicComponentService: DynamicComponentService,
    private dialog: MatDialog
  ) {}

  isLoading: boolean = true;
  dataSource: CustomerModel[] = [];
  dataCount: number = 0;
  page: number = 1;
  pageSize: number = 10;
  previousRoute: string = '';
  isAdministrator: boolean = false;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
  }

  openDialog(dialogType: string, id: number) {
    if (dialogType == 'edit') {
      this.dialog
        .open(CustomerUpdateComponent, {
          data: {
            id: id,
          },
        })
        .afterClosed()
        .subscribe((data) => {
          if (data) {
            const index = this.dataSource.findIndex((x) => x.id == id);
            if (index != -1) {
              this.dataSource[index].name = data.name;
              this.dataSource[index].address = data.address;
              this.dataSource[index].npwp = data.npwp;
            }
          }
        });
    }
  }

  changePage(event: PageEvent) {
    if (this.pageSize != event.pageSize) {
      this.pageSize = event.pageSize;
      this.fetchProducts(1);
    } else {
      this.page = event.pageIndex + 1;
      this.fetchProducts(this.page);
    }
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
}
