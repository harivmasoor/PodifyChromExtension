let currentStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

function printErrorMessage(message) {
  const element = document.getElementById('echo-msg');
  element.innerText = message;
  console.error(message);
}

// Stop video play-out and stop the MediaStreamTracks.
function shutdownReceiver() {
  if (!currentStream) {
    return;
  }

  const player = document.getElementById('player');
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
    const player = document.getElementById('player');
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

document.getElementById('toggle-recording').addEventListener('click', function() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
});

document.getElementById('download-recording').addEventListener('click', function() {
    downloadRecording();
});

function startRecording() {
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
    document.getElementById('toggle-recording').innerText = 'Stop Recording';
}

function stopRecording() {
    if (!mediaRecorder) return;

    mediaRecorder.stop();
    isRecording = false;
    document.getElementById('toggle-recording').innerText = 'Start Recording';
    document.getElementById('download-recording').disabled = false;
}

function downloadRecording() {
    const blob = new Blob(recordedChunks, {
        type: 'audio/webm'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = 'recorded_audio.webm';
    a.click();
    window.URL.revokeObjectURL(url);
}

chrome.runtime.onMessage.addListener(function (request) {
  const { targetTabId, consumerTabId } = request;
  testGetMediaStreamId(targetTabId, consumerTabId);
});

window.addEventListener('beforeunload', shutdownReceiver);