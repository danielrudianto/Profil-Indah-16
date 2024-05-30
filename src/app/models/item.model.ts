export interface Item {
  id: number;
  reference: string;
  description: string;
  item_brand_name: string;
  item_type_name: string;
  is_active: boolean;
  can_delete: boolean;
}

export interface ItemBrand {
  id: number;
  name: string;
  created_at: string;
  user: DataUser;
  can_delete: boolean;
}

export interface ItemType {
  id: number;
  name: string;
  created_at: string;
  user_item_type_created_byTouser: DataUser;
  can_delete: boolean;
}

export interface Package {
  id: number;
  reference: string;
  description: string;
  created_at: string;
  item_brand_name: string;
  item_type_name: string;
  can_delete: boolean;
  is_active: boolean;
}

export interface DataUser {
  name: string;
}

export interface ItemStock {
  id: number;
  reference: string;
  description: string;
  item_brand_name: string;
  item_type_name: string;
  is_active: boolean;
  stock: number;
  unit: string;
}
