import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';

function FieldLabel({ htmlFor, children }) {
  /* htmlFor was missing on every label on this form. */
  return (
    <label
      htmlFor={htmlFor}
      className="block text-[12px] font-semibold uppercase tracking-[0.08em] text-[#556377] mb-1.5"
    >
      {children}
    </label>
  );
}

function TextField({ id, type = 'text', placeholder, value, onChange, onBlur, error, autoComplete, trailing }) {
  return (
    <div>
      <div className="relative">
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full px-4 py-3 ${trailing ? 'pr-11' : ''} bg-[#FAF7F2] border rounded-[3px] text-[14px] text-[#121820] placeholder-[#667085]
            focus:outline-none focus:ring-2 focus:ring-[#C84B31] focus:border-[#C84B31] transition-colors
            ${error ? 'border-[#B42318]' : 'border-[#D5CEC2] hover:border-[#667085]'}`}
        />
        {trailing}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[12px] text-[#B42318]">
          {error}
        </p>
      )}
    </div>
  );
}

export default function Signup() {
  const { signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  /* Per-field errors shown next to the field that caused them, rather than one
     banner that says only the first thing that went wrong. */
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  const from = location.state?.from;

  const validateField = (field, values) => {
    const v = { name, email, password, confirmPassword, ...values };
    switch (field) {
      case 'name':
        return v.name.trim() ? '' : 'Full name is required.';
      case 'email':
        if (!v.email) return 'Email is required.';
        return /\S+@\S+\.\S+/.test(v.email) ? '' : 'Enter a valid email address.';
      case 'password':
        return v.password.length >= 6 ? '' : 'Use at least 6 characters.';
      case 'confirmPassword':
        if (!v.confirmPassword) return 'Repeat your password.';
        return v.password === v.confirmPassword ? '' : 'Passwords do not match.';
      default:
        return '';
    }
  };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setFieldErrors((e) => ({ ...e, [field]: validateField(field) }));
  };

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
    setFormError('');

    const next = {};
    ['name', 'email', 'password', 'confirmPassword'].forEach((f) => {
      const msg = validateField(f);
      if (msg) next[f] = msg;
    });
    setFieldErrors(next);
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await signup(email, password, name);
      goToDestination();
    } catch (err) {
      setFormError(err.message || 'Could not create your account. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    if (loading) return;
    setFormError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      goToDestination();
    } catch (err) {
      setFormError(err.message || 'Google sign-in failed.');
      setLoading(false);
    }
  };

  const passwordStrongEnough = password.length >= 6;

  return (
    <div className="min-h-screen bg-[#FAF7F2] ledger-grid text-[#121820] font-sans">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 pt-[140px] lg:pt-28 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px] bg-white/90 backdrop-blur-sm border border-[#E4DFD5] p-8 rounded-[4px] shadow-card"
        >
          <div className="mb-6">
            <span className="stamp-badge px-2 py-0.5 text-[12px]">
              Case / Reg-001
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#121820] mt-3 leading-tight">
              Open your<br />
              <span className="text-[#C84B31] italic font-normal">case file.</span>
            </h1>
            <p className="text-[13px] text-[#556377] mt-2">
              Free during the OOSC 4.0 hackathon period.
            </p>
          </div>

          {from && (
            <div className="mb-5 p-3 bg-[#FAEAE7] border-l-2 border-[#C84B31] rounded-[2px] text-[13px] text-[#8C271E] leading-relaxed">
              Create an account to continue. Anything you had already typed is kept.
            </div>
          )}

          {formError && (
            <div
              role="alert"
              className="mb-5 p-3 bg-[#FEF3F2] border border-[#B42318]/30 rounded-[2px] text-[13px] text-[#B42318] flex items-start gap-2 leading-relaxed"
            >
              <AlertTriangle aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <FieldLabel htmlFor="name">Full name</FieldLabel>
              <TextField
                id="name"
                placeholder="Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleBlur('name')}
                error={touched.name ? fieldErrors.name : ''}
                autoComplete="name"
              />
            </div>

            <div>
              <FieldLabel htmlFor="email">Email address</FieldLabel>
              <TextField
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur('email')}
                error={touched.email ? fieldErrors.email : ''}
                autoComplete="email"
              />
            </div>

            <div>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <TextField
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => handleBlur('password')}
                error={touched.password ? fieldErrors.password : ''}
                autoComplete="new-password"
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
              {/* Live requirement feedback, so the rule is visible before submit */}
              {password.length > 0 && !fieldErrors.password && (
                <p className={`mt-1.5 text-[12px] flex items-center gap-1 ${passwordStrongEnough ? 'text-[#027A48]' : 'text-[#556377]'}`}>
                  {passwordStrongEnough && <Check aria-hidden="true" className="w-3 h-3" />}
                  {passwordStrongEnough ? 'Long enough.' : `${6 - password.length} more character(s) needed.`}
                </p>
              )}
            </div>

            <div>
              <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
              <TextField
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => handleBlur('confirmPassword')}
                error={touched.confirmPassword ? fieldErrors.confirmPassword : ''}
                autoComplete="new-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full py-3 mt-1 bg-[#121820] hover:bg-[#2B3542] disabled:opacity-50 disabled:cursor-not-allowed text-[#FAF7F2] font-semibold rounded-[3px] text-[14px] transition-colors shadow-stamp flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {loading ? 'Creating account…' : 'Create account'}
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

          {/* An account-creation form on a legal product should say what the
              user is agreeing to, and be able to link to it. */}
          <p className="text-[12px] text-[#556377] leading-relaxed mt-5 text-center">
            By creating an account you accept our{' '}
            <Link to="/legal/terms" className="text-[#A83C25] hover:text-[#8C271E] underline">Terms</Link>,{' '}
            <Link to="/legal/privacy" className="text-[#A83C25] hover:text-[#8C271E] underline">Privacy Policy</Link>, and{' '}
            <Link to="/legal/disclaimer" className="text-[#A83C25] hover:text-[#8C271E] underline">Legal Disclaimer</Link>.
            NYAAY AI is not a law firm and does not give legal advice.
          </p>

          <p className="text-center text-[13px] text-[#556377] mt-5">
            Already have an account?{' '}
            <Link
              to="/login"
              state={from ? { from } : undefined}
              className="text-[#A83C25] hover:text-[#8C271E] hover:underline font-semibold rounded focus-visible:ring-2 focus-visible:ring-[#C84B31] focus-visible:outline-none"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
