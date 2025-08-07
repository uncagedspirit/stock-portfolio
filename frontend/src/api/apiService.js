// src/api/apiService.js

// Example API functions - customize URLs and logic as needed

export const getPortfolio = async () => {
  const response = await fetch('/api/portfolio');
  if (!response.ok) throw new Error('Failed to fetch portfolio');
  return response.json();
};

export const getHoldings = async () => {
  const response = await fetch('/api/holdings');
  if (!response.ok) throw new Error('Failed to fetch holdings');
  return response.json();
};

export const getStocks = async () => {
  const response = await fetch('/api/stocks');
  if (!response.ok) throw new Error('Failed to fetch stocks');
  return response.json();
};

export const getNews = async () => {
  const response = await fetch('/api/news');
  if (!response.ok) throw new Error('Failed to fetch news');
  return response.json();
};

// Add other API calls as needed
