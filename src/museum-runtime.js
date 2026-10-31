import {MuseumCore} from './museum-core';
import {drawHero as paintLion} from './hero';
import {assetUrl,sound} from './shared';
export function mountMuseum(root,options){
let disposed=false,route=[],pendingInspect=false,lastFootstep=0,externalPaused=false;const listeners=[],intervals=[],frames=new Set();
const nativeWindow=globalThis.window;
const window={addEventListener(type,fn,opts){nativeWindow.addEventListener(type,fn,opts);listeners.push([nativeWindow,type,fn,opts]);},museumSnapshot:null,museumHandoff:null};
const document=new Proxy(globalThis.document,{get(target,key){if(key==='addEventListener')return (type,fn,opts)=>{target.addEventListener(type,fn,opts);listeners.push([target,type,fn,opts])};const value=Reflect.get(target,key);return typeof value==='function'?value.bind(target):value;}});
const setInterval=(fn,ms)=>{const id=globalThis.setInterval(fn,ms);intervals.push(id);return id};
const requestAnimationFrame=fn=>{const id=globalThis.requestAnimationFrame(t=>{frames.delete(id);if(!disposed)fn(t)});frames.add(id);return id};
function saveState(){if(typeof state==='undefined'||!state)return;options.save(JSON.parse(JSON.stringify(state)));}
const art={};const artFiles={floor:'A07_地面.png',guide:'A05_铜龟.png',board:'facing-board.png',desk:'facing-desk.png',files:'facing-files.png',plinth:'facing-plinth.png',cover:'facing-cover.png',wide:'facing-wide.png',guardWalk:'guard-walk.png'};
for(const [key,file] of Object.entries(artFiles)){const i=new Image();i.onload=()=>{floorReady=false};i.src=assetUrl('museum/'+file);art[key]=i;}
function drawArtFixture(f){const img=art[f.kind==='cover'&&f.w>f.h?'wide':f.kind];if(!img?.complete||!img.naturalWidth)return false;const s=project(f.x+f.w/2,f.y+f.h),baseW=f.kind==='board'?f.w+10:f.kind==='guide'?112:f.w*1.12,scale=Math.min(1,(f.kind==='files'?104:165)/(baseW*img.naturalHeight/img.naturalWidth)),w=baseW*scale,h=w*img.naturalHeight/img.naturalWidth;ctx.save();if(fixtureOccludes(f,h*.65))ctx.globalAlpha=.6;ctx.drawImage(img,s.x-w/2,s.y-h,w,h);if(state.mode==='play'&&nearest()===f.id){ctx.strokeStyle='#e9ca82';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(s.x,s.y+1,w*.45,10,0,0,Math.PI*2);ctx.stroke()}ctx.restore();if(['guide','pictures','records','letters'].includes(f.id))plaque(f,f.id==='guide'?'铜龟':f.title,5);return true;}
function drawArtGuard(){const g=state.guard,s=project(g.x,g.y),img=art.guardWalk;if(!img?.complete||!img.naturalWidth)return false;const dx=Math.cos(g.angle),dy=Math.sin(g.angle),row=Math.abs(dx)>Math.abs(dy)?(dx>0?1:3):(dy>0?0:2),col=state.mode==='play'&&!externalPaused&&!reducedMotion&&!g.wait?Math.floor(performance.now()/140)%4:0;ellipse(s.x,s.y,16,6,'#020b0d80');ctx.drawImage(img,col*256,row*256,256,256,s.x-49,s.y-94,98,98);return true;}
function queueWalk(point,inspectOnArrival=false){route=findRoute(state.player,point,obstacles(),bounds);pendingInspect=inspectOnArrival;if(!route.length)toast('这条路被挡住了，换个方向靠近。');}
function clickWorld(e){if(state.mode!=='play')return;const r=canvas.getBoundingClientRect(),sx=(e.clientX-r.left)/r.width*1280,sy=(e.clientY-r.top)/r.height*720;const y=(sy-190)/.88+160,x=640+(sx-640)/(.91+(y-160)/466*.09);const f=fixtures.find(f=>actions[f.id]&&x>=f.x-10&&x<=f.x+f.w+10&&y>=f.y-100&&y<=f.y+f.h+5);if(f){const candidates=[{x:f.x+f.w/2,y:f.y+f.h+32},{x:f.x-32,y:f.y+f.h/2},{x:f.x+f.w+32,y:f.y+f.h/2}];let paths=candidates.map(p=>findRoute(state.player,p,obstacles(),bounds)).filter(a=>a.length).sort((a,b)=>a.length-b.length);route=paths[0]||[];pendingInspect=true;}else queueWalk({x,y});}
function findRoute(start,end,obs,b){const step=18,minX=b.x+16,minY=b.y+16,cols=Math.floor((b.w-32)/step)+1,rows=Math.floor((b.h-32)/step)+1;const point=(x,y)=>({x:minX+x*step,y:minY+y*step}),valid=(x,y)=>x>=0&&y>=0&&x<cols&&y<rows&&!obs.some(o=>MuseumCore.circleRect(minX+x*step,minY+y*step,16,o));const nearest=p=>{let best=null,d=Infinity;for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)if(valid(x,y)){let q=point(x,y),v=Math.hypot(q.x-p.x,q.y-p.y);if(v<d){d=v;best=[x,y]}}return best};const a=nearest(start),z=nearest(end);if(!a||!z)return[];const key=(x,y)=>y*cols+x,ak=key(...a),zk=key(...z),queue=[a],seen=new Map([[ak,null]]);for(let i=0;i<queue.length;i++){const [x,y]=queue[i],k=key(x,y);if(k===zk){let out=[],v=k;while(v!==ak){out.unshift(point(v%cols,Math.floor(v/cols)));v=seen.get(v)}return out;}for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,kk=key(xx,yy);if(valid(xx,yy)&&!seen.has(kk)){seen.set(kk,k);queue.push([xx,yy])}}}return[];}
/* 2.5D room: world footprints drive collision, projection and object highlights. */
const floorLayer=document.createElement('canvas');floorLayer.width=1280;floorLayer.height=720;
let floorReady=false,lastPaintAt=0;
const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
function project(x,y,z=0){const scale=.91+(y-160)/466*.09;return {x:640+(x-640)*scale,y:190+(y-160)*.88-z};}
function polygon(points,fill,stroke=null,width=1,g=ctx){g.beginPath();points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.closePath();if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}}
function corners(r,z=0){return [project(r.x,r.y,z),project(r.x+r.w,r.y,z),project(r.x+r.w,r.y+r.h,z),project(r.x,r.y+r.h,z)];}
function plane(r,z,fill,stroke=null,g=ctx){polygon(corners(r,z),fill,stroke,1,g);}
function segment(a,b,color,width=1,g=ctx){g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.moveTo(a.x,a.y);g.lineTo(b.x,b.y);g.stroke();}
function ellipse(x,y,rx,ry,color,g=ctx){g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);g.fill();}
function label(s,x,y,size=12,color='#bfc1ac',g=ctx){g.textAlign='center';g.font=`${size}px "Microsoft YaHei",sans-serif`;g.fillStyle=color;g.fillText(s,x,y);}
function box(r,height,colors,base=0){
  const low=corners(r,base),top=corners(r,height+base);
  polygon([top[0],top[3],low[3],low[0]],colors.side,'#10191670');
  polygon([top[1],top[2],low[2],low[1]],colors.side,'#10191670');
  const shade=ctx.createLinearGradient(0,top[3].y,0,low[3].y);shade.addColorStop(0,colors.front);shade.addColorStop(1,colors.bottom||colors.side);
  polygon([top[3],top[2],low[2],low[3]],shade,'#0e1715b0');
  polygon(top,colors.top,colors.edge||'#93947b70');
  segment(top[0],top[1],colors.edge||'#b7b29470');segment(top[0],top[3],colors.edge||'#b7b29450');
}
function shadow(r,height,g=ctx){const ground=corners(r),away=ground.map(p=>({x:p.x+height*.30,y:p.y+height*.25}));polygon([ground[0],ground[1],away[1],away[2],away[3],ground[3]],'#08100f42',null,1,g);}
function grain(n){let a=Math.sin(n*17.137+23.341)*43758.5453;return a-Math.floor(a);}
function glow(x,y,rx,ry,color,g=ctx){g.save();g.translate(x,y);g.scale(1,ry/rx);const grad=g.createRadialGradient(0,0,0,0,0,rx);grad.addColorStop(0,color);grad.addColorStop(1,'#d0bb7d00');g.fillStyle=grad;g.fillRect(-rx,-rx,rx*2,rx*2);g.restore();}
function makeFloor(){
  const g=floorLayer.getContext('2d');g.fillStyle='#0c1418';g.fillRect(0,0,1280,720);
  polygon(corners(bounds),'#464e4b',null,1,g);g.save();polygon(corners(bounds),null,null,1,g);g.clip();
  let n=0;
  for(let y=160;y<626;y+=58)for(let x=34;x<1220;x+=94){
    const r={x:x+(Math.floor((y-160)/58)%2)*47,y,w:92,h:56},v=Math.floor(54+grain(n)*12);n++;
    plane(r,0,`rgb(${v},${v+9},${v+8})`,'#161f20',g);
    const pts=corners({x:r.x+2,y:r.y+2,w:r.w-4,h:r.h-4});segment(pts[0],pts[1],'#a4aa8b20',1,g);segment(pts[0],pts[3],'#a4aa8b17',1,g);
    for(let i=0;i<12;i++){const p=project(r.x+grain(n*31+i)*90,r.y+grain(n*73+i)*54);g.fillStyle=i%2?'#bfc4ac0b':'#080f0d17';g.fillRect(p.x,p.y,grain(i+n)*4+1,1);}
    if(n%8===0){const a=project(r.x+18,r.y+3),b=project(r.x+27,r.y+14),c=project(r.x+21,r.y+27);segment(a,b,'#1723235a',1,g);segment(b,c,'#1723235a',1,g);}
  }
  // Thin stone inlay outlines each room without turning the floor into a grid.
  for(const r of [{x:80,y:180,w:520,h:425},{x:669,y:180,w:528,h:425}]){polygon(corners(r),null,'#9f9c7435',2,g);}
  for(const [x,y] of [[160,260],[432,262],[470,530],[1120,210]]){const p=project(x,y);glow(p.x,p.y,170,100,'#e2bf6e22',g);}
  for(const f of fixtures)shadow(f,60,g);
  for(const w of walls)shadow(w,72,g);
  const shade=g.createRadialGradient(640,390,140,640,400,650);shade.addColorStop(0,'#00000000');shade.addColorStop(1,'#030e1680');g.fillStyle=shade;g.fillRect(0,125,1280,525);g.restore();
  const tile=art.floor;if(tile?.complete&&tile.naturalWidth){g.save();polygon(corners(bounds),null,null,1,g);g.clip();g.globalAlpha=.65;const pat=g.createPattern(tile,'repeat');if(pat){pat.setTransform(new DOMMatrix().scale(.2));g.fillStyle=pat;g.fillRect(0,190,1280,440);}g.restore();}floorReady=true;
}
function wallBlock(r,h=64){
  box(r,h,{top:'#71766a',front:'#3d4946',side:'#263632',bottom:'#1f2c2b',edge:'#a8ab8a70'});
  const frontY=r.y+r.h;
  for(let z=18;z<h;z+=18)segment(project(r.x,frontY,z),project(r.x+r.w,frontY,z),'#152521',2);
  if(r.w>65)for(let x=r.x+35;x<r.x+r.w;x+=68)segment(project(x,frontY,4),project(x,frontY,h-3),'#243632',1);
  plane({x:r.x-1,y:r.y-1,w:r.w+2,h:r.h+2},h+2,'#788071','#a4a68c65');
}
function plaque(f,word,z){const p=project(f.x+f.w/2,f.y+f.h,z);ctx.fillStyle='#182322e8';ctx.fillRect(p.x-46,p.y-9,92,18);ctx.strokeStyle='#ab9b655a';ctx.strokeRect(p.x-46,p.y-9,92,18);label(word,p.x,p.y+4,11,'#d6d0ac');}
function rim(r,z,color,width=2){polygon(corners(r,z),null,color,width);}
function turtle(x,y){
  ellipse(x,y+6,33,12,'#101e1977');
  for(const [dx,dy] of [[-23,-8],[-23,12],[21,-8],[20,12]])ellipse(x+dx,y+dy,9,5,'#66836b');
  const gr=ctx.createRadialGradient(x-10,y-12,3,x,y,34);gr.addColorStop(0,'#b0b087');gr.addColorStop(.55,'#718d71');gr.addColorStop(1,'#304d41');
  ellipse(x,y,30,18,gr);ctx.strokeStyle='#3d5e49';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(x,y,21,13,0,0,Math.PI*2);ctx.stroke();
  for(let i=-1;i<=1;i++)segment({x:x-15,y:y+i*6},{x:x+14,y:y+i*6},'#425f4b');
  segment({x,y:y-13},{x,y:y+13},'#425f4b');ellipse(x+32,y-2,12,8,'#9baf8a');ellipse(x+36,y-4,2,2,'#142b25');
}
function vase(x,y,variant=0){
  ctx.save();ctx.translate(x,y);const gr=ctx.createLinearGradient(-18,0,20,0);gr.addColorStop(0,'#65766b');gr.addColorStop(.35,'#c0c4a3');gr.addColorStop(.8,'#8a9b83');gr.addColorStop(1,'#435d53');ctx.fillStyle=gr;ctx.strokeStyle='#30473f';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(-9,-35);ctx.lineTo(9,-35);ctx.bezierCurveTo(4,-22,18,-17,18,-7);ctx.bezierCurveTo(17,9,-17,9,-18,-7);ctx.bezierCurveTo(-18,-17,-4,-22,-9,-35);ctx.fill();ctx.stroke();
  ellipse(0,-35,10,3,'#b8c0a1');ellipse(0,-35,6,1.8,'#4b6358');
  for(let i=0;i<2;i++){ctx.strokeStyle=variant?'#657e72':'#819785';ctx.beginPath();ctx.ellipse(0,-12+i*7,15,4,0,0,Math.PI);ctx.stroke();}ctx.restore();
}
function fixtureOccludes(f,z){const p=project(state.player.x,state.player.y),a=project(f.x,f.y,z),b=project(f.x+f.w,f.y+f.h);return state.player.y<f.y+f.h && p.x>a.x-12&&p.x<b.x+12&&p.y>a.y-8&&p.y-58<b.y;}
function drawFixture(f){if(drawArtFixture(f))return;
  const active=state.mode==='play'&&nearest()===f.id;
  const h=f.kind==='files'?68:f.kind==='board'?36:f.kind==='desk'?40:f.kind==='plinth'?35:34;
  const total=(f.kind==='guide'||f.kind==='cover')?h+42:h;
  ctx.save();if(fixtureOccludes(f,total))ctx.globalAlpha=.58;
  const stone={top:'#939580',front:'#666f63',side:'#404d46',bottom:'#303e39',edge:'#bbc0a080'};
  const wood={top:'#83775b',front:'#595442',side:'#373b32',bottom:'#29332c',edge:'#b5a87780'};
  box(f,h,f.kind==='desk'||f.kind==='files'?wood:stone);
  // Recessed front panel and a warm upper edge give every fixture a readable volume.
  if(f.w>65){const y=f.y+f.h;polygon([project(f.x+9,y,8),project(f.x+f.w-9,y,8),project(f.x+f.w-9,y,h-8),project(f.x+9,y,h-8)],'#121f1d32','#b0b08c22');}
  if(f.kind==='guide'||f.kind==='cover'){
    const inner={x:f.x+7,y:f.y+7,w:f.w-14,h:f.h-14};
    plane(inner,h+1,'#414f4544');
    const at=project(f.x+f.w/2,f.y+f.h*.55,h+3);
    if(f.kind==='guide')turtle(at.x,at.y-4);else vase(at.x,at.y,f.id==='coverB'?1:0);
    const low=corners(inner,h+1),top=corners(inner,h+42);
    polygon([top[3],top[2],low[2],low[3]],'#8fc3bf12','#9cb7a850');
    polygon([top[1],top[2],low[2],low[1]],'#6d989c18','#a7c3b444');
    polygon(top,'#c4dcc11b','#c1d3b57c');
    for(let i=0;i<4;i++)segment(top[i],low[i],'#b8c5ac85',2);
    segment({x:top[0].x+12,y:top[0].y+7},{x:top[3].x+30,y:top[3].y-8},'#d8e5d350',2);
    plaque(f,f.kind==='guide'?'铜龟':'馆藏器物',h/2);
  }else if(f.kind==='board'){
    for(let i=0;i<3;i++){
      const card={x:f.x+13+i*83,y:f.y+10,w:75,h:f.h-22};plane(card,h+2,'#d4c6a2','#6b6d54');
      const p=project(card.x+card.w/2,card.y+card.h*.6,h+4);
      if(i===1&&lionImage.complete)ctx.drawImage(lionImage,p.x-19,p.y-28,38,45);else label(i===0?'A':'C',p.x,p.y+2,25,'#717962');
    }plaque(f,'旧图录',18);
  }else if(f.kind==='desk'){
    for(let i=0;i<3;i++){
      const r={x:f.x+13+i*48,y:f.y+10,w:40,h:36};plane(r,h+3,'#e0d4ad','#9a8c68');
      for(let j=0;j<4;j++)segment(project(r.x+5,r.y+6+j*5,h+4),project(r.x+31-j%2*9,r.y+6+j*5,h+4),'#827957',1);
    }plaque(f,'购买记录',17);
  }else if(f.kind==='files'){
    const y=f.y+f.h;
    for(let i=0;i<3;i++){
      const x=f.x+5+i*(f.w-10)/3,w=(f.w-16)/3;
      polygon([project(x,y,8),project(x+w,y,8),project(x+w,y,57),project(x,y,57)],'#746a4c','#363c32',1);
      segment(project(x+w/2-7,y,33),project(x+w/2+7,y,33),'#c5b27b',3);
      const p=project(x+w/2,y,45);ctx.fillStyle='#d3c9a4';ctx.fillRect(p.x-9,p.y-4,18,7);
    }const p=project(f.x+f.w/2,f.y+f.h/2,h+2);label('通信档案',p.x,p.y+3,12,'#e2d8b1');
  }else {const p=project(f.x+f.w/2,f.y+f.h/2,h+2);label('33—???',p.x,p.y+5,17,'#d6d4b1');plaque(f,'空展台',16);}
  if(active)rim({x:f.x-1,y:f.y-1,w:f.w+2,h:f.h+2},total+1,'#e4ce8e',2.5);
  ctx.restore();
}
function drawHero(){const p=state.player,s=project(p.x,p.y),e=state.damageEffect,age=e?(performance.now()-e.started)/1000:10;ellipse(s.x,s.y+2,20,7,'#020b0d80');paintLion(ctx,s.x,s.y,92,{direction:p.facing,moving:state.walking&&state.mode==='play',integrity:state.integrity,time:state.steps/60,action:e?.kind==='repair'&&age<.8?'repair':state.mode==='play'?'':'inspect',age,slow:keys.has('shift')});if(e&&age<.8){ctx.save();ctx.globalAlpha=(1-age/.8)*.4;ctx.strokeStyle=e.kind==='repair'?'#f2d49c':'#c88b62';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(s.x,s.y-40,29+age*20,40+age*15,0,0,Math.PI*2);ctx.stroke();ctx.restore();}}
function drawGuard(){if(drawArtGuard())return;
  const g=state.guard,p=project(g.x,g.y),step=state.mode==='play'&&g.wait===0&&!reducedMotion?Math.sin((g.x+g.y)*.15)*2:0;
  ellipse(p.x+2,p.y+3,19,7,'#020b0d80');ctx.save();ctx.translate(p.x,p.y);
  ctx.fillStyle='#1b2c30';ctx.strokeStyle='#122325';ctx.lineWidth=2;
  for(const [x,s] of [[-9,step],[7,-step]]){ctx.beginPath();ctx.roundRect(x-4,-15,9,20+s,3);ctx.fill();ellipse(x+1,4+s,8,4,'#122326');}
  const coat=ctx.createLinearGradient(-16,0,16,0);coat.addColorStop(0,'#78908b');coat.addColorStop(.6,'#526f71');coat.addColorStop(1,'#304e56');ctx.fillStyle=coat;ctx.beginPath();ctx.moveTo(-10,-40);ctx.quadraticCurveTo(-19,-32,-15,-12);ctx.quadraticCurveTo(0,-6,15,-12);ctx.quadraticCurveTo(19,-32,10,-40);ctx.closePath();ctx.fill();ctx.stroke();
  segment({x:-13,y:-16},{x:13,y:-16},'#162d31',4);ctx.fillStyle='#bca976';ctx.fillRect(-2,-18,5,4);segment({x:0,y:-35},{x:0,y:-20},'#8b9b8a',1);
  ellipse(0,-46,10,12,'#b5b099');ellipse(-3,-48,8,9,'#d0c5a9');
  ctx.fillStyle='#38565f';ctx.beginPath();ctx.roundRect(-12,-61,24,12,5);ctx.fill();ellipse(0,-50,15,3,'#203e49');ellipse(0,-57,2,2,'#c6b983');
  if(Math.sin(g.angle)>-.5){ellipse(-3+Math.cos(g.angle)*3,-45,1.2,1.5,'#344b48');ellipse(3+Math.cos(g.angle)*3,-45,1.2,1.5,'#344b48');}
  const hx=Math.cos(g.angle)*20,hy=-25+Math.sin(g.angle)*10;segment({x:9,y:-35},{x:hx,y:hy},'#647f7f',8);ellipse(hx,hy,4,4,'#c2b79c');segment({x:hx,y:hy},{x:hx+Math.cos(g.angle)*7,y:hy+Math.sin(g.angle)*7},'#c9bc88',5);ctx.restore();
}
function vision(){
  if(!state.record||state.solved)return;const g=state.guard,obs=obstacles(),points=[project(g.x,g.y)];
  for(let i=0;i<=44;i++){const angle=g.angle-g.halfAngle+i/44*g.halfAngle*2;let length=g.range;
    if(obs.some(r=>C.segmentRect(g.x,g.y,g.x+Math.cos(angle)*length,g.y+Math.sin(angle)*length,r))){let lo=0,hi=length;for(let k=0;k<9;k++){const mid=(lo+hi)/2;if(obs.some(r=>C.segmentRect(g.x,g.y,g.x+Math.cos(angle)*mid,g.y+Math.sin(angle)*mid,r)))hi=mid;else lo=mid;}length=lo;}
    points.push(project(g.x+Math.cos(angle)*length,g.y+Math.sin(angle)*length));
  }
  const origin=project(g.x,g.y),grad=ctx.createRadialGradient(origin.x,origin.y,10,origin.x,origin.y,245);grad.addColorStop(0,state.exposure>.1?'#edb56c80':'#efdda05a');grad.addColorStop(1,'#f1dca507');polygon(points,grad);
}
function drawInteraction(){
  if(state.mode!=='play')return;const info=interactionInfo();if(!info)return;
  const p=project(state.player.x,state.player.y),target=fixtures.find(f=>f.id===info.id);
  const word=info.id==='guide'&&state.letter?'核对证据':target.title.replace('另一展柜 · ','');
  const w=38+word.length*12,x=Math.min(1200-w/2,Math.max(80+w/2,p.x)),y=Math.max(145,p.y-122);
  ctx.fillStyle='#101d20ed';ctx.strokeStyle='#c7b578';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(x-w/2,y,w,28,5);ctx.fill();ctx.stroke();
  ctx.fillStyle='#e3c789';ctx.beginPath();ctx.roundRect(x-w/2+5,y+5,18,18,3);ctx.fill();label('E',x-w/2+14,y+18,12,'#24332e');label(word,x+11,y+19,12,'#eee1b5');
}
function draw(){
  lastPaintAt=performance.now();
  if(!floorReady)makeFloor();ctx.clearRect(0,0,1280,720);ctx.drawImage(floorLayer,0,0);
  ctx.save();ctx.beginPath();ctx.rect(0,118,1280,536);ctx.clip();
  // Back wall is a tall face, side walls and partitions are depth-sorted in sections.
  for(let x=48;x<1220;x+=96)wallBlock({x,y:148,w:Math.min(96,1232-x),h:12},62);
  for(const [x,y] of [[160,159],[440,159],[812,159],[1118,159]]){const p=project(x,y,48);glow(p.x,p.y+30,62,76,'#dfc37c20');ellipse(p.x,p.y,5,3,'#d3bc82');segment({x:p.x-10,y:p.y-3},{x:p.x+10,y:p.y-3},'#403e2c',4);}
  vision();
  if(!state.record)box(gate,44,{top:'#8f8a68',front:'#5e6551',side:'#344a40',bottom:'#263e34'});else plane(gate,0,'#cabf8b0b','#a99c6540');
  const layers=fixtures.map(f=>({y:f.y+f.h,draw:()=>drawFixture(f)}));
  for(const wall of [...walls,{x:48,y:160,w:16,h:466},{x:1216,y:160,w:16,h:466}])for(let y=wall.y;y<wall.y+wall.h;y+=58){const r={x:wall.x,y,w:wall.w,h:Math.min(58,wall.y+wall.h-y)};layers.push({y:y+r.h,draw:()=>{ctx.save();if(fixtureOccludes(r,72))ctx.globalAlpha=.5;wallBlock(r,wall.x===48||wall.x===1216?58:70);ctx.restore();}});}
  layers.push({y:state.player.y,draw:drawHero});if(state.record)layers.push({y:state.guard.y,draw:drawGuard});layers.sort((a,b)=>a.y-b.y).forEach(l=>l.draw());
  // Lower cutaway wall frames the room while leaving the play space visible.
  for(let x=48;x<1232;x+=96)wallBlock({x,y:626,w:Math.min(96,1232-x),h:14},20);
  drawInteraction();ctx.restore();
  ctx.fillStyle='#101a21f5';ctx.fillRect(0,0,1280,116);ctx.fillStyle='#101a21e8';ctx.fillRect(0,654,1280,66);
}
function render(){draw();requestAnimationFrame(render);}

'use strict';
const $ = id => root.querySelector('#'+id);
const canvas = $('scene'), ctx = canvas.getContext('2d'), C = MuseumCore;
const bounds = {x:64,y:160,w:1152,h:466};
const walls = [{x:620,y:150,w:28,h:215},{x:620,y:470,w:28,h:166}];
const gate = {x:620,y:365,w:28,h:105};
const fixtures = [
  {id:'guide',x:90,y:206,w:125,h:88,kind:'guide',title:'另一展柜 · 铜龟'},
  {id:'pictures',x:285,y:205,w:270,h:94,kind:'board',title:'旧图录'},
  {id:'plinth',x:120,y:442,w:110,h:72,kind:'plinth',title:'空展台'},
  {id:'records',x:390,y:488,w:165,h:65,kind:'desk',title:'购买记录台'},
  {id:'coverA',x:705,y:375,w:90,h:110,kind:'cover',title:'遮挡展柜'},
  {id:'coverB',x:850,y:310,w:150,h:90,kind:'cover',title:'遮挡展柜'},
  {id:'coverC',x:1010,y:440,w:100,h:70,kind:'cover',title:'遮挡展柜'},
  {id:'letters',x:1068,y:158,w:130,h:48,kind:'files',title:'通信档案柜'}
];
const actions = {guide:'与铜龟交谈',pictures:'辨认旧图录',records:'查购买记录',letters:'查对应通信'};
const patrol = [{x:820,y:250},{x:1130,y:250},{x:1130,y:530},{x:820,y:530}];
const lionShape = `<defs><linearGradient id="stone" x2=".7" y2="1"><stop stop-color="#e4d8b6"/><stop offset=".48" stop-color="#b6a784"/><stop offset="1" stop-color="#716d5d"/></linearGradient><linearGradient id="mane" x2="1" y2=".8"><stop stop-color="#b5ab8c"/><stop offset="1" stop-color="#626653"/></linearGradient></defs><g stroke="#535649" stroke-width="2.4" stroke-linejoin="round"><path fill="url(#stone)" d="M32 64Q22 78 28 91L43 95L53 95L69 92L65 68Z"/><g data-part="leg"><path fill="url(#stone)" d="M28 89L20 105Q11 117 27 118H39L43 91Z"/><path fill="none" d="M32 102L32 112"/></g><path fill="url(#stone)" d="M53 91L58 116H78Q88 113 80 106L69 100L69 90Z"/><g data-part="arm"><path fill="#8e8a72" d="M25 78Q14 82 14 94Q6 99 9 107L20 105L31 84Z"/></g><path fill="url(#stone)" d="M61 65L76 60L82 40Q90 32 98 42L94 54L88 58L84 76L65 83Z"/><path fill="url(#mane)" d="M23 52Q9 44 14 31Q8 17 24 15Q29 2 43 9Q57 0 68 11Q83 7 89 22Q99 35 88 46Q90 62 71 66L33 65Z"/><path fill="url(#stone)" d="M28 30Q35 16 47 24Q60 15 76 30L76 49Q64 64 44 57L27 47Z"/><path fill="#4b584b" d="M33 31L45 29L43 36L35 37ZM58 29L70 33L66 38L58 36Z"/><path fill="#6e705b" d="M44 39Q51 35 59 41L54 47H48Z"/><path fill="none" d="M35 47Q50 61 68 46M24 23Q16 31 23 36M24 43Q16 49 27 55M78 18Q90 26 82 34M80 47Q86 55 72 59M34 70Q41 78 53 71M66 106L67 114"/><path fill="none" stroke="#f3e9cc" stroke-width="1.8" opacity=".65" d="M31 25L38 21M31 39L31 45M32 80L30 87M65 69L76 67M46 62L57 62"/><path fill="none" stroke="#747965" stroke-width="1" d="M41 79L45 84L41 90M66 41L62 43M62 18L58 22"/></g>`;
const horseShape = `<g fill="#a8b8ac" stroke="#485b57" stroke-width="3"><path d="M20 50L59 42L65 14L84 10L92 26L77 31L78 68L60 76L61 112H49L44 77L32 78L23 112H10L17 70Z"/><path d="M63 20L58 6L73 14 M19 55L6 43L6 71" fill="none"/><circle cx="80" cy="21" r="3" fill="#243e3a"/></g>`;
const wingShape = `<g fill="#aeb8bd" stroke="#495763" stroke-width="3"><path d="M25 60L7 21L43 37L55 17L79 26L88 53L74 77L88 111H66L54 85L37 112H16L29 80Z"/><path d="M29 61L20 35L46 48 M67 46H80" fill="none"/><circle cx="69" cy="35" r="3" fill="#203242"/></g>`;
let svgSerial=0;
// Each inline portrait needs its own gradient IDs, including hidden overlays.
const svg = shape => {
  const suffix='-'+(++svgSerial);
  for(const id of ['stone','mane'])shape=shape.replaceAll('id="'+id+'"','id="'+id+suffix+'"').replaceAll('url(#'+id+')','url(#'+id+suffix+')');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 104 124" aria-hidden="true">${shape}</svg>`;
};

function bodyShape(){return lionShape;}
const lionImages=[0,1,2,3].map(h=>{const image=new Image();image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg(bodyShape(h)));return image;});
const lionImage=lionImages[3];
const selections={};
const conditionNames=['力竭 · 在安全处恢复','伤痕加深 · 移速85%','轻微伤痕 · 仍可正常调查','完好 · 自由行动'];

$('intro-art').innerHTML='<img src="'+assetUrl('hero/portrait.png')+'" alt="金色狮子化身">';
let state, keys = new Set(), lastTick=performance.now(), accumulator=0, toastUntil=0, previousMode='play', transitionUntil=0;

function newGuard(){return {x:1130,y:250,next:2,angle:Math.PI/2,speed:78,wait:1.2,range:245,halfAngle:.56};}
function fresh(){return {mode:'intro',player:{x:160,y:555,r:14,facing:'down'},talked:false,identity:false,record:false,letter:false,solved:false,level:1,elapsed:0,exposure:0,catches:0,wrong:0,guard:newGuard(),near:null,steps:0,integrity:3,damageCount:0,shatters:0,damageEffect:null,checkpoint:null,handoff:null};}
function obstacles(){return [...walls,...fixtures,...(state.record?[]:[gate])];}
function formatTime(sec){return `${Math.floor(sec/60).toString().padStart(2,'0')}:${Math.floor(sec%60).toString().padStart(2,'0')}`;}
function show(id){root.querySelectorAll('.overlay').forEach(el=>el.hidden=el.id!==id);keys.clear();}
function setMode(mode){state.mode=mode;route=[];show(mode==='play'?null:mode);updateHud();if(['identify','records','letters'].includes(mode))sound.tone(320,.12);saveState();}
function caption(text){$('caption').textContent=text;}
function toast(text){$('toast').textContent=text;$('toast').hidden=false;toastUntil=performance.now()+2600;}
function reset(){state=fresh();Object.keys(selections).forEach(clearSelection);keys.clear();accumulator=0;lastTick=performance.now();transitionUntil=0;$('transition').hidden=true;$('toast').hidden=true;$('city').value='';$('dealer').value='';$('connect-submit').disabled=false;$('interact').disabled=true;$('interact').textContent='靠近柜台任一侧，按 E 调查';caption('夜里，另一座展柜传来了一声轻轻的呼唤。');setMode('intro');}
function updateHud(){
  $('clock').textContent=formatTime(state.elapsed);$('progress').textContent=`${Number(state.record)+Number(state.solved)} / 2`;
  $('chapter').textContent=state.record?'归途 / 博物馆 · 潜行与追溯':'归途 / 博物馆 · 搜证与辨认';
  $('heading').textContent=state.solved?'我找到了前一站。':state.record?'灯光之后，藏着来时的信。':'是谁把我带到了这里？';
  $('objective').textContent=state.solved?'记忆落点：1933年，北京，古董商Burchard。':!state.talked?'先听听另一展柜的文物怎么说。':!state.identity?'去旧图录，对照抬爪与鬃毛，认出自己的展签。':!state.record?'用33-670，在购买记录台找到属于自己的资料。':!state.letter?'避开右侧巡逻，查通信档案柜；展柜可以挡住视线。':'带着通信返回铜龟身边，将两份证据关联。';
  $('pill-identity').textContent=state.identity?'身份：33-670':'身份待认';
  for(const [id,have] of [['identity',state.identity],['record',state.record],['letter',state.letter]])$('pill-'+id).classList.toggle('have',have);
  $('stealth').hidden=!state.record||state.solved;
  root.dataset.mode=state.mode;root.dataset.level=state.level;root.dataset.integrity=state.integrity;
  $('integrity-value').textContent=state.integrity+' / 3';
  $('integrity-label').textContent=conditionNames[state.integrity];
  $('integrity-cells').innerHTML=[1,2,3].map(n=>'<i class="'+(n<=state.integrity?'filled':'')+'"></i>').join('');
  root.querySelectorAll('.damage-status').forEach(el=>{el.innerHTML='<img src="'+assetUrl('hero/frames/states-'+(state.integrity<2?2:state.integrity===2?1:0)+'-0.png')+'" alt="伤痕状态"><span><b>完整度 '+state.integrity+' / 3</b><br>'+conditionNames[state.integrity]+'</span>';});
  $('notes-button').disabled=!['play','pause'].includes(state.mode);
  $('pause-button').disabled=state.mode!=='play';
}
function talk(){
  if(state.letter){$('connect-feedback').textContent='把“采购经手人”和“古董商”区分开。';setMode('connect');return;}
  let text;
  if(!state.identity)text='<p>“小狮子，你也醒了？”</p><p>“名字忘了，身体总还记得。你如今是苏醒的化身；图录里的原貌有卷曲鬃毛、一只抬起的前爪。右边的旧图录，应该有你的展签。”</p><p>“记住编号，再去下方的购买记录台。那会告诉你，自己是什么时候来到这里的。”</p>';
  else if(!state.record)text='<p>“33-670，是你的编号。去下方的购买记录台，用它找到对应的那一份。”</p><p>“别只看石狮两个字，有些记录写的是别的藏品。”</p>';
  else text='<p>“1933年，席克门经手……接下来的线索，在右上方通信档案柜。”</p><p>“等灯光转过去，躲在展柜后面走。拿到对应通信，回来找我。”</p>';
  $('dialogue-text').innerHTML=text;$('dialogue-next').textContent=state.record?'记住了，去找通信':state.identity?'去查购买记录':'去找旧图录';setMode('dialogue');
}
function closePanel(){if(['identify','records','letters','connect','dialogue'].includes(state.mode)){if(state.mode==='dialogue')state.talked=true;setMode('play');}}
function interactionInfo(){return C.interaction(state.player,fixtures.filter(f=>actions[f.id]&&!(f.id==='letters'&&!state.record)),obstacles());}
function nearest(){return interactionInfo()?.id||null;}
function inspect(){
  if(state.mode!=='play')return;const id=nearest();if(!id){toast('走近文物或柜台，再按 E。');return;}
  const fixture=fixtures.find(f=>f.id===id);if(fixture){const dx=fixture.x+fixture.w/2-state.player.x,dy=fixture.y+fixture.h/2-state.player.y;state.player.facing=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');}
  if(id==='guide'){talk();return;}
  if(id==='pictures'){
    if(!state.talked){toast('先听听另一展柜的文物说什么。');return;}
    if(state.identity){toast('已经确认：抬爪石狮，编号33-670。');return;}
    $('identity-feedback').textContent='对照轮廓，再选择对应的展签。';setMode('identify');return;
  }
  if(id==='records'){
    if(!state.identity){toast('还不知道自己的编号。先去旧图录辨认。');return;}
    if(state.record){toast('已收好购买记录：33-670，1933年。');return;}
    $('record-clue').textContent='我的展签：护法石狮 · 编号 33-670。编号相同，才是同一件文物。';$('record-feedback').textContent='将自己的编号与档案逐一核对。';setMode('records');return;
  }
  if(id==='letters'){
    if(state.letter){toast('通信已收好。返回铜龟身边核对证据。');return;}
    if(C.visible(state.guard,state.player,obstacles())||state.exposure>.12){toast('灯光正在扫这里。先躲开，再打开档案柜。');return;}
    $('letter-feedback').textContent='核对年份、藏品和经手人。';setMode('letters');
  }
}

function clearSelection(name){
  const entry=selections[name];if(!entry)return;entry.selected=null;
  root.querySelectorAll('#'+name+'-cards .card').forEach(b=>{b.classList.remove('selected');b.setAttribute('aria-pressed','false');});
  $(name+'-confirm').disabled=true;
}
function makeCards(container,items,onChoose){
  const name=container.replace('-cards',''),host=$(container),mode={identity:'identify',record:'records',letter:'letters'}[name];
  selections[name]={selected:null};host.replaceChildren();
  items.forEach(item=>{
    const b=document.createElement('button');b.className='card';b.id=item.id;b.innerHTML=item.html;b.setAttribute('aria-pressed','false');
    b.addEventListener('click',()=>{clearSelection(name);selections[name].selected=item;b.classList.add('selected');b.setAttribute('aria-pressed','true');$(name+'-confirm').disabled=false;$(name+'-feedback').textContent='已选中，点击“确认”提交。翻阅和更换选择不扣完整度。';});host.append(b);
  });
  $(name+'-confirm').onclick=()=>{const selected=selections[name].selected;if(state.mode!==mode||!selected)return;clearSelection(name);onChoose(selected);};
}
function safePoint(){
  const points=[{x:160,y:555,name:'空展台旁'},{x:260,y:345,name:'铜龟展柜旁'}];
  if(state.record)points.push({x:680,y:420,name:'档案区门内'});
  return {...C.nearestSafePoint(state.player,points)};
}
function takeDamage(cause){sound.hurt();
  if(state.integrity===0||state.solved)return;
  state.integrity=C.damageResult(state.integrity);state.damageCount++;
  state.damageEffect={kind:'damage',started:performance.now()};
  caption((cause==='guard'?'被保安发现':'确认了错误线索')+'，完整度 -1。'+conditionNames[state.integrity]);
  if(state.integrity===0){
    state.shatters++;state.checkpoint=safePoint();
    $('shattered-reason').textContent=(cause==='guard'?'灯光锁定了你。':'这条线索无法拼合。')+'狮子伤痕累累，暂时失去了力气，在'+state.checkpoint.name+'休息恢复。已确认的身份、购买记录和通信全部保留。';
    setMode('shattered');
  }else{updateHud();toast('完整度 -1 · '+conditionNames[state.integrity]);}
}
function wrongAnswer(feedback,message){state.wrong++;$(feedback).textContent=message+' 完整度 -1。';takeDamage('answer');}
function returnToSafety(restore){route=[];sound.memory();
  const point=state.checkpoint||safePoint();state.player.x=point.x;state.player.y=point.y;state.player.facing='down';
  state.exposure=0;state.guard=newGuard();state.checkpoint=null;
  if(restore){state.integrity=3;state.damageEffect={kind:'repair',started:performance.now()};}
  setMode('play');caption(restore?'休息后，伤痕淡去了。身体完好了，记住的事还在。':'先躲开灯光。带着已经找到的证据继续走。');
  toast((restore?'已恢复，完整度恢复3格':'已退回安全处')+' · 证据保留');
}

makeCards('identity-cards',[
 {id:'identity-a',correct:false,html:'<img src="'+assetUrl('museum/catalog-wing.png')+'" alt="翼兽旧影">'+'<b>旧影 A</b><small>翼状轮廓 · 两前足落地<br>展签 28-106</small>'},
 {id:'identity-b',correct:true,html:'<img src="'+assetUrl('museum/catalog-lion.png')+'" alt="文物原貌：卷鬃抬爪石狮">'+'<b>旧影 B</b><small>卷曲鬃毛 · 一只前爪抬起<br>展签 33-670</small>'},
 {id:'identity-c',correct:false,html:'<img src="'+assetUrl('museum/catalog-horse.png')+'" alt="陶马旧影">'+'<b>旧影 C</b><small>长颈细腿 · 马形轮廓<br>展签 41-208</small>'}
],item=>{if(!item.correct){wrongAnswer('identity-feedback','这不是记忆里的原貌。再看看抬起的前爪和鬃毛。');return;}state.identity=true;caption('记忆里这只抬起的前爪，是我。33-670……原来他们这样记住我。');setMode('play');toast('认出自己的旧影 · 获得编号33-670');});
makeCards('record-cards',[
 {id:'record-a',correct:false,html:'<b>购藏资料 A</b><strong>33-607</strong><small>护法石狮<br>1933年 · 另一编号<br>演示干扰资料</small>'},
 {id:'record-b',correct:false,html:'<b>购藏资料 B</b><strong>41-208</strong><small>陶马<br>1941年 · 另一藏品<br>演示干扰资料</small>'},
 {id:'record-c',correct:true,html:'<b>购藏资料 C</b><strong>33-670</strong><small>护法石狮<br>1933年购入<br>经手：Laurence Sickman</small>'}
],item=>{if(!item.correct){wrongAnswer('record-feedback','编号与展签不一致。数字的顺序也要对得上。');return;}state.record=true;state.level=2;state.guard=newGuard();caption('1933年。那段来时的路，也许就藏在相关通信里。');setMode('level-one');});
makeCards('letter-cards',[
 {id:'letter-a',correct:false,html:'<b>资料 A / 修复便条</b><strong>1933</strong><small>关于一件陶器的修复<br>没有石狮或席克门记录<br>演示干扰资料</small>'},
 {id:'letter-b',correct:true,html:'<b>资料 B / 通信记要</b><strong>1933.07.10</strong><small>席克门致 J. C. Nichols<br>馆方据此说明石狮购买来源<br>关联：护法石狮</small>'},
 {id:'letter-c',correct:false,html:'<b>资料 C / 展览便条</b><strong>1948</strong><small>关于一幅绘画的借展<br>没有本次购藏信息<br>演示干扰资料</small>'}
],item=>{if(!item.correct){wrongAnswer('letter-feedback','这份资料接不上购买记录。需要1933年、石狮和席克门这三条线索。');return;}setMode('letter-read');});

function beginGame(){state.mode='play';talk();}
function caught(){
  if(state.mode!=='play')return;state.catches++;state.exposure=1;state.checkpoint=safePoint();takeDamage('guard');
  if(state.integrity>0){$('caught-description').textContent='完整度 -1，'+conditionNames[state.integrity]+'。退回'+state.checkpoint.name+'，已收集的证据保留。';setMode('caught');}
}
function retry(){if(state.mode==='caught')returnToSafety(false);}
function reassemble(){if(state.mode==='shattered')returnToSafety(true);}
function pause(){if(state.mode==='play')setMode('pause');}
function openNotes(){
  previousMode=state.mode;let html='<p>苏醒后，你成为金色的小狮子。旧图录记录的是文物原貌：卷曲鬃毛、一只前爪抬起。</p><img class="original-relic" src="'+assetUrl('museum/catalog-lion.png')+'" alt="文物原貌">';
  html+=state.identity?'<div class="clue">确认身份：护法石狮 · 33-670。</div>':'<p>尚未在旧图录中确认自己的展签。</p>';
  html+=state.record?'<div class="clue">购买记录：1933年购入；采购经手为Laurence Sickman（席克门）。</div>':'<p>购买记录尚未找到。</p>';
  html+=state.letter?'<div class="clue">通信与来源记要：古董商Otto Burchard；此前已知地点为北京。</div>':'<p>相关通信尚未取得。</p>';
  $('notes-content').innerHTML=html;setMode('notes');
}
function closeNotes(){setMode(previousMode);}
function connect(){
  if(state.mode!=='connect'||state.solved)return;
  if(!$('city').value||!$('dealer').value){$('connect-feedback').textContent='请先选好地点和人物。尚未提交，不扣完整度。';return;}
  if($('city').value!=='beijing'||$('dealer').value!=='burchard'){
    wrongAnswer('connect-feedback','再核对资料中的“所在地”和“交易卖方”，它们与当前馆址、采购经手人不同。');$('connect-submit').disabled=true;return;
  }
  state.solved=true;state.integrity=3;state.damageEffect={kind:'repair',started:performance.now()};state.mode='transition';show(null);transitionUntil=performance.now()+2800;$('transition').innerHTML='记忆归位，伤痕淡去。<small>完整度已恢复 · 1933年 · 北京 · 古董商Burchard</small>';$('transition').hidden=false;caption('纸上的名字，变成了记忆里的一扇门。');updateHud();
}
function finish(){state.mode='ending';state.handoff={schemaVersion:1,fromScene:'museum',nextScene:'antique-dealer',integrity:3,evidence:{identity:'33-670',purchaseYear:1933,letterDate:'1933-07-10',dealer:'Otto Burchard',city:'Beijing'},memory:['purchase-year','previous-owner'],gameplaySeconds:+state.elapsed.toFixed(2),stats:{wrong:state.wrong,catches:state.catches,shatters:state.shatters}};saveState();options.onComplete(JSON.parse(JSON.stringify(state.handoff)));$('end-wrong').textContent=state.wrong;$('end-shatters').textContent=state.shatters;$('end-time').textContent=formatTime(state.elapsed);$('end-catches').textContent=state.catches;$('transition').hidden=true;show('ending');updateHud();}

$('start').onclick=beginGame;$('dialogue-next').onclick=()=>{state.talked=true;setMode('play');caption(state.record?'先避开灯光，找到通信，再回来核对。':'先在旧图录认出自己，再用编号查购买记录。');};
canvas.addEventListener('click',clickWorld);$('interact').onclick=inspect;$('enter-level-two').onclick=()=>{setMode('play');caption('右侧的门开了。看清保安朝向，展柜后面是安全的。');};
$('take-letter').onclick=()=>{state.letter=true;setMode('play');caption('资料收好了。现在，带着它回到铜龟身边。');toast('获得对应通信 · 返回左侧安全区');};
$('connect-submit').onclick=connect;$('city').onchange=$('dealer').onchange=()=>{$('connect-submit').disabled=false;};$('reassemble').onclick=reassemble;$('retry').onclick=retry;$('pause-button').onclick=pause;$('resume').onclick=()=>setMode('play');
$('restart').onclick=reset;$('restart-pause').onclick=reset;$('notes-button').onclick=openNotes;$('end-notes').onclick=openNotes;$('close-notes').onclick=closeNotes;$('notes-back').onclick=closeNotes;
root.querySelectorAll('[data-close]').forEach(b=>b.onclick=closePanel);
window.addEventListener('keydown',e=>{if(externalPaused)return;
  const key=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key)&&e.target.tagName!=='SELECT')e.preventDefault();
  if(key==='escape'){if(state.mode==='play')pause();else if(state.mode==='pause')setMode('play');else if(state.mode==='notes')closeNotes();else closePanel();return;}
  if(state.mode!=='play')return;
  if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key))keys.add(key);
  if(key==='e'&&!e.repeat)inspect();if(key==='j'&&!e.repeat)openNotes();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(key))route=[];if(key==='shift')keys.add(key);
});
window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>{keys.clear();pause();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keys.clear();pause();}});

function updateGuard(dt){
  const g=state.guard;if(g.wait>0){g.wait=Math.max(0,g.wait-dt);return;}
  const target=patrol[g.next],dx=target.x-g.x,dy=target.y-g.y,d=Math.hypot(dx,dy);
  if(d<g.speed*dt){g.x=target.x;g.y=target.y;g.next=(g.next+1)%patrol.length;g.wait=.85;const t=patrol[g.next];g.angle=Math.atan2(t.y-g.y,t.x-g.x);}
  else{g.angle=Math.atan2(dy,dx);g.x+=dx/d*g.speed*dt;g.y+=dy/d*g.speed*dt;}
}
function step(dt){
  if(externalPaused||document.hidden||state.mode!=='play')return;
  const p=state.player;let dx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft')),dy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
  if(!dx&&!dy&&route.length){const next=route[0],dist=Math.hypot(next.x-p.x,next.y-p.y);if(dist<5){route.shift();if(!route.length&&pendingInspect){pendingInspect=false;inspect();}}else{dx=(next.x-p.x)/dist;dy=(next.y-p.y)/dist;}}const mag=Math.hypot(dx,dy);state.walking=!!mag;if(mag){dx/=mag;dy/=mag;p.facing=Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up');const speed=215*C.movementMultiplier(state.integrity)*(keys.has('shift')?.65:1);C.move(p,dx*speed*dt,dy*speed*dt,obstacles(),bounds);state.steps++;if(performance.now()-lastFootstep>330){lastFootstep=performance.now();sound.step();}}
  if(state.record){
    updateGuard(dt);const g=state.guard,obs=obstacles(),seen=C.visible(g,p,obs)||(Math.hypot(g.x-p.x,g.y-p.y)<27&&!obs.some(r=>C.segmentRect(g.x,g.y,p.x,p.y,r)));
    state.exposure=C.clamp(state.exposure+dt*(seen?1.2:-1.6),0,1);
    const withoutObstacles=C.visible(g,p,[]);
    $('stealth-label').textContent=seen?'暴露！快退到展柜后':withoutObstacles?'展柜遮挡 · 当前安全':'安全 · 留意巡逻朝向';
    $('stealth-label').style.color=seen?'#efae87':'#9fc5ad';$('exposure').style.width=`${state.exposure*100}%`;
    if(state.exposure>=1){caught();return;}
  }
  state.near=nearest();$('interact').disabled=!state.near;
  $('interact').textContent=state.near?`E · ${state.near==='guide'&&state.letter?'核对两份证据':actions[state.near]}`:'走近柜台按 E 调查';
}
function tick(){
  const now=performance.now(),realDt=(now-lastTick)/1000;lastTick=now;
  if(!externalPaused&&!document.hidden&&['play','dialogue','identify','records','level-one','letters','letter-read','connect','transition'].includes(state.mode))state.elapsed+=realDt;
  accumulator+=Math.min(realDt,.25);let count=0;while(accumulator>=1/60&&count++<16){step(1/60);accumulator-=1/60;}
  $('clock').textContent=formatTime(state.elapsed);root.dataset.mode=state.mode;
  if(transitionUntil&&state.mode==='transition'&&now>=transitionUntil){transitionUntil=0;finish();}
  if(!$('toast').hidden&&now>toastUntil)$('toast').hidden=true;
  // Embedded browsers can throttle requestAnimationFrame while still accepting input.
  if(now-lastPaintAt>120)draw();
}

window.addEventListener('guitu:overlay',e=>{externalPaused=!!e.detail;keys.clear();state.walking=false;});
window.addEventListener('error',e=>{if(e.message){$('error').hidden=false;$('error').textContent='运行出现错误，请刷新后重试：'+e.message;}});
// QA can observe state but cannot move actors, grant evidence, or solve puzzles.
window.museumSnapshot=()=>({mode:state.mode,player:{x:+state.player.x.toFixed(1),y:+state.player.y.toFixed(1)},near:nearest(),interaction:interactionInfo(),talked:state.talked,identity:state.identity,record:state.record,letter:state.letter,solved:state.solved,level:state.level,integrity:state.integrity,speed:215*C.movementMultiplier(state.integrity),damageCount:state.damageCount,shatters:state.shatters,checkpoint:state.checkpoint?{...state.checkpoint}:null,elapsed:+state.elapsed.toFixed(2),catches:state.catches,wrong:state.wrong,exposure:+state.exposure.toFixed(3),guard:{x:+state.guard.x.toFixed(1),y:+state.guard.y.toFixed(1),angle:+state.guard.angle.toFixed(3)},inSight:C.visible(state.guard,state.player,obstacles())});
window.museumHandoff=()=>state.handoff?JSON.parse(JSON.stringify(state.handoff)):null;
reset();
if(options.initial){state={...fresh(),...options.initial,player:{...options.initial.player},guard:options.initial.guard||newGuard(),damageEffect:null,mode:'play'};if(!state.integrity){state.mode='shattered';$('shattered-reason').textContent='伤痕累累，先回安全处恢复。已获得的证据保留。';}show(state.mode==='play'?null:state.mode);updateHud();}else beginGame();
setInterval(tick,1000/60);setInterval(saveState,700);requestAnimationFrame(render);
options.observe?.(()=>window.museumSnapshot());
return ()=>{saveState();disposed=true;intervals.forEach(clearInterval);frames.forEach(cancelAnimationFrame);listeners.forEach(([target,type,fn,opts])=>target.removeEventListener(type,fn,opts));root.replaceChildren();};

}
