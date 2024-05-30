export interface Company {
  id: number;
  name: string;
  address: string;
  npwp: string | null;
  can_delete: boolean;
  is_active: boolean;
}
