import { Component } from '@angular/core';
import { StatCard } from '../dashboard.component';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { TranslateService } from '@ngx-translate/core';
import { ReportCompanyComponent } from '../../report/report-company/report-company.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-sales-dashboard',
    templateUrl: './sales-dashboard.component.html',
    styleUrls: ['./sales-dashboard.component.css'],
    standalone: false
})
export class SalesDashboardComponent {
  constructor(
    private router: Router,
    private alertService: AlertService,
    private apiService: ApiService,
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {}

  stats: StatCard[] = [
    {
      title: 'dashboard-sales__today-sales',
      value: 0,
      previousValue: 0,
      againstText: 'general__against-yesterday',
    },
    {
      title: 'dashboard-sales__month-sales',
      value: 0,
      previousValue: 0,
      againstText: 'general__against-last-month',
    },
    {
      title: 'dashboard-sales__active-promotion',
      value: 0,
    },
    {
      title: 'dashboard-sales__active-deposit',
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

  goToStockApplication() {
    // Open new tab opens stock.profilindah.id
    window.open('https://stock.profilindah.id', '_blank');
  }

  openReport(reportType: string) {
    switch (reportType) {
      case 'sales':
        this.router.navigate(['/Sales/Report/Sales']);
        break;
      case 'company':
        this.dialog.open(ReportCompanyComponent, {});
        break;
      case 'output':
        this.router.navigate(['/Sales/Report/Output']);
        break;
    }
  }

  checkAndFetchStats(): void {
    const lastSynced = localStorage.getItem('dashboard:sales:last-synced');

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
    this.apiService.post('dashboard/sales', {}).subscribe({
      next: (data: any) => {
        localStorage.setItem(
          'dashboard:sales:last-synced',
          new Date().toISOString()
        );

        localStorage.setItem('dashboard:sales:sales-today', data.sales.current);
        localStorage.setItem(
          'dashboard:sales:sales-yesterday',
          data.sales.previous
        );
        localStorage.setItem(
          'dashboard:sales:sales-month',
          data.sales_month.current
        );
        localStorage.setItem(
          'dashboard:sales:sales-last-month',
          data.sales_month.previous
        );

        localStorage.setItem('dashboard:sales:deposit', data.deposit);
        localStorage.setItem('dashboard:sales:promotion', data.promotion);

        this.syncWithLocalStorage();
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }

  syncWithLocalStorage(): void {
    const todaySales =
      localStorage.getItem('dashboard:sales:sales-today') == null
        ? 0
        : Number(localStorage.getItem('dashboard:sales:sales-today'));
    const yesterdaySales =
      localStorage.getItem('dashboard:sales:sales-yesterday') == null
        ? 0
        : Number(localStorage.getItem('dashboard:sales:sales-yesterday'));

    const monthSales =
      localStorage.getItem('dashboard:sales:sales-month') == null
        ? 0
        : Number(localStorage.getItem('dashboard:sales:sales-month'));

    const lastMonthSales =
      localStorage.getItem('dashboard:sales:sales-last-month') == null
        ? 0
        : Number(localStorage.getItem('dashboard:sales:sales-last-month'));

    const deposit =
      localStorage.getItem('dashboard:sales:deposit') == null
        ? 0
        : Number(localStorage.getItem('dashboard:sales:deposit'));

    const promotion =
      localStorage.getItem('dashboard:sales:promotion') == null
        ? 0
        : Number(localStorage.getItem('dashboard:sales:promotion'));

    this.stats[0].value = todaySales;
    this.stats[0].previousValue = yesterdaySales;

    this.stats[1].value = monthSales;
    this.stats[1].previousValue = lastMonthSales;

    this.stats[2].value = promotion;

    this.stats[3].value = deposit;
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
