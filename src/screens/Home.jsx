import { useNavigate } from 'react-router-dom';
import logoDark from '../assets/logo-tb-dark.png';
import logoLight from '../assets/logo-tb-light.png';

export default function Home() {
  const nav = useNavigate();
  return (
    <div style={{ background: '#fff' }}>
      {/* NAVBAR */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', borderBottom:'1px solid var(--border)', background:'#fff', position:'sticky', top:0, zIndex:100 }}>
        <img src={logoDark} style={{ height:28, objectFit:'contain' }} alt="TB Finance" />
      </nav>

      {/* TOP BUTTONS */}
      <div style={{ display:'flex', gap:10, padding:'14px 16px 0' }}>
        <button onClick={() => nav('/login')} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'var(--primary)', color:'#fff', border:'none', borderRadius:10, padding:'12px 10px', fontSize:14, fontWeight:700 }}>
          <i className="mdi mdi-handshake" /> Parceiros
        </button>
        <button onClick={() => nav('/recomendacoes')} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'transparent', border:'2px solid var(--border)', borderRadius:10, padding:'12px 10px', fontSize:14, fontWeight:700, color:'var(--text-primary)' }}>
          <i className="mdi mdi-share-variant" /> Área de Recomendados
        </button>
      </div>

      {/* HERO */}
      <div style={{ padding:'32px 16px 24px' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--orange-light)', border:'1px solid var(--orange-border)', borderRadius:999, padding:'5px 12px', fontSize:10, fontWeight:600, color:'var(--primary)', letterSpacing:1, marginBottom:16 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--primary)', display:'inline-block' }} />
          ASSESSORIA FINANCEIRA PESSOAL
        </div>
        <h1 style={{ fontSize:'clamp(24px,6vw,32px)', fontWeight:800, lineHeight:1.25, marginBottom:16 }}>
          Transforme sua <span style={{ color:'var(--primary)' }}>situação financeira</span> com quem entende do assunto.
        </h1>
        <p style={{ fontSize:16, color:'var(--text-secondary)', lineHeight:1.6, marginBottom:24 }}>
          A TB Finance oferece assessoria financeira personalizada e renegociação de dívidas para você retomar o controle da sua vida financeira.
        </p>
      </div>

      {/* PREVIEW CARD */}
      <div style={{ margin:'0 16px 32px', background:'#fff', border:'1px solid var(--border)', borderRadius:16, padding:16, position:'relative' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
          <div>
            <div style={{ fontSize:11, color:'var(--text-secondary)', fontWeight:500, textTransform:'uppercase', letterSpacing:0.5 }}>Painel do Parceiro</div>
            <div style={{ fontSize:18, fontWeight:700, marginTop:2 }}>Resumo do Mês</div>
          </div>
          <div style={{ background:'var(--orange-light)', padding:10, borderRadius:8 }}>
            <i className="mdi mdi-chart-line" style={{ color:'var(--primary)', fontSize:20 }} />
          </div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
          {[
            { label:'Clientes Ativos', value:'12', sub:'+2 este mês', subColor:'var(--success)' },
            { label:'Recorrência Mensal', value:'R$ 1.848', sub:'7% dos contratos', subColor:'var(--text-secondary)', valueColor:'var(--primary)' },
            { label:'Próximo Repasse', value:'Dia 15', sub:'11 dias', subColor:'var(--primary)' },
            { label:'Total Acumulado', value:'R$ 9.240', sub:'desde o início', subColor:'var(--success)' },
          ].map((m,i) => (
            <div key={i} style={{ background:'var(--surface)', borderRadius:12, padding:14 }}>
              <div style={{ fontSize:11, color:'var(--text-secondary)', marginBottom:4 }}>{m.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color: m.valueColor || 'var(--text-primary)' }}>{m.value}</div>
              <div style={{ fontSize:11, marginTop:4, color: m.subColor }}>{m.sub}</div>
            </div>
          ))}
        </div>
        {[
          { initials:'AM', name:'Ana Mendes', status:'Pago', color:'#E8440A', statusBg:'#DCFCE7', statusText:'#16A34A' },
          { initials:'CR', name:'Carlos Rocha', status:'A Receber', color:'#6B7280', statusBg:'#FEF3C7', statusText:'#D97706' },
          { initials:'FS', name:'Fernanda S.', status:'Inadimplente', color:'#111', statusBg:'#FEE2E2', statusText:'#DC2626' },
        ].map((c,i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderTop:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:c.color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:10, fontWeight:700 }}>{c.initials}</div>
              <span style={{ fontSize:13, fontWeight:500 }}>{c.name}</span>
            </div>
            <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:600, background:c.statusBg, color:c.statusText }}>{c.status}</span>
          </div>
        ))}
        <div style={{ position:'absolute', top:-12, right:-4, background:'var(--primary)', borderRadius:12, padding:'8px 12px' }}>
          <div style={{ fontSize:10, fontWeight:600, color:'rgba(255,255,255,0.9)' }}>Repasse garantido</div>
          <div style={{ fontSize:16, fontWeight:800, color:'#fff' }}>Todo dia 15</div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ padding:'24px 16px', textAlign:'center', background:'var(--secondary)' }}>
        <img src={logoLight} style={{ height:28, objectFit:'contain' }} alt="TB Finance" />
      </footer>
    </div>
  );
}
