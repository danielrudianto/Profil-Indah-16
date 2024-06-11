import { Component } from '@angular/core';
import { StatCard } from '../dashboard.component';

@Component({
  selector: 'app-general-dashboard',
  templateUrl: './general-dashboard.component.html',
  styleUrls: ['./general-dashboard.component.css'],
})
export class GeneralDashboardComponent {
  constructor() {}

  stats: StatCard[] = [
    {
      title: "Today's sales",
      value: 0,
      previousValue: 50000,
    },
    {
      title: "This month's sales",
      value: 252879444,
      previousValue: 9785140500,
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
