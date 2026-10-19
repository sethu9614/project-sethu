import React, { useEffect, useState } from 'react';
import { ShieldCheck, Activity, LockKeyhole, AlertTriangle, RefreshCw, LogOut, ShieldAlert, Globe, ArrowUpRight, CheckCircle2, UserRound, Eye, EyeOff } from 'lucide-react';

const API = 'http://localhost:5000/api';
async function request(path, options = {}, token) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const data = await request(`/auth/${mode}`, { method: 'POST', body: JSON.stringify({ name, email, password }) });
      onAuth(data);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <main className="auth-page">
    <div className="auth-art">
      <div className="brand"><div className="brand-icon"><ShieldCheck size={24}/></div><span>Webpage<span className="brand-light">Defense</span></span></div>
      <div className="hero-copy">
        <div className="eyebrow"><span className="pulse-dot"/> SECURITY OPERATIONS CENTER</div>
        <h1>Protect your digital<br/><span>front door.</span></h1>
        <p>Monitor suspicious requests, review security events, and keep your web application in view from one workspace.</p>
        <div className="hero-points"><div><CheckCircle2 size={17}/> Request monitoring</div><div><CheckCircle2 size={17}/> Threat event logging</div><div><CheckCircle2 size={17}/> Secure account access</div></div>
      </div>
      <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="shield-illustration"><ShieldCheck size={80} strokeWidth={1.1}/></div>
      <div className="auth-foot">WEB APPLICATION SECURITY <span>•</span> DEFENSE CONSOLE</div>
    </div>
    <section className="auth-panel">
      <div className="mobile-brand"><div className="brand-icon"><ShieldCheck size={22}/></div><b>Webpage<span className="brand-light">Defense</span></b></div>
      <div className="auth-box">
        <div className="status-pill"><span className="green-dot"/> SECURITY CONSOLE</div>
        <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="muted">{mode === 'login' ? 'Sign in to access your security dashboard.' : 'Set up an account to start monitoring events.'}</p>
        <form onSubmit={submit} className="auth-form">
          {mode === 'signup' && <label>Full name<div className="input-wrap"><UserRound size={17}/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" required minLength="2" maxLength="80"/></div></label>}
          <label>Email address<div className="input-wrap"><Globe size={17}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></div></label>
          <label>Password<div className="input-wrap"><LockKeyhole size={17}/><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder={mode==='signup'?'At least 10 characters':'Enter your password'} required minLength={mode==='signup'?10:1}/><button type="button" className="icon-button" onClick={()=>setShowPassword(!showPassword)} aria-label="Toggle password visibility">{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
          {error && <div className="error-box"><AlertTriangle size={16}/>{error}</div>}
          <button className="primary-button" disabled={busy}>{busy?'Please wait…':mode==='login'?'Sign in securely':'Create account'} <ArrowUpRight size={17}/></button>
        </form>
        <p className="switch-auth">{mode==='login'?'New to WebpageDefense?':'Already have an account?'} <button onClick={()=>{setMode(mode==='login'?'signup':'login');setError('')}}>{mode==='login'?'Create account':'Sign in'}</button></p>
        <div className="auth-note"><LockKeyhole size={14}/> Your session is protected by token-based authentication.</div>
      </div>
      <div className="auth-copyright">© 2026 WebpageDefense <span>•</span> Security dashboard starter</div>
    </section>
  </main>;
}

function AppDashboard({ session, onLogout }) {
  const [summary, setSummary] = useState(null);
  const [events, setEvents] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setBusy(true); setError('');
    try {
      const [s, e] = await Promise.all([
        request('/dashboard/summary', {}, session.token),
        request('/events', {}, session.token)
      ]);
      setSummary(s); setEvents(e.events);
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  useEffect(() => { load(); }, []);

  async function demoAlert() {
    setNotice(''); setError('');
    try {
      await request('/demo-alert', { method: 'POST', body: '{}' }, session.token);
      setNotice('Demo alert created. No attack was performed.');
      await load();
    } catch (err) { setError(err.message); }
  }

  const stats = [
    { label: 'Logged events', value: summary?.totalEvents ?? '—', note: 'Recorded security events', icon: Activity, tone: 'blue' },
    { label: 'Blocked requests', value: summary?.blockedRequests ?? '—', note: 'Matched security rules', icon: ShieldAlert, tone: 'purple' },
    { label: 'High severity', value: summary?.highSeverityAlerts ?? '—', note: 'High-priority event records', icon: AlertTriangle, tone: 'orange' },
    { label: 'Protection status', value: summary?.systemStatus ?? '—', note: 'API security middleware active', icon: LockKeyhole, tone: 'green' }
  ];

  return <div className="dashboard">
    <aside className="sidebar">
      <div className="brand sidebar-brand"><div className="brand-icon"><ShieldCheck size={23}/></div><span>Webpage<span className="brand-light">Defense</span></span></div>
      <div className="workspace-label">WORKSPACE</div>
      <div className="nav-item active"><Activity size={18}/> Overview</div>
      <div className="nav-item"><ShieldAlert size={18}/> Threat monitoring <span className="nav-count">{summary?.highSeverityAlerts || 0}</span></div>
      <div className="nav-item"><LockKeyhole size={18}/> Access control</div>
      <div className="sidebar-bottom"><div className="secure-card"><div className="secure-icon"><ShieldCheck size={19}/></div><b>Defense active</b><p>Security middleware is running on the API.</p><div className="secure-line"><span/></div></div><div className="profile"><div className="avatar">{(session.user?.name||'U').slice(0,1).toUpperCase()}</div><div className="profile-info"><b>{session.user?.name || 'User'}</b><span>{session.user?.email}</span></div><button className="icon-button logout" title="Sign out" onClick={onLogout}><LogOut size={17}/></button></div></div>
    </aside>
    <main className="main-area">
      <header className="topbar"><div className="breadcrumb">Security Center <span>/</span> <b>Overview</b></div><div className="top-actions"><div className="live-status"><span className="green-dot"/> API connected</div><button className="refresh-button" onClick={load} disabled={busy}><RefreshCw size={16} className={busy?'spin':''}/> Refresh</button></div></header>
      <div className="content">
        <div className="welcome-row"><div><div className="eyebrow dark-eyebrow">MONITORING OVERVIEW</div><h1>Security dashboard</h1><p>Monitor request activity and review potential threats to your web application.</p></div><button className="primary-button demo-button" onClick={demoAlert}><ShieldAlert size={17}/> Generate demo alert</button></div>
        {notice && <div className="success-box"><CheckCircle2 size={17}/>{notice}</div>}
        {error && <div className="error-box"><AlertTriangle size={17}/>{error} <button onClick={()=>setError('')}>Dismiss</button></div>}
        <div className="stats-grid">{stats.map(({label,value,note,icon:Icon,tone})=><div className="stat-card" key={label}><div className="stat-top"><span>{label}</span><div className={`stat-icon ${tone}`}><Icon size={19}/></div></div><div className="stat-value">{value}</div><div className="stat-note"><span className={`mini-dot ${tone}`}/>{note}</div></div>)}</div>
        <div className="section-heading"><div><h2>Recent security events</h2><p>Latest activity recorded by the defense API.</p></div><span className="event-count">{events.length} records</span></div>
        <div className="events-card">
          <div className="table-head"><span>EVENT</span><span>SEVERITY</span><span>REQUEST</span><span>ACTION</span><span>TIME</span></div>
          {events.length===0 ? <div className="empty-state"><div className="empty-icon"><ShieldCheck size={28}/></div><b>No security events yet</b><p>When the detector logs an event, it will appear here. You can generate a demo alert to test this dashboard.</p><button className="secondary-button" onClick={demoAlert}>Create demo event</button></div> :
            events.map(ev=><div className="event-row" key={ev._id}><div className="event-name"><div className={`event-symbol ${ev.severity}`}><AlertTriangle size={17}/></div><div><b>{ev.type}</b><span>{ev.message}</span></div></div><div><span className={`severity ${ev.severity}`}>{ev.severity}</span></div><div className="request-cell"><b>{ev.method}</b><span>{ev.path}</span></div><div><span className={`action ${ev.action}`}>{ev.action}</span></div><div className="time-cell">{new Date(ev.createdAt).toLocaleString()}</div></div>)
          }
        </div>
        <div className="bottom-grid"><div className="info-card"><div className="info-icon blue"><Globe size={19}/></div><div><b>Request inspection</b><p>Incoming API requests are checked against basic suspicious-pattern rules before reaching route handlers.</p></div><span className="enabled-tag">Enabled</span></div><div className="info-card"><div className="info-icon green"><LockKeyhole size={19}/></div><div><b>Authentication guard</b><p>Dashboard endpoints require a valid, unexpired access token.</p></div><span className="enabled-tag">Enabled</span></div></div>
        <footer className="dashboard-footer"><span><ShieldCheck size={15}/> WebpageDefense <span className="footer-dot">•</span> Demo security console</span><span>Use a managed WAF for production protection.</span></footer>
      </div>
    </main>
  </div>;
}

export default function App() {
  const [session, setSession] = useState(null);
  if (!session) return <Auth onAuth={setSession}/>;
  return <AppDashboard session={session} onLogout={()=>setSession(null)}/>;
}
