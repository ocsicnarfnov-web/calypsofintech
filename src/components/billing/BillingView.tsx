import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { Invoice } from '../../types/accounting';
import { formatCurrency, formatDate, formatTin } from '../../utils/formatters';
import {
  Search,
  Plus,
  CreditCard,
  Eye,
  Play,
  RotateCw,
  Receipt,
  Clock,
  CheckCircle,
  FileCheck2,
} from 'lucide-react';

interface BillingViewProps {
  onOpenInvoiceModal: () => void;
  onSelectInvoice: (invoice: Invoice) => void;
  onRecordPayment: (invoice: Invoice) => void;
  onNavigateToLedgerEntry?: (entryNumber: string) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  onOpenInvoiceModal,
  onSelectInvoice,
  onRecordPayment,
  onNavigateToLedgerEntry,
}) => {
  const {
    invoices,
    recurringSchedules,
    toggleRecurringSchedule,
    runRecurringSchedule,
    journalEntries,
    companyProfile,
  } = useAccounting();

  const [activeTab, setActiveTab] = useState<'invoices' | 'recurring' | 'payments'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter invoices
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerCompany.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerTin.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Collect all settled payments across all invoices
  const allPayments = invoices
    .flatMap((inv) =>
      (inv.payments || []).map((p) => ({
        ...p,
        invoiceNumber: inv.invoiceNumber,
        customerCompany: inv.customerCompany,
        customerTin: inv.customerTin,
        invoiceId: inv.id,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const statusStyles: Record<string, string> = {
    paid: 'text-emerald-700 dark:text-emerald-400',
    partially_paid: 'text-amber-700 dark:text-amber-400',
    issued: 'text-sky-700 dark:text-sky-400',
    overdue: 'text-rose-700 dark:text-rose-400 font-medium',
    draft: 'text-neutral-500 dark:text-neutral-400',
    void: 'text-neutral-400 dark:text-neutral-500 line-through',
  };

  return (
    <div className="space-y-6">
      {/* Top Segmented Navigation & Action Strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="inline-flex p-1 rounded-lg bg-neutral-200/70 dark:bg-neutral-800/80 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'invoices'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Sales Invoices ({invoices.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('recurring')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'recurring'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Contract Retainers ({recurringSchedules.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeTab === 'payments'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Collections & Form 2307 Log ({allPayments.length})
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenInvoiceModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Issue BIR Sales Invoice</span>
        </button>
      </div>

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search SI #, client, TIN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
              {['all', 'issued', 'partially_paid', 'paid', 'overdue', 'draft'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 rounded-md capitalize transition-colors whitespace-nowrap text-xs ${
                    statusFilter === status
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 font-medium border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3 px-4 font-normal">SI #</th>
                  <th className="py-3 px-3 font-normal">Buyer / Entity</th>
                  <th className="py-3 px-3 font-normal">Buyer TIN</th>
                  <th className="py-3 px-3 font-normal">Date</th>
                  <th className="py-3 px-3 text-right font-normal">Gross Total (12% VAT)</th>
                  <th className="py-3 px-3 text-right font-normal">Balance Due</th>
                  <th className="py-3 px-3 font-normal">Status</th>
                  <th className="py-3 px-4 text-right font-normal">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-neutral-400 font-sans">
                      No invoices found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-3 font-sans">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-xs">
                          {inv.customerCompany}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate">{inv.customerName}</div>
                      </td>
                      <td className="py-3.5 px-3 text-neutral-600 dark:text-neutral-400">
                        {formatTin(inv.customerTin)}
                      </td>
                      <td className="py-3.5 px-3 text-neutral-600 dark:text-neutral-400">
                        {formatDate(inv.issueDate)}
                      </td>
                      <td className="py-3.5 px-3 text-right tabular-nums text-neutral-900 dark:text-neutral-100 font-medium">
                        {formatCurrency(inv.grossAmount)}
                      </td>
                      <td className="py-3.5 px-3 text-right tabular-nums font-semibold text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(inv.balanceDue)}
                      </td>
                      <td className="py-3.5 px-3 font-sans capitalize text-[11px]">
                        <span className={statusStyles[inv.status]}>
                          {inv.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <button
                            type="button"
                            onClick={() => onSelectInvoice(inv)}
                            className="p-1 rounded text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title="Inspect official BIR tax invoice"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {inv.status !== 'void' && inv.status !== 'paid' && inv.balanceDue > 0 && (
                            <button
                              type="button"
                              onClick={() => onRecordPayment(inv)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
                            >
                              <CreditCard className="h-3 w-3" />
                              <span>Collect</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Retainers Tab */}
      {activeTab === 'recurring' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                Automated Contract Retainers & Recurring Invoicing
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400 mt-0.5">
                Generates BIR Sales Invoices automatically and records 12% Output VAT in the Sales Journal.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 font-medium border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3 px-4 font-normal">Retainer Title</th>
                  <th className="py-3 px-3 font-normal">Customer</th>
                  <th className="py-3 px-3 font-normal">Cadence</th>
                  <th className="py-3 px-3 text-right font-normal">Amount (Gross)</th>
                  <th className="py-3 px-3 font-normal">Next Billing Date</th>
                  <th className="py-3 px-3 font-normal">Status</th>
                  <th className="py-3 px-4 text-right font-normal">Execution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
                {recurringSchedules.map((sch) => (
                  <tr key={sch.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30">
                    <td className="py-3.5 px-4 font-sans font-medium text-neutral-900 dark:text-neutral-100">
                      {sch.title}
                    </td>
                    <td className="py-3.5 px-3 font-sans text-neutral-700 dark:text-neutral-300">
                      {sch.customerName}
                    </td>
                    <td className="py-3.5 px-3 font-sans capitalize text-neutral-600 dark:text-neutral-400">
                      {sch.cadence}
                    </td>
                    <td className="py-3.5 px-3 text-right font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                      {formatCurrency(sch.amount)}
                    </td>
                    <td className="py-3.5 px-3 text-neutral-600 dark:text-neutral-400">
                      {formatDate(sch.nextRunDate)}
                    </td>
                    <td className="py-3.5 px-3 font-sans text-xs">
                      <button
                        type="button"
                        onClick={() => toggleRecurringSchedule(sch.id)}
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          sch.status === 'active'
                            ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40'
                            : 'text-neutral-500 bg-neutral-100 dark:bg-neutral-800'
                        }`}
                      >
                        <span className="capitalize">{sch.status}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <button
                        type="button"
                        onClick={() => {
                          const res = runRecurringSchedule(sch.id);
                          if (res.success) {
                            alert(`Generated and posted BIR Sales Invoice from retainer: ${sch.title}`);
                          }
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
                      >
                        <Play className="h-3 w-3" />
                        <span>Run Now</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payments Log Tab with Form 2307 indicators */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 font-medium border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-3 px-4 font-normal">Date</th>
                  <th className="py-3 px-3 font-normal">Payment Ref / CR #</th>
                  <th className="py-3 px-3 font-normal">Applied SI</th>
                  <th className="py-3 px-3 font-normal">Buyer TIN</th>
                  <th className="py-3 px-3 text-right font-normal">Cash Deposited (₱)</th>
                  <th className="py-3 px-3 text-right font-normal">BIR Form 2307 CWT (₱)</th>
                  <th className="py-3 px-4 text-right font-normal">GL Posting</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
                {allPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-neutral-400 font-sans">
                      No collections recorded yet.
                    </td>
                  </tr>
                ) : (
                  allPayments.map((p) => {
                    const je = journalEntries.find((j) => j.id === p.journalEntryId);
                    return (
                      <tr key={p.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30">
                        <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-400">
                          {formatDate(p.date)}
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                            {p.reference}
                          </span>
                          {p.officialReceiptNo && (
                            <span className="text-[10px] text-neutral-400 block font-sans">
                              {p.officialReceiptNo}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-neutral-800 dark:text-neutral-200">
                          {p.invoiceNumber}
                        </td>
                        <td className="py-3.5 px-3 text-neutral-600 dark:text-neutral-400">
                          {formatTin(p.customerTin)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-3.5 px-3 text-right font-medium text-sky-700 dark:text-sky-400 tabular-nums">
                          {p.cwtWithheldAmount ? formatCurrency(p.cwtWithheldAmount) : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {je && onNavigateToLedgerEntry ? (
                            <button
                              type="button"
                              onClick={() => onNavigateToLedgerEntry(je.entryNumber)}
                              className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white underline"
                            >
                              {je.entryNumber}
                            </button>
                          ) : (
                            <span className="text-neutral-400">Posted</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
