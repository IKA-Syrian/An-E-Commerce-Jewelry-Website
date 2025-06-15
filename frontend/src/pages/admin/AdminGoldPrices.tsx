
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Plus, TrendingUp, Database } from 'lucide-react';

interface GoldPriceFormData {
  price: number;
  timestamp: string;
  source: string;
}

// Demo data - replace with actual API data
const demoGoldPrices = [
  {
    id: 1,
    timestamp: '2024-06-05T10:00:00',
    price: 2045.50,
    source: 'API Auto-fetch'
  },
  {
    id: 2,
    timestamp: '2024-06-05T09:00:00',
    price: 2043.25,
    source: 'API Auto-fetch'
  },
  {
    id: 3,
    timestamp: '2024-06-05T08:00:00',
    price: 2041.75,
    source: 'Manual Entry'
  },
  {
    id: 4,
    timestamp: '2024-06-04T15:00:00',
    price: 2039.80,
    source: 'API Auto-fetch'
  },
  {
    id: 5,
    timestamp: '2024-06-04T14:00:00',
    price: 2038.90,
    source: 'API Auto-fetch'
  },
];

const AdminGoldPrices = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<GoldPriceFormData>({
    defaultValues: {
      price: 0,
      timestamp: new Date().toISOString().slice(0, 16), // Current datetime for input
      source: 'Manual Entry'
    }
  });

  const onSubmit = async (data: GoldPriceFormData) => {
    try {
      // Handle manual price entry - connect to your API
      console.log('Manual gold price entry:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setIsDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Failed to add gold price:', error);
    }
  };

  const currentPrice = demoGoldPrices[0]?.price || 0;
  const previousPrice = demoGoldPrices[1]?.price || 0;
  const priceChange = currentPrice - previousPrice;
  const priceChangePercent = previousPrice ? ((priceChange / previousPrice) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gold Price Log</h1>
          <p className="text-muted-foreground">View historical gold price data and add manual entries</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Manual Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Manual Gold Price Entry</DialogTitle>
              <DialogDescription>
                Add a manual gold price entry for historical data or API failure backup
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Gram (24K USD)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="2045.50"
                          {...field}
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timestamp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date & Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Manual Entry"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit">
                    <Database className="h-4 w-4 mr-2" />
                    Add Entry
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Current Price Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Current Gold Price (24K)
          </CardTitle>
          <CardDescription>
            Latest price data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div>
              <div className="text-3xl font-bold">${currentPrice.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">per gram</div>
            </div>
            <div className={`flex items-center gap-1 ${
              priceChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className={`h-4 w-4 ${priceChange < 0 ? 'rotate-180' : ''}`} />
              <span className="font-semibold">
                ${Math.abs(priceChange).toFixed(2)} ({Math.abs(priceChangePercent).toFixed(2)}%)
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date(demoGoldPrices[0]?.timestamp).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Price History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Price History ({demoGoldPrices.length} entries)</CardTitle>
          <CardDescription>
            Historical gold price data from API and manual entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Price (USD/gram)</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Change</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoGoldPrices.map((entry, index) => {
                const nextEntry = demoGoldPrices[index + 1];
                const change = nextEntry ? entry.price - nextEntry.price : 0;
                const changePercent = nextEntry ? ((change / nextEntry.price) * 100) : 0;

                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div>
                        <div>{new Date(entry.timestamp).toLocaleDateString()}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(entry.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-semibold">
                      ${entry.price.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${
                        entry.source === 'API Auto-fetch' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {entry.source}
                      </span>
                    </TableCell>
                    <TableCell>
                      {nextEntry ? (
                        <div className={`flex items-center gap-1 ${
                          change >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          <TrendingUp className={`h-3 w-3 ${change < 0 ? 'rotate-180' : ''}`} />
                          <span className="text-sm">
                            ${Math.abs(change).toFixed(2)} ({Math.abs(changePercent).toFixed(2)}%)
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGoldPrices;
