/**
 * page.js
 * Helper functions to manage the DOM elements on the page ( i.e. non-canvas )
 */

function pageLoadingShow(title, status, percent, description) {
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
	pageLoadingUpdate(status,percent,description);
}

function pageLoadingHide() {
	$('#loading').hide();
	$('#overlay').hide();
}

function pageLoadingUpdate(status,percent,description) {
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

function pageLoginShow(avatars) {
	for( i in avatars ) {
		$container = $('<span class="avatar"></span>');
		$imgLink = $('<a href="#">&nbsp;</a>');
		$imgLink.css('background-image', 'url('+avatars[i].src +')');
		$imgLink.width(avatars[i].width / 4);
		$imgLink.height(avatars[i].height / 4);
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

	});
}

function pageLoginHide() {
	$('#login').hide();
	$('#overlay').hide();
}