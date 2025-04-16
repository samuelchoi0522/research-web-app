package com.choi.research_web_app.controllers;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
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
        return groupFilesByUUID(audioFiles, csvFiles);
    }

    private List<Map<String, String>> groupFilesByUUID(List<String> audioFiles, List<String> csvFiles) {
        Map<String, Map<String, String>> groupedFiles = new HashMap<>();
        Pattern uuidPattern = Pattern.compile("([a-fA-F0-9\\-]{36})");

        for (String audio : audioFiles) {
            Matcher matcher = uuidPattern.matcher(audio);
            if (matcher.find()) {
                String uuid = matcher.group(1);
                groupedFiles.putIfAbsent(uuid, new HashMap<>());
                groupedFiles.get(uuid).put("audio", generatePublicURL(bucketName_audio, audio));
            }
        }

        for (String csv : csvFiles) {
            Matcher matcher = uuidPattern.matcher(csv);
            if (matcher.find()) {
                String uuid = matcher.group(1);
                groupedFiles.putIfAbsent(uuid, new HashMap<>());
                groupedFiles.get(uuid).put("csv", generatePublicURL(bucketName_csv, csv));
            }
        }

        List<Map<String, String>> response = new ArrayList<>();
        for (Map.Entry<String, Map<String, String>> entry : groupedFiles.entrySet()) {
            Map<String, String> fileGroup = new HashMap<>();
            fileGroup.put("uuid", entry.getKey());
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

            int bpm = estimateBpmFromAudio(file);
            System.out.println("Estimated BPM: " + bpm);
            System.out.println("Audio file name: " + file.getOriginalFilename());
            System.out.println("Audio content type: " + file.getContentType());

            String objectName = FileNameCreatorComponent.createAudioFileNameWithTimestamp(systolicBP, diastolicBP, bpm, uuid);
            byte[] fileBytes = file.getBytes();

            UploadAudioObjectService.uploadObjectService(projectId, bucketName_audio, objectName, fileBytes);
            System.out.println("Audio file uploaded successfully: " + objectName);
            return "Audio file uploaded successfully: " + objectName;
        } catch (IOException e) {
            System.err.println("Audio file upload failed: " + e.getMessage());
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
            System.out.println("CSV file uploaded successfully: " + objectName);
            return "CSV file uploaded successfully: " + objectName;
        } catch (IOException e) {
            System.err.println("CSV file upload failed: " + e.getMessage());
            return "CSV file upload failed: " + e.getMessage();
        }
    }

    @PostMapping("/api/bpm/estimate")
    public ResponseEntity<String> estimateBpm(@RequestParam("audio") MultipartFile file) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            String pythonUrl = "http://bpm-service:5000/estimate-bpm"; // DNS name in Docker

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response = restTemplate.postForEntity(pythonUrl, requestEntity, String.class);

            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error: " + e.getMessage());
        }
    }

    private int estimateBpmFromAudio(MultipartFile file) throws IOException {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        });

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
        String pythonUrl = "http://bpm-service:5000/estimate-bpm";

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<Map> response = restTemplate.postForEntity(pythonUrl, requestEntity, Map.class);

        if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null && response.getBody().containsKey("bpm")) {
            return (int) Math.round(Double.parseDouble(response.getBody().get("bpm").toString()));
        } else {
            throw new IOException("Failed to estimate BPM");
        }
    }


}
