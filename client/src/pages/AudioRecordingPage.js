import React, { useState, useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js"; // Import the Record Plugin
import "../styles/AudioRecordingPage.css";

const AudioRecordingPage = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const [audioBlob, setAudioBlob] = useState(null);
    const [micDevices, setMicDevices] = useState([]);
    const [selectedMic, setSelectedMic] = useState("");
    const [recordingTime, setRecordingTime] = useState("00:00");
    const [isPlaying, setIsPlaying] = useState(false);
    const [csvFile, setCsvFile] = useState(null);
    const wavesurferRef = useRef(null);
    const recordRef = useRef(null);

    useEffect(() => {
        // Initialize WaveSurfer with Record Plugin
        wavesurferRef.current = WaveSurfer.create({
            container: "#waveform",
            waveColor: "#4A90E2",
            progressColor: "#1E88E5",
            barWidth: 1,
            barHeight: 5,
            cursorWidth: 2,
            height: 100,
            interact: false,
            plugins: [
                RecordPlugin.create({
                    renderRecordedAudio: false,
                    scrollingWaveform: false,
                    continuousWaveform: true,
                    continuousWaveformDuration: 30,
                }),
            ],
        });

        // Register the Record Plugin
        recordRef.current = wavesurferRef.current.registerPlugin(
            RecordPlugin.create({
                renderRecordedAudio: false,
                scrollingWaveform: false,
                continuousWaveform: true,
            })
        );

        recordRef.current.on("record-progress", (time) => {
            const minutes = Math.floor((time % 3600000) / 60000);
            const seconds = Math.floor((time % 60000) / 1000);
            setRecordingTime(
                [minutes, seconds].map((v) => (v < 10 ? "0" + v : v)).join(":")
            );
        });

        recordRef.current.on("record-end", (blob) => {
            const recordedUrl = URL.createObjectURL(blob);
            setAudioBlob(blob);
            setAudioURL(recordedUrl);

            // Load the recorded audio into WaveSurfer for playback visualization
            wavesurferRef.current.load(recordedUrl);
        });

        // Fetch available microphones
        RecordPlugin.getAvailableAudioDevices().then((devices) => {
            setMicDevices(devices);
            if (devices.length > 0) {
                setSelectedMic(devices[0].deviceId);
            }
        });

        wavesurferRef.current.on("play", () => console.log("Play"));
        wavesurferRef.current.on("pause", () => console.log("Pause"));
        wavesurferRef.current.on("finish", () => {
            console.log("Finish");
            setIsPlaying(false);
        });
        wavesurferRef.current.on("seek", (relativeX) => console.log("Seeked to:", relativeX));
        wavesurferRef.current.on("click", (relativeX) => console.log("Clicked at:", relativeX));
        wavesurferRef.current.on("interaction", (newTime) => console.log("Interaction:", newTime));


        return () => {
            wavesurferRef.current.destroy();
        };
    }, []);

    const startRecording = async () => {
        setIsRecording(true);
        setAudioURL(null);
        setAudioBlob(null);
        setIsPlaying(false);
        setRecordingTime("00:00");

        await recordRef.current.startRecording({ deviceId: selectedMic });
    };

    const stopRecording = () => {
        setIsRecording(false);
        recordRef.current.stopRecording();
    };

    const togglePlayback = () => {
        if (!wavesurferRef.current) return;
        wavesurferRef.current.playPause();
        setIsPlaying(!isPlaying);
    };

    useEffect(() => {
        if (!wavesurferRef.current) return;

        // Track progress of the waveform as it plays
        wavesurferRef.current.on("audioprocess", () => {
            if (!wavesurferRef.current.isPlaying()) return;
            const time = wavesurferRef.current.getCurrentTime();
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            setRecordingTime(
                [minutes, seconds].map((v) => (v < 10 ? "0" + v : v)).join(":")
            );
        });

        // Reset playback button when audio finishes
        wavesurferRef.current.on("finish", () => setIsPlaying(false));

        return () => {
            wavesurferRef.current.un("audioprocess");
            wavesurferRef.current.un("finish");
        };
    }, []);

    const uploadAudio = async () => {
        if (!audioBlob) return;

        const formData = new FormData();
        formData.append("audio", audioBlob);

        try {
            const response = await fetch("http://localhost:8080/api/upload", {
                method: "POST",
                body: formData,
            });

            alert(response.ok ? "Audio uploaded successfully!" : "Failed to upload audio");
        } catch (err) {
            console.error("Error uploading audio:", err);
        }
    };

    const handleCSVUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== "text/csv") {
            alert("Only CSV files are allowed. Please upload a valid CSV file.");
            event.target.value = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const lines = e.target.result.split("\n");
            if (lines.length >= 4) {
                const classificationLine = lines[3].split(",");
                if (classificationLine.length > 1 && classificationLine[0].trim() === "Classification") {
                    const classification = classificationLine[1].trim();
                    if (classification === "Poor Recording") {
                        alert("The CSV file uploaded is a Poor Recording. Please upload a new file.");
                        event.target.value = "";
                        setCsvFile(null);
                        return;
                    }
                    setCsvFile(file);
                    alert(`CSV uploaded successfully! Classification: ${classification}`);
                } else {
                    alert("Invalid CSV format. Please upload a valid Apple Watch CSV file.");
                    event.target.value = "";
                }
            } else {
                alert("CSV file is too short. Please upload a valid Apple Watch CSV file.");
                event.target.value = "";
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="audio-container">
            <h1 className="title">Research Web App</h1>

            <label htmlFor="mic-select">Select Microphone:</label>
            <select
                id="mic-select"
                value={selectedMic}
                onChange={(e) => setSelectedMic(e.target.value)}
                disabled={isRecording}
            >
                {micDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                        {device.label || device.deviceId}
                    </option>
                ))}
            </select>

            <div className="recording-section">
                <button
                    className={`record-btn ${isRecording ? "recording" : ""}`}
                    onClick={isRecording ? stopRecording : startRecording}
                >
                    {isRecording ? "Stop Recording" : "Start Recording"}
                </button>
                <p id="progress">{recordingTime}</p>
                <div id="waveform" className="waveform"></div>
            </div>

            {audioURL && (
                <div className="playback-section">
                    <h2>Playback</h2>
                    <div className="playback-section-buttons">
                        <button className={`play-btn ${isPlaying ? "pause" : "play"}`} onClick={togglePlayback}>
                            {isPlaying ? "Pause" : "Play"}
                        </button>

                        <button className="upload-btn" onClick={uploadAudio}>
                            Upload
                        </button>
                    </div>
                    <a href={audioURL} download="recording.mp3" className="download-link">
                        Download
                    </a>
                </div>
            )}

            {/* Apple Watch CSV Upload Section */}
            <div className="csv-upload-section">
                <h2>Upload Apple Watch CSV File</h2>
                <input
                    type="file"
                    accept=".csv"
                    className="csv-input"
                    onChange={handleCSVUpload}
                />
            </div>
        </div>
    );
};

export default AudioRecordingPage;
