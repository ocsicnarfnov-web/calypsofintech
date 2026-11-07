import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { JournalEntry } from '../../types/accounting';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Search,
  Plus,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  BookOpen,
  Filter,
} from 'lucide-react';

interface GeneralLedgerViewProps {
  onOpenJournalModal: () => void;
  onOpenNewLedgerModal?: () => void;
  highlightEntryNumber?: string;
}

export const GeneralLedgerView: React.FC<GeneralLedgerViewProps> = ({
  onOpenJournalModal,
  onOpenNewLedgerModal,
  highlightEntryNumber,
}) => {
  const { journalEntries, trialBalance, reverseJournalEntry, accounts, activeLedger } = useAccounting();

  const [searchTerm, setSearchTerm] = useState(highlightEntryNumber || '');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>(() => {
    // Expand the first 3 by default or the highlighted entry
    const initial: Record<string, boolean> = {};
    journalEntries.slice(0, 3).forEach((je) => {
      initial[je.id] = true;
    });
    return initial;
  });

  const toggleExpand = (id: string) => {
    setExpandedEntries((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleExpandAll = () => {
    const all: Record<string, boolean> = {};
    journalEntries.forEach((je) => (all[je.id] = true));
    setExpandedEntries(all);
  };

  const handleCollapseAll = () => {
    setExpandedEntries({});
  };

  const handleReverse = (entry: JournalEntry) => {
    if (
      window.confirm(
        `Are you sure you want to reverse journal entry ${entry.entryNumber}? This will create an explicit reversing entry in the General Ledger.`
      )
    ) {
      reverseJournalEntry(entry.id, `Manual reversal requested for ${entry.entryNumber}`);
    }
  };

  const filteredEntries = journalEntries.filter((je) => {
    const matchesSearch =
      je.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      je.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      je.lines.some(
        (l) =>
          l.accountCode.includes(searchTerm) ||
          l.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (l.memo && l.memo.toLowerCase().includes(searchTerm.toLowerCase()))
      );

    const matchesSource = sourceFilter === 'all' || je.source === sourceFilter;
    const matchesAccount =
      accountFilter === 'all' || je.lines.some((l) => l.accountCode === accountFilter);

    return matchesSearch && matchesSource && matchesAccount;
  });

  return (
    <div className="space-y-6">
      {/* GL Health & Summary Banner */}
      <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <BookOpen className="h-4 w-4 text-neutral-500" />
            <h2 className="text-xs font-semibold tracking-wide uppercase text-neutral-600 dark:text-neutral-300">
              Double-Entry General Ledger Stream
            </h2>
            {activeLedger && (
              <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
                <span>{activeLedger.code}</span>
                <span className="text-neutral-400">·</span>
                <span className="uppercase text-[9px] font-sans text-neutral-500">{activeLedger.type}</span>
                <span className="text-neutral-400">·</span>
                <span>{activeLedger.currencySymbol} {activeLedger.currency}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Append-only financial transaction book with deterministic debit and credit reconciliation
          </p>
        </div>

        <div className="flex items-center gap-6 font-mono text-xs tabular-nums">
          <div className="text-right">
            <span className="text-[11px] text-neutral-400 block font-sans">Total Debits</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(trialBalance.totalDebits)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-neutral-400 block font-sans">Total Credits</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {formatCurrency(trialBalance.totalCredits)}
            </span>
          </div>

          <div className="pl-3 border-l border-neutral-200 dark:border-neutral-700">
            <span className="text-[11px] text-neutral-400 block font-sans">Equation Integrity</span>
            <span
              className={`font-semibold inline-flex items-center gap-1 ${
                trialBalance.isBalanced
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-rose-700 dark:text-rose-400'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {trialBalance.isBalanced ? 'Balanced ($0.00)' : `Variance: $${trialBalance.difference}`}
            </span>
          </div>
        </div>
      </div>

      {/* Control & Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search ref #, account, or memo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden"
            />
          </div>

          {/* Source Filter */}
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
          >
            <option value="all">All Sources</option>
            <option value="manual">Manual Adjustments</option>
            <option value="invoice_issued">Invoice Issuances</option>
            <option value="payment_received">Payment Settlements</option>
            <option value="payroll_accrual">Payroll Disbursements</option>
          </select>

          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-hidden max-w-[200px] truncate"
          >
            <option value="all">All Accounts</option>
            {accounts.map((a) => (
              <option key={a.code} value={a.code}>
                {a.code} - {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExpandAll}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={handleCollapseAll}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
          >
            Collapse All
          </button>
          {onOpenNewLedgerModal && (
            <button
              type="button"
              onClick={onOpenNewLedgerModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors font-medium shadow-xs"
              title="Create a new statutory, management, or multi-currency ledger book"
            >
              <BookOpen className="h-3.5 w-3.5 text-neutral-500" />
              <span>+ New Ledger</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenJournalModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Journal Entry</span>
          </button>
        </div>
      </div>

      {/* Entries List */}
      <div className="space-y-3 font-mono">
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-400 font-sans text-xs">
            No journal transactions found matching criteria.
          </div>
        ) : (
          filteredEntries.map((je) => {
            const isExpanded = !!expandedEntries[je.id];
            const totalDebit = je.lines.reduce((acc, l) => acc + (Number(l.debit) || 0), 0);
            const isReversed = je.status === 'reversed';

            return (
              <div
                key={je.id}
                className={`rounded-xl border transition-colors overflow-hidden ${
                  je.entryNumber === highlightEntryNumber
                    ? 'border-neutral-900 dark:border-neutral-100 ring-1 ring-neutral-900 dark:ring-neutral-100 bg-neutral-50/50 dark:bg-neutral-900'
                    : 'border-neutral-200/90 dark:border-neutral-800 bg-white dark:bg-neutral-900'
                }`}
              >
                {/* Entry Header Row */}
                <div
                  onClick={() => toggleExpand(je.id)}
                  className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-neutral-50/60 dark:hover:bg-neutral-800/40 select-none text-xs"
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900 dark:text-neutral-100">
                          {je.entryNumber}
                        </span>
                        <span className="text-neutral-300 dark:text-neutral-700">·</span>
                        <span className="text-neutral-500 font-sans">{formatDate(je.date)}</span>
                        <span className="text-neutral-300 dark:text-neutral-700">·</span>
                        <span className="font-sans text-[11px] text-neutral-400 capitalize">
                          {je.source.replace('_', ' ')}
                        </span>
                        {isReversed && (
                          <span className="text-[10px] font-sans font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.2 rounded">
                            Reversed
                          </span>
                        )}
                      </div>
                      <div className="font-sans text-neutral-700 dark:text-neutral-300 mt-0.5 truncate max-w-lg">
                        {je.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="font-semibold text-neutral-900 dark:text-neutral-100 tabular-nums">
                        {formatCurrency(totalDebit)}
                      </div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                        {je.lines.length} lines balanced
                      </div>
                    </div>

                    {!isReversed && je.status === 'posted' && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReverse(je);
                        }}
                        className="p-1 rounded text-neutral-400 hover:text-rose-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                        title="Create explicit reversing transaction"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Lines Table */}
                {isExpanded && (
                  <div className="border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 px-4 py-3">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-neutral-400 font-medium text-[11px] border-b border-neutral-200 dark:border-neutral-800/80">
                          <th className="py-2 w-24">Acct Code</th>
                          <th className="py-2">Account Title</th>
                          <th className="py-2">Line Memo</th>
                          <th className="py-2 text-right w-28">Debit</th>
                          <th className="py-2 text-right w-28">Credit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-200/60 dark:divide-neutral-800/50 text-[11px]">
                        {je.lines.map((l) => (
                          <tr key={l.id}>
                            <td className="py-2 text-neutral-500 font-semibold">{l.accountCode}</td>
                            <td className="py-2 font-sans font-medium text-neutral-800 dark:text-neutral-200">
                              {l.accountName}
                            </td>
                            <td className="py-2 font-sans text-neutral-500 truncate max-w-xs">
                              {l.memo || '—'}
                            </td>
                            <td className="py-2 text-right tabular-nums text-neutral-900 dark:text-neutral-100 font-medium">
                              {l.debit > 0 ? formatCurrency(l.debit) : '—'}
                            </td>
                            <td className="py-2 text-right tabular-nums text-neutral-900 dark:text-neutral-100 font-medium">
                              {l.credit > 0 ? formatCurrency(l.credit) : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-neutral-200 dark:border-neutral-700 font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                          <td colSpan={3} className="py-2 text-right font-sans">
                            Balanced Line Sum:
                          </td>
                          <td className="py-2 text-right tabular-nums">
                            {formatCurrency(totalDebit)}
                          </td>
                          <td className="py-2 text-right tabular-nums">
                            {formatCurrency(totalDebit)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>

                    <div className="mt-2 text-[10px] text-neutral-400 font-sans flex items-center justify-between">
                      <span>Recorded by {je.createdBy}</span>
                      <span>Created at {new Date(je.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
