var _world = {
	width: 10000,
	height: 10000,
	pieces: [],
	ground: {
		color: '#448844',
		image: 'grass',
	}
};

// Generate Random World.
for( var i = 0; i < 5000; i++ ) {
	image = 'flower1';
	width = 20;
	height = 20;
	if( i % 10 <= 4 ) {
		image = 'flower1';
		width = 17;
		height = 16;
	} else if ( i % 10 <= 7 ) {
		image = 'flower2';
		width = 28;
		height = 25;
	} else if ( i % 10 <= 8 ) {
		image = 'tree1';
		width = 115;
		height = 157;
	} else {
		image = 'tree2';
		width = 123;
		height = 151;
	}
	_world.pieces.push({
		image: image,
		width: width,
		height: height,
		x: Math.round( Math.random() * _world.width ),
		y: Math.round( Math.random() * _world.height ),
		solid: false
	});
	console.log("Created... "+i);
}

var fs = require('fs');
fs.writeFile(__dirname+"/resources/world.json", JSON.stringify(_world), function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
}); 