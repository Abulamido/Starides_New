'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { MoreVertical, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import type { Product } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useFirestore } from '@/firebase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';

interface VendorProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
}

export function VendorProductCard({ product, onEdit }: VendorProductCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    async function handleDelete() {
        if (!firestore) return;

        setIsDeleting(true);
        try {
            await deleteDoc(doc(firestore, 'products', product.id));
            toast({
                title: 'Product deleted',
                description: 'The product has been removed from your restaurant.',
            });
            setShowDeleteDialog(false);
        } catch (error: any) {
            console.error('Delete error:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to delete product.',
            });
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleToggleAvailability() {
        if (!firestore) return;

        setIsTogglingAvailability(true);
        try {
            await updateDoc(doc(firestore, 'products', product.id), {
                available: !product.available,
            });
            toast({
                title: product.available ? 'Product hidden' : 'Product available',
                description: product.available
                    ? 'This product is now hidden from customers.'
                    : 'This product is now visible to customers.',
            });
        } catch (error: any) {
            console.error('Toggle error:', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to update product.',
            });
        } finally {
            setIsTogglingAvailability(false);
        }
    }

    return (
        <>
            <Card className="overflow-hidden">
                <div className="relative aspect-[3/4] md:aspect-square">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                    {!product.available && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="secondary">Unavailable</Badge>
                        </div>
                    )}
                </div>
                <CardContent className="p-2 md:p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm md:text-base font-semibold truncate">{product.name}</h3>
                            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mt-0.5 md:mt-1">
                                {product.description}
                            </p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-7 w-7 md:h-8 md:w-8 shrink-0">
                                    <MoreVertical className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onEdit(product)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={handleToggleAvailability}
                                    disabled={isTogglingAvailability}
                                >
                                    {product.available ? (
                                        <>
                                            <EyeOff className="mr-2 h-4 w-4" />
                                            Mark Unavailable
                                        </>
                                    ) : (
                                        <>
                                            <Eye className="mr-2 h-4 w-4" />
                                            Mark Available
                                        </>
                                    )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="text-destructive"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="mt-2 md:mt-3 flex items-center justify-between">
                        <span className="text-base md:text-lg font-bold">₦{product.price.toLocaleString()}</span>
                        <Badge variant="outline" className="text-[10px] md:text-xs">{product.category}</Badge>
                    </div>
                </CardContent>
            </Card>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{product.name}"? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
