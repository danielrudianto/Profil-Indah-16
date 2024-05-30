export interface Customer {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  can_delete: boolean;
  npwp: string | null;
}
