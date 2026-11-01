import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)};
globalThis.window={};globalThis.document={baseURI:'https://game.example/test/',getElementById:()=>null};
globalThis.Image=class{set src(value){this.url=value;queueMicrotask(()=>this.onload?.())}};
const {run,resetRun,completeMuseum,hitIntegrity,movementScale,persist,assetUrl,videoAssetUrl}=await import('../../src/shared.js');
const {heroFrame,heroReady}=await import('../../src/hero.js');await heroReady;
const {MuseumCore}=await import('../../src/museum-core.js');
test('handoff preserves real evidence and repairs condition, fresh run clears all chapter data',()=>{
 resetRun();const id=run.runId;run.integrity=1;run.museum={identity:true,record:true,letter:true};
 const evidence={identity:'33-670',purchaseYear:1933,letterDate:'1933-07-10',city:'Beijing',dealer:'Otto Burchard'};
 completeMuseum({evidence,gameplaySeconds:54.2,stats:{wrong:2,catches:1,shatters:0}});
 assert.equal(run.chapter,'chapter2');assert.equal(run.integrity,3);assert.deepEqual(run.evidence,evidence);assert.equal(run.gameplaySeconds,54.2);
 run.chapter2={collected:[0,1,2],solved:true};persist();assert.equal(JSON.parse(storage.get('guitu-integrated-v1')).chapter2.collected.length,3);
 resetRun();assert.notEqual(run.runId,id);assert.equal(run.chapter2,null);assert.deepEqual(run.evidence,{});assert.equal(run.stats.wrong,0);
});
test('three damage events stop movement; one remaining integrity slows exactly 15 percent',()=>{let n=3;for(let i=0;i<3;i++)n=hitIntegrity(n);assert.equal(n,0);assert.equal(hitIntegrity(n),0);assert.equal(movementScale(0),0);assert.equal(movementScale(1),.85);assert.equal(movementScale(2),1)});
test('all hero directions select proper walk rows and intact injury states; exhaustion uses only approved event row',()=>{
 for(const [direction,row] of Object.entries({down:0,right:1,up:2,left:3})){for(const integrity of [1,2,3]){const f=heroFrame({direction,moving:true,integrity,time:.4});assert.equal(f.sheet,'walk');assert.equal(f.row,row);assert.ok(f.col>=0&&f.col<4)}assert.equal(heroFrame({direction,integrity:0}).row,0)}
 assert.equal(heroFrame({direction:'up',action:'inspect'}).col,2);assert.equal(heroFrame({integrity:1}).row,2);
});
test('moving out of investigation never glides on an idle frame or flips to a front-only event',()=>{
 for(const direction of ['down','up','left','right'])for(const action of ['inspect','discover','repair'])assert.equal(heroFrame({direction,moving:true,action,time:.3}).sheet,'walk');
 for(const direction of ['up','left','right'])assert.equal(heroFrame({direction,action:'discover'}).sheet,'states');
});
test('manifest injury rows contain scars, and no dismemberment actions are shipped',async()=>{const m=JSON.parse(await fs.readFile(new URL('../../public/assets/hero/animations.json',import.meta.url)));assert.deepEqual(m.stateRows,['idle','light-scars','heavy-scars','investigate']);assert.equal(m.actions.shatter,undefined);assert.equal(m.actions.repair.to,'idle')});
test('offline asset URLs resolve without network and development paths keep subdirectory',()=>{window.__GUI_ASSETS__={'hero/walk.png':'data:image/png;base64,TEST'};assert.equal(assetUrl('hero/walk.png'),'data:image/png;base64,TEST');delete window.__GUI_ASSETS__;assert.equal(assetUrl('map.png'),'https://game.example/test/assets/map.png')});
test('embedded CG survives base64 chunk boundaries and reuses one playable Blob URL',async()=>{
 const bytes=Uint8Array.from({length:400003},(_,i)=>(i*29+17)%256);
 window.__GUI_ASSETS__={'cg-test.mp4':'data:video/mp4;base64,'+Buffer.from(bytes).toString('base64')};
 const url=videoAssetUrl('cg-test.mp4');assert.ok(url.startsWith('blob:'));assert.equal(videoAssetUrl('cg-test.mp4'),url);
 assert.deepEqual(new Uint8Array(await (await fetch(url)).arrayBuffer()),bytes);delete window.__GUI_ASSETS__;URL.revokeObjectURL(url);
});
test('museum display cases physically occlude the guard field of view',()=>{const guard={x:0,y:0,angle:0,range:400,halfAngle:.7},player={x:200,y:0};assert.equal(MuseumCore.visible(guard,player,[]),true);assert.equal(MuseumCore.visible(guard,player,[{x:80,y:-40,w:30,h:80}]),false);assert.equal(MuseumCore.visible({...guard,angle:Math.PI},player,[]),false)});
