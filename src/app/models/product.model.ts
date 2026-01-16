export interface Product {
  id?: number;
  code: string;
  name: string;
  description?: string;
  mainStyle?: string;
  optionLevel?: number;
  category?: string;
  configuration?: string;
  base?: string;
  actualEmail?: string;
  active?: boolean;
  index?: boolean;
  profile?: string;
  status?: string;
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}
