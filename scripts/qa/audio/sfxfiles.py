import array, wave, math, subprocess, os
SR=48000
def readf(p):
    w=wave.open(p); return [x/32768 for x in array.array('h',w.readframes(w.getnframes()))]
def band(p,af):
    out=subprocess.run(['ffmpeg','-loglevel','error','-i',p,'-af',af,'-f','s16le','-ac','1','-ar','48000','-'],capture_output=True).stdout
    a=array.array('h'); a.frombytes(out); return [x/32768 for x in a]
def db(v): return 20*math.log10(v+1e-9)
def rms(x): return math.sqrt(sum(v*v for v in x)/max(1,len(x)))
B=[('<80','lowpass=f=80,lowpass=f=80,lowpass=f=80'),('80-200','highpass=f=80,highpass=f=80,highpass=f=80,lowpass=f=200,lowpass=f=200,lowpass=f=200'),('200-1k','highpass=f=200,highpass=f=200,highpass=f=200,lowpass=f=1000,lowpass=f=1000,lowpass=f=1000'),('1k-4k','highpass=f=1000,highpass=f=1000,highpass=f=1000,lowpass=f=4000,lowpass=f=4000,lowpass=f=4000'),('>4k','highpass=f=4000,highpass=f=4000,highpass=f=4000')]
print('file            dur   peak   rms  | '+' '.join(f'{b:>7s}' for b,_ in B)+' | first/last sample, last5ms rms dB')
for f in sorted(os.listdir('public/sfx'))+['../vo/l%d.wav'%i for i in range(1,9)]:
    p='public/sfx/'+f; x=readf(p)
    tot=sum(v*v for v in x)
    shares=[]
    for b,af in B:
        y=band(p,af); shares.append(10*math.log10(sum(v*v for v in y)/tot+1e-12))
    l5=x[-240:]; f5=x[:240]
    print(f'{f:15s} {len(x)/SR:5.2f} {db(max(abs(v) for v in x)):6.1f} {db(rms(x)):6.1f} | '+' '.join(f'{s:7.1f}' for s in shares)+f' | {x[0]:+.4f} {x[-1]:+.4f} first5ms {db(rms(f5)):6.1f} last5ms {db(rms(l5)):6.1f}')
