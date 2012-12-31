/**
 * World Engine
 */

// TODO - API
// TODO - PROJECTILES
// TODO - EFFECTS?
var WorldEngine = (function(constructParams) {
	var _engineLastTime,
		_engineFPS,
		_engineWorld,
		_worldPieces;

	__construct = function() {
		_engineLastTime = Date.now();
		_engineFPS = constructParams.FPS;
		_engineWorld = constructParams.world;
		_worldPieces = new QuadTree(
			{
				x:0,
				y:0,
				width:_engineWorld.width,
				height:_engineWorld.height
			},
			true
		);
		for( i in _engineWorld.pieces ) {
			if( _engineWorld.pieces[i].solid == true ) {
				_worldPieces.insert(_engineWorld.pieces[i]);
			}
		}
	}()

	_engineUpdateEntity = function(entity,timeDelta) {
		if( entity.speed == 0 ) {
			return;
		}

		var newPos = _engineCheckEntityPieceCollision(
			entity.x,
			entity.y,
			Math.round(getDx(entity.angle,entity.speed) * ( timeDelta * _engineFPS / 1000 )),
			( Math.round(getDy(entity.angle,entity.speed) * ( timeDelta * _engineFPS / 1000 )) * -1 )
		);

		entity.x = newPos.x;
		entity.y = newPos.y;

		if( entity.x <= 20 ) {
			entity.x = 20;
		} else if ( entity.x >= ( _engineWorld.width - 20 ) ) {
			entity.x = ( _engineWorld.width - 20 );
		}
		if( entity.y <= 20 ) {
			entity.y = 20;
		} else if ( entity.y >= ( _engineWorld.height - 20 ) ) {
			entity.y = ( _engineWorld.height - 20 );
		}
	}

	// Return acceptable coordinates.
	_engineCheckEntityPieceCollision = function(x,y,dX,dY) {
		var validX = false;
		var validY = false;

		// Update this constant - or get more dynamic/creative?
		var pieces = _worldPieces.retrieveInBounds({
			x: ( x - 500 ),
			y: ( y - 500 ),
			width: 1000,
			height: 1000
		});

		for( i in pieces ) {
			if( lineIntersectsRectangle(
				x,
				y,
				( x + dX ),
				( y + dY ),
				pieces[i].xmin,
				pieces[i].ymin,
				pieces[i].xmax,
				pieces[i].ymax
			) ) {
				// Find where it intersects 
				var intersection = lineIntersectsRectanglePoint(
					x,
					y,
					( x + dX ),
					( y + dY ),
					pieces[i].xmin,
					pieces[i].ymin,
					pieces[i].xmax,
					pieces[i].ymax
				);

				if( ! validX && 
					! validY ) {
					validX = intersection.x;
					validY = intersection.y;
				} else if( 
					Math.sqrt( Math.pow(( validX - x ),2) + Math.pow(( validY - y ),2) ) 
					> 
					Math.sqrt( Math.pow(( intersection.x - x ),2) + Math.pow(( intersection.y - y ),2) )
				) {
					validX = intersection.x;
					validY = intersection.y;
				}

			}
		}

		if( ! validX ) {
			validX = ( x + dX );
		}
		if( ! validY ) {
			validY = ( y + dY );
		}

		/*
		for( i in pieces ) {
			// Check X
			if( ( x + dX ) >= pieces[i].xmin &&
				( x + dX ) <= pieces[i].xmax &&
				( y + dY ) >= pieces[i].ymin &&
				( y + dY ) <= pieces[i].ymax ) {
				if( dX > 0 && 
					( 
						! validX ||
						validX > ( pieces[i].xmin - 1 )
					)
				) {
					validX = ( pieces[i].xmin - 1 );
				} else if ( dX < 0 &&
					( 
						! validX ||
						validX < ( pieces[i].xmax + 1 )
					)
				) {
					validX = ( pieces[i].xmax + 1 );
				}
			}
			if( ( x + dX ) >= pieces[i].xmin &&
				( x + dX ) <= pieces[i].xmax &&
				( y + dY ) >= pieces[i].ymin &&
				( y + dY ) <= pieces[i].ymax ) {
				if( dY > 0 && 
					( 
						! validY ||
						validY > ( pieces[i].ymin - 1 )
					)
				) {
					validY = ( pieces[i].ymin - 1 );
				} else if ( dY < 0 &&
					( 
						! validY ||
						validY < ( pieces[i].ymax + 1 )
					)
				) {
					validY = ( pieces[i].ymax + 1 );
				}
			}
		}

		// Error Correct for Unchanged Values
		if( ! validX ) {
			validX = ( x + dX );
		}
		if( ! validY ) {
			validY = ( y + dY );
		}

		if( dX > 0 &&
			x > validX ) {
			validX = x;
		} else if ( dX < 0 && 
			x < validX ) {
			validX = x;
		}

		if( dY > 0 &&
			y > validY ) {
			validY = y;
		} else if ( dY < 0 && 
			y < validY ) {
			validX = y;
		}
		*/
		

		return {
			x: validX,
			y: validY
		};
	}

	lineIntersectsRectanglePoint = function(l_x1,l_y1,l_x2,l_y2,r_xmin,r_ymin,r_xmax,r_ymax) {

		var dX = ( l_x2 - l_x1 );
		var dY = ( l_y2 - l_y1 );

		var x = l_x1;
		var y = l_y1;

		var xHit = false;
		var yHit = false;

		var bumpX = 0;
		var bumpY = 0;

		// Three Laws - Just make it work.

		var cx = ( y - ( ( dY / dX ) * x ) );
		var cy = ( x - ( ( dX / dY ) * y ) );

		var points = [];

		points.push({
			x: r_xmin,
			y: Math.floor(( ( dY / dX ) * r_xmin ) + cx)
		});
		points.push({
			x: r_xmax,
			y: Math.floor(( ( dY / dX ) * r_xmax ) + cx)
		});
		points.push({
			x: Math.floor(( ( dX / dY ) * r_ymin ) + cy),
			y: r_ymin
		});
		points.push({
			x: Math.floor(( ( dX / dY ) * r_ymax ) + cy),
			y: r_ymax
		});

		for( i in points ) {
			if( points[i].x >= r_xmin &&
				points[i].x <= r_xmax &&
				points[i].y >= r_ymin &&
				points[i].y <= r_ymax &&
				(
					(
						xHit == false &&
						yHit == false
					) ||
					(
						Math.sqrt( Math.pow(( xHit - x ),2) + Math.pow(( yHit - y ),2) ) 
						> 
						Math.sqrt( Math.pow(( points[i].x - x ),2) + Math.pow(( points[i].y - y ),2) )
					)
				)
			) {
				xHit = points[i].x;
				yHit = points[i].y;
			}
		}
		
		if( xHit == r_xmax ) {
			xHit = ( r_xmax + ( dX > 0 ? -1 : 1 ) );
		}
		else if ( xHit == r_xmin ) {
			xHit = ( r_xmin + ( dX > 0 ? -1 : 1 ) );
		}

		if( yHit == r_ymax ) {
			yHit = ( r_ymax + ( dY > 0 ? -1 : 1 ) );
		}
		else if ( yHit == r_ymin ) {
			yHit = ( r_ymin + ( dY > 0 ? -1 : 1 ) );
		}

		return {
			x: xHit,
			y: yHit
		}

	}

	lineIntersectsRectangle = function(l_x1,l_y1,l_x2,l_y2,r_xmin,r_ymin,r_xmax,r_ymax) {
		// Find min and max X for the segment

		var minX = l_x1;
		var maxX = l_x2;

		if(l_x1 > l_x2) {
			minX = l_x2;
			maxX = l_x1;
		}

		// Find the intersection of the segment's and rectangle's x-projections

		if(maxX > r_xmax) {
			maxX = r_xmax;
		}

		if(minX < r_xmin) {
			minX = r_xmin;
		}

		// If their projections do not intersect return false
		if(minX > maxX) {
			return false;
		}

		// Find corresponding min and max Y for min and max X we found before

		var minY = l_y1;
		var maxY = l_y2;

		var dx = l_x2 - l_x1;

		if(Math.abs(dx) > 0 ) {
			var a = (l_y2 - l_y1) / dx;
			var b = l_y1 - a * l_x1;
			minY = a * minX + b;
			maxY = a * maxX + b;
		}

		if(minY > maxY) {
			var tmp = maxY;
			maxY = minY;
			minY = tmp;
		}

		// Find the intersection of the segment's and rectangle's y-projections

		if(maxY > r_ymax) {
			maxY = r_ymax;
		}

		if(minY < r_ymin) {
			minY = r_ymin;
		}

		// If Y-projections do not intersect return false
		if(minY > maxY) {
			return false;
		}

		return true;
	}

	this.updateFrame = function(character,entities) {
		var timeDelta = Date.now() - _engineLastTime;
		if( character != undefined ) {
			_engineUpdateEntity(character,timeDelta);
		}
		if( entities != undefined ) {
			for( i in entities ) {
				_engineUpdateEntity(entities[i],timeDelta);
			}
		}
		_engineLastTime = Date.now();
	}
});