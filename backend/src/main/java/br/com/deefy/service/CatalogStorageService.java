package br.com.deefy.service;

import org.springframework.web.multipart.MultipartFile;

public interface CatalogStorageService {

    String uploadImage(MultipartFile file);

    String uploadAudio(MultipartFile file);
}
