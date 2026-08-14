import { Component, Input } from '@angular/core';
import { ProductSelectorType } from '../product-selector/product-selector.component';
import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { DynamicDialogComponent } from '../dynamic-dialog/dynamic-dialog.component';
import { DialogHeaderComponent } from '../dialog-header/dialog-header.component';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf, NgFor } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatPaginator } from '@angular/material/paginator';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-package-selector',
    templateUrl: './package-selector.component.html',
    styleUrls: ['./package-selector.component.css'],
    imports: [DynamicDialogComponent, DialogHeaderComponent, FormsModule, ReactiveFormsModule, MatFormField, MatLabel, MatInput, NgIf, MatProgressSpinner, NgFor, MatPaginator, TranslatePipe]
})
export class PackageSelectorComponent {
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
      .get(`product-package`, {
        keyword: keyword,
        page: page,
        content: 'true',
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
