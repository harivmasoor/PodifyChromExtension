document.addEventListener('DOMContentLoaded', function() {

    const startCaptureButton = document.getElementById('startCapture');
    const endCaptureButton = document.getElementById('endCapture');
    const statusDiv = document.getElementById('status');

    if(!startCaptureButton || !endCaptureButton) {
      statusDiv.textContent = 'Error: Button not found';
      return;
    }

    startCaptureButton.addEventListener('click', () => {
      statusDiv.textContent = 'Capturing...';
      chrome.runtime.sendMessage({action: 'captureTabAudio'}, (response) => {
        if (response.error) {
            statusDiv.textContent = response.error;
        } else if (response.status) {
            statusDiv.textContent = response.status;
        } else {
            statusDiv.textContent = 'Unknown response from background script.';
        }
    });      
    });

    endCaptureButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({action: 'endCaptureTabAudio'}, (response) => {
        if(chrome.runtime.lastError) {
          statusDiv.textContent = chrome.runtime.lastError.message;
          return;
        }
        statusDiv.textContent = 'Capture ended. Check your downloads.';
        window.close();
      });
    });
});


