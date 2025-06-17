import { UserViewModel } from './user-view.model';

export interface ICompany {
  id?: number;
  name: string;
  address: string;
  npwp: string | null;
  created_by: number;
  created_at: Date;
  is_delete?: boolean;
  can_delete?: boolean;
  updated_by?: number;
  updated_at?: Date;
  deleted_by?: number;
  deleted_at?: Date;

  user_company_deleted_byTouser?: UserViewModel;
}

export class CompanyModel {
  id?: number;
  name: string;
  address: string;
  npwp: string | null;
  created_by: number;
  created_at: Date;
  is_delete?: boolean = false;
  can_delete?: boolean;
  updated_by?: number;
  updated_at?: Date;
  deleted_by?: number;
  deleted_at?: Date;

  user_company_deleted_byTouser?: UserViewModel;

  constructor(data: ICompany) {
    this.id = data.id;
    this.name = data.name;
    this.address = data.address;
    this.npwp = data.npwp;
    this.created_by = data.created_by;
    this.created_at = data.created_at;
    this.updated_by = data.updated_by;
    this.updated_at = data.updated_at;
    this.deleted_by = data.deleted_by;
    this.deleted_at = data.deleted_at;

    // if can_delete is boolean, use it directly
    if (typeof data.can_delete === 'boolean') {
      this.can_delete = data.can_delete;
    } else if (typeof data.can_delete === 'string') {
      this.can_delete = data.can_delete === '1';
    }
  }
}
