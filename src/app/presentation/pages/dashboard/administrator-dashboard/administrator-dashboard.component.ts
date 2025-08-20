import { Component } from '@angular/core';
import { StatCard } from '../dashboard.component';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ReportInventoryComponent } from '../../report-inventory/report-inventory.component';
import { Router } from '@angular/router';
import { ReportFinanceComponent } from '../../report/report-finance/report-finance.component';
import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/auth.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-administrator-dashboard',
  templateUrl: './administrator-dashboard.component.html',
  styleUrls: ['./administrator-dashboard.component.css'],
})
export class AdministratorDashboardComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private router: Router,
    private apiService: ApiService,
    private alertService: AlertService,
    private translateService: TranslateService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  stats: StatCard[] = [
    {
      title: 'dashboard-administrator__today-sales',
      value: 0,
      previousValue: 0,
      againstText: 'general__against-yesterday',
    },
    {
      title: 'dashboard-administrator__today-purchase',
      value: 0,
      previousValue: 0,
      againstText: 'general__against-yesterday',
    },
    {
      title: 'dashboard-administrator__active-promotion',
      value: 0,
    },
    {
      title: 'dashboard-administrator__receivable',
      value: 0,
    },
    {
      title: 'dashboard-administrator__active-deposit',
      value: 0,
    },
    {
      title: 'dashboard-administrator__adjustment',
      value: 0,
    },
  ];

  columnNumber: number = 4;
  aspectRatio: string = '4:3';
  isMenuAvailable: boolean = false;

  ngOnInit(): void {
    this.columnNumber = this.col;
    this.aspectRatio = this.ar;

    window.addEventListener('resize', () => {
      this.columnNumber = this.col;
      this.aspectRatio = this.ar;
    });

    this.checkAndFetchStats();
  }

  openReport(type: string) {
    switch (type) {
      case 'finance':
        if (!this.authService.isSuperAdministrator()) {
          this.alertService.showSuccess(
            this.translateService.instant(
              'general__superadministrator-required'
            )
          );
          return;
        }
        
        this.dialog.open(ReportFinanceComponent, {});
        break;
      case 'sales':
        this.router.navigate(['/Administrator/Report/Sales']);
        break;
      case 'purchase':
        this.router.navigate(['/Administrator/Report/Purchase']);
        break;
      case 'money-receipt':
        this.router.navigate(['/Administrator/Report/Money']);
        break;
      case 'promotions':
        break;
      case 'receivable':
        break;
      case 'deposits':
        break;
      case 'adjustments':
        break;
      case 'inventory':
        this.dynamicComponentService.createDynamicComponent(
          ReportInventoryComponent,
          {}
        );
        break;
      default:
        break;
    }
  }

  goToStockApplication() {
    // Open new tab opens stock.profilindah.id
    window.open('https://stock.profilindah.id', '_blank');
  }

  checkAndFetchStats(): void {
    const lastSynced = localStorage.getItem(
      'dashboard:administrator:last-synced'
    );

    if (lastSynced == null || lastSynced == undefined) {
      // Fetch stats
      this.fetchStats();
      return;
    } else {
      const date = new Date();
      const lastSyncedDate = new Date(lastSynced);
      // If it's more than 15 minutes ago, then fetch stats
      if (date.getTime() - lastSyncedDate.getTime() > 15 * 60 * 1000) {
        // Fetch stats
        this.fetchStats();
        return;
      } else {
        // If it's less than 15 minutes ago, then don't fetch stats
        this.syncWithLocalStorage();
        return;
      }
    }
  }

  fetchStats(): void {
    this.apiService.post('dashboard/administrator', {}).subscribe({
      next: (data: any) => {
        localStorage.setItem(
          'dashboard:administrator:last-synced',
          new Date().toISOString()
        );

        localStorage.setItem(
          'dashboard:administrator:sales-today',
          data.sales.current
        );
        localStorage.setItem(
          'dashboard:administrator:sales-yesterday',
          data.sales.previous
        );
        localStorage.setItem(
          'dashboard:administrator:purchase-today',
          data.purchase.current
        );
        localStorage.setItem(
          'dashboard:administrator:purchase-yesterday',
          data.purchase.previous
        );

        localStorage.setItem('dashboard:administrator:deposit', data.deposit);
        localStorage.setItem(
          'dashboard:administrator:promotion',
          data.promotion
        );
        localStorage.setItem(
          'dashboard:administrator:receivable',
          data.receivable
        );

        this.syncWithLocalStorage();
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }

  syncWithLocalStorage(): void {
    const todaySales =
      localStorage.getItem('dashboard:administrator:sales-today') == null
        ? 0
        : Number(localStorage.getItem('dashboard:administrator:sales-today'));
    const yesterdaySales =
      localStorage.getItem('dashboard:administrator:sales-yesterday') == null
        ? 0
        : Number(
            localStorage.getItem('dashboard:administrator:sales-yesterday')
          );

    const todayPurchase =
      localStorage.getItem('dashboard:administrator:purchase-today') == null
        ? 0
        : Number(
            localStorage.getItem('dashboard:administrator:purchase-today')
          );

    const yesterdayPurchase =
      localStorage.getItem('dashboard:administrator:purchase-yesterday') == null
        ? 0
        : Number(
            localStorage.getItem('dashboard:administrator:purchase-yesterday')
          );

    const deposit =
      localStorage.getItem('dashboard:administrator:deposit') == null
        ? 0
        : Number(localStorage.getItem('dashboard:administrator:deposit'));

    const receivable =
      localStorage.getItem('dashboard:administrator:receivable') == null
        ? 0
        : Number(localStorage.getItem('dashboard:administrator:receivable'));

    const promotion =
      localStorage.getItem('dashboard:administrator:promotion') == null
        ? 0
        : Number(localStorage.getItem('dashboard:administrator:promotion'));

    this.stats[0].value = todaySales;
    this.stats[0].previousValue = yesterdaySales;

    this.stats[1].value = todayPurchase;
    this.stats[1].previousValue = yesterdayPurchase;

    this.stats[2].value = promotion;

    this.stats[3].value = receivable;

    this.stats[4].value = deposit;
  }

  get col(): number {
    if (window.innerWidth > 1440) {
      return 4;
    } else if (window.innerWidth > 1200) {
      return 3;
    } else if (window.innerWidth > 992) {
      return 2;
    } else if (window.innerWidth > 768) {
      return 1;
    } else {
      return 1;
    }
  }

  get ar(): string {
    if (this.col == 1) {
      return '30:9';
    } else if (this.col == 2) {
      return '25:9';
    } else if (this.col == 3) {
      return '19:9';
    } else if (this.col == 4) {
      return '16:9';
    } else {
      return '16:9';
    }
  }
}
