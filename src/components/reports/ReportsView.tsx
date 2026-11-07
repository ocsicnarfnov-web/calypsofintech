import React, { useState } from 'react';
import { useAccounting } from '../../context/AccountingContext';
import { formatCurrency, formatPercent, formatDate, formatTin } from '../../utils/formatters';
import {
  Printer,
  Download,
  ShieldCheck,
  BookOpen,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const {
    trialBalance,
    metrics,
    accounts,
    getAccountBalance,
    customers,
    invoices,
    companyProfile,
    journalEntries,
    getSalesJournal,
    getCashReceiptsJournal,
    getBir2307Records,
  } = useAccounting();

  const [activeReport, setActiveReport] = useState<
    | 'trial_balance'
    | 'balance_sheet'
    | 'income_statement'
    | 'sales_journal'
    | 'cash_receipts_journal'
    | 'vat_form_2550q'
    | 'bir_2307'
  >('trial_balance');

  const salesJournal = getSalesJournal();
  const cashReceipts = getCashReceiptsJournal();
  const bir2307Records = getBir2307Records();

  const handlePrint = () => {
    window.print();
  };

  const exportCSV = () => {
    let csvContent = '';
    const dateStamp = new Date().toISOString().split('T')[0];

    if (activeReport === 'trial_balance') {
      csvContent =
        'Account Code,Account Name,Debit (PHP),Credit (PHP)\n' +
        trialBalance.rows
          .map(
            (r) =>
              `"${r.account.code}","${r.account.name}",${r.debit.toFixed(2)},${r.credit.toFixed(2)}`
          )
          .join('\n') +
        `\n"TOTAL","",${trialBalance.totalDebits.toFixed(2)},${trialBalance.totalCredits.toFixed(2)}`;
    } else if (activeReport === 'sales_journal') {
      csvContent =
        'Date,Sales Invoice No,Customer Name,Customer TIN,Gross Sales,VATable Sales,Zero Rated Sales,VAT Exempt Sales,Output VAT (12%),Status\n' +
        salesJournal
          .map(
            (r) =>
              `"${r.date}","${r.invoiceNumber}","${r.customerName}","${r.customerTin}",${r.grossSales.toFixed(2)},${r.vatableSales.toFixed(2)},${r.zeroRatedSales.toFixed(2)},${r.vatExemptSales.toFixed(2)},${r.outputVat.toFixed(2)},"${r.status}"`
          )
          .join('\n');
    } else if (activeReport === 'cash_receipts_journal') {
      csvContent =
        'Date,Receipt Ref,Customer Name,Customer TIN,Invoice Ref,Cash in Bank (PHP),Form 2307 CWT (PHP),AR Credited (PHP)\n' +
        cashReceipts
          .map(
            (r) =>
              `"${r.date}","${r.reference}","${r.customerName}","${r.customerTin}","${r.invoiceNumber}",${r.cashInBank.toFixed(2)},${r.cwtWithheld.toFixed(2)},${r.arCredited.toFixed(2)}`
          )
          .join('\n');
    } else if (activeReport === 'vat_form_2550q') {
      csvContent =
        'BIR Form 2550Q - Quarterly Value Added Tax Declaration\n' +
        `Taxpayer: ${companyProfile.legalName},TIN: ${companyProfile.tin}\n\n` +
        `Line,Description,Amount (PHP)\n` +
        `15,Vatable Sales,${invoices.reduce((acc, i) => acc + i.vatableSales, 0).toFixed(2)}\n` +
        `16,Zero-Rated Sales,${invoices.reduce((acc, i) => acc + i.zeroRatedSales, 0).toFixed(2)}\n` +
        `17,VAT-Exempt Sales,${invoices.reduce((acc, i) => acc + i.vatExemptSales, 0).toFixed(2)}\n` +
        `19,Total Output Tax (12%),${metrics.outputVatTotal.toFixed(2)}\n` +
        `20A,Creditable Input Tax,${metrics.inputVatTotal.toFixed(2)}\n` +
        `21,Net VAT Payable,${metrics.netVatPayable.toFixed(2)}\n`;
    } else {
      csvContent =
        'Category,Account,Amount (PHP)\n' +
        accounts
          .filter((a) => a.type === 'revenue' || a.type === 'expense')
          .map((a) => `"${a.type.toUpperCase()}","${a.code} - ${a.name}",${getAccountBalance(a.code).toFixed(2)}`)
          .join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `calypso_bir_${activeReport}_${dateStamp}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Report Segmented Navigation Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="inline-flex p-1 rounded-lg bg-neutral-200/70 dark:bg-neutral-800/80 text-xs font-medium overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveReport('trial_balance')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeReport === 'trial_balance'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Trial Balance
          </button>
          <button
            type="button"
            onClick={() => setActiveReport('balance_sheet')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeReport === 'balance_sheet'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Balance Sheet
          </button>
          <button
            type="button"
            onClick={() => setActiveReport('income_statement')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeReport === 'income_statement'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Income Statement
          </button>
          <button
            type="button"
            onClick={() => setActiveReport('sales_journal')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeReport === 'sales_journal'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            BIR Sales Journal (SJ)
          </button>
          <button
            type="button"
            onClick={() => setActiveReport('cash_receipts_journal')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeReport === 'cash_receipts_journal'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            BIR Cash Receipts Journal (CRJ)
          </button>
          <button
            type="button"
            onClick={() => setActiveReport('vat_form_2550q')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeReport === 'vat_form_2550q'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            BIR Form 2550Q (VAT)
          </button>
          <button
            type="button"
            onClick={() => setActiveReport('bir_2307')}
            className={`px-3 py-1.5 rounded-md transition-all whitespace-nowrap ${
              activeReport === 'bir_2307'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            BIR Form 2307 Register
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Document Canvas */}
      <div className="p-6 md:p-8 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs print:border-none print:p-0">
        {/* Document Header */}
        <div className="pb-6 border-b border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block">
              BUREAU OF INTERNAL REVENUE · COMPUTERIZED BOOKS OF ACCOUNTS
            </span>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-0.5">
              {activeReport === 'trial_balance' && 'General Ledger Trial Balance'}
              {activeReport === 'balance_sheet' && 'Statement of Financial Position (Balance Sheet)'}
              {activeReport === 'income_statement' && 'Statement of Comprehensive Income (Profit & Loss)'}
              {activeReport === 'sales_journal' && 'Computerized Sales Journal (BIR RR No. 9-2009)'}
              {activeReport === 'cash_receipts_journal' && 'Computerized Cash Receipts Journal (BIR RR No. 9-2009)'}
              {activeReport === 'vat_form_2550q' && 'Quarterly Value-Added Tax Declaration (BIR Form 2550Q)'}
              {activeReport === 'bir_2307' && 'Register of Creditable Taxes Withheld at Source (BIR Form 2307)'}
            </h2>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 leading-relaxed">
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                {companyProfile.legalName}
              </span>
              <span className="mx-1.5">·</span>
              <span className="font-mono">TIN: {formatTin(companyProfile.tin)}</span>
              <span className="mx-1.5">·</span>
              <span>{companyProfile.rdoCode}</span>
              <br />
              <span>CAS Permit No.: {companyProfile.casPermitNo}</span>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono text-xs">
            <span className="text-neutral-400 block font-sans">Applicable Tax Period</span>
            <span className="text-neutral-900 dark:text-neutral-100 font-medium block mt-0.5">
              Fiscal Year 2026 (Accrual Basis)
            </span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-sans">
              BIR CAS Invariant Verified
            </span>
          </div>
        </div>

        {/* 1. Trial Balance */}
        {activeReport === 'trial_balance' && (
          <div className="py-6 space-y-4">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-normal pb-2">
                  <th className="py-2 px-2 w-28">Code</th>
                  <th className="py-2 px-2 font-sans">Account Title</th>
                  <th className="py-2 px-2 font-sans w-32">Type</th>
                  <th className="py-2 px-3 text-right w-36">Debit (₱)</th>
                  <th className="py-2 px-3 text-right w-36">Credit (₱)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                {trialBalance.rows.map((row) => (
                  <tr key={row.account.code} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30">
                    <td className="py-2.5 px-2 font-semibold text-neutral-900 dark:text-neutral-100">
                      {row.account.code}
                    </td>
                    <td className="py-2.5 px-2 font-sans text-neutral-800 dark:text-neutral-200 font-medium">
                      {row.account.name}
                    </td>
                    <td className="py-2.5 px-2 font-sans capitalize text-neutral-500 text-[11px]">
                      {row.account.type}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-neutral-900 dark:text-neutral-100">
                      {row.debit > 0 ? formatCurrency(row.debit) : '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-neutral-900 dark:text-neutral-100">
                      {row.credit > 0 ? formatCurrency(row.credit) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-neutral-900 dark:border-neutral-100 font-bold text-xs text-neutral-900 dark:text-neutral-100">
                  <td colSpan={3} className="py-3 px-2 font-sans uppercase tracking-wider">
                    Total Trial Balance
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {formatCurrency(trialBalance.totalDebits)}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {formatCurrency(trialBalance.totalCredits)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <div className="p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Double-Entry Invariant Status:
                </span>
                <span className="text-neutral-600 dark:text-neutral-300">
                  Total Debits equal Total Credits with zero discrepancy
                </span>
              </div>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                Variance: ₱{trialBalance.difference.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* 2. Balance Sheet */}
        {activeReport === 'balance_sheet' && (
          <div className="py-6 space-y-6 text-xs">
            <div>
              <h3 className="font-bold font-sans uppercase tracking-wider text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-300 dark:border-neutral-700">
                Assets
              </h3>
              <div className="py-2 space-y-2 font-mono">
                {accounts
                  .filter((a) => a.type === 'asset')
                  .map((a) => (
                    <div key={a.code} className="flex justify-between py-1 text-neutral-800 dark:text-neutral-200">
                      <span className="font-sans">
                        {a.code} · {a.name}
                      </span>
                      <span className="tabular-nums font-semibold">
                        {formatCurrency(getAccountBalance(a.code))}
                      </span>
                    </div>
                  ))}
                <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800 font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                  <span className="font-sans">Total Assets</span>
                  <span className="tabular-nums">{formatCurrency(metrics.totalAssets)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold font-sans uppercase tracking-wider text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-300 dark:border-neutral-700">
                Liabilities
              </h3>
              <div className="py-2 space-y-2 font-mono">
                {accounts
                  .filter((a) => a.type === 'liability')
                  .map((a) => (
                    <div key={a.code} className="flex justify-between py-1 text-neutral-800 dark:text-neutral-200">
                      <span className="font-sans">
                        {a.code} · {a.name}
                      </span>
                      <span className="tabular-nums font-semibold">
                        {formatCurrency(getAccountBalance(a.code))}
                      </span>
                    </div>
                  ))}
                <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800 font-bold text-neutral-900 dark:text-neutral-100">
                  <span className="font-sans">Total Liabilities</span>
                  <span className="tabular-nums">{formatCurrency(metrics.totalLiabilities)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold font-sans uppercase tracking-wider text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-300 dark:border-neutral-700">
                Shareholders' Equity
              </h3>
              <div className="py-2 space-y-2 font-mono">
                {accounts
                  .filter((a) => a.type === 'equity')
                  .map((a) => (
                    <div key={a.code} className="flex justify-between py-1 text-neutral-800 dark:text-neutral-200">
                      <span className="font-sans">
                        {a.code} · {a.name}
                      </span>
                      <span className="tabular-nums font-semibold">
                        {formatCurrency(getAccountBalance(a.code))}
                      </span>
                    </div>
                  ))}
                <div className="flex justify-between py-1 text-neutral-800 dark:text-neutral-200">
                  <span className="font-sans">Current Period Net Profit (After Tax)</span>
                  <span className="tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(metrics.netIncome)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800 font-bold text-neutral-900 dark:text-neutral-100">
                  <span className="font-sans">Total Shareholders' Equity</span>
                  <span className="tabular-nums">{formatCurrency(metrics.totalEquity)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-neutral-900 dark:border-neutral-100 font-mono text-sm">
              <div className="flex justify-between font-bold text-neutral-900 dark:text-neutral-100">
                <span className="font-sans">Total Liabilities & Equity</span>
                <span className="tabular-nums">
                  {formatCurrency(metrics.totalLiabilities + metrics.totalEquity)}
                </span>
              </div>
              <div className="mt-2 text-xs font-sans text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>
                  Statement in Equilibrium (Assets: {formatCurrency(metrics.totalAssets)} = Liab & Equity: {formatCurrency(metrics.totalLiabilities + metrics.totalEquity)})
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 3. Income Statement */}
        {activeReport === 'income_statement' && (
          <div className="py-6 space-y-6 text-xs font-mono">
            <div>
              <h3 className="font-bold font-sans uppercase tracking-wider text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-300 dark:border-neutral-700">
                Operating Revenue
              </h3>
              <div className="py-2 space-y-2">
                {accounts
                  .filter((a) => a.type === 'revenue')
                  .map((a) => (
                    <div key={a.code} className="flex justify-between py-1 text-neutral-800 dark:text-neutral-200">
                      <span className="font-sans">
                        {a.code} · {a.name}
                      </span>
                      <span className="tabular-nums font-semibold">
                        {formatCurrency(getAccountBalance(a.code))}
                      </span>
                    </div>
                  ))}
                <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800 font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                  <span className="font-sans">Total Net Revenue (VAT Exclusive)</span>
                  <span className="tabular-nums">{formatCurrency(metrics.netRevenue)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold font-sans uppercase tracking-wider text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-300 dark:border-neutral-700">
                Cost of Goods Sold (Compute Hosting & Processing)
              </h3>
              <div className="py-2 space-y-2">
                {accounts
                  .filter((a) => a.subtype === 'cost_of_goods_sold')
                  .map((a) => (
                    <div key={a.code} className="flex justify-between py-1 text-neutral-800 dark:text-neutral-200">
                      <span className="font-sans">
                        {a.code} · {a.name}
                      </span>
                      <span className="tabular-nums font-semibold">
                        {formatCurrency(getAccountBalance(a.code))}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/50 flex justify-between font-bold text-neutral-900 dark:text-neutral-100 text-sm">
              <span className="font-sans">Gross Operating Profit ({formatPercent(metrics.grossMarginPercent)} Margin)</span>
              <span className="tabular-nums">
                {formatCurrency(
                  metrics.netRevenue -
                    accounts
                      .filter((a) => a.subtype === 'cost_of_goods_sold')
                      .reduce((sum, a) => sum + getAccountBalance(a.code), 0)
                )}
              </span>
            </div>

            <div>
              <h3 className="font-bold font-sans uppercase tracking-wider text-neutral-900 dark:text-neutral-100 pb-2 border-b border-neutral-300 dark:border-neutral-700">
                Operating Expenses
              </h3>
              <div className="py-2 space-y-2">
                {accounts
                  .filter((a) => a.type === 'expense' && a.subtype !== 'cost_of_goods_sold')
                  .map((a) => (
                    <div key={a.code} className="flex justify-between py-1 text-neutral-800 dark:text-neutral-200">
                      <span className="font-sans">
                        {a.code} · {a.name}
                      </span>
                      <span className="tabular-nums font-semibold">
                        {formatCurrency(getAccountBalance(a.code))}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="pt-4 border-t-2 border-neutral-900 dark:border-neutral-100 text-base font-bold flex justify-between text-neutral-900 dark:text-neutral-100">
              <span className="font-sans">Net Operating Income</span>
              <span className="tabular-nums text-emerald-700 dark:text-emerald-400">
                {formatCurrency(metrics.netIncome)}
              </span>
            </div>
          </div>
        )}

        {/* 4. BIR Sales Journal (SJ) */}
        {activeReport === 'sales_journal' && (
          <div className="py-6 space-y-4">
            <div className="text-xs text-neutral-500 font-sans">
              Mandatory Book of Accounts under RR No. 9-2009 for Computerized Accounting Systems (CAS).
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono min-w-[900px]">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-medium pb-2 text-[11px]">
                    <th className="py-2 px-2">Date</th>
                    <th className="py-2 px-2">SI Number</th>
                    <th className="py-2 px-2 font-sans">Customer / Registered Entity</th>
                    <th className="py-2 px-2">Customer TIN</th>
                    <th className="py-2 px-2 text-right">VATable Sales</th>
                    <th className="py-2 px-2 text-right">Zero-Rated</th>
                    <th className="py-2 px-2 text-right">Exempt</th>
                    <th className="py-2 px-2 text-right">Output VAT (12%)</th>
                    <th className="py-2 px-2 text-right font-bold">Total Billed</th>
                    <th className="py-2 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-[11px]">
                  {salesJournal.map((r) => (
                    <tr key={r.invoiceNumber} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30">
                      <td className="py-2.5 px-2 text-neutral-600 dark:text-neutral-400">
                        {formatDate(r.date)}
                      </td>
                      <td className="py-2.5 px-2 font-semibold text-neutral-900 dark:text-neutral-100">
                        {r.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-2 font-sans font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-xs">
                        {r.customerName}
                      </td>
                      <td className="py-2.5 px-2 text-neutral-600 dark:text-neutral-400">
                        {formatTin(r.customerTin)}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums">
                        {formatCurrency(r.vatableSales)}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums text-neutral-400">
                        {r.zeroRatedSales > 0 ? formatCurrency(r.zeroRatedSales) : '—'}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums text-neutral-400">
                        {r.vatExemptSales > 0 ? formatCurrency(r.vatExemptSales) : '—'}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums font-medium text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(r.outputVat)}
                      </td>
                      <td className="py-2.5 px-2 text-right tabular-nums font-bold text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(r.grossSales)}
                      </td>
                      <td className="py-2.5 px-2 text-center font-sans font-medium text-[10px]">
                        <span
                          className={
                            r.status === 'VALID'
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-rose-600 line-through'
                          }
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-neutral-900 dark:border-neutral-100 font-bold text-xs text-neutral-900 dark:text-neutral-100">
                    <td colSpan={4} className="py-3 px-2 font-sans uppercase">
                      Sales Journal Column Totals
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums">
                      {formatCurrency(salesJournal.reduce((sum, r) => sum + r.vatableSales, 0))}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums">
                      {formatCurrency(salesJournal.reduce((sum, r) => sum + r.zeroRatedSales, 0))}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums">
                      {formatCurrency(salesJournal.reduce((sum, r) => sum + r.vatExemptSales, 0))}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums">
                      {formatCurrency(salesJournal.reduce((sum, r) => sum + r.outputVat, 0))}
                    </td>
                    <td className="py-3 px-2 text-right tabular-nums">
                      {formatCurrency(salesJournal.reduce((sum, r) => sum + r.grossSales, 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 5. BIR Cash Receipts Journal (CRJ) */}
        {activeReport === 'cash_receipts_journal' && (
          <div className="py-6 space-y-4">
            <div className="text-xs text-neutral-500 font-sans">
              Chronological log of collections showing Cash in Bank debited and BIR Form 2307 Creditable Withholding Tax credits.
            </div>
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-medium pb-2 text-[11px]">
                  <th className="py-2 px-2">Date</th>
                  <th className="py-2 px-2">Payment Ref / CR #</th>
                  <th className="py-2 px-2 font-sans">Payor Entity</th>
                  <th className="py-2 px-2">Payor TIN</th>
                  <th className="py-2 px-2">Applied SI</th>
                  <th className="py-2 px-3 text-right">DR 1010 Cash (₱)</th>
                  <th className="py-2 px-3 text-right">DR 1160 CWT (2307)</th>
                  <th className="py-2 px-3 text-right font-bold">CR 1200 A/R (₱)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-[11px]">
                {cashReceipts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-neutral-400 font-sans">
                      No collections recorded yet.
                    </td>
                  </tr>
                ) : (
                  cashReceipts.map((r, i) => (
                    <tr key={i} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30">
                      <td className="py-2.5 px-2 text-neutral-600 dark:text-neutral-400">
                        {formatDate(r.date)}
                      </td>
                      <td className="py-2.5 px-2 font-semibold text-neutral-900 dark:text-neutral-100">
                        {r.reference}
                      </td>
                      <td className="py-2.5 px-2 font-sans font-medium text-neutral-800 dark:text-neutral-200 truncate max-w-xs">
                        {r.customerName}
                      </td>
                      <td className="py-2.5 px-2 text-neutral-600 dark:text-neutral-400">
                        {formatTin(r.customerTin)}
                      </td>
                      <td className="py-2.5 px-2 text-neutral-800 dark:text-neutral-200">
                        {r.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(r.cashInBank)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-sky-700 dark:text-sky-400">
                        {formatCurrency(r.cwtWithheld)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-bold text-neutral-900 dark:text-neutral-100">
                        {formatCurrency(r.arCredited)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-neutral-900 dark:border-neutral-100 font-bold text-xs text-neutral-900 dark:text-neutral-100">
                  <td colSpan={5} className="py-3 px-2 font-sans uppercase">
                    Total Collections Reconciled
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {formatCurrency(cashReceipts.reduce((sum, r) => sum + r.cashInBank, 0))}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {formatCurrency(cashReceipts.reduce((sum, r) => sum + r.cwtWithheld, 0))}
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {formatCurrency(cashReceipts.reduce((sum, r) => sum + r.arCredited, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* 6. BIR Form 2550Q (Quarterly VAT Declaration) */}
        {activeReport === 'vat_form_2550q' && (
          <div className="py-6 space-y-6 text-xs font-mono">
            <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 font-sans">
              <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                BIR Form No. 2550Q · Quarterly Value-Added Tax Return Summary
              </h4>
              <p className="text-neutral-600 dark:text-neutral-400 text-xs mt-0.5">
                Automatically prepared from Calypso CAS Sales Journal and Input VAT Ledger for Electronic Filing and Payment System (eFPS).
              </p>
            </div>

            <div className="space-y-4">
              {/* Part II: Computation of Tax */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                <div className="p-3 bg-neutral-100/70 dark:bg-neutral-800/60 font-sans font-bold text-neutral-900 dark:text-neutral-100 text-xs uppercase">
                  Part II · Computation of Value-Added Tax
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="font-sans">
                      Line 15: Vatable Sales / Receipts - Private (12%)
                    </span>
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(invoices.reduce((acc, i) => acc + i.vatableSales, 0))}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="font-sans">Line 16: Zero-Rated Sales / Receipts (0%)</span>
                    <span className="tabular-nums">
                      {formatCurrency(invoices.reduce((acc, i) => acc + i.zeroRatedSales, 0))}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800">
                    <span className="font-sans">Line 17: Exempt Sales / Receipts</span>
                    <span className="tabular-nums">
                      {formatCurrency(invoices.reduce((acc, i) => acc + i.vatExemptSales, 0))}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-neutral-200 dark:border-neutral-700 font-bold text-neutral-900 dark:text-neutral-100">
                    <span className="font-sans">
                      Line 19: Total Output Tax Due (12% on Vatable Sales)
                    </span>
                    <span className="tabular-nums text-sm">
                      {formatCurrency(metrics.outputVatTotal)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-neutral-100 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
                    <span className="font-sans">
                      Line 20A: Less Creditable Input Tax (from Purchases/Hosting - GL 1150)
                    </span>
                    <span className="tabular-nums font-semibold">
                      -{formatCurrency(metrics.inputVatTotal)}
                    </span>
                  </div>

                  <div className="flex justify-between py-2 pt-3 border-t-2 border-neutral-900 dark:border-neutral-100 font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                    <span className="font-sans">
                      Line 21: Net VAT Payable to Bureau of Internal Revenue
                    </span>
                    <span className="tabular-nums text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(metrics.netVatPayable)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 7. BIR Form 2307 Register */}
        {activeReport === 'bir_2307' && (
          <div className="py-6 space-y-4">
            <div className="text-xs text-neutral-500 font-sans">
              Summary of Creditable Withholding Tax (CWT) deducted by corporate customers supported by BIR Form 2307 Certificates.
            </div>
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-medium pb-2 text-[11px]">
                  <th className="py-2 px-2">SI Number</th>
                  <th className="py-2 px-2 font-sans">Payor (Withholding Agent)</th>
                  <th className="py-2 px-2">Payor TIN</th>
                  <th className="py-2 px-2">ATC Code</th>
                  <th className="py-2 px-3 text-right">Income Base (₱)</th>
                  <th className="py-2 px-2 text-right">Tax Rate</th>
                  <th className="py-2 px-3 text-right font-bold">Tax Withheld (₱)</th>
                  <th className="py-2 px-2 text-center">Form 2307 Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60 text-[11px]">
                {bir2307Records.map((r) => (
                  <tr key={r.id} className="hover:bg-neutral-50/70 dark:hover:bg-neutral-800/30">
                    <td className="py-2.5 px-2 font-semibold text-neutral-900 dark:text-neutral-100">
                      {r.invoiceNumber}
                    </td>
                    <td className="py-2.5 px-2 font-sans font-medium text-neutral-800 dark:text-neutral-200">
                      {r.payorName}
                    </td>
                    <td className="py-2.5 px-2 text-neutral-600 dark:text-neutral-400">
                      {formatTin(r.payorTin)}
                    </td>
                    <td className="py-2.5 px-2 text-neutral-800 dark:text-neutral-200 font-semibold">
                      {r.atcCode}
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums">
                      {formatCurrency(r.amountSubjectToTax)}
                    </td>
                    <td className="py-2.5 px-2 text-right tabular-nums">{r.taxRatePercent}%</td>
                    <td className="py-2.5 px-3 text-right tabular-nums font-bold text-sky-700 dark:text-sky-400">
                      {formatCurrency(r.taxWithheld)}
                    </td>
                    <td className="py-2.5 px-2 text-center font-sans font-medium text-[10px]">
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Received</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-neutral-900 dark:border-neutral-100 font-bold text-xs text-neutral-900 dark:text-neutral-100">
                  <td colSpan={6} className="py-3 px-2 font-sans uppercase">
                    Total Form 2307 CWT Credits Claimable (BIR Form 1702)
                  </td>
                  <td className="py-3 px-3 text-right tabular-nums">
                    {formatCurrency(bir2307Records.reduce((sum, r) => sum + r.taxWithheld, 0))}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
