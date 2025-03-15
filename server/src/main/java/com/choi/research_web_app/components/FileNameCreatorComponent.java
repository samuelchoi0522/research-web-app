package com.choi.research_web_app.components;

import java.text.SimpleDateFormat;
import java.util.Date;

public class FileNameCreatorComponent {
    public static String createAudioFileNameWithTimestamp(int systolicBP, int diastolicBP) {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        return systolicBP + "_" + diastolicBP + "_audio_recording_" + timeStamp + ".mp3";
    }

    public static String createCsvFileNameWithTimestamp(int systolicBP, int diastolicBP) {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        return systolicBP + "_" + diastolicBP + "_apple_watch_data_" + timeStamp + ".csv";
    }
}
