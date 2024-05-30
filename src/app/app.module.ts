import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './presentation/pages/login/login.component';
import { DashboardComponent } from './presentation/pages/dashboard/dashboard.component';
import { SideNavigationComponent } from './presentation/components/side-navigation/side-navigation.component';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CircleAvatarComponent } from './presentation/components/circle-avatar/circle-avatar.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { ProfileDialogComponent } from './presentation/components/profile-dialog/profile-dialog.component';
import { DashboardTopComponent } from './presentation/pages/dashboard/dashboard-top/dashboard-top.component';
import { TopbarComponent } from './presentation/components/topbar/topbar.component';
import { DashboardCardComponent } from './presentation/pages/dashboard/dashboard-card/dashboard-card.component';
import { DashboardBottomComponent } from './presentation/pages/dashboard/dashboard-bottom/dashboard-bottom.component';
import { AdministratorDashboardComponent } from './presentation/pages/dashboard/administrator-dashboard/administrator-dashboard.component';
import { MainComponent } from './presentation/pages/main/main.component';
import { StatCardComponent } from './presentation/components/stat-card/stat-card.component';
import { ShortNumberPipe } from './pipes/number-format.pipe';
import { MatGridListModule } from '@angular/material/grid-list';
import { ProductComponent } from './presentation/pages/product/product.component';
import { ProductTypeComponent } from './presentation/pages/product-type/product-type.component';
import { ProductBrandComponent } from './presentation/pages/product-brand/product-brand.component';
import { AdministratorComponent } from './presentation/pages/entries/administrator/administrator.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { GcpInfoComponent } from './presentation/components/gcp-info/gcp-info.component';
import { FeatureHeaderComponent } from './presentation/components/feature-header/feature-header.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FeatureSearchComponent } from './presentation/components/feature-search/feature-search.component';
import { MatDialogModule } from '@angular/material/dialog';
import { FeatureBackgroundComponent } from './presentation/components/feature-background/feature-background.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { PackageComponent } from './presentation/pages/package/package.component';
import { SupplierComponent } from './presentation/pages/supplier/supplier.component';
import { CustomerComponent } from './presentation/pages/customer/customer.component';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { CompanyComponent } from './presentation/pages/company/company.component';
import { PurchasingComponent } from './presentation/pages/entries/purchasing/purchasing.component';
import { SalesComponent } from './presentation/pages/entries/sales/sales.component';
import { GeneralComponent } from './presentation/pages/entries/general/general.component';
import { UserComponent } from './presentation/pages/user/user.component';
import { PaymentMethodComponent } from './presentation/pages/payment-method/payment-method.component';
import { ExpenseTypeComponent } from './presentation/pages/expense-type/expense-type.component';
import { ExpenseComponent } from './presentation/pages/expense/expense.component';
import { PurchasingDashboardComponent } from './presentation/pages/dashboard/purchasing-dashboard/purchasing-dashboard.component';
import { SalesDashboardComponent } from './presentation/pages/dashboard/sales-dashboard/sales-dashboard.component';
import { ProfileComponent } from './presentation/pages/entries/profile/profile.component';
import { AvatarComponent } from './presentation/components/avatar/avatar.component';
import { ProfileOverviewComponent } from './presentation/pages/profile-overview/profile-overview.component';
import { MatSelectModule } from '@angular/material/select';
import { SetAvatarComponent } from './presentation/pages/set-avatar/set-avatar.component';
import { UpdateProductComponent } from './presentation/pages/product/update-product/update-product.component';
import { MatStepperModule } from '@angular/material/stepper';
import { AutocompleteSearchComponent } from './presentation/components/autocomplete-search/autocomplete-search.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DynamicDialogComponent } from './presentation/components/dynamic-dialog/dynamic-dialog.component';
import { DialogHeaderComponent } from './presentation/components/dialog-header/dialog-header.component';
import { CustomStepperComponent } from './presentation/components/custom-stepper/custom-stepper.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BoxStepperComponent } from './presentation/components/box-stepper/box-stepper.component';
import { VerticalDividerComponent } from './presentation/components/vertical-divider/vertical-divider.component';
import { StockListComponent } from './presentation/pages/stock-list/stock-list.component';
import { GeneralDashboardComponent } from './presentation/pages/dashboard/general-dashboard/general-dashboard.component';
import { TransactionHeaderComponent } from './presentation/components/transaction-header/transaction-header.component';
import { SalesInvoiceComponent } from './presentation/pages/sales-invoice/sales-invoice.component';
import { SalesInvoiceCreateComponent } from './presentation/pages/sales-invoice/sales-invoice-create/sales-invoice-create.component';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { HotkeyModule } from 'angular2-hotkeys';
import { PaymentSelectorComponent } from './presentation/components/payment-selector/payment-selector.component';
import { ProductSelectorComponent } from './presentation/components/product-selector/product-selector.component';
import { PackageSelectorComponent } from './presentation/components/package-selector/package-selector.component';
import { SalesmanSelectorComponent } from './presentation/components/salesman-selector/salesman-selector.component';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
  MAT_DATE_FORMATS,
} from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UpdateProductSalesPriceComponent } from './presentation/components/update-product-sales-price/update-product-sales-price.component';
import { SalesInvoiceArchiveComponent } from './presentation/pages/sales-invoice/sales-invoice-archive/sales-invoice-archive.component';
import { SalesInvoiceSearchComponent } from './presentation/pages/sales-invoice/sales-invoice-search/sales-invoice-search.component';
import { ArchivesComponent } from './presentation/components/archives/archives.component';
import { ArchiveCardComponent } from './presentation/components/archives/archive-card/archive-card.component';
import { AdjustmentCaseComponent } from './presentation/pages/adjustment-case/adjustment-case.component';
import { AdjustmentCaseCreateComponent } from './presentation/pages/adjustment-case/adjustment-case-create/adjustment-case-create.component';
import { AdjustmentCaseArchiveComponent } from './presentation/pages/adjustment-case/adjustment-case-archive/adjustment-case-archive.component';
import { ExpenseCreateComponent } from './presentation/pages/expense/expense-create/expense-create.component';
import { ExpenseMutationComponent } from './presentation/pages/expense/expense-mutation/expense-mutation.component';
import {
  ExpenseReportComponent,
  MONTH_AND_YEAR_FORMAT,
} from './presentation/pages/expense/expense-report/expense-report.component';

import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import { PromotionComponent } from './presentation/pages/promotion/promotion.component';
import { PromotionCreateComponent } from './presentation/pages/promotion/promotion-create/promotion-create.component';
import { PromotionViewComponent } from './presentation/pages/promotion/promotion-view/promotion-view.component';
import { PromotionViewActionComponent } from './presentation/pages/promotion/promotion-view-action/promotion-view-action.component';
import { PromotionCreateRuleComponent } from './presentation/pages/promotion/promotion-create-rule/promotion-create-rule.component';
import { UserCreateComponent } from './presentation/pages/user/user-create/user-create.component';
import { UserCreateStatusComponent } from './presentation/pages/user/user-create/user-create-status/user-create-status.component';
import { MatChipsModule } from '@angular/material/chips';
import { PurchaseInvoiceComponent } from './presentation/pages/purchase-invoice/purchase-invoice.component';
import { PurchaseInvoiceCreateComponent } from './presentation/pages/purchase-invoice/purchase-invoice-create/purchase-invoice-create.component';
import { GoodReceiptComponent } from './presentation/pages/good-receipt/good-receipt.component';
import { GoodReceiptCreateComponent } from './presentation/pages/good-receipt/good-receipt-create/good-receipt-create.component';
import { GoodReceiptArchiveComponent } from './presentation/pages/good-receipt/good-receipt-archive/good-receipt-archive.component';
import { ExpenseTypeViewChildrenComponent } from './presentation/pages/expense-type/expense-type-view-children/expense-type-view-children.component';
import { ExpenseTypeCreateComponent } from './presentation/pages/expense-type/expense-type-create/expense-type-create.component';
import { ExpenseTypeUpdateComponent } from './presentation/pages/expense-type/expense-type-update/expense-type-update.component';
import { DeleteConfirmationComponent } from './presentation/components/delete-confirmation/delete-confirmation.component';
import { UpdateProductPurchasePriceComponent } from './presentation/components/update-product-purchase-price/update-product-purchase-price.component';
import { PurchaseInvoiceArchiveComponent } from './presentation/pages/purchase-invoice/purchase-invoice-archive/purchase-invoice-archive.component';
import { ResetPasswordDialogComponent } from './presentation/pages/profile-overview/reset-password-dialog/reset-password-dialog.component';
import { ColorPickerComponent } from './presentation/components/color-picker/color-picker.component';
import { DepositComponent } from './presentation/pages/deposit/deposit.component';
import { ReceivableComponent } from './presentation/pages/receivable/receivable.component';
import { PriceComponent } from './presentation/pages/price/price.component';
import { PriceSalesComponent } from './presentation/pages/price/price-sales/price-sales.component';
import { PricePurchaseComponent } from './presentation/pages/price/price-purchase/price-purchase.component';
import { EmptyTableComponent } from './presentation/components/empty-table/empty-table.component';
import { DepositViewComponent } from './presentation/pages/deposit/deposit-view/deposit-view.component';
import { ReportInventoryComponent } from './presentation/pages/report-inventory/report-inventory.component';
import { CountUpDirective } from './directives/count-up.directive';
import { DepositArchiveComponent } from './presentation/pages/deposit/deposit-archive/deposit-archive.component';
import { DepositListComponent } from './presentation/pages/deposit/deposit-list/deposit-list.component';
import { ProductBrandCreateComponent } from './presentation/pages/product-brand/product-brand-create/product-brand-create.component';
import { ProductCreateComponent } from './presentation/pages/product/product-create/product-create.component';
import { ProductTypeCreateComponent } from './presentation/pages/product-type/product-type-create/product-type-create.component';
import { ProductTypeUpdateComponent } from './presentation/pages/product-type/product-type-update/product-type-update.component';
import { ProductBrandUpdateComponent } from './presentation/pages/product-brand/product-brand-update/product-brand-update.component';
import { SupplierCreateComponent } from './presentation/pages/supplier/supplier-create/supplier-create.component';
import { SupplierUpdateComponent } from './presentation/pages/supplier/supplier-update/supplier-update.component';
import { CustomerCreateComponent } from './presentation/pages/customer/customer-create/customer-create.component';
import { CustomerUpdateComponent } from './presentation/pages/customer/customer-update/customer-update.component';
import { CompanyUpdateComponent } from './presentation/pages/company/company-update/company-update.component';
import { CompanyCreateComponent } from './presentation/pages/company/company-create/company-create.component';
import { ArchiveSearchComponent } from './presentation/components/archives/archive-search/archive-search.component';
import { SalesInvoiceArchiveFilterComponent } from './presentation/pages/sales-invoice/sales-invoice-archive/sales-invoice-archive-filter/sales-invoice-archive-filter.component';
import { ArchiveViewComponent } from './presentation/components/archives/archive-view/archive-view.component';
import { SalesInvoiceViewComponent } from './presentation/pages/sales-invoice/sales-invoice-archive/sales-invoice-view/sales-invoice-view.component';
import { AvatarPreviewComponent } from './presentation/components/avatar/avatar-preview/avatar-preview.component';
import { PurchaseInvoiceArchiveFilterComponent } from './presentation/pages/purchase-invoice/purchase-invoice-archive/purchase-invoice-archive-filter/purchase-invoice-archive-filter.component';
import { PurchaseInvoiceViewComponent } from './presentation/pages/purchase-invoice/purchase-invoice-archive/purchase-invoice-view/purchase-invoice-view.component';
import { PaymentListComponent } from './presentation/components/payment-list/payment-list.component';
import { PurchaseInvoiceConfirmComponent } from './presentation/pages/purchase-invoice/purchase-invoice-confirm/purchase-invoice-confirm.component';
import { PurchaseInvoiceEditComponent } from './presentation/pages/purchase-invoice/purchase-invoice-edit/purchase-invoice-edit.component';
import { AdjustmentCaseArchiveFilterComponent } from './presentation/pages/adjustment-case/adjustment-case-archive/adjustment-case-archive-filter/adjustment-case-archive-filter.component';
import { AdjustmentCaseViewComponent } from './presentation/pages/adjustment-case/adjustment-case-archive/adjustment-case-view/adjustment-case-view.component';

@NgModule({
  declarations: [
    ShortNumberPipe,
    AppComponent,
    LoginComponent,
    DashboardComponent,
    SideNavigationComponent,
    CircleAvatarComponent,
    ProfileDialogComponent,
    DashboardTopComponent,
    TopbarComponent,
    DashboardCardComponent,
    DashboardBottomComponent,
    AdministratorDashboardComponent,
    MainComponent,
    StatCardComponent,
    ProductComponent,
    ProductTypeComponent,
    ProductBrandComponent,
    AdministratorComponent,
    GcpInfoComponent,
    FeatureHeaderComponent,
    FeatureSearchComponent,
    FeatureBackgroundComponent,
    PackageComponent,
    SupplierComponent,
    CustomerComponent,
    CompanyComponent,
    PurchasingComponent,
    SalesComponent,
    GeneralComponent,
    UserComponent,
    PaymentMethodComponent,
    ExpenseTypeComponent,
    ExpenseComponent,
    PurchasingDashboardComponent,
    SalesDashboardComponent,
    ProfileComponent,
    AvatarComponent,
    SetAvatarComponent,
    ProfileOverviewComponent,
    UpdateProductComponent,
    AutocompleteSearchComponent,
    DynamicDialogComponent,
    DialogHeaderComponent,
    CustomStepperComponent,
    BoxStepperComponent,
    VerticalDividerComponent,
    StockListComponent,
    GeneralDashboardComponent,
    TransactionHeaderComponent,
    SalesInvoiceComponent,
    SalesInvoiceCreateComponent,
    PaymentSelectorComponent,
    ProductSelectorComponent,
    PackageSelectorComponent,
    SalesmanSelectorComponent,
    UpdateProductSalesPriceComponent,
    SalesInvoiceArchiveComponent,
    SalesInvoiceSearchComponent,
    ArchivesComponent,
    ArchiveCardComponent,
    AdjustmentCaseComponent,
    AdjustmentCaseCreateComponent,
    AdjustmentCaseArchiveComponent,
    ExpenseCreateComponent,
    ExpenseMutationComponent,
    ExpenseReportComponent,
    PromotionComponent,
    PromotionCreateComponent,
    PromotionViewComponent,
    PromotionViewActionComponent,
    PromotionCreateRuleComponent,
    UserCreateComponent,
    UserCreateStatusComponent,
    PurchaseInvoiceComponent,
    PurchaseInvoiceCreateComponent,
    GoodReceiptComponent,
    GoodReceiptCreateComponent,
    GoodReceiptArchiveComponent,
    ExpenseTypeViewChildrenComponent,
    ExpenseTypeCreateComponent,
    ExpenseTypeUpdateComponent,
    DeleteConfirmationComponent,
    UpdateProductPurchasePriceComponent,
    PurchaseInvoiceArchiveComponent,
    ResetPasswordDialogComponent,
    ColorPickerComponent,
    DepositComponent,
    ReceivableComponent,
    PriceComponent,
    PriceSalesComponent,
    PricePurchaseComponent,
    EmptyTableComponent,
    DepositViewComponent,
    ReportInventoryComponent,
    CountUpDirective,
    DepositArchiveComponent,
    DepositListComponent,
    ProductBrandCreateComponent,
    ProductCreateComponent,
    ProductTypeCreateComponent,
    ProductTypeUpdateComponent,
    ProductBrandUpdateComponent,
    SupplierCreateComponent,
    SupplierUpdateComponent,
    CustomerCreateComponent,
    CustomerUpdateComponent,
    CompanyUpdateComponent,
    CompanyCreateComponent,
    ArchiveSearchComponent,
    SalesInvoiceArchiveFilterComponent,
    ArchiveViewComponent,
    SalesInvoiceViewComponent,
    AvatarPreviewComponent,
    PurchaseInvoiceArchiveFilterComponent,
    PurchaseInvoiceViewComponent,
    PaymentListComponent,
    PurchaseInvoiceConfirmComponent,
    PurchaseInvoiceEditComponent,
    AdjustmentCaseArchiveFilterComponent,
    AdjustmentCaseViewComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatDividerModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    HttpClientModule,
    MatSidenavModule,
    MatListModule,
    MatTooltipModule,
    MatMenuModule,
    MatGridListModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    NgxMaskDirective,
    NgxMaskPipe,
    MatSelectModule,
    MatStepperModule,
    MatAutocompleteModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatBottomSheetModule,
    MatSlideToggleModule,
    MatChipsModule,
    HotkeyModule.forRoot(),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    provideNgxMask(),
    DatePipe,
    DecimalPipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
