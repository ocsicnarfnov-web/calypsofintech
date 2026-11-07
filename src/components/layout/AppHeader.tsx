import React from 'react';
import { Sun, Moon, Plus, FileText, Layers, ShieldCheck } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { formatCurrency } from '../../utils/formatters';

interface AppHeaderProps {
  currentView: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenInvoiceModal: () => void;
  onOpenJournalModal: () => void;
  onOpenArchitectureModal: () => void;
  onOpenDeployModal: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentView,
  isDark,
  onToggleTheme,
  onOpenInvoiceModal,
  onOpenJournalModal,
  onOpenArchitectureModal,
  onOpenDeployModal,
}) => {
  const { trialBalance, companyProfile } = useAccounting();

  const viewTitles: Record<string, { title: string; category: string }> = {
    overview: { title: 'Executive Financial & Tax Console', category: 'Executive View' },
    billing: { title: 'BIR VAT Invoices & Receivables', category: 'Tax Invoicing' },
    ledger: { title: 'General Ledger Audit Stream', category: 'Double-Entry Accounting' },
    accounts: { title: 'Chart of Accounts (COA)', category: 'Financial Structure' },
    reports: { title: 'BIR Books of Accounts & Financial Statements', category: 'Statutory Reports' },
    customers: { title: 'Customer Taxpayer Directory', category: 'Receivables & 2307' },
  };

  const current = viewTitles[currentView] || { title: 'Calypso', category: 'Workspace' };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-6 px-6 py-3.5 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      {/* Zone 1: Breadcrumb Hierarchy with BIR RDO */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-xs font-mono font-medium text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
          {companyProfile.name}
        </span>
        <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">/</span>
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
          {companyProfile.rdoCode}
        </span>
        <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">/</span>
        <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
          {current.title}
        </h1>
      </div>

      {/* Zone 2: BIR System Integrity & CAS Permit */}
      <div className="hidden lg:flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 font-mono tabular-nums">
          <span className="text-neutral-400 dark:text-neutral-500">BIR CAS Balance:</span>
          {trialBalance.isBalanced ? (
            <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Balanced · ₱0.00 Variance</span>
            </span>
          ) : (
            <span className="text-rose-700 dark:text-rose-400 font-medium">
              Imbalance: ₱{trialBalance.difference.toFixed(2)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenArchitectureModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap"
        >
          <Layers className="h-3.5 w-3.5 text-neutral-400" />
          <span>BIR Blueprint</span>
        </button>

        <button
          type="button"
          onClick={onOpenDeployModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap"
        >
          <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-500" aria-hidden="true" />
          <span>Deploy to Render</span>
        </button>
      </div>

      {/* Zone 3: Actions & Theme Switch */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle visual theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={onOpenJournalModal}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>General Journal</span>
        </button>

        <button
          type="button"
          onClick={onOpenInvoiceModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-xs transition-colors whitespace-nowrap"
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Issue BIR Invoice</span>
        </button>
      </div>
    </header>
  );
};
