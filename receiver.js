let currentStream = null;
let isRecording = false;
let recorder;
const chunks = [];

function printErrorMessage(message) {
    const element = document.getElementById('echo-msg');
    element.innerText = message;
    console.error(message);
}

function saveToFile(blob, name) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
    a.remove();
}

// Stop video play-out and stop the MediaStreamTracks.
function shutdownReceiver() {
    if (!currentStream) {
        return;
    }
    if (recorder) {
        recorder.stop();
    }
    
    
    const tracks = currentStream.getTracks();
    for (let i = 0; i < tracks.length; ++i) {
        tracks[i].stop();
    }
    currentStream = null;
}

// Start video play-out of the captured MediaStream.
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
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = (e) => {
        chunks.push(e.data);
    };
    recorder.onstop = (e) => saveToFile(new Blob(chunks), "recording.webm");
    recorder.start();

    
    
    
    
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
                    audio: true,
                    video: {
                        mandatory: {
                            chromeMediaSource: 'tab', // The media source must be 'tab' here.
                            chromeMediaSourceId: streamId
                        }
                    }
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

chrome.runtime.onMessage.addListener(function (request) {
    const { targetTabId, consumerTabId } = request;
    testGetMediaStreamId(targetTabId, consumerTabId);
});


const startButton = document.getElementById('startRecording');
const stopButton = document.getElementById('stopRecording');

startButton.addEventListener('click', function () {
    if (!isRecording) {
        isRecording = true;
        // You can initiate your recording logic here.
        // For example, testGetMediaStreamId(targetTabId, consumerTabId);
        stopButton.disabled = false;  // enable the stop button
        startButton.disabled = true;  // disable the start button
    }
});

stopButton.addEventListener('click', function () {
    if (isRecording) {
        isRecording = false;
        shutdownReceiver();  // stop the recording
        startButton.disabled = false;  // enable the start button
        stopButton.disabled = true;  // disable the stop button
    }
});
