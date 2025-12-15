import { PaymentTerms } from './types';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const calculateDueDate = (issueDate: string, terms: PaymentTerms): string => {
  if (!issueDate) return '';
  
  const date = new Date(issueDate);
  
  switch (terms) {
    case PaymentTerms.Net15:
      date.setDate(date.getDate() + 15);
      break;
    case PaymentTerms.Net30:
      date.setDate(date.getDate() + 30);
      break;
    case PaymentTerms.Net60:
      date.setDate(date.getDate() + 60);
      break;
    case PaymentTerms.DueOnReceipt:
      // Same as issue date
      break;
    default:
      return ''; // Manual entry required or no auto-calc
  }
  
  return date.toISOString().split('T')[0];
};

export const padInvoiceNumber = (num: number | string): string => {
  return num.toString().padStart(4, '0');
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Simple check for at least 10 digits/chars commonly found in phones
  const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return re.test(phone);
};