import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, Send, ArrowUpRight, ArrowDownLeft, ShieldCheck, 
  Wallet, History, LogOut, Search, RefreshCw, Copy, Check,
  UploadCloud, FileText, CheckCircle2, AlertCircle, FileCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [user, setUser] = useState(null);
  const [authMode, setAuthMode] = useState('login'); // login | register
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // App Dashboard State
  const [balance, setBalance] = useState(14850.75);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | transfer | upload | history
  const [transactions, setTransactions] = useState([
    { id: 1, recipient: 'Sarah Connor', type: 'transfer', amount: -250.00, category: 'Personal', date: '2026-08-13 14:20', status: 'Completed' },
    { id: 2, recipient: 'Stripe Payout', type: 'income', amount: 1850.50, category: 'Salary', date: '2026-08-12 09:15', status: 'Completed' },
    { id: 3, recipient: 'Netflix Subscription', type: 'expense', amount: -19.99, category: 'Entertainment', date: '2026-08-10 18:30', status: 'Completed' },
    { id: 4, recipient: 'Alex Mercer', type: 'transfer', amount: -400.00, category: 'Rent Share', date: '2026-08-08 11:45', status: 'Completed' },
    { id: 5, recipient: 'Investment Dividend', type: 'income', amount: 320.00, category: 'Investments', date: '2026-08-05 16:00', status: 'Completed' }
  ]);

  // Transfer Form State
  const [recipient, setRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferCategory, setTransferCategory] = useState('General');
  const [transferNote, setTransferNote] = useState('');
  const [isSending, setIsSending] = useState(false);

  // File Upload Transaction State
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadCategory, setUploadCategory] = useState('Document Verification');
  const [fileTxAmount, setFileTxAmount] = useState('100.00');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Shared Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastTx, setLastTx] = useState(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Auth Handler
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const endpoint = authMode === 'register' ? '/api/register' : '/api/login';
    const payload = authMode === 'register' 
      ? { username, email, password }
      : { username: username || email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      setUser(data.user || { username: username || 'User', email: email || 'user@aurabank.io' });
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Money Transfer Handler
  const handleTransfer = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(transferAmount);
    if (!recipient || isNaN(numAmount) || numAmount <= 0) return;
    if (numAmount > balance) {
      alert('Insufficient account balance!');
      return;
    }

    setIsSending(true);

    setTimeout(() => {
      const newTx = {
        id: Date.now(),
        recipient,
        type: 'transfer',
        amount: -numAmount,
        category: transferCategory,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 'Completed',
        note: transferNote
      };

      setTransactions(prev => [newTx, ...prev]);
      setBalance(prev => prev - numAmount);
      setLastTx(newTx);
      setIsSending(false);
      setShowSuccessModal(true);

      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

      setRecipient('');
      setTransferAmount('');
      setTransferNote('');
    }, 1200);
  };

  // File Upload Transaction Handler (/upload endpoint)
  const handleFileUploadTx = async (e) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) return;

    const numAmount = parseFloat(fileTxAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid transaction amount.');
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('filename[]', file);
    });

    try {
      const res = await fetch('/upload', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      if (!res.ok) throw new Error('File upload failed');

      const data = await res.json();
      const hashesCount = data.hashes?.length || selectedFiles.length;
      const fileNamesStr = selectedFiles.map(f => f.name).join(', ');

      const newTx = {
        id: Date.now(),
        recipient: `Multi-File Tx (${selectedFiles.length}): ${fileNamesStr}`,
        type: 'file_upload',
        amount: -numAmount,
        category: uploadCategory,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: `${hashesCount} File(s) Signed & Completed`,
        note: `SHA-256 Hashes: ${data.hashes ? data.hashes.map(h => h.substring(0, 10)).join(', ') : 'Verified'}`
      };

      setTransactions(prev => [newTx, ...prev]);
      setBalance(prev => prev - numAmount);
      setLastTx(newTx);
      setUploadResult(data);
      setShowSuccessModal(true);

      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });

      setSelectedFiles([]);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const copyAccountNo = () => {
    navigator.clipboard.writeText('AUR-9048-2831-5510');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredTransactions = transactions.filter(t => 
    t.recipient.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ position: 'relative', minHeight: '100vh', padding: '24px 16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* Background Ambient Glows */}
      <div className="glow-bg" style={{ width: '500px', height: '500px', background: 'rgba(6, 182, 212, 0.15)', top: '-100px', left: '-100px' }} />
      <div className="glow-bg" style={{ width: '600px', height: '600px', background: 'rgba(139, 92, 246, 0.12)', bottom: '-150px', right: '-100px' }} />

      {!user ? (
        /* ── AUTHENTICATION SCREEN ── */
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-panel"
          style={{ width: '100%', maxWidth: '440px', padding: '40px 32px', zIndex: 10 }}
        >
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '16px', marginBottom: '12px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
              <ShieldCheck size={36} color="var(--accent-cyan)" />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px' }}>AuraBank</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              {authMode === 'login' ? 'Welcome back! Secure access to your portal.' : 'Create an account to experience smooth banking.'}
            </p>
          </div>

          {authError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '12px', padding: '12px', color: 'var(--accent-rose)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}
            >
              <AlertCircle size={16} />
              {authError}
            </motion.div>
          )}

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Username</label>
              <input 
                type="text" 
                className="input-field"
                placeholder="e.g. guruhemanth"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>

            {authMode === 'register' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Email Address</label>
                <input 
                  type="email" 
                  className="input-field"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Password</label>
              <input 
                type="password" 
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="glass-button" style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }} disabled={authLoading}>
              {authLoading ? <RefreshCw className="animate-spin" size={18} /> : (authMode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'var(--text-dim)' }}>
            {authMode === 'login' ? "Don't have an account? " : "Already registered? "}
            <span 
              onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} 
              style={{ color: 'var(--accent-cyan)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
            >
              {authMode === 'login' ? 'Sign Up' : 'Log In'}
            </span>
          </div>
        </motion.div>
      ) : (
        /* ── MAIN DASHBOARD APPLICATION ── */
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          style={{ width: '100%', maxWidth: '1000px', zIndex: 10 }}
        >
          {/* Header Bar */}
          <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '8px', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                <ShieldCheck size={24} color="var(--accent-cyan)" />
              </div>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700' }}>AuraBank</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Logged in as <span style={{ color: 'var(--accent-cyan)' }}>{user.username}</span></p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setUser(null)} 
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)', padding: '8px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}
              >
                <LogOut size={14} /> Log Out
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2.5fr', gap: '24px' }}>
            {/* Sidebar Navigation */}
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '8px', height: 'fit-content' }}>
              {[
                { id: 'dashboard', label: 'Overview', icon: Wallet },
                { id: 'transfer', label: 'Send Money', icon: Send },
                { id: 'upload', label: 'File Transaction', icon: UploadCloud },
                { id: 'history', label: 'Statement', icon: History }
              ].map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: 'none',
                      background: isActive ? 'linear-gradient(90deg, rgba(6, 182, 212, 0.15), rgba(59, 130, 246, 0.1))' : 'transparent',
                      color: isActive ? 'var(--accent-cyan)' : 'var(--text-muted)',
                      fontWeight: isActive ? '700' : '500',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* BALANCE CARD */}
              <motion.div 
                className="glass-panel" 
                style={{ 
                  padding: '28px', 
                  background: 'linear-gradient(135deg, rgba(19, 25, 39, 0.9), rgba(15, 23, 42, 0.95))',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>Total Available Balance</span>
                    <h1 style={{ fontSize: '38px', fontWeight: '800', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      ${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </h1>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', fontSize: '13px', color: 'var(--text-dim)' }}>
                  <span>Acc: <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>AUR-9048-2831-5510</strong></span>
                  <button onClick={copyAccountNo} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </motion.div>

              {/* TAB 1: OVERVIEW */}
              {activeTab === 'dashboard' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div 
                      onClick={() => setActiveTab('transfer')}
                      className="glass-panel" 
                      style={{ padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-subtle)' }}
                    >
                      <div style={{ padding: '12px', background: 'rgba(6, 182, 212, 0.15)', borderRadius: '14px', color: 'var(--accent-cyan)' }}>
                        <ArrowUpRight size={24} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Send Money</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Direct wire transfer</p>
                      </div>
                    </div>

                    <div 
                      onClick={() => setActiveTab('upload')}
                      className="glass-panel" 
                      style={{ padding: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid rgba(139, 92, 246, 0.3)' }}
                    >
                      <div style={{ padding: '12px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '14px', color: 'var(--accent-purple)' }}>
                        <UploadCloud size={24} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '15px', fontWeight: '700' }}>File Transaction</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>SHA-256 Hash Verification</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="glass-panel" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Recent Activity</h3>
                      <button onClick={() => setActiveTab('history')} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>View All</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {transactions.slice(0, 4).map(tx => (
                        <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              padding: '10px', 
                              borderRadius: '12px', 
                              background: tx.type === 'file_upload' ? 'rgba(139, 92, 246, 0.12)' : (tx.amount > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)'),
                              color: tx.type === 'file_upload' ? 'var(--accent-purple)' : (tx.amount > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)')
                            }}>
                              {tx.type === 'file_upload' ? <FileCheck size={18} /> : (tx.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />)}
                            </div>
                            <div>
                              <p style={{ fontWeight: '600', fontSize: '14px' }}>{tx.recipient}</p>
                              <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{tx.category} • {tx.date}</span>
                            </div>
                          </div>

                          <span style={{ fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                            ${Math.abs(tx.amount).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: SEND MONEY */}
              {activeTab === 'transfer' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '28px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>Send Money Instantly</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>Transfer funds directly with zero transaction fees.</p>

                  <form onSubmit={handleTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Recipient Name or Account</label>
                      <input 
                        type="text" 
                        className="input-field"
                        placeholder="e.g. Alex Mercer or AUR-8821"
                        value={recipient}
                        onChange={e => setRecipient(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Amount ($)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          className="input-field"
                          placeholder="0.00"
                          value={transferAmount}
                          onChange={e => setTransferAmount(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Category</label>
                        <select className="input-field" value={transferCategory} onChange={e => setTransferCategory(e.target.value)}>
                          <option value="General">General</option>
                          <option value="Personal">Personal</option>
                          <option value="Rent Share">Rent Share</option>
                        </select>
                      </div>
                    </div>

                    <button type="submit" className="glass-button" disabled={isSending} style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                      {isSending ? <RefreshCw className="animate-spin" size={18} /> : <>Send Money <Send size={16} /></>}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* TAB 3: FILE UPLOAD TRANSACTION */}
              {activeTab === 'upload' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-panel" style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>File Upload Transaction</h3>
                    <span style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '8px', border: '1px solid rgba(139, 92, 246, 0.3)' }}>
                      SHA-256 VERIFIED
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                    Upload document transactions directly to your backend server endpoint (`/upload`).
                  </p>

                  <form onSubmit={handleFileUploadTx} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Drag and Drop Zone */}
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        if (e.dataTransfer.files?.length) {
                          setSelectedFiles(Array.from(e.dataTransfer.files));
                        }
                      }}
                      style={{
                        border: `2px dashed ${isDragOver ? 'var(--accent-purple)' : 'var(--border-subtle)'}`,
                        background: isDragOver ? 'rgba(139, 92, 246, 0.08)' : 'rgba(15, 23, 42, 0.4)',
                        borderRadius: '16px',
                        padding: '32px 20px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => document.getElementById('fileInput').click()}
                    >
                      <input 
                        id="fileInput" 
                        type="file"
                        multiple 
                        style={{ display: 'none' }}
                        onChange={e => e.target.files?.length && setSelectedFiles(Array.from(e.target.files))}
                      />
                      
                      <div style={{ display: 'inline-flex', padding: '14px', background: 'rgba(139, 92, 246, 0.12)', borderRadius: '50%', color: 'var(--accent-purple)', marginBottom: '12px' }}>
                        <UploadCloud size={32} />
                      </div>

                      {selectedFiles.length > 0 ? (
                        <div>
                          <p style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '14px' }}>
                            {selectedFiles.length} file(s) selected
                          </p>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            {selectedFiles.map((f, i) => (
                              <span key={i}>📄 {f.name} ({(f.size / 1024).toFixed(1)} KB)</span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p style={{ fontWeight: '600', fontSize: '14px', color: 'var(--text-main)' }}>Click to browse or drop multiple document files</p>
                          <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Select 1 or more files (PDF, PNG, JPG, CSV, DOCX)</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Transaction Amount ($)</label>
                        <input 
                          type="number" 
                          step="0.01"
                          className="input-field"
                          value={fileTxAmount}
                          onChange={e => setFileTxAmount(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Transaction Category</label>
                        <select className="input-field" value={uploadCategory} onChange={e => setUploadCategory(e.target.value)}>
                          <option value="Document Verification">Document Verification</option>
                          <option value="Contract Signing">Contract Signing</option>
                          <option value="Invoice Clearance">Invoice Clearance</option>
                        </select>
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="glass-button" 
                      disabled={selectedFiles.length === 0 || isUploading}
                      style={{ 
                        background: 'linear-gradient(135deg, var(--accent-purple), var(--accent-blue))',
                        opacity: selectedFiles.length === 0 ? 0.6 : 1,
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px'
                      }}
                    >
                      {isUploading ? <RefreshCw className="animate-spin" size={18} /> : <>Execute Multi-File Transaction <FileCheck size={16} /></>}
                    </button>
                  </form>
                </motion.div>
              )}

              {/* TAB 4: STATEMENT */}
              {activeTab === 'history' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-panel" style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>Statement & Upload Logs</h3>

                    <div style={{ position: 'relative', width: '220px' }}>
                      <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="text"
                        className="input-field"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ paddingLeft: '34px', padding: '8px 12px 8px 34px', fontSize: '12px' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {filteredTransactions.map(tx => (
                      <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '14px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <div style={{ 
                            padding: '10px', 
                            borderRadius: '12px', 
                            background: tx.type === 'file_upload' ? 'rgba(139, 92, 246, 0.12)' : (tx.amount > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)'),
                            color: tx.type === 'file_upload' ? 'var(--accent-purple)' : (tx.amount > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)')
                          }}>
                            {tx.type === 'file_upload' ? <FileCheck size={18} /> : (tx.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />)}
                          </div>
                          <div>
                            <p style={{ fontWeight: '600', fontSize: '14px' }}>{tx.recipient}</p>
                            <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{tx.category} • {tx.date}</span>
                            {tx.note && <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>{tx.note}</div>}
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontWeight: '700', fontFamily: 'var(--font-mono)', fontSize: '15px' }}>
                            ${Math.abs(tx.amount).toFixed(2)}
                          </span>
                          <div style={{ fontSize: '11px', color: 'var(--accent-emerald)', marginTop: '2px' }}>● {tx.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

            </div>
          </div>
        </motion.div>
      )}

      {/* ── SUCCESS MODAL ── */}
      <AnimatePresence>
        {showSuccessModal && lastTx && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="glass-panel"
              style={{ width: '90%', maxWidth: '420px', padding: '32px', textAlign: 'center', border: '1px solid var(--accent-cyan)' }}
            >
              <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '50%', color: 'var(--accent-emerald)', marginBottom: '16px' }}>
                <CheckCircle2 size={48} />
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: '800' }}>Transaction Successful!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
                Amount: <strong style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>${Math.abs(lastTx.amount).toFixed(2)}</strong>
              </p>

              <div style={{ margin: '20px 0', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '14px', fontSize: '12px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-dim)' }}>Reference:</span><span style={{ fontFamily: 'var(--font-mono)' }}>{lastTx.recipient}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-dim)' }}>Type:</span><span>{lastTx.category}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--text-dim)' }}>Status:</span><span style={{ color: 'var(--accent-emerald)' }}>{lastTx.status}</span></div>
              </div>

              <button onClick={() => setShowSuccessModal(false)} className="glass-button" style={{ width: '100%' }}>
                Done
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
