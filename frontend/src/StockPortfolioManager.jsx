// src/StockPortfolioManager.jsx
import React, { useState, useEffect } from 'react';
import {
  getPortfolio,
  getHoldings,
  getStocks,
  getNews,
} from './api/apiService';

import NavigationBar from './components/Navigation/NavigationBar';
import Dashboard from './components/Dashboard/Dashboard';
import HoldingsTable from './components/tables/HoldingsTable';
import TradingTable from './components/tables/TradingTable';
import WatchlistTable from './components/tables/WatchlistTable';
import NewsSection from './components/News/NewsSection';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorMessage from './components/common/ErrorMessage';
import TradeModal from './components/common/TradeModal';

const StockPortfolioManager = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [news, setNews] = useState([]);
  const [trades, setTrades] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTab, setCurrentTab] = useState('Dashboard');
  const [tradeModalOpen, setTradeModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [portfolioData, holdingsData, stocksData, newsData] = await Promise.all([
          getPortfolio(),
          getHoldings(),
          getStocks(),
          getNews(),
        ]);
        setPortfolio(portfolioData);
        setHoldings(holdingsData);
        setStocks(stocksData);
        setNews(newsData);
      } catch (err) {
        setError(err.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handler for opening trade modal
  const handleTradeClick = (stock) => {
    setSelectedStock(stock);
    setTradeModalOpen(true);
  };

  // Handler for performing a trade
  const handleTrade = (stock, quantity) => {
    // Update holdings, trades, portfolio etc. appropriately here
    // This is a placeholder logic example:

    const existingHolding = holdings.find(h => h.symbol === stock.symbol);
    if (existingHolding) {
      const updatedHoldings = holdings.map(h =>
        h.symbol === stock.symbol
          ? { ...h, quantity: h.quantity + quantity }
          : h
      );
      setHoldings(updatedHoldings);
    } else {
      setHoldings([...holdings, { ...stock, quantity }]);
    }

    const newTrade = {
      date: new Date().toISOString().split('T')[0],
      symbol: stock.symbol,
      quantity,
      price: stock.price,
      type: quantity > 0 ? 'Buy' : 'Sell',
    };
    setTrades([newTrade, ...trades]);

    // You can also update portfolio cash, gainLoss etc. here if you track it

    setTradeModalOpen(false);
  };

  // Handler for watchlist removal
  const handleRemoveWatchlist = (symbol) => {
    setWatchlist(watchlist.filter(s => s.symbol !== symbol));
  };

  // Handler for tab change
  const handleChangeTab = (tab) => {
    setCurrentTab(tab);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <NavigationBar currentTab={currentTab} onChangeTab={handleChangeTab} />

      {currentTab === 'Dashboard' && (
        <Dashboard portfolio={portfolio} holdings={holdings} stocks={stocks} />
      )}

      {currentTab === 'Holdings' && (
        <HoldingsTable holdings={holdings} onTrade={handleTradeClick} />
      )}

      {currentTab === 'Trading' && <TradingTable trades={trades} />}

      {currentTab === 'Watchlist' && (
        <WatchlistTable watchlist={watchlist} onRemove={handleRemoveWatchlist} />
      )}

      {currentTab === 'News' && <NewsSection news={news} />}

      <TradeModal
        isOpen={tradeModalOpen}
        onClose={() => setTradeModalOpen(false)}
        onTrade={handleTrade}
        stock={selectedStock}
      />
    </div>
  );
};

export default StockPortfolioManager;
