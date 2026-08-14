import { Component } from '@angular/core';
import { StatCard } from '../dashboard.component';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';

@Component({
    selector: 'app-purchasing-dashboard',
    templateUrl: './purchasing-dashboard.component.html',
    styleUrls: ['./purchasing-dashboard.component.css'],
    standalone: false
})
export class PurchasingDashboardComponent {
  constructor(
    private router: Router,
    private alertService: AlertService,
    private apiService: ApiService
  ) {}

  stats: StatCard[] = [
    {
      title: 'dashboard-purchasing__today-purchase',
      value: 0,
      previousValue: 0,
      againstText: 'general__against-yesterday',
    },
    {
      title: 'dashboard-purchasing__month-purchase',
      value: 0,
      previousValue: 0,
      againstText: 'general__against-last-month',
    },
    {
      title: 'dashboard-purchasing__active-promotion',
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

  openReport(reportType: string) {
    if (reportType == 'purchase') {
      this.router.navigate(['/Purchasing/Report/Purchase']);
    } else if (reportType == 'inadequate') {
      this.router.navigate(['/Purchasing/Report/Inadequate']);
    }
  }

  checkAndFetchStats(): void {
    const lastSynced = localStorage.getItem('dashboard:purchasing:last-synced');

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
    this.apiService.post('dashboard/purchasing', {}).subscribe({
      next: (data: any) => {
        localStorage.setItem(
          'dashboard:purchasing:last-synced',
          new Date().toISOString()
        );

        localStorage.setItem(
          'dashboard:purchasing:purchase-today',
          data.purchase.current
        );
        localStorage.setItem(
          'dashboard:purchasing:purchase-yesterday',
          data.purchase.previous
        );
        localStorage.setItem(
          'dashboard:purchasing:purchase-month',
          data.purchase_month.current
        );
        localStorage.setItem(
          'dashboard:purchasing:purchase-month-previous',
          data.purchase_month.previous
        );

        localStorage.setItem('dashboard:purchasing:promotion', data.promotion);

        this.syncWithLocalStorage();
      },
      error: (error) => {
        this.alertService.showError(error);
      },
    });
  }

  syncWithLocalStorage(): void {
    const todayPurchase =
      localStorage.getItem('dashboard:purchasing:purchase-today') == null
        ? 0
        : Number(localStorage.getItem('dashboard:purchasing:purchase-today'));
    const yesterdayPurchase =
      localStorage.getItem('dashboard:purchasing:purchase-yesterday') == null
        ? 0
        : Number(
            localStorage.getItem('dashboard:purchasing:purchase-yesterday')
          );

    const monthPurchase =
      localStorage.getItem('dashboard:purchasing:purchase-month') == null
        ? 0
        : Number(localStorage.getItem('dashboard:purchasing:purchase-month'));
    const monthPreviousPurchase =
      localStorage.getItem('dashboard:purchasing:purchase-month-previous') ==
      null
        ? 0
        : Number(
            localStorage.getItem('dashboard:purchasing:purchase-month-previous')
          );

    const promotion =
      localStorage.getItem('dashboard:purchasing:promotion') == null
        ? 0
        : Number(localStorage.getItem('dashboard:purchasing:promotion'));

    this.stats[0].value = todayPurchase;
    this.stats[0].previousValue = yesterdayPurchase;

    this.stats[1].value = monthPurchase;
    this.stats[1].previousValue = monthPreviousPurchase;

    this.stats[2].value = promotion;
  }

  goToStockApplication() {
    // Open new tab opens stock.profilindah.id
    window.open('https://stock.profilindah.id', '_blank');
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
