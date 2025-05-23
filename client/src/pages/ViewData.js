import React, { useState, useEffect } from "react";
import "../styles/ViewData.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const ViewData = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/list/all`);

                if (!response.ok) {
                    throw new Error("Failed to fetch data");
                }

                const jsonData = await response.json();
                setData(jsonData);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Function to extract BP values from filenames
    const extractBPValues = (filename) => {
        const match = filename.match(/(\d+)_(\d+)_/);
        return match ? { systolic: match[1], diastolic: match[2] } : { systolic: "N/A", diastolic: "N/A" };
    };

    const extractBPMValues = (filename) => {
        const parts = filename.split("_");
        return parts.length >= 3 ? { bpm: parts[4] } : { bpm: "N/A" };
    };

    const extractActualBPMValues = (filename) => {
        const parts = filename.split("_");
        return parts.length >= 3 ? { actualBPM: parts[5] } : { bpm: "N/A" };
    };

    const extractAppleWatchBPMValues = (filename) => {
        const parts = filename.split("_");
        return parts.length >= 3 ? { appleWatchBPM: parts[6] } : { appleWatchBPM: "N/A" };
    };

    const formatTimestamp = (timestampStr) => {
        const match = timestampStr.match(/(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})/);
        if (!match) return timestampStr;

        const [, year, month, day, hour, minute, second] = match;
        const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
        return date.toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    const calculatePercentDifference = (actualBPM, estimatedBPM) => {
        if (actualBPM === "N/A" || estimatedBPM === "N/A") return "N/A";
        const actual = parseFloat(actualBPM);
        const estimated = parseFloat(estimatedBPM);
        return ((Math.abs(actual - estimated) / actual) * 100).toFixed(2) + "%";
    }



    return (
        <div className="view-data-container">
            <h1>View Uploaded Data</h1>
            {loading ? (
                <p>Loading data...</p>
            ) : (
                <div className="data-grid">
                    {data.map(({ timestamp, uuid, audio, csv }) => {
                        const { systolic, diastolic } = csv !== "No CSV file" ? extractBPValues(csv) : { systolic: "N/A", diastolic: "N/A" };
                        const { bpm } = audio !== "No audio file" ? extractBPMValues(audio) : { bpm: "N/A" };
                        const { actualBPM } = audio !== "No audio file" ? extractActualBPMValues(audio) : { actualBPM: "N/A" };
                        const { appleWatchBPM } = audio !== "No audio file" ? extractAppleWatchBPMValues(audio) : { appleWatchBPM: "N/A" };

                        return (
                            <div key={uuid} className="data-card">
                                <h3 className="timestamp">{formatTimestamp(timestamp)} UTC</h3>
                                <p className="bp-info">Apple Watch BPM: {appleWatchBPM} BPM</p>
                                <p className="bp-info">Digital Stethoscope BPM: {bpm} BPM</p>
                                <p className="bp-info">BP Cuff BPM: {actualBPM} BPM</p>
                                <p className="bp-info">Percent Difference Between Apple Watch BPM and Digital Stethoscope BPM: {calculatePercentDifference(appleWatchBPM, bpm)}</p>
                                <p className="bp-info">Percent Difference Between Apple Watch BPM and BP Cuff BPM: {calculatePercentDifference(appleWatchBPM, actualBPM)}</p>

                                <div className="audio-container">
                                    {audio !== "No audio file" ? (
                                        <audio controls>
                                            <source src={audio} type="audio/mpeg" />
                                            Your browser does not support the audio element.
                                        </audio>
                                    ) : (
                                        <span>No audio file</span>
                                    )}
                                </div>

                                <div className="csv-container">
                                    {csv !== "No CSV file" ? (
                                        <a href={csv} download className="csv-button">
                                            Download ECG CSV File
                                        </a>
                                    ) : (
                                        <span>No CSV file</span>
                                    )}
                                </div>

                                <p className="bp-info">User BP: {systolic}/{diastolic} mmHg</p>
                                <p className="bp-info">Predicted Instantaneous BP: 75.2/118.9 mmHG</p>
                            </div>
                        );
                    })}

                    </div>
                    
            )}

            <img src="https://storage.googleapis.com/data_image_1/output.png" alt="Output" className="output-image" />
        </div>
    );
};

export default ViewData;
