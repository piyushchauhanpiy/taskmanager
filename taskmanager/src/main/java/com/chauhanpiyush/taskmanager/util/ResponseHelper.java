package com.chauhanpiyush.taskmanager.util;

import com.chauhanpiyush.taskmanager.dto.ApiResponse;
import org.springframework.http.ResponseEntity;

public class ResponseHelper {
    
    public static <T> ResponseEntity<ApiResponse<T>> success(T data) {
        return ResponseEntity.ok(ApiResponse.success(data));
    }
    
    public static <T> ResponseEntity<ApiResponse<T>> success(T data, String message) {
        return ResponseEntity.ok(ApiResponse.success(data, message));
    }
    
    public static <T> ResponseEntity<ApiResponse<T>> success(String message) {
        return ResponseEntity.ok(ApiResponse.success(null, message));
    }
    
    public static <T> ResponseEntity<ApiResponse<T>> created(T data) {
        return ResponseEntity.status(201).body(ApiResponse.success(data, "Resource created successfully"));
    }
    
    public static <T> ResponseEntity<ApiResponse<T>> created(T data, String message) {
        return ResponseEntity.status(201).body(ApiResponse.success(data, message));
    }
    
    public static <T> ResponseEntity<ApiResponse<T>> noContent() {
        return ResponseEntity.status(204).build();
    }
    
    public static <T> ResponseEntity<ApiResponse<T>> badRequest(String message) {
        return ResponseEntity.badRequest().body(ApiResponse.error(message));
    }
}
