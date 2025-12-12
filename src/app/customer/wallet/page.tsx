'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCollection, useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, doc } from 'firebase/firestore';
import { Loader2, Wallet, CreditCard, Plus, ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { Order, Wallet as WalletType, Transaction } from '@/lib/data';
import { PaystackButton } from 'react-paystack';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { verifyTopUp } from '@/app/actions/wallet';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PAYSTACK_PUBLIC_KEY } from '@/config/paystack';

export default function CustomerWalletPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  // Query wallet
  const walletRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'wallets', user.uid);
  }, [firestore, user]);

  const { data: wallet, isLoading: isWalletLoading } = useDoc<WalletType>(walletRef);

  // Query transactions
  const transactionsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
  }, [firestore, user]);

  const { data: transactions, isLoading: isTransactionsLoading } = useCollection<Transaction>(transactionsQuery);

  const handlePaystackSuccess = async (reference: any) => {
    try {
      toast({
        title: 'Verifying Transaction',
        description: 'Please wait while we verify your payment...',
      });

      const result = await verifyTopUp(reference.reference, user!.uid);

      if (result.success) {
        toast({
          title: 'Success!',
          description: `Wallet funded with ₦${result.newBalance?.toLocaleString()}`,
          className: 'bg-green-500 text-white',
        });
        setIsTopUpOpen(false);
        setTopUpAmount('');
      } else {
        toast({
          variant: 'destructive',
          title: 'Verification Failed',
          description: result.message,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong verifying your transaction.',
      });
    }
  };

  const handlePaystackClose = () => {
    console.log('Paystack closed');
  };

  const paystackConfig = {
    reference: (new Date()).getTime().toString(),
    email: user?.email || '',
    amount: (parseFloat(topUpAmount) || 0) * 100, // Paystack expects kobo
    publicKey: PAYSTACK_PUBLIC_KEY,
    channels: ['card'], // Force only card channel to be active
    metadata: {
      custom_fields: [
        {
          display_name: "Purpose",
          variable_name: "purpose",
          value: "Wallet Top-up"
        }
      ]
    }
  };

  if (isUserLoading || isWalletLoading || isTransactionsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const walletBalance = wallet?.balance || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
        <p className="text-muted-foreground">Manage your payment methods and balance</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Balance Card */}
        <Card className="bg-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="text-sm font-medium opacity-90">Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">₦{walletBalance.toLocaleString()}</div>

            <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="w-full sm:w-auto gap-2">
                  <Plus className="h-4 w-4" />
                  Top Up Wallet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Top Up Wallet</DialogTitle>
                  <DialogDescription>Enter the amount you want to add to your wallet.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (₦)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="e.g. 5000"
                      value={topUpAmount}
                      onChange={(e) => setTopUpAmount(e.target.value)}
                    />
                  </div>

                  {parseFloat(topUpAmount) > 0 && (
                    <PaystackButton
                      {...paystackConfig}
                      text="Pay Now"
                      onSuccess={handlePaystackSuccess}
                      onClose={handlePaystackClose}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium"
                    />
                  )}
                </div>
              </DialogContent>
            </Dialog>

          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Manage your saved cards</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <SavedCardsList userId={user?.uid} />
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent payments and top-ups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions?.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${transaction.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                    {transaction.type === 'credit' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.createdAt?.toDate ? format(transaction.createdAt.toDate(), 'PPP p') : 'Date N/A'}
                    </p>
                  </div>
                </div>
                <p className={`font-medium ${transaction.type === 'credit' ? 'text-green-600' : 'text-foreground'}`}>
                  {transaction.type === 'credit' ? '+' : '-'}₦{transaction.amount.toLocaleString()}
                </p>
              </div>
            ))}

            {(!transactions || transactions.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No transactions yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SavedCardsList({ userId }: { userId?: string }) {
  const firestore = useFirestore();

  const cardsQuery = useMemoFirebase(() => {
    if (!firestore || !userId) return null;
    return query(collection(firestore, 'users', userId, 'savedCards'), orderBy('updatedAt', 'desc'));
  }, [firestore, userId]);

  const { data: cards, isLoading } = useCollection<any>(cardsQuery);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading cards...</div>;
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-4 border rounded-lg border-dashed">
        <CreditCard className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
        <p className="text-sm text-muted-foreground">No saved cards found.</p>
        <p className="text-xs text-muted-foreground mt-1">Top up your wallet to save a card automatically.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map((card) => (
        <div key={card.id} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-muted rounded-full flex items-center justify-center">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium capitalize">{card.brand} •••• {card.last4}</p>
              <p className="text-xs text-muted-foreground uppercase">{card.bank}</p>
            </div>
          </div>
          <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">Saved</span>
        </div>
      ))}
    </div>
  );
}
