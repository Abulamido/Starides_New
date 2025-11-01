'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const transactions = [
  { id: 'PAY001', date: '2023-10-26', description: 'Weekly Payout', amount: 350.75, type: 'credit' },
  { id: 'PAY002', date: '2023-10-19', description: 'Weekly Payout', amount: 412.50, type: 'credit' },
  { id: 'PAY003', date: '2023-10-12', description: 'Weekly Payout', amount: 380.00, type: 'credit' },
  { id: 'PAY004', date: '2023-10-05', description: 'Instant Withdraw', amount: -100.00, type: 'debit' },
  { id: 'PAY005', date: '2023-10-05', description: 'Weekly Payout', amount: 450.25, type: 'credit' },
];

export default function RiderEarningsPage() {
  const currentBalance = 763.25;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Earnings</h1>
        <p className="text-muted-foreground">Track your earnings and view payout history.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">${currentBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+ $120.50 this week</p>
          </CardContent>
        </Card>
        <Card className="flex flex-col justify-between">
           <CardHeader>
             <CardTitle>Payout</CardTitle>
           </CardHeader>
           <CardContent className="flex items-center gap-4">
               <Button className="flex-1">
                 Request Payout
               </Button>
           </CardContent>
        </Card>
      </div>
      
      <Card>
          <CardHeader>
              <CardTitle>Payout History</CardTitle>
              <CardDescription>A record of all your earnings and payouts.</CardDescription>
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
                              <TableCell className={`text-right font-semibold ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
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
