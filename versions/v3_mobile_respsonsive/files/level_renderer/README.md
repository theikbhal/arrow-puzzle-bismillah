# level_renderer
Draws a level on a canvas. `renderer.js` (draw) + `core.js` (level rules) are shared by the player and creator.
Open `index.html` to preview any level, switch themes, play the solution animation, save a PNG, or open a levels.json.
`level.schema.json` defines the level format. Level: {id,name,difficulty,cols,rows,arrows:[{path:[[x,y],...]}]} - path = corner cells tail -> head.
