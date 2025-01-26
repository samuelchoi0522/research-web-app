package com.choi.research_web_app.components;

import java.text.SimpleDateFormat;
import java.util.Date;

public class FileNameCreatorComponent {
    public static String createFileNameWithTimestamp() {
        String timeStamp = new SimpleDateFormat("yyyyMMdd_HHmmss").format(new Date());
        return "audio_recording" + "_" + timeStamp + ".mp3";
    }
}
