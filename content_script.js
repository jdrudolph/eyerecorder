//     Raijin.js 0.1
//     (c) 2011 Scott Murphy @hellocreation
//     Raijin may be freely distributed under the MIT license.
(function(w) {

	//Initial Setup
	//set root variable to window object
	var root = w;

	//create Raijin object
	var Raijin = Raijin || {};

	// Require Jquery as a dependency
	if (typeof jQuery === 'undefined') {
		throw new Error("Dependency Error.  Jquery is undefined.");
	}

	Raijin = {

		//current version of Raijin
		VERSION: 0.1,

		//vars
		mouseX: null,
		mouseY: null,

		//main array to hold storyEvent
		storyScript: new Array(),

		init: function() {
			Raijin.recorder.init();

			//add fake mouse to be used during playback.  fake mouse initially is hidden
			Raijin.story.registerFakeMouse();
		}
	};

	Raijin.recorder = {
		//set root jquery object
		w: $(root),

		//bool to check for recording
		recordAllowed: false,

		//bool to check if mouseisDown
		mouseDown: false,

		init: function() {
			this.registerEvents(['click','keyup'])
		},

		//trace events
		registerEvents: function(events) {
			var self = this;
			//loop through events and bind each type of event
			for (var i = 0; i < events.length; i++) {
				self.w.bind(events[i], function(e) {
					var se = self.setStoryEvent(e.handleObj.type, e);
					self.addStoryEvent(se);
				});
			}

		},

		//get mouse position @return string "mouseX, mouseY"
		getMousePosition: function() {
			var position = Raijin.mouseX + "," + Raijin.mouseY;
			return position;
		},

		//creates a storyEvent object in format to be passed to story object
		setStoryEvent: function(type, event) {
			console.log(type + " " + Raijin.mouseX);

			Raijin.mouseX = event.pageX;
			Raijin.mouseY = event.pageY;
			var storyEvent = {
				type: type,
				mouseX: Raijin.mouseX,
				mouseY: Raijin.mouseY
			}
			return storyEvent;
		},

		addStoryEvent: function(storyEvent) {
			if (! (this.recordAllowed)) return;
			Raijin.storyScript.push(storyEvent);
		}
	}

	Raijin.story = {
		//story state
		state: "initialized",
		timer: null,
		currentFrame: 0,
		frameRate: 20,
		prevMouseX: null,
		prevMouseY: null,

		//append a fake mouse to be used during playback
		registerFakeMouse: function() {
			cursor = '<img src="/raijin/images/cursor.png" id="raijin-cursor" style="position:absolute !important; z-index:100000; display:none;"/>';
			$('body').append(cursor);
		},

		//show the mouse and remove fake mouse image
		showMouse: function() {
			$('#raijin-cursor').hide();
		},

		//hide the user mouse and show fake mouse image
		hideMouse: function() {
			//$('*').css('cursor','none');
		},

		//play mouse recording
		play: function() {
			this.state = "playing";
			this.hideMouse();
			this.timer = setInterval(function(){Raijin.story.playFrame()}, this.frameRate);
		},

		//loop that runs each frame of playback
		playFrame: function() {

			//escape loop if we have completed the storyScript
			if (this.currentFrame === Raijin.storyScript.length) {
				this.stop();
				return;
			}

			//set new coordinates
			var mouseX = Raijin.storyScript[this.currentFrame].mouseX;
			var mouseY = Raijin.storyScript[this.currentFrame].mouseY;
			var eventType = Raijin.storyScript[this.currentFrame].type;
			this.currentFrame++;

			if (this.prevMouseX === null) {
				console.log('init');
				$('#raijin-cursor').css("left", mouseX).css("top", mouseY).show();
			} else {
				var xDiff = mouseX - this.prevMouseX;
				var yDiff = mouseY - this.prevMouseY;
				$('#raijin-cursor').animate({
					left: "+=" + xDiff,
					top: "+=" + yDiff
				},
				5);
			}

			var target = this.getDOMElementFromPoint(mouseX, mouseY);

			switch (eventType) {
			case "click":
				$(target).not('#record, #play, #stop, #clear').click();
				break;
			case "dragover":
				// $(target).dragstart();
				break;
			case "dragleave":
				//$(target).dragend();
				break;
			}

			//set previous coordinate for next run
			this.prevMouseX = mouseX;
			this.prevMouseY = mouseY;

		},

		stop: function() {
			this.state = "stopped";
			clearInterval(this.timer);
			Raijin.recorder.recordAllowed = false;
			this.currentFrame = 0; //reset frame to 0;
			this.prevMouseX = null;
			this.prevMouseY = null;

			this.showMouse();
		},

		record: function() {
			this.state = "recording";
			this.clear(); //clear stories
			Raijin.recorder.recordAllowed = true;
		},

		clear: function() {
			this.state = "clearing";
			Raijin.storyScript.length = 0;
		},

		getDOMElementFromPoint: function(x, y) {
			$('#raijin-cursor').hide();
			var target = document.elementFromPoint(x, y);
			$('#raijin-cursor').show();
			return target;
		}
	}

	Raijin.output = {
		//export as json
		json: function() {

		},
		//output raw object
		raw: function() {
			console.log(Raijin.storyScript);
		}
	}

	//expose Raijin object to window.
	root.Raijin = Raijin;
	root.Raijin.init();
})(window);

$('head').prepend('<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.0.3/css/font-awesome.min.css">');
$('body').prepend('<div id="eyerecorder"><span class="fa-circle"></span><span class="fa-stop"></span><span class="fa-play-circle"></span><span class="fa-book"></span></div>');

(function($) {
	$('.control').hide();
	$('#record').show();

	var record = $('#eyerecorder :nth-child(1)')
	var stop = $('#eyerecorder :nth-child(2)')
	var play = $('#eyerecorder :nth-child(3)')
	var bookmarks = $('#eyerecorder :nth-child(4)')

	record.click(function() {
		Raijin.story.record();
		$('.control').hide();
		$('#stop').show();
	});

	stop.click(function() {
		Raijin.story.stop();
		$('.control').hide();
		$('#play').show();
		$('#stop').show();
		$('#clear').show();
	});

	play.click(function() {
		chrome.runtime.sendMessage({method : "give me", what : "the playbacks!"}, function(result) {
			play.empty().append(
				$('<ol>').append(
					$.map(result, function(x, i) {
						return $('<li>').text(x.title);
					})
					)
				);
		});
	});

	play.on('click', 'li', function() {
		console.log("clicked playlist");
		Raijin.story.play(this);
	});

	bookmarks.click(function() {
		console.log('bookmarks clicked');
		chrome.runtime.sendMessage({method : "give me", what : "the bookmarks!"}, function(result) {
			console.log('bookmarks received' + result);
			bookmarks.empty().append(
				$('<ol>').append(
					$.map(result, function(x, i) {
						return $('<li>').text(x.link);
					})
					)
				).append($('<span>').addClass('fa-bookmark'));
		});
	});

	bookmarks.on('click', 'li', function() {
		console.log("clicked bookmark" + this.innerText);
		window.location.replace(this.innerText);
	});
	bookmarks.on('click', 'span', function() {
		console.log("add bookmark" + document.URL);
		chrome.runtime.sendMessage({method: "store this", what : "bookmark!", url:document.URL}, function(result) {
			console.log("bookmark storage request returned");
		});
	});

})(jQuery);
