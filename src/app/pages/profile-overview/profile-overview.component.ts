import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { ResetPasswordDialogComponent } from './reset-password-dialog/reset-password-dialog.component';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';
import { SetAvatarComponent } from '../set-avatar/set-avatar.component';
import { NgIf } from '@angular/common';
import { AvatarComponent } from '../../components/avatar/avatar.component';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDivider } from '@angular/material/divider';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-profile-overview',
    templateUrl: './profile-overview.component.html',
    styleUrls: ['./profile-overview.component.scss'],
    imports: [NgIf, AvatarComponent, MatTooltip, MatDivider, MatProgressSpinner, MatFormField, MatLabel, MatInput, FormsModule]
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
