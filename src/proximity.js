// Spatial triggers: short dwell + hysteresis + cooldown. No repeated dialogue
// for every frame or for tiny movements along an interaction boundary.
export class ProximityDirector {
 constructor(){this.entries=new Map();this.last=new Map()}
 poll(points,player,now,{blocked=false,phase=''}={}){
  const candidates=[];
  for(const p of points){const d=Math.hypot((p.ax??p.x)-player.x,(p.ay??p.y)-player.y),k=String(p.id);
   if(d>15){this.entries.delete(k);continue}
   if(d>(typeof p.id==='number'?3:10))continue;
   if(!this.entries.has(k))this.entries.set(k,{since:now,phase,fired:false});
   const entry=this.entries.get(k);
   if(entry.phase!==phase){entry.phase=phase;entry.since=now;entry.fired=false}
   if(!blocked&&!entry.fired&&now-entry.since>=350&&now-(this.last.get(k)??-Infinity)>12000)candidates.push({p,d,k,entry})
  }
  candidates.sort((a,b)=>a.d-b.d);const chosen=candidates[0];if(!chosen)return null;
  chosen.entry.fired=true;this.last.set(chosen.k,now);return chosen.p;
 }
 consume(point,now,phase){const k=String(point.id);this.entries.set(k,{since:now,phase,fired:true});this.last.set(k,now)}
 reset(){this.entries.clear();this.last.clear()}
}
export function expectedTarget({introDone,collected,solved}){if(solved)return'exit';if(!introDone&&collected.length===0)return'guide';if(collected.length===3)return'guide';return [0,1,2].find(id=>!collected.includes(id))}

export function collectionMessage(collected){if([0,1,2].every(id=>collected.includes(id)))return'三片齐了。回到旧铜像身边，把来路接起来。';if(!collected.includes(0))return'还没有找齐。去上方打包台，看看未烧尽的档案。';if(!collected.includes(1))return'还缺一部分。左下木箱的旧布里，露着纸角。';return'旧纸背面写着：乙柜 · 下层。去右墙边的木柜翻找。'}
