const targetOrigin = "https://harivmasoor.github.io";
let mediaRecorder; // Moved outside to be accessible for both start and stop actions
let audioChunks = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startCaptureTabAudio' && sender.origin === targetOrigin) {
        chrome.tabCapture.capture({
            audio: true,
            video: false
        }, (stream) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                sendResponse({error: chrome.runtime.lastError.message});
                return;
            }

            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                
                chrome.tabs.sendMessage(sender.tab.id, {
                    audioBlob: audioBlob
                }, response => {
                    if(chrome.runtime.lastError) {
                        console.error("Failed to send blob:", chrome.runtime.lastError);
                    } else {
                        console.log("Content script received blob:", response);
                    }
                });

                stopStream(stream);
            };

            mediaRecorder.start();
            // Remove the timeout since we'll manually stop with another button
            // setTimeout(() => mediaRecorder.stop(), 5000);
        });

        // Indicate we wish to send a response asynchronously
        return true;
    }

    // Handling the "End Capture" action
    if (request.action === 'endCaptureTabAudio') {
        if (mediaRecorder && mediaRecorder.state === "recording") {
            mediaRecorder.stop();
        }
        return true;
    }
});

function stopStream(stream) {
    if (stream && stream.getTracks) {
        stream.getTracks().forEach(track => track.stop());
    }
}

