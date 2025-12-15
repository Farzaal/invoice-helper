export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export enum PaymentTerms {
  Net15 = 'Net 15',
  Net30 = 'Net 30',
  Net60 = 'Net 60',
  DueOnReceipt = 'Due on Receipt',
  Custom = 'Custom'
}

export interface InvoiceState {
  // Company Details
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyLogo: string | null;

  // Client Details
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  clientPhone: string;

  // Metadata
  invoicePrefix: string;
  invoiceNumber: string; // The numeric part, e.g., "0001"
  issueDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  paymentTerms: PaymentTerms;
  customPaymentTerms: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue';

  // Items
  items: LineItem[];

  // Financials
  taxRate: number; // percentage
  discountRate: number; // percentage (simplified for this demo as %)

  // Notes
  notes: string;
  terms: string;
}

export interface FormErrors {
  [key: string]: string;
}