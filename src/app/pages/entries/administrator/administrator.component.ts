import { Component, HostListener } from '@angular/core';
import {
  MatDrawerMode,
  MatDrawerContainer,
  MatDrawer,
  MatDrawerContent,
} from '@angular/material/sidenav';
import { RouterOutlet } from '@angular/router';
import { slideUpDownAnimation } from 'src/app/animations/slide-up-down.animation';
import { slideUpAnimation } from 'src/app/animations/slide-up.animation';

import { SideNavService } from 'src/app/services/side-nav.service';

import { MatTooltip } from '@angular/material/tooltip';
import { TopbarComponent } from '../../../components/topbar/topbar.component';
import { SidenavComponent } from '../../../components/sidenav/sidenav.component';
import { AsyncPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-administrator',
  templateUrl: './administrator.component.html',
  styleUrls: ['./administrator.component.scss'],
  animations: [slideUpAnimation, slideUpDownAnimation],
  imports: [
    MatDrawerContainer,
    MatDrawer,
    MatDrawerContent,
    MatTooltip,
    TopbarComponent,
    SidenavComponent,
    RouterOutlet,
    AsyncPipe,
    TranslatePipe,
  ],
})
export class AdministratorComponent {
  constructor(private sideNavService: SideNavService) {}

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

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }

  toggleSideNav() {
    this.sideNavService.toggle();
  }
}
