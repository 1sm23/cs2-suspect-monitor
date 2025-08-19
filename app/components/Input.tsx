'use client';

import { forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            // 基础样式
            "block w-full rounded-md border px-3 py-2 shadow-sm transition-colors",
            // 明确的颜色设置，兼容 Windows 系统
            "bg-white text-gray-900 placeholder-gray-500",
            // 边框样式
            "border-gray-300",
            // 焦点状态
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
            // 禁用状态
            "disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed",
            // 错误状态
            error && "border-red-300 focus:border-red-500 focus:ring-red-500",
            // 自定义类名
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
