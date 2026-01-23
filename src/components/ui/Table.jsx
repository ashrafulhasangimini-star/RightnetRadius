import React from 'react';

export const Table = ({ children, className = '' }) => {
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="max-w-full overflow-x-auto">
        <table className={`w-full table-auto ${className}`}>
          {children}
        </table>
      </div>
    </div>
  );
};

export const TableHeader = ({ children }) => {
  return (
    <thead>
      <tr className="bg-gray-2 text-left dark:bg-meta-4">
        {children}
      </tr>
    </thead>
  );
};

export const TableHead = ({ children, className = '' }) => {
  return (
    <th className={`py-4 px-4 font-medium text-black dark:text-white xl:pl-11 ${className}`}>
      {children}
    </th>
  );
};

export const TableBody = ({ children }) => {
  return <tbody>{children}</tbody>;
};

export const TableRow = ({ children, className = '' }) => {
  return (
    <tr className={`border-b border-stroke dark:border-strokedark ${className}`}>
      {children}
    </tr>
  );
};

export const TableCell = ({ children, className = '' }) => {
  return (
    <td className={`py-5 px-4 dark:border-strokedark xl:pl-11 ${className}`}>
      {children}
    </td>
  );
};
