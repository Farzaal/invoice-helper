import React from 'react';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import { InvoiceState } from '../types';
import { formatCurrency } from '../utils';

interface InvoicePreviewProps {
  data: InvoiceState;
  onEdit: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data, onEdit }) => {
  const calculateSubtotal = () => {
    return data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = subtotal * (data.taxRate / 100);
    const discountAmount = subtotal * (data.discountRate / 100);
    return subtotal + taxAmount - discountAmount;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Toolbar - Hidden in print */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-sm print:hidden">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <button 
            onClick={onEdit}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Edit
          </button>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button 
            onClick={handlePrint}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
          <button 
            onClick={handlePrint} // In a real app, this might generate a PDF blob
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md shadow-blue-200 transition-colors"
          >
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden print:shadow-none print:rounded-none" id="invoice-preview">
        <div className="p-8 md:p-12 print:p-0">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
            <div className="flex flex-col">
              {data.companyLogo ? (
                <img src={data.companyLogo} alt="Company Logo" className="h-24 w-auto object-contain mb-6 self-start" />
              ) : (
                <div className="h-20 w-20 bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 mb-6 rounded-lg">
                  <span className="text-xs font-medium">No Logo</span>
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-900">{data.companyName || 'Your Company Name'}</h1>
              <div className="text-gray-600 mt-2 text-sm whitespace-pre-line leading-relaxed">
                {data.companyAddress || 'Address Line 1\nCity, State, Zip'}
                {data.companyPhone && <div className="mt-1">{data.companyPhone}</div>}
                {data.companyEmail && <div>{data.companyEmail}</div>}
              </div>
            </div>
            
            <div className="text-left md:text-right w-full md:w-auto">
              <h2 className="text-4xl font-light text-gray-900 mb-4 tracking-tight">INVOICE</h2>
              <div className="text-gray-600 space-y-1">
                <div className="flex justify-between md:justify-end gap-8">
                  <span className="text-gray-500">Invoice #:</span>
                  <span className="font-semibold text-gray-900">{data.invoicePrefix}-{data.invoiceNumber}</span>
                </div>
                <div className="flex justify-between md:justify-end gap-8">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-semibold text-gray-900">{data.issueDate}</span>
                </div>
                <div className="flex justify-between md:justify-end gap-8">
                  <span className="text-gray-500">Due Date:</span>
                  <span className="font-semibold text-gray-900">{data.dueDate}</span>
                </div>
                {data.paymentTerms && (
                   <div className="flex justify-between md:justify-end gap-8">
                    <span className="text-gray-500">Terms:</span>
                    <span className="font-semibold text-gray-900">{data.paymentTerms}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-gray-100 my-8" />

          {/* Bill To */}
          <div className="mb-12">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bill To</h3>
            <div className="text-gray-900 font-bold text-lg mb-1">{data.clientName || 'Client Name'}</div>
            <div className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">
              {data.clientAddress || 'Client Address\nCity, State, Zip'}
              {data.clientPhone && <div className="mt-1">{data.clientPhone}</div>}
              {data.clientEmail && <div>{data.clientEmail}</div>}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="text-left py-3 text-xs font-bold text-gray-900 uppercase tracking-wider">Description</th>
                  <th className="text-right py-3 text-xs font-bold text-gray-900 uppercase tracking-wider w-24">Qty</th>
                  <th className="text-right py-3 text-xs font-bold text-gray-900 uppercase tracking-wider w-32">Unit Price</th>
                  <th className="text-right py-3 text-xs font-bold text-gray-900 uppercase tracking-wider w-32">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-4 text-gray-800 text-sm whitespace-pre-line">{item.description || 'Item description'}</td>
                    <td className="py-4 text-right text-gray-600 text-sm">{item.quantity}</td>
                    <td className="py-4 text-right text-gray-600 text-sm">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-4 text-right font-medium text-gray-900 text-sm">{formatCurrency(item.quantity * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-12">
            <div className="w-full md:w-1/3 space-y-3">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              {data.taxRate > 0 && (
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Tax ({data.taxRate}%)</span>
                  <span>{formatCurrency(calculateSubtotal() * (data.taxRate / 100))}</span>
                </div>
              )}
              {data.discountRate > 0 && (
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Discount ({data.discountRate}%)</span>
                  <span className="text-red-500">-{formatCurrency(calculateSubtotal() * (data.discountRate / 100))}</span>
                </div>
              )}
              <div className="border-t-2 border-gray-900 pt-3 flex justify-between items-end mt-4">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-gray-100 pt-8">
            {(data.notes || data.terms) ? (
               <>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2">Notes</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">{data.notes || 'No additional notes.'}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm mb-2">Terms & Conditions</h4>
                  <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">{data.terms || 'No specific terms.'}</p>
                </div>
               </>
            ) : (
                <div className="col-span-2 text-center text-gray-400 text-sm italic">
                    No notes or terms included.
                </div>
            )}
          </div>
          
          <div className="mt-16 text-center">
             <p className="text-gray-500 text-sm">Thank you for your business!</p>
          </div>

        </div>
      </div>
    </div>
  );
};