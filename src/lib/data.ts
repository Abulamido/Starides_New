
import { placeholderImages } from './placeholder-images';

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  imageHint: string;
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
  menu: Product[];
}

export type AdminVendor = {
  id: string;
  name: string;
  category: string;
  approvalStatus: 'Pending' | 'Approved';
  activeStatus: 'Active' | 'Inactive';
  enabled: boolean;
}

export type AdminRider = {
  id: string;
  name: string;
  vehicle: 'motorcycle' | 'bike' | 'car';
  verificationStatus: 'Verified' | 'Unverified';
  onlineStatus: 'Online' | 'Offline';
  enabled: boolean;
}


const getImageUrl = (id: string) =>
  placeholderImages.find((img) => img.id === id)?.imageUrl ||
  'https://placehold.co/400x400';
const getImageHint = (id: string) =>
  placeholderImages.find((img) => img.id === id)?.imageHint ||
  'product';

export const mockProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Wireless Headphones',
    price: 99.99,
    category: 'Electronics',
    image: getImageUrl('product-1'),
    imageHint: getImageHint('product-1'),
  },
  {
    id: 'prod-002',
    name: 'Smartwatch',
    price: 199.99,
    category: 'Electronics',
    image: getImageUrl('product-2'),
    imageHint: getImageHint('product-2'),
  },
  {
    id: 'prod-003',
    name: 'Professional Camera',
    price: 799.99,
    category: 'Electronics',
    image: getImageUrl('product-3'),
    imageHint: getImageHint('product-3'),
  },
  {
    id: 'prod-004',
    name: 'Running Shoes',
    price: 120.0,
    category: 'Fashion',
    image: getImageUrl('product-4'),
    imageHint: getImageHint('product-4'),
  },
  {
    id: 'prod-005',
    name: 'Leather Backpack',
    price: 150.5,
    category: 'Accessories',
    image: getImageUrl('product-5'),
    imageHint: getImageHint('product-5'),
  },
  {
    id: 'prod-006',
    name: 'Coffee Maker',
    price: 85.0,
    category: 'Home Goods',
    image: getImageUrl('product-6'),
    imageHint: getImageHint('product-6'),
  },
  {
    id: 'prod-007',
    name: 'Camera Drone',
    price: 499.0,
    category: 'Electronics',
    image: getImageUrl('product-7'),
    imageHint: getImageHint('product-7'),
  },
  {
    id: 'prod-008',
    name: 'Fountain Pen',
    price: 65.0,
    category: 'Office',
    image: getImageUrl('product-8'),
    imageHint: getImageHint('product-8'),
  },
  {
    id: 'prod-009',
    name: 'Jollof Rice with Chicken',
    price: 15.00,
    category: 'Food',
    image: 'https://picsum.photos/seed/jollof/400/400',
    imageHint: 'jollof rice',
  },
  {
    id: 'prod-010',
    name: 'Fried Rice with Plantain',
    price: 12.00,
    category: 'Food',
    image: 'https://picsum.photos/seed/friedrice/400/400',
    imageHint: 'fried rice',
  },
  {
    id: 'prod-011',
    name: 'Beef Shawarma',
    price: 8.00,
    category: 'Food',
    image: 'https://picsum.photos/seed/shawarma/400/400',
    imageHint: 'shawarma wrap',
  },
];


export const mockVendors: Vendor[] = [
  {
    id: 'vendor-001',
    name: 'Fresh Market Grocery',
    description: 'Your daily fresh produce and groceries delivered fast',
    rating: 4.5,
    reviewCount: 189,
    category: 'Grocery',
    image: getImageUrl('vendor-grocery'),
    imageHint: getImageHint('vendor-grocery'),
    menu: [],
  },
  {
    id: 'vendor-002',
    name: 'TechHub Electronics',
    description: 'Latest gadgets and electronics at competitive prices',
    rating: 4.8,
    reviewCount: 312,
    category: 'Electronics',
    image: getImageUrl('vendor-electronics'),
    imageHint: getImageHint('vendor-electronics'),
    menu: [mockProducts[0], mockProducts[1], mockProducts[2], mockProducts[6]],
  },
  {
    id: 'vendor-003',
    name: 'Golden Spoon Restaurant',
    description: 'Premium fine dining experience with international cuisine',
    rating: 4.7,
    reviewCount: 234,
    category: 'Restaurant',
    image: getImageUrl('vendor-restaurant'),
    imageHint: getImageHint('vendor-restaurant'),
    menu: [],
  },
    {
    id: 'vendor-004',
    name: 'GreenLeaf Pharmacy',
    description: 'All your health and wellness needs, delivered to you.',
    rating: 4.9,
    reviewCount: 450,
    category: 'Pharmacy',
    image: getImageUrl('vendor-pharmacy'),
    imageHint: getImageHint('vendor-pharmacy'),
    menu: [],
  },
  {
    id: 'vendor-005',
    name: 'Vogue Threads',
    description: 'The latest trends in fashion and apparel.',
    rating: 4.6,
    reviewCount: 288,
    category: 'Fashion',
    image: getImageUrl('vendor-fashion'),
    imageHint: getImageHint('vendor-fashion'),
    menu: [mockProducts[3], mockProducts[4]],
  },
  {
    id: 'vendor-006',
    name: 'The Noodle House',
    description: 'Authentic asian cuisine and noodle dishes.',
    rating: 4.7,
    reviewCount: 512,
    category: 'Restaurant',
    image: getImageUrl('vendor-restaurant-2'),
    imageHint: getImageHint('vendor-restaurant-2'),
    menu: [],
  },
  {
    id: 'vendor-007',
    name: 'ABU EATS',
    description: 'Delicious Nigerian Dishes.',
    rating: 4.9,
    reviewCount: 1024,
    category: 'Restaurant',
    image: 'https://picsum.photos/seed/abueats/600/400',
    imageHint: 'nigerian food',
    menu: [mockProducts[8], mockProducts[9], mockProducts[10]],
  },
];

export const mockAdminVendors: AdminVendor[] = [
    { id: 'v001', name: 'Burger Palace', category: 'restaurant', approvalStatus: 'Pending', activeStatus: 'Active', enabled: true },
    { id: 'v002', name: 'Fresh Market Grocery', category: 'grocery', approvalStatus: 'Approved', activeStatus: 'Active', enabled: true },
    { id: 'v003', name: 'TechHub Electronics', category: 'electronics', approvalStatus: 'Approved', activeStatus: 'Active', enabled: true },
    { id: 'v004', name: 'Golden Spoon Restaurant', category: 'restaurant', approvalStatus: 'Approved', activeStatus: 'Active', enabled: true },
    { id: 'v005', name: 'Wellness Pharmacy', category: 'pharmacy', approvalStatus: 'Approved', activeStatus: 'Inactive', enabled: false },
    { id: 'v006', name: 'ABU EATS', category: 'restaurant', approvalStatus: 'Approved', activeStatus: 'Active', enabled: true },
];

export const mockAdminRiders: AdminRider[] = [
    { id: 'r001', name: 'Michael Johnson', vehicle: 'motorcycle', verificationStatus: 'Verified', onlineStatus: 'Online', enabled: true },
    { id: 'r002', name: 'David Martinez', vehicle: 'car', verificationStatus: 'Verified', onlineStatus: 'Offline', enabled: false },
    { id: 'r003', name: 'Sarah Williams', vehicle: 'bike', verificationStatus: 'Verified', onlineStatus: 'Online', enabled: true },
    { id: 'r004', name: 'Emma Thompson', vehicle: 'motorcycle', verificationStatus: 'Verified', onlineStatus: 'Offline', enabled: false },
    { id: 'r005', name: 'Abu', vehicle: 'bike', verificationStatus: 'Verified', onlineStatus: 'Online', enabled: true },
    { id: 'r006', name: 'James Rodriguez', vehicle: 'motorcycle', verificationStatus: 'Verified', onlineStatus: 'Online', enabled: true },
];
