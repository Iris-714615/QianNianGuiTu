import React from 'react';
import {roomObjects} from './room-depth';
import {roomSize} from './cabinet-geometry';
export function RoomDepth({room,layersRef}){
 return <svg className="room-depth" viewBox={`0 0 ${roomSize.width} ${roomSize.height}`} preserveAspectRatio="none" aria-hidden="true">
  <defs>{roomObjects.filter(o=>o.outline).map(o=><clipPath id={`room-depth-${o.id}`} key={o.id}><polygon points={o.outline}/></clipPath>)}</defs>
  {roomObjects.filter(o=>o.outline).map(o=><g key={o.id} ref={el=>{if(el)layersRef.current[o.id]=el;else delete layersRef.current[o.id]}}><image href={room} width={roomSize.width} height={roomSize.height} clipPath={`url(#room-depth-${o.id})`}/></g>)}
 </svg>
}
