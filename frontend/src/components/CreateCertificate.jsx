import { useState } from 'react';
import axios from 'axios';
import { storeCertificateOnChain } from '../utils/blockchain';

export default function CreateCertificate() {
  const [form, setForm] = useState({
    studentName: '', courseName: '', issuedDate: '', issuedBy: ''
  });
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      // STEP 1: Backend saves to MongoDB, returns hash
      setStatus('Saving certificate to database...');
      const response = await axios.post(
        'http://localhost:5000/api/certificates/create',
        form
      );
      const { hash } = response.data;

      // STEP 2: Frontend stores hash on blockchain via MetaMask
      setStatus('Certificate saved! Now storing hash on blockchain — MetaMask will pop up...');
      const txHash = await storeCertificateOnChain(hash);

      setStatus(`✅ Done! Certificate is on blockchain. Transaction: ${txHash.slice(0, 20)}...`);

    } catch (error) {
      // Show a friendly error message
      const msg = error?.response?.data?.message || error.message;
      setStatus(`❌ Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 24 }}>
      <h2>Create Certificate</h2>
      <form onSubmit={handleCreate}>
        {['studentName', 'courseName', 'issuedDate', 'issuedBy'].map(field => (
          <div key={field} style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4 }}>{field}</label>
            <input
              type={field === 'issuedDate' ? 'date' : 'text'}
              name={field}
              value={form[field]}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px 20px', background: '#4F46E5', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}
        >
          {loading ? 'Processing...' : 'Create & Store on Blockchain'}
        </button>
      </form>
      {status && (
        <p style={{ marginTop: 16, padding: 12, background: '#f0f0f0', borderRadius: 6 }}>
          {status}
        </p>
      )}
    </div>
  );
}