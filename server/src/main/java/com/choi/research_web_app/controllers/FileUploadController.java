package com.choi.research_web_app.controllers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.choi.research_web_app.components.FileNameCreatorComponent;
import com.choi.research_web_app.services.ListFilesService;
import com.choi.research_web_app.services.UploadAudioObjectService;
import com.choi.research_web_app.services.UploadCSVObjectService;

@RestController
public class FileUploadController {

    @Value("${PROJECTID}")
    private String projectId;

    @Value("${BUCKETNAME_AUDIO}")
    private String bucketName_audio;

    @Value("${BUCKETNAME_CSV}")
    private String bucketName_csv;

    @GetMapping("/api/list/all")
    public List<Map<String, String>> listAllFiles() {
        List<String> audioFiles = ListFilesService.listObjects(bucketName_audio);
        List<String> csvFiles = ListFilesService.listObjects(bucketName_csv);
        return groupFilesByTimestamp(audioFiles, csvFiles);
    }

    private List<Map<String, String>> groupFilesByTimestamp(List<String> audioFiles, List<String> csvFiles) {
        Map<String, Map<String, String>> groupedFiles = new HashMap<>();
        Pattern pattern = Pattern.compile("(\\d{8}_\\d{6})");

        for (String audio : audioFiles) {
            Matcher matcher = pattern.matcher(audio);
            if (matcher.find()) {
                String timestamp = matcher.group(1);
                groupedFiles.putIfAbsent(timestamp, new HashMap<>());
                groupedFiles.get(timestamp).put("audio", generatePublicURL(bucketName_audio, audio));
            }
        }

        for (String csv : csvFiles) {
            Matcher matcher = pattern.matcher(csv);
            if (matcher.find()) {
                String timestamp = matcher.group(1);
                groupedFiles.putIfAbsent(timestamp, new HashMap<>());
                groupedFiles.get(timestamp).put("csv", generatePublicURL(bucketName_csv, csv));
            }
        }

        List<Map<String, String>> response = new ArrayList<>();
        for (Map.Entry<String, Map<String, String>> entry : groupedFiles.entrySet()) {
            Map<String, String> fileGroup = new HashMap<>();
            fileGroup.put("timestamp", entry.getKey());
            fileGroup.put("audio", entry.getValue().getOrDefault("audio", "No audio file"));
            fileGroup.put("csv", entry.getValue().getOrDefault("csv", "No CSV file"));
            response.add(fileGroup);
        }

        return response;
    }

    private String generatePublicURL(String bucketName, String fileName) {
        return "https://storage.googleapis.com/" + bucketName + "/" + fileName;
    }

    @PostMapping("/api/upload/audio")
    public String uploadAudio(
            @RequestParam("audio") MultipartFile file,
            @RequestParam("systolicBP") int systolicBP,
            @RequestParam("diastolicBP") int diastolicBP,
            @RequestParam(value = "uuid", required = false) String uuid) {

        try {
            if (uuid == null || uuid.isEmpty()) {
                uuid = FileNameCreatorComponent.generateUUID();
            }

            String objectName = FileNameCreatorComponent.createAudioFileNameWithTimestamp(systolicBP, diastolicBP,
                    uuid);
            byte[] fileBytes = file.getBytes();

            UploadAudioObjectService.uploadObjectService(projectId, bucketName_audio, objectName, fileBytes);
            return "Audio file uploaded successfully: " + objectName;
        } catch (IOException e) {
            return "Audio file upload failed: " + e.getMessage();
        }
    }

    @PostMapping("/api/upload/csv")
    public String uploadCsv(
            @RequestParam("file") MultipartFile file,
            @RequestParam("systolicBP") int systolicBP,
            @RequestParam("diastolicBP") int diastolicBP,
            @RequestParam(value = "uuid", required = false) String uuid) {

        try {
            if (uuid == null || uuid.isEmpty()) {
                uuid = FileNameCreatorComponent.generateUUID();
            }

            String objectName = FileNameCreatorComponent.createCsvFileNameWithTimestamp(systolicBP, diastolicBP, uuid);
            byte[] fileBytes = file.getBytes();

            UploadCSVObjectService.uploadObjectService(projectId, bucketName_csv, objectName, fileBytes);
            return "CSV file uploaded successfully: " + objectName;
        } catch (IOException e) {
            return "CSV file upload failed: " + e.getMessage();
        }
    }
}
