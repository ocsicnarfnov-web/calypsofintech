import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Invoice } from '../../types/accounting';
import { useAccounting } from '../../context/AccountingContext';
import { formatCurrency, formatTin } from '../../utils/formatters';
import { Check, ShieldCheck } from 'lucide-react';

interface RecordPaymentModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentRecorded?: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onPaymentRecorded,
}) => {
  const { recordPayment } = useAccounting();

  const [amount, setAmount] = useState<number>(0);
  const [cwtAmount, setCwtAmount] = useState<number>(0);
  const [form2307Collected, setForm2307Collected] = useState<boolean>(true);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState<'bank_transfer' | 'check' | 'direct_deposit' | 'credit_card'>('bank_transfer');
  const [reference, setReference] = useState<string>('');
  const [officialReceiptNo, setOfficialReceiptNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (invoice) {
      setAmount(invoice.balanceDue);
      setCwtAmount(invoice.ewtAmount || 0);
      setReference(`BDO-TRF-${invoice.invoiceNumber.split('-')[2] || '001'}-${Math.floor(1000 + Math.random() * 9000)}`);
      setOfficialReceiptNo(`CR-2026-${Math.floor(10000 + Math.random() * 90000)}`);
      setForm2307Collected(invoice.ewtAmount > 0);
      setError(null);
    }
  }, [invoice]);

  if (!invoice) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0) {
      setError('Payment cash amount must be greater than zero.');
      return;
    }

    if (amount > invoice.balanceDue + 1.0) {
      setError(`Payment cannot exceed the balance due of ${formatCurrency(invoice.balanceDue)}.`);
      return;
    }

    if (!reference.trim()) {
      setError('Please provide a bank deposit reference or check number.');
      return;
    }

    const result = recordPayment(invoice.id, {
      amount: Number(amount),
      cwtWithheldAmount: Number(cwtAmount) || 0,
      method,
      reference: reference.trim(),
      officialReceiptNo: officialReceiptNo.trim() || undefined,
      form2307Collected,
      notes: notes.trim() || undefined,
      date,
    });

    if (result.success) {
      onPaymentRecorded?.();
      onClose();
    } else {
      setError(result.error || 'Failed to record payment.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Collection · ${invoice.invoiceNumber}`}
      subtitle={`Receives settlement from ${invoice.customerCompany} with BIR Form 2307 CWT deduction`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        {/* Invoice Summary */}
        <div className="p-3 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between font-mono">
          <div>
            <span className="text-[11px] text-neutral-400 block font-sans">Gross Invoice Total</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {formatCurrency(invoice.grossAmount)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-neutral-400 block font-sans">Net Cash Balance Due</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(invoice.balanceDue)}
            </span>
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Net Cash Received (₱) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={invoice.balanceDue}
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              BIR Form 2307 CWT Withheld (₱)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={cwtAmount}
              onChange={(e) => setCwtAmount(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>
        </div>

        {/* BIR Form 2307 Checkbox */}
        <div className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
          <label className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300">
            <input
              type="checkbox"
              checked={form2307Collected}
              onChange={(e) => setForm2307Collected(e.target.checked)}
              className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-950 dark:bg-neutral-800"
            />
            <span className="font-medium">
              Client furnished valid BIR Form 2307 Certificate (Creditable Tax Withheld)
            </span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Payment Settlement Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Settlement Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            >
              <option value="bank_transfer">BDO Online / PESONet Wire</option>
              <option value="direct_deposit">Direct Over-the-Counter Deposit</option>
              <option value="check">Crossed Corporate Check</option>
              <option value="credit_card">Corporate Credit Card</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Bank Ref / Deposit Trace *
            </label>
            <input
              type="text"
              placeholder="e.g. BDO-TRF-994812"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Collection Receipt (CR) #
            </label>
            <input
              type="text"
              placeholder="e.g. CR-2026-00089"
              value={officialReceiptNo}
              onChange={(e) => setOfficialReceiptNo(e.target.value)}
              className="w-full font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Settlement Notes
          </label>
          <input
            type="text"
            placeholder="Deposit confirmed in BDO BGC Operating Checking Account"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
          />
        </div>

        {/* Automatic BIR Double-Entry Journal Preview */}
        <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50 space-y-1.5 font-mono text-[11px]">
          <span className="font-semibold text-neutral-700 dark:text-neutral-300 block font-sans">
            Automatic BIR General Ledger Posting Preview
          </span>
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
            <span>DR 1010 Cash in Bank (Net Cash Collected)</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              +{formatCurrency(amount)}
            </span>
          </div>
          {cwtAmount > 0 && (
            <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400">
              <span>DR 1160 Creditable Withholding Tax (BIR Form 2307)</span>
              <span className="text-sky-600 dark:text-sky-400 font-semibold">
                +{formatCurrency(cwtAmount)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-neutral-600 dark:text-neutral-400 pt-1 border-t border-neutral-200 dark:border-neutral-700">
            <span>CR 1200 Accounts Receivable - Trade</span>
            <span className="text-neutral-800 dark:text-neutral-200 font-semibold">
              -{formatCurrency(amount + cwtAmount)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors font-medium"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Confirm & Post Collection</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
