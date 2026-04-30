import { useState } from 'react';
import CreateCertificate from './components/CreateCertificate';
import VerifyCertificate from './components/VerifyCertificate';

function App() {
  const [tab, setTab] = useState('verify');

  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', padding: 20 }}>
      <h1>Certificate Verification System</h1>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <button onClick={() => setTab('create')}>Admin: Create</button>
        <button onClick={() => setTab('verify')}>Verify Certificate</button>
      </div>
      {tab === 'create' ? <CreateCertificate /> : <VerifyCertificate />}
    </div>
  );
}

export default App;