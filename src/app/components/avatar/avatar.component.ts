import { Component, Input } from '@angular/core';
import {
  AvatarAccessories,
  AvatarClothes,
  AvatarEyebrows,
  AvatarEyes,
  AvatarMouth,
  AvatarTop,
} from 'src/app/models/avatar.model';
import { NgIf, NgSwitch, NgSwitchCase } from '@angular/common';

@Component({
    selector: 'app-avatar',
    templateUrl: './avatar.component.html',
    imports: [NgIf, NgSwitch, NgSwitchCase]
})
export class AvatarComponent {
  constructor() {}

  @Input('top') top!: AvatarTop;
  @Input('accessories') accessories!: AvatarAccessories;
  @Input('clothes') clothes!: AvatarClothes;
  @Input('eyes') eyes!: AvatarEyes;
  @Input('eyebrows') eyebrows!: AvatarEyebrows;
  @Input('mouth') mouth!: AvatarMouth;
  @Input('color') color?: string;
  @Input('circle') circle!: boolean;

  @Input('width') width: number = 280;
}
