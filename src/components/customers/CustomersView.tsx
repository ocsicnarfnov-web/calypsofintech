import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { Customer, Invoice } from '../../types/accounting';
import { formatCurrency, formatTin } from '../../utils/formatters';
import { Search, Plus, Edit, FileText, Building2, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

interface CustomersViewProps {
  onOpenCustomerModal: (customer?: Customer) => void;
  onOpenInvoiceModalWithCustomer: (customerId: string) => void;
  onSelectInvoice: (invoice: Invoice) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  onOpenCustomerModal,
  onOpenInvoiceModalWithCustomer,
  onSelectInvoice,
}) => {
  const { customers, invoices } = useAccounting();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');

  const filteredCustomers = customers.filter(
    (c) =>
      c.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tin.includes(searchTerm)
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const customerInvoices = invoices.filter((i) => i.customerId === selectedCustomer?.id);
  const totalBilled = customerInvoices.reduce((sum, i) => sum + i.grossAmount, 0);
  const totalOutstanding = customerInvoices.reduce((sum, i) => sum + i.balanceDue, 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search company, contact, or BIR TIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden"
          />
        </div>

        <button
          type="button"
          onClick={() => onOpenCustomerModal()}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors shrink-0 font-medium"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Register Taxpayer Customer</span>
        </button>
      </div>

      {/* Two-Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Customer Directory Column */}
        <div className="lg:col-span-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs divide-y divide-neutral-200 dark:border-neutral-800">
          <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Registered Taxpayers ({filteredCustomers.length})
          </div>

          <div className="max-h-[600px] overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/60">
            {filteredCustomers.map((cust) => {
              const custInvs = invoices.filter((i) => i.customerId === cust.id);
              const outstanding = custInvs.reduce((sum, i) => sum + i.balanceDue, 0);
              const isSelected = cust.id === selectedCustomerId;

              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomerId(cust.id)}
                  className={`p-3.5 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-neutral-100/90 dark:bg-neutral-800 text-neutral-900 dark:text-white'
                      : 'hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {cust.company}
                      </div>
                      <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                        TIN: {formatTin(cust.tin)}
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                        {formatCurrency(outstanding)}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-sans">
                        {outstanding > 0 ? 'Receivable' : 'Settled'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Customer Tax Dossier Column */}
        {selectedCustomer && (
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                    {selectedCustomer.company}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    <span>Contact: {selectedCustomer.name}</span>
                    <span>·</span>
                    <span className="capitalize">{selectedCustomer.paymentTerms.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenCustomerModal(selectedCustomer)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Edit TIN Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenInvoiceModalWithCustomer(selectedCustomer.id)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Issue Tax Invoice</span>
                  </button>
                </div>
              </div>

              {/* BIR Tax Identifiers Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50">
                  <span className="text-[11px] text-neutral-400 font-sans block">BIR TIN & Branch</span>
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 mt-0.5 block truncate">
                    {formatTin(selectedCustomer.tin)}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50">
                  <span className="text-[11px] text-neutral-400 font-sans block">Tax Classification</span>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5 block font-sans">
                    {selectedCustomer.isVatRegistered ? 'VAT Registered' : 'Non-VAT'}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50">
                  <span className="text-[11px] text-neutral-400 font-sans block">Trade Receivables</span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5 block tabular-nums">
                    {formatCurrency(totalOutstanding)}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50">
                  <span className="text-[11px] text-neutral-400 font-sans block">Lifetime Invoiced</span>
                  <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5 block tabular-nums">
                    {formatCurrency(totalBilled)}
                  </span>
                </div>
              </div>

              {/* Business Style & Address */}
              <div className="text-xs text-neutral-600 dark:text-neutral-300 space-y-2 pt-2">
                <div>
                  <span className="text-neutral-400 font-medium">Registered Business Style: </span>
                  <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                    {selectedCustomer.businessStyle}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-neutral-400 shrink-0 mt-0.5" />
                  <span>
                    {selectedCustomer.address.street}, {selectedCustomer.address.city}, {selectedCustomer.address.province} {selectedCustomer.address.zip}, {selectedCustomer.address.country}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-neutral-500">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Mail className="h-3 w-3 text-neutral-400" />
                    <span>{selectedCustomer.email}</span>
                  </div>
                  {selectedCustomer.phone && (
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <Phone className="h-3 w-3 text-neutral-400" />
                      <span>{selectedCustomer.phone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Invoices History Table */}
            <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
              <div className="p-3 bg-neutral-50 dark:bg-neutral-800/50 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                Sales Invoices Issued ({customerInvoices.length})
              </div>

              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-medium">
                    <th className="py-2.5 px-3">SI #</th>
                    <th className="py-2.5 px-2">Due Date</th>
                    <th className="py-2.5 px-2 text-right">Gross Total</th>
                    <th className="py-2.5 px-2 text-right">Balance Due</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                  {customerInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-neutral-400 font-sans">
                        No invoices issued for this client yet.
                      </td>
                    </tr>
                  ) : (
                    customerInvoices.map((inv) => (
                      <tr
                        key={inv.id}
                        onClick={() => onSelectInvoice(inv)}
                        className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-3 font-semibold text-neutral-900 dark:text-neutral-100">
                          {inv.invoiceNumber}
                        </td>
                        <td className="py-2.5 px-2 text-neutral-600 dark:text-neutral-400">
                          {inv.dueDate}
                        </td>
                        <td className="py-2.5 px-2 text-right tabular-nums text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(inv.grossAmount)}
                        </td>
                        <td className="py-2.5 px-2 text-right tabular-nums font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(inv.balanceDue)}
                        </td>
                        <td className="py-2.5 px-3 font-sans capitalize text-[11px]">
                          {inv.status.replace('_', ' ')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
