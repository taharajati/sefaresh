export interface Order {
  _id?: string;
  storeName: string;
  phoneNumber: string;
  category: string;
  description: string;
  favoriteColor: string;
  instagram?: string;
  logo?: string;
  productImages?: string[];
  additionalNotes?: string;
  createdAt?: Date;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface AdminUser {
  username: string;
  password: string;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  errorDetails?: {
    status?: number;
    statusText?: string;
    error?: string;
    [key: string]: any;
  };
} 