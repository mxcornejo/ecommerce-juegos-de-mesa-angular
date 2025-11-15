import { CartItem } from './cart-item.interface';

export interface Order {
  id: string;
  orderNumber: string;
  date: Date;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress?: {
    street: string;
    city: string;
    region: string;
  };
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
}
