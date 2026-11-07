import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Customer, PaymentTerms } from '../../types/accounting';
import { useAccounting } from '../../context/AccountingContext';
import { formatTin } from '../../utils/formatters';
import { RdoSelector } from '../common/RdoSelector';

interface CustomerModalProps {
  customer?: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (customer: Customer) => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  customer,
  isOpen,
  onClose,
  onSaved,
}) => {
  const { addCustomer, updateCustomer } = useAccounting();

  const [company, setCompany] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [zip, setZip] = useState('');
  const [tin, setTin] = useState('');
  const [branchCode, setBranchCode] = useState('00000');
  const [rdoCode, setRdoCode] = useState('RDO 044 - Taguig / Pateros');
  const [businessStyle, setBusinessStyle] = useState('');
  const [isVatRegistered, setIsVatRegistered] = useState(true);
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerms>('net_30');
  const [creditLimit, setCreditLimit] = useState<number>(1000000);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setCompany(customer.company);
      setName(customer.name);
      setEmail(customer.email);
      setPhone(customer.phone || '');
      setStreet(customer.address.street);
      setCity(customer.address.city);
      setProvince(customer.address.province || customer.address.state || 'Metro Manila');
      setZip(customer.address.zip);
      setTin(customer.tin);
      setBranchCode(customer.branchCode || '00000');
      setRdoCode(customer.rdoCode || 'RDO 044 - Taguig / Pateros');
      setBusinessStyle(customer.businessStyle);
      setIsVatRegistered(customer.isVatRegistered);
      setPaymentTerms(customer.paymentTerms);
      setCreditLimit(customer.creditLimit);
      setNotes(customer.notes || '');
    } else {
      setCompany('');
      setName('');
      setEmail('');
      setPhone('');
      setStreet('');
      setCity('Taguig');
      setProvince('Metro Manila');
      setZip('1634');
      setTin('');
      setBranchCode('00000');
      setRdoCode('RDO 044 - Taguig / Pateros');
      setBusinessStyle('Information Technology & Professional Services');
      setIsVatRegistered(true);
      setPaymentTerms('net_30');
      setCreditLimit(1000000);
      setNotes('');
    }
    setError(null);
  }, [customer, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!company.trim() || !name.trim() || !email.trim()) {
      setError('Please provide registered company name, primary contact, and billing email.');
      return;
    }

    if (!tin.trim()) {
      setError('BIR Tax Identification Number (TIN) is mandatory for computerized billing.');
      return;
    }

    const payload = {
      company: company.trim(),
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      address: {
        street: street.trim() || 'Level 10, Corporate Plaza',
        city: city.trim() || 'Taguig',
        province: province.trim() || 'Metro Manila',
        zip: zip.trim() || '1634',
        country: 'Philippines',
      },
      tin: formatTin(tin.trim()),
      branchCode: branchCode.trim() || '00000',
      rdoCode: rdoCode.trim() || undefined,
      businessStyle: businessStyle.trim() || 'Commercial Services',
      isVatRegistered,
      paymentTerms,
      defaultCurrency: 'PHP',
      creditLimit: Number(creditLimit) || 0,
      notes: notes.trim() || undefined,
    };

    if (customer) {
      updateCustomer(customer.id, payload);
      onSaved?.({ ...customer, ...payload });
    } else {
      const created = addCustomer(payload);
      onSaved?.(created);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? `Edit ${customer.company}` : 'Register BIR Taxpayer Customer Entity'}
      subtitle="Maintains customer BIR Tax Identification Number (TIN), business style, and VAT registration"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Registered Corporate / Entity Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Ayala Cloud Dynamics, Inc."
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Primary Contact Person *
            </label>
            <input
              type="text"
              placeholder="e.g. Patricia Morales"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>
        </div>

        {/* BIR TIN & Business Style */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              BIR TIN (9 or 12 Digits) *
            </label>
            <input
              type="text"
              placeholder="004-981-230-00000"
              value={tin}
              onChange={(e) => setTin(e.target.value)}
              className="w-full font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Branch Code
            </label>
            <input
              type="text"
              placeholder="00000"
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              className="w-full font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Tax Classification
            </label>
            <select
              value={isVatRegistered ? 'vat' : 'non_vat'}
              onChange={(e) => setIsVatRegistered(e.target.value === 'vat')}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            >
              <option value="vat">VAT-Registered</option>
              <option value="non_vat">Non-VAT Entity</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Registered Business Style (BIR Mandatory) *
          </label>
          <input
            type="text"
            placeholder="e.g. Telecommunications & Cloud Solutions Provider"
            value={businessStyle}
            onChange={(e) => setBusinessStyle(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
          />
        </div>

        <RdoSelector
          label="Customer BIR Revenue District Office (RDO)"
          value={rdoCode}
          onChange={(val) => setRdoCode(val)}
          helperText="Jurisdiction used for Form 2307 Withholding Tax Certificates & SAWT alphalists."
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Billing Email *
            </label>
            <input
              type="email"
              placeholder="ap@company.ph"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Phone / Landline
            </label>
            <input
              type="text"
              placeholder="+63 (2) 8000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Registered Address (per BIR Form 2303)
          </label>
          <input
            type="text"
            placeholder="34th Floor, Tower One & Exchange Plaza, Ayala Ave"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              City
            </label>
            <input
              type="text"
              placeholder="Makati / Taguig"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Province / Region
            </label>
            <input
              type="text"
              placeholder="Metro Manila"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Zip Code
            </label>
            <input
              type="text"
              placeholder="1226"
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              className="w-full font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Payment Terms
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

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Credit Limit (₱)
            </label>
            <input
              type="number"
              value={creditLimit}
              onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
              className="w-full font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors font-medium"
          >
            {customer ? 'Update Taxpayer Profile' : 'Register Taxpayer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
