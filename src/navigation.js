export const bounds={minX:8,maxX:93,minY:29,maxY:87};
export const obstacles=[
 {x:7,y:58,w:20,h:28}, {x:8,y:8,w:32,h:22},
 {x:44,y:12,w:22,h:21}, {x:76,y:61,w:19,h:23},
 {x:10,y:30,w:9,h:24}, {x:84,y:8,w:12,h:27}
];
export function canWalk(x,y){return x>=bounds.minX&&x<=bounds.maxX&&y>=bounds.minY&&y<=bounds.maxY&&!obstacles.some(b=>x>b.x-1&&x<b.x+b.w+1&&y>b.y-1&&y<b.y+b.h+1)}
export function nearestWalkable(p){if(canWalk(p.x,p.y))return p;let best=null,d=Infinity;for(let x=8;x<=92;x+=2)for(let y=30;y<=86;y+=2)if(canWalk(x,y)){const n=(x-p.x)**2+(y-p.y)**2;if(n<d){d=n;best={x,y}}}return best}
// Grid A* keeps click-to-walk from silently sticking against packing crates.
export function findPath(start,end){const from=nearestWalkable(start),to=nearestWalkable(end);if(!from||!to)return[];
 const cell=p=>({x:Math.round(p.x/2)*2,y:Math.round(p.y/2)*2});let a=cell(from),b=cell(to);a=nearestWalkable(a);b=nearestWalkable(b);const key=p=>p.x+','+p.y,goal=key(b),open=[a],g=new Map([[key(a),0]]),came=new Map(),seen=new Map([[key(a),a]]);
 while(open.length){open.sort((u,v)=>(g.get(key(u))+Math.hypot(u.x-b.x,u.y-b.y))-(g.get(key(v))+Math.hypot(v.x-b.x,v.y-b.y)));const p=open.shift(),pk=key(p);if(pk===goal){let route=[p],k=pk;while(came.has(k)){k=came.get(k);route.push(seen.get(k))}route.reverse();return [...route.slice(1),to]}
  for(const [dx,dy]of [[2,0],[-2,0],[0,2],[0,-2],[2,2],[2,-2],[-2,2],[-2,-2]]){const q={x:p.x+dx,y:p.y+dy};if(!canWalk(q.x,q.y)||!canWalk(p.x+dx,p.y)||!canWalk(p.x,p.y+dy))continue;const qk=key(q),cost=g.get(pk)+Math.hypot(dx,dy);if(cost<(g.get(qk)??Infinity)){g.set(qk,cost);came.set(qk,pk);seen.set(qk,q);if(!open.some(v=>key(v)===qk))open.push(q)}}
 }return[]}
