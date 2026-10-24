import array, wave, math
R='out/'
SR=48000
def read(p):
    w=wave.open(p); ch=w.getnchannels(); n=w.getnframes()
    a=array.array('h',w.readframes(n))
    if ch==1: return [x/32768 for x in a]
    return [a[i]/32768 for i in range(0,len(a),2)],[a[i+1]/32768 for i in range(0,len(a),2)]
L,Rr=read(R+'qa-audio-film.wav')
print('film samples',len(L), len(L)/SR)
print('L==R max diff', max(abs(a-b) for a,b in zip(L,Rr)))
film=[(a+b)/2 for a,b in zip(L,Rr)]
m=read(R+'qa-audio-mix-model.wav')
# alignment: cross-corr over a window around impact 4.9-5.5
def xc(a0,a1,lags):
    best=None
    for lag in lags:
        s=0.0;e1=0;e2=0
        for i in range(int(a0*SR),int(a1*SR),2):
            x=film[i+lag]; y=m[i]; s+=x*y; e1+=x*x; e2+=y*y
        r=s/math.sqrt(e1*e2+1e-12)
        if best is None or r>best[1]: best=(lag,r)
    return best
for a0,a1 in [(0.5,1.5),(4.9,5.6),(13.4,14.0),(21.9,22.4),(26.0,27.0)]:
    coarse=xc(a0,a1,range(-2400,2401,48))
    fine=xc(a0,a1,range(coarse[0]-60,coarse[0]+61,1))
    print(a0,a1,'lag samples',fine[0],'ms',fine[0]/48,'r',round(fine[1],4))
# peaks
pk=max(range(len(L)),key=lambda i:max(abs(L[i]),abs(Rr[i])))
print('film sample peak',20*math.log10(max(abs(L[pk]),abs(Rr[pk]))),'at',pk/SR)
clip=[i for i in range(len(L)) if abs(L[i])>=0.999]
print('samples >= -0.01 dBFS',len(clip), [round(clip[0]/SR,3), round(clip[-1]/SR,3)] if clip else '')
mk=[i for i in range(len(m)) if abs(m[i])>=1.0]
print('model samples >=0dBFS',len(mk), sorted(set(round(i/SR,2) for i in mk))[:40])
