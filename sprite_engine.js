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

function roundRect(context, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == "undefined" ) {
    stroke = true;
  }
  if (typeof radius === "undefined") {
    radius = 5;
  }
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
  if (stroke) {
    context.stroke();
  }
  if (fill) {
    context.fill();
  }        
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
	if( frameXMin < 0 ) {
		frameXMin = 0;
	}
	var frameXMax = frameXMin + context.canvas.width;
	if( frameXMax > WORLD_WIDTH ) {
		frameXMax = WORLD_WIDTH;
		frameXMin = frameXMax - context.canvas.width;
	}

	var frameYMin = character.y - Math.floor( context.canvas.height / 2 );
	if( frameYMin < 0 ) {
		frameYMin = 0;
	}
	var frameYMax = frameYMin + context.canvas.height;
	if( frameYMax > WORLD_HEIGHT ) {
		frameYMax = WORLD_HEIGHT;
		frameYMin = frameYMax - context.canvas.height;
	}

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

	drawChatWindow(context);
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
				inBoxEntityCoordinateX(entities[i],frameBox), 
				inBoxEntityCoordinateY(entities[i],frameBox), 
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
		inBoxEntityCoordinateX(character,frameBox), //character.x,//Math.floor( Math.floor(context.canvas.width / 2) - ( character.image.width / numFrames / 2 ) ), 
		inBoxEntityCoordinateY(character,frameBox), //character.y,//Math.floor( Math.floor(context.canvas.height / 2) - ( character.image.height / numFrames / 2 ) ), 
		( character.image.width / numFrames ), 
		( character.image.height / numFrames ));


	drawMessage(
		context,
		frameBox,
		character,
		"Here is my message... WITH LOTS OF EXTRA TEXT THAT SHOULD GET CUT OFF..."
	);

	
}

function drawMessage(context,frameBox,character,text) {
	var tempCanvas = document.createElement('canvas');
	var tempContext = tempCanvas.getContext('2d');
	tempContext.font = "normal 14px Arial";
	tempContext.fillStyle = "rgba(33,33,33,1)";
	tempContext.fillText(text,0,14);

	var rectPos = {
		x: character.x,
		y: character.y - 50,
		width: 250,
		height: 35
	};
	context.strokeStyle = "rgba(255, 255, 255, 1)";
	context.fillStyle = "rgba(255, 255, 255, .8)";
	roundRect(context, inBoxCoordinateX(rectPos,frameBox),inBoxCoordinateY(rectPos,frameBox), rectPos.width, rectPos.height, 10, true, true); 
	context.drawImage(
		tempCanvas,
		0,
		0,
		240,
		24,
		inBoxCoordinateX(rectPos,frameBox),
		(inBoxCoordinateY(rectPos,frameBox)+10),
		240,
		24);
}

function drawChatWindow(context) {
	var tempCanvas = document.createElement('canvas');
	tempCanvas.width = 500;
	tempCanvas.height = 500;
	var tempContext = tempCanvas.getContext('2d');
	tempContext.fillStyle = "rgba(50,50,50,.3)";
	tempContext.strokeStyle = "rgba(50,50,50,.3)";
	tempContext.fillRect(0,0,500,200);

	context.drawImage(
		tempCanvas,
		0,
		0,
		500,
		200,
		5,
		(context.canvas.height - 205),
		500,
		200);
}

function inBox(item,box) {
	if( item.x >= (box.xmin - Math.floor( item.image.width / 2 ) )  &&
		item.x <= (box.xmax + Math.floor( item.image.width / 2 )) &&
		item.y >= (box.ymin - Math.floor( item.image.height / 2 )) &&
		item.y <= (box.ymax + Math.floor( item.image.height / 2 )) ) {
		return true;
	}
	return false;
}

function inBoxCoordinateX(item,box) {
	if( item.image ) {
		return Math.floor(item.x - Math.floor( item.image.width / 2 ) - box.xmin);
	} else if ( item.width ) {
		return Math.floor(item.x - Math.floor( item.width / 2 ) - box.xmin);
	}
	return Math.floor(item.x - box.xmin);
}

function inBoxCoordinateY(item,box) {
	if( item.image ) {
		return Math.floor(item.y - Math.floor( item.image.height / 2 ) - box.ymin);
	} else if ( item.height ) {
		return Math.floor(item.y - Math.floor( item.height / 2 ) - box.ymin);
	}
	return Math.floor(item.y - box.ymin);
}

function inBoxEntityCoordinateX(item,box) {
	return Math.floor(item.x - Math.floor( item.image.width / numFrames / 2 ) - box.xmin);
}

function inBoxEntityCoordinateY(item,box) {
	return Math.floor(item.y - Math.floor( item.image.height / numFrames / 2 ) - box.ymin);
}

var grassImage = new Image();
grassImage.src = "resources/grass.png";	

function drawSceneBackground(context, frameBox) {
	
	var grassPattern = context.createPattern(grassImage,"repeat");
	
	// This code allows the grass to "scroll"
	// STILL A BIT SLOW
	context.translate(
		( ( frameBox.xmin % grassImage.width ) * -1 ),
		( ( frameBox.ymin % grassImage.height ) * -1 )
	);
	context.rect(
		0,//( ( frameBox.xmin % grassImage.width ) * -1 ),//( -1 * context.canvas.width % grassImage.width ),//0, 
		0,//( ( frameBox.ymin % grassImage.height ) * -1 ),//( -1 * context.canvas.height % grassImage.height ),//0, 
		context.canvas.width + ( grassImage.width ), 
		context.canvas.height + ( grassImage.height )
	);
	context.fillStyle = grassPattern;
	context.fill();
	
	context.translate(
		( ( frameBox.xmin % grassImage.width ) * 1 ),
		( ( frameBox.ymin % grassImage.height ) * 1 )
	);
	// LOOKS RIGHT - BUT CPU THROUGH THE ROOF!
	/*
	for( var x = (( frameBox.xmin % grassImage.width ) * -1 ); x <= context.canvas.width; x += grassImage.width ) {
		for( var y = (( frameBox.ymin % grassImage.height ) * -1 ); y <= context.canvas.height; y += grassImage.height ) {
			context.drawImage(
				grassImage,
				x,
				y);
		}
	}
	*/

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
	if( character.x <= 20 ) {
		character.x = 20;
	} else if ( character.x >= ( WORLD_WIDTH - 20 ) ) {
		character.x = ( WORLD_WIDTH - 20 );
	}
	if( character.y <= 20 ) {
		character.y = 20;
	} else if ( character.y >= ( WORLD_HEIGHT - 20 ) ) {
		character.y = ( WORLD_HEIGHT - 20 );
	}
	
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
	for( var q = 2; q <= 12; q++ ) {
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
characterImage.src = "sprites/steampunk_m1.png";
var character = {
	x: 500,
	y: 500,
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

var arrowKeys = [37,38,39,40,87,65,83,68];
var arrowKeysValues = [];
arrowKeysValues[37] = [-1,0];
arrowKeysValues[38] = [0,-1];
arrowKeysValues[39] = [1,0];
arrowKeysValues[40] = [0,1];

arrowKeysValues[65] = [-1,0];
arrowKeysValues[87] = [0,-1];
arrowKeysValues[68] = [1,0];
arrowKeysValues[83] = [0,1];

var arrowKeysCurrent = [];
arrowKeysCurrent[37] = null;
arrowKeysCurrent[38] = null;
arrowKeysCurrent[39] = null;
arrowKeysCurrent[40] = null;
arrowKeysCurrent[65] = null;
arrowKeysCurrent[87] = null;
arrowKeysCurrent[68] = null;
arrowKeysCurrent[83] = null;

$(function() {
	$(document).keydown(function (e) {
		var keyCode = typeof e.which != "undefined" ? e.which : e.keyCode;
		if( arrowKeys.indexOf(keyCode) != -1 && 
			arrowKeysCurrent[keyCode] == null ) {
			arrowKeysCurrent[keyCode] = arrowKeysValues[keyCode];
			updateCharacterSpeedAngle();
		} else {
			console.log(keyCode);
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


$(function() {
	$(document).click(function(e) {
		var newX = e.pageX + character.x - Math.floor( context.canvas.width / 2 );
		var newY = e.pageY + character.y - Math.floor( context.canvas.height / 2 );
		for( i in entities ) {
			entities[i].x = newX;
			entities[i].y = newY;
		}
	});
});