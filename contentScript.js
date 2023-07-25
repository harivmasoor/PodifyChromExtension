
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.audioDataUrl) {
        downloadAudioFromDataUrl(msg.audioDataUrl);
        sendResponse("Download triggered");
    }
    // Indicate we wish to send a response asynchronously
    return true;
});

function downloadAudioFromDataUrl(dataUrl) {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'tab-audio.webm';
    a.click();
}
