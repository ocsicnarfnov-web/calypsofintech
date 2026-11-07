/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AccountingProvider } from './context/AccountingContext';
import { AppSidebar } from './components/layout/AppSidebar';
import { AppHeader } from './components/layout/AppHeader';
import { OverviewView } from './components/overview/OverviewView';
import { BillingView } from './components/billing/BillingView';
import { GeneralLedgerView } from './components/ledger/GeneralLedgerView';
import { ChartOfAccountsView } from './components/accounts/ChartOfAccountsView';
import { ReportsView } from './components/reports/ReportsView';
import { CustomersView } from './components/customers/CustomersView';
import { UserManagementView } from './components/users/UserManagementView';
import { InvoiceModal } from './components/billing/InvoiceModal';
import { InvoiceDetailModal } from './components/billing/InvoiceDetailModal';
import { RecordPaymentModal } from './components/billing/RecordPaymentModal';
import { JournalEntryModal } from './components/ledger/JournalEntryModal';
import { AddAccountModal } from './components/accounts/AddAccountModal';
import { AccountDetailDrawer } from './components/accounts/AccountDetailDrawer';
import { CustomerModal } from './components/customers/CustomerModal';
import { ArchitectureModal } from './components/architecture/ArchitectureModal';
import { RenderDeployModal } from './components/deploy/RenderDeployModal';
import { SupabaseDeployModal } from './components/deploy/SupabaseDeployModal';
import { CompanyProfileModal } from './components/profile/CompanyProfileModal';
import { AuthModal } from './components/auth/AuthModal';
import { Account, Customer, Invoice } from './types/accounting';

function AppContent() {
  const [currentView, setCurrentView] = useState<string>('overview');

  // Theme management with .dark class
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ledgerone_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ledgerone_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ledgerone_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Modals & Drawers state
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isCompanyProfileModalOpen, setIsCompanyProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<Invoice | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [selectedAccountForDetail, setSelectedAccountForDetail] = useState<Account | null>(null);
  const [customerModalState, setCustomerModalState] = useState<{
    isOpen: boolean;
    customer: Customer | null;
  }>({ isOpen: false, customer: null });

  const [highlightedJournalEntry, setHighlightedJournalEntry] = useState<string | undefined>(
    undefined
  );

  const [selectedCustomerIdForInvoice, setSelectedCustomerIdForInvoice] = useState<string | undefined>(undefined);

  const handleNavigateToLedgerEntry = (entryNumber: string) => {
    setHighlightedJournalEntry(entryNumber);
    setCurrentView('ledger');
  };

  const handleOpenAuth = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Sidebar Navigation */}
      <AppSidebar
        currentView={currentView}
        onSelectView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onOpenCompanyProfileModal={() => setIsCompanyProfileModalOpen(true)}
      />

      {/* Main Viewport Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          currentView={currentView}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          onOpenInvoiceModal={() => {
            setSelectedCustomerIdForInvoice(undefined);
            setIsInvoiceModalOpen(true);
          }}
          onOpenJournalModal={() => setIsJournalModalOpen(true)}
          onOpenArchitectureModal={() => setIsArchitectureModalOpen(true)}
          onOpenDeployModal={() => setIsDeployModalOpen(true)}
          onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
          onOpenCompanyProfileModal={() => setIsCompanyProfileModalOpen(true)}
          onOpenAuthModal={handleOpenAuth}
          onNavigateToUsers={() => {
            setCurrentView('users');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {currentView === 'overview' && (
            <OverviewView
              onNavigate={(v) => setCurrentView(v)}
              onOpenInvoiceModal={() => {
                setSelectedCustomerIdForInvoice(undefined);
                setIsInvoiceModalOpen(true);
              }}
              onOpenJournalModal={() => setIsJournalModalOpen(true)}
              onSelectInvoice={(inv) => setSelectedInvoiceForDetail(inv)}
            />
          )}

          {currentView === 'billing' && (
            <BillingView
              onOpenInvoiceModal={() => {
                setSelectedCustomerIdForInvoice(undefined);
                setIsInvoiceModalOpen(true);
              }}
              onSelectInvoice={(inv) => setSelectedInvoiceForDetail(inv)}
              onRecordPayment={(inv) => setSelectedInvoiceForPayment(inv)}
              onNavigateToLedgerEntry={handleNavigateToLedgerEntry}
            />
          )}

          {currentView === 'ledger' && (
            <GeneralLedgerView
              onOpenJournalModal={() => setIsJournalModalOpen(true)}
              highlightEntryNumber={highlightedJournalEntry}
            />
          )}

          {currentView === 'accounts' && (
            <ChartOfAccountsView
              onOpenAddAccountModal={() => setIsAddAccountModalOpen(true)}
              onSelectAccount={(acc) => setSelectedAccountForDetail(acc)}
            />
          )}

          {currentView === 'reports' && <ReportsView />}

          {currentView === 'customers' && (
            <CustomersView
              onOpenCustomerModal={(cust) =>
                setCustomerModalState({ isOpen: true, customer: cust || null })
              }
              onOpenInvoiceModalWithCustomer={(custId) => {
                setSelectedCustomerIdForInvoice(custId);
                setIsInvoiceModalOpen(true);
              }}
              onSelectInvoice={(inv) => setSelectedInvoiceForDetail(inv)}
            />
          )}

          {currentView === 'users' && (
            <UserManagementView
              onOpenRegisterModal={() => handleOpenAuth('register')}
            />
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        initialCustomerId={selectedCustomerIdForInvoice}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedCustomerIdForInvoice(undefined);
        }}
        onInvoiceCreated={() => {
          setCurrentView('billing');
        }}
      />

      <JournalEntryModal
        isOpen={isJournalModalOpen}
        onClose={() => setIsJournalModalOpen(false)}
        onEntryCreated={(entryNum) => {
          setHighlightedJournalEntry(entryNum);
          setCurrentView('ledger');
        }}
      />

      <AddAccountModal
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
      />

      <AccountDetailDrawer
        account={selectedAccountForDetail}
        isOpen={!!selectedAccountForDetail}
        onClose={() => setSelectedAccountForDetail(null)}
        onNavigateToJournal={handleNavigateToLedgerEntry}
      />

      <InvoiceDetailModal
        invoice={selectedInvoiceForDetail}
        isOpen={!!selectedInvoiceForDetail}
        onClose={() => setSelectedInvoiceForDetail(null)}
        onRecordPayment={(inv) => {
          setSelectedInvoiceForPayment(inv);
        }}
        onNavigateToLedgerEntry={handleNavigateToLedgerEntry}
      />

      <RecordPaymentModal
        invoice={selectedInvoiceForPayment}
        isOpen={!!selectedInvoiceForPayment}
        onClose={() => setSelectedInvoiceForPayment(null)}
      />

      <CustomerModal
        customer={customerModalState.customer}
        isOpen={customerModalState.isOpen}
        onClose={() => setCustomerModalState({ isOpen: false, customer: null })}
      />

      <ArchitectureModal
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      <RenderDeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      <SupabaseDeployModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

      <CompanyProfileModal
        isOpen={isCompanyProfileModalOpen}
        onClose={() => setIsCompanyProfileModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AccountingProvider>
        <AppContent />
      </AccountingProvider>
    </AuthProvider>
  );
}
