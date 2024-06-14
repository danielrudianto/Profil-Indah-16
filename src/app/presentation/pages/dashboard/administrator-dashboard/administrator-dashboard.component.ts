import { Component } from '@angular/core';
import { StatCard } from '../dashboard.component';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ReportInventoryComponent } from '../../report-inventory/report-inventory.component';
import { Router } from '@angular/router';
import { ReportFinanceComponent } from '../../report/report-finance/report-finance.component';
import { ApiService } from 'src/app/services/api.service';
import { AlertService } from 'src/app/services/alert.service';

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
    private alertService: AlertService
  ) {}

  stats: StatCard[] = [
    {
      title: "Today's sales",
      value: 0,
      previousValue: 50000,
    },
    {
      title: "Today's purchase",
      value: 0,
      previousValue: 50000,
    },
    {
      title: 'Active promotion',
      value: 0,
    },
    {
      title: 'Current receivable',
      value: 0,
    },
    {
      title: 'Active deposits',
      value: 0,
    },
    {
      title: 'Adjustments created',
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
        this.dynamicComponentService.createDynamicComponent(
          ReportFinanceComponent,
          {}
        );
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
    this.apiService.post('report/dashboard/administrator', {}).subscribe({
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

    this.stats = [
      {
        title: "Today's sales",
        value: todaySales,
        previousValue: yesterdaySales,
      },
      {
        title: "Today's purchase",
        value: todayPurchase,
        previousValue: yesterdayPurchase,
      },
      {
        title: 'Active promotion',
        value: promotion,
      },
      {
        title: 'Current receivable',
        value: receivable,
      },
      {
        title: 'Active deposits',
        value: deposit,
      },
      {
        title: 'Adjustments created',
        value: 0,
      },
    ];
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
