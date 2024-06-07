import { Component, Inject, Input, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { slideInOutAnimation } from 'src/app/animations/slide-in-out.animation';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

export enum ProductSelectorType {
  purchase,
  sales,
  plain,
  return,
}
@Component({
  selector: 'app-product-selector',
  templateUrl: './product-selector.component.html',
  styleUrls: ['./product-selector.component.css'],
  animations: [slideInOutAnimation],
})
export class ProductSelectorComponent {
  constructor(
    private dataService: ApiService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService
  ) {}

  @Input('data') data: any;

  dataSource: any[] = [];
  dataCount: number = 0;
  page: number = 1;
  isOpened: boolean = true;
  isLoading: boolean = false;

  searchItemFormGroup: FormGroup = new FormGroup({
    searchBar: new FormControl(''),
  });

  ngOnInit(): void {
    this.fetchItems();
    this.searchItemFormGroup.controls['searchBar'].valueChanges
      .pipe(debounceTime(1000))
      .subscribe((value) => {
        this.page = 1;
        this.fetchItems(1, value);
      });
  }

  selectItem(data: any) {
    this.closeDialog(data);
  }

  closeDialog(data?: any) {
    this.isOpened = false;
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent(data);
    }, 300);
  }

  changePage(event: any) {
    this.page = event.pageIndex + 1;
    this.fetchItems();
  }

  fetchItems(
    page: number = this.page,
    keyword: string = this.searchItemFormGroup.controls['searchBar'].value
  ) {
    this.isLoading = true;
    this.dataService
      .get(`product`, {
        keyword: keyword,
        page: page,
        mode:
          this.data.type == ProductSelectorType.purchase
            ? 'purchase'
            : this.data.type == ProductSelectorType.sales
            ? 'sales'
            : this.data.type == ProductSelectorType.return
            ? 'return'
            : 'plain',
      })
      .subscribe({
        next: (data: any) => {
          this.dataCount = data.count;
          this.dataSource = data.data;
        },
        error: (error) => {
          this.alertService.showError(error);
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }
}
