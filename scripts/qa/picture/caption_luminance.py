import subprocess, sys
def lin(c):
    c/=255; return c/12.92 if c<=0.04045 else ((c+0.055)/1.055)**2.4
LUT=[lin(i) for i in range(256)]
def stats(t, y0=1300, y1=1560):
    h=y1-y0
    raw=subprocess.run(["ffmpeg","-v","error","-ss",str(t),"-i","out/birth-teaser-draft2.mp4","-frames:v","1",
        "-vf",f"crop=1080:{h}:0:{y0},scale=270:{h//4}","-f","rawvideo","-pix_fmt","rgb24","-"],capture_output=True).stdout
    Ls=[]
    for i in range(0,len(raw),3):
        r,g,b=raw[i],raw[i+1],raw[i+2]
        Ls.append(0.2126*LUT[r]+0.7152*LUT[g]+0.0722*LUT[b])
    Ls.sort(); n=len(Ls)
    med=Ls[n//2]; p75=Ls[int(n*0.75)]
    # contrast of white (L~0.9 after shadow) vs background median / p75
    cr=lambda L:(0.9+0.05)/(L+0.05)
    return med,p75,cr(med),cr(p75)
for t in [float(x) for x in sys.argv[1:]]:
    m,p,c1,c2=stats(t); print(f"{t:5.2f}s  medL={m:.3f} p75L={p:.3f}  contrast_vs_med={c1:4.1f}:1 vs_p75={c2:4.1f}:1")
