"""Synthetic fictional character voices, generated locally from Chinese text."""
from pathlib import Path
import json,subprocess,wave,array,math
r=Path(__file__).resolve().parents[1];tmp=r/'work/voice';tmp.mkdir(parents=True,exist_ok=True)
script=json.loads((r/'src/voice-script.json').read_text());manifest={}
for line in script:
 ident=line['id'];raw=tmp/(ident+'.wav');aiff=tmp/(ident+'.aiff');out=r/'public/assets'/(ident+'.wav')
 if not raw.exists():
  subprocess.run(['/usr/bin/say','-v','Tingting','-r','150' if line['speaker']=='旧铜像' else '160','-o',str(aiff),line['text']],check=True)
  subprocess.run(['/usr/bin/afconvert','-f','WAVE','-d','LEI16@22050','-c','1',str(aiff),str(raw)],check=True)
 with wave.open(str(raw),'rb') as f:rate=f.getframerate();a=array.array('h',f.readframes(f.getnframes()))
 x=[v/32768 for v in a];active=[i for i,v in enumerate(x)if abs(v)>.008]
 if active:x=x[max(0,active[0]-200):min(len(x),active[-1]+1000)]
 # Lower the bronze guide by around 3.5 semitones and add a restrained room echo.
 speed=.82 if line['speaker']=='旧铜像' else 1.0;length=int(len(x)/speed);y=[];lp=0
 for i in range(length):
  t=i*speed;j=min(int(t),len(x)-1);n=min(j+1,len(x)-1);v=x[j]+(x[n]-x[j])*(t-j)
  lp=.48*v+.52*lp;y.append(lp)
 y.extend([0.0]*int(rate*.19));dry=y[:]
 if line['speaker']=='旧铜像':
  for delay,gain in [(.045,.11),(.092,.055),(.16,.025)]:
   off=int(rate*delay)
   for i in range(off,len(y)):y[i]+=dry[i-off]*gain
 peak=max(map(abs,y))or 1;scale=.84/peak
 for i in range(min(160,len(y))):y[i]*=i/160;y[-1-i]*=i/160
 data=array.array('h',(max(-32767,min(32767,int(v*scale*32767)))for v in y))
 with wave.open(str(out),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes(data.tobytes())
 manifest[line['text']]={'id':ident,'duration':round(len(y)/rate,3),'speaker':line['speaker']}
 print(ident,line['speaker'],round(len(y)/rate,2),'s',flush=True)
(r/'src/voice-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print('24 local voiced lines generated.',flush=True)
