import array, wave, math
SR=48000
def read2(p):
    w=wave.open(p); a=array.array('h',w.readframes(w.getnframes()))
    return [a[i]/32768 for i in range(0,len(a),2)],[a[i+1]/32768 for i in range(0,len(a),2)]
fL,fR=read2('qa-audio-film.wav'); rL,rR=read2('qa-audio-raw.wav')
m=wave.open('qa-audio-mix-model.wav'); mm=[x/32768 for x in array.array('h',m.readframes(m.getnframes()))]
def rms(x,a,b): 
    s=sum(v*v for v in x[a:b]); return math.sqrt(s/max(1,b-a))
def db(v): return 20*math.log10(v+1e-12)
print('t  film-raw dB  raw-model dB  film L-R diff dB(rel film) rawL-R')
W=int(0.25*SR)
for k in range(0,120):
    a=k*W;b=a+W
    f=rms(fL,a,b); r=rms(rL,a,b); mo=rms(mm,a,b)
    d=rms([x-y for x,y in zip(fL[a:b],fR[a:b])],0,W); dr=rms([x-y for x,y in zip(rL[a:b],rR[a:b])],0,W)
    if f>1e-4: print(f'{a/SR:5.2f} {db(f):6.1f} {db(f)-db(r):6.2f} {db(r)-db(mo):6.2f}  LR {db(d)-db(f):6.1f} {db(dr)-db(r) if r>1e-5 else 0:6.1f}')
