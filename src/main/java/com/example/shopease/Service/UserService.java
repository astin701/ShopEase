package com.example.shopease.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.shopease.DTO.AdminProfileResponseDTO;
import com.example.shopease.DTO.AdminProfileUpdateRequest;
import com.example.shopease.DTO.AdminUserResponseDTO;
import com.example.shopease.DTO.ChangePasswordRequest;
import com.example.shopease.DTO.LoginResponseDTO;
import com.example.shopease.DTO.UserRegisterRequest;
import com.example.shopease.DTO.UserResponseDTO;
import com.example.shopease.Entity.UserEntity;
import com.example.shopease.Exception.DuplicateResourceException;
import com.example.shopease.Exception.ResourceNotFoundException;
import com.example.shopease.Repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public UserResponseDTO registerUser(UserRegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email is already registered!");
        }

        UserEntity user = new UserEntity();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setRole("ROLE_USER");

        UserEntity savedUser = userRepository.save(user);

        return new UserResponseDTO(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getPhoneNumber()
        );
    }

    public UserResponseDTO getUserById(Long id) {

        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + id));

        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhoneNumber()
        );
    }

    public ResponseEntity<LoginResponseDTO> loginUser(String email, String password) {

        Optional<UserEntity> user = userRepository.findByEmail(email);

        if (user.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        UserEntity existingUser = user.get();

        if (!existingUser.isEnabled()) {
            return ResponseEntity.status(401).build();
        }

        boolean passwordMatches = passwordEncoder.matches(
                password,
                existingUser.getPassword()
        );

        if (!passwordMatches) {
            return ResponseEntity.status(401).build();
        }

        // Generate JWT token after successful login
        String token = jwtService.generateToken(existingUser.getEmail());

        return ResponseEntity.ok(
                new LoginResponseDTO(
                        existingUser.getId(),
                        existingUser.getName(),
                        existingUser.getEmail(),
                        token,
                        existingUser.getRole()
                )
        );
    }

    public List<AdminUserResponseDTO> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(AdminUserResponseDTO::new)
                .toList();
    }

    public ResponseEntity<?> updateUserStatus(Long userId, boolean enabled, String adminEmail){

        UserEntity user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        if (user.getEmail().equalsIgnoreCase(adminEmail) && !enabled) {
            return ResponseEntity.badRequest().body("You cannot disable your own account.");
        }

        user.setEnabled(enabled);
        userRepository.save(user);

        String message = enabled ? "User account activated successfully." : "User account deactivated successfully.";

        return ResponseEntity.ok(message);
    }

    public AdminProfileResponseDTO getAdminProfile(String email) {

        UserEntity user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

        return new AdminProfileResponseDTO(user);
    }

    public AdminProfileResponseDTO updateAdminProfile(String email, AdminProfileUpdateRequest request){
        UserEntity admin = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        admin.setName(request.getName());
        admin.setPhoneNumber(request.getPhoneNumber());
        UserEntity updatedAdmin = userRepository.save(admin);
        return new AdminProfileResponseDTO(updatedAdmin);
    }

    public ResponseEntity<?> changeAdminPassword(String email, ChangePasswordRequest request){
        UserEntity admin = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Admin not found"));
        if (!passwordEncoder.matches(request.getCurrentPassword(), admin.getPassword())) {
            return ResponseEntity.badRequest().body("Current password is incorrect.");
        }
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body("New password and confirm password do not match.");
        }
        admin.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(admin);
        return ResponseEntity.ok("Password change successfully");
    }

} 