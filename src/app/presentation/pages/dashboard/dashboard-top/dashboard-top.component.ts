import { Component, Input } from '@angular/core';
import { DashboardCard } from '../dashboard.component';

@Component({
  selector: 'app-dashboard-top',
  templateUrl: './dashboard-top.component.html',
  styleUrls: ['./dashboard-top.component.css'],
})
export class DashboardTopComponent {
  @Input('dashboard') dashboard!: DashboardCard[];
}
