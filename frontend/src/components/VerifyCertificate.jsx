import { useState } from 'react';
import { verifyCertificateOnChain } from '../utils/blockchain';
import { generateCertificateHash } from '../utils/hashUtils';

export default function VerifyCertificate() {
  const [form, setForm] = useState({
    studentName: '', courseName: '', issuedDate: '', issuedBy: ''
  });
  const [result, setResult] = useState(null);  // null = not checked yet
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: 24 }}>
      <h2>Verify Certificate</h2>
      <p style={{ color: '#666', fontSize: 14 }}>
        Enter the certificate details exactly as they appear on the document.
      </p>
      <form onSubmit={handleVerify}>
        {['studentName', 'courseName', 'issuedDate', 'issuedBy'].map(field => (
          <div key={field} style={{ marginBottom: 12 }}>
            <label>{field}</label><br />
            <input
              type={field === 'issuedDate' ? 'date' : 'text'}
              name={field}
              value={form[field]}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: 8 }}
            />
          </div>
        ))}
        <button type="submit" disabled={loading}>
          {loading ? 'Checking blockchain...' : 'Verify Certificate'}
        </button>
      </form>

      {result && !result.error && (
        <div style={{
          marginTop: 24,
          padding: 16,
          borderRadius: 8,
          background: result.valid ? '#d4edda' : '#f8d7da',
          color: result.valid ? '#155724' : '#721c24',
          border: `1px solid ${result.valid ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          <h3 style={{ margin: '0 0 8px' }}>
            {result.valid ? '✅ Valid Certificate' : '❌ Invalid / Not Found'}
          </h3>
          <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>
            Hash: {result.hash.slice(0, 30)}...
          </p>
          {result.valid && (
            <p style={{ margin: '8px 0 0', fontSize: 13 }}>
              This certificate has been verified on the Ethereum Sepolia blockchain.
              Its data has not been tampered with.
            </p>
          )}
        </div>
      )}

      {result?.error && (
        <p style={{ color: 'red', marginTop: 16 }}>Error: {result.error}</p>
      )}
    </div>
  );
}