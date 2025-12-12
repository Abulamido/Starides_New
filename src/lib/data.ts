

import { placeholderImages } from './placeholder-images';

export type Product = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  image: string;
  imageHint: string;
  vendorId: string; // Firebase Auth user.uid of the vendor owner
  available?: boolean;
};

export type Order = {
  id: string;
  customerId: string; // Firebase Auth user.uid of the customer
  vendorId: string;   // Firebase Auth user.uid of the vendor owner
  riderId?: string;   // Firebase Auth user.uid of the rider (optional)
  products: { id: string; name: string; quantity: number, price: number }[];
  totalAmount: number;
  status: 'New Order' | 'Pending Acceptance' | 'Preparing' | 'Ready for Pickup' | 'In Transit' | 'Delivered' | 'Canceled';
  orderDate: any; // Using `any` for Firebase Timestamp flexibility
  deliveryAddress: string;
  deliveryFee?: number;
  deliveryLocation?: { lat: number; lng: number };
  riderLocation?: { lat: number; lng: number; timestamp: any }; // Live rider location
  eta?: number; // Estimated time of arrival in minutes
};

export type Vendor = {
  id: string;         // Firestore auto-generated document ID
  name: string;
  description: string;
  rating: number;
  reviewCount: number;
  category: 'Grocery' | 'Electronics' | 'Restaurant' | 'Fashion' | 'Pharmacy';
  image: string;
  imageHint: string;
  userId: string;     // Firebase Auth user.uid of the vendor owner
}

export type AdminVendor = {
  id: string;
  name: string;
  category: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  activeStatus: 'Active' | 'Inactive';
  enabled: boolean;
  vendorId: string;
  email?: string;
  phone?: string;
}

export type AdminRider = {
  id: string;
  name: string;
  vehicle: 'motorcycle' | 'bike' | 'car';
  verificationStatus: 'Verified' | 'Unverified' | 'Rejected';
  onlineStatus: 'Online' | 'Offline';
  enabled: boolean;
  userId: string;
  email?: string;
  phoneNumber?: string;
}

export type Wallet = {
  userId: string;
  balance: number;
  updatedAt: any; // Firestore Timestamp
};

export type Transaction = {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  reference?: string; // Paystack reference
  status: 'pending' | 'success' | 'failed';
  createdAt: any; // Firestore Timestamp
  metadata?: any;
};
