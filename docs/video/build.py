"""Assemble the Nexus Kit teaser: 3 Seedance clips + a Ken Burns pass over the wizard screenshot, narration (Benji), title cards, GIF preview.
Run from this folder: python build.py  (needs the Playwright ffmpeg build; edit FF if yours lives elsewhere)."""
import subprocess,pathlib,os,json
here=pathlib.Path(__file__).parent;img=here.parent/'img'
FF=os.environ.get('FFMPEG') or 'C:/Users/biyik/AppData/Local/Programs/Python/Python312/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe' # full build (pip install imageio-ffmpeg); Playwright's ffmpeg lacks mp3/x264
def run(*a):print(' '.join(str(x) for x in a)[:200]);subprocess.run([FF,'-y','-hide_banner','-loglevel','error',*map(str,a)],check=True)
def dur(p):
 out=subprocess.run([FF,'-i',str(p)],capture_output=True,text=True).stderr
 import re;m=re.search(r'Duration: (\d+):(\d+):([\d.]+)',out);return int(m[1])*3600+int(m[2])*60+float(m[3]) if m else 0
W,H,FPS=1280,720,24
font='C\\:/Windows/Fonts/arialbd.ttf'
# 1) Scenes: each clip stretched/trimmed to its narration line (+0.4 s breath), scaled to 1280x720.
scenes=[('clip-0.mp4','benji-01.mp3',None),('clip-0.mp4','benji-02.mp3','NEXUS · gokhanbiyik.com/nexus'),('clip-1.mp4','benji-03.mp3','KG ATELIER · gokhanbiyik.com    FUDŌ · fudo.tattoo'),('kenburns','benji-04.mp3','NEXUS KIT · KOLAY YOL · 6 ADIM'),('clip-2.mp4','benji-05.mp3','haritada bir nokta ol · gokhanbiyik.com/nexus/#kur')]
parts=[]
for i,(src,voice,caption) in enumerate(scenes):
 v=here/voice
 if not v.exists():continue
 length=dur(v)+.5;out=here/f'scene-{i}.mp4'
 draw=f",drawtext=fontfile='{font}':text='{caption}':fontcolor=white@0.92:fontsize=30:x=48:y=h-88:box=1:boxcolor=black@0.45:boxborderw=14" if caption else ''
 if src=='kenburns':
  run('-loop','1','-i',img/'atlas-wizard.png','-i',v,'-t',f'{length:.2f}','-filter_complex',f"[0:v]scale=1600:-1,zoompan=z='min(zoom+0.0008,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={int(length*FPS)}:s={W}x{H}:fps={FPS}{draw}[v]",'-map','[v]','-map','1:a','-c:v','libx264','-pix_fmt','yuv420p','-r',FPS,'-c:a','aac','-shortest',out)
 else:
  run('-stream_loop','-1','-i',here/src,'-i',v,'-t',f'{length:.2f}','-filter_complex',f"[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS}{draw}[v]",'-map','[v]','-map','1:a','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-shortest',out)
 parts.append(out)
# 2) Title card (2.4 s) and end card (3 s), silent.
def card(name,lines,seconds):
 out=here/name;dt=''.join(f",drawtext=fontfile='{font}':text='{t}':fontcolor={c}:fontsize={s}:x=(w-text_w)/2:y={y}" for t,c,s,y in lines)
 run('-f','lavfi','-i',f'color=c=0x0f1714:s={W}x{H}:d={seconds}:r={FPS}','-f','lavfi','-i','anullsrc=r=44100:cl=mono','-t',seconds,'-vf',f"format=yuv420p{dt}",'-c:v','libx264','-c:a','aac','-shortest',out);return out
title=card('card-title.mp4',[('NEXUS KIT','0xe9e9df',96,'h/2-90'),('kendi 3B mekânını kur, haritaya çık','0xc9b27a',36,'h/2+30'),('rehberin Satori','0x8fd3ff',26,'h/2+90')],2.4)
end=card('card-end.mp4',[('gokhanbiyik.com/nexus/#kur','0xe9e9df',56,'h/2-60'),('github.com/Biyikgokhan/nexus-kit','0xc9b27a',34,'h/2+20'),('MIT · herkes kendi alan adında, kendi anahtarıyla','0x8fd3ff',24,'h/2+80')],3)
# 3) Concat with short crossfades → mp4, then a 480px GIF preview.
lst=here/'concat.txt';lst.write_text(''.join(f"file '{p.name}'\n" for p in [title,*parts,end]),encoding='utf-8')
run('-f','concat','-safe','0','-i',lst,'-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-movflags','+faststart',here/'nexus-kit-tanitim.mp4')
run('-i',here/'nexus-kit-tanitim.mp4','-vf','fps=10,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=96[p];[s1][p]paletteuse=dither=bayer','-loop','0',here/'nexus-kit-tanitim.gif')
print('done',dur(here/'nexus-kit-tanitim.mp4'),'s')
