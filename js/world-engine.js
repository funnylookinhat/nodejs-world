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
		_worldGroundCanvas,
		_imagesLoaded,
		_imagesCount,
		_imagesTotal,
		/* _backgroundCanvas, */	// Used for drawing the entire background out then copying in.
									// More memory ( 5x ) for a minor drop in CPU.
		_socket,
		_canvas,
		_context,
		_SCREEN_WIDTH,
		_SCREEN_HEIGHT,
		_frame,
		_FPS,
		_lastTime;

	var _AVATAR_SPRITE_FRAMES_X = 4,	// Animation is in 4 frames. - From server?
		_AVATAR_SPRITE_FRAMES_Y = 4;	// Quad-Directional - From server?

	// KeyCode vectors for movement
	// We've got them both - but for now we'll just enable WASD
	var _movementKeys = [];
	_movementKeys[37] = [-1,0];
	_movementKeys[38] = [0,-1];
	_movementKeys[39] = [1,0];
	_movementKeys[40] = [0,1];
	_movementKeys[65] = [-1,0];
	_movementKeys[87] = [0,-1];
	_movementKeys[68] = [1,0];
	_movementKeys[83] = [0,1];

	var _pressedKeysValues = [];
	_pressedKeysValues[37] = null;
	_pressedKeysValues[38] = null;
	_pressedKeysValues[39] = null;
	_pressedKeysValues[40] = null;
	_pressedKeysValues[65] = null;
	_pressedKeysValues[87] = null;
	_pressedKeysValues[68] = null;
	_pressedKeysValues[83] = null;


	/**
	 * UI Stuff
	 */
	_pageLoadingShow = function(title, status, percent, description) {
		if( title == undefined ||
			title == false ) {
			title = $('#loading-title').attr('rel');
		}
		if( status == undefined ||
			status == false ) {
			status = $('#loading-status').attr('rel');
		}
		if( percent == undefined ||
			percent == false ) {
			percent = $('#loading-progress').attr('rel');
		}
		if( description == undefined ||
			description == false ) {
			description = $('#loading-description').attr('rel');
		}
		$('#loading').show();
		$('#overlay').show();
		_pageLoadingUpdate(status,percent,description);
	}

	_pageLoadingHide = function() {
		$('#loading').hide();
		$('#overlay').hide();
	}

	_pageLoadingUpdate = function(status,percent,description) {
		if( status != undefined &&
			status != false ) {
			$('#loading-status').text(status);
		}
		if( percent != undefined && 
			percent != false ) {
			$('#loading-progress .carrier').css('width',percent+'%');
		}
		if( description != undefined &&
			description != false ) {
			$('#loading-description').text(description);
		}
		
	}

	_pageLoginShow = function() {
		for( i in _avatars ) {
			$container = $('<span class="avatar"></span>');
			$container.attr('rel',i);
			$imgLink = $('<a href="#">&nbsp;</a>');
			$imgLink.css('background-image', 'url('+_avatars[i].src +')');
			$imgLink.width(_avatars[i].width / 4);
			$imgLink.height(_avatars[i].height / 4);
			$imgLink.css('margin-top',((100 - $imgLink.height())/2)+'px');
			$container.html($imgLink);
			$('#login .avatars').append($container);
		}
		$('#login').show();
		$('#overlay').show();
		$('#login .avatars .avatar a').click(function() {
			$avatars = $(this).closest('.avatars');
			$avatars.find('.avatar.selected').removeClass('selected');
			$(this).closest('.avatar').addClass('selected');
		});
		$('#login-process').click(function() {
			$avatar = $('#login .avatars .avatar.selected:first');
			if( $avatar.length == 0 ) {
				alert("Please choose an avatar.");
				return;
			}
			$username = $('#login input[name="username"]');
			if( $username.length == 0 ||
				$username.val().length == 0 ) {
				alert("Please enter a username.");
				return;
			}
			_pageLoginHide();
			_pageLoadingShow(false,"Logging in.",0,"Generating your character.");
			_sendCharacterLogin($username.val(),$avatar.attr('rel'));
		});
	}

	_pageLoginHide = function() {
		$('#login').hide();
		$('#overlay').hide();
	}
	
	// Needs to be defined before __construct
	_fitCanvas = function() {
		_SCREEN_WIDTH = window.innerWidth;
		_SCREEN_HEIGHT = window.innerHeight;
		_canvas.width = _SCREEN_WIDTH;
		_canvas.height = _SCREEN_HEIGHT;
	}

	_keyDown = function(keyCode) {
		if( _character != undefined && 
			_movementKeys[keyCode] != undefined &&
			_pressedKeysValues[keyCode] == null ) {
			_pressedKeysValues[keyCode] = _movementKeys[keyCode];
			_updateCharacterMovement();
		}
	}

	_keyUp = function(keyCode) {
		if( _character != undefined && 
			_movementKeys[keyCode] != undefined &&
			_pressedKeysValues[keyCode] != null ) {
			_pressedKeysValues[keyCode] = null;
			_updateCharacterMovement();
		}
	}

	_updateCharacterMovement = function() {
		var dX = 0;
		var dY = 0;
		for( i in _pressedKeysValues ) {
			if( _pressedKeysValues[i] != null ) {
				dX += _pressedKeysValues[i][0];
				dY += _pressedKeysValues[i][1];
			}
		}
		if( dX != 0 ||
			dY != 0 ) {
			_character.speed = 4;
			_character.angle = getAngle(0,0,dX,dY);
		} else {
			_character.speed = 0;
		}
		_sendMovementUpdate();
	}

	_imageLoaded = function(filename) {
		_imagesCount++;
		_pageLoadingUpdate("Loading world.",(20 + Math.floor(50 * (_imagesCount / _imagesTotal))),"Resource loaded "+filename+" ( "+_imagesCount+" of "+_imagesTotal+" ) ");
		if( _imagesCount == _imagesTotal ) {
			_pageLoadingUpdate("Loading world.",75,"Drawing world.");
			_imagesLoaded = true;
			// Blank otherwise... onload firing too early?
			setTimeout((function() {
				_showLoginScreen();
			}),500);
		}
	}

	// We should figure out a way to put these in an external file ( callbacks maybe ? )
	_bindSocketEvents = function() {
		
		_socket.on('serverWorldData', function (data) {
			_pageLoadingUpdate("Loading world.",20,"Initializing world data.");

			// Init Images
			if( data.images != undefined ) {
				_imagesTotal += Object.keys(data.images).length;
			}
			if( data.avatars != undefined ) {
				_imagesTotal += Object.keys(data.avatars).length;
			}

			if( data.images != undefined ) {
				_images = {};
				for( i in data.images ) {
					_images[i] = new Image();
					_images[i].onload = partial(_imageLoaded, i);
					_images[i].src = data.images[i];
				}
			}

			if( data.avatars != undefined ) {
				_avatars = {};
				for( i in data.avatars ) {
					_avatars[i] = new Image();
					_avatars[i].onload = partial(_imageLoaded, i);
					_avatars[i].src = data.avatars[i];
				}
			}

			// Copy World
			if( data.world != undefined ) {
				_world = data.world;
			}

			_sendRequestEntities();

		});

		_socket.on('serverEntityList', function (data) {
			if( data.entities != undefined ) {
				for( i in data.entities ) {
					_entities[i] = data.entities[i];
				}
			}
		});

		_socket.on('serverCharacterData', function (data) {
			_pageLoadingHide();
			if( data.character != undefined ) {
				_character = data.character;
			}
		});

		_socket.on('serverEntityUpdate', function (data) {
			if( data.entity_id != undefined &&
				_entities[data.entity_id] != undefined ) {
				if( data.entity.x != undefined ) {
					_entities[data.entity_id].x = data.entity.x;
				}
				if( data.entity.y != undefined ) {
					_entities[data.entity_id].y = data.entity.y;
				}
				if( data.entity.angle != undefined ) {
					_entities[data.entity_id].angle = data.entity.angle;
				}
				if( data.entity.speed != undefined ) {
					_entities[data.entity_id].speed = data.entity.speed;
				}
				if( data.entity.name != undefined ) {
					_entities[data.entity_id].name = data.entity.name;
				}
				if( data.entity.avatar != undefined ) {
					_entities[data.entity_id].avatar = data.entity.avatar;
				}
			} else if ( data.entity_id != undefined &&
						data.entity != undefined ) {
				// We'll add it just in case, but it really shouldn't be here?
				_entities[data.entity_id] = data.entity;
			}
		});

		_socket.on('serverEntityAdd', function (data) {
			if( data.entity_id != undefined &&
				data.entity != undefined ) {
				_entities[data.entity_id] = data.entity;
			}
		});

		_socket.on('serverEntityRemove', function (data) {
			if( data.entity_id != undefined &&
				_entities[data.entity_id] != undefined ) {
				delete _entities[data.entity_id];
			}
		});

	}

	_sendRequestEntities = function() {
		_socket.emit('clientRequestEntities');
	}

	_sendCharacterLogin = function(name,avatar) {
		_socket.emit('clientCharacterLogin',{
			name: name,
			avatar: avatar
		});
	}

	_sendMovementUpdate = function() {
		_socket.emit('clientMovementUpdate',{
			angle: _character.angle,
			speed: _character.speed,
			x: _character.x,
			y: _character.y
		});
	}

	_showLoadingScreen = function() {
		_pageLoadingShow(false,"Connecting to server.",10,"Just hold on a second...");
	}

	_showLoginScreen = function() {
		_pageLoadingHide();
		_pageLoginShow();
	}

	__construct = function() {
		_showLoadingScreen();

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

		_imagesLoaded = false;
		_imagesTotal = 0;
		_imagesCount = 0;

		_entities = {};
		
		_socket = io.connect();

		_bindSocketEvents();
	}()

	_drawFrame = function(frame) {
		if( _world == undefined ||
			_imagesLoaded == false ) {
			return;
		}
		
		var frameXMin = _world.entry.x - Math.round( _SCREEN_WIDTH / 2 );
		var frameXMax = frameXMin + _SCREEN_WIDTH;
		var frameYMin = _world.entry.y - Math.round( _SCREEN_HEIGHT / 2 );
		var frameYMax = frameYMin + _SCREEN_HEIGHT;
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
		if( _entities != undefined ) {
			for( i in _entities ) {
				_drawEntity(_entities[i],frameBox,frame);
			}
		}
	};

	_drawCharacter = function(frameBox,frame) {
		if( _character != undefined ) {
			_drawEntity(_character,frameBox,frame);
		}
	};

	_drawEntity = function(entity,frameBox,frame) {
		var xpos,ypos; // Sprite animation positioning.
		if( entity.angle >= 315 || entity.angle < 45 ) {
			ypos = 2;
		} else if ( entity.angle >= 45 && entity.angle < 135 ) {
			ypos = 3;
		} else if ( entity.angle >= 135 && entity.angle < 225 ) {
			ypos = 1;
		} else if ( entity.angle >= 225 && entity.angle < 315 ) {
			ypos = 0;
		} else {
			ypos = 0; // ??!
		}

		ypos = ypos * ( _avatars[entity.avatar].height / _AVATAR_SPRITE_FRAMES_Y );
		
		xpos = 
			( _avatars[entity.avatar].width / _AVATAR_SPRITE_FRAMES_X ) * 
			( Math.floor( frame * _AVATAR_SPRITE_FRAMES_X / _FPS ) > 3 ? 3 : Math.floor( frame * _AVATAR_SPRITE_FRAMES_X / _FPS ) );
		if( entity.speed == 0 ) {
			xpos = 0;
		}

		_context.drawImage(
			_avatars[entity.avatar], 
			xpos,
			ypos,
			( _avatars[entity.avatar].width / _AVATAR_SPRITE_FRAMES_X ), 
			( _avatars[entity.avatar].height / _AVATAR_SPRITE_FRAMES_Y ), 
			inBoxCoordinateX(entity,frameBox), //character.x,//Math.floor( Math.floor(context.canvas.width / 2) - ( character.image.width / numFrames / 2 ) ), 
			inBoxCoordinateY(entity,frameBox), //character.y,//Math.floor( Math.floor(context.canvas.height / 2) - ( character.image.height / numFrames / 2 ) ), 
			( _avatars[entity.avatar].width / _AVATAR_SPRITE_FRAMES_X ), 
			( _avatars[entity.avatar].height / _AVATAR_SPRITE_FRAMES_Y ));
	}

	_drawSceneBackground = function(frameBox,frame) {
		if( _world == undefined ) {
			return;
		}
		// More memory - tiny CPU improvement.
		/*
		if( _backgroundCanvas == undefined ) {
			_backgroundCanvas = document.createElement('canvas');
			_backgroundCanvas.width = _world.width;
			_backgroundCanvas.height = _world.height;
			if( _world.ground.image != undefined &&
				_world.ground.image.length > 0 ) {
				var backgroundPattern = _backgroundCanvas.getContext('2d').createPattern(_images[_world.ground.image],"repeat");
				_backgroundCanvas.getContext('2d').fillStyle = backgroundPattern;
				_backgroundCanvas.getContext('2d').fillRect(0,0,_backgroundCanvas.width,_backgroundCanvas.height);
			} else {
				_backgroundCanvas.getContext('2d').fillStyle = _world.ground.color;
				_backgroundCanvas.getContext('2d').fillRect(0,0,_backgroundCanvas.width,_backgroundCanvas.height);
			}
			for( i in _world.pieces ) {
				if( _world.pieces[i].solid == false ) {
					_backgroundCanvas.getContext('2d').drawImage(
						_images[_world.pieces[i].image],
						Math.round( _world.pieces[i].x - ( _world.pieces[i].width / 2 ) ),
						Math.round( _world.pieces[i].y - ( _world.pieces[i].height / 2 ) )
					);
				}
			}
		}

		// Copy our canvas.
		_context.drawImage(
			_backgroundCanvas,
			frameBox.xmin,
			frameBox.ymin,
			_SCREEN_WIDTH,
			_SCREEN_HEIGHT,
			0,
			0,
			_SCREEN_WIDTH,
			_SCREEN_HEIGHT
		);
		return;
		*/
		if( _world.ground.image != undefined && 
			_world.ground.image.length > 0 ) {
			if( _worldGroundPattern == undefined ) {
				_worldGroundPattern = _context.createPattern(_images[_world.ground.image],"repeat");
			};
			if( _worldGroundCanvas == undefined ) {
				_worldGroundCanvas = document.createElement('canvas');
			}
			if( _worldGroundCanvas.width != ( _SCREEN_WIDTH + _images[_world.ground.image].width ) || 
				_worldGroundCanvas.height != ( _SCREEN_HEIGHT + _images[_world.ground.image].height ) ) {
				_worldGroundCanvas.width = ( _SCREEN_WIDTH + _images[_world.ground.image].width );
				_worldGroundCanvas.height = ( _SCREEN_HEIGHT + _images[_world.ground.image].height );
				_worldGroundCanvas.getContext('2d').fillStyle = _worldGroundPattern;
				_worldGroundCanvas.getContext('2d').fillRect(0,0,_worldGroundCanvas.width,_worldGroundCanvas.height);
			}
			
			_context.drawImage(
				_worldGroundCanvas,
				( frameBox.xmin % _images[_world.ground.image].width ),
				( frameBox.ymin % _images[_world.ground.image].height ),
				_SCREEN_WIDTH,
				_SCREEN_HEIGHT,
				0,
				0,
				_SCREEN_WIDTH,
				_SCREEN_HEIGHT);
			
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

	// Should eventually be renamed to updateFrame or something
	_updateEntities = function() {
		var timeDelta = Date.now() - _lastTime;
		if( _character != undefined ) {
			_character = _updateEntity(_character,timeDelta);
		}
		if( _entities != undefined ) {
			for( i in _entities ) {
				_entities[i] = _updateEntity(_entities[i],timeDelta);
			}
		}
		_lastTime = Date.now();
	}

	_updateEntity = function(entity,timeDelta) {
		entity.x += Math.round(getDx(entity.angle,entity.speed) * ( timeDelta * _FPS / 1000 ));
		entity.y -= Math.round(getDy(entity.angle,entity.speed) * ( timeDelta * _FPS / 1000 ));
		if( entity.x <= 20 ) {
			entity.x = 20;
		} else if ( entity.x >= ( _world.width - 20 ) ) {
			entity.x = ( _world.width - 20 );
		}
		if( entity.y <= 20 ) {
			entity.y = 20;
		} else if ( entity.y >= ( _world.height - 20 ) ) {
			entity.y = ( _world.height - 20 );
		}
		return entity;
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

	_mainLoop = function() {
		_drawFrame( ( _frame < _FPS ? ++_frame : _frame = 0 ) );
		_updateEntities();
	}

	// Thanks Paul Irish.
	window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function( callback ){
                window.setTimeout(callback, 1000 / 60);
              };
    })();

	this.run = function() {
		_frame = -1;
		_FPS = 60;
		_lastTime = Date.now();
		
		/*
		setInterval( (function() {
			_mainLoop();
		}), 1000 / _FPS );
		*/
		(function animloop(){
			requestAnimFrame(animloop);
			_mainLoop();
		})();
	}



});