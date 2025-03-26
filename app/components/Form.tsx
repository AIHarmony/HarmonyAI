'use client';

import React, { useState } from 'react';
import { ValidationError, ValidationResult } from '../lib/utils/types';
import { validate, rules } from '../lib/utils/validation';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea';
  value: string | number;
  validation?: (value: any, field: string) => ValidationResult;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  rows?: number;
}

interface FormProps<T extends Record<string, any>> {
  fields: FormField[];
  onSubmit: (values: T) => Promise<void>;
  submitLabel?: string;
  className?: string;
}

export function Form<T extends Record<string, any>>({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  className = ''
}: FormProps<T>) {
  const [values, setValues] = useState<Record<string, any>>(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: field.value }), {})
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (name: string, value: string | number) => {
    setValues(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required) {
      const result = validate(value, field.name, [(v, f) => rules.required(v, f)]);
      if (!result.isValid) {
        return result.errors[0]?.message || null;
      }
    }

    if (field.validation) {
      const result = field.validation(value, field.name);
      if (!result.isValid) {
        return result.errors[0]?.message || null;
      }
    }

    if (field.type === 'number') {
      const numValue = Number(value);
      if (field.min !== undefined) {
        const result = validate(numValue, field.name, [(v, f) => rules.min(v, f, field.min!)]);
        if (!result.isValid) {
          return result.errors[0]?.message || null;
        }
      }
      if (field.max !== undefined) {
        const result = validate(numValue, field.name, [(v, f) => rules.max(v, f, field.max!)]);
        if (!result.isValid) {
          return result.errors[0]?.message || null;
        }
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    // Validate all fields
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field, values[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (!isValid) {
      return;
    }

    // Submit form
    setIsSubmitting(true);
    try {
      await onSubmit(values as T);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: values[field.name],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        handleChange(field.name, e.target.value),
      className: `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
        errors[field.name] ? 'border-red-500' : ''
      }`,
      placeholder: field.placeholder,
      required: field.required,
    };

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={field.rows || 3}
          />
        );
      default:
        return (
          <input
            {...commonProps}
            type={field.type}
            min={field.min}
            max={field.max}
          />
        );
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {fields.map(field => (
        <div key={field.name}>
          <label htmlFor={field.name} className="block text-sm font-medium text-gray-700">
            {field.label}
          </label>
          {renderField(field)}
          {errors[field.name] && (
            <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
          )}
        </div>
      ))}

      {submitError && (
        <div className="text-sm text-red-600">{submitError}</div>
      )}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </button>
      </div>
    </form>
  );
} 