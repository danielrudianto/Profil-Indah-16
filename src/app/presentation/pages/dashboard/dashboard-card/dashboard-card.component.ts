import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard-card',
  templateUrl: './dashboard-card.component.html',
  styleUrls: ['./dashboard-card.component.css'],
})
export class DashboardCardComponent {
  constructor(private router: Router) {}
  @Input('title') title!: string;
  @Input('route') route!: string;

  navigate() {
    this.router.navigate([this.route]);
  }
}
