import { Component } from '@angular/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-administrator',
  templateUrl: './administrator.component.html',
  styleUrls: ['./administrator.component.css'],
})
export class AdministratorComponent {
  constructor(private router: Router, private authService: AuthService) {}

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
