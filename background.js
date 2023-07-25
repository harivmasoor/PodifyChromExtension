// Target origin for tabCapture
const targetOrigin = "https://harivmasoor.github.io";

chrome.runtime.onMessage.addListener((request, sender) => {

  if (request.action === 'captureTabAudio' && 
      sender.origin === targetOrigin) {

    chrome.tabCapture.capture({
      audio: true,
      video: false,
      tabId: sender.tabId
    }, (stream) => {

      if (chrome.runtime.lastError) {
        return;
      }

      // Create audio Blob from stream
      const audioBlob = new Blob([stream], {type: 'audio/webm'});
      
      // Send to content script
      chrome.tabs.sendMessage(sender.tabId, {
        audioBlob: audioBlob
      });

      stopStream(stream.id);

    });

  }

});


function stopStream(streamId) {

  chrome.tabCapture.stop(streamId, () => {

    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }

  });

}