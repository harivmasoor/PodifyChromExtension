const targetOrigin = "https://harivmasoor.github.io";

let mediaRecorder;
let audioChunks = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'captureTabAudio' && sender.origin === targetOrigin) {
        chrome.tabCapture.capture({
            audio: true,
            video: false
        }, (stream) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
                sendResponse({ error: chrome.runtime.lastError.message });
                return;
            }

            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                const reader = new FileReader();

                reader.readAsDataURL(audioBlob); 
                reader.onloadend = () => {
                    const audioDataUrl = reader.result;
                    chrome.tabs.sendMessage(sender.tab.id, {
                        audioDataUrl: audioDataUrl
                    });
                };

                stopStream(stream);
            };

            mediaRecorder.start();

            sendResponse({ status: "Started capturing" });

        });

        // Indicate we wish to send a response asynchronously
        return true;
    } else if (request.action === 'endCaptureTabAudio') {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            sendResponse({ status: "Ended capturing" });
        } else {
            sendResponse({ status: "No active recording found" });
        }
    } else {
        sendResponse({ status: "Invalid request" });
    }
});

function stopStream(stream) {
    if (stream && stream.getTracks) {
        stream.getTracks().forEach(track => track.stop());
    }
}




