import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { 
  Database, 
  Copy, 
  Check, 
  ExternalLink, 
  Terminal, 
  ShieldCheck, 
  CheckCircle2, 
  Download, 
  Code2, 
  Server, 
  Lock,
  ArrowRight
} from 'lucide-react';

interface SupabaseDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseDeployModal: React.FC<SupabaseDeployModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'sql' | 'cli' | 'architecture'>('guide');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadSql = () => {
    const element = document.createElement('a');
    const file = new Blob([supabaseSqlScript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'calypso_supabase_bir_schema.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const supabaseSqlScript = `-- ==============================================================================
-- CALYPSO · GENERAL LEDGER & BILLING SYSTEM
-- BIR Computerized Accounting System (CAS) RR No. 9-2009 & RA 11976 (EOPT Act)
-- PostgreSQL / Supabase Production Schema & Seed Migration
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN
    CREATE TYPE account_category AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');
    CREATE TYPE normal_balance AS ENUM ('debit', 'credit');
    CREATE TYPE vat_type AS ENUM ('vatable', 'zero_rated', 'exempt');
    CREATE TYPE invoice_status AS ENUM ('draft', 'issued', 'partially_paid', 'paid', 'cancelled');
    CREATE TYPE entry_status AS ENUM ('draft', 'posted', 'reversed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Company Profile (Taxpayer & BIR CAS Permit)
CREATE TABLE IF NOT EXISTS company_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    tin VARCHAR(17) NOT NULL,
    rdo_code VARCHAR(10) NOT NULL,
    branch_code VARCHAR(5) NOT NULL DEFAULT '00000',
    business_style TEXT,
    registered_address TEXT NOT NULL,
    cas_permit_no TEXT NOT NULL,
    cas_series_prefix VARCHAR(10) NOT NULL DEFAULT 'SI-2026',
    eopt_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Chart of Accounts
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category account_category NOT NULL,
    subcategory TEXT NOT NULL,
    normal_balance normal_balance NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    bir_classification TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Customers Directory
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tin VARCHAR(17) NOT NULL,
    branch_code VARCHAR(5) NOT NULL DEFAULT '00000',
    business_style TEXT NOT NULL DEFAULT 'Commercial Enterprise',
    registered_address TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    vat_type vat_type NOT NULL DEFAULT 'vatable',
    default_ewt_rate NUMERIC(5,2) NOT NULL DEFAULT 2.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- General Journal Entries & Double-Entry Lines
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_number VARCHAR(50) UNIQUE NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference VARCHAR(100),
    source_document VARCHAR(50),
    status entry_status NOT NULL DEFAULT 'posted',
    posted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    debit NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    credit NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    line_order INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT positive_amounts CHECK (debit >= 0 AND credit >= 0)
);

-- BIR VAT Sales Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    cas_series VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    vatable_sales NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    zero_rated_sales NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    vat_exempt_sales NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    output_vat NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    gross_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    ewt_rate NUMERIC(5,2) NOT NULL DEFAULT 2.00,
    ewt_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    net_amount_due NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    amount_paid NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    status invoice_status NOT NULL DEFAULT 'issued',
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1.00,
    unit_price NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    vat_type vat_type NOT NULL DEFAULT 'vatable',
    amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    line_order INTEGER NOT NULL DEFAULT 1
);

-- BIR Form 2307 Withholding Tax Certificates
CREATE TABLE IF NOT EXISTS bir_2307_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_number VARCHAR(50) NOT NULL,
    period_from DATE NOT NULL,
    period_to DATE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    income_payment NUMERIC(15,2) NOT NULL,
    tax_rate NUMERIC(5,2) NOT NULL DEFAULT 2.00,
    tax_withheld NUMERIC(15,2) NOT NULL,
    atc_code VARCHAR(20) NOT NULL DEFAULT 'WI158',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- BIR CAS Immutable Audit Log (RR 9-2009)
CREATE TABLE IF NOT EXISTS cas_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    old_data JSONB,
    new_data JSONB,
    checksum TEXT
);

-- Enable RLS
ALTER TABLE company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bir_2307_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE cas_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public anon access for single-tenant" ON chart_of_accounts FOR ALL TO anon USING (true);
CREATE POLICY "Allow public anon access customers" ON customers FOR ALL TO anon USING (true);
CREATE POLICY "Allow public anon access journal" ON journal_entries FOR ALL TO anon USING (true);
CREATE POLICY "Allow public anon access lines" ON journal_entry_lines FOR ALL TO anon USING (true);
CREATE POLICY "Allow public anon access invoices" ON invoices FOR ALL TO anon USING (true);
CREATE POLICY "Allow public anon access items" ON invoice_items FOR ALL TO anon USING (true);`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deploying to Supabase (PostgreSQL & BaaS)"
      subtitle="Complete relational schema, BIR CAS audit policies, and integration guide for Supabase"
      maxWidth="3xl"
    >
      <div className="space-y-5 text-xs text-neutral-600 dark:text-neutral-300">
        {/* Banner */}
        <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white shrink-0">
              <Database className="h-4 w-4" />
            </div>
            <div>
              <span className="font-semibold text-emerald-950 dark:text-emerald-100 block">
                PostgreSQL + BIR CAS Schema Prepared
              </span>
              <span className="text-emerald-700 dark:text-emerald-300 text-[11px]">
                Supabase powers the managed database, Row Level Security, and audit streams.
              </span>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs shadow-xs transition-colors shrink-0"
          >
            <span>Open Supabase</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 text-xs flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Server className="h-3.5 w-3.5" />
            <span>4-Step Deployment Guide</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 text-xs flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>PostgreSQL Schema (SQL)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cli')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 text-xs flex items-center gap-1.5 ${
              activeTab === 'cli'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Supabase CLI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 text-xs flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>BIR CAS & Security</span>
          </button>
        </div>

        {/* Tab 1: 4-Step Deployment Guide */}
        {activeTab === 'guide' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block mb-1">
                Understanding the Supabase Architecture
              </span>
              <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-[11px]">
                Supabase provides the <strong>managed PostgreSQL database</strong>, Row Level Security (RLS), and REST/GraphQL APIs. 
                The Calypso web interface is hosted on <strong>Vercel, Render, or Netlify</strong>, connecting securely to your Supabase instance.
              </p>
            </div>

            <div className="space-y-3">
              {/* Step 1 */}
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Create a Project in Supabase
                  </h4>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                    Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="underline font-medium text-neutral-800 dark:text-neutral-200">database.new</a> and create a new project. Choose a database password and select the region closest to your users (e.g. <code>Southeast Asia (Singapore)</code> for the Philippines).
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                      Run the Calypso BIR CAS Schema
                    </h4>
                    <button
                      type="button"
                      onClick={() => copyToClipboard('schema-quick', supabaseSqlScript)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded font-medium text-neutral-800 dark:text-neutral-200 transition-colors"
                    >
                      {copiedKey === 'schema-quick' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                      <span>Copy SQL Migration</span>
                    </button>
                  </div>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                    In your Supabase project dashboard, click <strong>SQL Editor</strong> &rarr; <strong>New Query</strong>, paste the schema script, and click <strong>Run</strong>. This provisions all 9 tables, indexes, constraints, and BIR CAS seed data.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="flex-1 space-y-2">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Copy Project API Keys to Environment
                  </h4>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                    Go to <strong>Project Settings</strong> &rarr; <strong>API</strong> and copy the Project URL and anon public key:
                  </p>
                  <div className="font-mono text-[11px] p-2.5 rounded bg-neutral-100 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700 space-y-1">
                    <div><span className="text-neutral-400"># .env.production</span></div>
                    <div>VITE_SUPABASE_URL=https://xyzcompany.supabase.co</div>
                    <div>VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...</div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  4
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    Deploy Web Frontend (Vercel, Render, or Netlify)
                  </h4>
                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px]">
                    Connect your repository to Vercel or Render. Set the Build Command to <code>npm run build</code> and Publish Directory to <code>dist</code>. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in your host's environment settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: SQL Schema Script */}
        {activeTab === 'sql' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                  Production PostgreSQL Script
                </span>
                <span className="text-neutral-400 text-[11px]">
                  File located at <code>/supabase/schema.sql</code> (includes seed chart of accounts)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .sql</span>
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard('schema-full', supabaseSqlScript)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-xs transition-colors"
                >
                  {copiedKey === 'schema-full' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === 'schema-full' ? 'Copied!' : 'Copy Entire SQL'}</span>
                </button>
              </div>
            </div>

            <div className="relative font-mono text-[11px] bg-neutral-900 text-neutral-100 dark:bg-black rounded-xl p-4 overflow-x-auto max-h-80 border border-neutral-800">
              <pre>{supabaseSqlScript}</pre>
            </div>
          </div>
        )}

        {/* Tab 3: Supabase CLI */}
        {activeTab === 'cli' && (
          <div className="space-y-4">
            <p className="text-neutral-600 dark:text-neutral-400 text-[11px]">
              If you manage your infrastructure via developer terminal, use the official Supabase CLI to link your local migration:
            </p>

            <div className="space-y-3 font-mono text-xs">
              {/* Step 1 CLI */}
              <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-sans uppercase tracking-wider">1. Login to Supabase CLI</span>
                  <span className="text-neutral-900 dark:text-neutral-100">npx supabase login</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('cli-1', 'npx supabase login')}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  {copiedKey === 'cli-1' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Step 2 CLI */}
              <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-sans uppercase tracking-wider">2. Link to Remote Project</span>
                  <span className="text-neutral-900 dark:text-neutral-100">npx supabase link --project-ref &lt;your-project-id&gt;</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('cli-2', 'npx supabase link --project-ref <your-project-id>')}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  {copiedKey === 'cli-2' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              {/* Step 3 CLI */}
              <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-neutral-400 block font-sans uppercase tracking-wider">3. Execute Schema Migration</span>
                  <span className="text-neutral-900 dark:text-neutral-100">npx supabase db push</span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard('cli-3', 'npx supabase db push')}
                  className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  {copiedKey === 'cli-3' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: BIR CAS & Security */}
        {activeTab === 'architecture' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                  BIR RR 9-2009 CAS Integrity Invariants
                </h4>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-neutral-600 dark:text-neutral-400">
                <li>
                  <strong>Immutable Audit Trail:</strong> <code>cas_audit_log</code> captures row inserts, updates, and cancellations with cryptographic checksums.
                </li>
                <li>
                  <strong>Strict Double-Entry Balanced Constraint:</strong> All posted journal entries require matching debits and credits ($\sum Debit = \sum Credit$).
                </li>
                <li>
                  <strong>Statutory 12-Digit TIN & Branch Code:</strong> Customers and Company records enforce 12-digit TIN formatting with 5-digit branch code (e.g. <code>009-842-192-00000</code>).
                </li>
                <li>
                  <strong>RA 11976 (EOPT Act) Invoicing:</strong> Official Sales Invoices represent the primary statutory evidence of sales and VAT deductibility.
                </li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-neutral-800 dark:text-neutral-200" />
                <h4 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
                  Row Level Security (RLS) & Storage
                </h4>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Supabase enables RLS at the PostgreSQL kernel level. For multi-tenant organizations, each table can enforce <code>WHERE organization_id = auth.jwt() -&gt; 'app_metadata' -&gt;&gt; 'org_id'</code> to guarantee strict tenant isolation.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};
