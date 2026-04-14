'use client';
import { cn } from '@/lib/utils/cn';
import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

// ── Input ────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: string;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, hint, prefix, suffix, className, ...props
}, ref) => (
  <div className="w-full">
    {label && <label className="form-label">{label}</label>}
    <div className="relative">
      {prefix && (
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 select-none">
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        className={cn(
          'form-input',
          prefix && 'pl-8',
          suffix && 'pr-10',
          error && 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20',
          className,
        )}
        {...props}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {suffix}
        </span>
      )}
    </div>
    {error && (
      <p className="form-error flex items-center gap-1 mt-1.5">
        <AlertCircle className="h-3.5 w-3.5" />{error}
      </p>
    )}
    {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
  </div>
));
Input.displayName = 'Input';

// ── Textarea ─────────────────────────────────────────────────────────────────
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label, error, className, ...props
}, ref) => (
  <div className="w-full">
    {label && <label className="form-label">{label}</label>}
    <textarea
      ref={ref}
      className={cn(
        'form-input resize-none',
        error && 'border-red-300 bg-red-50 focus:border-red-500',
        className,
      )}
      {...props}
    />
    {error && <p className="form-error mt-1">{error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

// ── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label, error, options, placeholder, className, ...props
}, ref) => (
  <div className="w-full">
    {label && <label className="form-label">{label}</label>}
    <select
      ref={ref}
      className={cn(
        'form-input appearance-none cursor-pointer',
        error && 'border-red-300 bg-red-50',
        className,
      )}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    {error && <p className="form-error mt-1">{error}</p>}
  </div>
));
Select.displayName = 'Select';

// ── Checkbox ─────────────────────────────────────────────────────────────────
interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label, description, className, id, ...props
}, ref) => (
  <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
    <input
      ref={ref}
      id={id}
      type="checkbox"
      className={cn(
        'mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer',
        className,
      )}
      {...props}
    />
    <div>
      <span className="text-sm text-gray-700 group-hover:text-gray-900 leading-none">{label}</span>
      {description && <p className="text-xs text-gray-400 mt-0.5">{description}</p>}
    </div>
  </label>
));
Checkbox.displayName = 'Checkbox';
