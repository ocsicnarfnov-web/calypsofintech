import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAccounting } from '../../context/AccountingContext';
import { Building2, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { CompanyProfile } from '../../types/accounting';

interface AddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompanyCreated?: (company: CompanyProfile) => void;
}

import { RdoSelector } from '../common/RdoSelector';

export const AddCompanyModal: React.FC<AddCompanyModalProps> = ({
  isOpen,
  onClose,
  onCompanyCreated,
}) => {
  const { addCompany } = useAccounting();

  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [tin, setTin] = useState('');
  const [branchCode, setBranchCode] = useState('00000');
  const [rdoCode, setRdoCode] = useState('RDO 044 - Taguig / Pateros');
  const [businessStyle, setBusinessStyle] = useState('Information Technology, SaaS & Enterprise Solutions');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Taguig');
  const [province, setProvince] = useState('Metro Manila');
  const [zip, setZip] = useState('1634');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+63 (2) 8800-0000');
  const [website, setWebsite] = useState('');
  const [vatStatus, setVatStatus] = useState<'VAT_REGISTERED' | 'NON_VAT'>('VAT_REGISTERED');
  const [casPermitNo, setCasPermitNo] = useState(`CAS-AC-${new Date().getFullYear()}-09820-BIR`);
  const [invoicePrefix, setInvoicePrefix] = useState('SI-2026');
  const [bankName, setBankName] = useState('BDO Unibank, Inc.');
  const [accountNumber, setAccountNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formatTin = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 14);
    const parts: string[] = [];
    if (raw.length > 0) parts.push(raw.slice(0, 3));
    if (raw.length > 3) parts.push(raw.slice(3, 6));
    if (raw.length > 6) parts.push(raw.slice(6, 9));
    if (raw.length > 9) parts.push(raw.slice(9, 14));
    return parts.join('-');
  };

  const handleTinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTin(formatTin(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !legalName.trim() || !tin.trim()) {
      setErrorMsg('Brand Name, Legal Corporate Name, and BIR TIN are mandatory.');
      return;
    }

    const created = addCompany({
      name: name.trim(),
      legalName: legalName.trim(),
      tradeName: tradeName.trim() || name.trim(),
      tin: tin.trim(),
      branchCode: branchCode.trim() || '00000',
      rdoCode,
      businessStyle: businessStyle.trim(),
      address: {
        street: street.trim() || 'Bonifacio Global City',
        city: city.trim() || 'Taguig',
        province: province.trim() || 'Metro Manila',
        zip: zip.trim() || '1634',
        country: 'Philippines',
      },
      email: email.trim() || `finance@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.ph`,
      phone: phone.trim(),
      website: website.trim() || `https://${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.ph`,
      currency: 'PHP',
      fiscalYearEnd: '12-31',
      vatRegistrationStatus: vatStatus,
      casPermitNo: casPermitNo.trim(),
      casDateIssued: new Date().toISOString().split('T')[0],
      invoiceSeriesStart: `${invoicePrefix}-000001`,
      invoiceSeriesEnd: `${invoicePrefix}-999999`,
      bankDetails: {
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim() || '0000-0000-0000',
        routingNumber: '010530667',
        swiftCode: 'BNORPHMM',
      },
    });

    if (onCompanyCreated) {
      onCompanyCreated(created);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Company / Legal Entity"
      subtitle="Establish a new corporate entity, branch, or subsidiary with independent BIR CAS compliance"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-neutral-600 dark:text-neutral-300">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Section 1: Corporate Tax Identity */}
        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
            <Building2 className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
            <span>1. Legal & Tax Identity</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Operating / Brand Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Calypso Cloud Cebu"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Registered Legal Corporate Name *
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. Calypso Cloud Cebu Corporation"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                12-Digit BIR TIN *
              </label>
              <input
                type="text"
                value={tin}
                onChange={handleTinChange}
                placeholder="000-000-000-00000"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Branch Code *
                </label>
                <input
                  type="text"
                  value={branchCode}
                  onChange={(e) => setBranchCode(e.target.value)}
                  placeholder="00000"
                  maxLength={5}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  VAT Classification
                </label>
                <select
                  value={vatStatus}
                  onChange={(e) => setVatStatus(e.target.value as any)}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none"
                >
                  <option value="VAT_REGISTERED">VAT Registered (12%)</option>
                  <option value="NON_VAT">Non-VAT / Percentage</option>
                </select>
              </div>
            </div>

            <RdoSelector
              label="Revenue District Office (RDO)"
              required
              value={rdoCode}
              onChange={(val) => setRdoCode(val)}
              helperText="Official BIR jurisdiction governing VAT, withholding tax, and CAS audits."
            />

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Registered Business Style / Trade Line *
              </label>
              <input
                type="text"
                value={businessStyle}
                onChange={(e) => setBusinessStyle(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 2: BIR CAS & Invoicing */}
        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>2. BIR CAS Permit & Invoicing Series</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                CAS Permit Acknowledgement No. *
              </label>
              <input
                type="text"
                value={casPermitNo}
                onChange={(e) => setCasPermitNo(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Sales Invoice Series Prefix *
              </label>
              <input
                type="text"
                value={invoicePrefix}
                onChange={(e) => setInvoicePrefix(e.target.value)}
                placeholder="e.g. CEB-2026"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 3: Registered Address */}
        <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-3">
          <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider block">
            3. Tax Address & Banking
          </span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Street Address
              </label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Unit/Floor, Building, Street"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                City
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Primary Settlement Bank
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="0000-0000-0000"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <span className="text-[11px] text-neutral-400">
            A Primary Statutory General Ledger will be initialized for this entity automatically.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Register Company</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
