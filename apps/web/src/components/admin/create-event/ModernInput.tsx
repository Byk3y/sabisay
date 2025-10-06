'use client';

import { useState, useRef, useEffect } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'password';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  className?: string;
  rows?: number;
}

export function ModernInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  minLength,
  maxLength,
  error,
  success = false,
  icon,
  suggestions = [],
  onSuggestionSelect,
  className,
  rows = 3,
}: ModernInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Handle suggestion selection
  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    onSuggestionSelect?.(suggestion);
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Show suggestions when typing
  useEffect(() => {
    if (value.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [value, suggestions]);

  // Auto-expand textarea based on content
  useEffect(() => {
    if (type === 'textarea' && inputRef.current && !isCollapsed) {
      const textarea = inputRef.current as HTMLTextAreaElement;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [value, type, isCollapsed]);

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';
  const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label */}
      <label className="block text-sm font-medium text-sabi-text-primary dark:text-sabi-text-primary-dark">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sabi-text-secondary dark:text-sabi-text-secondary-dark">
            {icon}
          </div>
        )}

        {/* Input field */}
        <InputComponent
          ref={inputRef as any}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          minLength={minLength}
          maxLength={maxLength}
          rows={type === 'textarea' ? (isCollapsed ? 1 : rows) : undefined}
          style={type === 'textarea' && !isCollapsed ? { height: 'auto' } : {}}
          className={cn(
            'w-full px-3 py-2.5 text-sm border rounded-lg shadow-sm transition-all duration-200',
            'focus:ring-2 focus:ring-admin-primary-500 focus:border-admin-primary-500',
            'bg-white dark:bg-gray-800 text-sabi-text-primary dark:text-sabi-text-primary-dark',
            'placeholder:text-sabi-text-muted dark:placeholder:text-sabi-text-muted-dark',
            icon ? 'pl-10' : 'pl-3',
            type === 'password' ? 'pr-10' : '',
            type === 'textarea' ? 'pr-10' : '',
            error
              ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500'
              : success
              ? 'border-admin-success-300 dark:border-admin-success-700 focus:ring-admin-success-500 focus:border-admin-success-500'
              : 'border-sabi-border dark:border-sabi-border-dark',
            isFocused && 'shadow-md',
            type === 'textarea' && 'resize-none'
          )}
        />

        {/* Password toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sabi-text-secondary dark:text-sabi-text-secondary-dark hover:text-sabi-text-primary dark:hover:text-sabi-text-primary-dark transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {/* Textarea collapse/expand toggle */}
        {type === 'textarea' && value.length > 0 && (
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute right-3 top-3 text-sabi-text-secondary dark:text-sabi-text-secondary-dark hover:text-sabi-text-primary dark:hover:text-sabi-text-primary-dark transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        )}

        {/* Status icon */}
        <div className={cn(
          "absolute top-1/2 -translate-y-1/2",
          type === 'password' ? "right-10" : 
          type === 'textarea' && value.length > 0 ? "right-10" : 
          "right-3"
        )}>
          {error ? (
            <AlertCircle className="w-4 h-4 text-red-500" />
          ) : success ? (
            <CheckCircle className="w-4 h-4 text-admin-success-500" />
          ) : null}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-sabi-border dark:border-sabi-border-dark rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 text-sm text-sabi-text-primary dark:text-sabi-text-primary-dark hover:bg-sabi-bg dark:hover:bg-sabi-bg-dark transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Character counter */}
      {maxLength && (
        <div className="flex justify-between items-center text-xs">
          <span className={cn(
            'text-sabi-text-muted dark:text-sabi-text-muted-dark',
            value.length > maxLength * 0.9 && 'text-yellow-600 dark:text-yellow-400',
            value.length >= maxLength && 'text-red-500'
          )}>
            {minLength && `${minLength}-`}{maxLength} characters
          </span>
          <span className={cn(
            'font-medium',
            value.length > maxLength * 0.9 && 'text-yellow-600 dark:text-yellow-400',
            value.length >= maxLength && 'text-red-500',
            value.length < maxLength * 0.9 && 'text-sabi-text-muted dark:text-sabi-text-muted-dark'
          )}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}



