import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, User, Check, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string) => void;
  userEmail: string | null;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  userEmail,
  onLogout
}) => {
  const [email, setEmail] = useState<string>('citizen.advocate@nyaay.in');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onLogin(email);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#121820]/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#121820] max-w-md w-full rounded-[2px] shadow-lg overflow-hidden animate-stamp">
        {/* Header */}
        <div className="bg-[#121820] text-[#FAF7F2] px-6 py-3.5 flex items-center justify-between border-b border-[#2B3542]">
          <div className="flex items-center space-x-2 font-mono text-xs">
            <ShieldCheck className="w-4 h-4 text-[#C84B31]" />
            <span className="font-bold tracking-wider uppercase">FIREBASE CITIZEN AUTHENTICATION</span>
          </div>
          <button onClick={onClose} className="text-[#A2B1C6] hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {userEmail ? (
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-[#121820]">Authenticated Citizen Account</h3>
                <p className="text-xs font-mono text-[#556377] mt-1">{userEmail}</p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-rose-800 hover:bg-rose-900 text-white font-mono text-xs font-bold rounded-[2px] transition-colors"
                >
                  DISCONNECT / LOGOUT
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-serif text-xl font-black text-[#121820]">
                  {mode === 'LOGIN' ? 'Sign in to Case File Docket' : 'Create Citizen Account'}
                </h3>
                <p className="text-xs text-[#556377] font-sans">
                  Secure local & Firebase persistent session for your active legal dockets and evidentiary checklists.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="font-mono text-[11px] font-bold text-[#121820] uppercase">
                    EMAIL ADDRESS:
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 border border-[#E4DFD5] bg-[#FAF7F2] text-xs font-sans rounded-[2px] outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-mono text-[11px] font-bold text-[#121820] uppercase">
                    PASSWORD:
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#667085] absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2 border border-[#E4DFD5] bg-[#FAF7F2] text-xs font-sans rounded-[2px] outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#121820] hover:bg-[#2B3542] text-[#FAF7F2] font-mono text-xs font-bold rounded-[2px] transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>{mode === 'LOGIN' ? 'AUTHENTICATE CITIZEN' : 'REGISTER DOCKET ACCOUNT'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C84B31]" />
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                  className="text-xs font-mono text-[#C84B31] hover:underline"
                >
                  {mode === 'LOGIN' ? 'Need a new account? Register here' : 'Already have an account? Sign in'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
