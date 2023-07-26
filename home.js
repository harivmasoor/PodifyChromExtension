let recorder;
let chunks = [];

function saveToFile(blob, name) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = url;
    a.download = name;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
}

function captureTabAudio() {
    chrome.tabCapture.capture({audio: true, video: false}, (stream) => {
        context = new AudioContext();

        if (!stream || !(stream instanceof MediaStream)) {
            console.error("Invalid stream parameter:", stream);
            return;
        }

        var newStream = context.createMediaStreamSource(stream);
        newStream.connect(context.destination);

        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = (e) => {
            chunks.push(e.data);
        };
        recorder.onstop = (e) => saveToFile(new Blob(chunks), "test.wav");
        recorder.start();
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("share-audio-button").addEventListener("click", function () {
        captureTabAudio();
        this.disabled = true;
        document.getElementById("stop-audio-button").disabled = false;
    });

    document.getElementById("stop-audio-button").addEventListener("click", function () {
        if (recorder && recorder.state === "recording") {
            recorder.stop();
        }
        this.disabled = true;
        document.getElementById("share-audio-button").disabled = false;
    });
});
