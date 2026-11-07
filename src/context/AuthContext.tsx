import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppUser, UserRole, ROLE_DEFINITIONS } from '../types/auth';
import { INITIAL_USERS } from '../data/seedUsers';

interface AuthContextType {
  currentUser: AppUser | null;
  users: AppUser[];
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    email: string;
    displayName: string;
    password?: string;
    role: UserRole;
    title?: string;
    department?: string;
    cpaLicenseNo?: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (userId: string, data: Partial<AppUser>) => { success: boolean; error?: string };
  updateUserRole: (userId: string, newRole: UserRole) => { success: boolean; error?: string };
  toggleUserStatus: (userId: string) => { success: boolean; error?: string };
  deleteUser: (userId: string) => { success: boolean; error?: string };
  hasPermission: (permission: string) => boolean;
}

const STORAGE_KEYS = {
  USERS: 'calypso_users_v2',
  CURRENT_USER_ID: 'calypso_current_user_id_v2',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
      // Default to Francis Nov or Maria Santos if not set
      return saved || 'user-002';
    } catch {
      return 'user-002';
    }
  });

  // Sync users to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users to localStorage', e);
    }
  }, [users]);

  // Sync current user ID to localStorage
  useEffect(() => {
    try {
      if (currentUserId) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, currentUserId);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
      }
    } catch (e) {
      console.error('Failed to save current user ID', e);
    }
  }, [currentUserId]);

  const currentUser = users.find((u) => u.id === currentUserId) || null;
  const isAuthenticated = !!currentUser && currentUser.status === 'active';

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    // Normalization
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!found) {
      return { success: false, error: 'User account with this email not found.' };
    }

    if (found.status === 'inactive') {
      return { success: false, error: 'This user account has been deactivated by the Administrator.' };
    }

    // Update lastLogin timestamp
    const now = new Date().toISOString();
    setUsers((prev) =>
      prev.map((u) => (u.id === found.id ? { ...u, lastLogin: now } : u))
    );
    setCurrentUserId(found.id);

    return { success: true };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      // Simulate/Authenticate user via Google identity
      const defaultEmail = 'ocsicnarfnov@gmail.com';
      let targetUser = users.find((u) => u.email.toLowerCase() === defaultEmail);

      if (!targetUser) {
        // Register Google user automatically if not present
        const newUser: AppUser = {
          id: `user-${Date.now()}`,
          email: defaultEmail,
          displayName: 'Francis Nov',
          role: 'admin',
          status: 'active',
          title: 'System Administrator (Google Workspace)',
          department: 'Executive Engineering',
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        setUsers((prev) => [newUser, ...prev]);
        setCurrentUserId(newUser.id);
      } else {
        const now = new Date().toISOString();
        setUsers((prev) =>
          prev.map((u) => (u.id === targetUser!.id ? { ...u, lastLogin: now } : u))
        );
        setCurrentUserId(targetUser.id);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: 'Google sign-in could not be completed.' };
    }
  };

  const register = async (data: {
    email: string;
    displayName: string;
    password?: string;
    role: UserRole;
    title?: string;
    department?: string;
    cpaLicenseNo?: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = data.email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'A valid email address is required.' };
    }

    if (!data.displayName.trim()) {
      return { success: false, error: 'Display name cannot be empty.' };
    }

    // Check duplicate email
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'An account with this email already exists.' };
    }

    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      displayName: data.displayName.trim(),
      role: data.role,
      status: 'active',
      title: data.title?.trim() || (data.role === 'accountant' ? 'Staff Accountant' : data.role === 'billing_specialist' ? 'Billing Officer' : 'System User'),
      department: data.department?.trim() || 'Finance & Accounts',
      cpaLicenseNo: data.cpaLicenseNo?.trim(),
      phone: data.phone?.trim(),
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUserId(newUser.id);

    return { success: true };
  };

  const logout = () => {
    setCurrentUserId(null);
  };

  const updateUser = (userId: string, data: Partial<AppUser>): { success: boolean; error?: string } => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...data } : u))
    );
    return { success: true };
  };

  const updateUserRole = (userId: string, newRole: UserRole): { success: boolean; error?: string } => {
    // Prevent removing the last admin
    if (newRole !== 'admin') {
      const adminCount = users.filter((u) => u.role === 'admin' && u.status === 'active').length;
      const targetUser = users.find((u) => u.id === userId);
      if (targetUser?.role === 'admin' && adminCount <= 1) {
        return { success: false, error: 'Cannot change the role of the only active Administrator.' };
      }
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    return { success: true };
  };

  const toggleUserStatus = (userId: string): { success: boolean; error?: string } => {
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return { success: false, error: 'User not found' };

    // Prevent deactivating own account or last admin
    if (targetUser.id === currentUserId) {
      return { success: false, error: 'You cannot deactivate your own active session.' };
    }

    if (targetUser.role === 'admin' && targetUser.status === 'active') {
      const adminCount = users.filter((u) => u.role === 'admin' && u.status === 'active').length;
      if (adminCount <= 1) {
        return { success: false, error: 'Cannot deactivate the only active Administrator.' };
      }
    }

    const nextStatus = targetUser.status === 'active' ? 'inactive' : 'active';
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u))
    );
    return { success: true };
  };

  const deleteUser = (userId: string): { success: boolean; error?: string } => {
    if (userId === currentUserId) {
      return { success: false, error: 'You cannot delete your own active account.' };
    }

    const targetUser = users.find((u) => u.id === userId);
    if (targetUser?.role === 'admin') {
      const adminCount = users.filter((u) => u.role === 'admin' && u.status === 'active').length;
      if (adminCount <= 1) {
        return { success: false, error: 'Cannot delete the only active Administrator.' };
      }
    }

    setUsers((prev) => prev.filter((u) => u.id !== userId));
    return { success: true };
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser || currentUser.status !== 'active') return false;
    if (currentUser.role === 'admin') return true;
    const def = ROLE_DEFINITIONS[currentUser.role];
    return def ? def.permissions.includes(permission) : false;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated,
        login,
        loginWithGoogle,
        register,
        logout,
        updateUser,
        updateUserRole,
        toggleUserStatus,
        deleteUser,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
