/* renderer.js - draws a level on a <canvas>. Used by the player, creator and demo viewer.
   setupCanvas(cv, stageEl, lv) -> {cs, dpr}
   drawLevel(cv, lv, {cs,dpr,pal,showGrid,rgb,hintA,draft,dots,t})
   Arrow state fields (optional): a.gone, a.anim={t0,dist}, a.flash=<time> */
function setupCanvas(cv,stage,lv){const dpr=devicePixelRatio||1,cs=Math.max(8,Math.floor(Math.min((stage.clientWidth-4)/lv.cols,(stage.clientHeight-4)/lv.rows)));
 cv.width=lv.cols*cs*dpr;cv.height=lv.rows*cs*dpr;cv.style.width=lv.cols*cs+'px';cv.style.height=lv.rows*cs+'px';return{cs,dpr}}
function getPalette(){const s=getComputedStyle(document.body),p={};['ray','arrow','hint','bad','gold'].forEach(k=>p[k]=s.getPropertyValue('--'+k).trim());return p}
function drawArrow(g,c,cs,off,col){const[dx,dy]=dirOf(c),X=p=>(p[0]+.5)*cs+dx*off,Y=p=>(p[1]+.5)*cs+dy*off;
 g.strokeStyle=g.fillStyle=col;g.lineWidth=Math.max(3,cs*.1);g.lineJoin=g.lineCap='round';g.beginPath();c.forEach((p,i)=>i?g.lineTo(X(p),Y(p)):g.moveTo(X(p),Y(p)));g.stroke();
 const h=c[c.length-1],hx=X(h),hy=Y(h),s=cs*.24;g.beginPath();g.moveTo(hx+dx*cs*.3,hy+dy*cs*.3);g.lineTo(hx-dy*s,hy+dx*s);g.lineTo(hx+dy*s,hy-dx*s);g.fill()}
function drawLevel(cv,lv,o){const g=cv.getContext('2d'),{cs,dpr,pal}=o,t=o.t||now();g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,cv.width,cv.height);
 if(o.dots){g.fillStyle=pal.ray;for(let x=0;x<lv.cols;x++)for(let y=0;y<lv.rows;y++){g.beginPath();g.arc((x+.5)*cs,(y+.5)*cs,Math.max(1.5,cs*.05),0,7);g.fill()}}
 if(o.showGrid){g.strokeStyle=pal.ray;g.lineWidth=Math.max(1.5,cs*.035);lv.arrows.forEach(a=>{if(a.gone)return;const[dx,dy]=dirOf(a.cells),h=a.cells[a.cells.length-1];g.beginPath();g.moveTo((h[0]+.5)*cs,(h[1]+.5)*cs);g.lineTo((h[0]+.5+dx*99)*cs,(h[1]+.5+dy*99)*cs);g.stroke()})}
 lv.arrows.forEach((a,i)=>{let off=0;if(a.anim){const p=Math.min(1,(t-a.anim.t0)/450);off=p*p*a.anim.dist*cs;if(p>=1)a.anim=null}if(a.gone&&!a.anim)return;
  drawArrow(g,a.cells,cs,off,a.flash>t?pal.bad:a===o.hintA?pal.hint:o.rgb?`hsl(${i*47%360} 70% 45%)`:pal.arrow)});
 if(o.draft){if(o.draft.length>1)drawArrow(g,o.draft,cs,0,pal.gold);else{g.fillStyle=pal.gold;g.beginPath();g.arc((o.draft[0][0]+.5)*cs,(o.draft[0][1]+.5)*cs,cs*.15,0,7);g.fill()}}}
