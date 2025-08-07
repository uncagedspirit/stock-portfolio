// src/components/Dashboard/Dashboard.jsx
import React from 'react';
import PortfolioSummaryCards from './PortfolioSummaryCards';
import PortfolioAllocationChart from '../charts/PortfolioAllocationChart';
import PriceHistoryChart from '../charts/PriceHistoryChart';
import HoldingsPerformanceChart from '../charts/HoldingsPerformanceChart';

const Dashboard = ({ portfolio, holdings, stocks }) => {
  return (
    <div className="space-y-6">
      <PortfolioSummaryCards portfolio={portfolio} />
      <PortfolioAllocationChart holdings={holdings} />
      <PriceHistoryChart stocks={stocks} />
      <HoldingsPerformanceChart holdings={holdings} />
    </div>
  );
};

export default Dashboard;
