import { UserViewModel } from './user-view.model';

export interface IUserAvatar {
  id?: number;
  user_id?: number;
  top: number;
  accessories: number;
  clothes: number;
  eyes: number;
  eyebrows: number;
  mouth: number;
  color: string;
  circle: boolean;

  user?: UserViewModel;
}

export class UserAvatarModel {
  id?: number;
  user_id?: number;
  top: number;
  accessories: number;
  circle: boolean;
  clothes: number;
  color: string;
  eyebrows: number;
  eyes: number;
  mouth: number;

  user?: UserViewModel;

  constructor(data?: Partial<UserAvatarModel>) {
    this.id = data?.id;
    this.user_id = data?.user_id;
    this.top = data?.top ?? 0;
    this.accessories = data?.accessories ?? 0;
    this.circle = data?.circle ?? false;
    this.clothes = data?.clothes ?? 0;
    this.color = data?.color ?? '';
    this.eyebrows = data?.eyebrows ?? 0;
    this.eyes = data?.eyes ?? 0;
    this.mouth = data?.mouth ?? 0;
  }
}
