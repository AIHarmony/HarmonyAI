import { ValidationError, ValidationResult } from './types';

type ValidationRule = (value: any, field: string) => ValidationError | null;

// 通用验证规则
export const rules = {
  required: (value: any, field: string): ValidationError | null => {
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return {
        field,
        message: `${field} is required`
      };
    }
    return null;
  },

  minLength: (value: string, field: string, min: number): ValidationError | null => {
    if (value.length < min) {
      return {
        field,
        message: `${field} must be at least ${min} characters long`
      };
    }
    return null;
  },

  maxLength: (value: string, field: string, max: number): ValidationError | null => {
    if (value.length > max) {
      return {
        field,
        message: `${field} must not exceed ${max} characters`
      };
    }
    return null;
  },

  email: (value: string, field: string): ValidationError | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return {
        field,
        message: 'Please enter a valid email address'
      };
    }
    return null;
  },

  min: (value: number, field: string, min: number): ValidationError | null => {
    if (value < min) {
      return {
        field,
        message: `${field} must be at least ${min}`
      };
    }
    return null;
  },

  max: (value: number, field: string, max: number): ValidationError | null => {
    if (value > max) {
      return {
        field,
        message: `${field} must not exceed ${max}`
      };
    }
    return null;
  },

  positive: (value: number, field: string): ValidationError | null => {
    if (value <= 0) {
      return {
        field,
        message: `${field} must be positive`
      };
    }
    return null;
  }
};

// 验证器函数
export function validate(value: any, field: string, validationRules: ValidationRule[]): ValidationResult {
  const errors: ValidationError[] = [];
  
  for (const rule of validationRules) {
    const error = rule(value, field);
    if (error) {
      errors.push(error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// 预定义的验证规则组合
export const validationSchemas = {
  username: (value: string): ValidationResult => {
    return validate(value, 'username', [
      (v, f) => rules.required(v, f),
      (v, f) => rules.minLength(v, f, 3),
      (v, f) => rules.maxLength(v, f, 20)
    ]);
  },

  email: (value: string): ValidationResult => {
    return validate(value, 'email', [
      (v, f) => rules.required(v, f),
      (v, f) => rules.email(v, f)
    ]);
  },

  password: (value: string): ValidationResult => {
    return validate(value, 'password', [
      (v, f) => rules.required(v, f),
      (v, f) => rules.minLength(v, f, 8)
    ]);
  },

  projectTitle: (value: string): ValidationResult => {
    return validate(value, 'title', [
      (v, f) => rules.required(v, f),
      (v, f) => rules.minLength(v, f, 5),
      (v, f) => rules.maxLength(v, f, 100)
    ]);
  },

  projectDescription: (value: string): ValidationResult => {
    return validate(value, 'description', [
      (v, f) => rules.required(v, f),
      (v, f) => rules.minLength(v, f, 10),
      (v, f) => rules.maxLength(v, f, 500)
    ]);
  },

  projectReward: (value: number): ValidationResult => {
    return validate(value, 'reward', [
      (v, f) => rules.required(v, f),
      (v, f) => rules.positive(v, f),
      (v, f) => rules.max(v, f, 1000)
    ]);
  },

  maxParticipants: (value: number): ValidationResult => {
    return validate(value, 'maxParticipants', [
      (v, f) => rules.required(v, f),
      (v, f) => rules.positive(v, f),
      (v, f) => rules.max(v, f, 100)
    ]);
  }
};

// 导出验证规则组合作为别名
export const usernameValidation = validationSchemas.username;
export const emailValidation = validationSchemas.email;
export const passwordValidation = validationSchemas.password;

// 导出独立的验证规则函数
export const required = (value: any, field: string): ValidationResult => {
  return validate(value, field, [(v, f) => rules.required(v, f)]);
};

export const minLength = (min: number) => (value: string, field: string): ValidationResult => {
  return validate(value, field, [(v, f) => rules.minLength(v, f, min)]);
};

export const maxLength = (max: number) => (value: string, field: string): ValidationResult => {
  return validate(value, field, [(v, f) => rules.maxLength(v, f, max)]);
};

export const email = (value: string, field: string): ValidationResult => {
  return validate(value, field, [(v, f) => rules.email(v, f)]);
};

export const min = (min: number) => (value: number, field: string): ValidationResult => {
  return validate(value, field, [(v, f) => rules.min(v, f, min)]);
};

export const max = (max: number) => (value: number, field: string): ValidationResult => {
  return validate(value, field, [(v, f) => rules.max(v, f, max)]);
};

export const positive = (value: number, field: string): ValidationResult => {
  return validate(value, field, [(v, f) => rules.positive(v, f)]);
};

// 验证器类
export class Validator {
  private errors: ValidationError[] = [];

  validate(value: any, rules: ((value: any) => ValidationResult)[]): boolean {
    this.errors = [];
    let isValid = true;

    for (const rule of rules) {
      const result = rule(value);
      if (!result.isValid) {
        this.errors.push(...result.errors);
        isValid = false;
      }
    }

    return isValid;
  }

  getErrors(): ValidationError[] {
    return this.errors;
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }
} 