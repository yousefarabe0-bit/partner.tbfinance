import { useEffect, useRef, useState } from 'react';
import logoLight from '../assets/logo-tb-light.png';
import fotoYousef from '../assets/live-yousef.webp';
import seta from '../assets/live-arrow.png';
import { LIVE } from '../config/live';

const ORANGE = '#E8440A';
const ORANGE_SOFT = '#FF6B3D';
const BG = '#0D0D0D';
const CARD = '#171717';
const LINE = 'rgba(255,255,255,0.10)';

const aprendizados = [
  'Por onde começar quando as dívidas parecem não ter fim',
  'Qual dívida pagar primeiro (e qual pode esperar)',
  'Como negociar com bancos e conseguir descontos reais',
  'O método simples para organizar o dinheiro todo mês',
];

// ---------- Meta Pixel ----------
function initPixel(id) {
  if (!id || window.fbq) return;
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', id);
  window.fbq('track', 'PageView');
}

function track(event, params) {
  if (window.fbq) window.fbq('track', event, params);
}

// ---------- Helpers ----------
function maskPhone(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function getUtms() {
  const p = new URLSearchParams(window.location.search);
  const out = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => {
    if (p.get(k)) out[k] = p.get(k);
  });
  return out;
}

async function enviarLead(payload) {
  if (!LIVE.fullFunnelWebhook) return;
  const req = fetch(LIVE.fullFunnelWebhook, {
    method: 'POST',
    mode: 'no-cors',
    keepalive: true,
    body: new URLSearchParams(payload),
  }).catch(() => {});
  // Nunca segura o lead mais que 2,5s antes de mandar pro grupo
  await Promise.race([req, new Promise((r) => setTimeout(r, 2500))]);
}

// ---------- Página ----------
export default function LiveLP() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [tel, setTel] = useState('');
  const [divida, setDivida] = useState(null); // cartão/empréstimo alto: 'sim' | 'nao'
  const [credito, setCredito] = useState(null); // crédito disponível: 'sim' | 'nao'
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    document.title = 'Método Destrava Financeiro | com Yousef Amer';
    document.body.style.background = BG;
    initPixel(LIVE.metaPixelId);
    return () => { document.body.style.background = ''; };
  }, []);

  const irProForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  async function onSubmit(e) {
    e.preventDefault();
    const digits = tel.replace(/\D/g, '');
    if (nome.trim().length < 2) return setErro('Digite seu nome.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setErro('Digite um e-mail válido.');
    if (digits.length < 10) return setErro('Digite um WhatsApp válido com DDD.');
    if (!divida) return setErro('Responda se possui cartão ou empréstimo alto.');
    if (!credito) return setErro('Responda se possui crédito disponível.');
    setErro('');
    setEnviando(true);

    const payload = {
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      telefone: `55${digits}`,
      divida_alta: divida,
      credito_disponivel: credito,
      tags: ['live-destrava', `divida-alta-${divida}`, `credito-disponivel-${credito}`].join(','),
      origem: 'lp-live-destrava',
      data_live: `${LIVE.dia} ${LIVE.horario}`,
      pagina: window.location.href,
      ...getUtms(),
    };

    track('Lead', { content_name: 'Metodo Destrava Financeiro', divida_alta: divida, credito_disponivel: credito });
    await enviarLead(payload);
    window.location.href = LIVE.grupoWhatsApp;
  }

  return (
    <div style={{ background: BG, color: '#fff', minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>
      {/* brilho de fundo */}
      <div style={{ position: 'absolute', top: 120, left: '50%', transform: 'translateX(-50%)', width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,68,10,0.45) 0%, rgba(232,68,10,0) 65%)', pointerEvents: 'none' }} />
      <img src={seta} alt="" aria-hidden style={{ position: 'absolute', top: 70, right: -60, width: 300, opacity: 0.12, pointerEvents: 'none' }} />

      {/* HEADER */}
      <header style={{ position: 'relative', padding: '16px 20px', display: 'flex', justifyContent: 'center' }}>
        <img src={logoLight} alt="TB Finance" style={{ height: 30, objectFit: 'contain' }} />
      </header>

      {/* HERO */}
      <section style={{ position: 'relative', padding: '8px 20px 0', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: ORANGE, borderRadius: 999, padding: '7px 14px', fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>
          <span style={{ fontSize: 9 }}>✦</span> MÉTODO <span style={{ fontSize: 9 }}>✦</span>
        </div>

        <h1 style={{ marginTop: 16, fontSize: 'clamp(30px, 9vw, 40px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: -1 }}>
          DESTRAVA<br /><span style={{ color: ORANGE }}>FINANCEIRO</span>
        </h1>
        <p style={{ marginTop: 12, fontSize: 17, lineHeight: 1.45, color: 'rgba(255,255,255,0.88)', fontWeight: 500 }}>
          Aprenda a <b style={{ color: '#fff' }}>sair das dívidas</b> e a <b style={{ color: '#fff' }}>organizar seu dinheiro</b> com um passo a passo simples, ao vivo e 100% gratuito.
        </p>

        {/* data */}
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
          {[
            ['mdi-calendar', LIVE.dia],
            ['mdi-clock-outline', LIVE.horario],
          ].map(([icon, txt]) => (
            <div key={icon} style={{ display: 'flex', alignItems: 'center', gap: 6, background: CARD, border: `1px solid ${LINE}`, borderRadius: 10, padding: '8px 12px', fontSize: 13, fontWeight: 700 }}>
              <i className={`mdi ${icon}`} style={{ color: ORANGE_SOFT, fontSize: 16 }} />{txt}
            </div>
          ))}
        </div>

        {/* foto */}
        <div style={{ position: 'relative', marginTop: 18, height: 250, display: 'flex', justifyContent: 'center' }}>
          <img src={fotoYousef} alt="Yousef Amer" style={{ height: 250, width: 'auto', objectFit: 'contain', objectPosition: 'bottom', filter: 'drop-shadow(0 0 24px rgba(232,68,10,0.45))' }} />
          <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(13,13,13,0.88)', border: '1.5px solid rgba(232,68,10,0.6)', borderRadius: 12, padding: '8px 16px 8px 10px', whiteSpace: 'nowrap', textAlign: 'left' }}>
            <span style={{ width: 4, height: 34, borderRadius: 2, background: ORANGE }} />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800 }}><span style={{ fontWeight: 500, opacity: 0.7, fontSize: 13 }}>com</span> Yousef Amer</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: ORANGE_SOFT }}>ESPECIALISTA EM DÍVIDAS</div>
            </div>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section style={{ position: 'relative', padding: '0 16px' }}>
        <form ref={formRef} onSubmit={onSubmit} noValidate style={{ background: '#fff', color: '#111', borderRadius: 20, padding: '22px 18px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <div style={{ fontSize: 19, fontWeight: 800, textAlign: 'center', lineHeight: 1.25 }}>
            Entre no <span style={{ color: ORANGE }}>Grupo VIP</span> e receba seu acesso
          </div>
          <div style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', marginTop: 6 }}>Leva 10 segundos. É 100% gratuito.</div>

          <label style={lbl}>Seu nome</label>
          <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Como podemos te chamar?" autoComplete="given-name" style={inp} />

          <label style={lbl}>Seu melhor e-mail</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" inputMode="email" autoComplete="email" style={inp} />

          <label style={lbl}>Seu WhatsApp</label>
          <input value={tel} onChange={(e) => setTel(maskPhone(e.target.value))} placeholder="(00) 00000-0000" inputMode="numeric" autoComplete="tel-national" style={inp} />

          <SimNao label="Possui cartão ou empréstimo alto que incomoda o seu financeiro?" valor={divida} onChange={(v) => { setDivida(v); setErro(''); }} />
          <SimNao label="Possui crédito disponível hoje?" valor={credito} onChange={(v) => { setCredito(v); setErro(''); }} />

          {erro && <div style={{ marginTop: 12, color: '#DC2626', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>{erro}</div>}

          <button type="submit" disabled={enviando} className="cta-pulse" style={{
            marginTop: 18, width: '100%', border: 'none', borderRadius: 14, padding: '17px 12px',
            background: enviando ? '#9CA3AF' : '#25D366', color: '#fff', fontSize: 16, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, letterSpacing: 0.3,
          }}>
            <i className="mdi mdi-whatsapp" style={{ fontSize: 22 }} />
            {enviando ? 'Abrindo o grupo...' : 'QUERO ENTRAR NO GRUPO VIP'}
          </button>
          <div style={{ marginTop: 10, fontSize: 11, color: '#9CA3AF', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <i className="mdi mdi-lock" /> Seus dados estão seguros. Sem spam.
          </div>
        </form>
      </section>

      {/* O QUE VAI APRENDER */}
      <section style={{ position: 'relative', padding: '36px 20px 0' }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, textAlign: 'center', marginBottom: 16 }}>
          No método você vai <span style={{ color: ORANGE }}>aprender</span>:
        </h2>
        {aprendizados.map((a) => (
          <div key={a} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: '14px 14px', marginBottom: 10 }}>
            <i className="mdi mdi-check-circle" style={{ color: ORANGE, fontSize: 22, lineHeight: 1 }} />
            <span style={{ fontSize: 15, lineHeight: 1.4, fontWeight: 500 }}>{a}</span>
          </div>
        ))}
      </section>

      {/* AUTORIDADE */}
      <section style={{ position: 'relative', padding: '28px 20px 0' }}>
        <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 18, padding: 18 }}>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: ORANGE_SOFT }}>QUEM VAI TE ENSINAR</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginTop: 4 }}>Yousef Amer</div>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.75)', marginTop: 8 }}>
            Fundador da TB Finance, assessoria que ajuda brasileiros a sair do vermelho, renegociar dívidas e organizar a vida financeira de vez.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
            {[['R$ 30M+', 'em dívidas renegociadas'], ['+2.500', 'famílias atendidas']].map(([v, l]) => (
              <div key={v} style={{ background: BG, borderRadius: 12, padding: '14px 10px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: ORANGE }}>{v}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ position: 'relative', padding: '28px 20px 40px', textAlign: 'center' }}>
        <button onClick={irProForm} style={{ width: '100%', border: 'none', borderRadius: 14, padding: '16px 12px', background: ORANGE, color: '#fff', fontSize: 16, fontWeight: 800 }}>
          QUERO APRENDER O MÉTODO
        </button>
        <div style={{ marginTop: 28, fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
          © {new Date().getFullYear()} TB Finance. Todos os direitos reservados.
        </div>
      </section>

      <style>{`
        @keyframes livePulse { 0%,100% { opacity: 1 } 50% { opacity: .3 } }
        .live-dot { animation: livePulse 1.2s infinite }
        @keyframes ctaPulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.025) } }
        .cta-pulse:not(:disabled) { animation: ctaPulse 1.8s ease-in-out infinite }
        input:focus { outline: none; border-color: ${ORANGE} !important; box-shadow: 0 0 0 3px rgba(232,68,10,.15) }
      `}</style>
    </div>
  );
}

function SimNao({ label, valor, onChange }) {
  return (
    <>
      <label style={lbl}>{label}</label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {[['sim', 'Sim'], ['nao', 'Não']].map(([v, t]) => (
          <button key={v} type="button" onClick={() => onChange(v)} style={{
            padding: '13px 8px', borderRadius: 12, fontSize: 15, fontWeight: 700,
            border: `2px solid ${valor === v ? ORANGE : '#E5E5E3'}`,
            background: valor === v ? '#FFF2EE' : '#fff',
            color: valor === v ? ORANGE : '#111',
          }}>{t}</button>
        ))}
      </div>
    </>
  );
}

const lbl = { display: 'block', fontSize: 13, fontWeight: 700, margin: '16px 0 6px' };
const inp = { width: '100%', padding: '14px 14px', fontSize: 16, borderRadius: 12, border: '2px solid #E5E5E3', background: '#F8F8F7', color: '#111' };
