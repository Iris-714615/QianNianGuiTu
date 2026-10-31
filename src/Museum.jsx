import React,{useEffect,useRef} from 'react';
import markup from './museum.html?raw';
import {mountMuseum} from './museum-runtime';
import {run,persist,assetUrl} from './shared';
import {heroReady} from './hero';
import './museum.css';
export function Museum({onComplete}){
 const host=useRef();
 useEffect(()=>{let dispose,cancelled=false;const id=run.runId;host.current.innerHTML=markup.replace('__ORIGINAL__',assetUrl('museum/catalog-lion.png'));heroReady.then(()=>{if(cancelled)return;dispose=mountMuseum(host.current,{initial:run.museum,onComplete,save(s){if(run.runId!==id)return;run.museum=s;run.integrity=s.integrity;run.museumSeconds=s.elapsed;run.gameplaySeconds=s.elapsed+run.chapter2Seconds;run.stats={...run.stats,wrong:s.wrong,catches:s.catches,shatters:s.shatters};persist()},observe(fn){window.guituMuseumSnapshot=fn}})}).catch(e=>{if(!cancelled)host.current.innerHTML='<p class="load-error">'+e.message+'，请重新打开游戏。</p>'});return()=>{cancelled=true;dispose?.();delete window.guituMuseumSnapshot}},[]);
 return <div className="museum-host" ref={host}/>;
}
