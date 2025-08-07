// src/components/tables/WatchlistTable.jsx
import React from 'react';

const WatchlistTable = ({ watchlist, onRemove }) => (
  <table className="min-w-full table-auto border-collapse border border-gray-200">
    <thead>
      <tr className="bg-gray-50">
        <th className="p-2 border border-gray-300">Symbol</th>
        <th className="p-2 border border-gray-300">Current Price</th>
        <th className="p-2 border border-gray-300">Actions</th>
      </tr>
    </thead>
    <tbody>
      {watchlist.map((stock) => (
        <tr key={stock.symbol}>
          <td className="p-2 border border-gray-300">{stock.symbol}</td>
          <td className="p-2 border border-gray-300">{stock.price}</td>
          <td className="p-2 border border-gray-300">
            <button
              className="text-red-600 hover:underline"
              onClick={() => onRemove(stock.symbol)}
            >
              Remove
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default WatchlistTable;
