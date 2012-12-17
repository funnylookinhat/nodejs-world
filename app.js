// Basic HTTP Delivery with Express
var express = require('express');
var app = express();
var server = require('http').createServer(app);

// Socket.IO
var io = require('socket.io').listen(server,{log: false});

/**
 * Test Data
 * ( Testing Only )
 */
var images = {};
images['grass']		=	"resources/world/grass.png";
images['flower1']	=	"resources/world/flower1.png";
images['flower2']	=	"resources/world/flower2.png";
images['tree1']		=	"resources/world/tree1.png";
images['tree2']		=	"resources/world/tree2.png";

// Boom - Avatars for simplez.
var avatars = {};
var default_avatar = null;

var fs = require('fs');
var avatarFiles = fs.readdirSync(__dirname+"/resources/avatars/");
for( i in avatarFiles ) {
	if( avatarFiles[i].length > 3 ) {
		avatars[avatarFiles[i].substring(0,avatarFiles[i].indexOf('.'))] = "resources/avatars/"+avatarFiles[i];
	}
}

default_avatar = 'pirate_m2';

// Start server.
server.listen(process.env.PORT || 1337);

// Static Content - Testing only.
var static = require('./libs/static')({
  app: app,
  baseDirectory: __dirname
});

// Init world server here.
var worldServer = require('./libs/world-server')({
	images: images,
	avatars: avatars,
	default_avatar: default_avatar,
	baseDirectory: __dirname,
	socket: io
});
