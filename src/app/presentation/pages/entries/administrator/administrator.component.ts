import { Component, HostListener } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { Router, RouterOutlet } from '@angular/router';
import { slideUpDownAnimation } from 'src/app/animations/slide-up-down.animation';
import { slideUpAnimation } from 'src/app/animations/slide-up.animation';
import { AuthService } from 'src/app/services/auth.service';
import { SideNavService } from 'src/app/services/side-nav.service';

@Component({
    selector: 'app-administrator',
    templateUrl: './administrator.component.html',
    styleUrls: ['./administrator.component.css'],
    animations: [slideUpAnimation, slideUpDownAnimation],
    standalone: false
})
export class AdministratorComponent {
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

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }

  toggleSideNav() {
    this.sideNavService.toggle();
  }

  get isHidden(): boolean {
    // If route is /Administrator then false
    return this.router.url !== '/Administrator';
  }
}
