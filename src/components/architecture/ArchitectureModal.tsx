import React from 'react';
import { Modal } from '../common/Modal';
import { ShieldCheck, Database, ArrowRight, Layers, Lock, Cpu, GitCommit, FileCheck, Landmark } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { formatCurrency, formatTin } from '../../utils/formatters';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const { metrics, trialBalance, companyProfile } = useAccounting();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="BIR CAS & EOPT Compliance Architecture Blueprint"
      subtitle="Architectural specification for Philippine Computerized Accounting System (CAS) & RA 11976 standards"
      maxWidth="4xl"
    >
      <div className="space-y-6 text-sm text-neutral-600 dark:text-neutral-300">
        {/* Architectural Overview Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-xl bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/80">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <Landmark className="h-3.5 w-3.5 text-neutral-700 dark:text-neutral-300" />
              <span>BIR CAS Accreditation</span>
            </div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300">
              Compliant with BIR RR No. 9-2009, RR 16-2005, and RA 11976 (EOPT Act). Permit No: <span className="font-mono font-semibold">{companyProfile.casPermitNo}</span>.
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Double-Entry Equilibrium</span>
            </div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300 font-mono">
              ∑ Debits = ∑ Credits
              <br />
              Trial Balance Variance: ₱{trialBalance.difference.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <FileCheck className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
              <span>RA 11976 (EOPT Act)</span>
            </div>
            <p className="text-xs text-neutral-700 dark:text-neutral-300">
              VAT Sales Invoices serve as primary commercial proof of sales for both goods and services.
            </p>
          </div>
        </div>

        {/* 01. Complete BIR Transaction Flow Diagram */}
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            <span>01. BIR Billing to General Ledger Accounting Cycle</span>
          </h3>

          <div className="p-4 rounded-xl bg-neutral-950 text-neutral-200 font-mono text-xs overflow-x-auto border border-neutral-800">
            <div className="flex items-center justify-between min-w-[700px] gap-2 py-2">
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 w-52 text-center shrink-0">
                <div className="text-white font-semibold">1. Tax Invoice Issuance</div>
                <div className="text-[10px] text-neutral-400 mt-1">VATable / Zero / Exempt</div>
                <div className="text-[10px] text-neutral-400">Customer TIN & Style</div>
              </div>

              <ArrowRight className="h-4 w-4 text-neutral-600 shrink-0" />

              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 w-60 text-center shrink-0">
                <div className="text-emerald-400 font-semibold">2. Auto GL Journal Posting</div>
                <div className="text-[10px] text-neutral-300 mt-1">DR 1200 A/R (Gross Amount)</div>
                <div className="text-[10px] text-neutral-300">CR 4010 Revenue (Base Sales)</div>
                <div className="text-[10px] text-neutral-300">CR 2110 Output VAT (12%)</div>
              </div>

              <ArrowRight className="h-4 w-4 text-neutral-600 shrink-0" />

              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 w-60 text-center shrink-0">
                <div className="text-sky-400 font-semibold">3. Form 2307 Settlement</div>
                <div className="text-[10px] text-neutral-300 mt-1">DR 1010 Cash in Bank (Net)</div>
                <div className="text-[10px] text-neutral-300">DR 1160 CWT (2307 2% / 1%)</div>
                <div className="text-[10px] text-neutral-300">CR 1200 A/R (Full Clearance)</div>
              </div>

              <ArrowRight className="h-4 w-4 text-neutral-600 shrink-0" />

              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 w-52 text-center shrink-0">
                <div className="text-amber-400 font-semibold">4. Statutory Books (RR 9-2009)</div>
                <div className="text-[10px] text-neutral-400 mt-1">Sales Journal (SJ)</div>
                <div className="text-[10px] text-neutral-400">Cash Receipts Journal (CRJ)</div>
                <div className="text-[10px] text-neutral-400">BIR Form 2550Q & 1702</div>
              </div>
            </div>
          </div>
        </div>

        {/* 02. Statutory Books of Accounts & Tax Declarations */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span>02. Mandated Computerized Books of Accounts (BIR RR 9-2009)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
              <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                1. Computerized Sales Journal (SJ)
              </span>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px]">
                Tracks all registered sales invoices sequentially. Segregates VATable Sales, Zero-Rated Sales (under Section 108), VAT-Exempt Sales, and 12% Output Tax due to the Bureau.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
              <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                2. Computerized Cash Receipts Journal (CRJ)
              </span>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px]">
                Chronological ledger of cash in bank debited, official receipt references, customer TINs, and 2% creditable withholding tax (CWT) deducted by customers.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
              <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                3. General Journal (GJ) & General Ledger (GL)
              </span>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px]">
                Records all adjusting entries, asset capitalizations, payroll accruals, and provides comprehensive T-account activity streams with running cumulative balances.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
              <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                4. BIR Form 2550Q (Quarterly VAT Declaration)
              </span>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px]">
                Calculates Net VAT Payable: Output VAT (₱{metrics.outputVatTotal.toFixed(2)}) minus Input VAT (₱{metrics.inputVatTotal.toFixed(2)}) from Account 1150 = Net Tax Due: ₱{metrics.netVatPayable.toFixed(2)}.
              </p>
            </div>
          </div>
        </div>

        {/* 03. Live Balance Sheet Equation Verification */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <GitCommit className="h-4 w-4" />
            <span>03. Live Financial Equilibrium & Tax Assets</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <span className="text-neutral-500 font-sans block">Total Assets (Debit Normal)</span>
              <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 block mt-1 tabular-nums">
                {formatCurrency(metrics.totalAssets)}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5 font-sans">
                Cash + AR + Input VAT (₱{metrics.inputVatTotal.toFixed(2)}) + Form 2307 CWT (₱{metrics.cwtReceivableTotal.toFixed(2)})
              </span>
            </div>

            <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <span className="text-neutral-500 font-sans block">Total Liabilities</span>
              <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 block mt-1 tabular-nums">
                {formatCurrency(metrics.totalLiabilities)}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5 font-sans">
                Trade AP + 12% Output VAT (₱{metrics.outputVatTotal.toFixed(2)}) + EWT Payable
              </span>
            </div>

            <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <span className="text-neutral-500 font-sans block">Stockholders' Equity</span>
              <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100 block mt-1 tabular-nums">
                {formatCurrency(metrics.totalEquity)}
              </span>
              <span className="text-[10px] text-neutral-400 block mt-0.5 font-sans">
                Paid-In Capital + Retained Earnings + Net Income ({formatCurrency(metrics.netIncome)})
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-neutral-100/80 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/80 flex items-center justify-between text-xs">
            <span className="font-mono text-neutral-700 dark:text-neutral-300">
              Assets = Liabilities + Equity Invariant:
            </span>
            <span className="font-mono font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              {metrics.isEquationBalanced ? 'VERIFIED (Zero Variance Equilibrium)' : 'DISCREPANCY DETECTED'}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
};
