import React from 'react';
import { FiLoader } from 'react-icons/fi';

const LoadingSpinner = ({ size = 'md', text = 'Загрузка...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center space-x-3">
        <FiLoader className={`${sizeClasses[size]} animate-spin text-blue-600`} />
        {text && <span className="text-gray-600">{text}</span>}
      </div>
    </div>
  );
};

export default LoadingSpinner;