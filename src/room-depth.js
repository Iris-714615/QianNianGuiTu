import {cabinetFootprint} from './cabinet-geometry.js';
// Percentages describe the same 1672×941 room as the raster and drawer SVG.
// Collision is the floor footprint; the silhouette above it only occludes.
export const roomObjects=[
 {id:'back-left',foot:{x:8.5,y:19,w:31,h:11},depth:30,outline:'140,154 198,100 237,101 242,85 347,81 365,121 408,126 425,106 452,119 457,170 497,166 505,110 534,110 537,86 568,81 576,117 605,131 654,161 657,224 610,225 609,257 489,262 490,207 451,209 443,265 346,266 346,235 317,236 313,283 194,284 191,225 146,223'},
 {id:'desk',foot:{x:44,y:24,w:21,h:8.8},depth:32.8,outline:'737,132 786,126 789,111 825,110 833,127 975,126 981,104 998,86 1014,85 1033,116 1022,148 1072,150 1076,273 1065,287 1047,284 1045,244 1015,245 1015,305 955,306 954,269 768,267 756,288 738,286'},
 {id:'statue',foot:{x:8,y:44.3,w:10.4,h:10},depth:54.3,outline:'131,419 168,419 174,337 182,320 184,293 194,283 199,272 211,275 219,299 233,302 248,330 266,371 275,419 300,423 306,473 292,510 131,509 128,465'},
 {id:'crate',foot:{x:6.5,y:71,w:18.5,h:14.4},depth:85.4,outline:'108,662 244,554 406,611 413,767 319,806 190,777 107,740'},
 {id:'right-vases',foot:{x:83.4,y:24.5,w:9.5,h:9.5},depth:34,outline:'1394,129 1439,123 1438,112 1464,110 1480,128 1483,151 1510,168 1519,224 1555,248 1563,319 1454,325 1446,272 1392,273 1389,190'},
 {id:'debris',foot:{x:87,y:40,w:6,h:12},depth:57,outline:'1388,419 1420,403 1432,371 1460,369 1472,349 1500,352 1548,378 1569,439 1575,491 1561,529 1511,535 1456,518 1402,521 1362,482 1358,462'},
 {id:'cabinet',foot:cabinetFootprint,depth:83.4},
 {id:'front-left',depth:100,outline:'15,799 659,799 662,882 16,883'},
 {id:'front-right',depth:100,outline:'1034,799 1656,798 1657,883 1035,882'}
];
export const footRadius={x:1.5,y:.8};
export function insideFloor(x,y){return y>=29&&y<=85.2&&x>=9.5-(y-29)*.06+footRadius.x&&x<=90.6+(y-29)*.065-footRadius.x}
export function overlapsFoot(x,y,r){return x>r.x-footRadius.x&&x<r.x+r.w+footRadius.x&&y>r.y-footRadius.y&&y<r.y+r.h+footRadius.y}
export function occludesAt(object,footY){return footY<object.depth}
export const roomAspect=1672/941;
export function facingVector(dx,dy){return Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up'}

export function speechPlacement(player,stage,bubble){
 const heroHeight=stage.width*.09*.95,margin=14;
 let x=player.x/100*stage.width,y=player.y/100*stage.height-heroHeight-margin;
 if(y-bubble.height<margin){
  const side=bubble.width/2+stage.width*.045+margin;
  x+=player.x<50?side:-side;
  y=Math.max(bubble.height+margin,Math.min(stage.height-margin,player.y/100*stage.height));
 }
 x=Math.max(bubble.width/2+margin,Math.min(stage.width-bubble.width/2-margin,x));
 return {left:x/stage.width*100,top:y/stage.height*100};
}
