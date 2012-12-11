/*
	How about this? You have an object that, depending on the member function you call,
	returns a particular prototype object that's been drawn and can be worked with later
*/

(function(){
	var canvas = { // if you already have a canvas object, don't bother with this wrapping object. Just assign prototypes to it
		prototypes: {
			_init: function() {
				// do stuff here that every prototype would need to execute before it can draw ( assuming that's the case )
			},
			drawRoundRectangle: function( x, y, z ) {
				// think of this as a parent constructor of sorts
				prototypes._init();

				var return_object = {};

				// do stuff to return_object to make it a round rectangle object

				// draw the object

				// return the drawn object
				return return_object;
			}
		}
	}

	CanvasRenderingContext2D.prototype.roundRect = canvas.prototypes.drawRoundRectangle( 0, 0, 0 );

}).call(this);