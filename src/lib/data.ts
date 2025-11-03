

import { placeholderImages } from './placeholder-images';

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  imageHint: string;
  vendorId: string;
};

export type Order = {
    id: string;
    customerId: string;
    vendorId: string;
    riderId?: string;
    products: { id: string; name: string; quantity: number, price: number }[];
    totalAmount: number;
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Canceled';
    orderDate: any; // Using `any` for Firebase Timestamp flexibility
    deliveryAddress: string;
  };

export type Vendor = {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  category: 'Grocery' | 'Electronics' | 'Restaurant' | 'Fashion' | 'Pharmacy';
  image: string;
  imageHint: string;
  userId: string;
}

export type AdminVendor = {
  id: string;
  name: string;
  category: string;
  approvalStatus: 'Pending' | 'Approved';
  activeStatus: 'Active' | 'Inactive';
  enabled: boolean;
  vendorId: string;
}

export type AdminRider = {
  id: string;
  name: string;
  vehicle: 'motorcycle' | 'bike' | 'car';
  verificationStatus: 'Verified' | 'Unverified';
  onlineStatus: 'Online' | 'Offline';
  enabled: boolean;
  userId: string;
}
