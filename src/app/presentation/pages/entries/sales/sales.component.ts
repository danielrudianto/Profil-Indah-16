import { Component, HostListener } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { slideUpDownAnimation } from 'src/app/animations/slide-up-down.animation';
import { SideNavService } from 'src/app/services/side-nav.service';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.css'],
  animations: [slideUpDownAnimation],
})
export class SalesComponent {
  constructor(
    private router: Router,
    private sideNavService: SideNavService
  ) {}

  isSideNavOpen$ = this.sideNavService.isOpen$;
  drawerMode: MatDrawerMode = 'over';

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
    return this.router.url !== '/Sales';
  }

  toggleSideNav() {
    this.sideNavService.toggle();
  }
}
