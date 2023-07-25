chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'captureTabAudio') {
        chrome.tabCapture.capture({
            audio: true,
            video: false
        }, (stream) => {
            // You now have the tab's audio stream.
            // You can pass this stream to your web app.
            sendResponse({ streamId: stream.id });
        });
    }
    return true;  // This keeps the message channel open for sendResponse.
});
