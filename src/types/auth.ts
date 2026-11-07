export type UserRole = 'admin' | 'accountant' | 'billing_specialist' | 'auditor';

export interface AppUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: 'active' | 'inactive';
  title: string;
  department: string;
  cpaLicenseNo?: string;
  phone?: string;
  avatarUrl?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface RoleDefinition {
  id: UserRole;
  label: string;
  description: string;
  badgeColor: string;
  permissions: string[];
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  admin: {
    id: 'admin',
    label: 'Corporate Admin / Superuser',
    description: 'Unrestricted authorization: edit company tax profile, manage user accounts & permissions, approve reversals and void invoices.',
    badgeColor: 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900',
    permissions: [
      'Manage User Accounts & Roles',
      'Edit BIR Company Tax Profile & CAS Settings',
      'Full Double-Entry Ledger Read/Write',
      'Issue & Void VAT Sales Invoices',
      'Reverse Journal Entries & Post Adjustments',
      'Export Statutory BIR Books & Audit Logs',
    ],
  },
  accountant: {
    id: 'accountant',
    label: 'Chief Accountant / CPA',
    description: 'Post journal entries, manage Chart of Accounts, close financial books, generate BIR Form 2550Q, 2307 register & balance sheet.',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800',
    permissions: [
      'Manage Chart of Accounts',
      'Create & Post General Journal Entries',
      'Generate Trial Balance & Balance Sheet',
      'Generate BIR Form 2550Q & 2307 Register',
      'Review & Close Accounting Periods',
      'Inspect Customer Receivables & Invoices',
    ],
  },
  billing_specialist: {
    id: 'billing_specialist',
    label: 'Billing Officer / AR',
    description: 'Maintain customer taxpayer records, generate compliant BIR VAT Sales Invoices, and record payments with Form 2307 deductions.',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800',
    permissions: [
      'Create & Manage Customer Taxpayers',
      'Issue Statutory BIR VAT Sales Invoices',
      'Record Customer Payments & Collections',
      'Process Form 2307 CWT Deductions',
      'View AR Aging & Collection Journals',
    ],
  },
  auditor: {
    id: 'auditor',
    label: 'BIR Tax Auditor (Read-Only)',
    description: 'Statutory inspection mode: read-only access to Computerized Books of Accounts (RR 9-2009), audit logs, and trial balance.',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800',
    permissions: [
      'Read-Only General Ledger Stream',
      'Inspect RR 9-2009 Sales & Cash Receipts Journals',
      'Export CAS Computerized Books & Tax Declarations',
      'Review Tamper-Evident System Audit Trail',
    ],
  },
};
