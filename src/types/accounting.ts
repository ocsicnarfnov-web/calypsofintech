export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';

export type AccountSubtype =
  | 'cash'
  | 'accounts_receivable'
  | 'input_vat'
  | 'cwt_2307_receivable'
  | 'current_asset'
  | 'fixed_asset'
  | 'accounts_payable'
  | 'output_vat_payable'
  | 'withholding_tax_payable'
  | 'tax_payable'
  | 'deferred_revenue'
  | 'current_liability'
  | 'long_term_liability'
  | 'owners_equity'
  | 'retained_earnings'
  | 'operating_revenue'
  | 'service_revenue'
  | 'subscription_revenue'
  | 'cost_of_goods_sold'
  | 'operating_expense'
  | 'payroll_expense'
  | 'software_expense'
  | 'legal_expense';

export type NormalBalance = 'debit' | 'credit';

export interface Account {
  code: string;
  name: string;
  type: AccountType;
  subtype: AccountSubtype;
  normalBalance: NormalBalance;
  description: string;
  isActive: boolean;
  isSystem?: boolean;
}

export interface JournalEntryLine {
  id: string;
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo?: string;
}

export type JournalSource =
  | 'manual'
  | 'invoice_issued'
  | 'payment_received'
  | 'bill_payable'
  | 'payroll_accrual'
  | 'recurring_invoice';

export interface JournalEntry {
  id: string;
  entryNumber: string;
  date: string;
  description: string;
  source: JournalSource;
  sourceId?: string;
  status: 'posted' | 'draft' | 'reversed';
  lines: JournalEntryLine[];
  createdAt: string;
  createdBy: string;
  reversedByEntryId?: string;
}

export type PaymentTerms = 'due_on_receipt' | 'net_15' | 'net_30' | 'net_60';

export interface CustomerAddress {
  street: string;
  city: string;
  province?: string;
  state?: string;
  zip: string;
  country: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone?: string;
  address: CustomerAddress;
  tin: string; // e.g. "204-589-112-00000" (BIR TIN format)
  branchCode: string; // "00000" for head office
  businessStyle: string; // e.g. "Information Technology Services" (BIR mandatory)
  isVatRegistered: boolean;
  paymentTerms: PaymentTerms;
  defaultCurrency: string;
  creditLimit: number;
  notes?: string;
  createdAt: string;
}

export type VatType = 'vatable' | 'zero_rated' | 'exempt';

export interface InvoiceItem {
  id: string;
  description: string;
  accountCode: string;
  quantity: number;
  unitPrice: number;
  vatType: VatType;
  taxRate: number; // 12 for standard VAT, 0 for zero_rated or exempt
  amount: number; // quantity * unitPrice (net of VAT)
}

export type InvoiceStatus = 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue' | 'void';

export interface InvoicePayment {
  id: string;
  date: string;
  amount: number; // actual cash received in bank
  cwtWithheldAmount?: number; // BIR 2307 EWT deducted by client
  method: 'bank_transfer' | 'check' | 'direct_deposit' | 'credit_card';
  reference: string;
  officialReceiptNo?: string;
  form2307Collected: boolean; // whether BIR Form 2307 was received
  notes?: string;
  journalEntryId?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "SI-2026-000101" (Sales Invoice - BIR primary invoice)
  documentType: 'tax_invoice' | 'commercial_invoice';
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerCompany: string;
  customerTin: string;
  customerBranchCode: string;
  customerBusinessStyle: string;
  customerAddress: CustomerAddress;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceItem[];

  // BIR RR 16-2005 / RA 11976 (EOPT) Mandatory Invoice Breakdown
  vatableSales: number; // Base amount subject to 12% Output VAT
  vatExemptSales: number; // Zero VAT exemption
  zeroRatedSales: number; // 0% Export / PEZA registered
  outputVat: number; // 12% of vatableSales
  grossAmount: number; // vatableSales + vatExemptSales + zeroRatedSales + outputVat
  ewtRate: number; // e.g. 2 for 2% expanded withholding tax (BIR Form 2307)
  ewtAmount: number; // vatableSales * (ewtRate / 100)
  totalAmountDue: number; // grossAmount
  netAmountDue: number; // grossAmount - ewtAmount (Cash settlement amount after 2307)
  
  amountPaid: number;
  balanceDue: number;
  notes?: string;
  paymentTerms: PaymentTerms;
  journalEntryId?: string;
  payments: InvoicePayment[];
  createdAt: string;

  // BIR CAS Certification details stamped on document
  casDetails?: {
    acknowledgementCertNo: string;
    seriesRange: string;
    rdoCode: string;
    validityNotice: string;
  };
}

export interface RecurringSchedule {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  cadence: 'monthly' | 'quarterly' | 'annual';
  amount: number;
  items: InvoiceItem[];
  nextRunDate: string;
  status: 'active' | 'paused';
  autoIssue: boolean;
  lastGeneratedDate?: string;
}

export interface CompanyProfile {
  name: string;
  legalName: string;
  tradeName: string;
  tin: string; // e.g. "009-842-192-00000"
  branchCode: string;
  rdoCode: string; // e.g. "RDO 044 - Taguig / Pateros"
  businessStyle: string;
  address: CustomerAddress;
  email: string;
  phone: string;
  website: string;
  currency: string;
  fiscalYearEnd: string;
  vatRegistrationStatus: 'VAT_REGISTERED' | 'NON_VAT';
  casPermitNo: string; // BIR CAS Acknowledgement Certificate Number
  casDateIssued: string;
  invoiceSeriesStart: string;
  invoiceSeriesEnd: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    swiftCode: string;
  };
}

// BIR Form 2307 Record (Certificate of Creditable Tax Withheld at Source)
export interface BirForm2307Record {
  id: string;
  invoiceNumber: string;
  payorName: string;
  payorTin: string;
  payorAddress: string;
  payeeName: string;
  payeeTin: string;
  taxPeriod: string;
  atcCode: string; // e.g. "WC157" (Professional / Contractor Services)
  natureOfPayment: string;
  amountSubjectToTax: number;
  taxRatePercent: number;
  taxWithheld: number;
  dateCollected?: string;
  status: 'pending_receipt' | 'certificate_received';
}
