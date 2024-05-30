import { Component, Input } from '@angular/core';
import {
  AvatarAccessories,
  AvatarClothes,
  AvatarEyebrows,
  AvatarEyes,
  AvatarMouth,
  AvatarTop,
} from 'src/app/models/avatar.model';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.css'],
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
  height: number = (33 * this.width) / 35;
}
