import React from 'react';

interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const TextField: React.FC<BaseInputProps> = ({ label, error, className = '', fullWidth = true, required, ...props }) => (
  <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
    {label && (
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none 
        ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'} 
        ${props.disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white'}
        ${className}`}
      {...props}
    />
    {error && <span className="text-xs text-red-500 mt-0.5 flex items-center gap-1">{error}</span>}
  </div>
);

export const TextAreaField: React.FC<BaseInputProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ label, error, className = '', fullWidth = true, required, ...props }) => (
  <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
    {label && (
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <textarea
      className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none resize-y min-h-[100px]
        ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'} 
        ${className}`}
      {...props}
    />
    {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
  </div>
);

export const SelectField: React.FC<BaseInputProps & React.SelectHTMLAttributes<HTMLSelectElement>> = ({ label, error, children, className = '', fullWidth = true, required, ...props }) => (
  <div className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : ''}`}>
    {label && (
      <label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative">
      <select
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none bg-white
          ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'} 
          ${className}`}
        {...props}
      >
        {children}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </div>
    </div>
    {error && <span className="text-xs text-red-500 mt-0.5">{error}</span>}
  </div>
);