'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, CheckCircle, XCircle, AlertCircle, DollarSign, Calendar, User, Building2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { getAllPayoutRequests, processPayout, type PayoutRequest } from '@/app/actions/payouts';

export default function AdminPayoutsPage() {
    const { toast } = useToast();
    const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [rejectOrderId, setRejectOrderId] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    useEffect(() => {
        fetchPayouts();
    }, []);

    const fetchPayouts = async () => {
        setIsLoading(true);
        try {
            const result = await getAllPayoutRequests();
            if (result.success && result.data) {
                setPayouts(result.data);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: result.error || 'Failed to fetch payouts',
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'An unexpected error occurred',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleProcess = async (id: string, action: 'processed' | 'rejected', notes?: string) => {
        setProcessingId(id);
        try {
            const result = await processPayout(id, action, notes);
            if (result.success) {
                toast({
                    title: `Payout ${action === 'processed' ? 'Approved' : 'Rejected'}`,
                    description: `The payout request has been ${action}.`,
                });
                fetchPayouts(); // Refresh list
                if (action === 'rejected') {
                    setRejectOrderId(null);
                    setRejectReason('');
                }
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: result.error || `Failed to ${action} payout`,
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'An unexpected error occurred',
            });
        } finally {
            setProcessingId(null);
        }
    };

    const pendingPayouts = payouts.filter(p => p.status === 'pending');
    const processedPayouts = payouts.filter(p => p.status === 'processed');
    const rejectedPayouts = payouts.filter(p => p.status === 'rejected');

    const totalPendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

    const PayoutCard = ({ request, showActions = false }: { request: PayoutRequest, showActions?: boolean }) => (
        <Card className="mb-4">
            <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Badge variant={
                                request.status === 'processed' ? 'default' : // Greenish by default or customize
                                    request.status === 'rejected' ? 'destructive' : 'secondary'
                            } className="capitalize">
                                {request.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {request.requestedAt ? format(new Date(request.requestedAt), 'PPP p') : 'N/A'}
                            </span>
                        </div>

                        <div>
                            <div className="text-2xl font-bold flex items-center gap-1">
                                ₦{request.amount.toLocaleString()}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <User className="h-4 w-4" />
                                <span className="capitalize">{request.userType}</span>
                                <span className="text-xs bg-muted px-1.5 py-0.5 rounded">ID: {request.userId.slice(0, 8)}...</span>
                            </div>
                        </div>

                        <div className="bg-muted/50 p-3 rounded-md text-sm space-y-1">
                            <div className="flex items-center gap-2 font-medium mb-1">
                                <Building2 className="h-4 w-4" /> Bank Details
                            </div>
                            <div className="grid grid-cols-[100px_1fr] gap-1">
                                <span className="text-muted-foreground">Bank:</span>
                                <span>{request.bankDetails?.bankName}</span>
                                <span className="text-muted-foreground">Account:</span>
                                <span className="font-mono">{request.bankDetails?.accountNumber}</span>
                                <span className="text-muted-foreground">Name:</span>
                                <span>{request.bankDetails?.accountName}</span>
                            </div>
                        </div>

                        {request.notes && (
                            <div className="text-sm text-muted-foreground bg-red-50 p-2 rounded border border-red-100">
                                <span className="font-medium text-red-800">Rejection Note:</span> {request.notes}
                            </div>
                        )}
                    </div>

                    {showActions && (
                        <div className="flex flex-col gap-2 justify-center min-w-[140px]">
                            <Button
                                className="w-full bg-green-600 hover:bg-green-700"
                                onClick={() => handleProcess(request.id!, 'processed')}
                                disabled={processingId === request.id}
                            >
                                {processingId === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                                Approve
                            </Button>

                            <Dialog open={rejectOrderId === request.id} onOpenChange={(open) => {
                                if (!open) setRejectOrderId(null);
                                else setRejectOrderId(request.id!);
                            }}>
                                <DialogTrigger asChild>
                                    <Button variant="destructive" className="w-full" disabled={processingId === request.id}>
                                        <XCircle className="h-4 w-4 mr-2" />
                                        Reject
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Reject Payout Request</DialogTitle>
                                        <DialogDescription>
                                            Please provide a reason for rejecting this payout request. This will be sent to the user.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="reason">Rejection Reason</Label>
                                            <Textarea
                                                id="reason"
                                                placeholder="e.g., Invalid bank details, Suspicious activity..."
                                                value={rejectReason}
                                                onChange={(e) => setRejectReason(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setRejectOrderId(null)}>Cancel</Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleProcess(request.id!, 'rejected', rejectReason)}
                                            disabled={!rejectReason.trim() || processingId === request.id}
                                        >
                                            {processingId === request.id && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            Confirm Rejection
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Payout Requests</h1>
                <p className="text-muted-foreground">Manage withdrawal requests from vendors and riders</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingPayouts.length}</div>
                        <p className="text-xs text-muted-foreground">
                            ₦{totalPendingAmount.toLocaleString()} total value
                        </p>
                    </CardContent>
                </Card>
                {/* Additional stats could go here */}
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList>
                    <TabsTrigger value="pending">Pending ({pendingPayouts.length})</TabsTrigger>
                    <TabsTrigger value="processed">Processed ({processedPayouts.length})</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected ({rejectedPayouts.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="mt-6">
                    {pendingPayouts.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-muted/10">
                            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500/50" />
                            <p>No pending payout requests!</p>
                        </div>
                    ) : (
                        pendingPayouts.map(request => (
                            <PayoutCard key={request.id} request={request} showActions={true} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="processed" className="mt-6">
                    {processedPayouts.length === 0 ? (
                        <p className="text-center py-12 text-muted-foreground">No processed payouts yet.</p>
                    ) : (
                        processedPayouts.map(request => (
                            <PayoutCard key={request.id} request={request} />
                        ))
                    )}
                </TabsContent>

                <TabsContent value="rejected" className="mt-6">
                    {rejectedPayouts.length === 0 ? (
                        <p className="text-center py-12 text-muted-foreground">No rejected payouts.</p>
                    ) : (
                        rejectedPayouts.map(request => (
                            <PayoutCard key={request.id} request={request} />
                        ))
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
