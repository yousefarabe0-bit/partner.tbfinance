import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import StatusBadge from '../components/StatusBadge';
import { partners, referrals, adminPaymentClients, commissionReport } from '../data/mockData';

const TABS = ['Parceiros', 'Status Pagamento', 'Comissões', 'Indicações'];

export default function Admin() {
  const nav = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Parceiros');
  const doLogout = () => { logout(); nav('/'); };

  return (
    <div style={{ background:'var(--surface-dark)', minHeight:'100vh' }}>
      {/* BANNER */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, background:'var(--primary)', padding:6, position:'sticky', top:0, zIndex:100 }}>
        <i className="mdi mdi-shield-check" style={{ color:'#fff', fontSize:14 }} />
        <span style={{ fontSize:11, fontWeight:700, color:'#fff', letterSpacing:0.5 }}>PAINEL ADMINISTRATIVO TB FINANCE</span>
      </div>

      {/* HEADER */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:16, borderBottom:'1px solid var(--border)', background:'var(--surface-dark)', position:'sticky', top:33, zIndex:50 }}>
        <div>
          <button onClick={doLogout} style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-secondary)', fontSize:13, background:'none', border:'none', marginBottom:4 }}>
            <i className="mdi mdi-arrow-left" style={{ fontSize:16 }} /> Início
          </button>
          <div style={{ fontSize:20, fontWeight:700 }}>Painel Administrativo</div>
          <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2, lineHeight:1.5 }}>Setembro 2025 · <span style={{ color:'var(--primary)', fontWeight:600 }}>15/09/2025</span> · R$ 8.624 a repassar</div>
        </div>
        <button onClick={doLogout} style={{ width:38, height:38, borderRadius:10, border:'1px solid var(--border)', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--error)', flexShrink:0 }}>
          <i className="mdi mdi-logout" style={{ fontSize:18 }} />
        </button>
      </div>

      {/* ACTIONS */}
      <div style={{ display:'flex', gap:8, padding:'0 16px 16px', overflowX:'auto', marginTop:16 }}>
        {[['mdi-download','Exportar CSV','ghost'],['mdi-plus','Novo Cliente','primary'],['mdi-link','Gerar Convite','dark']].map(([icon,label,type]) => (
          <button key={label} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 13px', borderRadius:8, fontSize:12, fontWeight:600, flexShrink:0, background: type==='primary'?'var(--primary)':type==='dark'?'var(--secondary)':'#fff', color: type==='ghost'?'var(--text-secondary)':'#fff', border: type==='ghost'?'1px solid var(--border)':'none' }}>
            <i className={`mdi ${icon}`} style={{ fontSize:14 }} /> {label}
          </button>
        ))}
      </div>

      {/* ALERT */}
      <div style={{ display:'flex', alignItems:'center', gap:10, background:'var(--orange-light)', border:'1px solid var(--orange-border)', borderRadius:12, padding:14, margin:'0 16px 16px' }}>
        <div style={{ width:34, height:34, borderRadius:10, background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          <i className="mdi mdi-bell" style={{ color:'#fff', fontSize:16 }} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:700, color:'var(--primary)' }}>1 cliente para promover a parceiro</div>
          <div style={{ fontSize:11, color:'var(--text-secondary)', lineHeight:1.5, marginTop:2 }}>Marina Lima atingiu 5 fechamentos e deve ser promovida.</div>
        </div>
        <button style={{ background:'var(--primary)', borderRadius:8, padding:'6px 12px', fontSize:11, fontWeight:700, color:'#fff', border:'none', flexShrink:0 }}>Promover</button>
      </div>

      {/* SUMMARY */}
      <div style={{ display:'flex', gap:10, padding:'0 16px 16px', overflowX:'auto' }}>
        {[
          { label:'PARCEIROS ATIVOS', value:'8', sub:'+1 este mês', subColor:'var(--success)' },
          { label:'CLIENTES TOTAIS', value:'142', sub:'98 ativos', subColor:'var(--text-secondary)' },
          { label:'INDICAÇÕES ATIVAS', value:'23', sub:'1 vira parceiro', subColor:'var(--primary)' },
          { label:'A REPASSAR (SET)', value:'R$ 8.624', sub:'7% dos contratos', subColor:'var(--text-secondary)', valueColor:'var(--primary)' },
          { label:'PRÓXIMO REPASSE', value:'15/09', sub:'Em 11 dias', subColor:'var(--primary)', highlight:true },
        ].map((c,i) => (
          <div key={i} style={{ background:'#fff', border:`${c.highlight?2:1}px solid ${c.highlight?'var(--primary)':'var(--border)'}`, borderRadius:14, padding:16, minWidth:140, flexShrink:0 }}>
            <span style={{ fontSize:9, fontWeight:700, color: c.highlight?'var(--primary)':'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.5, display:'block', marginBottom:6 }}>{c.label}</span>
            <div style={{ fontSize:22, fontWeight:800, color: c.valueColor||'var(--text-primary)', marginBottom:4 }}>{c.value}</div>
            <div style={{ fontSize:11, fontWeight:500, color:c.subColor }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div style={{ display:'flex', gap:4, padding:4, background:'var(--surface-dark)', margin:'0 16px 16px', borderRadius:12, overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding:'8px 14px', borderRadius:8, fontSize:12, fontWeight:600, color: activeTab===t?'var(--primary)':'var(--text-secondary)', background: activeTab===t?'#fff':'transparent', border:'none', whiteSpace:'nowrap', boxShadow: activeTab===t?'0 1px 4px rgba(0,0,0,.08)':undefined }}>
            {t}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div style={{ padding:'0 16px' }}>
        {activeTab === 'Parceiros' && (
          <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', marginBottom:16 }}>
            <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontSize:14, fontWeight:700 }}>Parceiros Cadastrados</div>
              <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>8 parceiros ativos na plataforma</div>
            </div>
            {partners.map(p => (
              <div key={p.id} style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <Avatar initials={p.initials} color={p.avatarColor} size={34} />
                  <div><div style={{ fontSize:14, fontWeight:600 }}>{p.name}</div><div style={{ fontSize:11, color:'var(--text-muted)' }}>{p.email}</div></div>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:12 }}>
                  {[['Clientes', p.clients], ['Contratos', p.totalContracts], ['Comissão/mês', p.commission]].map(([l,v]) => (
                    <div key={l}><div style={{ fontSize:10, color:'var(--text-secondary)', marginBottom:2 }}>{l}</div><div style={{ fontSize:13, fontWeight:700, color: l==='Comissão/mês'?'var(--primary)':undefined }}>{v}</div></div>
                  ))}
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Status Pagamento' && (
          <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', marginBottom:16 }}>
            <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontSize:14, fontWeight:700 }}>Atualizar Status de Pagamento</div>
              <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>Alimentado pela equipe TB Finance</div>
            </div>
            {adminPaymentClients.map(c => (
              <div key={c.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <Avatar initials={c.initials} color={c.avatarColor} size={28} />
                  <div><div style={{ fontSize:12, fontWeight:600 }}>{c.name}</div><div style={{ fontSize:10, color:'var(--text-muted)' }}>{c.partner}</div></div>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
            <div style={{ padding:16 }}>
              <button style={{ width:'100%', background:'var(--primary)', color:'#fff', padding:'10px 16px', borderRadius:8, border:'none', fontSize:13, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                <i className="mdi mdi-content-save" style={{ fontSize:14 }} /> Salvar Alterações
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Comissões' && (
          <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', marginBottom:16 }}>
            <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontSize:14, fontWeight:700 }}>Repasses do Dia 15</div>
              <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>Setembro 2025 · 7% por parceiro</div>
            </div>
            {commissionReport.map(c => (
              <div key={c.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Avatar initials={c.initials} color={c.avatarColor} size={24} />
                  <span style={{ fontSize:12, fontWeight:600 }}>{c.name}</span>
                </div>
                <div style={{ display:'flex', gap:16 }}>
                  {[['Contratos', c.contracts, false], ['Comissão', c.commission, true]].map(([l,v,colored]) => (
                    <div key={l} style={{ textAlign:'right' }}>
                      <div style={{ fontSize:10, color:'var(--text-secondary)', marginBottom:2 }}>{l}</div>
                      <div style={{ fontSize:12, fontWeight:700, color: colored?'var(--primary)':undefined }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', background:'var(--surface)', borderTop:'2px solid var(--border)' }}>
              <span style={{ fontSize:12, fontWeight:700 }}>Total a Repassar</span>
              <span style={{ fontSize:15, fontWeight:800, color:'var(--primary)' }}>R$ 4.032</span>
            </div>
          </div>
        )}

        {activeTab === 'Indicações' && (
          <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', marginBottom:16 }}>
            <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
              <div style={{ fontSize:14, fontWeight:700 }}>Indicações em Andamento</div>
              <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>Controle de descontos e promoção a parceiro</div>
            </div>
            {referrals.map(r => (
              <div key={r.id} style={{ padding:'12px 16px', borderBottom:'1px solid var(--border)', background: r.highlight?'#FFF8F6':undefined }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                  <Avatar initials={r.initials} color={r.avatarColor} size={28} />
                  <div><div style={{ fontSize:13, fontWeight:700 }}>{r.name}</div><div style={{ fontSize:10, color:'var(--text-muted)' }}>{r.email}</div></div>
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:12 }}>
                  <div><div style={{ fontSize:10, color:'var(--text-secondary)', marginBottom:2 }}>Fechamentos</div><div style={{ fontSize:14, fontWeight:800, color: r.highlight?'var(--primary)':undefined }}>{r.closings}</div></div>
                  <div><div style={{ fontSize:10, color:'var(--text-secondary)', marginBottom:2 }}>Desconto</div><div style={{ fontSize:12, fontWeight:700 }}>{r.discount}</div></div>
                  <div><div style={{ fontSize:10, color:'var(--text-secondary)', marginBottom:2 }}>Último</div><div style={{ fontSize:11, color:'var(--text-secondary)' }}>{r.lastReferred}</div></div>
                  <StatusBadge status={r.status} />
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ height:32 }} />
      </div>
    </div>
  );
}
