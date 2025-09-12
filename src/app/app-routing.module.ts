import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './presentation/pages/login/login.component';
import { DashboardComponent } from './presentation/pages/dashboard/dashboard.component';
import { MainComponent } from './presentation/pages/main/main.component';
import { AdministratorDashboardComponent } from './presentation/pages/dashboard/administrator-dashboard/administrator-dashboard.component';
import { ProductComponent } from './presentation/pages/product/product.component';
import { ProductTypeComponent } from './presentation/pages/product-type/product-type.component';
import { ProductBrandComponent } from './presentation/pages/product-brand/product-brand.component';
import { AdministratorComponent } from './presentation/pages/entries/administrator/administrator.component';
import { PackageComponent } from './presentation/pages/package/package.component';
import { CustomerComponent } from './presentation/pages/customer/customer.component';
import { SupplierComponent } from './presentation/pages/supplier/supplier.component';
import { CompanyComponent } from './presentation/pages/company/company.component';
import { ExpenseTypeComponent } from './presentation/pages/expense-type/expense-type.component';
import { UserComponent } from './presentation/pages/user/user.component';
import { PaymentMethodComponent } from './presentation/pages/payment-method/payment-method.component';
import { PurchasingComponent } from './presentation/pages/entries/purchasing/purchasing.component';
import { PurchasingDashboardComponent } from './presentation/pages/dashboard/purchasing-dashboard/purchasing-dashboard.component';
import { SalesComponent } from './presentation/pages/entries/sales/sales.component';
import { SalesDashboardComponent } from './presentation/pages/dashboard/sales-dashboard/sales-dashboard.component';
import { ProfileComponent } from './presentation/pages/entries/profile/profile.component';
import { ProfileOverviewComponent } from './presentation/pages/profile-overview/profile-overview.component';
import { GeneralComponent } from './presentation/pages/entries/general/general.component';
import { GeneralDashboardComponent } from './presentation/pages/dashboard/general-dashboard/general-dashboard.component';
import { ExpenseComponent } from './presentation/pages/expense/expense.component';
import { SalesInvoiceComponent } from './presentation/pages/sales-invoice/sales-invoice.component';
import { SalesInvoiceCreateComponent } from './presentation/pages/sales-invoice/sales-invoice-create/sales-invoice-create.component';
import { SalesInvoiceArchiveComponent } from './presentation/pages/sales-invoice/sales-invoice-archive/sales-invoice-archive.component';
import { AdjustmentCaseComponent } from './presentation/pages/adjustment-case/adjustment-case.component';
import { AdjustmentCaseCreateComponent } from './presentation/pages/adjustment-case/adjustment-case-create/adjustment-case-create.component';
import { AdjustmentCaseArchiveComponent } from './presentation/pages/adjustment-case/adjustment-case-archive/adjustment-case-archive.component';
import { ExpenseCreateComponent } from './presentation/pages/expense/expense-create/expense-create.component';
import { ExpenseMutationComponent } from './presentation/pages/expense/expense-mutation/expense-mutation.component';
import { ExpenseReportComponent } from './presentation/pages/expense/expense-report/expense-report.component';
import { PromotionComponent } from './presentation/pages/promotion/promotion.component';
import { PurchaseInvoiceComponent } from './presentation/pages/purchase-invoice/purchase-invoice.component';
import { PurchaseInvoiceCreateComponent } from './presentation/pages/purchase-invoice/purchase-invoice-create/purchase-invoice-create.component';
import { GoodReceiptComponent } from './presentation/pages/good-receipt/good-receipt.component';
import { GoodReceiptCreateComponent } from './presentation/pages/good-receipt/good-receipt-create/good-receipt-create.component';
import { GoodReceiptArchiveComponent } from './presentation/pages/good-receipt/good-receipt-archive/good-receipt-archive.component';
import { PurchaseInvoiceArchiveComponent } from './presentation/pages/purchase-invoice/purchase-invoice-archive/purchase-invoice-archive.component';
import { ReceivableComponent } from './presentation/pages/receivable/receivable.component';
import { DepositComponent } from './presentation/pages/deposit/deposit.component';
import { DepositListComponent } from './presentation/pages/deposit/deposit-list/deposit-list.component';
import { DepositArchiveComponent } from './presentation/pages/deposit/deposit-archive/deposit-archive.component';
import { PurchaseInvoiceConfirmComponent } from './presentation/pages/purchase-invoice/purchase-invoice-confirm/purchase-invoice-confirm.component';
import { PurchaseInvoiceEditComponent } from './presentation/pages/purchase-invoice/purchase-invoice-edit/purchase-invoice-edit.component';
import { PriceComponent } from './presentation/pages/price/price.component';
import { PriceSalesComponent } from './presentation/pages/price/price-sales/price-sales.component';
import { PricePurchaseComponent } from './presentation/pages/price/price-purchase/price-purchase.component';
import { AuthGuard } from './guards/auth.guard';
import {
  AdministratorGuard,
  GeneralGuard,
  PurchasingGuard,
  SalesGuard,
  SuperAdministratorGuard,
} from './guards/administrator.guard';
import { AdjustmentCaseConfirmComponent } from './presentation/pages/adjustment-case/adjustment-case-confirm/adjustment-case-confirm.component';
import { PurchaseInvoiceConfirmViewComponent } from './presentation/pages/purchase-invoice/purchase-invoice-confirm-view/purchase-invoice-confirm-view.component';
import { DepositConfirmComponent } from './presentation/pages/deposit/deposit-confirm/deposit-confirm.component';
import { PackageListComponent } from './presentation/pages/package/package-list/package-list.component';
import { PackageCreateComponent } from './presentation/pages/package/package-create/package-create.component';
import { PackageUpdateComponent } from './presentation/pages/package/package-update/package-update.component';
import { ReportComponent } from './presentation/pages/report/report.component';
import { ReportSalesComponent } from './presentation/pages/report/report-sales/report-sales.component';
import { ReportPurchaseComponent } from './presentation/pages/report/report-purchase/report-purchase.component';
import { ReportMoneyComponent } from './presentation/pages/report/report-money/report-money.component';
import { SalesReturnComponent } from './presentation/pages/sales-return/sales-return.component';
import { SalesReturnCreateComponent } from './presentation/pages/sales-return/sales-return-create/sales-return-create.component';
import { SalesReturnArchiveComponent } from './presentation/pages/sales-return/sales-return-archive/sales-return-archive.component';
import { ReportInadequateComponent } from './presentation/pages/report/report-inadequate/report-inadequate.component';
import { ReportOutputComponent } from './presentation/pages/report/report-output/report-output.component';
import { ReportProblematicComponent } from './presentation/pages/report/report-problematic/report-problematic.component';
import { CashierComponent } from './presentation/pages/cashier/cashier.component';
import { ProductCreateComponent } from './presentation/pages/product/product-create/product-create.component';
import { PromotionCreateComponent } from './presentation/pages/promotion/promotion-create/promotion-create.component';
import { OverpaymentComponent } from './presentation/pages/overpayment/overpayment.component';
import { OverpaymentCreateComponent } from './presentation/pages/overpayment/overpayment-create/overpayment-create.component';
import { OverpaymentArchiveComponent } from './presentation/pages/overpayment/overpayment-archive/overpayment-archive.component';
import { ReceivableListComponent } from './presentation/pages/receivable/receivable-list/receivable-list.component';
import { ReceivableViewComponent } from './presentation/pages/receivable/receivable-view/receivable-view.component';
import { StockComponent } from './presentation/pages/stock/stock.component';
import { StockListComponent } from './presentation/pages/stock/stock-list/stock-list.component';
import { StockCardComponent } from './presentation/pages/stock/stock-card/stock-card.component';
import { OverpaymentReturnListComponent } from './presentation/pages/overpayment/overpayment-return-list/overpayment-return-list.component';
import { PromotionListComponent } from './presentation/pages/promotion/promotion-list/promotion-list.component';
import { PromotionUpdateComponent } from './presentation/pages/promotion/promotion-update/promotion-update.component';
import { ReportMoneyDorComponent } from './presentation/pages/report/report-money/report-money-dor/report-money-dor.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: MainComponent,
    children: [
      {
        path: '',
        component: DashboardComponent,
      },
      {
        path: 'Profile',
        component: ProfileComponent,
        children: [
          {
            path: '',
            component: ProfileOverviewComponent,
          },
        ],
      },

      {
        path: 'Cashier',
        component: CashierComponent,
      },
      {
        path: 'Administrator',
        component: AdministratorComponent,
        canActivate: [AdministratorGuard],
        children: [
          {
            path: '',
            component: AdministratorDashboardComponent,
          },
          {
            path: 'Overpayment',
            component: OverpaymentComponent,
            children: [
              {
                path: '',
                component: OverpaymentCreateComponent,
              },
              {
                path: 'Return',
                component: OverpaymentReturnListComponent,
              },
              {
                path: 'Archive',
                component: OverpaymentArchiveComponent,
              },
            ],
          },
          {
            path: 'Product',
            component: ProductComponent,
          },
          {
            path: 'Product/Create',
            component: ProductCreateComponent,
          },
          {
            path: 'Product-type',
            component: ProductTypeComponent,
          },
          {
            path: 'Product-brand',
            component: ProductBrandComponent,
          },
          {
            path: 'Package',
            component: PackageComponent,
            children: [
              {
                path: '',
                component: PackageListComponent,
              },
              {
                path: 'Create',
                component: PackageCreateComponent,
              },
              {
                path: 'Edit/:id',
                component: PackageUpdateComponent,
              },
            ],
          },
          {
            path: 'Customer',
            component: CustomerComponent,
          },
          {
            path: 'Supplier',
            component: SupplierComponent,
          },
          {
            path: 'Company',
            component: CompanyComponent,
          },
          {
            path: 'User',
            component: UserComponent,
          },
          {
            path: 'Payment-method',
            component: PaymentMethodComponent,
          },
          {
            path: 'Expense-type',
            component: ExpenseTypeComponent,
          },
          {
            path: 'Stock',
            component: StockComponent,
            children: [
              {
                path: '',
                component: StockListComponent,
              },
              {
                path: 'Card/:id',
                component: StockCardComponent,
              },
            ],
          },
          {
            path: 'Promotion',
            component: PromotionComponent,
            children: [
              {
                path: '',
                component: PromotionListComponent,
              },
              {
                path: 'Create',
                component: PromotionCreateComponent,
              },
              {
                path: ':id',
                component: PromotionUpdateComponent,
              },
            ],
          },
          {
            path: 'Promotion/Create',
            component: PromotionCreateComponent,
          },
          {
            path: 'Receivable',
            component: ReceivableComponent,
            children: [
              {
                path: '',
                component: ReceivableListComponent,
              },
              {
                path: ':id',
                component: ReceivableViewComponent,
              },
            ],
          },
          {
            path: 'Deposit',
            component: DepositComponent,
            children: [
              {
                path: '',
                component: DepositListComponent,
              },
              {
                path: 'Archive',
                component: DepositArchiveComponent,
              },
              {
                path: 'Confirm/:id',
                component: DepositConfirmComponent,
              },
              {
                path: '**',
                redirectTo: '',
              },
            ],
          },
          {
            path: 'Sales-invoice',
            component: SalesInvoiceComponent,
            children: [
              {
                path: '',
                component: SalesInvoiceCreateComponent,
              },
              {
                path: 'Archive',
                component: SalesInvoiceArchiveComponent,
              },
              {
                path: '**',
                redirectTo: '',
              },
            ],
          },
          {
            path: 'Purchase-invoice',
            component: PurchaseInvoiceComponent,
            children: [
              {
                path: '',
                component: PurchaseInvoiceCreateComponent,
              },
              {
                path: 'Archive',
                component: PurchaseInvoiceArchiveComponent,
              },
              {
                path: 'Confirm',
                component: PurchaseInvoiceConfirmComponent,
              },
              {
                path: 'Confirm/:id',
                component: PurchaseInvoiceConfirmViewComponent,
              },
              {
                path: 'Edit/:id',
                component: PurchaseInvoiceEditComponent,
              },
              {
                path: '**',
                redirectTo: '',
              },
            ],
          },
          {
            path: 'Adjustment-case',
            component: AdjustmentCaseComponent,
            children: [
              {
                path: '',
                component: AdjustmentCaseCreateComponent,
              },
              {
                path: 'Archive',
                component: AdjustmentCaseArchiveComponent,
              },
              {
                path: 'Confirm',
                canActivate: [SuperAdministratorGuard],
                component: AdjustmentCaseConfirmComponent,
              },
            ],
          },
          {
            path: 'Sales-return',
            component: SalesReturnComponent,
            children: [
              {
                path: '',
                component: SalesReturnCreateComponent,
              },
              {
                path: 'Archive',
                component: SalesReturnArchiveComponent,
              },
              {
                path: '**',
                redirectTo: '',
              },
            ],
          },
          {
            path: 'Expense',
            component: ExpenseComponent,
            children: [
              {
                path: '',
                component: ExpenseCreateComponent,
              },
              {
                path: 'Mutation',
                component: ExpenseMutationComponent,
              },
              {
                path: 'Report',
                component: ExpenseReportComponent,
              },
              {
                path: '**',
                redirectTo: '',
              },
            ],
          },
          {
            path: 'Price',
            component: PriceComponent,
            children: [
              {
                path: 'Sales',
                component: PriceSalesComponent,
              },
              {
                path: 'Purchase',
                component: PricePurchaseComponent,
              },
              {
                path: '**',
                redirectTo: 'Sales',
              },
            ],
          },
          {
            path: 'Report',
            component: ReportComponent,
            children: [
              {
                path: 'Sales',
                component: ReportSalesComponent,
              },
              {
                path: 'Purchase',
                component: ReportPurchaseComponent,
              },
              {
                path: 'Money',
                component: ReportMoneyComponent,
              },
              {
                path: 'Money/Dor',
                component: ReportMoneyDorComponent,
              },
              {
                path: 'Inadequate',
                component: ReportInadequateComponent,
              },
              {
                path: 'Problematic',
                component: ReportProblematicComponent,
              },
              {
                path: '**',
                redirectTo: '/Administrator',
              },
            ],
          },
        ],
      },
      {
        path: 'Purchasing',
        component: PurchasingComponent,
        canActivate: [PurchasingGuard],
        children: [
          {
            path: '',
            component: PurchasingDashboardComponent,
          },
          {
            path: 'Product',
            component: ProductComponent,
          },
          {
            path: 'Product/Create',
            component: ProductCreateComponent,
          },
          {
            path: 'Product-type',
            component: ProductTypeComponent,
          },
          {
            path: 'Product-brand',
            component: ProductBrandComponent,
          },
          {
            path: 'Package',
            component: PackageComponent,
            children: [
              {
                path: '',
                component: PackageListComponent,
              },
              {
                path: 'Create',
                component: PackageCreateComponent,
              },
              {
                path: 'Edit/:id',
                component: PackageUpdateComponent,
              },
            ],
          },
          {
            path: 'Supplier',
            component: SupplierComponent,
          },
          {
            path: 'Stock',
            component: StockComponent,
            children: [
              {
                path: '',
                component: StockListComponent,
              },
              {
                path: 'Card/:id',
                component: StockCardComponent,
              },
            ],
          },
          {
            path: 'Good-receipt',
            component: GoodReceiptComponent,
            children: [
              {
                path: '',
                component: GoodReceiptCreateComponent,
              },
              {
                path: 'Archive',
                component: GoodReceiptArchiveComponent,
              },
            ],
          },
          {
            path: 'Report',
            component: ReportComponent,
            children: [
              {
                path: 'Purchase',
                component: ReportPurchaseComponent,
              },
              {
                path: 'Inadequate',
                component: ReportInadequateComponent,
              },
              {
                path: '**',
                redirectTo: '/Purchasing',
              },
            ],
          },
        ],
      },
      {
        path: 'Sales',
        component: SalesComponent,
        canActivate: [SalesGuard],
        children: [
          {
            path: '',
            component: SalesDashboardComponent,
          },
          {
            path: 'Customer',
            component: CustomerComponent,
          },
          {
            path: 'Package',
            component: PackageComponent,
            children: [
              {
                path: '',
                component: PackageListComponent,
              },
              {
                path: 'Create',
                component: PackageCreateComponent,
              },
              {
                path: 'Edit/:id',
                component: PackageUpdateComponent,
              },
            ],
          },
          {
            path: 'Stock',
            component: StockComponent,
            children: [
              {
                path: '',
                component: StockListComponent,
              },
              {
                path: 'Card/:id',
                component: StockCardComponent,
              },
            ],
          },
          {
            path: 'Receivable',
            component: ReceivableComponent,
            children: [
              {
                path: '',
                component: ReceivableListComponent,
              },
              {
                path: ':id',
                component: ReceivableViewComponent,
              },
            ],
          },
          {
            path: 'Sales-invoice',
            component: SalesInvoiceComponent,
            children: [
              {
                path: '',
                component: SalesInvoiceCreateComponent,
              },
              {
                path: 'Archive',
                component: SalesInvoiceArchiveComponent,
              },
            ],
          },
          {
            path: 'Overpayment',
            component: OverpaymentComponent,
            children: [
              {
                path: '',
                component: OverpaymentCreateComponent,
              },
              {
                path: 'Return',
                component: OverpaymentReturnListComponent,
              },
              {
                path: 'Archive',
                component: OverpaymentArchiveComponent,
              },
            ],
          },
          {
            path: 'Deposit',
            component: DepositComponent,
            children: [
              {
                path: '',
                component: DepositListComponent,
              },
              {
                path: 'Archive',
                component: DepositArchiveComponent,
              },
              {
                path: 'Confirm/:id',
                component: DepositConfirmComponent,
              },
              {
                path: '**',
                redirectTo: '',
              },
            ],
          },
          {
            path: 'Price',
            component: PriceComponent,
            children: [
              {
                path: 'Sales',
                component: PriceSalesComponent,
              },
              {
                path: '**',
                redirectTo: 'Sales',
              },
            ],
          },
          {
            path: 'Report',
            component: ReportComponent,
            children: [
              {
                path: 'Sales',
                component: ReportSalesComponent,
              },
              {
                path: 'Output',
                component: ReportOutputComponent,
              },
              {
                path: '**',
                redirectTo: '/Sales',
              },
            ],
          },
          {
            path: 'Sales-return',
            component: SalesReturnComponent,
            children: [
              {
                path: '',
                component: SalesReturnCreateComponent,
              },
              {
                path: 'Archive',
                component: SalesReturnArchiveComponent,
              },
              {
                path: '**',
                redirectTo: '',
              },
            ],
          },
        ],
      },
      {
        path: 'General',
        component: GeneralComponent,
        canActivate: [GeneralGuard],
        children: [
          {
            path: '',
            component: GeneralDashboardComponent,
          },
          {
            path: 'Expense',
            component: ExpenseComponent,
            children: [
              {
                path: '',
                component: ExpenseCreateComponent,
              },
              {
                path: 'Mutation',
                component: ExpenseMutationComponent,
              },
              {
                path: 'Report',
                component: ExpenseReportComponent,
              },
              {
                path: '**',
                redirectTo: '',
              },
            ],
          },
          {
            path: 'Company',
            component: CompanyComponent,
          },
          {
            path: 'Payment-method',
            component: PaymentMethodComponent,
          },
          {
            path: 'Stock',
            component: StockComponent,
            children: [
              {
                path: '',
                component: StockListComponent,
              },
              {
                path: 'Card/:id',
                component: StockCardComponent,
              },
            ],
          },
          {
            path: 'Overpayment',
            component: OverpaymentComponent,
            children: [
              {
                path: '',
                component: OverpaymentCreateComponent,
              },
              {
                path: 'Return',
                component: OverpaymentReturnListComponent,
              },
              {
                path: 'Archive',
                component: OverpaymentArchiveComponent,
              },
            ],
          },
          {
            path: 'Expense-type',
            component: ExpenseTypeComponent,
          },
          {
            path: 'Report',
            component: ReportComponent,
            children: [
              {
                path: 'Sales',
                component: ReportSalesComponent,
              },
              {
                path: 'Output',
                component: ReportOutputComponent,
              },
              {
                path: 'Inadequate',
                component: ReportInadequateComponent,
              },
              {
                path: 'Problematic',
                component: ReportProblematicComponent,
              },
              {
                path: '**',
                redirectTo: '/General',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: 'Login',
    component: LoginComponent,
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
