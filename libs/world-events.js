/**
 * Socket IO actions that world-server calls.
 */

exports.sendWorldData = (function (params) {
	params.socket.emit('serverWorldData',{
		images: params.images,
		avatars: params.avatars,
		world: params.world
	});
});

exports.sendCharacterData = (function (params) {
	params.socket.emit('serverCharacterData',{
		character: params.character
	});
});