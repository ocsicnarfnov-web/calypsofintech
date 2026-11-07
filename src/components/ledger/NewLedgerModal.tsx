import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAccounting } from '../../context/AccountingContext';
import { BookOpen, Check, AlertCircle, Building2 } from 'lucide-react';
import { LedgerType, GeneralLedgerBook } from '../../types/accounting';

interface NewLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLedgerCreated?: (ledger: GeneralLedgerBook) => void;
}

export const NewLedgerModal: React.FC<NewLedgerModalProps> = ({
  isOpen,
  onClose,
  onLedgerCreated,
}) => {
  const { companies, activeCompanyId, addLedger } = useAccounting();

  const [companyId, setCompanyId] = useState(activeCompanyId);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState<LedgerType>('statutory');
  const [currency, setCurrency] = useState('PHP');
  const [fiscalYear, setFiscalYear] = useState(new Date().getFullYear().toString());
  const [isPrimary, setIsPrimary] = useState(false);
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-generate suggested ledger code based on name and year
  const handleNameChange = (val: string) => {
    setName(val);
    if (!code) {
      const acronym = val
        .split(' ')
        .filter((w) => w.length > 2)
        .map((w) => w.charAt(0).toUpperCase())
        .join('')
        .slice(0, 4);
      setCode(`GL-${fiscalYear}-${acronym || 'BOOK'}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setErrorMsg('Ledger Name and Ledger Code are mandatory.');
      return;
    }

    const currencySymbols: Record<string, string> = {
      PHP: '₱',
      USD: '$',
      EUR: '€',
      SGD: 'S$',
    };

    const created = addLedger({
      companyId: companyId || activeCompanyId,
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type,
      currency,
      currencySymbol: currencySymbols[currency] || '₱',
      fiscalYear,
      isPrimary,
      status: 'active',
      description:
        description.trim() ||
        `${type.toUpperCase()} General Ledger Book for FY ${fiscalYear} (${currency}).`,
    });

    if (onLedgerCreated) {
      onLedgerCreated(created);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New General Ledger Book"
      subtitle="Establish a new statutory, management, or multi-currency accounting ledger"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-neutral-600 dark:text-neutral-300">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Company Entity Association */}
        <div>
          <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
            Company Entity *
          </label>
          <select
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
          >
            {companies.map((c) => (
              <option key={c.id || c.tin} value={c.id || 'comp-001'}>
                {c.name} ({c.tin}) · {c.rdoCode.split('-')[0].trim()}
              </option>
            ))}
          </select>
        </div>

        {/* Ledger Name & Code */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              General Ledger Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. FY 2026 Primary Statutory General Ledger"
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Ledger Code *
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="GL-2026-PHP"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
              required
            />
          </div>
        </div>

        {/* Ledger Type, Currency & Fiscal Year */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Ledger Book Type *
            </label>
            <select
              value={type}
              onChange={(e) => {
                const nextType = e.target.value as LedgerType;
                setType(nextType);
                if (nextType === 'statutory') setIsPrimary(true);
              }}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none"
            >
              <option value="statutory">Statutory (BIR CAS RR 9-2009)</option>
              <option value="management">Management & Budgeting</option>
              <option value="currency">Multi-Currency / Foreign Book</option>
              <option value="subsidiary">Subsidiary / Branch Ledger</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Functional Currency *
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none"
            >
              <option value="PHP">PHP (₱ - Philippine Peso)</option>
              <option value="USD">USD ($ - United States Dollar)</option>
              <option value="EUR">EUR (€ - Euro)</option>
              <option value="SGD">SGD (S$ - Singapore Dollar)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
              Fiscal Year *
            </label>
            <input
              type="text"
              value={fiscalYear}
              onChange={(e) => setFiscalYear(e.target.value)}
              placeholder="2026"
              className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Primary Statutory Checkbox */}
        <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 flex items-start gap-2.5">
          <input
            type="checkbox"
            id="isPrimaryCheckbox"
            checked={isPrimary}
            onChange={(e) => setIsPrimary(e.target.checked)}
            className="mt-0.5 rounded border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:ring-0"
          />
          <label htmlFor="isPrimaryCheckbox" className="cursor-pointer">
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 block text-xs">
              Mark as Primary Statutory Book
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mt-0.5">
              Designate this ledger as the primary official book for Bureau of Internal Revenue (BIR) Computerized Accounting System audits.
            </span>
          </label>
        </div>

        {/* Description / Memo */}
        <div>
          <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
            Accounting Purpose & Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Document scope, purpose, or accounting policy notes for this ledger book..."
            className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <span className="text-[11px] text-neutral-400 font-mono">
            {code || 'GL-CODE'} · {currency}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Create Ledger Book</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
