import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import {
  AdministratorGuard,
  GeneralGuard,
  PurchasingGuard,
  SalesGuard,
  SuperAdministratorGuard,
} from './guards/administrator.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
          import('./pages/main/main.component').then(
            (m) => m.MainComponent
          ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'Profile',
        loadComponent: () =>
          import('./pages/entries/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
        children: [
          {
            path: '',
            loadComponent: () =>
          import('./pages/profile-overview/profile-overview.component').then(
            (m) => m.ProfileOverviewComponent
          ),
          },
        ],
      },

      {
        path: 'Cashier',
        loadComponent: () =>
          import('./pages/cashier/cashier.component').then(
            (m) => m.CashierComponent
          ),
      },
      {
        path: 'Administrator',
        loadComponent: () =>
          import('./pages/entries/administrator/administrator.component').then(
            (m) => m.AdministratorComponent
          ),
        canActivate: [AdministratorGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
          import('./pages/dashboard/administrator-dashboard/administrator-dashboard.component').then(
            (m) => m.AdministratorDashboardComponent
          ),
          },
          {
            /*
              Jejak aktivitas memperlihatkan siapa mengubah apa di seluruh
              sistem, jadi letaknya di bawah Administrator — penjagaannya
              diwarisi dari induknya, sama seperti di server yang memasang
              administratorMiddleware pada /audit-logs.
            */
            path: 'Activity',
            loadComponent: () =>
              import('./pages/activity/activity.component').then(
                (m) => m.ActivityComponent
              ),
          },
          {
            path: 'Overpayment',
            loadComponent: () =>
          import('./pages/overpayment/overpayment.component').then(
            (m) => m.OverpaymentComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/overpayment/overpayment-create/overpayment-create.component').then(
            (m) => m.OverpaymentCreateComponent
          ),
              },
              {
                path: 'Return',
                loadComponent: () =>
          import('./pages/overpayment/overpayment-return-list/overpayment-return-list.component').then(
            (m) => m.OverpaymentReturnListComponent
          ),
              },
              {
                path: 'Archive',
                loadComponent: () =>
          import('./pages/overpayment/overpayment-archive/overpayment-archive.component').then(
            (m) => m.OverpaymentArchiveComponent
          ),
              },
            ],
          },
          {
            path: 'Product',
            loadComponent: () =>
          import('./pages/product/product.component').then(
            (m) => m.ProductComponent
          ),
          },
          {
            path: 'Product/Create',
            loadComponent: () =>
          import('./pages/product/product-create/product-create.component').then(
            (m) => m.ProductCreateComponent
          ),
          },
          {
            path: 'Product-type',
            loadComponent: () =>
          import('./pages/product-type/product-type.component').then(
            (m) => m.ProductTypeComponent
          ),
          },
          {
            path: 'Product-brand',
            loadComponent: () =>
          import('./pages/product-brand/product-brand.component').then(
            (m) => m.ProductBrandComponent
          ),
          },
          {
            path: 'Package',
            loadComponent: () =>
          import('./pages/package/package.component').then(
            (m) => m.PackageComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/package/package-list/package-list.component').then(
            (m) => m.PackageListComponent
          ),
              },
              {
                path: 'Create',
                loadComponent: () =>
          import('./pages/package/package-create/package-create.component').then(
            (m) => m.PackageCreateComponent
          ),
              },
              {
                path: 'Edit/:id',
                loadComponent: () =>
          import('./pages/package/package-update/package-update.component').then(
            (m) => m.PackageUpdateComponent
          ),
              },
            ],
          },
          {
            path: 'Customer',
            loadComponent: () =>
          import('./pages/customer/customer.component').then(
            (m) => m.CustomerComponent
          ),
          },
          {
            path: 'Supplier',
            loadComponent: () =>
          import('./pages/supplier/supplier.component').then(
            (m) => m.SupplierComponent
          ),
          },
          {
            path: 'Company',
            loadComponent: () =>
          import('./pages/company/company.component').then(
            (m) => m.CompanyComponent
          ),
          },
          {
            path: 'User',
            loadComponent: () =>
          import('./pages/user/user.component').then(
            (m) => m.UserComponent
          ),
          },
          {
            path: 'Payment-method',
            loadComponent: () =>
          import('./pages/payment-method/payment-method.component').then(
            (m) => m.PaymentMethodComponent
          ),
          },
          {
            path: 'Expense-type',
            loadComponent: () =>
          import('./pages/expense-type/expense-type.component').then(
            (m) => m.ExpenseTypeComponent
          ),
          },
          {
            path: 'Stock',
            loadComponent: () =>
          import('./pages/stock/stock.component').then(
            (m) => m.StockComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/stock/stock-list/stock-list.component').then(
            (m) => m.StockListComponent
          ),
              },
              {
                path: 'Card/:id',
                loadComponent: () =>
          import('./pages/stock/stock-card/stock-card.component').then(
            (m) => m.StockCardComponent
          ),
              },
            ],
          },
          {
            path: 'Promotion',
            loadComponent: () =>
          import('./pages/promotion/promotion.component').then(
            (m) => m.PromotionComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/promotion/promotion-list/promotion-list.component').then(
            (m) => m.PromotionListComponent
          ),
              },
              {
                path: 'Create',
                loadComponent: () =>
          import('./pages/promotion/promotion-create/promotion-create.component').then(
            (m) => m.PromotionCreateComponent
          ),
              },
              {
                path: ':id',
                loadComponent: () =>
          import('./pages/promotion/promotion-update/promotion-update.component').then(
            (m) => m.PromotionUpdateComponent
          ),
              },
            ],
          },
          {
            path: 'Promotion/Create',
            loadComponent: () =>
          import('./pages/promotion/promotion-create/promotion-create.component').then(
            (m) => m.PromotionCreateComponent
          ),
          },
          {
            path: 'Receivable',
            loadComponent: () =>
          import('./pages/receivable/receivable.component').then(
            (m) => m.ReceivableComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/receivable/receivable-list/receivable-list.component').then(
            (m) => m.ReceivableListComponent
          ),
              },
              {
                path: ':id',
                loadComponent: () =>
          import('./pages/receivable/receivable-view/receivable-view.component').then(
            (m) => m.ReceivableViewComponent
          ),
              },
            ],
          },
          {
            path: 'Deposit',
            loadComponent: () =>
          import('./pages/deposit/deposit.component').then(
            (m) => m.DepositComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/deposit/deposit-list/deposit-list.component').then(
            (m) => m.DepositListComponent
          ),
              },
              {
                path: 'Archive',
                loadComponent: () =>
          import('./pages/deposit/deposit-archive/deposit-archive.component').then(
            (m) => m.DepositArchiveComponent
          ),
              },
              {
                path: 'Confirm/:id',
                loadComponent: () =>
          import('./pages/deposit/deposit-confirm/deposit-confirm.component').then(
            (m) => m.DepositConfirmComponent
          ),
              },
              {
                path: '**',
                redirectTo: '',
              },
            ],
          },
          {
            path: 'Sales-invoice',
            loadComponent: () =>
          import('./pages/sales-invoice/sales-invoice.component').then(
            (m) => m.SalesInvoiceComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/sales-invoice/sales-invoice-create/sales-invoice-create.component').then(
            (m) => m.SalesInvoiceCreateComponent
          ),
              },
              {
                path: 'Archive',
                loadComponent: () =>
          import('./pages/sales-invoice/sales-invoice-archive/sales-invoice-archive.component').then(
            (m) => m.SalesInvoiceArchiveComponent
          ),
              },
              {
                path: '**',
                redirectTo: '',
              },
            ],
          },
          {
            path: 'Purchase-invoice',
            loadComponent: () =>
          import('./pages/purchase-invoice/purchase-invoice.component').then(
            (m) => m.PurchaseInvoiceComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/purchase-invoice/purchase-invoice-create/purchase-invoice-create.component').then(
            (m) => m.PurchaseInvoiceCreateComponent
          ),
              },
              {
                path: 'Archive',
                loadComponent: () =>
          import('./pages/purchase-invoice/purchase-invoice-archive/purchase-invoice-archive.component').then(
            (m) => m.PurchaseInvoiceArchiveComponent
          ),
              },
              {
                path: 'Confirm',
                loadComponent: () =>
          import('./pages/purchase-invoice/purchase-invoice-confirm/purchase-invoice-confirm.component').then(
            (m) => m.PurchaseInvoiceConfirmComponent
          ),
              },
              {
                path: 'Confirm/:id',
                loadComponent: () =>
          import('./pages/purchase-invoice/purchase-invoice-confirm-view/purchase-invoice-confirm-view.component').then(
            (m) => m.PurchaseInvoiceConfirmViewComponent
          ),
              },
              {
                path: 'Edit/:id',
                loadComponent: () =>
          import('./pages/purchase-invoice/purchase-invoice-edit/purchase-invoice-edit.component').then(
            (m) => m.PurchaseInvoiceEditComponent
          ),
              },
              {
                path: '**',
                redirectTo: '',
              },
            ],
          },
          {
            path: 'Adjustment-case',
            loadComponent: () =>
          import('./pages/adjustment-case/adjustment-case.component').then(
            (m) => m.AdjustmentCaseComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/adjustment-case/adjustment-case-create/adjustment-case-create.component').then(
            (m) => m.AdjustmentCaseCreateComponent
          ),
              },
              {
                path: 'Archive',
                loadComponent: () =>
          import('./pages/adjustment-case/adjustment-case-archive/adjustment-case-archive.component').then(
            (m) => m.AdjustmentCaseArchiveComponent
          ),
              },
              {
                path: 'Confirm',
                canActivate: [SuperAdministratorGuard],
                loadComponent: () =>
          import('./pages/adjustment-case/adjustment-case-confirm/adjustment-case-confirm.component').then(
            (m) => m.AdjustmentCaseConfirmComponent
          ),
              },
            ],
          },
          {
            path: 'Sales-return',
            loadComponent: () =>
          import('./pages/sales-return/sales-return.component').then(
            (m) => m.SalesReturnComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/sales-return/sales-return-create/sales-return-create.component').then(
            (m) => m.SalesReturnCreateComponent
          ),
              },
              {
                path: 'Archive',
                loadComponent: () =>
          import('./pages/sales-return/sales-return-archive/sales-return-archive.component').then(
            (m) => m.SalesReturnArchiveComponent
          ),
              },
              {
                path: '**',
                redirectTo: '',
              },
            ],
          },
          {
            path: 'Expense',
            loadComponent: () =>
          import('./pages/expense/expense.component').then(
            (m) => m.ExpenseComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/expense/expense-create/expense-create.component').then(
            (m) => m.ExpenseCreateComponent
          ),
              },
              {
                path: 'Mutation',
                loadComponent: () =>
          import('./pages/expense/expense-mutation/expense-mutation.component').then(
            (m) => m.ExpenseMutationComponent
          ),
              },
              {
                path: 'Report',
                loadComponent: () =>
          import('./pages/expense/expense-report/expense-report.component').then(
            (m) => m.ExpenseReportComponent
          ),
              },
              {
                path: '**',
                redirectTo: '',
              },
            ],
          },
          {
            path: 'Price',
            loadComponent: () =>
          import('./pages/price/price.component').then(
            (m) => m.PriceComponent
          ),
            children: [
              {
                path: 'Sales',
                loadComponent: () =>
          import('./pages/price/price-sales/price-sales.component').then(
            (m) => m.PriceSalesComponent
          ),
              },
              {
                path: 'Purchase',
                loadComponent: () =>
          import('./pages/price/price-purchase/price-purchase.component').then(
            (m) => m.PricePurchaseComponent
          ),
              },
              {
                path: '**',
                redirectTo: 'Sales',
              },
            ],
          },
          {
            path: 'Report',
            loadComponent: () =>
          import('./pages/report/report.component').then(
            (m) => m.ReportComponent
          ),
            children: [
              {
                path: 'Sales',
                loadComponent: () =>
          import('./pages/report/report-sales/report-sales.component').then(
            (m) => m.ReportSalesComponent
          ),
              },
              {
                path: 'Purchase',
                loadComponent: () =>
          import('./pages/report/report-purchase/report-purchase.component').then(
            (m) => m.ReportPurchaseComponent
          ),
              },
              {
                path: 'Money',
                loadComponent: () =>
          import('./pages/report/report-money/report-money.component').then(
            (m) => m.ReportMoneyComponent
          ),
              },
              {
                path: 'Money/Dor',
                loadComponent: () =>
          import('./pages/report/report-money/report-money-dor/report-money-dor.component').then(
            (m) => m.ReportMoneyDorComponent
          ),
              },
              {
                path: 'Inadequate',
                loadComponent: () =>
          import('./pages/report/report-inadequate/report-inadequate.component').then(
            (m) => m.ReportInadequateComponent
          ),
              },
              {
                path: 'Problematic',
                loadComponent: () =>
          import('./pages/report/report-problematic/report-problematic.component').then(
            (m) => m.ReportProblematicComponent
          ),
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
        loadComponent: () =>
          import('./pages/entries/purchasing/purchasing.component').then(
            (m) => m.PurchasingComponent
          ),
        canActivate: [PurchasingGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
          import('./pages/dashboard/purchasing-dashboard/purchasing-dashboard.component').then(
            (m) => m.PurchasingDashboardComponent
          ),
          },
          {
            path: 'Product',
            loadComponent: () =>
          import('./pages/product/product.component').then(
            (m) => m.ProductComponent
          ),
          },
          {
            path: 'Product/Create',
            loadComponent: () =>
          import('./pages/product/product-create/product-create.component').then(
            (m) => m.ProductCreateComponent
          ),
          },
          {
            path: 'Product-type',
            loadComponent: () =>
          import('./pages/product-type/product-type.component').then(
            (m) => m.ProductTypeComponent
          ),
          },
          {
            path: 'Product-brand',
            loadComponent: () =>
          import('./pages/product-brand/product-brand.component').then(
            (m) => m.ProductBrandComponent
          ),
          },
          {
            path: 'Package',
            loadComponent: () =>
          import('./pages/package/package.component').then(
            (m) => m.PackageComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/package/package-list/package-list.component').then(
            (m) => m.PackageListComponent
          ),
              },
              {
                path: 'Create',
                loadComponent: () =>
          import('./pages/package/package-create/package-create.component').then(
            (m) => m.PackageCreateComponent
          ),
              },
              {
                path: 'Edit/:id',
                loadComponent: () =>
          import('./pages/package/package-update/package-update.component').then(
            (m) => m.PackageUpdateComponent
          ),
              },
            ],
          },
          {
            path: 'Supplier',
            loadComponent: () =>
          import('./pages/supplier/supplier.component').then(
            (m) => m.SupplierComponent
          ),
          },
          {
            path: 'Stock',
            loadComponent: () =>
          import('./pages/stock/stock.component').then(
            (m) => m.StockComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/stock/stock-list/stock-list.component').then(
            (m) => m.StockListComponent
          ),
              },
              {
                path: 'Card/:id',
                loadComponent: () =>
          import('./pages/stock/stock-card/stock-card.component').then(
            (m) => m.StockCardComponent
          ),
              },
            ],
          },
          {
            path: 'Good-receipt',
            loadComponent: () =>
          import('./pages/good-receipt/good-receipt.component').then(
            (m) => m.GoodReceiptComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/good-receipt/good-receipt-create/good-receipt-create.component').then(
            (m) => m.GoodReceiptCreateComponent
          ),
              },
              {
                path: 'Archive',
                loadComponent: () =>
          import('./pages/good-receipt/good-receipt-archive/good-receipt-archive.component').then(
            (m) => m.GoodReceiptArchiveComponent
          ),
              },
            ],
          },
          {
            path: 'Report',
            loadComponent: () =>
          import('./pages/report/report.component').then(
            (m) => m.ReportComponent
          ),
            children: [
              {
                path: 'Purchase',
                loadComponent: () =>
          import('./pages/report/report-purchase/report-purchase.component').then(
            (m) => m.ReportPurchaseComponent
          ),
              },
              {
                path: 'Inadequate',
                loadComponent: () =>
          import('./pages/report/report-inadequate/report-inadequate.component').then(
            (m) => m.ReportInadequateComponent
          ),
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
        loadComponent: () =>
          import('./pages/entries/sales/sales.component').then(
            (m) => m.SalesComponent
          ),
        canActivate: [SalesGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
          import('./pages/dashboard/sales-dashboard/sales-dashboard.component').then(
            (m) => m.SalesDashboardComponent
          ),
          },
          {
            path: 'Customer',
            loadComponent: () =>
          import('./pages/customer/customer.component').then(
            (m) => m.CustomerComponent
          ),
          },
          {
            path: 'Package',
            loadComponent: () =>
          import('./pages/package/package.component').then(
            (m) => m.PackageComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/package/package-list/package-list.component').then(
            (m) => m.PackageListComponent
          ),
              },
              {
                path: 'Create',
                loadComponent: () =>
          import('./pages/package/package-create/package-create.component').then(
            (m) => m.PackageCreateComponent
          ),
              },
              {
                path: 'Edit/:id',
                loadComponent: () =>
          import('./pages/package/package-update/package-update.component').then(
            (m) => m.PackageUpdateComponent
          ),
              },
            ],
          },
          {
            path: 'Stock',
            loadComponent: () =>
          import('./pages/stock/stock.component').then(
            (m) => m.StockComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/stock/stock-list/stock-list.component').then(
            (m) => m.StockListComponent
          ),
              },
              {
                path: 'Card/:id',
                loadComponent: () =>
          import('./pages/stock/stock-card/stock-card.component').then(
            (m) => m.StockCardComponent
          ),
              },
            ],
          },
          {
            path: 'Receivable',
            loadComponent: () =>
          import('./pages/receivable/receivable.component').then(
            (m) => m.ReceivableComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/receivable/receivable-list/receivable-list.component').then(
            (m) => m.ReceivableListComponent
          ),
              },
              {
                path: ':id',
                loadComponent: () =>
          import('./pages/receivable/receivable-view/receivable-view.component').then(
            (m) => m.ReceivableViewComponent
          ),
              },
            ],
          },
          {
            path: 'Sales-invoice',
            loadComponent: () =>
          import('./pages/sales-invoice/sales-invoice.component').then(
            (m) => m.SalesInvoiceComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/sales-invoice/sales-invoice-create/sales-invoice-create.component').then(
            (m) => m.SalesInvoiceCreateComponent
          ),
              },
              {
                path: 'Archive',
                loadComponent: () =>
          import('./pages/sales-invoice/sales-invoice-archive/sales-invoice-archive.component').then(
            (m) => m.SalesInvoiceArchiveComponent
          ),
              },
            ],
          },
          {
            path: 'Overpayment',
            loadComponent: () =>
          import('./pages/overpayment/overpayment.component').then(
            (m) => m.OverpaymentComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/overpayment/overpayment-create/overpayment-create.component').then(
            (m) => m.OverpaymentCreateComponent
          ),
              },
              {
                path: 'Return',
                loadComponent: () =>
          import('./pages/overpayment/overpayment-return-list/overpayment-return-list.component').then(
            (m) => m.OverpaymentReturnListComponent
          ),
              },
              {
                path: 'Archive',
                loadComponent: () =>
          import('./pages/overpayment/overpayment-archive/overpayment-archive.component').then(
            (m) => m.OverpaymentArchiveComponent
          ),
              },
            ],
          },
          {
            path: 'Deposit',
            loadComponent: () =>
          import('./pages/deposit/deposit.component').then(
            (m) => m.DepositComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/deposit/deposit-list/deposit-list.component').then(
            (m) => m.DepositListComponent
          ),
              },
              {
                path: 'Archive',
                loadComponent: () =>
          import('./pages/deposit/deposit-archive/deposit-archive.component').then(
            (m) => m.DepositArchiveComponent
          ),
              },
              {
                path: 'Confirm/:id',
                loadComponent: () =>
          import('./pages/deposit/deposit-confirm/deposit-confirm.component').then(
            (m) => m.DepositConfirmComponent
          ),
              },
              {
                path: '**',
                redirectTo: '',
              },
            ],
          },
          {
            path: 'Price',
            loadComponent: () =>
          import('./pages/price/price.component').then(
            (m) => m.PriceComponent
          ),
            children: [
              {
                path: 'Sales',
                loadComponent: () =>
          import('./pages/price/price-sales/price-sales.component').then(
            (m) => m.PriceSalesComponent
          ),
              },
              {
                path: '**',
                redirectTo: 'Sales',
              },
            ],
          },
          {
            path: 'Report',
            loadComponent: () =>
          import('./pages/report/report.component').then(
            (m) => m.ReportComponent
          ),
            children: [
              {
                path: 'Sales',
                loadComponent: () =>
          import('./pages/report/report-sales/report-sales.component').then(
            (m) => m.ReportSalesComponent
          ),
              },
              {
                path: 'Output',
                loadComponent: () =>
          import('./pages/report/report-output/report-output.component').then(
            (m) => m.ReportOutputComponent
          ),
              },
              {
                path: '**',
                redirectTo: '/Sales',
              },
            ],
          },
          {
            path: 'Sales-return',
            loadComponent: () =>
          import('./pages/sales-return/sales-return.component').then(
            (m) => m.SalesReturnComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/sales-return/sales-return-create/sales-return-create.component').then(
            (m) => m.SalesReturnCreateComponent
          ),
              },
              {
                path: 'Archive',
                loadComponent: () =>
          import('./pages/sales-return/sales-return-archive/sales-return-archive.component').then(
            (m) => m.SalesReturnArchiveComponent
          ),
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
        loadComponent: () =>
          import('./pages/entries/general/general.component').then(
            (m) => m.GeneralComponent
          ),
        canActivate: [GeneralGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
          import('./pages/dashboard/general-dashboard/general-dashboard.component').then(
            (m) => m.GeneralDashboardComponent
          ),
          },
          {
            path: 'Expense',
            loadComponent: () =>
          import('./pages/expense/expense.component').then(
            (m) => m.ExpenseComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/expense/expense-create/expense-create.component').then(
            (m) => m.ExpenseCreateComponent
          ),
              },
              {
                path: 'Mutation',
                loadComponent: () =>
          import('./pages/expense/expense-mutation/expense-mutation.component').then(
            (m) => m.ExpenseMutationComponent
          ),
              },
              {
                path: 'Report',
                loadComponent: () =>
          import('./pages/expense/expense-report/expense-report.component').then(
            (m) => m.ExpenseReportComponent
          ),
              },
              {
                path: '**',
                redirectTo: '',
              },
            ],
          },
          {
            path: 'Company',
            loadComponent: () =>
          import('./pages/company/company.component').then(
            (m) => m.CompanyComponent
          ),
          },
          {
            path: 'Payment-method',
            loadComponent: () =>
          import('./pages/payment-method/payment-method.component').then(
            (m) => m.PaymentMethodComponent
          ),
          },
          {
            path: 'Stock',
            loadComponent: () =>
          import('./pages/stock/stock.component').then(
            (m) => m.StockComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/stock/stock-list/stock-list.component').then(
            (m) => m.StockListComponent
          ),
              },
              {
                path: 'Card/:id',
                loadComponent: () =>
          import('./pages/stock/stock-card/stock-card.component').then(
            (m) => m.StockCardComponent
          ),
              },
            ],
          },
          {
            path: 'Overpayment',
            loadComponent: () =>
          import('./pages/overpayment/overpayment.component').then(
            (m) => m.OverpaymentComponent
          ),
            children: [
              {
                path: '',
                loadComponent: () =>
          import('./pages/overpayment/overpayment-create/overpayment-create.component').then(
            (m) => m.OverpaymentCreateComponent
          ),
              },
              {
                path: 'Return',
                loadComponent: () =>
          import('./pages/overpayment/overpayment-return-list/overpayment-return-list.component').then(
            (m) => m.OverpaymentReturnListComponent
          ),
              },
              {
                path: 'Archive',
                loadComponent: () =>
          import('./pages/overpayment/overpayment-archive/overpayment-archive.component').then(
            (m) => m.OverpaymentArchiveComponent
          ),
              },
            ],
          },
          {
            path: 'Expense-type',
            loadComponent: () =>
          import('./pages/expense-type/expense-type.component').then(
            (m) => m.ExpenseTypeComponent
          ),
          },
          {
            path: 'Report',
            loadComponent: () =>
          import('./pages/report/report.component').then(
            (m) => m.ReportComponent
          ),
            children: [
              {
                path: 'Sales',
                loadComponent: () =>
          import('./pages/report/report-sales/report-sales.component').then(
            (m) => m.ReportSalesComponent
          ),
              },
              {
                path: 'Output',
                loadComponent: () =>
          import('./pages/report/report-output/report-output.component').then(
            (m) => m.ReportOutputComponent
          ),
              },
              {
                path: 'Inadequate',
                loadComponent: () =>
          import('./pages/report/report-inadequate/report-inadequate.component').then(
            (m) => m.ReportInadequateComponent
          ),
              },
              {
                path: 'Problematic',
                loadComponent: () =>
          import('./pages/report/report-problematic/report-problematic.component').then(
            (m) => m.ReportProblematicComponent
          ),
              },
              {
                path: 'Money',
                loadComponent: () =>
          import('./pages/report/report-money/report-money.component').then(
            (m) => m.ReportMoneyComponent
          ),
              },
              {
                path: 'Money/Dor',
                loadComponent: () =>
          import('./pages/report/report-money/report-money-dor/report-money-dor.component').then(
            (m) => m.ReportMoneyDorComponent
          ),
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
    loadComponent: () =>
          import('./pages/login/login.component').then(
            (m) => m.LoginComponent
          ),
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
