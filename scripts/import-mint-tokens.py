from pathlib import Path
import re,json
s=Path('docs/mint/mint-ds-groww-invest-v0.19.md').read_text()
refs={};hues={};neutrals={}
for line in s.splitlines():
 if not line.startswith('|'):continue
 cells=[x.strip().strip('`') for x in line.strip('|').split('|')]
 if len(cells)==4 and cells[1].startswith('hues/'):
  for mode,value in zip(['light','dark'],cells[2:]):hues[cells[1].replace('{mode}',mode)]=value
 if len(cells)==4 and cells[1].startswith('neutrals/'):
  step=cells[1].split('/')[-1]
  for mode,value in zip(['light','dark'],cells[2:]):neutrals[f'new-neutrals/{mode}/{step}']=value
 if len(cells)==3 and re.match(r'^[a-z][a-zA-Z0-9]+$',cells[0]) and all(x.startswith(('hues/','new-neutrals/','light/','dark/','rgba(','backgroundSurface/')) for x in cells[1:]):refs[cells[0]]=cells[1:]
def resolve(ref,mode):
 if ref.startswith('#') or ref.startswith('rgba('):return ref
 if ref in hues:return hues[ref]
 if ref in neutrals:return neutrals[ref]
 key=ref.split('/')[-1]
 if key in refs:return resolve(refs[key][mode],mode)
 raise ValueError(ref)
out={mode:{k:resolve(v[i],i) for k,v in refs.items() if k.startswith(('background','content','border'))} for i,mode in enumerate(['light','dark'])}
for i,mode in enumerate(['light','dark']):
 t=out[mode]
 for surface,step in [('',2),('OnSurfaceZ1',3),('OnSurfaceZ2',4)]:
  for state in ['Hover','Pressed']:
   t['backgroundTransparent'+state+surface]=('rgba(53,56,57,0.04)' if state=='Hover' else 'rgba(53,56,57,0.08)') if mode=='light' else ('rgba(242,245,247,0.06)' if state=='Hover' else 'rgba(242,245,247,0.10)')
 for role,hue in [('Accent','green'),('Positive','green'),('Negative','red'),('Warning','yellow'),('AccentSecondary','blue')]:
  for state in ['Hover','Pressed','Selected']:t['background'+role+state]=hues[f'hues/{hue}/{mode}/10']
 t['backgroundInversePrimary']=out['dark' if mode=='light' else 'light']['backgroundPrimary']
 t['backgroundSurfaceDocked']=t['backgroundSurfaceZ1']
Path('lib/mint-tokens.json').write_text(json.dumps(out,indent=2)+'\n')
css='/* Generated from Mint Groww Invest v0.19. See docs/mint for provenance. */\n'
for mode,selector in [('light',':root, .mint-theme'),('dark','.mint-theme.dark')]:
 css+=selector+' {\n'+''.join(f'  --{k}: {v};\n' for k,v in out[mode].items())+'}\n'
Path('app/mint-tokens.css').write_text(css)
print('Imported',len(out['light']),'use-case tokens per mode')
