import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { PromotionCreateComponent } from './promotion-create/promotion-create.component';
import { PromotionViewComponent } from './promotion-view/promotion-view.component';
import { PromotionViewActionComponent } from './promotion-view-action/promotion-view-action.component';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-promotion',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.css'],
})
export class PromotionComponent {
  constructor(
    private router: Router,
    private dynamicComponentService: DynamicComponentService,
    private apiService: ApiService,
    private alertService: AlertService
  ) {}

  page: number = 1;
  isLoading: boolean = true;
  dataCount: number = 0;
  dataSource: any[] = [];

  keyword: string = '';

  searchFormGroup: FormGroup = new FormGroup({
    keyword: new FormControl(''),
  });

  ngOnInit(): void {
    this.fetch();

    this.searchFormGroup.valueChanges.pipe(debounceTime(500)).subscribe({
      next: (value) => {
        this.keyword = value;
        this.fetch(1);
      },
    });
  }

  onUpdatePage() {
    this.page = 1;
  }

  onUpdateData(data: any) {
    this.dataCount = data.count;
    this.dataSource = data.data;
  }

  onUpdateLoadingStatus(data: boolean) {
    this.isLoading = data;
  }

  changePage(event: any) {
    const page = event.pageIndex + 1;
    this.page = page;
  }

  onAddButtonPressed() {
    const url = window.location.href;
    this.dynamicComponentService.createDynamicComponent(
      PromotionCreateComponent,
      {}
    );
  }

  fetch(page: number = this.page) {
    this.isLoading = true;
    this.page = page;

    this.apiService
      .get('promotion', {
        keyword: this.keyword,
        page: this.page,
      })
      .subscribe({
        next: (data: any) => {
          this.dataSource = data.data;
          this.dataCount = data.count;

          this.isLoading = false;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      });
  }

  onPageChange(event: any) {
    this.page = event.pageIndex + 1;
    this.fetch();
  }

  viewPromotion(index: number) {
    const id = this.dataSource[index].id;
    const brand = this.dataSource[index].brand;
    const supplier = this.dataSource[index].supplier;
    this.dynamicComponentService.createDynamicComponent(
      PromotionViewActionComponent,
      { id: id, brand: brand, supplier: supplier }
    );
  }
}
