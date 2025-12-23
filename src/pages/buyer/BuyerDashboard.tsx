import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  Download,
  FileText,
  Search,
  Package,
  ExternalLink,
  IndianRupee,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import BuyerLayout from '@/components/layout/BuyerLayout';
import { useAuth } from '@/contexts/AuthContext';
import { formatINR } from '@/lib/mockData';
import { toast } from 'sonner';

export default function BuyerDashboard() {
  const { user, buyerOrders } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const totalSpent = buyerOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalProducts = buyerOrders.length;

  // Filter and sort orders
  const filteredOrders = buyerOrders
    .filter((order) =>
      order.productTitle.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime();
      } else if (sortBy === 'oldest') {
        return new Date(a.purchasedAt).getTime() - new Date(b.purchasedAt).getTime();
      } else if (sortBy === 'price-high') {
        return b.totalAmount - a.totalAmount;
      } else {
        return a.totalAmount - b.totalAmount;
      }
    });

  const handleDownload = (order: typeof buyerOrders[0]) => {
    if (order.downloadCount >= order.maxDownloads) {
      toast.error('Download limit reached. Please contact support.');
      return;
    }
    toast.success(`Downloading ${order.productTitle}...`);
  };

  const handleDownloadInvoice = (order: typeof buyerOrders[0]) => {
    toast.success('Invoice downloaded!');
  };

  return (
    <BuyerLayout>
      {/* Welcome Message */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your purchases
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Package className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Products Purchased</p>
                  <p className="text-2xl font-bold">{totalProducts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                  <IndianRupee className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">{formatINR(totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search your purchases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Bought</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Purchases List */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No purchases yet</h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? 'No purchases match your search'
                : 'Start exploring amazing digital products!'}
            </p>
            <Button asChild>
              <Link to="/">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Product Image */}
                    <div className="w-full md:w-40 h-32 md:h-auto bg-muted flex-shrink-0">
                      {order.productThumbnail ? (
                        <img
                          src={order.productThumbnail}
                          alt={order.productTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 p-4 md:p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground mb-1">
                            {order.productTitle}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Purchased on{' '}
                            {new Date(order.purchasedAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}{' '}
                            • {formatINR(order.totalAmount)}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>by</span>
                            <Link
                              to={`/store/${order.sellerStoreUrl}`}
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              {order.sellerName}
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>

                          {/* Download Progress */}
                          <div className="mt-4 max-w-xs">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Downloads used</span>
                              <span>
                                {order.downloadCount}/{order.maxDownloads}
                              </span>
                            </div>
                            <Progress
                              value={(order.downloadCount / order.maxDownloads) * 100}
                              className="h-1.5"
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row md:flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleDownload(order)}
                            disabled={order.downloadCount >= order.maxDownloads}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadInvoice(order)}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            Invoice
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/my-purchases/${order.id}`}>View Details</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </BuyerLayout>
  );
}
