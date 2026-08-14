import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { DashboardTopComponent } from './dashboard-top/dashboard-top.component';

export interface DashboardCard {
  title: string;
  route: string;
}

export interface StatCard {
  title: string;
  value: number;
  previousValue?: number;
  againstText?: string;
}

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [TopbarComponent, DashboardTopComponent]
})
export class DashboardComponent implements OnInit {
  constructor(private authService: AuthService) {}

  name: string = '';
  availableDashboards: DashboardCard[] = [
    {
      title: 'Administrator',
      route: '/Administrator',
    },
    {
      title: 'Purchasing',
      route: '/Purchasing',
    },
    {
      title: 'Sales',
      route: '/Sales',
    },
    {
      title: 'General',
      route: '/General',
    },
  ];

  enabledDashboards: DashboardCard[] = [];
  ngOnInit(): void {
    this.name =
      this.authService.getUserInfo() == null
        ? ''
        : this.authService.getUserInfo()!.name;

    switch (this.authService.getUserInfo()?.role) {
      case 1:
        this.enabledDashboards = this.availableDashboards.filter(
          (x) => x.title == 'Purchasing'
        );
        break;
      case 2:
        this.enabledDashboards = this.availableDashboards.filter(
          (x) => x.title == 'Sales'
        );
        break;
      case 3:
        this.enabledDashboards = this.availableDashboards.filter(
          (x) =>
            x.title == 'Sales' ||
            x.title == 'General' ||
            x.title == 'Purchasing'
        );
        break;
      case 5:
        this.enabledDashboards = this.availableDashboards;
        break;
      case 7:
        this.enabledDashboards = this.availableDashboards;
        break;
      case 6:
        this.enabledDashboards = [];
        break;
    }
  }
}
