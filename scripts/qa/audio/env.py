import array, wave, math
SR=48000
def read(p):
    w=wave.open(p); return [x/32768 for x in array.array('h',w.readframes(w.getnframes()))]
def db(v): return 20*math.log10(v+1e-9)
for f,step in [('pop',0.01),('pop-hi',0.01),('pop-lo',0.02),('kick',0.02),('impact',0.1),('heartbeat',0.05),('riser',0.25),('whoosh',0.1)]:
    x=read(f'public/sfx/{f}.wav'); w=int(step*SR)
    env=[math.sqrt(sum(v*v for v in x[i:i+w])/w) for i in range(0,len(x)-w+1,w)]
    pk=max(range(len(env)),key=lambda i:env[i])
    # attack: first window above -20 dB re peak
    print(f"{f:10s} win {int(step*1000)}ms peak@{pk*step:.3f}s  env dB re peak: "+' '.join(f"{db(e)-db(env[pk]):.0f}" for e in env))
