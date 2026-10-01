"""Run after npm run build. All runtime resources become embedded in one HTML."""
from pathlib import Path
import base64
import re
root=Path(__file__).resolve().parents[1]
dist=root/'dist'
html=(dist/'index.html').read_text()
js_file=next((dist/'assets').glob('*.js'))
css_file=next((dist/'assets').glob('*.css'))
css=css_file.read_text()
for font in (dist/'assets').glob('*.woff'):
    encoded=base64.b64encode(font.read_bytes()).decode()
    css=css.replace('/assets/'+font.name,'data:font/woff;base64,'+encoded)
    css=css.replace('./'+font.name,'data:font/woff;base64,'+encoded)
html=re.sub(r'<link[^>]+rel="stylesheet"[^>]*>',lambda _: '<style>'+css+'</style>',html)
html=re.sub(r'<script[^>]+src="[^\"]+"[^>]*></script>',lambda _: '<script type="module">'+js_file.read_text().replace('</script','<\\/script')+'</script>',html)
licenses='\n'.join(f.read_text() for f in (root/'licenses').iterdir())
html=html.replace('<head>','<head><!--\n'+licenses.replace('--','—')+'\n-->')
out=root/'release/alley-cat-diner-play.html'
out.parent.mkdir(exist_ok=True)
out.write_text(html)
print(out)
