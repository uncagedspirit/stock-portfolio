// src/components/tables/HoldingsTable.jsx
import React from 'react';
import { formatCurrency, formatPercent } from '../../utils/formatters';

const HoldingsTable = ({ holdings, onTrade }) => (
  <table className="min-w-full table-auto border-collapse border border-gray-200">
    <thead>
      <tr className="bg-gray-50">
        <th className="p-2 border border-gray-300">Symbol</th>
        <th className="p-2 border border-gray-300">Quantity</th>
        <th className="p-2 border border-gray-300">Price</th>
        <th className="p-2 border border-gray-300">Value</th>
        <th className="p-2 border border-gray-300">Change %</th>
        <th className="p-2 border border-gray-300">Actions</th>
      </tr>
    </thead>
    <tbody>
      {holdings.map((holding) => (
        <tr key={holding.symbol}>
          <td className="p-2 border border-gray-300">{holding.symbol}</td>
          <td className="p-2 border border-gray-300">{holding.quantity}</td>
          <td className="p-2 border border-gray-300">{formatCurrency(holding.price)}</td>
          <td className="p-2 border border-gray-300">{formatCurrency(holding.quantity * holding.price)}</td>
          <td className={`p-2 border border-gray-300 ${holding.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercent(holding.change)}
          </td>
          <td className="p-2 border border-gray-300">
            <button
              className="text-blue-600 hover:underline"
              onClick={() => onTrade(holding)}
            >
              Trade
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default HoldingsTable;
