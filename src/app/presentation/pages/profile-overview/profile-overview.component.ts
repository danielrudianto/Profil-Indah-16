import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ResetPasswordDialogComponent } from './reset-password-dialog/reset-password-dialog.component';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { SetAvatarComponent } from '../set-avatar/set-avatar.component';

@Component({
    selector: 'app-profile-overview',
    templateUrl: './profile-overview.component.html',
    styleUrls: ['./profile-overview.component.css'],
    standalone: false
})
export class ProfileOverviewComponent {
  constructor(
    private apiService: ApiService,
    private dialog: MatDialog,
    private authService: AuthService,
    private dynamicComponentService: DynamicComponentService
  ) {}

  isLoading: boolean = true;
  user: any = null;
  avatar: any;

  ngOnInit(): void {
    this.fetchProfile();
    this.avatar = this.authService.getSelfAvatar();
  }

  fetchProfile() {
    this.apiService
      .get('user/profile')
      .subscribe({
        next: (data) => {
          this.user = data;
        },
      })
      .add(() => {
        this.isLoading = false;
      });
  }

  resetPassword() {
    this.dialog.open(ResetPasswordDialogComponent);
  }

  openAvatarCustomization() {
    const dialog = this.dynamicComponentService.createDynamicComponent(
      SetAvatarComponent,
      {}
    );
    dialog.subscribe(() => {
      this.avatar = this.authService.getSelfAvatar();
    });
  }
}
