import React, { useState, useRef, useEffect } from "react";
import WaveSurfer from "wavesurfer.js";
import RecordPlugin from "wavesurfer.js/dist/plugins/record.esm.js"; // Import the Record Plugin
import "../styles/AudioRecordingPage.css";


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


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
    const fileInputRef = useRef(null);
    const [systolicBP, setSystolicBP] = useState("");
    const [diastolicBP, setDiastolicBP] = useState("");

    const handleClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const isSubmitEnabled = audioBlob && csvFile && systolicBP && diastolicBP;

    const handleSubmit = async () => {
        if (!isSubmitEnabled) return;

        const formDataAudio = new FormData();
        formDataAudio.append("audio", audioBlob);
        formDataAudio.append("systolicBP", systolicBP);
        formDataAudio.append("diastolicBP", diastolicBP);

        const formDataCSV = new FormData();
        formDataCSV.append("file", csvFile);
        formDataCSV.append("systolicBP", systolicBP);
        formDataCSV.append("diastolicBP", diastolicBP);

        try {
            const audioResponse = await fetch(`${API_BASE_URL}/api/upload/audio`, {
                method: "POST",
                body: formDataAudio,
            });

            const csvResponse = await fetch(`${API_BASE_URL}/api/upload/csv`, {
                method: "POST",
                body: formDataCSV,
            });

            if (audioResponse.ok && csvResponse.ok) {
                alert("Both audio and CSV uploaded successfully!");
                setAudioBlob(null);
                setAudioURL(null);
                setCsvFile(null);
                setSystolicBP("");
                setDiastolicBP("");
                if (fileInputRef.current) fileInputRef.current.value = "";
            } else {
                alert("Failed to upload files.");
            }
        } catch (err) {
            console.error("Error uploading files:", err);
        }
    };

    useEffect(() => {
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

            wavesurferRef.current.load(recordedUrl);
        });

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

        wavesurferRef.current.on("audioprocess", () => {
            if (!wavesurferRef.current.isPlaying()) return;
            const time = wavesurferRef.current.getCurrentTime();
            const minutes = Math.floor(time / 60);
            const seconds = Math.floor(time % 60);
            setRecordingTime(
                [minutes, seconds].map((v) => (v < 10 ? "0" + v : v)).join(":")
            );
        });

        wavesurferRef.current.on("finish", () => setIsPlaying(false));

        return () => {
            wavesurferRef.current.un("audioprocess");
            wavesurferRef.current.un("finish");
        };
    }, []);

    const handleCSVUpload = (event) => {
        const file = event.target.files?.[0];

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

            {/* Audio Recording Section */}
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
                    </div>
                </div>
            )}

            {/* Apple Watch CSV Upload Section */}
            <div className="file-upload-container">
                <h2>Upload Apple Watch CSV File</h2>

                <input
                    type="file"
                    ref={fileInputRef}
                    accept=".csv"
                    style={{ display: "none" }}
                    onChange={handleCSVUpload}
                />

                <button className="upload-btn" onClick={handleClick}>
                    Click to upload your CSV file
                </button>

                {csvFile && <p>Selected file: {csvFile.name}</p>}
            </div>

            <div className="bp-input-container">
                <h2>Type BP from BP Cuff</h2>

                <div className="bp-input">
                    <label>Systolic (mmHg):</label>
                    <input
                        type="number"
                        value={systolicBP}
                        onChange={(e) => setSystolicBP(e.target.value)}
                        placeholder="Enter systolic value"
                    />
                </div>

                <div className="bp-input">
                    <label>Diastolic (mmHg):</label>
                    <input
                        type="number"
                        value={diastolicBP}
                        onChange={(e) => setDiastolicBP(e.target.value)}
                        placeholder="Enter diastolic value"
                    />
                </div>
            </div>
            <div className="submit-section">
                <button
                    className="submit-btn"
                    onClick={handleSubmit}
                    disabled={!isSubmitEnabled}
                >
                    Submit
                </button>
            </div>

        </div>
    );
};

export default AudioRecordingPage;
