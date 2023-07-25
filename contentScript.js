chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.audioBlob) {
      downloadAudio(msg.audioBlob);
      sendResponse("Download triggered");
  }
  // Indicate we wish to send a response asynchronously
  return true;
});

function downloadAudio(audioBlob) {
  const url = URL.createObjectURL(audioBlob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'tab-audio.webm';
  a.click();

  URL.revokeObjectURL(url);
}
