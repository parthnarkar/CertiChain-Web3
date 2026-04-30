import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { verifyCertificateOnChain } from '../utils/blockchain';
import { generateCertificateHash } from '../utils/hashUtils';

const FIELDS = [
  { name: 'studentName', label: 'Student Name', type: 'text', placeholder: 'e.g. Parth Narkar' },
  { name: 'courseName', label: 'Course Name', type: 'text', placeholder: 'e.g. Web Development' },
  { name: 'issuedDate', label: 'Issue Date', type: 'date', placeholder: '' },
  { name: 'issuedBy', label: 'Issued By', type: 'text', placeholder: 'e.g. VESIT' },
];

export default function VerifyCertificate() {
  const [form, setForm] = useState({ studentName: '', courseName: '', issuedDate: '', issuedBy: '' });
  const [result, setResult] = useState(null);   // null | { valid, hash } | { error }
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Step 1: Generate hash from the entered data (same formula as when created)
      const hash = await generateCertificateHash(form);

      // Step 2: Ask blockchain: "Does this hash exist?"
      // This is a READ — free, no MetaMask popup for confirmation
      const isValid = await verifyCertificateOnChain(hash);

      setResult({ valid: isValid, hash });
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm({ studentName: '', courseName: '', issuedDate: '', issuedBy: '' });
    setResult(null);
  };

  const hasResult = result !== null;

  return (
    <div className="max-w-lg mx-auto">

      {/* Page heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-4 text-xs font-medium text-violet-400 tracking-wider uppercase">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M5 0.5L9 2.75V7.25L5 9.5L1 7.25V2.75L5 0.5Z" stroke="currentColor" strokeWidth="1" fill="none" />
            <circle cx="5" cy="5" r="1.5" fill="currentColor" />
          </svg>
          Verify Authenticity
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Check a Certificate</h1>
        <p className="text-white/40 text-sm">
          Enter the exact certificate details to verify against the Ethereum blockchain.
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white/3 border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/40 backdrop-blur-sm"
      >
        {/* Form — always visible */}
        <form onSubmit={handleVerify} className="space-y-5">
          {FIELDS.map((field, i) => (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                {field.label}
              </label>
              <input
                type={field.type}
                name={field.name}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                required
                disabled={loading}
                className="
                  w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3
                  text-white text-sm placeholder-white/20
                  focus:outline-none focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20
                  disabled:opacity-40 transition-all duration-200
                "
              />
            </motion.div>
          ))}

          {/* Verify button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            className="
              w-full mt-2 py-3.5 rounded-xl font-semibold text-sm
              bg-violet-600 hover:bg-violet-500 text-white
              shadow-lg shadow-violet-600/25
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-all duration-200
              flex items-center justify-center gap-2
            "
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                  <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                </svg>
                Querying blockchain…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <circle cx="6.5" cy="6.5" r="4.5" stroke="white" strokeWidth="1.5" />
                  <path d="M10 10l3.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Verify Certificate
              </>
            )}
          </motion.button>
        </form>

        {/* Result area */}
        <AnimatePresence>
          {hasResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="mt-6"
            >
              {/* Error result */}
              {result.error && (
                <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 4v4M7 9.5h.01" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="7" cy="7" r="6" stroke="#ef4444" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-red-400 font-semibold text-sm mb-1">Verification Failed</p>
                      <p className="text-red-400/70 text-xs wrap-break-word">{result.error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Valid result */}
              {!result.error && result.valid && (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7l3 3 5-5" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-emerald-400 font-semibold text-sm mb-1">✅ Valid Certificate</p>
                      <p className="text-emerald-400/70 text-xs">
                        This certificate's hash exists on the Ethereum Sepolia blockchain. The data has not been tampered with.
                      </p>
                    </div>
                  </div>
                  {/* Hash display */}
                  <div className="bg-black/20 rounded-lg px-3 py-2.5 border border-emerald-500/10">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Certificate Hash</p>
                    <p className="text-xs font-mono text-emerald-400/80 break-all">{result.hash}</p>
                  </div>
                </div>
              )}

              {/* Invalid result */}
              {!result.error && !result.valid && (
                <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M7 3v5M7 9.5h.01" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
                        <path d="M2 12L7 2l5 10H2z" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-amber-400 font-semibold text-sm mb-1">❌ Certificate Not Found</p>
                      <p className="text-amber-400/70 text-xs">
                        No matching record found on the blockchain. This certificate may be fake, tampered with, or never issued.
                      </p>
                    </div>
                  </div>
                  <div className="bg-black/20 rounded-lg px-3 py-2.5 border border-amber-500/10">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Checked Hash</p>
                    <p className="text-xs font-mono text-amber-400/60 break-all">{result.hash}</p>
                  </div>
                </div>
              )}

              {/* Verify again */}
              <button
                onClick={reset}
                className="w-full mt-4 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 text-xs font-medium transition-all duration-200"
              >
                Verify Another Certificate
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Info strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6 flex items-center justify-center gap-6 text-white/20 text-xs"
      >
        <span className="flex items-center gap-1.5">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" className="text-white/30">
            <path d="M5 0L9.33 2.5V7.5L5 10L0.67 7.5V2.5L5 0Z" />
          </svg>
          On-chain verification
        </span>
        <span>·</span>
        <span>Read-only — no gas fee</span>
        <span>·</span>
        <span>Tamper-proof</span>
      </motion.div>
    </div>
  );
}