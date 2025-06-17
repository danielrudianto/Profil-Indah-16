import { IUserAvatar } from './user-avatar.model';

interface IUserViewModel {
  id?: number;
  name: string;
  username: string;
  role: number;
  user_avatar?: IUserAvatar | null;
}

export class UserViewModel {
  id?: number;
  name: string;
  username: string;
  role: number;
  user_avatar?: IUserAvatar | null;

  constructor(data: IUserViewModel) {
    this.id = data.id;
    this.name = data.name;
    this.username = data.username;
    this.role = data.role;
    this.user_avatar = data.user_avatar || null;
  }
}
