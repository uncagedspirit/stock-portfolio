import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Eye, EyeOff, Plus, Minus, RefreshCw, Newspaper, Activity, Wallet } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

// API service functions
const apiService = {
  // Portfolio endpoints
  getPortfolio: async () => {
    const response = await fetch(`${API_BASE}/portfolio`);
    return response.json();
  },
  
  getHoldings: async () => {
    const response = await fetch(`${API_BASE}/portfolio/holdings`);
    return response.json();
  },

  getTransactionHistory: async () => {
    const response = await fetch(`${API_BASE}/portfolio/transactions`);
    return response.json();
  },

  buyStock: async (stockId, quantity) => {
    const response = await fetch(`${API_BASE}/portfolio/buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stockId, quantity }),
    });
    return response.json();
  },

  sellStock: async (stockId, quantity) => {
    const response = await fetch(`${API_BASE}/portfolio/sell`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stockId, quantity }),
    });
    return response.json();
  },

  // Stock endpoints
  getAllStocks: async () => {
    const response = await fetch(`${API_BASE}/stocks`);
    return response.json();
  },

  getStockById: async (id) => {
    const response = await fetch(`${API_BASE}/stocks/${id}`);
    return response.json();
  },

  getStockPriceHistory: async (id) => {
    const response = await fetch(`${API_BASE}/stocks/${id}/history`);
    return response.json();
  },

  // Watchlist endpoints
  getWatchlist: async () => {
    const response = await fetch(`${API_BASE}/watchlist`);
    return response.json();
  },

  addToWatchlist: async (stockId) => {
    const response = await fetch(`${API_BASE}/watchlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ stockId }),
    });
    return response.json();
  },

  removeFromWatchlist: async (stockId) => {
    const response = await fetch(`${API_BASE}/watchlist/${stockId}`, {
      method: 'DELETE',
    });
    return response.json();
  },

  // News endpoints
  getLatestNews: async () => {
    const response = await fetch(`${API_BASE}/news`);
    return response.json();
  },

  getNewsByStock: async (symbol) => {
    const response = await fetch(`${API_BASE}/news/stock/${symbol}`);
    return response.json();
  }
};

const StockPortfolioManager = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [news, setNews] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeModal, setTradeModal] = useState({ open: false, type: '', stock: null });
  const [tradeQuantity, setTradeQuantity] = useState('');
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
        portfolioData,
        holdingsData,
        stocksData,
        watchlistData,
        newsData
      ] = await Promise.all([
        apiService.getPortfolio().catch(err => ({ error: err.message })),
        apiService.getHoldings().catch(err => ({ error: err.message })),
        apiService.getAllStocks().catch(err => ({ error: err.message })),
        apiService.getWatchlist().catch(err => ({ error: err.message })),
        apiService.getLatestNews().catch(err => ({ error: err.message }))
      ]);

      if (!portfolioData.error) setPortfolio(portfolioData);
      if (!holdingsData.error) setHoldings(holdingsData);
      if (!stocksData.error) setStocks(stocksData);
      if (!watchlistData.error) setWatchlist(watchlistData);
      if (!newsData.error) setNews(newsData);

      // Load price history for first stock if available
      if (stocksData && stocksData.length > 0 && !stocksData.error) {
        const historyData = await apiService.getStockPriceHistory(stocksData[0].id).catch(err => ({ error: err.message }));
        if (!historyData.error) setPriceHistory(historyData);
      }
    } catch (err) {
      setError('Failed to load data. Please check your connection.');
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await loadInitialData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (percent) => {
    return `${percent >= 0 ? '+' : ''}${percent}%`;
  };

  const getChangeColor = (change) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const handleTrade = async (type, stock) => {
    setTradeModal({ open: true, type, stock });
  };

  const executeTrade = async () => {
    if (!tradeQuantity || !tradeModal.stock) return;
    
    try {
      const quantity = parseInt(tradeQuantity);
      let result;
      
      if (tradeModal.type === 'buy') {
        result = await apiService.buyStock(tradeModal.stock.id, quantity);
      } else {
        result = await apiService.sellStock(tradeModal.stock.id, quantity);
      }

      if (result.success || result.message) {
        alert(`Successfully ${tradeModal.type === 'buy' ? 'bought' : 'sold'} ${quantity} shares of ${tradeModal.stock.symbol}`);
        // Refresh portfolio and holdings data
        const [portfolioData, holdingsData] = await Promise.all([
          apiService.getPortfolio(),
          apiService.getHoldings()
        ]);
        setPortfolio(portfolioData);
        setHoldings(holdingsData);
      } else {
        throw new Error(result.error || 'Trade failed');
      }
    } catch (error) {
      alert(`Trade failed: ${error.message}`);
    } finally {
      setTradeModal({ open: false, type: '', stock: null });
      setTradeQuantity('');
    }
  };

  const addToWatchlist = async (stock) => {
    try {
      const result = await apiService.addToWatchlist(stock.id);
      if (result.success || result.message) {
        const updatedWatchlist = await apiService.getWatchlist();
        setWatchlist(updatedWatchlist);
      } else {
        throw new Error(result.error || 'Failed to add to watchlist');
      }
    } catch (error) {
      alert(`Failed to add to watchlist: ${error.message}`);
    }
  };

  const removeFromWatchlist = async (stockId) => {
    try {
      const result = await apiService.removeFromWatchlist(stockId);
      if (result.success || result.message) {
        const updatedWatchlist = await apiService.getWatchlist();
        setWatchlist(updatedWatchlist);
      } else {
        throw new Error(result.error || 'Failed to remove from watchlist');
      }
    } catch (error) {
      alert(`Failed to remove from watchlist: ${error.message}`);
    }
  };

  const loadStockPriceHistory = async (stockId) => {
    try {
      const historyData = await apiService.getStockPriceHistory(stockId);
      setPriceHistory(historyData);
      setSelectedStock(stockId);
    } catch (error) {
      console.error('Failed to load price history:', error);
    }
  };

  const chartColors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg">Loading portfolio...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={loadInitialData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
                Cash: <span className="font-semibold text-gray-900">{formatCurrency(portfolio?.cashBalance || 0)}</span>
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
            {[
              { id: 'dashboard', name: 'Dashboard', icon: Activity },
              { id: 'holdings', name: 'Holdings', icon: Wallet },
              { id: 'trading', name: 'Trading', icon: TrendingUp },
              { id: 'watchlist', name: 'Watchlist', icon: Eye },
              { id: 'news', name: 'News', icon: Newspaper }
            ].map(({ id, name, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center px-1 py-4 border-b-2 text-sm font-medium ${
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
            {/* Portfolio Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolio?.totalPortfolioValue || 0)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Current Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolio?.currentValue || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className={`h-8 w-8 ${(portfolio?.totalPnL || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">P&L</p>
                    <p className={`text-2xl font-bold ${getChangeColor(portfolio?.totalPnL || 0)}`}>
                      {formatCurrency(portfolio?.totalPnL || 0)}
                    </p>
                    <p className={`text-sm ${getChangeColor(portfolio?.totalPnLPercent || 0)}`}>
                      {formatPercent(portfolio?.totalPnLPercent || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Wallet className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Cash Balance</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolio?.cashBalance || 0)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Portfolio Allocation */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Allocation</h3>
                {holdings && holdings.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={holdings.map((holding, index) => ({
                          name: holding.symbol,
                          value: parseFloat(holding.current_value || holding.currentValue || 0),
                          color: chartColors[index % chartColors.length]
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {holdings.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-300 text-gray-500">
                    No holdings data available
                  </div>
                )}
              </div>

              {/* Price History Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Price History</h3>
                  <select
                    onChange={(e) => loadStockPriceHistory(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="">Select Stock</option>
                    {stocks.map((stock) => (
                      <option key={stock.id} value={stock.id}>
                        {stock.symbol}
                      </option>
                    ))}
                  </select>
                </div>
                {priceHistory && priceHistory.length > 0 ? (
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
                    Select a stock to view price history
                  </div>
                )}
              </div>
            </div>

            {/* Holdings Performance */}
            {holdings && holdings.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Holdings Performance</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={holdings}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="symbol" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatPercent(value)} />
                    <Bar dataKey="pnl_percent" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Holdings */}
        {activeTab === 'holdings' && (
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
                  {holdings?.map((holding) => (
                    <tr key={holding.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{holding.symbol}</div>
                          <div className="text-sm text-gray-500">{holding.company_name || holding.companyName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{holding.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(holding.average_price || holding.averagePrice || 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(holding.current_price || holding.currentPrice || 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(holding.current_value || holding.currentValue || 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${getChangeColor(holding.unrealized_pnl || holding.unrealizedPnl || 0)}`}>
                          {formatCurrency(holding.unrealized_pnl || holding.unrealizedPnl || 0)}
                        </div>
                        <div className={`text-sm ${getChangeColor(holding.pnl_percent || holding.pnlPercent || 0)}`}>
                          {formatPercent(holding.pnl_percent || holding.pnlPercent || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleTrade('buy', holding)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleTrade('sell', holding)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!holdings || holdings.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No holdings found. Start by buying some stocks!
                </div>
              )}
            </div>
          </div>
        )}

        {/* Trading */}
        {activeTab === 'trading' && (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stocks.map((stock) => (
                    <tr key={stock.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                          <div className="text-sm text-gray-500">{stock.company_name || stock.companyName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(stock.current_price || stock.currentPrice || 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${getChangeColor(stock.change_percent || stock.changePercent || 0)}`}>
                          {formatCurrency(stock.change_amount || stock.changeAmount || 0)} ({formatPercent(stock.change_percent || stock.changePercent || 0)})
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleTrade('buy', stock)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Buy
                        </button>
                        <button
                          onClick={() => addToWatchlist(stock)}
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
        )}

        {/* Watchlist */}
        {activeTab === 'watchlist' && (
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
                  {watchlist.map((stock) => (
                    <tr key={stock.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                          <div className="text-sm text-gray-500">{stock.company_name || stock.companyName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(stock.current_price || stock.currentPrice || 0)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${getChangeColor(stock.change_percent || stock.changePercent || 0)}`}>
                          {formatCurrency(stock.change_amount || stock.changeAmount || 0)} ({formatPercent(stock.change_percent || stock.changePercent || 0)})
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleTrade('buy', stock)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Buy
                        </button>
                        <button
                          onClick={() => removeFromWatchlist(stock.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                        >
                          <EyeOff className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!watchlist || watchlist.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  Your watchlist is empty. Add some stocks to track their performance!
                </div>
              )}
            </div>
          </div>
        )}

        {/* News */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Latest Market News</h3>
              <div className="space-y-4">
                {news.map((article) => (
                  <div key={article.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-base font-medium text-gray-900 mb-1">{article.headline}</h4>
                        <p className="text-sm text-gray-600 mb-2">{article.summary}</p>
                        <div className="flex items-center text-xs text-gray-500 space-x-4">
                          <span>{article.source}</span>
                          <span>{new Date(article.published_at || article.publishedAt).toLocaleString()}</span>
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
                {(!news || news.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No news available at the moment.
                  </div>
                )}
              </div>
            </div>

            {/* Market Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Gainers</h3>
                <div className="space-y-3">
                  {stocks
                    .filter(stock => (stock.change_percent || stock.changePercent || 0) > 0)
                    .sort((a, b) => (b.change_percent || b.changePercent || 0) - (a.change_percent || a.changePercent || 0))
                    .slice(0, 5)
                    .map(stock => (
                      <div key={stock.id} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">{stock.symbol}</div>
                          <div className="text-sm text-gray-500">{formatCurrency(stock.current_price || stock.currentPrice || 0)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-600 font-medium">
                            +{formatPercent(stock.change_percent || stock.changePercent || 0)}
                          </div>
                          <div className="text-sm text-green-600">
                            +{formatCurrency(stock.change_amount || stock.changeAmount || 0)}
                          </div>
                        </div>
                      </div>
                    ))}
                  {stocks.filter(stock => (stock.change_percent || stock.changePercent || 0) > 0).length === 0 && (
                    <div className="text-gray-500 text-sm">No gainers today</div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Sentiment</h3>
                <div className="space-y-4">
                  {news.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Positive News</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-green-500 h-2 rounded-full" style={{
                              width: `${(news.filter(n => n.sentiment === 'positive').length / news.length * 100)}%`
                            }}></div>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.round(news.filter(n => n.sentiment === 'positive').length / news.length * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Neutral News</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-gray-500 h-2 rounded-full" style={{
                              width: `${(news.filter(n => n.sentiment === 'neutral').length / news.length * 100)}%`
                            }}></div>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.round(news.filter(n => n.sentiment === 'neutral').length / news.length * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Negative News</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-red-500 h-2 rounded-full" style={{
                              width: `${(news.filter(n => n.sentiment === 'negative').length / news.length * 100)}%`
                            }}></div>
                          </div>
                          <span className="text-sm font-medium">
                            {Math.round(news.filter(n => n.sentiment === 'negative').length / news.length * 100)}%
                          </span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500 text-sm">No news data available for sentiment analysis</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Trade Modal */}
      {tradeModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {tradeModal.type === 'buy' ? 'Buy' : 'Sell'} {tradeModal.stock?.symbol}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Price
                </label>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(tradeModal.stock?.current_price || tradeModal.stock?.currentPrice || 0)}
                </div>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={tradeQuantity}
                  onChange={(e) => setTradeQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter quantity"
                  min="1"
                />
              </div>

              {tradeQuantity && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between text-sm">
                    <span>Estimated Total:</span>
                    <span className="font-semibold">
                      {formatCurrency(parseFloat(tradeQuantity || 0) * (tradeModal.stock?.current_price || tradeModal.stock?.currentPrice || 0))}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setTradeModal({ open: false, type: '', stock: null })}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={executeTrade}
                disabled={!tradeQuantity}
                className={`flex-1 px-4 py-2 rounded-md text-white ${
                  tradeModal.type === 'buy'
                    ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300'
                    : 'bg-red-600 hover:bg-red-700 disabled:bg-red-300'
                }`}
              >
                {tradeModal.type === 'buy' ? 'Buy' : 'Sell'}
              </button>
            </div>
          </div>
        </div>
      )}

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