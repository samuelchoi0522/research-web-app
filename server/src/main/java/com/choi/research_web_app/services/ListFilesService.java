package com.choi.research_web_app.services;

import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import com.google.cloud.storage.Bucket;
import com.google.cloud.storage.Blob;

import java.util.ArrayList;
import java.util.List;

public class ListFilesService {
    private static final Storage storage = StorageOptions.getDefaultInstance().getService();

    public static List<String> listObjects(String bucketName) {
        List<String> fileNames = new ArrayList<>();
        Bucket bucket = storage.get(bucketName);

        if (bucket == null) {
            System.err.println("Bucket " + bucketName + " does not exist.");
            return fileNames;
        }

        for (Blob blob : bucket.list().iterateAll()) {
            fileNames.add(blob.getName());
        }
        return fileNames;
    }
}
