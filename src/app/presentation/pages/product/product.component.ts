import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Item } from 'src/app/models/item.model';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { DeleteConfirmationComponent } from '../../components/delete-confirmation/delete-confirmation.component';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
})
export class ProductComponent {
  constructor(
    private authService: AuthService,
    private dynamicComponentService: DynamicComponentService,
    private dialog: MatDialog
  ) {}

  isLoading: boolean = true;
  dataSource: Item[] = [];
  dataCount: number = 0;
  page: number = 1;
  previousRoute: string = '';
  isAdministrator: boolean = false;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
    console.log(this.isAdministrator);
  }

  openDialog(dialogType: string, id: number) {
    if (dialogType == 'edit') {
    } else if (dialogType == 'delete') {
      const dialog = this.dialog.open(DeleteConfirmationComponent, {
        data: {
          title: 'Delete product',
          message: 'Are you sure you want to delete this product?',
        },
      });

      dialog.afterClosed().subscribe((data) => {
        console.log(data);
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
