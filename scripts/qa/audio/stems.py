import array, wave, json, math, sys
R=''
SR=48000
def read(p):
    w=wave.open(p); ch=w.getnchannels(); n=w.getnframes()
    a=array.array('h',w.readframes(n))
    if ch==1: return [x/32768 for x in a]
    return [ (a[i]+a[i+1])/65536 for i in range(0,len(a),2)]
def write(p,s):
    out=array.array('h',(int(max(-1,min(1,x))*32767) for x in s))
    w=wave.open(p,'wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(out.tobytes()); w.close()
clips=json.load(open(R+'out/qa-audio-times.json'))
N=30*SR
vo=[0.0]*N; sfx=[0.0]*N
cache={}
for c in clips:
    s=cache.setdefault(c['src'],read(R+'public/'+c['src']))
    t0=int(round(c['frame']/30*SR)); g=c['vol']
    dst=vo if c['kind']=='vo' else sfx
    for i,x in enumerate(s):
        j=t0+i
        if j<N: dst[j]+=x*g
write(R+'out/qa-audio-vo-stem.wav',vo)
write(R+'out/qa-audio-sfx-stem.wav',sfx)
mix=[a+b for a,b in zip(vo,sfx)]
write(R+'out/qa-audio-mix-model.wav',mix)
print('model peak dBFS', 20*math.log10(max(abs(x) for x in mix)))
