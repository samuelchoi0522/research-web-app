package com.choi.research_web_app.controllers;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.choi.research_web_app.services.UploadObjectService;
import com.choi.research_web_app.components.FileNameCreatorComponent;

@RestController
public class FileUploadController {

    @Value("${PROJECTID}")
    private String projectId;

    @Value("${BUCKETNAME}")
    private String bucketName;

    private String objectName;

    @PostMapping("/api/upload")
    public String upload(@RequestParam("audio") MultipartFile file) {
        try {
            objectName = FileNameCreatorComponent.createFileNameWithTimestamp();
            
            // Convert MultipartFile to a byte array
            byte[] fileBytes = file.getBytes();
            
            // Convert bytes to String or directly pass bytes (adjust based on your service)
            UploadObjectService.uploadObjectService(projectId, bucketName, objectName, fileBytes);
            return "File uploaded successfully!";
        } catch (IOException e) {
            return "File upload failed: " + e.getMessage();
        }
    }
}
