import { Component } from '@angular/core';
import { StatCard } from '../dashboard.component';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { ReportInventoryComponent } from '../../report-inventory/report-inventory.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-administrator-dashboard',
  templateUrl: './administrator-dashboard.component.html',
  styleUrls: ['./administrator-dashboard.component.css'],
})
export class AdministratorDashboardComponent {
  constructor(
    private dynamicComponentService: DynamicComponentService,
    private router: Router
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
  }

  openReport(type: string) {
    switch (type) {
      case 'sales':
        this.router.navigate(['/Administrator/Report/Sales']);
        break;
      case 'purchase':
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
    }
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
