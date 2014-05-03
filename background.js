var mockup_playbacks = [{title:'asdf'},{title:'hdfgh'},{title:'sasdfd'}]
var mockup_bookmarks = [{link:'http://www.google.com'},{link:'http://www.facebook.com'}]

console.log(chrome.storage);

chrome.storage.sync.set({bookmarks : mockup_bookmarks, playbacks : mockup_playbacks}, function() {console.log('init storage')});

chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
            if (request.method == "give me") {
                if (request.what == "the playbacks!")
                    chrome.storage.sync.get(function(result) {
                        sendResponse(mockup_playbacks);
                        console.log('sending playbacks' + result.playbacks);
                    });
                if (request.what == "the bookmarks!") {
                    chrome.storage.sync.get(function(result) {
                        sendResponse(result.bookmarks);
                        console.log('sending bookmarks' + result.bookmarks);
                    });
                }
            }
            if (request.method == "store this") {
                console.log("store:" + request.what);
                if (request.what == "bookmark!") {
                    console.log("storing bookmark");
                    chrome.storage.sync.get(function(result) {
                        console.log("get old bookmarks");
                        result.bookmarks.push({link:request.url});
                        console.log(chrome.storage.sync.set);
                        chrome.storage.sync.set({bookmarks : result.bookmarks},
                            function() {console.log('bookmark' + request.url + 'added')});
                    });
                }
                if (request.what == "playback!")
                    console.log(request.story)
            }
            return true;

});

