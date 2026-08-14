import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { CircleAvatarComponent } from '../circle-avatar/circle-avatar.component';

@Component({
    selector: 'app-profile-dialog',
    templateUrl: './profile-dialog.component.html',
    styleUrls: ['./profile-dialog.component.css'],
    animations: [
        // slide from left
        trigger('slideFromLeft', [
            // start state
            state('closed', style({ transform: 'translateX(200%)' })),
            // end state
            state('open', style({ transform: 'translateX(0)' })),
            // transition
            transition('* => *', [animate('0.3s ease-in-out')]),
        ]),
        trigger('fadeInOut', [
            // start state
            state('hidden', style({ opacity: 0 })),
            // end state
            state('shown', style({ opacity: 0.2 })),
            // transition
            transition('* => *', [animate('0.3s ease-in-out')]),
        ]),
    ],
    imports: [MatIcon, CircleAvatarComponent]
})
export class ProfileDialogComponent {
  @Output('onClose') onClose: EventEmitter<void> = new EventEmitter<void>();
  @Output('onLogoutButtonPressed') onLogoutButtonPressed: EventEmitter<void> =
    new EventEmitter<void>();
  @Output('onProfileButtonPressed') onProfileButtonPressed: EventEmitter<void> =
    new EventEmitter<void>();

  @Input('name') name!: string;
  isOpened: boolean = false;

  ngOnInit() {
    this.isOpened = true;
  }

  closeDialog() {
    this.isOpened = false;
    setTimeout(() => {
      this.onClose.emit();
    }, 500);
  }

  logout() {
    this.closeDialog();
    this.onLogoutButtonPressed.emit();
  }

  navigateToProfile() {
    this.closeDialog();
    this.onProfileButtonPressed.emit();
  }
}
