import json, base64, io, html, sys
from PIL import Image
OUT=sys.argv[1]
inv=json.load(open('inv.json'))['accounts']
CAR={'tb':'/home/user/partner.tbfinance/marketing/tbfinance/carrosseis/2026-11-recorde-inadimplencia/png/01.png',
     'bf':'/home/user/partner.tbfinance/marketing/yousef/carrosseis/2026-11-black-friday/png/01.png'}
# (data, hora, perfil[T=TB, Y=Yousef, C=collab], formato, pasta/arquivo, capa (com *destaque*), CTA, status)
P=[
('Qua 18/11','9h','Y','Carrossel','Opinião do Yousef: Feirão Limpa Nome, quando vale e quando é armadilha','Feirão Limpa Nome: eu *recomendo?*','DESTRAVA','criar'),
('Qua 18/11','12h','T','Carrossel','Autoridade: os números da TB','Sua dívida tem solução. *A gente prova.*','EBOOK','criar'),
('Qua 18/11','19h','T','Carrossel','Notícia: recorde de 84,2 mi inadimplentes (Serasa)','car:tb','PLANILHA','pronto'),
('Qui 19/11','9h','C','Reel','Vídeo c/ conteúdo · VIDEO 09','Ganha R$ 8 mil e diz que *ganha mal*?','DESTRAVA','pronto'),
('Qui 19/11','19h','T','Carrossel','Dado: juro do rotativo a 451,7% ao ano (BC)','Pagar o mínimo custa *451% ao ano*','EBOOK','criar'),
('Sex 20/11','9h','Y','Carrossel','Alerta: 5 sinais de golpe de quem promete "limpar seu nome"','5 sinais de *golpe* do limpa nome','PLANILHA','criar'),
('Sex 20/11','12h','T','Carrossel','Notícia: 20,3 mi em endividamento de risco, +75% em 5 anos (BC)','*20 milhões* no endividamento de risco','DESTRAVA','criar'),
('Sex 20/11','19h','T','Reel','Depoimentos · Depoimento loira','*R$ 550 mil* viraram R$ 150 mil','EBOOK','pronto'),
('Sáb 21/11','10h','Y','Reel','Caixinha · ganho 3k e devo 60k','Ganho R$ 3 mil e devo *R$ 60 mil*','PLANILHA','pronto'),
('Sáb 21/11','12h','T','Carrossel','Notícia: golpes na Black Friday (86% já desistiram por medo)','*86%* já fugiram de promoção por medo','DESTRAVA','criar'),
('Sáb 21/11','19h','T','Carrossel','Indicação: indique e ganhe desconto, vire parceiro (7%)','Indicou, *ganhou*.','EBOOK','criar'),
('Dom 22/11','9h','Y','Carrossel','Notícia: Black Friday + 13º','car:bf','PLANILHA','pronto'),
('Dom 22/11','12h','T','Carrossel','Checklist: antes de comprar na Black Friday','Black Friday: *desconto* ou dívida?','DESTRAVA','criar'),
('Dom 22/11','19h','T','Reel','Influenciadores · copy_22975553','Gastou seu dinheiro *com o quê?*','EBOOK','pronto'),
('Seg 23/11','12h','T','Carrossel','Passo a passo: negociar no Feirão sem cair em armadilha','Feirão: o *passo a passo* seguro','PLANILHA','criar'),
('Seg 23/11','19h','T','Carrossel','Produto: como funciona o Teu Bolso','Seu dinheiro *num só lugar*','DESTRAVA','criar'),
('Ter 24/11','9h','C','Reel','Vídeo c/ conteúdo · VIDEO 04','Você ganha bem, mas a *fatura* assusta?','EBOOK','pronto'),
('Ter 24/11','19h','T','Carrossel','Mito x Verdade: "depois de 5 anos a dívida some"','Depois de 5 anos a dívida *some?*','PLANILHA','criar'),
]
def b64(path,w=300):
    im=Image.open(path).convert('RGB'); W,H=im.size; th=int(W*4/3)
    if th<H: t=(H-th)//2; im=im.crop((0,t,W,t+th))
    else:
        tw=int(H*3/4); l=(W-tw)//2; im=im.crop((l,0,l+tw,H))
    im=im.resize((w,int(w*4/3))); b=io.BytesIO(); im.save(b,'JPEG',quality=72); return base64.b64encode(b.getvalue()).decode()
def capa(t): return html.escape(t).replace('*','<span class="o">',1).replace('*','</span>',1)
def tile(p, mine):
    d,h,who,fmt,src,cv,cta,stt=p
    icon={'Reel':'🎬','Carrossel':'❐','Carrossel':''}[fmt]
    lab=f'<span class="d">{d.split()[1]} · {h}</span><span class="ty">{icon}</span>'
    badge='<span class="cb">COLLAB</span>' if who=='C' else ''
    if cv.startswith('car:'):
        return f'<div class="t new" style="background-image:url(data:image/jpeg;base64,{b64(CAR[cv[4:]])})">{lab}{badge}</div>'
    crt=' crt' if stt=='criar' else ''
    return f'<div class="t new mock{crt}">{lab}{badge}<div class="ct">{capa(cv)}</div><div class="src">{html.escape(src)}</div></div>'
css='''*{margin:0;padding:0;box-sizing:border-box}body{font-family:Inter,-apple-system,sans-serif;background:#f4f2ee;color:#111}
.w{max-width:980px;margin:0 auto;padding:24px 12px 60px}h1{font-size:28px;font-weight:900;letter-spacing:-.02em}h2{font-size:20px;font-weight:900;margin:34px 0 12px}
.sub{color:#555;font-size:14px;margin:6px 0 16px;line-height:1.5}
.kp{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0}.k{background:#fff;border-radius:14px;padding:14px}.k b{display:block;font-size:30px;font-weight:900;color:#E8440A}.k span{font-size:12px;font-weight:700;color:#555}
table{width:100%;border-collapse:collapse;background:#fff;border-radius:14px;overflow:hidden;font-size:13px}th{background:#111;color:#fff;text-align:left;padding:10px;font-size:11px;letter-spacing:.06em}
td{padding:9px 10px;border-bottom:1px solid #eee;vertical-align:top}tr.wk td{background:#FFF2EE;font-weight:900;color:#E8440A;font-size:12px;letter-spacing:.08em}
.pf{font-weight:800;font-size:11px;padding:3px 7px;border-radius:6px;white-space:nowrap}.T{background:#111;color:#fff}.Y{background:#E8440A;color:#fff}.C{background:linear-gradient(90deg,#111 50%,#E8440A 50%);color:#fff}
.cta{font-weight:900;font-size:11px;color:#E8440A}.cr{font-size:10px;font-weight:800;background:#F59E0B;color:#111;padding:2px 6px;border-radius:5px}
.cols{display:grid;grid-template-columns:1fr 1fr;gap:18px}@media(max-width:760px){.cols{grid-template-columns:1fr}.kp{grid-template-columns:repeat(2,1fr)}}
.pr{background:#fff;border:1px solid #e5e5e5;border-radius:16px;overflow:hidden}.ph{display:flex;gap:14px;align-items:center;padding:16px}.av{width:58px;height:58px;border-radius:50%;background:#111;color:#E8440A;font-weight:900;display:flex;align-items:center;justify-content:center;border:3px solid #E8440A}
.un{font-weight:800}.st{font-size:12px;color:#555;margin-top:2px}.sep{padding:8px 12px;font-size:11px;font-weight:900;letter-spacing:.08em;background:#111;color:#fff}.sep.o{background:#E8440A}
.g{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}.t{position:relative;aspect-ratio:3/4;background:#ddd center/cover}
.t .d{position:absolute;left:5px;top:5px;font-size:9.5px;font-weight:800;color:#fff;background:rgba(0,0,0,.6);padding:2px 5px;border-radius:5px;z-index:2}.t .ty{position:absolute;right:5px;top:4px;font-size:11px;z-index:2}
.t.new{outline:3px solid #E8440A;outline-offset:-3px}.cb{position:absolute;right:5px;bottom:5px;font-size:8.5px;font-weight:900;background:#E8440A;color:#fff;padding:2px 5px;border-radius:4px;z-index:2}
.mock{background:linear-gradient(170deg,#3a3a3a,#0f0f0f 70%);display:flex;flex-direction:column;justify-content:flex-end;padding:9px}
.mock .ct{color:#fff;font-weight:900;font-size:15px;line-height:1.08;letter-spacing:-.02em}.mock .o{color:#FF6B3D}.mock .src{font-size:8.5px;color:#9a9a9a;margin-top:6px;font-weight:600;padding-right:44px}
.mock.crt{background:linear-gradient(170deg,#E8440A,#7a2105 75%)}.mock.crt .o{color:#111}
.old{filter:grayscale(.15);opacity:.85}
.nt{background:#fff;border-radius:14px;padding:16px;font-size:13.5px;line-height:1.6;margin-top:12px}.nt b{color:#111}
'''
cnt={'T':0,'Y':0,'C':0}; crt=sum(1 for p in P if p[7]=='criar')
for p in P: cnt[p[2]]+=1
H=['<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Semana 1 · 18 a 24/11</title><style>'+css+'</style></head><body><div class="w">',
'<h1>Semana 1 · qua 18/11 a ter 24/11</h1><div class="sub">Cronograma semanal com as notícias da semana. Toda terça eu monto a próxima. Nada repetido, nada já postado.</div>',
f'<div class="kp"><div class="k"><b>14</b><span>@tbfinance_ · 4 vídeos + 10 posts</span></div><div class="k"><b>6</b><span>@yousefameroficial · 3 vídeos + 3 posts</span></div><div class="k"><b>{len(P)-crt}</b><span>já prontos</span></div><div class="k"><b>{crt}</b><span>eu crio (temas da semana)</span></div></div>',
'<div class="nt"><b>Ritmo:</b> TB com <b>2 posts por dia</b> (12h e 19h; quando há collab de manhã, ele conta como um dos 2). Yousef com 6 por semana, de manhã, sem post na segunda (é o pior dia dele). <b>Collab:</b> o autor é o @yousefameroficial e a @tbfinance_ entra como colaboradora; é assim que a TB pega o alcance do Yousef. <b>Horários:</b> o Yousef às 9h/10h; a TB às 12h e às 19h. <b>CTA:</b> DESTRAVA, EBOOK e PLANILHA em rodízio, nunca o mesmo duas vezes seguidas.</div>',
'<h2>📅 Calendário</h2><table><tr><th>HORA</th><th>PERFIL</th><th>FORMATO</th><th>CONTEÚDO / ARQUIVO</th><th>CAPA</th><th>CTA</th></tr>']
lab={'T':'TB','Y':'YOUSEF','C':'COLLAB'}
for i,p in enumerate(P):
    if i==0 or P[i-1][0]!=p[0]: H.append(f'<tr class="wk"><td colspan="6">{p[0].upper()}</td></tr>')
    d,h,who,fmt,src,cv,cta,stt=p
    cvt='(capa pronta)' if cv.startswith('car:') else capa(cv).replace('<span class="o">','<b>').replace('</span>','</b>')
    tag=' <span class="cr">EU CRIO</span>' if stt=='criar' else ''
    H.append(f'<tr><td><b>{h}</b></td><td><span class="pf {who}">{lab[who]}</span></td><td>{fmt}</td><td>{html.escape(src)}{tag}</td><td>{cvt}</td><td class="cta">{cta}</td></tr>')
H.append('</table>')
H.append('<h2>📱 Como o grid vai ficar</h2><div class="sub">Laranja = novos posts do cronograma (do mais novo para o mais antigo, como no Instagram). Embaixo, os posts que já estão no perfil hoje.</div><div class="cols">')
names={'T':('tbfinance_','TB','empresa'),'Y':('yousefameroficial','YA','pessoal')}
for k in ('Y','T'):
    un,ini,acc=names[k]; d=inv[acc]
    mine=[p for p in P if p[2] in (k,'C')][::-1]
    H.append(f'<div class="pr"><div class="ph"><div class="av">{ini}</div><div><div class="un">@{un}</div><div class="st">{d["media_count"]+len(mine)} posts · {d["followers_count"]:,} seguidores</div></div></div>'.replace(',','.'))
    H.append(f'<div class="sep o">NOVOS · {len(mine)} POSTS</div><div class="g">'+''.join(tile(p,k) for p in mine)+'</div>')
    H.append('<div class="sep">JÁ PUBLICADOS</div><div class="g">')
    for p in d['media'][:12]:
        try: H.append(f'<div class="t old" style="background-image:url(data:image/jpeg;base64,{b64("thumbs/"+p["id"]+".jpg")})"></div>')
        except Exception: pass
    H.append('</div></div>')
H.append('</div>')
H.append('''<h2>📦 Estoque de vídeos depois desta semana</h2><div class="nt">
<b>Collab:</b> Fala Founder V037, V038, V039 e V040; Entrevista 4; VIDEO 03, 05 e 06; copy_DC5C97F9 (cortar a fala "certificada pelo Banco Central"). <b>Só TB:</b> depoimentos VIDEO 15, 16, 18 e 19, Mauricio e Carlos Eduardo; Influenciadores copy_7DB4, VIDEO 21, IMG_9054 e IMG_8583 <i>ou</i> Conteúdo.mov. <b>Só Yousef:</b> Caixinha VIDEO 10, 11, 12 e "peguei empréstimo".<br><br>
Com 4 vídeos por semana na TB e 3 no Yousef, o estoque dá para cerca de 4 semanas. O que você gravar e jogar no Drive eu encaixo nas próximas.<br>⛔ V041 "limpa nome" continua fora. ❓ copy_375770EA está sem fala: o que é?</div>''')
H.append('</div></body></html>')
open(OUT+'/cronograma.html','w').write('\n'.join(H)); print('ok', len(P), cnt, crt)
