import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { 
  LogIn, 
  UserPlus, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Check, 
} from 'lucide-react';
import { UserRole, ROLE_DEFINITIONS } from '../../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { login, register, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration state
  const [displayName, setDisplayName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [role, setRole] = useState<UserRole>('accountant');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Finance & Accounting');
  const [cpaLicenseNo, setCpaLicenseNo] = useState('');
  const [phone, setPhone] = useState('');

  // UI state
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setRegEmail('');
    setRegPassword('');
    setCpaLicenseNo('');
    setPhone('');
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Authentication successful. Redirecting to workspace...');
      setTimeout(() => {
        resetForm();
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.error || 'Login failed. Please check credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await register({
      displayName,
      email: regEmail,
      password: regPassword,
      role,
      title: title || (role === 'accountant' ? 'Staff Accountant' : role === 'billing_specialist' ? 'Billing Officer' : 'System User'),
      department,
      cpaLicenseNo: cpaLicenseNo.trim() || undefined,
      phone: phone.trim() || undefined,
    });
    setLoading(false);

    if (res.success) {
      setSuccessMsg('User registered successfully! Logged into your new workspace.');
      setTimeout(() => {
        resetForm();
        onClose();
      }, 800);
    } else {
      setErrorMsg(res.error || 'Failed to register account.');
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    const res = await loginWithGoogle();
    setLoading(false);
    if (res.success) {
      setSuccessMsg('Signed in via Google Identity.');
      setTimeout(() => {
        onClose();
      }, 600);
    } else {
      setErrorMsg(res.error || 'Google login failed.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'login' ? 'Sign in to Calypso' : 'Register New User Account'}
      subtitle={
        mode === 'login'
          ? 'Enter your corporate credentials to access the accounting console'
          : 'Create a verified user profile with assigned BIR CAS role and permissions'
      }
      maxWidth="md"
    >
      <div className="space-y-4 text-xs text-neutral-600 dark:text-neutral-300">
        {/* Tab switcher: 2 options (Sign In & Register) */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`py-1.5 font-medium rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`py-1.5 font-medium rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            Register
          </button>
        </div>

        {/* Feedback alerts */}
        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <Check className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE 1: LOG IN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Corporate Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@calypso.ph"
                className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 pr-9 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>

            {/* Separator */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800"></div>
              <span className="flex-shrink mx-3 text-[10px] text-neutral-400 uppercase tracking-wider">
                Or Continue With
              </span>
              <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800"></div>
            </div>

            {/* Google OAuth Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-200 font-medium text-xs transition-colors flex items-center justify-center gap-2"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google Account (francis nov)</span>
            </button>

            {/* Register link */}
            <div className="pt-2 text-center">
              <span className="text-[11px] text-neutral-400">
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-neutral-800 dark:text-neutral-200 font-semibold underline"
                >
                  Register New Account &rarr;
                </button>
              </span>
            </div>
          </form>
        )}

        {/* MODE 2: REGISTER NEW USER */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Maria Clara, CPA"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Corporate Email *
                </label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="mclara@calypso.ph"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Role & Authorization *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                >
                  <option value="admin">Corporate Admin (Full Access)</option>
                  <option value="accountant">Chief Accountant / CPA (Ledger & Tax)</option>
                  <option value="billing_specialist">Billing Specialist (Invoices & AR)</option>
                  <option value="auditor">BIR Tax Auditor (Read-Only CAS)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Billing Analyst"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1">
                  CPA License No. (Optional)
                </label>
                <input
                  type="text"
                  value={cpaLicenseNo}
                  onChange={(e) => setCpaLicenseNo(e.target.value)}
                  placeholder="e.g. CPA-PH-028491"
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-800"
                />
              </div>
            </div>

            {/* Role explanation */}
            <div className="p-3 rounded-lg bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block text-[11px]">
                {ROLE_DEFINITIONS[role].label}
              </span>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                {ROLE_DEFINITIONS[role].description}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium text-xs hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{loading ? 'Creating Account...' : 'Register User'}</span>
            </button>

            {/* Back to login link */}
            <div className="pt-2 text-center">
              <span className="text-[11px] text-neutral-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-neutral-800 dark:text-neutral-200 font-semibold underline"
                >
                  Sign in here &rarr;
                </button>
              </span>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
