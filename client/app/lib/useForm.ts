'use client';

import { useState, useCallback } from 'react';

export type ValidationRule<T = any> = {
  validator: (value: T, formData?: Record<string, any>) => boolean | string;
  message?: string;
};

export type ValidationRules<T extends Record<string, any>> = {
  [K in keyof T]?: ValidationRule<T[K]>[];
};

export type FormErrors<T extends Record<string, any>> = {
  [K in keyof T]?: string;
} & {
  _form?: string;
};

export interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T;
  validationRules?: ValidationRules<T>;
  onSubmit: (values: T) => Promise<void> | void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validationRules = {},
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: keyof T, value: T[keyof T]): string | undefined => {
      const rules = validationRules[name];
      if (!rules || rules.length === 0) return undefined;

      for (const rule of rules) {
        const result = rule.validator(value, values);
        if (result !== true) {
          return typeof result === 'string' ? result : rule.message || 'Invalid value';
        }
      }

      return undefined;
    },
    [validationRules, values]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<FormErrors<T>> = {};
    let isValid = true;

    Object.keys(values).forEach((key) => {
      const fieldName = key as keyof T;
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        (newErrors as any)[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors as FormErrors<T>);
    return isValid;
  }, [values, validateField]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      const fieldName = name as keyof T;
      
      // Handle checkbox and radio inputs
      let finalValue: any = value;
      if (type === 'checkbox') {
        finalValue = (e.target as HTMLInputElement).checked;
      } else if (type === 'number') {
        finalValue = value === '' ? '' : Number(value);
      }

      const newValues = { ...values, [fieldName]: finalValue };
      setValues(newValues);

      // Clear error when user starts typing
      if (errors[fieldName]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }

      // Validate on change if enabled
      if (validateOnChange && touched[fieldName as string]) {
        const error = validateField(fieldName, finalValue);
        if (error) {
          setErrors((prev) => ({ ...prev, [fieldName]: error }));
        }
      }
    },
    [values, errors, touched, validateOnChange, validateField]
  );

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target;
      const fieldName = name as keyof T;
      
      setTouched((prev) => ({ ...prev, [fieldName as string]: true }));

      if (validateOnBlur) {
        const error = validateField(fieldName, values[fieldName]);
        if (error) {
          setErrors((prev) => ({ ...prev, [fieldName]: error }));
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
          });
        }
      }
    },
    [values, validateOnBlur, validateField]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Mark all fields as touched
      const allTouched: Record<string, boolean> = {};
      Object.keys(values).forEach((key) => {
        allTouched[key] = true;
      });
      setTouched(allTouched);

      // Validate form
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        // Handle submission error
        if (error instanceof Error) {
          setErrors((prev) => ({ ...prev, _form: error.message }));
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name: keyof T, error: string | undefined) => {
    setErrors((prev) => {
      if (error) {
        return { ...prev, [name]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
    });
  }, []);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setFieldValue,
    setFieldError,
    setValues,
    validateField,
    validateForm,
  };
}

// Common validation rules
export const validators = {
  required: <T,>(message = 'This field is required'): ValidationRule<T> => ({
    validator: (value) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string' && value.trim() === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    },
    message,
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule<string> => ({
    validator: (value) => {
      if (!value) return true; // Allow empty if not required
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    },
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule<string> => ({
    validator: (value) => {
      if (!value) return true; // Allow empty if not required
      return value.length >= min;
    },
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule<string> => ({
    validator: (value) => {
      if (!value) return true; // Allow empty if not required
      return value.length <= max;
    },
    message: message || `Must be no more than ${max} characters`,
  }),

  min: (min: number, message?: string): ValidationRule<number> => ({
    validator: (value) => {
      if (value === null || value === undefined) return true;
      return value >= min;
    },
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule<number> => ({
    validator: (value) => {
      if (value === null || value === undefined) return true;
      return value <= max;
    },
    message: message || `Must be no more than ${max}`,
  }),

  pattern: (regex: RegExp, message: string): ValidationRule<string> => ({
    validator: (value) => {
      if (!value) return true; // Allow empty if not required
      return regex.test(value);
    },
    message,
  }),

  match: (fieldName: string, message?: string): ValidationRule<any> => ({
    validator: (value, formData) => {
      if (!formData) return false;
      return value === formData[fieldName];
    },
    message: message || 'Values do not match',
  }),
};

