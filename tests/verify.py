"""Static integrity, release packaging and token contrast. No browser claims."""
from pathlib import Path
import hashlib, json, re
ROOT = Path(__file__).resolve().parents[1]
reference = json.loads((ROOT/'tests/invariants.json').read_text())
for file, digest in reference['files'].items():
    assert hashlib.sha256((ROOT/file).read_bytes()).hexdigest() == digest, file
html = (ROOT/'index.html').read_text()
js = (ROOT/'app.js').read_text()
assert reference['csp'] in html
footer = ' '.join(re.sub('<[^>]*>', '', html.split('<footer>')[1].split('</footer>')[0]).split())
assert footer == reference['footer'], 'Legal/footer text changed'
for key, value in reference['legal_js'].items():
    assert re.search(r'^  const '+key+r' = (.+);$', js, re.M).group(1) == value
algorithm = js[js.index('  const JOINTS'):js.index('  function copyButton')]
assert hashlib.sha256(algorithm.encode()).hexdigest() == reference['algorithm_sha256']
marker = '<script id="nfzmeta" type="application/json">{}</script>'
assert html.count(marker) == 1
meta = json.loads((ROOT/'data/meta.json').read_text())
deployed = html.replace(marker, '<script id="nfzmeta" type="application/json">'+json.dumps(meta,ensure_ascii=False).replace('</','<\\/')+'</script>')
assert marker not in deployed
workflow = (ROOT/'.github/workflows/update.yml').read_text()
shell_files = re.search(r'^const FILES = (.+);', (ROOT/'sw.js').read_text(), re.M).group(1)
for asset in json.loads(shell_files):
    assert asset == './' or (ROOT/asset).is_file(), asset
assert '"styles.css"' in shell_files
copy_line = next(x for x in workflow.splitlines() if 'cp index.html' in x)
assert 'styles.css' in copy_line
for asset in re.findall(r'(?:src|href)="([^"#]+)"', html):
    if not asset.startswith('https:'):
        assert (ROOT/asset).is_file(), asset
assert not re.search(r'@import|https?://|url\(', (ROOT/'styles.css').read_text()), 'Remote CSS resource'
print('PASS: immutable data/scripts, complete search block, legal texts, CSP, deployment marker, cached/published/local assets')

def lum(color):
    color=color.lstrip('#')
    if len(color)==3: color=''.join(c*2 for c in color)
    rgb=[int(color[i:i+2],16)/255 for i in (0,2,4)]
    return sum(v*k for v,k in zip([x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in rgb],[.2126,.7152,.0722]))
def ratio(a,b):
    x,y=sorted([lum(a),lum(b)]);return (y+.05)/(x+.05)
css=(ROOT/'styles.css').read_text()
light=dict(re.findall(r'--([\w-]+):\s*(#[0-9a-f]+)',css.split('@media')[0]))
dark=dict(re.findall(r'--([\w-]+):\s*(#[0-9a-f]+)',css.split(':root[data-theme="dark"]')[1].split('}')[0]))
for name,tokens in [('light',light),('dark',dark)]:
    pairs=[('ink','surface'),('muted','surface'),('muted','bg'),('accent','code-bg'),('accent','accent-soft'),('on-accent','accent'),('warn-ink','warn-bg'),('err','surface')]
    values=[ratio(tokens[a],tokens[b]) for a,b in pairs]
    assert min(values)>=4.5,(name,values)
    assert ratio(tokens['control-line'],tokens['surface'])>=3
    print(f'PASS: {name} text token pairs >=4.5:1; minimum {min(values):.2f}:1; control border >=3:1')
print('NOT CHECKED here: rendered layout, real focus, screen reader, browser clipboard, service worker execution.')
