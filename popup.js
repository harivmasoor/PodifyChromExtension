document.addEventListener('DOMContentLoaded', function() {
    const startCaptureButton = document.getElementById('startCapture');

    if (startCaptureButton) {
        startCaptureButton.addEventListener('click', () => {
            chrome.runtime.sendMessage({ action: 'captureTabAudio' }, (response) => {
                console.log(response.streamId);
            });
        });
    } else {
        console.error('startCapture button not found!');
    }
});

