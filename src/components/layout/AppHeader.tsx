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
  LogIn,
  Check,
  BookOpen,
  PlusCircle
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
  onOpenAddCompanyModal: () => void;
  onOpenNewLedgerModal: () => void;
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
  onOpenAddCompanyModal,
  onOpenNewLedgerModal,
  onOpenAuthModal,
  onNavigateToUsers,
}) => {
  const { 
    trialBalance, 
    companyProfile, 
    companies, 
    activeCompanyId, 
    switchCompany,
    ledgers, 
    activeLedgerId, 
    activeLedger, 
    switchLedger 
  } = useAccounting();
  const { currentUser, logout, isAuthenticated } = useAuth();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCompanyMenuOpen, setIsCompanyMenuOpen] = useState(false);
  const [isLedgerMenuOpen, setIsLedgerMenuOpen] = useState(false);
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const companyMenuRef = useRef<HTMLDivElement>(null);
  const ledgerMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
      if (companyMenuRef.current && !companyMenuRef.current.contains(target)) {
        setIsCompanyMenuOpen(false);
      }
      if (ledgerMenuRef.current && !ledgerMenuRef.current.contains(target)) {
        setIsLedgerMenuOpen(false);
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

  // Filter ledgers that belong to active company
  const companyLedgers = ledgers.filter(
    (l) => !l.companyId || l.companyId === activeCompanyId
  );

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 px-6 py-3 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      {/* Zone 1: Multi-Company & Multi-Ledger Selectors */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Company Entity Selector Dropdown */}
        <div className="relative" ref={companyMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsCompanyMenuOpen(!isCompanyMenuOpen);
              setIsLedgerMenuOpen(false);
              setIsUserMenuOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-neutral-900 dark:text-neutral-100 bg-neutral-100/90 dark:bg-neutral-800/90 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors max-w-[200px] truncate"
            title="Switch active company entity or register a new one"
          >
            <Building2 className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
            <span className="truncate">{companyProfile.name}</span>
            <ChevronDown className="h-3 w-3 text-neutral-400 shrink-0" />
          </button>

          {isCompanyMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-72 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                  Corporate Entities ({companies.length})
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">BIR CAS</span>
              </div>

              <div className="max-h-60 overflow-y-auto py-1 divide-y divide-neutral-100/60 dark:divide-neutral-800/60">
                {companies.map((c) => {
                  const isActive = (c.id || 'comp-001') === activeCompanyId;
                  return (
                    <button
                      key={c.id || c.tin}
                      type="button"
                      onClick={() => {
                        switchCompany(c.id || 'comp-001');
                        setIsCompanyMenuOpen(false);
                      }}
                      className={`w-full flex items-start justify-between gap-2 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                        isActive ? 'bg-neutral-50 dark:bg-neutral-800/60 font-semibold' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-neutral-900 dark:text-neutral-100 font-medium truncate">
                            {c.name}
                          </span>
                          {c.branchCode && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 font-mono">
                              Br {c.branchCode}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-neutral-400 font-mono block truncate">
                          TIN: {c.tin} · {c.rdoCode.split('-')[0].trim()}
                        </span>
                      </div>
                      {isActive && <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1.5 px-2 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsCompanyMenuOpen(false);
                    onOpenAddCompanyModal();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-left transition-colors font-medium text-[11px]"
                >
                  <PlusCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>+ Register New Company Entity</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCompanyMenuOpen(false);
                    onOpenCompanyProfileModal();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-left transition-colors text-[11px]"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Edit Tax Credentials</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <span className="text-neutral-300 dark:text-neutral-700" aria-hidden="true">/</span>

        {/* General Ledger Book Selector Dropdown */}
        <div className="relative" ref={ledgerMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsLedgerMenuOpen(!isLedgerMenuOpen);
              setIsCompanyMenuOpen(false);
              setIsUserMenuOpen(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium text-neutral-800 dark:text-neutral-200 bg-neutral-100/90 dark:bg-neutral-800/90 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/80 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors max-w-[210px] truncate"
            title="Switch General Ledger Book or create a new ledger"
          >
            <BookOpen className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
            <span className="font-semibold">{activeLedger?.code || 'GL-2026-PHP'}</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-sans">
              {activeLedger?.currencySymbol || '₱'} {activeLedger?.currency || 'PHP'}
            </span>
            <ChevronDown className="h-3 w-3 text-neutral-400 shrink-0" />
          </button>

          {isLedgerMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-80 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xl py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-1.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
                  General Ledger Books ({companyLedgers.length})
                </span>
                <span className="text-[10px] text-neutral-400 font-mono">
                  {companyProfile.name.split(' ')[0]}
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto py-1 divide-y divide-neutral-100/60 dark:divide-neutral-800/60">
                {companyLedgers.map((l) => {
                  const isActive = l.id === activeLedgerId;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => {
                        switchLedger(l.id);
                        setIsLedgerMenuOpen(false);
                      }}
                      className={`w-full flex items-start justify-between gap-2 px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                        isActive ? 'bg-neutral-50 dark:bg-neutral-800/60 font-semibold' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-neutral-900 dark:text-neutral-100 font-semibold">
                            {l.code}
                          </span>
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-sans uppercase font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
                            {l.type}
                          </span>
                          {l.isPrimary && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-sans font-medium">
                              Primary
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block truncate">
                          {l.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-mono block">
                          FY {l.fiscalYear} · Currency: {l.currencySymbol} {l.currency}
                        </span>
                      </div>
                      {isActive && <Check className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-1.5 px-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsLedgerMenuOpen(false);
                    onOpenNewLedgerModal();
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-left transition-colors font-medium text-[11px]"
                >
                  <PlusCircle className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>+ Create New General Ledger Book</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <span className="text-neutral-300 dark:text-neutral-700 hidden sm:inline" aria-hidden="true">/</span>
        <h1 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate hidden sm:inline">
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
