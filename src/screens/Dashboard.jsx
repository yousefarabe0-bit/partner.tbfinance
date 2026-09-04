import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import { clients, history } from '../data/mockData';

export default function Dashboard() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const doLogout = () => { logout(); nav('/'); };

  return (
    <div style={{ background:'var(--surface)', minHeight:'100vh' }}>
      {/* HEADER */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:16, position:'sticky', top:0, background:'var(--surface)', zIndex:50, borderBottom:'1px solid var(--border)' }}>
        <div>
          <button onClick={doLogout} style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-secondary)', fontSize:13, background:'none', border:'none', marginBottom:4 }}>
            <i className="mdi mdi-arrow-left" style={{ fontSize:16 }} /> Início
          </button>
          <div style={{ fontSize:20, fontWeight:700 }}>Painel do Parceiro</div>
          <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>
            Setembro 2025 · Próximo repasse: <span style={{ color:'var(--primary)', fontWeight:600 }}>15/09/2025</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, position:'relative' }}>
          <div style={{ width:38, height:38, borderRadius:12, border:'1px solid var(--border)', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', cursor:'pointer' }}>
            <i className="mdi mdi-bell-outline" style={{ color:'var(--text-secondary)', fontSize:20 }} />
            <div style={{ position:'absolute', top:-3, right:-3, width:16, height:16, borderRadius:'50%', background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'#fff' }}>2</div>
          </div>
          <div onClick={() => setShowMenu(!showMenu)} style={{ display:'flex', alignItems:'center', gap:6, background:'#fff', border:'1px solid var(--border)', borderRadius:12, padding:'6px 10px', cursor:'pointer' }}>
            <Avatar initials={user?.initials ?? 'RS'} color="var(--primary)" size={28} />
            <span style={{ fontSize:13, fontWeight:500 }}>{user?.name ?? 'Ricardo Silva'}</span>
            <i className="mdi mdi-chevron-down" style={{ color:'var(--text-muted)', fontSize:16 }} />
          </div>
          {showMenu && (
            <div style={{ position:'absolute', right:0, top:'calc(100% + 8px)', background:'#fff', border:'1px solid var(--border)', borderRadius:10, padding:4, boxShadow:'0 4px 16px rgba(0,0,0,.12)', zIndex:200, minWidth:140 }}>
              <div onClick={doLogout} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', cursor:'pointer', borderRadius:8, fontSize:13, fontWeight:600, color:'var(--error)' }}>
                <i className="mdi mdi-logout" /> Sair
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding:16 }}>
        {/* INFO BANNER */}
        <div style={{ display:'flex', alignItems:'center', gap:12, background:'var(--secondary)', borderRadius:16, padding:16, marginBottom:16 }}>
          <div style={{ width:40, height:40, borderRadius:12, background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <i className="mdi mdi-handshake" style={{ color:'#fff', fontSize:20 }} />
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>Você é parceiro oficial da TB Finance</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.5, marginTop:2 }}>Você pode se apresentar como quem oferece assessoria financeira pessoal e de renegociação de dívidas em parceria com a TB Finance.</div>
          </div>
        </div>

        {/* KPI GRID */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
          {[
            { label:'CLIENTES ATIVOS', value:'12', sub:'+2 este mês', subColor:'var(--success)', icon:'mdi-account-group' },
            { label:'TOTAL CONTRATOS', value:'R$ 26.400', sub:'Valor anual somado', subColor:'var(--text-secondary)', icon:'mdi-file-document-outline', valueSize:18 },
            { label:'RECORRÊNCIA (7%)', value:'R$ 1.848', sub:'7% de R$ 26.400/ano', subColor:'var(--text-secondary)', icon:'mdi-percent', valueColor:'var(--primary)' },
            { label:'PRÓXIMO REPASSE', value:'15/09', sub:'Em 11 dias · R$ 1.848', subColor:'var(--primary)', icon:'mdi-calendar-check', highlight:true },
          ].map((k,i) => (
            <div key={i} style={{ background:'#fff', border:`${k.highlight ? 2 : 1}px solid ${k.highlight ? 'var(--primary)' : 'var(--border)'}`, borderRadius:16, padding:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ fontSize:10, fontWeight:700, color: k.highlight ? 'var(--primary)' : 'var(--text-secondary)', letterSpacing:0.5 }}>{k.label}</span>
                <div style={{ width:32, height:32, borderRadius:10, background: k.highlight ? 'var(--primary)' : 'var(--orange-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <i className={`mdi ${k.icon}`} style={{ color: k.highlight ? '#fff' : 'var(--primary)', fontSize:16 }} />
                </div>
              </div>
              <div style={{ fontSize: k.valueSize || 24, fontWeight:800, color: k.valueColor || 'var(--text-primary)', marginBottom:4 }}>{k.value}</div>
              <div style={{ fontSize:11, fontWeight:500, color: k.subColor }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* CLIENTS */}
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, marginBottom:16, overflow:'hidden' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
            <div><div style={{ fontSize:15, fontWeight:700 }}>Meus Clientes</div><div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>12 clientes vinculados à sua carteira</div></div>
            <button style={{ fontSize:12, fontWeight:600, color:'var(--primary)', background:'none', border:'none' }}>Ver todos</button>
          </div>
          {clients.map((c,i) => (
            <div key={c.id} style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                <Avatar initials={c.initials} color={c.avatarColor} size={34} />
                <div><div style={{ fontSize:14, fontWeight:600 }}>{c.name}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}>{c.email}</div></div>
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:10 }}>
                {[['Fechamento', c.date], ['Contrato', c.contractValue], ['Comissão', c.commission]].map(([l,v]) => (
                  <div key={l}>
                    <div style={{ fontSize:10, color:'var(--text-secondary)', marginBottom:2 }}>{l}</div>
                    <div style={{ fontSize:13, fontWeight:700 }}>{v}</div>
                  </div>
                ))}
                <StatusBadge status={c.status} />
              </div>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'var(--surface)' }}>
            <span style={{ fontSize:11, color:'var(--text-secondary)' }}>Exibindo 5 de 12 clientes</span>
            <button style={{ fontSize:12, fontWeight:600, color:'var(--primary)', background:'none', border:'none' }}>Ver todos →</button>
          </div>
        </div>

        {/* REPASSE */}
        <div style={{ background:'var(--primary)', borderRadius:16, padding:18, marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10 }}>
            <i className="mdi mdi-calendar-check" style={{ color:'rgba(255,255,255,0.8)', fontSize:16 }} />
            <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.8)', letterSpacing:1 }}>PRÓXIMO REPASSE</span>
          </div>
          <div style={{ fontSize:36, fontWeight:800, color:'#fff', marginBottom:4 }}>R$ 1.848</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.8)' }}>Previsto para <strong style={{ color:'#fff' }}>15/09/2025</strong></div>
          <div style={{ height:1, background:'rgba(255,255,255,0.2)', margin:'12px 0' }} />
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', lineHeight:1.5 }}>Repasses ocorrem todo dia 15 de cada mês, referentes aos clientes com status Pago.</div>
        </div>

        {/* COMMISSIONS */}
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, marginBottom:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}><div style={{ fontSize:15, fontWeight:700 }}>Comissões</div></div>
          <div style={{ padding:16 }}>
            {[
              { label:'A Receber (Pago)', value:'R$ 1.596', color:'var(--primary)', dotColor:'var(--primary)' },
              { label:'Aguardando (Não Pago)', value:'R$ 252', color:'var(--text-primary)', dotColor:'var(--warning)' },
              { label:'Inadimplentes (suspenso)', value:'R$ 126', color:'var(--text-muted)', dotColor:'var(--error)' },
            ].map((c,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:8, height:8, borderRadius:'50%', background:c.dotColor, flexShrink:0 }} />
                  <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{c.label}</span>
                </div>
                <span style={{ fontSize:14, fontWeight:700, color:c.color }}>{c.value}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:12, marginTop:4, borderTop:'1px solid var(--border)' }}>
              <span style={{ fontSize:12, fontWeight:700 }}>Total Potencial/mês</span>
              <span style={{ fontSize:14, fontWeight:800, color:'var(--primary)' }}>R$ 1.974</span>
            </div>
          </div>
        </div>

        {/* HISTORY */}
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, marginBottom:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ fontSize:15, fontWeight:700 }}>Histórico de Repasses</div>
            <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>Repasses mensais realizados no dia 15</div>
          </div>
          {history.map((h,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', padding:'12px 16px', borderBottom:'1px solid var(--border)', gap:10 }}>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:600 }}>{h.month}</div>
                <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>{h.date}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontSize:14, fontWeight:700 }}>{h.value}</div>
                <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>{h.clients} pagantes</div>
              </div>
              <StatusBadge status={h.status} style={{ marginLeft:10 }} />
            </div>
          ))}
        </div>
        <div style={{ height:32 }} />
      </div>
    </div>
  );
}
