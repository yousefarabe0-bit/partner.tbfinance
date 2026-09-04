import { useNavigate } from 'react-router-dom';
import logoDark from '../assets/logo-tb-dark.png';
import logoLight from '../assets/logo-tb-light.png';

export default function Recomendacoes() {
  const nav = useNavigate();

  const indicarWpp = () => {
    const msg = encodeURIComponent('Eaiii, contratei uma assessoria financeira para organizar meu financeiro e renegociar minhas dívidas, nome é TB Finance, quero recomendar para você, acredito que pode ser interessante, aqui o link para chamar meu consultor: https://wa.me/554831984042?text=Quero%20conhecer%20a%20TB%20Finance%2C%20fui%20recomendado%20pelo%20(escreva%20o%20nome%20de%20quem%20te%20recomendou)');
    window.open('https://wa.me/?text=' + msg, '_blank');
  };

  return (
    <div>
      {/* NAVBAR */}
      <nav style={{ display:'flex', alignItems:'center', gap:10, padding:'14px 16px', borderBottom:'1px solid var(--border)', background:'#fff', position:'sticky', top:0, zIndex:100 }}>
        <button onClick={() => nav('/')} style={{ width:34, height:34, borderRadius:10, border:'1px solid var(--border)', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-secondary)', fontSize:18, flexShrink:0 }}>
          <i className="mdi mdi-arrow-left" />
        </button>
        <img src={logoDark} style={{ height:28, objectFit:'contain' }} alt="TB Finance" />
      </nav>

      {/* HERO */}
      <div style={{ padding:'32px 16px 24px' }}>
        <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:'var(--orange-light)', border:'1px solid var(--orange-border)', borderRadius:999, padding:'5px 12px', fontSize:10, fontWeight:600, color:'var(--primary)', letterSpacing:1, marginBottom:16 }}>
          <i className="mdi mdi-share-variant" style={{ fontSize:12 }} /> PROGRAMA DE RECOMENDAÇÕES
        </div>
        <h1 style={{ fontSize:32, fontWeight:800, lineHeight:1.25, marginBottom:16 }}>
          Indique, economize e <span style={{ color:'var(--primary)' }}>ganhe mais.</span>
        </h1>
        <p style={{ fontSize:15, color:'var(--text-secondary)', lineHeight:1.6 }}>
          Cada amigo ou familiar que você indicar e fechar com a TB Finance dá direito a descontos no seu próximo pagamento. Quem indica muito, vira parceiro com renda mensal!
        </p>
      </div>

      {/* TIMELINE */}
      <div style={{ background:'var(--surface)', padding:'48px 16px' }}>
        <span style={{ fontSize:11, fontWeight:600, color:'var(--primary)', letterSpacing:2, textAlign:'center', display:'block', marginBottom:8 }}>Como funciona</span>
        <h2 style={{ fontSize:24, fontWeight:700, textAlign:'center', marginBottom:8 }}>Sua jornada de indicador</h2>
        <p style={{ fontSize:14, color:'var(--text-secondary)', textAlign:'center', lineHeight:1.6, marginBottom:24 }}>Cada fechamento conta. Progresso automático e sem burocracia.</p>

        <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
          {[
            { type:'icon', icon:'mdi-account-plus', label:'Você', title:'Começa agora', desc:'Indique amigos e familiares para a TB Finance pelo WhatsApp.', dark:true },
            { type:'num', num:'1', label:'1 fechamento', title:'25% OFF', desc:'25% de desconto no seu próximo boleto ou Pix.', highlight:true },
            { type:'num', num:'2', label:'2 fechamentos', title:'50% OFF', desc:'Metade do seu pagamento eliminado no próximo boleto/Pix.' },
            { type:'num', num:'4', label:'4 fechamentos', title:'100% OFF', desc:'Você não paga o próximo boleto/Pix. Gratuíto!' },
            { type:'icon', icon:'mdi-star', label:'5+ fechamentos', title:'Parceiro!', desc:'Você vira parceiro e embaixador com recorrência mensal de 7% por cliente.', dark:true, star:true },
          ].map((s, i) => (
            <div key={i} style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'center', marginBottom:4 }}>
              {i > 0 && <div style={{ width:3, height:32, background: i<=2?'var(--primary)':'var(--border)' }} />}
              <div style={{ width:64, height:64, borderRadius:'50%', background: s.dark?'var(--secondary)':'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10, fontSize:26, fontWeight:800, color: s.star?'var(--primary)':'#fff' }}>
                {s.type==='icon' ? <i className={`mdi ${s.icon}`} style={{ fontSize:24, color: s.star?'var(--primary)':'#fff' }} /> : s.num}
              </div>
              <div style={{ background: s.dark?'var(--secondary)':'#fff', border: s.highlight?'2px solid var(--primary)':'1px solid var(--border)', borderRadius:16, padding:16, width:'100%' }}>
                <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:0.5, marginBottom:4, color:'var(--primary)' }}>{s.label}</div>
                <div style={{ fontSize:20, fontWeight:800, marginBottom:6, color: s.dark?'#fff':'var(--text-primary)' }}>{s.title}</div>
                <div style={{ fontSize:12, color: s.dark?'var(--text-muted)':'var(--text-secondary)', lineHeight:1.6 }}>{s.desc}</div>
                {!s.dark && <div style={{ borderTop:'1px solid var(--border)', marginTop:10, paddingTop:10, fontSize:11, fontWeight:600, color:'var(--primary)' }}>Automático após o fechamento</div>}
                {s.dark && s.star && <div style={{ borderTop:'1px solid rgba(255,255,255,0.1)', marginTop:10, paddingTop:10, fontSize:11, fontWeight:600, color:'var(--primary)' }}>Renda mensal recorrente</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RULES */}
      <div style={{ padding:'48px 16px' }}>
        <span style={{ fontSize:11, fontWeight:600, color:'var(--primary)', letterSpacing:2, textAlign:'center', display:'block', marginBottom:8 }}>Regras claras</span>
        <h2 style={{ fontSize:24, fontWeight:700, textAlign:'center', marginBottom:24 }}>Como os descontos funcionam na prática</h2>
        {[
          { icon:'mdi-lightning-bolt', title:'Desconto automático', desc:'Assim que o seu indicado fechar com a TB Finance, o desconto já é aplicado automaticamente.' },
          { icon:'mdi-calendar-today', title:'Vale só no próximo pagamento', desc:'O desconto se aplica apenas ao seu próximo boleto ou Pix. Não é cumulativo entre períodos.' },
          { icon:'mdi-cash-fast', title:'Já pagou? Recebe via Pix', desc:'Se você já pagou integralmente e um indicado fechar, receberá o valor proporcional via Pix.' },
          { icon:'mdi-arrow-top-right', title:'5+ indicações = vira parceiro', desc:'Com 5 ou mais clientes fechados, você é promovido automaticamente a parceiro/embaixador da TB Finance.' },
        ].map((r,i) => (
          <div key={i} style={{ display:'flex', gap:12, marginBottom:18 }}>
            <div style={{ width:38, height:38, borderRadius:10, background:'var(--orange-light)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:2 }}>
              <i className={`mdi ${r.icon}`} style={{ color:'var(--primary)', fontSize:16 }} />
            </div>
            <div>
              <div style={{ fontSize:15, fontWeight:700, marginBottom:4 }}>{r.title}</div>
              <p style={{ fontSize:13, color:'var(--text-secondary)', lineHeight:1.6 }}>{r.desc}</p>
            </div>
          </div>
        ))}

        {/* DISCOUNT TABLE */}
        <div style={{ border:'1px solid var(--border)', borderRadius:16, overflow:'hidden', marginTop:16 }}>
          <div style={{ background:'var(--secondary)', padding:16 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#fff' }}>Tabela de Descontos</div>
            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>Por número de clientes fechados</div>
          </div>
          {[
            { num:'1', label:'1 fechamento', benefit:'25% OFF', when:'Próximo pagamento' },
            { num:'2', label:'2 fechamentos', benefit:'50% OFF', when:'Próximo pagamento' },
            { num:'4', label:'4 fechamentos', benefit:'100% OFF', when:'Gratuíto!' },
            { num:'★', label:'5+ fechamentos', benefit:'Parceiro!', when:'Renda mensal', dark:true },
          ].map((row,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', padding:'14px 16px', borderBottom:'1px solid var(--border)', background: row.dark?'var(--secondary)':'#fff' }}>
              <div style={{ flex:1, display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:30, height:30, borderRadius:8, background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', flexShrink:0 }}>{row.num}</div>
                <span style={{ fontSize:13, fontWeight:600, color: row.dark?'#fff':undefined }}>{row.label}</span>
              </div>
              <span style={{ fontSize:16, fontWeight:800, color:'var(--primary)', width:90, textAlign:'center' }}>{row.benefit}</span>
              <span style={{ fontSize:11, color: row.dark?'var(--text-muted)':'var(--text-secondary)', width:80, textAlign:'right' }}>{row.when}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background:'var(--surface)', padding:'48px 16px', textAlign:'center' }}>
        <div style={{ width:56, height:56, borderRadius:16, background:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
          <i className="mdi mdi-share-variant" style={{ color:'#fff', fontSize:24 }} />
        </div>
        <h2 style={{ fontSize:26, fontWeight:700, marginBottom:8 }}>Pronto para indicar?</h2>
        <p style={{ fontSize:14, color:'var(--text-secondary)', lineHeight:1.6, marginBottom:24, maxWidth:360, margin:'0 auto 24px' }}>
          Entre em contato com a TB Finance pelo WhatsApp para registrar suas indicações e acompanhar seus descontos.
        </p>
        <button onClick={indicarWpp} style={{ display:'inline-flex', alignItems:'center', gap:8, background:'#25D366', color:'#fff', fontSize:15, fontWeight:700, padding:'14px 24px', borderRadius:10, border:'none' }}>
          <i className="mdi mdi-whatsapp" style={{ fontSize:20 }} /> Indicar pelo WhatsApp
        </button>
        <br />
        <button onClick={() => nav('/')} style={{ border:'1px solid var(--border)', background:'transparent', color:'var(--text-secondary)', fontSize:13, fontWeight:600, padding:'11px 20px', borderRadius:12, marginTop:12 }}>
          Voltar para o início
        </button>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontSize:11, color:'var(--text-muted)', marginTop:16 }}>
          <i className="mdi mdi-shield-check" style={{ color:'var(--primary)', fontSize:14 }} /> Seus dados são tratados com total segurança e privacidade pela TB Finance.
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ padding:'24px 16px', textAlign:'center', background:'var(--secondary)' }}>
        <img src={logoLight} style={{ height:28, objectFit:'contain', marginBottom:8 }} alt="TB Finance" />
        <p style={{ fontSize:11, color:'var(--text-secondary)' }}>© 2025 TB Finance. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
