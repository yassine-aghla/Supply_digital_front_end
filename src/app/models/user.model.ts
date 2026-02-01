// models/user.model.ts
export enum Role {
  ADMIN = 'ADMIN',
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER',
  CLIENT = 'CLIENT'
}

export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  role: Role;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  role: Role;
  active?: boolean;
}

export interface UserUpdateRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: Role;
  active?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  user?: User;
  expiresIn?: number;
  tokenType?: string;
  email?: string;
  [key: string]: any;
}


export interface DeleteResponse {
  success: string;
}
