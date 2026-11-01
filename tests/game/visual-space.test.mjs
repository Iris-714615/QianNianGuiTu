import test from 'node:test';
import assert from 'node:assert/strict';
import {roomObjects,insideFloor,occludesAt,roomAspect,facingVector,speechPlacement} from '../../src/room-depth.js';
import {cabinetFootprint} from '../../src/cabinet-geometry.js';
import {canWalk,findPath} from '../../src/navigation.js';
test('cabinet collision, room silhouette and drawers share the authoritative footprint',()=>{
 assert.equal(roomObjects.find(o=>o.id==='cabinet').foot,cabinetFootprint);
 for(const o of roomObjects.filter(o=>o.foot)){assert.equal(canWalk(o.foot.x+o.foot.w/2,o.foot.y+o.foot.h/2),false,o.id)}
});
test('foot clearance keeps actors out of slanted walls and just outside crate faces',()=>{
 assert.equal(insideFloor(8,30),false);assert.equal(insideFloor(93,30),false);
 assert.equal(insideFloor(45,85),true);assert.equal(insideFloor(45,87),false);
 assert.equal(canWalk(20,70),true);assert.equal(canWalk(20,70.3),false);
 assert.equal(canWalk(25.5,78),false);assert.equal(canWalk(27,78),true);
});
test('depth switches behind and in front of solid scenery by the same foot coordinate',()=>{
 for(const o of roomObjects){assert.equal(occludesAt(o,o.depth-.01),true,o.id);assert.equal(occludesAt(o,o.depth+.01),false,o.id)}
});
test('routes around every new solid footprint remain traversable with the actual movement step',()=>{
 const stops=[{x:43,y:79},{x:20,y:64},{x:15,y:40},{x:25,y:47},{x:53,y:38},{x:32,y:73},{x:72,y:72},{x:80,y:36}];
 for(const a of stops)for(const b of stops){assert.ok(canWalk(a.x,a.y));const path=findPath(a,b);if(a!==b)assert.ok(path.length,`${JSON.stringify(a)} -> ${JSON.stringify(b)}`);let p=a;for(const q of path){const d=Math.hypot(q.x-p.x,q.y-p.y),steps=Math.ceil(d/.2);for(let n=1;n<=steps;n++)assert.ok(canWalk(p.x+(q.x-p.x)*n/steps,p.y+(q.y-p.y)*n/steps));p=q}}
});
test('horizontal and vertical movement have the same room-pixel speed and matching facing',()=>{
 const xPixels=(22/roomAspect)/100*1672,yPixels=22/100*941;assert.ok(Math.abs(xPixels-yPixels)<1e-9);
 assert.equal(facingVector(1,0),'right');assert.equal(facingVector(-1,0),'left');assert.equal(facingVector(0,-1),'up');assert.equal(facingVector(0,1),'down');
});
test('lion speech stays clear of the full head and body at normal desktop investigation positions',()=>{
 for(const stage of [{width:1280,height:720},{width:875,height:492}])for(const player of [{x:50,y:38},{x:50,y:45},{x:32,y:73},{x:72,y:72},{x:43,y:79}]){
  const bubble={width:stage.width>1000?292:265,height:115};const at=speechPlacement(player,stage,bubble);
  const b={x:at.left/100*stage.width-bubble.width/2,y:at.top/100*stage.height-bubble.height,w:bubble.width,h:bubble.height};
  const hero={x:(player.x/100-.045)*stage.width,y:player.y/100*stage.height-stage.width*.09*.95,w:stage.width*.09,h:stage.width*.09*.95};
  assert.ok(b.x+b.w<=hero.x||b.x>=hero.x+hero.w||b.y+b.h<=hero.y||b.y>=hero.y+hero.h,JSON.stringify({stage,player,b,hero}));
 }
});
