import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import {
  AdministratorGuard,
  GeneralGuard,
  PurchasingGuard,
  OperationalGuard,
  SalesGuard,
  SuperAdministratorGuard,
} from './guards/administrator.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./pages/main/main.component').then((m) => m.MainComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
        children: [
          {
            /*
              Pengaturan tinggal DI DALAM dashboard, bukan sejajar dengannya.
              Navigasi samping dan topbar dipasang oleh DashboardComponent;
              menaruh halaman ini di luar berarti ia terbuka tanpa satu pun
              jalan kembali selain tombol mundur peramban.

              Induknya berjalur '', jadi alamatnya tetap /Settings.
            */
            path: 'Settings',
            loadComponent: () =>
              import('./pages/settings/settings.component').then(
                (m) => m.SettingsComponent,
              ),
          },
          {
            path: 'Customer',
            canActivate: [SalesGuard],
            loadComponent: () =>
              import('./pages/customer/customer.component').then(
                (m) => m.CustomerComponent,
              ),
          },
          {
            path: 'Package',
            canActivate: [OperationalGuard],
            loadComponent: () =>
              import('./pages/package/package.component').then(
                (m) => m.PackageComponent,
              ),
            children: [
              {
                path: '',
                canActivate: [OperationalGuard],
                loadComponent: () =>
                  import('./pages/package/package-list/package-list.component').then(
                    (m) => m.PackageListComponent,
                  ),
              },
              {
                path: 'Create',
                canActivate: [OperationalGuard],
                loadComponent: () =>
                  import('./pages/package/package-create/package-create.component').then(
                    (m) => m.PackageCreateComponent,
                  ),
              },
              {
                path: 'Edit/:id',
                canActivate: [OperationalGuard],
                loadComponent: () =>
                  import('./pages/package/package-update/package-update.component').then(
                    (m) => m.PackageUpdateComponent,
                  ),
              },
            ],
          },
          {
            path: 'Stock',
            canActivate: [OperationalGuard],
            loadComponent: () =>
              import('./pages/stock/stock.component').then(
                (m) => m.StockComponent,
              ),
            children: [
              {
                path: '',
                canActivate: [OperationalGuard],
                loadComponent: () =>
                  import('./pages/stock/stock-list/stock-list.component').then(
                    (m) => m.StockListComponent,
                  ),
              },
              {
                path: 'Card/:id',
                canActivate: [OperationalGuard],
                loadComponent: () =>
                  import('./pages/stock/stock-card/stock-card.component').then(
                    (m) => m.StockCardComponent,
                  ),
              },
            ],
          },
          {
            path: 'Receivable',
            canActivate: [SalesGuard],
            loadComponent: () =>
              import('./pages/receivable/receivable.component').then(
                (m) => m.ReceivableComponent,
              ),
            children: [
              {
                path: '',
                canActivate: [SalesGuard],
                loadComponent: () =>
                  import('./pages/receivable/receivable-list/receivable-list.component').then(
                    (m) => m.ReceivableListComponent,
                  ),
              },
              {
                path: ':id',
                canActivate: [SalesGuard],
                loadComponent: () =>
                  import('./pages/receivable/receivable-view/receivable-view.component').then(
                    (m) => m.ReceivableViewComponent,
                  ),
              },
            ],
          },
          {
            path: 'Sales-invoice',
            canActivate: [SalesGuard],
            loadComponent: () =>
              import('./pages/sales-invoice/sales-invoice.component').then(
                (m) => m.SalesInvoiceComponent,
              ),
            children: [
              {
                path: '',
                canActivate: [SalesGuard],
                loadComponent: () =>
                  import('./pages/sales-invoice/sales-invoice-create/sales-invoice-create.component').then(
                    (m) => m.SalesInvoiceCreateComponent,
                  ),
              },
              {
                path: 'Archive',
                canActivate: [SalesGuard],
                loadComponent: () =>
                  import('./pages/sales-invoice/sales-invoice-archive/sales-invoice-archive.component').then(
                    (m) => m.SalesInvoiceArchiveComponent,
                  ),
              },
              {
                path: '**',
                redirectTo: '',
              },
            ],
          },
          {
            path: 'Overpayment',
            canActivate: [SalesGuard],
            loadComponent: () =>
              import('./pages/overpayment/overpayment.component').then(
                (m) => m.OverpaymentComponent,
              ),
            children: [
              {
                path: '',
                canActivate: [SalesGuard],
                loadComponent: () =>
                  import('./pages/overpayment/overpayment-create/overpayment-create.component').then(
                    (m) => m.OverpaymentCreateComponent,
                  ),
              },
              {
                path: 'Return',
                canActivate: [SalesGuard],
                loadComponent: () =>
                  import('./pages/overpayment/overpayment-return-list/overpayment-return-list.component').then(
                    (m) => m.OverpaymentReturnListComponent,
                  ),
              },
              {
                path: 'Archive',
                canActivate: [SalesGuard],
                loadComponent: () =>
                  import('./pages/overpayment/overpayment-archive/overpayment-archive.component').then(
                    (m) => m.OverpaymentArchiveComponent,
                  ),
              },
            ],
          },
          {
            path: 'Deposit',
            canActivate: [SalesGuard],
            loadComponent: () =>
              import('./pages/deposit/deposit.component').then(
                (m) => m.DepositComponent,
              ),
            children: [
              {
                path: '',
                canActivate: [SalesGuard],
                loadComponent: () =>
                  import('./pages/deposit/deposit-list/deposit-list.component').then(
                    (m) => m.DepositListComponent,
                  ),
              },
              {
                path: 'Archive',
                canActivate: [SalesGuard],
                loadComponent: () =>
                  import('./pages/deposit/deposit-archive/deposit-archive.component').then(
                    (m) => m.DepositArchiveComponent,
                  ),
              },
              {
                path: 'Confirm/:id',
                canActivate: [SalesGuard],
                loadComponent: () =>
                  import('./pages/deposit/deposit-confirm/deposit-confirm.component').then(
                    (m) => m.DepositConfirmComponent,
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
            canActivate: [SalesGuard],
            loadComponent: () =>
              import('./pages/price/price.component').then(
                (m) => m.PriceComponent,
              ),
            children: [
              {
                path: 'Sales',
                canActivate: [SalesGuard],
                loadComponent: () =>
                  import('./pages/price/price-sales/price-sales.component').then(
                    (m) => m.PriceSalesComponent,
                  ),
              },
              {
                path: '**',
                redirectTo: 'Sales',
              },
              {
                path: 'Purchase',
                canActivate: [AdministratorGuard],
                loadComponent: () =>
                  import('./pages/price/price-purchase/price-purchase.component').then(
                    (m) => m.PricePurchaseComponent,
                  ),
              },
            ],
          },
          {
            path: 'Report',
            canActivate: [OperationalGuard],
            loadComponent: () =>
              import('./pages/report/report.component').then(
                (m) => m.ReportComponent,
              ),
            children: [
              {
                path: 'Sales',
                canActivate: [SalesGuard],
                loadComponent: () =>
                  import('./pages/report/report-sales/report-sales.component').then(
                    (m) => m.ReportSalesComponent,
                  ),
              },
              {
                path: 'Output',
                canActivate: [SalesGuard],
                loadComponent: () =>
                  import('./pages/report/report-output/report-output.component').then(
                    (m) => m.ReportOutputComponent,
                  ),
              },
              {
                path: '**',
                redirectTo: '/Administrator',
              },
              {
                path: 'Purchase',
                canActivate: [PurchasingGuard],
                loadComponent: () =>
                  import('./pages/report/report-purchase/report-purchase.component').then(
                    (m) => m.ReportPurchaseComponent,
                  ),
              },
              {
                path: 'Inadequate',
                canActivate: [PurchasingGuard],
                loadComponent: () =>
                  import('./pages/report/report-inadequate/report-inadequate.component').then(
                    (m) => m.ReportInadequateComponent,
                  ),
              },
              {
                path: 'Problematic',
                canActivate: [GeneralGuard],
                loadComponent: () =>
                  import('./pages/report/report-problematic/report-problematic.component').then(
                    (m) => m.ReportProblematicComponent,
                  ),
              },
              {
                path: 'Money',
                canActivate: [GeneralGuard],
                loadComponent: () =>
                  import('./pages/report/report-money/report-money.component').then(
                    (m) => m.ReportMoneyComponent,
                  ),
              },
              {
                path: 'Money/Dor',
                canActivate: [GeneralGuard],
                loadComponent: () =>
                  import('./pages/report/report-money/report-money-dor/report-money-dor.component').then(
                    (m) => m.ReportMoneyDorComponent,
                  ),
              },
            ],
          },
          {
            path: 'Sales-return',
            canActivate: [SalesGuard],
            loadComponent: () =>
              import('./pages/sales-return/sales-return.component').then(
                (m) => m.SalesReturnComponent,
              ),
            children: [
              {
                path: '',
                canActivate: [SalesGuard],
                loadComponent: () =>
                  import('./pages/sales-return/sales-return-create/sales-return-create.component').then(
                    (m) => m.SalesReturnCreateComponent,
                  ),
              },
              {
                path: 'Archive',
                canActivate: [SalesGuard],
                loadComponent: () =>
                  import('./pages/sales-return/sales-return-archive/sales-return-archive.component').then(
                    (m) => m.SalesReturnArchiveComponent,
                  ),
              },
              {
                path: '**',
                redirectTo: '',
              },
            ],
          },
          {
            path: 'Product',
            canActivate: [PurchasingGuard],
            loadComponent: () =>
              import('./pages/product/product.component').then(
                (m) => m.ProductComponent,
              ),
          },
          {
            path: 'Product/Create',
            canActivate: [PurchasingGuard],
            loadComponent: () =>
              import('./pages/product/product-create/product-create.component').then(
                (m) => m.ProductCreateComponent,
              ),
          },
          {
            path: 'Product-type',
            canActivate: [PurchasingGuard],
            loadComponent: () =>
              import('./pages/product-type/product-type.component').then(
                (m) => m.ProductTypeComponent,
              ),
          },
          {
            path: 'Product-brand',
            canActivate: [PurchasingGuard],
            loadComponent: () =>
              import('./pages/product-brand/product-brand.component').then(
                (m) => m.ProductBrandComponent,
              ),
          },
          {
            path: 'Supplier',
            canActivate: [PurchasingGuard],
            loadComponent: () =>
              import('./pages/supplier/supplier.component').then(
                (m) => m.SupplierComponent,
              ),
          },
          {
            path: 'Good-receipt',
            canActivate: [PurchasingGuard],
            loadComponent: () =>
              import('./pages/good-receipt/good-receipt.component').then(
                (m) => m.GoodReceiptComponent,
              ),
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./pages/good-receipt/good-receipt-create/good-receipt-create.component').then(
                    (m) => m.GoodReceiptCreateComponent,
                  ),
              },
              {
                path: 'Archive',
                loadComponent: () =>
                  import('./pages/good-receipt/good-receipt-archive/good-receipt-archive.component').then(
                    (m) => m.GoodReceiptArchiveComponent,
                  ),
              },
            ],
          },
          {
            path: 'Expense',
            canActivate: [GeneralGuard],
            loadComponent: () =>
              import('./pages/expense/expense.component').then(
                (m) => m.ExpenseComponent,
              ),
            children: [
              {
                path: '',
                canActivate: [GeneralGuard],
                loadComponent: () =>
                  import('./pages/expense/expense-create/expense-create.component').then(
                    (m) => m.ExpenseCreateComponent,
                  ),
              },
              {
                path: 'Mutation',
                canActivate: [GeneralGuard],
                loadComponent: () =>
                  import('./pages/expense/expense-mutation/expense-mutation.component').then(
                    (m) => m.ExpenseMutationComponent,
                  ),
              },
              {
                path: 'Report',
                canActivate: [GeneralGuard],
                loadComponent: () =>
                  import('./pages/expense/expense-report/expense-report.component').then(
                    (m) => m.ExpenseReportComponent,
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
            canActivate: [GeneralGuard],
            loadComponent: () =>
              import('./pages/company/company.component').then(
                (m) => m.CompanyComponent,
              ),
          },
          {
            path: 'Payment-method',
            canActivate: [GeneralGuard],
            loadComponent: () =>
              import('./pages/payment-method/payment-method.component').then(
                (m) => m.PaymentMethodComponent,
              ),
          },
          {
            path: 'Expense-type',
            canActivate: [GeneralGuard],
            loadComponent: () =>
              import('./pages/expense-type/expense-type.component').then(
                (m) => m.ExpenseTypeComponent,
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
            canActivate: [AdministratorGuard],
            loadComponent: () =>
              import('./pages/activity/activity.component').then(
                (m) => m.ActivityComponent,
              ),
          },
          {
            path: 'User',
            canActivate: [AdministratorGuard],
            loadComponent: () =>
              import('./pages/user/user.component').then(
                (m) => m.UserComponent,
              ),
          },
          {
            path: 'Promotion',
            canActivate: [AdministratorGuard],
            loadComponent: () =>
              import('./pages/promotion/promotion.component').then(
                (m) => m.PromotionComponent,
              ),
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./pages/promotion/promotion-list/promotion-list.component').then(
                    (m) => m.PromotionListComponent,
                  ),
              },
              {
                path: 'Create',
                loadComponent: () =>
                  import('./pages/promotion/promotion-create/promotion-create.component').then(
                    (m) => m.PromotionCreateComponent,
                  ),
              },
              {
                path: ':id',
                loadComponent: () =>
                  import('./pages/promotion/promotion-update/promotion-update.component').then(
                    (m) => m.PromotionUpdateComponent,
                  ),
              },
            ],
          },
          {
            path: 'Promotion/Create',
            canActivate: [AdministratorGuard],
            loadComponent: () =>
              import('./pages/promotion/promotion-create/promotion-create.component').then(
                (m) => m.PromotionCreateComponent,
              ),
          },
          {
            path: 'Purchase-invoice',
            canActivate: [AdministratorGuard],
            loadComponent: () =>
              import('./pages/purchase-invoice/purchase-invoice.component').then(
                (m) => m.PurchaseInvoiceComponent,
              ),
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./pages/purchase-invoice/purchase-invoice-create/purchase-invoice-create.component').then(
                    (m) => m.PurchaseInvoiceCreateComponent,
                  ),
              },
              {
                path: 'Archive',
                loadComponent: () =>
                  import('./pages/purchase-invoice/purchase-invoice-archive/purchase-invoice-archive.component').then(
                    (m) => m.PurchaseInvoiceArchiveComponent,
                  ),
              },
              {
                path: 'Confirm',
                loadComponent: () =>
                  import('./pages/purchase-invoice/purchase-invoice-confirm/purchase-invoice-confirm.component').then(
                    (m) => m.PurchaseInvoiceConfirmComponent,
                  ),
              },
              {
                path: 'Confirm/:id',
                loadComponent: () =>
                  import('./pages/purchase-invoice/purchase-invoice-confirm-view/purchase-invoice-confirm-view.component').then(
                    (m) => m.PurchaseInvoiceConfirmViewComponent,
                  ),
              },
              {
                path: 'Edit/:id',
                loadComponent: () =>
                  import('./pages/purchase-invoice/purchase-invoice-edit/purchase-invoice-edit.component').then(
                    (m) => m.PurchaseInvoiceEditComponent,
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
            canActivate: [AdministratorGuard],
            loadComponent: () =>
              import('./pages/adjustment-case/adjustment-case.component').then(
                (m) => m.AdjustmentCaseComponent,
              ),
            children: [
              {
                path: '',
                loadComponent: () =>
                  import('./pages/adjustment-case/adjustment-case-create/adjustment-case-create.component').then(
                    (m) => m.AdjustmentCaseCreateComponent,
                  ),
              },
              {
                path: 'Archive',
                loadComponent: () =>
                  import('./pages/adjustment-case/adjustment-case-archive/adjustment-case-archive.component').then(
                    (m) => m.AdjustmentCaseArchiveComponent,
                  ),
              },
              {
                path: 'Confirm',
                canActivate: [SuperAdministratorGuard],
                loadComponent: () =>
                  import('./pages/adjustment-case/adjustment-case-confirm/adjustment-case-confirm.component').then(
                    (m) => m.AdjustmentCaseConfirmComponent,
                  ),
              },
            ],
          },
        ],
      },
      {
        path: 'Profile',
        loadComponent: () =>
          import('./pages/entries/profile/profile.component').then(
            (m) => m.ProfileComponent,
          ),
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/profile-overview/profile-overview.component').then(
                (m) => m.ProfileOverviewComponent,
              ),
          },
        ],
      },

      {
        path: 'Cashier',
        loadComponent: () =>
          import('./pages/cashier/cashier.component').then(
            (m) => m.CashierComponent,
          ),
      },
      {
        /*
              Alamat lama berawalan peran. pathMatch 'prefix' membuat sisa
              jalurnya ikut terbawa, jadi /Administrator/Deposit mendarat di /Deposit —
              bukan sekadar dilempar ke dashboard.
            */
        path: 'Administrator',
        redirectTo: '',
        pathMatch: 'prefix',
      },
      {
        /*
              Alamat lama berawalan peran. pathMatch 'prefix' membuat sisa
              jalurnya ikut terbawa, jadi /Purchasing/Deposit mendarat di /Deposit —
              bukan sekadar dilempar ke dashboard.
            */
        path: 'Purchasing',
        redirectTo: '',
        pathMatch: 'prefix',
      },
      {
        /*
              Alamat lama berawalan peran. pathMatch 'prefix' membuat sisa
              jalurnya ikut terbawa, jadi /Sales/Deposit mendarat di /Deposit —
              bukan sekadar dilempar ke dashboard.
            */
        path: 'Sales',
        redirectTo: '',
        pathMatch: 'prefix',
      },
      {
        /*
              Alamat lama berawalan peran. pathMatch 'prefix' membuat sisa
              jalurnya ikut terbawa, jadi /General/Deposit mendarat di /Deposit —
              bukan sekadar dilempar ke dashboard.
            */
        path: 'General',
        redirectTo: '',
        pathMatch: 'prefix',
      },
    ],
  },
  {
    path: 'Login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
