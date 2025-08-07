// src/components/Dashboard/PortfolioSummaryCards.jsx
import React from 'react';
import { formatCurrency } from '../../utils/formatters';

const PortfolioSummaryCards = ({ portfolio }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="p-4 bg-white shadow rounded">
        <h3 className="text-gray-500">Total Value</h3>
        <p className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</p>
      </div>
      <div className="p-4 bg-white shadow rounded">
        <h3 className="text-gray-500">Gain/Loss</h3>
        <p className="text-2xl font-bold">{formatCurrency(portfolio.gainLoss)}</p>
      </div>
      <div className="p-4 bg-white shadow rounded">
        <h3 className="text-gray-500">Cash Available</h3>
        <p className="text-2xl font-bold">{formatCurrency(portfolio.cash)}</p>
      </div>
    </div>
  );
};

export default PortfolioSummaryCards;
