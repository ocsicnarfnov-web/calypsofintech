import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Account } from '../../types/accounting';
import { useAccounting } from '../../context/AccountingContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Search, ArrowUpRight } from 'lucide-react';

interface AccountDetailDrawerProps {
  account: Account | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToJournal?: (entryNumber: string) => void;
}

export const AccountDetailDrawer: React.FC<AccountDetailDrawerProps> = ({
  account,
  isOpen,
  onClose,
  onNavigateToJournal,
}) => {
  const { getAccountBalance, getAccountActivity } = useAccounting();
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!account) return null;

  const currentBalance = getAccountBalance(account.code);
  const activity = getAccountActivity(account.code);

  const filteredActivity = activity.filter(
    (item) =>
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.entryNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${account.code} · ${account.name}`}
      subtitle={`Account Ledger Drilldown (${account.type.toUpperCase()} · ${account.normalBalance.toUpperCase()} NORMAL)`}
      maxWidth="3xl"
    >
      <div className="space-y-5 text-xs">
        {/* Account Headline Stat */}
        <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] text-neutral-400 font-mono block">
              {account.subtype.replace(/_/g, ' ').toUpperCase()}
            </span>
            <p className="text-neutral-600 dark:text-neutral-300 mt-1 max-w-md">
              {account.description}
            </p>
          </div>

          <div className="text-left sm:text-right font-mono">
            <span className="text-[11px] text-neutral-400 block">CURRENT NET BALANCE</span>
            <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100 tabular-nums block mt-0.5">
              {formatCurrency(currentBalance)}
            </span>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search memo or entry number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden"
            />
          </div>
          <span className="text-neutral-400 font-mono text-[11px]">
            {filteredActivity.length} postings recorded
          </span>
        </div>

        {/* Ledger Transactions Table */}
        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-neutral-100/70 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 font-medium border-b border-neutral-200 dark:border-neutral-800 text-[11px]">
              <tr>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-2">Entry Ref</th>
                <th className="py-2 px-2">Memo / Description</th>
                <th className="py-2 px-2 text-right w-24">Debit</th>
                <th className="py-2 px-2 text-right w-24">Credit</th>
                <th className="py-2 px-3 text-right w-28">Running Bal.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono text-xs">
              {filteredActivity.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-400 font-sans">
                    No transactions recorded for this account.
                  </td>
                </tr>
              ) : (
                filteredActivity.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30">
                    <td className="py-2 px-3 text-neutral-600 dark:text-neutral-400">
                      {formatDate(item.date)}
                    </td>
                    <td className="py-2 px-2 font-medium">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToJournal?.(item.entryNumber);
                        }}
                        className="inline-flex items-center gap-1 text-neutral-900 dark:text-neutral-100 hover:underline"
                      >
                        <span>{item.entryNumber}</span>
                        <ArrowUpRight className="h-2.5 w-2.5 text-neutral-400" />
                      </button>
                    </td>
                    <td className="py-2 px-2 font-sans text-neutral-700 dark:text-neutral-300 truncate max-w-xs">
                      {item.description}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums text-neutral-900 dark:text-neutral-100">
                      {item.debit > 0 ? formatCurrency(item.debit) : '—'}
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums text-neutral-900 dark:text-neutral-100">
                      {item.credit > 0 ? formatCurrency(item.credit) : '—'}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums font-semibold text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(item.runningBalance)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Close Drilldown
          </button>
        </div>
      </div>
    </Modal>
  );
};
