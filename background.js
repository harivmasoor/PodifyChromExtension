chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'captureTabAudio') {
        chrome.tabCapture.capture({
            audio: true,
            video: false
        }, (stream) => {
            // Check if there's an error.
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                sendResponse({ error: chrome.runtime.lastError.message });
                return;
            }

            // You now have the tab's audio stream.
            // You can pass this stream to your web app or handle it here as needed.
            if (stream && stream.id) {
                sendResponse({ streamId: stream.id });
            } else {
                sendResponse({ error: 'Failed to capture audio.' });
            }
        });

        return true;  // This should be kept to handle async events in MV2 but might not be effective in MV3.
    }
});


