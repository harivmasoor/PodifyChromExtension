// Target origin to allow tabCapture from
const targetOrigin = "https://harivmasoor.github.io"; 

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

  if(request.action === 'captureTabAudio' && sender.origin === targetOrigin) {

    chrome.tabCapture.capture({
      audio: true,  
      video: false,
      tabId: sender.tabId
    }, (stream) => {

      if(chrome.runtime.lastError) {
        return; 
      }

      chrome.tabs.sendMessage(sender.tabId, {
        streamId: stream.id  
      });

      stopStream(stream.id);

    });

  }

});


function stopStream(streamId) {

  // Stop the stream when done
  chrome.tabCapture.stop(streamId, () => {
    
    if(chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError); 
    }

  });

}


