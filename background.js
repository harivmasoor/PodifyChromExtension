const targetOrigin = "https://harivmasoor.github.io";

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === 'captureTabAudio' && sender.origin === targetOrigin) {
    chrome.tabCapture.capture({
      audio: true,
      video: false
    }, (stream) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }

      const mediaRecorder = new MediaRecorder(stream);
      let audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        try {
          const response = await chrome.tabs.sendMessage(sender.tabId, {
            audioBlob: audioBlob
          });

          console.log("Content script received blob");
        } catch(error) {
          console.error("Failed to send blob:", error);
        }

        stopStream(stream);
      };

      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), 5000); // Recording for 5 seconds for demonstration
    });
  }
});

function stopStream(stream) {
  if (stream && stream.getTracks) {
    stream.getTracks().forEach(track => track.stop());
  }
}
