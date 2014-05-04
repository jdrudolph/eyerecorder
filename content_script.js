/// EyeRecorder
/// https://github.com/jdrudolph/EyeRecorder.git
//??? Some code based on Raijin.js 0.1, but needs "fixing"...
// Raijin by (c) 2011 Scott Murphy @hellocreation; distributed under the MIT license.
(function(w,$){
	//Initial Setup
	//set root variable to window object
	var root = w;//??? Huh? Whatever for? WTF? window is globals, not DOM root -- that's document (ie <html>).
	//??? var Raijin = Raijin || {};//??? WTF?

	// Require jQuery as a dependency //??? Inject it ourselves then, don't just complain!?
	if (! jQuery) {throw new Error("Dependency Error.  Jquery is undefined.");}

	// Export namespace. //??? Are all/any of these really needed?! I don't think so.
	root.Raijin = Raijin = {
		//current version of Raijin
		VERSION: 0.1,//??? Duplicate of (and out of sync with!) manifest.json?
		mouseX: null,//??? Why needed?
		mouseY: null,
		//main array to hold storyEvent
		storyScript: [], //???new Array(),//??? Better alloc it when starting recording?
		title: "title",//??? Foo? Unused?

		init: function() {
			Raijin.recorder.init();
			//add fake mouse to be used during playback.  fake mouse initially is hidden
			Raijin.story.registerFakeMouse();
		},
	};

	Raijin.recorder = {//??? Why needed? Seems isn't.
		//set root jquery object
		w: $(root),//??? Seems wrong: "root" should be document, not window?! And why needed?
		recordAllowed: false, //bool to check for recording
		//??? mouseDown: false, //bool to check if mouseisDown

		init: function() {
			this.registerEvents(['click', 'mousemove', 'input'])
		},

		//trace events
		registerEvents: function(events) {
			var self = this;//??? Who is this this?
			//loop through events and bind each type of event
			for (var i = 0; i < events.length; i++) {
				self.w.bind(events[i], function(e) {//??? "bind"? WTF? Obsolete for ages. Use "on" and don't need loop.
					var se = self.setStoryEvent(e.handleObj.type, e);
					self.addStoryEvent(se);
				});
			}
		},

		//get mouse position @return string "mouseX,mouseY"
		getMousePosition: function() {//??? Why return "globals" instead of passing parameters?
			var position = Raijin.mouseX + "," + Raijin.mouseY;//??? Why bother with local var?
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

			switch (type) {
				case "mousemove":
					break;
				case "click":
					storyEvent.description = "clicked ";//???... + clicked.what
					break;
				case "input":
					storyEvent.description = "input ";
					//???...
					//storyEvent.text = event.text
					break;
			}
			return storyEvent;
		},

		addStoryEvent: function(storyEvent) {
			if (this.recordAllowed) Raijin.storyScript.push(storyEvent);
			//??? BUG: avoid recording click on "stop".
		}
	}

	Raijin.story = {
		//story state
		state: "initialized",//??? What for?
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
		},
	};

	Raijin.output = {
		//export as json
		json: function() {},
		//output raw object
		raw: function() {
			console.log(Raijin.storyScript);
		},
	};

	Raijin.init(); // Initialize: registers handlers for events to record, and creates "fake mouse".

	// Inject dependencies (assets) we require: jQuery, FontAwesome.
	$('head').prepend('<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.0.3/css/font-awesome.min.css">');
	$('body').prepend('<div id="eyerecorder"><span class="fa fa-circle"></span><span class="fa fa-stop"></span><span class="fa fa-play-circle"></span><span class="fa fa-book"></span></div>');
	$('.control').hide();//??? Who?
	$('#record').show();//??? Who?

	$('#output').click(function() {//??? Unused.
		Raijin.output.raw();
	});

	$('#clear').click(function() {//??? Unused.
		Raijin.story.clear();
		$('.control').hide();
		$('#record').show();
	});

	var record = $('#eyerecorder>:nth-child(1)');//??? Yeah, using indices smells; use a class instead.
	record.click(function() {
		console.log("recording started");
		Raijin.story.record();
	});

	var stop = $('#eyerecorder>:nth-child(2)');
	$('#eyerecorder :nth-child(2)').click(function() {
		Raijin.story.stop();
		console.log("add story" + Raijin);
		chrome.runtime.sendMessage({method: "store this", what : "story!", story:Raijin.storyScript}, function(result) {
			console.log("story storage request returned");
		});
	});

	var play_table = $('#eyerecorder > :nth-child(3) > *');
	var play = $('#eyerecorder :nth-child(3)')
	play.click(function() {
		bookmarks_table.hide();
		chrome.runtime.sendMessage({method : "give me", what : "the playbacks!"}, function(result) {
			play.empty().append(
				$('<ol>').append(
					$.map(result, function(x, i) {
						return $('<li>').text("story");
					})
				)
			);
		});
	});
	//??? Explain...
	play.on('click', 'li', function() {
		console.log("clicked playlist " + this);//??? Does "this" stringify nicely?
		this.play;
	});

	var bookmarks_table = $('#eyerecorder > :nth-child(4) > *');//??? "*" smells like trouble.
	var bookmarks = $('#eyerecorder>:nth-child(4)');
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
	//??? Explain...
	bookmarks.on('click', 'li', function() {
		var t=$(this).text();
		console.log("clicked bookmark"+t);
		window.location=t;
	});
	bookmarks.on('click', 'span', function() {
		console.log("add bookmark" + document.URL);
		chrome.runtime.sendMessage({method: "store this", what : "bookmark!", url:document.URL}, function(result) {
			console.log("bookmark storage request returned");
		});
	});
})(window,jQuery);//??? Not sure why we want to insulate window?
