chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
            if (request == "give me the playbacks!")
                sendResponse([{title:'asdf'},{title:'hdfgh'},{title:'sasdfd'}]);
});
