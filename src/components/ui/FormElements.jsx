import React from 'react';

export const Input = ({ 
  label, 
  error, 
  icon: Icon,
  className = '',
  containerClass = '',
  ...props 
}) => {
  return (
    <div className={containerClass}>
      {label && (
        <label className="mb-2.5 block text-black dark:text-white">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2">
            <Icon className="text-body" size={20} />
          </span>
        )}
        <input
          className={`w-full rounded-lg border border-stroke bg-transparent py-4 ${
            Icon ? 'pl-12' : 'pl-6'
          } pr-6 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
            error ? 'border-danger' : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  );
};

export const Select = ({ 
  label, 
  error, 
  options = [],
  className = '',
  containerClass = '',
  ...props 
}) => {
  return (
    <div className={containerClass}>
      {label && (
        <label className="mb-2.5 block text-black dark:text-white">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-12 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
            error ? 'border-danger' : ''
          } ${className}`}
          {...props}
        >
          {options.map((option, idx) => (
            <option key={idx} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="absolute right-4 top-1/2 -translate-y-1/2">
          <svg
            className="fill-current"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g opacity="0.8">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                fill=""
              ></path>
            </g>
          </svg>
        </span>
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  );
};

export const Textarea = ({ 
  label, 
  error, 
  className = '',
  containerClass = '',
  rows = 4,
  ...props 
}) => {
  return (
    <div className={containerClass}>
      {label && (
        <label className="mb-2.5 block text-black dark:text-white">
          {label}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-6 text-black outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary ${
          error ? 'border-danger' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger">{error}</p>
      )}
    </div>
  );
};

export const Checkbox = ({ label, className = '', ...props }) => {
  return (
    <label className="flex cursor-pointer select-none items-center">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          {...props}
        />
        <div className={`box mr-4 flex h-5 w-5 items-center justify-center rounded border border-primary dark:border-strokedark ${className}`}>
          <span className="text-primary opacity-0">
            <svg
              className="fill-current"
              width="11"
              height="8"
              viewBox="0 0 11 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z"
                fill=""
                stroke=""
                strokeWidth="0.4"
              ></path>
            </svg>
          </span>
        </div>
      </div>
      {label}
    </label>
  );
};
