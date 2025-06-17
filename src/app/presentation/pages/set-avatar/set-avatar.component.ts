import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { panelAnimation } from 'src/app/animations/panel.animation';
import {
  AvatarAccessories,
  AvatarClothes,
  AvatarEyebrows,
  AvatarEyes,
  AvatarMouth,
  AvatarTop,
} from 'src/app/models/avatar.model';
import { AlertService } from 'src/app/services/alert.service';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { DynamicComponentService } from 'src/app/services/dynamic-component.service';

@Component({
  selector: 'app-set-avatar',
  templateUrl: './set-avatar.component.html',
  styleUrls: ['./set-avatar.component.css'],
  animations: [panelAnimation],
})
export class SetAvatarComponent {
  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private alertService: AlertService,
    private dynamicComponentService: DynamicComponentService
  ) {}

  panelState: string = 'closed';
  isSubmitting: boolean = false;
  avatarFormGroup: FormGroup = new FormGroup({
    top: new FormControl('', Validators.required),
    accessories: new FormControl('', Validators.required),
    clothes: new FormControl('', Validators.required),
    eyes: new FormControl('', Validators.required),
    eyebrows: new FormControl('', Validators.required),
    mouth: new FormControl('', Validators.required),
    circle: new FormControl('', Validators.required),
    color: new FormControl('', Validators.required),
  });

  ngOnInit(): void {
    this.panelState = 'opened';
    const avatar = this.authService.getSelfAvatar();
    if (avatar == null) {
      this.avatarFormGroup.patchValue({
        top: AvatarTop['no hair'],
        accessories: AvatarAccessories.none,
        clothes: AvatarClothes['blazer shirt'],
        eyes: AvatarEyes.default,
        eyebrows: AvatarEyebrows.default,
        mouth: AvatarMouth.default,
        circle: true,
        color: '#ffa600',
      });
    } else {
      this.avatarFormGroup.patchValue(avatar);
    }
  }

  onColorSelected(event: any) {
    this.avatarFormGroup.patchValue({
      color: event,
    });
  }

  /**
   * Submits the form and sends the avatar data to the server.
   * @return {void} This function does not return a value.
   */
  onSubmit(): void {
    this.isSubmitting = true;
    this.apiService.post('user-avatar', this.avatarFormGroup.value).subscribe({
      next: (data) => {
        this.authService.setSelfAvatar(data);
        this.alertService.showSuccess('Avatar updated successfully');
      },
      error: (error) => {
        console.error(`[error]: Error on setting avatar`, error);
        this.alertService;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  close() {
    this.panelState = 'closed';
    setTimeout(() => {
      this.dynamicComponentService.closeDynamicComponent();
    }, 300);
  }
}
