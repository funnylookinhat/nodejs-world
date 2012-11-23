/**
 * Sprite Engine
 * Animates sprites across a fixed window.
 * Goals: variable animation speed, angular movement detection, and low cycles.
 */

// Helpers

function getAngle(x1,y1,x2,y2) {
	var dX = Math.round(x1 - x2);
	var dY = Math.round(y1 - y2);
	var angle = Math.round(Math.atan2(dX, dY) / Math.PI * 180) + 90;
	if( angle < 0 ) {
		angle += 360;
	}
	return angle;
}

function getDx(angle,speed) {
	var theta = angle * Math.PI / 180
	return Math.round(10 * speed * Math.cos(theta)) / 10;
}

function getDy(angle,speed) {
	var theta = angle * Math.PI / 180
	return Math.round(10 * speed * Math.sin(theta)) / 10;
}


// Entities Array
// 	x
// 	y
// 	angle
// 	speed
// 	image

// FPS = 30 Generally
// frame = out of 30
var numFrames = 4;
var frameWidth = 32;
var frameHeight = 52;

function drawFrame(canvas, context, entities, fps, frame) {
	var xpos,ypos;

	context.clearRect(0, 0, canvas.width, canvas.height);

	for( i in entities ) {
		// ypos = derivative of angle
		// xpos = derivative of frame and speed
		if( entities[i].angle >= 315 || entities[i].angle < 45 ) {
			ypos = 2;
		} else if ( entities[i].angle >= 45 && entities[i].angle < 135 ) {
			ypos = 0;
		} else if ( entities[i].angle >= 135 && entities[i].angle < 225 ) {
			ypos = 1;
		} else if ( entities[i].angle >= 225 && entities[i].angle < 315 ) {
			ypos = 3;
		} else {
			ypos = 0; // ??!
		}
		ypos = ypos * ( entities[i].image.height / numFrames );
		
		// Should account for speed ?
		xpos = ( entities[i].image.width / numFrames ) * ( Math.floor( frame * numFrames / fps ) > 3 ? 3 : Math.floor( frame * numFrames / fps ) );

		context.drawImage(
			entities[i].image, 
			xpos, 
			ypos, 
			( entities[i].image.width / numFrames ), 
			( entities[i].image.height / numFrames ), 
			entities[i].x, 
			entities[i].y, 
			( entities[i].image.width / numFrames ), 
			( entities[i].image.height / numFrames ));
	}
}

// Simple motion simulation.
function updateFrame(entities) {
	for( i in entities ) {
		entities[i].x += getDx(entities[i].angle,entities[i].speed);
		entities[i].y += getDy(entities[i].angle,entities[i].speed);
		if( entities[i].x <= 100 || 
			entities[i].x >= ( SCREEN_WIDTH - 100 ) ||
			entities[i].y <= 100 || 
			entities[i].y >= ( SCREEN_HEIGHT - 100 ) ) {
			entities[i].angle += 180;
			if( entities[i].angle >= 360 ) {
				entities[i].angle -= 360;
			} else if ( entities[i].angle < 0 ) {
				entities[i].angle += 360;
			}
		}
	}
	return entities;
}

// SEPARATE

var FPS = 30;

// screen size variables
var SCREEN_WIDTH = window.innerWidth,
SCREEN_HEIGHT = window.innerHeight;        

var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');

canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

// Add our drawing canvas
document.body.appendChild(canvas); 

//load the test sprites
var entities = [];

for( var r = 1; r <= 2; r++ ) {
	for( var q = 1; q <= 12; q++ ) {
		image = new Image();
		image.src = "sprites/steampunk_m"+q.toString()+".png";
		
		entities[q*r] = {
			x: Math.floor( Math.random() * ( SCREEN_WIDTH - 200 ) ) + 100,
			y: Math.floor( Math.random() * ( SCREEN_HEIGHT - 200 ) ) + 100,
			angle: Math.floor( Math.random() * 360 ),
			speed: Math.floor( Math.random() * 8 ) + 1,
			image: image
		};	
	}
}


var frame = -1;
setInterval( (function() {
	drawFrame(
		canvas, 
		context, 
		entities, 
		FPS, 
		( frame < FPS ? ++frame : frame = 0 ) );
	entities = updateFrame(entities);
}), 1000 / FPS );
