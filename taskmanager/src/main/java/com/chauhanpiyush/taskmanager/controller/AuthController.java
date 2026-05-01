package com.chauhanpiyush.taskmanager.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import lombok.RequiredArgsConstructor;
import com.chauhanpiyush.taskmanager.service.AuthService;
import com.chauhanpiyush.taskmanager.dto.SignupRequest;
import com.chauhanpiyush.taskmanager.dto.LoginRequest;
import com.chauhanpiyush.taskmanager.dto.ApiResponse;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;

  @PostMapping("/signup")
  public ResponseEntity<ApiResponse<?>> signup(@Valid @RequestBody SignupRequest request) {
    return ResponseEntity.status(201)
        .body(ApiResponse.success(authService.signup(request), "User registered successfully"));
  }

  @PostMapping("/login")
  public ResponseEntity<ApiResponse<?>> login(@Valid @RequestBody LoginRequest request) {
    return ResponseEntity.ok(ApiResponse.success(authService.login(request), "Login successful"));
  }
}
