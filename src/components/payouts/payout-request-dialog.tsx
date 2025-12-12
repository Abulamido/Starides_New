'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { requestPayout } from '@/app/actions/payouts';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface PayoutRequestDialogProps {
    userId: string;
    userType: 'vendor' | 'rider';
    availableBalance: number;
    bankDetails?: {
        bankName: string;
        accountNumber: string;
        accountName: string;
    };
}

export function PayoutRequestDialog({ userId, userType, availableBalance, bankDetails }: PayoutRequestDialogProps) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    // Local state for bank details if not provided
    const [localBankDetails, setLocalBankDetails] = useState({
        bankName: bankDetails?.bankName || '',
        accountNumber: bankDetails?.accountNumber || '',
        accountName: bankDetails?.accountName || '',
    });

    const handleBankChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalBankDetails(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSubmit = async () => {
        const numAmount = parseFloat(amount);

        if (isNaN(numAmount) || numAmount <= 0) {
            toast({
                variant: 'destructive',
                title: 'Invalid Amount',
                description: 'Please enter a valid amount greater than 0.',
            });
            return;
        }

        if (numAmount > availableBalance) {
            toast({
                variant: 'destructive',
                title: 'Insufficient Balance',
                description: `You can only withdraw up to ₦${availableBalance.toFixed(2)}.`,
            });
            return;
        }

        if (!localBankDetails.bankName || !localBankDetails.accountNumber || !localBankDetails.accountName) {
            toast({
                variant: 'destructive',
                title: 'Missing Bank Details',
                description: 'Please fill in all bank details.',
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await requestPayout(userId, userType, numAmount, localBankDetails);

            if (result.success) {
                toast({
                    title: 'Payout Requested',
                    description: 'Your payout request has been submitted successfully.',
                });
                setOpen(false);
                setAmount('');
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to request payout.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button disabled={availableBalance <= 0}>Request Payout</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Request Payout</DialogTitle>
                    <DialogDescription>
                        Enter the amount you wish to withdraw. Available balance: ₦{availableBalance.toFixed(2)}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            Amount
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="col-span-3"
                            placeholder="0.00"
                        />
                    </div>

                    <div className="border-t pt-4 mt-2">
                        <h4 className="mb-4 text-sm font-medium">Bank Details</h4>
                        <div className="grid gap-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="bankName" className="text-right">Bank</Label>
                                <Input
                                    id="bankName"
                                    name="bankName"
                                    value={localBankDetails.bankName}
                                    onChange={handleBankChange}
                                    className="col-span-3"
                                    placeholder="Bank Name"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="accountNumber" className="text-right">Acct No.</Label>
                                <Input
                                    id="accountNumber"
                                    name="accountNumber"
                                    value={localBankDetails.accountNumber}
                                    onChange={handleBankChange}
                                    className="col-span-3"
                                    placeholder="Account Number"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="accountName" className="text-right">Acct Name</Label>
                                <Input
                                    id="accountName"
                                    name="accountName"
                                    value={localBankDetails.accountName}
                                    onChange={handleBankChange}
                                    className="col-span-3"
                                    placeholder="Account Name"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Request'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
