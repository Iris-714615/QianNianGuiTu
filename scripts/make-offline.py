from pathlib import Path
import json,base64,argparse
root=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser();parser.add_argument('--out',default=str(root.parent/'千年归途-H5离线试玩.html'));args=parser.parse_args()
dist=root/'dist/client';css=next((dist/'assets').glob('*.css')).read_text();js=next((dist/'assets').glob('*.js')).read_text().replace('</script','<\\/script')
assets={}
for p in (root/'public/assets').iterdir():
 if p.suffix not in ['.png','.wav']:continue
 mime='image/png' if p.suffix=='.png' else 'audio/wav'
 assets[p.stem]='data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
html='<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>千年归途 · H5离线试玩</title><style>'+css+'</style><div id="root"></div><script>window.__GAME_ASSETS__='+json.dumps(assets)+'</script><script type="module">'+js+'</script></html>'
Path(args.out).write_text(html);print('Self-contained H5 offline file created, including music and image fallbacks.')
