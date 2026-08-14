import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { NgClass, NgIf } from '@angular/common';
import { DarkModeSelectorComponent } from './dark-mode-selector/dark-mode-selector.component';
import { LanguageSelectorComponent } from './language-selector/language-selector.component';
import { CircleAvatarComponent } from '../circle-avatar/circle-avatar.component';
import { MatTooltip } from '@angular/material/tooltip';
import { AvatarComponent } from '../avatar/avatar.component';
import { ProfileDialogComponent } from '../profile-dialog/profile-dialog.component';

@Component({
    selector: 'app-topbar',
    templateUrl: './topbar.component.html',
    styleUrls: ['./topbar.component.scss'],
    imports: [NgClass, DarkModeSelectorComponent, LanguageSelectorComponent, NgIf, CircleAvatarComponent, MatTooltip, AvatarComponent, ProfileDialogComponent]
})
export class TopbarComponent {
  constructor(private router: Router, private authService: AuthService) {}
  @Input('hidden') isHidden!: boolean;
  @Input('menuButtonAvailable') menuButtonAvailable: boolean = false;

  @Output('onMenuButtonClicked') onMenuButtonClicked: EventEmitter<void> =
    new EventEmitter<void>();

  isProfileOpened: boolean = false;
  isAvatarAvailable: boolean = false;
  avatar: any = null;
  name: string = '';

  ngOnInit(): void {
    const avatar = this.authService.getSelfAvatar();
    if (avatar != null) {
      this.isAvatarAvailable = true;
      this.avatar = avatar;
    }

    const userInfo = this.authService.getUserInfo();
    this.name = userInfo == null ? '' : userInfo?.name;
  }

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
