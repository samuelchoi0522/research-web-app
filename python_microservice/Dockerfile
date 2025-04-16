FROM python:3.11-slim

WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y ffmpeg && rm -rf /var/lib/apt/lists/*

RUN pip install fastapi uvicorn librosa scipy numpy soundfile python-multipart

EXPOSE 5000

CMD ["uvicorn", "bpm_service:app", "--host", "0.0.0.0", "--port", "5000"]

