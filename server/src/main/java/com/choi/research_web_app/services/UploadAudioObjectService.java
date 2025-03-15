package com.choi.research_web_app.services;

import java.io.IOException;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;

public class UploadObjectService {
    public static void uploadObjectService(
            String projectId, String bucketName, String objectName, byte[] fileBytes) throws IOException {
        // Initialize the Google Cloud Storage client
        Storage storage = StorageOptions.newBuilder().setProjectId(projectId).build().getService();

        // Create a BlobId for the object to be uploaded
        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType("audio/mpeg")
                .build();

        // Upload the byte array to the specified bucket and object
        storage.create(blobInfo, fileBytes); // No precondition needed for byte[] uploads

        System.out.println("File uploaded to bucket " + bucketName + " as " + objectName);
    }
}
