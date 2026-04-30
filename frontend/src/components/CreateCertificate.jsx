import { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { storeCertificateOnChain } from '../utils/blockchain';

const FIELDS = [
  { name: 'studentName', label: 'Student Name', type: 'text', placeholder: 'e.g. Parth Narkar' },
  { name: 'courseName', label: 'Course Name', type: 'text', placeholder: 'e.g. Web Development' },
  { name: 'issuedDate', label: 'Issue Date', type: 'date', placeholder: '' },
  { name: 'issuedBy', label: 'Issued By', type: 'text', placeholder: 'e.g. VESIT' },
];

// Step indicators
const STEPS = [
  { id: 1, label: 'Save to Database' },
  { id: 2, label: 'Store on Blockchain' },
];

export default function CreateCertificate() {
  const [form, setForm] = useState({ studentName: '', courseName: '', issuedDate: '', issuedBy: '' });
  const [status, setStatus] = useState('');        // status message text
  const [phase, setPhase] = useState(0);         // 0=idle 1=db 2=chain 3=done 4=error
  const [txHash, setTxHash] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPhase(1);
    setStatus('');
    setTxHash('');

    try {
      // STEP 1: Backend saves to MongoDB, returns hash
      const response = await axios.post('http://localhost:5000/api/certificates/create', form);
      const { hash } = response.data;

      // STEP 2: Frontend stores hash on blockchain via MetaMask
      setPhase(2);
      const tx = await storeCertificateOnChain(hash);
      setTxHash(tx);
      setPhase(3);
    } catch (error) {
      const msg = error?.response?.data?.message || error.message;
      setStatus(msg);
      setPhase(4);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setForm({ studentName: '', courseName: '', issuedDate: '', issuedBy: '' });
    setPhase(0);
    setStatus('');
    setTxHash('');
  };

  return (
    <div className="max-w-lg mx-auto">
      {/* Page heading */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-4 text-xs font-medium text-indigo-400 tracking-wider uppercase">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M5 0L9.33 2.5V7.5L5 10L0.67 7.5V2.5L5 0Z" />
          </svg>
          Admin Panel
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Issue a Certificate</h1>
        <p className="text-white/40 text-sm">
          Certificate data is saved to MongoDB and its hash is permanently stored on Ethereum.
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white/3 border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/40 backdrop-blur-sm"
      >
        <AnimatePresence mode="wait">

          {/* ── FORM STATE ── */}
          {phase < 3 && phase !== 4 && (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleCreate}
              className="space-y-5"
            >
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
                      focus:outline-none focus:border-indigo-500/60 focus:ring-2 focus:ring-indigo-500/20
                      disabled:opacity-40 transition-all duration-200
                    "
                  />
                </motion.div>
              ))}

              {/* Progress steps when loading */}
              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-3 mt-2">
                      {STEPS.map((step) => {
                        const done = phase > step.id;
                        const active = phase === step.id;
                        return (
                          <div key={step.id} className="flex items-center gap-2 flex-1">
                            <div className={`
                              w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold
                              transition-all duration-300
                              ${done ? 'bg-emerald-500 text-white' : ''}
                              ${active ? 'bg-indigo-500 text-white ring-2 ring-indigo-500/30' : ''}
                              ${!done && !active ? 'bg-white/10 text-white/30' : ''}
                            `}>
                              {done ? (
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                  <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              ) : active ? (
                                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                              ) : step.id}
                            </div>
                            <span className={`text-xs ${active ? 'text-white' : done ? 'text-emerald-400' : 'text-white/30'}`}>
                              {step.label}
                            </span>
                            {step.id < STEPS.length && (
                              <div className={`flex-1 h-px mx-1 ${done ? 'bg-emerald-500/40' : 'bg-white/10'}`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-white/40 mt-3 text-center">
                      {phase === 1 && 'Saving certificate to database…'}
                      {phase === 2 && 'MetaMask will open — please confirm the transaction…'}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                className="
                  w-full mt-2 py-3.5 rounded-xl font-semibold text-sm
                  bg-indigo-600 hover:bg-indigo-500 text-white
                  shadow-lg shadow-indigo-600/25
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
                    Processing…
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                    Create & Store on Blockchain
                  </>
                )}
              </motion.button>
            </motion.form>
          )}

          {/* ── SUCCESS STATE ── */}
          {phase === 3 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M6 14l5.5 5.5L22 9" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Certificate Issued!</h3>
              <p className="text-white/40 text-sm mb-6">
                Saved to MongoDB and permanently recorded on the Ethereum Sepolia blockchain.
              </p>

              {/* TX hash pill */}
              {txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-xs text-indigo-400 hover:text-indigo-300 hover:border-indigo-500/40 transition-all duration-200 mb-6"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1L11 3.5V8.5L6 11L1 8.5V3.5L6 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  </svg>
                  {txHash.slice(0, 14)}…{txHash.slice(-8)} ↗
                </a>
              )}

              <button
                onClick={reset}
                className="w-full py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm font-medium transition-all duration-200"
              >
                Issue Another Certificate
              </button>
            </motion.div>
          )}

          {/* ── ERROR STATE ── */}
          {phase === 4 && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="text-center py-4"
            >
              <div className="w-16 h-16 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mx-auto mb-5">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M14 9v6M14 19h.01" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M4 23L14 5l10 18H4z" stroke="#ef4444" strokeWidth="2" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Something went wrong</h3>
              <p className="text-red-400/80 text-sm mb-6 wrap-break-word max-w-sm mx-auto">{status}</p>
              <button
                onClick={reset}
                className="w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-sm font-medium transition-all duration-200"
              >
                Try Again
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </motion.div>

      {/* Helper note */}
      <p className="text-center text-white/20 text-xs mt-6">
        Make sure MetaMask is connected to Sepolia and you have test ETH
      </p>
    </div>
  );
}