import React, { forwardRef } from 'react';
import { cn } from '@/utils';
import { Loader2, X, AlertCircle, CheckCircle, Info } from 'lucide-react';

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary', size = 'md', loading, icon, children, className, disabled, ...props
}, ref) => {
  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
    secondary: 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        variants[variant], sizes[size], className
      )}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
});
Button.displayName = 'Button';

// Input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label, error, leftIcon, className, ...props
}, ref) => (
  <div className="space-y-1">
    {label && <label className="label">{label}</label>}
    <div className="relative">
      {leftIcon && (
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
          {leftIcon}
        </div>
      )}
      <input
        ref={ref}
        className={cn('input', leftIcon && 'pl-9', error && 'border-red-500 focus:ring-red-500', className)}
        {...props}
      />
    </div>
    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
  </div>
));
Input.displayName = 'Input';

// Select
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label, error, options, className, ...props
}, ref) => (
  <div className="space-y-1">
    {label && <label className="label">{label}</label>}
    <select
      ref={ref}
      className={cn('input', error && 'border-red-500', className)}
      {...props}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
  </div>
));
Select.displayName = 'Select';

// Textarea
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label, error, className, ...props
}, ref) => (
  <div className="space-y-1">
    {label && <label className="label">{label}</label>}
    <textarea
      ref={ref}
      className={cn('input resize-none', error && 'border-red-500', className)}
      {...props}
    />
    {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

// Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn('relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full fade-in', sizes[size])}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Badge
interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}
export function Badge({ children, className }: BadgeProps) {
  return <span className={cn('badge', className)}>{children}</span>;
}

// Avatar
interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}
export function Avatar({ name, avatarUrl, size = 'md', color = 'bg-primary-500' }: AvatarProps) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' };
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name} className={cn('rounded-full object-cover', sizes[size])} />;
  }
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div className={cn('rounded-full flex items-center justify-center font-semibold text-white', color, sizes[size])}>
      {initials}
    </div>
  );
}

// Loading Spinner
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('animate-spin text-primary-600', className)} />;
}

// Empty State
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="text-gray-300 dark:text-gray-700 mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
      {description && <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

// Alert
interface AlertProps {
  type?: 'info' | 'success' | 'error';
  title?: string;
  children: React.ReactNode;
}
export function Alert({ type = 'info', title, children }: AlertProps) {
  const styles = {
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300',
  };
  const icons = { info: Info, success: CheckCircle, error: AlertCircle };
  const Icon = icons[type];
  return (
    <div className={cn('flex gap-3 p-4 rounded-lg border', styles[type])}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div>
        {title && <p className="font-medium mb-1">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}

// Stat Card
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: string;
}
export function StatCard({ title, value, icon, color, change }: StatCardProps) {
  return (
    <div className="card p-6 fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className={cn('p-3 rounded-xl', color)}>
          {icon}
        </div>
        {change && <span className="text-sm text-green-600 dark:text-green-400 font-medium">{change}</span>}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{title}</p>
    </div>
  );
}
