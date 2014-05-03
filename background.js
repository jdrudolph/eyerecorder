var mockup_bookmarks = [{link:'http://www.google.com'},{link:'http://www.facebook.com'}];
console.log(chrome.storage);

chrome.storage.sync.set({bookmarks : mockup_bookmarks, stories : []}, function() {console.log('init storage')});

chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			console.log(sender.tab ?
				"from a content script:" + sender.tab.url :
				"from the extension");
			if (request.method == "give me") {
				if (request.what == "the playbacks!")
					chrome.storage.sync.get(function(result) {
					sendResponse(result.stories);
					console.log('sending playbacks' + result.stories.toString());
					});
				if (request.what == "the bookmarks!") {
					chrome.storage.sync.get(function(result) {
						sendResponse(result.bookmarks);
						console.log('sending bookmarks' + result.bookmarks);
					});
				}
			}
			if (request.method == "store this") {
				if (request.what == "bookmark!") {
					console.log("storing bookmark");
					chrome.storage.sync.get(function(result) {
						result.bookmarks.push({link:request.url});
						chrome.storage.sync.set({bookmarks : result.bookmarks},
							function() {console.log('bookmark' + request.url + 'added')});
					});
				}
				if (request.what == "story!")
					console.log("storing story");
					chrome.storage.sync.get(function(result) {
						result.stories.push({story:request.story});
						chrome.storage.sync.set({stories : result.stories},
							function() {console.log('stories' + result.stories.toString() + 'added')});
					});
			}
			return true;
});

