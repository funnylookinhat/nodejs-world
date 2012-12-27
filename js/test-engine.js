/**
 * NodeJS-World
 * test-engine.js
 * Simulates client input to move characters for testing.
 */

var TestEngine = (function(constructParams) {
	var _arrowKeys,
		_currentKey,
		_direction;

	__construct = function() {
		_arrowKeys = [37,38,39,40];
		var startIndex = Math.floor( Math.random() * _arrowKeys.length );
		if( startIndex > 3 ) {
			startIndex = 3;
		}
		if( Math.floor( Math.random() * 2 ) == 0 ) {
			_arrowKeys = _arrowKeys.reverse();
		}
		_currentKey = _arrowKeys[startIndex];
	}()

	_newKey = function() {
		if( _currentKey != false ) { 
			var keyup = jQuery.Event("keyup");
			keyup.which = _currentKey;
			$(document).trigger(keyup);
		}
		if( _arrowKeys[_arrowKeys.indexOf(_currentKey) + 1] == undefined ) {
			_currentKey = _arrowKeys[0];
		} else {
			_currentKey = _arrowKeys[_arrowKeys.indexOf(_currentKey) + 1];
		}
		var keydown = jQuery.Event("keydown");
		keydown.which = _currentKey;
		$(document).trigger(keydown);
		setTimeout((function() {
			_newKey();
		}), 500);
	}

	this.run = function() {
		_newKey();
	}

});
