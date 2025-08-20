import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './presentation/pages/login/login.component';
import { DashboardComponent } from './presentation/pages/dashboard/dashboard.component';
import { MatDividerModule } from '@angular/material/divider';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  HTTP_INTERCEPTORS,
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
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
import { MatBadgeModule } from '@angular/material/badge';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DatePipe, DecimalPipe } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { UpdateProductSalesPriceComponent } from './presentation/components/update-product-sales-price/update-product-sales-price.component';
import { SalesInvoiceArchiveComponent } from './presentation/pages/sales-invoice/sales-invoice-archive/sales-invoice-archive.component';
import { ArchivesComponent } from './presentation/components/archives/archives.component';
import { ArchiveCardComponent } from './presentation/components/archives/archive-card/archive-card.component';
import { AdjustmentCaseComponent } from './presentation/pages/adjustment-case/adjustment-case.component';
import { AdjustmentCaseCreateComponent } from './presentation/pages/adjustment-case/adjustment-case-create/adjustment-case-create.component';
import { AdjustmentCaseArchiveComponent } from './presentation/pages/adjustment-case/adjustment-case-archive/adjustment-case-archive.component';
import { ExpenseCreateComponent } from './presentation/pages/expense/expense-create/expense-create.component';
import { ExpenseMutationComponent } from './presentation/pages/expense/expense-mutation/expense-mutation.component';
import { ExpenseReportComponent } from './presentation/pages/expense/expense-report/expense-report.component';

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
import { PriceSalesUpdateComponent } from './presentation/pages/price/price-sales/price-sales-update/price-sales-update.component';
import {
  TranslateModule,
  TranslateLoader,
  TranslateService,
} from '@ngx-translate/core';
import { CustomLoader } from './loader/translate.loader';
import { LanguageSelectorComponent } from './presentation/components/topbar/language-selector/language-selector.component';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { DarkModeSelectorComponent } from './presentation/components/topbar/dark-mode-selector/dark-mode-selector.component';
import { AdjustmentCaseConfirmComponent } from './presentation/pages/adjustment-case/adjustment-case-confirm/adjustment-case-confirm.component';
import { PaymentMethodCreateComponent } from './presentation/pages/payment-method/payment-method-create/payment-method-create.component';
import { PaymentMethodUpdateComponent } from './presentation/pages/payment-method/payment-method-update/payment-method-update.component';
import { PurchaseInvoiceConfirmViewComponent } from './presentation/pages/purchase-invoice/purchase-invoice-confirm-view/purchase-invoice-confirm-view.component';
import { PricePurchaseUpdateComponent } from './presentation/pages/price/price-purchase/price-purchase-update/price-purchase-update.component';
import { ExpenseUpdateComponent } from './presentation/pages/expense/expense-update/expense-update.component';
import { ProductUnitComponent } from './presentation/pages/product/product-unit/product-unit.component';
import { DepositConfirmComponent } from './presentation/pages/deposit/deposit-confirm/deposit-confirm.component';
import { PackageCreateComponent } from './presentation/pages/package/package-create/package-create.component';
import { PackageListComponent } from './presentation/pages/package/package-list/package-list.component';
import { PackageUpdateComponent } from './presentation/pages/package/package-update/package-update.component';
import { MatTabsModule } from '@angular/material/tabs';
import { UpdatePackageSalesPriceComponent } from './presentation/components/update-package-sales-price/update-package-sales-price.component';
import { ReportSalesComponent } from './presentation/pages/report/report-sales/report-sales.component';
import { NgChartjsModule } from 'ng-chartjs';
import { NgChartsModule } from 'ng2-charts';
import { GoodReceiptArchiveFilterComponent } from './presentation/pages/good-receipt/good-receipt-archive/good-receipt-archive-filter/good-receipt-archive-filter.component';
import { AdjustmentCaseConfirmViewComponent } from './presentation/pages/adjustment-case/adjustment-case-confirm/adjustment-case-confirm-view/adjustment-case-confirm-view.component';
import { SalesReturnComponent } from './presentation/pages/sales-return/sales-return.component';
import { SalesReturnCreateComponent } from './presentation/pages/sales-return/sales-return-create/sales-return-create.component';
import { ReceivableViewComponent } from './presentation/pages/receivable/receivable-view/receivable-view.component';
import { ReceivablePaymentHistoryComponent } from './presentation/pages/receivable/receivable-view/receivable-payment-history/receivable-payment-history.component';
import { ReceivablePaymentCreateComponent } from './presentation/pages/receivable/receivable-view/receivable-payment-create/receivable-payment-create.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SalesChartComponent } from './presentation/components/charts/sales-chart/sales-chart.component';
import { CustomerSalesChartComponent } from './presentation/pages/report/report-sales/customer-sales-chart/customer-sales-chart.component';
import { BrandSalesChartComponent } from './presentation/pages/report/report-sales/brand-sales-chart/brand-sales-chart.component';
import { TypeSalesChartComponent } from './presentation/pages/report/report-sales/type-sales-chart/type-sales-chart.component';
import { SalesSalesChartComponent } from './presentation/pages/report/report-sales/sales-sales-chart/sales-sales-chart.component';
import { MatRippleModule } from '@angular/material/core';
import { ReportComponent } from './presentation/pages/report/report.component';
import { ReportPurchaseComponent } from './presentation/pages/report/report-purchase/report-purchase.component';
import { ReportFinanceComponent } from './presentation/pages/report/report-finance/report-finance.component';
import { ReportMoneyComponent } from './presentation/pages/report/report-money/report-money.component';
import { MatRadioModule } from '@angular/material/radio';
import { SalesValueChartComponent } from './presentation/components/charts/sales-value-chart/sales-value-chart.component';
import { PurchaseChartComponent } from './presentation/components/charts/purchase-chart/purchase-chart.component';
import { BrandPurchaseChartComponent } from './presentation/pages/report/report-purchase/brand-purchase-chart/brand-purchase-chart.component';
import { TypePurchaseChartComponent } from './presentation/pages/report/report-purchase/type-purchase-chart/type-purchase-chart.component';
import { SupplierPurchaseChartComponent } from './presentation/pages/report/report-purchase/supplier-purchase-chart/supplier-purchase-chart.component';
import { SalesReturnArchiveComponent } from './presentation/pages/sales-return/sales-return-archive/sales-return-archive.component';
import { SalesReturnArchiveFilterComponent } from './presentation/pages/sales-return/sales-return-archive/sales-return-archive-filter/sales-return-archive-filter.component';
import { SalesReturnArchiveViewComponent } from './presentation/pages/sales-return/sales-return-archive/sales-return-archive-view/sales-return-archive-view.component';
import { SalesReturnCreateViewSalesInvoiceComponent } from './presentation/pages/sales-return/sales-return-create/sales-return-create-view-sales-invoice/sales-return-create-view-sales-invoice.component';
import { ReportInadequateComponent } from './presentation/pages/report/report-inadequate/report-inadequate.component';
import { ReportInadequateFilterComponent } from './presentation/pages/report/report-inadequate/report-inadequate-filter/report-inadequate-filter.component';
import { ReportOutputComponent } from './presentation/pages/report/report-output/report-output.component';
import { ReportCompanyComponent } from './presentation/pages/report/report-company/report-company.component';
import { ReportProblematicComponent } from './presentation/pages/report/report-problematic/report-problematic.component';
import { ReportProblematicFilterComponent } from './presentation/pages/report/report-problematic/report-problematic-filter/report-problematic-filter.component';
import { UserEditComponent } from './presentation/pages/user/user-edit/user-edit.component';
import { SubmitConfirmationComponent } from './presentation/components/submit-confirmation/submit-confirmation.component';
import { CashierComponent } from './presentation/pages/cashier/cashier.component';
import { CashierViewBillComponent } from './presentation/pages/cashier/cashier-view-bill/cashier-view-bill.component';
import { CashierViewBillPaymentSelectorComponent } from './presentation/pages/cashier/cashier-view-bill/cashier-view-bill-payment-selector/cashier-view-bill-payment-selector.component';
import { ProductCreateUnitComponent } from './presentation/pages/product/product-create/product-create-unit/product-create-unit.component';
import { OverpaymentComponent } from './presentation/pages/overpayment/overpayment.component';
import { OverpaymentCreateComponent } from './presentation/pages/overpayment/overpayment-create/overpayment-create.component';
import { OverpaymentConfirmComponent } from './presentation/pages/overpayment/overpayment-confirm/overpayment-confirm.component';
import { OverpaymentArchiveComponent } from './presentation/pages/overpayment/overpayment-archive/overpayment-archive.component';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { DepositConfirmUpdatePaymentComponent } from './presentation/pages/deposit/deposit-confirm/deposit-confirm-update-payment/deposit-confirm-update-payment.component';
import { GoodReceiptViewComponent } from './presentation/pages/good-receipt/good-receipt-archive/good-receipt-view/good-receipt-view.component';
import { ReceivableListComponent } from './presentation/pages/receivable/receivable-list/receivable-list.component';
import { DepositDeleteConfirmationComponent } from './presentation/pages/deposit/deposit-delete-confirmation/deposit-delete-confirmation.component';
import { StockListComponent } from './presentation/pages/stock/stock-list/stock-list.component';
import { StockComponent } from './presentation/pages/stock/stock.component';
import { StockListReportComponent } from './presentation/pages/stock/stock-list-report/stock-list-report.component';
import { StockCardComponent } from './presentation/pages/stock/stock-card/stock-card.component';
import { StockCardViewComponent } from './presentation/pages/stock/stock-card/stock-card-view/stock-card-view.component';
import { OverpaymentArchiveViewComponent } from './presentation/pages/overpayment/overpayment-archive/overpayment-archive-view/overpayment-archive-view.component';
import { DepositArchiveFilterComponent } from './presentation/pages/deposit/deposit-archive/deposit-archive-filter/deposit-archive-filter.component';
import { OverpaymentReturnListComponent } from './presentation/pages/overpayment/overpayment-return-list/overpayment-return-list.component';

@NgModule({
  declarations: [
    ShortNumberPipe,
    AppComponent,
    LoginComponent,
    DashboardComponent,
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
    StockComponent,
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
    PriceSalesUpdateComponent,
    LanguageSelectorComponent,
    StockListReportComponent,
    DarkModeSelectorComponent,
    AdjustmentCaseConfirmComponent,
    PaymentMethodCreateComponent,
    PaymentMethodUpdateComponent,
    PurchaseInvoiceConfirmViewComponent,
    PricePurchaseUpdateComponent,
    ExpenseUpdateComponent,
    ProductUnitComponent,
    DepositConfirmComponent,
    PackageCreateComponent,
    PackageListComponent,
    PackageUpdateComponent,
    UpdatePackageSalesPriceComponent,
    ReportSalesComponent,
    GoodReceiptArchiveFilterComponent,
    StockCardComponent,
    AdjustmentCaseConfirmViewComponent,
    SalesReturnComponent,
    SalesReturnCreateComponent,
    ReceivableViewComponent,
    ReceivablePaymentHistoryComponent,
    ReceivablePaymentCreateComponent,
    StockCardViewComponent,
    SalesChartComponent,
    CustomerSalesChartComponent,
    BrandSalesChartComponent,
    TypeSalesChartComponent,
    SalesSalesChartComponent,
    ReportComponent,
    ReportPurchaseComponent,
    ReportFinanceComponent,
    ReportMoneyComponent,
    SalesValueChartComponent,
    PurchaseChartComponent,
    BrandPurchaseChartComponent,
    TypePurchaseChartComponent,
    SupplierPurchaseChartComponent,
    SalesReturnArchiveComponent,
    SalesReturnArchiveFilterComponent,
    SalesReturnArchiveViewComponent,
    SalesReturnCreateViewSalesInvoiceComponent,
    ReportInadequateComponent,
    ReportInadequateFilterComponent,
    ReportOutputComponent,
    ReportCompanyComponent,
    ReportProblematicComponent,
    ReportProblematicFilterComponent,
    UserEditComponent,
    SubmitConfirmationComponent,
    CashierComponent,
    CashierViewBillComponent,
    CashierViewBillPaymentSelectorComponent,
    ProductCreateUnitComponent,
    OverpaymentComponent,
    OverpaymentCreateComponent,
    OverpaymentConfirmComponent,
    OverpaymentArchiveComponent,
    DepositConfirmUpdatePaymentComponent,
    GoodReceiptViewComponent,
    ReceivableListComponent,
    DepositDeleteConfirmationComponent,
    OverpaymentArchiveViewComponent,
    DepositArchiveFilterComponent,
    OverpaymentReturnListComponent,
  ],
  bootstrap: [AppComponent],
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
    MatBadgeModule,
    MatTabsModule,
    NgChartjsModule,
    MatCheckboxModule,
    MatRadioModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: CustomLoader,
        deps: [HttpClient],
      },
    }),
    HotkeyModule.forRoot(),
    NgChartsModule,
    MatRippleModule,
    DragDropModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    provideNgxMask(),
    DatePipe,
    DecimalPipe,
    provideHttpClient(withInterceptorsFromDi()),
  ],
})
export class AppModule {}
