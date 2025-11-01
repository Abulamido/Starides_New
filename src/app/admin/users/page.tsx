
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";

const mockUsers = [
    { id: 'user-001', name: 'John Doe', email: 'john@example.com', role: 'Customer', joined: '2023-10-01' },
    { id: 'user-002', name: 'Jane Smith', email: 'jane@example.com', role: 'Customer', joined: '2023-10-05' },
    { id: 'user-003', name: 'Abubakar Lamido', email: 'lamido665@gmail.com', role: 'Admin', joined: '2023-09-15' },
    { id: 'user-004', name: 'Vendor One', email: 'vendor1@example.com', role: 'Vendor', joined: '2023-09-20' },
    { id: 'user-005', name: 'Rider One', email: 'rider1@example.com', role: 'Rider', joined: '2023-09-22' },
];


export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
        <p className="text-muted-foreground">
          View and manage all customer, vendor, and rider accounts.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search users by name, email or role..."
          className="w-full pl-10"
        />
      </div>

       <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>A list of all users on the platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Date Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                  <TableCell>{user.joined}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
