chrome.runtime.onMessage.addListener(msg => {

    if(msg.audioBlob) {
  
      const url = URL.createObjectURL(msg.audioBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tab-audio.webm'; // File name
      a.click();
      URL.revokeObjectURL(url);
  
    }
  
  })