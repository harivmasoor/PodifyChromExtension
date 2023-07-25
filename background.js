const targetOrigin = "https://harivmasoor.github.io";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'captureTabAudio' && sender.origin === targetOrigin) {
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
                const reader = new FileReader();

                reader.readAsDataURL(audioBlob);
                reader.onloadend = function() {
                    const base64data = reader.result;
                    chrome.tabs.sendMessage(sender.tab.id, {
                        audioDataUrl: base64data
                    }, response => {
                        if(chrome.runtime.lastError) {
                            console.error("Failed to send data URL:", chrome.runtime.lastError);
                        } else {
                            console.log("Content script received data URL:", response);
                        }
                    });
                };

                stopStream(stream);
            };

            mediaRecorder.start();
            setTimeout(() => mediaRecorder.stop(), 5000); // Recording for 5 seconds for demonstration
        });

        // Indicate we wish to send a response asynchronously
        return true;
    }
});

function stopStream(stream) {
    if (stream && stream.getTracks) {
        stream.getTracks().forEach(track => track.stop());
    }
}




