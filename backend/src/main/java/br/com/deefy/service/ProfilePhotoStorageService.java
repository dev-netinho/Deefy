package br.com.deefy.service;

import br.com.deefy.model.User;
import org.springframework.web.multipart.MultipartFile;

public interface ProfilePhotoStorageService {
    String uploadProfilePhoto(User user, MultipartFile file);
}
