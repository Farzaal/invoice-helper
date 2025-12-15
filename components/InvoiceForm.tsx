import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Building2, User, Upload, X, Plus, Trash2, Calendar, 
  Save, Eye, Check, AlertCircle, FileText, ChevronDown 
} from 'lucide-react';
import { InvoiceState, LineItem, PaymentTerms, FormErrors } from '../types';
import { formatCurrency, generateId, calculateDueDate, padInvoiceNumber, validateEmail, validatePhone } from '../utils';
import { TextField, TextAreaField, SelectField } from './ui/InputFields';
import { InvoicePreview } from './InvoicePreview';

const INITIAL_STATE: InvoiceState = {
  companyName: '',
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
  companyLogo: null,
  clientName: '',
  clientEmail: '',
  clientAddress: '',
  clientPhone: '',
  invoicePrefix: 'INV',
  invoiceNumber: '0001',
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  paymentTerms: PaymentTerms.Net30,
  customPaymentTerms: '',
  status: 'draft',
  items: [
    { id: generateId(), description: '', quantity: 1, unitPrice: 0 }
  ],
  taxRate: 0,
  discountRate: 0,
  notes: '',
  terms: ''
};

export const InvoiceForm: React.FC<{ onCancel?: () => void }> = ({ onCancel }) => {
  const [formData, setFormData] = useState<InvoiceState>(INITIAL_STATE);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize due date on load
  useEffect(() => {
    const due = calculateDueDate(formData.issueDate, formData.paymentTerms);
    if (due) {
      setFormData(prev => ({ ...prev, dueDate: due }));
    }
  }, []); // Run once on mount

  // Auto-save simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setLastSaved(new Date());
      // In a real app, we would persist to DB/LocalStorage here
    }, 30000);
    return () => clearInterval(timer);
  }, [formData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSubmit();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        if (!isPreviewMode) {
          e.preventDefault();
          addItem();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData, isPreviewMode]);

  // Calculations
  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const taxAmount = subtotal * (formData.taxRate / 100);
    const discountAmount = subtotal * (formData.discountRate / 100);
    return subtotal + taxAmount - discountAmount;
  };

  // Field Updates
  const updateField = <K extends keyof InvoiceState>(field: K, value: InvoiceState[K]) => {
    setFormData(prev => {
      const newState = { ...prev, [field]: value };
      
      // Auto-calc due date if issue date or terms change
      if (field === 'issueDate' || field === 'paymentTerms') {
        const newTerms = field === 'paymentTerms' ? (value as PaymentTerms) : prev.paymentTerms;
        const newIssueDate = field === 'issueDate' ? (value as string) : prev.issueDate;
        
        if (newTerms !== PaymentTerms.Custom) {
           const newDue = calculateDueDate(newIssueDate, newTerms);
           if (newDue) newState.dueDate = newDue;
        }
      }
      return newState;
    });

    // Clear error for this field
    if (errors[field as string]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as string];
        return newErrors;
      });
    }
  };

  // Logo Handling
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("File size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('companyLogo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Item Management
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: generateId(), description: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const removeItem = (id: string) => {
    if (formData.items.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.companyName.trim()) newErrors.companyName = "Company Name is required";
    if (!formData.companyEmail.trim()) newErrors.companyEmail = "Email is required";
    else if (!validateEmail(formData.companyEmail)) newErrors.companyEmail = "Invalid email format";
    if (!formData.companyAddress.trim()) newErrors.companyAddress = "Address is required";
    
    if (!formData.clientName.trim()) newErrors.clientName = "Client Name is required";
    if (!formData.clientEmail.trim()) newErrors.clientEmail = "Email is required";
    else if (!validateEmail(formData.clientEmail)) newErrors.clientEmail = "Invalid email format";
    
    if (!formData.issueDate) newErrors.issueDate = "Issue date is required";
    if (!formData.dueDate) newErrors.dueDate = "Due date is required";
    else if (new Date(formData.dueDate) < new Date(formData.issueDate)) {
      newErrors.dueDate = "Due date cannot be before issue date";
    }

    formData.items.forEach((item, index) => {
      if (!item.description.trim()) newErrors[`item_${index}_desc`] = "Description required";
      if (item.quantity <= 0) newErrors[`item_${index}_qty`] = "Invalid quantity";
      if (item.unitPrice < 0) newErrors[`item_${index}_price`] = "Invalid price";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      // Shake animation logic could be added here via CSS classes
      const firstError = document.querySelector('.border-red-500');
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    alert("Invoice generated successfully! (Mock Action)");
    
    // Auto increment for next one
    const currentNum = parseInt(formData.invoiceNumber);
    updateField('invoiceNumber', padInvoiceNumber(currentNum + 1));
  };

  if (isPreviewMode) {
    return <InvoicePreview data={formData} onEdit={() => setIsPreviewMode(false)} />;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 pb-24 space-y-8 animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">New Invoice</h1>
          <p className="text-gray-500 mt-1">Create and manage your professional invoices</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full">
           {lastSaved && <><Check className="w-4 h-4 text-green-500" /> Draft saved {lastSaved.toLocaleTimeString()}</>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Company Details */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 mb-4 text-gray-800 font-semibold text-lg border-b border-gray-200 pb-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            <h2>From (Your Business)</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 space-y-4">
                <TextField 
                  label="Business Name" 
                  placeholder="Your Company Name" 
                  value={formData.companyName}
                  onChange={e => updateField('companyName', e.target.value)}
                  error={errors.companyName}
                  required
                />
                 <TextField 
                  label="Email" 
                  type="email"
                  placeholder="business@company.com" 
                  value={formData.companyEmail}
                  onChange={e => updateField('companyEmail', e.target.value)}
                  error={errors.companyEmail}
                  required
                />
              </div>

              {/* Logo Upload */}
              <div className="w-full md:w-40 flex-shrink-0">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo</label>
                <div 
                  className={`relative h-32 w-full md:w-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors bg-white
                    ${formData.companyLogo ? 'border-blue-200' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.companyLogo ? (
                    <>
                      <img src={formData.companyLogo} alt="Logo" className="h-full w-full object-contain p-2" />
                      <button 
                        onClick={(e) => { e.stopPropagation(); updateField('companyLogo', null); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                        title="Remove logo"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500 font-medium">Upload Logo</span>
                    </>
                  )}
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/png, image/jpeg, image/svg+xml" 
                    className="hidden" 
                    onChange={handleLogoUpload}
                  />
                </div>
              </div>
            </div>

            <TextField 
              label="Phone" 
              placeholder="+1 (555) 123-4567" 
              value={formData.companyPhone}
              onChange={e => updateField('companyPhone', e.target.value)}
              error={errors.companyPhone}
            />
            
            <TextAreaField 
              label="Address" 
              placeholder="Street Address, City, State, ZIP"
              value={formData.companyAddress}
              onChange={e => updateField('companyAddress', e.target.value)}
              error={errors.companyAddress}
              required
            />
          </div>
        </div>

        {/* Client Details */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-2">
            <div className="flex items-center gap-2 text-gray-800 font-semibold text-lg">
              <User className="w-5 h-5 text-blue-500" />
              <h2>Bill To (Client)</h2>
            </div>
            {/* Mock Feature */}
            <div className="flex items-center gap-2">
               <input type="checkbox" id="saveClient" className="rounded text-blue-500 focus:ring-blue-500" />
               <label htmlFor="saveClient" className="text-xs text-gray-500 cursor-pointer">Save Client</label>
            </div>
          </div>

          <div className="space-y-4">
            <TextField 
              label="Client Name" 
              placeholder="Client or Company Name" 
              value={formData.clientName}
              onChange={e => updateField('clientName', e.target.value)}
              error={errors.clientName}
              required
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField 
                label="Email" 
                type="email"
                placeholder="client@email.com" 
                value={formData.clientEmail}
                onChange={e => updateField('clientEmail', e.target.value)}
                error={errors.clientEmail}
                required
              />
              <TextField 
                label="Phone" 
                placeholder="+1 (555) 987-6543" 
                value={formData.clientPhone}
                onChange={e => updateField('clientPhone', e.target.value)}
                error={errors.clientPhone}
              />
            </div>
            <TextAreaField 
              label="Address" 
              placeholder="Client Address, City, State, ZIP"
              value={formData.clientAddress}
              onChange={e => updateField('clientAddress', e.target.value)}
              error={errors.clientAddress}
              required
            />
          </div>
        </div>
      </div>

      {/* Invoice Metadata */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Invoice Number <span className="text-red-500">*</span></label>
            <div className="flex items-center">
              <input
                type="text"
                className="w-16 px-2 py-2 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:z-10 text-center font-medium uppercase outline-none"
                value={formData.invoicePrefix}
                onChange={e => updateField('invoicePrefix', e.target.value)}
                maxLength={6}
              />
              <div className="px-2 py-2 border-y border-gray-300 bg-white text-gray-400 font-bold">-</div>
              <input
                type="text"
                readOnly
                className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 text-gray-600 cursor-default outline-none"
                value={formData.invoiceNumber}
              />
            </div>
          </div>

          <div className="relative">
             <TextField
               type="date"
               label="Issue Date"
               required
               value={formData.issueDate}
               onChange={e => updateField('issueDate', e.target.value)}
               error={errors.issueDate}
             />
          </div>

          <div className="flex flex-col gap-1.5">
             <SelectField
                label="Payment Terms"
                value={formData.paymentTerms}
                onChange={e => updateField('paymentTerms', e.target.value as PaymentTerms)}
             >
                {Object.values(PaymentTerms).map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
             </SelectField>
             {formData.paymentTerms === PaymentTerms.Custom && (
                <TextField 
                  placeholder="e.g. 50% Upfront"
                  value={formData.customPaymentTerms}
                  onChange={e => updateField('customPaymentTerms', e.target.value)}
                  className="mt-1"
                />
             )}
          </div>

          <div className="relative">
             <TextField
               type="date"
               label="Due Date"
               required
               value={formData.dueDate}
               onChange={e => updateField('dueDate', e.target.value)}
               error={errors.dueDate}
               min={formData.issueDate}
             />
          </div>

        </div>
      </div>

      {/* Line Items */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Desktop Table Header */}
        <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-100 p-4 border-b border-gray-200 text-sm font-semibold text-gray-700">
          <div className="col-span-6">Description</div>
          <div className="col-span-2 text-right">Quantity</div>
          <div className="col-span-2 text-right">Unit Price</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>

        <div className="divide-y divide-gray-100">
          {formData.items.map((item, index) => (
            <div key={item.id} className="p-4 transition-colors hover:bg-gray-50 group">
              {/* Mobile Card View Wrapper */}
              <div className="flex flex-col md:grid md:grid-cols-12 md:gap-4 md:items-start gap-3">
                
                {/* Description */}
                <div className="md:col-span-6 w-full">
                  <label className="md:hidden text-xs font-semibold text-gray-500 mb-1 block">Description</label>
                  <textarea
                    placeholder="Description of product or service"
                    className={`w-full p-2 bg-transparent border rounded md:border-transparent md:focus:border-blue-300 focus:ring-0 resize-y min-h-[2.5rem] outline-none ${errors[`item_${index}_desc`] ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    rows={1}
                  />
                  {errors[`item_${index}_desc`] && <span className="text-xs text-red-500">{errors[`item_${index}_desc`]}</span>}
                </div>

                {/* Quantity */}
                <div className="md:col-span-2 flex flex-col md:items-end">
                   <label className="md:hidden text-xs font-semibold text-gray-500 mb-1 block">Qty</label>
                   <input
                    type="number"
                    min="0"
                    step="0.1"
                    className="w-full md:w-24 p-2 text-right border rounded md:border-transparent md:bg-transparent md:focus:border-blue-300 focus:ring-0 outline-none"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </div>

                {/* Price */}
                <div className="md:col-span-2 flex flex-col md:items-end">
                   <label className="md:hidden text-xs font-semibold text-gray-500 mb-1 block">Price</label>
                   <div className="relative w-full md:w-32">
                     <span className="absolute left-3 top-2 text-gray-400">$</span>
                     <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full pl-6 p-2 text-right border rounded md:border-transparent md:bg-transparent md:focus:border-blue-300 focus:ring-0 outline-none"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    />
                   </div>
                </div>

                {/* Amount & Actions */}
                <div className="md:col-span-2 flex justify-between md:justify-end items-center md:items-start gap-4 pt-2 md:pt-2 border-t md:border-t-0 border-gray-100 mt-2 md:mt-0">
                  <span className="md:hidden font-bold text-gray-700">Total:</span>
                  <div className="font-bold text-gray-900">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={formData.items.length === 1}
                    className={`p-2 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors ${formData.items.length === 1 ? 'opacity-30 cursor-not-allowed' : ''}`}
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addItem}
          className="w-full py-3 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium flex items-center justify-center gap-2 transition-colors border-t border-blue-100"
        >
          <Plus className="w-4 h-4" /> Add Line Item
        </button>
      </div>

      {/* Summary Section */}
      <div className="flex flex-col md:flex-row justify-between gap-8">
        
        {/* Notes & Terms */}
        <div className="flex-1 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Notes
            </h3>
            <TextAreaField 
              placeholder="Any additional notes or special instructions..."
              value={formData.notes}
              onChange={e => updateField('notes', e.target.value)}
              className="bg-gray-50 min-h-[80px]"
            />
          </div>
          
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
             <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
               <AlertCircle className="w-4 h-4" /> Terms & Conditions
             </h3>
             <TextAreaField 
              placeholder="Payment terms, late fees, return policy..."
              value={formData.terms}
              onChange={e => updateField('terms', e.target.value)}
              className="bg-gray-50 min-h-[80px]"
            />
            <div className="mt-2 text-xs text-gray-500 flex gap-2">
               <button 
                 className="hover:text-blue-600 underline"
                 onClick={() => updateField('terms', "Payment is due within 30 days. Late payments subject to 1.5% monthly interest.")}
               >
                 Insert Standard Terms
               </button>
            </div>
          </div>
        </div>

        {/* Totals */}
        <div className="w-full md:w-96 bg-white rounded-xl p-6 border border-gray-200 shadow-sm h-fit">
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(calculateSubtotal())}</span>
            </div>
            
            <div className="flex justify-between items-center text-gray-600">
              <span className="flex items-center gap-2">
                Tax 
                <div className="relative w-16">
                  <input 
                    type="number" 
                    min="0" max="100"
                    className="w-full border rounded px-1 text-right text-xs py-0.5 focus:border-blue-500 outline-none"
                    value={formData.taxRate}
                    onChange={e => updateField('taxRate', parseFloat(e.target.value) || 0)}
                  />
                  <span className="absolute right-4 top-0.5 text-xs text-gray-400">%</span>
                </div>
              </span>
              <span>{formatCurrency(calculateSubtotal() * (formData.taxRate / 100))}</span>
            </div>

            <div className="flex justify-between items-center text-gray-600">
               <span className="flex items-center gap-2">
                Discount
                <div className="relative w-16">
                  <input 
                    type="number" 
                    min="0" max="100"
                    className="w-full border rounded px-1 text-right text-xs py-0.5 focus:border-blue-500 outline-none"
                    value={formData.discountRate}
                    onChange={e => updateField('discountRate', parseFloat(e.target.value) || 0)}
                  />
                  <span className="absolute right-4 top-0.5 text-xs text-gray-400">%</span>
                </div>
              </span>
              <span className="text-red-500">-{formatCurrency(calculateSubtotal() * (formData.discountRate / 100))}</span>
            </div>
            
            <div className="h-px bg-gray-200 my-4"></div>
            
            <div className="flex justify-between items-end">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <div className="text-right">
                 <span className="text-2xl font-bold text-blue-600">{formatCurrency(calculateTotal())}</span>
                 <p className="text-xs text-gray-400 mt-1">USD</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Action Bar (Sticky Bottom on Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:static md:bg-transparent md:border-0 md:p-0 z-50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-end items-center gap-4">
          <button 
             onClick={() => onCancel ? onCancel() : setFormData(INITIAL_STATE)}
             className="text-gray-500 hover:text-red-500 text-sm font-medium px-4 hidden md:block"
          >
            Cancel
          </button>
          
          <div className="flex w-full md:w-auto gap-3">
            <button 
              onClick={() => setIsPreviewMode(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>
            
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>
            
            <button 
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-[2] md:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Generate Invoice
                </>
              )}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};