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

function drawFrame(canvas, context, character, entities, fps, frame) {
	context.clearRect(0, 0, canvas.width, canvas.height);

	var frameXMin = character.x - Math.floor( context.canvas.width / 2 );
	var frameXMax = frameXMin + context.canvas.width;

	var frameYMin = character.y - Math.floor( context.canvas.height / 2 );
	var frameYMax = frameYMin + context.canvas.width;

	var frameBox = {
		'xmin': frameXMin,
		'xmax': frameXMax,
		'ymin': frameYMin,
		'ymax': frameYMax
	};

	drawSceneBackground(context,frameBox);

	drawEntities(context,frameBox,fps,frame);

	drawCharacter(context,frameBox,fps,frame);

	drawSceneForeground(context,frameBox);
}

function drawEntities(context,frameBox,fps,frame) {
	var xpos,ypos;
	
	for( i in entities ) {
		if( inBox(entities[i],frameBox) ) {
			// ypos = derivative of angle
			// xpos = derivative of frame and speed
			if( entities[i].angle >= 315 || entities[i].angle < 45 ) {
				ypos = 2;
			} else if ( entities[i].angle >= 45 && entities[i].angle < 135 ) {
				ypos = 3;
			} else if ( entities[i].angle >= 135 && entities[i].angle < 225 ) {
				ypos = 1;
			} else if ( entities[i].angle >= 225 && entities[i].angle < 315 ) {
				ypos = 0;
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
				inBoxCoordinateX(entities[i],frameBox), 
				inBoxCoordinateY(entities[i],frameBox), 
				( entities[i].image.width / numFrames ), 
				( entities[i].image.height / numFrames ));
		}
	}
}

function drawCharacter(context,frameBox,fps,frame) {
	var xpos,ypos; // Sprite animation positioning.
	if( character.angle >= 315 || character.angle < 45 ) {
		ypos = 2;
	} else if ( character.angle >= 45 && character.angle < 135 ) {
		ypos = 3;
	} else if ( character.angle >= 135 && character.angle < 225 ) {
		ypos = 1;
	} else if ( character.angle >= 225 && character.angle < 315 ) {
		ypos = 0;
	} else {
		ypos = 0; // ??!
	}
	ypos = ypos * ( character.image.height / numFrames );
	
	xpos = 
		( character.image.width / numFrames ) * 
		( Math.floor( frame * numFrames / fps ) > 3 ? 3 : Math.floor( frame * numFrames / fps ) );
	if( character.speed == 0 ) {
		xpos = 0;
	}

	context.drawImage(
		character.image, 
		xpos,
		ypos,
		( character.image.width / numFrames ), 
		( character.image.height / numFrames ), 
		inBoxCoordinateX(character,frameBox), //character.x,//Math.floor( Math.floor(context.canvas.width / 2) - ( character.image.width / numFrames / 2 ) ), 
		inBoxCoordinateY(character,frameBox), //character.y,//Math.floor( Math.floor(context.canvas.height / 2) - ( character.image.height / numFrames / 2 ) ), 
		( character.image.width / numFrames ), 
		( character.image.height / numFrames ));
}

function inBox(item,box) {
	if( item.x >= (box.xmin-50) &&
		item.x <= (box.xmax+50) &&
		item.y >= (box.ymin-50) &&
		item.y <= (box.ymax+50) ) {
		return true;
	}
	return false;
}

function inBoxCoordinateX(item,box) {
	return Math.floor(item.x - box.xmin);
}

function inBoxCoordinateY(item,box) {
	return Math.floor(item.y - box.ymin);
}

var grassImage = new Image();
grassImage.src = "resources/grass.png";	

function drawSceneBackground(context, frameBox) {
	var grassPattern = context.createPattern(grassImage,"repeat");
	context.rect(
		0, 
		0, 
		context.canvas.width, 
		context.canvas.height
	);
	context.fillStyle = grassPattern;
	context.fill();

	for( i in clutters ) {
		if( inBox(clutters[i],frameBox) ) {
			context.drawImage(
				clutters[i].image,
				inBoxCoordinateX(clutters[i],frameBox),
				inBoxCoordinateY(clutters[i],frameBox)
			);
		}
	}
}

function drawSceneForeground(context,frameBox) {
	for( i in trees ) {
		if( inBox(trees[i],frameBox) ) {
			context.drawImage(
				trees[i].image,
				inBoxCoordinateX(trees[i],frameBox),
				inBoxCoordinateY(trees[i],frameBox)
			);
		}
	}
}

function fitCanvas(canvas,win) {
	SCREEN_WIDTH = window.innerWidth;
	SCREEN_HEIGHT = window.innerHeight;
	
	canvas.width = SCREEN_WIDTH;
	canvas.height = SCREEN_HEIGHT;
}

// Simple motion simulation.
function updateFrame(entities) {
	character.x += getDx(character.angle,character.speed);
	character.y -= getDy(character.angle,character.speed);	
	for( i in entities ) {
		entities[i].x += getDx(entities[i].angle,entities[i].speed);
		entities[i].y -= getDy(entities[i].angle,entities[i].speed);
		if( entities[i].x <= 20 || 
			entities[i].x >= ( WORLD_WIDTH - 20 ) ||
			entities[i].y <= 20 || 
			entities[i].y >= ( WORLD_HEIGHT - 20 ) ) {
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

var WORLD_WIDTH = 10000;
var WORLD_HEIGHT = 10000;

/**
 * TEST WORLD DATA
 */

var clutterImages = [];
clutterImages[0] = new Image();
clutterImages[0].src = "resources/flower1.png";
clutterImages[1] = new Image();
clutterImages[1].src = "resources/flower2.png";

var clutters = [];

for( var i = 0; i < 5000; i++ ) {
	clutters.push({
		image: clutterImages[Math.floor(Math.random() * clutterImages.length)],
		x: Math.floor(Math.random() * WORLD_WIDTH),
		y: Math.floor(Math.random() * WORLD_HEIGHT)
	});
}

var treeImages = [];
treeImages[0] = new Image();
treeImages[0].src = "resources/tree1_trans.png";
treeImages[1] = new Image();
treeImages[1].src = "resources/tree2_trans.png";

var trees = [];

for( var i = 0; i < 500; i++ ) {
	trees.push({
		image: treeImages[Math.floor(Math.random() * treeImages.length)],
		x: Math.floor(Math.random() * WORLD_WIDTH),		// ADJUST FOR IMAGE WIDTH
		y: Math.floor(Math.random() * WORLD_HEIGHT)		// ADJUST FOR IMAGE HEIGHT
	});
}

//load the test sprites
var entities = [];

for( var r = 1; r <= 50; r++ ) {
	for( var q = 1; q <= 6; q++ ) {
		image = new Image();
		image.src = "sprites/steampunk_m"+q.toString()+".png";
		
		entities[q*r] = {
			x: Math.floor( Math.random() * ( WORLD_WIDTH - 40 ) ) + 20,
			y: Math.floor( Math.random() * ( WORLD_HEIGHT - 40 ) ) + 20,
			angle: Math.floor( Math.random() * 360 ),
			speed: Math.floor( Math.random() * 8 ) + 1,
			image: image
		};	
	}
}

var characterImage = new Image();
characterImage.src = "sprites/steampunk_m8.png";
var character = {
	x: 5000,
	y: 5000,
	angle: 270,
	speed: 0,
	image: characterImage
};

function updateCharacterSpeedAngle() {
	var count = 0;
	var dX = 0;
	var dY = 0;
	for( i in arrowKeysCurrent ) {
		if( arrowKeysCurrent[i] != null ) {
			dX += arrowKeysCurrent[i][0];
			dY += arrowKeysCurrent[i][1];
			count++;
		}
	}
	if( count != 0 ) {
		character.speed = 10;
		character.angle = getAngle(0,0,dX,dY);
	} else {
		character.speed = 0;
		// Unchanged Angle.
	}
}

/**
 * INPUT
 */

var arrowKeys = [37,38,39,40];
var arrowKeysValues = [];
arrowKeysValues[37] = [-1,0];
arrowKeysValues[38] = [0,-1];
arrowKeysValues[39] = [1,0];
arrowKeysValues[40] = [0,1];
var arrowKeysCurrent = [];
arrowKeysCurrent[37] = null;
arrowKeysCurrent[38] = null;
arrowKeysCurrent[39] = null;
arrowKeysCurrent[40] = null;

$(function() {
	$(document).keydown(function (e) {
		var keyCode = typeof e.which != "undefined" ? e.which : e.keyCode;
		if( arrowKeys.indexOf(keyCode) != -1 && 
			arrowKeysCurrent[keyCode] == null ) {
			arrowKeysCurrent[keyCode] = arrowKeysValues[keyCode];
			updateCharacterSpeedAngle();
		}
	});
	$(document).keyup(function (e) {
		var keyCode = typeof e.which != "undefined" ? e.which : e.keyCode;
		if( arrowKeys.indexOf(keyCode) != -1 &&
			arrowKeysCurrent[keyCode] != null ) {
			arrowKeysCurrent[keyCode] = null;
			updateCharacterSpeedAngle();
		}
	});
});

/**
 * END INPUT
 */

// Mainloop
var frame = -1;
setInterval( (function() {
	fitCanvas(
		canvas,
		window
	);
	drawFrame(
		canvas, 
		context, 
		character, 
		entities, 
		FPS, 
		( frame < FPS ? ++frame : frame = 0 ) );
	entities = updateFrame(entities);
}), 1000 / FPS );
