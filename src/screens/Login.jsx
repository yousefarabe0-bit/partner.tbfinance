import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoLight from '../assets/logo-tb-light.png';

export default function Login() {
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
      else nav('/dashboard');
    }, 400);
  };

  return (
    <div>
      {/* HERO DARK */}
      <div style={{ background:'var(--secondary)', padding:'24px 16px 32px' }}>
        <img src={logoLight} style={{ height:28, objectFit:'contain', marginBottom:24 }} alt="TB Finance" />
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(232,68,10,0.2)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:999, padding:'5px 12px', fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.8)', letterSpacing:1, marginBottom:16 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--primary)', display:'inline-block' }} />
          ÁREA EXCLUSIVA DE PARCEIROS
        </div>
        <h1 style={{ fontSize:26, fontWeight:800, color:'#fff', lineHeight:1.3, marginBottom:12 }}>
          Bem-vindo de volta ao seu painel de <span style={{ color:'var(--primary)' }}>parceria.</span>
        </h1>
        <p style={{ fontSize:14, color:'var(--text-muted)', lineHeight:1.6, marginBottom:16 }}>
          Acompanhe seus clientes, comissões e repasses mensais. Tudo em um só lugar.
        </p>
        {[
          { icon:'mdi-percent', title:'7% de comissão recorrente', desc:'Sobre o contrato anual de cada cliente' },
          { icon:'mdi-calendar-check', title:'Repasse garantido todo dia 15', desc:'Pontualidade e transparência nos pagamentos' },
          { icon:'mdi-chart-bar', title:'Painel completo com relatórios', desc:'Histórico de clientes, comissões e status' },
        ].map((b, i) => (
          <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:12, marginBottom:14 }}>
            <div style={{ width:36, height:36, borderRadius:8, background:'rgba(232,68,10,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <i className={`mdi ${b.icon}`} style={{ color:'var(--primary)', fontSize:16 }} />
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{b.title}</div>
              <div style={{ fontSize:11, color:'var(--text-secondary)' }}>{b.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* FORM */}
      <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:'24px 16px 48px', marginTop:-8 }}>
        <button onClick={() => nav('/')} style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-secondary)', fontSize:13, background:'none', border:'none', marginBottom:24, cursor:'pointer' }}>
          <i className="mdi mdi-arrow-left" style={{ fontSize:16 }} /> Voltar para o início
        </button>

        <h2 style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>Entrar na área de parceiros</h2>
        <p style={{ fontSize:13, color:'var(--text-secondary)', marginBottom:24 }}>Use o e-mail e senha enviados pela TB Finance.</p>

        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:13, fontWeight:500, display:'block', marginBottom:8 }}>E-mail</label>
          <div style={{ display:'flex', alignItems:'center', border:'1.5px solid var(--border)', borderRadius:10 }}>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doLogin()}
              type="email"
              placeholder="seu@email.com.br"
              style={{ flex:1, padding:'12px 14px', fontSize:14, border:'none', outline:'none', background:'transparent', width:'100%' }}
            />
            <i className="mdi mdi-email-outline" style={{ paddingRight:14, color:'var(--text-muted)', fontSize:18 }} />
          </div>
        </div>

        <div style={{ marginBottom:16 }}>
          <label style={{ fontSize:13, fontWeight:500, display:'block', marginBottom:8 }}>Senha</label>
          <div style={{ display:'flex', alignItems:'center', border:'1.5px solid var(--border)', borderRadius:10 }}>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doLogin()}
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              style={{ flex:1, padding:'12px 14px', fontSize:14, border:'none', outline:'none', background:'transparent', width:'100%' }}
            />
            <button onClick={() => setShowPass(!showPass)} style={{ paddingRight:14, background:'none', border:'none', cursor:'pointer' }}>
              <i className={`mdi ${showPass ? 'mdi-eye-off' : 'mdi-eye'}`} style={{ color:'var(--text-muted)', fontSize:18 }} />
            </button>
          </div>
        </div>

        {error && (
          <div style={{ color:'var(--error)', fontSize:13, fontWeight:500, marginBottom:12 }}>{error}</div>
        )}

        <button
          onClick={doLogin}
          disabled={loading}
          style={{ width:'100%', background:'var(--primary)', color:'#fff', padding:14, borderRadius:10, border:'none', fontSize:15, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:24, opacity: loading ? 0.7 : 1, cursor:'pointer' }}
        >
          <i className="mdi mdi-lock" />
          {loading ? 'Entrando...' : 'Entrar no Painel'}
        </button>

        <div style={{ display:'flex', gap:10, background:'var(--orange-light)', border:'1px solid var(--orange-border)', borderRadius:12, padding:14, marginBottom:24 }}>
          <i className="mdi mdi-information" style={{ color:'var(--primary)', fontSize:16, marginTop:2, flexShrink:0 }} />
          <div>
            <div style={{ fontSize:12, fontWeight:700, marginBottom:4 }}>Ainda não é parceiro?</div>
            <p style={{ fontSize:11, color:'var(--text-secondary)', lineHeight:1.6 }}>O acesso é exclusivo por convite. Entre em contato pelo WhatsApp para solicitar.</p>
            <button onClick={() => window.open('https://wa.me/554831984042','_blank')} style={{ display:'flex', alignItems:'center', gap:6, marginTop:8, fontSize:12, fontWeight:700, color:'var(--primary)', background:'none', border:'none', cursor:'pointer' }}>
              <i className="mdi mdi-whatsapp" style={{ fontSize:14 }} /> Solicitar convite
            </button>
          </div>
        </div>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontSize:11, color:'var(--text-muted)' }}>
          <i className="mdi mdi-shield-check" style={{ color:'var(--primary)', fontSize:14 }} /> Conexão segura e criptografada
        </div>
      </div>
    </div>
  );
}
