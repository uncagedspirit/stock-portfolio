import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Eye, EyeOff, Plus, Minus, RefreshCw, Newspaper, Activity, Wallet, AlertCircle } from 'lucide-react';

// API Configuration
const API_BASE = 'http://localhost:5000/api';

// API Service
const apiService = {
  getPortfolio: async () => {
    const response = await fetch(`${API_BASE}/portfolio`);
    if (!response.ok) throw new Error('Failed to fetch portfolio');
    return response.json();
  },
  
  getHoldings: async () => {
    const response = await fetch(`${API_BASE}/portfolio/holdings`);
    if (!response.ok) throw new Error('Failed to fetch holdings');
    return response.json();
  },

  getTransactionHistory: async () => {
    const response = await fetch(`${API_BASE}/portfolio/transactions`);
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return response.json();
  },

  buyStock: async (stockId, quantity, price) => {
    const response = await fetch(`${API_BASE}/portfolio/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockId, quantity, price }),
    });
    if (!response.ok) throw new Error('Failed to buy stock');
    return response.json();
  },

  sellStock: async (stockId, quantity, price) => {
    const response = await fetch(`${API_BASE}/portfolio/sell`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockId, quantity, price }),
    });
    if (!response.ok) throw new Error('Failed to sell stock');
    return response.json();
  },

  getAllStocks: async () => {
    const response = await fetch(`${API_BASE}/stocks`);
    if (!response.ok) throw new Error('Failed to fetch stocks');
    return response.json();
  },

  getStockById: async (id) => {
    const response = await fetch(`${API_BASE}/stocks/${id}`);
    if (!response.ok) throw new Error('Failed to fetch stock');
    return response.json();
  },

  getStockPriceHistory: async (id, days = 30) => {
    const response = await fetch(`${API_BASE}/stocks/${id}/history?days=${days}`);
    if (!response.ok) throw new Error('Failed to fetch price history');
    return response.json();
  },

  getWatchlist: async () => {
    const response = await fetch(`${API_BASE}/watchlist`);
    if (!response.ok) throw new Error('Failed to fetch watchlist');
    return response.json();
  },

  addToWatchlist: async (stockId) => {
    const response = await fetch(`${API_BASE}/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stockId }),
    });
    if (!response.ok) throw new Error('Failed to add to watchlist');
    return response.json();
  },

  removeFromWatchlist: async (stockId) => {
    const response = await fetch(`${API_BASE}/watchlist/${stockId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to remove from watchlist');
    return response.json();
  },

  getLatestNews: async (limit = 20) => {
    const response = await fetch(`${API_BASE}/news?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch news');
    return response.json();
  },

  getNewsByStock: async (symbol, limit = 10) => {
    const response = await fetch(`${API_BASE}/news/stock/${symbol}?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch stock news');
    return response.json();
  }
};

// Utility Functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0);
};

const formatPercent = (percent) => {
  const num = parseFloat(percent) || 0;
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
};

const getChangeColor = (change) => {
  return parseFloat(change) >= 0 ? 'text-green-600' : 'text-red-600';
};

// Loading Component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-8">
    <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-3" />
    <span className="text-lg text-gray-600">{message}</span>
  </div>
);

// Error Component
const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
    <p className="text-red-600 mb-4">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Retry
      </button>
    )}
  </div>
);

// Trade Modal Component
const TradeModal = ({ isOpen, stock, type, onClose, onConfirm }) => {
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!quantity || parseFloat(quantity) <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(parseInt(quantity));
      onClose();
      setQuantity('');
    } catch (error) {
      alert(`Trade failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const totalValue = parseFloat(quantity || 0) * (stock?.current_price || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {type === 'buy' ? 'Buy' : 'Sell'} {stock?.symbol}
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <div className="text-sm text-gray-600">{stock?.company_name}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Price
            </label>
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(stock?.current_price)}
            </div>
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quantity"
              min="1"
              disabled={loading}
            />
          </div>

          {quantity && (
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between text-sm">
                <span>Estimated Total:</span>
                <span className="font-semibold">
                  {formatCurrency(totalValue)}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={() => {
              onClose();
              setQuantity('');
            }}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!quantity || loading}
            className={`flex-1 px-4 py-2 rounded-md text-white disabled:opacity-50 ${
              type === 'buy'
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? 'Processing...' : (type === 'buy' ? 'Buy' : 'Sell')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Portfolio Summary Cards Component
const PortfolioSummaryCards = ({ portfolio }) => {
  const cards = [
    {
      title: 'Total Value',
      value: formatCurrency(portfolio?.totalPortfolioValue),
      icon: DollarSign,
      color: 'text-blue-600'
    },
    {
      title: 'Current Value',
      value: formatCurrency(portfolio?.currentValue),
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'P&L',
      value: formatCurrency(portfolio?.totalPnL),
      icon: portfolio?.totalPnL >= 0 ? TrendingUp : TrendingDown,
      color: getChangeColor(portfolio?.totalPnL),
      subtitle: formatPercent(portfolio?.totalPnLPercent)
    },
    {
      title: 'Cash Balance',
      value: formatCurrency(portfolio?.cashBalance),
      icon: Wallet,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <card.icon className={`h-8 w-8 ${card.color}`} />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
              {card.subtitle && (
                <p className={`text-sm ${card.color}`}>{card.subtitle}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Portfolio Allocation Chart Component
const PortfolioAllocationChart = ({ holdings }) => {
  const chartColors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

  if (!holdings?.data || holdings.data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Allocation</h3>
        <div className="flex items-center justify-center h-300 text-gray-500">
          No holdings data available
        </div>
      </div>
    );
  }

  const pieData = holdings.data.map((holding, index) => ({
    name: holding.symbol,
    value: parseFloat(holding.current_value || 0),
    color: chartColors[index % chartColors.length]
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Allocation</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(value)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Price History Chart Component
const PriceHistoryChart = ({ stocks, onStockSelect }) => {
  const [selectedStock, setSelectedStock] = useState('');
  const [priceHistory, setPriceHistory] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleStockChange = async (stockId) => {
    if (!stockId) {
      setPriceHistory(null);
      setSelectedStock('');
      return;
    }

    setSelectedStock(stockId);
    setLoading(true);
    
    try {
      const response = await apiService.getStockPriceHistory(stockId);
      if (response.success && response.data) {
        const formattedData = response.data.map(item => ({
          date: new Date(item.recorded_at).toLocaleDateString(),
          price: parseFloat(item.price),
          volume: parseInt(item.volume || 0)
        }));
        setPriceHistory(formattedData);
      }
    } catch (error) {
      console.error('Failed to load price history:', error);
      setPriceHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Price History</h3>
        <select
          value={selectedStock}
          onChange={(e) => handleStockChange(e.target.value)}
          className="text-sm border border-gray-300 rounded px-2 py-1"
          disabled={loading}
        >
          <option value="">Select Stock</option>
          {stocks?.data?.map((stock) => (
            <option key={stock.id} value={stock.id}>
              {stock.symbol} - {stock.company_name}
            </option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <LoadingSpinner message="Loading price history..." />
      ) : priceHistory && priceHistory.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={priceHistory}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Line type="monotone" dataKey="price" stroke="#2563EB" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="flex items-center justify-center h-300 text-gray-500">
          {selectedStock ? 'No price history available' : 'Select a stock to view price history'}
        </div>
      )}
    </div>
  );
};

// Holdings Performance Chart Component
const HoldingsPerformanceChart = ({ holdings }) => {
  if (!holdings?.data || holdings.data.length === 0) {
    return null;
  }

  const barData = holdings.data.map(holding => ({
    symbol: holding.symbol,
    pnl_percent: parseFloat(holding.pnl_percent || 0)
  }));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Holdings Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="symbol" />
          <YAxis />
          <Tooltip formatter={(value) => `${value.toFixed(2)}%`} />
          <Bar dataKey="pnl_percent" fill="#10B981" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Holdings Table Component
const HoldingsTable = ({ holdings, onTrade }) => {
  if (!holdings?.data || holdings.data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Holdings</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          No holdings found. Start by buying some stocks!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Your Holdings</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Value</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P&L</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {holdings.data.map((holding) => (
              <tr key={holding.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{holding.symbol}</div>
                    <div className="text-sm text-gray-500">{holding.company_name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{holding.quantity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(holding.average_price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(holding.current_price)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(holding.current_value)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${getChangeColor(holding.unrealized_pnl)}`}>
                    {formatCurrency(holding.unrealized_pnl)}
                  </div>
                  <div className={`text-sm ${getChangeColor(holding.pnl_percent)}`}>
                    {formatPercent(holding.pnl_percent)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onTrade('buy', { ...holding, id: holding.stock_id })}
                    className="text-green-600 hover:text-green-900 mr-3"
                    title="Buy more"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onTrade('sell', { ...holding, id: holding.stock_id })}
                    className="text-red-600 hover:text-red-900"
                    title="Sell"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Trading Table Component
const TradingTable = ({ stocks, onTrade, onAddToWatchlist }) => {
  if (!stocks?.data || stocks.data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Available Stocks</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          No stocks data available
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Available Stocks</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Cap</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.data.map((stock) => (
              <tr key={stock.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                    <div className="text-sm text-gray-500">{stock.company_name}</div>
                    <div className="text-xs text-gray-400">{stock.sector}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(stock.current_price)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${getChangeColor(stock.change_percent)}`}>
                    {formatCurrency(stock.change_amount)} ({formatPercent(stock.change_percent)})
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stock.market_cap ? `$${(stock.market_cap / 1e9).toFixed(1)}B` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onTrade('buy', stock)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => onAddToWatchlist(stock)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Watch
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Watchlist Table Component
const WatchlistTable = ({ watchlist, onTrade, onRemoveFromWatchlist }) => {
  if (!watchlist?.data || watchlist.data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Your Watchlist</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          Your watchlist is empty. Add some stocks to track their performance!
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Your Watchlist</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {watchlist.data.map((stock) => (
              <tr key={stock.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                    <div className="text-sm text-gray-500">{stock.company_name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(stock.current_price)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm ${getChangeColor(stock.change_percent)}`}>
                    {formatCurrency(stock.change_amount)} ({formatPercent(stock.change_percent)})
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onTrade('buy', { ...stock, id: stock.stock_id })}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => onRemoveFromWatchlist(stock.stock_id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center"
                  >
                    <EyeOff className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// News Component
const NewsSection = ({ news }) => {
  if (!news?.data || news.data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Market News</h3>
        <div className="text-center py-8 text-gray-500">
          No news available at the moment.
        </div>
      </div>
    );
  }

  const getSentimentData = () => {
    const total = news.data.length;
    const positive = news.data.filter(n => n.sentiment === 'positive').length;
    const negative = news.data.filter(n => n.sentiment === 'negative').length;
    const neutral = news.data.filter(n => n.sentiment === 'neutral').length;
    
    return {
      positive: ((positive / total) * 100).toFixed(0),
      negative: ((negative / total) * 100).toFixed(0),
      neutral: ((neutral / total) * 100).toFixed(0)
    };
  };

  const sentimentData = getSentimentData();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Market News</h3>
        <div className="space-y-4">
          {news.data.map((article) => (
            <div key={article.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-base font-medium text-gray-900 mb-1">{article.headline}</h4>
                  <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <span>{article.source}</span>
                    <span>{new Date(article.published_at).toLocaleString()}</span>
                    <span className={`px-2 py-1 rounded-full ${
                      article.sentiment === 'positive' 
                        ? 'bg-green-100 text-green-800' 
                        : article.sentiment === 'negative' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {article.sentiment}
                    </span>
                  </div>
                </div>
                <div className={`ml-4 p-2 rounded-full ${
                  article.sentiment === 'positive' 
                    ? 'bg-green-100' 
                    : article.sentiment === 'negative' 
                    ? 'bg-red-100' 
                    : 'bg-gray-100'
                }`}>
                  {article.sentiment === 'positive' ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : article.sentiment === 'negative' ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : (
                    <Newspaper className="h-4 w-4 text-gray-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Overview and Sentiment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Sentiment</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Positive News</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{
                    width: `${sentimentData.positive}%`
                  }}></div>
                </div>
                <span className="text-sm font-medium">{sentimentData.positive}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Neutral News</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-gray-500 h-2 rounded-full" style={{
                    width: `${sentimentData.neutral}%`
                  }}></div>
                </div>
                <span className="text-sm font-medium">{sentimentData.neutral}%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Negative News</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{
                    width: `${sentimentData.negative}%`
                  }}></div>
                </div>
                <span className="text-sm font-medium">{sentimentData.negative}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Gainers Today</h3>
          <div className="space-y-3">
            <div className="text-sm text-gray-500">
              Market overview data would be displayed here based on current stock performance.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const StockPortfolioManager = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState(null);
  const [stocks, setStocks] = useState(null);
  const [watchlist, setWatchlist] = useState(null);
  const [news, setNews] = useState(null);
  const [tradeModal, setTradeModal] = useState({ open: false, type: '', stock: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        portfolioRes,
        holdingsRes,
        stocksRes,
        watchlistRes,
        newsRes
      ] = await Promise.allSettled([
        apiService.getPortfolio(),
        apiService.getHoldings(),
        apiService.getAllStocks(),
        apiService.getWatchlist(),
        apiService.getLatestNews()
      ]);

      // Handle portfolio data
      if (portfolioRes.status === 'fulfilled') {
        setPortfolio(portfolioRes.value.data);
      }

      // Handle holdings data
      if (holdingsRes.status === 'fulfilled') {
        setHoldings(holdingsRes.value);
      }

      // Handle stocks data
      if (stocksRes.status === 'fulfilled') {
        setStocks(stocksRes.value);
      }

      // Handle watchlist data
      if (watchlistRes.status === 'fulfilled') {
        setWatchlist(watchlistRes.value);
      }

      // Handle news data
      if (newsRes.status === 'fulfilled') {
        setNews(newsRes.value);
      }

      // Check if all critical APIs failed
      const criticalApis = [portfolioRes, stocksRes];
      const allCriticalFailed = criticalApis.every(res => res.status === 'rejected');
      
      if (allCriticalFailed) {
        throw new Error('Failed to load critical data. Please check your backend connection.');
      }

    } catch (err) {
      setError(err.message || 'Failed to load data. Please check your connection.');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadInitialData();
  };

  const handleTrade = (type, stock) => {
    setTradeModal({ open: true, type, stock });
  };

  const executeTrade = async (quantity) => {
    try {
      const { type, stock } = tradeModal;
      let result;
      
      if (type === 'buy') {
        result = await apiService.buyStock(stock.id, quantity, stock.current_price);
      } else {
        result = await apiService.sellStock(stock.id, quantity, stock.current_price);
      }

      if (result.success) {
        // Refresh portfolio and holdings data
        const [portfolioRes, holdingsRes] = await Promise.allSettled([
          apiService.getPortfolio(),
          apiService.getHoldings()
        ]);

        if (portfolioRes.status === 'fulfilled') {
          setPortfolio(portfolioRes.value.data);
        }
        if (holdingsRes.status === 'fulfilled') {
          setHoldings(holdingsRes.value);
        }

        alert(`Successfully ${type === 'buy' ? 'bought' : 'sold'} ${quantity} shares of ${stock.symbol}`);
      } else {
        throw new Error(result.message || 'Trade failed');
      }
    } catch (error) {
      console.error('Trade error:', error);
      throw error;
    }
  };

  const addToWatchlist = async (stock) => {
    try {
      const result = await apiService.addToWatchlist(stock.id);
      if (result.success) {
        const updatedWatchlist = await apiService.getWatchlist();
        setWatchlist(updatedWatchlist);
        alert(`${stock.symbol} added to watchlist`);
      } else {
        throw new Error(result.message || 'Failed to add to watchlist');
      }
    } catch (error) {
      alert(`Failed to add to watchlist: ${error.message}`);
    }
  };

  const removeFromWatchlist = async (stockId) => {
    try {
      const result = await apiService.removeFromWatchlist(stockId);
      if (result.success) {
        const updatedWatchlist = await apiService.getWatchlist();
        setWatchlist(updatedWatchlist);
        alert('Stock removed from watchlist');
      } else {
        throw new Error(result.message || 'Failed to remove from watchlist');
      }
    } catch (error) {
      alert(`Failed to remove from watchlist: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner message="Loading portfolio..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <ErrorMessage message={error} onRetry={loadInitialData} />
      </div>
    );
  }

  const navigationItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Activity },
    { id: 'holdings', name: 'Holdings', icon: Wallet },
    { id: 'trading', name: 'Trading', icon: TrendingUp },
    { id: 'watchlist', name: 'Watchlist', icon: Eye },
    { id: 'news', name: 'News', icon: Newspaper }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Portfolio Manager</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Cash: <span className="font-semibold text-gray-900">{formatCurrency(portfolio?.cashBalance)}</span>
              </div>
              <RefreshCw 
                className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" 
                onClick={refreshData}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navigationItems.map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-1 py-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {name}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <PortfolioSummaryCards portfolio={portfolio} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <PortfolioAllocationChart holdings={holdings} />
              <PriceHistoryChart stocks={stocks} />
            </div>

            <HoldingsPerformanceChart holdings={holdings} />
          </div>
        )}

        {/* Holdings */}
        {activeTab === 'holdings' && (
          <HoldingsTable holdings={holdings} onTrade={handleTrade} />
        )}

        {/* Trading */}
        {activeTab === 'trading' && (
          <TradingTable 
            stocks={stocks} 
            onTrade={handleTrade} 
            onAddToWatchlist={addToWatchlist} 
          />
        )}

        {/* Watchlist */}
        {activeTab === 'watchlist' && (
          <WatchlistTable 
            watchlist={watchlist} 
            onTrade={handleTrade} 
            onRemoveFromWatchlist={removeFromWatchlist} 
          />
        )}

        {/* News */}
        {activeTab === 'news' && (
          <NewsSection news={news} />
        )}
      </main>

      {/* Trade Modal */}
      <TradeModal
        isOpen={tradeModal.open}
        stock={tradeModal.stock}
        type={tradeModal.type}
        onClose={() => setTradeModal({ open: false, type: '', stock: null })}
        onConfirm={executeTrade}
      />

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Stock Portfolio Manager - Real-time portfolio tracking and management</p>
            <p className="mt-1">Market data is delayed by 15 minutes</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StockPortfolioManager;
