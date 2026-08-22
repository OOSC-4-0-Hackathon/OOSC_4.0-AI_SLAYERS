import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const TOOLS = [
  {
    tag: 'CORE',
    name: 'Civic Navigator',
    desc: 'RTI, Consumer, Tenant — 5-part structured answers grounded in 93 Bare Acts.',
    path: '/civic',
    accent: true,
  },
  {
    tag: 'RESEARCH',
    name: 'Kanoon Q&A',
    desc: 'Grounded Q&A over Indian statutes, constitutional clauses, landmark judgments.',
    path: '/know-your-kanoon',
    accent: false,
  },
  {
    tag: 'DRAFTING',
    name: 'Legal Drafting',
    desc: 'Generate Affidavits, Legal Notices, RTI Applications — with highlighted placeholders.',
    path: '/dochub',
    accent: false,
  },
  {
    tag: 'ANALYSIS',
    name: 'Document Chat',
    desc: 'Upload a contract or court order, extract clauses, identify red flags.',
    path: '/upload-chat',
    accent: false,
  },
  {
    tag: 'STRATEGY',
    name: 'Legal Reasoning',
    desc: 'Construct arguments for both sides of a dispute, evaluate litigation risk.',
    path: '/reasoning',
    accent: false,
  },
];

const ROLE_LABEL = { citizen: 'CITIZEN', student: 'LAW STUDENT', lawyer: 'LEGAL PROFESSIONAL' };

function DashboardField({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="label-stamp text-ink-fog">{label}</span>
      <span className="text-[13px] font-medium text-ink truncate">{value || '—'}</span>
    </div>
  );
}

function formatDate(ds) {
  if (!ds) return null;
  try { return new Date(ds).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return ds; }
}

export default function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const displayName = userProfile?.name || currentUser?.displayName || 'Counselor';

  return (
    <div className="min-h-screen bg-[#F9F8F5] ledger-grid text-[#121820] flex flex-col font-sans">
      <Navbar />
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-24 pb-20 flex-grow">

        {/* Welcome header */}
        <div className="border-b border-[#E4DFD5] pb-8 pt-4">
          <span className="stamp-badge px-2 py-0.5 text-[10px]">
            DASHBOARD // {new Date().getFullYear()}
          </span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-4">
            <h1
              className="font-serif text-4xl md:text-5xl font-extrabold text-[#121820] leading-tight"
            >
              Welcome back,<br />
              <span className="text-[#C84B31] italic font-normal">{displayName}.</span>
            </h1>
            {userProfile?.role && (
              <span className="self-start md:self-end stamp-badge px-3 py-1 text-[#C84B31] border-[#C84B31]">
                {ROLE_LABEL[userProfile.role] || userProfile.role.toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">

          {/* Tools */}
          <div className="lg:col-span-8">
            <span className="font-mono text-xs font-bold text-[#7A8699] uppercase tracking-wider block mb-4">CIVIC &amp; LEGAL TOOLS</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TOOLS.map((tool, i) => (
                <motion.div
                  key={tool.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Link
                    to={tool.path}
                    className={`flex flex-col justify-between p-5 border rounded-[4px] h-[160px] group transition-all duration-200 shadow-2xs ${
                      tool.accent
                        ? 'bg-[#121820] text-white border-[#2B3542] hover:border-[#C84B31]'
                        : 'bg-white/90 border-[#E4DFD5] hover:border-[#121820]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-[2px] border ${
                        tool.accent ? 'border-[#C84B31] text-[#C84B31] bg-[#C84B31]/10' : 'border-[#E4DFD5] text-[#7A8699]'
                      }`}>{tool.tag}</span>
                      <span className={tool.accent ? 'text-[#C84B31] group-hover:translate-x-1 transition-transform' : 'text-[#7A8699] group-hover:text-[#121820] group-hover:translate-x-1 transition-all'}>→</span>
                    </div>
                    <div>
                      <h3 className={`font-sans text-[15px] font-bold mb-1 ${tool.accent ? 'text-white' : 'text-[#121820]'}`}>{tool.name}</h3>
                      <p className={`text-[12px] leading-relaxed ${tool.accent ? 'text-[#A2B1C6]' : 'text-[#475467]'}`}>{tool.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Account sidebar */}
          <div className="lg:col-span-4">
            <span className="font-mono text-xs font-bold text-[#7A8699] uppercase tracking-wider block mb-4">CASE FILE ACCOUNT</span>
            <div className="bg-white/90 border border-[#E4DFD5] rounded-[4px] p-6 flex flex-col gap-4 shadow-2xs">
              {/* Avatar */}
              <div className="flex items-center gap-3 pb-4 border-b border-[#E4DFD5]">
                <div className="w-10 h-10 bg-[#121820] rounded-[4px] border border-[#2B3542] flex items-center justify-center flex-shrink-0 text-white font-serif font-bold italic text-lg">
                  {(displayName[0] || 'N').toUpperCase()}
                </div>
                <div>
                  <p className="text-[14px] font-bold text-[#121820]">{displayName}</p>
                  <p className="font-mono text-[10px] text-[#7A8699] truncate max-w-[160px]">{currentUser?.uid || 'mock-uid'}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 font-mono">
                <DashboardField label="EMAIL" value={userProfile?.email || currentUser?.email} />
                <DashboardField label="ROLE" value={ROLE_LABEL[userProfile?.role] || userProfile?.role} />
                <DashboardField label="JOINED" value={formatDate(userProfile?.created_at)} />
                <DashboardField label="LAST SYNC" value={formatDate(userProfile?.last_login)} />
              </div>

              <div className="pt-3 border-t border-[#E4DFD5]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 flex-shrink-0" />
                  <span className="text-[12px] font-mono text-[#7A8699]">NYAAY RAG Engine · Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
