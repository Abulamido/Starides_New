'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const transactions = [
  { id: 'TRN001', date: '2023-10-26', description: 'Product Purchase - ORD001', amount: -129.98, type: 'debit' },
  { id: 'TRN002', date: '2023-10-25', description: 'Wallet Top-up', amount: 200.00, type: 'credit' },
  { id: 'TRN003', date: '2023-10-24', description: 'Product Purchase - ORD002', amount: -85.00, type: 'debit' },
  { id: 'TRN004', date: '2023-10-20', description: 'Refund for return', amount: 99.99, type: 'credit' },
  { id: 'TRN005', date: '2023-10-18', description: 'Product Purchase - ORD004', amount: -270.50, type: 'debit' },
];

export default function WalletPage() {
  const currentBalance = 514.51;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Wallet</h1>
        <p className="text-muted-foreground">Manage your balance and view transaction history.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">${currentBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="flex flex-col justify-between">
           <CardHeader>
             <CardTitle>Quick Actions</CardTitle>
           </CardHeader>
           <CardContent className="flex items-center gap-4">
               <Button className="flex-1">
                 <Plus className="mr-2 h-4 w-4" /> Add Funds
               </Button>
               <Button variant="secondary" className="flex-1">
                 Withdraw
               </Button>
           </CardContent>
        </Card>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>A record of all your wallet transactions.</CardDescription>
          </CardHeader>
          <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Transaction ID</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {transactions.map(tx => (
                          <TableRow key={tx.id}>
                              <TableCell className="font-medium">{tx.id}</TableCell>
                              <TableCell>{tx.date}</TableCell>
                              <TableCell>{tx.description}</TableCell>
                              <TableCell className={`text-right font-semibold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                                  <div className='flex items-center justify-end gap-2'>
                                  {tx.type === 'credit' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                                  ${Math.abs(tx.amount).toFixed(2)}
                                  </div>
                              </TableCell>
                          </TableRow>
                      ))}
                  </TableBody>
              </Table>
          </CardContent>
      </Card>

    </div>
  );
}
