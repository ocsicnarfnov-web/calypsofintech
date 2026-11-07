-- ==============================================================================
-- CALYPSO · GENERAL LEDGER & BILLING SYSTEM
-- BIR Computerized Accounting System (CAS) RR No. 9-2009 & RA 11976 (EOPT Act)
-- PostgreSQL / Supabase Production Schema & Seed Migration
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE account_category AS ENUM ('asset', 'liability', 'equity', 'revenue', 'expense');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE normal_balance AS ENUM ('debit', 'credit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE vat_type AS ENUM ('vatable', 'zero_rated', 'exempt');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('draft', 'issued', 'partially_paid', 'paid', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE entry_status AS ENUM ('draft', 'posted', 'reversed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. COMPANY PROFILE (Taxpayer & BIR CAS Identity)
CREATE TABLE IF NOT EXISTS company_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    tin VARCHAR(17) NOT NULL, -- Format: 000-000-000-00000
    rdo_code VARCHAR(10) NOT NULL, -- e.g. RDO 044
    branch_code VARCHAR(5) NOT NULL DEFAULT '00000',
    business_style TEXT,
    registered_address TEXT NOT NULL,
    cas_permit_no TEXT NOT NULL,
    cas_series_prefix VARCHAR(10) NOT NULL DEFAULT 'SI-2026',
    cas_accreditation_date DATE,
    eopt_compliant BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CHART OF ACCOUNTS (COA)
CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category account_category NOT NULL,
    subcategory TEXT NOT NULL,
    normal_balance normal_balance NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    bir_classification TEXT, -- e.g. Current Assets, Sales/Revenues, VAT
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. CUSTOMERS (Philippine Taxpayers & Receivables Directory)
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    tin VARCHAR(17) NOT NULL,
    branch_code VARCHAR(5) NOT NULL DEFAULT '00000',
    business_style TEXT NOT NULL DEFAULT 'Commercial Enterprise',
    registered_address TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    rdo_code VARCHAR(10),
    vat_type vat_type NOT NULL DEFAULT 'vatable',
    default_ewt_rate NUMERIC(5,2) NOT NULL DEFAULT 2.00, -- Form 2307 Creditable Withholding Tax (CWT)
    payment_terms_days INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. GENERAL JOURNAL / LEDGER ENTRIES
CREATE TABLE IF NOT EXISTS journal_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. JE-2026-0001
    entry_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference VARCHAR(100), -- Invoice No, Check Voucher No, OR No.
    source_document VARCHAR(50), -- SALES_INVOICE, CASH_RECEIPT, DISBURSEMENT, GENERAL_JOURNAL
    status entry_status NOT NULL DEFAULT 'posted',
    is_auto_generated BOOLEAN NOT NULL DEFAULT FALSE,
    posted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    posted_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. JOURNAL ENTRY LINES (Double-Entry Debit & Credit Lines)
CREATE TABLE IF NOT EXISTS journal_entry_lines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES chart_of_accounts(id),
    debit NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    credit NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    line_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT positive_amounts CHECK (debit >= 0 AND credit >= 0),
    CONSTRAINT not_both_zero CHECK (debit > 0 OR credit > 0)
);

-- 8. BIR VAT SALES INVOICES (RR 16-2005 & RA 11976 EOPT Act)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. SI-2026-0042
    cas_series VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id),
    vatable_sales NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    zero_rated_sales NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    vat_exempt_sales NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    output_vat NUMERIC(15,2) NOT NULL DEFAULT 0.00, -- 12% Output VAT on Vatable Sales
    gross_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00, -- Total before CWT
    ewt_rate NUMERIC(5,2) NOT NULL DEFAULT 2.00, -- 2% BIR Form 2307 CWT
    ewt_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    net_amount_due NUMERIC(15,2) NOT NULL DEFAULT 0.00, -- Gross minus EWT
    amount_paid NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    status invoice_status NOT NULL DEFAULT 'issued',
    journal_entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. INVOICE LINE ITEMS
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1.00,
    unit_price NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    vat_type vat_type NOT NULL DEFAULT 'vatable',
    amount NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    line_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. BIR FORM 2307 CERTIFICATES REGISTER (Creditable Tax Withheld at Source)
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
    atc_code VARCHAR(20) NOT NULL DEFAULT 'WI158', -- WI158 (Services), WI100 (Goods), etc.
    scanned_doc_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. BIR CAS IMMUTABLE AUDIT LOG (RR No. 9-2009 Mandatory Requirement)
CREATE TABLE IF NOT EXISTS cas_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE, POST, REVERSE
    performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    checksum TEXT -- SHA-256 tamper-evident integrity hash
);

-- 12. INDEXES FOR HIGH-THROUGHPUT QUERIES & STATUTORY REPORTING
CREATE INDEX IF NOT EXISTS idx_journal_lines_entry ON journal_entry_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_journal_lines_account ON journal_entry_lines(account_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_date ON invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_audit_log_record ON cas_audit_log(record_id, timestamp);

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE company_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bir_2307_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE cas_audit_log ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full CRUD operations
CREATE POLICY "Allow authenticated read company_profile" ON company_profile FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated update company_profile" ON company_profile FOR ALL TO authenticated USING (true);

CREATE POLICY "Allow authenticated access chart_of_accounts" ON chart_of_accounts FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access customers" ON customers FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access journal_entries" ON journal_entries FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access journal_entry_lines" ON journal_entry_lines FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access invoices" ON invoices FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access invoice_items" ON invoice_items FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated access bir_2307_records" ON bir_2307_records FOR ALL TO authenticated USING (true);
CREATE POLICY "Allow authenticated read cas_audit_log" ON cas_audit_log FOR SELECT TO authenticated USING (true);

-- Also allow anon read/write if using API keys in single-tenant developer mode:
CREATE POLICY "Allow anon dev access coa" ON chart_of_accounts FOR ALL TO anon USING (true);
CREATE POLICY "Allow anon dev access customers" ON customers FOR ALL TO anon USING (true);
CREATE POLICY "Allow anon dev access journal" ON journal_entries FOR ALL TO anon USING (true);
CREATE POLICY "Allow anon dev access journal_lines" ON journal_entry_lines FOR ALL TO anon USING (true);
CREATE POLICY "Allow anon dev access invoices" ON invoices FOR ALL TO anon USING (true);
CREATE POLICY "Allow anon dev access invoice_items" ON invoice_items FOR ALL TO anon USING (true);
CREATE POLICY "Allow anon dev access company_profile" ON company_profile FOR ALL TO anon USING (true);

-- 14. INITIAL SEED DATA: BIR STANDARD CHART OF ACCOUNTS
INSERT INTO chart_of_accounts (code, name, category, subcategory, normal_balance, bir_classification, description) VALUES
('1010', 'BDO Unibank Operating Account', 'asset', 'Cash & Cash Equivalents', 'debit', 'Cash & Cash Equivalents', 'Primary corporate PHP clearing account'),
('1020', 'BPI Corporate Payroll & Tax Account', 'asset', 'Cash & Cash Equivalents', 'debit', 'Cash & Cash Equivalents', 'Withholding tax and statutory disbursements'),
('1100', 'Trade Accounts Receivable', 'asset', 'Current Assets', 'debit', 'Receivables', 'Customer receivables from BIR Sales Invoices'),
('1150', 'Creditable Input VAT (12%)', 'asset', 'Current Assets', 'debit', 'VAT Receivable', 'VAT paid on purchases of goods and services'),
('1160', 'Creditable Withholding Tax (BIR Form 2307)', 'asset', 'Current Assets', 'debit', 'Prepaid Taxes', '2% withholding tax certificates collected from clients'),
('1200', 'Prepaid Expenses & Rent Deposits', 'asset', 'Current Assets', 'debit', 'Prepaid Expenses', 'Office lease and service retainers'),
('1500', 'Server Infrastructure & Workstations', 'asset', 'Non-Current Assets', 'debit', 'Property & Equipment', 'Hardware and cloud appliances'),
('1510', 'Accumulated Depreciation - Equipment', 'asset', 'Non-Current Assets', 'credit', 'Contra Asset', 'Cumulative depreciation on technology assets'),
('2010', 'Trade Accounts Payable', 'liability', 'Current Liabilities', 'credit', 'Payables', 'Trade vendor invoices pending payment'),
('2110', 'Output VAT Payable (12%)', 'liability', 'Current Liabilities', 'credit', 'VAT Payable', '12% VAT collected on billing of taxable sales'),
('2120', 'Expanded Withholding Tax (EWT) Payable', 'liability', 'Current Liabilities', 'credit', 'Taxes Payable', 'Withheld taxes from supplier disbursements'),
('2130', 'Withholding Tax on Compensation Payable', 'liability', 'Current Liabilities', 'credit', 'Taxes Payable', 'Payroll employee income tax withheld'),
('3010', 'Common Share Capital', 'equity', 'Equity', 'credit', 'Contributed Capital', 'Authorized and paid-in equity capital'),
('3020', 'Retained Earnings', 'equity', 'Equity', 'credit', 'Retained Earnings', 'Cumulative net earnings after statutory tax'),
('4010', 'Enterprise Software & Cloud Revenue', 'revenue', 'Operating Revenue', 'credit', 'Vatable Sales', 'Core SaaS and software platform licenses'),
('4020', 'Technical Advisory & Architectural Services', 'revenue', 'Operating Revenue', 'credit', 'Vatable Sales', 'Professional engineering consulting fees'),
('5010', 'Cloud Infrastructure & Hosting (AWS/GCP)', 'expense', 'Operating Expenses', 'debit', 'Direct Operating Costs', 'Data center and compute runtime expenses'),
('5020', 'Staff Salaries & Benefits', 'expense', 'Operating Expenses', 'debit', 'Personnel Expenses', 'Engineering and administrative payroll'),
('5030', 'Office Lease & BGC Facility Fees', 'expense', 'Operating Expenses', 'debit', 'Administrative Expenses', 'Corporate workplace rental'),
('5040', 'Regulatory, BIR Compliance & Audit Fees', 'expense', 'Operating Expenses', 'debit', 'Professional Fees', 'Statutory audit and tax consultation')
ON CONFLICT (code) DO NOTHING;

-- 15. INITIAL SEED DATA: PHILIPPINE CORPORATE PROFILE
INSERT INTO company_profile (
    company_name, tin, rdo_code, branch_code, business_style, registered_address, cas_permit_no, cas_series_prefix, eopt_compliant
) VALUES (
    'Calypso Technologies Philippines, Inc.',
    '009-842-192-00000',
    'RDO 044',
    '00000',
    'Enterprise Software & Financial Technology Services',
    'Level 28, High Street South Corporate Plaza, 26th St. cor 9th Ave, Bonifacio Global City, Taguig City, 1634 Metro Manila',
    'CAS-AC-2026-08491-BIR',
    'SI-2026',
    TRUE
);
