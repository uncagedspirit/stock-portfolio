// src/components/common/ErrorMessage.jsx
import React from 'react';

const ErrorMessage = ({ message }) => (
  <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
    <strong>Error:</strong> {message}
  </div>
);

export default ErrorMessage;
