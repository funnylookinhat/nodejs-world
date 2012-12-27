/**
 * World Server
 * Passed a socket IO handler at minimum.
 */

var worldClasses = require('./world-classes');
var worldEvents = require('./world-events');
// var chatEvents = require('./chat-events');

exports = module.exports = function(params) {
	
	var _socket = params.socket != undefined ? params.socket : null;
	var _entities = {};
	var _images = params.images;
	var _avatars = params.avatars;
	var _default_avatar = params.default_avatar;
	var _AVATAR_SPRITE_FRAME_X = 4,
		_AVATAR_SPRITE_FRAME_Y = 4;

	// Temporary - we should move this into a config file.
	var _baseDirectory = params.baseDirectory;
	
	var _world = {
		width: 10000,
		height: 10000,
		entry: {
			x: 5000,
			y: 5000
		},
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
		solid = false;
		if( i % 20 <= 9 ) {
			image = 'flower1';
			width = 17;
			height = 16;
			solid = false;
		} else if ( i % 20 <= 17 ) {
			image = 'flower2';
			width = 28;
			height = 25;
			solid = false;
		} else if ( i % 20 <= 18 ) {
			image = 'tree1';
			width = 115;
			height = 157;
			solid = true;
		} else {
			image = 'tree2';
			width = 123;
			height = 151;
			solid = true;
		}
		_world.pieces.push({
			image: image,
			width: width,
			height: height,
			x: Math.round( Math.random() * _world.width ),
			y: Math.round( Math.random() * _world.height ),
			solid: solid
		});
	}

	// TODO - Move all of these binds into other files?  Separate into world vs. chat ?
	_socket.sockets.on('connection', function (socket) {
		worldEvents.sendWorldData({
			socket: socket,
			images: _images,
			avatars: _avatars,
			world: _world
		});

		worldEvents.sendEntityList({
			socket: socket,
			entities: _entities
		});

		socket.on('clientCharacterLogin', function (data) {
			// TODO - Validate avatar information and whatnot.
			var dataName = data.name != undefined ? data.name : "Nobody";
			var dataX = data.x != undefined ? data.x : Math.round( _world.entry.x );
			var dataY = data.y != undefined ? data.y : Math.round( _world.entry.y );
			var dataAvatar = data.avatar != undefined ? data.avatar : null;
			if( dataAvatar == null ||
				_avatars[dataAvatar] == undefined ) {
				dataAvatar = _default_avatar;
			}
			
			// These should be loaded from a config file.
			var dataWidth = 32;
			var dataHeight = 48;

			_entities[socket.id] = worldClasses.Entity({
				name: dataName,
				x: dataX,
				y: dataY, 
				avatar: dataAvatar,
				width: dataWidth,
				height: dataHeight,
			});

			worldEvents.sendCharacterData({
				socket: socket,
				character: _entities[socket.id]
			});

			worldEvents.sendEntityAdd({
				socket: socket.broadcast,
				entity_id: socket.id,
				entity: _entities[socket.id]
			});	

		});
		
		socket.on('clientMovementUpdate', function (data) {
			if( _entities[socket.id] == undefined ) {
				// TODO - Send Error
				return;
			}
			if( data.angle != undefined ) {
				_entities[socket.id].angle = data.angle;
			}
			if( data.speed != undefined ) {
				_entities[socket.id].speed = data.speed;
			}
			if( data.x != undefined ) {
				_entities[socket.id].x = data.x;
			}
			if( data.y != undefined ) {
				_entities[socket.id].y = data.y;
			}
			worldEvents.sendEntityUpdate({
				socket: socket.broadcast,
				entity_id: socket.id,
				entity: _entities[socket.id]
			});
		});

		socket.on('clientSendChatMessage', function (data) {
			if( _entities[socket.id] == undefined ) {
				// TODO - Send Error
				return;
			}
			if( data.text != undefined ) {
				worldEvents.sendChatMessage({
					socket: socket,
					text: data.text,
					entity_id: socket.id
				});

				worldEvents.sendChatMessage({
					socket: socket.broadcast,
					text: data.text,
					entity_id: socket.id
				});
			}
		});

		socket.on('disconnect', function () {
			worldEvents.sendEntityRemove({
				socket: socket.broadcast,
				entity_id: socket.id
			});
			delete _entities[socket.id];
		});

	});

	return;
	
};