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


    return (
        <div className="view-data-container">
            <h1>View Uploaded Data</h1>
            {loading ? (
                <p>Loading data...</p>
            ) : (
                <div className="data-grid">
                    {data.map(({ uuid, audio, csv }) => {
                        const { systolic, diastolic } = csv !== "No CSV file" ? extractBPValues(csv) : { systolic: "N/A", diastolic: "N/A" };
                        const { bpm } = audio !== "No audio file" ? extractBPMValues(audio) : { bpm: "N/A" };

                        return (
                            <div key={uuid} className="data-card">
                                <h3 className="timestamp">{uuid}</h3>
                                <p className="bp-info">BP: {systolic}/{diastolic} mmHg</p>
                                <p className="bp-info">Estimated BPM: {bpm} BPM</p>

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
                                            Download CSV
                                        </a>
                                    ) : (
                                        <span>No CSV file</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ViewData;
