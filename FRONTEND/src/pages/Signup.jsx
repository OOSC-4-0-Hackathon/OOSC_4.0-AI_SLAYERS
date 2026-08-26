import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';

function FieldLabel({ children }) {
  return <label className="block label-stamp text-ink-muted mb-1.5">{children}</label>;
}

function TextField({ id, type = 'text', placeholder, value, onChange }) {
  return (
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 bg-paper border border-paper-border hover:border-ink-fog rounded-input
        text-[14px] text-ink placeholder-ink-fog
        focus:outline-none focus:ring-1 focus:ring-amber focus:border-amber transition-colors"
    />
  );
}

export default function Signup() {
  const { signup, signInWithGoogle, error: authError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validate = () => {
    if (!name.trim()) { setValidationError('Full name is required.'); return false; }
    if (!email) { setValidationError('Email is required.'); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { setValidationError('Enter a valid email address.'); return false; }
    if (password.length < 6) { setValidationError('Password must be at least 6 characters.'); return false; }
    if (password !== confirmPassword) { setValidationError('Passwords do not match.'); return false; }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await signup(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      setValidationError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setValidationError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      setValidationError(err.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  const displayError = validationError || authError;

  return (
    <div className="min-h-screen bg-[#FAF7F2] ledger-grid text-[#121820]">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px] bg-white/90 backdrop-blur-sm border border-[#E4DFD5] p-8 rounded-[4px] shadow-sm"
        >
          <div className="mb-6">
            <span className="stamp-badge px-2 py-0.5 text-[10px] mb-2">
              CASE / REG-001
            </span>
            <h1
              className="font-serif text-3xl font-bold text-[#121820] mt-2 leading-tight"
            >
              Open your<br /><span className="text-[#C84B31] italic font-normal">case file.</span>
            </h1>
            <p className="text-[12px] font-mono text-[#667085] mt-2">Free during OOSC 4.0 hackathon period.</p>
          </div>

          {displayError && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-[2px] text-[13px] text-red-700 font-mono">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <FieldLabel>Full name</FieldLabel>
              <TextField id="name" placeholder="Priya Sharma" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Email address</FieldLabel>
              <TextField id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Password</FieldLabel>
              <TextField id="password" type="password" placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Confirm password</FieldLabel>
              <TextField id="confirmPassword" type="password" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#121820] hover:bg-[#2B3542] disabled:opacity-50 text-[#FAF7F2] font-mono font-bold rounded-[2px] text-[13px] transition-colors shadow-xs mt-1"
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-[#E4DFD5] flex-grow" />
            <span className="font-mono text-[10px] text-[#667085]">OR</span>
            <div className="h-px bg-[#E4DFD5] flex-grow" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-3 bg-[#F2EFE9] hover:bg-[#F2EFE9] border border-[#D5CEC2] rounded-[2px] text-[13px] font-mono font-medium text-[#121820] transition-colors"
          >
            Continue with Google
          </button>

          <p className="text-center text-[13px] text-[#667085] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[#C84B31] hover:underline font-semibold">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
