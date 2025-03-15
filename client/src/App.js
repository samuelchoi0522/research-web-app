import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AudioRecordingPage from "./pages/AudioRecordingPage";
import ViewData from "./pages/ViewData";
import "./App.css";

function App() {
    return (
        <Router>
            <div className="App">
                <Routes>
                    <Route path="/record" element={<AudioRecordingPage />} />
                    <Route path="/view-data" element={<ViewData />} />
                    <Route path="*" element={<h2>404 - Page Not Found</h2>} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
