document.addEventListener('DOMContentLoaded', function() {

    const startCaptureButton = document.getElementById('startCapture');
    const statusDiv = document.getElementById('status');
  
    if(!startCaptureButton) {
      statusDiv.textContent = 'Error: Button not found';
      return;
    }
  
    startCaptureButton.addEventListener('click', () => {
      
      statusDiv.textContent = 'Capturing...';
  
      chrome.runtime.sendMessage({action: 'captureTabAudio'}, (response) => {
        
        if(chrome.runtime.lastError) {
          statusDiv.textContent = chrome.runtime.lastError.message;
          return;
        }
  
        statusDiv.textContent = 'Success!';  
        window.close();
        
      });
  
    });
  
  });

