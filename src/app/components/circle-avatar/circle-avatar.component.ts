import { Component, Input } from '@angular/core';
import { NgStyle } from '@angular/common';

@Component({
    selector: 'app-circle-avatar',
    templateUrl: './circle-avatar.component.html',
    styleUrls: ['./circle-avatar.component.scss'],
    imports: [NgStyle]
})
export class CircleAvatarComponent {
  @Input('name') name!: String;
  @Input('size') size: number = 50;
}
