// src/components/Navigation/NavigationBar.jsx
import React from 'react';

const NavigationBar = ({ currentTab, onChangeTab }) => {
  const tabs = ['Dashboard', 'Holdings', 'Trading', 'Watchlist', 'News'];

  return (
    <nav className="flex space-x-4 bg-gray-100 p-4 rounded-md mb-6">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`px-3 py-1 rounded ${
            currentTab === tab
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 hover:bg-blue-100'
          }`}
          onClick={() => onChangeTab(tab)}
        >
          {tab}
        </button>
      ))}
    </nav>
  );
};

export default NavigationBar;
