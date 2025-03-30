package com.choi.research_web_app.services;

import java.io.IOException;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.auth.oauth2.GoogleCredentials;

public class UploadCSVObjectService {
    public static void uploadObjectService(
            String projectId, String bucketName, String objectName, byte[] fileBytes) throws IOException {
        GoogleCredentials credentials = GoogleCredentials.getApplicationDefault();
        System.out.println("🪪 Active identity: " + credentials);

        // Initialize the Google Cloud Storage client
        Storage storage = StorageOptions.newBuilder().setProjectId(projectId).build().getService();

        // Create a BlobId for the object to be uploaded
        BlobId blobId = BlobId.of(bucketName, objectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType("text/csv")
                .build();

        // Upload the byte array to the specified bucket and object
        storage.create(blobInfo, fileBytes); // No precondition needed for byte[] uploads

        System.out.println("File uploaded to bucket " + bucketName + " as " + objectName);
    }
}
