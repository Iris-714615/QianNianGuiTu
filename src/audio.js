// Explicit gesture-unlocked H5 audio. The background is a real local WAV,
// while short interaction sounds use Web Audio at audible frequencies.
export class Sound {
 constructor(url){this.url=url;this.on=false;this.ctx=null;this.base=null;this.music=typeof document!=='undefined'?(document.getElementById?.('ambient-track')||null):null;this.on=!!this.music&&!this.music.paused;this.volume=.65;this.lastError='';this.voiceTrack=null;this.ducked=false;this.voiceSequence=0}
 async start(){
  this.lastError='';
  try{
   const A=window.AudioContext||window.webkitAudioContext;
   if(!this.ctx&&A){this.ctx=new A();this.base=this.ctx.createGain();this.base.connect(this.ctx.destination)}
   if(!this.music){this.music=new Audio(this.url);this.music.loop=true;this.music.preload='auto';this.music.id='ambient-track';this.music.hidden=true;document.body.appendChild(this.music)}
   this.on=true;this.applyVolume();
   // Both requests happen directly from the click, before yielding the gesture.
   const tasks=[this.music.play()];if(this.ctx?.state==='suspended')tasks.push(this.ctx.resume());
   await Promise.all(tasks);
   if(this.music.paused)throw new Error('背景音乐未开始播放');
   return true;
  }catch(e){this.lastError=e?.message||'音频播放失败';this.on=false;this.music?.pause();this.applyVolume();return false}
 }
 applyVolume(){if(this.music)this.music.volume=this.on?this.volume*(this.ducked?.18:.7):0;if(this.base&&this.ctx)this.base.gain.setValueAtTime(this.on?this.volume*.65:0,this.ctx.currentTime)}
 stopVoice(){this.voiceSequence++;if(this.voiceTrack){this.voiceTrack.pause();this.voiceTrack.onended=null;this.voiceTrack.onerror=null}this.ducked=false;this.applyVolume()}
 async speak(url){if(!this.on)return false;this.stopVoice();const sequence=this.voiceSequence;if(!this.voiceTrack){this.voiceTrack=document.getElementById?.('npc-voice')||new Audio();this.voiceTrack.id='npc-voice';this.voiceTrack.hidden=true;document.body.appendChild(this.voiceTrack)}const track=this.voiceTrack;track.src=url;track.volume=this.volume*.98;this.ducked=true;this.applyVolume();const restore=()=>{if(sequence===this.voiceSequence){this.ducked=false;this.applyVolume()}};track.onended=restore;track.onerror=restore;try{await track.play();if(sequence!==this.voiceSequence){return false}return true}catch{restore();return false}}
 setVolume(v){this.volume=Math.max(0,Math.min(1,Number(v)||0));this.applyVolume();if(this.voiceTrack)this.voiceTrack.volume=this.volume*.98}
 async toggle(){if(this.on){this.stopVoice();this.on=false;this.music?.pause();this.applyVolume();return false}return this.start()}
 get playing(){return !!(this.on&&this.music&&!this.music.paused)}
 tone(f=440,d=.5,kind='sine',vol=.3){if(!this.ctx||!this.on||!this.base)return;const o=this.ctx.createOscillator(),g=this.ctx.createGain(),t=this.ctx.currentTime;o.type=kind;o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(this.base);o.start(t);o.stop(t+d+.02);o.onended=()=>{o.disconnect();g.disconnect()}}
 step(){this.tone(185+Math.random()*35,.12,'triangle',.18)}
 memory(){[329.6,493.9,659.3].forEach((f,i)=>setTimeout(()=>this.tone(f,1.4,'sine',.3),i*170))}
 hurt(){this.tone(115,.45,'triangle',.4);this.tone(850,.12,'triangle',.25)}
 preview(){this.tone(523.25,.65,'sine',.6);setTimeout(()=>this.tone(783.99,.65,'sine',.45),220)}
}
