/**
 * NodeJS-World
 * world-engine.js
 * Networking client and game engine.
 */

var WorldEngine = (function(constructParams) {
	// Private Variable
	var _images,
		_avatars,
		_character,
		_entities,
		_messages,
		_world,
		_worldGroundPattern,
		_socket,
		_canvas,
		_context,
		_SCREEN_WIDTH,
		_SCREEN_HEIGHT,
		_frame,
		_FPS;

	var _AVATAR_SPRITE_FRAMES_X = 4,	// Animation is in 4 frames. - From server?
		_AVATAR_SPRITE_FRAMES_Y = 4;	// Quad-Directional - From server?

	// KeyCode vectors for movement
	// We've got them both - but for now we'll just enable WASD
	var _arrowKeys = [37,38,39,40];
	var _wasdKeys = [87,65,83,68];
	var _arrowKeysValues = [];
	_arrowKeysValues[37] = [-1,0];
	_arrowKeysValues[38] = [0,-1];
	_arrowKeysValues[39] = [1,0];
	_arrowKeysValues[40] = [0,1];

	var _wasdKeysValues = []
	_wasdKeysValues[65] = [-1,0];
	_wasdKeysValues[87] = [0,-1];
	_wasdKeysValues[68] = [1,0];
	_wasdKeysValues[83] = [0,1];

	var _pressedKeysValues = [];
	_pressedKeysValues[37] = null;
	_pressedKeysValues[38] = null;
	_pressedKeysValues[39] = null;
	_pressedKeysValues[40] = null;
	_pressedKeysValues[65] = null;
	_pressedKeysValues[87] = null;
	_pressedKeysValues[68] = null;
	_pressedKeysValues[83] = null;
	
	// Needs to be defined before __construct
	_fitCanvas = function() {
		_SCREEN_WIDTH = window.innerWidth;
		_SCREEN_HEIGHT = window.innerHeight;
		_canvas.width = _SCREEN_WIDTH;
		_canvas.height = _SCREEN_HEIGHT;
	}

	_keyDown = function(keyCode) {
		if( _wasdKeys.indexOf(keyCode) != -1 &&
			_pressedKeysValues[keyCode] == null ) {
			_pressedKeysValues[keyCode] = _wasdKeysValues[keyCode];
			_updateCharacterMovement();
		}
	}

	_keyUp = function(keyCode) {
		if( _wasdKeys.indexOf(keyCode) != -1 &&
			_pressedKeysValues[keyCode] != null ) {
			_pressedKeysValues[keyCode] = null;
			_updateCharacterMovement();
		}
	}

	_updateCharacterMovement = function() {
		// GO !
	}

	// We should figure out a way to put these in an external file ( callbacks maybe ? )
	_bindSocketEvents = function() {
		
		_socket.on('serverWorldData', function (data) {
			// Init Images
			if( data.images != undefined ) {
				var images = {};
				for( i in data.images ) {
					images[i] = new Image();
					images[i].src = data.images[i];
				}
				_images = images;
			}

			if( data.avatars != undefined ) {
				var avatars = {};
				for( i in data.avatars ) {
					avatars[i] = new Image();
					avatars[i].src = data.avatars[i];
				}
				_avatars = avatars;
			}

			// Copy World
			if( data.world != undefined ) {
				_world = data.world;
			}

		});

		_socket.on('serverCharacterData', function (data) {
			if( data.character != undefined ) {
				_character = data.character;
			}
		});

	}

	_sendCharacterLogin = function(name,avatar) {
		_socket.emit('clientCharacterLogin',{
			name: name
		});
	}

	__construct = function() {
		// Create our canvas.
		_canvas = document.createElement('canvas');
		_context = _canvas.getContext('2d');
		document.body.appendChild(_canvas);
		_fitCanvas();
		
		// Set a listener to resize the canvas whenever the window is resized.
		$(window).resize(function() {
			_fitCanvas();
		});

		$(document).keydown(function (e) {
			_keyDown((typeof e.which != "undefined" ? e.which : e.keyCode));
		});
		$(document).keyup(function (e) {
			_keyUp((typeof e.which != "undefined" ? e.which : e.keyCode));
		});
		
		_socket = io.connect('http://localhost');

		_bindSocketEvents();

		var characterName = constructParams.name != undefined ? constructParams.name : 'Nobody';

		// Send Character Info
		_sendCharacterLogin();

	}()

	_drawFrame = function(frame) {
		if ( _world == undefined ) {
			return;
		}
		
		var frameXMin = 0;
		var frameXMax = _SCREEN_WIDTH;
		var frameYMin = 0;
		var frameYMax = _SCREEN_HEIGHT;
		if( _character != undefined ) {
			frameXMin = _character.x - Math.floor( _SCREEN_WIDTH / 2 );
			if( frameXMin < 0 ) {
				frameXMin = 0;
			}
			frameXMax = frameXMin + _SCREEN_WIDTH;
			if( frameXMax > _world.width ) {
				frameXMax = _world.width;
				frameXMin = frameXMax - _SCREEN_WIDTH;
			}

			frameYMin = _character.y - Math.floor( _SCREEN_HEIGHT / 2 );
			if( frameYMin < 0 ) {
				frameYMin = 0;
			}
			frameYMax = frameYMin + _SCREEN_HEIGHT;
			if( frameYMax > _world.height ) {
				frameYMax = _world.height;
				frameYMin = frameYMax - _SCREEN_HEIGHT;
			}
		}
		
		var frameBox = {
			'xmin': frameXMin,
			'xmax': frameXMax,
			'ymin': frameYMin,
			'ymax': frameYMax
		};

		// Clear and draw.
		_context.clearRect(0, 0, _SCREEN_WIDTH, _SCREEN_HEIGHT);

		_drawSceneBackground(frameBox,frame);
		_drawEntities(frameBox,frame);
		_drawCharacter(frameBox,frame);
		_drawSceneForeground(frameBox,frame);

	}

	_drawEntities = function(frameBox,frame) {

	};

	_drawCharacter = function(frameBox,frame) {
		if( _character != undefined ) {
			var xpos,ypos; // Sprite animation positioning.
			if( _character.angle >= 315 || _character.angle < 45 ) {
				ypos = 2;
			} else if ( _character.angle >= 45 && _character.angle < 135 ) {
				ypos = 3;
			} else if ( _character.angle >= 135 && _character.angle < 225 ) {
				ypos = 1;
			} else if ( _character.angle >= 225 && _character.angle < 315 ) {
				ypos = 0;
			} else {
				ypos = 0; // ??!
			}

			ypos = ypos * ( _avatars[_character.avatar].height / _AVATAR_SPRITE_FRAMES_Y );
			
			xpos = 
				( _avatars[_character.avatar].width / _AVATAR_SPRITE_FRAMES_X ) * 
				( Math.floor( frame * _AVATAR_SPRITE_FRAMES_X / _FPS ) > 3 ? 3 : Math.floor( frame * _AVATAR_SPRITE_FRAMES_X / _FPS ) );
			if( _character.speed == 0 ) {
				xpos = 0;
			}

			_context.drawImage(
				_avatars[_character.avatar], 
				xpos,
				ypos,
				( _avatars[_character.avatar].width / _AVATAR_SPRITE_FRAMES_X ), 
				( _avatars[_character.avatar].height / _AVATAR_SPRITE_FRAMES_Y ), 
				inBoxCoordinateX(_character,frameBox), //character.x,//Math.floor( Math.floor(context.canvas.width / 2) - ( character.image.width / numFrames / 2 ) ), 
				inBoxCoordinateY(_character,frameBox), //character.y,//Math.floor( Math.floor(context.canvas.height / 2) - ( character.image.height / numFrames / 2 ) ), 
				( _avatars[_character.avatar].width / _AVATAR_SPRITE_FRAMES_X ), 
				( _avatars[_character.avatar].height / _AVATAR_SPRITE_FRAMES_Y ));
		}
	};

	_drawSceneBackground = function(frameBox,frame) {
		if( _world.ground.image != undefined && 
			_world.ground.image.length > 0 ) {
			if( _worldGroundPattern == undefined ) {
				_worldGroundPattern = _context.createPattern(_images[_world.ground.image],"repeat");
			};
			_context.translate(
				( ( frameBox.xmin % _images[_world.ground.image].width ) * -1 ),
				( ( frameBox.ymin % _images[_world.ground.image].height ) * -1 )
			);
			
			_context.rect(
				0,
				0,
				_SCREEN_WIDTH + ( _images[_world.ground.image].width ), 
				_SCREEN_HEIGHT + ( _images[_world.ground.image].height )
			);
			
			
			_context.fillStyle = _worldGroundPattern;
			_context.fill();
			
			_context.translate(
				( ( frameBox.xmin % _images[_world.ground.image].width ) * 1 ),
				( ( frameBox.ymin % _images[_world.ground.image].height ) * 1 )
			);
			
		} else {
			// Solid Color
			_context.fillStyle = _world.ground.color;
			_context.fillRect(0,0,_SCREEN_WIDTH,_SCREEN_HEIGHT);
		}

		// Draw non-solid pieces.
		for( i in _world.pieces ) {
			if( _world.pieces[i].solid == false &&
				inBox(_world.pieces[i],frameBox) ) {
				_context.drawImage(
					_images[_world.pieces[i].image],
					inBoxCoordinateX(_world.pieces[i],frameBox),
					inBoxCoordinateY(_world.pieces[i],frameBox)
				);
			}
		}
	}

	_drawSceneForeground = function(frameBox,frame) {
		// Draw non-solid pieces.
		for( i in _world.pieces ) {
			if( _world.pieces[i].solid == true &&
				inBox(_world.pieces[i],frameBox) ) {
				_context.drawImage(
					_images[_world.pieces[i].image],
					inBoxCoordinateX(_world.pieces[i],frameBox),
					inBoxCoordinateY(_world.pieces[i],frameBox)
				);
			}
		}
	}

	// There has got to be a better way to store these and call them...
	function inBox(item,box) {
		if( item.x >= (box.xmin - Math.floor( item.width / 2 ) )  &&
			item.x <= (box.xmax + Math.floor( item.width / 2 )) &&
			item.y >= (box.ymin - Math.floor( item.height / 2 )) &&
			item.y <= (box.ymax + Math.floor( item.height / 2 )) ) {
			return true;
		}
		return false;
	}

	function inBoxCoordinateX(item,box) {
		if ( item.width ) {
			return Math.floor(item.x - Math.floor( item.width / 2 ) - box.xmin);
		}
		return Math.floor(item.x - box.xmin);
	}

	function inBoxCoordinateY(item,box) {
		if ( item.height ) {
			return Math.floor(item.y - Math.floor( item.height / 2 ) - box.ymin);
		}
		return Math.floor(item.y - box.ymin);
	}

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

	this.run = function() {
		_frame = -1;
		_FPS = 30;
		setInterval( (function() {
			_drawFrame( ( _frame < _FPS ? ++_frame : _frame = 0 ) );
		}), 1000 / _FPS );
	}
	

});