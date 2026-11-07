import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Account, AccountType, AccountSubtype, NormalBalance } from '../../types/accounting';
import { useAccounting } from '../../context/AccountingContext';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
  const { addAccount } = useAccounting();

  const [code, setCode] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<AccountType>('expense');
  const [subtype, setSubtype] = useState<AccountSubtype>('operating_expense');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const normalBalance: NormalBalance = type === 'asset' || type === 'expense' ? 'debit' : 'credit';

  const subtypesByType: Record<AccountType, { value: AccountSubtype; label: string }[]> = {
    asset: [
      { value: 'cash', label: 'Cash & Cash Equivalents' },
      { value: 'accounts_receivable', label: 'Accounts Receivable' },
      { value: 'current_asset', label: 'Other Current Asset' },
      { value: 'fixed_asset', label: 'Property & Equipment' },
    ],
    liability: [
      { value: 'accounts_payable', label: 'Accounts Payable' },
      { value: 'tax_payable', label: 'Tax Obligations Payable' },
      { value: 'deferred_revenue', label: 'Deferred Revenue' },
      { value: 'current_liability', label: 'Short-Term Liability' },
      { value: 'long_term_liability', label: 'Long-Term Debt' },
    ],
    equity: [
      { value: 'owners_equity', label: "Owner's Contributed Capital" },
      { value: 'retained_earnings', label: 'Retained Earnings' },
    ],
    revenue: [
      { value: 'subscription_revenue', label: 'Subscription SaaS Revenue' },
      { value: 'service_revenue', label: 'Professional Services' },
      { value: 'operating_revenue', label: 'Other Operating Revenue' },
    ],
    expense: [
      { value: 'cost_of_goods_sold', label: 'Cost of Goods Sold (Hosting/Infra)' },
      { value: 'operating_expense', label: 'General Operating Expense' },
      { value: 'payroll_expense', label: 'Payroll & Compensation' },
      { value: 'software_expense', label: 'Software & Cloud Tools' },
      { value: 'legal_expense', label: 'Legal & Professional Fees' },
    ],
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim() || !name.trim()) {
      setError('Please specify both an account code and name.');
      return;
    }

    const newAccount: Account = {
      code: code.trim(),
      name: name.trim(),
      type,
      subtype,
      normalBalance,
      description: description.trim(),
      isActive: true,
      isSystem: false,
    };

    const res = addAccount(newAccount);
    if (res.success) {
      setCode('');
      setName('');
      setDescription('');
      onClose();
    } else {
      setError(res.error || 'Failed to add account.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Account to Chart of Accounts"
      subtitle="Defines a new general ledger classification with standardized GAAP normal balance"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Account Code
            </label>
            <input
              type="text"
              placeholder="e.g. 6050"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Account Type
            </label>
            <select
              value={type}
              onChange={(e) => {
                const newType = e.target.value as AccountType;
                setType(newType);
                setSubtype(subtypesByType[newType][0].value);
              }}
              className="w-full capitalize rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            >
              <option value="asset">Asset (1000s)</option>
              <option value="liability">Liability (2000s)</option>
              <option value="equity">Equity (3000s)</option>
              <option value="revenue">Revenue (4000s)</option>
              <option value="expense">Expense (5000s-6000s)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Account Name
          </label>
          <input
            type="text"
            placeholder="e.g. Cloud Security Audit Compliance"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Account Subtype
          </label>
          <select
            value={subtype}
            onChange={(e) => setSubtype(e.target.value as AccountSubtype)}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
          >
            {subtypesByType[type].map((st) => (
              <option key={st.value} value={st.value}>
                {st.label}
              </option>
            ))}
          </select>
        </div>

        <div className="p-3 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 font-mono text-[11px] flex justify-between">
          <span className="text-neutral-500">Normal Balance Convention:</span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100 capitalize">
            {normalBalance} Normal
          </span>
        </div>

        <div>
          <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Description
          </label>
          <textarea
            rows={2}
            placeholder="Explain what expenditures or receipts route through this account"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
          />
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
            className="px-4 py-2 text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors"
          >
            Add Account
          </button>
        </div>
      </form>
    </Modal>
  );
};
