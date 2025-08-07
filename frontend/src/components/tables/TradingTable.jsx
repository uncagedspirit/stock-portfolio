// src/components/tables/TradingTable.jsx
import React from 'react';

const TradingTable = ({ trades }) => (
  <table className="min-w-full table-auto border-collapse border border-gray-200">
    <thead>
      <tr className="bg-gray-50">
        <th className="p-2 border border-gray-300">Date</th>
        <th className="p-2 border border-gray-300">Symbol</th>
        <th className="p-2 border border-gray-300">Quantity</th>
        <th className="p-2 border border-gray-300">Price</th>
        <th className="p-2 border border-gray-300">Type</th>
      </tr>
    </thead>
    <tbody>
      {trades.map((trade, idx) => (
        <tr key={idx}>
          <td className="p-2 border border-gray-300">{trade.date}</td>
          <td className="p-2 border border-gray-300">{trade.symbol}</td>
          <td className="p-2 border border-gray-300">{trade.quantity}</td>
          <td className="p-2 border border-gray-300">{trade.price}</td>
          <td className="p-2 border border-gray-300">{trade.type}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default TradingTable;
