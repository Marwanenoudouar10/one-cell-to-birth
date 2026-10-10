import array, wave, math, json
SR=48000
def read(p):
    w=wave.open(p); return [x/32768 for x in array.array('h',w.readframes(w.getnframes()))]
f=read('out/qa-audio-film-mono.wav'); h=read('out/qa-audio-film-hp3k.wav')
def db(v): return 20*math.log10(v+1e-9)
def rms(x,a,b): a=max(0,a); seg=x[a:b]; return math.sqrt(sum(v*v for v in seg)/max(1,len(seg)))
clips=json.load(open('out/qa-audio-times.json'))
durs={'vo/l1.wav':1.782,'vo/l2.wav':3.262,'vo/l3.wav':4.072,'vo/l4.wav':3.43,'vo/l5.wav':3.664,'vo/l6.wav':2.563,'vo/l7.wav':4.045,'vo/l8.wav':1.129,'sfx/heartbeat.wav':3.5,'sfx/impact.wav':2.0,'sfx/kick.wav':0.6,'sfx/pop-hi.wav':0.269229,'sfx/pop-hi2.wav':0.212125,'sfx/pop-lo.wav':0.5,'sfx/pop.wav':0.35,'sfx/riser.wav':4.0,'sfx/whoosh-low.wav':1.282062,'sfx/whoosh.wav':1.0}
print('edge                         t      step(sample jump dBFS)  HF3k 2ms dB  HF3k prev20ms dB  spike')
for c in clips:
    for edge,t in (('start',c['t']),('end',c['t']+durs[c['src']])):
        i=int(round(t*SR))
        if i>=len(f)-100: continue
        # max one-sample jump within +-1.5ms
        jump=max(abs(f[j+1]-f[j]) for j in range(i-72,i+72))
        hf=rms(h,i-48,i+96); prev=rms(h,i-1200,i-120)
        print(f"{c['src']:18s} {edge:5s} {t:7.3f}  {db(jump):7.1f}  {db(hf):7.1f}  {db(prev):7.1f}  {db(hf)-db(prev):+6.1f}")
