import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { Account, AccountType } from '../../types/accounting';
import { formatCurrency } from '../../utils/formatters';
import { Search, Plus, FolderTree, ArrowUpRight, Lock } from 'lucide-react';

interface ChartOfAccountsViewProps {
  onOpenAddAccountModal: () => void;
  onSelectAccount: (account: Account) => void;
}

export const ChartOfAccountsView: React.FC<ChartOfAccountsViewProps> = ({
  onOpenAddAccountModal,
  onSelectAccount,
}) => {
  const { accounts, getAccountBalance } = useAccounting();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.code.includes(searchTerm) ||
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'all' || acc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate totals per category
  const categoryTotals: Record<AccountType, number> = {
    asset: accounts
      .filter((a) => a.type === 'asset')
      .reduce((acc, a) => acc + getAccountBalance(a.code), 0),
    liability: accounts
      .filter((a) => a.type === 'liability')
      .reduce((acc, a) => acc + getAccountBalance(a.code), 0),
    equity: accounts
      .filter((a) => a.type === 'equity')
      .reduce((acc, a) => acc + getAccountBalance(a.code), 0),
    revenue: accounts
      .filter((a) => a.type === 'revenue')
      .reduce((acc, a) => acc + getAccountBalance(a.code), 0),
    expense: accounts
      .filter((a) => a.type === 'expense')
      .reduce((acc, a) => acc + getAccountBalance(a.code), 0),
  };

  return (
    <div className="space-y-6">
      {/* Category Balances Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono">
          <span className="text-[11px] text-neutral-400 font-sans block">1000s Assets</span>
          <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mt-1 block tabular-nums">
            {formatCurrency(categoryTotals.asset)}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block font-sans">Debit Normal</span>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono">
          <span className="text-[11px] text-neutral-400 font-sans block">2000s Liabilities</span>
          <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mt-1 block tabular-nums">
            {formatCurrency(categoryTotals.liability)}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block font-sans">Credit Normal</span>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono">
          <span className="text-[11px] text-neutral-400 font-sans block">3000s Equity</span>
          <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mt-1 block tabular-nums">
            {formatCurrency(categoryTotals.equity)}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block font-sans">Credit Normal</span>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono">
          <span className="text-[11px] text-neutral-400 font-sans block">4000s Revenue</span>
          <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mt-1 block tabular-nums">
            {formatCurrency(categoryTotals.revenue)}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block font-sans">Credit Normal</span>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono">
          <span className="text-[11px] text-neutral-400 font-sans block">5000-6000s Expenses</span>
          <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100 mt-1 block tabular-nums">
            {formatCurrency(categoryTotals.expense)}
          </span>
          <span className="text-[10px] text-neutral-400 mt-0.5 block font-sans">Debit Normal</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search code, name, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {['all', 'asset', 'liability', 'equity', 'revenue', 'expense'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTypeFilter(t)}
                className={`px-2.5 py-1 rounded-md capitalize transition-colors text-xs whitespace-nowrap ${
                  typeFilter === t
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAddAccountModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors shrink-0 font-medium"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Accounts Table */}
      <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400 font-medium border-b border-neutral-200 dark:border-neutral-800">
            <tr>
              <th className="py-3 px-4 font-normal w-24">Code</th>
              <th className="py-3 px-3 font-normal">Account Name</th>
              <th className="py-3 px-3 font-normal">Classification</th>
              <th className="py-3 px-3 font-normal">Normal Balance</th>
              <th className="py-3 px-4 text-right font-normal w-36">Current Balance</th>
              <th className="py-3 px-4 text-right font-normal w-24">Drilldown</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
            {filteredAccounts.map((account) => {
              const balance = getAccountBalance(account.code);
              return (
                <tr
                  key={account.code}
                  onClick={() => onSelectAccount(account)}
                  className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-neutral-100">
                    <span className="flex items-center gap-1.5">
                      {account.code}
                      {account.isSystem && (
                        <span title="System Core Account">
                          <Lock className="h-2.5 w-2.5 text-neutral-400" />
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {account.name}
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate max-w-md">
                      {account.description}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-sans capitalize text-neutral-600 dark:text-neutral-400 text-[11px]">
                    <span className="block">{account.type}</span>
                    <span className="text-[10px] text-neutral-400">
                      {account.subtype.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-sans capitalize text-neutral-500 text-[11px]">
                    {account.normalBalance}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums font-semibold text-neutral-900 dark:text-neutral-100">
                    {formatCurrency(balance)}
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <button
                      type="button"
                      className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      title="Inspect ledger activity"
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
