import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  BookOpen,
  FolderTree,
  Scale,
  Users,
  RotateCcw,
  ShieldCheck,
  Cpu,
  FileCheck2,
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';

interface AppSidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  onOpenArchitectureModal: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  currentView,
  onSelectView,
  onOpenArchitectureModal,
}) => {
  const { trialBalance, resetToDemoData, companyProfile } = useAccounting();

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'billing', label: 'BIR VAT Invoices', icon: Receipt },
    { id: 'ledger', label: 'General Ledger', icon: BookOpen },
    { id: 'accounts', label: 'Chart of Accounts', icon: FolderTree },
    { id: 'reports', label: 'Books of Accounts & Tax', icon: Scale },
    { id: 'customers', label: 'Taxpayers & AR', icon: Users },
  ];

  const handleReset = () => {
    if (
      window.confirm(
        'Reset Philippine BIR sample database to pristine CAS compliant demonstration state?'
      )
    ) {
      resetToDemoData();
    }
  };

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between h-screen sticky top-0 bg-neutral-900 text-neutral-300 border-r border-neutral-800 transition-colors select-none">
      {/* Top Branding & Nav */}
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-neutral-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-950 font-bold text-xs font-mono tracking-tighter">
              CA
            </div>
            <div>
              <span className="text-sm font-semibold tracking-tight text-white block">
                Calypso
              </span>
              <span className="text-[10px] font-mono text-neutral-400 block -mt-0.5">
                BIR CAS & EOPT Core
              </span>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-3 pb-1.5 text-[11px] font-medium tracking-wider text-neutral-400 uppercase">
            Platform Engine
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-neutral-800 text-white font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status & BIR Compliance Indicator */}
      <div className="p-3 border-t border-neutral-800/80 space-y-2">
        {/* BIR CAS Certification Widget */}
        <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/60 text-xs">
          <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
            <span>BIR CAS ACCREDITED</span>
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="mt-1 font-mono text-[10px] text-neutral-300 truncate">
            {companyProfile.casPermitNo}
          </div>
          <div className="mt-1 flex items-center justify-between text-[11px] font-mono tabular-nums">
            <span className="text-neutral-400">RR 9-2009 Books:</span>
            <span
              className={
                trialBalance.isBalanced ? 'text-emerald-400 font-medium' : 'text-rose-400'
              }
            >
              {trialBalance.isBalanced ? 'Equilibrium (₱0.00)' : 'Out of Balance'}
            </span>
          </div>
        </div>

        {/* System Architecture Specs */}
        <button
          type="button"
          onClick={onOpenArchitectureModal}
          className="w-full flex items-center justify-between px-3 py-2 text-xs text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5" />
            <span>BIR Architecture Specs</span>
          </div>
          <span className="text-[10px] font-mono text-neutral-400">v1.0</span>
        </button>

        {/* Reset Demo Data Button */}
        <button
          type="button"
          onClick={handleReset}
          className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-neutral-400 hover:text-neutral-300 rounded-lg hover:bg-neutral-800/40 transition-colors"
          title="Reset database to pristine BIR demo state"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Sample BIR Ledger</span>
        </button>
      </div>
    </aside>
  );
};
