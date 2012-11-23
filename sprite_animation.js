// screen size variables
var SCREEN_WIDTH = window.innerWidth,
SCREEN_HEIGHT = window.innerHeight;        

var canvas = document.createElement('canvas');
var c = canvas.getContext('2d');

canvas.width = SCREEN_WIDTH;
canvas.height = SCREEN_HEIGHT;

var xpos = 0;
var ypos = 0;
var index = 0;
var numFrames = 4;
var frameWidth = 32;
var frameHeight = 52;

// Add our drawing canvas
document.body.appendChild(canvas); 

//load the image
image = new Image();
image.src = "sprites/steampunk_m1.png";

image.onload = function() {
	//we're ready for the loop
	setInterval(loop, 7000 / 30);
}


function loop() {

	c.clearRect(0,0, SCREEN_WIDTH,SCREEN_HEIGHT);

	c.drawImage(image,xpos,ypos,frameWidth,frameHeight,300,300,frameWidth, frameHeight);

	/*
	for( var ix = 15; ix < 1365; ix += 50 ) {
		for ( var iy = 15; iy < 665; iy += 50 ) {
			ypos = frameHeight*Math.floor( ( iy + ix ) / 50 % 4 );
			c.drawImage(image,xpos,ypos,frameWidth,frameHeight,ix,iy,frameWidth, frameHeight);
		}
	}
	*/

	xpos += frameWidth;

	index += 1;

	if (index >= numFrames) {
		xpos =0;
		ypos =0;
		index=0;    
	} else if (xpos + frameWidth > image.width){
		xpos =0;
		ypos += frameWidth;
	}


}