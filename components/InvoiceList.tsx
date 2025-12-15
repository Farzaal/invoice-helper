import React from 'react';
import { Plus, MoreVertical, FileText, Calendar, DollarSign, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '../utils';

interface MockInvoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  issueDate: string;
  dueDate: string;
}

const MOCK_INVOICES: MockInvoice[] = [
  { id: '1', invoiceNumber: '0001', clientName: 'Acme Corp', amount: 1200.50, status: 'paid', issueDate: '2023-10-01', dueDate: '2023-10-31' },
  { id: '2', invoiceNumber: '0002', clientName: 'Globex Inc', amount: 3450.00, status: 'pending', issueDate: '2023-10-15', dueDate: '2023-11-14' },
  { id: '3', invoiceNumber: '0003', clientName: 'Soylent Corp', amount: 850.00, status: 'overdue', issueDate: '2023-09-01', dueDate: '2023-09-30' },
  { id: '4', invoiceNumber: '0004', clientName: 'Umbrella Corp', amount: 12000.00, status: 'draft', issueDate: '2023-11-01', dueDate: '2023-11-30' },
  { id: '5', invoiceNumber: '0005', clientName: 'Stark Ind', amount: 5600.25, status: 'pending', issueDate: '2023-11-05', dueDate: '2023-12-05' },
];

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles: { [key: string]: string } = {
    paid: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    overdue: 'bg-red-100 text-red-800 border-red-200',
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const icons: { [key: string]: React.ReactNode } = {
    paid: <CheckCircle className="w-3 h-3 mr-1" />,
    pending: <Clock className="w-3 h-3 mr-1" />,
    overdue: <AlertCircle className="w-3 h-3 mr-1" />,
    draft: <FileText className="w-3 h-3 mr-1" />,
  };

  return (
    <span className={`flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

interface InvoiceListProps {
  onCreateNew: () => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({ onCreateNew }) => {
  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-500 mt-1">Manage and track your invoices</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> New Invoice
        </button>
      </div>

      {/* Stats Cards (Optional Polish) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: '$45,200', color: 'text-gray-900' },
          { label: 'Pending', value: '$9,050', color: 'text-yellow-600' },
          { label: 'Overdue', value: '$850', color: 'text-red-600' },
          { label: 'Drafts', value: '3', color: 'text-gray-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-xs text-gray-500 font-medium uppercase">{stat.label}</p>
            <p className={`text-xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {MOCK_INVOICES.map((invoice) => (
          <div 
            key={invoice.id}
            className="group bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full"
          >
            {/* Left: ID & Client */}
            <div className="flex items-start gap-4 min-w-[200px]">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                 <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-gray-900 flex items-center gap-2">
                  INV-{invoice.invoiceNumber}
                </div>
                <div className="text-sm text-gray-500 font-medium">{invoice.clientName}</div>
              </div>
            </div>

            {/* Middle: Dates */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 flex-1 md:justify-center">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Issued: {invoice.issueDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>Due: {invoice.dueDate}</span>
              </div>
            </div>

            {/* Right: Amount & Status & Action */}
            <div className="flex items-center justify-between w-full md:w-auto gap-6 mt-2 md:mt-0">
               <div className="text-right">
                 <div className="font-bold text-gray-900">{formatCurrency(invoice.amount)}</div>
                 <div className="flex justify-end mt-1">
                   <StatusBadge status={invoice.status} />
                 </div>
               </div>
               
               <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                 <MoreVertical className="w-5 h-5" />
               </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};