// src/components/common/TradeModal.jsx
import React from 'react';

const TradeModal = ({ isOpen, onClose, onTrade, stock }) => {
  const [quantity, setQuantity] = React.useState(0);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onTrade(stock, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold mb-4">Trade {stock?.symbol}</h2>
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            Quantity:
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="border rounded w-full p-2"
              min="1"
              required
            />
          </label>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Trade
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TradeModal;
