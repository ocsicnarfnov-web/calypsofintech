import React, { useState, useRef, useEffect } from 'react';
import { 
  Sun, 
  Moon, 
  Plus, 
  FileText, 
  Layers, 
  ShieldCheck, 
  Database, 
  Cloud,
  Building2,
  Users,
  LogOut,
  UserPlus,
  ChevronDown,
  LogIn
} from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { useAuth } from '../../context/AuthContext';
import { ROLE_DEFINITIONS } from '../../types/auth';

interface AppHeaderProps {
  currentView: string;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenInvoiceModal: () => void;
  onOpenJournalModal: () => void;
  onOpenArchitectureModal: () => void;
  onOpenDeployModal: () => void;
  onOpenSupabaseModal: () => void;
  onOpenCompanyProfileModal: () => void;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onNavigateToUsers: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentView,
  isDark,
  onToggleTheme,
  onOpenInvoiceModal,
  onOpenJournalModal,
  onOpenArchitectureModal,
  onOpenDeployModal,
  onOpenSupabaseModal,
  onOpenCompanyProfileModal,
  onOpenAuthModal,
  onNavigateToUsers,
}) => {
  const { trialBalance, companyProfile } = useAccounting();
  const { currentUser, logout, isAuthenticated } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const viewTitles: Record<string, { title: string; category: string }> = {
    overview: { title: 'Executive Financial & Tax Console', category: 'Executive View' },
    billing: { title: 'BIR VAT Invoices & Receivables', category: 'Tax Invoicing' },
    ledger: { title: 'General Ledger Audit Stream', category: 'Double-Entry Accounting' },
    accounts: { title: 'Chart of Accounts (COA)', category: 'Financial Structure' },
    reports: { title: 'BIR Books of Accounts & Financial Statements', category: 'Statutory Reports' },
    customers: { title: 'Customer Taxpayer Directory', category: 'Receivables & 2307' },
    users: { title: 'Account Management & Access Control', category: 'System Administration' },
  };

  const current = viewTitles[currentView] || { title: 'Calypso', category: 'Workspace' };
  const currentRoleDef = currentUser?.role ? ROLE_DEFINITIONS[currentUser.role] : null;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      {/* Zone 1: Breadcrumb Hierarchy with BIR RDO */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={onOpenCompanyProfileModal}
          className="text-xs font-mono font-semibold text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white underline-offset-4 hover:underline transition-colors truncate"
          title="Click to view & edit company tax profile"
        >
          {companyProfile.name}
        </button>
        <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">/</span>
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap hidden sm:inline">
          {companyProfile.rdoCode.split('-')[0].trim()}
        </span>
        <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline" aria-hidden="true">/</span>
        <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
          {current.title}
        </h1>
      </div>

      {/* Zone 2: System Health, Blueprints & Company Profile */}
      <div className="hidden xl:flex items-center gap-2.5 text-xs">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neutral-100/80 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-300 font-mono text-[11px]">
          <span className="text-neutral-400">BIR CAS:</span>
          {trialBalance.isBalanced ? (
            <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              <span>Balanced</span>
            </span>
          ) : (
            <span className="text-rose-700 dark:text-rose-400 font-medium">
              ₱{trialBalance.difference.toFixed(2)} Diff
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenCompanyProfileModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap"
          title="Edit Company Tax Credentials, TIN, and CAS Permit"
        >
          <Building2 className="h-3.5 w-3.5 text-neutral-500" />
          <span>Company Profile</span>
        </button>

        <button
          type="button"
          onClick={onOpenSupabaseModal}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-emerald-700 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 transition-colors whitespace-nowrap text-[11px]"
          title="Supabase PostgreSQL Schema & Migration Guide"
        >
          <Database className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
          <span>Supabase</span>
        </button>

        <button
          type="button"
          onClick={onOpenDeployModal}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors whitespace-nowrap text-[11px]"
          title="Render Production Blueprint"
        >
          <Cloud className="h-3 w-3 text-neutral-400" />
          <span>Render</span>
        </button>
      </div>

      {/* Zone 3: Actions, User Session & Theme Switch */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle visual theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          type="button"
          onClick={onOpenInvoiceModal}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-xs transition-colors whitespace-nowrap"
        >
          <FileText className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Issue BIR Invoice</span>
          <span className="sm:hidden">Invoice</span>
        </button>

        {/* User Session Profile & Switcher */}
        {currentUser ? (
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <div className="w-6 h-6 rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold text-[11px]">
                {currentUser.displayName.charAt(0)}
              </div>
              <div className="hidden md:flex flex-col text-left -space-y-0.5">
                <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 max-w-[120px] truncate">
                  {currentUser.displayName.split(' ')[0]}
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {currentRoleDef?.label.split('/')[0].trim()}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-neutral-400" />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg py-1.5 z-50 text-xs">
                {/* User info header */}
                <div className="px-3.5 py-2 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                    {currentUser.displayName}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-mono block truncate">
                    {currentUser.email}
                  </span>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${currentRoleDef?.badgeColor}`}>
                      {currentRoleDef?.label.split('/')[0]}
                    </span>
                    {currentUser.cpaLicenseNo && (
                      <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400">
                        {currentUser.cpaLicenseNo}
                      </span>
                    )}
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenCompanyProfileModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors"
                  >
                    <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Company Tax Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onNavigateToUsers();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors"
                  >
                    <Users className="h-3.5 w-3.5 text-neutral-400" />
                    <span>User Accounts Directory</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenAuthModal('register');
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-left transition-colors"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-neutral-400" />
                    <span>Register New Account</span>
                  </button>
                </div>

                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onOpenAuthModal('login')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
