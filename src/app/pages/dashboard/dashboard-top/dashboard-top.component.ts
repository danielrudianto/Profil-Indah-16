import { Component, Input } from '@angular/core';
import { DashboardCard } from '../dashboard.component';
import { NgFor } from '@angular/common';
import { DashboardCardComponent } from '../dashboard-card/dashboard-card.component';

@Component({
    selector: 'app-dashboard-top',
    templateUrl: './dashboard-top.component.html',
    styleUrls: ['./dashboard-top.component.scss'],
    imports: [NgFor, DashboardCardComponent]
})
export class DashboardTopComponent {
  @Input('dashboard') dashboard!: DashboardCard[];
}
