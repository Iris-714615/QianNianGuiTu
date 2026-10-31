"""Original loopable pentatonic plucked ambience; no remote sound dependency."""
import math,random,wave,array
from pathlib import Path
rate=22050;duration=48;n=rate*duration
rng=random.Random(47);left=[0.0]*n;right=[0.0]*n
notes=[(0,220),(3,293.665),(6,329.628),(9,440),(12,391.995),(15,329.628),(18,293.665),(21,220),(24,261.626),(27,329.628),(30,391.995),(33,523.251),(36,440),(39,329.628),(42,293.665)]
for k,(start,f) in enumerate(notes):
 pan=.35+.3*(k%3)/2
 for j in range(min(rate*6,n-int(start*rate))):
  t=j/rate;env=(1-math.exp(-t*90))*math.exp(-t/1.8)
  tone=sum(math.sin(2*math.pi*f*h*t+.015*math.sin(t*5))*w*math.exp(-t*h*.1) for h,w in [(1,1),(2,.31),(3,.16),(4,.07)])
  v=tone*env*.2;idx=int(start*rate)+j;left[idx]+=v*(1-pan*.4);right[idx]+=v*(.6+pan*.4)
  echo=idx+int(.29*rate)
  if echo<n:left[echo]+=v*.15;right[echo]+=v*.21
for i in range(n):
 t=i/rate;fade=min(1,t/1.2,(duration-t)/1.5)
 room=(math.sin(2*math.pi*110*t)*.012+math.sin(2*math.pi*164.81*t)*.008)*(1+.15*math.sin(t*.3))
 left[i]=(left[i]+room+rng.uniform(-.002,.002))*fade;right[i]=(right[i]+room+rng.uniform(-.002,.002))*fade
peak=max(max(map(abs,left)),max(map(abs,right)));scale=.83/peak
samples=array.array('h')
for l,r in zip(left,right):samples.extend((int(l*scale*32767),int(r*scale*32767)))
p=Path(__file__).resolve().parents[1]/'public/assets/ambient.wav'
with wave.open(str(p),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(rate);w.writeframes(samples.tobytes())
rms=math.sqrt(sum((v/32767)**2 for v in samples)/len(samples))
print(f'Original soundtrack: {duration}s, stereo, {rate}Hz, peak=.83, RMS={rms:.3f}')
assert rms>.04
