import { Product, Store, Address, Rating, Order, OrderItem, User, Coupon, OrderStatus, PaymentMethod } from "@prisma/client";

export type { Product, Store, Address, Rating, Order, OrderItem, User, Coupon, OrderStatus, PaymentMethod };

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface RatingWithUser extends Rating {
  user?: User;
}

export interface ProductWithDetails extends Product {
  store?: Store;
  rating?: Rating[];
}

export interface OrderWithDetails extends Order {
  store?: Store;
  address?: Address;
  user?: User;
  orderItems?: (OrderItem & { product?: Product })[];
}
