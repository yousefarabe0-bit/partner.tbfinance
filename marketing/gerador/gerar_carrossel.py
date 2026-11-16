"""Gera os slides HTML de um carrossel no padrão editorial (estilo notícia).

Uso: python3 gerar_carrossel.py spec.json pasta_saida
O spec define perfil, fotos e a lista de slides. O último slide deve ser o CTA.
"""
import json, os, shutil, sys, html

CSS = os.path.join(os.path.dirname(__file__), '..', 'tbfinance', 'carrosseis', '2026-11-recorde-inadimplencia', 'slides', 'ed.css')
LOGO_LIGHT = '../../../../tbfinance/assets/logo-tb-light.png'

CTA_TXT = {
    'DESTRAVA': 'e receba a aula gratuita: como organizar as finanças e negociar dívidas com até 90% de desconto.',
    'EBOOK': 'e receba o e-book de organização financeira e liquidação de dívidas.',
    'PLANILHA': 'e receba a planilha de organização financeira e negociação de dívidas.',
}


def esc(t):
    # *texto* vira destaque laranja; **texto** vira negrito
    t = html.escape(t)
    out, i, bold = '', 0, False
    parts = t.split('**')
    t = ''.join(p if k % 2 == 0 else f'<b>{p}</b>' for k, p in enumerate(parts))
    parts = t.split('*')
    return ''.join(p if k % 2 == 0 else f'<span class="or">{p}</span>' for k, p in enumerate(parts))


def top(spec):
    return f'<div class="top" style="z-index:3"><span><b>●</b> {spec["tag"]}</span><span>{spec["data"]}</span></div>'


def page(spec, n, total, body, dark=False, extra_css=''):
    cls = ' class="dark"' if dark else ''
    return f'''<html><head><link rel="stylesheet" href="ed.css"><style>{extra_css}
.dark .top{{color:#fff}}.dark .src{{color:#777}}.dark p{{color:#D4D4D4}}.dark p b{{color:#fff}}
ul.l{{list-style:none;margin-top:34px}}ul.l li{{font-size:36px;line-height:1.35;font-weight:600;padding:16px 0 16px 54px;position:relative;border-bottom:1px solid rgba(0,0,0,.08)}}
ul.l li:before{{content:'→';position:absolute;left:0;color:#E8440A;font-weight:900}}.dark ul.l li{{border-color:rgba(255,255,255,.12);color:#fff}}
.big2{{font-size:150px;font-weight:900;letter-spacing:-.05em;line-height:.95;color:#E8440A}}
</style></head><body{cls}>{top(spec)}{body}<div class="pg">{n}/{total}</div></body></html>'''


def slide_html(spec, s, n, total):
    k = s['tipo']
    src = f'<div class="src">{esc(s["fonte"])}</div>' if s.get('fonte') else ''
    if k == 'capa':
        foto = s.get('foto')
        pos = s.get('pos', 'center 20%')
        bg = f'<div class="bg" style="position:absolute;left:0;right:0;top:0;height:{s.get("h", 900)}px;background:url({foto}) {pos}/cover;filter:brightness({s.get("brilho", 1)})"></div><div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(15,15,15,.5) 0%,rgba(15,15,15,0) 18%,rgba(15,15,15,0) 38%,rgba(15,15,15,.92) 56%,#0F0F0F 66%)"></div>' if foto else '<img src="' + LOGO_LIGHT.replace('logo-tb-light', 'seta') + '" style="position:absolute;right:-60px;top:330px;width:560px;opacity:.10">'
        who = f'<div style="position:absolute;left:72px;top:{s.get("who_top", 560)}px;font-size:22px;font-weight:700;color:#fff;background:rgba(0,0,0,.55);padding:8px 14px;border-radius:10px;z-index:2">{esc(s["quem"])}</div>' if s.get('quem') else ''
        body = f'''{bg}{who}<div style="position:absolute;left:72px;right:72px;bottom:130px"><div class="kick" style="color:#FF6B3D">{esc(s["kicker"])}</div>
<h1 style="color:#fff;font-size:{s.get("fs", 80)}px">{esc(s["titulo"])}</h1></div>
<div style="position:absolute;bottom:60px;left:72px;font-size:26px;font-weight:800;letter-spacing:.12em;color:#E8440A">ARRASTE →</div>
{f'<div style="position:absolute;left:72px;bottom:24px;font-size:15px;color:#777">{esc(s["credito"])}</div>' if s.get("credito") else ''}'''
        return page(spec, n, total, body, dark=True).replace(f'<div class="pg">{n}/{total}</div>', '')
    if k == 'texto':
        dark = s.get('escuro', False)
        foto = ''
        wrap_top = 150
        if s.get('foto'):
            foto = f'<div style="position:absolute;left:0;right:0;top:0;height:{s.get("h", 600)}px;background:url({s["foto"]}) {s.get("pos", "center 30%")}/cover"></div><div style="position:absolute;left:0;right:0;top:0;height:{s.get("h", 600)}px;background:linear-gradient(180deg,rgba(15,15,15,.45),rgba(15,15,15,0) 25%,rgba(15,15,15,0) 55%,#0F0F0F)"></div>'
            wrap_top = s.get('h', 600) - 60
            dark = True
        big = f'<div class="big2">{esc(s["numero"])}</div><div style="font-size:34px;font-weight:800;margin:6px 0 10px">{esc(s.get("numero_legenda", ""))}</div>' if s.get('numero') else ''
        ps = ''.join(f'<p>{esc(p)}</p>' for p in s.get('paragrafos', []))
        lst = ('<ul class="l">' + ''.join(f'<li>{esc(i)}</li>' for i in s['lista']) + '</ul>') if s.get('lista') else ''
        card = f'<div class="card" style="font-size:36px;font-weight:700;line-height:1.35{";background:#1c1c1c;color:#fff" if dark else ""}">{esc(s["destaque"])}</div>' if s.get('destaque') else ''
        h2c = ' style="color:#fff"' if dark else ''
        pos = f'top:{wrap_top}px' if (s.get('foto') or not dark) else 'top:50%;transform:translateY(-50%)'
        body = f'{foto}<div class="wrap" style="{pos}"><div class="kick">{esc(s["kicker"])}</div><h2{h2c}>{esc(s["titulo"])}</h2>{big}{ps}{lst}{card}</div>{src}'
        return page(spec, n, total, body, dark=dark)
    if k == 'cta':
        foto = s.get('foto')
        ph = f'<div style="position:absolute;left:0;right:0;top:0;height:640px;background:url({foto}) {s.get("pos", "center 30%")}/cover;filter:brightness({s.get("brilho", 1)})"></div><div style="position:absolute;left:0;right:0;top:0;height:640px;background:linear-gradient(180deg,rgba(15,15,15,.5),rgba(15,15,15,0) 25%,rgba(15,15,15,.35) 70%,#0F0F0F)"></div>' if foto else ''
        wrap_pos = 'top:590px' if foto else 'top:50%;transform:translateY(-55%)'
        palavra = s['palavra']
        body = f'''{ph}<div class="wrap" style="{wrap_pos}"><div class="kick">{esc(s["kicker"])}</div>
<h1 style="color:#fff;font-size:{s.get("fs", 76 if not foto else 68)}px">{esc(s["titulo"])}</h1>
<div style="margin-top:34px;border:3px solid #E8440A;border-radius:22px;padding:34px 40px;font-size:44px;line-height:1.3;font-weight:700;color:#fff">Comenta <span class="or" style="font-weight:900">{palavra}</span> {CTA_TXT[palavra]}</div>
<div style="margin-top:26px;font-size:26px;color:#9CA3AF;font-weight:600">{esc(s.get("assinatura", ""))}</div></div>
<img src="{LOGO_LIGHT}" style="position:absolute;right:72px;bottom:46px;height:64px">'''
        return page(spec, n, total, body, dark=True).replace(f'<div class="pg">{n}/{total}</div>', '')
    raise ValueError(k)


def main():
    spec = json.load(open(sys.argv[1]))
    out = sys.argv[2]
    os.makedirs(out, exist_ok=True)
    shutil.copy(CSS, os.path.join(out, 'ed.css'))
    for f in spec.get('copiar', []):
        shutil.copy(os.path.join(os.path.dirname(sys.argv[1]), f) if not os.path.isabs(f) else f, out)
    total = len(spec['slides'])
    assert spec['slides'][-1]['tipo'] == 'cta', 'o último slide precisa ser o CTA'
    for i, s in enumerate(spec['slides'], 1):
        open(os.path.join(out, f'{i:02d}.html'), 'w').write(slide_html(spec, s, i, total))
    print('ok', total, 'slides')


if __name__ == '__main__':
    main()
