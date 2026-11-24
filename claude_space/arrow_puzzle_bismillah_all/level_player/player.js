/* player.js - game logic only. Rendering = renderer.js, level rules = core.js */
let levels=store.get(KEY,null)||initialLevels(),progress=store.get('ap_progress',{}),cfg=store.get('ap_cfg',{theme:'beige',sound:false,haptics:true,rgb:false});
let idx=0,lv=null,hearts=3,hints=1,hintA=null,showGrid=true,over=false,pal={},cs=40,dpr=1;const cv=$('#cv');
const show=v=>$$('.view').forEach(e=>e.classList.toggle('hidden',e.id!==v));
function applyCfg(){document.body.dataset.theme=cfg.theme;$('#sTheme').value=cfg.theme;$('#sSound').checked=cfg.sound;$('#sHaptics').checked=cfg.haptics;$('#sRgb').checked=cfg.rgb;pal=getPalette();store.set('ap_cfg',cfg)}
function home(){show('home');lv=null;const s=store.get('ap_streak',{count:0});$('#streak').textContent=s.count;$('#trophies').textContent=Math.min(6,Math.floor(Object.keys(progress).length/2));
 const n=levels.findIndex(l=>!progress[l.id]);$('#btnPlay').textContent='Play · '+(n<0?levels[levels.length-1].id:levels[n].id);
 $('#grid').innerHTML=levels.map((l,i)=>`<button class="lv ${i===n?'cur':''}" data-i="${i}">${l.id}<small>${progress[l.id]?'★'.repeat(progress[l.id]):''}</small></button>`).join('')}
function start(i,def){idx=i;lv=mat(def||levels[i]);hearts=3;hints=1;hintA=null;over=false;$('#msg').classList.add('hidden');show('game');$('#title').textContent=lv.name;$('#diff').textContent=lv.difficulty;hud();fit()}
const fit=()=>({cs,dpr}=setupCanvas(cv,$('#stage'),lv));
function hud(){$('#left').textContent=lv.arrows.filter(a=>!a.gone).length;$('#hintN').textContent=hints;$('#hearts').innerHTML=[0,1,2].map(i=>`<span class="${i<hearts?'':'lost'}">♥</span>`).join('')}
addEventListener('resize',()=>lv&&fit());
const buzz=()=>cfg.haptics&&navigator.vibrate&&navigator.vibrate(40);let ac;
function beep(f){if(!cfg.sound)return;try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;g.gain.value=.08;o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+.08)}catch(e){}}
function frame(){requestAnimationFrame(frame);if(lv&&!$('#game').classList.contains('hidden'))drawLevel(cv,lv,{cs,dpr,pal,showGrid,rgb:cfg.rgb,hintA})}
const segD=(px,py,a,b)=>{const ax=(a[0]+.5)*cs,ay=(a[1]+.5)*cs,bx=(b[0]+.5)*cs,by=(b[1]+.5)*cs,l=(bx-ax)**2+(by-ay)**2,t=Math.max(0,Math.min(1,((px-ax)*(bx-ax)+(py-ay)*(by-ay))/l));return Math.hypot(px-ax-t*(bx-ax),py-ay-t*(by-ay))};
function hit(px,py){let best=null,bd=cs*.45;lv.arrows.forEach(a=>{if(a.gone)return;for(let i=1;i<a.cells.length;i++){const d=segD(px,py,a.cells[i-1],a.cells[i]);if(d<bd){bd=d;best=a}}});return best}
function tap(a){if(over)return;if(blockedBy(lv,a)){a.flash=now()+400;hearts--;buzz();beep(180);hud();if(hearts<=0)end(false);return}
 a.gone=true;a.anim={t0:now(),dist:rayCells(a.cells,lv.cols,lv.rows).length+a.cells.length+1};hintA=null;beep(520);hud();if(lv.arrows.every(x=>x.gone))setTimeout(()=>end(true),500)}
function end(win){over=true;const stars=Math.max(1,hearts);let b;
 if(win){if(idx>=0){progress[lv.id]=Math.max(progress[lv.id]||0,stars);store.set('ap_progress',progress)}
  const d=new Date(),td=d.toDateString(),y=new Date(d-864e5).toDateString(),s=store.get('ap_streak',{count:0});if(s.last!==td){s.count=s.last===y?s.count+1:1;s.last=td;store.set('ap_streak',s)}
  b=idx>=0&&idx<levels.length-1?'Next level':'Home';$('#msgT').textContent='Solved '+'★'.repeat(stars);$('#msgP').textContent=hearts+' hearts left'}
 else{b='Retry';$('#msgT').textContent='Out of hearts';$('#msgP').textContent='Tap to try again'}
 $('#msgB').textContent=b;$('#msgB').onclick=()=>win?(b==='Home'?home():start(idx+1)):start(idx,idx>=0?null:toDef(lv));$('#msg').classList.remove('hidden')}
cv.addEventListener('pointerdown',e=>{if(!lv)return;const r=cv.getBoundingClientRect(),a=hit(e.clientX-r.left,e.clientY-r.top);a&&tap(a)});
$('#grid').onclick=e=>{const b=e.target.closest('.lv');b&&start(+b.dataset.i)};
$('#btnPlay').onclick=()=>{const n=levels.findIndex(l=>!progress[l.id]);start(n<0?0:n)};
$('#btnDaily').onclick=()=>{const d=new Date(),seed=d.getFullYear()*372+d.getMonth()*31+d.getDate();start(-1,{id:'daily',name:'Daily puzzle',difficulty:'Daily',cols:9,rows:12,arrows:generate(9,12,14,seed).map(c=>({path:compress(c)}))})};
$('#btnBack').onclick=home;$('#btnGrid').onclick=()=>showGrid=!showGrid;
$('#btnHint').onclick=()=>{if(over||hints<1)return;const f=lv.arrows.find(a=>!a.gone&&!blockedBy(lv,a));if(f){hintA=f;hints--;hud()}};
$$('[data-act=settings]').forEach(b=>b.onclick=()=>$('#settings').classList.remove('hidden'));$('#sClose').onclick=()=>$('#settings').classList.add('hidden');
$('#sTheme').onchange=e=>{cfg.theme=e.target.value;applyCfg()};[['sSound','sound'],['sHaptics','haptics'],['sRgb','rgb']].forEach(([id,k])=>$('#'+id).onchange=e=>{cfg[k]=e.target.checked;applyCfg()});
$('#sImport').onclick=()=>$('#sFile').click();
$('#sFile').onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text());levels=Array.isArray(j)?j:[j];store.set(KEY,levels);$('#settings').classList.add('hidden');home()}catch(x){alert('Invalid levels.json')}};
$('#sReset').onclick=()=>{store.del(KEY);levels=initialLevels();$('#settings').classList.add('hidden');home()};
applyCfg();home();frame();
