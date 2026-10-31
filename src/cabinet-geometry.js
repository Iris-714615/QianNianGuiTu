// All coordinates share the actual room artwork coordinate system.
export const roomSize={width:1672,height:941};
export const cabinetFootprint={x:75.5,y:57,w:19,h:26.3};
export const cabinetApproach={x:72,y:72};
export const cabinetDrawers=['上层','中层','下层'].flatMap((level,row)=>['甲','乙','丙'].map((column,col)=>({column,level,x:[1288,1383,1475][col],y:[632,677,722][row],width:88,height:39})));
