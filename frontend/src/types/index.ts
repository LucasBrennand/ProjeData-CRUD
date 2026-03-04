export interface RawMaterial {
  id?: number;
  name: string;
  quantity: number;
}

export interface ProductMaterial {
  id?: number;
  rawMaterial: RawMaterial;
  requiredQuantity: number;
}

export interface Product {
  id?: number;
  name: string;
  price: number;
  quantity: number;
  materials?: ProductMaterial[];
}

export interface ProductionSuggestion {
  productName: string;
  quantityToProduce: number;
  totalValue: number;
}
