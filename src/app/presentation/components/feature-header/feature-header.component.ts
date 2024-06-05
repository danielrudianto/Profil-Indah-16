import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feature-header',
  templateUrl: './feature-header.component.html',
  styleUrls: ['./feature-header.component.css'],
})
export class FeatureHeaderComponent {
  constructor(private router: Router) {}

  @Input('title') title!: string;
  @Input('help') help: string | null = null;
  @Input('isBackAvailable') isBackAvailable!: boolean;

  clickBackButton() {
    const url = this.router.url.split('/');
    if (url.length > 2) {
      for (let i = 0; i < url.length - 1; i++) {
        url.pop();
      }
    }

    this.router.navigate(url);
  }
}
