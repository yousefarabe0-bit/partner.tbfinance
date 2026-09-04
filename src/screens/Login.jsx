import { useNavigate } from 'react-router-dom';
import logoLight from '../assets/logo-tb-light.png';

export default function Login() {
  const nav = useNavigate();

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
        ].map((b,i) => (
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

      {/* INFO */}
      <div style={{ background:'#fff', borderRadius:'20px 20px 0 0', padding:'24px 16px 48px', marginTop:-8 }}>
        <button onClick={() => nav('/')} style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-secondary)', fontSize:13, background:'none', border:'none', marginBottom:24 }}>
          <i className="mdi mdi-arrow-left" style={{ fontSize:16 }} /> Voltar para o início
        </button>

        <h2 style={{ fontSize:22, fontWeight:700, marginBottom:6 }}>Acesso por convite</h2>
        <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6, marginBottom:24 }}>
          O acesso ao painel de parceiros é exclusivo por convite da TB Finance. Se você já recebeu seu convite, use o link enviado por e-mail ou WhatsApp para criar sua conta.
        </p>

        <div style={{ display:'flex', gap:10, background:'var(--orange-light)', border:'1px solid var(--orange-border)', borderRadius:12, padding:14, marginBottom:24 }}>
          <i className="mdi mdi-information" style={{ color:'var(--primary)', fontSize:16, marginTop:2, flexShrink:0 }} />
          <div>
            <div style={{ fontSize:12, fontWeight:700, marginBottom:4 }}>Ainda não é parceiro?</div>
            <p style={{ fontSize:11, color:'var(--text-secondary)', lineHeight:1.6 }}>Entre em contato pelo WhatsApp para solicitar seu convite e fazer parte da rede TB Finance.</p>
            <button
              onClick={() => window.open('https://wa.me/554831984042', '_blank')}
              style={{ display:'flex', alignItems:'center', gap:6, marginTop:8, fontSize:12, fontWeight:700, color:'var(--primary)', background:'none', border:'none', cursor:'pointer' }}
            >
              <i className="mdi mdi-whatsapp" style={{ fontSize:16 }} /> Solicitar convite pelo WhatsApp
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
