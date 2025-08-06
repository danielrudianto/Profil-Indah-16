import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { debounceTime } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { UserCreateComponent } from '../../pages/user/user-create/user-create.component';
import { ExpenseTypeCreateComponent } from '../../pages/expense-type/expense-type-create/expense-type-create.component';
import { ProductBrandCreateComponent } from '../../pages/product-brand/product-brand-create/product-brand-create.component';
import { ProductCreateComponent } from '../../pages/product/product-create/product-create.component';
import { ProductTypeCreateComponent } from '../../pages/product-type/product-type-create/product-type-create.component';
import { SupplierCreateComponent } from '../../pages/supplier/supplier-create/supplier-create.component';
import { CustomerCreateComponent } from '../../pages/customer/customer-create/customer-create.component';
import { CompanyCreateComponent } from '../../pages/company/company-create/company-create.component';
import { PaymentMethodCreateComponent } from '../../pages/payment-method/payment-method-create/payment-method-create.component';
import { PromotionCreateComponent } from '../../pages/promotion/promotion-create/promotion-create.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { Hotkey, HotkeysService } from 'angular2-hotkeys';

@Component({
  selector: 'app-feature-search',
  templateUrl: './feature-search.component.html',
  styleUrls: ['./feature-search.component.css'],
})
export class FeatureSearchComponent {
  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private dynamicComponentService: DynamicComponentService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertService: AlertService,
    private hotKeysService: HotkeysService
  ) {}

  @Input('buttonLabel') buttonLabel!: string;
  @Input('route') route!: string;
  @Input('page') page: number = 1;
  @Input('pageSize') pageSize: number = 10;
  @Input('enable') enable!: boolean;
  @Input('addButton') addButton!: boolean;

  @Output() onNewQuery = new EventEmitter();
  @Output() onChange = new EventEmitter();
  @Output() onLoadingChange = new EventEmitter<boolean>();
  @Output() onAddButtonPressed = new EventEmitter<boolean>();

  keyword: string = '';

  searchFormGroup: FormGroup = new FormGroup({
    searchBar: new FormControl(''),
  });

  openDialog() {
    const config: MatDialogConfig<any> = {
      minWidth: 400,
    };
    switch (this.route) {
      case 'product':
        this.router.navigate(['Create'], {
          relativeTo: this.activatedRoute,
        });
        break;
      case 'product-brand':
        this.dialog.open(ProductBrandCreateComponent, {});
        break;
      case 'product-type':
        this.dynamicComponentService.createDynamicComponent(
          ProductTypeCreateComponent,
          {}
        );
        break;
      case 'customer':
        this.dialog.open(CustomerCreateComponent, {});
        break;
      case 'supplier':
        this.dialog.open(SupplierCreateComponent, {});
        break;
      case 'user':
        this.dialog.open(UserCreateComponent, {});
        break;
      case 'expense-type':
        this.dialog.open(ExpenseTypeCreateComponent, {
          data: {
            parentId: null,
            parentName: null,
            parentDescription: null,
          },
        });
        break;
      case 'company':
        this.dialog.open(CompanyCreateComponent, {});
        break;
      case 'payment-method':
        this.dialog.open(PaymentMethodCreateComponent, {});
        break;
      case 'promotion':
        this.router.navigate(['Create'], {
          relativeTo: this.activatedRoute,
        });
        break;
      case 'product-package':
        this.router.navigate(['Create'], {
          relativeTo: this.activatedRoute,
        });
        break;
      //   case 'product-type':
      //     this.dialog.open(AddItemTypeFormComponent, config);
      //     break;
      //   case 'product-brand':
      //     this.dialog.open(AddItemBrandFormComponent, config);
      //     break;
      //   case 'product-package':
      //     this.onAddButtonPressed.emit(true);
      //     break;
      //   case 'supplier':
      //     this.onAddButtonPressed.emit(true);
      //     break;
      //   case 'customer':
      //     this.onAddButtonPressed.emit(true);
      //     break;
      //   case 'payment-method':
      //     this.dialog.open(AddPaymentMethodComponent, config);
      //     break;
      //   case 'expense-type':
      //     this.dialog.open(AddExpenseTypeFormComponent, config);
      //     break;
      //   case 'company':
      //     this.dialog.open(AddCompanyFormComponent, config);
      //     break;
      //   case 'user':
      //     this.onAddButtonPressed.emit(true);
      //     break;
      //   case 'promotion':
      //     this.onAddButtonPressed.emit(true);
      //     break;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes.hasOwnProperty('page') || !changes['page'].firstChange) {
      this.fetchItems();
    }
  }

  ngOnInit(): void {
    this.fetchItems();
    if (!this.enable) {
      this.searchFormGroup.controls['searchBar'].disable();
    }

    this.searchFormGroup.controls['searchBar'].valueChanges
      .pipe(debounceTime(1000))
      .subscribe((value) => {
        this.keyword = value;
        this.page = 1;
        this.onNewQuery.emit();
        this.fetchItems();
      });

    this.hotKeysService.add([
      new Hotkey('alt+a', (event: KeyboardEvent): boolean => {
        this.onAddButtonPressed.emit(true);
        this.openDialog();
        return false; // Prevent bubbling
      }),
    ]);
  }

  fetchItems() {
    this.onLoadingChange.emit(true);
    this.apiService
      .get(this.route, {
        keyword: this.keyword,
        page: this.page,
        pageSize: this.pageSize,
        content: 'false',
        mode: 'default',
      })
      .subscribe({
        next: (data: any) => {
          this.onChange.emit(data);
        },
        error: (error: any) => {
          console.error('Error fetching items:', error);
          this.alertService.showError(
            'Failed to fetch items. Please try again later.'
          );
        },
      })
      .add(() => {
        this.onLoadingChange.emit(false);
      });
  }
}
