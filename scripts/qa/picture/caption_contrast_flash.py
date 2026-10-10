import subprocess, sys
def lin(c):
    c/=255; return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
LUT=[lin(i) for i in range(256)]
TXT=0.2126*LUT[0xFF]+0.7152*LUT[0xF6]+0.0722*LUT[0xF0]
def cr(L): return (TXT+0.05)/(L+0.05)
def frame(t,y0,y1,x0=150,x1=930):
    w=x1-x0;h=y1-y0
    raw=subprocess.run(["ffmpeg","-v","error","-ss",str(t),"-i","out/birth-teaser-draft2.mp4","-frames:v","1",
      "-vf",f"crop={w}:{h}:{x0}:{y0}","-f","rawvideo","-pix_fmt","rgb24","-"],capture_output=True).stdout
    return raw,w,h
for t in [float(x) for x in sys.argv[1:]]:
    raw,w,h=frame(t,1300,1560)
    allL=[];bg=[];ntext=0
    for i in range(0,len(raw),3):
        r,g,b=raw[i],raw[i+1],raw[i+2]
        L=0.2126*LUT[r]+0.7152*LUT[g]+0.0722*LUT[b]
        allL.append(L)
        if r>235 and g>225 and b>215: ntext+=1
        else: bg.append(L)
    allL.sort();bg.sort()
    n=len(allL);m=len(bg)
    print(f"{t:5.2f}s text%={100*ntext/n:4.1f} | band(all) med cr={cr(allL[n//2]):4.1f} p75 cr={cr(allL[int(n*.75)]):4.1f} | bg-only med cr={cr(bg[m//2]):4.1f} p90 cr={cr(bg[int(m*.9)]):4.1f} max-bg cr={cr(bg[int(m*.99)]):4.1f}")
