import React from 'react';

const LoadingSpinner = ({ text }) => {
  return (
    <div className="loading">
      <div className="spinner"></div>
      <p>{text}</p>
    </div>
  );
};

export default LoadingSpinner;