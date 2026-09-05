import { useNavigate } from 'react-router-dom';
import logoDark from '../assets/logo-tb-dark.png';
import logoLight from '../assets/logo-tb-light.png';

const stats = [
  { value: 'R$ 30M+', label: 'em dívidas renegociadas' },
  { value: 'R$ 15M+', label: 'em patrimônio administrado' },
  { value: '97%',     label: 'de satisfação dos clientes' },
  { value: '+2.500',  label: 'famílias atendidas' },
];

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
        <button onClick={() => nav('/login')} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'var(--primary)', color:'#fff', border:'none', borderRadius:10, padding:'12px 10px', fontSize:14, fontWeight:700, cursor:'pointer' }}>
          <i className="mdi mdi-handshake" /> Parceiros
        </button>
        <button onClick={() => nav('/recomendacoes')} style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'transparent', border:'2px solid var(--border)', borderRadius:10, padding:'12px 10px', fontSize:14, fontWeight:700, color:'var(--text-primary)', cursor:'pointer' }}>
          <i className="mdi mdi-share-variant" /> Área de Recomendados
        </button>
      </div>

      {/* HERO */}
      <div style={{ padding:'32px 16px 0' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--orange-light)', border:'1px solid var(--orange-border)', borderRadius:999, padding:'5px 12px', fontSize:10, fontWeight:600, color:'var(--primary)', letterSpacing:1, marginBottom:16 }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--primary)', display:'inline-block' }} />
          ASSESSORIA FINANCEIRA PESSOAL
        </div>
        <h1 style={{ fontSize:'clamp(26px,6vw,34px)', fontWeight:800, lineHeight:1.2, marginBottom:16, color:'var(--text-primary)' }}>
          Sua dívida tem solução.<br />
          <span style={{ color:'var(--primary)' }}>Sua vida financeira tem futuro.</span>
        </h1>
        <p style={{ fontSize:15, color:'var(--text-secondary)', lineHeight:1.7, marginBottom:24 }}>
          A TB Finance já ajudou milhares de brasileiros a sair do vermelho, renegociar dívidas e organizar as finanças de vez. Nossos parceiros fazem parte dessa transformação.
        </p>
      </div>

      {/* STATS */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, padding:'0 16px 32px' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: i === 0 ? 'var(--primary)' : 'var(--surface)', borderRadius:16, padding:'18px 14px', textAlign:'center' }}>
            <div style={{ fontSize:24, fontWeight:800, color: i === 0 ? '#fff' : 'var(--primary)', marginBottom:4 }}>{s.value}</div>
            <div style={{ fontSize:11, color: i === 0 ? 'rgba(255,255,255,0.85)' : 'var(--text-secondary)', fontWeight:500, lineHeight:1.4 }}>{s.label}</div>
          </div>
        ))}
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
          ].map((m, i) => (
            <div key={i} style={{ background:'var(--surface)', borderRadius:12, padding:14 }}>
              <div style={{ fontSize:11, color:'var(--text-secondary)', marginBottom:4 }}>{m.label}</div>
              <div style={{ fontSize:22, fontWeight:800, color: m.valueColor || 'var(--text-primary)' }}>{m.value}</div>
              <div style={{ fontSize:11, marginTop:4, color: m.subColor }}>{m.sub}</div>
            </div>
          ))}
        </div>
        {[
          { initials:'AM', name:'Ana Mendes',   status:'Pago',        color:'#E8440A', bg:'#DCFCE7', tc:'#16A34A' },
          { initials:'CR', name:'Carlos Rocha', status:'A Receber',   color:'#6B7280', bg:'#FEF3C7', tc:'#D97706' },
          { initials:'FS', name:'Fernanda S.',  status:'Inadimplente',color:'#111',    bg:'#FEE2E2', tc:'#DC2626' },
        ].map((c, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderTop:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:c.color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:10, fontWeight:700 }}>{c.initials}</div>
              <span style={{ fontSize:13, fontWeight:500 }}>{c.name}</span>
            </div>
            <span style={{ padding:'3px 10px', borderRadius:999, fontSize:11, fontWeight:600, background:c.bg, color:c.tc }}>{c.status}</span>
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
