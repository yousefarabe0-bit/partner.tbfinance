import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

export default function Dashboard() {
  const nav = useNavigate();
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const doLogout = () => { logout(); nav('/'); };

  return (
    <div style={{ background:'var(--surface)', minHeight:'100vh' }}>
      {/* HEADER */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:16, width:'100%', position:'sticky', top:0, background:'var(--surface)', zIndex:50, borderBottom:'1px solid var(--border)' }}>
        <div>
          <button onClick={doLogout} style={{ display:'flex', alignItems:'center', gap:6, color:'var(--text-secondary)', fontSize:13, background:'none', border:'none', marginBottom:4, cursor:'pointer' }}>
            <i className="mdi mdi-arrow-left" style={{ fontSize:16 }} /> Início
          </button>
          <div style={{ fontSize:20, fontWeight:700 }}>Painel do Parceiro</div>
          <div style={{ fontSize:12, color:'var(--text-secondary)', marginTop:2 }}>
            Bem-vindo, <span style={{ color:'var(--primary)', fontWeight:600 }}>{user?.name}</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, position:'relative', flexShrink:0 }}>
          <div onClick={() => setShowMenu(!showMenu)} style={{ display:'flex', alignItems:'center', gap:6, background:'#fff', border:'1px solid var(--border)', borderRadius:12, padding:'6px 10px', cursor:'pointer' }}>
            <Avatar initials={user?.initials ?? 'YT'} color="var(--primary)" size={28} />
            <span style={{ fontSize:13, fontWeight:500, maxWidth:80, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name}</span>
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
            <div style={{ fontSize:11, color:'var(--text-muted)', lineHeight:1.5, marginTop:2 }}>Sua conta está ativa. Em breve seus clientes e comissões aparecerão aqui.</div>
          </div>
        </div>

        {/* KPI GRID ZERADO */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
          {[
            { label:'CLIENTES ATIVOS', value:'0', sub:'Nenhum cliente ainda', subColor:'var(--text-muted)', icon:'mdi-account-group' },
            { label:'TOTAL CONTRATOS', value:'R$ 0', sub:'Valor anual somado', subColor:'var(--text-muted)', icon:'mdi-file-document-outline', valueSize:18 },
            { label:'RECORRÊNCIA (7%)', value:'R$ 0', sub:'7% dos contratos', subColor:'var(--text-muted)', icon:'mdi-percent', valueColor:'var(--text-muted)' },
            { label:'PRÓXIMO REPASSE', value:'—', sub:'Sem repasse previsto', subColor:'var(--text-muted)', icon:'mdi-calendar-check' },
          ].map((k, i) => (
            <div key={i} style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, padding:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ fontSize:10, fontWeight:700, color:'var(--text-secondary)', letterSpacing:0.5 }}>{k.label}</span>
                <div style={{ width:32, height:32, borderRadius:10, background:'var(--orange-light)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <i className={`mdi ${k.icon}`} style={{ color:'var(--primary)', fontSize:16 }} />
                </div>
              </div>
              <div style={{ fontSize: k.valueSize || 24, fontWeight:800, color: k.valueColor || 'var(--text-primary)', marginBottom:4 }}>{k.value}</div>
              <div style={{ fontSize:11, fontWeight:500, color: k.subColor }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* CLIENTES VAZIO */}
        <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:16, marginBottom:16, overflow:'hidden' }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ fontSize:15, fontWeight:700 }}>Meus Clientes</div>
            <div style={{ fontSize:11, color:'var(--text-secondary)', marginTop:2 }}>Clientes vinculados à sua carteira</div>
          </div>
          <div style={{ padding:'40px 16px', textAlign:'center' }}>
            <i className="mdi mdi-account-group-outline" style={{ fontSize:48, color:'var(--border)', display:'block', marginBottom:12 }} />
            <div style={{ fontSize:14, fontWeight:600, color:'var(--text-secondary)', marginBottom:6 }}>Nenhum cliente ainda</div>
            <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>Seus clientes aparecerão aqui assim que forem cadastrados pela equipe TB Finance.</div>
          </div>
        </div>

        {/* REPASSE VAZIO */}
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:16, padding:18, marginBottom:16, textAlign:'center' }}>
          <i className="mdi mdi-calendar-clock" style={{ fontSize:40, color:'var(--border)', display:'block', marginBottom:12 }} />
          <div style={{ fontSize:14, fontWeight:600, color:'var(--text-secondary)', marginBottom:4 }}>Nenhum repasse previsto</div>
          <div style={{ fontSize:12, color:'var(--text-muted)', lineHeight:1.6 }}>Os repasses serão exibidos aqui após o primeiro cliente ser cadastrado.</div>
        </div>

        {/* DÚVIDAS */}
        <div style={{ display:'flex', gap:10, background:'var(--orange-light)', border:'1px solid var(--orange-border)', borderRadius:12, padding:14, marginBottom:16 }}>
          <i className="mdi mdi-whatsapp" style={{ color:'var(--primary)', fontSize:20, marginTop:2, flexShrink:0 }} />
          <div>
            <div style={{ fontSize:12, fontWeight:700, marginBottom:4 }}>Tem dúvidas?</div>
            <p style={{ fontSize:11, color:'var(--text-secondary)', lineHeight:1.6 }}>Fale com a equipe TB Finance pelo WhatsApp para cadastrar clientes e começar a gerar comissões.</p>
            <button onClick={() => window.open('https://wa.me/554831984042','_blank')} style={{ display:'flex', alignItems:'center', gap:6, marginTop:8, fontSize:12, fontWeight:700, color:'var(--primary)', background:'none', border:'none', cursor:'pointer' }}>
              Falar no WhatsApp <i className="mdi mdi-arrow-right" style={{ fontSize:14 }} />
            </button>
          </div>
        </div>

        <div style={{ height:32 }} />
      </div>
    </div>
  );
}
