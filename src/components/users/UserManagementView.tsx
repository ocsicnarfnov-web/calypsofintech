import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  UserCheck, 
  KeyRound, 
  FileCheck2,
  Search,
  Filter
} from 'lucide-react';
import { AppUser, UserRole, ROLE_DEFINITIONS } from '../../types/auth';
import { Modal } from '../common/Modal';

interface UserManagementViewProps {
  onOpenRegisterModal: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ onOpenRegisterModal }) => {
  const { users, currentUser, updateUser, updateUserRole, toggleUserStatus, deleteUser, hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canManage = hasPermission('Manage User Accounts & Roles') || currentUser?.role === 'admin';

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.cpaLicenseNo && u.cpaLicenseNo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === 'active').length;
  const cpaCount = users.filter((u) => !!u.cpaLicenseNo).length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    updateUser(editingUser.id, {
      displayName: editingUser.displayName,
      email: editingUser.email,
      title: editingUser.title,
      department: editingUser.department,
      cpaLicenseNo: editingUser.cpaLicenseNo,
      phone: editingUser.phone,
    });

    updateUserRole(editingUser.id, editingUser.role);
    setEditingUser(null);
  };

  const handleDelete = (u: AppUser) => {
    if (window.confirm(`Are you sure you want to remove user "${u.displayName}" (${u.email})?`)) {
      const res = deleteUser(u.id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Users className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
            <span>Account Management & User Directory</span>
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Role-Based Access Control (RBAC) and credentials management for Philippine BIR compliance
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenRegisterModal}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Register New User</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider block">
            Total Users
          </span>
          <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
            {totalUsers}
          </div>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block">
            {activeUsers} active accounts
          </span>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider block">
            Certified CPAs
          </span>
          <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
            {cpaCount}
          </div>
          <span className="text-[10px] text-neutral-500 block">
            PRC Licensed Tax Signatories
          </span>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider block">
            Corporate Admins
          </span>
          <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
            {adminCount}
          </div>
          <span className="text-[10px] text-neutral-500 block">
            Full system governance
          </span>
        </div>

        <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
          <span className="text-[11px] text-neutral-400 font-medium uppercase tracking-wider block">
            Current Session
          </span>
          <div className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {currentUser?.displayName || 'Guest User'}
          </div>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 block truncate">
            {currentUser?.role ? ROLE_DEFINITIONS[currentUser.role].label.split('/')[0] : 'No Session'}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or license..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
          <Filter className="h-3.5 w-3.5 text-neutral-400" />
          <span className="text-neutral-500">Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 text-xs focus:outline-none"
          >
            <option value="all">All Roles ({totalUsers})</option>
            <option value="admin">Corporate Admin</option>
            <option value="accountant">Chief Accountant / CPA</option>
            <option value="billing_specialist">Billing Specialist</option>
            <option value="auditor">BIR Tax Auditor</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden bg-white dark:bg-neutral-900 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-800 text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">User & Title</th>
                <th className="px-4 py-3">Role & Permissions</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-400 text-xs">
                    No users matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleDef = ROLE_DEFINITIONS[u.role];
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-neutral-50/70 dark:hover:bg-neutral-800/40 transition-colors ${
                        isCurrent ? 'bg-neutral-50/50 dark:bg-neutral-800/30' : ''
                      }`}
                    >
                      {/* Name & Contact */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 flex items-center justify-center font-bold text-xs shrink-0">
                            {u.displayName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                                {u.displayName}
                              </span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-400 block font-mono">
                              {u.email}
                            </span>
                            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
                              {u.title}
                            </span>
                            {u.cpaLicenseNo && (
                              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-medium block">
                                PRC Lic: {u.cpaLicenseNo}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-medium ${roleDef.badgeColor}`}>
                          {roleDef.label.split('/')[0]}
                        </span>
                        <span className="text-[10px] text-neutral-400 block mt-0.5 max-w-xs truncate">
                          {roleDef.description}
                        </span>
                      </td>

                      {/* Department */}
                      <td className="px-4 py-3.5 text-neutral-600 dark:text-neutral-400 text-xs">
                        {u.department}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {u.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-500 border border-neutral-300 dark:border-neutral-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>

                      {/* Last Active */}
                      <td className="px-4 py-3.5 text-neutral-500 text-[11px] font-mono">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingUser(u)}
                            className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            title="Edit user details & role"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {canManage && !isCurrent && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  const res = toggleUserStatus(u.id);
                                  if (!res.success) alert(res.error);
                                }}
                                className="p-1.5 rounded text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                                title={u.status === 'active' ? 'Deactivate user' : 'Reactivate user'}
                              >
                                {u.status === 'active' ? <XCircle className="h-3.5 w-3.5 text-neutral-400" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(u)}
                                className="p-1.5 rounded text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <Modal
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          title={`Edit Account: ${editingUser.displayName}`}
          subtitle="Modify user identity, assigned role, and professional credentials"
          maxWidth="md"
        >
          <form onSubmit={handleSaveEdit} className="space-y-4 text-xs text-neutral-600 dark:text-neutral-300">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Display Name *
              </label>
              <input
                type="text"
                value={editingUser.displayName}
                onChange={(e) => setEditingUser({ ...editingUser, displayName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  System Role *
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                >
                  <option value="admin">Corporate Admin (Superuser)</option>
                  <option value="accountant">Chief Accountant / CPA</option>
                  <option value="billing_specialist">Billing Specialist</option>
                  <option value="auditor">BIR Tax Auditor (Read-Only)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Designation / Job Title
                </label>
                <input
                  type="text"
                  value={editingUser.title}
                  onChange={(e) => setEditingUser({ ...editingUser, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={editingUser.department}
                  onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                PRC CPA License Number
              </label>
              <input
                type="text"
                value={editingUser.cpaLicenseNo || ''}
                onChange={(e) => setEditingUser({ ...editingUser, cpaLicenseNo: e.target.value })}
                placeholder="e.g. CPA-PH-018249"
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium text-white bg-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg shadow-xs transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
