import array, wave, math, subprocess, json
SR=48000
def band(p,af):
    out=subprocess.run(['ffmpeg','-loglevel','error','-i',p,'-af',af,'-f','s16le','-ac','1','-ar','48000','-'],capture_output=True).stdout
    a=array.array('h'); a.frombytes(out); return [x/32768 for x in a]
def db(v): return 20*math.log10(v+1e-9)
HP='highpass=f=200,highpass=f=200,highpass=f=200'
def win_max(x,w=int(0.05*SR)):
    best=0
    for i in range(0,len(x)-w+1 if len(x)>w else 1,w//2):
        seg=x[i:i+w]; r=math.sqrt(sum(v*v for v in seg)/len(seg)); best=max(best,r)
    return best
# VO reference: median 50ms window RMS of active speech
vo=band('out/qa-audio-vo-stem.wav','anull'); voh=band('out/qa-audio-vo-stem.wav',HP)
def med_active(x):
    w=int(0.05*SR); rs=[math.sqrt(sum(v*v for v in x[i:i+w])/w) for i in range(0,len(x)-w,w)]
    rs=sorted(r for r in rs if r>10**(-40/20)); return rs[len(rs)//2], rs[int(len(rs)*0.9)]
m,p90=med_active(vo); mh,p90h=med_active(voh)
print(f'VO active 50ms RMS median full {db(m):.1f} p90 {db(p90):.1f} | >200Hz median {db(mh):.1f} p90 {db(p90h):.1f}')
clips=json.load(open('out/qa-audio-times.json'))
seen={}
for c in clips:
    if c['kind']!='sfx': continue
    p='public/'+c['src']
    if p not in seen: seen[p]=(win_max(band(p,'anull')),win_max(band(p,HP)))
    full,hp=seen[p]; g=c['vol']
    print(f"{c['src']:18s} @{c['t']:6.2f} vol {g:.2f}  peak50ms full {db(full*g):6.1f} ({db(full*g)-db(m):+5.1f} vs VO med) | >200Hz {db(hp*g):6.1f} ({db(hp*g)-db(mh):+5.1f} vs VO>200 med)  lost by HP {db(full)-db(hp):5.1f} dB")
