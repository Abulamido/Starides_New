'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Order } from '@/lib/data';

interface ReviewDialogProps {
    order: Order | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onReviewSubmitted?: () => void;
}

export function ReviewDialog({ order, open, onOpenChange, onReviewSubmitted }: ReviewDialogProps) {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Vendor review state
    const [vendorRating, setVendorRating] = useState(0);
    const [vendorHoverRating, setVendorHoverRating] = useState(0);
    const [vendorReview, setVendorReview] = useState('');

    // Rider review state
    const [riderRating, setRiderRating] = useState(0);
    const [riderHoverRating, setRiderHoverRating] = useState(0);
    const [riderReview, setRiderReview] = useState('');

    if (!order) return null;

    const handleSubmit = async () => {
        if (vendorRating === 0) {
            toast({
                variant: 'destructive',
                title: 'Rating Required',
                description: 'Please rate the restaurant before submitting.',
            });
            return;
        }

        if (order.riderId && riderRating === 0) {
            toast({
                variant: 'destructive',
                title: 'Rating Required',
                description: 'Please rate the delivery rider before submitting.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const { submitReview } = await import('@/app/actions/reviews');
            const result = await submitReview({
                orderId: order.id,
                customerId: order.customerId,
                vendorId: order.vendorId,
                riderId: order.riderId,
                vendorRating,
                vendorReview: vendorReview.trim() || undefined,
                riderRating: order.riderId ? riderRating : undefined,
                riderReview: order.riderId && riderReview.trim() ? riderReview.trim() : undefined,
            });

            if (result.success) {
                toast({
                    title: 'Review Submitted',
                    description: 'Thank you for your feedback!',
                });
                onReviewSubmitted?.();
                onOpenChange(false);
                // Reset form
                setVendorRating(0);
                setVendorReview('');
                setRiderRating(0);
                setRiderReview('');
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            console.error('Review submission error:', error);
            toast({
                variant: 'destructive',
                title: 'Submission Failed',
                description: error.message || 'Failed to submit review. Please try again.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const StarRating = ({
        rating,
        hoverRating,
        onRate,
        onHover
    }: {
        rating: number;
        hoverRating: number;
        onRate: (rating: number) => void;
        onHover: (rating: number) => void;
    }) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onRate(star)}
                    onMouseEnter={() => onHover(star)}
                    onMouseLeave={() => onHover(0)}
                    className="transition-transform hover:scale-110"
                >
                    <Star
                        className={`h-8 w-8 ${star <= (hoverRating || rating)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                    />
                </button>
            ))}
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Rate Your Experience</DialogTitle>
                    <DialogDescription>
                        Help others by sharing your experience with this order
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Vendor Rating */}
                    <div className="space-y-3">
                        <div>
                            <Label className="text-base font-semibold">Restaurant Rating</Label>
                            <p className="text-sm text-muted-foreground">How was the food quality?</p>
                        </div>
                        <StarRating
                            rating={vendorRating}
                            hoverRating={vendorHoverRating}
                            onRate={setVendorRating}
                            onHover={setVendorHoverRating}
                        />
                        <Textarea
                            placeholder="Share your thoughts about the food... (optional)"
                            value={vendorReview}
                            onChange={(e) => setVendorReview(e.target.value)}
                            rows={3}
                            maxLength={500}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                            {vendorReview.length}/500
                        </p>
                    </div>

                    {/* Rider Rating (only if order had a rider) */}
                    {order.riderId && (
                        <>
                            <div className="border-t pt-6 space-y-3">
                                <div>
                                    <Label className="text-base font-semibold">Delivery Rider Rating</Label>
                                    <p className="text-sm text-muted-foreground">How was the delivery service?</p>
                                </div>
                                <StarRating
                                    rating={riderRating}
                                    hoverRating={riderHoverRating}
                                    onRate={setRiderRating}
                                    onHover={setRiderHoverRating}
                                />
                                <Textarea
                                    placeholder="Share your thoughts about the delivery... (optional)"
                                    value={riderReview}
                                    onChange={(e) => setRiderReview(e.target.value)}
                                    rows={3}
                                    maxLength={500}
                                />
                                <p className="text-xs text-muted-foreground text-right">
                                    {riderReview.length}/500
                                </p>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
