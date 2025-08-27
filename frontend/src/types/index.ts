export interface InventoryItem {
  name: string;
  supplier: string;
}

export interface Supplier {
  name: string;
  icon: string;
  items: InventoryItem[];
}

export interface ScanResponse {
  success: boolean;
  message: string;
  item?: string;
  supplier?: string;
}
