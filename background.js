const targetOrigin = "https://harivmasoor.github.io";

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

            const mediaRecorder = new MediaRecorder(stream);
            let audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                
                chrome.tabs.sendMessage(sender.tab.id, {
                    audioBlob: audioBlob
                }, response => {
                    if(chrome.runtime.lastError) {
                        sendResponse({error: "Failed to send blob: " + chrome.runtime.lastError.message});
                    } else {
                        sendResponse({status: "Content script received blob"});
                    }
                });

                stopStream(stream);
            };

            mediaRecorder.start();
            setTimeout(() => mediaRecorder.stop(), 5000); // Recording for 5 seconds for demonstration
        });

        return true; // Keeps the port open for async response
    }
    else {
        sendResponse({error: "Invalid request"});
    }
});

function stopStream(stream) {
    if (stream && stream.getTracks) {
        stream.getTracks().forEach(track => track.stop());
    }
}


