"""Junta os JPG de um carrossel num PDF para post de documento no LinkedIn.

Uso: python3 pdf_linkedin.py pasta_dos_jpg saida.pdf
"""
import glob, os, sys
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
files = sorted(glob.glob(os.path.join(src, '*.jpg')))
assert files, 'nenhum JPG encontrado'
imgs = [Image.open(f).convert('RGB') for f in files]
os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
imgs[0].save(out, save_all=True, append_images=imgs[1:], resolution=150, quality=90)
print('ok', len(imgs), 'páginas', round(os.path.getsize(out) / 1e6, 1), 'MB')
