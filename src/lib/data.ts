import { placeholderImages } from './placeholder-images';

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  imageHint: string;
};

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
    name: 'Smartwatch
',
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
];
