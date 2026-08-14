import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-circle-avatar',
    templateUrl: './circle-avatar.component.html',
    styleUrls: ['./circle-avatar.component.css'],
    standalone: false
})
export class CircleAvatarComponent {
  @Input('name') name!: String;
  @Input('size') size: number = 50;
}
