import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Plus, Trash2, ShieldCheck } from 'lucide-react';
import { useAccounting } from '../../context/AccountingContext';
import { PaymentTerms, VatType } from '../../types/accounting';
import { formatCurrency, formatTin } from '../../utils/formatters';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvoiceCreated?: (id: string) => void;
  initialCustomerId?: string;
}

interface TempLineItem {
  description: string;
  accountCode: string;
  quantity: number;
  unitPrice: number;
  vatType: VatType;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onInvoiceCreated,
  initialCustomerId,
}) => {
  const { customers, accounts, createInvoice, companyProfile } = useAccounting();

  const revenueAccounts = accounts.filter(
    (a) => a.type === 'revenue' || a.subtype === 'subscription_revenue'
  );

  const [customerId, setCustomerId] = useState<string>(
    initialCustomerId || customers[0]?.id || ''
  );
  const [issueDate, setIssueDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('net_30');
  const [ewtRate, setEwtRate] = useState<number>(2); // 2% standard BIR Form 2307 for IT / software services (ATC WC157)
  const [autoIssue, setAutoIssue] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>(
    'Official Sales Invoice issued under BIR CAS Permit. Please furnish BIR Form 2307 upon payment settlement.'
  );
  const [items, setItems] = useState<TempLineItem[]>([
    {
      description: 'Cloud Platform Infrastructure & SaaS Monthly Subscription',
      accountCode: '4010',
      quantity: 1,
      unitPrice: 250000,
      vatType: 'vatable',
    },
  ]);
  const [error, setError] = useState<string | null>(null);

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const calculateDueDate = (issueDateStr: string, terms: PaymentTerms) => {
    const d = new Date(issueDateStr || new Date());
    let days = 30;
    if (terms === 'due_on_receipt') days = 0;
    else if (terms === 'net_15') days = 15;
    else if (terms === 'net_30') days = 30;
    else if (terms === 'net_60') days = 60;
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        description: '',
        accountCode: revenueAccounts[0]?.code || '4010',
        quantity: 1,
        unitPrice: 0,
        vatType: 'vatable',
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof TempLineItem, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  // BIR VAT calculations
  let vatableSales = 0;
  let vatExemptSales = 0;
  let zeroRatedSales = 0;

  items.forEach((it) => {
    const amt = (it.quantity || 0) * (it.unitPrice || 0);
    if (it.vatType === 'vatable') {
      vatableSales += amt;
    } else if (it.vatType === 'zero_rated') {
      zeroRatedSales += amt;
    } else {
      vatExemptSales += amt;
    }
  });

  const outputVat = vatableSales * 0.12;
  const grossAmount = vatableSales + vatExemptSales + zeroRatedSales + outputVat;
  const ewtAmount = vatableSales * (ewtRate / 100);
  const netCashAmountDue = grossAmount - ewtAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerId) {
      setError('Please select a customer entity.');
      return;
    }

    const hasEmptyDesc = items.some((it) => !it.description.trim());
    if (hasEmptyDesc) {
      setError('Every line item must have a valid description.');
      return;
    }

    const dueDate = calculateDueDate(issueDate, paymentTerms);

    const result = createInvoice({
      customerId,
      issueDate,
      dueDate,
      items: items.map((it) => ({
        description: it.description,
        accountCode: it.accountCode,
        quantity: Number(it.quantity) || 1,
        unitPrice: Number(it.unitPrice) || 0,
        vatType: it.vatType,
        taxRate: it.vatType === 'vatable' ? 12 : 0,
      })),
      paymentTerms,
      ewtRate,
      notes,
      autoIssue,
    });

    if (result.success && result.invoiceId) {
      onInvoiceCreated?.(result.invoiceId);
      onClose();
    } else {
      setError(result.error || 'Failed to generate BIR Sales Invoice.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create BIR VAT Sales Invoice"
      subtitle={`Compliant with BIR RR 16-2005 & RA 11976 (EOPT Act) · CAS Permit: ${companyProfile.casPermitNo}`}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        {/* Customer Information with BIR TIN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Registered Customer / Buyer *
            </label>
            <select
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                const cust = customers.find((c) => c.id === e.target.value);
                if (cust?.paymentTerms) setPaymentTerms(cust.paymentTerms);
              }}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.company} (TIN: {formatTin(c.tin)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Invoice Issue Date *
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Payment Terms & Credit
            </label>
            <select
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value as PaymentTerms)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            >
              <option value="due_on_receipt">Due on Receipt</option>
              <option value="net_15">Net 15 Days</option>
              <option value="net_30">Net 30 Days</option>
              <option value="net_60">Net 60 Days</option>
            </select>
          </div>
        </div>

        {/* Selected Customer BIR Tax Dossier Preview */}
        {selectedCustomer && (
          <div className="p-3 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 font-mono text-[11px] grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <span className="text-neutral-400 block font-sans">BIR TIN / Branch:</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                {formatTin(selectedCustomer.tin)}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block font-sans">Business Style:</span>
              <span className="text-neutral-700 dark:text-neutral-300 truncate block">
                {selectedCustomer.businessStyle}
              </span>
            </div>
            <div>
              <span className="text-neutral-400 block font-sans">Tax Registration:</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold block">
                {selectedCustomer.isVatRegistered ? 'VAT Registered Entity' : 'Non-VAT Entity'}
              </span>
            </div>
          </div>
        )}

        {/* Line Items Table with VAT Classification */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
              Taxable Items & BIR VAT Classification
            </span>
            <button
              type="button"
              onClick={handleAddItem}
              className="inline-flex items-center gap-1 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white"
            >
              <Plus className="h-3 w-3" />
              <span>Add Line Item</span>
            </button>
          </div>

          <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100/70 dark:bg-neutral-800/60 text-neutral-500 dark:text-neutral-400 font-medium border-b border-neutral-200 dark:border-neutral-800">
                <tr>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-2 w-32">GL Revenue Acct</th>
                  <th className="py-2 px-2 w-32">VAT Treatment</th>
                  <th className="py-2 px-2 w-16 text-right">Qty</th>
                  <th className="py-2 px-2 w-28 text-right">Unit Price (₱)</th>
                  <th className="py-2 px-3 w-28 text-right">Net Sales (₱)</th>
                  <th className="py-2 px-1 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 font-mono">
                {items.map((item, idx) => {
                  const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
                  return (
                    <tr key={idx} className="bg-white dark:bg-neutral-900">
                      <td className="p-2 font-sans">
                        <input
                          type="text"
                          placeholder="Service description or software SKU"
                          value={item.description}
                          onChange={(e) => handleUpdateItem(idx, 'description', e.target.value)}
                          className="w-full text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-transparent px-2 py-1 text-neutral-900 dark:text-neutral-100"
                        />
                      </td>
                      <td className="p-2 font-sans">
                        <select
                          value={item.accountCode}
                          onChange={(e) => handleUpdateItem(idx, 'accountCode', e.target.value)}
                          className="w-full text-[11px] rounded border border-neutral-200 dark:border-neutral-700 bg-transparent px-1.5 py-1 text-neutral-900 dark:text-neutral-100"
                        >
                          {revenueAccounts.map((a) => (
                            <option key={a.code} value={a.code} className="bg-white dark:bg-neutral-900">
                              {a.code} - {a.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="p-2 font-sans">
                        <select
                          value={item.vatType}
                          onChange={(e) => handleUpdateItem(idx, 'vatType', e.target.value as VatType)}
                          className="w-full text-[11px] rounded border border-neutral-200 dark:border-neutral-700 bg-transparent px-1.5 py-1 text-neutral-900 dark:text-neutral-100"
                        >
                          <option value="vatable">VATable (12% VAT)</option>
                          <option value="zero_rated">Zero-Rated (0%)</option>
                          <option value="exempt">VAT-Exempt</option>
                        </select>
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItem(idx, 'quantity', Math.max(1, parseFloat(e.target.value) || 0))
                          }
                          className="w-full text-right text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-transparent px-1.5 py-1 text-neutral-900 dark:text-neutral-100"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleUpdateItem(idx, 'unitPrice', parseFloat(e.target.value) || 0)
                          }
                          className="w-full text-right text-xs rounded border border-neutral-200 dark:border-neutral-700 bg-transparent px-1.5 py-1 text-neutral-900 dark:text-neutral-100"
                        />
                      </td>
                      <td className="p-2 text-right tabular-nums text-neutral-900 dark:text-neutral-100 font-semibold">
                        {formatCurrency(lineTotal)}
                      </td>
                      <td className="p-2 text-center">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="text-neutral-400 hover:text-rose-600 transition-colors p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* BIR Tax Breakdown & EWT Withholding */}
        <div className="flex flex-col md:flex-row justify-between gap-6 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <div className="w-full md:w-1/2 space-y-3">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Creditable Withholding Tax (BIR Form 2307 EWT)
              </label>
              <select
                value={ewtRate}
                onChange={(e) => setEwtRate(parseFloat(e.target.value) || 0)}
                className="w-full text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
              >
                <option value={2}>2% EWT (ATC WC157 / WI100 - Software & Professional Services)</option>
                <option value={1}>1% EWT (ATC WC100 - Sale of Goods & Supplies)</option>
                <option value={5}>5% EWT (ATC WI158 - Commercial Real Estate Rental)</option>
                <option value={0}>0% (No Withholding / Non-withholding client)</option>
              </select>
              <p className="text-[11px] text-neutral-500 mt-1">
                Client will withhold {ewtRate}% of VAT-exclusive amount (₱{ewtAmount.toFixed(2)}) and provide BIR Form 2307 Certificate.
              </p>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300">
              <input
                type="checkbox"
                checked={autoIssue}
                onChange={(e) => setAutoIssue(e.target.checked)}
                className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-950 dark:bg-neutral-800"
              />
              <span>
                Immediately issue and post to BIR General Ledger (DR 1200 / CR Revenue / CR 2110 Output VAT)
              </span>
            </label>
          </div>

          {/* Official BIR Invoicing Matrix */}
          <div className="w-full md:w-80 p-3.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/60 space-y-1.5 font-mono text-xs tabular-nums">
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>VATable Sales:</span>
              <span>{formatCurrency(vatableSales)}</span>
            </div>
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>VAT-Exempt Sales:</span>
              <span>{formatCurrency(vatExemptSales)}</span>
            </div>
            <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
              <span>Zero-Rated Sales:</span>
              <span>{formatCurrency(zeroRatedSales)}</span>
            </div>
            <div className="flex justify-between text-neutral-800 dark:text-neutral-200 font-medium">
              <span>12% Output VAT:</span>
              <span>{formatCurrency(outputVat)}</span>
            </div>
            <div className="flex justify-between pt-1 border-t border-neutral-200 dark:border-neutral-700 font-semibold text-neutral-900 dark:text-neutral-100">
              <span>Total Gross Sales:</span>
              <span>{formatCurrency(grossAmount)}</span>
            </div>
            {ewtRate > 0 && (
              <div className="flex justify-between text-rose-600 dark:text-rose-400">
                <span>Less: {ewtRate}% EWT (Form 2307):</span>
                <span>-{formatCurrency(ewtAmount)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t-2 border-neutral-300 dark:border-neutral-700 font-bold text-sm text-neutral-900 dark:text-neutral-100">
              <span>Net Settlement Due:</span>
              <span>{formatCurrency(netCashAmountDue)}</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors"
          >
            {autoIssue ? 'Issue BIR Sales Invoice' : 'Save as Draft'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
