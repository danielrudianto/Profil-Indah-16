export interface Supplier {
  id: number;
  name: string;
  address: string;
  npwp: string | null;
  can_delete: boolean;
}
