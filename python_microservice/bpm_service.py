from fastapi import FastAPI, File, UploadFile
import librosa
import numpy as np
import tempfile
from scipy.signal import find_peaks, butter, filtfilt
import uvicorn
import subprocess
import os


app = FastAPI()

def convert_to_wav(input_path):
    output_path = input_path + ".wav"
    subprocess.run(["ffmpeg", "-y", "-i", input_path, output_path], check=True)
    return output_path


def estimate_bpm(audio_path):
    y, sr = librosa.load(audio_path)
    print(f"Sample rate: {sr}, Duration: {len(y)/sr:.2f} seconds")

    # Bandpass filter between 20–150Hz
    def bandpass_filter(signal, lowcut, highcut, fs, order=4):
        nyq = 0.5 * fs
        low = lowcut / nyq
        high = highcut / nyq
        b, a = butter(order, [low, high], btype='band')
        return filtfilt(b, a, signal)

    filtered = bandpass_filter(y, 20, 150, sr)
    peaks, _ = find_peaks(filtered, distance=sr * 0.6, prominence=0.1)

    print("Number of peaks detected:", len(peaks))
    print("Peak times (s):", [round(p / sr, 2) for p in peaks])

    intervals = np.diff(peaks) / sr
    if len(intervals) == 0:
        print("No intervals found. Returning BPM = 0.")
        return 0

    bpm = 60 / np.mean(intervals)
    print(f"Estimated BPM: {bpm}")
    return round(bpm, 2)



@app.post("/estimate-bpm")
async def estimate_bpm_endpoint(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        wav_path = convert_to_wav(tmp_path)
        bpm = estimate_bpm(wav_path)
        return {"bpm": bpm}
    finally:
        os.remove(tmp_path)
        if os.path.exists(wav_path):
            os.remove(wav_path)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
