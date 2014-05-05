chrome.storage.sync.set({bookmarks : [], stories : ['your ad could be here']}, function() {console.log('initalize storage')});

chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
			console.log(sender.tab ?
				"from a content script:" + sender.tab.url :
				"from the extension");
			if (request.newbookmark) {
				chrome.storage.sync.get('bookmarks', function(storage) {
					var bks = storage.bookmarks;
					bks.push(request.newbookmark);
					chrome.storage.sync.set({bookmarks:bks}, function() {
						console.log('bookmark added to', bks);
					});
					chrome.tabs.query({}, function(tabs) {
						var message = {bookmarks:bks};
						for (var i=0; i<tabs.length; i++) {
							chrome.tabs.sendMessage(tabs[i].id,message);
						}
					});
				});
				sendResponse({success:true});
			}
			// for initialization upon page load
			else if (request == "getlists") {
				chrome.storage.sync.get(function(storage) {
					sendResponse({bookmarks:storage.bookmarks, stories:storage.stories});
				});
			}

			return true;
});
