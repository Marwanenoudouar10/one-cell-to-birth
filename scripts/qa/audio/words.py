import array, wave, math, re
SR=48000
def read(p):
    w=wave.open(p); return [x/32768 for x in array.array('h',w.readframes(w.getnframes()))]
def rms(x,a,b):
    a=max(0,int(a*SR)); b=min(len(x),int(b*SR))
    return math.sqrt(sum(v*v for v in x[a:b])/max(1,b-a))
def db(v): return 20*math.log10(v+1e-9)
st={k:(read(f'qa-audio-vo-{k}.wav'),read(f'qa-audio-sfx-{k}.wav')) for k in ['stem','speechband','phone']}
src=open('../src/theme/voTiming.ts').read()
import json
js=json.loads(src[src.index('= {')+2:src.rindex(';')])
script={'l1':"It starts with a race.",'l2':"Millions run. Only one wins.",'l3':"One cell becomes two… four… hundreds.",'l4':"Week six: a tiny heart starts to beat.",'l5':"Week twelve: fingers, toes, a face.",'l6':"Week twenty: the first kick.",'l7':"Week forty: one cell has become a whole new human.",'l8':"Hello, world."}
print(f"{'word':12s} {'t0':>6s} {'t1':>6s} | full VO  SFX  diff | speech VO SFX diff | >120Hz VO SFX diff")
for lid,t in js.items():
    ws=script[lid].split(' '); ts=t['words']+[t['end']]
    for i,w in enumerate(ws):
        a,b=ts[i],ts[i+1]
        row=[]
        for k in ['stem','speechband','phone']:
            v,s=st[k]; rv,rs=db(rms(v,a,b)),db(rms(s,a,b)); row.append((rv,rs))
        if row[0][1]>-60:
            print(f"{w:12s} {a:6.2f} {b:6.2f} | "+" | ".join(f"{rv:5.1f} {rs:5.1f} {rv-rs:5.1f}" for rv,rs in row))
