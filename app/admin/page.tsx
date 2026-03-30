'use client';
import { useState } from 'react';

type FormData = {
  name: string;
  role: string;
  party: string;
  date: string;
  charge: string;
  status: string;
  source: string;
  notes: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [message, setMessage] = useState('');
  const [newsUrl, setNewsUrl] = useState('');
  const [form, setForm] = useState<FormData>({
    name: '', role: '', party: '', date: '',
    charge: '', status: 'Detained', source: '', notes: '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleExtract() {
    if (!newsUrl) return;
    setExtracting(true);
    setMessage('');
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify({ url: newsUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(`Error: ${data.error}`);
        return;
      }
      if (!data.is_arrest) {
        setMessage('AI did not detect an arrest in this article. Fill the form manually.');
        return;
      }
      setForm({
        name: data.name || '',
        role: data.role || '',
        party: data.party || '',
        date: data.date || '',
        charge: data.charge || '',
        status: data.status || 'Detained',
        source: newsUrl,
        notes: data.notes || '',
      });
      setMessage('Fields populated. Review and submit.');
    } catch {
      setMessage('Network error. Try again.');
    }
    setExtracting(false);
  }

  async function handleSubmit() {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/arrests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': password,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Arrest added successfully!');
        setForm({ name: '', role: '', party: '', date: '', charge: '', status: 'Detained', source: '', notes: '' });
        setNewsUrl('');
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage('Network error. Try again.');
    }
    setLoading(false);
  }

  const inputStyle = {
    width: '100%',
    background: '#111',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '10px 12px',
    color: '#e5e5e5',
    fontSize: '14px',
  };

  const labelStyle = {
    display: 'block' as const,
    fontSize: '12px',
    color: '#666',
    marginBottom: '6px',
  };

  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: '#111', border: '1px solid #222', borderRadius: '12px', padding: '2rem', width: '100%', maxWidth: '360px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
            <div style={{ width: '28px', height: '28px', background: '#dc2626', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', color: '#fff' }}>N</div>
            <span style={{ fontWeight: 600, color: '#fff' }}>Nepal Watch Admin</span>
          </div>
          <label style={labelStyle}>Password</label>
          <input
            type="password"
            style={{ ...inputStyle, marginBottom: '1rem' }}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && setAuthed(true)}
            placeholder="Enter admin password"
          />
          <button
            onClick={() => setAuthed(true)}
            style={{ width: '100%', background: '#dc2626', border: 'none', borderRadius: '8px', padding: '10px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e5e5e5' }}>
      <nav style={{ borderBottom: '1px solid #222', padding: '0 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '56px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: '#dc2626', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px', color: '#fff' }}>N</div>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>Nepal Watch</span>
          <span style={{ fontSize: '12px', color: '#555', marginLeft: '4px' }}>/ admin</span>
        </div>
        <a href="/" style={{ fontSize: '13px', color: '#555' }}>Back to site</a>
      </nav>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Add new arrest</h1>
        <p style={{ fontSize: '13px', color: '#555', marginBottom: '2rem' }}>Paste a news URL to auto-fill, or enter details manually.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div style={{ background: '#111', border: '1px solid #333', borderRadius: '10px', padding: '1.25rem' }}>
            <label style={{ ...labelStyle, color: '#888', marginBottom: '10px', fontSize: '13px' }}>
              Auto-fill from news article
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="url"
                value={newsUrl}
                onChange={e => setNewsUrl(e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
                placeholder="https://kathmandupost.com/article..."
              />
              <button
                onClick={handleExtract}
                disabled={extracting || !newsUrl}
                style={{
                  background: extracting ? '#333' : '#1a1a2e',
                  border: '1px solid #2d2d5e',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  color: extracting ? '#555' : '#818cf8',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: extracting || !newsUrl ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {extracting ? 'Reading...' : 'Extract'}
              </button>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Full name *</label>
            <input name="name" value={form.name} onChange={handleChange} style={inputStyle} placeholder="KP Sharma Oli" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Role</label>
              <input name="role" value={form.role} onChange={handleChange} style={inputStyle} placeholder="Former Prime Minister" />
            </div>
            <div>
              <label style={labelStyle}>Party</label>
              <input name="party" value={form.party} onChange={handleChange} style={inputStyle} placeholder="CPN-UML" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={labelStyle}>Date of arrest *</label>
              <input name="date" type="date" value={form.date} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Status *</label>
              <select name="status" value={form.status} onChange={handleChange} style={inputStyle}>
                <option value="Detained">Detained</option>
                <option value="Released">Released</option>
                <option value="Charged">Charged</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Charge *</label>
            <input name="charge" value={form.charge} onChange={handleChange} style={inputStyle} placeholder="Karki Commission findings" />
          </div>

          <div>
            <label style={labelStyle}>Source URL</label>
            <input name="source" value={form.source} onChange={handleChange} style={inputStyle} placeholder="https://..." />
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' as const }}
              placeholder="Additional context..."
            />
          </div>

          {message && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              fontSize: '14px',
              background: message.includes('Error') ? '#1a0a0a' : message.includes('populated') ? '#0a0f1a' : '#0a1a0a',
              border: `1px solid ${message.includes('Error') ? '#7f1d1d' : message.includes('populated') ? '#1e3a5f' : '#14532d'}`,
              color: message.includes('Error') ? '#f87171' : message.includes('populated') ? '#60a5fa' : '#4ade80',
            }}>
              {message}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !form.name || !form.charge}
            style={{
              background: loading || !form.name || !form.charge ? '#333' : '#dc2626',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              color: loading || !form.name || !form.charge ? '#555' : '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: loading || !form.name || !form.charge ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Adding...' : 'Add arrest'}
          </button>

        </div>
      </div>
    </div>
  );
}