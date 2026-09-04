import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const doLogin = () => {
    setError('');
    if (!email.trim() || !password.trim()) { setError('Preencha todos os campos.'); return; }
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (!result.success) { setError(result.error); return; }
      if (result.user?.role === 'admin') nav('/admin');
      else setError('Acesso não autorizado.');
    }, 400);
  };

  return (
    <div style={{ minHeight:'100vh', background:'#0a0a0a', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div style={{ width:'100%', maxWidth:360, background:'#111', border:'1px solid #222', borderRadius:16, padding:32 }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ fontSize:11, fontWeight:600, color:'#666', letterSpacing:2, marginBottom:8 }}>TB FINANCE</div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'#fff', marginBottom:6 }}>Acesso Administrativo</h1>
          <p style={{ fontSize:13, color:'#555' }}>Restrito à equipe TB Finance.</p>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:12, fontWeight:500, color:'#888', display:'block', marginBottom:8 }}>E-mail</label>
          <input
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doLogin()}
            type="email"
            placeholder="admin@tbfinance.com.br"
            style={{ width:'100%', background:'#1a1a1a', border:'1px solid #333', borderRadius:8, padding:'11px 14px', fontSize:14, color:'#fff', outline:'none' }}
          />
        </div>

        <div style={{ marginBottom:24 }}>
          <label style={{ fontSize:12, fontWeight:500, color:'#888', display:'block', marginBottom:8 }}>Senha</label>
          <div style={{ display:'flex', alignItems:'center', background:'#1a1a1a', border:'1px solid #333', borderRadius:8 }}>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doLogin()}
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              style={{ flex:1, background:'transparent', border:'none', padding:'11px 14px', fontSize:14, color:'#fff', outline:'none' }}
            />
            <button onClick={() => setShowPass(!showPass)} style={{ paddingRight:14, background:'none', border:'none', color:'#555', fontSize:18, cursor:'pointer' }}>
              <i className={`mdi ${showPass ? 'mdi-eye-off' : 'mdi-eye'}`} />
            </button>
          </div>
        </div>

        {error && <div style={{ color:'#ef4444', fontSize:13, marginBottom:16, padding:'10px 14px', background:'rgba(239,68,68,0.1)', borderRadius:8 }}>{error}</div>}

        <button
          onClick={doLogin}
          disabled={loading}
          style={{ width:'100%', background:'#E8440A', color:'#fff', padding:'13px', borderRadius:10, border:'none', fontSize:15, fontWeight:700, cursor:'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Entrando...' : 'Acessar Painel'}
        </button>

        <button onClick={() => nav('/')} style={{ width:'100%', marginTop:12, background:'transparent', border:'none', color:'#444', fontSize:12, cursor:'pointer', padding:8 }}>
          ← Voltar
        </button>
      </div>
    </div>
  );
}
