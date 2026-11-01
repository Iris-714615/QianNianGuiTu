import {Sound} from './audio.js';
const KEY='guitu-integrated-v1';
export const overlayState={active:false};
export function setOverlayPaused(active){overlayState.active=active;window.dispatchEvent(new CustomEvent('guitu:overlay',{detail:active}))}
export function assetUrl(rel){return window.__GUI_ASSETS__?.[rel]||new URL(`${import.meta.env?.BASE_URL||'./'}assets/${rel}`,document.baseURI).href}
const videoCache=new Map();
export function videoAssetUrl(name){
 if(!name)return '';const source=assetUrl(name);if(!source.startsWith('data:video/'))return source;
 if(videoCache.has(name))return videoCache.get(name);
 const comma=source.indexOf(','),chunks=[];for(let offset=comma+1;offset<source.length;offset+=262144){const raw=atob(source.slice(offset,offset+262144)),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);chunks.push(bytes)}
 const url=URL.createObjectURL(new Blob(chunks,{type:'video/mp4'}));videoCache.set(name,url);return url;
}
export function freshRun(){return {version:1,runId:Date.now().toString(36)+'-'+Math.random().toString(36).slice(2),chapter:'museum',integrity:3,museum:null,chapter2:null,evidence:{},stats:{wrong:0,catches:0,shatters:0,bumps:0},gameplaySeconds:0,museumSeconds:0,chapter2Seconds:0,finished:false}}
function load(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s?.version===1&&['museum','chapter2','ending'].includes(s.chapter))return {...freshRun(),...s,integrity:Math.max(0,Math.min(3,Number(s.integrity)||0))}}catch{}return freshRun()}
export const run=load();
export const settings=(()=>{try{return {volume:65,muted:false,...JSON.parse(localStorage.getItem(KEY+'-settings')||'{}')}}catch{return {volume:65,muted:false}}})();
export function persist(){try{localStorage.setItem(KEY,JSON.stringify(run))}catch{}}
export function saveSettings(){try{localStorage.setItem(KEY+'-settings',JSON.stringify(settings))}catch{}}
export function resetRun(){Object.assign(run,freshRun());persist()}
export function completeMuseum(detail){run.chapter='chapter2';run.integrity=3;run.evidence={...detail.evidence};run.museumSeconds=detail.gameplaySeconds;run.gameplaySeconds=run.museumSeconds+run.chapter2Seconds;run.stats={...run.stats,...detail.stats};persist()}
export const sound=new Sound(assetUrl('ambient.wav'));
sound.setVolume(settings.volume/100);
export async function unlockSound(){if(settings.muted)return false;return sound.start()}
export const timeString=sec=>`${Math.floor(sec/60).toString().padStart(2,'0')}:${Math.floor(sec%60).toString().padStart(2,'0')}`;
export function movementScale(integrity){return integrity===0?0:integrity===1?.85:1}
export function hitIntegrity(value){return Math.max(0,Math.min(3,value-1))}
