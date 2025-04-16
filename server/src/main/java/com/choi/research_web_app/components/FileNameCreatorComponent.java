package com.choi.research_web_app.components;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

public class FileNameCreatorComponent {

    public static String createAudioFileNameWithTimestamp(int systolicBP, int diastolicBP, int bpm, String uuid) {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        return systolicBP + "_" + diastolicBP + "_" + bpm + "_audio_recording_" + timeStamp + "_" + uuid + ".mp3";
    }

    public static String createCsvFileNameWithTimestamp(int systolicBP, int diastolicBP, String uuid) {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        return systolicBP + "_" + diastolicBP + "_apple_watch_data_" + timeStamp + "_" + uuid + ".csv";
    }

    public static String generateUUID() {
        return UUID.randomUUID().toString();
    }
}
