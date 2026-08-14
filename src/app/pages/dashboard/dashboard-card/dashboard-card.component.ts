import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'app-dashboard-card',
    templateUrl: './dashboard-card.component.html',
    styleUrls: ['./dashboard-card.component.scss'],
    imports: [MatButton]
})
export class DashboardCardComponent {
  constructor(private router: Router) {}
  @Input('title') title!: string;
  @Input('route') route!: string;

  navigate() {
    this.router.navigate([this.route]);
  }
}
