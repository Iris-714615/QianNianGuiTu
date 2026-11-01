import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dist=root+'/dist/client';
const html=await fs.readFile(dist+'/index.html','utf8');
const jsName=html.match(/src="\.\/([^\"]+\.js)"/)?.[1],cssName=html.match(/href="\.\/([^\"]+\.css)"/)?.[1];
if(!jsName||!cssName)throw Error('Run npm run build first');
const js=(await fs.readFile(dist+'/'+jsName,'utf8')).replaceAll('</script','<\\/script');const css=await fs.readFile(dist+'/'+cssName,'utf8');
const names=['ending.mp4','room-integrated.png','record.png','map.png','home.png','crate-detail.png','cabinet-detail.png','envelope.png','ambient.wav',...Array.from({length:24},(_,i)=>`voice-${String(i+1).padStart(2,'0')}.wav`),'hero/walk.png','hero/states.png','hero/events.png','hero/portrait.png','hero/frames/events-0-3.png',...Array.from({length:3},(_,i)=>`hero/frames/states-${i}-0.png`),...['A05_铜龟.png','A07_地面.png','guard-walk.png','catalog-lion.png','catalog-wing.png','catalog-horse.png',...['wide','cover','files','plinth','board','desk'].map(n=>'facing-'+n+'.png')].map(n=>'museum/'+n)];
const assets={};for(const n of names){const b=await fs.readFile(root+'/public/assets/'+n);assets[n]=`data:${n.endsWith('.mp4')?'video/mp4':n.endsWith('.wav')?'audio/wav':'image/png'};base64,${b.toString('base64')}`}
const config=JSON.parse(await fs.readFile(root+'/public/game.config.json','utf8'));
const out=process.argv[2]||path.join(root,'..','千年归途-完整游戏-v1.2-离线试玩.html');
await fs.writeFile(out,`<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>千年归途 · 完整两幕</title><style>${css}</style></head><body><div id="root"></div><script>window.__GUI_ASSETS__=${JSON.stringify(assets)};window.__GUI_CONFIG__=${JSON.stringify(config).replaceAll('<','\\u003c')};</script><script type="module">${js}</script></body></html>`);
console.log(JSON.stringify({file:out,bytes:(await fs.stat(out)).size,embeddedAssets:names.length,externalRuntimeDependencies:0}));
