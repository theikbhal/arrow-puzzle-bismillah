/* core.js - level format helpers shared by renderer, player, creator. Pure logic, no DOM. */
const D4=[[0,-1],[0,1],[-1,0],[1,0]],KEY='ap_levels_v1';

/* ---------- level data helpers ---------- */
const expand=p=>{const c=[p[0].slice()];for(let i=1;i<p.length;i++){let[x,y]=c[c.length-1];const[tx,ty]=p[i],dx=Math.sign(tx-x),dy=Math.sign(ty-y);while(x!==tx||y!==ty){x+=dx;y+=dy;c.push([x,y])}}return c};
const compress=c=>c.filter((p,i)=>!i||i===c.length-1||p[0]-c[i-1][0]!==c[i+1][0]-p[0]||p[1]-c[i-1][1]!==c[i+1][1]-p[1]);
const dirOf=c=>{const a=c[c.length-2],b=c[c.length-1];return[b[0]-a[0],b[1]-a[1]]};
function rayCells(c,cols,rows){const[dx,dy]=dirOf(c);let[x,y]=c[c.length-1];const r=[];for(;;){x+=dx;y+=dy;if(x<0||y<0||x>=cols||y>=rows)return r;r.push([x,y])}}
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
/* Solvable by construction: each new arrow's path and ray avoid everything placed before it, so removing in reverse order always works. */
function generate(cols,rows,count,seed,maxLen=7){const r=rng(seed),occ=new Set(),out=[];let n=0;
 while(out.length<count&&n++<6000){let x=r()*cols|0,y=r()*rows|0;if(occ.has(x+','+y))continue;
  const c=[[x,y]],own=new Set([x+','+y]);let d=D4[r()*4|0];const len=2+(r()*(maxLen-1)|0);
  for(let i=1;i<len;i++){if(r()<.4)d=D4[r()*4|0];const nx=x+d[0],ny=y+d[1],k=nx+','+ny;if(nx<0||ny<0||nx>=cols||ny>=rows||occ.has(k)||own.has(k))break;x=nx;y=ny;c.push([x,y]);own.add(k)}
  if(c.length<2||rayCells(c,cols,rows).some(p=>occ.has(p+'')))continue;own.forEach(k=>occ.add(k));out.push(c)}
 return out}
function initialLevels(){return LEVELS.map(d=>{if(!d.gen)return d;const{gen,...o}=d;o.arrows=generate(d.cols,d.rows,gen.count,gen.seed).map(c=>({path:compress(c)}));return o})}
const mat=d=>({id:d.id,name:d.name,difficulty:d.difficulty,cols:d.cols,rows:d.rows,arrows:d.arrows.map(a=>({cells:a.cells||expand(a.path)}))});
const toDef=l=>({id:l.id,name:l.name,difficulty:l.difficulty,cols:l.cols,rows:l.rows,arrows:l.arrows.map(a=>({path:compress(a.cells)}))});
function solvable(l){let left=l.arrows.slice();for(;;){const f=left.find(a=>{const o=new Set();left.forEach(b=>b!==a&&b.cells.forEach(c=>o.add(c+'')));return!rayCells(a.cells,l.cols,l.rows).some(c=>o.has(c+''))});if(!f)return!left.length;left=left.filter(a=>a!==f)}}

function solveOrder(l){let left=l.arrows.slice(),o=[];for(;;){const f=left.find(a=>{const s=new Set();left.forEach(b=>b!==a&&b.cells.forEach(c=>s.add(c+'')));return!rayCells(a.cells,l.cols,l.rows).some(c=>s.has(c+''))});if(!f)return o;o.push(f);left=left.filter(a=>a!==f)}}
function blockedBy(l,a){const s=new Set();l.arrows.forEach(b=>b!==a&&!b.gone&&b.cells.forEach(c=>s.add(c+'')));return rayCells(a.cells,l.cols,l.rows).some(c=>s.has(c+''))}
const store={get(k,d){try{return JSON.parse(localStorage.getItem(k))??d}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},del(k){try{localStorage.removeItem(k)}catch(e){}}};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],now=()=>performance.now();
