import {assetUrl} from './shared.js';
const images={};
export const heroReady=Promise.all(['walk','states','events'].map(name=>new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{images[name]=img;resolve()};img.onerror=()=>reject(Error('角色素材未加载：'+name));img.src=assetUrl('hero/'+name+'.png')})));
const rows={down:0,right:1,up:2,left:3},cols={down:0,left:1,up:2,right:3};
const reduce=typeof matchMedia!=='undefined'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
export function heroFrame({direction='down',moving=false,integrity=3,action='',time=0,age=10,slow=false}={}){
 let sheet='states',row=0,col=cols[direction]??0;
 if(integrity===0){sheet='events';row=0;col=3}
 else if(moving){sheet='walk';row=rows[direction]??0;col=Math.floor(time*(slow?5:8))%4}
 else if(direction==='down'&&['surprised','think','discover','weak','celebrate'].includes(action)){sheet='events';row=0;col=action==='celebrate'?2:({surprised:0,think:1,discover:2,weak:3}[action])}
 else if(integrity<3&&!moving){row=integrity===2?1:2}
 else if(action==='inspect'){row=3}
 return {sheet,row,col};
}
export function drawHero(ctx,x,y,size,opts={}){
 const f=heroFrame(opts),img=images[f.sheet];if(!img)return;
 const t=opts.time||0,moving=opts.moving&&!reduce,hop=0;
 ctx.save();ctx.translate(x,y-hop);if(moving&&opts.integrity<3)ctx.rotate(Math.sin(t*7)*.015);
 // All states keep four limbs. Walk frames articulate both legs; scars follow the body.
 ctx.drawImage(img,f.col*512,f.row*512,512,512,-size/2,-size*.95,size,size);
 if(opts.action==='repair'&&opts.age<.8&&!reduce){ctx.globalAlpha=(1-opts.age/.8)*.7;ctx.strokeStyle='#efd491';ctx.lineWidth=size*.025;ctx.beginPath();ctx.ellipse(0,-size*.4,size*(.26+opts.age*.15),size*.45,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
 if(opts.integrity>0&&opts.integrity<3&&moving){ctx.strokeStyle='#714324';ctx.lineWidth=Math.max(1,size*.009);const side=opts.direction==='left'?-1:1;for(const [xx,yy] of [[.13,-.63],[-.06,-.31],...(opts.integrity===1?[[.04,-.76],[-.16,-.49]]:[])]){ctx.beginPath();ctx.moveTo(xx*size*side,yy*size);ctx.lineTo((xx+.025)*size*side,(yy+.025)*size);ctx.lineTo((xx+.012)*size*side,(yy+.05)*size);ctx.stroke()}}
 ctx.restore();
}
export function paintHeroCanvas(canvas,opts={}){if(!canvas)return;const ctx=canvas.getContext('2d');ctx.clearRect(0,0,512,512);drawHero(ctx,256,486,512,opts)}
