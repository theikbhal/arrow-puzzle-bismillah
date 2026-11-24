// Usage (in the level_creator folder):  node tools/build_levels.js [count]
// Bakes N solvable levels into ../levels.js (default 300). Copy the new levels.js into the player/renderer folders.
const fs=require('fs'),path=require('path'),N=+process.argv[2]||300;
const core=fs.readFileSync(path.join(__dirname,'..','core.js'),'utf8');
const {generate,compress,solveOrder,mat}=new Function(core+';return {generate,compress,solveOrder,mat}')();
const P={3:[5,7,7],4:[7,10,11],5:[7,10,13],6:[8,11,16],7:[9,12,19],8:[10,13,22],9:[13,16,25],10:[13,14,25],11:[14,7,16],12:[13,13,17]};
const out=[{id:1,name:"Level 1",difficulty:"Normal",cols:5,rows:6,arrows:[{path:[[3,2],[3,0]]},{path:[[3,3],[0,3]]},{path:[[2,5],[4,5]]}]},
{id:2,name:"Level 2",difficulty:"Normal",cols:5,rows:6,arrows:[{path:[[1,2],[1,0]]},{path:[[3,1],[3,4]]},{path:[[0,3],[2,3]]},{path:[[1,5],[2,5]]}]}];
let short=0;
for(let n=3;n<=N;n++){let cols,rows,count,seed=n,maxLen=7;
 if(P[n])[cols,rows,count]=P[n];
 else{const t=(n-12)/288;cols=Math.round(10+t*5);rows=Math.round(12+t*9);if(n%9===0)[cols,rows]=[Math.min(16,rows),cols];count=Math.round(cols*rows*(.13+t*.05));seed=n*7919;maxLen=6+Math.round(t*6)}
 const cells=generate(cols,rows,count,seed,maxLen);if(cells.length<count)short++;
 out.push({id:n,name:"Level "+n,difficulty:n<=5?"Normal":n<=120?"Medium":"Hard",cols,rows,arrows:cells.map(c=>({path:compress(c)}))})}
out.forEach(l=>{if(solveOrder(mat(l)).length!==l.arrows.length)throw new Error('unsolvable '+l.id)});
const head='/* Level format: { id, name, difficulty, cols, rows, arrows:[{ path:[[x,y],...] }] }\n   path = corner cells from TAIL to HEAD; the last segment is the direction the arrow slides out.\n   Rebuild with: node tools/build_levels.js 300 (in level_creator). */\n';
fs.writeFileSync(path.join(__dirname,'..','levels.js'),head+'window.LEVELS=[\n'+out.map(l=>JSON.stringify(l)).join(',\n')+'\n];\n');
const a=out.map(l=>l.arrows.length);console.log(out.length+' levels, arrows min '+Math.min(...a)+' max '+Math.max(...a)+', short of target: '+short);
