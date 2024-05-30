export interface user {
  id?: number;
  name: string;
  nik: string;
  username: string;
  password?: string;
  created_by?: number;
  created_at?: Date;
  is_active: boolean;

  deleted_by?: number;
  deleted_at?: Date;

  updated_by?: number;
  updated_at?: Date;

  user_department?: user_department;
  token?: string;
  role?: number | any;

  user?: user;
  user_userTouser_deleted_by?: user;
}

export interface user_department {
  id?: number;
  role: number;
  user_id?: number;
  user?: user;
}

export const availableRoles: any[] = [
  {
    id: 1,
    name: 'Pembelian',
    available: true,
  },
  {
    id: 2,
    name: 'Penjualan',
    available: true,
  },
  {
    id: 3,
    name: 'Penjualan dan Pembelian',
    available: true,
  },
  {
    id: 5,
    name: 'Administrator',
    available: true,
  },
  {
    id: 6,
    name: 'Agen Penjualan',
    available: true,
  },
];
