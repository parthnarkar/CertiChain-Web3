import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CreateCertificate from './components/CreateCertificate';
import VerifyCertificate from './components/VerifyCertificate';

export default function App() {
  const [tab, setTab] = useState('verify');

  return (
    <div className="min-h-screen bg-[#080C14] text-white relative overflow-hidden">

      {/* Background grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(#6366f1 1px, transparent 1px), linear-gradient(90deg, #6366f1 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-150 h-150 rounded-full bg-indigo-600/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 w-125 h-125 rounded-full bg-violet-600/10 blur-[120px]" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M8 5L11 6.75V10.25L8 12L5 10.25V6.75L8 5Z" fill="white" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight text-white">
            Certi<span className="text-indigo-400">Chain</span>
          </span>
        </motion.div>

        {/* Nav pills */}
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1"
        >
          {[
            { id: 'verify', label: 'Verify' },
            { id: 'create', label: 'Issue Certificate' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${tab === item.id
                ? 'text-white'
                : 'text-white/40 hover:text-white/70'
                }`}
            >
              {tab === item.id && (
                <motion.div
                  layoutId="activePill"
                  className="absolute inset-0 bg-indigo-600 rounded-full shadow-lg shadow-indigo-500/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </motion.nav>

        {/* Network badge */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 text-xs text-white/40 border border-white/10 rounded-full px-3 py-1.5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Sepolia Testnet
        </motion.div>
      </header>

      {/* Page content */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 py-16">
        <AnimatePresence mode="wait">
          {tab === 'create' ? (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="w-full"
            >
              <CreateCertificate />
            </motion.div>
          ) : (
            <motion.div
              key="verify"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="w-full"
            >
              <VerifyCertificate />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-white/20 text-xs border-t border-white/5">
        CertiChain — Tamper-proof credentials on Ethereum &nbsp;·&nbsp; Sepolia Testnet
      </footer>
    </div>
  );
}