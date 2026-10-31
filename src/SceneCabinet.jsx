import React from 'react';
import {cabinetDrawers,roomSize} from './cabinet-geometry';
import './scene-cabinet.css';
export function SceneCabinet({room,paper,column,level,opened,onDrawer,onTake,occluderRef}){
 return <svg className="scene-cabinet" viewBox={`0 0 ${roomSize.width} ${roomSize.height}`} preserveAspectRatio="none" aria-label="右墙边的九格旧木柜">
  <defs><clipPath id="cabinet-body"><polygon points="1264,542 1564,542 1579,619 1569,781 1274,783 1262,625"/></clipPath><linearGradient id="drawer-inside" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#090c0b"/><stop offset=".7" stopColor="#23231a"/><stop offset="1" stopColor="#4d3d28"/></linearGradient>{cabinetDrawers.map(d=><clipPath id={`drawer-${d.column}-${d.level}`} key={d.column+d.level}><rect x={d.x} y={d.y} width={d.width} height={d.height}/></clipPath>)}</defs>
  <g ref={occluderRef} pointerEvents="none"><image href={room} width={roomSize.width} height={roomSize.height} clipPath="url(#cabinet-body)"/></g>
  {cabinetDrawers.map(d=>{const pulled=column===d.column&&level===d.level;return <g key={d.column+d.level}  className={`scene-drawer ${pulled?'pulled':''}`} onClick={()=>onDrawer(d.column,d.level)}>
   <title>{`${d.column}柜 · ${d.level} · ${pulled?'点击推回':'点击拉开'}`}</title>
   <rect role="button" tabIndex="0" aria-label={`拉开${d.column}柜${d.level}抽屉`} className="drawer-hit" x={d.x} y={d.y} width={d.width} height={d.height} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onDrawer(d.column,d.level)}}}/>
   {pulled&&<><rect className="drawer-interior" x={d.x} y={d.y} width={d.width} height={d.height} fill="url(#drawer-inside)"/><path d={`M${d.x+3},${d.y+d.height-4}h${d.width-6}`} stroke="#6d5839" strokeWidth="1.4"/>{opened?<image role="button" tabIndex="0" aria-label="取走抽屉里的残图" href={paper} x={d.x+27} y={d.y+1} width="35" height="25" className="drawer-paper" onClick={e=>{e.stopPropagation();onTake()}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();onTake()}}}/>:<text className="empty-drawer" x={d.x+d.width/2} y={d.y+14} textAnchor="middle">空</text>}</>}
   {pulled&&<g className="scene-drawer-front" style={{transformOrigin:`${d.x+d.width/2}px ${d.y+d.height}px`}}><image href={room} width={roomSize.width} height={roomSize.height} clipPath={`url(#drawer-${d.column}-${d.level})`}/></g>}
   
   {!pulled&&<text className="drawer-ink" x={d.x+44} y={d.y+11} textAnchor="middle">{d.column}</text>}
  </g>})}
 </svg>
}
