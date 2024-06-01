import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ItemType } from 'src/app/models/item.model';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ProductTypeUpdateComponent } from './product-type-update/product-type-update.component';

@Component({
  selector: 'app-product-type',
  templateUrl: './product-type.component.html',
  styleUrls: ['./product-type.component.css'],
})
export class ProductTypeComponent {
  constructor(
    private authService: AuthService,
    private dynamicComponentService: DynamicComponentService
  ) {}

  isLoading: boolean = true;
  dataSource: ItemType[] = [];
  dataCount: number = 0;
  page: number = 1;
  previousRoute: string = '';
  isAdministrator: boolean = false;

  ngOnInit(): void {
    this.isAdministrator = this.authService.isAdministrator();
  }

  openDialog(dialogType: string, id: number) {
    if (dialogType == 'edit') {
      const dialog = this.dynamicComponentService.createDynamicComponent(
        ProductTypeUpdateComponent,
        {
          id: id,
        }
      );

      dialog.subscribe({
        next: (data) => {
          if (data != undefined && data != null) {
            const index = this.dataSource.findIndex((x) => x.id == data.id);
            if (index != -1) {
              this.dataSource[index].name = data.name;
            }
          }
        },
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
