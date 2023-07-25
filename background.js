const targetOrigin = "https://harivmasoor.github.io";
let mediaRecorder;
let audioChunks = [];
let currentStream;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'captureTabAudio' && sender.origin === targetOrigin) {
        chrome.tabCapture.capture({
            audio: true,
            video: false
        }, (stream) => {
            if (chrome.runtime.lastError) {
                sendResponse({ error: chrome.runtime.lastError.message });
                return;
            }

            currentStream = stream;

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

                stopStream(currentStream);
            };

            mediaRecorder.start();

            sendResponse({ status: "Recording started" });

        });
        return true;  // to indicate that the response is sent asynchronously
    } else if (request.action === 'endCaptureTabAudio') {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            sendResponse({ status: "Recording stopped" });
        } else {
            sendResponse({ error: "MediaRecorder not active" });
        }
        return true;  // to indicate that the response is sent asynchronously
    }
});

function stopStream(stream) {
    if (stream && stream.getTracks) {
        stream.getTracks().forEach(track => track.stop());
    }
}



