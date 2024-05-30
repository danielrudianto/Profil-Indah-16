import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent {
  constructor(private router: Router, private authService: AuthService) {}
  @Input('name') name!: string;
  @Input('hidden') isHidden!: boolean;
  @Input('menuButtonAvailable') menuButtonAvailable: boolean = false;

  @Output('onMenuButtonClicked') onMenuButtonClicked: EventEmitter<void> =
    new EventEmitter<void>();

  isProfileOpened: boolean = false;

  logout() {
    setTimeout(() => {
      this.authService.logout();
      this.router.navigate(['/Login']);
    }, 500);
  }

  navigate() {
    this.router.navigate(['/']);
  }

  clickMenuButton() {
    this.onMenuButtonClicked.emit();
  }

  navigateToProfile() {
    setTimeout(() => {
      this.router.navigate(['/Profile']);
    }, 500);
    this.clickMenuButton();
  }
}
