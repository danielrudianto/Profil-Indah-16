import { Component, Input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgIf, NgFor } from '@angular/common';
import { MatMenuTrigger, MatMenu, MatMenuItem } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-transaction-header',
    templateUrl: './transaction-header.component.html',
    styleUrls: ['./transaction-header.component.css'],
    imports: [MatIconButton, MatIcon, NgIf, MatMenuTrigger, MatMenu, NgFor, MatMenuItem, RouterLink, RouterLinkActive, TranslatePipe]
})
export class TransactionHeaderComponent {
  constructor(private router: Router) {}

  @Input('title') title!: string;
  @Input('availbleMenus') availbleMenus: any[] = [];
  @Input('route') route!: string;
  @Input('backRoute') backRoute: string | undefined;

  menus: any[] = [];

  ngOnInit(): void {
    if (this.availbleMenus.length > 0) {
      const currentURL = this.router.url;
      const segments = currentURL.split('/');

      let baseRoute = '';
      if (segments.length > 2) {
        baseRoute = `/${segments[1]}/${segments[2]}`;
      }

      this.menus = this.availbleMenus.map((x) => {
        return {
          ...x,
          link: `${baseRoute}/${x.link}`,
        };
      });
    }
  }

  /**
   * Navigates back to the previous page by determining the base route and navigating to it.
   * @return {void} This function does not return anything.
   */
  clickBackButton(): void {
    if (this.backRoute == undefined) {
      const currentUrl = this.router.url;
      const segments = currentUrl.split('/');

      // Determine the base route
      let baseRoute = '';
      if (segments.length > 2) {
        baseRoute = `/${segments[1]}/${segments[2]}`;
      }

      // Check if the current route is the base route
      if (currentUrl === baseRoute) {
        // If at base route, navigate one level up
        baseRoute = `/${segments[1]}`;
      }

      this.router.navigate([baseRoute]);
    } else {
      this.router.navigate([this.backRoute]);
    }
  }

  get baseRoute(): string {
    const currentURL = this.router.url;
    const segments = currentURL.split('/');
    return segments.length > 2 ? `/${segments[1]}/${segments[2]}` : '';
  }

  isCurrentRoute(link: string): boolean {
    const currentURL = this.router.url.split('?')[0];
    return currentURL === link || currentURL + '/' === link;
  }
}
