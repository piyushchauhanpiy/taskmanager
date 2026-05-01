package com.chauhanpiyush.taskmanager.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.chauhanpiyush.taskmanager.repository.UserRepository;
import com.chauhanpiyush.taskmanager.model.User;
import com.chauhanpiyush.taskmanager.dto.SignupRequest;
import com.chauhanpiyush.taskmanager.dto.LoginRequest;
import com.chauhanpiyush.taskmanager.security.JwtUtil;
import com.chauhanpiyush.taskmanager.util.PasswordUtil;

@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserRepository userRepository;
  private final JwtUtil jwtUtil;

  public User signup(SignupRequest request) {

    if (userRepository.findByEmail(request.getEmail()).isPresent()) {
      throw new RuntimeException("User already exists");
    }

    // Hash the password before storing
    String hashedPassword = PasswordUtil.hashPassword(request.getPassword());

    User user = User.builder()
        .name(request.getName())
        .email(request.getEmail())
        .password(hashedPassword)
        .build();

    return userRepository.save(user);
  }

  public String login(LoginRequest request) {

    User user = userRepository.findByEmail(request.getEmail())
        .orElseThrow(() -> new RuntimeException("User not found"));

    // Verify the password using bcrypt
    if (!PasswordUtil.checkPassword(request.getPassword(), user.getPassword())) {
      throw new RuntimeException("Invalid credentials");
    }

    return jwtUtil.generateToken(user.getId());
  }
}