var mockup_playbacks = [{title:'asdf'},{title:'hdfgh'},{title:'sasdfd'}]
var mockup_bookmarks = [{link:'http://www.google.com'},{link:'http://www.facebook.com'}]

chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
            if (request.method == "give me") {
                if (request.what == "the playbacks!")
                    sendResponse(mockup_playbacks);
                if (request.what == "the bookmarks!")
                    sendResponse(mockup_bookmarks);
            }
            if (request.method == "store this") {
                if (request.what == "bookmark!")
                    console.log(request.url)
                if (request.what == "playback!")
                    console.log(request.story)
            }

});
