const targetURL = "https://harivmasoor.github.io/Podify/";

let mediaRecorder;
let audioChunks = [];
let currentStream;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'captureTabAudio' && sender.url.startsWith(targetURL)) {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            sendResponse({ status: "Already capturing" });
            return;
        }

        chrome.tabCapture.capture({
            audio: true,
            video: false
        }, (stream) => {
            if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
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
                const reader = new FileReader();

                reader.readAsDataURL(audioBlob); 
                reader.onloadend = () => {
                    const audioDataUrl = reader.result;
                    chrome.tabs.sendMessage(sender.tab.id, {
                        audioDataUrl: audioDataUrl
                    });
                };

                stopStream(currentStream);
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
        return true;
    } else {
        sendResponse({ status: "Invalid request" });
        return true;
    }
});

function stopStream(stream) {
    if (stream && stream.getTracks) {
        stream.getTracks().forEach(track => track.stop());
    }
}





