/**
 * help.js
 * Adds support for ghetto browsers.
 */

if (!Object.keys) {
  Object.keys = (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;
 
    return function (obj) {
      if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');
 
      var result = [];
 
      for (var prop in obj) {
        if (hasOwnProperty.call(obj, prop)) result.push(prop);
      }
 
      if (hasDontEnumBug) {
        for (var i=0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
        }
      }
      return result;
    }
  })()
};

function partial(func /*, 0..n args */) {
  var args = Array.prototype.slice.call(arguments, 1);
  return function() {
    var allArguments = args.concat(Array.prototype.slice.call(arguments));
    return func.apply(this, allArguments);
  };
}

/**
 * Math Stuff - Should move this elsewhere ? In some common/helper.js or something
 */

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