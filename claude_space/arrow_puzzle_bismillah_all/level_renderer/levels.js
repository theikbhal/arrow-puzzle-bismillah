/* Level format (also used by the Mac editor + React Native game):
   { id, name, difficulty, cols, rows, arrows:[{ path:[[x,y],...] }] }
   - Grid is cols x rows. [x,y] = cell (0,0 is top-left).
   - path lists the corner cells from TAIL to HEAD; straight runs are filled in automatically.
   - Arrowhead direction = last segment. The arrow slides out that way when tapped; it is blocked if any other arrow sits in its path.
   - An entry may use {gen:{count,seed}} instead of "arrows" to auto-generate a solvable layout (the editor's Export writes real arrows).
*/
window.LEVELS=[
{id:1,name:"Level 1",difficulty:"Normal",cols:5,rows:6,arrows:[{path:[[3,2],[3,0]]},{path:[[3,3],[0,3]]},{path:[[2,5],[4,5]]}]},
{id:2,name:"Level 2",difficulty:"Normal",cols:5,rows:6,arrows:[{path:[[1,2],[1,0]]},{path:[[3,1],[3,4]]},{path:[[0,3],[2,3]]},{path:[[1,5],[2,5]]}]},
{id:3,name:"Level 3",difficulty:"Normal",cols:5,rows:7,gen:{count:7,seed:3}},
{id:4,name:"Level 4",difficulty:"Normal",cols:7,rows:10,gen:{count:11,seed:4}},
{id:5,name:"Level 5",difficulty:"Normal",cols:7,rows:10,gen:{count:13,seed:5}},
{id:6,name:"Level 6",difficulty:"Medium",cols:8,rows:11,gen:{count:16,seed:6}},
{id:7,name:"Level 7",difficulty:"Medium",cols:9,rows:12,gen:{count:19,seed:7}},
{id:8,name:"Level 8",difficulty:"Medium",cols:10,rows:13,gen:{count:22,seed:8}},
{id:9,name:"Level 9",difficulty:"Medium",cols:13,rows:16,gen:{count:25,seed:9}},
{id:10,name:"Level 10",difficulty:"Medium",cols:13,rows:14,gen:{count:25,seed:10}},
{id:11,name:"Level 11",difficulty:"Medium",cols:14,rows:7,gen:{count:16,seed:11}},
{id:12,name:"Level 12",difficulty:"Medium",cols:13,rows:13,gen:{count:17,seed:12}}
];
