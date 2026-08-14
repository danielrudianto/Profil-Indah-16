import { Component, HostListener } from '@angular/core';
import { MatDrawerMode, MatDrawerContainer, MatDrawer, MatDrawerContent } from '@angular/material/sidenav';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { slideUpDownAnimation } from 'src/app/animations/slide-up-down.animation';
import { SideNavService } from 'src/app/services/side-nav.service';
import { MatNavList, MatListSubheaderCssMatStyler, MatListItem, MatListItemIcon, MatListItemTitle } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { MatDivider } from '@angular/material/divider';
import { MatTooltip } from '@angular/material/tooltip';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { AsyncPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-purchasing',
    templateUrl: './purchasing.component.html',
    styleUrls: ['./purchasing.component.css'],
    animations: [slideUpDownAnimation],
    imports: [MatDrawerContainer, MatDrawer, MatNavList, MatListSubheaderCssMatStyler, MatListItem, RouterLink, RouterLinkActive, MatIcon, MatListItemIcon, MatListItemTitle, MatDivider, MatDrawerContent, MatTooltip, TopbarComponent, RouterOutlet, AsyncPipe, TranslateModule]
})
export class PurchasingComponent {
  constructor(private router: Router, private sideNavService: SideNavService) {}

  isSideNavOpen$ = this.sideNavService.isOpen$;
  drawerMode: MatDrawerMode = 'over';
  isDrawerOpened: boolean = false;
  isMenuButtonAvailable: boolean = false;

  ngOnInit(): void {
    this.drawerMode = this.getDrawerMode;
    this.sideNavService.updateSideNavState(window.innerWidth);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    const target = event.target as Window;
    this.sideNavService.updateSideNavState(target.innerWidth);
    this.drawerMode = this.getDrawerMode;
  }

  get getDrawerMode(): MatDrawerMode {
    if (window.innerWidth < 768) {
      return 'over';
    } else {
      return 'side';
    }
  }

  get isHidden(): boolean {
    return this.router.url !== '/Purchasing';
  }

  toggleSideNav() {
    this.sideNavService.toggle();
  }
}
