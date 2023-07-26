let currentStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

// Getting references to buttons and other elements
const toggleRecordingButton = document.getElementById('toggle-recording');
const downloadButton = document.getElementById('download-recording');
const player = document.getElementById('player');
const echoMessageElement = document.getElementById('echo-msg');
const transcriptionBox = document.getElementById('transcriptionBox');

function printErrorMessage(message) {
  echoMessageElement.innerText = message;
  console.error(message);
}

// Stop video play-out and stop the MediaStreamTracks.
function shutdownReceiver() {
  if (!currentStream) {
    return;
  }

  player.srcObject = null;
  const tracks = currentStream.getTracks();
  for (let i = 0; i < tracks.length; ++i) {
    tracks[i].stop();
  }
  currentStream = null;
}

function playCapturedStream(stream) {
  if (!stream) {
    printErrorMessage(
      'Error starting tab capture: ' +
        (chrome.runtime.lastError.message || 'UNKNOWN')
    );
    return;
  }
  if (currentStream != null) {
    shutdownReceiver();
  }
  currentStream = stream;
  player.setAttribute('controls', '1');
  player.srcObject = stream;
  player.play();
}

function testGetMediaStreamId(targetTabId, consumerTabId) {
  chrome.tabCapture.getMediaStreamId(
    { targetTabId, consumerTabId },
    function (streamId) {
      if (typeof streamId !== 'string') {
        printErrorMessage(
          'Failed to get media stream id: ' +
            (chrome.runtime.lastError.message || 'UNKNOWN')
        );
        return;
      }

      navigator.webkitGetUserMedia(
        {
          audio: {
            mandatory: {
              chromeMediaSource: 'tab',
              chromeMediaSourceId: streamId
            }
          },
          video: false
        },
        function (stream) {
          playCapturedStream(stream);
        },
        function (error) {
          printErrorMessage(error);
        }
      );
    }
  );
}

toggleRecordingButton.addEventListener('click', function() {
  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
});

downloadButton.addEventListener('click', function() {
  downloadRecording();
});

function startRecording() {
  // Disable the download button when starting a new recording
  downloadButton.disabled = true;

  recordedChunks = [];
  mediaRecorder = new MediaRecorder(currentStream);

  // Event handler to collect the recorded chunks
  mediaRecorder.ondataavailable = function(event) {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  // Start the recording
  mediaRecorder.start();
  isRecording = true;
  toggleRecordingButton.innerText = 'Stop Recording';
}

let lastRecordedBlob;  // This will store the last recorded blob

function stopRecording() {
  if (!mediaRecorder) return;

  mediaRecorder.stop();
  isRecording = false;
  toggleRecordingButton.innerText = 'Start Recording';

  console.log('Number of recorded chunks:', recordedChunks.length);
  if (recordedChunks.length > 0) {
      console.log('Size of first chunk:', recordedChunks[0].size);
      // Create and store the blob here
      lastRecordedBlob = new Blob(recordedChunks, { type: 'audio/webm' });
  }

  // Enable the download button after stopping the recording
  downloadButton.disabled = false;
  
  // Send the recorded audio to the backend for transcription
  sendToAPI();
  shutdownReceiver();
}



function downloadRecording() {
  const blob = new Blob(recordedChunks, {
    type: 'audio/webm'
  });
  
  // Send the blob to the API
  sendToAPI(blob);

  // Download the blob
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.style = 'display: none';
  a.href = url;
  a.download = 'recorded_audio.webm';
  a.click();
  window.URL.revokeObjectURL(url);
}


async function sendToAPI(audioBlob) {
  if (!audioBlob) {
    console.error("No audio data provided");
    return;
  }

  const formData = new FormData();
  formData.append('audio', audioBlob, 'audio.webm');
  
  try {
    const response = await fetch('https://podify-backend.onrender.com/transcribe', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const responseData = await response.text();
      console.error(`Server responded with ${response.status}: ${responseData}`);
      return { error: `Server responded with ${response.status}: ${responseData}` };
    }

    return { success: true };
  } catch (error) {
    console.error('There was a problem with the fetch operation:', error.message);
    return { error: 'There was a problem with the fetch operation: ' + error.message };
  }
}



function displayTranscription(result) {
  if (result && result.transcript) {
    transcriptionBox.value = result.transcript;
  } else {
    transcriptionBox.value = "Failed to get transcription.";
  }
}

chrome.runtime.onMessage.addListener(function (request) {
  const { targetTabId, consumerTabId } = request;
  testGetMediaStreamId(targetTabId, consumerTabId);
});

window.addEventListener('beforeunload', shutdownReceiver);
