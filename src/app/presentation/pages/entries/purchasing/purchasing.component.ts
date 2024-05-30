import { Component } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-purchasing',
  templateUrl: './purchasing.component.html',
  styleUrls: ['./purchasing.component.css'],
})
export class PurchasingComponent {
  constructor(private authService: AuthService, private router: Router) {}

  name: string = '';
  drawerMode: MatDrawerMode = 'over';
  isDrawerOpened: boolean = false;
  isMenuButtonAvailable: boolean = false;

  ngOnInit(): void {
    this.name = this.authService.getUserInfo()?.name ?? '';

    this.drawerMode = this.getDrawerMode;
    this.isDrawerOpened = window.innerWidth > 768;
    this.isMenuButtonAvailable = window.innerWidth < 768;

    window.addEventListener('resize', () => {
      if (window.innerWidth < 768) {
        this.isDrawerOpened = true;
        this.isMenuButtonAvailable = true;
      } else {
        this.isMenuButtonAvailable = false;
        this.isDrawerOpened = true;
      }

      this.drawerMode = this.getDrawerMode;
    });
  }
  get getDrawerMode(): MatDrawerMode {
    if (window.innerWidth < 768) {
      return 'over';
    } else {
      return 'side';
    }
  }

  clickMenuButton() {
    this.isDrawerOpened = !this.isDrawerOpened;
  }

  get isHidden(): boolean {
    // If route is /Administrator then false
    return this.router.url !== '/Administrator';
  }
}
