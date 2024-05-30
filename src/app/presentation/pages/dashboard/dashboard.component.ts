import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

export interface DashboardCard {
  title: string;
  route: string;
  description: string;
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
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent implements OnInit {
  constructor(private authService: AuthService) {}

  name: string = '';
  ngOnInit(): void {
    this.name =
      this.authService.getUserInfo() == null
        ? ''
        : this.authService.getUserInfo()!.name;
  }

  availableDashboards: DashboardCard[] = [
    {
      title: 'Administrator',
      route: '/Administrator',
      description:
        'The administrator dashboard integrates all features, including product and sales management, user expenses, payment methods, and company purchases. Access comprehensive reports like inventory, money receipt, inadequate stock, and crucial finance reports. Streamline administration with powerful tools for complete oversight and control of your business operations.',
    },
    {
      title: 'Purchasing',
      route: '/Purchasing',
      description:
        'The purchasing dashboard allows efficient management of products, product types, and brands. It facilitates supplier coordination and tracks goods receipt seamlessly. Streamline your procurement process with intuitive tools for better organization and control of your purchasing activities.',
    },
    {
      title: 'Sales',
      route: '/Sales',
      description:
        'The sales dashboard offers comprehensive tools for managing sales prices, transactions, returns, and receivables. Track customer deposits, manage customer accounts, and organize packages efficiently. Enhance your sales operations with streamlined and intuitive controls for optimal performance and customer satisfaction.',
    },
    {
      title: 'General',
      route: '/General',
      description:
        'The General Dashboard is accessible only by specific staff and includes features for managing companies, payment methods, expense types, expenses, inadequate stock, stock levels, money receipts, and problematic items. It offers a comprehensive overview to streamline operations and ensure efficient handling of key business processes.',
    },
  ];
}
