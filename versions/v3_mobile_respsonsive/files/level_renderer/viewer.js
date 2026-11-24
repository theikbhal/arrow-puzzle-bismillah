let levels=store.get(KEY,null)||initialLevels(),lv,cs,dpr,pal,cv=$('#cv');
function load(i){lv=mat(levels[i]);({cs,dpr}=setupCanvas(cv,$('#stage'),lv));$('#info').textContent=`${lv.cols}x${lv.rows} grid, ${lv.arrows.length} arrows, ${solveOrder(lv).length===lv.arrows.length?'solvable':'NOT solvable'}`}
function list(){$('#lvl').innerHTML=levels.map((l,i)=>`<option value="${i}">${l.name}</option>`).join('')}
function frame(){requestAnimationFrame(frame);if(lv)drawLevel(cv,lv,{cs,dpr,pal,showGrid:$('#grid').checked,rgb:$('#rgb').checked})}
$('#lvl').onchange=e=>load(+e.target.value);new ResizeObserver(()=>lv&&load(+$('#lvl').value)).observe($('#stage'));
$('#theme').onchange=e=>{document.body.dataset.theme=e.target.value;pal=getPalette()};
$('#play').onclick=()=>{load(+$('#lvl').value);solveOrder(lv).forEach((a,i)=>setTimeout(()=>{a.gone=true;a.anim={t0:now(),dist:rayCells(a.cells,lv.cols,lv.rows).length+a.cells.length+1}},i*600))};
$('#png').onclick=()=>cv.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=lv.name.replace(/\W+/g,'_')+'.png';a.click()});
$('#open').onclick=()=>$('#file').click();
$('#file').onchange=async e=>{try{const j=JSON.parse(await e.target.files[0].text());levels=Array.isArray(j)?j:[j];list();load(0)}catch(x){$('#info').textContent='Invalid JSON'}};
pal=getPalette();list();load(0);frame();
