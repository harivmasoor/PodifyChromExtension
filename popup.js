document.getElementById('startCapture').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'captureTabAudio' }, (response) => {
        // Once you get a response from the background script (i.e., the streamId), 
        // you can send it to your web application using other methods.
        // For now, we're just logging it.
        console.log(response.streamId);
    });
});
