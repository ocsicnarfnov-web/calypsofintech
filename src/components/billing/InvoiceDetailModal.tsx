import React from 'react';
import { Modal } from '../common/Modal';
import { Printer, CreditCard, Ban, ArrowUpRight, Copy, ShieldCheck, FileCheck } from 'lucide-react';
import { Invoice } from '../../types/accounting';
import { useAccounting } from '../../context/AccountingContext';
import { formatCurrency, formatDate, formatTin } from '../../utils/formatters';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordPayment: (invoice: Invoice) => void;
  onNavigateToLedgerEntry?: (entryNumber: string) => void;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onRecordPayment,
  onNavigateToLedgerEntry,
}) => {
  const { companyProfile, voidInvoice, journalEntries } = useAccounting();

  if (!invoice) return null;

  const associatedJE = journalEntries.find((je) => je.id === invoice.journalEntryId);

  const statusStyles = {
    paid: 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    partially_paid: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    issued: 'text-sky-700 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800',
    overdue: 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    draft: 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700',
    void: 'text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 line-through border-neutral-200',
  };

  const handlePrint = () => {
    window.print();
  };

  const handleVoid = () => {
    if (
      window.confirm(
        `Are you sure you want to cancel BIR Sales Invoice ${invoice.invoiceNumber}? This will reverse the posted General Ledger entry and flag the invoice as CANCELLED in the BIR Sales Journal.`
      )
    ) {
      voidInvoice(invoice.id);
      onClose();
    }
  };

  const handleCopyRemittance = () => {
    const text = `Invoice: ${invoice.invoiceNumber}\nNet Amount Due: ${formatCurrency(invoice.balanceDue)}\nCompany: ${companyProfile.legalName}\nTIN: ${companyProfile.tin}\nBank: ${companyProfile.bankDetails.bankName}\nAccount: ${companyProfile.bankDetails.accountNumber}`;
    navigator.clipboard?.writeText(text);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${invoice.invoiceNumber} · BIR VAT Sales Invoice`}
      subtitle={`Electronic Tax Invoice compliant with BIR CAS Regulations & RA 11976 (EOPT Act)`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Printable Official BIR Sales Invoice Document */}
        <div className="p-6 md:p-8 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs print:border-none print:p-0">
          {/* Header Row: Company Accreditation & Invoice Number */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-800">
            <div>
              <div className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                {companyProfile.legalName}
              </div>
              <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">Trade Name:</span> {companyProfile.tradeName}
                <br />
                {companyProfile.address.street}, {companyProfile.address.city}, {companyProfile.address.province} {companyProfile.address.zip}
                <br />
                <span className="font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                  TIN: {formatTin(companyProfile.tin)} VAT
                </span>
                <span className="text-neutral-300 dark:text-neutral-700 mx-1.5">·</span>
                <span>{companyProfile.rdoCode}</span>
                <br />
                <span className="text-neutral-500">Business Style: {companyProfile.businessStyle}</span>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-mono font-bold tracking-widest text-neutral-900 dark:text-neutral-100 block">
                VAT SALES INVOICE
              </span>
              <div className="text-xl font-mono font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
                {invoice.invoiceNumber}
              </div>
              <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize font-sans tracking-wide">
                <span className={statusStyles[invoice.status] || ''}>
                  {invoice.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>

          {/* Customer / Buyer BIR Information Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-neutral-200 dark:border-neutral-800 text-xs">
            <div className="space-y-1">
              <div>
                <span className="text-neutral-400 font-medium">Sold To: </span>
                <span className="font-bold text-neutral-900 dark:text-neutral-100">
                  {invoice.customerCompany}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Attention: </span>
                <span className="text-neutral-700 dark:text-neutral-300">{invoice.customerName}</span>
              </div>
              <div>
                <span className="text-neutral-400">Address: </span>
                <span className="text-neutral-700 dark:text-neutral-300">
                  {invoice.customerAddress.street}, {invoice.customerAddress.city}, {invoice.customerAddress.province} {invoice.customerAddress.zip}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 font-medium">Customer TIN: </span>
                <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatTin(invoice.customerTin)}
                </span>
              </div>
              <div>
                <span className="text-neutral-400">Business Style: </span>
                <span className="text-neutral-700 dark:text-neutral-300">{invoice.customerBusinessStyle}</span>
              </div>
            </div>

            <div className="space-y-1 sm:text-right font-mono">
              <div>
                <span className="text-neutral-400 font-sans">Date of Invoice: </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {formatDate(invoice.issueDate)}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 font-sans">Payment Due Date: </span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100">
                  {formatDate(invoice.dueDate)}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 font-sans">Payment Terms: </span>
                <span className="capitalize text-neutral-800 dark:text-neutral-200">
                  {invoice.paymentTerms.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-neutral-400 font-sans">Withholding Tax Form: </span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  BIR Form 2307 ({invoice.ewtRate}%)
                </span>
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="py-4">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-medium pb-2">
                  <th className="py-2 font-normal">Item Description</th>
                  <th className="py-2 text-right font-normal w-16">Qty</th>
                  <th className="py-2 text-right font-normal w-28">Unit Price</th>
                  <th className="py-2 text-center font-normal w-24">VAT Type</th>
                  <th className="py-2 text-right font-normal w-28">Amount (Net)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 font-mono">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 font-sans">
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        {item.description}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono">
                        GL Code: {item.accountCode}
                      </div>
                    </td>
                    <td className="py-2.5 text-right text-neutral-700 dark:text-neutral-300">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 text-right text-neutral-700 dark:text-neutral-300">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-2.5 text-center text-[11px] font-sans">
                      <span className="capitalize text-neutral-500">
                        {item.vatType === 'vatable' ? '12% VAT' : item.vatType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Standard BIR Statutory Sales Breakdown Matrix */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left: BIR VAT Assessment Box */}
            <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 font-mono space-y-1.5">
              <span className="font-bold text-neutral-900 dark:text-neutral-100 block font-sans uppercase tracking-wider text-[11px]">
                BIR VAT Sales Analysis
              </span>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>VATable Sales:</span>
                <span className="tabular-nums font-semibold text-neutral-900 dark:text-neutral-100">
                  {formatCurrency(invoice.vatableSales)}
                </span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>VAT-Exempt Sales:</span>
                <span className="tabular-nums">{formatCurrency(invoice.vatExemptSales)}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Zero-Rated Sales (0%):</span>
                <span className="tabular-nums">{formatCurrency(invoice.zeroRatedSales)}</span>
              </div>
              <div className="flex justify-between text-neutral-800 dark:text-neutral-200 font-semibold pt-1 border-t border-neutral-200 dark:border-neutral-700">
                <span>Value Added Tax (12%):</span>
                <span className="tabular-nums">{formatCurrency(invoice.outputVat)}</span>
              </div>
            </div>

            {/* Right: Payment Settlement Calculation & EWT Deduction */}
            <div className="space-y-1.5 font-mono text-xs tabular-nums p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60">
              <div className="flex justify-between font-semibold text-neutral-900 dark:text-neutral-100">
                <span>Total Gross Sales (VAT Inclusive):</span>
                <span>{formatCurrency(invoice.grossAmount)}</span>
              </div>
              {invoice.ewtAmount > 0 && (
                <div className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>Less: Creditable Withholding Tax (2307 {invoice.ewtRate}%):</span>
                  <span>-{formatCurrency(invoice.ewtAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-neutral-900 dark:text-neutral-100 pt-1.5 border-t border-neutral-300 dark:border-neutral-700">
                <span>Net Cash Settlement Due:</span>
                <span>{formatCurrency(invoice.netAmountDue)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                <span>Total Cash Paid to Date:</span>
                <span>-{formatCurrency(invoice.amountPaid)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-neutral-900 dark:text-neutral-100 pt-1 border-t-2 border-neutral-900 dark:border-neutral-100">
                <span>Current Balance Due:</span>
                <span>{formatCurrency(invoice.balanceDue)}</span>
              </div>
            </div>
          </div>

          {/* BIR CAS Permit & Statutory Printing Footer Notice */}
          <div className="mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 text-[10px] text-neutral-500 space-y-1 leading-relaxed">
            <div className="font-mono text-neutral-600 dark:text-neutral-400 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>BIR CAS Acknowledgement Certificate: {companyProfile.casPermitNo}</span>
              <span>·</span>
              <span>Date Issued: {companyProfile.casDateIssued}</span>
              <span>·</span>
              <span>Series Range: {companyProfile.invoiceSeriesStart} to {companyProfile.invoiceSeriesEnd}</span>
            </div>
            <p className="italic text-neutral-400">
              "Pursuant to Republic Act No. 11976 (Ease of Paying Taxes Act) and Revenue Regulations No. 7-2024, this Sales Invoice serves as the primary accounting document for both sales of goods and services."
            </p>
          </div>

          {/* Associated General Ledger Posting Info */}
          {associatedJE && (
            <div className="mt-4 pt-3 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-mono border-t border-neutral-100 dark:border-neutral-800">
              <span>General Ledger Posting: {associatedJE.entryNumber}</span>
              {onNavigateToLedgerEntry && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onNavigateToLedgerEntry(associatedJE.entryNumber);
                  }}
                  className="inline-flex items-center gap-1 text-neutral-700 dark:text-neutral-300 hover:underline"
                >
                  <span>Inspect General Journal Entry</span>
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Official Tax Invoice</span>
            </button>
            <button
              type="button"
              onClick={handleCopyRemittance}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Bank Details</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {invoice.status !== 'void' && invoice.status !== 'paid' && invoice.balanceDue > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRecordPayment(invoice);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Record Collection / Payment</span>
              </button>
            )}

            {invoice.status !== 'void' && invoice.amountPaid === 0 && (
              <button
                type="button"
                onClick={handleVoid}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200 dark:border-rose-900 transition-colors"
              >
                <Ban className="h-3.5 w-3.5" />
                <span>Cancel / Void Invoice</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
