import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ExpenseTypeViewChildrenComponent } from './expense-type-view-children/expense-type-view-children.component';

@Component({
  selector: 'app-expense-type',
  templateUrl: './expense-type.component.html',
  styleUrls: ['./expense-type.component.css'],
})
export class ExpenseTypeComponent {
  constructor(
    private authService: AuthService,
    private dynamicComponentService: DynamicComponentService
  ) {}

  panelState: string = 'closed';
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
