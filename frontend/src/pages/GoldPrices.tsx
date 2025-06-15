import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { useCurrentGoldPrices, useHistoricalGoldPrices, useWeeklyGoldPrices } from '@/hooks/useGoldPrices';
import { formatCurrency } from '@/lib/utils';

const chartConfig = {
  price: {
    label: "Price (USD)",
    color: "#D4AF37",
  },
};

const GoldPrices = () => {
  const { currentPrices, loading: pricesLoading } = useCurrentGoldPrices();
  const { historicalData, loading: historicalLoading } = useHistoricalGoldPrices(180); // 6 months
  const { weeklyData, loading: weeklyLoading } = useWeeklyGoldPrices();

  const isPositive = currentPrices?.change24h ? currentPrices.change24h > 0 : false;

  // Loading state for the entire page
  if (pricesLoading && !currentPrices) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gold mb-4" />
        <p className="text-lg">Loading gold price data...</p>
      </div>
    );
  }

  // Use the current prices, fallback to null values if not loaded
  const prices = {
    gold24k: currentPrices?.gold24k || 0,
    gold22k: currentPrices?.gold22k || 0,
    gold18k: currentPrices?.gold18k || 0,
    gold14k: currentPrices?.gold14k || 0,
    change24h: currentPrices?.change24h || 0,
    changePercent: currentPrices?.changePercent || 0
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Live Gold Prices</h1>
          <p className="text-muted-foreground text-lg">
            Stay updated with current gold prices and market trends
          </p>
          {currentPrices?.timestamp && (
            <p className="text-sm text-muted-foreground mt-2">
              Last updated: {new Date(currentPrices.timestamp).toLocaleString()}
            </p>
          )}
        </div>

        {/* Current Prices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">24K Gold</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{formatCurrency(prices.gold24k)}</div>
              <div className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {formatCurrency(Math.abs(prices.change24h))} ({prices.changePercent.toFixed(2)}%)
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">22K Gold</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{formatCurrency(prices.gold22k)}</div>
              <div className="text-sm text-muted-foreground">per oz</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">18K Gold</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{formatCurrency(prices.gold18k)}</div>
              <div className="text-sm text-muted-foreground">per oz</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">14K Gold</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-2xl font-bold">{formatCurrency(prices.gold14k)}</div>
              <div className="text-sm text-muted-foreground">per oz</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Trend</CardTitle>
              <CardDescription>Gold prices over the past week</CardDescription>
            </CardHeader>
            <CardContent>
              {weeklyLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gold" />
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#D4AF37" 
                        strokeWidth={2}
                        dot={{ fill: '#D4AF37', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>

          {/* Historical Chart */}
          <Card>
            <CardHeader>
              <CardTitle>6-Month Historical</CardTitle>
              <CardDescription>24K gold price trends over 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              {historicalLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-gold" />
                </div>
              ) : (
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={['dataMin - 20', 'dataMax + 20']} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#D4AF37" 
                        fill="#D4AF37" 
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Market Information */}
        <Card>
          <CardHeader>
            <CardTitle>Market Information</CardTitle>
            <CardDescription>Important notes about gold pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Understanding Gold Purity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>24K Gold:</strong> 99.9% pure gold, the highest purity available
                </div>
                <div>
                  <strong>22K Gold:</strong> 91.7% pure gold, commonly used in jewelry
                </div>
                <div>
                  <strong>18K Gold:</strong> 75% pure gold, durable for everyday wear
                </div>
                <div>
                  <strong>14K Gold:</strong> 58.3% pure gold, most affordable option
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="text-sm text-muted-foreground">
              <p>
                * Prices are updated in real-time and may fluctuate based on market conditions.
                All prices are per troy ounce (31.1 grams) and displayed in USD.
              </p>
              <p className="mt-2">
                ** Our jewelry pieces are crafted with certified gold purity. 
                Final product pricing includes craftsmanship, design, and current market rates.
              </p>
              <p className="mt-2">
                Data provided by MetalPriceAPI - live precious metals market data.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GoldPrices;
