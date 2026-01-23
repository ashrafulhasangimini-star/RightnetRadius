import React from 'react';

export const Card = ({ children, className = '', padding = true }) => {
  return (
    <div className={`rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`border-b border-stroke px-6.5 py-4 dark:border-strokedark ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`font-medium text-black dark:text-white ${className}`}>
      {children}
    </h3>
  );
};

export const CardBody = ({ children, className = '' }) => {
  return (
    <div className={`p-6.5 ${className}`}>
      {children}
    </div>
  );
};
