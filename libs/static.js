// Manage all of the static served content in one place.
// Realistically this should be handled by a different 
// web server ( apache/nginx/lighttpd ) or a CDN.

exports = module.exports = function(params) {
	// Requires params.app
	// 			params.baseDirectory
	
	var baseDirectory = params.baseDirectory != undefined ? params.baseDirectory : null;
	var app = params.app != undefined ? params.app : null;

	if( baseDirectory == null || 
		app == null ) {
		throw new Error("Static module could not be started - missing required parameters.");
	}

	// TESTING ONLY
	app.get('/resources/*', function(req, res) {
		res.sendfile(baseDirectory+'/resources/'+req.params[0]);
	});

	// CSS
	app.get('/css/*', function(req, res) {
		res.sendfile(baseDirectory+'/css/'+req.params[0]);
	});

	// JS
	app.get('/js/*', function(req, res) {
		res.sendfile(baseDirectory+'/js/'+req.params[0]);
	});

	// COMMON
	app.get('/common/*', function(req, res) {
		res.sendfile(baseDirectory+'/common/'+req.params[0]);
	});

	// index.html
	app.get('/', function (req, res) {
	  res.sendfile(baseDirectory + '/index.html');
	});
}