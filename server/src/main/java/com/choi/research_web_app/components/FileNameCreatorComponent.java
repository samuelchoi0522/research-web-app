package com.choi.research_web_app.components;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

public class FileNameCreatorComponent {

    public static String createAudioFileNameWithTimestamp(int systolicBP, int diastolicBP, int bpm, int BPM, String uuid) {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        return systolicBP + "_" + diastolicBP + "_" + bpm + "_" + BPM + "_audio_recording_" + timeStamp + "_" + uuid + ".mp3";
    }

    public static String createCsvFileNameWithTimestamp(int systolicBP, int diastolicBP, int BPM, String uuid) {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        return systolicBP + "_" + diastolicBP + "_" + BPM + "_apple_watch_data_" + timeStamp + "_" + uuid + ".csv";
    }

    public static String generateUUID() {
        return UUID.randomUUID().toString();
    }
}
