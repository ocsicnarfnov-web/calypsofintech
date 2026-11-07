import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Plus, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { JournalEntryLine, JournalSource } from '../../types/accounting';
import { formatCurrency } from '../../utils/formatters';

interface JournalEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEntryCreated?: (id: string) => void;
}

export const JournalEntryModal: React.FC<JournalEntryModalProps> = ({
  isOpen,
  onClose,
  onEntryCreated,
}) => {
  const { accounts, journalEntries, addJournalEntry } = useAccounting();

  const nextEntryNumber = `JE-2026-${String(journalEntries.length + 1).padStart(4, '0')}`;

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [source, setSource] = useState<JournalSource>('manual');
  const [createdBy, setCreatedBy] = useState<string>('Staff Accountant');
  const [lines, setLines] = useState<JournalEntryLine[]>([
    {
      id: 'line-1',
      accountCode: accounts[0]?.code || '1010',
      accountName: accounts[0]?.name || 'Operating Cash',
      debit: 0,
      credit: 0,
      memo: '',
    },
    {
      id: 'line-2',
      accountCode: accounts[1]?.code || '1200',
      accountName: accounts[1]?.name || 'Accounts Receivable',
      debit: 0,
      credit: 0,
      memo: '',
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: `line-${Date.now()}-${prev.length + 1}`,
        accountCode: accounts[0]?.code || '1010',
        accountName: accounts[0]?.name || 'Operating Cash',
        debit: 0,
        credit: 0,
        memo: '',
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateLine = (index: number, field: keyof JournalEntryLine, value: any) => {
    setLines((prev) =>
      prev.map((line, i) => {
        if (i !== index) return line;
        if (field === 'accountCode') {
          const acc = accounts.find((a) => a.code === value);
          return {
            ...line,
            accountCode: value,
            accountName: acc?.name || line.accountName,
          };
        }
        return { ...line, [field]: value };
      })
    );
  };

  // Calculations
  const totalDebits = lines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
  const totalCredits = lines.reduce((acc, l) => acc + (Number(l.credit) || 0), 0);
  const difference = Math.abs(totalDebits - totalCredits);
  const isBalanced = difference < 0.01 && (totalDebits > 0 || totalCredits > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError('Please provide a journal entry description or purpose.');
      return;
    }

    if (totalDebits === 0 && totalCredits === 0) {
      setError('Journal entry amounts cannot be zero.');
      return;
    }

    if (!isBalanced) {
      setError(
        `Debits and Credits must balance. Total Debits: ${formatCurrency(
          totalDebits
        )}, Total Credits: ${formatCurrency(totalCredits)}. Variance: ${formatCurrency(difference)}.`
      );
      return;
    }

    const result = addJournalEntry({
      entryNumber: nextEntryNumber,
      date,
      description: description.trim(),
      source,
      status: 'posted',
      lines: lines.map((l) => ({
        ...l,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
      })),
      createdBy,
    });

    if (result.success) {
      onEntryCreated?.(nextEntryNumber);
      onClose();
    } else {
      setError(result.error || 'Failed to post journal entry.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Double-Entry Journal Transaction"
      subtitle="Posts immutable debit and credit pairs to the General Ledger"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Entry Identifier
            </label>
            <input
              type="text"
              readOnly
              value={nextEntryNumber}
              className="w-full font-mono rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800/60 px-3 py-2 text-neutral-500 dark:text-neutral-400"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Posting Date
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
              Journal Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as JournalSource)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            >
              <option value="manual">Manual Adjustment</option>
              <option value="payroll_accrual">Payroll Accrual</option>
              <option value="bill_payable">Vendor Accounts Payable</option>
              <option value="invoice_issued">Invoice Issuance</option>
              <option value="payment_received">Payment Settlement</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Author / Approver
            </label>
            <input
              type="text"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Memo / Purpose Description
          </label>
          <input
            type="text"
            placeholder="e.g. Monthly server hardware depreciation or prepaid insurance amortization"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
          />
        </div>

        {/* Lines Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Journal Lines (Debits & Credits)
            </span>
            <button
              type="button"
              onClick={handleAddLine}
              className="inline-flex items-center gap-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white"
            >
              <Plus className="h-3 w-3" />
              <span>Add Line</span>
            </button>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100/70 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 font-medium border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-2 px-3 w-56">Account</th>
                  <th className="py-2 px-2">Line Memo</th>
                  <th className="py-2 px-2 w-32 text-right">Debit ($)</th>
                  <th className="py-2 px-2 w-32 text-right">Credit ($)</th>
                  <th className="py-2 px-1 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
                {lines.map((line, idx) => (
                  <tr key={line.id} className="bg-white dark:bg-neutral-900">
                    <td className="p-2 font-sans">
                      <select
                        value={line.accountCode}
                        onChange={(e) => handleUpdateLine(idx, 'accountCode', e.target.value)}
                        className="w-full text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-transparent px-2 py-1 text-neutral-900 dark:text-neutral-100"
                      >
                        {accounts.map((a) => (
                          <option key={a.code} value={a.code} className="bg-white dark:bg-neutral-900">
                            {a.code} - {a.name} ({a.type})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2 font-sans">
                      <input
                        type="text"
                        placeholder="Optional memo"
                        value={line.memo || ''}
                        onChange={(e) => handleUpdateLine(idx, 'memo', e.target.value)}
                        className="w-full text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-transparent px-2 py-1 text-neutral-900 dark:text-neutral-100"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.debit || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          handleUpdateLine(idx, 'debit', val);
                          if (val > 0) handleUpdateLine(idx, 'credit', 0);
                        }}
                        placeholder="0.00"
                        className="w-full text-right text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-transparent px-2 py-1 text-neutral-900 dark:text-neutral-100 font-semibold"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.credit || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          handleUpdateLine(idx, 'credit', val);
                          if (val > 0) handleUpdateLine(idx, 'debit', 0);
                        }}
                        placeholder="0.00"
                        className="w-full text-right text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-transparent px-2 py-1 text-neutral-900 dark:text-neutral-100 font-semibold"
                      />
                    </td>
                    <td className="p-2 text-center">
                      {lines.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Balancing Summary Bar */}
        <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-3">
            {isBalanced ? (
              <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>Double-Entry Balanced ($0.00 variance)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-semibold">
                <AlertCircle className="h-4 w-4" />
                <span>Imbalance Variance: {formatCurrency(difference)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 text-xs tabular-nums">
            <div>
              <span className="text-neutral-400 mr-2">Total Debits:</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {formatCurrency(totalDebits)}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 mr-2">Total Credits:</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {formatCurrency(totalCredits)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isBalanced}
            className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors"
          >
            Post Journal Entry
          </button>
        </div>
      </form>
    </Modal>
  );
};
