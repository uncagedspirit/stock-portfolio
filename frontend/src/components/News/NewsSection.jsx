// src/components/News/NewsSection.jsx
import React from 'react';

const NewsSection = ({ news }) => (
  <div className="space-y-4">
    <h3 className="text-xl font-semibold mb-2">Latest News</h3>
    {news.map((article, idx) => (
      <div key={idx} className="p-4 bg-white shadow rounded">
        <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold hover:underline">
          {article.title}
        </a>
        <p className="text-gray-600 mt-1">{article.summary}</p>
        {/* You can add sentiment progress bars here */}
      </div>
    ))}
  </div>
);

export default NewsSection;
