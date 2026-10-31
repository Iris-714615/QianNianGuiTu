// H5 integration: the museum stage may link to
// ./?from=museum&relic=047&seller=collector . Only display-safe strings are read.
const q=new URLSearchParams(location.search);
const clean=(v,fallback)=>String(v||fallback).replace(/[<>\x00-\x1f]/g,'').slice(0,60);
export const incoming={from:q.get('from')==='museum'?'museum':'demo',relic:clean(q.get('relic'),'047'),seller:clean(q.get('seller'),'海外私人收藏者')};
export const defaults={videoUrl:'',nextStageUrl:'',videoTitle:'来时的路'};
export async function readConfig(){try{const r=await fetch(new URL('game.config.json',document.baseURI));if(!r.ok)return defaults;return {...defaults,...await r.json()}}catch{return defaults}}
export function mediaUrl(value){if(!value)return'';try{const u=new URL(value,document.baseURI);return ['http:','https:','blob:'].includes(u.protocol)?u.href:''}catch{return''}}
