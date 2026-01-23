import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  trend, 
  trendValue, 
  iconBg = 'bg-primary',
  iconColor = 'text-primary'
}) => {
  const isPositive = trend === 'up';
  
  return (
    <div className="rounded-sm border border-stroke bg-white py-6 px-7.5 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className={`flex h-11.5 w-11.5 items-center justify-center rounded-full ${iconBg} dark:bg-meta-4`}>
        <Icon className={`${iconColor} dark:text-white`} size={22} />
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {value}
          </h4>
          <span className="text-sm font-medium">{title}</span>
        </div>

        {trendValue && (
          <span className={`flex items-center gap-1 text-sm font-medium ${
            isPositive ? 'text-meta-3' : 'text-meta-1'
          }`}>
            {trendValue}
            {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
