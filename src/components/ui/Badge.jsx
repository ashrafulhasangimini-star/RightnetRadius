import React from 'react';

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-2 text-body dark:bg-meta-4',
    primary: 'bg-primary bg-opacity-10 text-primary',
    success: 'bg-success bg-opacity-10 text-success',
    danger: 'bg-danger bg-opacity-10 text-danger',
    warning: 'bg-warning bg-opacity-10 text-warning',
    info: 'bg-blue-500 bg-opacity-10 text-blue-500',
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export const StatusBadge = ({ status }) => {
  const statusConfig = {
    active: { variant: 'success', text: 'Active' },
    inactive: { variant: 'danger', text: 'Inactive' },
    pending: { variant: 'warning', text: 'Pending' },
    suspended: { variant: 'danger', text: 'Suspended' },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return <Badge variant={config.variant}>{config.text}</Badge>;
};
