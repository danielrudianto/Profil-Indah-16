import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { PaymentMethod } from 'src/app/models/payment-method.model';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { PaymentMethodUpdateComponent } from './payment-method-update/payment-method-update.component';

@Component({
  selector: 'app-payment-method',
  templateUrl: './payment-method.component.html',
  styleUrls: ['./payment-method.component.css'],
})
export class PaymentMethodComponent {
  constructor(
    private authService: AuthService,
    private dynamicComponentService: DynamicComponentService,
    private dialog: MatDialog
  ) {}

  isLoading: boolean = true;
  dataSource: PaymentMethod[] = [];
  dataCount: number = 0;
  page: number = 1;
  previousRoute: string = '';
  isAdministrator: boolean = false;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
  }

  openDialog(dialogType: string, id: number) {
    if (dialogType == 'edit') {
      this.dialog
        .open(PaymentMethodUpdateComponent, {
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
              this.dataSource[index].description = data.description;
            }
          }
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
}
