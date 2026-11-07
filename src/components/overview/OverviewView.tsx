import React from 'react';
import { StatCard } from '../common/StatCard';
import { useAccounting } from '../../context/AccountingContext';
import { formatCurrency, formatDate, formatTin } from '../../utils/formatters';
import {
  FileText,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  BookOpen,
  FolderTree,
  Scale,
  ShieldCheck,
  Landmark,
} from 'lucide-react';
import { Invoice } from '../../types/accounting';

interface OverviewViewProps {
  onNavigate: (view: string) => void;
  onOpenInvoiceModal: () => void;
  onOpenJournalModal: () => void;
  onSelectInvoice: (invoice: Invoice) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onOpenInvoiceModal,
  onOpenJournalModal,
  onSelectInvoice,
}) => {
  const { metrics, invoices, journalEntries, trialBalance, companyProfile } = useAccounting();

  const recentInvoices = invoices.slice(0, 5);
  const recentJournals = journalEntries.slice(0, 5);

  const statusStyles: Record<string, string> = {
    paid: 'text-emerald-700 dark:text-emerald-400',
    partially_paid: 'text-amber-700 dark:text-amber-400',
    issued: 'text-sky-700 dark:text-sky-400',
    overdue: 'text-rose-700 dark:text-rose-400',
    draft: 'text-neutral-500 dark:text-neutral-400',
    void: 'text-neutral-400 dark:text-neutral-500 line-through',
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Cash in Bank (BDO & BPI)"
          value={formatCurrency(metrics.cashOnHand)}
          subtext="Liquid corporate accounts"
          indicator="nominal"
          action={{
            label: 'View Cash Ledger',
            onClick: () => onNavigate('accounts'),
          }}
        />

        <StatCard
          label="Trade Accounts Receivable"
          value={formatCurrency(metrics.accountsReceivableOutstanding)}
          subtext={
            metrics.agingSummary.days1_30 + metrics.agingSummary.days31_60 > 0
              ? `${formatCurrency(metrics.agingSummary.total - metrics.agingSummary.current)} overdue`
              : 'All invoices current'
          }
          indicator={metrics.agingSummary.days31_60 > 0 ? 'warning' : 'nominal'}
          action={{
            label: 'Manage Sales Invoices',
            onClick: () => onNavigate('billing'),
          }}
        />

        <StatCard
          label="Net VAT Payable (2550Q)"
          value={formatCurrency(metrics.netVatPayable)}
          trend={{ value: `${formatCurrency(metrics.outputVatTotal)} Output VAT`, isPositive: true }}
          subtext={`Creditable Input VAT: ${formatCurrency(metrics.inputVatTotal)}`}
          action={{
            label: 'BIR Form 2550Q',
            onClick: () => onNavigate('reports'),
          }}
        />

        <StatCard
          label="BIR CAS Equilibrium"
          value={trialBalance.isBalanced ? 'Balanced' : 'Imbalanced'}
          subtext={`Variance: ₱${trialBalance.difference.toFixed(2)}`}
          indicator={trialBalance.isBalanced ? 'nominal' : 'alert'}
          action={{
            label: 'Inspect Trial Balance',
            onClick: () => onNavigate('reports'),
          }}
        />
      </div>

      {/* BIR Registration & CAS Accreditation Header Banner */}
      <div className="p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Landmark className="h-4 w-4 text-neutral-600 dark:text-neutral-400 shrink-0" />
          <div>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {companyProfile.legalName}
            </span>
            <span className="text-neutral-400 mx-1.5">·</span>
            <span className="font-mono text-neutral-600 dark:text-neutral-300">
              TIN: {formatTin(companyProfile.tin)}
            </span>
            <span className="text-neutral-400 mx-1.5">·</span>
            <span className="text-neutral-500">{companyProfile.rdoCode}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-600 dark:text-neutral-300">
          <span>CAS Permit: {companyProfile.casPermitNo}</span>
          <span>·</span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
            RA 11976 Compliant
          </span>
        </div>
      </div>

      {/* AR Aging Health Strip */}
      <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h2 className="text-xs font-semibold tracking-wide uppercase text-neutral-500 dark:text-neutral-400">
              Accounts Receivable Aging Distribution
            </h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
              Portfolio distribution of uncollected customer billings
            </p>
          </div>
          <div className="text-xs font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
            Total Outstanding: <span className="font-semibold">{formatCurrency(metrics.agingSummary.total)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 text-xs font-mono">
          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50">
            <span className="text-[11px] text-neutral-400 block font-sans">Current (Not Due)</span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1 block tabular-nums">
              {formatCurrency(metrics.agingSummary.current)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50">
            <span className="text-[11px] text-neutral-400 block font-sans">1–30 Days Past Due</span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1 block tabular-nums">
              {formatCurrency(metrics.agingSummary.days1_30)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50">
            <span className="text-[11px] text-neutral-400 block font-sans">31–60 Days Past Due</span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1 block tabular-nums">
              {formatCurrency(metrics.agingSummary.days31_60)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50">
            <span className="text-[11px] text-neutral-400 block font-sans">61–90 Days Past Due</span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1 block tabular-nums">
              {formatCurrency(metrics.agingSummary.days61_90)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/60 dark:border-neutral-700/50">
            <span className="text-[11px] text-neutral-400 block font-sans">90+ Days Past Due</span>
            <span className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-1 block tabular-nums">
              {formatCurrency(metrics.agingSummary.daysOver90)}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent BIR Invoices & Recent Journal Entries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-neutral-500" />
                <h3 className="text-xs font-semibold tracking-wide uppercase text-neutral-700 dark:text-neutral-300">
                  Recent BIR Sales Invoices
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('billing')}
                className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white flex items-center gap-1"
              >
                <span>View All ({invoices.length})</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/70">
              {recentInvoices.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => onSelectInvoice(inv)}
                  className="py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-neutral-50/60 dark:hover:bg-neutral-800/30 px-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                        {inv.invoiceNumber}
                      </span>
                      <span className="text-neutral-300 dark:text-neutral-700">·</span>
                      <span className="font-medium text-neutral-700 dark:text-neutral-300 truncate">
                        {inv.customerCompany}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                      TIN: {formatTin(inv.customerTin)} · Due: {formatDate(inv.dueDate)}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-semibold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                      {formatCurrency(inv.grossAmount)}
                    </div>
                    <div className={`text-[11px] capitalize font-medium ${statusStyles[inv.status]}`}>
                      {inv.status.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-4">
            <button
              type="button"
              onClick={onOpenInvoiceModal}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Issue New BIR Sales Invoice</span>
            </button>
          </div>
        </div>

        {/* Recent Journal Transactions Card */}
        <div className="p-5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-neutral-500" />
                <h3 className="text-xs font-semibold tracking-wide uppercase text-neutral-700 dark:text-neutral-300">
                  General Journal Activity Stream
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('ledger')}
                className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white flex items-center gap-1"
              >
                <span>Full General Ledger ({journalEntries.length})</span>
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

            <div className="divide-y divide-neutral-100 dark:divide-neutral-800/70">
              {recentJournals.map((je) => {
                const totalDebit = je.lines.reduce((acc, l) => acc + (l.debit || 0), 0);
                return (
                  <div
                    key={je.id}
                    className="py-3 flex items-center justify-between gap-3 px-2 -mx-2 rounded-lg"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-mono font-medium text-neutral-900 dark:text-neutral-100">
                          {je.entryNumber}
                        </span>
                        <span className="text-neutral-300 dark:text-neutral-700">·</span>
                        <span className="text-neutral-600 dark:text-neutral-400 truncate">
                          {je.description}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        {formatDate(je.date)} · Source: {je.source.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-semibold font-mono tabular-nums text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(totalDebit)}
                      </div>
                      <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                        DR = CR
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-4">
            <button
              type="button"
              onClick={onOpenJournalModal}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Record General Journal Entry</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
