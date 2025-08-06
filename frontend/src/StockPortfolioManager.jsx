import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Eye, EyeOff, Plus, Minus, RefreshCw, Newspaper, Activity, Wallet } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

// Mock API functions for demonstration
const mockAPI = {
  portfolio: {
    totalInvested: "5215.00",
    currentValue: "6185.20",
    totalPnL: "970.20",
    totalPnLPercent: "18.61",
    cashBalance: "44785.00",
    totalPortfolioValue: "50970.20",
    holdings: [
      { id: 1, symbol: 'AAPL', company_name: 'Apple Inc.', quantity: 10, current_price: 175.50, current_value: 1755.00, total_invested: 1700.00, unrealized_pnl: 55.00, pnl_percent: 3.24 },
      { id: 2, symbol: 'GOOGL', company_name: 'Alphabet Inc.', quantity: 5, current_price: 142.30, current_value: 711.50, total_invested: 675.00, unrealized_pnl: 36.50, pnl_percent: 5.41 },
      { id: 3, symbol: 'MSFT', company_name: 'Microsoft Corporation', quantity: 3, current_price: 415.20, current_value: 1245.60, total_invested: 1200.00, unrealized_pnl: 45.60, pnl_percent: 3.80 },
      { id: 6, symbol: 'NVDA', company_name: 'NVIDIA Corporation', quantity: 2, current_price: 875.20, current_value: 1750.40, total_invested: 1640.00, unrealized_pnl: 110.40, pnl_percent: 6.73 }
    ]
  },
  stocks: [
    { id: 1, symbol: 'AAPL', company_name: 'Apple Inc.', current_price: 175.50, change_percent: 0.74, change_amount: 1.30 },
    { id: 2, symbol: 'GOOGL', company_name: 'Alphabet Inc.', current_price: 142.30, change_percent: 1.03, change_amount: 1.45 },
    { id: 3, symbol: 'MSFT', company_name: 'Microsoft Corporation', current_price: 415.20, change_percent: 0.58, change_amount: 2.40 },
    { id: 4, symbol: 'AMZN', company_name: 'Amazon.com Inc.', current_price: 145.80, change_percent: 1.11, change_amount: 1.60 },
    { id: 5, symbol: 'TSLA', company_name: 'Tesla Inc.', current_price: 248.50, change_percent: 1.18, change_amount: 2.90 },
    { id: 6, symbol: 'NVDA', company_name: 'NVIDIA Corporation', current_price: 875.20, change_percent: 0.90, change_amount: 7.80 },
    { id: 7, symbol: 'META', company_name: 'Meta Platforms Inc.', current_price: 325.80, change_percent: 1.05, change_amount: 3.40 },
    { id: 8, symbol: 'NFLX', company_name: 'Netflix Inc.', current_price: 445.60, change_percent: 0.79, change_amount: 3.50 }
  ],
  watchlist: [
    { id: 4, symbol: 'AMZN', company_name: 'Amazon.com Inc.', current_price: 145.80, change_percent: 1.11, change_amount: 1.60 },
    { id: 5, symbol: 'TSLA', company_name: 'Tesla Inc.', current_price: 248.50, change_percent: 1.18, change_amount: 2.90 },
    { id: 7, symbol: 'META', company_name: 'Meta Platforms Inc.', current_price: 325.80, change_percent: 1.05, change_amount: 3.40 },
    { id: 8, symbol: 'NFLX', company_name: 'Netflix Inc.', current_price: 445.60, change_percent: 0.79, change_amount: 3.50 }
  ],
  news: [
    { id: 1, headline: 'Apple Reports Strong Q4 Earnings', summary: 'Apple Inc. reported better than expected quarterly earnings with strong iPhone sales.', source: 'Financial Times', sentiment: 'positive', published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: 2, headline: 'Tech Stocks Rally on AI Optimism', summary: 'Major technology stocks surge on renewed AI investment optimism.', source: 'Reuters', sentiment: 'positive', published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() },
    { id: 3, headline: 'Federal Reserve Hints at Rate Cuts', summary: 'Fed officials suggest potential interest rate reductions in upcoming meetings.', source: 'Wall Street Journal', sentiment: 'positive', published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() },
    { id: 4, headline: 'Tesla Faces Production Challenges', summary: 'Tesla reports lower than expected vehicle deliveries citing supply chain disruptions.', source: 'Bloomberg', sentiment: 'negative', published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() }
  ],
  priceHistory: [
    { date: '2025-01-07', price: 165.20 }, { date: '2025-01-08', price: 167.80 }, { date: '2025-01-09', price: 169.50 },
    { date: '2025-01-10', price: 171.30 }, { date: '2025-01-11', price: 168.90 }, { date: '2025-01-12', price: 170.40 },
    { date: '2025-01-13', price: 172.10 }, { date: '2025-01-14', price: 174.60 }, { date: '2025-01-15', price: 173.20 },
    { date: '2025-01-16', price: 175.80 }, { date: '2025-01-17', price: 177.30 }, { date: '2025-01-18', price: 176.10 },
    { date: '2025-01-19', price: 178.50 }, { date: '2025-01-20', price: 176.80 }, { date: '2025-01-21', price: 175.20 },
    { date: '2025-02-04', price: 174.20 }, { date: '2025-02-05', price: 175.50 }
  ]
};

const StockPortfolioManager = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [portfolio, setPortfolio] = useState(null);
  const [stocks, setStocks] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [news, setNews] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);
  const [tradeModal, setTradeModal] = useState({ open: false, type: '', stock: null });
  const [tradeQuantity, setTradeQuantity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API calls with mock data
    setTimeout(() => {
      setPortfolio(mockAPI.portfolio);
      setStocks(mockAPI.stocks);
      setWatchlist(mockAPI.watchlist);
      setNews(mockAPI.news);
      setPriceHistory(mockAPI.priceHistory);
      setLoading(false);
    }, 1000);
  }, []);

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

  const executeTrade = () => {
    if (!tradeQuantity || !tradeModal.stock) return;
    
    // Mock trade execution
    const cost = parseFloat(tradeQuantity) * tradeModal.stock.current_price;
    alert(`${tradeModal.type === 'buy' ? 'Bought' : 'Sold'} ${tradeQuantity} shares of ${tradeModal.stock.symbol} for ${formatCurrency(cost)}`);
    
    setTradeModal({ open: false, type: '', stock: null });
    setTradeQuantity('');
  };

  const addToWatchlist = (stock) => {
    if (!watchlist.find(w => w.id === stock.id)) {
      setWatchlist([...watchlist, stock]);
    }
  };

  const removeFromWatchlist = (stockId) => {
    setWatchlist(watchlist.filter(w => w.id !== stockId));
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
              <RefreshCw className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
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
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolio?.totalPortfolioValue)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Current Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolio?.currentValue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className={`h-8 w-8 ${portfolio?.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">P&L</p>
                    <p className={`text-2xl font-bold ${getChangeColor(portfolio?.totalPnL)}`}>
                      {formatCurrency(portfolio?.totalPnL)}
                    </p>
                    <p className={`text-sm ${getChangeColor(portfolio?.totalPnLPercent)}`}>
                      {formatPercent(portfolio?.totalPnLPercent)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Wallet className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Cash Balance</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(portfolio?.cashBalance)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Portfolio Allocation */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Allocation</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={portfolio?.holdings.map((holding, index) => ({
                        name: holding.symbol,
                        value: parseFloat(holding.current_value),
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
                      {portfolio?.holdings.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Price History Chart */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AAPL Price History</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Line type="monotone" dataKey="price" stroke="#2563EB" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Holdings Performance */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Holdings Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={portfolio?.holdings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="symbol" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatPercent(value)} />
                  <Bar dataKey="pnl_percent" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
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
                  {portfolio?.holdings.map((holding) => (
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
                        //    TODO: Add a neutral icon
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Gainers</h3>
                <div className="space-y-3">
                  {stocks
                    .filter(stock => stock.change_percent > 0)
                    .sort((a, b) => b.change_percent - a.change_percent)
                    .slice(0, 5)
                    .map(stock => (
                      <div key={stock.id} className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-900">{stock.symbol}</div>
                          <div className="text-sm text-gray-500">{formatCurrency(stock.current_price)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-600 font-medium">
                            +{formatPercent(stock.change_percent)}
                          </div>
                          <div className="text-sm text-green-600">
                            +{formatCurrency(stock.change_amount)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Sentiment</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Positive News</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{width: '65%'}}></div>
                      </div>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Neutral News</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-gray-500 h-2 rounded-full" style={{width: '20%'}}></div>
                      </div>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Negative News</span>
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{width: '15%'}}></div>
                      </div>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                  </div>
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
                  {formatCurrency(tradeModal.stock?.current_price)}
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
                      {formatCurrency(parseFloat(tradeQuantity || 0) * (tradeModal.stock?.current_price || 0))}
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