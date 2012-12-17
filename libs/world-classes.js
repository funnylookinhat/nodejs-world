/**
 * World Classes
 * Used for generating and delivering the world.
 */

exports.Piece = (function (params) {
	var piece = {};

	piece.image = params.image != undefined ? params.image : null;
	piece.x = params.x != undefined ? params.x : 0;
	piece.y = params.y != undefined ? params.y : 0;
	piece.width = params.width != undefined ? params.width : 0;
	piece.height = params.height != undefined ? params.height : 0;
	piece.solid = params.solid != undefined ? params.solid : false;

	return piece;
});

exports.Entity = (function (params) {
	var entity = {};

	entity.name = params.name != undefined ? params.name : "somebody";
	entity.x = params.x != undefined ? params.x : 0;
	entity.y = params.y != undefined ? params.y : 0;
	entity.width = params.width != undefined ? params.width : 0;
	entity.height = params.height != undefined ? params.height : 0;
	entity.avatar = params.avatar != undefined ? params.avatar : null;
	entity.speed = 0;
	entity.angle = 0;
	
	return entity;
});
