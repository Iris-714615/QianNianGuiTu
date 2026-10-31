export const defaults={videoUrl:'',nextStageUrl:'',videoTitle:'来时的路'};
export async function readConfig(){if(window.__GUI_CONFIG__)return {...defaults,...window.__GUI_CONFIG__};try{const r=await fetch(new URL('game.config.json',document.baseURI));if(!r.ok)return defaults;return {...defaults,...await r.json()}}catch{return defaults}}
export function mediaUrl(value){if(!value)return'';try{const u=new URL(value,document.baseURI);return ['http:','https:','blob:',...(location.protocol==='file:'?['file:']:[])].includes(u.protocol)?u.href:''}catch{return''}}
