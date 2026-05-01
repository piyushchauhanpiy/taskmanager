package com.chauhanpiyush.taskmanager.controller;

import com.chauhanpiyush.taskmanager.model.User;
import com.chauhanpiyush.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/{userId}")
    public User getUserById(@PathVariable String userId) {
        return userRepository.findById(userId != null ? userId : "")
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/batch")
    public List<User> getUsersByIds(@RequestParam List<String> userIds) {
        List<String> safeIds = userIds != null ? userIds : new ArrayList<String>();
        return userRepository.findAllById(safeIds);
    }

    @GetMapping("/me")
    public User getCurrentUser(HttpServletRequest httpRequest) {
        String userId = (String) httpRequest.getAttribute("userId");
        return userRepository.findById(userId != null ? userId : "")
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
