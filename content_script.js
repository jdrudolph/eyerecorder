/// EyeRecorder
/// https://github.com/jdrudolph/EyeRecorder.git
// Some code based on Raijin.js 0.1, but needs "fixing"...
// Raijin by (c) 2011 Scott Murphy @hellocreation; distributed under the MIT license.
(function(w,$){
	story = {
		X0 : 0,
		Y0 : 0,
		eventlist : [],
		currentFrame : 0,
		maxFrame : -1,

		push : function(X1, Y1, type) {
			this.eventlist.push({X:X1 - this.X0,Y:Y1 - this.Y0,type:type});
			this.X0 = X1;
			this.Y0 = Y1;
			this.maxFrame++;
		},

		play : function() {
			this.frameRate = 100;
			$('#fake_cursor').show();
			$('#fake_cursor').css("left",0).css("top", 0).show();
			this.timer = setInterval('story.playFrame();', this.frameRate);
		},

		playFrame : function() {
			event = this.eventlist[this.currentFrame];
			$('#fake_cursor').animate({left : '+=' + event.X,
					top : '+=' + event.Y},5);
			if (this.currentFrame >= this.maxFrame) {
				clearInterval(this.timer);
				this.currentFrame = 0;
				this.X0 = 0;
				this.Y0 = 0;
				this.eventlist = [];
				this.maxFrame = -1;
				$('#fake_cursor').hide();
			}
			else {
				this.currentFrame++;
			}
		}
	}

	// Inject dependencies (assets) we require: jQuery, FontAwesome.
	$('head').prepend('<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.0.3/css/font-awesome.min.css">');
	$('body').prepend('<div id="eyerecorder"><span class="record fa fa-circle"></span><span class="stop fa fa-stop"></span><span class="menu fa fa-play-circle"><div class="dropdown"><ol class="play stories"></ol><div class="fa fa-eraser clear"></div></div></span><span class="menu fa fa-book"><div class="dropdown"><ol class="bookmarks"></ol><div class="fa fa-plus addBookmark"></div><div class="fa fa-eraser clear"</div></div></div></span><img src="https://upload.wikimedia.org/wikipedia/commons/c/ca/Mouse_pointer_small.png" id="fake_cursor"></img></div>');

	$('.dropdown').hide();
	$('#fake_cursor').hide();

	$('.play').on('click', function() {
		story.play();
	});
	
	$('.record').on('click', function() {
		$('html').on('mousemove click', function(event) {
			story.push(event.pageX, event.pageY, event.type);	
		});
		$('html').css({cursor:'crosshair'});
	});
	
	$('.stop').on('click', function() {
		$('html').off('mousemove click');	
		$('html').css({cursor:'default'});
	});

	$('.menu').on('click', function() {
		var dropdown = $(this).find('.dropdown')
		dropdown.slideToggle('fast');
	});

	$(".addBookmark").on('click', function() {
		chrome.runtime.sendMessage({newbookmark:window.location.href}, function(response) {
			console.log(response.success);
		});
	});

	// TODO : sendmessage to background, overthink use-case - remove one? all?
	$(".clear").on('click', function() {
		$(this).closest('.dropdown').find('ol').empty();
	});

	// initialize lists upon page-load
	chrome.runtime.sendMessage("getlists", function(lists) {
		$(".bookmarks").empty().append(
			$.map(lists.bookmarks, function(b,i) {
				return $('<li>').text(b);
			})
		);
		$(".stories").empty().append(
			$.map(lists.stories, function(b,i) {
				return $('<li>').text(b);
			})
		);
	});

	chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
		if (request.bookmarks) {
			$(".bookmarks").empty().append(
				$.map(request.bookmarks, function(b,i) {
					return $('<li>').text(b);
				})
			);
		}
		// TODO handle newly added stories
		return true;
	});
	
})(window,jQuery);//??? Not sure why we want to insulate window?
