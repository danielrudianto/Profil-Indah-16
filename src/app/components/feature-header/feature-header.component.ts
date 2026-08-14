import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
    selector: 'app-feature-header',
    templateUrl: './feature-header.component.html',
    styleUrls: ['./feature-header.component.scss'],
    imports: [NgIf, MatIconButton, MatIcon, MatTooltip]
})
export class FeatureHeaderComponent {
  constructor(private router: Router) {}

  @Input('title') title!: string;
  @Input('help') help: string | null = null;
  @Input('isBackAvailable') isBackAvailable!: boolean;
  @Input('onClickBackButton') onClickBackButton: Function | null = null;

  clickBackButton() {
    if (this.onClickBackButton) {
      this.onClickBackButton();
      return;
    }

    const url = this.router.url.split('/');
    if (url.length > 2) {
      for (let i = 0; i < url.length - 2; i++) {
        url.pop();
      }
    }

    this.router.navigate(url);
  }
}
