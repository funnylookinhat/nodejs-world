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

exports.sendEntityList = (function (params) {
	params.socket.emit('serverEntityList',{
		entities: params.entities
	});
});

exports.sendEntityUpdate = (function (params) {
	params.socket.emit('serverEntityUpdate',{
		entity_id: params.entity_id,
		entity: params.entity
	});
});

exports.sendEntityAdd = (function (params) {
	params.socket.emit('serverEntityAdd',{
		entity_id: params.entity_id,
		entity: params.entity
	});
});