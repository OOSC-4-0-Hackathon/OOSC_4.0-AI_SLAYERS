import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';

/*
 * Human-readable names for the destinations a visitor can be bounced from, so
 * the sign-in screen can say what it is protecting instead of showing a bare
 * form and then dumping the user somewhere unrelated.
 */
const DESTINATION_LABELS = {
  '/civic': 'your case dossier',
  '/know-your-kanoon': 'Kanoon Q&A',
  '/upload-chat': 'document chat',
  '/dochub': 'document drafting',
  '/reasoning': 'legal reasoning',
  '/dashboard': 'your dashboard',
};

function FieldLabel({ htmlFor, children }) {
  /* htmlFor was missing, so none of these labels were associated with their
     input — clicking a label did nothing and screen readers announced the
     fields unnamed. */
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#556377] mb-1.5"
    >
      {children}
    </label>
  );
}

function TextField({ id, type = 'text', placeholder, value, onChange, error, autoComplete, trailing }) {
  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        className={`w-full px-4 py-3 ${trailing ? 'pr-11' : ''} bg-[#FAF7F2] border rounded-[3px] text-[14px] text-[#121820] placeholder-[#667085]
          focus:outline-none focus:ring-2 focus:ring-[#C84B31] focus:border-[#C84B31] transition-colors
          ${error ? 'border-[#B42318]' : 'border-[#D5CEC2] hover:border-[#667085]'}`}
      />
      {trailing}
    </div>
  );
}

export default function Login() {
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /* Where ProtectedRoute bounced us from. Carries its own router state, which
     is where a preset query from the landing page lives. */
  const from = location.state?.from;
  const destinationLabel = from ? DESTINATION_LABELS[from.pathname] : null;

  const goToDestination = () => {
    if (from?.pathname) {
      navigate(from.pathname + (from.search || ''), { state: from.state, replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      goToDestination();
    } catch (err) {
      setError(err.message || 'Sign-in failed. Check your credentials.');
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      goToDestination();
    } catch (err) {
      setError(err.message || 'Google sign-in failed.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] ledger-grid text-[#121820] font-sans">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 pt-[140px] lg:pt-28 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] bg-white/90 backdrop-blur-sm border border-[#E4DFD5] p-8 rounded-[4px] shadow-card"
        >
          {/* Case file header */}
          <div className="mb-6">
            <span className="stamp-badge px-2 py-0.5 text-[12px]">
              Case / Auth-001
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#121820] mt-3 leading-tight">
              Sign in to<br />
              <span className="text-[#C84B31] italic font-normal">your case file.</span>
            </h1>
          </div>

          {/* Why the visitor is here, when they were bounced */}
          {destinationLabel && (
            <div className="mb-5 p-3 bg-[#FAEAE7] border-l-2 border-[#C84B31] rounded-[2px] text-[13px] text-[#8C271E] leading-relaxed">
              Sign in to continue to <span className="font-semibold">{destinationLabel}</span>.
              Anything you had already typed is kept.
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="mb-5 p-3 bg-[#FEF3F2] border border-[#B42318]/30 rounded-[2px] text-[13px] text-[#B42318] flex items-start gap-2 leading-relaxed"
            >
              <AlertTriangle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <FieldLabel htmlFor="email">Email address</FieldLabel>
              <TextField
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <TextField
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded text-[#667085] hover:text-[#121820] transition-colors focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:outline-none"
                  >
                    {showPassword
                      ? <EyeOff aria-hidden="true" className="w-4 h-4" />
                      : <Eye aria-hidden="true" className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full py-3 mt-1 bg-[#121820] hover:bg-[#2B3542] disabled:opacity-50 disabled:cursor-not-allowed text-[#FAF7F2] font-semibold rounded-[3px] text-[14px] transition-colors shadow-stamp flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && <ArrowRight aria-hidden="true" className="w-4 h-4" />}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-[#E4DFD5] flex-grow" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#667085]">or</span>
            <div className="h-px bg-[#E4DFD5] flex-grow" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-3 bg-[#F2EFE9] hover:bg-[#E4DFD5] disabled:opacity-50 disabled:cursor-not-allowed border border-[#D5CEC2] rounded-[3px] text-[14px] font-medium text-[#121820] transition-colors focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Continue with Google
          </button>

          <p className="text-center text-[13px] text-[#556377] mt-6">
            No account?{' '}
            <Link
              to="/signup"
              state={from ? { from } : undefined}
              className="text-[#A83C25] hover:text-[#8C271E] hover:underline font-semibold rounded focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:outline-none"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
