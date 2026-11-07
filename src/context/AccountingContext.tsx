import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Account,
  Customer,
  Invoice,
  JournalEntry,
  JournalEntryLine,
  RecurringSchedule,
  CompanyProfile,
  InvoiceItem,
  PaymentTerms,
  VatType,
  BirForm2307Record,
  GeneralLedgerBook,
} from '../types/accounting';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_RECURRING_SCHEDULES,
  INITIAL_COMPANY_PROFILE,
  INITIAL_COMPANIES,
  INITIAL_LEDGERS,
} from '../data/seedData';

interface TrialBalanceRow {
  account: Account;
  debit: number;
  credit: number;
}

interface AccountActivityItem {
  id: string;
  journalEntryId: string;
  entryNumber: string;
  date: string;
  description: string;
  source: string;
  debit: number;
  credit: number;
  runningBalance: number;
}

interface AgingBucket {
  current: number;
  days1_30: number;
  days31_60: number;
  days61_90: number;
  daysOver90: number;
  total: number;
}

interface FinancialMetrics {
  cashOnHand: number;
  accountsReceivableOutstanding: number;
  accountsPayableOutstanding: number;
  netRevenue: number;
  totalExpenses: number;
  netIncome: number;
  grossMarginPercent: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isEquationBalanced: boolean;
  agingSummary: AgingBucket;
  // BIR Specific Metrics
  outputVatTotal: number;
  inputVatTotal: number;
  netVatPayable: number;
  cwtReceivableTotal: number;
}

export interface BirSalesJournalRow {
  date: string;
  invoiceNumber: string;
  customerName: string;
  customerTin: string;
  customerBranch: string;
  vatableSales: number;
  vatExemptSales: number;
  zeroRatedSales: number;
  outputVat: number;
  grossSales: number;
  status: string;
}

export interface BirCashReceiptsRow {
  date: string;
  reference: string;
  customerName: string;
  customerTin: string;
  invoiceNumber: string;
  cashInBank: number;
  cwtWithheld: number;
  arCredited: number;
}

interface AccountingContextType {
  accounts: Account[];
  customers: Customer[];
  invoices: Invoice[];
  journalEntries: JournalEntry[];
  recurringSchedules: RecurringSchedule[];
  companyProfile: CompanyProfile;
  metrics: FinancialMetrics;
  trialBalance: {
    rows: TrialBalanceRow[];
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
    difference: number;
  };
  getAccountBalance: (accountCode: string) => number;
  getAccountActivity: (accountCode: string) => AccountActivityItem[];
  addJournalEntry: (
    entry: Omit<JournalEntry, 'id' | 'createdAt'>
  ) => { success: boolean; error?: string };
  reverseJournalEntry: (id: string, reason?: string) => { success: boolean; error?: string };
  createInvoice: (
    invoiceData: {
      customerId: string;
      issueDate: string;
      dueDate: string;
      items: Omit<InvoiceItem, 'id' | 'amount'>[];
      paymentTerms: PaymentTerms;
      ewtRate?: number;
      notes?: string;
      autoIssue?: boolean;
    }
  ) => { success: boolean; invoiceId?: string; error?: string };
  issueInvoice: (id: string) => { success: boolean; error?: string };
  recordPayment: (
    invoiceId: string,
    payment: {
      amount: number;
      cwtWithheldAmount?: number;
      method: 'bank_transfer' | 'check' | 'direct_deposit' | 'credit_card';
      reference: string;
      officialReceiptNo?: string;
      form2307Collected: boolean;
      notes?: string;
      date: string;
    }
  ) => { success: boolean; error?: string };
  voidInvoice: (invoiceId: string, reason?: string) => { success: boolean; error?: string };
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  addAccount: (account: Account) => { success: boolean; error?: string };
  toggleRecurringSchedule: (id: string) => void;
  runRecurringSchedule: (id: string) => { success: boolean; invoiceId?: string };
  resetToDemoData: () => void;
  updateCompanyProfile: (profile: Partial<CompanyProfile>, companyId?: string) => void;
  // Multi-Company
  companies: CompanyProfile[];
  activeCompanyId: string;
  addCompany: (company: Omit<CompanyProfile, 'id'>) => CompanyProfile;
  switchCompany: (companyId: string) => void;
  deleteCompany: (companyId: string) => { success: boolean; error?: string };
  // Multi-Ledger
  ledgers: GeneralLedgerBook[];
  activeLedgerId: string;
  activeLedger: GeneralLedgerBook;
  addLedger: (ledger: Omit<GeneralLedgerBook, 'id' | 'createdAt'>, cloneAccountsFromId?: string) => GeneralLedgerBook;
  switchLedger: (ledgerId: string) => void;
  updateLedger: (ledgerId: string, updates: Partial<GeneralLedgerBook>) => void;
  // BIR Books of Accounts
  getSalesJournal: () => BirSalesJournalRow[];
  getCashReceiptsJournal: () => BirCashReceiptsRow[];
  getBir2307Records: () => BirForm2307Record[];
}

const STORAGE_KEYS = {
  ACCOUNTS: 'calypso_accounts_ph_v2',
  CUSTOMERS: 'calypso_customers_ph_v2',
  INVOICES: 'calypso_invoices_ph_v2',
  JOURNAL_ENTRIES: 'calypso_journal_ph_v2',
  RECURRING: 'calypso_recurring_ph_v2',
  COMPANY: 'calypso_company_ph_v2',
  COMPANIES: 'calypso_companies_ph_v3',
  ACTIVE_COMPANY_ID: 'calypso_active_company_id_v3',
  LEDGERS: 'calypso_ledgers_ph_v3',
  ACTIVE_LEDGER_ID: 'calypso_active_ledger_id_v3',
};

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export const AccountingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      return saved ? JSON.parse(saved) : INITIAL_ACCOUNTS;
    } catch {
      return INITIAL_ACCOUNTS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JOURNAL_ENTRIES);
      return saved ? JSON.parse(saved) : INITIAL_JOURNAL_ENTRIES;
    } catch {
      return INITIAL_JOURNAL_ENTRIES;
    }
  });

  const [recurringSchedules, setRecurringSchedules] = useState<RecurringSchedule[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RECURRING);
      return saved ? JSON.parse(saved) : INITIAL_RECURRING_SCHEDULES;
    } catch {
      return INITIAL_RECURRING_SCHEDULES;
    }
  });

  // Multi-Company State
  const [companies, setCompanies] = useState<CompanyProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COMPANIES);
      return saved ? JSON.parse(saved) : INITIAL_COMPANIES;
    } catch {
      return INITIAL_COMPANIES;
    }
  });

  const [activeCompanyId, setActiveCompanyId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_COMPANY_ID);
      return saved || INITIAL_COMPANIES[0].id || 'comp-001';
    } catch {
      return 'comp-001';
    }
  });

  // Multi-Ledger State
  const [ledgers, setLedgers] = useState<GeneralLedgerBook[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LEDGERS);
      return saved ? JSON.parse(saved) : INITIAL_LEDGERS;
    } catch {
      return INITIAL_LEDGERS;
    }
  });

  const [activeLedgerId, setActiveLedgerId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_LEDGER_ID);
      return saved || INITIAL_LEDGERS[0].id || 'ledger-001';
    } catch {
      return 'ledger-001';
    }
  });

  const companyProfile = useMemo(() => {
    return companies.find((c) => c.id === activeCompanyId) || companies[0] || INITIAL_COMPANY_PROFILE;
  }, [companies, activeCompanyId]);

  const activeLedger = useMemo(() => {
    return (
      ledgers.find((l) => l.id === activeLedgerId) ||
      ledgers.find((l) => l.companyId === activeCompanyId) ||
      ledgers[0] ||
      INITIAL_LEDGERS[0]
    );
  }, [ledgers, activeLedgerId, activeCompanyId]);

  const updateCompanyProfile = (updates: Partial<CompanyProfile>, targetCompanyId?: string) => {
    const idToUpdate = targetCompanyId || activeCompanyId;
    setCompanies((prev) => {
      const next = prev.map((c) => (c.id === idToUpdate ? { ...c, ...updates } : c));
      try {
        localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save companies', e);
      }
      return next;
    });
  };

  const addCompany = (companyData: Omit<CompanyProfile, 'id'>): CompanyProfile => {
    const newId = `comp-${Date.now()}`;
    const newComp: CompanyProfile = {
      ...companyData,
      id: newId,
    };

    // Automatically create a default Primary Statutory General Ledger for the company
    const newPrimaryLedger: GeneralLedgerBook = {
      id: `ledger-${Date.now()}`,
      companyId: newId,
      name: `${newComp.name} Statutory General Ledger (PHP)`,
      code: `GL-${new Date().getFullYear()}-${newComp.name.slice(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X')}`,
      type: 'statutory',
      currency: newComp.currency || 'PHP',
      currencySymbol: newComp.currency === 'USD' ? '$' : '₱',
      fiscalYear: new Date().getFullYear().toString(),
      isPrimary: true,
      status: 'active',
      description: `Official BIR CAS statutory books of accounts for ${newComp.legalName}.`,
      createdAt: new Date().toISOString(),
    };

    setCompanies((prev) => [newComp, ...prev]);
    setLedgers((prev) => [newPrimaryLedger, ...prev]);
    setActiveCompanyId(newId);
    setActiveLedgerId(newPrimaryLedger.id);

    return newComp;
  };

  const switchCompany = (companyId: string) => {
    const targetComp = companies.find((c) => c.id === companyId);
    if (!targetComp) return;

    setActiveCompanyId(companyId);

    // Switch active ledger to primary statutory ledger of this company
    const compLedger =
      ledgers.find((l) => l.companyId === companyId && l.isPrimary) ||
      ledgers.find((l) => l.companyId === companyId);

    if (compLedger) {
      setActiveLedgerId(compLedger.id);
    }
  };

  const deleteCompany = (companyId: string): { success: boolean; error?: string } => {
    if (companies.length <= 1) {
      return { success: false, error: 'Cannot delete the only registered company entity.' };
    }

    setCompanies((prev) => prev.filter((c) => c.id !== companyId));
    setLedgers((prev) => prev.filter((l) => l.companyId !== companyId));

    if (activeCompanyId === companyId) {
      const remaining = companies.filter((c) => c.id !== companyId);
      if (remaining.length > 0) {
        switchCompany(remaining[0].id || 'comp-001');
      }
    }

    return { success: true };
  };

  const addLedger = (
    ledgerData: Omit<GeneralLedgerBook, 'id' | 'createdAt'>
  ): GeneralLedgerBook => {
    const newId = `ledger-${Date.now()}`;
    const targetCompanyId = ledgerData.companyId || activeCompanyId;

    const newLedger: GeneralLedgerBook = {
      ...ledgerData,
      id: newId,
      companyId: targetCompanyId,
      createdAt: new Date().toISOString(),
    };

    setLedgers((prev) => {
      let updated = prev;
      if (newLedger.isPrimary) {
        updated = updated.map((l) =>
          l.companyId === targetCompanyId ? { ...l, isPrimary: false } : l
        );
      }
      return [newLedger, ...updated];
    });

    setActiveLedgerId(newId);
    return newLedger;
  };

  const switchLedger = (ledgerId: string) => {
    const target = ledgers.find((l) => l.id === ledgerId);
    if (target) {
      setActiveLedgerId(ledgerId);
      if (target.companyId && target.companyId !== activeCompanyId) {
        setActiveCompanyId(target.companyId);
      }
    }
  };

  const updateLedger = (ledgerId: string, updates: Partial<GeneralLedgerBook>) => {
    setLedgers((prev) =>
      prev.map((l) => (l.id === ledgerId ? { ...l, ...updates } : l))
    );
  };

  // Local storage synchronization for companies and ledgers
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  }, [companies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_COMPANY_ID, activeCompanyId);
  }, [activeCompanyId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LEDGERS, JSON.stringify(ledgers));
  }, [ledgers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_LEDGER_ID, activeLedgerId);
  }, [activeLedgerId]);

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOURNAL_ENTRIES, JSON.stringify(journalEntries));
  }, [journalEntries]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECURRING, JSON.stringify(recurringSchedules));
  }, [recurringSchedules]);

  // Compute posted balance for any account
  const getAccountBalance = (accountCode: string): number => {
    const account = accounts.find((a) => a.code === accountCode);
    if (!account) return 0;

    let totalDebits = 0;
    let totalCredits = 0;

    journalEntries.forEach((je) => {
      if (je.status !== 'posted') return;
      je.lines.forEach((line) => {
        if (line.accountCode === accountCode) {
          totalDebits += Number(line.debit) || 0;
          totalCredits += Number(line.credit) || 0;
        }
      });
    });

    if (account.normalBalance === 'debit') {
      return totalDebits - totalCredits;
    } else {
      return totalCredits - totalDebits;
    }
  };

  // Get chronological ledger activity with running balance
  const getAccountActivity = (accountCode: string): AccountActivityItem[] => {
    const account = accounts.find((a) => a.code === accountCode);
    if (!account) return [];

    const items: {
      id: string;
      journalEntryId: string;
      entryNumber: string;
      date: string;
      description: string;
      source: string;
      debit: number;
      credit: number;
    }[] = [];

    const sortedEntries = [...journalEntries]
      .filter((je) => je.status === 'posted')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedEntries.forEach((je) => {
      je.lines.forEach((line) => {
        if (line.accountCode === accountCode) {
          items.push({
            id: line.id,
            journalEntryId: je.id,
            entryNumber: je.entryNumber,
            date: je.date,
            description: line.memo || je.description,
            source: je.source,
            debit: line.debit,
            credit: line.credit,
          });
        }
      });
    });

    let cumulative = 0;
    return items.map((item) => {
      if (account.normalBalance === 'debit') {
        cumulative += item.debit - item.credit;
      } else {
        cumulative += item.credit - item.debit;
      }
      return {
        ...item,
        runningBalance: cumulative,
      };
    });
  };

  // Trial Balance calculation
  const trialBalance = useMemo(() => {
    let totalDebits = 0;
    let totalCredits = 0;

    const rows: TrialBalanceRow[] = accounts.map((account) => {
      let accDebits = 0;
      let accCredits = 0;

      journalEntries.forEach((je) => {
        if (je.status !== 'posted') return;
        je.lines.forEach((line) => {
          if (line.accountCode === account.code) {
            accDebits += Number(line.debit) || 0;
            accCredits += Number(line.credit) || 0;
          }
        });
      });

      const net = accDebits - accCredits;
      let debit = 0;
      let credit = 0;

      if (account.normalBalance === 'debit') {
        if (net >= 0) {
          debit = net;
        } else {
          credit = Math.abs(net);
        }
      } else {
        const creditNet = accCredits - accDebits;
        if (creditNet >= 0) {
          credit = creditNet;
        } else {
          debit = Math.abs(creditNet);
        }
      }

      totalDebits += debit;
      totalCredits += credit;

      return {
        account,
        debit,
        credit,
      };
    });

    const difference = Math.abs(totalDebits - totalCredits);
    const isBalanced = difference < 0.01;

    return {
      rows,
      totalDebits,
      totalCredits,
      isBalanced,
      difference,
    };
  }, [accounts, journalEntries]);

  // Financial Metrics and Statements calculations
  const metrics = useMemo<FinancialMetrics>(() => {
    // Cash accounts (1010 + 1020)
    const cash1010 = getAccountBalance('1010');
    const cash1020 = getAccountBalance('1020');
    const cashOnHand = cash1010 + cash1020;

    // Accounts receivable
    const ar1200 = getAccountBalance('1200');
    const ap2010 = getAccountBalance('2010');

    // BIR Tax accounts
    const outputVatTotal = getAccountBalance('2110'); // Output VAT Payable
    const inputVatTotal = getAccountBalance('1150'); // Input VAT Asset
    const cwtReceivableTotal = getAccountBalance('1160'); // Creditable Withholding Tax (2307)
    const netVatPayable = Math.max(0, outputVatTotal - inputVatTotal);

    // Revenue accounts (4000s)
    let netRevenue = 0;
    let cogs = 0;
    let operatingExpenses = 0;

    accounts.forEach((acc) => {
      const bal = getAccountBalance(acc.code);
      if (acc.type === 'revenue') {
        netRevenue += bal;
      } else if (acc.type === 'expense') {
        if (acc.subtype === 'cost_of_goods_sold') {
          cogs += bal;
        } else {
          operatingExpenses += bal;
        }
      }
    });

    const totalExpenses = cogs + operatingExpenses;
    const netIncome = netRevenue - totalExpenses;
    const grossMarginPercent = netRevenue > 0 ? ((netRevenue - cogs) / netRevenue) * 100 : 0;

    // Balance Sheet totals
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalEquity = 0;

    accounts.forEach((acc) => {
      const bal = getAccountBalance(acc.code);
      if (acc.type === 'asset') {
        totalAssets += bal;
      } else if (acc.type === 'liability') {
        totalLiabilities += bal;
      } else if (acc.type === 'equity') {
        totalEquity += bal;
      }
    });

    const totalEquityWithNetIncome = totalEquity + netIncome;
    const isEquationBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquityWithNetIncome)) < 0.01;

    // Aging Buckets for Accounts Receivable
    const now = new Date('2026-11-06T22:00:00Z').getTime();
    const aging: AgingBucket = {
      current: 0,
      days1_30: 0,
      days31_60: 0,
      days61_90: 0,
      daysOver90: 0,
      total: 0,
    };

    invoices.forEach((inv) => {
      if (inv.status === 'void' || inv.status === 'paid' || inv.balanceDue <= 0) return;

      const due = new Date(inv.dueDate).getTime();
      const diffDays = Math.floor((now - due) / (1000 * 60 * 60 * 24));
      const amount = inv.balanceDue;

      aging.total += amount;

      if (diffDays <= 0) {
        aging.current += amount;
      } else if (diffDays <= 30) {
        aging.days1_30 += amount;
      } else if (diffDays <= 60) {
        aging.days31_60 += amount;
      } else if (diffDays <= 90) {
        aging.days61_90 += amount;
      } else {
        aging.daysOver90 += amount;
      }
    });

    return {
      cashOnHand,
      accountsReceivableOutstanding: ar1200,
      accountsPayableOutstanding: ap2010,
      netRevenue,
      totalExpenses,
      netIncome,
      grossMarginPercent,
      totalAssets,
      totalLiabilities,
      totalEquity: totalEquityWithNetIncome,
      isEquationBalanced,
      agingSummary: aging,
      outputVatTotal,
      inputVatTotal,
      netVatPayable,
      cwtReceivableTotal,
    };
  }, [accounts, journalEntries, invoices]);

  // Add Manual Journal Entry
  const addJournalEntry = (entry: Omit<JournalEntry, 'id' | 'createdAt'>) => {
    let debits = 0;
    let credits = 0;

    entry.lines.forEach((l) => {
      debits += Number(l.debit) || 0;
      credits += Number(l.credit) || 0;
    });

    if (Math.abs(debits - credits) > 0.01) {
      return {
        success: false,
        error: `Journal entry is out of balance. Debits (₱${debits.toFixed(2)}) must equal Credits (₱${credits.toFixed(2)}). Variance: ₱${Math.abs(debits - credits).toFixed(2)}`,
      };
    }

    if (entry.lines.length < 2) {
      return {
        success: false,
        error: 'Double-entry requires at least two lines (one debit and one credit).',
      };
    }

    const newEntry: JournalEntry = {
      ...entry,
      id: `je-ph-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setJournalEntries((prev) => [newEntry, ...prev]);
    return { success: true };
  };

  // Reverse Journal Entry
  const reverseJournalEntry = (id: string, reason = 'Entry reversed by user') => {
    const original = journalEntries.find((je) => je.id === id);
    if (!original) {
      return { success: false, error: 'Original entry not found.' };
    }

    if (original.status === 'reversed') {
      return { success: false, error: 'Entry has already been reversed.' };
    }

    const reversedLines: JournalEntryLine[] = original.lines.map((l) => ({
      id: `rev-line-${Date.now()}-${Math.random()}`,
      accountCode: l.accountCode,
      accountName: l.accountName,
      debit: l.credit,
      credit: l.debit,
      memo: `[Reversal] ${l.memo || ''}`,
    }));

    const reversalEntry: JournalEntry = {
      id: `je-rev-${Date.now()}`,
      entryNumber: `REV-${original.entryNumber}`,
      date: new Date().toISOString().split('T')[0],
      description: `Reversal of ${original.entryNumber}: ${reason}`,
      source: 'manual',
      sourceId: original.id,
      status: 'posted',
      lines: reversedLines,
      createdAt: new Date().toISOString(),
      createdBy: 'BIR CAS Reversal Engine',
    };

    setJournalEntries((prev) => [
      reversalEntry,
      ...prev.map((je) =>
        je.id === original.id
          ? { ...je, status: 'reversed' as const, reversedByEntryId: reversalEntry.id }
          : je
      ),
    ]);

    return { success: true };
  };

  // Create BIR Sales Invoice
  const createInvoice = (data: {
    customerId: string;
    issueDate: string;
    dueDate: string;
    items: Omit<InvoiceItem, 'id' | 'amount'>[];
    paymentTerms: PaymentTerms;
    ewtRate?: number;
    notes?: string;
    autoIssue?: boolean;
  }) => {
    const customer = customers.find((c) => c.id === data.customerId);
    if (!customer) {
      return { success: false, error: 'Selected customer not found.' };
    }

    if (!data.items || data.items.length === 0) {
      return { success: false, error: 'Invoice must contain at least one line item.' };
    }

    let vatableSales = 0;
    let vatExemptSales = 0;
    let zeroRatedSales = 0;

    const fullItems: InvoiceItem[] = data.items.map((it, idx) => {
      const amount = Number(it.quantity) * Number(it.unitPrice);
      if (it.vatType === 'vatable') {
        vatableSales += amount;
      } else if (it.vatType === 'zero_rated') {
        zeroRatedSales += amount;
      } else {
        vatExemptSales += amount;
      }
      return {
        ...it,
        id: `item-${Date.now()}-${idx}`,
        taxRate: it.vatType === 'vatable' ? 12 : 0,
        amount,
      };
    });

    const outputVat = vatableSales * 0.12;
    const grossAmount = vatableSales + vatExemptSales + zeroRatedSales + outputVat;
    const ewtRate = data.ewtRate !== undefined ? data.ewtRate : 2; // Default 2% EWT for services under BIR
    const ewtAmount = vatableSales * (ewtRate / 100);
    const totalAmountDue = grossAmount;
    const netAmountDue = grossAmount - ewtAmount;

    const invCount = invoices.length + 1;
    const invoiceNumber = `SI-2026-${String(invCount).padStart(6, '0')}`;
    const invoiceId = `inv-ph-${Date.now()}`;
    const status = data.autoIssue ? 'issued' : 'draft';

    let journalEntryId: string | undefined;

    // If autoIssue, create and post journal entry immediately
    if (data.autoIssue) {
      const jeLines: JournalEntryLine[] = [];

      // DR 1200 Accounts Receivable - Trade (for Gross Total Amount: grossAmount)
      jeLines.push({
        id: `line-${Date.now()}-ar`,
        accountCode: '1200',
        accountName: 'Accounts Receivable - Trade',
        debit: grossAmount,
        credit: 0,
        memo: `A/R for ${invoiceNumber} (${customer.company} - TIN: ${customer.tin})`,
      });

      // Group revenue by accountCode
      const revByAccount: Record<string, number> = {};
      fullItems.forEach((it) => {
        revByAccount[it.accountCode] = (revByAccount[it.accountCode] || 0) + it.amount;
      });

      Object.entries(revByAccount).forEach(([code, amt], i) => {
        const acc = accounts.find((a) => a.code === code);
        jeLines.push({
          id: `line-${Date.now()}-rev-${i}`,
          accountCode: code,
          accountName: acc ? acc.name : 'Cloud SaaS & Platform Licenses (VATable)',
          debit: 0,
          credit: amt,
          memo: `Taxable sales revenue recognized for ${invoiceNumber}`,
        });
      });

      // CR 2110 Output VAT Payable (12%)
      if (outputVat > 0) {
        jeLines.push({
          id: `line-${Date.now()}-vat`,
          accountCode: '2110',
          accountName: 'Output VAT Payable (12%)',
          debit: 0,
          credit: outputVat,
          memo: `12% Output VAT on ${invoiceNumber} (BIR Form 2550Q)`,
        });
      }

      const jeNumber = `JE-2026-${String(journalEntries.length + 1).padStart(4, '0')}`;
      journalEntryId = `je-ph-${Date.now()}`;

      const newJE: JournalEntry = {
        id: journalEntryId,
        entryNumber: jeNumber,
        date: data.issueDate,
        description: `Sales Invoice ${invoiceNumber} issued to ${customer.company} (TIN: ${customer.tin})`,
        source: 'invoice_issued',
        sourceId: invoiceId,
        status: 'posted',
        lines: jeLines,
        createdAt: new Date().toISOString(),
        createdBy: 'Calypso CAS Billing Engine',
      };

      setJournalEntries((prev) => [newJE, ...prev]);
    }

    const newInvoice: Invoice = {
      id: invoiceId,
      invoiceNumber,
      documentType: 'tax_invoice',
      customerId: customer.id,
      customerName: customer.name,
      customerCompany: customer.company,
      customerEmail: customer.email,
      customerTin: customer.tin,
      customerBranchCode: customer.branchCode || '00000',
      customerBusinessStyle: customer.businessStyle || 'General Commercial Entity',
      customerAddress: customer.address,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      status,
      items: fullItems,
      vatableSales,
      vatExemptSales,
      zeroRatedSales,
      outputVat,
      grossAmount,
      ewtRate,
      ewtAmount,
      totalAmountDue,
      netAmountDue,
      amountPaid: 0,
      balanceDue: netAmountDue, // balance due is net cash expected after buyer's 2307 EWT withholding
      notes: data.notes || 'Official Sales Invoice issued under BIR CAS Certificate.',
      paymentTerms: data.paymentTerms,
      journalEntryId,
      payments: [],
      createdAt: new Date().toISOString(),
      casDetails: {
        acknowledgementCertNo: companyProfile.casPermitNo,
        seriesRange: `${companyProfile.invoiceSeriesStart} to ${companyProfile.invoiceSeriesEnd}`,
        rdoCode: companyProfile.rdoCode,
        validityNotice: 'Pursuant to RA 11976 (EOPT Act), validity of printed invoices is no longer restricted to five (5) years.',
      },
    };

    setInvoices((prev) => [newInvoice, ...prev]);
    return { success: true, invoiceId };
  };

  // Issue Draft Invoice
  const issueInvoice = (id: string) => {
    const invoice = invoices.find((inv) => inv.id === id);
    if (!invoice) return { success: false, error: 'Invoice not found.' };
    if (invoice.status !== 'draft') {
      return { success: false, error: 'Only draft invoices can be issued.' };
    }

    const jeLines: JournalEntryLine[] = [];
    jeLines.push({
      id: `line-${Date.now()}-ar`,
      accountCode: '1200',
      accountName: 'Accounts Receivable - Trade',
      debit: invoice.grossAmount,
      credit: 0,
      memo: `A/R for ${invoice.invoiceNumber} (${invoice.customerCompany} - TIN: ${invoice.customerTin})`,
    });

    const revByAccount: Record<string, number> = {};
    invoice.items.forEach((it) => {
      revByAccount[it.accountCode] = (revByAccount[it.accountCode] || 0) + it.amount;
    });

    Object.entries(revByAccount).forEach(([code, amt], i) => {
      const acc = accounts.find((a) => a.code === code);
      jeLines.push({
        id: `line-${Date.now()}-rev-${i}`,
        accountCode: code,
        accountName: acc ? acc.name : 'Cloud SaaS & Platform Licenses (VATable)',
        debit: 0,
        credit: amt,
        memo: `Taxable sales revenue recognized for ${invoice.invoiceNumber}`,
      });
    });

    if (invoice.outputVat > 0) {
      jeLines.push({
        id: `line-${Date.now()}-vat`,
        accountCode: '2110',
        accountName: 'Output VAT Payable (12%)',
        debit: 0,
        credit: invoice.outputVat,
        memo: `12% Output VAT for ${invoice.invoiceNumber}`,
      });
    }

    const journalEntryId = `je-ph-${Date.now()}`;
    const jeNumber = `JE-2026-${String(journalEntries.length + 1).padStart(4, '0')}`;

    const newJE: JournalEntry = {
      id: journalEntryId,
      entryNumber: jeNumber,
      date: invoice.issueDate,
      description: `Sales Invoice ${invoice.invoiceNumber} issued to ${invoice.customerCompany} (TIN: ${invoice.customerTin})`,
      source: 'invoice_issued',
      sourceId: invoice.id,
      status: 'posted',
      lines: jeLines,
      createdAt: new Date().toISOString(),
      createdBy: 'Calypso CAS Billing Engine',
    };

    setJournalEntries((prev) => [newJE, ...prev]);

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id ? { ...inv, status: 'issued' as const, journalEntryId } : inv
      )
    );

    return { success: true };
  };

  // Record Payment with BIR Form 2307 Withholding Tax Support
  const recordPayment = (
    invoiceId: string,
    payment: {
      amount: number;
      cwtWithheldAmount?: number;
      method: 'bank_transfer' | 'check' | 'direct_deposit' | 'credit_card';
      reference: string;
      officialReceiptNo?: string;
      form2307Collected: boolean;
      notes?: string;
      date: string;
    }
  ) => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return { success: false, error: 'Invoice not found.' };

    if (payment.amount <= 0) {
      return { success: false, error: 'Payment cash amount must be greater than zero.' };
    }

    const cwt = Number(payment.cwtWithheldAmount) || 0;
    const totalCreditToAr = payment.amount + cwt;

    if (payment.amount > invoice.balanceDue + 1.0) {
      return {
        success: false,
        error: `Settlement cash amount (₱${payment.amount.toFixed(2)}) exceeds balance due (₱${invoice.balanceDue.toFixed(2)}).`,
      };
    }

    const newAmountPaid = invoice.amountPaid + payment.amount;
    const newBalanceDue = Math.max(0, invoice.balanceDue - payment.amount);
    const newStatus = newBalanceDue <= 0.01 ? 'paid' : 'partially_paid';

    // Post BIR Compliant Collection Journal:
    // DR 1010 Cash in Bank (Net Cash: payment.amount)
    // DR 1160 Creditable Withholding Tax (BIR Form 2307: cwt)
    // CR 1200 Accounts Receivable - Trade (Total Cleared: payment.amount + cwt)
    const payJeId = `je-ph-pay-${Date.now()}`;
    const jeNumber = `JE-2026-${String(journalEntries.length + 1).padStart(4, '0')}`;

    const lines: JournalEntryLine[] = [
      {
        id: `line-${Date.now()}-cash`,
        accountCode: '1010',
        accountName: 'Cash in Bank - BDO Operating Account',
        debit: payment.amount,
        credit: 0,
        memo: `Net cash received: ${payment.reference}`,
      },
    ];

    if (cwt > 0) {
      lines.push({
        id: `line-${Date.now()}-cwt`,
        accountCode: '1160',
        accountName: 'Creditable Withholding Tax (BIR Form 2307 CWT)',
        debit: cwt,
        credit: 0,
        memo: `BIR Form 2307 CWT deducted by ${invoice.customerCompany}`,
      });
    }

    lines.push({
      id: `line-${Date.now()}-ar`,
      accountCode: '1200',
      accountName: 'Accounts Receivable - Trade',
      debit: 0,
      credit: totalCreditToAr,
      memo: `A/R settlement for ${invoice.invoiceNumber}`,
    });

    const paymentJE: JournalEntry = {
      id: payJeId,
      entryNumber: jeNumber,
      date: payment.date,
      description: `Collection ${payment.reference} for ${invoice.invoiceNumber} (${invoice.customerCompany})${cwt > 0 ? ` + ₱${cwt.toFixed(2)} Form 2307 CWT` : ''}`,
      source: 'payment_received',
      sourceId: invoice.id,
      status: 'posted',
      createdAt: new Date().toISOString(),
      createdBy: 'Calypso Treasury Officer',
      lines,
    };

    setJournalEntries((prev) => [paymentJE, ...prev]);

    const newPaymentRecord = {
      id: `pay-${Date.now()}`,
      date: payment.date,
      amount: payment.amount,
      cwtWithheldAmount: cwt,
      method: payment.method,
      reference: payment.reference,
      officialReceiptNo: payment.officialReceiptNo,
      form2307Collected: payment.form2307Collected,
      notes: payment.notes,
      journalEntryId: payJeId,
    };

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              amountPaid: newAmountPaid,
              balanceDue: newBalanceDue,
              status: newStatus,
              payments: [...inv.payments, newPaymentRecord],
            }
          : inv
      )
    );

    return { success: true };
  };

  // Void Invoice
  const voidInvoice = (invoiceId: string, reason = 'Invoice cancelled by administrator') => {
    const invoice = invoices.find((inv) => inv.id === invoiceId);
    if (!invoice) return { success: false, error: 'Invoice not found.' };

    if (invoice.status === 'paid' || invoice.status === 'partially_paid') {
      return {
        success: false,
        error: 'Cannot void an invoice with recorded payments. Reverse payments first.',
      };
    }

    if (invoice.journalEntryId) {
      reverseJournalEntry(invoice.journalEntryId, `Cancelled BIR Sales Invoice ${invoice.invoiceNumber}`);
    }

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'void' as const,
              balanceDue: 0,
              notes: `${inv.notes ? inv.notes + ' | ' : ''}CANCELLED / VOIDED: ${reason}`,
            }
          : inv
      )
    );

    return { success: true };
  };

  // Customer functions
  const addCustomer = (data: Omit<Customer, 'id' | 'createdAt'>): Customer => {
    const newCustomer: Customer = {
      ...data,
      id: `cust-ph-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
  };

  const addAccount = (account: Account) => {
    if (accounts.some((a) => a.code === account.code)) {
      return { success: false, error: `Account code ${account.code} already exists.` };
    }
    setAccounts((prev) => [...prev, account].sort((a, b) => a.code.localeCompare(b.code)));
    return { success: true };
  };

  const toggleRecurringSchedule = (id: string) => {
    setRecurringSchedules((prev) =>
      prev.map((sch) =>
        sch.id === id
          ? { ...sch, status: sch.status === 'active' ? 'paused' : 'active' }
          : sch
      )
    );
  };

  const runRecurringSchedule = (id: string) => {
    const schedule = recurringSchedules.find((s) => s.id === id);
    if (!schedule) return { success: false };

    const today = new Date().toISOString().split('T')[0];
    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 30);
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const result = createInvoice({
      customerId: schedule.customerId,
      issueDate: today,
      dueDate,
      items: schedule.items,
      paymentTerms: 'net_30',
      ewtRate: 2,
      notes: `Generated from contract retainer: ${schedule.title}`,
      autoIssue: schedule.autoIssue,
    });

    if (result.success) {
      setRecurringSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, lastGeneratedDate: today } : s))
      );
    }

    return result;
  };

  // BIR Books of Accounts Generators
  const getSalesJournal = (): BirSalesJournalRow[] => {
    return invoices
      .filter((inv) => inv.status !== 'draft')
      .map((inv) => ({
        date: inv.issueDate,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerCompany,
        customerTin: inv.customerTin,
        customerBranch: inv.customerBranchCode,
        vatableSales: inv.vatableSales,
        vatExemptSales: inv.vatExemptSales,
        zeroRatedSales: inv.zeroRatedSales,
        outputVat: inv.outputVat,
        grossSales: inv.grossAmount,
        status: inv.status === 'void' ? 'CANCELLED' : 'VALID',
      }))
      .sort((a, b) => a.invoiceNumber.localeCompare(b.invoiceNumber));
  };

  const getCashReceiptsJournal = (): BirCashReceiptsRow[] => {
    const rows: BirCashReceiptsRow[] = [];
    invoices.forEach((inv) => {
      (inv.payments || []).forEach((p) => {
        rows.push({
          date: p.date,
          reference: p.reference,
          customerName: inv.customerCompany,
          customerTin: inv.customerTin,
          invoiceNumber: inv.invoiceNumber,
          cashInBank: p.amount,
          cwtWithheld: p.cwtWithheldAmount || 0,
          arCredited: p.amount + (p.cwtWithheldAmount || 0),
        });
      });
    });
    return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const getBir2307Records = (): BirForm2307Record[] => {
    const records: BirForm2307Record[] = [];
    invoices.forEach((inv) => {
      if (inv.ewtAmount > 0) {
        const isCollected = inv.payments.some((p) => p.form2307Collected);
        records.push({
          id: `2307-${inv.id}`,
          invoiceNumber: inv.invoiceNumber,
          payorName: inv.customerCompany,
          payorTin: inv.customerTin,
          payorAddress: `${inv.customerAddress.street}, ${inv.customerAddress.city}`,
          payeeName: companyProfile.legalName,
          payeeTin: companyProfile.tin,
          taxPeriod: 'Q3-Q4 2026',
          atcCode: 'WC157',
          natureOfPayment: 'Income payments to contractors / professional software developers',
          amountSubjectToTax: inv.vatableSales,
          taxRatePercent: inv.ewtRate,
          taxWithheld: inv.ewtAmount,
          status: isCollected ? 'certificate_received' : 'pending_receipt',
        });
      }
    });
    return records;
  };

  // Reset to initial demo data
  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEYS.ACCOUNTS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.JOURNAL_ENTRIES);
    localStorage.removeItem(STORAGE_KEYS.RECURRING);
    localStorage.removeItem(STORAGE_KEYS.COMPANY);

    setAccounts(INITIAL_ACCOUNTS);
    setCustomers(INITIAL_CUSTOMERS);
    setInvoices(INITIAL_INVOICES);
    setJournalEntries(INITIAL_JOURNAL_ENTRIES);
    setRecurringSchedules(INITIAL_RECURRING_SCHEDULES);
  };

  return (
    <AccountingContext.Provider
      value={{
        accounts,
        customers,
        invoices,
        journalEntries,
        recurringSchedules,
        companyProfile,
        metrics,
        trialBalance,
        getAccountBalance,
        getAccountActivity,
        addJournalEntry,
        reverseJournalEntry,
        createInvoice,
        issueInvoice,
        recordPayment,
        voidInvoice,
        addCustomer,
        updateCustomer,
        addAccount,
        toggleRecurringSchedule,
        runRecurringSchedule,
        resetToDemoData,
        updateCompanyProfile,
        companies,
        activeCompanyId,
        addCompany,
        switchCompany,
        deleteCompany,
        ledgers,
        activeLedgerId,
        activeLedger,
        addLedger,
        switchLedger,
        updateLedger,
        getSalesJournal,
        getCashReceiptsJournal,
        getBir2307Records,
      }}
    >
      {children}
    </AccountingContext.Provider>
  );
};

export const useAccounting = () => {
  const context = useContext(AccountingContext);
  if (!context) {
    throw new Error('useAccounting must be used within an AccountingProvider');
  }
  return context;
};
