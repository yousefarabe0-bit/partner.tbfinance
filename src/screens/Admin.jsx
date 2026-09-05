import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TABS = ['Parceiros', 'Status Pagamento', 'Comissões', 'Indicações'];

function EmptyState({ icon, title, desc }) {
  return (
    <div style={{ padding:'48px 16px', textAlign:'center' }}>
      <i className={`mdi ${icon}`} style={{ fontSize:48, color:'var(--border)', display:'block', marginBottom:12 }} />
      <div style={{ fontSize:14, fontWeight:600, color:'var(--text-secondary)', marginBottom:6 }}>{title}</div>
      <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6, maxWidth:260, margin:'0 auto' }}>{desc}</div>
    </div>
  );
}

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
          <button onClick={doLogout} style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-secondary)', fontSize:13, background:'none', border:'none', marginBottom:4, cursor:'pointer' }}>
            <i className="mdi mdi-arrow-left" style={{ fontSize:16 }} /> Início
          </button>
          <div style={{ fontSize:20, fontWeight:700 }}>Painel Administrativo</div>
          <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>Gerencie parceiros, clientes e comissões</div>
        </div>
        <button onClick={doLogout} style={{ width:38, height:38, borderRadius:10, border:'1px solid var(--border)', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--error)', flexShrink:0, cursor:'pointer' }}>
          <i className="mdi mdi-logout" style={{ fontSize:18 }} />
        </button>
      </div>

      {/* ACTIONS */}
      <div style={{ display:'flex', gap:8, padding:'16px 16px 0', overflowX:'auto' }}>
        {[
          { icon:'mdi-download', label:'Exportar CSV', type:'ghost' },
          { icon:'mdi-plus', label:'Novo Cliente', type:'primary' },
          { icon:'mdi-link', label:'Gerar Convite', type:'dark' },
        ].map(({ icon, label, type }) => (
          <button key={label} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 13px', borderRadius:8, fontSize:12, fontWeight:600, flexShrink:0, cursor:'pointer', background: type==='primary'?'var(--primary)':type==='dark'?'var(--secondary)':'#fff', color: type==='ghost'?'var(--text-secondary)':'#fff', border: type==='ghost'?'1px solid var(--border)':'none' }}>
            <i className={`mdi ${icon}`} style={{ fontSize:14 }} /> {label}
          </button>
        ))}
      </div>

      {/* SUMMARY ZERADO */}
      <div style={{ display:'flex', gap:10, padding:'16px', overflowX:'auto' }}>
        {[
          { label:'PARCEIROS ATIVOS', value:'0', sub:'Nenhum ainda' },
          { label:'CLIENTES TOTAIS', value:'0', sub:'Nenhum ainda' },
          { label:'INDICAÇÕES ATIVAS', value:'0', sub:'Nenhum ainda' },
          { label:'A REPASSAR', value:'R$ 0', sub:'Sem repasse previsto' },
        ].map((c, i) => (
          <div key={i} style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:14, padding:16, minWidth:140, flexShrink:0 }}>
            <span style={{ fontSize:9, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.5, display:'block', marginBottom:6 }}>{c.label}</span>
            <div style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)', marginBottom:4 }}>{c.value}</div>
            <div style={{ fontSize:11, fontWeight:500, color:'var(--text-muted)' }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* TABS */}
      <div style={{ display:'flex', gap:4, padding:4, background:'var(--surface-dark)', margin:'0 16px 16px', borderRadius:12, overflowX:'auto' }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setActiveTab(t)} style={{ padding:'8px 14px', borderRadius:8, fontSize:12, fontWeight:600, color: activeTab===t?'var(--primary)':'var(--text-secondary)', background: activeTab===t?'#fff':'transparent', border:'none', whiteSpace:'nowrap', cursor:'pointer', boxShadow: activeTab===t?'0 1px 4px rgba(0,0,0,.08)':undefined }}>
            {t}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div style={{ padding:'0 16px' }}>
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', marginBottom:16 }}>

          {activeTab === 'Parceiros' && (
            <>
              <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontSize:14, fontWeight:700 }}>Parceiros Cadastrados</div>
                <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>Gerencie seus parceiros ativos</div>
              </div>
              <EmptyState icon="mdi-account-group-outline" title="Nenhum parceiro ainda" desc="Use o botão 'Gerar Convite' para convidar seu primeiro parceiro." />
            </>
          )}

          {activeTab === 'Status Pagamento' && (
            <>
              <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontSize:14, fontWeight:700 }}>Status de Pagamento</div>
                <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>Controle de pagamentos dos clientes</div>
              </div>
              <EmptyState icon="mdi-cash-check" title="Nenhum pagamento registrado" desc="Os pagamentos aparecerão aqui após o cadastro dos primeiros clientes." />
            </>
          )}

          {activeTab === 'Comissões' && (
            <>
              <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontSize:14, fontWeight:700 }}>Repasses do Dia 15</div>
                <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>7% por parceiro sobre contratos ativos</div>
              </div>
              <EmptyState icon="mdi-currency-usd-off" title="Nenhuma comissão ainda" desc="As comissões serão calculadas automaticamente assim que houver clientes ativos." />
            </>
          )}

          {activeTab === 'Indicações' && (
            <>
              <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
                <div style={{ fontSize:14, fontWeight:700 }}>Indicações em Andamento</div>
                <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>Controle de descontos e promoção a parceiro</div>
              </div>
              <EmptyState icon="mdi-share-variant-outline" title="Nenhuma indicação ainda" desc="As indicações de clientes aparecerão aqui conforme forem registradas." />
            </>
          )}

        </div>
        <div style={{ height:32 }} />
      </div>
    </div>
  );
}
