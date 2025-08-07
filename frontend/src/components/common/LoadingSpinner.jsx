// src/components/common/LoadingSpinner.jsx
import React from 'react';
import { RefreshCw } from 'lucide-react';

const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-8">
    <RefreshCw className="h-6 w-6 animate-spin text-blue-600 mr-3" />
    <span className="text-lg text-gray-600">{message}</span>
  </div>
);

export default LoadingSpinner;
