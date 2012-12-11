/**
 * NodeJS-World
 * world-engine.js
 * Draws the world and all entities.
 */

/**
 * Receives by reference:
 * images - All reference images pre-loaded ?
 * character
 * entities
 * messages
 * world
 * 		clutter
 * 		objects
 *
 * CONSTANTS
 * 		entity_width
 * 		entity_height
 * 		
 */

/**
 * Multiple canvasses...
 * 		world
 * 		chat
 * 		... ?
 * 		Overlay all on master canvas?
 */

var options = {
	a: 1,
	b: 2,
	c: 3
};

var engine = {
	init: function() {
		this.options = {
			a: 1,
			b: 2,
			c: 3
		};
	},
	run: function() {
		console.log('A: '+this.options.a);
	},
	update: function() {
		this.options.a = 6;
	}
};

engine.init();

setInterval( (function() {
	engine.run();
}),1000);

setTimeout( (function() {
	engine.update();
}),3000);