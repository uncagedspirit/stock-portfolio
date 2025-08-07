// src/utils/formatters.js

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const formatPercent = (percent) => {
  return `${percent.toFixed(2)}%`;
};

export const getChangeColor = (change) => {
  return change >= 0 ? 'text-green-600' : 'text-red-600';
};
