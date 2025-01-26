import React, { useState, useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js"; // Import WaveSurfer library
import "../styles/AudioRecordingPage.css";

const AudioRecordingPage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioStream, setAudioStream] = useState(null);
    const mediaRecorderRef = useRef(null);
    const wavesurferRef = useRef(null); // Reference for WaveSurfer instance

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setAudioStream(stream);
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.start();
            setIsRecording(true);

            const chunks = [];
            mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, { type: "audio/mp3" });
                setAudioBlob(blob);
                setAudioURL(URL.createObjectURL(blob));
                setAudioStream(null); // Clear the stream
            };

            // Initialize WaveSurfer for visualization
            if (wavesurferRef.current) {
                wavesurferRef.current.destroy(); // Destroy existing instance if any
            }
            wavesurferRef.current = WaveSurfer.create({
                container: "#waveform", // Container ID for the waveform
                waveColor: "violet",
                progressColor: "purple",
                barWidth: 2,
                cursorWidth: 1,
                height: 100,
            });

            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            wavesurferRef.current.loadDecodedBuffer = false; // Avoid loading a new file
            wavesurferRef.current.loadBlob = false;
            wavesurferRef.current.backend.setSource(source); // Visualize live audio

        } catch (err) {
            console.error("Failed to start recording:", err);
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        if (audioStream) {
            audioStream.getTracks().forEach((track) => track.stop()); // Stop the audio stream
        }
    };

    const uploadAudio = async () => {
        if (!audioBlob) return;

        const formData = new FormData();
        formData.append("audio", audioBlob);

        try {
            const response = await fetch("http://localhost:8080/api/upload", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                alert("Audio uploaded successfully!");
            } else {
                alert("Failed to upload audio");
            }
        } catch (err) {
            console.error("Error uploading audio:", err);
        }
    };

    useEffect(() => {
        // Clean up WaveSurfer instance on component unmount
        return () => {
            if (wavesurferRef.current) {
                wavesurferRef.current.destroy();
            }
        };
    }, []);

    return (
        <div className="audio-recorder-container">
            <h1 className="title">Record a clip</h1>

            <div className="recording-section">
                <button
                    className={`record-button ${isRecording ? "recording" : ""}`}
                    onClick={isRecording ? stopRecording : startRecording}
                >
                    {isRecording ? "Stop recording" : "Start recording"}
                </button>

                {/* WaveSurfer Visualization */}
                <div id="waveform" className="visualizer"></div>
            </div>

            <div className="upload-section">
                <h2>Or upload a file</h2>
                <div className="upload-container">
                    <label htmlFor="file-upload" className="file-upload-label">
                        Upload an audio file
                    </label>
                    <input type="file" id="file-upload" className="file-upload-input" />
                </div>
            </div>

            <div className="drag-drop-section">
                <p>Drag and drop your audio file here</p>
                <button className="browse-button">Browse files</button>
            </div>

            {audioURL && (
                <div className="recorded-audio-section">
                    <h2>Recorded Audio:</h2>
                    <audio src={audioURL} controls />
                    <button className="upload-button" onClick={uploadAudio}>
                        Upload Audio
                    </button>
                </div>
            )}
        </div>
    );
};

export default AudioRecordingPage;
