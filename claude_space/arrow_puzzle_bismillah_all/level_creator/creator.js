/* creator.js - level editor. Draws with renderer.js, saves the format described in level.schema.json */
let levels=store.get(KEY,null)||initialLevels(),idx=0,lv,tool='draw',draft=null,testing=false,hearts=3,pal,cs=40,dpr=1,theme=store.get('ap_cfg',{theme:'beige'}).theme;const cv=$('#cv');
const say=m=>$('#status').textContent=m,inb=(x,y)=>x>=0&&y>=0&&x<lv.cols&&y<lv.rows,taken=(x,y)=>lv.arrows.some(a=>a.cells.some(c=>c[0]===x&&c[1]===y));
function load(i){idx=i;lv=mat(levels[i]);testing=false;fit();fill()}
const fit=()=>({cs,dpr}=setupCanvas(cv,$('#stage'),lv));
function fill(){$('#eLevel').innerHTML=levels.map((l,i)=>`<option value="${i}">${l.id}. ${l.name}</option>`).join('');$('#eLevel').value=idx;$('#eName').value=lv.name;$('#eDiff').value=lv.difficulty;$('#eCols').value=lv.cols;$('#eRows').value=lv.rows;$('#eJson').value=JSON.stringify(toDef(lv))}
const persist=()=>{store.set(KEY,levels);say('Saved '+levels.length+' levels in this browser. Use Export to get levels.json.')};
function frame(){requestAnimationFrame(frame);drawLevel(cv,lv,{cs,dpr,pal,showGrid:true,dots:!testing,draft})}
const cellOf=e=>{const r=cv.getBoundingClientRect();return[Math.floor((e.clientX-r.left)/cs),Math.floor((e.clientY-r.top)/cs)]};
function hit(px,py){let best=null,bd=cs*.45;lv.arrows.forEach(a=>{if(a.gone)return;for(let i=1;i<a.cells.length;i++){const[p,q]=[a.cells[i-1],a.cells[i]],ax=(p[0]+.5)*cs,ay=(p[1]+.5)*cs,bx=(q[0]+.5)*cs,by=(q[1]+.5)*cs,t=Math.max(0,Math.min(1,((px-ax)*(bx-ax)+(py-ay)*(by-ay))/((bx-ax)**2+(by-ay)**2))),d=Math.hypot(px-ax-t*(bx-ax),py-ay-t*(by-ay));if(d<bd){bd=d;best=a}}});return best}
cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect(),px=e.clientX-r.left,py=e.clientY-r.top;
 if(testing){const a=hit(px,py);if(!a)return;if(blockedBy(lv,a)){a.flash=now()+400;if(--hearts<=0){say('Out of hearts. Press Test play to retry.');testing=false;lv.arrows.forEach(x=>x.gone=false)}else say('Blocked. '+hearts+' hearts left.')}
  else{a.gone=true;a.anim={t0:now(),dist:rayCells(a.cells,lv.cols,lv.rows).length+a.cells.length+1};if(lv.arrows.every(x=>x.gone)){say('Solved! Level works.');setTimeout(()=>{testing=false;lv.arrows.forEach(x=>{x.gone=false;x.anim=null})},900)}}return}
 if(tool==='erase'){const a=hit(px,py);if(a){lv.arrows=lv.arrows.filter(x=>x!==a);fill()}return}
 const[x,y]=cellOf(e);if(inb(x,y)&&!taken(x,y)){draft=[[x,y]];cv.setPointerCapture(e.pointerId)}});
cv.addEventListener('pointermove',e=>{if(!draft)return;const[x,y]=cellOf(e),l=draft[draft.length-1];if(x===l[0]&&y===l[1])return;
 if(draft.length>1&&x===draft[draft.length-2][0]&&y===draft[draft.length-2][1]){draft.pop();return}
 if(Math.abs(x-l[0])+Math.abs(y-l[1])===1&&inb(x,y)&&!taken(x,y)&&!draft.some(c=>c[0]===x&&c[1]===y))draft.push([x,y])});
cv.addEventListener('pointerup',()=>{if(draft&&draft.length>1){lv.arrows.push({cells:draft});fill()}draft=null});
$('#eLevel').onchange=e=>load(+e.target.value);
$('#eName').oninput=e=>lv.name=e.target.value;$('#eDiff').onchange=e=>lv.difficulty=e.target.value;
$('#eSize').onclick=()=>{lv.cols=+$('#eCols').value;lv.rows=+$('#eRows').value;lv.arrows=lv.arrows.filter(a=>a.cells.every(c=>inb(c[0],c[1])));fit();fill()};
$('#eClear').onclick=()=>{lv.arrows=[];fill()};
$$('.seg').forEach(b=>b.onclick=()=>{tool=b.dataset.tool;$$('.seg').forEach(x=>x.classList.toggle('on',x===b))});
$('#eTest').onclick=()=>{testing=!testing;hearts=3;lv.arrows.forEach(a=>{a.gone=false;a.anim=null});say(testing?'Test play: tap arrows to clear them. 3 hearts.':'Back to editing.')};
$('#eCheck').onclick=()=>say(!lv.arrows.length?'Add some arrows first.':solveOrder(lv).length===lv.arrows.length?'Solvable: there is an order that clears every arrow.':'Not solvable: some arrows block each other in a loop. Erase or redraw one.');
$('#eGen').onclick=()=>{lv.arrows=generate(lv.cols,lv.rows,+$('#eCount').value,Math.random()*1e9|0).map(cells=>({cells}));fill();say('Auto-filled '+lv.arrows.length+' arrows (always solvable).')};
$('#eSave').onclick=()=>{levels[idx]=toDef(lv);persist();fill()};
$('#eNew').onclick=()=>{const id=Math.max(0,...levels.map(l=>l.id))+1;levels.push({id,name:'Level '+id,difficulty:'Normal',cols:6,rows:8,arrows:[]});persist();load(levels.length-1)};
$('#eDup').onclick=()=>{const id=Math.max(0,...levels.map(l=>l.id))+1;levels.push({...toDef(lv),id,name:lv.name+' copy'});persist();load(levels.length-1)};
$('#eDel').onclick=()=>{if(levels.length<2||!confirm('Delete this level?'))return;levels.splice(idx,1);persist();load(Math.max(0,idx-1))};
$('#eExport').onclick=()=>{levels[idx]=toDef(lv);const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(levels,null,1)],{type:'application/json'}));a.download='levels.json';a.click()};
$('#eOpen').onclick=()=>$('#eFile').click();
$('#eFile').onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text());levels=Array.isArray(j)?j:[j];persist();load(0)}catch(x){say('Invalid JSON file')}};
$('#eImport').onclick=()=>{try{const j=JSON.parse($('#eJson').value);levels[idx]=j;lv=mat(j);fit();fill();say('Imported into this level. Press Save level to keep it.')}catch(x){say('Invalid JSON: '+x.message)}};
$('#eReset').onclick=()=>{if(!confirm('Reset all levels to defaults?'))return;store.del(KEY);levels=initialLevels();load(0)};
$('#eTheme').onchange=e=>{theme=e.target.value;document.body.dataset.theme=theme;pal=getPalette()};
addEventListener('resize',()=>fit());
document.body.dataset.theme=theme;$('#eTheme').value=theme;pal=getPalette();load(0);frame();
