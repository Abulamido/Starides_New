'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/data';
import { useFirestore } from '@/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ImageUpload } from '@/components/image-upload';

const productSchema = z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().min(0.01, 'Price must be greater than 0'),
    category: z.string().min(1, 'Category is required'),
    image: z.string().optional(),
    available: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vendorId: string;
    product?: Product;
}

export function ProductFormDialog({
    open,
    onOpenChange,
    vendorId,
    product,
}: ProductFormDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState(product?.image || '');
    const { toast } = useToast();
    const firestore = useFirestore();

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: product
            ? {
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                image: product.image || '',
                available: product.available ?? true,
            }
            : {
                name: '',
                description: '',
                price: 0,
                category: '',
                image: '',
                available: true,
            },
    });

    async function onSubmit(values: ProductFormValues) {
        if (!firestore) return;

        setIsLoading(true);
        try {
            const productData = {
                ...values,
                image: uploadedImage || `https://api.dicebear.com/7.x/shapes/svg?seed=${values.name}`,
                imageHint: `${values.category} product`,
                updatedAt: serverTimestamp(),
            };

            if (product) {
                // Update existing product
                await updateDoc(doc(firestore, 'products', product.id), productData);
                toast({
                    title: 'Product updated',
                    description: 'Your product has been updated successfully.',
                });
            } else {
                // Create new product
                await addDoc(collection(firestore, 'products'), {
                    ...productData,
                    vendorId,
                    createdAt: serverTimestamp(),
                });
                toast({
                    title: 'Product created',
                    description: 'Your product has been added successfully.',
                });
            }

            onOpenChange(false);
            form.reset();
            setUploadedImage('');
        } catch (error: any) {
            console.error('Error saving product:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to save product.',
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{product ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                    <DialogDescription>
                        {product
                            ? 'Update your product information.'
                            : 'Add a new product to your restaurant.'}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <ImageUpload
                            onImageUploaded={setUploadedImage}
                            currentImageUrl={uploadedImage}
                            path="products"
                            label="Product Image"
                        />

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Fresh Tomatoes" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Describe your product..."
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price (₦)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="African">African</SelectItem>
                                                <SelectItem value="Fast Food">Fast Food</SelectItem>
                                                <SelectItem value="Continental">Continental</SelectItem>
                                                <SelectItem value="Desserts">Desserts</SelectItem>
                                                <SelectItem value="Drinks">Drinks</SelectItem>
                                                <SelectItem value="Healthy">Healthy</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {product ? 'Update Product' : 'Add Product'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
