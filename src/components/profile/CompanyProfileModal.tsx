import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useAccounting } from '../../context/AccountingContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Building2, 
  ShieldCheck, 
  FileText, 
  MapPin, 
  CreditCard, 
  Save, 
  Check, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { CompanyProfile } from '../../types/accounting';

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import { RdoSelector } from '../common/RdoSelector';

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({ isOpen, onClose }) => {
  const { companyProfile, updateCompanyProfile } = useAccounting();
  const { currentUser, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState<'tax' | 'cas' | 'address' | 'banking'>('tax');
  const [formData, setFormData] = useState<CompanyProfile>(companyProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync state whenever modal opens or profile changes
  useEffect(() => {
    setFormData(companyProfile);
    setSavedSuccess(false);
    setErrorMsg(null);
  }, [companyProfile, isOpen]);

  const canEdit = hasPermission('Edit BIR Company Tax Profile & CAS Settings') || currentUser?.role === 'admin';

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
    const formatted = formatTin(e.target.value);
    setFormData((prev) => ({ ...prev, tin: formatted }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      setErrorMsg('You do not have permission to modify corporate tax credentials.');
      return;
    }

    if (!formData.name.trim() || !formData.tin.trim()) {
      setErrorMsg('Company Name and BIR TIN are mandatory.');
      return;
    }

    updateCompanyProfile(formData);
    setSavedSuccess(true);
    setErrorMsg(null);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Company & Corporate Tax Profile"
      subtitle="BIR Computerized Accounting System (RR 9-2009) & RA 11976 Registration Settings"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs text-neutral-600 dark:text-neutral-300">
        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('tax')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 text-xs flex items-center gap-1.5 ${
              activeTab === 'tax'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>BIR Tax Identity</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cas')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 text-xs flex items-center gap-1.5 ${
              activeTab === 'cas'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>CAS Accreditation</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('address')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 text-xs flex items-center gap-1.5 ${
              activeTab === 'address'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <MapPin className="h-3.5 w-3.5" />
            <span>Corporate Address</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('banking')}
            className={`pb-2.5 px-3 font-medium transition-colors border-b-2 text-xs flex items-center gap-1.5 ${
              activeTab === 'banking'
                ? 'border-neutral-900 dark:border-neutral-100 text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Banking & Remittance</span>
          </button>
        </div>

        {/* Read-Only Banner for Non-Admins */}
        {!canEdit && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              You are currently viewing this profile in read-only mode. Only <strong>Corporate Admins</strong> can update BIR credentials.
            </span>
          </div>
        )}

        {/* Tab 1: BIR Tax Identity */}
        {activeTab === 'tax' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Brand / Operating Name *
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Registered Legal Corporate Name *
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.legalName}
                  onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Registered Business Style / Trade Line *
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.businessStyle}
                  onChange={(e) => setFormData({ ...formData, businessStyle: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                  placeholder="e.g. Information Technology & Software Services"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  VAT Registration Status
                </label>
                <select
                  disabled={!canEdit}
                  value={formData.vatRegistrationStatus}
                  onChange={(e) => setFormData({ ...formData, vatRegistrationStatus: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                >
                  <option value="VAT_REGISTERED">VAT-Registered Taxpayer (12% Output VAT)</option>
                  <option value="NON_VAT">Non-VAT / Percentage Taxpayer (3% / Exempt)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  12-Digit BIR Taxpayer Identification No. (TIN) *
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.tin}
                  onChange={handleTinChange}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                  placeholder="000-000-000-00000"
                  required
                />
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Mandatory BIR 12-digit format stamped on statutory invoices and reports.
                </span>
              </div>

              <RdoSelector
                label="BIR Revenue District Office (RDO)"
                required
                disabled={!canEdit}
                value={formData.rdoCode}
                onChange={(val) => setFormData({ ...formData, rdoCode: val })}
                helperText="Official BIR district jurisdiction accredited under CAS Permit."
              />
            </div>
          </div>
        )}

        {/* Tab 2: CAS Accreditation */}
        {activeTab === 'cas' && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-neutral-100/70 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 space-y-1">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block text-xs">
                BIR Computerized Accounting System (RR No. 9-2009)
              </span>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                These credentials authenticate that Calypso generates valid electronic books of accounts and tamper-resistant Sales Invoices.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  CAS Acknowledgement Certificate No. (Permit) *
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.casPermitNo}
                  onChange={(e) => setFormData({ ...formData, casPermitNo: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  CAS Accreditation Date
                </label>
                <input
                  type="date"
                  disabled={!canEdit}
                  value={formData.casDateIssued}
                  onChange={(e) => setFormData({ ...formData, casDateIssued: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Approved Sales Invoice Series Start
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.invoiceSeriesStart}
                  onChange={(e) => setFormData({ ...formData, invoiceSeriesStart: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Approved Sales Invoice Series End
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.invoiceSeriesEnd}
                  onChange={(e) => setFormData({ ...formData, invoiceSeriesEnd: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Corporate Address & Contact */}
        {activeTab === 'address' && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Registered Street Address *
              </label>
              <input
                type="text"
                disabled={!canEdit}
                value={formData.address.street}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: e.target.value },
                  })
                }
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                required
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  City *
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Province / State
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.address.province}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, province: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  ZIP / Postal Code
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.address.zip}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, zip: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Country
                </label>
                <input
                  type="text"
                  disabled
                  value="Philippines"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800/50 text-neutral-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Official Finance Email
                </label>
                <input
                  type="email"
                  disabled={!canEdit}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Telephone / Trunkline
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Corporate Website
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Banking & Remittance */}
        {activeTab === 'banking' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Primary Depository Bank
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.bankDetails.bankName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, bankName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                  placeholder="e.g. BDO Unibank, Inc. - BGC Branch"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Settlement Account Number
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.bankDetails.accountNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, accountNumber: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                  placeholder="0000-0000-0000"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Bank Routing Number (BRN)
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.bankDetails.routingNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, routingNumber: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  SWIFT / BIC Code
                </label>
                <input
                  type="text"
                  disabled={!canEdit}
                  value={formData.bankDetails.swiftCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, swiftCode: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800 disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        )}

        {/* Feedback Message */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {savedSuccess && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            <span>Company Tax Profile successfully updated and persisted across all invoices and books.</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-neutral-200 dark:border-neutral-800">
          <span className="text-[11px] text-neutral-400">
            Last Updated: {formData.casDateIssued} · CAS Series: {formData.invoiceSeriesStart.split('-')[0]}-{formData.invoiceSeriesStart.split('-')[1]}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              Cancel
            </button>

            {canEdit && (
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Save Company Profile</span>
              </button>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};
