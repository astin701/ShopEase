package com.example.shopease.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service 
public class FileStorageService {
    
    private final Path uploadDirectory = Path.of("uploads/products");

    private final Set<String> allowedExtensions = Set.of(
        ".jpg",
        ".jpeg",
        ".png",
        ".webp"
    );

    public String storeFile(MultipartFile file) throws IOException{

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please select an image.");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Image size must not exceed 5 MB.");
        }

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null) {
            throw new IllegalArgumentException("Invalid image filename.");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();

        if (!allowedExtensions.contains(extension)) {
            throw new IllegalArgumentException("Only JPG, JPEG, PNG and WEBP image are allowed.");
        }

        Files.createDirectories(uploadDirectory);

        String newFilename = UUID.randomUUID() + extension;

        Path destination = uploadDirectory.resolve(newFilename);

        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        return newFilename;
    }



}
