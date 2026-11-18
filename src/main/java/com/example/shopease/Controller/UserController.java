package com.example.shopease.Controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.shopease.DTO.LoginResponseDTO;
import com.example.shopease.DTO.UserLoginRequest;
import com.example.shopease.DTO.UserRegisterRequest;
import com.example.shopease.DTO.UserResponseDTO;
import com.example.shopease.Service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable Long id) {

        UserResponseDTO user = userService.getUserById(id);

        return ResponseEntity.ok(user);
    }

    @PostMapping("/register")
    public UserResponseDTO registerUser(
            @Valid @RequestBody UserRegisterRequest user) {

        return userService.registerUser(user);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> loginUser(
            @Valid @RequestBody UserLoginRequest user) {

        String email = user.getEmail();
        String password = user.getPassword();

        return userService.loginUser(email, password);
    }
}